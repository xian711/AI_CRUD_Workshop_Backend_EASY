// ============================================================
// AI CRUD 後端工作坊 EASY 版：手把手教學動畫（跟著做版）第六版
// 講稿：tts-audition/script_be_hands.py → window.__script；配音 → window.__audio（預錄 mp3）
// 跟講課版分工：這一版只講「點哪裡、貼哪一段、看到什麼就對了」。阿哲＝跟著做；小芸＝檢查點與卡住時。
// 畫面：Step 0～2 沿用 2026-10-07 實拍；Step 3～4 換成 2026-10-11 第六版實拍（bv6-*）與手冊的圖（h6-*）；
//       回報前端修 fullchain-app 是 2026-10-12 實拍（bv7-*、fe7-*）。由 mk-be6.py 組裝（//@OLD 段沿用第一版）。
// ============================================================
const OR = '#ff6a00'
const FV = FR
function vsh(r, names, F = FV) { return shots(r, names, F) }
const HB = 'HANDBOOK.html'
const REP = 'my-equipment-api/loop/LOOP-REPORT.html'
window.__roles = { '小芸': '檢查點・卡住時', '阿哲': '跟著做' }
// 手冊的圖（原始像素）：照比例放進一塊區域
function pic(name, A = { x: 70, y: 116, w: 1460, h: 680 }) { return scr(name, fitF(name, A)) }
// 瀏覽器外框照圖的比例縮放（bwin 會把圖拉滿外框，比例不對會變形）
function pwin(name, url, A = { x: 70, y: 112, w: 1460, h: 690 }) {
  const m = META[name], bar = 64, k = Math.min(A.w / m.w, (A.h - bar) / m.h)
  const w = Math.round(m.w * k), h = Math.round(m.h * k)
  return bwin([name], url, { x: A.x + (A.w - w) / 2, y: A.y, w, h: h + bar, bar })
}
// 圖的標題列（一句話＋怎麼看）：照原比例
function bwHead(name, url) { const m = META[name]; const h = Math.round(1360 * m.h / m.w) + 64; return bwin([name], url, { x: 120, y: 200, w: 1360, h, bar: 64 }) }
const DG = 'docs/DIAGRAMS-裝備物資API.html'
// 圖：先看標題列（一句話、怎麼看），再看圖本身
function diagScene(n, k, parts) {
  return () => {
    const r = {}; hd(n, 'step3 ・ 看圖')
    r.bw = bwHead('bv6-diag-' + k + '-head', DG); r.B = r.bw.S
    r.svg = pic('bv6-diag-' + k + '-svg', { x: 70, y: 116, w: 1460, h: 680 })
    r.H = r.H || []
    for (const [key, box_, label, o] of parts) r[key] = hl(r, r.svg, box_, label, o)
    return r
  }
}
// 修改前／修改後：先框兩塊，再放大修改前、再放大修改後
function baShow(r, g, bf, af, o = {}) {
  only(r, bf, af)
  later(o.t1 ?? 2600, () => { only(r); zoom(g, o.zb, { pad: 14, max: o.max ?? 2 }) })
  later(o.t2 ?? 6200, () => zoom(g, o.za, { pad: 14, max: o.max ?? 2 }))
}

// ════════════════════════════ 開場 ════════════════════════════
chapter('開場', '跟著做', C.teal)

//@OLD 1 1

sc3(2, () => {
  const r = {}; hd(2, '開場')
  r.top = box(L, 70, 130, 1460, 120, '瀏覽器的假資料 → 真的 API ＋ PostgreSQL\nF5 之後資料還在', { size: 38, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.n = flowRow(290, [['Step 0\n準備', C.mut], ['Step 1\n看差別', C.coral], ['Step 2\n範本 API', C.teal], ['Step 3\n做新模組', C.pink], ['Step 4\nLOOP', C.violet], ['Step 5\n收尾', C.green]], { w: 220, gap: 25 })
  r.s3 = card(70, 460, 1460, 130, 'Step 3　重頭戲', ['只給 PRD → AI 問選擇題、交文件和圖 → 你說「開工」它才寫程式'], C.pink, { size: 30, ts: 32 })
  r.s4 = card(70, 620, 1460, 130, 'Step 4', ['AI 自己測、自己修、另一個 AI 挑錯　·　挑到前端的問題：回報前端修好'], C.violet, { size: 30, ts: 32 })
  return r
}, [
  r => { show(r.top); glow(r.top) },
  r => { stagger(r.n.slice(0, 3), 300) },
  r => { stagger(r.n.slice(3, 4), 300); later(400, () => { show(r.s3); glow(r.s3) }) },
  r => { stagger(r.n.slice(4), 300); later(600, () => show(r.s4)) },
])

// ════════════════════════════ Step 0 ════════════════════════════
chapter('Step 0', '準備環境', C.gold)

//@OLD 3 3
//@OLD 4 4
//@OLD 5 5

sc3(6, () => {
  const r = {}; hd(6, 'step0')
  const [a, b, c] = vsh(r, ['hb0-terminal-root', 'be00-preflight12-top', 'be00-preflight12'])
  r.a1 = hl(r, a, 'prompt', '開頭是教材資料夾：位置對了', { col: C.green, below: true, size: 28 })
  r.k = cmdCard(120, 650, 1360, ['cd step0_course_intro', '.\\preflight.ps1'], '一行貼一次、按 Enter', { size: 30 })
  r.b1 = hl(r, b, 'net', '', { col: C.green }); r.b2 = hl(r, b, 'pg', '', { col: C.green }); r.b3 = hl(r, b, 'login', '', { col: C.green })
  r.b4 = hl(r, b, 'port', '', { col: C.green }); r.b5 = hl(r, c, 'nuget', '', { col: C.green })
  r.life = tip('最要緊五項：.NET・PostgreSQL 有裝有開・帳密・5080 空著・Swagger 等套件拿得到', { y: 806, size: 26, col: C.green })
  r.p1 = hl(r, b, 'psql', 'WARN：psql 不在系統路徑', { col: C.gold, above: true, size: 26 })
  r.p2 = hl(r, b, 'psqlpath', '完整路徑印在這：之後照抄', { col: C.gold, below: true, size: 26 })
  r.s1 = hl(r, c, 'summary', '「可以開課」：過關', { col: C.green, above: true, size: 30 })
  return r
}, [
  r => { show([r.S[0], r.k]); later(500, () => only(r, r.a1)) },
  r => { hide(r.k); to(r, r.S[1]); only(r, r.b1, r.b2, r.b3, r.b4); show(r.life); later(4200, () => { to(r, r.S[2]); only(r, r.b5) }) },
  r => { hide(r.life); to(r, r.S[1]); zoom(r.S[1], 'psqlpath', { pad: 120, max: 1.5 }); only(r, r.p1, r.p2) },
  r => { unzoom(r.S[1]); to(r, r.S[2]); only(r, r.s1) },
])

sc3(7, () => {
  const r = {}; hd(7, 'step0 ・ 卡住時')
  r.i1 = pic('h6-b0-6-pf-nopg', { x: 70, y: 120, w: 1460, h: 290 })
  r.i2 = pic('h6-b0-7-pf-stopped', { x: 70, y: 120, w: 1460, h: 290 })
  r.three = card(70, 440, 1460, 300, '第 2 項會分清楚是哪一種', ['沒裝　→　到官網下載安裝', '有裝、服務沒開　→　把服務啟動（最常見）', '服務在跑、5432 連不上　→　埠號不對，重裝選 5432'], C.coral, { size: 30, ts: 34, lh: 62 })
  r.inst = card(70, 440, 1460, 300, '寫「沒裝」：安裝 PostgreSQL 18', ['postgresql.org → Download the installer', '密碼打 12345　·　埠號保持 5432', '最後一頁 Stack Builder 的勾取消 → Finish'], C.gold, { size: 30, ts: 34, lh: 62 })
  r.st = cmdCard(70, 440, 1460, ['Get-Service postgresql*', 'Start-Service postgresql-x64-18'], '寫「服務沒開」：「以系統管理員身分執行」開 PowerShell，一行貼一次', { size: 30, col: C.coral })
  r.pw = cmdCard(70, 160, 1460, ['& "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -h localhost -c "ALTER USER postgres PASSWORD \'12345\';"'], '帳密登不進去：貼這一行，輸入你安裝時設的密碼，就改成 12345', { size: 19, col: C.coral })
  r.pwt = tip('忘了原本的密碼：找講師　·　12345 只限教室練習', { y: 400, size: 30, col: C.gold })
  return r
}, [
  r => { show([r.i1, r.three]); glow(r.three) },
  r => { hide(r.three); show(r.inst); glow(r.inst) },
  r => { hide([r.i1, r.inst]); show([r.i2, r.st]); glow(r.st) },
  r => { hide([r.i2, r.st]); show([r.pw, r.pwt]); glow(r.pw) },
])

sc3(8, () => {
  const r = {}; hd(8, 'step0 ・ 卡住時')
  r.an = [['NuGet', '.NET 的套件商店', C.teal], ['Swagger', '商店裡的一個套件：第一次 dotnet run 自己下載', C.gold]].map(([h, s, col], i) => card(70 + i * 745, 150, 715, 200, h, [s], col, { size: 30, ts: 40 }))
  r.i = pic('h6-b0-8-pf-nuget', { x: 70, y: 120, w: 1460, h: 290 })
  r.rs = cmdCard(70, 440, 1460, ['cd ..\\step2_speedrun_kit\\2.5_sample_api\\sample-api', 'dotnet restore', 'cd ..\\..\\..\\step0_course_intro', '.\\preflight.ps1'], '先換個網路（例如手機熱點），一行貼一次', { size: 28, col: C.teal })
  r.px = cmdCard(70, 440, 1460, ['$env:HTTPS_PROXY=\'http://位址:埠號\'', 'dotnet restore'], '公司網路要走 proxy：先問 IT 拿位址，換成你的', { size: 30, col: C.gold })
  r.ep = cmdCard(70, 160, 1460, ['Set-ExecutionPolicy -Scope CurrentUser RemoteSigned'], '「已停用指令碼執行」：先打這一行，問你就打 Y、Enter，再重跑', { size: 30, col: C.coral })
  r.ai = tip('還是紅：整段輸出（連 PASS 一起）貼給 AI，請它給修復指令', { y: 400, size: 30, col: C.teal })
  return r
}, [
  r => { stagger(r.an, 600) },
  r => { hide(r.an); show([r.i, r.rs]); glow(r.rs) },
  r => { hide(r.rs); show(r.px); glow(r.px) },
  r => { hide([r.i, r.px]); show([r.ep, r.ai]); glow(r.ep) },
])

// ════════════════════════════ Step 1 ════════════════════════════
chapter('Step 1', '看兩份程式', C.coral)

//@OLD 8 9
//@OLD 9 10

// ════════════════════════════ Step 2 ════════════════════════════
chapter('Step 2', '範本 API', C.teal)

//@OLD 10 11
//@OLD 11 12
//@OLD 12 13
//@OLD 13 14
//@OLD 14 15

sc3(16, () => {
  const r = {}; hd(16, 'step2 ・ 檢查點')
  const items = ['dotnet run 起來', 'Swagger 200／404', '49 條全綠', 'psql 查到 24', 'Ctrl+C 停掉']
  r.c = items.map((t, i) => box(L, 70 + i * 296, 160, 276, 140, '☑ ' + t, { size: 28, fill: C.card, stroke: C.green, color: C.ink, weight: 900 }))
  r.stop = card(70, 340, 1460, 170, '沒按 Ctrl+C？', ['API 還占著 5080：Step 3 一開就撞埠'], C.coral, { size: 30, ts: 36 })
  r.red = card(70, 540, 1460, 210, 'Swagger 打不開', ['紅字有 NU1101／NU1301：套件沒下載到 → 換網路、dotnet restore', '其他紅字：從你打的指令那行開始整段複製，貼給 AI'], C.coral, { size: 30, ts: 36, lh: 58 })
  return r
}, [
  r => { stagger(r.c, 300, e => { show(e); glow(e) }) },
  r => { show(r.stop); glow(r.stop) },
  r => { show(r.red); glow(r.red) },
])

// ════════════════════════════ Step 3 ════════════════════════════
chapter('Step 3', '做新模組', C.pink)

//@OLD 16 17
//@OLD 17 18
//@OLD 18 19

sc3(20, () => {
  const r = {}; hd(20, 'step3')
  r.bw = bwin(['hbb-step3-start'], HB + '#step3'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', '起手 prompt：四行，反白複製', { col: OR, below: true, size: 26 })
  r.l3 = box(L, 70, 300, 1460, 200, '第三行：照最小樣板的「釐清規矩」\n沒寫清楚的地方，用選擇題逐題問你，每題附建議和理由', { size: 36, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900, hidden: true })
  const [b, c] = vsh(r, ['bv6-02-prompt', 'bv6-03-reading'])
  r.b1 = hl(r, b, 'input', '貼進輸入框 → 送出', { above: true, size: 28 })
  r.b2 = hl(r, b, 'model', 'Opus 5.5 High', { col: C.gold, below: true, size: 24 })
  r.c1 = hl(r, c, [350, 190, 680, 130], '一串讀檔：它在讀規矩和 PRD', { below: true, size: 28 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)) },
  r => { only(r); hide(r.bw.g); show(r.l3); glow(r.l3) },
  r => { hide(r.l3); show(r.S[0]); later(300, () => only(r, r.b1, r.b2)); later(3600, () => { to(r, r.S[1]); only(r, r.c1) }) },
])

sc3(21, () => {
  const r = {}; hd(21, 'step3 ・ 拍板')
  const [a, b, c] = vsh(r, ['bv6-q1-batch', 'bv6-q2-batch', 'bv6-q4-answered'])
  r.a1 = hl(r, a, [361, 225, 206, 22], '一批四題：分頁切換', { col: C.gold, above: true, size: 26 })
  r.a2 = hl(r, a, [361, 294, 648, 78], '「建議」＋理由和代價', { col: C.green, below: true, size: 26 })
  r.b1 = hl(r, b, [361, 225, 300, 22], 'PRD 六題＋它自己找到的缺口：一共 16 題、四批', { col: C.gold, above: true, size: 26 })
  r.t = tip('先自己想一輪，再對照講師發的課堂裁決　·　看不懂就選「建議」', { y: 806, size: 28, col: C.teal })
  r.c1 = hl(r, c, 'submit', '一批答完：Submit answers', { col: OR, above: true, size: 28 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)); later(3600, () => only(r, r.a2)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
  r => { only(r); show(r.t); glow(r.t) },
  r => { hide(r.t); to(r, r.S[2]); only(r, r.c1) },
])

sc3(22, () => {
  const r = {}; hd(22, 'step3 ・ Q7 保管人')
  const [a] = vsh(r, ['bv6-q7-keeper'])
  r.a1 = hl(r, a, 'tab', 'Q7：PRD 沒寫，它自己找到的', { col: C.gold, above: true, size: 26 })
  r.a2 = hl(r, a, 'rec', '建議：存文字（附代價）', { col: C.green, below: true, size: 26 })
  r.an = [['存編號＝手機通訊錄', ['只記 M-001', '對方改名，你看到的跟著變'], C.teal], ['存文字＝紙本登記簿', ['記「陳建豪」「0912…」', '寫下去就不會變'], C.gold]].map(([h, s, col], i) => card(70 + i * 745, 180, 715, 260, h, s, col, { size: 32, ts: 40, lh: 62 }))
  r.sch = pic('h6-b3-7c-keeper-sch', { x: 70, y: 116, w: 1460, h: 680 })
  r.why = card(70, 300, 1460, 300, '本課選：存文字', ['前端就是兩個文字欄：一行不改', '代價寫進 SRS-delta 第 4 段第 7 條', '正式系統：建議存編號，前後端一起改'], C.green, { size: 32, ts: 38, lh: 66 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)); later(3800, () => only(r, r.a2)) },
  r => { only(r); hide(r.S[0]); stagger(r.an, 700) },
  r => { hide(r.an); show(r.sch) },
  r => { hide(r.sch); show(r.why); glow(r.why) },
])

sc3(23, () => {
  const r = {}; hd(23, 'step3 ・ 補理由')
  const [a, b] = vsh(r, ['bv6-q3-batch', 'bv6-04-reasons'])
  r.a1 = hl(r, a, [361, 225, 420, 22], 'Q10 數量上限、Q11 品名要不要驗：沒選建議', { col: C.gold, above: true, size: 26 })
  r.b1 = hl(r, b, [361, 428, 667, 56], '兩句理由：它寫進 SRS-delta', { col: C.green, above: true, size: 26 })
  r.b2 = hl(r, b, [361, 486, 445, 19], '「誰拍板」寫「學員」', { col: OR, below: true, size: 26 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
  r => { only(r, r.b2) },
])

sc3(24, () => {
  const r = {}; hd(24, 'step3 ・ 卡住時')
  r.warn = box(L, 70, 160, 1460, 160, 'AI 沒問選擇題，直接開始建檔案、寫程式？\n不要讓它跑：先按停止', { size: 38, fill: '#3a1f1f', stroke: C.red, color: C.ink, weight: 900 })
  r.k = codeCard(70, 380, 1460, ['停，先不要寫程式、不要建檔案。', '先照 SRS-設計文件-最小樣板.md 的「釐清規矩」，用選擇題逐題問我，', '我拍板後再產出文件和任務清單，等我說「開工」。'], { title: '救援 prompt（貼進輸入框、送出）', size: 30, col: C.coral })
  return r
}, [
  r => { show(r.warn); glow(r.warn) },
  r => { show(r.k); glow(r.k) },
])

sc3(25, () => {
  const r = {}; hd(25, 'step3 ・ 核文件')
  const [a] = vsh(r, ['bv6-docs-next'])
  r.a0 = tip('docs 四個檔：SRS-delta、設計文件-delta、圖、任務清單　·　程式一行都還沒寫', { y: 806, size: 26, col: C.green })
  r.a1 = hl(r, a, [361, 302, 662, 43], '下一步：選「我先核文件」', { col: C.gold, below: true, size: 28 })
  r.chrome = tip('問要不要開 Chrome：選 No，跟它說文件你自己看', { y: 806, size: 30, col: C.teal })
  r.bw = pwin('h6-srs-a', 'docs/SRS-裝備物資API-delta.md（預覽）'); r.B = r.bw.S
  r.s1 = hl(r, r.B[0], [16, 150, 1568, 120], '第 1 段：每題一列：問題・裁決・理由・誰拍板', { col: OR, below: true, size: 26 })
  r.s2 = hl(r, r.B[0], [16, 868, 1568, 84], 'Q7 保管人：存文字', { col: C.gold, above: true, size: 26 })
  r.bw2 = pwin('h6-srs-b', 'docs/SRS-裝備物資API-delta.md（預覽）'); r.B2 = r.bw2.S
  r.s3 = hl(r, r.B2[0], [16, 84, 1568, 200], '你補的兩句理由', { col: C.green, below: true, size: 28 })
  r.bw3 = pwin('h6-b3-10b-risk', 'docs/SRS-裝備物資API-delta.md（預覽）'); r.B3 = r.bw3.S
  r.rk = tip('第 4 段 待定與風險：選了就有代價，代價寫在這　·　保管人存文字＝第 7 條', { y: 806, size: 26, col: C.gold })
  return r
}, [
  r => { show([r.S[0], r.a0]) },
  r => { hide(r.a0); only(r, r.a1); show(r.chrome) },
  r => { only(r); hide([r.S[0], r.chrome]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.s1)); later(4200, () => only(r, r.s2)); later(7600, () => { only(r); hide(r.bw.g); show(r.bw2.g); show(r.B2[0]); later(300, () => only(r, r.s3)) }) },
  r => { only(r); hide(r.bw2.g); show(r.bw3.g); show(r.B3[0]); show(r.rk) },
])

sc3(26, () => {
  const r = {}; hd(26, 'step3 ・ 看圖')
  r.bw = pwin('h6-design-a', 'docs/DESIGN-裝備物資API-delta.md（預覽）'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], [1016, 200, 92, 630], '新增／只加不改', { col: OR, right: true, size: 26 })
  r.bw2 = pwin('h6-design-b', 'docs/DESIGN-裝備物資API-delta.md（預覽）'); r.B2 = r.bw2.S
  r.a2 = hl(r, r.B2[0], [16, 0, 1568, 250], '共用、人員全套：完全不動', { col: C.green, below: true, size: 26 })
  r.dk = cmdCard(120, 300, 1360, ['start docs\\DIAGRAMS-裝備物資API.html'], '在 my-equipment-api 的終端機：用瀏覽器打開圖（一共五張）', { size: 32 })
  r.hb = bwHead('bv6-diag-1-head', DG); r.HB = r.hb.S
  r.h1 = hl(r, r.HB[0], [0, 120, 1400, 64], '', { col: OR })
  r.h2 = hl(r, r.HB[0], [0, 200, 1200, 136], '', { col: C.teal })
  r.q = tip('上面：一句話（橘）＋怎麼看（藍）　·　下面一題：「看完你要答得出來」', { y: 700, size: 28, col: C.gold })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.a1)); later(4600, () => { only(r); hide(r.bw.g); show(r.bw2.g); show(r.B2[0]); later(300, () => only(r, r.a2)) }) },
  r => { only(r); hide(r.bw2.g); show(r.dk); glow(r.dk) },
  r => { hide(r.dk); show(r.hb.g); show(r.HB[0]); later(300, () => only(r, r.h1, r.h2)); later(2600, () => { show(r.q); glow(r.q) }) },
])

sc3(27, diagScene(27, 1, [
  ['p1', [212, 338, 1290, 1220], '', { col: OR }],
  ['p2', [438, 642, 1060, 920], '實線：請求走的方向', { col: OR, right: true, size: 24 }],
  ['p3', [438, 642, 544, 396], '綠：新寫的檔', { col: C.green, right: true, size: 24 }],
  ['p4', [1229, 1133, 266, 116], '黃：只加幾行', { col: C.gold, right: true, size: 24 }],
  ['p5', [12, 1133, 722, 116], '商業邏輯的幫手：編碼規則、欄位轉換', { col: C.teal, above: true, size: 24 }],
  ['p6', [1788, 921, 196, 116], '人員模組：灰色＝不動', { col: C.mut, above: true, right: true, size: 26 }],
]), [
  r => { show(r.bw.g); show(r.B[0]); later(2800, () => { hide(r.bw.g); show(r.svg) }) },
  r => { only(r, r.p2); later(3200, () => only(r, r.p3, r.p4)) },
  r => { zoom(r.svg, [12, 640, 1500, 920], { pad: 20, max: 1.6 }); only(r, r.p5) },
  r => { unzoom(r.svg); only(r, r.p6) },
])

sc3(28, diagScene(28, 2, [
  ['p1', [378, 373, 1245, 869], '真的資料表：只有這一張', { col: OR, above: true, size: 26 }],
  ['p2', [378, 437, 1245, 114], 'PK 主鍵・UK 不能重複（編碼）', { col: C.gold, above: true, size: 26 }],
  ['p3', [378, 610, 1245, 57], '最多 50 字：你在 Q9 拍板的', { col: C.green, below: true, size: 24 }],
  ['p4', [378, 841, 1245, 114], '保管人：兩個文字欄（Q7）', { col: C.green, below: true, size: 24 }],
  ['p5', [666, 32, 1580, 180], '分類、項目：程式常數，不建表（Q3）', { col: C.teal, below: true, size: 26 }],
]), [
  r => { show(r.bw.g); show(r.B[0]); later(2600, () => { hide(r.bw.g); show(r.svg); only(r, r.p1) }) },
  r => { only(r, r.p2) },
  r => { only(r, r.p3); later(3200, () => only(r, r.p4)); later(6400, () => only(r, r.p5)) },
  r => { only(r); const t = tip('答案：改程式常數；資料表上「只能是這 10 個值」的檢查也要跟著改', { y: 806, size: 26, col: C.green }); show(t); glow(t) },
])

sc3(29, () => {
  const r = {}; hd(29, 'step3 ・ 看圖')
  r.bw = bwHead('bv6-diag-3-head', DG); r.B = r.bw.S
  r.a = pic('bv6-diag-3-a'); r.b = pic('bv6-diag-3-b')
  r.p1 = hl(r, r.a, [79, 14, 1874, 107], '四個角色：由上往下是時間', { col: C.gold, below: true, size: 26 })
  r.p2 = hl(r, r.a, [164, 369, 1671, 217], 'alt 分岔：驗證沒過 → 直接回 400', { col: C.red, below: true, size: 26 })
  r.p3 = hl(r, r.a, [1292, 640, 524, 600], '交易裡：取號 → 算編碼（最大號＋1）', { col: OR, above: true, size: 26 })
  r.p4 = hl(r, r.b, [179, 558, 1643, 357], '成功：提交，回 201', { col: C.green, above: true, size: 26 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(2600, () => { hide(r.bw.g); show(r.a); only(r, r.p1) }) },
  r => { only(r, r.p2) },
  r => { only(r, r.p3) },
  r => { only(r); hide(r.a); show(r.b); later(300, () => only(r, r.p4)) },
])

sc3(30, diagScene(30, 4, [
  ['p1', [10, 15, 460, 1025], '五條路由', { col: C.gold, right: true, size: 26 }],
  ['p2', [570, 14, 366, 786], '', { col: C.teal }],
  ['p3', [549, 186, 410, 80], '橘：不包信封（500、400、204）', { col: OR, right: true, size: 24 }],
  ['p4', [549, 1040, 410, 80], '刪除成功：204，什麼內容都沒有', { col: C.green, above: true, size: 26 }],
]), [
  r => { show(r.bw.g); show(r.B[0]); later(2400, () => { hide(r.bw.g); show(r.svg); only(r, r.p1) }) },
  r => { const t = tip('藍：包在信封 ModelResult 裡（200、201、404）　·　虛線到 500＝意外', { y: 806, size: 26, col: C.teal }); r.t1 = t; show(t); only(r, r.p3) },
  r => { hide(r.t1); only(r); const t = tip('箭頭交叉不好追：對著手冊的打勾表看', { y: 806, size: 30, col: C.gold }); r.t2 = t; show(t) },
  r => { hide(r.t2); only(r, r.p4) },
])

sc3(31, () => {
  const r = {}; hd(31, 'step3 ・ 看圖')
  r.bw = bwHead('bv6-diag-5-head', DG); r.B = r.bw.S
  r.full = pic('bv6-diag-5-svg'); r.a = pic('bv6-diag-5-a'); r.b = pic('bv6-diag-5-b')
  r.p1 = hl(r, r.a, [10, 170, 577, 587], '先問 id 在不在：不在回 404', { col: C.red, right: true, size: 26 })
  r.p2 = hl(r, r.b, [345, 35, 567, 721], '前綴有沒有變？', { col: C.gold, right: true, size: 26 })
  r.p3 = hl(r, r.b, [280, 893, 834, 107], '沒變：保留　·　變了：新前綴取下一號', { col: C.green, above: true, size: 26 })
  r.t = tip('筆電只改數量：還是 IT-LAP-002　·　改成平板：變 IT-TAB 開頭', { y: 806, size: 28, col: C.gold })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(2600, () => { hide(r.bw.g); show(r.full) }) },
  r => { hide(r.full); show(r.a); later(300, () => only(r, r.p1)) },
  r => { only(r); hide(r.a); show(r.b); later(300, () => only(r, r.p2)) },
  r => { only(r, r.p3); show(r.t); glow(r.t) },
])

sc3(32, () => {
  const r = {}; hd(32, 'step3 ・ 請它重畫')
  r.im = pic('h6-b3-d1-redraw', { x: 70, y: 116, w: 1460, h: 680 })
  const m = META['h6-b3-d1-redraw']
  r.bf = hl(r, r.im, [0, 0, m.w / 2, m.h], '重畫前：太寬，要往右捲很久', { col: C.red, below: true, size: 26 })
  r.af = hl(r, r.im, [m.w / 2, 0, m.w / 2, m.h], '重畫後：上下排，捲一點就看完', { col: C.green, below: true, right: true, size: 26 })
  const [a] = vsh(r, ['bv6-23-redraw'])
  r.a1 = hl(r, a, 'input', '一句話：改由上往下、寬度不超過 1400px、顏色和內容不變', { col: C.gold, above: true, size: 24 })
  return r
}, [
  r => { show(r.im); later(300, () => only(r, r.bf)) },
  r => { only(r); hide(r.im); show(r.S[0]); later(300, () => only(r, r.a1)) },
  r => { only(r); hide(r.S[0]); show(r.im); later(300, () => only(r, r.af)) },
])

sc3(33, () => {
  const r = {}; hd(33, 'step3 ・ 開工')
  const [a, b, c] = vsh(r, ['bv6-05-model-menu', 'bv6-06-go-typed', 'bv6-build-t0360'])
  r.a1 = hl(r, a, 'sonnet', '開工前：換 Sonnet 5.5', { col: C.gold, below: true, size: 28 })
  r.b1 = hl(r, b, 'input', '打「開工」→ 送出', { col: C.green, above: true, size: 28 })
  r.tea = box(L, 1080, 64, 400, 46, '實拍：約 7 分鐘', { size: 26, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.c1 = tip('一項一項做，每做完一項回報一行', { y: 806, size: 30, col: C.teal })
  r.done = card(70, 220, 1460, 360, '做完它會回報（實拍那次）', ['97 條測試全綠、build 0 警告', '「跟文件原本寫的不同，已改文件」：5 處', '程式跟文件對得上，才算做完'], C.green, { size: 34, ts: 38, lh: 78 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
  r => { to(r, r.S[2]); only(r); show([r.tea, r.c1]) },
  r => { hide([r.c1, r.S[2], r.tea]); show(r.done); glow(r.done) },
])

sc3(34, () => {
  const r = {}; hd(34, 'step3 ・ 三路驗收')
  const [a] = vsh(r, ['bv6-10-run'])
  r.k = cmdCard(120, 640, 1360, ['cd src\\CrudTemplate.Api', 'dotnet run --urls http://localhost:5080'], '在 my-equipment-api 的終端機：把你的 API 開起來', { size: 28 })
  r.a1 = hl(r, a, 'listen', 'Now listening on 5080', { col: C.green, below: true, size: 28 })
  r.sw = bwin(['be03-swagger', 'be03-swagger-get', 'be03-swagger-404'], 'localhost:5080/swagger'); r.SW = r.sw.S
  r.s1 = hl(r, r.SW[0], 'get', '裝備物資五條路由', { col: OR, above: true, size: 26 })
  r.g1 = hl(r, r.SW[1], 'code', '200', { col: C.green, right: true, size: 30 })
  r.g2 = hl(r, r.SW[1], 'body', '24 筆', { col: C.green, above: true, size: 26 })
  r.n1 = hl(r, r.SW[2], 'code', 'E-999：404', { col: C.red, right: true, size: 30 })
  r.post = pic('h6-b3-17b-post', { x: 70, y: 116, w: 1460, h: 680 })
  r.pt = tip('POST：Request body 整段換成手冊那段（6 個必填）→ 201，id 和編碼是後端產生的', { y: 806, size: 26, col: C.green })
  return r
}, [
  r => { show([r.S[0], r.k]); later(300, () => only(r, r.a1)) },
  r => { only(r); hide([r.S[0], r.k]); show(r.sw.g); show(r.SW[0]); later(300, () => only(r, r.s1)) },
  r => { swap(r.SW, r.SW[1]); only(r, r.g1, r.g2); later(3600, () => { swap(r.SW, r.SW[2]); only(r, r.n1) }) },
  r => { only(r); hide(r.sw.g); show([r.post, r.pt]) },
])

sc3(35, () => {
  const r = {}; hd(35, 'step3 ・ 三路驗收')
  const [a, b] = vsh(r, ['bv6-13-test', 'bv6-14-psql'])
  r.a1 = hl(r, a, 'summary', '失敗 0：這次 102 條（以你的任務清單為準）', { col: C.green, above: true, size: 26 })
  r.b1 = hl(r, b, 'n', 'ai_crud_equipment 的 equipment_item：24 列', { col: C.green, right: true, size: 26 })
  r.warn = tip('範本的人員也是 24 筆：庫名打錯一樣看到 24，要看清楚', { y: 806, size: 28, col: C.coral })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
  r => { show(r.warn); glow(r.warn) },
])

sc3(36, () => {
  const r = {}; hd(36, 'step3 ・ 小落差')
  r.bf = pic('h6-b3-20-gap-before', { x: 70, y: 116, w: 1460, h: 680 })
  r.k = codeCard(70, 220, 1460, ['驗收看到：POST 的 purchaseDate 送空字串 ""，回 400 是對的，', '但錯誤訊息是英文，鍵名是 $.purchaseDate，還多一條 request。', '期望：跟其他 400 一樣，鍵名 purchaseDate、訊息繁中。只改這個。'], { title: '先 Ctrl+C 停 API → 在對話打：看到什麼、期望什麼、只改這個', size: 28, col: C.gold })
  r.af = pic('h6-b3-21-gap-after', { x: 70, y: 116, w: 1460, h: 680 })
  r.at = tip('重跑 dotnet run 再送一次：鍵名 purchaseDate、訊息中文、多的那條不見了', { y: 806, size: 26, col: C.green })
  r.sch = pic('h6-b3-22-gap-sch', { x: 70, y: 116, w: 1460, h: 680 })
  r.st = tip('改的是共用的 Program.cs：也寫進了設計文件', { y: 806, size: 28, col: C.gold })
  return r
}, [
  r => { show(r.bf); const t = tip('修改前：鍵名 $.purchaseDate、英文、多一條 request', { y: 806, size: 28, col: C.red }); r.bt = t; show(t); later(2200, () => zoom(r.bf, [0, 520, 1600, 646], { pad: 10, max: 1.8 })) },
  r => { unzoom(r.bf); hide([r.bf, r.bt]); show(r.k); glow(r.k) },
  r => { hide(r.k); show([r.af, r.at]) },
  r => { hide([r.af, r.at]); show([r.sch, r.st]) },
])

sc3(37, () => {
  const r = {}; hd(37, 'step3 ・ 檢查點')
  const items = ['AI 先問、你拍板', '沒選建議：補理由', 'docs 四個檔', '五張圖都看懂', '你說「開工」才寫']
  r.c = items.map((t, i) => box(L, 70 + i * 296, 150, 276, 140, '☑ ' + t, { size: 26, fill: C.card, stroke: C.green, color: C.ink, weight: 900 }))
  r.three = card(70, 320, 1460, 130, '三路驗收', ['Swagger 狀態碼對　·　測試全綠　·　psql 查得到 24 列'], C.teal, { size: 30, ts: 34 })
  r.stop = box(L, 70, 480, 1460, 110, '進 Step 4 之前：回 dotnet run 的終端機按 Ctrl+C', { size: 34, fill: '#3a1f1f', stroke: C.coral, color: C.ink, weight: 900 })
  return r
}, [
  r => { stagger(r.c.slice(0, 2), 300, e => { show(e); glow(e) }) },
  r => { stagger(r.c.slice(2), 300, e => { show(e); glow(e) }) },
  r => { show(r.three) },
  r => { show(r.stop); glow(r.stop) },
])

// ════════════════════════════ Step 4 ════════════════════════════
chapter('Step 4', 'LOOP＋對抗審查', C.violet)

//@OLD 29 38

sc3(39, () => {
  const r = {}; hd(39, 'step4')
  r.bw = bwin(['hbb-step4-loop'], HB + '#step4'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', '手冊 Step 4 的 LOOP prompt：四行，反白複製', { col: OR, below: true, size: 26 })
  r.l1 = hl(r, r.B[0], [63, 123, 874, 30], '第一行：照 LOOP-規矩.md 做', { col: OR, below: true, size: 26 })
  r.rule = card(120, 180, 1360, 440, 'step4_loop_e2e/LOOP-規矩.md（給 AI 讀）', ['鐵律：修兩次沒好就停、不准改測試', '埠：被占就自己換，不關別人的程式', '審查：子代理先 HTTP 實打 API，再用 Playwright 截圖', '每個修好的：修改前、修改後、示意圖'], C.violet, { size: 30, ts: 32, lh: 70 })
  const [b] = vsh(r, ['bv6-20-loop-pasted'])
  r.b1 = hl(r, b, 'input', '送出：接下來不用插手', { col: C.green, above: true, size: 28 })
  r.sleep = tip('約 20～30 分鐘：電腦不要睡眠；問要不要連 Chrome，選 No、說繼續', { y: 806, size: 26, col: C.coral })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)) },
  r => { only(r, r.l1) },
  r => { only(r); hide(r.bw.g); show(r.rule); glow(r.rule) },
  r => { hide(r.rule); show(r.S[0]); later(300, () => only(r, r.b1)); later(3500, () => show(r.sleep)) },
])

sc3(40, () => {
  const r = {}; hd(40, 'step4')
  const [a] = vsh(r, ['bv6-21-loop-start'])
  r.bw = pwin('h6-b4v6-2-ports', REP); r.B = r.bw.S
  r.t1 = tip('3199 被別的程式占著：沒去關它，自己換成 3200', { y: 806, size: 30, col: C.gold })
  r.t2 = tip('前端的 API 位址、測試網址跟著改　·　為什麼換，寫進報告', { y: 806, size: 28, col: C.teal })
  r.g = card(70, 250, 1460, 260, '第 1 輪：6 條全鏈路測試全綠', ['全鏈路：程式自己開瀏覽器，從畫面一路打到資料庫', '有紅也正常：先留修改前的截圖，再判因、動手修'], C.green, { size: 32, ts: 40, lh: 66 })
  return r
}, [
  r => { show(r.S[0]); later(2600, () => { hide(r.S[0]); show(r.bw.g); show(r.B[0]); show(r.t1) }) },
  r => { hide(r.t1); show(r.t2) },
  r => { hide([r.t2, r.bw.g]); show(r.g); glow(r.g) },
])

sc3(41, () => {
  const r = {}; hd(41, 'step4 ・ 子代理')
  const [a] = vsh(r, ['bv6-loop-t0480'])
  r.a1 = hl(r, a, [478, 525, 61, 19], '1 agent：子代理在工作（Opus 5.5）', { col: C.gold, above: true, size: 28 })
  r.h = card(70, 180, 1460, 300, '子代理：HTTP 真的打 API 104 次', ['合法的、缺欄位的、超長的、壞掉的 JSON 都打', '再開瀏覽器，一頁一頁截圖', '讀全部程式和測試'], C.teal, { size: 30, ts: 36, lh: 62 })
  r.two = [['修了 2 條', 'F1、F2：App 自己的問題', C.green], ['9 條交給你裁決', '動到你拍板的、前端的、測試的', C.gold]].map(([h, s, col], i) => card(70 + i * 745, 200, 715, 220, h, [s], col, { size: 30, ts: 42 }))
  r.n = tip('實拍挑到 11 條　·　規矩不准它自己改的，列成選擇題', { y: 470, size: 28, col: C.coral })
  r.sleep = tip('修好的、要你裁決的：都寫進報告；跑完在對話裡用選擇題問你', { y: 600, size: 26, col: C.teal })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { only(r); hide(r.S[0]); show(r.h); glow(r.h) },
  r => { hide(r.h); stagger(r.two, 600); later(1400, () => show(r.n)) },
  r => { show(r.sleep); glow(r.sleep) },
])

//@OLD 33 42

sc3(43, () => {
  const r = {}; hd(43, 'step4 ・ 看報告')
  r.k = cmdCard(120, 300, 1360, ['start step3_new_module\\my-equipment-api\\loop\\LOOP-REPORT.html'], '教材根目錄的終端機：用瀏覽器打開報告', { size: 28 })
  r.bw = pwin('h6-b4v6-3-top', REP, { x: 70, y: 112, w: 1460, h: 520 }); r.B = r.bw.S
  r.four = flowRow(660, [['一句白話', C.teal], ['修改前／後\n並排', C.coral], ['示意圖', C.gold], ['改了哪個檔\n哪條測試證明', C.green]], { w: 340, gap: 33 })
  return r
}, [
  r => { show(r.k); glow(r.k); later(2800, () => { hide(r.k); show(r.bw.g); show(r.B[0]) }) },
  r => { stagger(r.four, 500, e => { show(e); glow(e) }) },
])

sc3(44, () => {
  const r = {}; hd(44, 'step4 ・ 修改前後')
  r.im = pic('h6-b4v6-5-f1', { x: 70, y: 116, w: 1460, h: 680 })
  r.t0 = tip('從 Excel 複製貼上：夾著看不見的 NUL 字元，PostgreSQL 不收', { y: 806, size: 28, col: C.gold })
  r.bf = hl(r, r.im, [17, 205, 773, 480], '修改前：500', { col: C.red, above: true, size: 26 })
  r.af = hl(r, r.im, [812, 205, 773, 480], '修改後：400＋指出欄位', { col: C.green, above: true, right: true, size: 26 })
  r.sc = hl(r, r.im, [17, 830, 1500, 160], '在哪一步擋：越早擋，訊息越清楚', { col: C.gold, above: true, size: 26 })
  return r
}, [
  r => { show([r.im, r.t0]); zoom(r.im, [0, 0, 1600, 180], { pad: 10, max: 1.6 }) },
  r => { hide(r.t0); unzoom(r.im); baShow(r, r.im, r.bf, r.af, { zb: [17, 205, 773, 480], za: [812, 205, 773, 480] }) },
  r => { only(r); zoom(r.im, [17, 780, 1500, 210], { pad: 14, max: 1.8 }); later(500, () => only(r, r.sc)) },
])

sc3(45, () => {
  const r = {}; hd(45, 'step4 ・ 修改前後')
  r.im = pic('h6-b4v6-6-f2', { x: 70, y: 116, w: 1460, h: 680 })
  r.bf = hl(r, r.im, [17, 205, 773, 480], '修改前：鍵名空字串＋英文＋假錯誤', { col: C.red, above: true, size: 24 })
  r.af = hl(r, r.im, [812, 205, 773, 480], '修改後：鍵名 $、訊息中文', { col: C.green, above: true, right: true, size: 24 })
  r.t = tip('同一個地方：統一產生 400 的 Program.cs（Step 3 的小落差也是它）', { y: 806, size: 26, col: C.gold })
  return r
}, [
  r => { show(r.im); later(300, () => only(r, r.bf)); later(2600, () => { only(r); zoom(r.im, [17, 205, 773, 480], { pad: 14, max: 2 }) }) },
  r => { unzoom(r.im); later(300, () => only(r, r.af)); later(2400, () => { only(r); zoom(r.im, [812, 205, 773, 480], { pad: 14, max: 2 }) }) },
  r => { unzoom(r.im); zoom(r.im, [0, 760, 1600, 320], { pad: 14, max: 1.6 }); show(r.t) },
])

sc3(46, () => {
  const r = {}; hd(46, 'step4 ・ 要你裁決')
  r.q = pic('h6-b4v6-9-q2', { x: 70, y: 200, w: 1460, h: 400 })
  r.qt = tip('報告第 7 段：每題附建議、理由，跟畫面有關的附截圖', { y: 650, size: 28, col: C.teal })
  r.sh = pic('h6-b4v6-7-f4-shot', { x: 70, y: 116, w: 1460, h: 680 })
  const m = META['h6-b4v6-7-f4-shot']
  r.s1 = hl(r, r.sh, [0, 0, m.w, m.h * 0.5], '', { col: C.gold })
  r.s2 = hl(r, r.sh, [0, m.h * 0.5, m.w, m.h * 0.5], '', { col: C.red })
  r.sch = pic('h6-b4v6-8-f4-sch', { x: 70, y: 116, w: 1460, h: 680 })
  r.lg = card(70, 200, 1460, 380, '這是邏輯問題', ['各自的測試都綠，串起來卻壞了：後端擋 50 字是對的（Q9）', '前端少了同一條檢查，被擋下也沒接住', '實拍先選：維持現狀，寫進文件，回報前端'], C.coral, { size: 32, ts: 40, lh: 74 })
  return r
}, [
  r => { show([r.q, r.qt]) },
  r => { hide([r.q, r.qt]); show(r.sh); later(300, () => only(r, r.s1)); later(4200, () => only(r, r.s2)) },
  r => { only(r); hide(r.sh); show(r.sch) },
  r => { hide(r.sch); show(r.lg); glow(r.lg) },
])

sc3(47, () => {
  const r = {}; hd(47, 'step4 ・ 要你裁決')
  r.q = pic('h6-b4v6-9b-q3', { x: 70, y: 200, w: 1460, h: 360 })
  r.t1 = tip('同一個號碼 IT-LAP-003，貼在兩台實物上', { y: 600, size: 30, col: C.red })
  r.t2 = tip('你拍板的兩題（Q1 最大號＋1、Q12 舊號不補）合起來才出現　·　實拍選建議：先把文件寫清楚', { y: 600, size: 24, col: C.gold })
  const [a] = vsh(r, ['bv6-22-decide'])
  r.a1 = hl(r, a, [353, 210, 679, 120], '同一個對話，一次回答', { col: C.green, below: true, size: 28 })
  r.a2 = tip('建議的不一定要選：選了不建議的，說一句理由，它寫進文件', { y: 806, size: 26, col: C.teal })
  return r
}, [
  r => { show([r.q, r.t1]) },
  r => { hide(r.t1); show(r.t2) },
  r => { hide([r.q, r.t2]); show(r.S[0]); later(300, () => only(r, r.a1)); later(2600, () => show(r.a2)) },
])

sc3(48, () => {
  const r = {}; hd(48, 'step4 ・ 驗收')
  r.k = cmdCard(120, 680, 1360, ['start step4_loop_e2e\\e2e\\playwright-report\\index.html'], '教材根目錄的終端機：用瀏覽器打開測試報告', { size: 26 })
  r.bw = pwin('h6-b4-9-pw', 'step4_loop_e2e/e2e/playwright-report/index.html', { x: 70, y: 112, w: 1460, h: 560 }); r.B = r.bw.S
  r.bw2 = pwin('h6-b4v6-11-log', 'my-equipment-api/loop/LOOP-LOG.md', { x: 70, y: 112, w: 1460, h: 680 }); r.B2 = r.bw2.S
  r.bw3 = pwin('h6-b4v6-12-srs', 'docs/SRS-裝備物資API-delta.md（預覽）', { x: 70, y: 112, w: 1460, h: 680 }); r.B3 = r.bw3.S
  r.f5 = pic('h6-b4v6-13-reload', { x: 240, y: 116, w: 1120, h: 680 })
  r.f5t = tip('新增一筆 → F5 還在　·　選其他、打超過 50 字、數量 1.5 → 紅字　·　都驗完才關服務', { y: 816, size: 24, col: C.green })
  return r
}, [
  r => { show([r.bw.g, r.k]); show(r.B[0]) },
  r => { hide([r.k, r.bw.g]); show(r.bw2.g); show(r.B2[0]) },
  r => { hide(r.bw2.g); show(r.bw3.g); show(r.B3[0]); const t = tip('實拍第 13 條＝Q2（你的號碼可能不同）：要回報前端的三件事', { y: 806, size: 28, col: C.gold }); r.t3 = t; show(t) },
  r => { hide([r.bw3.g, r.t3]); show([r.f5, r.f5t]) },
])

sc3(49, () => {
  const r = {}; hd(49, 'step4 ・ 回報前端')
  r.role = box(L, 70, 200, 1460, 200, '這一段看就好，不用照做：教材的前端已經修好\n實拍：換個身分當前端工程師，請 AI 修好', { size: 38, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 900 })
  const [a, b] = vsh(r, ['bv7-02-prompt', 'bv7-10-agent'])
  r.a1 = hl(r, a, 'input', '新對話貼三行：修 fullchain-app・先截修改前・跑測試＋子代理挑錯', { col: C.green, above: true, size: 24 })
  r.a2 = hl(r, a, [353, 359, 679, 40], '第一行：「我授權你修」寫清楚', { col: C.gold, above: true, size: 26 })
  r.rule = tip('LOOP 時規矩說前端不准改　·　這次是你明確授權', { y: 806, size: 28, col: C.coral })
  r.b1 = hl(r, b, [478, 525, 61, 19], '子代理：挑前後端規則一不一致', { col: C.gold, above: true, size: 26 })
  return r
}, [
  r => { show(r.role); glow(r.role) },
  r => { hide(r.role); show(r.S[0]); later(300, () => only(r, r.a1)) },
  r => { only(r, r.a2); show(r.rule); later(4200, () => { hide(r.rule); to(r, r.S[1]); only(r, r.b1) }) },
])

sc3(50, () => {
  const r = {}; hd(50, 'step4 ・ 前端修改前後')
  const mk = (n, lb, la) => { const g = pic(n, { x: 70, y: 116, w: 1460, h: 680 }); const m = META[n]; return { g, b: [0, 0, m.w / 2, m.h], a: [m.w / 2, 0, m.w / 2, m.h], bf: hl(r, g, [0, 0, m.w / 2, m.h], lb, { col: C.red, below: true, size: 24 }), af: hl(r, g, [m.w / 2, 0, m.w / 2, m.h], la, { col: C.green, below: true, right: true, size: 24 }) } }
  r.p1 = mk('fe7-fix-name', '修改前：51 個字照送 → 整頁錯誤', '修改後：紅字「不可超過 50 字」')
  r.p2 = mk('fe7-fix-qty', '修改前：1.5 也能送', '修改後：紅字「數量必須是整數」')
  r.p3 = mk('fe7-fix-nul', '修改前：後端 400 → 整頁錯誤', '修改後：紅字在欄位旁，內容都在')
  return r
}, [
  r => { show(r.p1.g); baShow(r, r.p1.g, r.p1.bf, r.p1.af, { zb: r.p1.b, za: r.p1.a, max: 1.8 }) },
  r => { only(r); unzoom(r.p1.g); hide(r.p1.g); show(r.p2.g); baShow(r, r.p2.g, r.p2.bf, r.p2.af, { zb: r.p2.b, za: r.p2.a, max: 1.8 }) },
  r => { only(r); unzoom(r.p2.g); hide(r.p2.g); show(r.p3.g); baShow(r, r.p3.g, r.p3.bf, r.p3.af, { zb: r.p3.b, za: r.p3.a, max: 1.8 }) },
])

sc3(51, () => {
  const r = {}; hd(51, 'step4 ・ 前後端規則一致')
  r.an = [['前端＝櫃台', '不量尺寸，送到倉庫才被退', C.coral], ['後端＝倉庫', '退件時，櫃台還把單子撕了', C.coral]].map(([h, s, col], i) => card(70 + i * 745, 200, 715, 220, h, [s], col, { size: 30, ts: 42 }))
  r.sch = pic('h6-be-sch-fe2', { x: 70, y: 116, w: 1460, h: 680 })
  const m = META['h6-be-sch-fe2']
  r.l1 = hl(r, r.sch, [40, 120, 812, 775], '第一道：同一把尺先量', { col: C.teal, below: true, size: 26 })
  r.l2 = hl(r, r.sch, [895, 120, 812, 775], '第二道：退件原因寫回欄位', { col: C.green, below: true, right: true, size: 26 })
  r.end = card(70, 220, 1460, 360, '教材附的 fullchain-app：已經是修好的版本', ['Q2 多半不會再出現', '出現了：先核對你的後端字數上限跟 Q9 一不一樣', '結果：你在第 48 段已經親手驗過'], C.green, { size: 32, ts: 38, lh: 74 })
  return r
}, [
  r => { stagger(r.an, 700) },
  r => { hide(r.an); show(r.sch); later(300, () => only(r, r.l1)); later(4600, () => only(r, r.l2)) },
  r => { only(r); zoom(r.sch, [895, 120, 812, 775], { pad: 14, max: 1.6 }) },
  r => { unzoom(r.sch); hide(r.sch); show(r.end); glow(r.end) },
])

sc3(52, () => {
  const r = {}; hd(52, 'step4 ・ 檢查點')
  const items = ['6 條全綠（或報告寫清楚停在哪）', '子代理挑過錯；修好的都有修改前後＋示意圖', '你的裁決寫進了文件', '自己點過：F5 還在；超過 50 字 → 紅字，不會整頁壞掉']
  r.c = items.map((t, i) => box(L, 70, 140 + i * 100, 1460, 84, '☑ ' + t, { size: 30, fill: C.card, stroke: C.green, color: C.ink, weight: 800 }))
  r.iron = [['鐵律 1', '同一問題修兩次沒好就停', C.red], ['鐵律 2', '不准改測試、不准放寬標準', C.red]].map(([h, s, col], i) => card(70 + i * 745, 590, 715, 170, h, [s], col, { size: 30, ts: 36 }))
  return r
}, [
  r => { stagger(r.c.slice(0, 1), 100, e => { show(e); glow(e) }) },
  r => { stagger(r.c.slice(1, 3), 400, e => { show(e); glow(e) }) },
  r => { stagger(r.c.slice(3), 100, e => { show(e); glow(e) }) },
  r => { stagger(r.iron, 500) },
])

// ════════════════════════════ Step 5 ════════════════════════════
chapter('Step 5', '收尾', C.green)

//@OLD 37 53
//@OLD 38 54
