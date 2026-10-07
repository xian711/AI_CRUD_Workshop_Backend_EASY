# -*- coding: utf-8 -*-
# 產生 my-equipment-api 視窗的第一批遙控指令：信任資料夾 → 檔案總管 → 開 Claude Code → 看模型
import json, io
W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/'
row = lambda t: {'sel': '.explorer-folders-view .monaco-list-row', 'hasText': t}
fr = lambda s: {'frame': True, 'purpose': 'webviewPanel', 'sel': s}
F = 'Control+Alt+Shift+'
trust = "(()=>{const b=[...document.querySelectorAll('.monaco-dialog-box .monaco-button')].find(e=>/信任資料/.test(e.innerText)); if(!b) return 'no dialog'; b.click(); return 'trusted'})()"
cmds = [
    {'a': 'wait', 'ms': 2500},
    {'a': 'eval', 'js': trust}, {'a': 'wait', 'ms': 3500},
    {'a': 'eval', 'js': trust}, {'a': 'wait', 'ms': 1000},
    {'a': 'key', 'key': F + 'F8'}, {'a': 'wait', 'ms': 800},
    {'a': 'shot', 'name': 'bc01-explorer', 'boxes': {
        'tree': '.explorer-folders-view', 'claude': row('CLAUDE.md'), 'agents': row('AGENTS.md'),
        'rules': row('CODE-RULES-api'), 'prd': row('PRD-中心裝備物資'), 'tpl': row('SRS-設計文件-最小樣板')}},
    {'a': 'click', 'sel': '.statusbar-item', 'hasText': 'Claude Code'}, {'a': 'wait', 'ms': 8000},
    {'a': 'feval', 'purpose': 'webviewPanel', 'js': "[...document.querySelectorAll('[role=combobox]')].map(b=>b.innerText.replace(/\\n/g,' / '))"},
    {'a': 'shot', 'name': 'bc01-empty', 'boxes': {
        'tab': '.tabs-container .tab.active', 'status': ['.statusbar-item', {'hasText': 'Claude Code'}],
        'input': fr('[role=textbox]'), 'send': fr("button[aria-label='Send message']")}},
]
json.dump(cmds, io.open(W + 'c-bc01.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

# 第二批：貼提示詞 → 送出 → 讀取中
prompt = io.open(W + 'prompt-step3.txt', encoding='utf-8').read().strip('\n')
cmds2 = [
    {'a': 'click', 'frame': True, 'purpose': 'webviewPanel', 'sel': '[role=textbox]'}, {'a': 'wait', 'ms': 600},
    {'a': 'paste', 'text': prompt}, {'a': 'wait', 'ms': 1500},
    {'a': 'shot', 'name': 'bc02-prompt', 'boxes': {
        'input': fr('[role=textbox]'), 'send': fr("button[aria-label='Send message']"), 'model': fr('[role=combobox]')}},
    {'a': 'feval', 'purpose': 'webviewPanel', 'js': "(()=>{const b=document.querySelector('button[aria-label=\"Send message\"]'); if(!b) return 'no send'; b.click(); return 'sent'})()"},
    {'a': 'wait', 'ms': 25000},
    {'a': 'shot', 'name': 'bc03-reading'},
]
json.dump(cmds2, io.open(W + 'c-bc02.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('ok')
