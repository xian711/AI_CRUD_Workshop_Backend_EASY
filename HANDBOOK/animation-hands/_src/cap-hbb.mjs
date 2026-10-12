// 手把手版：從「現在的」前端手冊拍指令框（舊版 br05～br08 是更早的 prompt）
import fs from 'node:fs'
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07', RAW = W + '/raw', META = RAW + '/meta-extra.json'
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {}
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 519 }, deviceScaleFactor: 1.9, locale: 'zh-TW' })
await p.goto('file:///D:/AIWORK/_AICLASS/AI_CRUD_Workshop_Backend_EASY/HANDBOOK/HANDBOOK.html'); await p.waitForTimeout(1200)
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
const rnd = r => r ? [r.x, r.y, r.width, r.height].map(Math.round) : null
async function shotPre(name, sel, nth, up = 110) {
  const pre = typeof nth === 'string' ? p.locator(sel).filter({ hasText: nth }).first() : p.locator(sel).nth(nth)
  await pre.evaluate((e, u) => { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -u) }, up); await p.waitForTimeout(600)
  const r = rnd(await pre.boundingBox())
  await p.screenshot({ path: `${RAW}/${name}.png` }); meta[name] = { w: 1000, h: 519, boxes: { pre: r } }; console.log(name, JSON.stringify(r))
}
await shotPre('hbb-step0-preflight', '#step0 pre', 0)
await shotPre('hbb-step2-run', '#step2 pre', 0)
await shotPre('hbb-step3-copy', '#step3 pre', '複製範本 API')
await shotPre('hbb-step3-start', '#step3 pre', '走規格驅動開發')
await shotPre('hbb-step3-verify', '#step3 pre', 'cd src')
await shotPre('hbb-step4-loop', '#step4 pre', '你是 LOOP 工程師')
// 手冊最下面的完課檢核表
const chk = p.locator('h2', { hasText: '完課檢核表' }).first()
await chk.evaluate(e => { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90) }); await p.waitForTimeout(600)
const lst = p.locator('h2:has-text("完課檢核表") ~ *').first()
await p.screenshot({ path: `${RAW}/hbb-checklist.png` }); meta['hbb-checklist'] = { w: 1000, h: 519, boxes: { h: rnd(await chk.boundingBox()), list: rnd(await lst.boundingBox().catch(() => null)) } }
console.log('hbb-checklist', JSON.stringify(meta['hbb-checklist'].boxes))
fs.writeFileSync(META, JSON.stringify(meta, null, 1))
await b.close()
