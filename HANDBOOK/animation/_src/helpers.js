/* 截圖教學動畫共用小工具（由 build.py 放在場景檔之前）*/
const scenes=[];
function scene(title,build,steps){scenes.push({title,build,steps});}
let uid=0;
const META=/*META*/{};
let HC='#f4b942';  // 標註框預設色：深色截圖用金色；淺色系統畫面在場景檔第一行寫 HC='#ff8a1f';
const FR={x:120,y:116,w:1360,h:765};          // 一般：整張截圖
const FD={x:430,y:128,w:1130,h:636};          // 示範：左邊步驟、右邊截圖
const FW={x:70,y:170,w:1460,h:616};           // 超寬 2560×1080
const FA={x:150,y:116,w:1300,h:731};          // 下方留一行註記
function tw(s,size){let w=0;for(const ch of String(s))w+=ch.charCodeAt(0)>0x2e7f?size:size*0.6;return w;}
function mhead(eb,title){T(L,70,52,eb,{size:24,fill:C.coral,weight:700});T(L,70,100,title,{size:42,weight:900});}
/* 一張系統畫面；回傳群組 g（g.inner 可放大，標註都放在 inner 裡跟著放大） */
function scr(name,F=FR){const m=META[name]||{w:1920,h:1080,boxes:{}};const g=grp(L);
  const id='cl'+(++uid);const cp=mk('clipPath',{id},defs);mk('rect',{x:F.x,y:F.y,width:F.w,height:F.h,rx:8},cp);
  R(g,F.x-5,F.y-5,F.w+10,F.h+10,{fill:'#050d16',stroke:C.line,sw:4,rx:12});
  const c=mk('g',{'clip-path':`url(#${id})`},g);const inner=mk('g',{},c);
  mk('image',{href:'images/'+name+'.jpg',x:F.x,y:F.y,width:F.w,height:F.h,preserveAspectRatio:'none'},inner);
  g.inner=inner;g.F=F;g.m=m;g.k=F.w/m.w;g.nm=name;return g;}
/* 截圖座標（原始畫面像素）→ 舞台座標 */
function rb(g,k,pad=0){const b=Array.isArray(k)?k:g.m.boxes[k];if(!b){console.warn('no box',g.nm,k);return{x:g.F.x,y:g.F.y,w:10,h:10};}
  const s=g.k;return{x:g.F.x+b[0]*s-pad,y:g.F.y+b[1]*s-pad,w:b[2]*s+2*pad,h:b[3]*s+2*pad};}
/* 標註框＋標籤 */
function hl(r,g,k,label,o={}){const q=rb(g,k,o.pad??5);const col=o.col||HC;const h=grp(g.inner);
  R(h,q.x,q.y,q.w,q.h,{fill:o.fill||'none',stroke:col,sw:o.sw||5,rx:10});
  if(label){const size=o.size||26;const lw=tw(label,size)+30;const F=g.F;
    let lx=o.right?(q.x+q.w-lw):q.x;if(o.lx!=null)lx=o.lx;lx=Math.min(Math.max(lx,F.x+6),F.x+F.w-lw-6);
    let ly=o.below?(q.y+q.h+8):(q.y-size-24);if(o.inside)ly=q.y+8;
    if(ly<F.y+4)ly=q.y+q.h+8;if(ly+size+18>F.y+F.h)ly=Math.max(F.y+4,q.y-size-24);
    R(h,lx,ly,lw,size+18,{fill:col,rx:8});T(h,lx+lw/2,ly+size*0.95+3,label,{size,anchor:'middle',weight:900,fill:C.bg});}
  (r.H=r.H||[]).push(h);return h;}
/* 點擊示意：金色圓點＋擴散圈 */
function ping(r,g,k){const q=rb(g,k,0);const cx=q.x+q.w/2,cy=q.y+q.h/2;const h=grp(g.inner);
  mk('circle',{cx,cy,r:13,fill:C.gold,stroke:C.bg,'stroke-width':3},h);mk('circle',{cx,cy,r:13,fill:'none',stroke:C.gold,'stroke-width':5,class:'ping'},h);
  (r.H=r.H||[]).push(h);return h;}
/* 聚光：其他地方變暗 */
function spot(r,g,k,pad=8){const q=rb(g,k,pad);const F=g.F;const h=grp(g.inner);
  mk('path',{d:`M${F.x-3000},${F.y-3000}h${F.w+6000}v${F.h+6000}h${-(F.w+6000)}z M${q.x},${q.y}v${q.h}h${q.w}v${-q.h}z`,fill:'rgba(3,8,14,.6)','fill-rule':'evenodd'},h);
  (r.H=r.H||[]).push(h);return h;}
/* 只顯示指定的標註（其他收起來） */
function only(r,...list){list=list.flat();(r.H||[]).forEach(h=>{if(!list.includes(h))hide(h);});list.forEach((h,i)=>later(i*350,()=>{show(h);glow(h);}));}
/* 放大到某一塊 */
function zoom(g,k,o={}){const q=rb(g,k,o.pad??40);const F=g.F;let z=Math.min(F.w/q.w,F.h/q.h,o.max||2);if(z<1)z=1;
  const hw=F.w/2/z,hh=F.h/2/z;let cx=q.x+q.w/2,cy=q.y+q.h/2;cx=Math.min(Math.max(cx,F.x+hw),F.x+F.w-hw);cy=Math.min(Math.max(cy,F.y+hh),F.y+F.h-hh);
  move(g.inner,`translate(${F.x+F.w/2-z*cx}px,${F.y+F.h/2-z*cy}px) scale(${z})`);}
function unzoom(g){move(g.inner,'');}
/* 換到另一張畫面（淡入，舊的稍後收起） */
function to(r,g){show(g);(r.S||[]).forEach(o=>{if(o!==g)later(650,()=>hide(o));});}
function shots(r,names,F){r.S=names.map(n=>scr(n,F));return r.S;}
/* 示範用：左邊的步驟清單 */
function stepList(labels,y0=150,gap=150){const g=grp(L,false);const items=labels.map((t,i)=>{const it=grp(g,false);const y=y0+i*gap;
    const bx=R(it,40,y,350,104,{fill:C.card,stroke:C.line,sw:3});mk('circle',{cx:88,cy:y+52,r:28,fill:C.line},it);T(it,88,y+63,String(i+1),{size:30,anchor:'middle',weight:900,fill:C.ink});
    T(it,130,y+64,t,{size:29,weight:800});if(i<labels.length-1)T(it,215,y+gap-10,'▼',{size:24,anchor:'middle',fill:C.mut});it._bx=bx;it._c=it.querySelector('circle');return it;});
  g.set=n=>items.forEach((it,j)=>{it._bx.setAttribute('stroke',j===n?C.gold:C.line);it._bx.setAttribute('fill',j===n?'#2a2410':C.card);it._c.setAttribute('fill',j<=n?C.gold:C.line);dim(it,j>n);});
  g.set(-1);return g;}
function caseBar(text){return box(L,430,788,1130,76,text,{size:28,fill:'#2a2410',stroke:C.gold,sw:2,color:C.gold,hidden:false});}
function note(text,y=900-18){return T(L,800,y,text,{size:20,anchor:'middle',fill:C.mut});}


/* 依圖片比例放進指定區域 */
function fitF(name,A={x:70,y:116,w:1460,h:765}){const m=META[name];const k=Math.min(A.w/m.w,A.h/m.h);const w=m.w*k,h=m.h*k;return{x:A.x+(A.w-w)/2,y:A.y+(A.h-h)/2,w,h};}
function fshots(r,list){r.S=list.map(([n,A])=>scr(n,fitF(n,A)));return r.S;}
function card(x,y,w,h,title,lines,col,o={}){const g=grp(L,o.hidden!==false);R(g,x,y,w,h,{fill:C.card,stroke:col,sw:3});T(g,x+22,y+44,title,{size:o.ts||30,weight:900,fill:col});
  lines.forEach((t,i)=>T(g,x+26,y+88+i*(o.lh||40),t,{size:o.size||25}));return g;}
