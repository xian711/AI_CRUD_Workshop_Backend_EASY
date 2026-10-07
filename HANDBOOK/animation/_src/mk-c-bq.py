# -*- coding: utf-8 -*-
# 產生「逐題選建議選項」的遙控指令：python mk-c-bq.py <輸出檔> <截圖前綴> <tab1> <tab2> ...
# 每一題：截圖（tab＋建議選項＋Submit）→ 點最後一個可見的「（建議）」radio → 倒出下一題的選項文字
import json, sys, io
W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/'
out, pfx, tabs = sys.argv[1], sys.argv[2], sys.argv[3:]
fr = lambda **k: {'frame': True, 'purpose': 'webviewPanel', **k}
CLICK_REC = ("(()=>{const r=[...document.querySelectorAll('[role=radio]')].filter(e=>e.getBoundingClientRect().width&&/[（(]建議[）)]/.test(e.innerText));"
             " const e=r[r.length-1]; if(!e) return 'none'; e.click(); return 'clicked '+e.innerText.slice(0,40)})()")
DUMP = ("(()=>{const q=[...document.querySelectorAll('[class*=inputContainer] *')].filter(e=>e.childElementCount===0&&/^Q\\d/.test((e.innerText||'').trim())).map(e=>(e.innerText||'').trim().slice(0,200));"
        " const r=[...document.querySelectorAll('[role=radio]')].filter(e=>e.getBoundingClientRect().width).map(e=>e.innerText.replace(/\\n/g,' / ').slice(0,170));"
        " return q.join(' | ')+' ### '+r.join(' ;; ')})()")
cmds = []
for i, t in enumerate(tabs):
    key = t.split(' ')[0].lower()
    cmds += [{'a': 'shot', 'name': '%s-%s' % (pfx, key), 'boxes': {
        'tab': fr(text=t, exact=True), 'rec': fr(sel='[role=radio]', hasText='建議', last=True),
        'submit': fr(text='Submit answers', exact=False, last=True)}}]
    cmds += [{'a': 'feval', 'purpose': 'webviewPanel', 'js': CLICK_REC}, {'a': 'wait', 'ms': 2000},
             {'a': 'feval', 'purpose': 'webviewPanel', 'js': DUMP}]
cmds += [{'a': 'shot', 'name': '%s-answered' % pfx, 'boxes': {'submit': fr(text='Submit answers', exact=False, last=True)}}]
json.dump(cmds, io.open(W + out, 'w', encoding='utf-8'), ensure_ascii=False)
print(out, len(cmds))
