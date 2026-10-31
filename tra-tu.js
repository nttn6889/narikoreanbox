/* Tra từ + Sổ từ buổi học (cô dùng khi giảng). bang.js tự nạp file này (trang có bảng trắng là có tra từ); trang không có bảng thì gắn
   <script src="../tra-tu.js"></script> cuối trang.
   - Nhấp đúp một từ tiếng Hàn trong trang (hoặc bôi đen rồi bấm “📖 Tra”) → khung nghĩa: từ gốc + nghĩa lấy từ tra-tu/tu.json
     (kho từ + bảng từ của đề, sinh bằng python3 tools/tu_dien.py), sửa nghĩa được, câu chứa từ trong trang (làm câu ví dụ), 🔊, Naver ↗ khi chưa có nghĩa.
   - “★ Lưu vào sổ từ” → Sổ từ (nút “📖 Sổ từ” cuối thanh chọn buổi, cạnh “✏ Bảng”): danh sách theo ngày, ô gõ từ để tra (dùng khi đang ở bảng trắng),
     “Chép danh sách” (gửi Zalo), “Tạo bài tập” → link thi-thu/#v=… (bài từ vựng như trang quản lý giao: Nối từ / Hàn → Việt / Điền câu…).
   - Lưu trên máy cô: localStorage `nari-sotu`. */
(function(){
  if(window.__tratu)return;window.__tratu=1;
  var me=document.currentScript,BASE=me?me.src.replace(/[^\/]*(\?.*)?$/,''):'../';
  var LS='nari-sotu',DICT=null,dictP=null,box,panel,chip,nbtn,cur=null,day=today(),sel=null;
  var VT=[['match','Nối từ'],['kv','Trắc nghiệm Hàn → Việt'],['vk','Trắc nghiệm Việt → Hàn'],['cau','Điền từ vào câu'],['type','Gõ từ tiếng Hàn'],['nk','Nghe → chọn nghĩa']];
  function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  function dm(s){var p=s.split('-');return p[2]+'/'+p[1];}
  function load(){try{return JSON.parse(localStorage.getItem(LS)||'{"it":[]}');}catch(e){return {it:[]};}}
  function store(o){try{localStorage.setItem(LS,JSON.stringify(o));}catch(e){}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
  function getDict(){
    if(DICT)return Promise.resolve(DICT);
    if(!dictP)dictP=fetch(BASE+'tra-tu/tu.json').then(function(r){return r.json();}).then(function(j){DICT=j;return j;}).catch(function(){DICT={d:{},f:{}};return DICT;});
    return dictP;
  }
  /* Từ gốc + nghĩa: chữ trong đề → từ gốc; không có thì cắt dần đuôi (tiểu từ, đuôi câu) và thử thêm 다 / 하다 */
  function look(s){
    var D=DICT.d,F=DICT.f,out=[],seen={};
    function add(b){if(b&&D[b]&&!seen[b]){seen[b]=1;out.push([b,D[b]]);}}
    s=s.replace(/^[^가-힣]+|[^가-힣]+$/g,'');if(!s)return out;
    add(s);add(F[s]);
    var t=s.split(/\s+/);
    if(t.length>1){add(t.join(' '));for(var k=t.length-1;k>=1;k--)add(t.slice(0,k).join(' '));s=t[0];add(s);add(F[s]);}
    for(var L=s.length;L>=1&&out.length<4;L--){var p=s.slice(0,L);add(F[p]);if(L>1||!out.length){add(p);add(p+'다');add(p+'하다');}}
    if(/(했|해|하|한|할|함)/.test(s.slice(-3))){var st=s.replace(/(했|해|하|한|할|함).*$/,'');add(st+'하다');add(st);}
    return out.slice(0,4);
  }
  function sentenceOf(range,word){
    try{
      var n=range.startContainer;n=n.nodeType===1?n:n.parentNode;
      var b=n.closest('p,li,td,th,dd,blockquote,.q,.passage,.pas,div')||n;
      var tx=(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim();if(tx.length>1200)return '';
      var ss=tx.match(/[^.?!。\n]+[.?!。]?/g)||[tx];
      for(var i=0;i<ss.length;i++){var x=ss[i].replace(/^[^가-힣'"‘“(]*/,'').trim();if(x.indexOf(word)>=0&&/[가-힣]/.test(x)&&x.length<=180)return x.replace(word,'__'+word+'__');}
    }catch(e){}
    return '';
  }
  function say(t){try{var u=new SpeechSynthesisUtterance(String(t).replace(/__/g,''));u.lang='ko-KR';u.rate=.85;
    var v=speechSynthesis.getVoices().filter(function(x){return /^ko/i.test(x.lang);})[0];if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}

  var css=
'.tt-chip{position:fixed;z-index:10060;font:bold 14px Arial,sans-serif;padding:5px 10px;border:0;border-radius:16px;background:#53468F;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.25);cursor:pointer}'+
'#ttbox,#ttpanel{position:fixed;z-index:10055;background:#fff;color:#1d1a2c;border:3px solid #53468F;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);font:15px/1.4 Arial,sans-serif;box-sizing:border-box}'+
'#ttbox{width:min(380px,calc(100vw - 16px));padding:10px 12px}#ttbox .ko{font-size:26px;font-weight:bold;font-family:"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif}'+
'#ttbox .hd,#ttpanel .hd{display:flex;align-items:center;gap:6px}#ttbox .hd .ko{flex:1}'+
'#ttbox button,#ttpanel button,#ttpanel select{font:bold 14px Arial,sans-serif;padding:6px 10px;border:1px solid #c9c3df;border-radius:8px;background:#f4f1fb;color:#1d1a2c;cursor:pointer}'+
'#ttbox button.pri,#ttpanel button.pri{background:#53468F;color:#fff;border-color:#53468F}#ttbox .x,#ttpanel .x{background:none;border:0;font-size:18px}'+
'#ttbox .cd{display:block;width:100%;text-align:left;margin:4px 0;font-weight:normal}#ttbox .cd b{font-family:"Malgun Gothic","Noto Sans KR",sans-serif}#ttbox .cd.on{background:#FFF6CC;border-color:#D4A843}'+
'#ttbox label{display:block;font-size:12px;color:#6b6585;margin-top:8px}#ttbox input,#ttbox textarea,#ttpanel input{width:100%;box-sizing:border-box;font:16px Arial,sans-serif;padding:6px 8px;border:1px solid #c9c3df;border-radius:8px}'+
'#ttbox textarea{height:3.4em;resize:vertical;font-family:"Malgun Gothic","Noto Sans KR",Arial,sans-serif}#ttbox .no{color:#b0302f;font-size:13px;margin:6px 0}'+
'#ttbox .row,#ttpanel .row{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}#ttbox a{font-size:13px;align-self:center;color:#53468F}'+
'#ttpanel{right:12px;bottom:12px;width:min(520px,calc(100vw - 24px));max-height:min(80vh,640px);display:flex;flex-direction:column;padding:10px 12px}'+
'#ttpanel .hd b{flex:1;font-size:17px}#ttpanel .ls{overflow:auto;flex:1;margin-top:8px;border-top:1px solid #eee}'+
'#ttpanel .it{display:grid;grid-template-columns:auto 1fr auto;gap:2px 8px;padding:6px 2px;border-bottom:1px solid #eee;align-items:start}'+
'#ttpanel .it .k{font:bold 17px "Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif}#ttpanel .it input{font-size:15px;padding:3px 6px}'+
'#ttpanel .it .e{grid-column:1/4;font-size:13px;color:#6b6585;font-family:"Malgun Gothic","Noto Sans KR",Arial,sans-serif}#ttpanel .it .e u{background:#FFF6CC;text-decoration:none}'+
'#ttpanel .em{color:#6b6585;padding:14px 4px}#ttpanel .ty{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:14px;margin-top:6px}#ttpanel .msg{font-size:13px;color:#1b8a3a;margin-top:6px;word-break:break-all}'+
'.tt-nbtn{flex:none;font-family:inherit;font-weight:bold;font-size:15px;line-height:1.2;padding:4px 10px;border:2px solid var(--ink,#53468F);border-radius:8px;background:var(--bg,#fff);color:var(--ink,#53468F);cursor:pointer}'+
'.tt-nbtn small{display:block;font-weight:normal;font-size:12px}.tt-nbtn:hover{background:var(--ink,#53468F);color:#fff}.tt-nbtn.fl{position:fixed;right:10px;bottom:110px;z-index:60}'+
'nav.ttn{display:flex;align-items:stretch;gap:6px}nav.ttn>.bar{flex:1;min-width:0}'+
'@media (max-width:560px){.tt-nbtn{padding:4px 6px;font-size:16px}.tt-nbtn small{font-size:10px}}@media print{.tt-chip,#ttbox,#ttpanel,.tt-nbtn{display:none!important}}';

  /* ---------- khung nghĩa ---------- */
  function openBox(word,ex,rect){
    hideChip();getDict().then(function(){
      if(!box){box=el('div');box.id='ttbox';document.body.appendChild(box);
        box.addEventListener('mousedown',function(e){e.stopPropagation();});box.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Escape')closeBox();});}
      var c=look(word);cur={w:word,b:c.length?c[0][0]:word,vi:c.length?c[0][1]:'',ex:ex||''};
      var h='<div class="hd"><span class="ko">'+esc(word)+'</span><button data-a="say" title="Nghe">🔊</button><button class="x" data-a="x" title="Đóng (Esc)">✕</button></div>';
      if(c.length)c.forEach(function(x,i){h+='<button class="cd'+(i?'':' on')+'" data-i="'+i+'"><b>'+esc(x[0])+'</b> — '+esc(x[1])+'</button>';});
      else h+='<div class="no">Từ điển của trang chưa có từ này — cô gõ nghĩa, hoặc tra Naver.</div>';
      h+='<label>Từ lưu vào sổ (từ gốc)</label><input data-f="b" value="'+esc(cur.b)+'">'+
        '<label>Nghĩa</label><input data-f="vi" value="'+esc(cur.vi)+'" placeholder="Gõ nghĩa tiếng Việt">'+
        '<label>Câu ví dụ (chữ trong __ __ là chỗ học sinh điền ở bài “Điền từ vào câu”)</label><textarea data-f="ex">'+esc(cur.ex)+'</textarea>'+
        '<div class="row"><button class="pri" data-a="save">★ Lưu vào sổ từ</button><button data-a="book">📖 Sổ từ</button>'+
        '<a href="https://dict.naver.com/kovidict/#/search?query='+encodeURIComponent(word)+'" target="_blank" rel="noopener">Naver ↗</a></div>';
      box.innerHTML=h;
      box.onclick=function(e){var b=e.target.closest('button');if(!b)return;
        if(b.dataset.i!=null){var x=c[+b.dataset.i];box.querySelector('[data-f=b]').value=x[0];box.querySelector('[data-f=vi]').value=x[1];
          box.querySelectorAll('.cd').forEach(function(z){z.classList.toggle('on',z===b);});return;}
        var a=b.dataset.a;if(a==='x')closeBox();else if(a==='say')say(box.querySelector('[data-f=b]').value||word);
        else if(a==='book'){closeBox();openPanel();}
        else if(a==='save'){var o={ko:box.querySelector('[data-f=b]').value.trim(),vi:box.querySelector('[data-f=vi]').value.trim(),ex:box.querySelector('[data-f=ex]').value.trim()};
          if(!o.ko)return;if(!o.vi){box.querySelector('[data-f=vi]').focus();return;}saveWord(o);b.textContent='✓ Đã lưu';setTimeout(closeBox,500);}};
      var W=Math.min(380,innerWidth-16),x=rect?Math.min(Math.max(8,rect.left),innerWidth-W-8):innerWidth-W-12,y=rect?rect.bottom+8:80;
      box.style.left=x+'px';box.style.top='0px';box.style.display='block';
      var hh=box.offsetHeight;if(y+hh>innerHeight-8)y=rect&&rect.top-hh-8>8?rect.top-hh-8:Math.max(8,innerHeight-hh-8);box.style.top=y+'px';
    });
  }
  function closeBox(){if(box)box.style.display='none';}
  function saveWord(o){
    var s=load(),f=null;s.it.forEach(function(x){if(x.d===day&&x.ko===o.ko)f=x;});
    if(f){f.vi=o.vi;if(o.ex)f.ex=o.ex;}else s.it.push({ko:o.ko,vi:o.vi,ex:o.ex,d:day,p:(document.title||'').split(/[·|–-]/)[0].trim(),u:location.pathname+location.hash,at:Date.now()});
    store(s);paintCount();if(panel&&panel.style.display!=='none')drawPanel();
  }
  /* ---------- chọn chữ trên trang → nút “📖 Tra” ---------- */
  function hideChip(){if(chip)chip.style.display='none';}
  function inUI(n){n=n&&(n.nodeType===1?n:n.parentNode);return n&&n.closest&&n.closest('#ttbox,#ttpanel,#bang,#bgbar,input,textarea,[contenteditable]');}
  function curSel(){
    var s=window.getSelection();if(!s||s.isCollapsed||!s.rangeCount)return null;
    var t=s.toString().replace(/\s+/g,' ').trim();if(!t||t.length>40||!/[가-힣]/.test(t)||inUI(s.anchorNode))return null;
    var r=s.getRangeAt(0);return {t:t,r:r,rect:r.getBoundingClientRect()};
  }
  var opening=0;
  document.addEventListener('mouseup',function(e){if(inUI(e.target))return;setTimeout(function(){if(Date.now()-opening<500)return;sel=curSel();
    if(!sel){hideChip();return;}
    if(!chip){chip=el('button','tt-chip','📖 Tra');chip.type='button';document.body.appendChild(chip);
      chip.addEventListener('mousedown',function(e){e.preventDefault();e.stopPropagation();});
      chip.onclick=function(){if(sel)openBox(sel.t.replace(/^[^가-힣]+|[^가-힣]+$/g,''),sentenceOf(sel.r,sel.t),sel.rect);};}
    chip.style.display='block';chip.style.left=Math.min(innerWidth-90,Math.max(4,sel.rect.left))+'px';chip.style.top=Math.max(4,sel.rect.top-40)+'px';},10);});
  document.addEventListener('dblclick',function(e){if(inUI(e.target))return;var s=curSel();if(s){opening=Date.now();hideChip();}if(s)openBox(s.t.replace(/^[^가-힣]+|[^가-힣]+$/g,''),sentenceOf(s.r,s.t),s.rect);});
  document.addEventListener('mousedown',function(e){if(box&&box.style.display==='block'&&!e.target.closest('#ttbox,.tt-chip'))closeBox();});
  addEventListener('scroll',hideChip,{passive:true});

  /* ---------- Sổ từ ---------- */
  function openPanel(){
    if(!panel){panel=el('div');panel.id='ttpanel';document.body.appendChild(panel);
      panel.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Escape')panel.style.display='none';});
      panel.addEventListener('mousedown',function(e){e.stopPropagation();});}
    panel.style.display='flex';drawPanel();
  }
  function items(){var s=load();return s.it.filter(function(x){return day==='*'||x.d===day;});}
  function drawPanel(msg){
    var s=load(),ds={};s.it.forEach(function(x){ds[x.d]=1;});ds[today()]=1;
    var opt=Object.keys(ds).sort().reverse().map(function(d){return '<option value="'+d+'"'+(d===day?' selected':'')+'>Buổi '+dm(d)+(d===today()?' (hôm nay)':'')+'</option>';}).join('')+'<option value="*"'+(day==='*'?' selected':'')+'>Tất cả</option>';
    var L=items(),h='<div class="hd"><b>📖 Sổ từ</b><select data-a="day">'+opt+'</select><button class="x" data-a="x">✕</button></div>'+
      '<div class="row" style="margin-top:6px"><input data-f="q" placeholder="Gõ từ tiếng Hàn để tra (vd. 이사했다)" style="flex:1;min-width:150px"><button data-a="q">Tra</button></div><div class="ls">';
    if(!L.length)h+='<div class="em">Chưa có từ nào. Nhấp đúp vào từ tiếng Hàn trong trang (hoặc bôi đen → “📖 Tra”) rồi bấm “★ Lưu vào sổ từ”.</div>';
    L.forEach(function(x,i){h+='<div class="it"><span class="k">'+esc(x.ko)+'</span><input data-v="'+i+'" value="'+esc(x.vi)+'"><button class="x" data-del="'+i+'" title="Bỏ từ này">🗑</button>'+
      (x.ex?'<div class="e">'+esc(x.ex).replace(/__(.+?)__/,'<u>$1</u>')+'</div>':'')+'</div>';});
    h+='</div>';
    if(L.length)h+='<div class="row"><button data-a="copy">📋 Chép danh sách</button><button class="pri" data-a="mk">📝 Tạo bài tập ('+L.length+' từ)</button>'+(day!=='*'?'<button data-a="clr">Xóa sổ buổi này</button>':'')+'</div>'+
      '<div class="ty">'+VT.map(function(t,i){return '<label><input type="checkbox" data-y="'+t[0]+'"'+(i===0||i===3?' checked':'')+'> '+t[1]+'</label>';}).join('')+'</div>';
    if(msg)h+='<div class="msg">'+msg+'</div>';
    panel.innerHTML=h;
    panel.querySelector('[data-a=day]').onchange=function(){day=this.value;drawPanel();};
    var q=panel.querySelector('[data-f=q]');q.onkeydown=function(e){if(e.key==='Enter')panel.querySelector('[data-a=q]').click();};
    panel.querySelectorAll('[data-v]').forEach(function(inp){inp.onchange=function(){var x=L[+inp.dataset.v],s=load();s.it.forEach(function(y){if(y.at===x.at&&y.ko===x.ko)y.vi=inp.value.trim();});store(s);};});
    panel.onclick=function(e){var b=e.target.closest('button');if(!b)return;
      if(b.dataset.del!=null){var x=L[+b.dataset.del],s=load();s.it=s.it.filter(function(y){return !(y.at===x.at&&y.ko===x.ko);});store(s);paintCount();drawPanel();return;}
      var a=b.dataset.a;
      if(a==='x')panel.style.display='none';
      else if(a==='q'){var w=q.value.trim();if(w)openBox(w,'',null);}
      else if(a==='clr'){if(confirm('Xóa hết từ của buổi '+dm(day)+' trong sổ?')){var s=load();s.it=s.it.filter(function(y){return y.d!==day;});store(s);paintCount();drawPanel();}}
      else if(a==='copy')share(listText(L),'Đã chép danh sách '+L.length+' từ — dán vào Zalo gửi học sinh.');
      else if(a==='mk'){var ys=[].slice.call(panel.querySelectorAll('[data-y]:checked')).map(function(c){return c.dataset.y;}).slice(0,3);
        if(!ys.length){drawPanel('Cô tick ít nhất một dạng bài.');return;}
        var t='Từ vựng buổi '+(day==='*'?dm(today()):dm(day)),link=mkLink(L,ys.join('+'),t);
        share(t+' ('+L.length+' từ). Em làm bài rồi gửi lại kết quả cho cô nhé:\n'+link,'Đã chép tin nhắn có link bài tập ('+ys.length+' dạng). Link: '+esc(link));}
    };
  }
  function listText(L){
    var t='📖 Từ vựng buổi '+(day==='*'?dm(today()):dm(day))+'\n';
    L.forEach(function(x,i){t+=(i+1)+'. '+x.ko+' – '+x.vi+'\n'+(x.ex?'   VD: '+x.ex.replace(/__/g,'')+'\n':'');});
    return t.trim();
  }
  function sum(str){var h=7;for(var i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))%1679616;return h.toString(36);}
  function mkLink(L,y,t){
    var d=day==='*'?today():day,a={c:'ST'+d.replace(/-/g,'').slice(2)+sum(L.map(function(x){return x.ko;}).join('|')).slice(0,2).toUpperCase(),t:t,y:y,
      w:L.map(function(x){return [x.ko,x.vi,x.ex||''];})};
    var raw=btoa(unescape(encodeURIComponent(JSON.stringify(a)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    var h=7;for(var i=0;i<raw.length;i++)h=(h*31+raw.charCodeAt(i))%1679616;
    return new URL(BASE+'thi-thu/',location.href).href+'#v='+raw+'.'+h.toString(36).padStart(4,'0');
  }
  function share(text,ok){
    var done=function(){drawPanel(ok);};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,function(){prompt('Chép đoạn này:',text);done();});
    else{prompt('Chép đoạn này:',text);done();}
  }
  function paintCount(){var n=load().it.filter(function(x){return x.d===today();}).length;if(nbtn)nbtn.innerHTML='📖<small>Sổ từ'+(n?' ('+n+')':'')+'</small>';}

  function init(){
    var s=el('style');s.textContent=css;document.head.appendChild(s);
    nbtn=el('button','tt-nbtn');nbtn.type='button';nbtn.title='Sổ từ buổi học: tra từ, danh sách gửi học sinh, tạo bài tập';nbtn.onclick=openPanel;paintCount();
    var nav=document.querySelector('nav'),bb=nav&&nav.querySelector('.bang-btn');
    if(nav){nav.classList.add('ttn');nav.insertBefore(nbtn,bb||null);}else{nbtn.classList.add('fl');document.body.appendChild(nbtn);}
    setTimeout(function(){var cb=document.getElementById('chbar');if(!cb)return;
      var b=el('button','','📖 Sổ từ');b.type='button';b.onclick=function(e){e.stopPropagation();openPanel();};
      var x=cb.querySelector('[data-a=x]');cb.insertBefore(b,x||null);},0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.traTu={open:openPanel,look:function(w){return getDict().then(function(){return look(w);});}};
})();
