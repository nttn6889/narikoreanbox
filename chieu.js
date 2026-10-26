/* Chế độ chiếu dùng chung cho trang học liệu (cô giảng trên màn hình lớn).
   Gắn cuối trang:  <script src="../chieu.js"></script>  (đường dẫn theo độ sâu của trang)
   - Nút “⛶ Chiếu” cuối thanh chọn buổi (không có nav thì nổi góc phải dưới). Bật → ẩn đầu trang / menu, chữ to, thanh điều khiển ở dưới.
   - Trang tự chia thành từng khối (tiêu đề + nội dung, bảng, thẻ, câu luyện…; khối cao quá màn hình thì chia nhỏ theo khối con).
     “Một khối”: chỉ hiện khối đang giảng, tự phóng to vừa màn hình. “Cả trang”: hiện cả trang, khối đang giảng sáng, khối khác mờ; chạm khối nào chọn khối đó.
   - Phím → / PageDown / Space: khối sau (hết thẻ thì sang thẻ sau) · ← / PageUp: khối trước · + / −: cỡ chữ · M: Một khối / Cả trang · F: toàn màn hình · Esc: thoát.
   - Bài làm, nút bấm trong khối vẫn dùng như bình thường (khối không bị chép ra, chỉ ẩn / hiện).
   - Link mở thẳng chỗ đang giảng: thêm &cf=<số khối> vào hash (vd. cau-19-20/moi/#b=3&cf=5); khi chiếu, hash tự cập nhật (không tải lại trang). */
(function(){
  if(window.__chieu)return;window.__chieu=1;
  var LS='nari-chieu',cfg={m:1,solo:1};
  try{var o=JSON.parse(localStorage.getItem(LS)||'{}');if(o.m)cfg.m=o.m;if(o.solo!=null)cfg.solo=o.solo;}catch(e){}
  function keep(){try{localStorage.setItem(LS,JSON.stringify(cfg));}catch(e){}}
  var on=false,cur=null,curI=0,list=[],main,bar,lbl,btn;
  var LEAF=/^(H[1-6]|P|TABLE|PRE|IMG|SVG|AUDIO|VIDEO|BLOCKQUOTE|SELECT|INPUT|TEXTAREA|BUTTON|SUMMARY)$/;
  var SKIP=/^(SCRIPT|STYLE|TEMPLATE|NAV|HEADER|FOOTER|NOSCRIPT|LINK|META|BR|HR)$/;

  var css=
'.chieu-btn{flex:none;font-family:inherit;font-weight:bold;font-size:15px;line-height:1.2;padding:4px 10px;border:2px solid var(--ink,#53468F);border-radius:8px;background:var(--bg,#fff);color:var(--ink,#53468F);cursor:pointer}'+
'.chieu-btn small{display:block;font-weight:normal;font-size:12px}.chieu-btn:hover{background:var(--ink,#53468F);color:#fff}'+
'nav.chn{display:flex;align-items:stretch;gap:6px}nav.chn>.bar{flex:1;min-width:0}'+
'.chieu-btn.fl{position:fixed;right:10px;bottom:10px;z-index:60;box-shadow:0 2px 8px rgba(0,0,0,.15)}'+
'@media (max-width:560px){.chieu-btn{padding:4px 6px;font-size:16px}.chieu-btn small{font-size:10px}}'+
'body.ch nav,body.ch header,body.ch footer,body.ch .chieu-btn,body.ch .lammoi,body.ch #dd-dock{display:none!important}'+
'body.ch{overflow-x:hidden}'+
'body.ch .ch-main{max-width:none!important;margin:0 auto!important;padding:16px 0 120px!important;box-sizing:border-box}'+
'body.ch .ch-blk{transition:opacity .2s}'+
'body.ch:not(.ch-solo) .ch-blk:not(.ch-f){opacity:.28}'+
'body.ch:not(.ch-solo) .ch-blk:not(.ch-f):hover{opacity:.6;cursor:pointer}'+
'body.ch:not(.ch-solo) .ch-f{outline:4px solid #E0313F;outline-offset:6px;border-radius:4px}'+
'body.ch .ch-x{display:none!important}'+
'body.ch.ch-solo .sec:not(.on){display:none!important}'+
'#chbar{position:fixed;left:0;right:0;bottom:0;z-index:9995;display:flex;align-items:center;gap:6px;padding:6px 10px;background:rgba(29,26,44,.94);color:#fff;font:14px/1.3 Arial,sans-serif;flex-wrap:wrap}'+
'#chbar button,#chbar select{font:bold 15px Arial,sans-serif;padding:6px 11px;border:1px solid #777;border-radius:6px;background:#2c2840;color:#fff;cursor:pointer}'+
'#chbar button:hover{background:#53468F}#chbar button.big{font-size:20px;padding:4px 16px}'+
'#chbar select{max-width:160px;font-weight:normal}'+
'#chbar .lb{flex:1;min-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.9}'+
'#chbar .lb b{color:#D4A843}'+
'body:not(.ch) #chbar{display:none}'+
'@media (max-width:620px){#chbar .lb{order:-1;flex-basis:100%}#chbar .hm{display:none}}'+
'@media print{.chieu-btn,#chbar{display:none!important}}';

  function vis(el){return el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';}
  function kids(el){var a=[];for(var c=el.firstElementChild;c;c=c.nextElementSibling)if(!SKIP.test(c.tagName)&&c.id!=='chbar'&&vis(c))a.push(c);return a;}
  function hasText(el){return /\S/.test(el.textContent)||el.querySelector('img,svg,input,select,textarea,audio,video,canvas');}
  /* chia khối: khối cao quá màn hình và có ≥ 2 khối con thì chia tiếp (trừ bảng, ô chọn, đoạn văn) */
  function collect(el,out,lim){
    kids(el).forEach(function(c){
      if(!hasText(c))return;
      var k=kids(c),tall=c.getBoundingClientRect().height>lim;
      var split=!LEAF.test(c.tagName)&&k.length>1&&(tall||isWrap(c,k));
      if(c.tagName==='DETAILS'&&!c.open)split=false;
      if(split)collect(c,out,lim);else out.push(c);
    });
  }
  /* khung bọc không có nội dung riêng (div chỉ chứa thẻ, câu luyện…) cũng chia, để mỗi thẻ là một khối */
  function isWrap(c,k){
    if(c.tagName!=='DIV'||c.className)return false;
    var t=0;for(var n=c.firstChild;n;n=n.nextSibling)if(n.nodeType===3&&/\S/.test(n.textContent))t=1;
    return !t&&k.length>1;
  }
  function isHead(e){return /^(H[1-6]|SUMMARY)$/.test(e.tagName)||e.classList.contains('hd')||e.classList.contains('ph');}
  function root(){return document.querySelector('.sec.on')||main;}
  function clearMarks(){
    document.querySelectorAll('.ch-x,.ch-f,.ch-blk').forEach(function(e){e.classList.remove('ch-x','ch-f','ch-blk');});
  }
  function setZoom(z){main.style.zoom=z;main.style.width=(avW()/z)+'px';}
  function avW(){return Math.min(innerWidth-32,1240);}
  function avH(){return innerHeight-(bar?bar.offsetHeight:50)-28;}
  /* gom tiêu đề với khối ngay sau (tiêu đề đứng một mình không cần một lần bấm) */
  function build(){
    var keepCur=cur;clearMarks();setZoom(1.25*cfg.m);
    var raw=[];collect(root(),raw,avH()*0.95);
    var g=[];
    for(var i=0;i<raw.length;i++){
      /* tiêu đề (h2–h4, đầu thẻ .hd, đầu bài luyện .ph, summary) đi liền khối nội dung ngay sau */
      var grp=[raw[i]];
      while(isHead(raw[i])&&raw[i+1]){i++;grp.push(raw[i]);if(!isHead(raw[i]))break;}
      var last=grp[grp.length-1];
      if(grp.length>1&&!isHead(last)&&last.getBoundingClientRect().height>avH()*0.7){grp.pop();i--;}
      g.push(grp);
    }
    list=g;list.forEach(function(x){x.forEach(function(e){e.classList.add('ch-blk');});});
    cur=keepCur;
  }
  function idxOf(grp){
    if(!grp)return -1;
    for(var i=0;i<list.length;i++)for(var j=0;j<list[i].length;j++)if(grp.indexOf(list[i][j])>=0)return i;
    /* khối cũ đã bị chia / gộp lại: tìm khối chứa nó hoặc nằm trong nó */
    for(i=0;i<list.length;i++)for(j=0;j<list[i].length;j++)if(list[i][j].contains(grp[0])||grp[0].contains(list[i][j]))return i;
    return -1;
  }
  function label(i){
    var g=list[i],first=g[0],h=null,sec=root();
    var hs=sec.querySelectorAll('h2,h3');
    for(var k=0;k<hs.length;k++){if(hs[k]===first||hs[k].compareDocumentPosition(first)&Node.DOCUMENT_POSITION_FOLLOWING)h=hs[k];}
    var t=function(e){return e?e.textContent.replace(/📌.*$/,'').replace(/\s+/g,' ').trim():'';};
    var h2=sec.querySelector('h2');
    var s=(h2&&h!==h2?t(h2)+' · ':'')+t(h);
    lbl.innerHTML='<b>'+(i+1)+'/'+list.length+'</b> '+s.replace(/</g,'&lt;');
  }
  function focus(i,noScroll){
    if(!list.length)return;
    i=Math.max(0,Math.min(list.length-1,i));
    var g=list[i];cur=g;curI=i;
    document.querySelectorAll('.ch-x,.ch-f').forEach(function(e){e.classList.remove('ch-x','ch-f');});
    g.forEach(function(e){e.classList.add('ch-f');});
    if(cfg.solo){
      /* ẩn mọi thứ không phải khối này và tổ tiên của nó */
      var keepSet=[];g.forEach(function(e){for(var p=e;p&&p!==main;p=p.parentElement)keepSet.push(p);});
      keepSet.forEach(function(p){
        var par=p.parentElement;if(!par)return;
        for(var c=par.firstElementChild;c;c=c.nextElementSibling)if(keepSet.indexOf(c)<0&&!SKIP.test(c.tagName)&&c.id!=='chbar')c.classList.add('ch-x');
      });
      fit(g);
    }else{
      setZoom(1.25*cfg.m);
      if(!noScroll){var r=g[0].getBoundingClientRect(),r2=g[g.length-1].getBoundingClientRect(),hh=r2.bottom-r.top;
        scrollTo({top:scrollY+r.top-Math.max(12,(avH()-hh)/2),behavior:'smooth'});}
    }
    label(i);
    var h=location.hash.replace(/&?cf=\d+/,'');
    try{history.replaceState(null,'',location.pathname+location.search+(h&&h!=='#'?h+'&':'#')+'cf='+(i+1));}catch(e){}
  }
  function span(g){var a=g[0].getBoundingClientRect(),b=g[g.length-1].getBoundingClientRect();return b.bottom-a.top;}
  /* phóng to lớn nhất mà khối vẫn vừa màn hình (nhân thêm cỡ chữ cô chỉnh) */
  function fit(g){
    var lo=1,hi=3,H=avH();
    for(var n=0;n<8;n++){var z=(lo+hi)/2;setZoom(z);if(span(g)<=H)lo=z;else hi=z;}
    var z=Math.max(0.6,lo*cfg.m);setZoom(z);
    /* đặt khối giữa màn hình (phía trên khối còn lề của thẻ cha nên phải cuộn, không dựa vào vị trí tự nhiên) */
    var s=span(g),r=g[0].getBoundingClientRect();
    scrollTo(0,Math.max(0,scrollY+r.top-Math.max(8,(H-s)/2)));
  }
  function tabs(){return [].slice.call(document.querySelectorAll('nav a[data-k],nav .bar a'));}
  function goTab(d,toEnd){
    var t=tabs(),i=-1;t.forEach(function(a,k){if(a.classList.contains('on'))i=k;});
    var n=t[i+d];if(!n)return false;
    goLink(n,toEnd);return true;
  }
  function goLink(a,toEnd){
    cur=null;clearMarks();
    if(a.getAttribute('href').charAt(0)==='#'){location.hash=a.getAttribute('href');}else a.click();
    setTimeout(function(){build();focus(toEnd?list.length-1:0);fillSel();},250);
  }
  function step(d){
    build();var i=idxOf(cur);
    if(i<0)i=curI;
    if(i+d>=list.length){if(goTab(1,false))return;}
    else if(i+d<0){if(goTab(-1,true))return;}
    focus(i+d);
  }
  function zoom(f){cfg.m=Math.max(0.5,Math.min(2.5,Math.round(cfg.m*f*100)/100));keep();redo();}
  function redo(){build();var i=idxOf(cur);focus(i<0?curI:i);}
  function fillSel(){
    var s=bar.querySelector('select'),t=tabs();
    if(!t.length){s.style.display='none';return;}
    s.innerHTML=t.map(function(a,k){return '<option value="'+k+'"'+(a.classList.contains('on')?' selected':'')+'>'+tabName(a)+'</option>';}).join('');
  }
  function tabName(a){var t=[];a.childNodes.forEach(function(n){var x=n.textContent.replace(/\s+/g,' ').trim();if(x)t.push(x);});return t.join(' · ').replace(/</g,'&lt;');}
  function fs(){try{if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen();}catch(e){}}
  function start(i){
    on=true;document.body.classList.add('ch');document.body.classList.toggle('ch-solo',!!cfg.solo);
    bar.querySelector('[data-a=solo]').textContent=cfg.solo?'▣ Một khối':'☰ Cả trang';
    fillSel();build();focus(i||0);
  }
  function stop(){
    var g=cur;on=false;clearMarks();cur=null;
    document.body.classList.remove('ch','ch-solo');
    main.style.zoom=main.style.width='';
    try{history.replaceState(null,'',location.pathname+location.search+location.hash.replace(/&?cf=\d+/,'').replace(/^#$/,''));}catch(e){}
    if(document.fullscreenElement)try{document.exitFullscreen();}catch(e){}
    if(g&&g[0].isConnected)g[0].scrollIntoView({block:'center'});
  }
  function init(){
    main=document.querySelector('main')||document.body;main.classList.add('ch-main');
    var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
    btn=document.createElement('button');btn.type='button';btn.className='chieu-btn';btn.innerHTML='⛶<small>Chiếu</small>';
    btn.title='Chế độ chiếu: chữ to, giảng từng khối (phím → ←)';btn.onclick=function(){start(0);};
    var nav=document.querySelector('nav');
    if(nav){nav.classList.add('chn');nav.appendChild(btn);}else{btn.classList.add('fl');document.body.appendChild(btn);}
    bar=document.createElement('div');bar.id='chbar';
    bar.innerHTML='<button class="big" data-a="prev" title="Khối trước (←)">◀</button><button class="big" data-a="next" title="Khối sau (→)">▶</button>'+
      '<span class="lb"></span><select title="Chọn thẻ / buổi"></select>'+
      '<button data-a="zo" title="Chữ nhỏ (−)">A−</button><button data-a="zi" title="Chữ to (+)">A+</button>'+
      '<button data-a="solo" title="Một khối / Cả trang (M)"></button><button class="hm" data-a="fs" title="Toàn màn hình (F)">⛶</button>'+
      '<button data-a="x" title="Thoát chiếu (Esc)">✕</button>';
    document.body.appendChild(bar);lbl=bar.querySelector('.lb');
    bar.onclick=function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.dataset.a;
      if(a==='prev')step(-1);else if(a==='next')step(1);else if(a==='zi')zoom(1.12);else if(a==='zo')zoom(1/1.12);
      else if(a==='solo')toggleSolo();else if(a==='fs')fs();else if(a==='x')stop();};
    bar.querySelector('select').onchange=function(){var a=tabs()[+this.value];if(a)goLink(a,false);};
    /* Cả trang: chạm khối nào thì khối đó thành khối đang giảng (nút trong khối vẫn bấm được) */
    document.addEventListener('click',function(e){
      if(!on||cfg.solo||e.target.closest('#chbar'))return;
      var b=e.target.closest('.ch-blk');if(!b||b.classList.contains('ch-f'))return;
      var i=idxOf([b]);if(i>=0)focus(i,true);
    },true);
    document.addEventListener('keydown',function(e){
      if(!on||e.ctrlKey||e.metaKey||e.altKey)return;
      var t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
      var k=e.key;
      if(k==='ArrowRight'||k==='PageDown'||k===' '){e.preventDefault();step(1);}
      else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();step(-1);}
      else if(k==='+'||k==='='){zoom(1.12);}else if(k==='-'||k==='_'){zoom(1/1.12);}
      else if(k==='m'||k==='M'){toggleSolo();}else if(k==='f'||k==='F'){fs();}
      else if(k==='Escape'&&!document.fullscreenElement){stop();}
    });
    var rt;addEventListener('resize',function(){if(!on)return;clearTimeout(rt);rt=setTimeout(redo,200);});
    /* nội dung trong khối đổi (chọn đáp án hiện giải thích…) → phóng lại cho vừa */
    var mt;new MutationObserver(function(){if(!on||!cfg.solo||!cur)return;clearTimeout(mt);mt=setTimeout(function(){if(cur&&cur[0].isConnected)fit(cur);else redo();},120);})
      .observe(main,{subtree:true,childList:true,attributes:true,attributeFilter:['class','open']});
    var m=location.hash.match(/[#&]cf=(\d+)/);
    if(m){var want=+m[1]-1,tries=0;
      /* trang vẽ nội dung sau khi tải dữ liệu: đợi đủ khối rồi mới nhảy tới */
      (function wait(){build();if((tries>=2&&list.length>want)||tries++>20){start(Math.min(want,list.length-1));}else setTimeout(wait,250);})();
    }
  }
  function toggleSolo(){cfg.solo=cfg.solo?0:1;keep();document.body.classList.toggle('ch-solo',!!cfg.solo);
    bar.querySelector('[data-a=solo]').textContent=cfg.solo?'▣ Một khối':'☰ Cả trang';redo();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
