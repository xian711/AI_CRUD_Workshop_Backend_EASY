// 檢查 DIAGRAMS 頁：四張 svg 都出來、沒有 mermaid 紅字；印每張 svg 的尺寸
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const url = process.argv[2] || 'file:///D:/AI_CRUD_Workshop_Backend_EASY/step3_new_module/my-equipment-api/docs/DIAGRAMS-裝備物資API.html'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1240, height: 644 } })
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000)
const info = await p.evaluate(() => ({
  svgs: [...document.querySelectorAll('svg')].map(s => { const r = s.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) }),
  err: (document.body.innerText.match(/Syntax error[^\n]*/g) || []).concat([...document.querySelectorAll('.error-text, [class*=error]')].map(e => e.textContent.slice(0, 80))),
  h2: [...document.querySelectorAll('h2')].map(e => e.textContent.trim()),
  fontSizes: [...document.querySelectorAll('svg text, svg tspan')].slice(0, 400).map(t => parseFloat(getComputedStyle(t).fontSize)).filter(Boolean).reduce((a, v) => { a[v] = (a[v] || 0) + 1; return a }, {})
}))
console.log(JSON.stringify(info))
await b.close()
