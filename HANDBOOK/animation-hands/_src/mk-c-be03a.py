# -*- coding: utf-8 -*-
# 從 handbook-pres.txt 取 PRE 3（複製範本指令）與 PRE 4（step3 提示詞），產生指令檔與提示詞檔
import json, re, io
W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/'
s = io.open(W + 'handbook-pres.txt', encoding='utf-8').read()
blocks = {}
for m in re.finditer(r'=== PRE (\d+) ===\n(.*?)(?==== PRE |\Z)', s, re.S):
    blocks[int(m.group(1))] = m.group(2).strip('\n')
pre3 = blocks[3]
pre4 = blocks[4]
pre6 = blocks[6]
io.open(W + 'prompt-step3.txt', 'w', encoding='utf-8').write(pre4 + '\n')
io.open(W + 'prompt-step4.txt', 'w', encoding='utf-8').write(pre6 + '\n')
# 複製指令：先回到 repo 根目錄，再貼整段（含註解），最後 Enter
cmds = [
    {"a": "click", "sel": ".monaco-list-row[aria-label=\"終端機 3 powershell\"]"}, {"a": "wait", "ms": 900},
    {"a": "click", "sel": ".part.panel .xterm >> visible=true"}, {"a": "wait", "ms": 400},
    {"a": "key", "key": "Control+Alt+Shift+F5"}, {"a": "wait", "ms": 500},
    {"a": "paste", "text": "cd D:\\AI_CRUD_Workshop_Backend_EASY\n" + pre3}, {"a": "wait", "ms": 800},
    {"a": "key", "key": "Enter"}, {"a": "wait", "ms": 6000},
    {"a": "shot", "name": "be03-copy", "boxes": {"panel": ".part.panel",
        "copy": {"row": "Copy-Item -Recurse step2_speedrun_kit"},
        "prd": {"row": "PRD-中心裝備物資-後端.md step3_new_module"},
        "tpl": {"row": "SRS-設計文件-最小樣板.md step3_new_module"},
        "cd": {"row": "cd step3_new_module\\\\my-equipment-api"},
        "prompt": {"row": "my-equipment-api>", "last": True}}},
    {"a": "term"},
]
json.dump(cmds, io.open(W + 'c-be03a.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('ok', len(pre3), len(pre4), len(pre6))
