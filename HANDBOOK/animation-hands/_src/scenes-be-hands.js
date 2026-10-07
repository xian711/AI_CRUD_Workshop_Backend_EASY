// ============================================================
// AI CRUD 後端工作坊 EASY 版：手把手教學動畫（跟著做版）
// 講稿：tts-audition/script_be_hands.py → window.__script；配音 → window.__audio（預錄 mp3）
// 跟講課版分工：這一版只講「點哪裡、貼哪一段、看到什麼就對了」。阿哲＝跟著做；小芸＝檢查點與卡住時。
// 畫面：2026-10-07 Windows 11 實拍（VS Code 繁中＋Claude Code、PowerShell、Swagger、psql）；手冊指令框（hbb-*）、Step 0 開場（hb0-*）同日補拍。
// ============================================================
const OR = '#ff6a00'
const FV = FR
function vsh(r, names, F = FV) { return shots(r, names, F) }
const HB = 'HANDBOOK.html'
window.__roles = { '小芸': '檢查點・卡住時', '阿哲': '跟著做' }

// ════════════════════════════ 開場 ════════════════════════════
chapter('開場', '跟著做', C.teal)

sc3(1, () => {
  const r = {}; hd(1, '開場')
  r.c = [['講課版', '講觀念：為什麼這樣做', C.mut], ['手把手版（這一支）', '點哪裡、貼哪一段、看到什麼就對了', C.gold]].map(([h, s, col], i) => card(70 + i * 745, 150, 715, 220, h, [s], col, { size: 32, ts: 42 }))
  r.two = card(70, 400, 1460, 200, '開兩個視窗', ['左：這支動畫　·　右：VS Code', '看完一段 → 暫停 → 自己做一次 → 下一段'], C.teal, { size: 34, ts: 40, lh: 60 })
  r.hb = box(L, 70, 630, 1460, 110, 'prompt 在手冊、指令在動畫下面的速查：反白 → Ctrl+C 複製', { size: 34, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 900 })
  r.chk = tip('每段最後有檢查點：一樣就往下；不一樣，看「卡住時」', { y: 770, size: 32, col: C.green })
  return r
}, [
  r => { stagger(r.c, 500) },
  r => { show(r.two); glow(r.two) },
  r => { show(r.hb); glow(r.hb) },
  r => { show(r.chk); glow(r.chk) },
])

sc3(2, () => {
  const r = {}; hd(2, '開場')
  r.top = box(L, 70, 130, 1460, 120, '瀏覽器的假資料 → 真的 API ＋ PostgreSQL\nF5 之後資料還在', { size: 38, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.n = flowRow(290, [['Step 0\n準備', C.mut], ['Step 1\n看差別', C.coral], ['Step 2\n範本 API', C.teal], ['Step 3\n做新模組', C.pink], ['Step 4\nLOOP', C.violet], ['Step 5\n收尾', C.green]], { w: 220, gap: 25 })
  r.s3 = card(70, 460, 1460, 130, 'Step 3　重頭戲', ['只給 PRD（需求說明書）→ AI 問選擇題、交文件 → 你說「開工」它才寫程式'], C.pink, { size: 30, ts: 32 })
  r.s4 = card(70, 620, 1460, 130, 'Step 4', ['貼一個 prompt：AI 跑全鏈路測試、自己修、另一個 AI 挑錯'], C.violet, { size: 30, ts: 32 })
  return r
}, [
  r => { show(r.top); glow(r.top) },
  r => { stagger(r.n.slice(0, 3), 300) },
  r => { stagger(r.n.slice(3, 4), 300); later(400, () => { show(r.s3); glow(r.s3) }) },
  r => { stagger(r.n.slice(4), 300); later(600, () => show(r.s4)) },
])

// ════════════════════════════ Step 0 ════════════════════════════
chapter('Step 0', '準備環境', C.gold)

sc3(3, () => {
  const r = {}; hd(3, 'step0')
  const [a, b, c] = vsh(r, ['hb0-empty', 'hb0-menu-terminal', 'hb0-terminal'])
  r.a1 = hl(r, a, 'menuTerm', '① 點「終端機」', { col: C.gold, below: true, size: 30 })
  r.b1 = hl(r, b, 'newTerm', '② 點「新增終端」', { col: C.gold, below: true, size: 30 })
  r.c1 = hl(r, c, 'prompt', '出現 PS 開頭：在等你打指令', { col: C.green, below: true, size: 28 })
  r.c2 = hl(r, c, 'panel', '', { col: C.gold })
  r.max = tip('太小就按終端機右上角的最大化', { y: 806, size: 30, col: C.gold })
  return r
}, [
  r => { show(r.S[0]); later(500, () => only(r, r.a1)); later(3000, () => { to(r, r.S[1]); only(r, r.b1) }) },
  r => { to(r, r.S[2]); only(r, r.c1) },
  r => { only(r, r.c2); show(r.max) },
])

sc3(4, () => {
  const r = {}; hd(4, 'step0')
  const [a, b] = vsh(r, ['hb0-clone-typed', 'hb0-clone-done'])
  r.k = cmdCard(120, 650, 1360, ['cd D:\\', 'git clone https://github.com/xian711/AI_CRUD_Workshop_Backend_EASY.git'], '一行貼一次、按 Enter（沒有 D 槽就用 C:\\）', { size: 28 })
  r.a1 = hl(r, a, 'cd', '開頭變成 D:\\', { col: C.green, below: true, size: 28 })
  r.a2 = hl(r, a, 'cmd', 'git clone：把教材從 GitHub 抓下來', { col: C.gold, below: true, size: 28 })
  r.b1 = hl(r, b, 'done', 'done：下載完成', { col: C.green, below: true, size: 30 })
  return r
}, [
  r => { show([r.S[0], r.k]); later(500, () => only(r, r.a1)) },
  r => { only(r, r.a2) },
  r => { hide(r.k); to(r, r.S[1]); only(r, r.b1) },
])

sc3(5, () => {
  const r = {}; hd(5, 'step0')
  const [a, b, c] = vsh(r, ['hb0-menu-file', 'be00-trust', 'hb0-explorer'])
  r.a1 = hl(r, a, 'openFolder', '「檔案」→「開啟資料夾」→ 選 AI_CRUD_Workshop_Backend_EASY', { col: C.gold, below: true, size: 26 })
  r.b1 = hl(r, b, 'yes', '教材：選「信任」', { col: C.green, below: true, size: 28 })
  r.c1 = hl(r, c, 'tree', 'HANDBOOK、step0～step6 都在：打開對了', { col: C.green, lx: 380, size: 28 })
  return r
}, [
  r => { show(r.S[0]); later(500, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
  r => { to(r, r.S[2]); only(r, r.c1) },
])

sc3(6, () => {
  const r = {}; hd(6, 'step0')
  const [a, b] = vsh(r, ['hb0-terminal-root', 'be00-preflight'])
  r.a1 = hl(r, a, 'prompt', '開頭是教材資料夾：位置對了', { col: C.green, below: true, size: 28 })
  r.k = cmdCard(120, 650, 1360, ['cd step0_course_intro', '.\\preflight.ps1'], '一行貼一次、按 Enter', { size: 30 })
  r.b1 = hl(r, b, 'net', '', { col: C.green }); r.b2 = hl(r, b, 'pg', '', { col: C.green }); r.b3 = hl(r, b, 'login', '', { col: C.green }); r.b4 = hl(r, b, 'port', '', { col: C.green })
  r.life = tip('命脈四項：.NET 版本・PostgreSQL 連得上・帳密登得進去・5080 埠空著', { y: 806, size: 28, col: C.green })
  r.p1 = hl(r, b, 'psql', 'WARN：psql 不在系統路徑', { col: C.gold, above: true, size: 26 })
  r.p2 = hl(r, b, 'psqlpath', '完整路徑印在這：之後照抄', { col: C.gold, below: true, size: 26 })
  r.s1 = hl(r, b, 'summary', '「可以開課」：過關', { col: C.green, above: true, size: 30 })
  return r
}, [
  r => { show([r.S[0], r.k]); later(500, () => only(r, r.a1)) },
  r => { hide(r.k); to(r, r.S[1]); only(r, r.b1, r.b2, r.b3, r.b4); show(r.life) },
  r => { hide(r.life); zoom(r.S[1], 'psqlpath', { pad: 120, max: 1.5 }); only(r, r.p1, r.p2) },
  r => { unzoom(r.S[1]); only(r, r.s1) },
])

sc3(7, () => {
  const r = {}; hd(7, 'step0 ・ 卡住時')
  r.pg = cmdCard(70, 140, 1460, ['Get-Service postgresql*', 'Start-Service postgresql-x64-18'], 'PostgreSQL 沒開：「以系統管理員身分執行」開 PowerShell，貼這兩行', { size: 30, col: C.coral })
  r.pw = card(70, 360, 1460, 130, '帳密登不進去', ['安裝時的密碼不是 12345：照手冊 Step 0 改回來，或找講師'], C.coral, { size: 30, ts: 34 })
  r.ep = cmdCard(70, 520, 1460, ['Set-ExecutionPolicy -Scope CurrentUser RemoteSigned'], '「已停用指令碼執行」：先打這一行，問你要不要變更就打 Y、Enter，再重跑', { size: 30, col: C.coral })
  r.ai = tip('還是紅：整段輸出（連 PASS 一起）貼給 AI，請它說明原因、給修復指令', { y: 760, size: 28, col: C.teal })
  return r
}, [
  r => { show(r.pg); glow(r.pg) },
  r => { show(r.pw); glow(r.pw) },
  r => { show(r.ep); glow(r.ep) },
  r => { show(r.ai); glow(r.ai) },
])

// ════════════════════════════ Step 1 ════════════════════════════
chapter('Step 1', '看兩份程式', C.coral)

sc3(8, () => {
  const r = {}; hd(8, 'step1')
  r.k = cmdCard(120, 300, 1360, ['cd ..', 'start step1_why_harness\\COMPARE.html'], '一行貼一次、按 Enter（macOS 把 start 換成 open）', { size: 32 })
  r.bw = bwin(['be01-compare-top', 'be01-compare-side'], 'COMPARE.html'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], 'table', '三項差異：回應形狀・id 和編碼・欄位名和訊息', { col: OR, below: true, size: 26 })
  r.b1 = hl(r, r.B[1], [22, 56, 589, 46], '左：沒給規矩', { col: C.coral, above: true, size: 26 })
  r.b2 = hl(r, r.B[1], [629, 56, 589, 46], '右：附了規矩', { col: C.teal, above: true, size: 26 })
  r.leg = tip('紅底＝AI 自己決定的　·　綠底＝照規矩寫的', { y: 806, size: 30, col: C.gold })
  return r
}, [
  r => { show(r.k); glow(r.k) },
  r => { hide(r.k); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.a1)) },
  r => { swap(r.B, r.B[1]); only(r, r.b1, r.b2); show(r.leg) },
])

sc3(9, () => {
  const r = {}; hd(9, 'step1 ・ 檢查點')
  r.q = box(L, 70, 180, 1460, 220, '差的不是好不好看\n是「這個決定是誰做的」', { size: 54, fill: C.card, stroke: C.gold, color: C.ink, weight: 900 })
  r.two = [['沒給規矩', 'Category、英文訊息：AI 當場決定', C.coral], ['附了規矩', '欄位名跟前端一模一樣：有出處', C.teal]].map(([h, s, col], i) => card(120 + i * 690, 460, 670, 180, h, [s], col, { size: 30, ts: 40 }))
  return r
}, [
  r => { show(r.q); glow(r.q) },
  r => { stagger(r.two, 500) },
])

// ════════════════════════════ Step 2 ════════════════════════════
chapter('Step 2', '範本 API', C.teal)

sc3(10, () => {
  const r = {}; hd(10, 'step2')
  const [a] = vsh(r, ['be02-dotnet-run'])
  r.k = cmdCard(120, 650, 1360, ['cd step2_speedrun_kit\\2.5_sample_api\\sample-api\\src\\CrudTemplate.Api', 'dotnet run --urls http://localhost:5080'], '教材根目錄的終端機：一行貼一次、按 Enter', { size: 26 })
  r.a1 = hl(r, a, 'insert', '第一次：自己建資料庫、灌 24 筆種子', { col: C.green, below: true, size: 26 })
  r.a2 = hl(r, a, 'listen', 'Now listening on 5080：API 起來了', { col: C.green, below: true, size: 28 })
  r.keep = tip('這個終端機先別關', { y: 806, size: 30, col: C.gold })
  return r
}, [
  r => { show([r.S[0], r.k]) },
  r => { hide(r.k); only(r, r.a1) },
  r => { only(r, r.a2); show(r.keep) },
])

sc3(11, () => {
  const r = {}; hd(11, 'step2')
  r.bw = bwin(['be02-swagger', 'be02-swagger-get', 'be02-swagger-404'], 'localhost:5080/swagger'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], 'title', 'Swagger：API 的操作面板', { col: OR, below: true, size: 28 })
  r.a2 = hl(r, r.B[0], 'get', '① 點「GET 全部」→ Try it out → Execute', { col: OR, below: true, size: 26 })
  r.b1 = hl(r, r.B[1], 'code', '200', { col: C.green, right: true, size: 30 })
  r.b2 = hl(r, r.B[1], 'body', '24 筆，包在 success／message／data（ModelResult）', { col: C.green, above: true, size: 24 })
  r.c1 = hl(r, r.B[2], 'code', 'M-999：404 找不到', { col: C.red, right: true, size: 30 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.a1)) },
  r => { only(r, r.a2) },
  r => { swap(r.B, r.B[1]); only(r, r.b1, r.b2) },
  r => { swap(r.B, r.B[2]); only(r, r.c1) },
])

sc3(12, () => {
  const r = {}; hd(12, 'step2')
  const [a, b] = vsh(r, ['be02-dotnet-test', 'be02-psql'])
  r.k = cmdCard(70, 600, 1460, ['cd step2_speedrun_kit\\2.5_sample_api\\sample-api', 'dotnet test'], '第二個終端機（右上角「＋」）：一行貼一次', { size: 28 })
  r.a1 = hl(r, a, 'summary', '總計 49、失敗 0：全綠', { col: C.green, above: true, size: 28 })
  r.k2 = cmdCard(70, 640, 1460, ['$env:PGPASSWORD=\'12345\'; & "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -h localhost -d ai_crud_template -c "SELECT count(*) FROM template_member;"'], '整行貼上、按 Enter', { size: 20 })
  r.b1 = hl(r, b, 'n', '24：畫面、API、資料庫對上了', { col: C.green, right: true, size: 28 })
  r.stop = tip('看完：回第一個終端機按 Ctrl+C，把 API 停掉', { y: 806, size: 30, col: C.coral })
  return r
}, [
  r => { show([r.S[0], r.k]) },
  r => { hide(r.k); only(r, r.a1) },
  r => { to(r, r.S[1]); show(r.k2); only(r, r.b1) },
  r => { hide(r.k2); show(r.stop); glow(r.stop) },
])

sc3(13, () => {
  const r = {}; hd(13, 'step2')
  const [a] = vsh(r, ['be02-harness-files'])
  r.a1 = hl(r, a, 'docs', '2.5_sample_api ／ sample-api', { lx: 560, col: C.gold, size: 28 })
  r.b1 = hl(r, a, 'claude', '這四份 md ＝ 規矩（harness）', { lx: 560, col: C.gold, size: 30 })
  r.b2 = hl(r, a, 'rules', '', { col: C.gold }); r.b3 = hl(r, a, 'contract', '', { col: C.gold }); r.b4 = hl(r, a, 'guide', '', { col: C.gold })
  r.c1 = tip('CLAUDE.md 只有四十幾行：打開掃一遍，確認鐵律跟你們公司一致', { y: 806, size: 28, col: C.teal })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { only(r, r.b1, r.b2, r.b3, r.b4) },
  r => { only(r, r.b1); show(r.c1); glow(r.c1) },
])

sc3(14, () => {
  const r = {}; hd(14, 'step2')
  r.k = cmdCard(120, 300, 1360, ['start ..\\..\\2.4_architecture_db\\ARCHITECTURE_DB.html'], '第二個終端機（目前在 sample-api）', { size: 30 })
  r.bw = bwin(['be02-arch-layers'], 'ARCHITECTURE_DB.html'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], [59, 174, 1122, 108], 'Controller → Service → EF Core → PostgreSQL', { col: OR, above: true, size: 26 })
  r.b1 = hl(r, r.B[0], [59, 347, 545, 140], 'Controller：收件、回狀態碼', { col: OR, below: true, size: 26 })
  r.b2 = hl(r, r.B[0], [636, 347, 545, 140], 'Service：商業邏輯', { col: OR, below: true, size: 26 })
  return r
}, [
  r => { show(r.k); glow(r.k) },
  r => { hide(r.k); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.a1)) },
  r => { only(r, r.b1, r.b2) },
])

sc3(15, () => {
  const r = {}; hd(15, 'step2 ・ 檢查點')
  const items = ['dotnet run 起來', 'Swagger 200／404', '49 條全綠', 'psql 查到 24', 'Ctrl+C 停掉']
  r.c = items.map((t, i) => box(L, 70 + i * 296, 160, 276, 140, '☑ ' + t, { size: 28, fill: C.card, stroke: C.green, color: C.ink, weight: 900 }))
  r.stop = card(70, 340, 1460, 170, '沒按 Ctrl+C？', ['API 還占著 5080：Step 3 一開就撞埠'], C.coral, { size: 30, ts: 36 })
  r.red = card(70, 540, 1460, 170, 'dotnet 噴一大串紅字', ['從你打的指令那行開始整段複製，貼給 AI，請它說明原因'], C.coral, { size: 30, ts: 36 })
  return r
}, [
  r => { stagger(r.c, 300, e => { show(e); glow(e) }) },
  r => { show(r.stop); glow(r.stop) },
  r => { show(r.red); glow(r.red) },
])

// ════════════════════════════ Step 3 ════════════════════════════
chapter('Step 3', '做新模組', C.pink)

sc3(16, () => {
  const r = {}; hd(16, 'step3')
  const [a, b] = vsh(r, ['hb0-terminal-root', 'be03-copy'])
  r.a1 = hl(r, a, 'prompt', '新的終端機：開頭是教材根目錄', { col: C.green, below: true, size: 28 })
  r.bw = bwin(['hbb-step3-copy'], HB + '#step3'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', '手冊 Step 3 複製指令：黑底框反白 → Ctrl+C', { col: OR, below: true, size: 26 })
  r.b1 = hl(r, b, 'copy', '出現 >> 時再按一次 Enter', { col: C.gold, below: true, size: 28 })
  r.b2 = hl(r, b, 'cd', '進到 my-equipment-api', { col: C.green, below: true, size: 28 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { only(r); hide(r.S[0]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)) },
  r => { only(r); hide(r.bw.g); show(r.S[1]); later(300, () => only(r, r.b1)) },
  r => { only(r, r.b2) },
])

sc3(17, () => {
  const r = {}; hd(17, 'step3')
  const [a] = vsh(r, ['bc01-explorer'])
  r.open = tip('「檔案」→「開啟資料夾」→ my-equipment-api（視窗會重開）', { y: 806, size: 28, col: C.gold })
  r.a1 = hl(r, a, 'claude', '四份規矩跟著來了', { lx: 560, col: C.green, size: 28 })
  r.a2 = hl(r, a, 'agents', '', { col: C.green }); r.a3 = hl(r, a, 'rules', '', { col: C.green })
  r.a4 = hl(r, a, 'prd', 'PRD 和最小樣板也在', { lx: 560, col: C.gold, size: 28, below: true }); r.a5 = hl(r, a, 'tpl', '', { col: C.gold })
  r.bw = bwin(['be-prd-fields', 'be-prd-decisions'], 'PRD-中心裝備物資-後端.md（預覽）'); r.B = r.bw.S
  r.c1 = hl(r, r.B[0], 'table', '第 3 節：13 個欄位，前端定好、一個字都不能改', { col: OR, above: true, size: 24 })
  r.d1 = hl(r, r.B[1], 'h', '第 5 節：六個決定留給你', { col: OR, below: true, size: 28 })
  return r
}, [
  r => { show([r.S[0], r.open]) },
  r => { hide(r.open); only(r, r.a1, r.a2, r.a3, r.a4, r.a5) },
  r => { only(r); hide(r.S[0]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.c1)) },
  r => { swap(r.B, r.B[1]); only(r, r.d1) },
])

sc3(18, () => {
  const r = {}; hd(18, 'step3')
  const [a, b, c] = vsh(r, ['bc01-empty', 'bc01-model-menu', 'bc01-model-opus'])
  r.a1 = hl(r, a, 'status', '右下角「Claude Code」', { col: C.gold, above: true, right: true, size: 28 })
  r.b1 = hl(r, b, 'opus', 'Opus 5.5；同一個選單裡 effort 拉到 High', { col: C.gold, below: true, size: 26 })
  r.c1 = hl(r, c, 'model', 'Opus 5.5 High', { col: C.gold, above: true, size: 28 })
  r.c2 = hl(r, c, [930, 519, 62, 30], '核准模式：Auto', { col: C.green, above: true, right: true, size: 28 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
  r => { to(r, r.S[2]); only(r, r.c1, r.c2) },
])

sc3(19, () => {
  const r = {}; hd(19, 'step3')
  r.bw = bwin(['hbb-step3-start'], HB + '#step3'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', '起手 prompt：四行，反白複製', { col: OR, below: true, size: 26 })
  const [b, c] = vsh(r, ['bc02-prompt', 'bc03-reading'])
  r.b1 = hl(r, b, 'input', '貼進輸入框 → 送出', { above: true, size: 28 })
  r.c1 = hl(r, c, [350, 190, 680, 100], '一串讀檔：它在讀規矩和 PRD', { below: true, size: 28 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)) },
  r => { only(r); hide(r.bw.g); show(r.S[0]); later(300, () => only(r, r.b1)) },
  r => { to(r, r.S[1]); only(r, r.c1) },
])

sc3(20, () => {
  const r = {}; hd(20, 'step3')
  const [a, b, c, d] = vsh(r, ['bc04-q1', 'bc04-q3', 'bc05-q7', 'bc04-answered'])
  r.a1 = hl(r, a, 'tab', '一批四題：分頁切換', { col: C.gold, above: true, size: 26 })
  r.a2 = hl(r, a, 'rec', '「建議」＋一句理由', { col: C.green, below: true, size: 26 })
  r.b1 = tip('先自己答，再對照講師發的課堂裁決（答案不在動畫裡）', { y: 806, size: 28, col: C.teal })
  r.c1 = hl(r, c, 'tab', 'PRD 沒寫清楚的：它多問，一共 12 題', { col: C.gold, above: true, size: 26 })
  r.d1 = hl(r, d, 'submit', '一批答完：Submit answers', { col: OR, above: true, size: 28 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1, r.a2)) },
  r => { to(r, r.S[1]); only(r); show(r.b1) },
  r => { hide(r.b1); to(r, r.S[2]); only(r, r.c1) },
  r => { to(r, r.S[3]); only(r, r.d1) },
])

sc3(21, () => {
  const r = {}; hd(21, 'step3 ・ 卡住時')
  r.warn = box(L, 70, 160, 1460, 160, 'AI 沒問選擇題，直接開始建檔案、寫程式？\n不要讓它跑：先按停止', { size: 38, fill: '#3a1f1f', stroke: C.red, color: C.ink, weight: 900 })
  r.k = codeCard(70, 380, 1460, ['停，先不要寫程式、不要建檔案。', '先用選擇題逐題問我 PRD 第 5 節的六題，我拍板後再產出文件和任務清單，等我說「開工」。'], { title: '救援 prompt（貼進輸入框、送出）', size: 30, col: C.coral })
  return r
}, [
  r => { show(r.warn); glow(r.warn) },
  r => { show(r.k); glow(r.k) },
])

sc3(22, () => {
  const r = {}; hd(22, 'step3')
  const [a, b] = vsh(r, ['bc06-docs', 'bc06-next'])
  r.a1 = hl(r, a, 'head', 'docs 四個檔：程式一行都還沒寫', { col: C.green, below: true, size: 28 })
  r.b1 = hl(r, b, 'rec', '下一步：選「我先看文件」', { col: C.gold, below: true, size: 28 })
  r.chrome = tip('問要不要開 Chrome：選 No，跟它說文件你自己看', { y: 806, size: 30, col: C.teal })
  r.bw = bwin(['be-srs-decisions', 'be-srs-trace', 'be-srs-scope'], 'docs/SRS-裝備物資API-delta.md（預覽）'); r.B = r.bw.S
  r.c1 = hl(r, r.B[0], 'h', '第 1 段：已拍板決策（12 題）', { col: OR, below: true, size: 28 })
  r.d1 = hl(r, r.B[1], 'table', '第 2 段：13 欄各做在哪', { col: OR, above: true, size: 26 })
  r.d2 = hl(r, r.B[2], 'h32', '第 3 段：這一版不做什麼', { col: OR, below: true, size: 26 })
  r.must = tip('這三段你一定要核', { y: 806, size: 32, col: C.gold })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1); show(r.chrome) },
  r => { only(r); hide([...r.S, r.chrome]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.c1)) },
  r => { swap(r.B, r.B[1]); only(r, r.d1); later(3500, () => { swap(r.B, r.B[2]); only(r, r.d2); show(r.must) }) },
])

sc3(23, () => {
  const r = {}; hd(23, 'step3')
  r.bw = bwin(['be-design-files', 'be-design-evidence'], 'docs/DESIGN-裝備物資API-delta.md（預覽）'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], 'h', '第 1 段：哪一層新增哪些檔', { col: OR, below: true, size: 28 })
  r.b1 = hl(r, r.B[1], 'table', '做完才填：這張是做完後的樣子', { col: OR, above: true, size: 26 })
  r.dk = cmdCard(120, 660, 1360, ['start docs\\DIAGRAMS-裝備物資API.html'], '在 my-equipment-api 的終端機：用瀏覽器打開圖', { size: 30 })
  r.d1 = scr('be-diag-1b', fitF('be-diag-1b', { x: 40, y: 120, w: 1520, h: 520 }))
  r.d4 = scr('be-diag-4', fitF('be-diag-4', { x: 40, y: 220, w: 1520, h: 480 }))
  r.d4t = tip('狀態碼那張太窄 → 請它改成橫的（看不懂就請它重畫）', { y: 806, size: 28, col: C.gold })
  const [e] = vsh(r, ['bc06-review-ask'])
  r.e1 = hl(r, e, 'msg', '直接講：哪張看不懂、期望怎樣', { col: C.gold, above: true, size: 26 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.a1)) },
  r => { swap(r.B, r.B[1]); only(r, r.b1) },
  r => { only(r); hide(r.bw.g); show([r.d1, r.dk]) },
  r => { hide([r.d1, r.dk]); show([r.d4, r.d4t]); later(3500, () => { hide(r.d4); show(r.S[0]); later(300, () => only(r, r.e1)) }) },
])

sc3(24, () => {
  const r = {}; hd(24, 'step3')
  const [a, b, c, d] = vsh(r, ['bc07-model-menu', 'bc07-go-typed', 'bc09-progress', 'bc09-next'])
  r.a1 = hl(r, a, 'sonnet', '開工前：換 Sonnet 5.5', { col: C.gold, below: true, size: 28 })
  r.b1 = hl(r, b, 'input', '還有題目就先答完 → 打「開工」→ 送出', { col: C.green, above: true, right: true, size: 26 })
  r.c1 = hl(r, c, 't9', '一項一項做，每項回報一行', { above: true, size: 26 })
  r.tea = box(L, 1080, 64, 400, 46, '實拍：約 7 分鐘', { size: 26, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.d1 = hl(r, d, 'rec', '下一步：選「我先驗收」', { col: C.green, below: true, size: 28 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
  r => { to(r, r.S[2]); only(r, r.c1); show(r.tea) },
  r => { to(r, r.S[3]); only(r, r.d1) },
])

sc3(25, () => {
  const r = {}; hd(25, 'step3 ・ 三路驗收')
  r.bw = bwin(['hbb-step3-verify'], HB + '#step3'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', '手冊 Step 3 驗收區：三路', { col: OR, below: true, size: 26 })
  const [a] = vsh(r, ['be03-dotnet-run'])
  r.k = cmdCard(120, 640, 1360, ['cd src\\CrudTemplate.Api', 'dotnet run --urls http://localhost:5080'], '在 my-equipment-api 的終端機：把你的 API 開起來', { size: 28 })
  r.a1 = hl(r, a, 'listen', 'Now listening on 5080', { col: C.green, below: true, size: 28 })
  r.sw = bwin(['be03-swagger', 'be03-swagger-get', 'be03-swagger-404'], 'localhost:5080/swagger'); r.SW = r.sw.S
  r.s1 = hl(r, r.SW[0], 'get', '裝備物資五條路由', { col: OR, above: true, size: 26 })
  r.g1 = hl(r, r.SW[1], 'code', '200', { col: C.green, right: true, size: 30 })
  r.g2 = hl(r, r.SW[1], 'body', '24 筆　·　新增／修改／刪除：只動你自己新增的那筆', { col: C.green, above: true, size: 24 })
  r.n1 = hl(r, r.SW[2], 'code', 'E-999：404', { col: C.red, right: true, size: 30 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)); later(3000, () => { only(r); hide(r.bw.g); show([r.S[0], r.k]); later(300, () => only(r, r.a1)) }) },
  r => { only(r); hide([r.S[0], r.k]); show(r.sw.g); show(r.SW[0]); later(300, () => only(r, r.s1)) },
  r => { swap(r.SW, r.SW[1]); only(r, r.g1, r.g2); later(4000, () => { swap(r.SW, r.SW[2]); only(r, r.n1) }) },
])

sc3(26, () => {
  const r = {}; hd(26, 'step3 ・ 三路驗收')
  const [a, b] = vsh(r, ['be03-dotnet-test', 'be03-psql'])
  r.a1 = hl(r, a, 'summary', '全綠：條數以你的任務清單為準（這次 94）', { col: C.green, above: true, size: 26 })
  r.b1 = hl(r, b, 'cmd', '庫名：ai_crud_equipment', { col: C.gold, above: true, size: 28 })
  r.b2 = hl(r, b, 'n', 'equipment_item：24 列', { col: C.green, right: true, size: 28 })
  r.warn = tip('範本的人員也是 24 筆：庫名打錯一樣看到 24，要看清楚', { y: 806, size: 28, col: C.coral })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1, r.b2) },
  r => { show(r.warn); glow(r.warn) },
])

sc3(27, () => {
  const r = {}; hd(27, 'step3')
  const [a, b, c, d] = vsh(r, ['bc11-fix1-ask', 'bc11-fix1-done', 'bc12-fix2-ask', 'bc12-fix2-done'])
  r.a1 = hl(r, a, 'msg', '看到：採購日期空字串回英文錯誤　期望：當沒填、繁中', { col: C.gold, above: true, size: 24 })
  r.how = tip('一次講一件：看到什麼 → 期望什麼 → 只改這個', { y: 806, size: 30, col: C.teal })
  r.b1 = hl(r, b, [100, 160, 925, 160], '改了程式：API 終端機 Ctrl+C → 重跑 dotnet run → 再試', { col: C.green, below: true, size: 26 })
  r.c1 = hl(r, c, 'msg', '對了再講下一件', { col: C.gold, above: true, size: 26 })
  r.pass = tip('全部沒問題：打「驗收通過」送出', { y: 806, size: 30, col: C.green })
  return r
}, [
  r => { show([r.S[0], r.how]); later(300, () => only(r, r.a1)) },
  r => { only(r, r.a1) },
  r => { hide(r.how); to(r, r.S[1]); only(r, r.b1); later(4000, () => { to(r, r.S[2]); only(r, r.c1) }) },
  r => { to(r, r.S[3]); only(r); show(r.pass); glow(r.pass) },
])

sc3(28, () => {
  const r = {}; hd(28, 'step3 ・ 檢查點')
  const items = ['AI 先問、你拍板', 'docs 四個檔', '你說「開工」才寫', '三路驗收都過', '小修講清楚']
  r.c = items.map((t, i) => box(L, 70 + i * 296, 150, 276, 140, '☑ ' + t, { size: 28, fill: C.card, stroke: C.green, color: C.ink, weight: 900 }))
  r.three = card(70, 320, 1460, 130, '三路驗收', ['Swagger 狀態碼對　·　測試全綠　·　psql 查得到 24 列'], C.teal, { size: 30, ts: 34 })
  r.stop = box(L, 70, 480, 1460, 110, '進 Step 4 之前：回 dotnet run 的終端機按 Ctrl+C', { size: 34, fill: '#3a1f1f', stroke: C.coral, color: C.ink, weight: 900 })
  r.twice = tip('同一件事講兩次還不好：換個說法重講', { y: 640, size: 30, col: C.coral })
  return r
}, [
  r => { stagger(r.c, 300, e => { show(e); glow(e) }) },
  r => { show(r.three) },
  r => { show(r.stop); glow(r.stop) },
  r => { show(r.twice); glow(r.twice) },
])

// ════════════════════════════ Step 4 ════════════════════════════
chapter('Step 4', 'LOOP＋對抗審查', C.violet)

sc3(29, () => {
  const r = {}; hd(29, 'step4')
  const [a, b] = vsh(r, ['hb0-explorer', 'bc20-empty'])
  r.a1 = hl(r, a, 'tree', '開回教材最外層的資料夾', { col: C.gold, lx: 380, size: 28 })
  r.b1 = tip('右上角加號開新對話：Sonnet 5.5、Auto', { y: 806, size: 30, col: C.gold })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r); show(r.b1) },
])

sc3(30, () => {
  const r = {}; hd(30, 'step4')
  r.bw = bwin(['hbb-step4-loop'], HB + '#step4'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', '手冊 Step 4 的 LOOP prompt：四行，反白複製', { col: OR, below: true, size: 26 })
  r.l1 = hl(r, r.B[0], [89, 110, 822, 30], '第一行：照 LOOP-規矩.md 做', { col: OR, below: true, size: 26 })
  r.rule = card(120, 200, 1360, 400, 'step4_loop_e2e/LOOP-規矩.md（給 AI 讀）', ['鐵律：修兩次沒好就停、不准改測試', '埠：5080／3199 被占就自己換', '審查：子代理先 HTTP 實打 API，再用 Playwright 截圖', '要交：LOOP-LOG、LOOP-REPORT、測試報告、文件同步'], C.violet, { size: 30, ts: 32, lh: 64 })
  const [b] = vsh(r, ['bc20-loop-msg'])
  r.b1 = hl(r, b, 'msg', '送出：接下來不用插手', { col: C.green, below: true, size: 28 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)) },
  r => { only(r, r.l1) },
  r => { only(r); hide(r.bw.g); show(r.rule); glow(r.rule) },
  r => { hide(r.rule); show(r.S[0]); later(300, () => only(r, r.b1)) },
])

sc3(31, () => {
  const r = {}; hd(31, 'step4')
  const [a, b] = vsh(r, ['bc21-ports', 'bc23-green'])
  r.a1 = hl(r, a, 'port', '先查埠：5080、3199 空著；5432 是 PostgreSQL', { col: C.green, below: true, size: 26 })
  r.e2e = tip('全鏈路：程式自己開瀏覽器，從畫面一路打到資料庫', { y: 806, size: 28, col: C.teal })
  r.b1 = hl(r, b, 'green', '第 1 輪就 6 條全綠', { col: C.green, below: true, size: 28 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { show(r.e2e) },
  r => { hide(r.e2e); to(r, r.S[1]); only(r, r.b1) },
])

sc3(32, () => {
  const r = {}; hd(32, 'step4')
  const [a, b, c] = vsh(r, ['bc23-agent', 'bc23-review', 'bc25-conclusion'])
  r.a1 = hl(r, a, 'agent', '子代理：AI 的分身，專門挑錯（Opus 5.5）', { col: C.gold, below: true, size: 26 })
  r.b1 = tip('先 HTTP 真的打 API，再用 Playwright 開瀏覽器截圖', { y: 806, size: 28, col: C.teal })
  r.c1 = hl(r, b, 'review', '挑到 10 條', { col: C.coral, below: true, size: 28 })
  r.c2 = hl(r, c, 'fixed', 'App 的問題：修完再跑', { col: C.green, below: true, size: 26 })
  r.c3 = hl(r, c, 'you', '動到你拍板的、測試本身的：列給你', { col: C.gold, above: true, size: 26 })
  r.tea = box(L, 1080, 64, 400, 46, '實拍：從貼上到報告約 22 分鐘', { size: 26, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.sleep = tip('電腦不要讓它睡眠；問要不要開 Chrome：選 No、跟它說繼續', { y: 806, size: 28, col: C.coral })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { show(r.b1) },
  r => { hide(r.b1); to(r, r.S[1]); only(r, r.c1); later(3000, () => { to(r, r.S[2]); only(r, r.c2, r.c3) }) },
  r => { show([r.tea, r.sleep]) },
])

sc3(33, () => {
  const r = {}; hd(33, 'step4 ・ 卡住時')
  r.a = card(70, 150, 715, 300, '6 條裡有幾條紅', ['正常：這就是 LOOP 的用途', '別插手，讓它自己修'], C.green, { size: 30, ts: 38, lh: 60 })
  r.b = card(815, 150, 715, 300, '腳本根本沒跑起來', ['PostgreSQL 沒開、瀏覽器下載失敗…', '環境問題：開新對話，貼錯誤給 AI'], C.coral, { size: 30, ts: 38, lh: 60 })
  r.c = box(L, 70, 490, 1460, 150, '它自己停下來：同一個問題修兩次還沒好\n這是規矩，代表該你介入了', { size: 34, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.a); glow(r.a) },
  r => { show(r.b); glow(r.b) },
  r => { show(r.c); glow(r.c) },
])

sc3(34, () => {
  const r = {}; hd(34, 'step4 ・ 驗收')
  r.k = cmdCard(120, 660, 1360, ['start step3_new_module\\my-equipment-api\\loop\\LOOP-REPORT.html'], '教材根目錄的終端機：用瀏覽器打開報告', { size: 26 })
  r.bw = bwin(['be-loop-report-top', 'be-loop-report-review', 'be-loop-report-decide'], 'my-equipment-api/loop/LOOP-REPORT.html'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], 'concl', '結論在最前面', { col: OR, below: true, size: 28 })
  r.b1 = hl(r, r.B[1], 'h', 'HTTP 實打的結果', { col: OR, below: true, size: 28 })
  r.c1 = hl(r, r.B[2], 'h', '要你裁決的：在同一個對話打「Q1 選 1、Q2 選 1…」', { col: OR, below: true, size: 26 })
  return r
}, [
  r => { show([r.bw.g, r.k]); show(r.B[0]); later(300, () => only(r, r.a1)) },
  r => { hide(r.k); swap(r.B, r.B[1]); only(r, r.b1) },
  r => { swap(r.B, r.B[2]); only(r, r.c1) },
])

sc3(35, () => {
  const r = {}; hd(35, 'step4 ・ 驗收')
  r.k = cmdCard(120, 680, 1360, ['start step4_loop_e2e\\e2e\\playwright-report\\index.html'], '教材根目錄的終端機：用瀏覽器打開測試報告', { size: 26 })
  r.bw = bwin(['be-pw-report', 'be-loop-log', 'be-srs-after'], 'step4_loop_e2e/e2e/playwright-report/index.html'); r.B = r.bw.S
  r.p1 = hl(r, r.B[0], [10, 60, 1220, 420], '6 條都是綠的，點得開', { col: C.green, below: true, size: 28 })
  r.l1 = hl(r, r.B[1], 'r1', 'LOOP-LOG：流水帳，有紅燈時才翻', { col: C.teal, below: true, size: 26 })
  r.s1 = hl(r, r.B[2], 'h', '「step4 LOOP 後」：程式改了，文件跟著改', { col: OR, below: true, size: 26 })
  r.f5 = scr('be-e2e-04-reload', fitF('be-e2e-04-reload', { x: 240, y: 120, w: 1120, h: 680 }))
  r.f5t = tip('自己點：新增一筆 → F5 → 還在　·　點完照報告的指令關掉兩個服務', { y: 816, size: 26, col: C.green })
  return r
}, [
  r => { show([r.bw.g, r.k]); show(r.B[0]); later(300, () => only(r, r.p1)) },
  r => { hide(r.k); burl(r.bw, 'my-equipment-api/loop/LOOP-LOG.md'); swap(r.B, r.B[1]); only(r, r.l1) },
  r => { burl(r.bw, 'docs/SRS-裝備物資API-delta.md'); swap(r.B, r.B[2]); only(r, r.s1) },
  r => { only(r); hide(r.bw.g); show([r.f5, r.f5t]) },
])

sc3(36, () => {
  const r = {}; hd(36, 'step4 ・ 檢查點')
  const items = ['6 條全綠（或報告寫清楚停在哪）', '子代理挑過錯', '報告、測試報告、流水紀錄', '文件標「step4 LOOP 後」', '自己點過：F5 還在']
  r.c = items.map((t, i) => box(L, 70, 140 + i * 92, 1460, 78, '☑ ' + t, { size: 30, fill: C.card, stroke: C.green, color: C.ink, weight: 800 }))
  r.iron = [['鐵律 1', '同一問題修兩次沒好就停', C.red], ['鐵律 2', '不准改測試、不准放寬標準', C.red]].map(([h, s, col], i) => card(70 + i * 745, 620, 715, 160, h, [s], col, { size: 30, ts: 36 }))
  return r
}, [
  r => { stagger(r.c.slice(0, 1), 100, e => { show(e); glow(e) }) },
  r => { stagger(r.c.slice(1, 4), 300, e => { show(e); glow(e) }) },
  r => { stagger(r.c.slice(4), 100, e => { show(e); glow(e) }) },
  r => { stagger(r.iron, 500) },
])

// ════════════════════════════ Step 5 ════════════════════════════
chapter('Step 5', '收尾', C.green)

sc3(37, () => {
  const r = {}; hd(37, 'step5')
  r.n = flowRow(170, [['寫一頁\nPRD', C.teal], ['起手\nprompt', C.gold], ['選擇題\n拍板', C.gold], ['看文件\n和圖', C.violet], ['說\n開工', C.pink], ['三路\n驗收', C.teal], ['LOOP\nprompt', C.violet], ['驗收\n報告', C.green]], { w: 170, gap: 14 })
  r.spec = tip('PRD 也叫 SPEC，可以很簡陋', { y: 330, size: 30, col: C.teal })
  r.tea = box(L, 70, 430, 1460, 140, 'LOOP 跑的時候，你可以去喝茶\n回來看報告、自己點一遍', { size: 38, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.two = [['頭', '講清楚要什麼、拍板', C.gold], ['尾', '驗收', C.green]].map(([h, s, col], i) => card(120 + i * 690, 610, 670, 160, h, [s], col, { size: 32, ts: 40 }))
  return r
}, [
  r => { stagger(r.n.slice(0, 1), 300); later(500, () => show(r.spec)) },
  r => { stagger(r.n.slice(1, 6), 300) },
  r => { stagger(r.n.slice(6), 300); later(600, () => { show(r.tea); glow(r.tea) }) },
  r => { stagger(r.two, 500) },
])

sc3(38, () => {
  const r = {}; hd(38, 'step5')
  r.three = [['1　帶走四份規矩', '改成公司的規則'], ['2　整理範本', '挑最成熟的 API'], ['3　新需求都走', '同一條路']].map(([h, s], i) => card(70 + i * 495, 140, 465, 200, h, [s], [C.teal, C.gold, C.violet][i], { size: 28, ts: 34 }))
  r.s6 = box(L, 70, 380, 1460, 160, '課後練習 Step 6\n把前端課問卷那行 TODO 變成真的 API', { size: 36, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 900 })
  r.bw = bwin(['hbb-checklist'], HB + '#done'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'h', '手冊最下面：完課檢核表，全部打勾', { col: OR, below: true, size: 26 })
  return r
}, [
  r => { stagger(r.three, 400) },
  r => { show(r.s6); glow(r.s6) },
  r => { hide([...r.three, r.s6]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)) },
])
