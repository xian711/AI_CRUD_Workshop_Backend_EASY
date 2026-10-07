"""把場景檔套進播放器，產生可直接用瀏覽器開的教學動畫網頁。

用法：
  python build.py --scenes scenes.js --out-dir "D:/.../XXX教學動畫-2026-10-01" --name "XXX教學動畫-2026-10-01" \
      --title "XXX教學" --h1 "XXX　教學動畫" --subtitle "看完就會…　·　2026-10-01" \
      [--meta shots/meta.json] [--after after.html]

產出：
  <out-dir>/<name>.html        本機開的版本（有 doctype）
  <out-dir>/_src/publish.html  發布成 Artifact 用的版本（沒有 doctype，發布時會自動包）
圖片要放在 <out-dir>/images/，場景裡用 scr('檔名不含副檔名') 引用（副檔名一律 .jpg）。
"""
import argparse, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.environ.get('ANIM_ASSETS') or os.path.join(HERE, '..', 'assets')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--scenes', required=True)
    ap.add_argument('--out-dir', required=True)
    ap.add_argument('--name', required=True)
    ap.add_argument('--title', required=True, help='瀏覽器分頁／畫廊名稱，2～4 個詞')
    ap.add_argument('--h1', required=True)
    ap.add_argument('--subtitle', default='')
    ap.add_argument('--meta', help='capture 腳本產生的 meta.json（截圖尺寸與標註框座標）')
    ap.add_argument('--after', help='動畫下方的文字版速查 HTML 片段（<section class="after">…</section>）')
    ap.add_argument('--anim-id', default='anim', help='動畫代號（英數與 -），問答網站用它對應段落，例如 dashboard')
    ap.add_argument('--ask-url', default='', help='不在問答網站上播放時，「問小港」按鈕要開的網址（沒有就不顯示）')
    ap.add_argument('--tips', default='', help='問答側欄的建議問題，用 | 分隔')
    ap.add_argument('--engine', help='改用自訂播放器（預設 assets/engine.html）')
    ap.add_argument('--extra-helpers', nargs='*', default=[], help='接在 helpers.js 後面的小工具檔')
    a = ap.parse_args()

    eng = open(a.engine or os.path.join(ASSETS, 'engine.html'), encoding='utf-8').read()
    helpers = open(os.path.join(ASSETS, 'helpers.js'), encoding='utf-8').read()
    scenes = open(a.scenes, encoding='utf-8').read()
    for f in a.extra_helpers:
        helpers += chr(10) + open(f, encoding='utf-8').read()

    meta = {}
    if a.meta:
        raw = json.load(open(a.meta, encoding='utf-8'))
        meta = {k: {'w': v['w'], 'h': v['h'], 'boxes': {b: x for b, x in v.get('boxes', {}).items() if x}} for k, v in raw.items()}
    helpers = helpers.replace('/*META*/{}', json.dumps(meta, ensure_ascii=False, separators=(',', ':')))

    after = open(a.after, encoding='utf-8').read() if a.after else ''
    n = len(re.findall(r"^scene\(", scenes, flags=re.M))
    h = (eng.replace('/*{{SCENES}}*/', helpers + '\n' + scenes)
            .replace('{{TITLE}}', a.title).replace('{{H1}}', a.h1).replace('{{SUBTITLE}}', a.subtitle)
            .replace('<!--{{AFTER}}-->', after)
            .replace('{{ANIM_ID}}', a.anim_id).replace('{{ASK_URL}}', a.ask_url)
            .replace('const ANIM_ID=', 'window.__askTips=' + json.dumps([t for t in a.tips.split('|') if t.strip()], ensure_ascii=False) + ';\nconst ANIM_ID=', 1)
            .replace('<span class="pos" id="pos">1 段</span>', f'<span class="pos" id="pos">1／{n} 段</span>'))
    for tok in ['{{TITLE}}', '{{H1}}', '{{SUBTITLE}}', '{{SCENES}}', '{{ANIM_ID}}', '{{ASK_URL}}']:
        if tok in h:
            sys.exit(f'placeholder left: {tok}')

    os.makedirs(os.path.join(a.out_dir, '_src'), exist_ok=True)
    open(os.path.join(a.out_dir, '_src', 'publish.html'), 'w', encoding='utf-8').write(h)
    local = '<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' + h + '\n</html>\n'
    out = os.path.join(a.out_dir, a.name + '.html')
    open(out, 'w', encoding='utf-8').write(local)

    # 場景裡引用的圖片名稱（慣例：00-xxx、ov01-xxx、ai1-xxx）
    imgs = set(re.findall(r"'((?:\d{2}[a-z]?|[a-z]{2,3}\d{1,2})-[\w\-]+)'", scenes))
    missing = [i for i in sorted(imgs) if not os.path.exists(os.path.join(a.out_dir, 'images', i + '.jpg'))]
    print(f'built {out}  scenes={n}')
    if missing:
        print('WARNING images not found (check names):', ', '.join(missing))


if __name__ == '__main__':
    main()
