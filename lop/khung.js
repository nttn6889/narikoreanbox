/* Khung chung của trang lớp Seoul (lop/1a|2a|3a|4a/), cùng kiểu trang chủ TOPIK II:
   thanh phần Từ vựng · Ngữ pháp · Nghe · Đọc · Viết → thanh chọn bài (theo cuốn của lớp) → nội dung bài.
   - Từ vựng: thẻ “Bảng từ” (vẽ thẳng từ thi-thu/vocab.json, phần `Seoul <cuốn> · Bài N · …`) + “Học liệu”.
   - Ngữ pháp: thẻ “Mẫu ngữ pháp” (seoul/ngu-phap/np.json) + “Học liệu”.
   - Nghe · Đọc · Viết: “Học liệu” của bài (chưa có thì báo cô đang soạn).
   Học liệu thêm tay vào HL: '<lớp>' → {'<phần>:<cuốn>-<bài>' hoặc '<phần>:chung': [[loại, tên, link (tính từ gốc site), mô tả]]}.
   Chỉ đưa trang học sinh (không đưa giáo án / bản trình chiếu của cô).
   Link: #k=tu|np|nghe|doc|viet&b=2A-3&t=bang|hl   (b=chung = học liệu dùng cho mọi bài) */
(function(){
  var me = document.currentScript, root = me.getAttribute('data-root') || '../../', lop = me.getAttribute('data-lop') || '';
  var BOOKS = (me.getAttribute('data-books') || '').split(',');
  var PARTS = [['tu', 'Từ vựng', 'Theo bài'], ['np', 'Ngữ pháp', 'Theo bài'], ['nghe', 'Nghe', 'Theo bài'], ['doc', 'Đọc', 'Theo bài'], ['viet', 'Viết', 'Theo bài']];
  /* số bài từng cuốn khi chưa có tên bài trong seoul/bai.json */
  var NBAI = {'1A': [1, 8], '1B': [9, 16], '2A': [1, 9], '2B': [10, 18], '3A': [1, 9], '3B': [10, 18], '4A': [1, 9], '4B': [10, 18]};
  /* Bài có trang tu-sau/ và bai-tap/ (giống TS, BT của seoul/index.html) */
  var TS = {'2A-2': 1, '2A-3': 1};
  var BT = {'1A-1': 1, '1A-2': 1, '1A-3': 1, '2A-1': 1, '2A-2': 1, '2A-3': 1};
  var HL = {
    '1a': {'nghe:chung': [['Phát âm', 'Nối âm 연음', 'so-cap/noi-am/', 'Quy tắc nối âm, luyện đọc']]},
    '3a': {'np:3A-1': [['Kiểm tra', 'Kiểm tra sau Bài 1', 'seoul/3a-kt/#b=1', 'Bài về nhà: Chọn · Gõ · Dịch, gửi kết quả cho cô']],
           'np:chung': [['Chuyên đề', 'Tiểu từ dễ nhầm', 'seoul/tieu-tu/', '5 nhóm tiểu từ hay nhầm + luyện tập']]}
  };
  var NAME = {tu: 'từ vựng', np: 'ngữ pháp', nghe: 'nghe', doc: 'đọc', viet: 'viết'};

  var partsEl = document.getElementById('parts'), nav = document.getElementById('nav'), out = document.getElementById('out');
  var S = {k: 'tu', b: '', t: ''}, D = {bai: null, vocab: null, np: null};
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function ul(s){ return esc(s).replace(/__(.+?)__/g, '<u>$1</u>'); }
  function plain(s){ return String(s || '').replace(/\*\*/g, ''); }
  function load(name, url){
    fetch(root + url).then(function(r){ if(!r.ok) throw r.status; return r.json(); }).then(function(v){ D[name] = v; }, function(){ D[name] = false; }).then(render);
  }
  function hashArg(n){ var m = new RegExp('[#&]' + n + '=([^&]*)').exec(location.hash); return m ? decodeURIComponent(m[1]) : ''; }

  /* Danh sách bài của lớp: [{b: '2A', n: 3, id: '2A-3', vi}] */
  function lessons(){
    var L = [];
    BOOKS.forEach(function(b){
      var r = NBAI[b] || [1, 9];
      for(var n = r[0]; n <= r[1]; n++) L.push({b: b, n: n, id: b + '-' + n, vi: (D.bai || {})[b + '-' + n] || ''});
    });
    return L;
  }
  function lessonOf(id){ return lessons().filter(function(x){ return x.id === id; })[0]; }
  function vocabOf(x){
    var pre = 'Seoul ' + x.b + ' · Bài ' + x.n + ' · ';
    return ((D.vocab || {}).g || []).filter(function(g){ return g.sec.indexOf(pre) === 0; }).sort(function(a, b){ return a.o - b.o; });
  }
  function npOf(x){ return (((D.np || {}).b || {})[x.b] || []).filter(function(L){ return L.n === x.n; })[0]; }
  function koTitle(x){
    var g = vocabOf(x)[0]; if(g) return g.sec.split(' · ').slice(2).join(' · ');
    var p = npOf(x); return p ? p.ko : '';
  }
  /* Học liệu của bài cho từng phần: trang chung tự sinh + HL */
  function hlOf(k, x){
    var L = [];
    if(x){
      var q = '#b=' + x.b + '&c=' + x.n;
      if(k === 'tu'){
        if(vocabOf(x).length) L.push(['Bảng từ', 'Từ vựng Seoul ' + x.b + ' · Bài ' + x.n, 'seoul/' + q, 'Bảng từ, Hán Việt, câu ví dụ, in ra được']);
        if(TS[x.id]) L.push(['Học sâu', 'Từ vựng học sâu · nối sang TOPIK', 'seoul/tu-sau/' + q, 'Cụm hay đi cùng, từ trung cấp, câu trong đề thật']);
        if(BT[x.id]) L.push(['Bài tập', 'Bài tập từ vựng Bài ' + x.n, 'seoul/bai-tap/' + q + '&t=v', 'Nghe, chọn nghĩa, điền câu — chấm ngay']);
      }
      if(k === 'np'){
        if(npOf(x)) L.push(['Giải thích', 'Ngữ pháp Seoul ' + x.b + ' · Bài ' + x.n, 'seoul/ngu-phap/' + q, 'Giải thích từng mẫu, ví dụ có loa']);
        if(BT[x.id]) L.push(['Bài tập', 'Bài tập ngữ pháp Bài ' + x.n, 'seoul/bai-tap/' + q + '&t=g', 'Chọn, gõ, dịch — chấm ngay, gửi kết quả cho cô']);
      }
    }
    return L.concat((HL[lop] || {})[k + ':' + (x ? x.id : 'chung')] || []);
  }
  function hlHTML(L){
    return '<div class="hl">' + L.map(function(x){ return '<a href="' + esc(root + x[2]) + '"><span class="tag">' + esc(x[0]) + '</span><span><b>' + esc(x[1]) + '</b><small>' + esc(x[3]) + '</small></span></a>'; }).join('') + '</div>';
  }

  function bangHTML(x){
    var G = vocabOf(x);
    if(D.vocab === null) return '<p class="empty">Đang tải bảng từ…</p>';
    if(!G.length) return '<p class="empty">Bài này cô chưa nhập bảng từ.</p>';
    var h = '<div class="tools"><button type="button" id="tg">Ẩn nghĩa</button><span>Ẩn nghĩa để tự kiểm tra, chạm vào ô để xem lại.</span></div><div id="tbs">';
    G.forEach(function(g){
      h += '<div class="blk"><h4>' + esc(g.ko) + ' <small>' + esc(g.vi) + '</small></h4><div class="tb"><div class="h">Từ</div><div class="h">Nghĩa</div>';
      g.w.forEach(function(w){ h += '<div class="ko">' + esc(w[1]) + '</div><div class="vi">' + esc(w[2]) + (w[4] ? '<span class="mt">' + esc(w[4]) + '</span>' : '') + '</div>' + (w[3] ? '<div class="ex">' + ul(w[3]) + '</div>' : ''); });
      h += '</div></div>';
    });
    return h + '</div>';
  }
  function npHTML(x){
    var L = npOf(x);
    if(D.np === null) return '<p class="empty">Đang tải ngữ pháp…</p>';
    if(!L) return '<p class="empty">Bài này cô chưa nhập ngữ pháp.</p>';
    return '<div class="dl">' + L.g.map(function(g, i){
      return '<a href="' + root + 'seoul/ngu-phap/#b=' + x.b + '&c=' + x.n + '&g=' + (i + 1) + '"><b class="kr">' + (i + 1) + '. ' + esc(g.t) + '</b><small>' + esc(plain((g.m || {}).vi)) + '</small></a>';
    }).join('') + '</div>';
  }

  function setHash(){ var h = '#k=' + S.k + '&b=' + S.b + (S.t ? '&t=' + S.t : ''); if(location.hash !== h) history.replaceState(null, '', location.pathname + location.search + h); }
  function render(){
    var L = lessons(), chung = hlOf(S.k, null).length;
    if(S.b === 'chung' && !chung) S.b = '';
    if(S.b !== 'chung' && !lessonOf(S.b)) S.b = L[0].id;
    setHash();
    partsEl.innerHTML = PARTS.map(function(p){ return '<button type="button" data-k="' + p[0] + '"' + (p[0] === S.k ? ' class="on"' : '') + '>' + p[1] + '<small>' + p[2] + '</small></button>'; }).join('');
    var h = chung ? '<a href="javascript:void 0" data-b="chung"' + (S.b === 'chung' ? ' class="on"' : '') + '>★ Dùng chung</a>' : '', bk = '';
    L.forEach(function(x){
      if(x.b !== bk){ bk = x.b; h += '<span class="bk">' + x.b + '</span>'; }
      h += '<a href="javascript:void 0" data-b="' + x.id + '"' + (x.id === S.b ? ' class="on"' : '') + (x.vi ? ' title="' + esc(x.vi) + '"' : '') + '>Bài ' + x.n + '</a>';
    });
    nav.innerHTML = h;

    if(S.b === 'chung'){
      out.innerHTML = '<h2>Dùng chung cho mọi bài <small>· ' + NAME[S.k] + '</small></h2>' + hlHTML(hlOf(S.k, null));
      return;
    }
    var x = lessonOf(S.b), ko = koTitle(x), list = hlOf(S.k, x);
    h = '<h2>Bài ' + x.n + (ko ? ' · <span class="kr">' + esc(ko) + '</span>' : '') + (x.vi ? ' <small>' + esc(x.vi) + '</small>' : '') + '</h2>';
    var TAB = S.k === 'tu' ? [['bang', 'Bảng từ'], ['hl', 'Học liệu']] : S.k === 'np' ? [['mau', 'Mẫu ngữ pháp'], ['hl', 'Học liệu']] : null;
    if(TAB){
      if(!TAB.some(function(t){ return t[0] === S.t; })) S.t = TAB[0][0];
      setHash();
      h += '<div class="tabs">' + TAB.map(function(t){ return '<button type="button" data-t="' + t[0] + '"' + (t[0] === S.t ? ' class="on"' : '') + '>' + t[1] + (t[0] === 'hl' ? ' <small>' + list.length + '</small>' : '') + '</button>'; }).join('') + '</div>';
    } else S.t = 'hl';
    if(S.t === 'bang') h += bangHTML(x);
    else if(S.t === 'mau') h += npHTML(x);
    else h += list.length ? hlHTML(list) : '<p class="empty">Cô đang soạn học liệu ' + NAME[S.k] + ' cho bài này.' + (S.k === 'tu' || S.k === 'np' ? '' : ' Trong lúc chờ, em học <a href="#k=tu&b=' + x.id + '">Từ vựng</a> và <a href="#k=np&b=' + x.id + '">Ngữ pháp</a> của bài trước nhé.') + '</p>';
    if(chung && S.t === 'hl') h += '<p class="intro" style="margin-top:12px">Xem thêm: <a href="#k=' + S.k + '&b=chung">★ Học liệu ' + NAME[S.k] + ' dùng chung</a></p>';
    out.innerHTML = h;
  }

  partsEl.addEventListener('click', function(e){ var b = e.target.closest('button'); if(!b) return; S.k = b.getAttribute('data-k'); S.t = ''; render(); });
  nav.addEventListener('click', function(e){
    var a = e.target.closest('a[data-b]'); if(!a) return;
    S.b = a.getAttribute('data-b'); render();
    var top = out.getBoundingClientRect().top + scrollY - nav.offsetHeight - 8;
    if(scrollY > top) scrollTo(0, top);
  });
  out.addEventListener('click', function(e){
    var t = e.target.closest('.tabs button'); if(t){ S.t = t.getAttribute('data-t'); render(); return; }
    if(e.target.id === 'tg'){ var tb = out.querySelector('#tbs'), on = tb.classList.toggle('hide'); e.target.textContent = on ? 'Hiện nghĩa' : 'Ẩn nghĩa'; out.querySelectorAll('.vi.show').forEach(function(v){ v.classList.remove('show'); }); return; }
    var v = e.target.closest('.hide .vi'); if(v) v.classList.toggle('show');
  });
  function fromHash(){
    var k = hashArg('k');
    S.k = PARTS.some(function(p){ return p[0] === k; }) ? k : S.k;
    S.b = hashArg('b').toUpperCase().replace('CHUNG', 'chung') || S.b;
    S.t = hashArg('t') || S.t;
    render();
  }
  window.addEventListener('hashchange', function(){ if(/[#&]k=/.test(location.hash)) fromHash(); });
  fromHash();
  load('bai', 'seoul/bai.json'); load('vocab', 'thi-thu/vocab.json'); load('np', 'seoul/ngu-phap/np.json');
})();
