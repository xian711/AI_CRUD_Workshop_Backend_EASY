// 通用網頁截圖：node cap-page.mjs <指令檔.json>
// 指令檔：{ url, vp:[w,h], dsf, shots:[ { name, goto:'標題文字'(捲到該標題), up:像素, boxes:{key:'css 或 {text}'}, scroll:dy } ] }
// 座標寫進 raw/meta-extra.json
import fs from 'node:fs'
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07', RAW = W + '/raw', META = RAW + '/meta-extra.json'
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {}
const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const [w, h] = cfg.vp || [1240, 644]
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: cfg.dsf || 1.9, locale: 'zh-TW' })
const p = await ctx.newPage(); p.setDefaultTimeout(15000)
async function bx(spec) {
  if (spec == null) return null
  if (Array.isArray(spec) && typeof spec[0] === 'number') return spec
  let loc = typeof spec === 'string' ? p.locator(spec) : spec.text ? p.getByText(spec.text, { exact: !!spec.exact }) : p.locator(spec.sel)
  if (spec.hasText) loc = loc.filter({ hasText: spec.hasText })
  loc = spec.last ? loc.last() : loc.nth(spec.nth || 0)
  const r = await loc.boundingBox({ timeout: 2500 }).catch(() => null)
  return r ? [r.x, r.y, r.width, r.height].map(Math.round) : null
}
try {
  await p.goto(cfg.url, { waitUntil: 'networkidle' }); await sleep(cfg.wait || 1500)
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
  for (const s of cfg.shots) {
    if (s.goto) {
      const ok = await p.evaluate(([t, up]) => { const e = [...document.querySelectorAll('h1,h2,h3,h4,summary,p,li,td,th,span,div')].find(e => e.childElementCount <= 3 && e.textContent.trim().startsWith(t)); if (!e) return false; window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - up); return true }, [s.goto, s.up ?? 16])
      if (!ok) console.log('goto not found:', s.goto)
      await sleep(500)
    }
    if (s.scroll) { await p.mouse.wheel(0, s.scroll); await sleep(500) }
    if (s.js) { await p.evaluate(s.js); await sleep(400) }
    const out = {}; for (const [k, v] of Object.entries(s.boxes || {})) out[k] = await bx(v)
    await p.screenshot({ path: `${RAW}/${s.name}.png` })
    meta[s.name] = { w, h, url: p.url(), boxes: out }; fs.writeFileSync(META, JSON.stringify(meta, null, 1))
    const miss = Object.entries(out).filter(([, v]) => !v).map(([k]) => k); console.log('[shot]', s.name, miss.length ? `（找不到：${miss.join(', ')}）` : '')
  }
} catch (e) { console.log('ERROR', e.stack) } finally { await b.close() }
