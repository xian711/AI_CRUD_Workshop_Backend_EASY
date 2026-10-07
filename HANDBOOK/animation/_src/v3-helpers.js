// ── 第三版：講稿（window.__script）驅動場景；字幕＝講稿＝配音，一字不差 ──
// sc3(第幾段, 畫面, [每一句的動作…])：句數要跟講稿一樣，不一樣就在主控台警告
function sc3(n, build, acts) {
  const S = window.__script[n - 1];
  if (!S) { console.warn('no script for scene', n); return; }
  if (acts.length !== S.lines.length) console.warn('scene', n, S.title, 'acts', acts.length, '!= lines', S.lines.length);
  const b = () => { const r = build() || {}; speakerBadge(S.who); return r; };
  scenes.push({ title: S.title, who: S.who, build: b, steps: S.lines.map((t, k) => [t, acts[k] || (() => {})]), chap: CHAPS.length - 1 });
}
function hd(n, eb) { mhead(eb, window.__script[n - 1].title); }
// 右上角：這一段誰講
function speakerBadge(who) {
  if (!who) return;
  const col = who === '小芸' ? C.coral : C.teal, role = who === '小芸' ? '方法和觀念' : '實拍示範';
  const g = grp(L, false); R(g, 1300, 14, 230, 40, { fill: '#0b1520', stroke: col, sw: 2, rx: 20 });
  mk('circle', { cx: 1322, cy: 34, r: 11, fill: col }, g);
  T(g, 1342, 42, who + '｜' + role, { size: 20, weight: 800, fill: col });
}
// 指令字卡：完整指令放在畫面上，聲音不逐字念
function cmdCard(x, y, w, lines, title, o = {}) {
  return codeCard(x, y, w, lines, { title: title || '照著打（手冊裡可以直接複製）', size: o.size || 26, col: o.col || C.gold });
}
// 一排流程方塊：[[字, 顏色]…]，回傳每一格（預設藏起來）
function flowRow(y, items, o = {}) {
  const w = o.w || 220, gap = o.gap || 25, h = o.h || 120, x0 = o.x ?? (800 - (items.length * w + (items.length - 1) * gap) / 2);
  return items.map(([t, col], i) => {
    const g = grp(L); const x = x0 + i * (w + gap);
    R(g, x, y, w, h, { fill: C.card, stroke: col, sw: 4 });
    T(g, x + w / 2, y + h / 2 - (t.split('\n').length - 1) * 18 + 12, t, { size: 30, anchor: 'middle', weight: 900, fill: col });
    if (i) T(g, x - gap / 2, y + h / 2 + 12, '→', { size: 30, anchor: 'middle', fill: C.mut });
    return g;
  });
}
