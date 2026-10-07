# -*- coding: utf-8 -*-
# 後端版 C8：PRD、SRS-delta、DESIGN-delta、TASKS 的 Markdown 預覽截圖（my-equipment-api 視窗，Claude Code 分頁留著）
# Claude Code 的分頁會鎖住群組 1，開檔會進群組 2 → 開預覽後把群組 2 最大化（Ctrl+K Ctrl+M），拍完關掉再還原。
# 預覽裡把 git 帳號換成「你的帳號」（只改畫面，不改檔案）。用法：python mk-c-bdocs.py [after]
import json, sys, io
W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07/'
AFTER = len(sys.argv) > 1 and sys.argv[1] == 'after'
FR = 'fake\\.html'   # markdown 預覽的內層 frame（Claude Code 的 webview 是 index.html）
MASK = """(() => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, k = 0;
  while ((n = w.nextNode())) { if (/CJ-?\\s*831|xian711/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/CJ-?\\s*831/g, '你的帳號').replace(/xian711[^\\s]*/g, '你的帳號'); k++; } } return k })()"""
GO = """(t => { const h = [...document.querySelectorAll('h1,h2,h3,h4')].find(e => e.textContent.trim().includes(t));
  if (!h) return 'none'; window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - %d); return h.textContent.trim().slice(0, 30) })(%s)"""
GOTXT = """(t => { const all = [...document.querySelectorAll('h1,h2,h3,h4,p,li,td,th,strong,em,span')].filter(e => e.childElementCount <= 2 && e.textContent.includes(t));
  const e = all[0]; if (!e) return 'none'; window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - %d); return e.tagName + ' ' + e.textContent.trim().slice(0, 40) })(%s)"""
F = 'Control+Alt+Shift+'


def go(text, up=12):
    return [{'a': 'feval', 'frameRe': FR, 'js': GO % (up, json.dumps(text))}, {'a': 'wait', 'ms': 700}]


def gotxt(text, up=120):
    return [{'a': 'feval', 'frameRe': FR, 'js': GOTXT % (up, json.dumps(text))}, {'a': 'wait', 'ms': 700}]


def B(sel, **k):
    return {'frameRe': FR, 'sel': sel, **k}


def H(text):  # 標題（h2/h3 任一含此字）
    return B('h2:has-text("%s"), h3:has-text("%s")' % (text, text))


def T(text):  # 標題後面的第一張表
    return B('h2:has-text("%s") ~ table, h3:has-text("%s") ~ table' % (text, text))


MAX = [{'a': 'key', 'key': 'Control+k'}, {'a': 'wait', 'ms': 300}, {'a': 'key', 'key': 'Control+m'}, {'a': 'wait', 'ms': 1200}]


def open_doc(name, preview=True):
    c = [{'a': 'key', 'key': 'Control+p'}, {'a': 'wait', 'ms': 800}, {'a': 'type', 'text': name, 'delay': 40}, {'a': 'wait', 'ms': 1500},
         {'a': 'key', 'key': 'Enter'}, {'a': 'wait', 'ms': 1800}]
    if preview:
        c += [{'a': 'key', 'key': F + 'F6'}, {'a': 'wait', 'ms': 3000}]
    c += MAX
    if preview:
        c += [{'a': 'feval', 'frameRe': FR, 'js': MASK}, {'a': 'wait', 'ms': 300}]
    return c


def close_doc(preview=True):
    # 關掉預覽與原始檔分頁 → 群組 2 清空後自動消失、版面還原
    c = [{'a': 'key', 'key': 'Control+w'}, {'a': 'wait', 'ms': 700}]
    if preview:
        c += [{'a': 'key', 'key': 'Control+w'}, {'a': 'wait', 'ms': 700}]
    return c


# 先把上一輪留下的 PRD 分頁關掉（群組 2 若還在）
cmds = [{'a': 'eval', 'js': "[...document.querySelectorAll('.editor-group-container')].map((g,i)=>'G'+i+': '+[...g.querySelectorAll('.tabs-container .tab')].map(t=>t.getAttribute('aria-label')).join(' | ')).join(' ;; ')"}]
if not AFTER:
    P = 'be-'
    cmds += open_doc('PRD-中心裝備物資-後端')
    cmds += [{'a': 'shot', 'name': P + 'prd-open', 'boxes': {'h1': B('h1'), 'tab': '.tabs-container .tab.active'}}]
    cmds += go('契約依據') + [{'a': 'shot', 'name': P + 'prd-fields', 'boxes': {'h': H('契約依據'), 'table': B('h2:has-text("契約依據") ~ table'), 'id': B('tr', hasText='`id`'), 'code': B('tr', hasText='`code`')}}]
    cmds += go('待釐清') + [{'a': 'shot', 'name': P + 'prd-decisions', 'boxes': {'h': H('待釐清'), 'table': B('h2:has-text("待釐清") ~ table'), 'q1': B('tr', hasText='Q1'), 'q6': B('tr', hasText='Q6')}}]
    cmds += close_doc()
    cmds += open_doc('SRS-裝備物資API-delta')
    cmds += [{'a': 'shot', 'name': P + 'srs-open', 'boxes': {'h1': B('h1'), 'tab': '.tabs-container .tab.active'}}]
    cmds += go('已拍板決策') + [{'a': 'shot', 'name': P + 'srs-decisions', 'boxes': {'h': H('已拍板決策'), 'table': T('已拍板決策'), 'who': B('h2:has-text("已拍板決策") ~ table th:last-child'), 'q1': B('tr', hasText='Q1'), 'q7': B('tr', hasText='Q7')}}]
    cmds += go('需求追溯') + [{'a': 'shot', 'name': P + 'srs-trace', 'boxes': {'h': H('需求追溯'), 'table': T('需求追溯'), 'id': B('tr', hasText='`id`'), 'code': B('tr', hasText='`code`'), 'updated': B('tr', hasText='updatedAt')}}]
    cmds += go('範圍外') + [{'a': 'shot', 'name': P + 'srs-scope', 'boxes': {'h': H('範圍外'), 'h32': H('這一輪決定不做'), 'list': B('h3:has-text("這一輪決定不做") ~ ul, h3:has-text("這一輪決定不做") ~ table')}}]
    cmds += go('待定與風險') + [{'a': 'shot', 'name': P + 'srs-risk', 'boxes': {'h': H('待定與風險'), 'list': B('h2:has-text("待定與風險") ~ ul, h2:has-text("待定與風險") ~ table')}}]
    cmds += close_doc()
    cmds += open_doc('DESIGN-裝備物資API-delta')
    cmds += [{'a': 'shot', 'name': P + 'design-open', 'boxes': {'h1': B('h1'), 'tab': '.tabs-container .tab.active'}}]
    cmds += go('檔案責任') + [{'a': 'shot', 'name': P + 'design-files', 'boxes': {'h': H('檔案責任'), 'table': T('檔案責任'), 'entity': B('tr', hasText='EquipmentItem.cs'), 'shared': B('tr', hasText='共用不動'), 'disp': B('h2:has-text("檔案責任") ~ table th:nth-child(3)')}}]
    cmds += go('資料模型') + [{'a': 'shot', 'name': P + 'design-model', 'boxes': {'h': H('資料模型'), 'table': T('資料表')}}]
    cmds += go('關鍵決策') + [{'a': 'shot', 'name': P + 'design-decisions', 'boxes': {'h': H('關鍵決策'), 'q1': B('h3:has-text("Q1"), h4:has-text("Q1")')}}]
    cmds += go('遵守 harness') + [{'a': 'shot', 'name': P + 'design-evidence', 'boxes': {'h': H('遵守 harness'), 'table': T('遵守 harness'), 'build': B('tr', hasText='零警告'), 'tests': B('tr', hasText='測試數'), 'mr': B('tr', hasText='ModelResult'), 'zh': B('tr', hasText='繁中'), 'mig': B('tr', hasText='migration')}}]
    cmds += close_doc()
    cmds += open_doc('TASKS')
    cmds += [{'a': 'shot', 'name': P + 'tasks', 'boxes': {'h1': B('h1'), 'total': B('h2:has-text("預期測試總數")'), 'table': B('h2:has-text("預期測試總數") ~ table')}}]
    cmds += go('任務') + [{'a': 'shot', 'name': P + 'tasks-list', 'boxes': {'h': H('任務'), 't0': B('h3:has-text("T0")'), 't1': B('h3:has-text("T1")'), 't2': B('h3:has-text("T2")')}}]
    cmds += close_doc()
    out = 'c-bdocs.json'
else:
    P = 'be-'
    cmds += open_doc('LOOP-LOG', preview=False)
    cmds += [{'a': 'shot', 'name': P + 'loop-log', 'boxes': {'body': '.editor-container .view-lines', 'tab': '.tabs-container .tab.active'}}]
    cmds += close_doc(preview=False)
    cmds += open_doc('SRS-裝備物資API-delta')
    cmds += gotxt('step4 LOOP 後') + [{'a': 'shot', 'name': P + 'srs-after', 'boxes': {'mark': B('td, li, p, h2, h3, strong', hasText='step4 LOOP 後'), 'tab': '.tabs-container .tab.active'}}]
    cmds += close_doc()
    cmds += open_doc('DESIGN-裝備物資API-delta')
    cmds += gotxt('step4 LOOP 後') + [{'a': 'shot', 'name': P + 'design-after', 'boxes': {'mark': B('td, li, p, h2, h3, strong', hasText='step4 LOOP 後'), 'tab': '.tabs-container .tab.active'}}]
    cmds += close_doc()
    out = 'c-bdocs-after.json'
cmds += [{'a': 'eval', 'js': "[...document.querySelectorAll('.editor-group-container')].map((g,i)=>'G'+i+': '+[...g.querySelectorAll('.tabs-container .tab')].map(t=>t.getAttribute('aria-label')).join(' | ')).join(' ;; ')"}]
json.dump(cmds, io.open(W + out, 'w', encoding='utf-8'), ensure_ascii=False)
print(out, len(cmds))
