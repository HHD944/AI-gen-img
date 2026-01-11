# import sys
# import os
# import json
# import base64
# from io import BytesIO
# import logging
# import traceback

# # --- Cấu hình & Import ---
# try:
#     import torch
#     from PIL import Image
#     # Sử dụng FluxImg2ImgPipeline từ thư viện diffusers mới nhất
#     from diffusers import FluxImg2ImgPipeline
#     from diffusers.utils import load_image
# except Exception as e:
#     # Báo lỗi dạng JSON nếu thiếu thư viện quan trọng
#     error_response = {"status": "error", "message": f"Import error: {str(e)}. Yêu cầu diffusers>=0.29.0"}
#     print(json.dumps(error_response))
#     sys.exit(1)

# # Tắt log rác để không làm bẩn stdout (nơi trả về JSON)
# logging.getLogger("diffusers").setLevel(logging.WARNING)
# logging.getLogger("transformers").setLevel(logging.WARNING)

# # Cấu hình Model FLUX
# # FLUX.1-schnell: Nhanh (4 steps), License Apache 2.0, nhẹ hơn bản Dev.
# MODEL_ID = "black-forest-labs/FLUX.1-schnell"
# HF_TOKEN = os.environ.get("HF_TOKEN")

# # Phát hiện thiết bị
# if torch.cuda.is_available():
#     DEVICE = "cuda"
# elif getattr(torch, "has_mps", False) and getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
#     DEVICE = "mps"
# else:
#     DEVICE = "cpu"

# def errlog(msg):
#     """Ghi log vào stderr để không ảnh hưởng đến JSON ở stdout"""
#     sys.stderr.write(f"[ai_worker_flux] {str(msg)}\n")
#     sys.stderr.flush()

# # Biến toàn cục lưu pipeline
# pipe = None

# def load_pipeline():
#     global pipe
#     if pipe is not None:
#         return pipe

#     try:
#         errlog(f"Loading FLUX pipeline on {DEVICE}...")

#         # Cấu hình kiểu dữ liệu: FLUX tối ưu nhất với bfloat16
#         # Nếu GPU cũ không hỗ trợ bfloat16, dùng float16
#         dtype = torch.bfloat16
#         if DEVICE == "cuda":
#             # Kiểm tra hỗ trợ bf16
#             if not torch.cuda.is_bf16_supported():
#                 dtype = torch.float16
#                 errlog("GPU does not support bfloat16, falling back to float16")
#         elif DEVICE == "cpu":
#             dtype = torch.float32

#         load_kwargs = {
#             "torch_dtype": dtype,
#             "use_safetensors": True
#         }
#         if HF_TOKEN:
#             load_kwargs["token"] = HF_TOKEN

#         # Load Flux Img2Img
#         pipe = FluxImg2ImgPipeline.from_pretrained(MODEL_ID, **load_kwargs)

#         # Tối ưu hóa bộ nhớ (Quan trọng cho FLUX)
#         if DEVICE == "cuda":
#             # cpu_offload giúp chạy được model to trên VRAM nhỏ (load từng phần)
#             pipe.enable_model_cpu_offload()
#             # Nếu vẫn lỗi OOM (Out of Memory), hãy dùng: pipe.enable_sequential_cpu_offload()
#         elif DEVICE == "mps":
#             pipe.to("mps")

#         return pipe
#     except Exception as e:
#         errlog(f"Pipeline load exception: {traceback.format_exc()}")
#         raise

# def process_single(prompt, image_path, request_id=None, settings=None):
#     try:
#         # 1. Load Pipeline
#         global pipe
#         if pipe is None:
#             load_pipeline()

#         # 2. Xử lý settings
#         # FLUX chuẩn là 1024. Code cũ 512 là quá nhỏ cho FLUX.
#         # Logic: Nếu user không set size, mặc định là 1024.
#         target_size = 1024
#         if settings and settings.get("size"):
#             target_size = int(settings["size"])

#         # FLUX-schnell chỉ cần 4 bước (steps).
#         # Nếu user truyền settings cũ (ví dụ 20, 50), ta giới hạn lại cho nhanh
#         # hoặc giữ nguyên nếu họ muốn (nhưng >4 với schnell thường không khác biệt nhiều)
#         num_inference_steps = 4 
#         if settings and "steps" in settings:
#              # Cho phép tăng nếu user muốn, nhưng mặc định là 4
#             input_steps = int(settings["steps"])
#             num_inference_steps = input_steps if input_steps > 0 else 4

#         # Strength: Độ thay đổi so với ảnh gốc (0.0 - 1.0)
#         strength = float(settings.get("strength")) if settings and "strength" in settings else 0.75
        
#         # Guidance Scale: FLUX-schnell thường KHÔNG dùng guidance (guidance_scale=0).
#         # Tuy nhiên pipeline diffusers vẫn nhận tham số này. Mặc định 0 cho schnell.
#         guidance_scale = 0.0

#         errlog(f"Processing: size={target_size}, steps={num_inference_steps}, strength={strength}")

#         # 3. Load & Preprocess ảnh đầu vào
#         if not os.path.exists(image_path):
#             raise FileNotFoundError(f"Input image not found: {image_path}")
        
#         init_image = load_image(image_path).convert("RGB")
#         init_image = init_image.resize((target_size, target_size), Image.LANCZOS)

#         # 4. Chạy Inference
#         # Seed generator để tái lập kết quả (nếu cần)
#         generator = torch.Generator(device=DEVICE).manual_seed(42) # Hoặc random

#         with torch.no_grad():
#              # FluxImg2Img call
#             result = pipe(
#                 prompt=prompt,
#                 image=init_image,
#                 strength=strength,
#                 num_inference_steps=num_inference_steps,
#                 guidance_scale=guidance_scale,
#                 generator=generator,
#                 max_sequence_length=256 # Tối ưu tốc độ cho schnell
#             ).images[0]

#         # 5. Encode kết quả ra Base64 (Y hệt code cũ)
#         buffered = BytesIO()
#         result.save(buffered, format="JPEG", quality=90)
#         img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
#         # 6. Trả về JSON chuẩn
#         response = {"status": "success", "image": f"data:image/jpeg;base64,{img_str}"}
#         if request_id:
#             response["id"] = request_id
        
#         print(json.dumps(response), flush=True)

#     except Exception as e:
#         tb = traceback.format_exc()
#         errlog(f"Error processing request: {tb}")
#         error_response = {"status": "error", "message": str(e)}
#         if request_id:
#             error_response["id"] = request_id
#         print(json.dumps(error_response), flush=True)

# def stdin_server():
#     """Lắng nghe lệnh từ Standard Input (NodeJS/Parent Process)"""
#     errlog("FLUX Worker Ready. Waiting for JSON lines...")
#     # Báo hiệu ready cho parent process
#     print(json.dumps({"status": "ready"}), flush=True)

#     for raw in sys.stdin:
#         raw = raw.strip()
#         if not raw:
#             continue
#         try:
#             payload = json.loads(raw)
#             # Parse các trường cơ bản
#             prompt = payload.get("prompt")
#             image_path = payload.get("image_path")
#             request_id = payload.get("id")
#             settings = payload.get("settings", {})

#             if not prompt or not image_path:
#                 resp = {"status": "error", "message": "Missing prompt or image_path"}
#                 if request_id: resp["id"] = request_id
#                 print(json.dumps(resp), flush=True)
#                 continue
            
#             # Gọi xử lý
#             process_single(prompt, image_path, request_id=request_id, settings=settings)

#         except json.JSONDecodeError:
#             errlog("Failed to decode JSON from stdin")
#         except Exception as e:
#             errlog(f"Server loop error: {e}")
#             resp = {"status": "error", "message": str(e)}
#             print(json.dumps(resp), flush=True)

# if __name__ == "__main__":
#     # Chế độ chạy bằng tham số dòng lệnh (Legacy support)
#     if len(sys.argv) >= 3:
#         input_prompt = sys.argv[1]
#         input_image_path = sys.argv[2]
#         # Giả lập settings mặc định nếu chạy CLI
#         process_single(input_prompt, input_image_path)
#     else:
#         # Chế độ Server (STDIN)
#         try:
#             # Preload model ngay khi khởi động để lần gọi đầu tiên nhanh hơn
#             load_pipeline()
#         except Exception as e:
#             errlog(f"Preload failed: {e}")
        
#         stdin_server()
import sys
import os
import json
import base64
from io import BytesIO
import logging
import traceback

try:
    import torch
    from PIL import Image
    # Import cả 2 pipeline
    from diffusers import AutoPipelineForText2Image, AutoPipelineForImage2Image
    from diffusers.utils import load_image
except Exception as e:
    print(json.dumps({"status": "error", "message": f"Import error: {str(e)}"}))
    sys.exit(1)

logging.getLogger("diffusers").setLevel(logging.WARNING)
logging.getLogger("transformers").setLevel(logging.WARNING)

MODEL_ID = "stabilityai/sdxl-turbo"

if torch.cuda.is_available():
    DEVICE = "cuda"
elif getattr(torch, "has_mps", False) and getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
    DEVICE = "mps"
else:
    DEVICE = "cpu"

def errlog(msg):
    sys.stderr.write(f"[ai_worker] {str(msg)}\n")
    sys.stderr.flush()

# Biến lưu trữ 2 pipeline (nhưng dùng chung Components -> Tiết kiệm RAM)
pipe_t2i = None
pipe_i2i = None

def load_pipeline():
    global pipe_t2i, pipe_i2i
    if pipe_t2i is not None:
        return

    try:
        errlog(f"Loading SDXL Turbo on {DEVICE}...")
        dtype = torch.float16 if DEVICE == "cuda" else torch.float32
        
        # 1. Load Text-to-Image trước
        pipe_t2i = AutoPipelineForText2Image.from_pretrained(
            MODEL_ID, 
            torch_dtype=dtype, 
            variant="fp16" if DEVICE == "cuda" else None
        )
        
        # 2. Tạo Image-to-Image từ components của cái trên (KHÔNG TỐN THÊM RAM)
        pipe_i2i = AutoPipelineForImage2Image.from_pipe(pipe_t2i)

        if DEVICE == "cuda":
            pipe_t2i.to("cuda")
            pipe_i2i.to("cuda")
        elif DEVICE == "mps":
            pipe_t2i.to("mps")
            pipe_i2i.to("mps")
            
        errlog("Model Loaded Successfully!")
    except Exception as e:
        errlog(f"Pipeline load failed: {traceback.format_exc()}")
        raise

def process_single(prompt, image_path, request_id=None, settings=None):
    try:
        global pipe_t2i, pipe_i2i
        if pipe_t2i is None:
            load_pipeline()

        # === XỬ LÝ SETTINGS ===
        target_size = 1024
        if settings and settings.get("size"):
            target_size = int(settings["size"])
            
        # SDXL Turbo cần ít steps (1-4). Mặc định là 2.
        steps = int(settings.get("steps", 2))
        guidance_scale = 0.0 # Turbo luôn dùng 0.0
        strength = float(settings.get("strength", 0.5))

        generator = torch.Generator(device=DEVICE).manual_seed(42) # Hoặc random

        result_image = None

        # === QUYẾT ĐỊNH CHẾ ĐỘ ===
        # Nếu image_path là "SKIP_IMAGE" hoặc null -> Chạy Text-to-Image
        if not image_path or image_path == "SKIP_IMAGE" or image_path == "warmup":
            errlog(f"Mode: TEXT-TO-IMAGE | Prompt: {prompt}")
            
            if prompt == "warmup": # Hack để warmup model
                 # Generate ảnh rác 64x64 cực nhanh
                with torch.no_grad():
                    pipe_t2i(prompt="warmup", num_inference_steps=1, height=64, width=64)
                print(json.dumps({"status": "ready", "id": request_id}))
                return

            with torch.no_grad():
                result = pipe_t2i(
                    prompt=prompt,
                    height=target_size,
                    width=target_size,
                    num_inference_steps=steps,
                    guidance_scale=guidance_scale,
                    generator=generator
                )
            result_image = result.images[0]

        else:
            # Chạy Image-to-Image
            errlog(f"Mode: IMAGE-TO-IMAGE | Path: {image_path}")
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            init_image = load_image(image_path).convert("RGB")
            init_image = init_image.resize((target_size, target_size), Image.LANCZOS)

            with torch.no_grad():
                result = pipe_i2i(
                    prompt=prompt,
                    image=init_image,
                    strength=strength,
                    num_inference_steps=steps,
                    guidance_scale=guidance_scale,
                    generator=generator
                )
            result_image = result.images[0]

        # Trả kết quả
        buffered = BytesIO()
        result_image.save(buffered, format="JPEG", quality=95)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        response = {"status": "success", "image": f"data:image/jpeg;base64,{img_str}"}
        if request_id: response["id"] = request_id
        print(json.dumps(response), flush=True)

    except Exception as e:
        tb = traceback.format_exc()
        errlog(f"Error: {tb}")
        error_response = {"status": "error", "message": str(e)}
        if request_id: error_response["id"] = request_id
        print(json.dumps(error_response), flush=True)

def stdin_server():
    errlog("Worker Listening...")
    print(json.dumps({"status": "ready"}), flush=True)
    for line in sys.stdin:
        line = line.strip()
        if not line: continue
        try:
            payload = json.loads(line)
            process_single(
                payload.get("prompt"), 
                payload.get("image_path"), 
                payload.get("id"), 
                payload.get("settings", {})
            )
        except Exception as e:
            errlog(f"JSON Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        process_single(sys.argv[1], sys.argv[2])
    else:
        try: load_pipeline() 
        except: pass
        stdin_server()