"""把 check.mjs 的逐句截圖拼成 3×3 縮圖總表（sheet01.png、sheet02.png…），方便一次看完。
用法：python sheet.py ./check
"""
import glob, os, sys
from PIL import Image, ImageDraw

d = sys.argv[1] if len(sys.argv) > 1 else './check'
fs = sorted(glob.glob(os.path.join(d, 's*.png')))
W, H = 800, 450
for s in range(0, len(fs), 9):
    g = fs[s:s + 9]
    sh = Image.new('RGB', (W * 3, H * 3), 'white'); dr = ImageDraw.Draw(sh)
    for j, f in enumerate(g):
        im = Image.open(f).convert('RGB'); im.thumbnail((W, H))
        x, y = (j % 3) * W, (j // 3) * H
        sh.paste(im, (x, y)); dr.rectangle([x, y + 430, x + 90, y + 450], fill='black'); dr.text((x + 4, y + 434), os.path.basename(f), fill='yellow')
    out = os.path.join(d, f'sheet{s // 9 + 1:02d}.png'); sh.save(out); print(out)
