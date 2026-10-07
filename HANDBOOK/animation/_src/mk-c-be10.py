# -*- coding: utf-8 -*-
# 後端 Step 4 LOOP 對話截圖：捲到某段文字拍一張，記下文字外框
import json, io
W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/'
JS = """(t => { const els = [...document.querySelectorAll('h1,h2,h3,h4,p,li,div,span,strong,td,code')]
  .filter(e => e.childElementCount <= 3 && (e.textContent||'').trim().includes(t));
  const e = els[els.length - 1]; if (!e) return 'none';
  e.scrollIntoView({ block: 'start' }); let p = e.parentElement; while (p && !(p.scrollHeight > p.clientHeight + 10 && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement; if (p) p.scrollTop -= %d; return e.tagName + ' ' + e.textContent.trim().slice(0, 40) })(%s)"""
def goto(text, up=110):
    return [{'a': 'feval', 'purpose': 'webviewPanel', 'js': JS % (up, json.dumps(text))}, {'a': 'wait', 'ms': 800}]
T = lambda t, **k: {'frame': True, 'purpose': 'webviewPanel', 'text': t, 'exact': False, 'last': True, **k}
cmds = [{'a': 'feval', 'purpose': 'webviewPanel', 'js': "(()=>{const b=document.querySelector('button[aria-label=\"Disconnect browser\"]'); if(b){b.click(); return 'banner closed'} return 'no banner'})()"}, {'a': 'wait', 'ms': 600},
        {'a': 'feval', 'purpose': 'webviewPanel', 'js': "(()=>{let n=0; for(const b of document.querySelectorAll('button[aria-label=Collapse]')){ if(b.getBoundingClientRect().width){b.click(); n++;} } return 'collapsed '+n})()"}, {'a': 'wait', 'ms': 600}]
cmds += goto('你是 LOOP 工程師', 20) + [{'a': 'shot', 'name': 'bc20-loop-msg', 'boxes': {'msg': T('你是 LOOP 工程師')}}]
cmds += goto('埠都空著') + [{'a': 'shot', 'name': 'bc21-ports', 'boxes': {'port': T('埠都空著'), 'stop': T('停掉受測 API')}}]
cmds += goto('第 1 輪就 6 條全綠') + [{'a': 'shot', 'name': 'bc23-green', 'boxes': {'green': T('第 1 輪就 6 條全綠'), 'build': T('Build 0 警告')}}]
cmds += goto('開對抗審查子代理') + [{'a': 'shot', 'name': 'bc23-agent', 'boxes': {'agent': T('開對抗審查子代理')}}]
cmds += goto('審查回來了') + [{'a': 'shot', 'name': 'bc23-review', 'boxes': {'review': T('審查回來了'), 'fix': T('修 A-2、A-3、A-4、A-5')}}]
cmds += goto('沒加鎖時 20 筆有 9 筆 500') + [{'a': 'shot', 'name': 'bc25-fixed', 'boxes': {'lock': T('沒加鎖時 20 筆有 9 筆 500'), 'r2': T('Round 2 也全綠'), 'tests': T('125 條全過')}}]
cmds += goto('6 條 E2E 全綠，dotnet test 125 條全綠') + [{'a': 'shot', 'name': 'bc25-conclusion', 'boxes': {'head': T('6 條 E2E 全綠，dotnet test 125 條全綠'), 'fixed': {'frame': True, 'purpose': 'webviewPanel', 'sel': 'li', 'hasText': '修了 4 條', 'last': True}, 'you': {'frame': True, 'purpose': 'webviewPanel', 'sel': 'li', 'hasText': '交你裁決', 'last': True}}}]
cmds += goto('受測網址', 60) + [{'a': 'shot', 'name': 'bc25-url', 'boxes': {'url': T('受測網址'), 'fe': T('localhost:3199/equipment/crud'), 'docs': T('都已更新並標')}}]
json.dump(cmds, io.open(W + 'c-be10.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(cmds))
