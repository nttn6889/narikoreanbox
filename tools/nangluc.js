/* ---------- Đánh giá năng lực (dùng chung cho trang quản lý và trang học sinh) ----------
   Nguồn: tools/nangluc.js, chèn vào trang bằng tools/nangluc.py — sửa ở file đó, không sửa trong trang.
   Gom 3 nguồn: đề thi (results), từ vựng (vresults), luyện nghe (nresults). Số liệu tính lại từ bài đã chấm,
   chỉ lưu nhận xét (notes/<id>.text, dùng chung với Sổ điểm) và việc cần làm (nlnotes/<id>.next). Bản gửi học sinh nằm trọn trong link thi-thu/#r=<base64>.<sum>. */
var NL_RT = [[1,2,"Ngữ pháp – điền chỗ trống"],[3,4,"Ngữ pháp – nghĩa tương đương"],[5,8,"Chủ đề của văn bản ngắn"],
  [9,12,"Đối chiếu nội dung"],[13,15,"Sắp xếp câu"],[16,18,"Điền vào chỗ trống"],[19,24,"Đoạn văn 2 câu hỏi"],
  [25,27,"Tiêu đề báo"],[28,31,"Điền chỗ trống (đoạn dài)"],[32,34,"Nội dung giống với bài"],[35,38,"Ý chính của bài"],
  [39,41,"Vị trí của câu"],[42,43,"Văn học"],[44,50,"Văn bản dài"]];
var NL_LP = ["Phần 1 · Hiểu nội dung", "Phần 2 · Chọn câu nói tiếp theo", "Phần 3 · Nghe điền từ"];
var NL_VT = {match:"Nối từ", kv:"Hàn → Việt", vk:"Việt → Hàn", nk:"Nghe → nghĩa", type:"Gõ từ tiếng Hàn"};
function nlType(n){ for(var i = 0; i < NL_RT.length; i++) if(n >= NL_RT[i][0] && n <= NL_RT[i][1]) return i; return -1; }
function nlPct(a){ return a && a[1] ? Math.round(a[0]*100/a[1]) : null; }
function nlCls(p){ return p == null ? "" : p >= 80 ? "good" : p >= 60 ? "warn" : "bad"; }
function nlCss(){
  if(document.getElementById("nlcss")) return;
  var st = document.createElement("style"); st.id = "nlcss";
  st.textContent = ".nlsec{margin-top:18px}.nlsec>h3{margin:0 0 4px;font-size:16.5px}" +
    ".nlrow{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(50px,1fr) auto;gap:2px 10px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line);font-size:14.5px}" +
    ".nll small{display:block;color:var(--muted);font-size:12.5px}.nlv{font-size:13px;color:var(--muted);white-space:nowrap;text-align:right}.nlv b{color:var(--ink);font-size:14px}" +
    ".nlbar{height:9px;background:var(--bg);border:1px solid var(--line);border-radius:5px;overflow:hidden}.nlbar i{display:block;height:100%}" +
    ".nlbar i.good,.nlk.good{background:var(--ok)}.nlbar i.warn,.nlk.warn{background:var(--warn)}.nlbar i.bad,.nlk.bad{background:var(--pen)}" +
    ".kq-sum b.good{color:var(--ok)}.kq-sum b.warn{color:var(--warn)}.kq-sum b.bad{color:var(--pen)}" +
    ".nldays{display:grid;grid-template-columns:repeat(14,1fr);gap:3px;max-width:430px;margin:6px 0}" +
    ".nldays span{aspect-ratio:1;border-radius:3px;background:var(--bg);border:1px solid var(--line)}.nldays span.l1{background:var(--ok-soft);border-color:var(--ok)}.nldays span.l2{background:var(--ok);border-color:var(--ok)}" +
    ".nlch .s0{stroke:var(--violet)}.nlch .s1{stroke:var(--ok)}.nlch .s2{stroke:var(--warn)}.nlch path{fill:none;stroke-width:2.5}.nlch circle{fill:var(--paper);stroke-width:2.5}" +
    ".nlleg{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--muted)}.nlleg i{display:inline-block;width:12px;height:4px;border-radius:2px;margin-right:5px;vertical-align:3px}" +
    ".nlleg .s0{background:var(--violet)}.nlleg .s1{background:var(--ok)}.nlleg .s2{background:var(--warn)}" +
    ".nlw{display:inline-block;border:1px solid var(--line);border-radius:6px;padding:2px 8px;margin:2px 4px 2px 0;font-size:14px}.nlw b{font-family:var(--kr)}" +
    ".nlcards{display:grid;gap:10px}@media(min-width:640px){.nlcards{grid-template-columns:1fr 1fr}}.nlcards .card{margin:0;padding:14px;cursor:pointer}.nlcards .card:hover{border-color:var(--violet)}" +
    ".nlmini{display:grid;grid-template-columns:auto 1fr auto;gap:2px 8px;align-items:center;font-size:13px;margin-top:6px}";
  document.head.appendChild(st);
}
function nlBar(label, a, sub){
  var p = nlPct(a);
  return '<div class="nlrow"><div class="nll">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</div><div class="nlbar"><i class="' + nlCls(p) + '" style="width:' + (p || 0) + '%"></i></div>' +
    '<div class="nlv">' + a[0] + '/' + a[1] + ' · <b>' + p + '%</b></div></div>';
}
/* Biểu đồ theo tuần: w = [[nhãn, đọc%, nghe%, từ%]] (-1 = tuần đó không làm). */
function nlChart(w){
  var W = 440, H = 170, L = 40, R = 14, T = 12, B = 26, step = w.length > 1 ? (W - L - R) / (w.length - 1) : 0;
  var y = function(p){ return T + (H - T - B) * (1 - p/100); };
  var h = '<svg class="chart nlch" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Tỉ lệ đúng theo tuần">';
  [0,50,100].forEach(function(v){ h += '<line class="ax" x1="' + L + '" x2="' + (W-R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (L-6) + '" y="' + (y(v)+4) + '" text-anchor="end">' + v + '%</text>'; });
  w.forEach(function(r, i){ h += '<text x="' + (L + i*step).toFixed(1) + '" y="' + (H-7) + '" text-anchor="middle">' + r[0] + '</text>'; });
  [1,2,3].forEach(function(k){
    var d = "", pen = "M";
    w.forEach(function(r, i){ if(r[k] < 0){ pen = "M"; return; } d += pen + (L + i*step).toFixed(1) + " " + y(r[k]).toFixed(1) + " "; pen = "L"; });
    h += '<path class="s' + (k-1) + '" d="' + d + '"/>';
    w.forEach(function(r, i){ if(r[k] >= 0) h += '<circle class="s' + (k-1) + '" cx="' + (L + i*step).toFixed(1) + '" cy="' + y(r[k]).toFixed(1) + '" r="3.5"><title>' + r[0] + ': ' + r[k] + '%</title></circle>'; });
  });
  return h + '</svg><div class="nlleg"><span><i class="s0"></i>Đọc (đề thi)</span><span><i class="s1"></i>Nghe</span><span><i class="s2"></i>Từ vựng</span></div>';
}
/* Thân bản đánh giá. o: xem nlBuild trong khối quản lý. full = bản của cô (thêm ước lượng điểm). */
function nlReportHTML(o, full){
  nlCss();
  var s = o.s || {}, h = '', you = full ? 'Học sinh' : 'Em';
  var tile = function(k, label){
    var a = s[k], p = nlPct(a);
    if(p == null) return '<div><b>–</b><span>' + label + ': chưa có bài</span></div>';
    var d = a[2] == null ? '' : a[2] > 0 ? ' · tăng ' + a[2] + '%' : a[2] < 0 ? ' · giảm ' + (-a[2]) + '%' : ' · giữ nguyên';
    return '<div><b class="' + nlCls(p) + '">' + p + '%</b><span>' + label + ' đúng ' + a[0] + '/' + a[1] + d + '</span></div>';
  };
  var act = 0; String(o.a || "").split("").forEach(function(c){ if(c !== "0") act++; });
  h += '<div class="kq-sum">' + tile("r", "Đọc (đề thi)") + tile("l", "Nghe") + tile("v", "Từ vựng") +
    '<div><b>' + act + '/28</b><span>ngày có làm bài (4 tuần qua)</span></div></div>';
  if(s.r || s.l || s.v) h += '<p class="hint" style="margin-top:-6px">' + (o.d ? 'Tính trong ' + o.d + ' ngày gần nhất' : 'Tính trên toàn bộ bài đã làm') + (o.d ? '; “tăng/giảm” so với ' + o.d + ' ngày trước đó' : '') + '. Xanh ≥ 80%, vàng 60–79%, đỏ dưới 60%.</p>';
  if(!full && (o.c || o.m)){
    if(o.c) h += '<div class="nlsec"><h3>Nhận xét của cô</h3><div class="note">' + esc(o.c) + '</div></div>';
    if(o.m) h += '<div class="nlsec"><h3>Việc em cần làm tiếp</h3><div class="note">' + esc(o.m) + '</div></div>';
  }
  if((o.w || []).filter(function(r){ return r[1] >= 0 || r[2] >= 0 || r[3] >= 0; }).length >= 2)
    h += '<div class="nlsec"><h3>Tiến bộ theo tuần</h3>' + nlChart(o.w) + '</div>';
  if((o.rt || []).length){
    h += '<div class="nlsec"><h3>Đọc · theo dạng câu TOPIK II</h3>';
    if(full && o.es) h += '<p class="hint">Ước lượng phần Đọc: <strong>≈ ' + o.es[0] + '/100 điểm</strong> (tính theo tỉ lệ đúng của các dạng đã luyện, chiếm ' + o.es[1] + '/50 câu của đề thật; chỉ để tham khảo).</p>';
    h += o.rt.map(function(t){ var R = NL_RT[t[0]]; return nlBar(R[2], [t[1], t[2]], 'Câu ' + R[0] + (R[1] > R[0] ? '–' + R[1] : '')); }).join("");
    var weak = o.rt.filter(function(t){ return t[2] >= 3 && t[1]/t[2] < 0.6; });
    if(weak.length) h += '<p class="hint">' + you + ' cần ôn trước: ' + weak.map(function(t){ return '<strong>' + NL_RT[t[0]][2] + '</strong>'; }).join(", ") + '.</p>';
    h += '</div>';
  }
  if((o.lp || []).some(function(a){ return a[1]; }) || (o.lt || []).length){
    h += '<div class="nlsec"><h3>Nghe</h3>' + (o.lp || []).map(function(a, i){ return a[1] ? nlBar(NL_LP[i], a) : ''; }).join("");
    if((o.lt || []).length) h += '<p class="hint" style="margin:10px 0 0">Theo bài nghe</p>' + o.lt.map(function(t){ return nlBar(esc(t[0]), [t[1], t[2]]); }).join("");
    h += '</div>';
  }
  if((o.vt || []).length || o.vn){
    h += '<div class="nlsec"><h3>Từ vựng</h3>' + (o.vn ? '<p class="hint" style="margin:0 0 4px">Đã luyện <strong>' + o.vn + ' từ</strong>' + ((o.vw || []).length ? ', còn <strong>' + (o.vc || o.vw.length) + ' từ</strong> lần gần nhất vẫn sai' : ', không còn từ nào sai') + '.</p>' : '') +
      (o.vt || []).map(function(t){ return nlBar(esc(NL_VT[t[0]] || t[0]), [t[1], t[2]]); }).join("");
    if((o.vw || []).length) h += '<p class="hint" style="margin:10px 0 2px">Từ ' + (full ? 'còn sai' : 'em cần ôn lại') + (o.vc > o.vw.length ? ' (' + o.vw.length + ' từ sai nhiều nhất)' : '') + '</p><div>' +
      o.vw.map(function(w){ return '<span class="nlw"><b>' + esc(w[0]) + '</b> ' + esc(w[1]) + (w[2] > 1 ? ' <span class="pill bad">×' + w[2] + '</span>' : '') + '</span>'; }).join("") + '</div>';
    h += '</div>';
  }
  h += '<div class="nlsec"><h3>Chuyên cần</h3><div class="nldays" aria-label="28 ngày gần nhất">' + String(o.a || "").split("").map(function(c, i){
      var t = new Date((o.g || Date.now()) - (27 - i)*864e5), lab = pad(t.getDate()) + '/' + pad(t.getMonth()+1);
      return '<span class="' + (c === "0" ? '' : +c >= 2 ? 'l2' : 'l1') + '" title="' + lab + ': ' + c + ' bài"></span>';
    }).join("") + '</div><p class="hint" style="margin:0">Mỗi ô là một ngày trong 4 tuần qua (ô cuối là hôm nay), ô xanh là ngày có nộp bài.</p>' +
    (o.cl || []).map(function(c){ return '<p style="margin:6px 0 0;font-size:14.5px">Bài hằng ngày lớp <strong>' + esc(c[0]) + '</strong>: nộp ' + c[1] + '/' + c[2] + ' bài' + (c[3] ? ', ' + c[3] + ' bài trễ hạn' : '') + '.</p>'; }).join("") + '</div>';
  return h;
}
function reportBoot(){
  var m = String(location.hash || "").match(/[#&]r=([A-Za-z0-9_.-]+)/);
  if(!m) return false;
  var o = vUnpack(m[1]);
  stopClock(); nlCss();
  app.innerHTML = '<div class="wrap">' + headerHTML() + '<main class="paper"><div class="title"><h1>학습 평가</h1><p>Đánh giá học tập · Hàn Ngữ Nari</p></div>' +
    (o && o.n ? '<h2 style="margin:0;font-size:20px">' + esc(o.n) + '</h2><p class="hint" style="margin-bottom:12px">Cô đánh giá ngày ' + fmtDate(o.g) + '</p>' + nlReportHTML(o, false) :
      '<p class="err">Link đánh giá bị thiếu hoặc bị cắt. Em sao chép lại đủ cả link cô gửi rồi mở lại nhé.</p>') + '</main></div>';
  return true;
}
/* ==ADMIN== (phần dưới chèn vào trong khối Admin, chỉ có ở trang quản lý) */
  /* =================== ĐÁNH GIÁ NĂNG LỰC =================== */
  /* Ghép bài của một học sinh: theo học viên (tên trong sổ, hoặc tên đầy đủ kết thúc bằng tên học viên, khi chỉ khớp đúng một em),
     không khớp thì theo tên nhập. */
  function nlPeople(){
    var studs = S.students.slice(), byKey = {}, P = {};
    studs.forEach(function(st){ byKey[stKey(st)] = st; });
    var findSt = function(k){
      if(byKey[k]) return byKey[k];
      var hit = studs.filter(function(st){ var sk = stKey(st); return sk && (k.slice(-sk.length-1) === " " + sk || sk.slice(-k.length-1) === " " + k); });
      return hit.length === 1 ? hit[0] : null;
    };
    var get = function(st, k){ var id = st ? "s:" + st.id : "k:" + k; return P[id] || (P[id] = {id:id, st:st, keys:[], raw:[], names:[], e:[], v:[], n:[], last:0}); };
    var add = function(kind, r){
      if(!r.nameKey) return;
      var p = get(findSt(r.nameKey), r.nameKey);
      if(p.keys.indexOf(r.nameKey) < 0) p.keys.push(r.nameKey);
      var rk = r.rawKey || r.nameKey; if(p.raw.indexOf(rk) < 0) p.raw.push(rk); /* tên em gõ, trước khi canonNames gom */
      p.names.push(r.name); p[kind].push(r); if(r.submittedAt > p.last) p.last = r.submittedAt;
    };
    S.results.forEach(function(r){ add("e", r); }); S.vresults.forEach(function(r){ add("v", r); }); S.nresults.forEach(function(r){ add("n", r); });
    studs.forEach(function(st){ if(st.active !== false){ var p = get(st); if(p.keys.indexOf(stKey(st)) < 0) p.keys.push(stKey(st)); } });
    return Object.keys(P).map(function(id){ var p = P[id]; p.name = p.st ? p.st.name : bestName(p.names); return p; })
      .sort(function(a,b){ return (b.last - a.last) || a.name.localeCompare(b.name); });
  }
  function nlBuild(p, days){
    var now = Date.now(), t0 = days ? dayStart(now) - (days-1)*864e5 : 0, t1 = days ? t0 - days*864e5 : 0;
    var cur = function(r){ return r.submittedAt >= t0; }, prev = function(r){ return days && r.submittedAt >= t1 && r.submittedAt < t0; };
    var tally = function(list, f){ var c = [0,0], q = [0,0]; list.forEach(function(r){ var x = f(r); if(cur(r)){ c[0] += x[0]; c[1] += x[1]; } else if(prev(r)){ q[0] += x[0]; q[1] += x[1]; } });
      if(!c[1]) return null; c.push(q[1] ? nlPct(c) - nlPct(q) : null); return c; };
    var eSc = function(r){ return [r.score, r.total - (r.nokey || []).length]; }, sc = function(r){ return [r.score, r.total]; };
    /* Đề trong ngân hàng có nghe:1 (đề nghe) tính vào Nghe; nghe:2 (kịch bản nghe, luyện đọc) tính vào Đọc nhưng không vào dạng câu Đọc */
    var exNghe = function(r){ var ex = S.exams.find(function(e){ return e.id === r.examId; }); return (ex && ex.nghe) || 0; };
    var pe = p.e.filter(function(r){ return exNghe(r) !== 1; }), pn = p.e.filter(function(r){ return exNghe(r) === 1; });
    var pl = p.n.concat(pn), lSc = function(r){ return pn.indexOf(r) >= 0 ? eSc(r) : sc(r); };
    var o = {n:p.name, g:now, d:days, s:{}};
    ["r","l","v"].forEach(function(k, i){ var x = tally([pe, pl, p.v][i], [eSc, lSc, sc][i]); if(x) o.s[k] = x; });
    /* Đọc theo dạng câu (đề trộn quy về câu gốc nếu đã tải câu hỏi) */
    var rt = NL_RT.map(function(){ return [0,0]; });
    p.e.filter(cur).forEach(function(r){
      var ex = S.exams.find(function(e){ return e.id === r.examId; }), qm = ex && ex.mix ? S.qcache[r.examId] : null;
      if((ex && ex.mix && !qm) || exNghe(r)) return;
      for(var n = r.from; n <= r.to; n++){
        if((r.nokey || []).indexOf(n) >= 0) continue;
        var sn = qm ? (qm[n] && qm[n].src ? qm[n].src.n : 0) : n, t = nlType(sn);
        if(t < 0) continue;
        rt[t][1]++; if((r.wrong || []).indexOf(n) < 0) rt[t][0]++;
      }
    });
    o.rt = []; rt.forEach(function(a, i){ if(a[1]) o.rt.push([i, a[0], a[1]]); });
    var cov = 0, acc = 0; o.rt.forEach(function(t){ if(t[2] >= 2){ var q = NL_RT[t[0]][1] - NL_RT[t[0]][0] + 1; cov += q; acc += q * t[1] / t[2]; } });
    if(cov >= 8) o.es = [Math.round(acc / cov * 100), cov];
    /* Nghe */
    o.lp = [[0,0],[0,0],[0,0]]; var lt = {}, lord = [];
    p.n.filter(cur).forEach(function(r){
      (r.parts || []).forEach(function(a, i){ if(o.lp[i]){ o.lp[i][0] += a[0]; o.lp[i][1] += a[1]; } });
      var L = S.nlessons.find(function(x){ return x.id === r.lesson; }), lab = (L && L.title) || String(r.title || r.lesson || "").replace(/ · \d\d\/\d\d$/, "");
      if(!lt[lab]){ lt[lab] = [lab, 0, 0]; lord.push(lab); } lt[lab][1] += r.score; lt[lab][2] += r.total;
    });
    o.lt = lord.sort().map(function(k){ return lt[k]; });
    /* Từ vựng */
    var vt = {}, words = {};
    p.v.filter(cur).forEach(function(r){
      var k = r.type || "match"; vt[k] = vt[k] || [k, 0, 0]; vt[k][1] += r.score; vt[k][2] += r.total;
      (vItems(r) || []).forEach(function(it){ words[it.w || it.ko] = 1; });
    });
    o.vt = Object.keys(vt).map(function(k){ return vt[k]; });
    o.vn = Object.keys(words).length;
    var sw = []; p.keys.forEach(function(k){ sw = sw.concat(vStillWrong(k)); });
    sw.sort(function(a,b){ return b.n - a.n; }); o.vc = sw.length;
    o.vw = sw.slice(0, 15).map(function(w){ return [w.ko, w.vi, w.n]; });
    /* Chuyên cần: số bài mỗi ngày, 28 ngày (tối đa 9) */
    var today = dayStart(now), cnt = {};
    p.e.concat(p.v, p.n).forEach(function(r){ var d = Math.round((today - dayStart(r.submittedAt)) / 864e5); if(d >= 0 && d < 28) cnt[d] = (cnt[d] || 0) + 1; });
    o.a = ""; for(var d = 27; d >= 0; d--) o.a += Math.min(9, cnt[d] || 0);
    o.cl = [];
    if(p.st) S.classes.forEach(function(c){
      if((c.members || []).indexOf(p.st.id) < 0) return;
      var x = stuSummary(c, clsData(c), p.st); o.cl.push([c.name, x.done, x.given, x.late]);
    });
    /* Theo tuần (thứ Hai đầu tuần), 8 tuần */
    var wd = new Date(today).getDay(), mon = today - ((wd + 6) % 7) * 864e5;
    o.w = [];
    for(var i = 7; i >= 0; i--){
      var a = mon - i*7*864e5, b = a + 7*864e5, row = [fmtDay(a)];
      [[pe, eSc], [pl, lSc], [p.v, sc]].forEach(function(z){ var c = [0,0]; z[0].forEach(function(r){ if(r.submittedAt >= a && r.submittedAt < b){ var x = z[1](r); c[0] += x[0]; c[1] += x[1]; } }); row.push(c[1] ? nlPct(c) : -1); });
      o.w.push(row);
    }
    while(o.w.length > 2 && o.w[0][1] < 0 && o.w[0][2] < 0 && o.w[0][3] < 0) o.w.shift();
    return o;
  }
  /* Gợi ý "việc cần làm tiếp" từ số liệu; cô sửa lại trước khi gửi. */
  function nlSuggest(o){
    var L = [];
    (o.rt || []).filter(function(t){ return t[2] >= 3 && t[1]/t[2] < 0.7; }).sort(function(a,b){ return a[1]/a[2] - b[1]/b[2]; }).slice(0, 2).forEach(function(t){
      var R = NL_RT[t[0]]; L.push("Ôn dạng câu " + R[0] + (R[1] > R[0] ? "–" + R[1] : "") + " (" + R[2] + "): mới đúng " + nlPct([t[1], t[2]]) + "%.");
    });
    (o.lp || []).forEach(function(a, i){ if(a[1] >= 3 && a[0]/a[1] < 0.7) L.push("Nghe – " + NL_LP[i].replace(/^Phần \d · /, "").toLowerCase() + ": mới đúng " + nlPct(a) + "%, nghe lại bài và đọc theo lời thoại."); });
    if(o.vc) L.push("Ôn lại " + o.vc + " từ còn sai (danh sách trong bài đánh giá).");
    var act14 = 0; String(o.a || "").slice(-14).split("").forEach(function(c){ if(c !== "0") act14++; });
    if(act14 < 8) L.push("Làm bài đều hơn: 2 tuần qua mới có " + act14 + "/14 ngày làm bài.");
    if(!L.length) L.push("Giữ nhịp học như hiện tại, chuyển sang luyện dạng câu khó hơn.");
    return L.map(function(x){ return "• " + x; }).join("\n");
  }
  function nlMini(o){
    return '<div class="nlmini">' + [["r","Đọc"],["l","Nghe"],["v","Từ vựng"]].map(function(k){
      var a = o.s[k[0]], p = nlPct(a);
      return '<span>' + k[1] + '</span><div class="nlbar"><i class="' + nlCls(p) + '" style="width:' + (p || 0) + '%"></i></div><span>' + (p == null ? '–' : p + '%') + '</span>';
    }).join("") + '</div>';
  }
  function renderDanhGia(body){
    nlCss();
    var f = S.nlf || (S.nlf = {d:30, q:""}), ps = nlPeople();
    if(S.nlId){ var cur = ps.find(function(p){ return p.id === S.nlId; }); if(cur) return nlDetail(body, cur); S.nlId = null; }
    var sel = '<select class="t" id="nlD">' + [[14,"14 ngày"],[30,"30 ngày"],[90,"90 ngày"],[0,"Toàn bộ"]].map(function(x){ return '<option value="' + x[0] + '"' + (f.d === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join("") + '</select>';
    var h = '<div class="card"><h2>Đánh giá năng lực</h2><p class="hint">Gom cả đề thi, từ vựng và luyện nghe của từng học sinh (mọi bài đã chấm, giao ở đâu cũng được). Bấm vào một em để xem chi tiết, viết nhận xét và gửi bảng đánh giá cho em.</p>' +
      '<div class="grid2"><div><label class="l" for="nlQ">Tìm học sinh</label><input class="t" id="nlQ" value="' + esc(f.q) + '" placeholder="Gõ tên, không cần dấu"></div><div><label class="l" for="nlD">Tính trong</label>' + sel + '</div></div></div>';
    var list = ps.filter(function(p){ return !f.q || p.keys.concat([normName(p.name)]).some(function(k){ return k.indexOf(normName(f.q)) >= 0; }); });
    var loose = list.filter(function(p){ return !p.st; });
    h += '<div class="nlcards">' + list.map(function(p){
      var o = nlBuild(p, f.d), n = p.e.length + p.v.length + p.n.length;
      return '<div class="card" tabindex="0" data-nl="' + esc(p.id) + '"><h3 style="margin:0;font-size:16px">' + esc(p.name) + (p.st ? '' : ' <span class="pill warn">chưa ghép học viên</span>') + '</h3>' +
        '<div class="muted" style="font-size:13px">' + n + ' bài đã chấm' + (p.last ? ' · gần nhất ' + fmtDay(p.last) : '') + '</div>' + nlMini(o) + '</div>';
    }).join("") + '</div>';
    if(!list.length) h += '<div class="card"><p class="hint">Chưa có học sinh nào' + (f.q ? ' khớp tên này' : '') + '.</p></div>';
    if(loose.length) h += '<p class="hint" style="margin-top:12px">“Chưa ghép học viên”: tên em nhập khi làm bài không khớp học viên nào. Cô vào tab Học viên & lịch, điền “Tên trong sổ điểm” cho đúng em đó để gom bài về một chỗ (cả bảng theo dõi của Lớp học cũng dùng tên này).</p>';
    body.innerHTML = h;
    var q = $("#nlQ");
    q.oninput = function(){ f.q = q.value; var pos = q.selectionStart; renderTab(); var nq = $("#nlQ"); nq.focus(); try{ nq.setSelectionRange(pos, pos); }catch(e){} };
    $("#nlD").onchange = function(){ f.d = +this.value; renderTab(); };
    $$("[data-nl]", body).forEach(function(c){ var go = function(){ S.nlId = c.dataset.nl; renderTab(); window.scrollTo(0, 0); }; c.onclick = go; c.onkeydown = function(e){ if(e.key === "Enter") go(); }; });
  }
  function nlDetail(body, p){
    var f = S.nlf, main = p.keys.slice().sort(function(a,b){
      var c = function(k){ return p.e.concat(p.v, p.n).filter(function(r){ return r.nameKey === k; }).length; }; return c(b) - c(a); })[0] || normName(p.name);
    var mixIds = []; p.e.forEach(function(r){ var ex = S.exams.find(function(e){ return e.id === r.examId; }); if(ex && ex.mix && !S.qcache[ex.id] && mixIds.indexOf(ex.id) < 0) mixIds.push(ex.id); });
    if(mixIds.length){ body.innerHTML = '<p class="hint">Đang tải đề trộn…</p>'; Promise.all(mixIds.map(function(id){ return loadQs(id); })).then(function(){ renderTab(); }, function(){ S.qcache[mixIds[0]] = {}; renderTab(); }); return; }
    var o = nlBuild(p, f.d);
    var hist = p.e.map(function(r){ return [r.submittedAt, "Đề thi", r.examTitle + " · câu " + r.from + "–" + r.to, r.score, r.total - (r.nokey || []).length]; })
      .concat(p.n.map(function(r){ return [r.submittedAt, "Nghe", r.title, r.score, r.total]; }), p.v.map(function(r){ return [r.submittedAt, "Từ vựng", r.title + (NL_VT[r.type] ? " · " + NL_VT[r.type] : ""), r.score, r.total]; }))
      .sort(function(a,b){ return b[0] - a[0]; });
    var sel = [[14,"14 ngày"],[30,"30 ngày"],[90,"90 ngày"],[0,"Toàn bộ"]].map(function(x){ return '<option value="' + x[0] + '"' + (f.d === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join("");
    var h = '<div class="row" style="margin:0 0 12px"><button class="btn ghost sm" id="nlBack">← Danh sách</button><span style="flex:1"></span><label class="hint" for="nlD2" style="margin:0">Tính trong</label><select class="t" id="nlD2" style="width:auto">' + sel + '</select></div>' +
      '<div class="card"><h2>' + esc(p.name) + '</h2><p class="hint">' + (p.st ? '' : 'Chưa ghép học viên · ') + 'Tên đã nhập khi làm bài: ' + esc((p.raw.length ? p.raw : p.keys).join(", ")) + '</p>' + nlReportHTML(o, true) + '</div>' +
      '<div class="card"><h2>Nhận xét và việc cần làm</h2><p class="hint">Học sinh thấy 2 mục này ở đầu bảng đánh giá. Nhận xét dùng chung với “Hồ sơ” trong Sổ điểm.</p>' +
      '<label class="l" for="nlC">Nhận xét của cô</label><textarea class="t" id="nlC" rows="4" placeholder="VD: Em tiến bộ rõ ở phần nghe. Phần đọc còn chậm ở dạng sắp xếp câu."></textarea>' +
      '<label class="l" for="nlX">Việc em cần làm tiếp</label><textarea class="t" id="nlX" rows="4"></textarea>' +
      '<div class="row"><button class="btn ghost sm" id="nlSug">Gợi ý từ số liệu</button><button class="btn ghost sm" id="nlSave">Lưu</button><span class="okmsg" id="nlOk" hidden></span></div>' +
      '<div class="row" style="border-top:1px solid var(--line);padding-top:12px"><button class="btn" id="nlSend">Tạo link đánh giá gửi em</button><button class="btn ghost" id="nlPrev">Xem trước bản của em</button></div></div>' +
      '<div class="card"><h2>Tất cả bài đã chấm (' + hist.length + ')</h2><div class="scroll"><table class="tbl"><thead><tr><th>Ngày</th><th>Phần</th><th>Bài</th><th>Điểm</th></tr></thead><tbody>' +
      hist.slice(0, 60).map(function(x){ var pc = nlPct([x[3], x[4]]); return '<tr><td>' + fmtDay(x[0]) + '</td><td>' + x[1] + '</td><td>' + esc(x[2]) + '</td><td><span class="pill ' + nlCls(pc) + '">' + x[3] + '/' + x[4] + '</span></td></tr>'; }).join("") +
      '</tbody></table></div>' + (hist.length > 60 ? '<p class="hint">Hiện 60 bài gần nhất.</p>' : '') + '</div>';
    body.innerHTML = h;
    var ta = $("#nlC"), tx = $("#nlX"), saved = {c:"", x:"", note:null};
    var nid = noteId(main);
    Promise.all(p.keys.concat(p.raw.filter(function(k){ return p.keys.indexOf(k) < 0; })).map(function(k){ return db.doc("notes/" + noteId(k)).get().then(function(d){ return d.exists ? d.data() : null; }, function(){ return null; }); })
      .concat([db.doc("nlnotes/" + nid).get().then(function(d){ return d.exists ? d.data() : null; }, function(){ return null; })])).then(function(ns){
      var x = ns.pop(), best = null;
      ns.forEach(function(n){ if(n && (!best || (n.updated || 0) > (best.updated || 0))) best = n; });
      saved.note = best; saved.c = best ? best.text || "" : ""; saved.x = x ? x.next || "" : "";
      if(!ta.value) ta.value = saved.c; if(!tx.value) tx.value = saved.x;
    });
    var save = function(){
      var c = ta.value.trim(), x = tx.value.trim(), w = [];
      if(c !== saved.c) w.push(db.doc("notes/" + nid).set(Object.assign({}, saved.note || {}, {name:p.name, nameKey:main, text:c, updated:Date.now()})).then(function(){ saved.c = c; }));
      if(x !== saved.x) w.push(db.doc("nlnotes/" + nid).set({name:p.name, nameKey:main, next:x, updated:Date.now()}).then(function(){ saved.x = x; }));
      return Promise.all(w);
    };
    var pack = function(){ var q = Object.assign({}, o, {c:ta.value.trim(), m:tx.value.trim(), x:"Đánh giá của cô · " + fmtDay(o.g)}); delete q.es; return q; };
    $("#nlBack").onclick = function(){ S.nlId = null; renderTab(); };
    $("#nlD2").onchange = function(){ f.d = +this.value; renderTab(); };
    $("#nlSug").onclick = function(){ var s = nlSuggest(o); tx.value = tx.value.trim() ? tx.value.trim() + "\n" + s : s; tx.focus(); };
    $("#nlSave").onclick = function(){ var ok = $("#nlOk"); save().then(function(){ ok.textContent = "Đã lưu."; ok.hidden = false; }, function(e){ ok.textContent = "Chưa lưu được (" + (e && e.code) + ")."; ok.hidden = false; }); };
    $("#nlPrev").onclick = function(){
      var md = modal('<div class="title"><h1 style="font-size:24px">학습 평가</h1><p>Bản em nhìn thấy</p></div><h2 style="margin:0;font-size:20px">' + esc(p.name) + '</h2>' + nlReportHTML(pack(), false) + '<div class="row"><button class="btn ghost" data-close>Đóng</button></div>', true);
    };
    $("#nlSend").onclick = function(){
      save().then(null, function(){}).then(function(){
        var link = PAGE_URL + "#r=" + vPack(pack());
        var msg = "ĐÁNH GIÁ HỌC TẬP – HÀN NGỮ NARI\nHọc sinh: " + p.name + "\nCô đánh giá ngày " + fmtDay(o.g) + ": điểm từng phần đọc, nghe, từ vựng, dạng câu cần ôn, từ còn sai và nhận xét của cô.\nEm mở link: " + link;
        var md = modal('<h3>Bảng đánh giá cho ' + esc(p.name) + '</h3><p class="hint">Cô sao chép và gửi qua Zalo. Link chứa sẵn số liệu hôm nay; lần sau cô tạo link mới để cập nhật. Em mở trong app thì link được lưu ở “Bài của em”.</p>' + copyBox(msg, 6) + '<div class="row"><button class="btn ghost" data-close>Đóng</button></div>');
        wireCopy(md.el);
      });
    };
  }
