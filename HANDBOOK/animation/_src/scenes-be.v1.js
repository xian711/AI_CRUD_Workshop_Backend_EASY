// ============================================================
// AI CRUD 後端工作坊 EASY 版：手把手教學動畫（講課版）
// 講稿：tts-audition/script_be.py → window.__script；配音 → window.__audio
// 兩人分段：小芸（Sulafat）講方法和觀念，阿哲（Sadaltager）講實拍示範。指令只放在畫面字卡。
// 畫面：2026-10-07 在 Windows 11 實拍（VS Code 繁中介面＋Claude Code、PowerShell、Chrome／Swagger、psql）。
// Step 3 文件用 Opus 5.5 High、寫程式用 Sonnet 5.5；Step 4 審查子代理用 Opus 5.5。
// ============================================================
const OR = '#ff6a00'                        // 淺色網頁上的標註色
const FV = FR                                // VS Code 截圖：整張
function vsh(r, names, F = FV) { return shots(r, names, F) }
const RED = s => [[s, TC.err, 700]], GRN = s => [[s, TC.ok, 700]]
const BLUE = '#4da3ff'

// ════════════════════════════ 開場 ════════════════════════════
chapter('開場', '把假資料變真的', C.teal)

sc3(1, () => {
  const r = {}; hd(1, '開場')
  r.two = [['前端課：mock', '資料放在瀏覽器記憶體\n按 F5，剛新增的那筆就不見了', C.coral], ['這堂課：真後端', '資料寫進 PostgreSQL\nF5 之後還在，重開機也還在', C.teal]]
    .map(([h, s, col], i) => card(70 + i * 745, 150, 715, 300, h, s.split('\n'), col, { size: 32, ts: 44, lh: 60 }))
  r.pers = box(L, 70, 480, 1460, 90, '這叫「持久化」：資料真的被留下來', { size: 36, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 900 })
  r.cmp = box(L, 70, 600, 1460, 190, '比喻\n前端 mock＝白板，每按一次 F5 就擦回最初 24 筆\n這堂課＝記進帳本，寫了就留著', { size: 34, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 800 })
  const items = [['harness', '給規矩', C.gold], ['範本', '給骨架', C.teal], ['SDD', '先文件再程式', C.violet], ['LOOP＋對抗審查', '自己驗、另一個 AI 挑錯', C.coral]]
  r.cards = items.map(([a, b, col], i) => { const g = grp(L); const x = 70 + i * 372; R(g, x, 150, 344, 300, { fill: C.card, stroke: col, sw: 5 })
    T(g, x + 172, 280, a, { size: 42, anchor: 'middle', weight: 900, fill: col }); T(g, x + 172, 360, b, { size: 28, anchor: 'middle', fill: C.ink }); return g })
  r.same = box(L, 70, 520, 1460, 200, '方法跟前端課一模一樣\n只是這次做的是後端', { size: 44, fill: C.card, stroke: C.gold, color: C.ink, weight: 900 })
  return r
}, [
  r => { show(r.two[0]); glow(r.two[0]) },
  r => { show(r.two[1]); glow(r.two[1]); later(2500, () => show(r.pers)) },
  r => { show(r.cmp); glow(r.cmp) },
  r => { hide([...r.two, r.pers, r.cmp]); stagger(r.cards, 350); later(2200, () => { show(r.same); glow(r.same) }) },
])

sc3(2, () => {
  const r = {}; hd(2, '開場')
  r.nodes = flowRow(170, [['瀏覽器', C.teal], ['devProxy\n前端轉接站', C.teal], ['Controller\n收件、回狀態碼', C.violet], ['Service\n做真正的事', C.violet], ['EF Core\n物件翻成 SQL', C.pink], ['PostgreSQL\n資料表', C.coral]], { w: 225, gap: 22 })
  r.life = scr('be02-arch-life-svg', fitF('be02-arch-life-svg', { x: 70, y: 320, w: 1460, h: 480 }))
  r.src = tip('教材 step2 的 ARCHITECTURE_DB.html：① 請求的一生', { y: 806, size: 26, col: C.teal })
  r.fe = box(L, 70, 330, 760, 90, '前端課只做到「瀏覽器」這一格', { size: 30, fill: '#3a1f1f', stroke: C.coral, color: C.ink, weight: 800 })
  r.be = box(L, 770, 330, 760, 90, '這堂課把後面整段接起來', { size: 30, fill: '#173a3c', stroke: C.teal, color: C.ink, weight: 800 })
  r.real = tip('資料在資料庫查得到，才叫真的', { y: 806, size: 36, col: C.gold })
  return r
}, [
  r => { stagger(r.nodes.slice(0, 2), 400); later(1200, () => show([r.life, r.src])) },
  r => { stagger(r.nodes.slice(2, 4), 400); glow([r.nodes[2], r.nodes[3]]) },
  r => { stagger(r.nodes.slice(4), 400); glow([r.nodes[4], r.nodes[5]]) },
  r => { hide([r.life, r.src]); show(r.fe); glow(r.nodes[0]); later(2000, () => { show(r.be); glow(r.nodes.slice(1)) }); later(4500, () => { show(r.real); glow(r.real) }) },
])

sc3(3, () => {
  const r = {}; hd(3, '開場')
  const items = [['Step 0', '前置檢查 11 項', C.mut, 0], ['Step 1', '有規矩、沒規矩差在哪', C.coral, 0], ['Step 2', '玩範本 API', C.teal, 1], ['Step 3', 'SDD 做裝備物資後端', C.pink, 1], ['Step 4', 'LOOP 全鏈路＋對抗審查', C.violet, 1], ['Step 5', '總結、回公司', C.green, 0]]
  r.c = items.map(([a, b, col, key], i) => { const g = grp(L); const x = 70 + (i % 3) * 495, y = 130 + Math.floor(i / 3) * 270
    R(g, x, y, 465, 235, { fill: key ? '#203f5a' : C.card, stroke: col, sw: key ? 6 : 3 })
    T(g, x + 30, y + 70, a, { size: 40, weight: 900, fill: col }); T(g, x + 30, y + 150, b, { size: 32, weight: 800 })
    if (key) T(g, x + 435, y + 70, '重點', { size: 26, anchor: 'end', weight: 900, fill: C.gold }); return g })
  r.s6 = box(L, 70, 680, 1460, 80, '課後 Step 6：把前端課那行 TODO 變成真的問卷 API', { size: 30, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 800 })
  r.tip = tip('指令都在畫面上和手冊裡，照著貼；時間花在 AI 怎麼做事', { y: 830, size: 30, col: C.gold })
  return r
}, [
  r => stagger(r.c.slice(0, 3), 400),
  r => { stagger(r.c.slice(3), 400); later(2600, () => { show(r.s6); glow(r.s6) }) },
  r => { show(r.tip); glow(r.tip) },
])

// ════════════════════════════ Step 0 ════════════════════════════
chapter('Step 0', '前置檢查', C.gold)

sc3(4, () => {
  const r = {}; hd(4, 'step0')
  r.pre = card(120, 160, 1360, 440, '課前先裝好（手冊 Step 0 有清單）', ['.NET SDK 10　·　PostgreSQL 18（postgres／12345）', 'Node.js　·　pnpm', 'VS Code 裡的 AI 助手：Claude Code 擴充'], C.gold, { size: 34, ts: 40, lh: 74 })
  const [a] = vsh(r, ['be00-preflight'])
  r.k = cmdCard(120, 650, 1360, ['cd step0_course_intro', '.\\preflight.ps1'], '教材資料夾的終端機（11 項檢查）')
  r.a1 = hl(r, a, 'net', '', { col: C.green })
  r.a2 = hl(r, a, 'pg', '', { col: C.green })
  r.a3 = hl(r, a, 'login', '', { col: C.green })
  r.a4 = hl(r, a, 'port', '', { col: C.green })
  r.life = tip('命脈四項：.NET 版本・PostgreSQL 連得上・帳密登得進去・5080 埠空著', { y: 806, size: 28, col: C.green })
  r.a5 = hl(r, a, 'summary', '「可以開課」：過關（WARN 不算錯）', { col: C.green, above: true, size: 28 })
  r.p1 = hl(r, a, 'psql', 'WARN：psql 不在系統路徑', { col: C.gold, above: true, size: 26 })
  r.p2 = hl(r, a, 'psqlpath', '它自己找到了，完整路徑印在這，之後照抄', { col: C.gold, below: true, size: 26 })
  return r
}, [
  r => { show(r.pre); glow(r.pre) },
  r => { hide(r.pre); show([r.S[0], r.k]) },
  r => { hide(r.k); only(r, r.a1, r.a2, r.a3, r.a4); show(r.life); later(5200, () => { hide(r.life); only(r, r.a5) }) },
  r => { zoom(r.S[0], 'psqlpath', { pad: 120, max: 1.6 }); only(r, r.p1, r.p2) },
])

sc3(5, () => {
  const r = {}; hd(5, 'step0')
  r.red = box(L, 70, 130, 1460, 90, '後端課最常見的紅燈：PostgreSQL 沒啟動、帳密不對', { size: 34, fill: '#3a1f1f', stroke: C.red, color: C.ink, weight: 900 })
  r.k1 = cmdCard(70, 250, 1460, ['Get-Service postgresql*', 'Start-Service postgresql-x64-18'], '先看服務有沒有在跑，停著就啟動它（PowerShell）', { size: 30 })
  r.prompt = codeCard(70, 460, 1460, ['這是工作坊前置檢查 preflight.ps1 的完整輸出，我用 Windows 11。', '請說明每個 [FAIL] 的原因，給我可複製的修復指令；不要改工作坊的檔案。', '（把整份輸出貼在後面）'], { title: '還是紅：整段輸出貼給 AI（手冊 Step 0 的求救 prompt）', size: 28, col: C.coral })
  r.first = box(L, 70, 460, 1460, 170, '課前一天先跑一次 dotnet run 和 E2E\n第一次會下載東西，最花時間，別留到上課', { size: 34, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 800 })
  return r
}, [
  r => { show(r.red); glow(r.red); later(1800, () => { show(r.k1); glow(r.k1) }) },
  r => { show(r.prompt); glow(r.prompt) },
  r => { hide(r.prompt); show(r.first); glow(r.first) },
])

// ════════════════════════════ Step 1 ════════════════════════════
chapter('Step 1', '為什麼要給 AI 規矩', C.coral)

sc3(6, () => {
  const r = {}; hd(6, 'step1')
  r.bw = bwin(['be01-compare-side', 'be01-compare-top'], 'COMPARE.html'); r.B = r.bw.S
  r.l = hl(r, r.B[0], [22, 56, 589, 46], '沒給規矩', { col: C.coral, above: true, size: 28 })
  r.rr = hl(r, r.B[0], [629, 56, 589, 46], '有給規矩（harness）', { col: C.teal, above: true, size: 28 })
  r.ok = hl(r, r.B[0], [629, 205, 589, 110], '綠底：照你們規矩寫的地方（欄位名、繁中訊息）', { col: C.green, below: true, size: 24 })
  r.bad = hl(r, r.B[0], [22, 400, 589, 90], '紅：訊息英文、欄位叫 Category、Quantity——AI 自己決定的', { col: C.red, below: true, size: 24 })
  r.t1 = hl(r, r.B[1], 'table', '三項差異：回應形狀、id 和編碼、欄位名與訊息', { col: OR, above: true, size: 26 })
  r.cmp = box(L, 70, 130, 1460, 230, '比喻：請一個很厲害的木工做櫃子\n不給圖，他做得又快又好，但抽屜高度、把手樣式都是他定的\n跟你家其他櫃子搭不起來。規矩就是那張圖', { size: 34, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 800 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.l, r.rr)) },
  r => { only(r, r.ok) },
  r => { only(r, r.bad); later(3500, () => { swap(r.B, r.B[1]); only(r, r.t1) }) },
  r => { only(r); hide(r.bw.g); show(r.cmp); glow(r.cmp) },
])

sc3(7, () => {
  const r = {}; hd(7, 'step1')
  const rows = ['成功和查無一律用 ModelResult 包起來', '錯誤訊息一律繁體中文', '欄位名跟前端一模一樣', '取號要在交易裡做', 'Controller 薄、Service 厚、Common 不動']
  r.tbl = grp(L); R(r.tbl, 70, 120, 1460, 470, { fill: C.card, stroke: C.line, sw: 3 })
  T(r.tbl, 800, 168, '後端 harness 管的事', { size: 32, anchor: 'middle', weight: 900, fill: C.gold })
  r.rowG = rows.map((n, i) => { const g = grp(r.tbl, false); const y = 195 + i * 75; R(g, 90, y, 1420, 64, { fill: '#173a3c', rx: 10 })
    T(g, 120, y + 43, (i + 1) + '. ' + n, { size: 32, weight: 800 }); return g })
  r.two = [['管「怎麼寫」', 'harness', C.teal], ['不管「做多少」', 'id、編碼、範圍：Step 3 選擇題你拍板', C.gold]].map(([h, s, col], i) => card(120 + i * 690, 620, 670, 170, h, [s], col, { size: 30, ts: 40 }))
  return r
}, [
  r => { show(r.tbl); stagger(r.rowG, 300, glow) },
  r => { stagger(r.two, 500) },
])

// ════════════════════════════ Step 2 ════════════════════════════
chapter('Step 2', '範本 API 與 harness', C.teal)

sc3(8, () => {
  const r = {}; hd(8, 'step2')
  const [a, b, c] = vsh(r, ['be02-dotnet-run', 'be02-dotnet-test', 'be02-psql'])
  r.k = cmdCard(120, 660, 1360, ['cd step2_speedrun_kit\\2.5_sample_api\\sample-api\\src\\CrudTemplate.Api', 'dotnet run --urls http://localhost:5080'], '教材資料夾的終端機（Step 2 做完按 Ctrl+C 關掉）', { size: 24 })
  r.a1 = hl(r, a, 'insert', '第一次：自己建資料庫、灌 24 筆種子', { col: C.green, below: true, size: 26 })
  r.a2 = hl(r, a, 'listen', 'API 在 5080 埠聽', { col: C.green, right: true, size: 26 })
  r.bw = bwin(['be02-swagger', 'be02-swagger-get', 'be02-swagger-404'], 'localhost:5080/swagger'); r.B = r.bw.S
  r.s1 = hl(r, r.B[0], 'get', '查全部', { col: OR, right: true, size: 26 })
  r.s2 = hl(r, r.B[0], 'post', '新增', { col: OR, right: true, size: 26 })
  r.s3 = hl(r, r.B[0], 'del', '刪除', { col: OR, right: true, size: 26 })
  r.g1 = hl(r, r.B[1], 'code', '200', { col: C.green, right: true, size: 30 })
  r.g2 = hl(r, r.B[1], 'body', '24 筆，包在 success／message／data 裡', { col: C.green, above: true, size: 26 })
  r.n1 = hl(r, r.B[2], 'code', '查不到：404', { col: C.red, right: true, size: 30 })
  r.codes = flowRow(700, [['新增\n201', C.green], ['查不到\n404', C.coral], ['刪除\n204', C.teal], ['再刪一次\n404', C.coral]], { w: 300, gap: 40 })
  r.b1 = hl(r, b, 'summary', '49 條測試全綠', { col: C.green, above: true, size: 28 })
  r.c1 = hl(r, c, 'n', 'psql 直查資料表：24 筆', { col: C.green, right: true, size: 28 })
  r.k2 = cmdCard(70, 610, 1460, ['cd step2_speedrun_kit\\2.5_sample_api\\sample-api', 'dotnet test', '$env:PGPASSWORD=\'12345\'; & "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" -U postgres -h localhost -d ai_crud_template -c "SELECT count(*) FROM template_member;"'], '第二個終端機（右上角「＋」）', { size: 20 })
  r.three = tip('看完回第一個終端機按 Ctrl+C，把 5080 讓給 Step 3', { y: 830, size: 32, col: C.gold })
  return r
}, [
  r => { show([r.S[0], r.k]); later(2500, () => only(r, r.a1, r.a2)) },
  r => { hide([r.S[0], r.k]); only(r); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.s1, r.s2, r.s3)); later(5000, () => { swap(r.B, r.B[1]); only(r, r.g1, r.g2) }) },
  r => { swap(r.B, r.B[2]); only(r, r.n1); later(1500, () => { hide(r.bw.g); only(r); stagger(r.codes, 350) }) },
  r => { hide(r.codes); show([r.S[1], r.k2]); later(2600, () => { hide(r.k2); only(r, r.b1) }); later(4200, () => { to(r, r.S[2]); only(r, r.c1) }); later(7500, () => { show(r.three); glow(r.three) }) },
])

sc3(9, () => {
  const r = {}; hd(9, 'step2')
  const [a] = vsh(r, ['be02-harness-files'])
  r.a1 = hl(r, a, 'claude', 'CLAUDE.md：總綱（技術棧、程式規則、契約要點）', { lx: 560, col: C.gold, size: 24 })
  r.a2 = hl(r, a, 'rules', 'CODE-RULES-api：後端細則（分層、命名、驗證、測試）', { lx: 560, col: C.gold, size: 24, below: true })
  r.b1 = hl(r, a, 'contract', 'contract-conventions-summary：契約摘要（狀態碼、ModelResult、流水號）', { lx: 560, col: C.teal, size: 22, below: true })
  r.b2 = hl(r, a, 'guide', '使用說明：怎麼複製範本開新的 API 模組', { lx: 560, col: C.teal, size: 24 })
  r.who = [['寫給 AI 讀', '你不用逐條讀懂', C.teal], ['人負責確認', 'CLAUDE.md 只有四十幾行，掃一遍', C.gold]].map(([h, s, col], i) => card(120 + i * 690, 640, 670, 150, h, [s], col, { size: 28, ts: 36 }))
  r.warn = tip('規矩寫錯，AI 會照著錯', { y: 830, size: 34, col: C.coral })
  return r
}, [
  r => { show(r.S[0]); later(500, () => only(r, r.a1, r.a2)) },
  r => { only(r, r.b1, r.b2) },
  r => { only(r); stagger(r.who, 400); later(3000, () => { show(r.warn); glow(r.warn) }) },
])

sc3(10, () => {
  const r = {}; hd(10, 'step2')
  r.bw = bwin(['be02-arch-layers'], 'ARCHITECTURE_DB.html'); r.B = r.bw.S
  r.row = hl(r, r.B[0], [59, 174, 1122, 108], '依賴單向向右：Controller → Service → EF Core → PostgreSQL', { col: OR, above: true, size: 26 })
  r.ctl = hl(r, r.B[0], [59, 347, 545, 140], 'Controller 只做：呼叫 Service、對映狀態碼', { col: OR, below: true, size: 24 })
  r.svc = hl(r, r.B[0], [636, 347, 545, 140], 'Service 放商業邏輯：取號、產 id、查無回失敗', { col: OR, below: true, size: 24 })
  const rows = [['Controllers', '呼叫 Service、對映狀態碼', 1], ['Services', '商業邏輯', 1], ['Data', 'DbContext、種子、migration（施工單）', 2], ['Entities', '對應資料表', 1], ['Models', '對外的請求和回應，驗證寫在 Request', 1], ['Common', 'ModelResult、狀態碼分流、全域例外', 0]]
  r.tbl = grp(L); R(r.tbl, 70, 120, 1460, 560, { fill: C.card, stroke: C.line, sw: 3 })
  T(r.tbl, 800, 168, '範本的資料夾：一句話', { size: 32, anchor: 'middle', weight: 900, fill: C.gold })
  r.rowG = rows.map(([n, d, copy], i) => { const g = grp(r.tbl, false); const y = 195 + i * 76; R(g, 90, y, 1420, 64, { fill: copy === 1 ? '#173a3c' : '#3a2a14', rx: 10 })
    T(g, 120, y + 43, n, { size: 30, weight: 900, fill: copy === 1 ? C.teal : C.gold }); T(g, 400, y + 43, d, { size: 28 }); T(g, 1490, y + 43, copy === 1 ? '複製改名' : copy === 2 ? '只加不改' : '一個字都不動', { size: 28, anchor: 'end', weight: 900, fill: copy === 1 ? C.teal : C.gold }); return g })
  r.rule = box(L, 70, 700, 1460, 100, '跟實體長相有關的，複製改名；通用機制，直接共用', { size: 34, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.row)); later(3500, () => only(r, r.ctl, r.svc)) },
  r => { only(r); hide(r.bw.g); show(r.tbl); stagger(r.rowG.slice(2, 5), 350, glow) },
  r => { glow(r.rowG[5]) },
  r => { show(r.rule); glow(r.rule) },
])


// ════════════════════════════ Step 3 ════════════════════════════
chapter('Step 3', 'SDD：先文件，再程式', C.pink)

sc3(11, () => {
  const r = {}; hd(11, 'step3')
  r.head = box(L, 70, 130, 1460, 100, 'SDD＝規格驅動開發：先文件，再程式', { size: 44, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.nodes = flowRow(260, [['PRD\n寫需求', C.teal], ['選擇題\n你拍板', C.gold], ['SRS\n答應什麼', C.violet], ['設計文件\n＋圖', C.violet], ['任務\n清單', C.pink], ['程式\nAI 寫', C.coral]], { w: 220, gap: 25 })
  r.delta = box(L, 70, 420, 1460, 170, '這次的文件叫 delta：只寫「跟人員範本不同的地方」\n範本的 SRS 和設計文件是正本，一個字都不改', { size: 34, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 800 })
  r.cmp = box(L, 70, 620, 1460, 190, '比喻：社區裡已經有一棟樣品屋，現在照它再蓋一棟\n只寫跟樣品屋不一樣的地方；水電總管大家共用，不准動', { size: 34, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 800 })
  return r
}, [
  r => { show(r.head); glow(r.head); later(1500, () => stagger(r.nodes, 300)) },
  r => { show(r.delta); glow(r.delta) },
  r => { show(r.cmp); glow(r.cmp) },
])

sc3(12, () => {
  const r = {}; hd(12, 'step3')
  const [a, b] = vsh(r, ['be-prd-fields', 'be-prd-decisions'])
  r.a1 = hl(r, a, 'h', '契約：前端定好的欄位名，後端照做，一個都不能改', { below: true, size: 26 })
  r.a2 = hl(r, a, 'table', '13 欄：必填 6、選填 5、後端自己產 2（id、code）', { col: C.gold, below: true, size: 26 })
  r.b1 = hl(r, b, 'h', '第 5 節：六個決定留給你', { col: C.gold, below: true, size: 28 })
  r.six = tip('編碼誰產生・id 怎麼產・字典建不建表・硬刪或軟刪・分頁在哪做・採購日期能不能空', { y: 806, size: 26, col: C.gold })
  return r
}, [
  r => { show(r.S[0]); later(500, () => only(r, r.a1)) },
  r => { only(r, r.a2) },
  r => { to(r, r.S[1]); only(r, r.b1); later(3500, () => { show(r.six); glow(r.six) }) },
])

sc3(13, () => {
  const r = {}; hd(13, 'step3')
  const [a, b, c, d] = vsh(r, ['be03-copy', 'bc01-model-opus', 'bc02-prompt', 'bc03-reading'])
  r.a1 = hl(r, a, 'copy', '把範本複製成 my-equipment-api', { col: C.green, above: true, size: 26 })
  r.a2 = hl(r, a, 'cd', '進到專案資料夾；參考解不進工作區', { col: C.green, below: true, size: 26 })
  r.cp = tip('複製指令在手冊 step3，整段貼上，出現 >> 再按 Enter', { y: 806, size: 28, col: C.teal })
  r.b1 = hl(r, b, 'model', 'Opus 5.5 High：文件階段想得深', { col: C.gold, above: true, size: 26 })
  r.c1 = hl(r, c, 'input', '起手 prompt：只有 4 句，第一句就說走 SDD', { above: true, size: 28 })
  r.d1 = hl(r, d, [350, 190, 680, 100], '好幾行 Read：AI 在讀規矩和 PRD，先不寫程式', { below: true, size: 28 })
  return r
}, [
  r => { show([r.S[0], r.cp]); later(500, () => only(r, r.a1, r.a2)) },
  r => { hide(r.cp); to(r, r.S[1]); only(r, r.b1); later(4000, () => { to(r, r.S[2]); only(r, r.c1) }) },
  r => { to(r, r.S[3]); only(r, r.d1) },
])

sc3(14, () => {
  const r = {}; hd(14, 'step3')
  const [a, b, c, d] = vsh(r, ['bc04-q1', 'bc04-q3', 'bc05-q6', 'bc05-q7'])
  r.a1 = hl(r, a, 'rec', '每題都有「建議」＋一句理由', { col: C.green, below: true, size: 28 })
  r.a2 = hl(r, a, 'tab', '一次四題，分頁切換', { col: C.gold, above: true, size: 26 })
  r.pick = tip('先自己答，再對照講師發的課堂裁決（答案不在動畫裡）', { y: 806, size: 28, col: C.teal })
  r.b1 = hl(r, b, 'rec', '每個選項都寫了代價，看完理由再選', { col: C.green, below: true, size: 26 })
  r.c1 = hl(r, c, 'rec', '「建議」是 AI 的意見，拍板的是你', { col: C.green, below: true, size: 26 })
  r.d1 = hl(r, d, 'tab', 'PRD 沒寫的，AI 多問了 6 題（Q7～Q12）', { col: C.gold, above: true, size: 26 })
  r.d2 = hl(r, d, 'rec', '人員模組要保留嗎？保留，兩模組並存', { col: C.gold, below: true, size: 26 })
  r.rule = codeCard(70, 640, 1460, ['只在非問不可時才問人，用選擇題（2–4 選項、標建議）；不發明 PRD 沒寫的規則。'], { title: 'CLAUDE.md 寫的規矩（harness）', size: 30, col: C.gold })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1, r.a2)) },
  r => { zoom(r.S[0], 'rec', { pad: 120, max: 1.6 }); show(r.pick); later(3500, () => { unzoom(r.S[0]); to(r, r.S[1]); only(r, r.b1) }); later(6500, () => { to(r, r.S[2]); only(r, r.c1) }) },
  r => { hide(r.pick); to(r, r.S[3]); only(r, r.d1, r.d2); later(4500, () => { only(r); show(r.rule); glow(r.rule) }) },
])

sc3(15, () => {
  const r = {}; hd(15, 'step3')
  const [a, b, c] = vsh(r, ['bc06-docs', 'be-tasks', 'bc06-next'])
  r.a1 = hl(r, a, 'head', '四份文件完成，尚未動手寫程式', { col: C.green, below: true, size: 28 })
  r.b1 = hl(r, b, 'table', '14 個任務，程式一行都還沒寫', { col: C.green, above: true, size: 28 })
  r.c1 = hl(r, c, 'rec', 'AI 自己建議：你先看文件', { col: C.gold, below: true, size: 28 })
  r.chk = box(L, 120, 300, 1360, 260, '先別急著說開工\n打開 SRS-delta 核三段、看一眼圖，確認了才開工', { size: 44, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)); later(4500, () => { to(r, r.S[1]); only(r, r.b1) }) },
  r => { to(r, r.S[2]); only(r, r.c1); later(3000, () => { only(r); hide(r.S); show(r.chk); glow(r.chk) }) },
])


sc3(16, () => {
  const r = {}; hd(16, 'step3 ・ SRS-delta')
  r.bw = bwin(['be-srs-decisions', 'be-srs-decisions2', 'be-srs-trace', 'be-srs-scope'], 'docs/SRS-裝備物資API-delta.md'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], [29, 96, 994, 450], 'Q1～Q12：裁決、理由、誰拍板', { col: OR, above: true, size: 28 })
  r.a2 = hl(r, r.B[0], [1188, 96, 40, 450], '課堂講師', { col: C.gold, below: true, right: true, size: 26 })
  r.a3 = hl(r, r.B[1], 'q7', '追加題也一題一列', { col: OR, above: true, size: 26 })
  r.b1 = hl(r, r.B[2], 'h', '需求追溯：13 欄每一欄做在哪一層、怎麼驗', { col: OR, below: true, size: 26 })
  r.d1 = hl(r, r.B[3], 'h32', '這一輪決定不做的', { col: OR, below: true, size: 28 })
  r.pm = [['1. 已拍板決策', '答應了哪些取捨'], ['2. 需求追溯', '每個需求做在哪'], ['3. 範圍外', '這一版不做什麼']].map(([h, s], i) => card(70 + i * 495, 300, 465, 220, '★ ' + h, [s], C.gold, { size: 30, ts: 34 }))
  r.pmt = box(L, 70, 600, 1460, 120, '標星號的三段 PM 必核：不用看 C#，看這三段就知道它答應了什麼', { size: 32, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.a1, r.a2)); later(5500, () => { swap(r.B, r.B[1]); only(r, r.a3) }) },
  r => { swap(r.B, r.B[2]); only(r, r.b1); later(4500, () => { swap(r.B, r.B[3]); only(r, r.d1) }) },
  r => { only(r); hide(r.bw.g); stagger(r.pm, 350); later(1200, () => show(r.pmt)) },
])

sc3(17, () => {
  const r = {}; hd(17, 'step3 ・ 設計文件＋圖')
  r.bw = bwin(['be-design-files', 'be-design-evidence'], 'docs/DESIGN-裝備物資API-delta.md'); r.B = r.bw.S
  r.a1 = hl(r, r.B[0], 'h', '檔案責任：哪一層新增哪些檔', { col: OR, below: true, size: 28 })
  r.a2 = hl(r, r.B[0], [748, 100, 145, 520], '新增／只加不改', { col: OR, above: true, size: 26 })
  r.c1 = hl(r, r.B[1], 'h', '遵守 harness 的證據', { col: OR, below: true, size: 30 })
  r.c2 = hl(r, r.B[1], 'table', '', { col: OR })
  r.d1 = scr('be-diag-1b', fitF('be-diag-1b', { x: 40, y: 120, w: 1520, h: 680 }))
  r.d1t = tip('① 分層架構：綠＝新增、黃＝只加不改、灰虛線＝共用不動', { y: 816, size: 28, col: C.teal })
  r.d2 = scr('be-diag-2', fitF('be-diag-2', { x: 40, y: 120, w: 1520, h: 680 }))
  r.d2t = tip('② 資料表 ER 圖：equipment_item 一張表、唯一索引、SEQUENCE', { y: 816, size: 28, col: C.teal })
  r.d3 = scr('be-diag-3a', fitF('be-diag-3a', { x: 40, y: 120, w: 1520, h: 680 }))
  r.d3t = tip('③ 新增品項：驗證失敗回 400；通過後在同一個交易裡取 id、算編碼', { y: 816, size: 28, col: C.teal })
  r.d4 = scr('be-diag-4', fitF('be-diag-4', { x: 40, y: 220, w: 1520, h: 480 }))
  r.d4t = tip('④ 狀態碼矩陣：五條路由各回哪些狀態碼', { y: 816, size: 28, col: C.teal })
  r.ev = tip('看圖就知道請求怎麼走、資料表長什麼樣、哪種情況回哪個狀態碼——不用讀程式', { y: 816, size: 28, col: C.gold })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.a1, r.a2)) },
  r => { swap(r.B, r.B[1]); only(r, r.c1, r.c2) },
  r => { only(r); hide(r.bw.g); show([r.d1, r.d1t]); later(4200, () => { hide([r.d1, r.d1t]); show([r.d2, r.d2t]) }) },
  r => { hide([r.d2, r.d2t]); show([r.d3, r.d3t]); later(4800, () => { hide([r.d3, r.d3t]); show([r.d4, r.d4t]) }); later(9000, () => { hide(r.d4t); show(r.ev); glow(r.ev) }) },
])


sc3(18, () => {
  const r = {}; hd(18, 'step3')
  const [a, b, c, d] = vsh(r, ['bc07-model-menu', 'bc07-go-typed', 'bc09-progress', 'bc10-summary'])
  r.a1 = hl(r, a, 'sonnet', '寫程式改用 Sonnet 5.5', { col: C.gold, below: true, size: 28 })
  r.b1 = hl(r, b, 'model', 'Sonnet 5.5 High', { col: C.gold, above: true, size: 26 })
  r.b2 = hl(r, b, 'input', '說「開工」', { col: C.green, above: true, right: true, size: 26 })
  r.c1 = hl(r, c, 't9', '一項一項做，自己跑起來驗', { above: true, size: 26 })
  r.c2 = hl(r, c, 't11', '94 條一次全綠', { col: C.green, below: true, size: 26 })
  r.d1 = hl(r, d, 'tests', '五行總結：94 條全綠、build 0 警告', { col: C.green, above: true, size: 26 })
  r.d2 = hl(r, d, 'docs', '文件也對齊了', { col: C.green, below: true, size: 26 })
  r.time = box(L, 1080, 64, 400, 46, '這次實拍：約 7 分鐘', { size: 24, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.cheap = tip('有規矩和範本，寫程式用便宜的就夠', { y: 806, size: 30, col: C.gold })
  r.order = tip('Entity → migration → DTO → 對映 → Service → Controller → 種子 → 測試', { y: 806, size: 28, col: C.teal })
  return r
}, [
  r => { show([r.S[0], r.cheap]); later(400, () => only(r, r.a1)); later(4000, () => { to(r, r.S[1]); only(r, r.b1, r.b2) }) },
  r => { hide(r.cheap); to(r, r.S[2]); only(r, r.c1, r.c2); show([r.time, r.order]) },
  r => { hide(r.order); to(r, r.S[3]); only(r, r.d1, r.d2) },
])

sc3(19, () => {
  const r = {}; hd(19, 'step3 ・ 三路驗收')
  r.three = [['① Swagger', '五條路由，狀態碼要對', C.teal], ['② dotnet test', '全綠', C.green], ['③ psql', '直查資料表 24 列', C.gold]].map(([h, s, col], i) => card(70 + i * 495, 300, 465, 220, h, [s], col, { size: 30, ts: 42 }))
  r.bw = bwin(['be03-swagger', 'be03-swagger-get', 'be03-swagger-404'], 'localhost:5080/swagger'); r.B = r.bw.S
  r.s1 = hl(r, r.B[0], 'get', '裝備物資五條路由', { col: OR, above: true, size: 26 })
  r.g1 = hl(r, r.B[1], 'code', '200', { col: C.green, right: true, size: 30 })
  r.g2 = hl(r, r.B[1], 'body', 'E-001、IT-LAP-001：跟前端的種子一樣', { col: C.green, above: true, size: 26 })
  r.n1 = hl(r, r.B[2], 'code', 'E-999：404', { col: C.red, right: true, size: 30 })
  const [t, p] = vsh(r, ['be03-dotnet-test', 'be03-psql'])
  r.t1 = hl(r, t, 'summary', '94 條全綠', { col: C.green, above: true, size: 28 })
  r.p1 = hl(r, p, 'n', 'equipment_item：24 列', { col: C.green, right: true, size: 28 })
  r.real = tip('資料真的在資料庫裡：這是跟前端課最大的差別', { y: 830, size: 32, col: C.gold })
  r.run = cmdCard(120, 560, 1360, ['cd src\\CrudTemplate.Api', 'dotnet run --urls http://localhost:5080'], '在 my-equipment-api 開終端機：把你自己的 API 開起來', { size: 26 })
  r.db = tip('庫名是 ai_crud_equipment（範本的人員也是 24 筆，打錯庫名一樣看到 24）', { y: 830, size: 26, col: C.coral })
  return r
}, [
  r => { stagger(r.three, 400); later(1800, () => { show(r.run); glow(r.run) }) },
  r => { hide([...r.three, r.run]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.s1)); later(3000, () => { swap(r.B, r.B[1]); only(r, r.g1, r.g2) }); later(6500, () => { swap(r.B, r.B[2]); only(r, r.n1) }); later(9000, () => { hide(r.bw.g); only(r); show(r.S[0]); later(300, () => only(r, r.t1)) }) },
  r => { to(r, r.S[1]); only(r, r.p1); later(2500, () => { show(r.db); glow(r.db) }) },
])

sc3(20, () => {
  const r = {}; hd(20, 'step3')
  const [a, b, c, d] = vsh(r, ['bc11-fix1-ask', 'bc11-fix1-done', 'bc12-fix2-ask', 'bc12-fix2-done'])
  r.a1 = hl(r, a, 'msg', '小落差 1：採購日期送空字串，回英文錯誤', { col: C.gold, above: true, size: 26 })
  r.b1 = hl(r, b, [100, 160, 925, 160], 'AI 改一次：空字串當沒填，錯誤改繁中', { col: C.green, below: true, size: 26 })
  r.c1 = hl(r, c, 'msg', '小落差 2：空表單，分類和狀態各報兩條錯', { col: C.gold, above: true, size: 26 })
  r.d1 = hl(r, d, [100, 160, 925, 120], 'AI 再改一次，測試補上、文件也跟著改', { col: C.green, below: true, size: 26 })
  r.how = tip('一次講一件：看到什麼、期望什麼、只改這個', { y: 806, size: 32, col: C.teal })
  r.pain = box(L, 120, 300, 1360, 260, '問題不大，但你得坐在電腦前面陪它\n這段來回，就是 Step 4 要交出去的事', { size: 42, fill: '#3a1f1f', stroke: C.coral, color: C.ink, weight: 900 })
  return r
}, [
  r => { show(r.S[0]); later(300, () => only(r, r.a1)); later(4500, () => { to(r, r.S[1]); only(r, r.b1) }); later(8000, () => { to(r, r.S[2]); only(r, r.c1) }) },
  r => { to(r, r.S[3]); only(r, r.d1); show(r.how) },
  r => { only(r); hide([...r.S, r.how]); show(r.pain); glow(r.pain) },
])

// ════════════════════════════ Step 4 ════════════════════════════
chapter('Step 4', 'LOOP＋對抗審查', C.violet)


sc3(21, () => {
  const r = {}; hd(21, 'step4')
  r.left = card(70, 140, 700, 300, '一問一答', ['看到什麼、期望什麼，一次講一件', '主管手把手帶新人', '時間全耗在教'], C.coral, { size: 30, ts: 40, lh: 60 })
  r.right = card(830, 140, 700, 300, '換個做法', ['規矩寫在 harness', '示範放在範本', '驗收標準寫成自動測試'], C.teal, { size: 30, ts: 40, lh: 60 })
  r.e2e = box(L, 70, 470, 1460, 150, '驗收標準＝6 條全鏈路 E2E 測試（教材已寫好）\n全鏈路：程式自己開瀏覽器，從畫面一路打到後端和資料庫', { size: 32, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 800 })
  r.adv = box(L, 70, 650, 1460, 160, '再找另一個 AI，取代你「來回要 AI 修」的角色\n它只負責找碴、不准誇獎 → 對抗審查', { size: 36, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.left); glow(r.left); later(2500, () => { show(r.right); glow(r.right) }) },
  r => { show(r.e2e); glow(r.e2e) },
  r => { show(r.adv); glow(r.adv) },
])

sc3(22, () => {
  const r = {}; hd(22, 'step4')
  r.loop = flowRow(140, [['改程式', C.teal], ['跑 6 條測試', C.violet], ['有紅：再改', C.coral], ['全綠：停', C.green]], { w: 330, gap: 30 })
  const tests = [['E1', '清單載入：共 24 筆，資料來自 PostgreSQL'], ['E2', '新增後 reload，那一筆還在'], ['E3', '新增後編碼格式：類別2碼-項目3碼-流水3碼'], ['E4', '編輯後 reload，新值還在'], ['E5', '刪除後 reload，那一筆真的消失'], ['E6', '直打 API：前端新增的出現在後端 GET']]
  r.tbl = grp(L); R(r.tbl, 70, 290, 1460, 490, { fill: C.card, stroke: C.line, sw: 3 })
  r.rows = tests.map(([k, t], i) => { const g = grp(r.tbl, false); const y = 310 + i * 76; R(g, 90, y, 1420, 64, { fill: /reload/.test(t) ? '#173a3c' : '#1c2f4a', rx: 10 })
    T(g, 120, y + 43, k, { size: 30, weight: 900, fill: C.teal }); T(g, 200, y + 43, t, { size: 28 }); return g })
  r.stone = tip('reload 是試金石：mock 會掉回種子，真的落庫才會留下', { y: 806, size: 30, col: C.gold })
  r.iron = [['鐵律 1', '不准改測試、不准放寬標準', C.red], ['鐵律 2', '同一個問題修兩次沒好，停下回報', C.red]].map(([h, s, col], i) => card(70 + i * 745, 290, 715, 170, h, [s], col, { size: 30, ts: 38 }))
  r.file = card(70, 490, 1460, 300, 'step4_loop_e2e/LOOP-規矩.md（給 AI 讀，也是 harness 的一份）', ['鐵律、埠不寫死、審查怎麼做', '要交四樣：LOOP-LOG.md、LOOP-REPORT.html、測試報告、文件標「step4 LOOP 後」', 'prompt 只要說「照規矩做」'], C.violet, { size: 30, ts: 32, lh: 62 })
  return r
}, [
  r => { stagger(r.loop, 350) },
  r => { show(r.tbl); stagger(r.rows, 250, glow); later(2500, () => { show(r.stone); glow(r.stone) }) },
  r => { hide([r.tbl, r.stone]); stagger(r.iron, 500) },
  r => { show(r.file); glow(r.file) },
])



sc3(23, () => {
  const r = {}; hd(23, 'step4')
  const [a, b, c] = vsh(r, ['bc20-loop-msg', 'bc21-ports', 'bc23-green'])
  r.a1 = hl(r, a, 'msg', 'LOOP prompt：四句，第一句「照 LOOP-規矩.md 做」', { above: false, below: true, size: 26 })
  r.a2 = hl(r, a, [554, 516, 100, 18], 'Sonnet 5.5', { col: C.gold, above: true, size: 24 })
  r.open = tip('回到最外層的教材資料夾，開新對話；右下角確認是 Auto，才不會每步都停下來問', { y: 806, size: 28, col: C.teal })
  r.b1 = hl(r, b, 'port', '先查埠：5080、3199 空著；PostgreSQL 在 5432 跑著', { col: C.green, below: true, size: 26 })
  r.b2 = tip('跑測試前先停你的 API → run-e2e 暫開連測試庫的 API → 跑完再開回來；前端沿用', { y: 806, size: 28, col: C.teal })
  r.c1 = hl(r, c, 'green', '第 1 輪就 6 條全綠', { col: C.green, below: true, size: 28 })
  r.why = tip('全綠只代表這 6 條沒抓到問題；接下來的對抗審查才是重點', { y: 806, size: 28, col: C.gold })
  return r
}, [
  r => { show([r.S[0], r.open]); later(400, () => only(r, r.a1, r.a2)) },
  r => { hide(r.open); to(r, r.S[1]); only(r, r.b1); show(r.b2) },
  r => { hide(r.b2); to(r, r.S[2]); only(r, r.c1); show(r.why) },
])

sc3(24, () => {
  const r = {}; hd(24, 'step4')
  const [a] = vsh(r, ['bc23-agent'])
  r.a1 = hl(r, a, 'agent', '子代理：AI 再開的分身，專門挑錯（Opus 5.5，高一級）', { col: C.gold, below: true, size: 26 })
  r.a2 = hl(r, a, [370, 258, 660, 105], '「只挑錯，不誇獎」', { col: C.coral, below: true, size: 26 })
  r.bw = bwin(['be-loop-report-review', 'be-rv-01-list', 'be-rv-03-reload'], 'loop/LOOP-REPORT.html'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], [70, 190, 700, 32], '第一段：HTTP 真的打 API，共 83 項', { col: OR, below: true, size: 26 })
  r.pw = scr('be-rv-01-list', fitF('be-rv-01-list', { x: 240, y: 120, w: 1120, h: 680 }))
  r.pwt = tip('第二段：Playwright 開瀏覽器，一頁一頁截圖對照契約', { y: 816, size: 28, col: C.teal })
  r.time = box(L, 1080, 64, 400, 46, '從貼上到交報告：約 22 分鐘', { size: 24, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.hands = tip('中間沒有人插手', { y: 816, size: 34, col: C.gold })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)); later(3500, () => only(r, r.a2)) },
  r => { only(r); hide(r.S[0]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)); later(4500, () => { only(r); hide(r.bw.g); show([r.pw, r.pwt]) }) },
  r => { hide(r.pwt); show([r.time, r.hands]); glow(r.time) },
])

sc3(25, () => {
  const r = {}; hd(25, 'step4')
  const [a, b, c] = vsh(r, ['bc23-review', 'bc25-fixed', 'bc25-conclusion'])
  r.a1 = hl(r, a, 'review', '審查回來：5 條 App 問題、5 條測試問題', { col: C.coral, below: true, size: 26 })
  r.b1 = hl(r, b, 'lock', '同前綴同時新增：20 筆有 9 筆 500 → 它自己加了鎖（動到 Q1，該先問你）', { col: C.coral, below: true, size: 24 })
  r.b2 = hl(r, b, 'r2', '第 2 輪也全綠', { col: C.green, below: true, size: 26 })
  r.c1 = hl(r, c, 'you', '報告第 7 節：4 題選擇題交你裁決（沒修的 500、假綠…）', { col: C.gold, above: true, size: 26 })
  r.exam = tip('寫程式的 AI 審自己＝學生自己改考卷 → 換一個程度更高的來改', { y: 806, size: 28, col: C.gold })
  return r
}, [
  r => { show(r.S[0]); later(300, () => only(r, r.a1)); later(4000, () => { to(r, r.S[1]); only(r, r.b1) }); later(9000, () => only(r, r.b2)) },
  r => { to(r, r.S[2]); only(r, r.c1); later(3500, () => { show(r.exam); glow(r.exam) }) },
])

sc3(26, () => {
  const r = {}; hd(26, 'step4 ・ 四樣產出')
  r.bw = bwin(['be-loop-log', 'be-loop-report-top', 'be-pw-report'], 'my-equipment-api/loop/LOOP-LOG.md'); r.B = r.bw.S
  r.l1 = hl(r, r.B[0], 'r1', '流水紀錄：一輪一段，給機器看', { col: C.teal, below: true, size: 26 })
  r.t1 = hl(r, r.B[1], [70, 175, 870, 90], '結論在最前面：給人看', { col: OR, below: true, size: 26 })
  r.p1 = hl(r, r.B[2], [10, 60, 1220, 420], '測試報告：6 條，點得開', { col: OR, below: true, size: 26 })
  r.f5 = scr('be-e2e-04-reload', fitF('be-e2e-04-reload', { x: 240, y: 120, w: 1120, h: 680 }))
  r.f5t = tip('E2 按 F5 之後：搜尋剛新增的 PW-GEN-003，還找得到 → 持久化的鐵證', { y: 816, size: 30, col: C.green })
  r.you = box(L, 120, 280, 1360, 300, '看完報告，照報告上的網址自己點一遍：新增一筆、F5、還在\n第 7 節的選擇題，在同一個對話回給它\n最後照報告的指令，把兩個服務關掉', { size: 42, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.l1)); later(4000, () => { burl(r.bw, 'my-equipment-api/loop/LOOP-REPORT.html'); swap(r.B, r.B[1]); only(r, r.t1) }) },
  r => { burl(r.bw, 'step4_loop_e2e/e2e/playwright-report/index.html'); swap(r.B, r.B[2]); only(r, r.p1) },
  r => { only(r); hide(r.bw.g); show([r.f5, r.f5t]) },
  r => { hide([r.f5, r.f5t]); show(r.you); glow(r.you) },
])

sc3(27, () => {
  const r = {}; hd(27, 'step4')
  r.bw = bwin(['be-srs-after', 'be-design-after', 'be-loop-report-sync'], 'docs/SRS-裝備物資API-delta.md'); r.B = r.bw.S
  r.s1 = hl(r, r.B[0], 'h', '「step4 LOOP 後」：改了什麼、待你裁決的', { col: OR, below: true, size: 26 })
  r.d1 = hl(r, r.B[1], 'ver', '設計文件版本也跟著升', { col: OR, below: true, size: 26 })
  r.menu = box(L, 120, 300, 1360, 260, '菜改了，菜單跟著改\n下一個人接手，看文件就知道現在的 API 長什麼樣子', { size: 38, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 900 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.s1)); later(5000, () => { burl(r.bw, 'docs/DESIGN-裝備物資API-delta.md'); swap(r.B, r.B[1]); only(r, r.d1) }) },
  r => { only(r); hide(r.bw.g); show(r.menu); glow(r.menu) },
])

sc3(28, () => {
  const r = {}; hd(28, 'step4')
  r.g = [['規格 Gate', ['六題裁決', 'SRS-delta、設計文件-delta 各四段', '四張圖、任務清單'], C.violet], ['程式 Gate', ['build 零警告', '測試全綠', 'Swagger 狀態碼、psql 查得到資料'], C.teal], ['交付 Gate', ['LOOP 報告、流水紀錄', '測試報告 6 比 6、被測的是你的作品', '文件標「step4 LOOP 後」'], C.gold]]
    .map(([h, ls, col], i) => card(70 + i * 495, 150, 465, 400, h, ls, col, { size: 27, ts: 40, lh: 64 }))
  r.pr = box(L, 70, 620, 1460, 150, '這三道，回公司直接當 PR 檢查表', { size: 42, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.g[0]); glow(r.g[0]) },
  r => { show(r.g[1]); glow(r.g[1]) },
  r => { show(r.g[2]); glow(r.g[2]); later(2500, () => { show(r.pr); glow(r.pr) }) },
])

// ════════════════════════════ Step 5 ════════════════════════════
chapter('Step 5', '回公司怎麼用', C.green)

sc3(29, () => {
  const r = {}; hd(29, 'step5')
  r.three = [['1　帶走 harness 四件', '改成公司規則'], ['2　整理範本', '最成熟的 API，分複製區和共用區'], ['3　新需求都走', 'SDD＋LOOP']].map(([h, s], i) => card(70 + i * 495, 140, 465, 220, h, [s], [C.teal, C.gold, C.violet][i], { size: 28, ts: 34, lh: 50 }))
  r.honest = card(70, 400, 1460, 300, '誠實講：今天的成果不是可以上線的版本', ['編碼併發（加鎖或重試）　·　帳密認證　·　資料量　·　harness 不管範圍', '這四條回公司要補', '測試全綠 ≠ 可上線'], C.coral, { size: 32, ts: 36, lh: 66 })
  r.lang = box(L, 70, 400, 1460, 300, '方法不綁語言：四件換成你們技術棧的規則，流程一樣能用\n\n課後練習 Step 6：把前端課那行 TODO 變成真的問卷 API', { size: 34, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 800 })
  return r
}, [
  r => stagger(r.three, 500),
  r => { show(r.honest); glow(r.honest) },
  r => { hide(r.honest); show(r.lang); glow(r.lang) },
])

sc3(30, () => {
  const r = {}; hd(30, 'step5')
  r.l = ['一、後端服從前端的契約，欄位名一個都不改', '二、SDD 先文件再程式，delta 只寫不同的地方', '三、LOOP 跑全鏈路，F5 還在才叫真的', '四、最後由你拍板、由你驗收'].map((t, i) => box(L, 70, 150 + i * 165, 1460, 130, t, { size: 42, fill: C.card, stroke: [C.teal, C.violet, C.green, C.gold][i], color: C.ink, weight: 900 }))
  return r
}, [
  r => { show(r.l[0]); glow(r.l[0]) },
  r => { show(r.l[1]); glow(r.l[1]) },
  r => { show(r.l[2]); glow(r.l[2]) },
  r => { show(r.l[3]); glow(r.l[3]) },
])
