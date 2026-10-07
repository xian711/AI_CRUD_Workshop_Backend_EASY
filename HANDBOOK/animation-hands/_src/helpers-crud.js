/* ===== AI CRUD 工作坊動畫專用小工具（接在技能的 helpers.js 後面）=====
   chapter()：章節（step0～step5）；term()：大字版終端機（逐字打指令、逐行出結果）；
   bwin()：瀏覽器外框＋網址列；cursor()/clickAt()：滑鼠游標移過去點一下；keys()：按鍵圖示；codeCard()：大字指令卡。 */
const CHAPS = [];
function chapter(tag, title, color) { CHAPS.push({ tag, title, color: color || C.gold }); }
function scene(title, build, steps) { scenes.push({ title, build, steps, chap: CHAPS.length - 1 }); }
window.__chaps = CHAPS;

const MONO = "'JetBrains Mono','Cascadia Mono',Consolas,'Noto Sans TC','Microsoft JhengHei',monospace";
const TC = { bg: '#181818', bar: '#1f1f1f', line: '#3c3c3c', ink: '#d4d4d4', mut: '#8b949e', cmd: '#f2cc60', ok: '#23d18b', warn: '#f5f543', err: '#f14c4c', link: '#3b8eea', cyan: '#29b8db', flag: '#9da5b4' };

/* 外框（截圖用）：不畫深色邊框的 scr，給瀏覽器外框裡面用 */
function scrIn(name, F, parent) {
  const m = META[name] || { w: 1600, h: 900, boxes: {} }; const g = grp(parent || L);
  const id = 'cl' + (++uid); const cp = mk('clipPath', { id }, defs); mk('rect', { x: F.x, y: F.y, width: F.w, height: F.h }, cp);
  const c = mk('g', { 'clip-path': `url(#${id})` }, g); const inner = mk('g', {}, c);
  mk('image', { href: 'images/' + name + '.jpg', x: F.x, y: F.y, width: F.w, height: F.h, preserveAspectRatio: 'none' }, inner);
  g.inner = inner; g.F = F; g.m = m; g.k = F.w / m.w; g.nm = name; return g;
}

/* 瀏覽器外框：上面一條網址列（大字），下面放截圖。回傳 {g, S:[截圖…], ut}；預設藏起來，用 show(bw.g) 顯示 */
const BW = { x: 120, y: 112, w: 1360, h: 770, bar: 64 };
function bwin(names, url, A = BW, o = {}) {
  const g = grp(L, o.hidden !== false);
  R(g, A.x - 4, A.y - 4, A.w + 8, A.h + 8, { fill: '#e8eaed', stroke: '#9aa0a6', sw: 3, rx: 14 });
  [['#ff5f57', 0], ['#febc2e', 1], ['#28c840', 2]].forEach(([c, i]) => mk('circle', { cx: A.x + 26 + i * 26, cy: A.y + A.bar / 2, r: 8, fill: c }, g));
  R(g, A.x + 112, A.y + 11, A.w - 136, A.bar - 22, { fill: '#ffffff', stroke: '#dadce0', sw: 2, rx: 21 });
  T(g, A.x + 136, A.y + A.bar / 2 + 10, '🔒', { size: 22 });
  const ut = T(g, A.x + 172, A.y + A.bar / 2 + 11, url || '', { size: 30, weight: 700, fill: '#202124' }); ut.classList.add('mono'); ut.style.fontFamily = MONO;
  const F = { x: A.x, y: A.y + A.bar, w: A.w, h: A.h - A.bar };
  const S = names.map(n => scrIn(n, F, g));
  return { g, S, ut, F };
}
/* 在一組截圖裡換到另一張（淡入，其他稍後收起） */
function swap(list, g) { show(g); list.forEach(o => { if (o !== g) later(650, () => hide(o)); }); }
/* 換網址（typing=true 會一個字一個字打出來） */
function burl(bw, text, typing) {
  const ut = bw.ut;
  if (!typing) { ut.textContent = text; return; }
  ut.textContent = ''; [...text].forEach((ch, i) => later(i * 45, () => { ut.textContent = text.slice(0, i + 1); }));
}

/* 大字版終端機。o: {x,y,w,h,size,title,path}；回傳 api：
   t.cmd(指令,{path,typing})：印提示字元並逐字打指令；t.out([行…],{gap})：逐行出結果；
   t.mark(第幾行,標籤,顏色)：框住某一行；t.clear()：清空。行文字開頭是 [PASS]/[WARN]/[FAIL] 會自動上色。 */
function term(o = {}) {
  const x = o.x ?? 80, y = o.y ?? 120, w = o.w ?? 1440, h = o.h ?? 640, size = o.size ?? 30, lh = o.lh ?? Math.round(size * 1.55);
  const g = grp(L, o.hidden !== false);
  R(g, x, y, w, h, { fill: TC.bg, stroke: TC.line, sw: 3, rx: 16 });
  R(g, x, y, w, 58, { fill: TC.bar, rx: 16 }); R(g, x, y + 40, w, 18, { fill: TC.bar, rx: 0 });
  mk('line', { x1: x, y1: y + 58, x2: x + w, y2: y + 58, stroke: TC.line, 'stroke-width': 2 }, g);
  T(g, x + 30, y + 39, o.title || '終端機', { size: 24, weight: 800, fill: '#ffffff' });
  mk('rect', { x: x + 26, y: y + 50, width: 80, height: 4, fill: C.gold }, g);
  T(g, x + w - 30, y + 39, o.shell || 'powershell', { size: 22, anchor: 'end', fill: TC.mut });
  if (o.note) T(g, x + w / 2, y + 39, o.note, { size: 22, anchor: 'middle', fill: C.gold, weight: 700 });
  const id = 'tc' + (++uid); const cp = mk('clipPath', { id }, defs); mk('rect', { x: x + 8, y: y + 70, width: w - 16, height: h - 78 }, cp);
  const body = mk('g', { 'clip-path': `url(#${id})` }, g); const marks = mk('g', {}, body); const inner = mk('g', {}, body);
  const cap = Math.floor((h - 84) / lh); let n = 0; const x0 = x + 30, y0 = y + 62 + 14 + size;
  let path = o.path || 'D:\\AI_CRUD_Workshop_Frontend_EASY';
  const cur = mk('rect', { x: x0, y: y0 - size, width: size * 0.55, height: size * 1.15, fill: '#ffffff', class: 'tcursor' }, inner);
  const api = { g, lines: [], x, y, w, h, size, lh };
  function scroll() { const over = Math.max(0, n - cap); const t = `translateY(${-over * lh}px)`; inner.style.transform = t; marks.style.transform = t; }
  function color(s) { if (/^\[PASS\]/.test(s)) return TC.ok; if (/^\[WARN\]/.test(s)) return TC.warn; if (/^\[FAIL\]/.test(s)) return TC.err; if (/^\s*修復提示/.test(s)) return TC.err; return null; }
  // 像真的終端機一樣：一行太長就折到下一行（中文字算 1 個字寬，英數算 0.6 個字寬）
  const maxW = w - 60, cw = ch => /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(ch) ? size : size * 0.6;
  function split(parts, first = 0) {
    const rows = [[]]; let used = first;
    parts.forEach(([s, c, wt]) => { let buf = '';
      [...s].forEach(ch => { const d = cw(ch); if (used + d > maxW && used > 0) { if (buf) rows[rows.length - 1].push([buf, c, wt]); rows.push([]); buf = ''; used = 0; } buf += ch; used += d; });
      if (buf) rows[rows.length - 1].push([buf, c, wt]); });
    return rows;
  }
  function addLine(parts) {
    const t = mk('text', { x: x0, y: y0 + n * lh, 'font-size': size }, inner); t.style.fontFamily = MONO;
    parts.forEach(([s, c, wt]) => mk('tspan', { text: s, fill: c || TC.ink, 'font-weight': wt || 500 }, t));
    n++; api.lines.push(t); scroll(); return t;
  }
  // 一個邏輯行可能折成好幾列：第一列記住全部列（t._rows），框線時框住全部
  function addRows(parts) { const rows = split(parts).map(addLine); rows[0]._rows = rows; return rows[0]; }
  function park(t) { const bb = t.getBBox(); cur.setAttribute('x', bb.x + bb.width + 4); cur.setAttribute('y', +t.getAttribute('y') - size * 0.92); }
  api.prompt = (p2) => { if (p2) path = p2; const t = addLine([[`PS ${path}> `, TC.ink]]); park(t); return t; };
  api.cmd = (command, o2 = {}) => {
    if (o2.path) path = o2.path;
    const P = `PS ${path}> `; const t = addLine([[P, TC.ink]]);
    const sp = command.indexOf(' '); const head = sp < 0 ? command : command.slice(0, sp); const rest = sp < 0 ? '' : command.slice(sp);
    const all = head + rest; const chars = [...all];
    // 算出每個字落在第幾列：第一列接在提示字元後面，放不下就換到新的一列
    let used = [...P].reduce((s, ch) => s + cw(ch), 0); const rowOf = []; let row = 0;
    chars.forEach(ch => { const d = cw(ch); if (used + d > maxW) { row++; used = 0; } rowOf.push(row); used += d; });
    const els = [t]; for (let i = 1; i <= row; i++) els.push(addLine([]));
    const spans = els.map(e => [mk('tspan', { text: '', fill: TC.cmd, 'font-weight': 700 }, e), mk('tspan', { text: '', fill: '#ffffff', 'font-weight': 600 }, e)]);
    t._rows = els;
    const paint = k => { const buf = els.map(() => ['', '']); chars.slice(0, k).forEach((ch, i) => { buf[rowOf[i]][i < head.length ? 0 : 1] += ch; });
      spans.forEach(([a, b], i) => { a.textContent = buf[i][0]; b.textContent = buf[i][1]; }); park(els[k ? rowOf[k - 1] : 0]); };
    const step = o2.cps ? 1000 / o2.cps : 55; const t0 = o2.delay ?? 300;
    if (o2.typing === false) { paint(chars.length); return t; }
    paint(0);
    chars.forEach((ch, i) => later(t0 + i * step, () => paint(i + 1)));
    return t;
  };
  api.out = (lines, o2 = {}) => {
    const gap = o2.gap ?? 140, t0 = o2.delay ?? 0; const made = [];
    lines.forEach((s, i) => {
      const parts = Array.isArray(s) ? s : [[s, color(s) || o2.color, color(s) ? 700 : 500]];
      const t = addRows(parts); made.push(t); t._rows.forEach(e => e.classList.add('hid'));
      later(t0 + i * gap, () => { t._rows.forEach(e => e.classList.remove('hid')); park(t._rows[t._rows.length - 1]); });
    });
    return made;
  };
  api.mark = (t, label, col = C.gold, o2 = {}) => {
    const hg = grp(marks, true); const bb = (t._rows || [t]).map(e => e.getBBox()).reduce((a, b) => {
      const x1 = Math.min(a.x, b.x), y1 = Math.min(a.y, b.y); return { x: x1, y: y1, width: Math.max(a.x + a.width, b.x + b.width) - x1, height: Math.max(a.y + a.height, b.y + b.height) - y1 }; });
    R(hg, bb.x - 12, bb.y - 6, Math.max(bb.width + 24, o2.minw || 0), bb.height + 12, { fill: 'rgba(244,185,66,.10)', stroke: col, sw: 4, rx: 10 });
    if (label) { const lw = tw(label, 24) + 28; const bw2 = Math.max(bb.width + 24, o2.minw || 0);
      // 標籤放在這一行的右邊（不壓到上下行）；右邊放不下就貼著終端機右緣
      // 折成好幾列時，放在最後一列（通常比較短）的字後面
      const rows = t._rows || [t]; const lb = rows.length > 1 ? rows[rows.length - 1].getBBox() : null;
      let lx = lb ? lb.x + lb.width + 24 : bb.x - 12 + bw2 + 14; if (lx + lw > x + w - 14) lx = x + w - lw - 14;
      const ly = lb ? lb.y + lb.height / 2 - 19 : bb.y + bb.height / 2 - 19;
      R(hg, lx, ly, lw, 38, { fill: col, rx: 8 }); T(hg, lx + lw / 2, ly + 28, label, { size: 24, weight: 900, anchor: 'middle', fill: C.bg }); }
    return hg;
  };
  api.clear = () => { [...inner.querySelectorAll('text')].forEach(e => e.remove()); [...marks.children].forEach(e => e.remove()); n = 0; api.lines = []; scroll(); };
  api.hideCursor = () => cur.classList.add('hid');
  return api;
}

/* 滑鼠游標：cursor(r) 建一個（放在最上層），clickAt(r, g, 鍵或[x,y,w,h]) 移過去並點一下 */
function cursor(r) {
  const g = grp(L, true, 'mcur'); g.style.transform = 'translate(1500px,820px)';
  mk('path', { d: 'M0,0 L0,40 L11,30 L18,47 L25,44 L18,28 L32,28 Z', fill: '#ffffff', stroke: '#111111', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  r.cur = g; return g;
}
/* 放大／還原：和 helpers.js 的版本一樣，另外記下放大的位移與倍率（g._zt），讓游標跟著換算 */
function zoom(g, k, o = {}) {
  const q = rb(g, k, o.pad ?? 40); const F = g.F; let z = Math.min(F.w / q.w, F.h / q.h, o.max || 2); if (z < 1) z = 1;
  const hw = F.w / 2 / z, hh = F.h / 2 / z; let cx = q.x + q.w / 2, cy = q.y + q.h / 2;
  cx = Math.min(Math.max(cx, F.x + hw), F.x + F.w - hw); cy = Math.min(Math.max(cy, F.y + hh), F.y + F.h - hh);
  g._zt = { tx: F.x + F.w / 2 - z * cx, ty: F.y + F.h / 2 - z * cy, z };
  move(g.inner, `translate(${g._zt.tx}px,${g._zt.ty}px) scale(${z})`);
}
function unzoom(g) { g._zt = null; move(g.inner, ''); }
function clickAt(r, g, k, o = {}) {
  const q = g ? rb(g, k, 0) : { x: k[0], y: k[1], w: k[2] || 0, h: k[3] || 0 };
  let cx = q.x + q.w * (o.fx ?? 0.5), cy = q.y + q.h * (o.fy ?? 0.5);
  // 截圖放大中：把截圖上的座標換成舞台座標
  if (g && g._zt) { cx = g._zt.tx + g._zt.z * cx; cy = g._zt.ty + g._zt.z * cy; }
  L.appendChild(r.cur); show(r.cur); later(30, () => { r.cur.style.transform = `translate(${cx}px,${cy}px)`; });
  if (o.click !== false) later(1250, () => { const c = mk('circle', { cx, cy, r: 16, fill: 'none', stroke: C.gold, 'stroke-width': 6, class: 'ping' }, L); later(1800, () => c.remove()); });
}

/* 按鍵圖示：keys(x, y, ['Ctrl','`'])，回傳群組（預設藏起來） */
function keys(x, y, list, o = {}) {
  const g = grp(L, o.hidden !== false); const size = o.size || 34; let cx = x;
  list.forEach((k, i) => {
    if (i) { T(g, cx + 14, y + size * 1.05, '+', { size, weight: 900, fill: C.mut }); cx += 44; }
    const w = Math.max(size * 1.6, tw(k, size) + 36);
    R(g, cx, y, w, size * 1.6, { fill: '#f4f6f8', stroke: '#aab4be', sw: 3, rx: 10 }); R(g, cx, y + size * 1.6 - 8, w, 8, { fill: '#aab4be', rx: 4 });
    T(g, cx + w / 2, y + size * 1.12, k, { size, weight: 900, anchor: 'middle', fill: '#1d2733' }); cx += w;
  });
  g.w = cx - x; return g;
}

/* 大字指令卡：要學員照打的指令 */
function codeCard(x, y, w, lines, o = {}) {
  const size = o.size || 30, lh = Math.round(size * 1.5), h = o.h || (lines.length * lh + 70);
  const g = grp(L, o.hidden !== false);
  R(g, x, y, w, h, { fill: '#0b1520', stroke: o.col || C.teal, sw: 3, rx: 14 });
  T(g, x + 22, y + 36, o.title || '照著打', { size: 22, weight: 800, fill: o.col || C.teal });
  lines.forEach((s, i) => { const t = T(g, x + 26, y + 50 + size + i * lh, s, { size, weight: 700, fill: /^#/.test(s) ? C.mut : '#ffffff' }); t.style.fontFamily = MONO; });
  return g;
}

/* 一句話重點條（畫面下方） */
function tip(text, o = {}) { return box(L, o.x ?? 120, o.y ?? 800, o.w ?? 1360, o.h ?? 76, text, { size: o.size || 30, fill: '#2a2410', stroke: o.col || C.gold, sw: 3, color: o.col || C.gold, weight: 800, hidden: o.hidden !== false }); }
