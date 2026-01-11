#!/usr/bin/env python3
"""
Simple mask generator for cartoon images.
Usage:
  python generate_mask.py input.png output_mask.png [threshold]
Produces a grayscale PNG mask where white=editable (background), black=keep (foreground).
"""
import sys
from PIL import Image
import numpy as np

def generate_mask(input_path, output_path, threshold=240):
    img = Image.open(input_path).convert('RGB')
    gray = img.convert('L')
    arr = np.array(gray)
    # create mask: white where brightness > threshold (likely background)
    mask = (arr > threshold).astype('uint8') * 255
    mask_img = Image.fromarray(mask, mode='L')
    mask_img.save(output_path)
    print(f"Mask saved to {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python generate_mask.py input.png output_mask.png [threshold]")
        sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2]
    thr = int(sys.argv[3]) if len(sys.argv) >= 4 else 240
    generate_mask(inp, out, thr)
