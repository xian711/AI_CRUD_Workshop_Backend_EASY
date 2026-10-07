// 圖面整張截：每個 <section> 的 svg 照原尺寸截（不縮），寫進 raw/meta-extra.json
// 用法：node cap-diag.mjs <html> <前綴>   例：node cap-diag.mjs file:///.../DIAGRAMS-裝備物資API.html be-diag
import fs from 'node:fs'
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const W = 'D:/AIWORK/pw-shots-tmp/crud-backend-2026-10-07', RAW = W + '/raw', META = RAW + '/meta-extra.json'
const meta = fs.existsSync(META) ? JSON.parse(fs.readFileSync(META, 'utf8')) : {}
const [url, pfx] = [process.argv[2], process.argv[3] || 'be-diag']
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2500, height: 1400 }, deviceScaleFactor: 1, locale: 'zh-TW' })
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000)
const n = await p.locator('section').count()
for (let i = 0; i < n; i++) {
  const sec = p.locator('section').nth(i), svg = sec.locator('svg').first()
  if (!(await svg.count())) continue
  const r = await svg.boundingBox(); const name = `${pfx}-${i + 1}`
  await svg.screenshot({ path: `${RAW}/${name}.png` })
  meta[name] = { w: Math.round(r.width), h: Math.round(r.height), boxes: {} }
  console.log('[shot]', name, Math.round(r.width) + 'x' + Math.round(r.height), (await sec.locator('h2').first().textContent()).trim())
}
fs.writeFileSync(META, JSON.stringify(meta, null, 1)); await b.close()
