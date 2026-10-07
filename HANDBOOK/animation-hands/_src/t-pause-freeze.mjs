// 暫停時切換句子，畫面要停住：找一句有延遲動作的，暫停中跳過去，等 4 秒畫面不能變；按播放後才變
// 用法：node t-pause-freeze.mjs <anim.html>
const { chromium } = await import('file:///D:/AIWORK/pw-shots-tmp/node_modules/playwright/index.mjs')
const file = 'file:///' + process.argv[2].split('\\').join('/')
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } })
const errs = []; p.on('pageerror', e => errs.push(e.message))
await p.goto(file + '#s1-1'); await p.waitForTimeout(1500)
const start = p.locator('#bStart'); if (await start.isVisible()) await start.click(); else await p.locator('#bPlay').click()
await p.waitForTimeout(1500)
await p.locator('#bPlay').click(); await p.waitForTimeout(300)               // 暫停
const snap = () => p.evaluate(() => [...document.querySelectorAll('#stage *')].map(e => (e.getAttribute('class') || '') + (e.getAttribute('opacity') || '') + (e.style.opacity || '')).join('|'))
const total = await p.evaluate(() => window.__animIndex.length)
let found = null
for (let sc = 1; sc <= total && !found; sc++) {
  const steps = await p.evaluate(i => window.__animIndex[i - 1].steps.length, sc)
  for (let k = 1; k <= steps; k++) {
    await p.evaluate(h => { location.hash = h }, `#s${sc}-${k}`); await p.waitForTimeout(250)
    const d = await p.evaluate(() => window.__dbg())
    if (!d.playing && d.pending > 0) { found = `s${sc}-${k}`; break }
  }
}
if (!found) { console.log('no sentence with delayed actions found'); await b.close(); process.exit(1) }
const d0 = await p.evaluate(() => window.__dbg())
const a = await snap(); await p.waitForTimeout(4000); const bb = await snap()
const d1 = await p.evaluate(() => window.__dbg())
console.log('sentence', found, 'paused:', !d0.playing, 'pending timers', d0.pending, '→', d1.pending, 'frame unchanged while paused:', a === bb)
await p.locator('#bPlay').click(); await p.waitForTimeout(4000)
const c = await snap(); const d2 = await p.evaluate(() => window.__dbg())
console.log('after play: playing', d2.playing, 'frame changed:', c !== bb, 'pending', d2.pending)
console.log('errors', JSON.stringify(errs))
await b.close()
