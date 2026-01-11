import sys
import os
import json
import base64
from io import BytesIO
import logging
import traceback

# Remove stray tokens and configure imports
try:
    import torch
    from PIL import Image
    # Try Instruct Pix2Pix first (better for targeted edits)
    try:
        from diffusers import StableDiffusionInstructPix2PixPipeline as InstructPix2PixPipeline
    except Exception:
        InstructPix2PixPipeline = None
    from diffusers import StableDiffusionImg2ImgPipeline
    # optional inpaint pipeline
    try:
        from diffusers import StableDiffusionInpaintPipeline
    except Exception:
        StableDiffusionInpaintPipeline = None
    from diffusers.utils import load_image
except Exception as e:
    # Critical import error -> report as JSON on stdout so Node can parse it
    error_response = {"status": "error", "message": f"Import error: {str(e)}"}
    print(json.dumps(error_response))
    sys.exit(1)

# Mute noisy libraries to stderr (we still send logs to stderr)
logging.getLogger("diffusers").setLevel(logging.WARNING)
logging.getLogger("transformers").setLevel(logging.WARNING)

# HF token (optional) can be provided via env HF_TOKEN
HF_TOKEN = os.environ.get("HF_TOKEN")
# Prefer a model trained for edits (can be overridden with env MODEL_NAME)
# Default to Ghibli Diffusion for img2img (requested)
PREFERRED_MODEL = "nitrosocke/Ghibli-Diffusion"
FALLBACK_MODEL = "runwayml/stable-diffusion-v1-5"
# Fallback for inpainting when requested model has no inpaint weights
FALLBACK_INPAINT_MODEL = "runwayml/stable-diffusion-inpainting"
# Allow user to select a model via env var MODEL_NAME (or per-request via settings['model'])
SELECTED_MODEL = os.environ.get("MODEL_NAME")

# Detect device (cuda, mps, cpu)
if torch.cuda.is_available():
    DEVICE = "cuda"
elif getattr(torch, "has_mps", False) and getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
    DEVICE = "mps"
else:
    DEVICE = "cpu"

def errlog(msg):
    # write logs to stderr so stdout stays clean for JSON response
    sys.stderr.write(str(msg) + "\n")
    sys.stderr.flush()

# Load pipeline once (global) to avoid repeated slow loads
pipe = None
current_model = None
current_task = None
def load_pipeline(model_name=None, pipeline_task="img2img"):
    global pipe, current_model, current_task
    # If already loaded and matches requested model, reuse
    if pipe is not None and model_name is None and current_model is not None and current_task == pipeline_task:
        return pipe
    if pipe is not None and model_name and current_model == model_name and current_task == pipeline_task:
        return pipe

    try:
        model_to_load = model_name or SELECTED_MODEL or PREFERRED_MODEL or FALLBACK_MODEL
        errlog(f"[ai_worker] Loading pipeline on device={DEVICE} model={model_to_load} task={pipeline_task}")

        # Prepare load kwargs
        torch_dtype = torch.float16 if DEVICE == "cuda" else torch.float32
        load_kwargs = {"torch_dtype": torch_dtype, "use_safetensors": True}
        if DEVICE == "cuda":
            load_kwargs["revision"] = "fp16"
        if DEVICE == "cpu":
            load_kwargs["low_cpu_mem_usage"] = True
        if HF_TOKEN:
            load_kwargs["use_auth_token"] = HF_TOKEN

        # If a different pipeline is already loaded, delete it first to free memory
        try:
            if pipe is not None:
                try:
                    del pipe
                except Exception:
                    pass
                pipe = None
                torch.cuda.empty_cache() if DEVICE == "cuda" and hasattr(torch, "cuda") else None

        except Exception:
            pass

        # Choose pipeline based on requested task
        if pipeline_task == "inpaint":
            # prefer an inpaint-capable model
            chosen_model = model_to_load
            chosen_pipeline = None
            # If model name doesn't look like inpaint, fallback to inpaint fallback
            try:
                if StableDiffusionInpaintPipeline is not None:
                    # try loading requested model as inpaint if it has weights
                    try:
                        pipe = StableDiffusionInpaintPipeline.from_pretrained(chosen_model, **load_kwargs)
                        errlog(f"[ai_worker] Using Inpaint model: {chosen_model}")
                    except Exception:
                        # fallback inpaint model
                        errlog(f"[ai_worker] Requested inpaint model failed: {chosen_model}, falling back to {FALLBACK_INPAINT_MODEL}")
                        pipe = StableDiffusionInpaintPipeline.from_pretrained(FALLBACK_INPAINT_MODEL, **load_kwargs)
                        errlog(f"[ai_worker] Using Inpaint fallback: {FALLBACK_INPAINT_MODEL}")
                else:
                    raise Exception("Inpaint pipeline not available in diffusers installation")
            except Exception as e:
                errlog(f"[ai_worker] Inpaint load error: {e}")
                # finally try img2img as last resort
                pipe = StableDiffusionImg2ImgPipeline.from_pretrained(FALLBACK_MODEL, **load_kwargs)
                errlog(f"[ai_worker] Fallback to Img2Img: {FALLBACK_MODEL}")
        else:
            # Heuristic: if model name suggests instruct/pix2pix and pipeline exists, use it
            use_instruct = False
            if InstructPix2PixPipeline is not None and ("instruct" in model_to_load or "pix2pix" in model_to_load):
                use_instruct = True

            if use_instruct:
                pipe = InstructPix2PixPipeline.from_pretrained(model_to_load, **load_kwargs)
                errlog(f"[ai_worker] Using InstructPix2Pix model: {model_to_load}")
            else:
                pipe = StableDiffusionImg2ImgPipeline.from_pretrained(model_to_load, **load_kwargs)
                errlog(f"[ai_worker] Using Img2Img model: {model_to_load}")

        current_model = model_to_load
        current_task = pipeline_task

        # Move to device
        try:
            pipe.to(DEVICE)
        except Exception as e:
            errlog(f"[ai_worker] Warning moving to device: {e}")

        # Memory optimizations
        try:
            pipe.enable_attention_slicing()
        except Exception:
            pass
        try:
            pipe.enable_xformers_memory_efficient_attention()
        except Exception:
            pass
        try:
            if DEVICE == "cpu" and hasattr(pipe, "enable_model_cpu_offload"):
                pipe.enable_model_cpu_offload()
        except Exception:
            pass

        return pipe
    except Exception as e:
        errlog(f"[ai_worker] Pipeline load exception: {traceback.format_exc()}")
        raise

def process_single(prompt, image_path, request_id=None, settings=None):
    try:
        # If request asks for a specific model or inpaint, ensure pipeline matches
        requested_model = None
        if settings and settings.get("model"):
            requested_model = settings.get("model")
        want_inpaint = False
        if settings and (settings.get("inpaint") or settings.get("mask_path") or settings.get("mask_base64")):
            want_inpaint = True

        if requested_model:
            pipe = load_pipeline(requested_model, pipeline_task=("inpaint" if want_inpaint else "img2img"))
        else:
            pipe = load_pipeline(pipeline_task=("inpaint" if want_inpaint else "img2img"))
        # Resize: smaller sizes = faster. Use 512 default.
        target_size = 512
        if settings and settings.get("size"):
            target_size = int(settings["size"])

        # --- Replace load_image with robust PIL open + existence check ---
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Input image not found: {image_path}")
        init_image = Image.open(image_path).convert("RGB")
        init_image = init_image.resize((target_size, target_size))

        # Load mask if provided (mask_path or mask_base64)
        mask_image = None
        if settings and settings.get("mask_path"):
            mp = settings.get("mask_path")
            if os.path.exists(mp):
                mask_image = Image.open(mp).convert("RGB").resize((target_size, target_size))
        elif settings and settings.get("mask_base64"):
            try:
                mb = settings.get("mask_base64")
                if mb.startswith("data:"):
                    mb = mb.split(",", 1)[1]
                mask_bytes = base64.b64decode(mb)
                mask_image = Image.open(BytesIO(mask_bytes)).convert("RGB").resize((target_size, target_size))
            except Exception:
                mask_image = None

        # Instruct-Pix2Pix expects an instruction-style prompt
        instruction = prompt
        # Defaults for speed and quality
        steps = settings.get("steps") if settings and "steps" in settings else 18
        strength = float(settings.get("strength")) if settings and "strength" in settings else 0.7
        guidance = float(settings.get("guidance")) if settings and "guidance" in settings else 7.5

        errlog(f"[ai_worker] Running inference (steps={steps}, size={target_size})")

        # Use no_grad + autocast on CUDA to save memory and speed up
        from contextlib import nullcontext
        autocast_ctx = nullcontext()
        if DEVICE == "cuda" and hasattr(torch, "autocast"):
            try:
                autocast_ctx = torch.autocast("cuda")
            except Exception:
                autocast_ctx = nullcontext()

        with torch.no_grad():
            with autocast_ctx:
                # if pipe supports mask_image argument (inpainting), pass it
                try:
                    if mask_image is not None:
                        result = pipe(
                            prompt=instruction,
                            image=init_image,
                            mask_image=mask_image,
                            strength=strength,
                            guidance_scale=guidance,
                            num_inference_steps=steps,
                        )
                    else:
                        result = pipe(
                            prompt=instruction,
                            image=init_image,
                            strength=strength,
                            guidance_scale=guidance,
                            num_inference_steps=steps,
                        )
                except TypeError:
                    # fallback: some pipelines expect different arg names; try without mask
                    result = pipe(
                        prompt=instruction,
                        image=init_image,
                        strength=strength,
                        guidance_scale=guidance,
                        num_inference_steps=steps,
                    )

        image = result.images[0]

        buffered = BytesIO()
        image.save(buffered, format="JPEG", quality=90)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        response = {"status": "success", "image": f"data:image/jpeg;base64,{img_str}"}
        if request_id:
            response["id"] = request_id
        # single-line JSON
        print(json.dumps(response), flush=True)
    except Exception as e:
        tb = traceback.format_exc()
        errlog(f"[ai_worker] Exception: {tb}")
        error_response = {"status": "error", "message": str(e)}
        if request_id:
            error_response["id"] = request_id
        print(json.dumps(error_response), flush=True)

def stdin_server():
    errlog("[ai_worker] Starting stdin server. Awaiting JSON lines.")
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            payload = json.loads(raw)
            prompt = payload.get("prompt")
            image_path = payload.get("image_path")
            request_id = payload.get("id")
            settings = payload.get("settings", {})
            if not prompt or not image_path:
                resp = {"status":"error","message":"Missing prompt or image_path"}
                if request_id: resp["id"] = request_id
                print(json.dumps(resp), flush=True)
                continue
            process_single(prompt, image_path, request_id=request_id, settings=settings)
        except Exception as e:
            errlog(f"[ai_worker] Failed to parse/process request: {e}")
            resp = {"status":"error","message":str(e)}
            print(json.dumps(resp), flush=True)

if __name__ == "__main__":
    # If run with args (backward compat), handle single request then exit
    if len(sys.argv) >= 3:
        input_prompt = sys.argv[1]
        input_image_path = sys.argv[2]
        process_single(input_prompt, input_image_path)
    else:
        # Preload the pipeline on startup to avoid long first-request latency
        try:
            load_pipeline()
            # Notify parent process that worker is ready (stdout JSON line)
            print(json.dumps({"status": "ready"}), flush=True)
        except Exception as e:
            errlog(f"[ai_worker] Preload failed: {e}")
        stdin_server()