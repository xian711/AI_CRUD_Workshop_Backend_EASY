// 常駐遙控器：開著測試用 VS Code，照 q/ 資料夾裡的指令檔一步一步做，結果寫回 q/NNN.out.json
// 指令格式（JSON）：{a:'shot',name,boxes}｜{a:'key',key}｜{a:'type',text,frame}｜{a:'paste',text}｜{a:'click',sel,hasText,frame,nth,noWait}
//   ｜{a:'eval',js}｜{a:'feval',js}｜{a:'dlg',args}｜{a:'wait',ms}｜{a:'dump'}｜{a:'reopen'}｜{a:'quit'}
// frame:true 代表在 Claude Code 的網頁面板（webview）裡找元件。
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { launch, workbench, sleep, K, clipRead, clipWrite, W, meta, termRows, rowBox, sizeWin } from './vsc-lib.mjs'
const Q = W + '/q'; fs.mkdirSync(Q, { recursive: true })
const folder = process.env.FOLDER || 'D:\\AI_CRUD_Workshop_Frontend_EASY'
const extra = process.env.SETTINGS ? JSON.parse(process.env.SETTINGS) : {}
let { app } = await launch({ folder, settings: { 'git.enabled': false, ...extra } })
let p = await workbench(app)
const clip0 = await clipRead(app)
const log = (...a) => { const s = a.join(' '); console.log(s); fs.appendFileSync(Q + '/driver.log', new Date().toTimeString().slice(0, 8) + ' ' + s + '\n') }
log('ready', folder)

function claudeFrame(purpose) {
  // Claude Code 的網頁面板：網址含 claude-code（不分大小寫）；取「內層」那個（父框不是主視窗）
  const fr = p.frames().filter(f => /claude-code/i.test(f.url()) && f.parentFrame() && f.parentFrame() !== p.mainFrame())
  const pick = purpose ? fr.filter(f => f.url().includes('purpose=' + purpose)) : fr
  return pick[pick.length - 1] || fr[fr.length - 1]
}
async function frameOf(c) {
  if (c.frameRe) { for (let i = 0; i < 20; i++) { const fr = p.frames().filter(f => new RegExp(c.frameRe, 'i').test(f.url())); const f = fr.find(f => f.name() === 'active-frame') || fr[fr.length - 1]; if (f) return f; await sleep(500) } throw new Error('no frame ' + c.frameRe) }
  if (!c.frame) return p; for (let i = 0; i < 20; i++) { const f = claudeFrame(c.purpose); if (f) return f; await sleep(500) } throw new Error('no claude frame') }
// 元件外框：在 webview 裡的元件，boundingBox 已經換算成整個視窗的座標
async function bx(c, spec) {
  if (spec == null) return null
  if (Array.isArray(spec) && typeof spec[0] === 'number') return spec
  const s = typeof spec === 'string' ? { sel: spec } : Array.isArray(spec) ? { sel: spec[0], ...spec[1] } : spec
  const root = (s.frame || s.frameRe) ? await frameOf(s) : p
  let loc = s.text ? root.getByText(s.text, { exact: !!s.exact }) : root.locator(s.sel)
  if (s.hasText) loc = loc.filter({ hasText: s.re ? new RegExp(s.hasText) : s.hasText })
  loc = s.last ? loc.last() : loc.nth(s.nth ?? 0)
  const r = await loc.boundingBox({ timeout: 2500 }).catch(() => null)
  return r ? [r.x, r.y, r.width, r.height].map(Math.round) : null
}
async function run(c) {
  switch (c.a) {
    case 'shot': {
      const vp = await p.evaluate(() => [innerWidth, innerHeight]); const out = {}
      for (const [k, v] of Object.entries(c.boxes || {})) out[k] = v && v.row ? await rowBox(p, new RegExp(v.row), { last: !!v.last }) : await bx(c, v)
      await p.screenshot({ path: `${W}/raw/${c.name}.png` })
      meta[c.name] = { w: vp[0], h: vp[1], boxes: out }; fs.writeFileSync(W + '/raw/meta.json', JSON.stringify(meta, null, 1))
      return { boxes: out }
    }
    case 'key': await p.keyboard.press(c.key); return 'ok'
    case 'type': { const root = await frameOf(c); if (c.sel) await root.locator(c.sel).first().click(); await p.keyboard.type(c.text, { delay: c.delay ?? 20 }); return 'ok' }
    case 'paste': { await clipWrite(app, c.text); await p.keyboard.press('Control+V'); return 'ok' }
    case 'click': {
      const root = await frameOf(c)
      let loc = c.text ? root.getByText(c.text, { exact: !!c.exact }) : root.locator(c.sel)
      if (c.hasText) loc = loc.filter({ hasText: c.re ? new RegExp(c.hasText) : c.hasText })
      loc = c.last ? loc.last() : loc.nth(c.nth ?? 0)
      if (c.noWait) { loc.click({ timeout: 10000 }).catch(() => {}); return 'fired' }
      await loc.click({ timeout: c.timeout ?? 10000 }); return 'ok'
    }
    case 'clickxy': await p.mouse.click(c.x, c.y); return 'ok'
    case 'move': await p.mouse.move(c.x, c.y); return 'ok'
    case 'wheel': await p.mouse.move(c.x, c.y); await p.mouse.wheel(0, c.dy || 300); return 'ok'
    case 'eval': return await p.evaluate(c.js)
    case 'feval': { const f = await frameOf(c.frameRe ? c : { frame: true, purpose: c.purpose }); return await f.evaluate(c.js) }
    case 'frames': return p.frames().map(f => [f.name(), (f.parentFrame() === p.mainFrame() ? 'L1 ' : f.parentFrame() ? 'L2 ' : 'top ') + f.url().replace(/^.*?(purpose=\w+).*$/, '$1').slice(0, 120)])
    case 'dlg': try { return execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', W + '/dlg.ps1', ...c.args], { encoding: 'utf8' }) } catch (e) { return 'ERR ' + (e.stdout || '') + (e.stderr || '') }
    case 'wait': await sleep(c.ms); return 'ok'
    case 'size': await sizeWin(app, c.wh || [1067, 600]); await sleep(1500); return await p.evaluate(() => [innerWidth, innerHeight])
    case 'term': return (await termRows(p)).filter(Boolean)
    case 'dump': { const f = claudeFrame(c.purpose); return f ? await f.evaluate(() => document.body.innerText) : 'no frame' }
    case 'html': { const f = c.frame ? claudeFrame() : p.mainFrame(); return await f.evaluate(([s, n]) => { const e = document.querySelector(s); return e ? e.outerHTML.slice(0, n) : null }, [c.sel || 'body', c.n || 20000]) }
    case 'reopen': p = await workbench(app); return 'ok'
    case 'clip': return await clipRead(app)
    case 'quit': return 'bye'
  }
  return 'unknown action ' + c.a
}
let done = false
while (!done) {
  const files = fs.readdirSync(Q).filter(f => /^\d+\.json$/.test(f)).sort()
  for (const f of files) {
    const id = f.replace('.json', ''); const outF = `${Q}/${id}.out.json`
    if (fs.existsSync(outF)) continue
    let c; try { c = JSON.parse(fs.readFileSync(`${Q}/${f}`, 'utf8')) } catch (e) { continue }
    let res, err = null
    try { res = await run(c) } catch (e) { err = e.message.split('\n')[0] }
    fs.writeFileSync(outF, JSON.stringify({ ok: !err, err, res }, null, 1))
    log(id, c.a, c.name || c.key || c.sel || c.text?.slice(0, 30) || '', err ? 'ERR ' + err : 'ok')
    if (c.a === 'quit') done = true
  }
  await sleep(400)
}
await clipWrite(app, clip0).catch(() => {})
await app.close().catch(() => {})
