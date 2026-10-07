# -*- coding: utf-8 -*-
# 後端手把手版 Step 0：空的 VS Code → 開終端機 → cd D:\ → git clone（遮 Windows 帳號）
import json, io, os
W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/'
ME = 'Users\\' + os.environ.get('USERNAME', 'xian')
MASK = ("(()=>{let k=0;document.querySelectorAll('.xterm-rows span, .xterm-rows > div').forEach(e=>{if(e.childElementCount===0&&e.textContent.includes(%s)){e.textContent=e.textContent.split(%s).join(%s);k++}});return k})()"
        % (json.dumps(ME), json.dumps(ME), json.dumps('Users\\你的帳號')))
F = 'Control+Alt+Shift+'
URL = 'https://github.com/xian711/AI_CRUD_Workshop_Backend_EASY.git'
cmds = [
    {'a': 'wait', 'ms': 3000},
    {'a': 'shot', 'name': 'hb0-empty', 'boxes': {'menuTerm': {'sel': '.menubar-menu-button', 'hasText': '終端機'}}},
    {'a': 'click', 'sel': '.menubar-menu-button', 'hasText': '終端機'}, {'a': 'wait', 'ms': 1200},
    {'a': 'shot', 'name': 'hb0-menu-terminal', 'boxes': {'newTerm': {'sel': '.action-menu-item', 'hasText': '新增終端'}}},
    {'a': 'key', 'key': 'Escape'}, {'a': 'wait', 'ms': 400},
    {'a': 'key', 'key': F + 'F7'}, {'a': 'wait', 'ms': 3000},
    {'a': 'eval', 'js': MASK},
    {'a': 'shot', 'name': 'hb0-terminal', 'boxes': {'panel': '.part.panel', 'prompt': {'row': 'PS C:'}}},
    {'a': 'key', 'key': F + 'F4'}, {'a': 'wait', 'ms': 1200},
    {'a': 'click', 'sel': '.part.panel .xterm >> visible=true'}, {'a': 'wait', 'ms': 400},
    {'a': 'paste', 'text': 'cd D:\\'}, {'a': 'wait', 'ms': 500}, {'a': 'key', 'key': 'Enter'}, {'a': 'wait', 'ms': 1500},
    {'a': 'paste', 'text': 'git clone ' + URL}, {'a': 'wait', 'ms': 600},
    {'a': 'eval', 'js': MASK},
    {'a': 'shot', 'name': 'hb0-clone-typed', 'boxes': {'panel': '.part.panel', 'cd': {'row': 'cd D:'}, 'cmd': {'row': 'git clone'}}},
    {'a': 'key', 'key': 'Enter'}, {'a': 'wait', 'ms': 45000},
    {'a': 'eval', 'js': MASK},
    {'a': 'shot', 'name': 'hb0-clone-done', 'boxes': {'panel': '.part.panel', 'cmd': {'row': 'git clone', 'last': True}, 'cloning': {'row': 'Cloning into'}, 'done': {'row': 'done', 'last': True}, 'prompt': {'row': 'PS D:\\\\>', 'last': True}}},
    {'a': 'term'},
]
json.dump(cmds, io.open(W + 'c-hb0.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(cmds))
