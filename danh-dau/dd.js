/* Đánh dấu “đã dạy” trong học liệu — dùng chung cho mọi trang học liệu (chỉ máy cô thấy).
   Cách gắn: <script src="…/danh-dau/dd.js"></script> cuối trang. Trang tự tìm các phần:
     section.sec = một buổi/thẻ (tiêu đề h2), mỗi h3 con trực tiếp (và h2 trong .tab-page) = một mục;
     phần không có mục con thì cả phần là một mục; trang không có section.sec thì mỗi h2 là một mục.
   Máy chưa “cài tên học sinh” (link từ trang quản lý → danh-dau/#n=…) thì không hiện gì.
   localStorage: nari-dd-st {s:[[id, tên ngắn]]}, nari-dd-m {"trang|mục": {id: ngày}}, nari-dd-q dấu chưa gửi
   [[trang, mục, id, ngày, lúc, xóa?]], nari-dd-b link bảng giảng chưa gửi [[id, ngày, link, lúc]], nari-dd-c mục lục từng trang,
   nari-dd-hide (ẩn khi chiếu), nari-dd-last mã chép gần nhất.
   Mã gửi trang quản lý: ND1-<base64 {v:1, e:[…], b:[…], c:{trang:{t, s:[[id phần, tên, link #, [[mục, tên]…]]]}}}>-<sum>. */
(function(){
var K={st:'nari-dd-st',m:'nari-dd-m',q:'nari-dd-q',b:'nari-dd-b',c:'nari-dd-c',hide:'nari-dd-hide',last:'nari-dd-last'};
function get(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function sum(str){var h=7;for(var i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))%1679616;return h.toString(36);}
function pad4(s){while(s.length<4)s='0'+s;return s;}
function b64e(o){return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function b64d(r){var b=String(r).replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';return JSON.parse(decodeURIComponent(escape(atob(b))));}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function dm(iso){var m=/^\d{4}-(\d\d)-(\d\d)$/.exec(iso||'');return m?m[2]+'/'+m[1]:'';}
var PAGE=location.pathname.replace(/^\/(narikoreanbox\/)?/,'').replace(/index\.html?$/,'');
var CSS='.dd-b{font:600 12.5px/1.6 Arial,sans-serif;margin-left:8px;vertical-align:middle;border:1px dashed #53468F;border-radius:12px;padding:0 8px;background:#fff;color:#53468F;cursor:pointer;letter-spacing:0;text-transform:none;white-space:nowrap}'+
'.dd-b:hover{background:#EFEAF8}.dd-b .t{display:inline-block;background:#E3F3EA;color:#1d7a3a;border-radius:8px;padding:0 5px;margin-left:4px;font-weight:600}'+
'.dd-b.g{border-style:solid}.dd-b .t.p{background:#FDF1DC;color:#9A6200}'+
'html.dd-off .dd-b{display:none!important}'+
'#dd-dock{position:fixed;left:10px;bottom:10px;z-index:9990;font:14px/1.45 Arial,sans-serif;color:#1D1A2C}'+
'#dd-dock>button{font:600 13.5px Arial,sans-serif;border:1px solid #53468F;background:#fff;color:#53468F;border-radius:18px;padding:5px 12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15)}'+
'#dd-dock>button.n{background:#E0313F;border-color:#E0313F;color:#fff}html.dd-off #dd-dock>button{opacity:.35;padding:3px 8px}'+
'nav.ddn{display:flex;align-items:stretch;gap:6px}nav.ddn>.bar{flex:1;min-width:0}'+
'.dd-nav{flex:none;font-family:inherit;font-weight:bold;font-size:15px;line-height:1.2;padding:4px 10px;border:2px solid #53468F;border-radius:8px;background:#fff;color:#53468F;cursor:pointer}'+
'.dd-nav small{display:block;font-weight:normal;font-size:12px}.dd-nav:hover{background:#EFEAF8}.dd-nav.n{background:#E0313F;border-color:#E0313F;color:#fff}'+
'html.dd-off .dd-nav{opacity:.35}html.dd-off .dd-nav small{display:none}@media (max-width:560px){.dd-nav{padding:4px 6px;font-size:16px}.dd-nav small{font-size:10px}}@media print{.dd-nav,#dd-dock{display:none}}'+
'.dd-pop{position:fixed;inset:0;background:rgba(20,18,32,.45);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:8vh 12px 12px;overflow:auto;font:15px/1.5 Arial,sans-serif;color:#1D1A2C}'+
'.dd-box{background:#fff;border:2px solid #53468F;border-radius:12px;padding:14px 16px;max-width:440px;width:100%}'+
'.dd-box h4{margin:0;font-size:16.5px;color:#53468F}.dd-box .s{color:#646079;font-size:13px;margin:2px 0 10px}'+
'.dd-box label.r{display:flex;gap:10px;align-items:center;padding:8px 2px;border-bottom:1px solid #E6E3EF;cursor:pointer;font-size:16px}'+
'.dd-box label.r input{width:20px;height:20px;margin:0}.dd-box label.r small{margin-left:auto;color:#1d7a3a;font-size:13px}'+
'.dd-box .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px}'+
'.dd-box button{font:600 14px Arial,sans-serif;border:0;border-radius:8px;padding:8px 14px;background:#53468F;color:#fff;cursor:pointer}'+
'.dd-box button.gh{background:#fff;color:#53468F;border:1.5px solid #53468F}.dd-box button.sm{padding:4px 10px;font-size:13px}'+
'.dd-box input[type=date],.dd-box input[type=url],.dd-box select{font:15px Arial,sans-serif;padding:5px 8px;border:1px solid #999;border-radius:6px}'+
'.dd-box textarea{width:100%;box-sizing:border-box;font:12px monospace;height:70px;border:1px solid #999;border-radius:6px}'+
'.dd-box .gs{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 2px;border-bottom:1px solid #E6E3EF}'+
'.dd-box .ok{color:#1d7a3a;font-weight:600;font-size:13.5px}.dd-box ul{margin:4px 0;padding-left:18px;font-size:13.5px;max-height:180px;overflow:auto}';

var ST=get(K.st,null);
function sts(){return (ST&&ST.s)||[];}
function M(){return get(K.m,{});}
function title(el){var c=el.cloneNode(true);[].forEach.call(c.querySelectorAll('.dd-b'),function(b){b.remove();});return c.textContent.replace(/\s+/g,' ').trim();}
function slug(t){return t.replace(/^\s*\d+[.)]\s*/,'').toLowerCase().slice(0,60);}

/* Tìm các phần + mục trong trang */
var G=[];
function scan(){
  G=[];var used={};
  function key(base,t){var k=base+'/'+slug(t),n=2;while(used[k])k=base+'/'+slug(t)+'#'+(n++);used[k]=1;return k;}
  var secs=[].slice.call(document.querySelectorAll('section.sec'));
  if(secs.length){
    secs.forEach(function(sec,i){
      var sid=sec.id||('s'+i),h2=sec.querySelector(':scope > h2')||sec.querySelector('h2');if(!h2)return;
      var nav=document.querySelector('a[href="#b='+sid.replace(/^s/,'')+'"]'),hash=nav?nav.getAttribute('href'):'';
      var g={sid:sid,t:title(h2),el:h2,h:hash,it:[]};
      [].forEach.call(sec.querySelectorAll(':scope > h3, .tab-page h2'),function(el){var t=title(el);if(t)g.it.push({k:key(sid,t),t:t,el:el});});
      if(!g.it.length)g.it.push({k:sid,t:g.t,el:h2,self:1});
      G.push(g);
    });
  } else {
    var g={sid:'',t:document.title,el:null,h:'',it:[]};
    [].forEach.call(document.querySelectorAll('h2'),function(el){var t=title(el);if(t)g.it.push({k:key('h',t),t:t,el:el});});
    if(g.it.length)G.push(g);
  }
  var cat={t:document.title.replace(/\s*[·|–-]\s*Nari TOPIK\s*$/,''),s:G.map(function(g){return [g.sid,g.t,g.h,g.it.map(function(x){return [x.k,x.t];})];})};
  var C=get(K.c,{}),old=C[PAGE]||{};cat.hs=sum(JSON.stringify(cat.s));cat.sent=old.hs===cat.hs?old.sent:'';C[PAGE]=cat;put(K.c,C);
}

/* Ghi / bỏ dấu */
function mark(k,id,d,del){
  var m=M(),r=m[PAGE+'|'+k]||{};
  if(del){if(!r[id])return;delete r[id];}else{if(r[id]===d)return;r[id]=d;}
  if(Object.keys(r).length)m[PAGE+'|'+k]=r;else delete m[PAGE+'|'+k];put(K.m,m);
  var q=get(K.q,[]);q.push([PAGE,k,id,d,Date.now()].concat(del?[1]:[]));put(K.q,q);
}
function short(id){var s=sts().filter(function(x){return x[0]===id;})[0];return s?s[1]:'?';}

/* Nút cạnh tiêu đề */
function paint(){
  var m=M(),n=sts().length;
  G.forEach(function(g){
    g.it.forEach(function(x){
      var r=m[PAGE+'|'+x.k]||{},b=x.btn;
      if(!b){b=x.btn=document.createElement('button');b.type='button';b.className='dd-b';b.onclick=function(e){e.preventDefault();e.stopPropagation();popItem(g,x);};x.el.appendChild(b);}
      var ids=sts().map(function(s){return s[0];}).filter(function(id){return r[id];});
      b.innerHTML='📌'+(ids.length?ids.map(function(id){return '<span class="t">'+esc(short(id))+' '+dm(r[id])+'</span>';}).join(''):'');
      b.title='Đánh dấu đã dạy mục này';
    });
    if(g.el&&!(g.it.length===1&&g.it[0].self)){
      var b=g.btn;
      if(!b){b=g.btn=document.createElement('button');b.type='button';b.className='dd-b g';b.onclick=function(e){e.preventDefault();e.stopPropagation();popGroup(g);};g.el.appendChild(b);}
      b.innerHTML='📌 Cả phần'+sts().map(function(s){var c=g.it.filter(function(x){return (m[PAGE+'|'+x.k]||{})[s[0]];}).length;
        return c?'<span class="t'+(c<g.it.length?' p':'')+'">'+esc(s[1])+' '+c+'/'+g.it.length+'</span>':'';}).join('');
    }
  });
  dock();
}

function css(){if(!document.getElementById('dd-css')){var s=document.createElement('style');s.id='dd-css';s.textContent=CSS;document.head.appendChild(s);}}
function pop(html){
  css();var w=document.createElement('div');w.className='dd-pop';w.innerHTML='<div class="dd-box">'+html+'</div>';
  w.addEventListener('click',function(e){if(e.target===w||e.target.closest('[data-x]')){w.remove();paint();}});
  document.body.appendChild(w);return w;
}
function dateRow(){return '<div class="row" style="margin:0 0 6px"><label>Ngày dạy <input type="date" data-d value="'+today()+'"></label></div>';}
function popItem(g,x){
  var r=M()[PAGE+'|'+x.k]||{};
  var w=pop('<h4>'+esc(x.t)+'</h4><div class="s">'+esc(x.self?'':g.t+' · ')+esc(document.title)+'</div>'+dateRow()+
    sts().map(function(s){return '<label class="r"><input type="checkbox" data-i="'+esc(s[0])+'"'+(r[s[0]]?' checked':'')+'> '+esc(s[1])+'<small>'+(r[s[0]]?'đã dạy '+dm(r[s[0]]):'')+'</small></label>';}).join('')+
    '<div class="row"><button data-x>Xong</button></div>');
  [].forEach.call(w.querySelectorAll('[data-i]'),function(c){c.onchange=function(){
    var d=w.querySelector('[data-d]').value||today();mark(x.k,c.dataset.i,d,!c.checked);
    c.parentNode.querySelector('small').textContent=c.checked?'đã dạy '+dm(d):'';};});
}
function popGroup(g){
  var w=pop('<h4>'+esc(g.t)+'</h4><div class="s">'+g.it.length+' mục · '+esc(document.title)+'</div>'+dateRow()+'<div data-l></div><div class="row"><button data-x>Xong</button></div>');
  function draw(){var m=M();w.querySelector('[data-l]').innerHTML=sts().map(function(s){
    var c=g.it.filter(function(x){return (m[PAGE+'|'+x.k]||{})[s[0]];}).length;
    return '<div class="gs"><span><b>'+esc(s[1])+'</b> · '+c+'/'+g.it.length+' mục</span><span>'+(c<g.it.length?'<button class="sm" data-a="'+esc(s[0])+'">Đánh dấu hết</button> ':'')+(c?'<button class="sm gh" data-z="'+esc(s[0])+'">Bỏ hết</button>':'')+'</span></div>';}).join('');
    [].forEach.call(w.querySelectorAll('[data-a]'),function(b){b.onclick=function(){var d=w.querySelector('[data-d]').value||today(),m=M();
      g.it.forEach(function(x){if(!(m[PAGE+'|'+x.k]||{})[b.dataset.a])mark(x.k,b.dataset.a,d);});draw();};});
    [].forEach.call(w.querySelectorAll('[data-z]'),function(b){b.onclick=function(){if(!confirm('Bỏ mọi dấu của '+short(b.dataset.z)+' trong phần này?'))return;
      g.it.forEach(function(x){mark(x.k,b.dataset.z,'',1);});draw();};});
  }
  draw();
}

/* Mã gửi trang quản lý */
function unsent(){return get(K.q,[]).length+get(K.b,[]).length;}
function makeCode(){
  var q=get(K.q,[]),bl=get(K.b,[]),C=get(K.c,{}),c={},pages={};
  q.forEach(function(e){pages[e[0]]=1;});
  Object.keys(C).forEach(function(p){if(pages[p]||C[p].sent!==C[p].hs)c[p]={t:C[p].t,s:C[p].s};});
  var raw=b64e({v:1,e:q,b:bl,c:c});
  return {code:'ND1-'+raw+'-'+pad4(sum(raw)),n:q.length,nb:bl.length,pages:Object.keys(c)};
}
function sent(){
  var C=get(K.c,{});Object.keys(C).forEach(function(p){C[p].sent=C[p].hs;});put(K.c,C);put(K.q,[]);put(K.b,[]);
}
function copy(t){
  var ok=false,ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
  try{ok=document.execCommand('copy');}catch(e){}ta.remove();
  if(!ok&&navigator.clipboard)navigator.clipboard.writeText(t).then(function(){},function(){});
}
function summary(q){
  var by={};q.forEach(function(e){var k=(e[3]||'')+' · '+short(e[2]);(by[k]=by[k]||[]).push(e);});
  return Object.keys(by).sort().map(function(k){var a=by[k],add=a.filter(function(e){return !e[5];}).length,del=a.length-add;
    return '<li>'+esc(k.replace(/^(\d{4})-(\d\d)-(\d\d)/,'$3/$2'))+': '+(add?add+' mục':'')+(del?(add?', ':'')+'bỏ '+del+' dấu':'')+'</li>';}).join('');
}
function popDock(){
  var q=get(K.q,[]),last=get(K.last,null),off=document.documentElement.classList.contains('dd-off');
  var w=pop('<h4>📌 Đánh dấu đã dạy</h4><div class="s">Dấu lưu trên máy này. Gửi về trang quản lý: chép mã → dán vào tab <b>Chấm bài</b>.</div>'+
    (unsent()?'<b>'+unsent()+' dấu chưa gửi</b><ul>'+summary(q)+(get(K.b,[]).length?'<li>'+get(K.b,[]).length+' link bảng giảng</li>':'')+'</ul>'+
      '<div class="row"><button data-copy>Chép mã gửi trang quản lý</button></div>':'<p class="ok">Không còn dấu nào chưa gửi.</p>')+
    (last?'<p class="s" style="margin-top:10px">Mã chép gần nhất: '+esc(last.at)+' ('+last.n+' dấu) <button class="sm gh" data-re>Chép lại</button></p>':'')+
    '<div data-out></div>'+
    '<div style="margin-top:12px;border-top:1px solid #E6E3EF;padding-top:10px"><b>Link bảng giảng hôm nay</b> <span class="s">(Google Docs, tab của buổi)</span>'+
    '<div class="row" style="margin-top:6px"><select data-bs>'+sts().map(function(s){return '<option value="'+esc(s[0])+'">'+esc(s[1])+'</option>';}).join('')+'</select>'+
    '<input type="url" data-bu placeholder="https://docs.google.com/…" style="flex:1;min-width:160px"><button class="sm" data-ba>Lưu</button></div><div data-bo class="ok"></div></div>'+
    '<div class="row"><button class="gh" data-off>'+(off?'Hiện lại nút đánh dấu':'Ẩn nút khi chiếu cho học sinh')+'</button><a href="'+root()+'danh-dau/" target="_blank" rel="noopener" style="font-size:13.5px">Cài đặt · xem tất cả</a><span style="flex:1"></span><button class="gh" data-x>Đóng</button></div>');
  function show(code){w.querySelector('[data-out]').innerHTML='<p class="ok">Đã chép mã. Cô mở trang quản lý → Chấm bài → dán → “Chấm bài”.</p><textarea readonly>'+esc(code)+'</textarea>';
    var ta=w.querySelector('[data-out] textarea');ta.onfocus=function(){ta.select();};}
  var cb=w.querySelector('[data-copy]');if(cb)cb.onclick=function(){var r=makeCode();copy(r.code);
    var d=new Date();put(K.last,{code:r.code,n:r.n+r.nb,at:('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+' '+dm(today())});sent();show(r.code);dock();};
  var re=w.querySelector('[data-re]');if(re)re.onclick=function(){copy(last.code);show(last.code);};
  w.querySelector('[data-ba]').onclick=function(){var u=w.querySelector('[data-bu]').value.trim();if(!/^https?:\/\/\S+$/.test(u)){w.querySelector('[data-bo]').textContent='Link cần bắt đầu bằng https://';return;}
    var b=get(K.b,[]);b.push([w.querySelector('[data-bs]').value,today(),u,Date.now()]);put(K.b,b);w.querySelector('[data-bu]').value='';w.querySelector('[data-bo]').textContent='Đã lưu, gửi kèm mã lần tới.';dock();};
  w.querySelector('[data-off]').onclick=function(){var on=!document.documentElement.classList.contains('dd-off');document.documentElement.classList.toggle('dd-off',on);put(K.hide,on?1:0);w.remove();paint();};
}
function root(){var m=location.pathname.match(/^\/narikoreanbox\//);return m?'/narikoreanbox/':'/';}
var D=null;
function dock(){
  /* nút trên thanh chọn buổi (cạnh “↺ Làm mới”); trang không có thanh thì nổi góc trái dưới */
  if(!D){
    var nav=document.querySelector('nav');
    D=document.createElement('button');D.type='button';D.onclick=popDock;
    if(nav){D.className='dd-nav';nav.classList.add('ddn');var lm=nav.querySelector('.lammoi');nav.insertBefore(D,lm||null);}
    else{var w=document.createElement('div');w.id='dd-dock';w.appendChild(D);document.body.appendChild(w);}
  }
  var n=unsent(),off=document.documentElement.classList.contains('dd-off'),inNav=D.classList.contains('dd-nav');
  D.classList.toggle('n',!!n&&!off);D.title='Đánh dấu đã dạy · gửi về trang quản lý';
  if(inNav)D.innerHTML=off?'📌':'📌<small>'+(n?n+' chưa gửi':'Đã dạy')+'</small>';
  else D.textContent=off?'📌':n?'📌 '+n+' dấu chưa gửi':'📌 Đã dạy';
}

/* Cài tên học sinh: danh-dau/#n=<base64 {s:[[id, tên]], m:[[trang, mục, id, ngày]]}> (trang quản lý tạo) */
function install(){
  var h=/[#&]n=([A-Za-z0-9_-]+)/.exec(location.hash);if(!h)return null;
  try{var o=b64d(h[1]);}catch(e){return 'bad';}
  if(!o||!o.s)return 'bad';
  var old=sts(),ids={};o.s.forEach(function(s){ids[s[0]]=1;});
  ST={s:old.filter(function(s){return !ids[s[0]];}).concat(o.s),at:Date.now()};put(K.st,ST);
  if(o.m){ /* dấu từ trang quản lý (máy khác / cô đánh tay) — thay dấu của các em này, rồi áp lại dấu chưa gửi */
    var m=M();Object.keys(m).forEach(function(k){Object.keys(ids).forEach(function(id){delete m[k][id];});if(!Object.keys(m[k]).length)delete m[k];});
    o.m.forEach(function(e){var k=e[0]+'|'+e[1];(m[k]=m[k]||{})[e[2]]=e[3];});
    get(K.q,[]).forEach(function(e){if(!ids[e[2]])return;var k=e[0]+'|'+e[1];if(e[5]){if(m[k])delete m[k][e[2]];}else (m[k]=m[k]||{})[e[2]]=e[3];});
    put(K.m,m);
  }
  history.replaceState(null,'',location.pathname);
  return {n:o.s.length,m:!!o.m};
}

window.NariDD={K:K,get:get,put:put,esc:esc,dm:dm,install:install,sts:sts,popDock:popDock,makeCode:makeCode,unsent:unsent,short:short,setSts:function(s){ST={s:s,at:Date.now()};put(K.st,ST);}};

function boot(){
  if(document.documentElement.dataset.ddPage)return; /* trang danh-dau/ tự vẽ */
  if(!sts().length)return;
  css();
  if(get(K.hide,0))document.documentElement.classList.add('dd-off');
  scan();paint();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0);});else setTimeout(boot,0);
})();
