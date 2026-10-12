# 第六版（2026-10-12）：把新實拍（crud-anim-2026-10-04/raw 的 bv6-*／bv7-*）和手冊的圖（HANDBOOK/images/v5）
# 搬進 raw/，尺寸與框線寫進 raw/meta-extra.json（不碰 raw/meta.json）。
# - VS Code 畫面：沿用拍攝時的 meta（CSS px，1068×601）
# - 手冊圖、圖表（DIAGRAMS）：meta 用原始像素，框線座標直接量圖
import json, os, shutil
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
SRC = 'D:/AIWORK/pw-shots-tmp/crud-anim-2026-10-04/raw'
HB = 'D:/AIWORK/_AICLASS/AI_CRUD_Workshop_Backend_EASY/HANDBOOK/images/v5'
EXTRA = os.path.join(RAW, 'meta-extra.json')
extra = json.load(open(EXTRA, encoding='utf-8')) if os.path.exists(EXTRA) else {}
src_meta = json.load(open(os.path.join(SRC, 'meta.json'), encoding='utf-8'))

VS = ['bv6-02-prompt', 'bv6-03-reading', 'bv6-q1-batch', 'bv6-q1-answered', 'bv6-q2-batch', 'bv6-q3-batch', 'bv6-q4-answered',
      'bv6-q7-keeper', 'bv6-04-reasons', 'bv6-docs-next', 'bv6-05-model-menu', 'bv6-06-go-typed', 'bv6-07-build-start',
      'bv6-build-t0360', 'bv6-10-run', 'bv6-11-gap-ask', 'bv6-12-gap-done', 'bv6-13-test', 'bv6-14-psql', 'bv6-20-loop-pasted',
      'bv6-21-loop-start', 'bv6-loop-t0480', 'bv6-dec-t0120', 'bv6-22-decide', 'bv6-23-redraw']
VS += [n[:-4] for n in os.listdir(SRC) if n.startswith('bv7-') and n.endswith('.png')] + ['be00-preflight12', 'be00-preflight12-top']
for n in VS:
    shutil.copy(os.path.join(SRC, n + '.png'), os.path.join(RAW, n + '.png'))
    m = src_meta.get(n) or {'w': 1068, 'h': 601, 'boxes': {}}
    extra[n] = {'w': m['w'], 'h': m['h'], 'boxes': {k: v for k, v in (m.get('boxes') or {}).items() if v}}

def px(name, im):
    im.save(os.path.join(RAW, name + '.png'))
    extra[name] = {'w': im.size[0], 'h': im.size[1], 'boxes': extra.get(name, {}).get('boxes', {})}

# 圖表：圖本身照原始像素；標題列（一句話＋怎麼看）只留左邊有字的部分
for k in range(1, 6):
    px(f'bv6-diag-{k}-svg', Image.open(f'{SRC}/bv6-diag-{k}-svg.png').convert('RGB'))
    h = Image.open(f'{SRC}/bv6-diag-{k}-head.png').convert('RGB')
    px(f'bv6-diag-{k}-head', h.crop((0, 0, 1800, h.size[1])))

# 手冊的圖（已裁好、已遮個資）
HBI = ['b0-5-preflight', 'b0-6-pf-nopg', 'b0-7-pf-stopped', 'b0-8-pf-nuget', 'b3-7c-keeper-sch', 'b3-10-srs', 'b3-10b-risk', 'b3-11-design',
       'b3-d1-redraw', 'b3-17-swagger', 'b3-17b-post', 'b3-20-gap-before', 'b3-21-gap-after', 'b3-22-gap-sch', 'b4v6-2-ports',
       'b4v6-3-top', 'b4v6-4-agent', 'b4v6-5-f1', 'b4v6-6-f2', 'b4v6-7-f4-shot', 'b4v6-8-f4-sch', 'b4v6-9-q2', 'b4v6-9b-q3',
       'b4v6-11-log', 'b4v6-12-srs', 'b4v6-13-reload', 'b4-9-pw']
for n in HBI:
    p = os.path.join(HB, n + '.jpg')
    if os.path.exists(p):
        px('h6-' + n, Image.open(p).convert('RGB'))
    else:
        print('missing', n)
# 太長的手冊圖：切成兩段
for src, name, box in [('b3-10-srs', 'h6-srs-a', (0, 0, 1600, 960)), ('b3-10-srs', 'h6-srs-b', (0, 1030, 1600, 1830)),
                       ('b3-11-design', 'h6-design-a', (0, 0, 1600, 830)), ('b3-11-design', 'h6-design-b', (0, 1340, 1600, 1830))]:
    px(name, Image.open(os.path.join(HB, src + '.jpg')).convert('RGB').crop(box))
for k, name, box in [(3, 'bv6-diag-3-a', (0, 0, 2032, 1500)), (3, 'bv6-diag-3-b', (0, 1300, 2032, 2381)),
                     (5, 'bv6-diag-5-a', (0, 0, 1128, 760)), (5, 'bv6-diag-5-b', (0, 640, 1128, 1640))]:
    px(name, Image.open(f'{SRC}/bv6-diag-{k}-svg.png').convert('RGB').crop(box))
px('h6-be-sch-fe2', Image.open('D:/AIWORK/pw-shots-tmp/crud-anim-2026-10-04/bv7/be-sch-fe2.png').convert('RGB'))
# 這次新做的圖（前端修改前後、示意圖、前置檢查）：放在 new6/，有就搬
NEW = os.path.join(HERE, 'new6')
if os.path.isdir(NEW):
    for f in os.listdir(NEW):
        if f.endswith(('.png', '.jpg')):
            px(os.path.splitext(f)[0], Image.open(os.path.join(NEW, f)).convert('RGB'))
json.dump(extra, open(EXTRA, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(VS), 'vs +', len(HBI), 'hb')
