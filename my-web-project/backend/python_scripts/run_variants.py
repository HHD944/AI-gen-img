#!/usr/bin/env python3
"""
Run three img2img variants through ai_worker.py and save outputs.
Usage:
  python run_variants.py --input input.png [--mask mask.png]

Requirements: Python environment with dependencies used by ai_worker.py and ai_worker accessible.
This script spawns ai_worker.py as a persistent worker (same as backend does) and sends JSON lines.
"""
import argparse
import subprocess
import sys
import json
import base64
import os
import time

WORKER = os.path.join(os.path.dirname(__file__), "ai_worker.py")

def start_worker(python_exec="python"):
    p = subprocess.Popen([python_exec, WORKER], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    # wait for ready
    ready = False
    start = time.time()
    while True:
        line = p.stdout.readline()
        if not line:
            # check stderr
            err = p.stderr.read()
            raise RuntimeError(f"Worker exited or produced no output. stderr:\n{err}")
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
            if obj.get("status") == "ready":
                ready = True
                break
            else:
                # other messages may appear
                print("Worker message:", obj)
        except Exception:
            # non-json output from stderr
            print("Worker output:", line)
        if time.time() - start > 300:
            raise TimeoutError("Worker didn't signal ready within 300s")
    return p


def send_request(proc, prompt, image_path, settings):
    req = {"id": f"run_{int(time.time()*1000)}", "prompt": prompt, "image_path": image_path, "settings": settings}
    line = json.dumps(req) + "\n"
    proc.stdin.write(line)
    proc.stdin.flush()
    # read response line
    while True:
        resp_line = proc.stdout.readline()
        if not resp_line:
            raise RuntimeError("Worker terminated while waiting for response")
        resp_line = resp_line.strip()
        if not resp_line:
            continue
        try:
            resp = json.loads(resp_line)
            return resp
        except Exception:
            print("Non-json from worker:", resp_line)


def save_b64_image(b64data, outpath):
    if b64data.startswith("data:"):
        b64data = b64data.split(",",1)[1]
    data = base64.b64decode(b64data)
    with open(outpath, "wb") as f:
        f.write(data)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--mask", required=False)
    ap.add_argument("--python", default="python")
    ap.add_argument("--outdir", default=".")
    args = ap.parse_args()

    inp = args.input
    if not os.path.exists(inp):
        print("Input not found:", inp); sys.exit(1)

    if args.mask and not os.path.exists(args.mask):
        print("Mask not found:", args.mask); sys.exit(1)

    os.makedirs(args.outdir, exist_ok=True)

    print("Starting worker...")
    proc = start_worker(python_exec=args.python)
    print("Worker ready")

    # Variant 1: safe
    v1_settings = {"model":"nitrosocke/Ghibli-Diffusion","steps":24,"strength":0.45,"guidance":7.5,"size":768}
    v1_prompt = "Make this image look like a Studio Ghibli painting: soft pastel palette, hand-painted brushstrokes, warm nostalgic lighting, preserve character pose and facial proportions."
    print("Running variant 1 (safe)...")
    r1 = send_request(proc, v1_prompt, inp, v1_settings)
    if r1.get("status") == "success":
        out1 = os.path.join(args.outdir, "variant1.jpg")
        save_b64_image(r1["image"], out1)
        print("Saved", out1)
    else:
        print("Variant1 failed:", r1)

    # Variant 2: strong
    v2_settings = {"model":"nitrosocke/Ghibli-Diffusion","steps":28,"strength":0.75,"guidance":8.0,"size":768}
    v2_prompt = "Studio Ghibli painting style, soft pastel colors, painterly brushstrokes and textures, remove harsh black outlines into soft edges, warm nostalgic lighting, preserve original pose and proportions."
    print("Running variant 2 (strong)...")
    r2 = send_request(proc, v2_prompt, inp, v2_settings)
    if r2.get("status") == "success":
        out2 = os.path.join(args.outdir, "variant2.jpg")
        save_b64_image(r2["image"], out2)
        print("Saved", out2)
    else:
        print("Variant2 failed:", r2)

    # Variant 3: two-pass (base then refine)
    v3a_settings = {"model":"nitrosocke/Ghibli-Diffusion","steps":30,"strength":0.8,"guidance":7.5,"size":768}
    v3a_prompt = "Studio Ghibli painting base: soft pastel palette, broad brush strokes, remove harsh outlines, natural shading."
    print("Running variant 3A (base)...")
    r3a = send_request(proc, v3a_prompt, inp, v3a_settings)
    if r3a.get("status") == "success":
        out3a = os.path.join(args.outdir, "variant3_a.jpg")
        save_b64_image(r3a["image"], out3a)
        print("Saved", out3a)
        # pass B uses output of A as input
        v3b_settings = {"model":"nitrosocke/Ghibli-Diffusion","steps":20,"strength":0.35,"guidance":6.5,"size":768}
        v3b_prompt = "Refine painterly details, preserve original pose and facial proportions, add subtle filmic grain and warm light; keep original blue color palette."
        print("Running variant 3B (refine)...")
        r3b = send_request(proc, v3b_prompt, out3a, v3b_settings)
        if r3b.get("status") == "success":
            out3b = os.path.join(args.outdir, "variant3_b.jpg")
            save_b64_image(r3b["image"], out3b)
            print("Saved", out3b)
        else:
            print("Variant3B failed:", r3b)
    else:
        print("Variant3A failed:", r3a)

    print("All done. terminating worker.")
    try:
        proc.kill()
    except Exception:
        pass

    print("Outputs saved to", os.path.abspath(args.outdir))
