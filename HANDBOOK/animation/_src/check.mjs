// 逐段逐句截圖檢查動畫，並列出頁面錯誤與「找不到標註框」的警告。
// 執行：node check.mjs "D:/.../XXX.html" [輸出資料夾=./check]   （只看某幾段：ONLY=4,13 node check.mjs ...）
// 之後跑：python sheet.py ./check   做成縮圖總表來看
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
const PW = process.env.PW ?? 'file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs'
const { chromium } = await import(PW)
const [file, out = './check'] = process.argv.slice(2)
if (!file) { console.log('usage: node check.mjs <html> [outdir]'); process.exit(1) }
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null
fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1600, height: 1150 } })
const errs = []
p.on('pageerror', e => errs.push(e.message))
p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text()) })
p.on('requestfailed', r => errs.push('fail ' + r.url()))
await p.addInitScript(() => { window.__noFreeze = true })   // 截圖要完整畫面：暫停中也讓動畫跑完
await p.goto(pathToFileURL(file).href)
await p.waitForTimeout(1500)
await p.click('#bVoice')
const n = await p.$$eval('#chips button', x => x.length)
for (let sc = 1; sc <= n; sc++) {
  if (ONLY && !ONLY.includes(sc)) continue
  await p.evaluate(h => { location.hash = h }, `#s${sc}-1`); await p.waitForTimeout(400)
  const steps = await p.$eval('#pos', e => +e.textContent.match(/(\d+)／(\d+) 句/)[2])
  for (let k = 0; k < steps; k++) {
    if (k) await p.click('#bNext')
    await p.waitForTimeout(3000)
    await p.locator('.stagebox').screenshot({ path: `${out}/s${String(sc).padStart(2, '0')}-${k + 1}.png` })
  }
}
const uniq = [...new Set(errs)]
console.log(uniq.length ? 'problems:\n  ' + uniq.join('\n  ') : 'no errors')
await b.close()
