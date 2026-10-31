/* Bảng trắng dùng chung cho giáo án (cô viết / tô màu ngay trong trang, không phải chuyển sang Google Docs).
   Gắn cuối trang:  <script src="../bang.js"></script>  (đường dẫn theo độ sâu của trang; đặt sau dd.js, chieu.js nếu có)
   - Nút “✏ Bảng” cuối thanh chọn buổi (không có nav thì nổi góc phải dưới); đang chiếu (chieu.js) thì nút nằm trên thanh chiếu.
   - Hai kiểu: “⬜ Bảng trắng” (nền trắng / kẻ ô, nhiều trang) và “📄 Vẽ lên trang” (viết đè lên học liệu, nét đi theo trang khi cuộn,
     mỗi thẻ / buổi một lớp riêng; “✋” = tạm thôi vẽ để cuộn, bấm nút trong trang).
   - Công cụ: bút, bút tô (vàng trong), T = khung chữ nền vàng cố định trên màn hình (kéo đầu khung để dời, kéo góc để đổi cỡ; T / — ẩn, bấm T hiện lại, chữ giữ nguyên), tẩy (chạm nét nào xóa nét đó), 6 màu, 3 cỡ, ↶ ↷, Xóa hết.
   - Bảng trắng mặc định là cửa sổ nổi (⠿ kéo dời, góc dưới phải đổi cỡ, ⧉ / ⛶ thu nhỏ / cả màn hình): trang bên cạnh vẫn bấm chọn đáp án được.
   - “Trên trang”: chạm nhẹ = bấm vào trang (chọn đáp án, bấm nút), kéo = vẽ.
   - Tự nạp tra-tu.js (nhấp đúp từ tiếng Hàn → nghĩa, “📖 Sổ từ”).
   - Phím: B bật / tắt bảng · Esc đóng · Ctrl+Z / Ctrl+Y. Nét vẽ lưu trên máy (localStorage `nari-bang`, theo từng trang), mở lại vẫn còn. */
(function(){
  if(window.__bang)return;window.__bang=1;
  var ME=document.currentScript;
  var LS='nari-bang',PG=location.pathname;
  var COL=['#1d1a2c','#E0313F','#1f5fd1','#1b8a3a','#53468F','#e08a00'],HL=['#ffe14d','#7ee0ff','#9cf29c','#ffb3d9'];
  var SZ=[2.5,5,10];
  var st={w:[[]],p:{}},cfg={tool:'pen',c:0,hc:0,z:1,grid:0,win:1},mode='w',page=0,on=false,hand=false;
  var redoS=[],ov,bar,base,live,bx,lx,dpr=1,cur=null,nb,nt,penSeen=0,btn,org=[0,0],t0=0;
  try{var all=JSON.parse(localStorage.getItem(LS)||'{}');if(all[PG])st=all[PG];if(all._cfg)for(var k in all._cfg)cfg[k]=all._cfg[k];}catch(e){}
  if(!st.w||!st.w.length)st.w=[[]];if(!st.p)st.p={};if(!st.n)st.n={s:'',z:26,show:0};if(cfg.tool==='text')cfg.tool='pen';
  function save(){try{var all=JSON.parse(localStorage.getItem(LS)||'{}');all[PG]=st;all._cfg=cfg;localStorage.setItem(LS,JSON.stringify(all));}catch(e){}}

  var css=
'.bang-btn{flex:none;font-family:inherit;font-weight:bold;font-size:15px;line-height:1.2;padding:4px 10px;border:2px solid var(--ink,#53468F);border-radius:8px;background:var(--bg,#fff);color:var(--ink,#53468F);cursor:pointer}'+
'.bang-btn small{display:block;font-weight:normal;font-size:12px}.bang-btn:hover{background:var(--ink,#53468F);color:#fff}'+
'nav.bgn{display:flex;align-items:stretch;gap:6px}nav.bgn>.bar{flex:1;min-width:0}'+
'.bang-btn.fl{position:fixed;right:10px;bottom:60px;z-index:60;box-shadow:0 2px 8px rgba(0,0,0,.15)}'+
'@media (max-width:560px){.bang-btn{padding:4px 6px;font-size:16px}.bang-btn small{font-size:10px}}'+
'@media print{.bang-btn,#bang{display:none!important}}'+
'#bang{position:fixed;inset:0;z-index:10000;display:none;touch-action:none}#bang.on{display:block}'+
'#bang.w{background:#fff}#bang.w.grid{background:#fff linear-gradient(#e6e3f0 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,#e6e3f0 1px,transparent 1px) 0 0/40px 40px}'+
'#bang.p{background:transparent}#bang.hand{pointer-events:none}#bang.hand #bgbar,#bang.hand #bgbar *{pointer-events:auto}'+
'#bang.win{inset:auto;border:3px solid #53468F;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.3);resize:both;overflow:hidden;min-width:260px;min-height:200px}'+
'#bang.win #bgbar{left:0;right:0;top:0;transform:none;max-width:none;border-radius:0}#bgbar .dg{cursor:move;touch-action:none}'+
'#bang canvas{position:absolute;left:0;top:0;width:100%;height:100%}'+
'#bang.t-pen canvas,#bang.t-hl canvas{cursor:crosshair}#bang.t-er canvas{cursor:cell}'+
'#bgbar{position:absolute;left:50%;top:6px;transform:translateX(-50%);max-width:calc(100% - 12px);box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;'+
'padding:5px 8px;background:rgba(29,26,44,.94);color:#fff;border-radius:12px;font:14px/1.2 Arial,sans-serif;box-shadow:0 3px 12px rgba(0,0,0,.25);z-index:2}'+
'#bgbar button{font:bold 15px Arial,sans-serif;min-width:36px;height:36px;padding:0 8px;border:1px solid #666;border-radius:8px;background:#2c2840;color:#fff;cursor:pointer}'+
'#bgbar button:hover{background:#53468F}#bgbar button.on{background:#D4A843;color:#1d1a2c;border-color:#D4A843}'+
'#bgbar .sw{min-width:28px;width:28px;height:28px;padding:0;border-radius:50%;border:2px solid #fff3}#bgbar .sw.on{border:3px solid #fff;box-shadow:0 0 0 2px #D4A843}'+
'#bgbar .dt{display:inline-block;border-radius:50%;background:#fff;vertical-align:middle}'+
'#bgbar .sp{width:1px;height:26px;background:#fff3;margin:0 3px}#bgbar .pg{min-width:44px;text-align:center;opacity:.9}'+
'#bgnote{position:absolute;z-index:3;display:none;flex-direction:column;min-width:200px;min-height:110px;resize:both;overflow:hidden;pointer-events:auto;'+
'background:#FFF6CC;border:3px solid #D4A843;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.25)}#bgnote.on{display:flex}'+
'#bgnote .nh{flex:none;display:flex;align-items:center;gap:4px;padding:4px 6px;background:#D4A843;color:#1d1a2c;font:bold 14px Arial,sans-serif;cursor:move;touch-action:none;user-select:none}'+
'#bgnote .nh span{flex:1}#bgnote .nh button{font:bold 14px Arial,sans-serif;min-width:30px;height:28px;border:0;border-radius:6px;background:#fff8;color:#1d1a2c;cursor:pointer}'+
'#bgnote .nh button:hover{background:#fff}'+
'#bgnote textarea{flex:1;width:100%;box-sizing:border-box;border:0;padding:8px 12px;background:transparent;color:#1d1a2c;resize:none;outline:none;'+
'font-family:"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",Arial,sans-serif;line-height:1.35}'+
'@media (max-width:620px){#bgbar{top:auto;bottom:6px}#bgbar button{min-width:32px;height:32px;padding:0 6px}}';

  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
  function key(){return (location.hash||'#').replace(/&?cf=\d+/,'').replace(/^#&/,'#')||'#';}
  function list(){if(mode==='w')return st.w[page];var k=key();return st.p[k]||(st.p[k]=[]);}
  function isWin(){return mode==='w'&&cfg.win;}
  function W(){return ov&&isWin()?ov.clientWidth:innerWidth;}
  function H(){return ov&&isWin()?ov.clientHeight:innerHeight;}
  function oy(){return mode==='p'?scrollY:0;}
  function ox(){return mode==='p'?scrollX:0;}

  function size(){
    dpr=window.devicePixelRatio||1;
    placeWin();[base,live].forEach(function(c){c.width=Math.round(W()*dpr);c.height=Math.round(H()*dpr);});
    redraw();
  }
  function font(s){return (s.z*1)+'px "Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",Arial,sans-serif';}
  function drawS(x,s){
    var dx=-ox(),dy=-oy();
    x.save();x.setTransform(dpr,0,0,dpr,dx*dpr,dy*dpr);
    if(s.t==='x'){x.fillStyle=s.c;x.font=font(s);x.textBaseline='top';
      s.s.split('\n').forEach(function(l,i){x.fillText(l,s.x,s.y+i*s.z*1.25);});x.restore();return;}
    var p=s.p;x.lineCap='round';x.lineJoin='round';x.strokeStyle=s.c;x.lineWidth=s.w;
    if(s.t==='h'){x.globalAlpha=.38;x.lineCap='butt';}
    x.beginPath();x.moveTo(p[0],p[1]);
    if(p.length<=2){x.lineTo(p[0]+.1,p[1]);}
    else{for(var i=2;i<p.length-2;i+=2){var mx=(p[i]+p[i+2])/2,my=(p[i+1]+p[i+3])/2;x.quadraticCurveTo(p[i],p[i+1],mx,my);}
      x.lineTo(p[p.length-2],p[p.length-1]);}
    x.stroke();x.restore();
  }
  function redraw(){
    if(!base)return;bx.setTransform(1,0,0,1,0,0);bx.clearRect(0,0,base.width,base.height);
    var L=list(),t=oy(),b=t+H();
    L.forEach(function(s){if(s.b&&(s.b[3]<t-50||s.b[1]>b+50))return;drawS(bx,s);});
    lx.setTransform(1,0,0,1,0,0);lx.clearRect(0,0,live.width,live.height);
    paintBar();
  }
  function bbox(s){
    if(s.t==='x'){var ln=s.s.split('\n'),w=0;bx.save();bx.font=font(s);ln.forEach(function(l){w=Math.max(w,bx.measureText(l).width);});bx.restore();
      return [s.x,s.y,s.x+w,s.y+ln.length*s.z*1.25];}
    var p=s.p,a=[1e9,1e9,-1e9,-1e9];for(var i=0;i<p.length;i+=2){a[0]=Math.min(a[0],p[i]);a[1]=Math.min(a[1],p[i+1]);a[2]=Math.max(a[2],p[i]);a[3]=Math.max(a[3],p[i+1]);}
    var h=s.w/2;return [a[0]-h,a[1]-h,a[2]+h,a[3]+h];
  }
  function hit(s,x,y,r){
    var b=s.b||bbox(s);if(x<b[0]-r||x>b[2]+r||y<b[1]-r||y>b[3]+r)return false;if(s.t==='x')return true;
    var p=s.p,R=r+s.w/2;
    for(var i=0;i<p.length;i+=2){var x1=p[i],y1=p[i+1],x2=p[i+2]!=null?p[i+2]:x1,y2=p[i+3]!=null?p[i+3]:y1;
      var vx=x2-x1,vy=y2-y1,l=vx*vx+vy*vy,u=l?Math.max(0,Math.min(1,((x-x1)*vx+(y-y1)*vy)/l)):0;
      var dx=x1+u*vx-x,dy=y1+u*vy-y;if(dx*dx+dy*dy<=R*R)return true;}
    return false;
  }
  function push(op){redoS=[];op.k=mode==='w'?'w'+page:'p'+key();hist.push(op);if(hist.length>200)hist.shift();}
  var hist=[];
  function undo(){var o=hist.pop();if(!o)return;applyOp(o,true);redoS.push(o);done();}
  function redo(){var o=redoS.pop();if(!o)return;applyOp(o,false);hist.push(o);done();}
  function arrOf(k){if(k[0]==='w')return st.w[+k.slice(1)]||[];return st.p[k.slice(1)]||(st.p[k.slice(1)]=[]);}
  function applyOp(o,back){
    var L=arrOf(o.k);
    if(o.a==='add'){if(back){var i=L.indexOf(o.s);if(i>=0)L.splice(i,1);}else L.push(o.s);}
    else if(o.a==='del'){if(back)o.items.slice().sort(function(a,b){return a[0]-b[0];}).forEach(function(it){L.splice(it[0],0,it[1]);});
      else o.items.forEach(function(it){var i=L.indexOf(it[1]);if(i>=0)L.splice(i,1);});}
    else if(o.a==='clr'){if(back)Array.prototype.push.apply(L,o.items);else L.length=0;}
  }
  function done(){save();redraw();}

  function pt(e){return [Math.round((e.clientX-org[0]+ox())*10)/10,Math.round((e.clientY-org[1]+oy())*10)/10];}
  function down(e){
    if(e.pointerType==='pen')penSeen=Date.now();
    else if(e.pointerType==='touch'&&Date.now()-penSeen<4000)return; /* đang dùng bút cảm ứng → bỏ chạm lòng bàn tay */
    if(e.button>0)return;
    e.preventDefault();if(nt)nt.blur();
    var r=live.getBoundingClientRect();org=[r.left,r.top];t0=Date.now();
    var q=pt(e);
    try{live.setPointerCapture(e.pointerId);}catch(_){}
    if(cfg.tool==='er'){cur={er:1,items:[]};erase(q);return;}
    var hl=cfg.tool==='hl';
    cur={t:hl?'h':'s',c:hl?HL[cfg.hc]:COL[cfg.c],w:hl?SZ[cfg.z]*3+8:SZ[cfg.z]*(e.pointerType==='pen'?.9:1),p:q};
    drawLive();
  }
  function move(e){
    if(!cur)return;e.preventDefault();
    var evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];if(!evs.length)evs=[e];
    evs.forEach(function(v){var q=pt(v);
      if(cur.er){erase(q);return;}
      var p=cur.p,n=p.length;if(Math.abs(p[n-2]-q[0])+Math.abs(p[n-1]-q[1])<1.5)return;
      if(cur.t==='h'&&e.shiftKey){p.length=2;}
      p.push(q[0],q[1]);});
    if(!cur.er)drawLive();
  }
  function up(){
    if(!cur)return;var c=cur;cur=null;
    if(c.er){if(c.items.length)push({a:'del',items:c.items});done();return;}
    c.b=bbox(c);
    /* Trên trang: chạm nhẹ (không kéo) = bấm vào trang bên dưới (chọn đáp án, bấm nút…), kéo mới là vẽ */
    if(mode==='p'&&c.b[2]-c.b[0]-c.w<6&&c.b[3]-c.b[1]-c.w<6&&Date.now()-t0<400){lx.setTransform(1,0,0,1,0,0);lx.clearRect(0,0,live.width,live.height);passClick(c.p[0]-ox(),c.p[1]-oy());return;}
    list().push(c);push({a:'add',s:c});
    lx.setTransform(1,0,0,1,0,0);lx.clearRect(0,0,live.width,live.height);drawS(bx,c);save();
  }
  function passClick(x,y){
    ov.style.visibility='hidden';var t=document.elementFromPoint(x,y);ov.style.visibility='';
    if(!t)return;
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable){try{t.focus();}catch(_){}}
    ['pointerdown','mousedown','pointerup','mouseup'].forEach(function(n){try{t.dispatchEvent(new (n[0]==='p'&&window.PointerEvent?PointerEvent:MouseEvent)(n,{bubbles:true,cancelable:true,clientX:x,clientY:y,view:window}));}catch(_){}});
    t.click();
  }
  function placeWin(){
    if(!ov)return;
    if(!isWin()){ov.style.left=ov.style.top=ov.style.width=ov.style.height='';return;}
    var w=cfg.ww||Math.round(Math.min(innerWidth*.48,760)),h=cfg.wh||Math.round(innerHeight*.7);
    w=Math.min(w,innerWidth);h=Math.min(h,innerHeight);
    var x=cfg.wx!=null?cfg.wx:innerWidth-w-12,y=cfg.wy!=null?cfg.wy:Math.round((innerHeight-h)/2);
    x=Math.max(0,Math.min(innerWidth-80,x));y=Math.max(0,Math.min(innerHeight-60,y));
    ov.style.left=x+'px';ov.style.top=y+'px';ov.style.width=w+'px';ov.style.height=h+'px';
  }
  function drawLive(){lx.setTransform(1,0,0,1,0,0);lx.clearRect(0,0,live.width,live.height);drawS(lx,cur);}
  function erase(q){
    var L=list(),r=10,ch=false;
    for(var i=L.length-1;i>=0;i--)if(hit(L[i],q[0],q[1],r)){cur.items.push([i,L[i]]);L.splice(i,1);ch=true;}
    if(ch)redraw();
  }
  /* Khung chữ: một khung cố định trên màn hình, nền vàng nhạt, ẩn / hiện bằng nút T, chữ giữ nguyên để viết tiếp */
  function buildNote(){
    nb=el('div','','<div class="nh"><span>✍ Khung chữ</span><button data-n="zo" title="Chữ nhỏ">A−</button><button data-n="zi" title="Chữ to">A+</button>'+
      '<button data-n="clr" title="Xóa hết chữ">🗑</button><button data-n="hide" title="Ẩn khung (bấm T để hiện lại)">—</button></div><textarea placeholder="Gõ chữ ở đây… (gõ được tiếng Hàn)"></textarea>');
    nb.id='bgnote';nt=nb.querySelector('textarea');ov.appendChild(nb);
    var n=st.n;nt.value=n.s||'';
    nt.addEventListener('input',function(){n.s=nt.value;save();});
    nt.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Escape')nt.blur();});
    nb.addEventListener('pointerdown',function(e){e.stopPropagation();});
    nb.querySelector('.nh').onclick=function(e){var b=e.target.closest('[data-n]');if(!b)return;var a=b.dataset.n;
      if(a==='zi')n.z=Math.min(80,n.z+4);else if(a==='zo')n.z=Math.max(14,n.z-4);
      else if(a==='clr'){if(nt.value&&confirm('Xóa hết chữ trong khung?')){nt.value='';n.s='';}}
      else if(a==='hide'){n.show=0;}
      save();placeNote();paintBar();};
    var h=nb.querySelector('.nh'),dr=null;
    h.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;e.preventDefault();
      var r=ov.getBoundingClientRect();org=[r.left,r.top];dr=[e.clientX-r.left-nb.offsetLeft,e.clientY-r.top-nb.offsetTop];try{h.setPointerCapture(e.pointerId);}catch(_){}});
    h.addEventListener('pointermove',function(e){if(!dr)return;
      n.x=Math.max(0,Math.min(W()-60,e.clientX-dr[0]-org[0]));n.y=Math.max(0,Math.min(H()-40,e.clientY-dr[1]-org[1]));placeNote();});
    h.addEventListener('pointerup',function(){if(dr){dr=null;save();}});
    if(window.ResizeObserver)new ResizeObserver(function(){if(!nb.classList.contains('on'))return;
      n.w=nb.offsetWidth;n.h=nb.offsetHeight;save();}).observe(nb);
  }
  function placeNote(){
    var n=st.n;
    if(n.w==null){n.w=Math.min(520,innerWidth-24);n.h=Math.min(260,innerHeight-160);n.x=Math.max(12,innerWidth-n.w-20);n.y=Math.min(110,innerHeight-n.h-12);}
    var x=Math.max(0,Math.min(W()-60,n.x)),y=Math.max(0,Math.min(H()-40,n.y));
    nb.style.left=x+'px';nb.style.top=y+'px';nb.style.width=Math.min(n.w,W())+'px';nb.style.height=Math.min(n.h,H())+'px';
    nt.style.fontSize=n.z+'px';nb.classList.toggle('on',!!n.show);
  }
  function toggleNote(){st.n.show=st.n.show?0:1;save();placeNote();if(st.n.show){nt.focus();var l=nt.value.length;try{nt.setSelectionRange(l,l);}catch(_){}}}

  function paintBar(){
    if(!bar)return;
    bar.querySelectorAll('[data-bt]').forEach(function(b){b.classList.toggle('on',!hand&&b.dataset.bt===cfg.tool);});
    bar.querySelector('[data-a=hand]').classList.toggle('on',hand);bar.querySelector('[data-a=note]').classList.toggle('on',!!st.n.show);
    bar.querySelector('[data-m=w]').classList.toggle('on',mode==='w');bar.querySelector('[data-m=p]').classList.toggle('on',mode==='p');
    var hl=cfg.tool==='hl';
    bar.querySelectorAll('.sw').forEach(function(b){var i=+b.dataset.i,isH=b.dataset.h==='1';b.style.display=(isH===hl)?'':'none';
      b.classList.toggle('on',isH?i===cfg.hc:i===cfg.c);});
    bar.querySelectorAll('[data-z]').forEach(function(b){b.classList.toggle('on',+b.dataset.z===cfg.z);});
    bar.querySelectorAll('.wo').forEach(function(b){b.style.display=mode==='w'?'':'none';});
    bar.querySelector('.pg').textContent=(page+1)+'/'+st.w.length;
    bar.querySelector('[data-a=grid]').classList.toggle('on',!!cfg.grid);
    var wb=bar.querySelector('[data-a=win]');wb.textContent=cfg.win?'⛶':'⧉';wb.title=cfg.win?'Phóng bảng ra cả màn hình':'Thu bảng thành cửa sổ (trang bên cạnh vẫn bấm được)';
    ov.className='on '+mode+(isWin()?' win':'')+(mode==='w'&&cfg.grid?' grid':'')+(hand?' hand':'')+' t-'+cfg.tool;
  }
  function build(){
    ov=el('div');ov.id='bang';
    base=el('canvas');live=el('canvas');bx=base.getContext('2d');lx=live.getContext('2d');
    var sw='';COL.forEach(function(c,i){sw+='<button class="sw" data-i="'+i+'" style="background:'+c+'" title="Màu"></button>';});
    HL.forEach(function(c,i){sw+='<button class="sw" data-h="1" data-i="'+i+'" style="background:'+c+'" title="Màu tô"></button>';});
    var zs='';SZ.forEach(function(z,i){var d=[6,10,16][i];zs+='<button data-z="'+i+'" title="Cỡ nét"><span class="dt" style="width:'+d+'px;height:'+d+'px"></span></button>';});
    bar=el('div','',
      '<button class="dg wo" data-a="drag" title="Kéo để dời cửa sổ bảng">⠿</button><button data-m="w" title="Bảng trắng">⬜ Bảng</button><button data-m="p" title="Viết đè lên trang học liệu">📄 Trên trang</button><span class="sp"></span>'+
      '<button data-bt="pen" title="Bút">✏️</button><button data-bt="hl" title="Bút tô màu">🖍</button><button data-a="note" title="Khung chữ: hiện / ẩn (chữ giữ nguyên để viết tiếp)">T</button>'+
      '<button data-bt="er" title="Tẩy: chạm nét nào xóa nét đó">⌫</button><button data-a="hand" title="Tạm thôi vẽ: cuộn / bấm trong trang">✋</button><span class="sp"></span>'+
      sw+'<span class="sp"></span>'+zs+'<span class="sp"></span>'+
      '<button data-a="undo" title="Hoàn tác (Ctrl+Z)">↶</button><button data-a="redo" title="Làm lại (Ctrl+Y)">↷</button><button data-a="clr" title="Xóa hết trang bảng này">🗑</button>'+
      '<span class="sp wo"></span><button class="wo" data-a="grid" title="Kẻ ô">▦</button><button class="wo" data-a="pp" title="Trang bảng trước">‹</button><span class="pg wo"></span>'+
      '<button class="wo" data-a="pn" title="Trang bảng sau / thêm trang mới">›</button><button class="wo" data-a="win"></button><span class="sp"></span><button data-a="x" title="Đóng bảng (Esc)">✕</button>');
    bar.id='bgbar';
    ov.appendChild(base);ov.appendChild(live);ov.appendChild(bar);document.body.appendChild(ov);buildNote();
    live.addEventListener('pointerdown',down);live.addEventListener('pointermove',move);
    live.addEventListener('pointerup',up);live.addEventListener('pointercancel',up);
    live.addEventListener('wheel',function(e){if(mode==='p'){e.preventDefault();scrollBy(e.deltaX,e.deltaY);}},{passive:false});
    bar.addEventListener('pointerdown',function(e){e.stopPropagation();});
    var dg=bar.querySelector('.dg'),dd=null;
    dg.addEventListener('pointerdown',function(e){if(!isWin())return;e.preventDefault();dd=[e.clientX-ov.offsetLeft,e.clientY-ov.offsetTop];try{dg.setPointerCapture(e.pointerId);}catch(_){}});
    dg.addEventListener('pointermove',function(e){if(!dd)return;cfg.wx=e.clientX-dd[0];cfg.wy=e.clientY-dd[1];placeWin();});
    dg.addEventListener('pointerup',function(){if(dd){dd=null;save();}});
    if(window.ResizeObserver)new ResizeObserver(function(){if(!on||!isWin())return;
      var w=ov.offsetWidth,h=ov.offsetHeight;if(Math.abs(w-(cfg.ww||0))<2&&Math.abs(h-(cfg.wh||0))<2)return;
      cfg.ww=w;cfg.wh=h;save();[base,live].forEach(function(c){c.width=Math.round(W()*dpr);c.height=Math.round(H()*dpr);});redraw();}).observe(ov);ov.addEventListener('click',function(e){e.stopPropagation();});
    bar.onclick=function(e){
      var b=e.target.closest('button');if(!b)return;
      if(b.dataset.m){mode=b.dataset.m;hand=false;paintBar();size();placeNote();return;}
      if(b.dataset.bt){cfg.tool=b.dataset.bt;hand=false;}
      else if(b.dataset.i!=null){if(b.dataset.h)cfg.hc=+b.dataset.i;else{cfg.c=+b.dataset.i;if(cfg.tool==='er')cfg.tool='pen';}hand=false;}
      else if(b.dataset.z!=null)cfg.z=+b.dataset.z;
      else{var a=b.dataset.a;
        if(a==='x'){close();return;}
        if(a==='note'){toggleNote();paintBar();return;}
        if(a==='hand')hand=!hand;
        else if(a==='undo')undo();else if(a==='redo')redo();
        else if(a==='clr'){var L=list();if(L.length&&confirm(mode==='w'?'Xóa hết trang bảng này?':'Xóa hết nét vẽ trên thẻ này?')){push({a:'clr',items:L.slice()});L.length=0;}}
        else if(a==='grid')cfg.grid=cfg.grid?0:1;
        else if(a==='win'){cfg.win=cfg.win?0:1;save();paintBar();size();placeNote();return;}
        else if(a==='drag')return;
        else if(a==='pp'){if(page>0)page--;}
        else if(a==='pn'){if(page===st.w.length-1){if(!st.w[page].length)return;st.w.push([]);}page++;}
      }
      save();redraw();
    };
    addEventListener('resize',function(){if(on){size();placeNote();}});
    addEventListener('scroll',function(){if(on&&mode==='p'&&!cur)redraw();},{passive:true});
    addEventListener('hashchange',function(){if(on&&mode==='p')redraw();});
    document.addEventListener('keydown',function(e){
      if(!on||document.activeElement===nt)return;
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}
      else if((e.ctrlKey||e.metaKey)&&(e.key==='z'||e.key==='Z')){e.preventDefault();e.shiftKey?redo():undo();}
      else if((e.ctrlKey||e.metaKey)&&(e.key==='y'||e.key==='Y')){e.preventDefault();redo();}
    },true);
  }
  /* Phím B (khi không gõ chữ): bật / tắt bảng nhanh */
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey||(e.key!=='b'&&e.key!=='B'))return;
    var a=document.activeElement;if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable))return;
    e.preventDefault();on?close():open();
  });
  function open(){if(!ov)build();on=true;hand=false;ov.classList.add('on');size();placeNote();}
  function close(){if(nt)nt.blur();on=false;cur=null;ov.className='';save();}

  function init(){
    var s=el('style');s.textContent=css;document.head.appendChild(s);
    btn=el('button','bang-btn','✏<small>Bảng</small>');btn.type='button';
    btn.title='Bảng trắng: viết, tô màu ngay trong trang';btn.onclick=open;
    var nav=document.querySelector('nav');
    if(nav){nav.classList.add('bgn');nav.appendChild(btn);}else{btn.classList.add('fl');document.body.appendChild(btn);}
    /* đang chiếu: thanh chiếu ẩn nav → thêm nút vào thanh chiếu */
    setTimeout(function(){var cb=document.getElementById('chbar');if(!cb)return;
      var b=el('button','','✏ Bảng');b.type='button';b.title='Bảng trắng';b.onclick=function(e){e.stopPropagation();open();};
      var x=cb.querySelector('[data-a=x]');cb.insertBefore(b,x||null);},0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.bangOpen=open;
  /* Tra từ + Sổ từ (tra-tu.js) đi kèm bảng trắng */
  if(ME&&!window.__tratu){var tt=document.createElement('script');tt.src=ME.src.replace(/bang\.js(\?.*)?$/,'tra-tu.js');document.body.appendChild(tt);}
})();
