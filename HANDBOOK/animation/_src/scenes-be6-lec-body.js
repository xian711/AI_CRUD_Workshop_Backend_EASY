// ============================================================
// AI CRUD 後端工作坊 EASY 版：講課版動畫 第六版（2026-10-12）
// 講稿：tts-audition/script_be.py → window.__script；配音 → window.__audio（預錄 mp3）
// 兩人分段：小芸講方法和觀念，阿哲講實拍示範。指令只放在畫面字卡。
// 畫面：開場～Step 2 沿用 2026-10-07 實拍；Step 3～4 換成 2026-10-11 第六版實拍（bv6-*）與手冊的圖（h6-*）；
//       回報前端修 fullchain-app 是 2026-10-12 實拍（bv7-*、fe7-*）。由 mk-be6.py 組裝（//@OLD 段沿用第一版 scenes-be.v1.js）。
// ============================================================
const OR = '#ff6a00'                        // 淺色網頁上的標註色
const FV = FR                                // VS Code 截圖：整張
function vsh(r, names, F = FV) { return shots(r, names, F) }
const RED = s => [[s, TC.err, 700]], GRN = s => [[s, TC.ok, 700]]
const BLUE = '#4da3ff'
const HB = 'HANDBOOK.html'
const REP = 'my-equipment-api/loop/LOOP-REPORT.html'
const DG = 'docs/DIAGRAMS-裝備物資API.html'
function pic(name, A = { x: 70, y: 116, w: 1460, h: 680 }) { return scr(name, fitF(name, A)) }
function pwin(name, url, A = { x: 70, y: 112, w: 1460, h: 690 }) {
  const m = META[name], bar = 64, k = Math.min(A.w / m.w, (A.h - bar) / m.h)
  const w = Math.round(m.w * k), h = Math.round(m.h * k)
  return bwin([name], url, { x: A.x + (A.w - w) / 2, y: A.y, w, h: h + bar, bar })
}
function bwHead(name, url) { const m = META[name]; const h = Math.round(1360 * m.h / m.w) + 64; return bwin([name], url, { x: 120, y: 200, w: 1360, h, bar: 64 }) }
function baShow(r, g, bf, af, o = {}) {
  only(r, bf, af)
  later(o.t1 ?? 2600, () => { only(r); zoom(g, o.zb, { pad: 14, max: o.max ?? 2 }) })
  later(o.t2 ?? 6200, () => zoom(g, o.za, { pad: 14, max: o.max ?? 2 }))
}

// ════════════════════════════ 開場 ════════════════════════════
chapter('開場', '把假資料變真的', C.teal)

//@OLD 1 1

// 第 2 段（2026-10-13 改）：上方方塊分成三個虛線框（前端／後端 API／資料庫），教材圖也加了同樣的框
sc3(2, () => {
  const r = {}; hd(2, '開場')
  const fr = (x, w, label, col) => { const g = grp(L); R(g, x, 156, w, 148, { fill: 'none', stroke: col, sw: 3, dash: '12 8', rx: 18 }); T(g, x + 12, 146, label, { size: 24, weight: 900, fill: col }); return g }
  r.feF = fr(62, 487, '前端（Nuxt 程式）', C.teal)
  r.apiF = fr(557, 733, '後端 API（.NET 程式，埠 5080）：這三格合起來', C.violet)
  r.dbF = fr(1298, 239, '資料庫', C.coral)
  r.nodes = flowRow(170, [['瀏覽器', C.teal], ['devProxy\n前端轉接站', C.teal], ['Controller\n收件、回狀態碼', C.violet], ['Service\n做真正的事', C.violet], ['EF Core\n物件翻成 SQL', C.violet], ['PostgreSQL\n資料表', C.coral]], { w: 225, gap: 22 })
  r.life = scr('be02-arch-life-svg', fitF('be02-arch-life-svg', { x: 70, y: 320, w: 1460, h: 480 }))
  r.src = tip('教材 step2 的 ARCHITECTURE_DB.html：① 請求的一生', { y: 806, size: 26, col: C.teal })
  r.fe = box(L, 62, 340, 487, 130, '前端課\n做的是這兩格', { size: 32, fill: '#173a3c', stroke: C.teal, color: C.ink, weight: 800 })
  r.be = box(L, 557, 340, 980, 130, '這堂課：做後端 API，接上資料庫\n前後端是兩個程式，中間用 HTTP 溝通', { size: 32, fill: '#2a1f3f', stroke: C.violet, color: C.ink, weight: 800 })
  r.real = tip('資料在資料庫查得到，才叫真的', { y: 806, size: 36, col: C.gold })
  return r
}, [
  r => { show(r.feF); stagger(r.nodes.slice(0, 2), 400); later(1200, () => show([r.life, r.src])) },
  r => { show(r.apiF); glow(r.apiF); stagger(r.nodes.slice(2, 5), 300) },
  r => { glow([r.nodes[2], r.nodes[3]]) },
  r => { show([r.dbF, r.nodes[5]]); glow([r.nodes[4], r.nodes[5]]) },
  r => { hide([r.life, r.src]); show(r.fe); glow(r.feF); later(2000, () => { show(r.be); glow([r.apiF, r.dbF]) }); later(4500, () => { show(r.real); glow(r.real) }) },
])

//@OLD 3 3

// ════════════════════════════ Step 0 ════════════════════════════
chapter('Step 0', '前置檢查', C.gold)

sc3(4, () => {
  const r = {}; hd(4, 'step0')
  r.list = card(70, 150, 1460, 220, '課前裝好', ['.NET SDK 10　·　PostgreSQL 18（postgres／12345）　·　Node.js、pnpm、Git', 'VS Code ＋ Claude Code（要登入）'], C.gold, { size: 32, ts: 38, lh: 64 })
  const [a, b] = vsh(r, ['be00-preflight12-top', 'be00-preflight12'])
  r.k = cmdCard(120, 420, 1360, ['cd step0_course_intro', '.\\preflight.ps1'], '教材根目錄的終端機：一行貼一次', { size: 32 })
  r.b1 = hl(r, a, 'net', '', { col: C.green }); r.b2 = hl(r, a, 'pg', '', { col: C.green }); r.b3 = hl(r, a, 'login', '', { col: C.green }); r.b4 = hl(r, a, 'port', '', { col: C.green }); r.b5 = hl(r, b, 'nuget', '', { col: C.green })
  r.life = tip('最要緊五項：.NET・PostgreSQL 有裝有開・帳密・5080 空著・Swagger 等套件拿得到', { y: 806, size: 26, col: C.green })
  r.s1 = hl(r, b, 'summary', '「可以開課」：過關', { col: C.green, above: true, size: 30 })
  r.p1 = hl(r, a, 'psqlpath', 'psql 完整路徑：之後照抄', { col: C.gold, below: true, size: 26 })
  return r
}, [
  r => { show(r.list); glow(r.list) },
  r => { show(r.k); glow(r.k) },
  r => { hide([r.list, r.k]); show(r.S[0]); later(300, () => { only(r, r.b1, r.b2, r.b3, r.b4); show(r.life) }); later(4200, () => { to(r, r.S[1]); only(r, r.b5); later(2600, () => only(r, r.b5, r.s1)) }) },
  r => { hide(r.life); to(r, r.S[0]); zoom(r.S[0], 'psqlpath', { pad: 120, max: 1.5 }); only(r, r.p1) },
])

sc3(5, () => {
  const r = {}; hd(5, 'step0 ・ 卡住時')
  r.i1 = pic('h6-b0-6-pf-nopg', { x: 70, y: 120, w: 1460, h: 290 })
  r.three = card(70, 440, 1460, 300, '第 2 項會分清楚是哪一種', ['沒裝　→　到官網下載安裝（密碼 12345、埠號 5432）', '有裝、服務沒開　→　以系統管理員身分 Start-Service', '服務在跑、5432 連不上　→　埠號不對，重裝選 5432'], C.coral, { size: 30, ts: 34, lh: 62 })
  r.an = [['NuGet', '.NET 的套件商店', C.teal], ['Swagger', '商店裡的一個套件：第一次 dotnet run 自己下載', C.gold]].map(([h, s, col], i) => card(70 + i * 745, 440, 715, 200, h, [s], col, { size: 30, ts: 40 }))
  r.i2 = pic('h6-b0-8-pf-nuget', { x: 70, y: 120, w: 1460, h: 290 })
  r.pre = box(L, 70, 200, 1460, 200, '課前一天先跑一次：dotnet run、run-e2e\n第一次會下載套件和測試用的瀏覽器，別留到上課', { size: 36, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show([r.i1, r.three]); glow(r.three) },
  r => { hide([r.i1, r.three]); show(r.i2); stagger(r.an, 600) },
  r => { hide([r.i2, ...r.an]); show(r.pre); glow(r.pre) },
])

// ════════════════════════════ Step 1 ════════════════════════════
chapter('Step 1', '為什麼要給 AI 規矩', C.coral)

//@OLD 6 6
//@OLD 7 7

// ════════════════════════════ Step 2 ════════════════════════════
chapter('Step 2', '範本 API 與 harness', C.teal)

//@OLD 8 8
//@OLD 9 9
//@OLD 10 10

// ════════════════════════════ Step 3 ════════════════════════════
chapter('Step 3', 'SDD：先文件，再程式', C.pink)

//@OLD 11 11
//@OLD 12 12

sc3(13, () => {
  const r = {}; hd(13, 'step3 ・ 實拍')
  r.bw = bwin(['hbb-step3-copy'], HB + '#step3'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', '複製範本成 my-equipment-api，放進 PRD 和最小樣板', { col: OR, below: true, size: 24 })
  const [a, b] = vsh(r, ['bv6-02-prompt', 'bv6-03-reading'])
  r.a1 = hl(r, a, 'input', '起手 prompt：四句', { col: C.gold, above: true, size: 28 })
  r.a2 = hl(r, a, 'model', 'Opus 5.5 High', { col: C.gold, below: true, size: 24 })
  r.l3 = box(L, 70, 300, 1460, 200, '第三句：照最小樣板的「釐清規矩」\n沒寫清楚的地方，用選擇題逐題問我，每題附建議和理由', { size: 36, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900, hidden: true })
  r.b1 = hl(r, b, [350, 190, 680, 130], '一串讀檔：它在讀規矩和 PRD，先不寫程式', { below: true, size: 26 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)) },
  r => { only(r); hide(r.bw.g); show(r.S[0]); later(300, () => only(r, r.a1, r.a2)) },
  r => { only(r); hide(r.S[0]); show(r.l3); glow(r.l3); later(4200, () => { hide(r.l3); show(r.S[1]); only(r, r.b1) }) },
])

sc3(14, () => {
  const r = {}; hd(14, 'step3 ・ 釐清規矩')
  r.file = box(L, 70, 150, 1460, 170, '最小樣板裡的「釐清規矩」（給 AI 讀）\n遇到這幾種情況，一定要停下來，用選擇題問你', { size: 36, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 900 })
  r.ex = [['指向別的資料', '存編號，還是存文字？', C.teal], ['數字和文字', '有沒有上下限？', C.gold], ['跟前端契約衝突', '標出「前端要跟著改」', C.coral]].map(([h, s, col], i) => card(70 + i * 495, 360, 465, 200, h, [s], col, { size: 30, ts: 36 }))
  const [a] = vsh(r, ['bv6-q1-batch'])
  r.a1 = hl(r, a, [361, 225, 206, 22], '一批四題：16 題分四批', { col: C.gold, above: true, size: 26 })
  r.a2 = hl(r, a, [361, 294, 648, 78], '建議＋理由和代價', { col: C.green, below: true, size: 26 })
  r.t = tip('PRD 留的六題 ＋ 它自己找到的 10 個缺口', { y: 806, size: 30, col: C.teal })
  r.ans = tip('先自己想，再對照講師發的課堂裁決（答案不在動畫裡）', { y: 806, size: 28, col: C.gold })
  return r
}, [
  r => { show(r.file); glow(r.file) },
  r => { stagger(r.ex, 600, e => { show(e); glow(e) }) },
  r => { hide([r.file, ...r.ex]); show(r.S[0]); later(300, () => only(r, r.a1)); later(3000, () => { only(r, r.a1, r.a2); show(r.t) }) },
  r => { hide(r.t); show(r.ans); glow(r.ans) },
])

sc3(15, () => {
  const r = {}; hd(15, 'step3 ・ Q7 保管人')
  const [a] = vsh(r, ['bv6-q7-keeper'])
  r.a1 = hl(r, a, 'tab', 'Q7：PRD 沒寫，它自己找到的', { col: C.gold, above: true, size: 26 })
  r.a2 = hl(r, a, 'rec', '建議：存文字（附代價）', { col: C.green, below: true, size: 26 })
  r.an = [['存編號＝只記會員編號', ['只記 M-001，要看名字就去人員資料查', '對方改名，查到的跟著變'], C.teal], ['存文字＝紙本登記簿', ['抄下當時的「陳建豪」「0912…」', '寫下去就不會變'], C.gold]].map(([h, s, col], i) => card(70 + i * 745, 180, 715, 260, h, s, col, { size: 32, ts: 40, lh: 62 }))
  r.sch = pic('h6-b3-7c-keeper-sch', { x: 70, y: 116, w: 1460, h: 680 })
  r.why = tip('本課選存文字：前端一行不改　·　正式系統建議存編號，前後端一起改', { y: 806, size: 26, col: C.green })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)); later(4000, () => only(r, r.a2)) },
  r => { only(r); hide(r.S[0]); stagger(r.an, 700) },
  r => { hide(r.an); show(r.sch); later(4500, () => { show(r.why); glow(r.why) }) },
])

sc3(16, () => {
  const r = {}; hd(16, 'step3 ・ 補理由')
  const [a, b] = vsh(r, ['bv6-q3-batch', 'bv6-04-reasons'])
  r.a1 = hl(r, a, [361, 225, 420, 22], 'Q10 數量上限、Q11 品名要不要驗：沒選建議', { col: C.gold, above: true, size: 26 })
  r.b1 = hl(r, b, [361, 428, 667, 56], '補兩句理由：寫進 SRS-delta', { col: C.green, above: true, size: 26 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1) },
])

sc3(17, () => {
  const r = {}; hd(17, 'step3 ・ 實拍')
  const [a] = vsh(r, ['bv6-docs-next'])
  r.a0 = tip('docs 四個檔：SRS-delta、設計文件-delta、圖、任務清單　·　程式一行都還沒寫', { y: 806, size: 26, col: C.green })
  r.a1 = hl(r, a, [361, 302, 662, 43], '下一步：「我先核文件」', { col: C.gold, below: true, size: 28 })
  r.bw = pwin('h6-srs-a', 'docs/SRS-裝備物資API-delta.md（預覽）'); r.B = r.bw.S
  r.s1 = hl(r, r.B[0], [16, 150, 1568, 120], '第 1 段：每題一列：問題・裁決・理由・誰拍板', { col: OR, below: true, size: 26 })
  r.bw3 = pwin('h6-b3-10b-risk', 'docs/SRS-裝備物資API-delta.md（預覽）'); r.B3 = r.bw3.S
  r.rk = tip('第 4 段 待定與風險：選了就有代價，代價寫在這', { y: 806, size: 28, col: C.gold })
  return r
}, [
  r => { show([r.S[0], r.a0]); later(3500, () => { hide(r.a0); only(r, r.a1) }) },
  r => { only(r); hide(r.S[0]); show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.s1)) },
  r => { only(r); hide(r.bw.g); show(r.bw3.g); show(r.B3[0]); show(r.rk) },
])

sc3(18, () => {
  const r = {}; hd(18, 'step3 ・ 五張圖')
  r.hb = bwHead('bv6-diag-1-head', DG); r.HB = r.hb.S
  r.h1 = hl(r, r.HB[0], [0, 120, 1400, 64], '', { col: OR }); r.h2 = hl(r, r.HB[0], [0, 200, 1200, 136], '', { col: C.teal })
  r.q = tip('上面：一句話（橘）＋怎麼看（藍）　·　下面一題：「看完你要答得出來」', { y: 700, size: 28, col: C.gold })
  r.d1 = pic('bv6-diag-1-svg'); r.d2 = pic('bv6-diag-2-svg'); r.d3 = pic('bv6-diag-3-a'); r.d4 = pic('bv6-diag-4-svg'); r.d5 = pic('bv6-diag-5-b')
  r.d1c = hl(r, r.d1, [438, 642, 544, 396], '綠：新寫的檔', { col: C.green, right: true, size: 24 })
  r.d1g = hl(r, r.d1, [1788, 921, 196, 116], '灰：不動', { col: C.mut, above: true, right: true, size: 24 })
  r.d2c = hl(r, r.d2, [378, 610, 1245, 57], '最多 50 字：你在 Q9 拍板的', { col: C.green, below: true, size: 24 })
  r.d3c = hl(r, r.d3, [164, 369, 1671, 217], '驗證沒過：直接回 400', { col: C.red, below: true, size: 26 })
  r.d3t = hl(r, r.d3, [1292, 640, 524, 600], '交易裡：取號、算編碼', { col: OR, above: true, size: 26 })
  r.d5c = hl(r, r.d5, [280, 893, 834, 107], '沒變：保留　·　變了：新前綴取下一號', { col: C.green, above: true, size: 26 })
  r.rd = pic('h6-b3-d1-redraw')
  const m = META['h6-b3-d1-redraw']
  r.rb = hl(r, r.rd, [0, 0, m.w / 2, m.h], '', { col: C.red })
  r.ra = hl(r, r.rd, [m.w / 2, 0, m.w / 2, m.h], '', { col: C.green })
  return r
}, [
  r => { show(r.hb.g); show(r.HB[0]); later(300, () => only(r, r.h1, r.h2)); later(2600, () => { show(r.q); glow(r.q) }) },
  r => { only(r); hide([r.hb.g, r.q]); show(r.d1); later(300, () => only(r, r.d1c, r.d1g)); later(5200, () => { only(r); hide(r.d1); show(r.d2); later(300, () => only(r, r.d2c)) }) },
  r => { only(r); hide(r.d2); show(r.d3); later(300, () => only(r, r.d3c)); later(3200, () => only(r, r.d3t)); later(6200, () => { only(r); hide(r.d3); show(r.d4) }) },
  r => { hide(r.d4); show(r.d5); later(300, () => only(r, r.d5c)) },
  r => { only(r); hide(r.d5); show(r.rd); later(300, () => only(r, r.rb)); later(3500, () => only(r, r.ra)) },
])

sc3(19, () => {
  const r = {}; hd(19, 'step3 ・ 開工')
  const [a, b, c] = vsh(r, ['bv6-05-model-menu', 'bv6-06-go-typed', 'bv6-build-t0360'])
  r.a1 = hl(r, a, 'sonnet', '開工前：換 Sonnet 5.5', { col: C.gold, below: true, size: 28 })
  r.b1 = hl(r, b, 'input', '打「開工」→ 送出', { col: C.green, above: true, size: 28 })
  r.tea = box(L, 1080, 64, 400, 46, '實拍：約 7 分鐘', { size: 26, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  r.done = card(70, 220, 1460, 360, '做完它回報（實拍那次）', ['97 條測試全綠、build 0 警告', '「跟文件原本寫的不同，已改文件」：5 處', '程式跟文件對得上，才算做完'], C.green, { size: 34, ts: 38, lh: 78 })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { to(r, r.S[1]); only(r, r.b1); later(3600, () => { to(r, r.S[2]); only(r); show(r.tea) }) },
  r => { hide([r.S[2], r.tea]); show(r.done); glow(r.done) },
])

sc3(20, () => {
  const r = {}; hd(20, 'step3 ・ 三路驗收')
  const [a, b, c] = vsh(r, ['bv6-10-run', 'bv6-13-test', 'bv6-14-psql'])
  r.a1 = hl(r, a, 'listen', '你的 API：Now listening on 5080', { col: C.green, below: true, size: 28 })
  r.sw = bwin(['be03-swagger', 'be03-swagger-get', 'be03-swagger-404'], 'localhost:5080/swagger'); r.SW = r.sw.S
  r.s1 = hl(r, r.SW[0], 'get', '一路：Swagger 裝備物資五條路由', { col: OR, above: true, size: 26 })
  r.g1 = hl(r, r.SW[1], 'code', '200', { col: C.green, right: true, size: 30 })
  r.n1 = hl(r, r.SW[2], 'code', 'E-999：404', { col: C.red, right: true, size: 30 })
  r.t1 = hl(r, b, 'summary', '二路：失敗 0（這次 102 條）', { col: C.green, above: true, size: 26 })
  r.p1 = hl(r, c, 'n', '三路：ai_crud_equipment 24 列', { col: C.green, right: true, size: 26 })
  r.warn = tip('範本的人員也是 24 筆：庫名打錯一樣看到 24，要看清楚', { y: 806, size: 28, col: C.coral })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { only(r); hide(r.S[0]); show(r.sw.g); show(r.SW[0]); later(300, () => only(r, r.s1)); later(3000, () => { swap(r.SW, r.SW[1]); only(r, r.g1) }); later(5600, () => { swap(r.SW, r.SW[2]); only(r, r.n1) }); later(8400, () => { only(r); hide(r.sw.g); show(r.S[1]); only(r, r.t1) }) },
  r => { to(r, r.S[2]); only(r, r.p1); later(3000, () => { show(r.warn); glow(r.warn) }) },
])

sc3(21, () => {
  const r = {}; hd(21, 'step3 ・ 小落差')
  r.bf = pic('h6-b3-20-gap-before')
  r.bt = tip('修改前：鍵名 $.purchaseDate、英文、多一條 request', { y: 806, size: 28, col: C.red })
  r.af = pic('h6-b3-21-gap-after')
  r.at = tip('修改後：鍵名 purchaseDate、訊息中文　·　一次講一件：看到什麼、期望什麼、只改這個', { y: 806, size: 24, col: C.green })
  r.sch = pic('h6-b3-22-gap-sch')
  r.st = tip('改的是共用的 Program.cs：也寫進了設計文件', { y: 806, size: 28, col: C.gold })
  return r
}, [
  r => { show([r.bf, r.bt]); later(2200, () => zoom(r.bf, [0, 520, 1600, 646], { pad: 10, max: 1.8 })) },
  r => { unzoom(r.bf); hide([r.bf, r.bt]); show([r.af, r.at]) },
  r => { hide([r.af, r.at]); show(r.sch); later(5000, () => show(r.st)) },
])

// ════════════════════════════ Step 4 ════════════════════════════
chapter('Step 4', 'LOOP＋對抗審查', C.violet)

//@OLD 21 22

sc3(23, () => {
  const r = {}; hd(23, 'step4')
  r.loop = flowRow(140, [['改程式', C.teal], ['跑 6 條測試', C.violet], ['有紅：再改', C.coral], ['全綠：停', C.green]], { w: 330, gap: 30 })
  const tests = [['E1', '清單載入：共 24 筆，資料來自 PostgreSQL'], ['E2', '新增後 reload，那一筆還在'], ['E3', '新增後編碼格式：類別2碼-項目3碼-流水3碼'], ['E4', '編輯後 reload，新值還在'], ['E5', '刪除後 reload，那一筆真的消失'], ['E6', '直打 API：前端新增的出現在後端 GET']]
  r.tbl = grp(L); R(r.tbl, 70, 290, 1460, 490, { fill: C.card, stroke: C.line, sw: 3 })
  r.rows = tests.map(([k, t], i) => { const g = grp(r.tbl, false); const y = 310 + i * 76; R(g, 90, y, 1420, 64, { fill: /reload/.test(t) ? '#173a3c' : '#1c2f4a', rx: 10 })
    T(g, 120, y + 43, k, { size: 30, weight: 900, fill: C.teal }); T(g, 200, y + 43, t, { size: 28 }); return g })
  r.stone = tip('reload 是試金石：mock 會掉回種子，真的落庫才會留下', { y: 806, size: 30, col: C.gold })
  r.iron = [['鐵律 1', '不准改測試、不准放寬標準', C.red], ['鐵律 2', '同一個問題修兩次沒好，停下回報', C.red]].map(([h, s, col], i) => card(70 + i * 745, 290, 715, 170, h, [s], col, { size: 30, ts: 38 }))
  r.file = card(70, 490, 1460, 300, 'step4_loop_e2e/LOOP-規矩.md（給 AI 讀，也是 harness 的一份）', ['鐵律、埠不寫死、審查怎麼做', '修好的每一條：修改前、修改後、示意圖', 'prompt 只要說「照規矩做」'], C.violet, { size: 30, ts: 32, lh: 62 })
  return r
}, [
  r => { stagger(r.loop, 350) },
  r => { show(r.tbl); stagger(r.rows, 250, glow); later(2500, () => { show(r.stone); glow(r.stone) }) },
  r => { hide([r.tbl, r.stone]); stagger(r.iron, 500) },
  r => { show(r.file); glow(r.file) },
])

sc3(24, () => {
  const r = {}; hd(24, 'step4 ・ 實拍')
  r.bw = bwin(['hbb-step4-loop'], HB + '#step4'); r.B = r.bw.S
  r.h1 = hl(r, r.B[0], 'pre', 'LOOP prompt：四句，第一句「照 LOOP-規矩.md 做」', { col: OR, below: true, size: 24 })
  const [a] = vsh(r, ['bv6-20-loop-pasted'])
  r.a1 = hl(r, a, 'input', 'Sonnet 5.5、Auto：送出就不用管', { col: C.green, above: true, size: 26 })
  r.pw = pwin('h6-b4v6-2-ports', REP); r.P = r.pw.S
  r.t1 = tip('3199 被別的程式占著：沒去關它，自己換成 3200，原因寫進報告', { y: 806, size: 26, col: C.gold })
  r.g = card(70, 250, 1460, 260, '第 1 輪：6 條全鏈路測試全綠', ['全綠只代表這 6 條沒抓到問題', '接下來的對抗審查才是重點'], C.green, { size: 32, ts: 40, lh: 66 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(300, () => only(r, r.h1)); later(3600, () => { only(r); hide(r.bw.g); show(r.S[0]); only(r, r.a1) }) },
  r => { only(r); hide(r.S[0]); show(r.pw.g); show(r.P[0]); show(r.t1) },
  r => { hide([r.pw.g, r.t1]); show(r.g); glow(r.g) },
])

sc3(25, () => {
  const r = {}; hd(25, 'step4 ・ 子代理')
  const [a] = vsh(r, ['bv6-loop-t0480'])
  r.a1 = hl(r, a, [478, 525, 61, 19], '1 agent：子代理在工作（Opus 5.5）', { col: C.gold, above: true, size: 28 })
  r.h = card(70, 180, 1460, 300, '子代理：HTTP 真的打 API 104 次', ['合法的、缺欄位的、超長的、壞掉的 JSON 都打', '再開瀏覽器，一頁一頁截圖', '讀全部程式和測試'], C.teal, { size: 30, ts: 36, lh: 62 })
  r.two = [['修了 2 條', 'F1、F2：App 自己的問題', C.green], ['9 條交給你裁決', '動到你拍板的、前端的、測試的', C.gold]].map(([h, s, col], i) => card(70 + i * 745, 200, 715, 220, h, [s], col, { size: 30, ts: 42 }))
  r.n = tip('挑到 11 條　·　規矩不准它自己改的：整理成 8 題選擇題', { y: 470, size: 28, col: C.coral })
  return r
}, [
  r => { show(r.S[0]); later(400, () => only(r, r.a1)) },
  r => { only(r); hide(r.S[0]); show(r.h); glow(r.h) },
  r => { hide(r.h); stagger(r.two, 600); later(1400, () => show(r.n)) },
])

sc3(26, () => {
  const r = {}; hd(26, 'step4 ・ 修改前後')
  r.four = flowRow(300, [['一句白話', C.teal], ['修改前／後\n並排', C.coral], ['示意圖', C.gold], ['改了哪個檔\n哪條測試證明', C.green]], { w: 340, gap: 33 })
  r.im = pic('h6-b4v6-5-f1')
  r.bf = hl(r, r.im, [17, 205, 773, 480], '修改前：500', { col: C.red, above: true, size: 26 })
  r.af = hl(r, r.im, [812, 205, 773, 480], '修改後：400＋指出欄位', { col: C.green, above: true, right: true, size: 26 })
  r.sc = hl(r, r.im, [17, 830, 1500, 160], '在哪一步擋：越早擋，訊息越清楚', { col: C.gold, above: true, size: 26 })
  return r
}, [
  r => { stagger(r.four, 500, e => { show(e); glow(e) }) },
  r => { hide(r.four); show(r.im); baShow(r, r.im, r.bf, r.af, { zb: [17, 205, 773, 480], za: [812, 205, 773, 480] }) },
  r => { only(r); unzoom(r.im); zoom(r.im, [17, 780, 1500, 210], { pad: 14, max: 1.8 }); later(500, () => only(r, r.sc)) },
])

sc3(27, () => {
  const r = {}; hd(27, 'step4 ・ 要你裁決')
  r.q = pic('h6-b4v6-9-q2', { x: 70, y: 150, w: 1460, h: 300 })
  r.sh = pic('h6-b4v6-7-f4-shot', { x: 70, y: 116, w: 1460, h: 680 })
  const m = META['h6-b4v6-7-f4-shot']
  r.s1 = hl(r, r.sh, [0, 0, m.w, m.h * 0.5], '', { col: C.gold }); r.s2 = hl(r, r.sh, [0, m.h * 0.5, m.w, m.h * 0.5], '', { col: C.red })
  r.sch = pic('h6-b4v6-8-f4-sch')
  r.lg = card(70, 200, 1460, 380, '這是邏輯問題', ['各自的測試都綠，串起來卻壞了', '後端擋 50 字是對的（Q9）；前端少了同一條檢查，也沒接住 400', '本課前端是契約：先維持現狀，寫進文件，回報前端'], C.coral, { size: 31, ts: 40, lh: 74 })
  return r
}, [
  r => { show(r.q); later(3200, () => { hide(r.q); show(r.sh); later(300, () => only(r, r.s1)); later(3800, () => only(r, r.s2)) }) },
  r => { only(r); hide(r.sh); show(r.sch); later(5200, () => { hide(r.sch); show(r.lg); glow(r.lg) }) },
  r => { show(r.lg) },
])

sc3(28, () => {
  const r = {}; hd(28, 'step4 ・ 要你裁決')
  r.q = pic('h6-b4v6-9b-q3', { x: 70, y: 200, w: 1460, h: 360 })
  r.t1 = tip('同一個號碼，貼在兩台實物上', { y: 600, size: 30, col: C.red })
  const [a] = vsh(r, ['bv6-22-decide'])
  r.a1 = hl(r, a, [353, 210, 679, 120], '同一個對話，一次回答', { col: C.green, below: true, size: 28 })
  r.a2 = tip('建議的不一定要選：選了不建議的，說一句理由，它寫進文件', { y: 806, size: 26, col: C.teal })
  return r
}, [
  r => { show([r.q, r.t1]) },
  r => { hide([r.q, r.t1]); show(r.S[0]); later(300, () => only(r, r.a1)); later(2600, () => show(r.a2)) },
])

sc3(29, () => {
  const r = {}; hd(29, 'step4 ・ 回報前端')
  r.role = box(L, 70, 200, 1460, 200, '這一段看實拍就好，不用照做：教材的前端已經修好\n實拍：換個身分當前端工程師，另開對話請 AI 修好', { size: 36, fill: '#1c2f4a', stroke: C.violet, color: C.ink, weight: 900 })
  const [a, b] = vsh(r, ['bv7-02-prompt', 'bv7-10-agent'])
  r.a1 = hl(r, a, [353, 359, 679, 40], '第一句：「我授權你修」寫清楚', { col: C.gold, above: true, size: 26 })
  r.a2 = hl(r, a, 'input', '先重現截圖、修好再截　·　跑測試＋子代理挑錯', { col: C.green, below: true, size: 24 })
  r.b1 = hl(r, b, [478, 525, 61, 19], '子代理：挑前後端規則一不一致', { col: C.gold, above: true, size: 26 })
  r.hon = card(70, 200, 1460, 360, '子代理抓到、AI 自己承認', ['抓到：「備註」被後端擋下時沒有紅字（寫的 AI 漏的）', '承認：不小心改到一筆種子資料，已經還原，寫進報告', '審的跟寫的不能是同一個；報告要誠實'], C.gold, { size: 30, ts: 38, lh: 72 })
  return r
}, [
  r => { show(r.role); glow(r.role) },
  r => { hide(r.role); show(r.S[0]); later(300, () => only(r, r.a1)); later(3800, () => only(r, r.a1, r.a2)) },
  r => { only(r); to(r, r.S[1]); only(r, r.b1); later(3200, () => { only(r); hide(r.S); show(r.hon); glow(r.hon) }) },
])

sc3(30, () => {
  const r = {}; hd(30, 'step4 ・ 前端修改前後')
  const mk = (n, lb, la) => { const g = pic(n); const m = META[n]; return { g, b: [0, 0, m.w / 2, m.h], a: [m.w / 2, 0, m.w / 2, m.h], bf: hl(r, g, [0, 0, m.w / 2, m.h], lb, { col: C.red, below: true, size: 24 }), af: hl(r, g, [m.w / 2, 0, m.w / 2, m.h], la, { col: C.green, below: true, right: true, size: 24 }) } }
  r.p1 = mk('fe7-fix-name', '修改前：51 個字照送 → 整頁錯誤', '修改後：紅字「不可超過 50 字」')
  r.p2 = mk('fe7-fix-qty', '修改前：1.5 也能送', '修改後：紅字「數量必須是整數」')
  r.p3 = mk('fe7-fix-nul', '修改前：後端 400 → 整頁錯誤', '修改後：紅字在欄位旁，內容都在')
  return r
}, [
  r => { show(r.p1.g); baShow(r, r.p1.g, r.p1.bf, r.p1.af, { zb: r.p1.b, za: r.p1.a, max: 1.8 }) },
  r => { only(r); unzoom(r.p1.g); hide(r.p1.g); show(r.p2.g); baShow(r, r.p2.g, r.p2.bf, r.p2.af, { zb: r.p2.b, za: r.p2.a, max: 1.8 }) },
  r => { only(r); unzoom(r.p2.g); hide(r.p2.g); show(r.p3.g); baShow(r, r.p3.g, r.p3.bf, r.p3.af, { zb: r.p3.b, za: r.p3.a, max: 1.8 }) },
])

sc3(31, () => {
  const r = {}; hd(31, 'step4 ・ 前後端規則一致')
  r.an = [['前端＝櫃台', '不量尺寸，送到倉庫才被退', C.coral], ['後端＝倉庫', '退件時，櫃台還把單子撕了', C.coral]].map(([h, s, col], i) => card(70 + i * 745, 200, 715, 220, h, [s], col, { size: 30, ts: 42 }))
  r.sch = pic('h6-be-sch-fe2')
  r.l1 = hl(r, r.sch, [40, 120, 812, 775], '第一道：同一把尺先量', { col: C.teal, below: true, size: 26 })
  r.l2 = hl(r, r.sch, [895, 120, 812, 775], '第二道：退件原因寫回欄位', { col: C.green, below: true, right: true, size: 26 })
  r.one = box(L, 70, 250, 1460, 240, '回公司記一句\n前後端照同一份規則檢查，規則寫在同一份文件\n前端沒檢查到的：後端照樣擋，前端也要把原因顯示出來', { size: 38, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { stagger(r.an, 700) },
  r => { hide(r.an); show(r.sch); later(300, () => only(r, r.l1)); later(3600, () => only(r, r.l2)) },
  r => { only(r); zoom(r.sch, [895, 120, 812, 775], { pad: 14, max: 1.6 }) },
  r => { unzoom(r.sch); hide(r.sch); show(r.one); glow(r.one) },
])

sc3(32, () => {
  const r = {}; hd(32, 'step4 ・ 驗收')
  r.bw = pwin('h6-b4-9-pw', 'step4_loop_e2e/e2e/playwright-report/index.html', { x: 70, y: 112, w: 1460, h: 560 }); r.B = r.bw.S
  r.bw2 = pwin('h6-b4v6-11-log', 'my-equipment-api/loop/LOOP-LOG.md'); r.B2 = r.bw2.S
  r.f5 = pic('h6-b4v6-13-reload', { x: 240, y: 116, w: 1120, h: 680 })
  r.f5t = tip('新增一筆 → F5 → 還在：持久化的鐵證', { y: 816, size: 28, col: C.green })
  r.bw3 = pwin('h6-b4v6-12-srs', 'docs/SRS-裝備物資API-delta.md（預覽）'); r.B3 = r.bw3.S
  r.st = tip('標「step4 LOOP 後」：你的裁決也寫進文件', { y: 806, size: 28, col: C.gold })
  r.self = card(70, 220, 1460, 340, '自己點一遍（在關服務之前）', ['新增一筆 → F5 → 還在', '選「其他」、項目打超過 50 字、數量 1.5 → 紅字、內容還在', '都驗完，照報告的指令關掉兩個服務'], C.green, { size: 32, ts: 38, lh: 74 })
  return r
}, [
  r => { show(r.bw.g); show(r.B[0]); later(3600, () => { hide(r.bw.g); show(r.bw2.g); show(r.B2[0]) }) },
  r => { hide(r.bw2.g); show([r.f5, r.f5t]) },
  r => { hide([r.f5, r.f5t]); show(r.bw3.g); show(r.B3[0]); show(r.st) },
  r => { hide([r.bw3.g, r.st]); show(r.self); glow(r.self) },
])

sc3(33, () => {
  const r = {}; hd(33, 'step4')
  r.g = [['規格 Gate', ['選擇題的裁決和理由', 'SRS-delta、設計文件-delta', '看得懂的圖、任務清單'], C.violet], ['程式 Gate', ['build 零警告', '測試全綠', 'Swagger 狀態碼、psql 查得到資料'], C.teal], ['交付 Gate', ['LOOP 報告、修改前後＋示意圖', '測試報告 6 比 6、被測的是你的作品', '文件標「step4 LOOP 後」'], C.gold]]
    .map(([h, ls, col], i) => card(70 + i * 495, 150, 465, 400, h, ls, col, { size: 26, ts: 40, lh: 64 }))
  r.pr = box(L, 70, 620, 1460, 150, '這三道，回公司直接當 PR 檢查表', { size: 42, fill: '#2a2410', stroke: C.gold, color: C.gold, weight: 900 })
  return r
}, [
  r => { show(r.g[0]); glow(r.g[0]) },
  r => { show(r.g[1]); glow(r.g[1]) },
  r => { show(r.g[2]); glow(r.g[2]); later(2500, () => { show(r.pr); glow(r.pr) }) },
])

// ════════════════════════════ Step 5 ════════════════════════════
chapter('Step 5', '回公司怎麼用', C.green)

//@OLD 29 34
//@OLD 30 35
