# -*- coding: utf-8 -*-
# 把 AI 產出的 Markdown 文件轉成 HTML（仿 VS Code 深色 Markdown 預覽），給 cap-page.mjs 截圖
# 用法：python md2html.py <輸出資料夾> <md 檔>...；帳號字樣換成「你的帳號」（只改截圖用的副本）
import sys, os, io, re, markdown
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
CSS = """
body{background:#1f1f1f;color:#d4d4d4;font-family:"Segoe UI","Microsoft JhengHei",sans-serif;font-size:17px;line-height:1.6;margin:0;padding:18px 34px 60px}
h1{font-size:30px;border-bottom:1px solid #444;padding-bottom:6px;color:#fff}
h2{font-size:24px;border-bottom:1px solid #3a3a3a;padding-bottom:4px;color:#fff;margin-top:28px}
h3{font-size:20px;color:#fff;margin-top:22px}
code{font-family:Consolas,monospace;background:#2d2d2d;color:#ce9178;padding:1px 5px;border-radius:4px;font-size:15px}
pre{background:#2d2d2d;padding:10px 14px;border-radius:6px;overflow:hidden}
pre code{background:none;color:#d4d4d4}
table{border-collapse:collapse;margin:10px 0}
th,td{border:1px solid #4a4a4a;padding:5px 10px;vertical-align:top}
th{background:#2a2d2e;color:#fff}
blockquote{border-left:4px solid #3794ff;margin:10px 0;padding:2px 14px;background:#232a33;color:#c8c8c8}
a{color:#3794ff} strong{color:#fff}
"""
for f in sys.argv[2:]:
    t = io.open(f, encoding='utf-8').read()
    t = re.sub(r'CJ-?\s*831', '你的帳號', t)
    h = markdown.markdown(t, extensions=['tables', 'fenced_code'])
    name = os.path.splitext(os.path.basename(f))[0]
    io.open(os.path.join(out, name + '.html'), 'w', encoding='utf-8').write(
        '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>%s</title><style>%s</style></head><body>%s</body></html>' % (name, CSS, h))
    print(name)
