// Swagger 實拍：BASE=http://localhost:5080 TAG=template PREFIX=be02 node cap-swagger.mjs
// 拍：整頁五路由 → 展開 GET 全部、Try it out、Execute → 200 與 JSON；GET 一筆不存在 → 404
import fs from 'node:fs'
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07', RAW = W + '/raw', META = RAW + '/meta-extra.json'
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {}
const base = process.env.BASE || 'http://localhost:5080', tag = process.env.TAG || 'template', pfx = process.env.PREFIX || 'be02'
const route = tag === 'template' ? '/api/template/members' : '/api/equipment/items'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1240, height: 644 }, deviceScaleFactor: 1.9, locale: 'zh-TW' })
const p = await ctx.newPage(); p.setDefaultTimeout(20000)
async function bx(loc) { const r = await loc.boundingBox({ timeout: 3000 }).catch(() => null); return r ? [r.x, r.y, r.width, r.height].map(Math.round) : null }
async function shot(name, boxes = {}) {
  const out = {}; for (const [k, v] of Object.entries(boxes)) out[k] = typeof v === 'string' ? await bx(p.locator(v).first()) : Array.isArray(v) ? v : await bx(v)
  await p.screenshot({ path: `${RAW}/${name}.png` }); meta[name] = { w: 1240, h: 644, url: p.url(), boxes: out }; fs.writeFileSync(META, JSON.stringify(meta, null, 1))
  console.log('[shot]', name, Object.entries(out).filter(([, v]) => !v).map(([k]) => k).join(',') || '')
}
try {
  await p.goto(base + '/swagger', { waitUntil: 'networkidle' }); await sleep(1500)
  const blocks = p.locator('.opblock')
  const n = await blocks.count(); console.log('opblocks', n)
  // 整頁：五路由
  await shot(`${pfx}-swagger`, { title: '.title, h2.title', get: blocks.filter({ hasText: route }).filter({ hasText: 'GET' }).first(), post: blocks.filter({ hasText: 'POST' }).first(), del: blocks.filter({ hasText: 'DELETE' }).first() })
  // 展開 GET 全部 → Try it out → Execute
  const getAll = p.locator('.opblock.opblock-get').filter({ has: p.locator(`[data-path="${route}"]`) }).first()
  await getAll.locator('.opblock-summary').click(); await sleep(800)
  await getAll.locator('button.try-out__btn').click(); await sleep(500)
  await getAll.locator('button.execute').click(); await sleep(2500)
  await getAll.locator('.responses-wrapper').scrollIntoViewIfNeeded(); await sleep(400)
  await shot(`${pfx}-swagger-get`, { code: getAll.locator('.responses-table .response .response-col_status').first(), body: getAll.locator('.responses-table .response .highlight-code, .responses-table .response pre').first(), exec: getAll.locator('button.execute') })
  // GET 一筆不存在 → 404
  await p.goto(base + '/swagger', { waitUntil: 'networkidle' }); await sleep(1000)
  const getOne = p.locator('.opblock.opblock-get').filter({ has: p.locator(`[data-path="${route}/{id}"]`) }).first()
  await getOne.locator('.opblock-summary').click(); await sleep(800)
  await getOne.locator('button.try-out__btn').click(); await sleep(400)
  await getOne.locator('input').first().fill(tag === 'template' ? 'M-999' : 'E-999'); await getOne.locator('button.execute').click(); await sleep(2000)
  await getOne.locator('.responses-wrapper').scrollIntoViewIfNeeded(); await sleep(400)
  await shot(`${pfx}-swagger-404`, { code: getOne.locator('.responses-table .response .response-col_status').first(), body: getOne.locator('.responses-table .response .highlight-code, .responses-table .response pre').first() })
} catch (e) { console.log('ERROR', e.message); await p.screenshot({ path: RAW + '/_err-swagger.png' }).catch(() => {}) } finally { await b.close() }
