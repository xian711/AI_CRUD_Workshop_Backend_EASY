# 第六版場景組裝：scenes-be6-body.js 裡的「//@OLD n m」換成舊版（scenes-be-hands.v1.js）第 n 段，編號改成 m
# 用法：python mk-be6.py → scenes-be-hands.js
import re, io
old = io.open('scenes-be-hands.v1.js', encoding='utf-8').read()
body = io.open('scenes-be6-body.js', encoding='utf-8').read()
# 舊版每段：從「sc3(n, () => {」到下一個「\nsc3(」或「\n// ═」之前
starts = [(int(m.group(1)), m.start()) for m in re.finditer(r'^sc3\((\d+), ', old, re.M)]
blocks = {}
for i, (n, s) in enumerate(starts):
    e = starts[i + 1][1] if i + 1 < len(starts) else len(old)
    seg = old[s:e]
    cut = seg.find('\n// ═')
    blocks[n] = (seg[:cut] if cut >= 0 else seg).rstrip() + '\n'
def rep(m):
    n, k = int(m.group(1)), int(m.group(2))
    b = blocks[n]
    b = re.sub(r'^sc3\(\d+, ', f'sc3({k}, ', b, count=1)
    b = re.sub(r'hd\(\d+, ', f'hd({k}, ', b)
    return b
out = re.sub(r'^//@OLD (\d+) (\d+)\s*$', rep, body, flags=re.M)
io.open('scenes-be-hands.js', 'w', encoding='utf-8').write(out)
print('scenes', len(re.findall(r'^sc3\(', out, re.M)))
