"""把 raw/ 的實拍 PNG 轉成動畫用的 JPG（寬最多 1920，保留放大時的清晰度），並遮掉個資。
用法：python prep.py <輸出資料夾>   → <輸出>/images/*.jpg ＋ <輸出>/meta.json
"""
import json, os, sys, glob
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
out = sys.argv[1]
os.makedirs(os.path.join(out, 'images'), exist_ok=True)
meta = json.load(open(os.path.join(RAW, 'meta.json'), encoding='utf-8'))
extra = os.path.join(RAW, 'meta-extra.json')
if os.path.exists(extra):
    meta.update(json.load(open(extra, encoding='utf-8')))
SKIP = ('_', 'x', 'cc11-build-t')

# 個資處理：{檔名: [('crop', 左, 上, 右, 下) | ('fill', x0, y0, x1, y1, 顏色)]}（原始像素）
BG = (36, 37, 38)
FIX = {
    # 後端課：拍完用 ocr-find.ps1 掃帳號與本機路徑，掃到再加遮罩
    # LOOP 對話裡背景指令的輸出印了本機暫存路徑（含 Windows 帳號），整行蓋掉
    'bc21-ports': [('fill', 734, 617, 1842, 647, BG)],
    'bc23-green': [('fill', 734, 616, 1842, 646, BG)],
    # 第六版：對話裡印了使用者另一個專案的資料夾（占用 3199 的那個），換成「另一個專案」
    'bv6-22-decide': [('retext', 935, 412, 1216, 446, '另一個專案', (43, 43, 43), (204, 204, 204), 'C:/Windows/Fonts/msjh.ttc', 22)],
}
used = []
for f in sorted(glob.glob(os.path.join(RAW, '*.png'))):
    name = os.path.splitext(os.path.basename(f))[0]
    if name.startswith(SKIP) or name not in meta:
        continue
    im = Image.open(f).convert('RGB')
    for op in FIX.get(name, []):
        if op[0] == 'fill':
            ImageDraw.Draw(im).rectangle(op[1:5], fill=op[5])
        elif op[0] == 'retext':
            # ('retext', x0, y0, x1, y1, 新文字, 底色, 字色[, 字型, 字級])：蓋掉一段字，再寫上新文字（預設等寬字型）
            from PIL import ImageFont
            d = ImageDraw.Draw(im); d.rectangle(op[1:5], fill=op[6])
            font = ImageFont.truetype(op[8] if len(op) > 8 else 'consola.ttf', op[9] if len(op) > 9 else 19)
            l, t, r, b = d.textbbox((0, 0), op[5], font=font)
            d.text(((op[1] + op[3] - (r - l)) / 2 - l, (op[2] + op[4] - (b - t)) / 2 - t), op[5], font=font, fill=op[7])
        elif op[0] == 'crop':
            l, t, r, b = op[1], op[2], op[3] or im.size[0], op[4] or im.size[1]
            # meta 的座標是 CSS px；對話框的 meta 本來就是原始像素，一起位移
            m = meta[name]; sx = m['w'] / im.size[0]
            m['boxes'] = {k: ([v[0] - l * sx, v[1] - t * sx, v[2], v[3]] if v else v) for k, v in m['boxes'].items()}
            m['w'] = (r - l) * sx; m['h'] = (b - t) * sx
            im = im.crop((l, t, r, b))
    if im.size[0] > 1920:
        im = im.resize((1920, round(im.size[1] * 1920 / im.size[0])), Image.LANCZOS)
    im.save(os.path.join(out, 'images', name + '.jpg'), quality=82, optimize=True)
    used.append(name)
# 手冊裡的圖解（沿用講師做好的投影片圖）
HB = 'D:/AIWORK/_AICLASS/AI_CRUD_Workshop_Frontend_EASY/HANDBOOK/images'
for src, name in [('step3_paradigm.jpg', 'hb-step3-paradigm'), ('step5_value_curve.jpg', 'hb-step5-value'), ('overview_metaphor.jpg', 'hb-overview')]:
    im = Image.open(os.path.join(HB, src)).convert('RGB')
    if im.size[0] > 1920:
        im = im.resize((1920, round(im.size[1] * 1920 / im.size[0])), Image.LANCZOS)
    im.save(os.path.join(out, 'images', name + '.jpg'), quality=84, optimize=True)
    meta[name] = {'w': im.size[0], 'h': im.size[1], 'boxes': {}}; used.append(name)
json.dump({k: meta[k] for k in used}, open(os.path.join(out, 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
tot = sum(os.path.getsize(os.path.join(out, 'images', n + '.jpg')) for n in used)
print(f'{len(used)} images, {tot // 1024} KB')
