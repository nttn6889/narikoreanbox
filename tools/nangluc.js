/* ---------- Đánh giá năng lực (dùng chung cho trang quản lý và trang học sinh) ----------
   Nguồn: tools/nangluc.js, chèn vào trang bằng tools/nangluc.py — sửa ở file đó, không sửa trong trang.
   Gom 3 nguồn: đề thi (results), từ vựng (vresults), luyện nghe (nresults); bài viết (wresults) chỉ hiện trong danh sách bài đã làm. Số liệu tính lại từ bài đã chấm,
   chỉ lưu nhận xét (notes/<id>.text, dùng chung với Sổ điểm) và việc cần làm (nlnotes/<id>.next). Bản gửi học sinh nằm trọn trong link thi-thu/#r=<base64>.<sum>. */
var NL_RT = [[1,2,"Ngữ pháp – điền chỗ trống"],[3,4,"Ngữ pháp – nghĩa tương đương"],[5,8,"Chủ đề của văn bản ngắn"],
  [9,12,"Đối chiếu nội dung"],[13,15,"Sắp xếp câu"],[16,18,"Điền vào chỗ trống"],[19,24,"Đoạn văn 2 câu hỏi"],
  [25,27,"Tiêu đề báo"],[28,31,"Điền chỗ trống (đoạn dài)"],[32,34,"Nội dung giống với bài"],[35,38,"Ý chính của bài"],
  [39,41,"Vị trí của câu"],[42,43,"Văn học"],[44,50,"Văn bản dài"]];
var NL_LP = ["Phần 1 · Hiểu nội dung", "Phần 2 · Chọn câu nói tiếp theo", "Phần 3 · Nghe điền từ"];
var NL_VT = {match:"Nối từ", kv:"Hàn → Việt", vk:"Việt → Hàn", nk:"Nghe → nghĩa", type:"Gõ từ tiếng Hàn", cau:"Điền từ vào câu", nt:"Nghe → gõ từ", nc:"Nghe câu → điền từ"};
function nlVtName(y){ return String(y || "").split("+").map(function(t){ return NL_VT[t] || t; }).join(" → "); }
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
    ".nldays span.cf{background:var(--ok);border-color:var(--ok)}.nldays span.cp{background:var(--warn-soft);border-color:var(--warn)}.nldays span.cx{background:var(--pen-soft);border-color:var(--pen)}.nldays span.ct{border:1.5px dashed var(--violet)}.nldays span.cs{background:var(--ok-soft);border-color:var(--ok)}" +
    ".nlccl{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12.5px;color:var(--muted);margin:2px 0 0}" +
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
  var cc = o.cc && o.cc[1] ? nlPct([o.cc[0], o.cc[1]]) : null;
  h += '<div class="kq-sum">' + tile("r", "Đọc (đề thi)") + tile("l", "Nghe") + tile("v", "Từ vựng") +
    (cc != null ? '<div><b class="' + nlCls(cc) + '">' + cc + '%</b><span>Chuyên cần: nộp ' + o.cc[0] + '/' + o.cc[1] + ' bài cô giao</span></div>' : '<div><b>' + act + '/28</b><span>ngày có làm bài (4 tuần qua)</span></div>') + '</div>';
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
  h += '<div class="nlsec"><h3>Chuyên cần</h3>' + nlDaysHTML(o, 28);
  if(o.b) h += '<p style="margin:6px 0 0;font-size:14.5px">' + (o.cc[1] ? 'Đã nộp <strong>' + o.cc[0] + '/' + o.cc[1] + '</strong> bài cô giao (' + cc + '%)' + (o.cc[2] ? ', ' + o.cc[2] + ' bài nộp sau hạn' : '') + '.' : 'Chưa có bài nào cô giao đã tới hạn.') + '</p>' +
    ((o.ow || []).length ? '<p class="hint" style="margin:8px 0 2px">' + (full ? 'Bài chưa nộp' : 'Bài em chưa nộp') + '</p><ul style="margin:0;padding-left:20px;font-size:14.5px">' + o.ow.map(function(x){ return '<li>' + (x[0] ? esc(x[0]) + ' · ' : '') + esc(x[1]) + '</li>'; }).join("") + '</ul>' : '');
  else h += (o.cl || []).map(function(c){ return '<p style="margin:6px 0 0;font-size:14.5px">Bài hằng ngày lớp <strong>' + esc(c[0]) + '</strong>: nộp ' + c[1] + '/' + c[2] + ' bài' + (c[3] ? ', ' + c[3] + ' bài trễ hạn' : '') + '.</p>'; }).join("");
  h += '</div>';
  return h;
}
/* Ô chuyên cần n ngày gần nhất. Bản mới (o.b): theo bài cô giao; link cũ (chỉ có o.a): ngày có nộp bài. */
var NL_CC = {f:["cf","nộp đủ bài"], p:["cp","nộp thiếu"], x:["cx","bỏ bài"], t:["ct","hôm nay, chưa tới hạn"], s:["cs","không có bài giao, em tự làm"], ".":["","không có bài"]};
function nlDaysHTML(o, n){
  var g = o.g || Date.now(), lab = function(i){ var t = new Date(g - (n - 1 - i)*864e5); return pad(t.getDate()) + '/' + pad(t.getMonth()+1); };
  if(o.b){
    var b = String(o.b).slice(-n), used = {};
    return '<div class="nldays" aria-label="' + n + ' ngày gần nhất">' + b.split("").map(function(c, i){ var k = NL_CC[c] || NL_CC["."]; used[c] = 1; return '<span class="' + k[0] + '" title="' + lab(i) + ': ' + k[1] + '"></span>'; }).join("") + '</div>' +
      (n > 14 ? '<div class="nlccl">' + ["f","p","x","t","s"].filter(function(c){ return used[c]; }).map(function(c){ return '<span><i style="display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:4px;vertical-align:-1px;border:1px solid var(--line);' + (c === "f" ? 'background:var(--ok);border-color:var(--ok)' : c === "p" ? 'background:var(--warn-soft);border-color:var(--warn)' : c === "x" ? 'background:var(--pen-soft);border-color:var(--pen)' : c === "t" ? 'border:1.5px dashed var(--violet)' : 'background:var(--ok-soft);border-color:var(--ok)') + '"></i>' + NL_CC[c][1] + '</span>'; }).join("") + '<span>ô cuối là hôm nay</span></div>' : '');
  }
  var a = String(o.a || "").slice(-n);
  return '<div class="nldays" aria-label="' + n + ' ngày gần nhất">' + a.split("").map(function(c, i){ return '<span class="' + (c === "0" ? '' : +c >= 2 ? 'l2' : 'l1') + '" title="' + lab(i) + ': ' + c + ' bài"></span>'; }).join("") + '</div>' +
    (n > 14 ? '<p class="hint" style="margin:0">Mỗi ô là một ngày trong 4 tuần qua (ô cuối là hôm nay), ô xanh là ngày có nộp bài.</p>' : '');
}
function reportBoot(){
  var m = String(location.hash || "").match(/[#&]r=([A-Za-z0-9_.-]+)/);
  if(!m) return false;
  var o = vUnpack(m[1]);
  stopClock(); nlCss();
  app.innerHTML = '<div class="wrap">' + headerHTML() + '<main class="paper"><div class="title"><h1>학습 평가</h1><p>Đánh giá học tập · Nari TOPIK</p></div>' +
    (o && o.n ? '<h2 style="margin:0;font-size:20px">' + esc(o.n) + '</h2><p class="hint" style="margin-bottom:12px">Cô đánh giá ngày ' + fmtDate(o.g) + '</p>' + nlReportHTML(o, false) :
      '<p class="err">Link đánh giá bị thiếu hoặc bị cắt. Em sao chép lại đủ cả link cô gửi rồi mở lại nhé.</p>') + '</main></div>';
  return true;
}
/* ==ADMIN== (phần dưới chèn vào trong khối Admin, chỉ có ở trang quản lý) */
  /* =================== ĐÁNH GIÁ NĂNG LỰC (số liệu cho hồ sơ học sinh) =================== */
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
    var get = function(st, k){ var id = st ? "s:" + st.id : "k:" + k; return P[id] || (P[id] = {id:id, st:st, keys:[], raw:[], names:[], e:[], v:[], n:[], w:[], last:0}); };
    var add = function(kind, r){
      if(!r.nameKey) return;
      var p = get(findSt(r.nameKey), r.nameKey);
      if(p.keys.indexOf(r.nameKey) < 0) p.keys.push(r.nameKey);
      var rk = r.rawKey || r.nameKey; if(p.raw.indexOf(rk) < 0) p.raw.push(rk); /* tên em gõ, trước khi canonNames gom */
      p.names.push(r.name); p[kind].push(r); if(r.submittedAt > p.last) p.last = r.submittedAt;
    };
    S.results.forEach(function(r){ add("e", r); }); S.vresults.forEach(function(r){ add("v", r); }); S.nresults.forEach(function(r){ add("n", r); }); (S.wresults || []).forEach(function(r){ add("w", r); });
    studs.forEach(function(st){ var p = get(st); if(p.keys.indexOf(stKey(st)) < 0) p.keys.push(stKey(st)); });
    return Object.keys(P).map(function(id){ var p = P[id]; p.name = p.st ? p.st.name : bestName(p.names); return p; })
      .sort(function(a,b){ return (b.last - a.last) || a.name.localeCompare(b.name); });
  }
  function nlBuild(p, days){
    var now = Date.now(), t0 = days ? dayStart(now) - (days-1)*864e5 : 0, t1 = days ? t0 - days*864e5 : 0;
    var cur = function(r){ return r.submittedAt >= t0; }, prev = function(r){ return days && r.submittedAt >= t1 && r.submittedAt < t0; };
    var tally = function(list, f){ var c = [0,0], q = [0,0]; list.forEach(function(r){ var x = f(r); if(cur(r)){ c[0] += x[0]; c[1] += x[1]; } else if(prev(r)){ q[0] += x[0]; q[1] += x[1]; } });
      if(!c[1]) return null; c.push(q[1] ? nlPct(c) - nlPct(q) : null); return c; };
    var eSc = function(r){ return [r.score, r.total - (r.nokey || []).length]; }, sc = function(r){ return [r.score, r.total]; };
    var o = {n:p.name, g:now, d:days, s:{}};
    ["r","l","v"].forEach(function(k, i){ var x = tally([p.e, p.n, p.v][i], i ? sc : eSc); if(x) o.s[k] = x; });
    /* Đọc theo dạng câu (đề trộn quy về câu gốc nếu đã tải câu hỏi) */
    var rt = NL_RT.map(function(){ return [0,0]; });
    p.e.filter(cur).forEach(function(r){
      var ex = S.exams.find(function(e){ return e.id === r.examId; }), qm = ex && ex.mix ? S.qcache[r.examId] : null;
      if(ex && ex.mix && !qm) return;
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
      /* bài nhiều dạng (type "nk+nt+nc") cộng điểm vào từng dạng */
      (r.steps || [{y:r.type || "match", s:r.score, n:r.total}]).forEach(function(x){ var k = x.y; vt[k] = vt[k] || [k, 0, 0]; vt[k][1] += x.s; vt[k][2] += x.n; });
      (vItems(r) || []).forEach(function(it){ words[it.w || it.ko] = 1; });
    });
    o.vt = Object.keys(vt).map(function(k){ return vt[k]; });
    o.vn = Object.keys(words).length;
    var sw = []; p.keys.forEach(function(k){ sw = sw.concat(vStillWrong(k)); });
    sw.sort(function(a,b){ return b.n - a.n; }); o.vc = sw.length;
    o.vw = sw.slice(0, 15).map(function(w){ return [w.ko, w.vi, w.n]; });
    /* Chuyên cần: số bài mỗi ngày, 28 ngày (tối đa 9) */
    var today = dayStart(now), cnt = {};
    p.e.concat(p.v, p.n, p.w).forEach(function(r){ var d = Math.round((today - dayStart(r.submittedAt)) / 864e5); if(d >= 0 && d < 28) cnt[d] = (cnt[d] || 0) + 1; });
    o.a = ""; for(var d = 27; d >= 0; d--) o.a += Math.min(9, cnt[d] || 0);
    /* Chuyên cần theo bài cô giao (cùng cách tính với Lớp học): cc = [đã nộp, đã giao, nộp muộn], b = trạng thái 28 ngày, ow = bài còn nợ */
    if(p.st){
      var cc = ccStu(p.st);
      o.cc = [cc.done, cc.given, cc.late];
      o.b = ccStrip(cc, p.e.concat(p.v, p.n, p.w).map(function(r){ return r.submittedAt; }));
      o.ow = cc.owe.slice(0, 10).map(function(t){ return [shortD(t.day), t.t]; });
      if(cc.owe.length > 10) o.ow.push(["", "… và " + (cc.owe.length - 10) + " bài cũ hơn"]);
    }
    /* Theo tuần (thứ Hai đầu tuần), 8 tuần */
    var wd = new Date(today).getDay(), mon = today - ((wd + 6) % 7) * 864e5;
    o.w = [];
    for(var i = 7; i >= 0; i--){
      var a = mon - i*7*864e5, b = a + 7*864e5, row = [fmtDay(a)];
      [[p.e, eSc], [p.n, sc], [p.v, sc]].forEach(function(z){ var c = [0,0]; z[0].forEach(function(r){ if(r.submittedAt >= a && r.submittedAt < b){ var x = z[1](r); c[0] += x[0]; c[1] += x[1]; } }); row.push(c[1] ? nlPct(c) : -1); });
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
    if(o.cc && o.cc[1] && o.cc[0] / o.cc[1] < 0.8) L.push("Nộp đủ bài cô giao: mới nộp " + o.cc[0] + "/" + o.cc[1] + " bài (" + nlPct([o.cc[0], o.cc[1]]) + "%).");
    else if(!o.cc && act14 < 8) L.push("Làm bài đều hơn: 2 tuần qua mới có " + act14 + "/14 ngày làm bài.");
    if(!L.length) L.push("Giữ nhịp học như hiện tại, chuyển sang luyện dạng câu khó hơn.");
    return L.map(function(x){ return "• " + x; }).join("\n");
  }
  function nlMini(o){
    return '<div class="nlmini">' + [["r","Đọc"],["l","Nghe"],["v","Từ vựng"]].map(function(k){
      var a = o.s[k[0]], p = nlPct(a);
      return '<span>' + k[1] + '</span><div class="nlbar"><i class="' + nlCls(p) + '" style="width:' + (p || 0) + '%"></i></div><span>' + (p == null ? '–' : p + '%') + '</span>';
    }).join("") + '</div>';
  }
  /* =================== HỌC SINH: một nơi cho danh sách, lịch tuần, hồ sơ từng em, sổ điểm đề thi ===================
     Thay cho 3 tab cũ Học viên & lịch, Đánh giá, Sổ điểm. Hồ sơ (S.nlId) gồm thông tin, năng lực, bài đã làm, nhận xét & gửi kết quả. */
  var HS_PERIOD = [[14,"14 ngày"],[30,"30 ngày"],[90,"90 ngày"],[0,"Toàn bộ"]];
  function hsCss(){
    if(document.getElementById("hscss")) return;
    var st = document.createElement("style"); st.id = "hscss";
    st.textContent = ".hscard h3{margin:0;font-size:16.5px}.hscard .facts{font-size:13.5px;color:var(--muted);margin:2px 0 4px}.hscard .facts b{color:var(--ink)}" +
      ".hsflags{margin:4px 0 2px}.hsmeta{font-size:13px;color:var(--muted);margin-top:4px}.hscard .nldays{max-width:none;margin:8px 0 0}" +
      ".wk .nm[data-nl]{cursor:pointer}.wk .nm[data-nl]:hover{text-decoration:underline}.hsfacts{font-size:14.5px;color:var(--muted);margin:2px 0 6px}.hsfacts b{color:var(--ink)}" +
      ".lhwk div.pl{border:1.5px dashed var(--violet);background:var(--paper)}.lhwk .tp{display:block;font-size:11.5px;font-weight:700;color:var(--violet)}.lhwk .tp.miss{color:var(--warn)}" +
      ".hptl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}.hptl div{border:1px solid var(--line);border-radius:8px;padding:8px 12px;background:var(--bg)}.hptl span{display:block;font-size:12.5px;color:var(--muted)}.hptl b{font-size:18px;font-variant-numeric:tabular-nums}" +
      ".hpt td{vertical-align:middle}.hpt td.r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.hpt .act{display:flex;gap:6px;flex-wrap:wrap}.hpt .sm2{font-size:12.5px;color:var(--muted)}" +
      ".hpnm{all:unset;cursor:pointer;font-weight:700;color:var(--violet)}.hpnm:hover{text-decoration:underline}.hpnm:focus-visible{outline:2px solid var(--violet)}" +
      ".hpmode{display:flex;gap:8px;align-items:flex-start;margin:6px 0;cursor:pointer}.hpmode input{margin-top:5px}.hpmode small{display:block;color:var(--muted);font-size:13px}" +
      ".hpbox{border-left:4px solid var(--violet);background:var(--violet-soft);padding:8px 12px;border-radius:6px;font-size:14.5px;margin:10px 0}.hpbox p{margin:2px 0}" +
      "@media (max-width:640px){.hptl{gap:5px}.hptl div{padding:6px 8px}.hptl b{font-size:14.5px}.hpt.hpl th:nth-child(2),.hpt.hpl td:nth-child(2){display:none}.hpt td,.hpt th{padding:6px 4px}.hpt .act{flex-direction:column}}";
    document.head.appendChild(st);
  }
  function hsPeriod(id, f){ return '<select class="t" id="' + id + '"' + (id === "nlD2" ? ' style="width:auto"' : '') + '>' + HS_PERIOD.map(function(x){ return '<option value="' + x[0] + '"' + (f.d === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join("") + '</select>'; }
  function hsFacts(st){
    if(!st) return '';
    var dl = daysTo(st.examDate);
    return [st.goal ? 'Mục tiêu: <b>' + esc(st.goal) + '</b>' : '', st.exam ? esc(st.exam) : '', st.examDate ? 'Thi ' + fmtYMD(st.examDate) + (dl != null && dl >= 0 ? ' · <span class="dd">còn ' + dl + ' ngày</span>' : '') : '', st.perWeek ? st.perWeek + ' buổi/tuần' : ''].filter(Boolean).join(' · ');
  }
  function hsSlots(st){ return st && (st.slots || []).length ? '<div>' + st.slots.map(function(sl){ return '<span class="pill">' + esc(slotLabel(st, sl)) + '</span>'; }).join("") + '</div>' : ''; }
  /* Những điều cần để ý về một em (hiện ở thẻ trong danh sách và đầu hồ sơ). */
  function hsFlags(p, o){
    var st = p.st, F = [];
    if(!st) F.push('<span class="pill warn">chưa ghép học viên</span>');
    else if(st.active === false) F.push('<span class="pill warn">tạm nghỉ</span>');
    if(!st || st.active !== false){
      var idle = p.last ? Math.round((dayStart(Date.now()) - dayStart(p.last)) / 864e5) : null;
      if(idle == null) F.push('<span class="pill bad">chưa nộp bài nào</span>');
      else if(idle >= 3) F.push('<span class="pill bad">' + idle + ' ngày chưa làm bài</span>');
      if(o.cc && o.cc[1] > o.cc[0]) F.push('<span class="pill warn">còn nợ ' + (o.cc[1] - o.cc[0]) + ' bài</span>');
      var low = [["r","Đọc"],["l","Nghe"],["v","Từ vựng"]].filter(function(k){ var x = nlPct(o.s[k[0]]); return x != null && x < 60; });
      if(low.length) F.push('<span class="pill bad">dưới 60%: ' + low.map(function(k){ return k[1]; }).join(", ") + '</span>');
      var wn = p.w.filter(function(r){ return !r.graded; }).length;
      if(wn) F.push('<span class="pill warn">' + wn + ' bài viết chưa chấm</span>');
      var hb0 = st && hpSet(st) ? hpBill(st, hpYm(new Date())) : null;
      if(hb0 && hb0.total > hb0.paid && dayStart(Date.now()) > hb0.due.getTime()) F.push('<span class="pill bad">chưa đóng học phí T' + hpYmTxt(hb0.ym) + '</span>');
    }
    return F;
  }
  function renderHocSinh(body){
    nlCss(); hsCss();
    if(S.nlId){ var cur = nlPeople().find(function(p){ return p.id === S.nlId; }); if(cur) return nlDetail(body, cur); S.nlId = null; }
    var sub = S.hsub === "lich" || S.hsub === "hp" ? S.hsub : (S.hsub = "ds");
    body.innerHTML = '<div class="row" style="margin:0 0 14px">' + [["ds","Học sinh"],["lich","Lịch tuần"],["hp","Học phí"]].map(function(t){ return '<button class="btn' + (sub === t[0] ? '' : ' ghost') + '" data-hsub="' + t[0] + '">' + t[1] + '</button>'; }).join("") +
      '<span style="flex:1"></span><button class="btn ghost" id="stNew">+ Thêm học viên</button></div><div id="hsb"></div>';
    $$("[data-hsub]", body).forEach(function(b){ b.onclick = function(){ S.hsub = b.dataset.hsub; renderTab(); }; });
    $("#stNew").onclick = function(){ editStudent(null); };
    var hb = $("#hsb");
    if(sub === "lich") hsLich(hb); else if(sub === "hp") hpList(hb); else hsList(hb);
  }
  /* ===== Lịch học từng em (chuyển từ trang học viên cũ): buoi/<id> = {st, date, topic, links:[{label,url}]} ===== */
  function lhD(iso){ var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function lhIso(d){ return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function lhAdd(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function lhMon(d){ var x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function lhDm(d){ return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); }
  var LH_DN = ["CN","T2","T3","T4","T5","T6","T7"], LH_DL = ["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];
  function lhOf(st){
    var ls = (S.buoi || []).filter(function(b){ return b.st === st.id && lhD(b.date); }).sort(function(a, b){ return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.created || 0) - (b.created || 0); });
    ls.forEach(function(l, i){ l.no = i + 1; l.d = lhD(l.date); delete l.mk; });
    return ls;
  }
  function lhHTML(st){
    var ls = lhOf(st), need = lhNeed(st), now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var start = lhD(st.start) || (ls[0] && ls[0].d) || null, exam = lhD(st.examDate), thisMon = lhMon(today);
    /* tuần: thiếu buổi = nợ; buổi vượt ở tuần sau trả nợ cũ nhất trước (học bù), không còn nợ = học thêm */
    var WEEKS = [];
    if(start && need){
      var debts = [];
      for(var m = lhMon(start); m <= thisMon; m = lhAdd(m, 7)){
        var mEnd = lhAdd(m, 7), wls = ls.filter(function(l){ return l.d >= m && l.d < mEnd; });
        var wk = {mon:m, ls:wls, n:wls.length, miss:0, paid:[], mk:[], start:start > m, cur:m.getTime() === thisMon.getTime()};
        wls.slice(need).forEach(function(l){ var d = debts.find(function(x){ return x.left > 0; }); if(d){ d.left--; d.w.paid.push(l); l.mk = d.w; wk.mk.push(l); } });
        if(!wk.cur && !wk.start && wls.length < need){ wk.miss = need - wls.length; debts.push({w:wk, left:wk.miss}); }
        WEEKS.push(wk);
      }
    }
    var owed = WEEKS.reduce(function(a, w){ return a + w.miss - w.paid.length; }, 0);
    var cw = WEEKS.filter(function(w){ return w.cur; })[0] || {ls:ls.filter(function(l){ return l.d >= thisMon && l.d < lhAdd(thisMon, 7); }), mk:[]};
    var left = exam ? Math.round((exam - today) / 864e5) : null, fd = function(d){ return lhDm(d) + '/' + d.getFullYear(); };
    var chip = function(k, v){ return v ? '<span>' + k + ': <b>' + esc(v) + '</b></span>' : ''; };
    var h = '<div class="lhhero"><div class="lhh"><div><p class="lhey">Lộ trình học tập của</p><div class="lhname">' + esc(st.name) + '</div><div class="lhchips">' +
      chip("Ngày bắt đầu", start ? fd(start) : "") + chip("Mục tiêu", st.goal) + chip("Kỳ thi", st.exam) + chip("Ngày thi", exam ? fd(exam) : "") + chip("Lịch học", need ? need + " buổi/tuần" : "") + '</div>' +
      (!start || !exam ? '<p class="hint" style="margin:10px 0 0">Bấm “Sửa thông tin” để ghi ' + [!start ? 'ngày bắt đầu khóa' : '', !exam ? 'ngày thi' : '', !need ? 'số buổi/tuần' : ''].filter(Boolean).join(", ") + '.</p>' : '') + '</div>';
    if(exam) h += '<div class="lhcd"><div class="t">Còn đến ngày thi</div><div class="n">' + (left > 0 ? left : left === 0 ? 'D-DAY' : '✓') + '</div><div class="u">' + (left > 0 ? 'ngày' : left === 0 ? 'Hôm nay thi, chúc em thi tốt!' : 'Kỳ thi đã diễn ra') + '</div>' +
      (left > 0 && need ? '<hr><div class="s">≈ ' + Math.floor(left / 7 * need) + '</div><div class="u">buổi học với cô (ước tính)</div>' : '') + '</div>';
    h += '</div>';
    if(start && exam && exam > start){
      var tot = exam - start, cur = new Date(start), segs = '', k = 0;
      while(cur < exam){
        var nx = new Date(cur.getFullYear(), cur.getMonth() + 1, 1), end = nx < exam ? nx : exam, w = (end - cur) / tot * 100;
        var n = ls.filter(function(l){ return l.d >= cur && l.d < end; }).length, mo = cur.getMonth() + 1, isCur = today >= cur && today < end;
        segs += '<div class="m' + (today < cur ? ' fut' : '') + (isCur ? ' cur' : '') + '" style="flex:' + w.toFixed(2) + ';--h:' + [45, 210, 330, 140, 265, 20, 185, 0][k % 8] + '" title="Tháng ' + mo + ': ' + n + ' buổi">' +
          (w >= 7 ? '<span class="fl">' + (w >= 14 ? 'Tháng ' + mo + (today >= cur ? ' · ' + n + ' buổi' : '') : 'T' + mo + (today >= cur ? ' · ' + n : '')) + '</span><span class="sh">T' + mo + '</span>' : '') + '</div>';
        cur = nx; k++;
      }
      var pct = Math.min(100, Math.max(0, (today - start) / tot * 100));
      h += '<div class="lhroad"><div class="lhbar">' + segs + '</div><div class="lhprog"><i style="width:' + pct.toFixed(1) + '%"></i><span class="goal" title="Mục tiêu"></span></div>' +
        '<div class="lhends"><span>Bắt đầu · ' + lhDm(start) + '</span><span>Đã học <b>' + ls.length + ' buổi</b> · ' + Math.round(pct) + '% chặng đường</span><span>' + (st.goal ? esc(st.goal) + ' · ' : '') + lhDm(exam) + '</span></div></div>';
    }
    h += '</div>';
    var miss = need ? Math.max(0, need - cw.ls.length) : 0, dleft = 6 - ((today.getDay() + 6) % 7);
    h += '<div class="lhtiles"><div><span>Đã học</span><b>' + ls.length + '</b> buổi</div><div><span>Tuần này</span><b class="' + (need && !miss ? 'ok' : '') + '">' + cw.ls.length + (need ? '/' + need : '') + '</b> buổi</div>' +
      '<div><span>Buổi cần học bù</span><b class="' + (owed > 0 ? 'bad' : 'ok') + '">' + (owed > 0 ? owed : '0') + '</b>' + (owed > 0 ? ' buổi' : ' · đúng lịch') + '</div></div>';
    h += lhPlanCard(st, ls, today);
    var stTxt = need ? (miss === 0 ? 'ok' : dleft > 0 ? '' : 'bad') : '';
    h += '<div class="card"><h2 class="lhsec">Tuần này</h2><p class="hint" style="margin:2px 0 0">Theo dõi số buổi đã học trong tuần (Thứ 2 → Chủ nhật).</p>' +
      '<div class="lhwh"><span>Thứ 2, ' + lhDm(thisMon) + ' – Chủ nhật, ' + lhDm(lhAdd(thisMon, 6)) + '</span><span class="lhst ' + stTxt + '">Đã học ' + cw.ls.length + (need ? '/' + need : '') + ' buổi</span></div><div class="lhwk">' +
      ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"].map(function(nm, i){ var d = lhAdd(thisMon, i), td = d.getTime() === today.getTime(), dl = cw.ls.filter(function(l){ return l.d.getTime() === d.getTime(); }), pl = dl.length ? [] : lhPlanOn(st, d);
        return '<div class="' + (dl.length ? 'has' : pl.length ? 'pl' : '') + (td ? ' td' : '') + '">' + nm + (td ? '<span class="tdl"> · hôm nay</span>' : '') + '<b>' + d.getDate() + '</b>' + dl.map(function(l){ return '<span class="tg">Buổi ' + l.no + (l.mk ? ' · bù' : '') + '</span>'; }).join("") +
          pl.map(function(z){ return '<span class="tp' + (d < today ? ' miss' : '') + '">' + esc(lhSlotTime(st, z)) + (d < today ? ' · chưa ghi' : '') + '</span>'; }).join("") + '</div>'; }).join("") + '</div>' +
      (need ? '<p class="lhnote">' + (start > thisMon && miss ? 'Tuần đầu khóa học nên không tính thiếu buổi.' : miss === 0 ? 'Tuần này đã học đủ số buổi.' : dleft > 0 ? 'Còn <b>' + miss + ' buổi</b> chưa học trong tuần này. Nếu không kịp, cô và em sẽ sắp lịch học bù.' : 'Tuần này thiếu <b>' + miss + ' buổi</b>, cần sắp lịch học bù.') +
        (cw.mk.length ? ' Có ' + cw.mk.length + ' buổi học bù (' + cw.mk.map(function(l){ return lhDm(l.d) + ' bù cho tuần ' + lhDm(l.mk.mon); }).join("; ") + ').' : '') + '</p>' : '') + '</div>';
    if(start && need){
      var blocks = [], perM = need * 4;
      for(var mm = new Date(start.getFullYear(), start.getMonth(), 1); mm <= today; mm = new Date(mm.getFullYear(), mm.getMonth() + 1, 1)){
        (function(mm){
          var nx = new Date(mm.getFullYear(), mm.getMonth() + 1, 1), n = ls.filter(function(l){ return l.d >= mm && l.d < nx; }).length, isNow = today < nx, first = start > mm;
          var target = first ? Math.round(perM * ((nx - start) / 864e5) / ((nx - mm) / 864e5)) : perM;
          var txt = isNow ? (n >= target ? 'Đang học · đã đủ' : 'Đang học · còn ' + (target - n) + ' buổi') : n >= target ? 'Đủ' : 'Thiếu ' + (target - n) + ' buổi';
          var cls = n >= target ? 'lhok' : isNow ? '' : 'lhshort';
          var rows = WEEKS.filter(function(w){ return w.mon < nx && lhAdd(w.mon, 7) > mm; }).map(function(w){
            var inM = w.ls.filter(function(l){ return l.d >= mm && l.d < nx; }), ws, wc;
            if(w.start){ ws = 'Tuần bắt đầu khóa, không tính thiếu'; wc = ''; }
            else if(w.cur){ ws = w.n >= need ? 'Đang học · đã đủ' : 'Đang học · còn ' + (need - w.n) + ' buổi'; wc = w.n >= need ? 'lhok' : ''; }
            else if(w.n >= need){ ws = 'Đủ'; wc = 'lhok'; }
            else { ws = 'Thiếu ' + w.miss + ' buổi' + (w.paid.length ? ', đã bù ' + w.paid.length + ' (' + w.paid.map(function(l){ return lhDm(l.d); }).join(", ") + ')' : ''); wc = w.paid.length >= w.miss ? 'lhok' : 'lhshort'; }
            if(w.mk.length) ws += ' · có ' + w.mk.length + ' buổi học bù';
            return '<tr><td>' + lhDm(w.mon) + ' – ' + lhDm(lhAdd(w.mon, 6)) + '</td><td>' + (inM.length ? inM.map(function(l){ return 'Buổi ' + l.no + ' · ' + LH_DN[l.d.getDay()] + ' ' + lhDm(l.d); }).join("<br>") : 'Không có buổi') + '</td><td>' + w.n + '/' + need + '</td><td class="' + wc + '">' + ws + '</td></tr>';
          }).join("");
          blocks.push('<details class="lhm"' + (isNow ? ' open' : '') + '><summary><span>Tháng ' + (mm.getMonth() + 1) + '/' + mm.getFullYear() + ' · ' + n + '/' + target + ' buổi</span><span class="' + cls + '">' + txt + '</span></summary><div class="scroll"><table class="tbl"><thead><tr><th>Tuần</th><th>Buổi trong tháng</th><th>Cả tuần</th><th>Ghi chú</th></tr></thead><tbody>' + rows + '</tbody></table></div></details>');
        })(mm);
      }
      h += '<div class="card"><h2 class="lhsec">Tổng kết theo tháng</h2><p class="hint">Mỗi tháng cần 4 tuần × ' + need + ' buổi. Tuần thiếu buổi được ghi nợ; buổi vượt ở các tuần sau tính là học bù cho tuần nợ cũ nhất.</p>' + blocks.reverse().join("") + '</div>';
    } else h += '<div class="card"><p class="hint">Ghi ngày bắt đầu khóa và số buổi/tuần (Sửa thông tin) để trang tính đủ / thiếu buổi theo tuần, tháng.</p></div>';
    tdCss();
    var tdMiss = {}; tdDocs("m").concat(tdDocs("b")).forEach(function(x){ if(x.st === st.id && !ls.some(function(l){ return l.date === x.d; })) tdMiss[x.d] = 1; });
    if(Object.keys(tdMiss).length) h += '<div class="card" style="border-left:4px solid var(--warn)"><h2 class="lhsec" style="font-size:18px">Ngày có dấu đã dạy nhưng chưa ghi buổi</h2>' +
      Object.keys(tdMiss).sort().reverse().map(function(d){ return '<div class="lhl" style="grid-template-columns:1fr auto"><div><div class="dt">' + fmtYMD(d) + '</div>' + tdDayHTML(st.id, d) + '</div><div class="act"><button class="btn sm" data-tdlh="' + esc(d) + '">Ghi buổi</button></div></div>'; }).join("") + '</div>';
    h += '<div class="card"><div class="row" style="margin:0 0 6px;justify-content:space-between;align-items:center"><h2 class="lhsec">Lịch học theo ngày (' + ls.length + ' buổi)</h2><button class="btn sm" id="lhNew">+ Thêm buổi học</button></div>' +
      (ls.length ? ls.slice().reverse().map(function(l){
        return '<div class="lhl"><div class="no"><small>Buổi</small>' + l.no + '</div><div><div class="dt">' + LH_DL[l.d.getDay()] + ', ' + lhDm(l.d) + '/' + l.d.getFullYear() + (l.tm ? ' · ' + esc(l.tm) : '') + (l.mk ? ' · <span class="pill warn">học bù tuần ' + lhDm(l.mk.mon) + '</span>' : '') + '</div><h4>' + esc(l.topic || "(chưa ghi nội dung)") + '</h4>' +
          ((l.links || []).length ? '<div class="lhlk">' + l.links.map(function(k){ return '<a href="' + esc(k.url) + '" target="_blank" rel="noopener">' + esc(k.label || "Link") + '</a>'; }).join("") + '</div>' : '') + tdDayHTML(st.id, l.date) +
          '</div><div class="act"><button class="btn sm ghost" data-lhed="' + esc(l.id) + '">Sửa</button><button class="btn sm danger" data-lhdel="' + esc(l.id) + '">Xóa</button></div></div>';
      }).join("") : '<p class="hint">Chưa có buổi nào. Cô bấm “+ Thêm buổi học”, hoặc gửi lịch cho Claude để nhập tự động.</p>') + '</div>';
    return h;
  }
  function lhWire(body, st){
    var nb = $("#lhNew"); if(nb) nb.onclick = function(){ lhEdit(st, null); };
    var sy = $("#lhSync"); if(sy) sy.onclick = function(){ lhSync(st); };
    $$("[data-tdlh]", body).forEach(function(b){ b.onclick = function(){ tdNewBuoi(st, b.dataset.tdlh); }; });
    $$("[data-lhed]", body).forEach(function(b){ b.onclick = function(){ var l = (S.buoi || []).find(function(x){ return x.id === b.dataset.lhed; }); if(l) lhEdit(st, l); }; });
    $$("[data-lhdel]", body).forEach(function(b){ b.onclick = function(){ var l = (S.buoi || []).find(function(x){ return x.id === b.dataset.lhdel; }); if(!l) return;
      ask("Xóa buổi " + (l.no || "") + " ngày " + fmtYMD(l.date) + "?", "Xóa").then(function(ok){ if(ok) db.doc("buoi/" + l.id).delete(); }); }; });
  }
  function lhEdit(st, l, pre){
    var x = l || pre || {date:lhIso(new Date()), topic:"", links:[]};
    var md = modal('<h3>' + (l ? 'Sửa buổi ' + (l.no || '') : 'Thêm buổi học') + ' · ' + esc(st.name) + '</h3>' +
      '<div class="grid2"><div><label class="l" for="lhDate">Ngày học</label><input class="t" id="lhDate" type="date" value="' + esc(x.date) + '"></div><div></div></div>' +
      '<label class="l" for="lhTopic">Nội dung buổi học</label><input class="t" id="lhTopic" data-focus value="' + esc(x.topic || "") + '" placeholder="VD: Chiến thuật giải câu 9–12">' +
      '<label class="l" for="lhLinks">Link tài liệu (mỗi dòng: Tên | link)</label><textarea class="t" id="lhLinks" rows="3" placeholder="Bài giảng | https://claude.ai/artifact/…">' + esc((x.links || []).map(function(k){ return (k.label || "") + " | " + k.url; }).join("\n")) + '</textarea>' +
      '<p class="err" id="lhErr" hidden></p><div class="row"><button class="btn" id="lhOk">Lưu</button><button class="btn ghost" data-close>Hủy</button></div>', true);
    var q = function(s2){ return md.el.querySelector(s2); };
    q("#lhOk").onclick = function(){
      var d = q("#lhDate").value, err = q("#lhErr");
      if(!lhD(d)){ err.textContent = "Cô chọn ngày học nhé."; err.hidden = false; return; }
      var links = q("#lhLinks").value.split("\n").map(function(r){ r = r.trim(); if(!r) return null; var i = r.lastIndexOf("|"); var lab = i >= 0 ? r.slice(0, i).trim() : "", u = (i >= 0 ? r.slice(i + 1) : r).trim(); return validUrl(u) ? {label:lab || "Link", url:u} : false; }).filter(function(k){ return k !== null; });
      if(links.some(function(k){ return k === false; })){ err.textContent = "Mỗi link cần bắt đầu bằng https://"; err.hidden = false; return; }
      var doc = {st:st.id, date:d, topic:cleanName(q("#lhTopic").value), links:links, created:(l && l.created) || Date.now(), updated:Date.now()};
      if(l && l.tm) doc.tm = l.tm;
      db.doc("buoi/" + (l ? l.id : "B" + Date.now().toString(36))).set(doc).then(function(){ md.close(); }, function(e){ err.textContent = "Không lưu được (" + (e && e.code) + ")."; err.hidden = false; });
    };
  }
  /* ===== Lịch cố định của em = các ca ở Học sinh → Lịch tuần (students.slots); đổi ca ở đó thì hồ sơ và học phí đổi theo ===== */
  function lhNeed(st){ return st.perWeek || (st.slots || []).length; }
  function lhDow(day){ var i = DAYS7.indexOf(day); return i < 0 ? -1 : (i + 1) % 7; }
  function lhSlotKey(z){ var c = slotCa(z); return SLOTS3.indexOf(z.slot) * 2000 + (c ? caMin(c.from) : 0); }
  function lhPlanOn(st, d){ var w = d.getDay(); return (st.slots || []).filter(function(z){ return lhDow(z.day) === w; }).sort(function(a, b){ return lhSlotKey(a) - lhSlotKey(b); }); }
  function lhPlan(st, from, to){ var out = []; for(var d = new Date(from); d < to; d = lhAdd(d, 1)) lhPlanOn(st, d).forEach(function(z){ out.push({d:new Date(d), z:z}); }); return out; }
  function lhSlotTime(st, z){ var c = slotCa(z); return c ? caTime(c) : z.slot === "Tối" && st.eveTime ? st.eveTime : z.slot.toLowerCase(); }
  /* Lịch gọn, VD "Thứ 2, Thứ 5 (18h–19h30) · Thứ 7 sáng" */
  function lhPlanText(st){
    var g = {}, order = [];
    (st.slots || []).slice().sort(function(a, b){ return (DAYS7.indexOf(a.day) - DAYS7.indexOf(b.day)) || (lhSlotKey(a) - lhSlotKey(b)); }).forEach(function(z){
      var t = lhSlotTime(st, z);
      if(!g[t]){ g[t] = []; order.push(t); }
      if(g[t].indexOf(z.day) < 0) g[t].push(z.day);
    });
    return order.map(function(t){ return g[t].join(", ") + (/\d/.test(t) ? " (" + t + ")" : " " + t); }).join(" · ");
  }
  /* Ngày có lịch mà chưa ghi buổi: sau buổi ghi gần nhất (hoặc từ ngày bắt đầu), tối đa 2 tháng trở lại, tính cả hôm nay. */
  function lhTodo(st, ls, today){
    var last = ls.length ? ls[ls.length - 1].d : null, from = last ? lhAdd(last, 1) : lhD(st.start), lim = lhAdd(today, -62);
    if(!from) return [];
    return lhPlan(st, from < lim ? lim : from, lhAdd(today, 1));
  }
  function lhPlanCard(st, ls, today){
    var sl = st.slots || [];
    if(!sl.length) return '<div class="card"><h2 class="lhsec">Lịch học cố định</h2><p class="hint">Em chưa có ca học. Cô xếp ở Học sinh → Lịch tuần (bấm “+” trong ô) hoặc “Sửa thông tin” → Ca học; lịch sẽ tự hiện ở đây và dùng để tính học phí.</p></div>';
    var next = lhPlan(st, lhAdd(today, 1), lhAdd(today, 15)), todo = lhTodo(st, ls, today);
    return '<div class="card"><h2 class="lhsec">Lịch học cố định</h2><p class="hint" style="margin:2px 0 6px">Lấy từ Học sinh → Lịch tuần; cô đổi ca ở đó thì ở đây và học phí đổi theo.</p>' + hsSlots(st) +
      '<p class="lhnote" style="margin-top:8px"><b style="color:var(--ink)">' + sl.length + ' buổi/tuần</b>' + (st.perWeek && st.perWeek !== sl.length ? ' · <b>hồ sơ ghi ' + st.perWeek + ' buổi/tuần</b> (Sửa thông tin để khớp)' : '') + '</p>' +
      (next.length ? '<p class="lhnote">Sắp tới: ' + next.slice(0, 6).map(function(x){ return LH_DN[x.d.getDay()] + ' ' + lhDm(x.d) + ' · ' + esc(lhSlotTime(st, x.z)); }).join(" | ") + '</p>' : '') +
      (todo.length ? '<div class="row"><button class="btn sm" id="lhSync">Ghi ' + todo.length + ' buổi đã học theo lịch</button><span class="hint" style="margin:0">' + todo.map(function(x){ return LH_DN[x.d.getDay()] + ' ' + lhDm(x.d); }).join(", ") + ': có lịch, chưa ghi buổi học</span></div>' : '') + '</div>';
  }
  function lhSync(st){
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), todo = lhTodo(st, lhOf(st), today);
    if(!todo.length) return;
    var md = modal('<h3>Ghi buổi theo lịch · ' + esc(st.name) + '</h3><p class="hint">Bỏ chọn buổi em nghỉ. Nội dung từng buổi cô ghi sau (nút Sửa ở danh sách buổi).</p>' +
      todo.map(function(x, i){ return '<label class="castu"><input type="checkbox" data-lt="' + i + '" checked> <span>' + LH_DL[x.d.getDay()] + ', ' + lhDm(x.d) + '/' + x.d.getFullYear() + '</span><small>' + esc(lhSlotTime(st, x.z)) + '</small></label>'; }).join("") +
      '<p class="err" id="ltErr" hidden></p><div class="row"><button class="btn" id="ltOk">Ghi các buổi đã chọn</button><button class="btn ghost" data-close>Hủy</button></div>');
    md.el.querySelector("#ltOk").onclick = function(){
      var pick = $$("[data-lt]", md.el).filter(function(c){ return c.checked; }).map(function(c){ return todo[+c.dataset.lt]; }), t = Date.now();
      if(!pick.length){ md.close(); return; }
      Promise.all(pick.map(function(x, i){ return db.doc("buoi/B" + t.toString(36) + i).set({st:st.id, date:lhIso(x.d), tm:lhSlotTime(st, x.z), topic:"", links:[], plan:1, created:t + i, updated:t}); }))
        .then(function(){ md.close(); }, function(e){ var err = md.el.querySelector("#ltErr"); err.textContent = "Không lưu được (" + (e && e.code) + ")."; err.hidden = false; });
    };
  }
  /* =================== HỌC PHÍ ===================
     students/<id>.fee = {rate: đồng/buổi, mode: "lich" (đếm buổi có lịch trong tháng) | "4t" (4 tuần × buổi/tuần) | "co" (trọn gói/tháng), month: đồng/tháng, from: ngày bắt đầu tính}.
     Tháng đầu vào giữa tháng: số buổi có lịch từ ngày bắt đầu đến hết tháng × đơn giá, hạn đóng = ngày bắt đầu; từ tháng sau đóng đầu tháng (hạn = ngày `due`).
     hocphi/<id học viên>_<YYYY-MM> = {st, ym, n, rate, base, how (chốt khi cô gửi thông báo / ghi đóng tiền), adj, adjNote, paid, paidAt, note, sent};
     hocphi/_cfg = {due, bank, note, sign}. */
  var HP_MODES = [["lich","Theo số buổi có lịch trong tháng","đơn giá × số buổi thật trong tháng (tháng có 5 thứ Hai thì nhiều hơn tháng có 4)"],["4t","Cố định 4 tuần","đơn giá × số buổi/tuần × 4, tháng nào cũng bằng nhau"],["co","Trọn gói theo tháng","một số tiền cố định mỗi tháng"]];
  function hpMoney(n){ return Math.round(+n || 0).toLocaleString("vi-VN") + "đ"; }
  function hpNum(v){
    var s = String(v == null ? "" : v).trim().toLowerCase().replace(/\s/g, ""), neg = /^[-−]/.test(s), mul = 1;
    if(/(k|nghìn|ngàn)$/.test(s)) mul = 1000; else if(/(tr|triệu)$/.test(s)) mul = 1e6;
    s = s.replace(/[^\d.,]/g, "");
    s = mul > 1 ? s.replace(",", ".") : s.replace(/[.,]/g, "");
    var n = parseFloat(s); return isNaN(n) ? 0 : Math.round(n * mul) * (neg ? -1 : 1);
  }
  function hpIn(n){ return n ? Math.round(n).toLocaleString("vi-VN") : ""; }
  function hpCfg(){ var c = (S.hocphi || []).find(function(x){ return x.id === "_cfg"; }) || {}; return {due:c.due || 5, bank:c.bank || "", note:c.note || "", sign:c.sign || "Cô Ngân · Nari TOPIK · 0399 214 554"}; }
  function hpRec(st, ym){ return (S.hocphi || []).find(function(x){ return x.id === st.id + "_" + ym; }) || null; }
  function hpYm(d){ return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
  function hpYmD(ym){ var m = /^(\d{4})-(\d{2})$/.exec(ym); return new Date(+m[1], +m[2] - 1, 1); }
  function hpYmTxt(ym){ var d = hpYmD(ym); return (d.getMonth() + 1) + "/" + d.getFullYear(); }
  function hpYmAdd(ym, n){ var d = hpYmD(ym); return hpYm(new Date(d.getFullYear(), d.getMonth() + n, 1)); }
  function hpFrom(st){ return lhD((st.fee || {}).from) || lhD(st.start); }
  function hpSet(st){ var f = st.fee || {}; return !!(f.rate || (f.mode === "co" && f.month)); }
  function hpFd(d){ return lhDm(d) + "/" + d.getFullYear(); }
  /* Học phí một tháng (null nếu tháng đó em chưa học). */
  function hpBill(st, ym){
    var f = st.fee || {}, m0 = hpYmD(ym), m1 = new Date(m0.getFullYear(), m0.getMonth() + 1, 1), from = hpFrom(st), rec = hpRec(st, ym);
    if(!from || from >= m1) return null;
    var first = from > m0, dates = lhPlan(st, first ? from : m0, m1), rate = +f.rate || 0, need = lhNeed(st), mode = f.mode || "lich", n = dates.length, base, how;
    if(first){
      if(rate){ base = n * rate; how = n + " buổi × " + hpMoney(rate); }
      else { var full = lhPlan(st, m0, m1).length; base = full ? Math.round((+f.month || 0) * n / full / 1000) * 1000 : 0; how = "trọn tháng " + hpMoney(f.month) + " × " + n + "/" + full + " buổi"; }
    } else if(mode === "4t"){ n = need * 4; base = n * rate; how = "4 tuần × " + need + " buổi × " + hpMoney(rate); }
    else if(mode === "co"){ base = +f.month || 0; how = "trọn gói tháng"; }
    else { base = n * rate; how = n + " buổi × " + hpMoney(rate); }
    var lock = !!(rec && rec.base != null);
    if(lock){ n = +rec.n || 0; base = +rec.base || 0; rate = +rec.rate || 0; how = rec.how || (n + " buổi"); }
    var adj = rec ? +rec.adj || 0 : 0, paid = rec ? +rec.paid || 0 : 0, total = base + adj, cfg = hpCfg();
    return {ym:ym, first:first, from:from, dates:dates, n:n, rate:rate, base:base, how:how, mode:first ? "dau" : mode, lock:lock, adj:adj, adjNote:rec ? rec.adjNote || "" : "", total:total, paid:paid,
      due:first ? (dates.length ? dates[0].d : from) : new Date(m0.getFullYear(), m0.getMonth(), Math.min(28, cfg.due)), rec:rec, set:hpSet(st) || lock};
  }
  function hpStatus(b){
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if(!b.set) return ["warn", "chưa đặt học phí"];
    if(b.total <= 0) return ["", "không có buổi"];
    if(b.paid >= b.total) return ["good", "đã đóng" + (b.rec && b.rec.paidAt ? " " + fmtYMD(b.rec.paidAt).slice(0, 5) : "")];
    if(b.paid > 0) return ["warn", "còn thiếu " + hpMoney(b.total - b.paid)];
    if(today > b.due) return ["bad", "quá hạn " + lhDm(b.due)];
    return ["", "chưa đóng · hạn " + lhDm(b.due)];
  }
  /* Các tháng cần thu của một em: từ tháng bắt đầu tới tháng này (từ ngày 20 thêm tháng sau để báo trước). */
  function hpMonths(st){
    var from = hpFrom(st); if(!from) return [];
    var now = new Date(), last = hpYm(now); if(now.getDate() >= 20) last = hpYmAdd(last, 1);
    var out = []; for(var ym = hpYm(from); ym <= last && out.length < 60; ym = hpYmAdd(ym, 1)) out.push(ym);
    return out;
  }
  function hpDates(b){
    var c = {}, order = [];
    b.dates.forEach(function(x){ var k = String(x.d.getDate()).padStart(2, "0"); if(!c[k]){ c[k] = 0; order.push(k); } c[k]++; });
    return order.map(function(k){ return k + (c[k] > 1 ? " (" + c[k] + " buổi)" : ""); }).join(", ") + "/" + String(hpYmD(b.ym).getMonth() + 1).padStart(2, "0");
  }
  function hpMsg(st, b){
    var c = hpCfg(), L = [], nx = hpYmTxt(hpYmAdd(b.ym, 1));
    L.push("THÔNG BÁO HỌC PHÍ THÁNG " + hpYmTxt(b.ym));
    L.push("Học viên: " + st.name);
    if((st.slots || []).length) L.push("Lịch học: " + lhPlanText(st) + " · " + st.slots.length + " buổi/tuần");
    if(b.first) L.push("Em bắt đầu học từ " + hpFd(b.from) + " nên tháng này tính theo số buổi từ ngày bắt đầu đến hết tháng.");
    if(b.dates.length && b.mode !== "4t" && b.mode !== "co") L.push("Các buổi học trong tháng (" + b.dates.length + " buổi): " + hpDates(b));
    L.push("Học phí: " + (b.how === "trọn gói tháng" ? "trọn gói tháng " + hpMoney(b.base) : b.how + " = " + hpMoney(b.base)));
    if(b.adj) L.push((b.adj > 0 ? "Cộng thêm: " : "Giảm trừ: ") + hpMoney(Math.abs(b.adj)) + (b.adjNote ? " (" + b.adjNote + ")" : ""));
    L.push("Tổng cần đóng: " + hpMoney(b.total));
    if(b.paid >= b.total && b.total > 0) L.push("Em đã đóng đủ" + (b.rec && b.rec.paidAt ? " ngày " + fmtYMD(b.rec.paidAt) : "") + ". Cô cảm ơn em!");
    else {
      if(b.paid > 0) L.push("Em đã đóng " + hpMoney(b.paid) + ", còn lại " + hpMoney(b.total - b.paid) + ".");
      L.push("Hạn đóng: " + (b.first ? "buổi học đầu tiên, ngày " + hpFd(b.due) : "trước ngày " + hpFd(b.due)));
      if(c.bank) L.push("Chuyển khoản: " + c.bank);
    }
    if(b.first) L.push("Từ tháng " + nx + ", học phí đóng vào đầu tháng (trước ngày " + c.due + ").");
    if(c.note) L.push(c.note);
    L.push(c.sign);
    return L.join("\n");
  }
  function hpSave(st, ym, doc){
    doc.st = st.id; doc.ym = ym; doc.updated = Date.now();
    Object.keys(doc).forEach(function(k){ if(doc[k] === undefined) delete doc[k]; });
    return db.doc("hocphi/" + st.id + "_" + ym).set(doc);
  }
  function hpKeep(rec){ var d = Object.assign({}, rec || {}); delete d.id; return d; }
  function hpLockDoc(b){ var d = hpKeep(b.rec); if(!b.lock){ d.n = b.n; d.rate = b.rate; d.base = b.base; d.how = b.how; } return d; }
  function hpRowBtns(st, ym, b){
    return b.set ? '<button class="btn sm" data-hpn="' + esc(st.id + "|" + ym) + '">Thông báo</button><button class="btn sm ghost" data-hpe="' + esc(st.id + "|" + ym) + '">' + (b.paid >= b.total && b.total > 0 ? 'Sửa' : 'Ghi đóng tiền') + '</button>'
      : '<button class="btn sm ghost" data-hps="' + esc(st.id) + '">Đặt học phí</button>';
  }
  function hpList(hb){
    var now = new Date(), cur = hpYm(now), ym = S.hpYm || (S.hpYm = now.getDate() >= 25 ? hpYmAdd(cur, 1) : cur);
    var rows = S.students.map(function(st){ return {st:st, b:hpBill(st, ym)}; }).filter(function(x){ return x.b && (x.st.active !== false || (x.b.rec && x.b.total)); });
    var noStart = S.students.filter(function(st){ return st.active !== false && !hpFrom(st); });
    var T = {t:0, p:0, k:0};
    rows.forEach(function(x){ if(!x.b.set) return; T.t += x.b.total; T.p += Math.min(x.b.paid, x.b.total); if(x.b.paid < x.b.total) T.k++; });
    var h = '<div class="card"><div class="row" style="margin:0;justify-content:space-between;align-items:center"><div class="row" style="margin:0;align-items:center"><button class="btn sm ghost" data-hpm="-1" aria-label="Tháng trước">‹</button><h2 style="margin:0">Học phí tháng ' + hpYmTxt(ym) + '</h2><button class="btn sm ghost" data-hpm="1" aria-label="Tháng sau">›</button>' + (ym !== cur ? '<button class="lnk" data-hpm="0">về tháng này</button>' : '') + '</div><button class="btn sm ghost" id="hpCfgBtn">Hạn đóng & chuyển khoản</button></div>' +
      '<p class="hint">Số buổi lấy từ Lịch tuần của từng em. Em vào giữa tháng: tháng đầu tính theo số buổi từ ngày bắt đầu đến hết tháng; từ tháng sau đóng đầu tháng (trước ngày ' + hpCfg().due + '). “Thông báo” tạo tin nhắn gửi em qua Zalo. Số tiền được chốt khi cô bấm “Đánh dấu đã gửi” hoặc ghi đóng tiền; sau đó đổi lịch không làm đổi tháng đó.</p>' +
      '<div class="hptl"><div><span>Phải thu</span><b>' + hpMoney(T.t) + '</b></div><div><span>Đã thu</span><b style="color:var(--ok)">' + hpMoney(T.p) + '</b></div><div><span>Còn lại · ' + T.k + ' em</span><b style="color:' + (T.t - T.p > 0 ? 'var(--pen)' : 'var(--ok)') + '">' + hpMoney(T.t - T.p) + '</b></div></div>' +
      (rows.length ? '<div class="scroll"><table class="tbl hpt hpl"><thead><tr><th>Học viên</th><th>Lịch</th><th>Số buổi</th><th style="text-align:right">Học phí</th><th>Trạng thái</th><th></th></tr></thead><tbody>' + rows.map(function(x){
        var st = x.st, b = x.b, s = hpStatus(b);
        return '<tr><td><button class="hpnm" data-hpo="' + esc(st.id) + '">' + esc(st.name) + '</button>' + (b.first ? '<div class="sm2">tháng đầu, từ ' + lhDm(b.from) + '</div>' : '') + (b.rec && b.rec.sent ? '<div class="sm2">đã gửi thông báo ' + fmtDay(b.rec.sent) + '</div>' : '') + '</td>' +
          '<td class="sm2">' + ((st.slots || []).length ? esc(lhPlanText(st)) : '<span class="pill warn">chưa xếp lịch</span>') + '</td><td>' + (b.set ? b.n : '–') + '</td>' +
          '<td class="r">' + (b.set ? '<b>' + hpMoney(b.total) + '</b>' + (b.adj ? '<div class="sm2">' + (b.adj > 0 ? '+' : '−') + hpMoney(Math.abs(b.adj)) + '</div>' : '') : '–') + '</td>' +
          '<td><span class="pill ' + s[0] + '">' + esc(s[1]) + '</span></td><td><div class="act">' + hpRowBtns(st, ym, b) + '</div></td></tr>';
      }).join("") + '</tbody></table></div>' : '<p class="hint">Tháng này chưa có em nào học.</p>') +
      (noStart.length ? '<p class="hint" style="margin-top:10px">Chưa có ngày bắt đầu nên chưa tính được học phí: ' + noStart.map(function(st){ return '<button class="lnk" data-hps="' + esc(st.id) + '">' + esc(st.name) + '</button>'; }).join(", ") + '.</p>' : '') + '</div>';
    hb.innerHTML = h;
    $$("[data-hpm]", hb).forEach(function(x){ x.onclick = function(){ var d = +x.dataset.hpm; S.hpYm = d ? hpYmAdd(ym, d) : cur; renderTab(); }; });
    $("#hpCfgBtn").onclick = hpCfgEdit;
    $$("[data-hpo]", hb).forEach(function(x){ x.onclick = function(){ S.nlId = "s:" + x.dataset.hpo; S.hpt = "hp"; renderTab(); window.scrollTo(0, 0); }; });
    hpWire(hb);
  }
  function hpWire(root){
    var stOf = function(id){ return S.students.find(function(st){ return st.id === id; }); };
    $$("[data-hps]", root).forEach(function(x){ x.onclick = function(){ var st = stOf(x.dataset.hps); if(st) hpSetup(st); }; });
    $$("[data-hpn]", root).forEach(function(x){ x.onclick = function(){ var p = x.dataset.hpn.split("|"), st = stOf(p[0]); if(st) hpNotice(st, p[1]); }; });
    $$("[data-hpe]", root).forEach(function(x){ x.onclick = function(){ var p = x.dataset.hpe.split("|"), st = stOf(p[0]); if(st) hpEdit(st, p[1]); }; });
  }
  function hpStuHTML(st){
    var f = st.fee || {}, from = hpFrom(st), set = hpSet(st);
    var h = '<div class="card"><div class="row" style="margin:0 0 4px;justify-content:space-between;align-items:center"><h2 class="lhsec">Cách tính học phí</h2><button class="btn sm' + (set ? ' ghost' : '') + '" data-hps="' + esc(st.id) + '">' + (set ? 'Sửa cách tính' : 'Đặt học phí') + '</button></div>' +
      '<div class="hpbox"><p>Lịch học: <b>' + ((st.slots || []).length ? esc(lhPlanText(st)) + '</b> · ' + st.slots.length + ' buổi/tuần' : 'chưa xếp lịch</b> (Học sinh → Lịch tuần)') + '</p>' +
      (set ? '<p>' + (f.rate ? 'Đơn giá <b>' + hpMoney(f.rate) + '/buổi</b> · ' : '') + esc((HP_MODES.find(function(m){ return m[0] === (f.mode || "lich"); }) || HP_MODES[0])[1]) + (f.mode === "co" ? ' <b>' + hpMoney(f.month) + '/tháng</b>' : '') + '</p>' : '<p>Chưa đặt học phí cho em.</p>') +
      '<p>Tính từ: <b>' + (from ? hpFd(from) : 'chưa có ngày bắt đầu') + '</b>' + (from && from.getDate() > 1 ? ' · tháng đầu tính theo số buổi từ ngày này đến hết tháng' : '') + '</p></div></div>';
    var ms = set ? hpMonths(st).reverse() : [];
    if(ms.length){
      var B = ms.map(function(ym){ return hpBill(st, ym); }), tp = B.reduce(function(a, b){ return a + Math.min(b.paid, b.total); }, 0), tk = B.reduce(function(a, b){ return a + Math.max(0, b.total - b.paid); }, 0);
      h += '<div class="card"><h2 class="lhsec">Các tháng</h2><p class="hint">Đã đóng tổng <b>' + hpMoney(tp) + '</b>' + (tk ? ' · còn nợ <b style="color:var(--pen)">' + hpMoney(tk) + '</b>' : ' · không còn nợ') + '.</p><div class="scroll"><table class="tbl hpt"><thead><tr><th>Tháng</th><th>Số buổi</th><th style="text-align:right">Học phí</th><th style="text-align:right">Đã đóng</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
        B.map(function(b){ var s = hpStatus(b);
          return '<tr><td><b>' + hpYmTxt(b.ym) + '</b>' + (b.first ? '<div class="sm2">tháng đầu, từ ' + lhDm(b.from) + '</div>' : '') + (b.rec && b.rec.sent ? '<div class="sm2">đã gửi thông báo ' + fmtDay(b.rec.sent) + '</div>' : '') + '</td><td>' + b.n + '</td>' +
            '<td class="r"><b>' + hpMoney(b.total) + '</b><div class="sm2">' + esc(b.how) + (b.adj ? ' ' + (b.adj > 0 ? '+' : '−') + ' ' + hpMoney(Math.abs(b.adj)) : '') + '</div></td><td class="r">' + (b.paid ? hpMoney(b.paid) : '–') + '</td>' +
            '<td><span class="pill ' + s[0] + '">' + esc(s[1]) + '</span></td><td><div class="act">' + hpRowBtns(st, b.ym, b) + '</div></td></tr>'; }).join("") + '</tbody></table></div></div>';
    }
    return h;
  }
  function hpSetup(st){
    var f = st.fee || {}, mode = f.mode || "lich";
    var md = modal('<h3>Học phí · ' + esc(st.name) + '</h3>' +
      '<p class="hint">Lịch học (từ Lịch tuần): <b>' + ((st.slots || []).length ? esc(lhPlanText(st)) + ' · ' + st.slots.length + ' buổi/tuần' : 'chưa xếp lịch') + '</b></p>' +
      '<div class="grid2"><div><label class="l" for="hpRate">Học phí mỗi buổi</label><input class="t" id="hpRate" inputmode="numeric" data-focus value="' + hpIn(f.rate) + '" placeholder="VD: 150.000 hoặc 150k"></div>' +
      '<div><label class="l" for="hpFrom">Tính học phí từ ngày</label><input class="t" id="hpFrom" type="date" value="' + esc(f.from || st.start || "") + '"></div></div>' +
      '<p class="hint">Ngày em bắt đầu học (mặc định lấy “Ngày bắt đầu khóa”). Vào giữa tháng thì tháng đầu tính theo số buổi từ ngày này đến hết tháng.</p>' +
      '<label class="l">Từ tháng sau, mỗi tháng tính</label>' + HP_MODES.map(function(o){ return '<label class="hpmode"><input type="radio" name="hpMode" value="' + o[0] + '"' + (mode === o[0] ? ' checked' : '') + '><span><b>' + o[1] + '</b><small>' + o[2] + '</small></span></label>'; }).join("") +
      '<div id="hpMonthBox"><label class="l" for="hpMonth">Học phí trọn tháng</label><input class="t" id="hpMonth" inputmode="numeric" value="' + hpIn(f.month) + '" placeholder="VD: 1.200.000 hoặc 1,2tr"></div>' +
      '<div class="hpbox" id="hpPrev"></div><p class="err" id="hpErr" hidden></p><div class="row"><button class="btn" id="hpOk">Lưu</button><button class="btn ghost" data-close>Hủy</button></div>', true);
    var q = function(x){ return md.el.querySelector(x); };
    var read = function(){ var m = (md.el.querySelector("[name=hpMode]:checked") || {}).value || "lich"; return {rate:hpNum(q("#hpRate").value), mode:m, month:m === "co" ? hpNum(q("#hpMonth").value) : 0, from:q("#hpFrom").value || ""}; };
    var prev = function(){
      var fee = read(), tmp = Object.assign({}, st, {id:"__hp", fee:fee}), from = hpFrom(tmp);
      q("#hpMonthBox").hidden = fee.mode !== "co";
      if(!hpSet(tmp) || !from){ q("#hpPrev").innerHTML = '<p>Nhập ' + (!from ? 'ngày bắt đầu' : fee.mode === "co" ? 'học phí trọn tháng' : 'học phí mỗi buổi') + ' để xem trước.</p>'; return; }
      var y0 = hpYm(from), b0 = hpBill(tmp, y0), b1 = hpBill(tmp, hpYmAdd(y0, 1)), b2 = hpBill(tmp, hpYmAdd(y0, 2));
      var line = function(b){ return 'Tháng ' + hpYmTxt(b.ym) + ': ' + esc(b.how) + (b.how === "trọn gói tháng" ? ' ' : ' = ') + '<b>' + hpMoney(b.total) + '</b>'; };
      q("#hpPrev").innerHTML = '<p>' + line(b0) + (b0.first ? ' (tháng đầu, từ ' + lhDm(b0.from) + ', đóng ngày ' + lhDm(b0.due) + ')' : '') + '</p><p>' + line(b1) + ' · đóng trước ' + lhDm(b1.due) + '</p><p>' + line(b2) + '</p>' +
        ((st.slots || []).length ? '' : '<p style="color:var(--pen)">Em chưa có ca trong Lịch tuần nên chưa đếm được số buổi.</p>');
    };
    $$("input", md.el).forEach(function(i){ i.addEventListener("input", prev); i.addEventListener("change", prev); });
    prev();
    q("#hpOk").onclick = function(){
      var fee = read(), err = q("#hpErr");
      if(fee.mode === "co" ? !fee.month : !fee.rate){ err.textContent = fee.mode === "co" ? "Cô nhập học phí trọn tháng nhé." : "Cô nhập học phí mỗi buổi nhé."; err.hidden = false; return; }
      if(!fee.from){ err.textContent = "Cô chọn ngày bắt đầu tính học phí nhé."; err.hidden = false; return; }
      db.doc("students/" + st.id).update({fee:fee, updated:Date.now()}).then(function(){ md.close(); }, function(e){ err.textContent = "Không lưu được (" + (e && e.code) + ")."; err.hidden = false; });
    };
  }
  function hpNotice(st, ym){
    var b = hpBill(st, ym); if(!b) return;
    var md = modal('<h3>Thông báo học phí tháng ' + hpYmTxt(ym) + ' · ' + esc(st.name) + '</h3><p class="hint">Cô sửa chữ trong ô nếu cần, rồi sao chép gửi em qua Zalo.' + (hpCfg().bank ? '' : ' Số tài khoản ghi ở nút “Hạn đóng & chuyển khoản” (Học sinh → Học phí).') + '</p>' +
      '<textarea class="t" id="hpTx" rows="13">' + esc(hpMsg(st, b)) + '</textarea>' +
      '<div class="row"><button class="btn" id="hpCp">Sao chép</button><button class="btn ghost" id="hpSh" hidden>Gửi qua Zalo…</button><button class="btn ghost" id="hpSent">' + (b.rec && b.rec.sent ? 'Đã gửi ' + fmtDay(b.rec.sent) + ' · ghi lại' : 'Đánh dấu đã gửi') + '</button><span class="okmsg" id="hpSt" hidden></span></div>' +
      '<div class="row"><button class="btn ghost sm" data-close>Đóng</button></div>', true);
    var q = function(x){ return md.el.querySelector(x); }, ta = q("#hpTx"), stEl = q("#hpSt");
    var mark = function(){ var d = hpLockDoc(b); d.sent = Date.now(); return hpSave(st, ym, d).then(function(){ stEl.hidden = false; stEl.textContent = "Đã ghi gửi thông báo, chốt " + hpMoney(b.total) + "."; }, function(e){ stEl.hidden = false; stEl.textContent = "Không lưu được (" + (e && e.code) + ")."; }); };
    q("#hpCp").onclick = function(){ copyText(ta.value, stEl); };
    if(navigator.share){ q("#hpSh").hidden = false; q("#hpSh").onclick = function(){ navigator.share({text:ta.value}).then(function(){ if(!(b.rec && b.rec.sent)) mark(); }, function(){}); }; }
    q("#hpSent").onclick = mark;
  }
  function hpEdit(st, ym){
    var b = hpBill(st, ym); if(!b) return;
    var r = b.rec || {}, now = new Date();
    var md = modal('<h3>Học phí tháng ' + hpYmTxt(ym) + ' · ' + esc(st.name) + '</h3>' +
      '<div class="hpbox"><p>Theo lịch: <b>' + b.dates.length + ' buổi</b>' + (b.dates.length ? ' (' + esc(hpDates(b)) + ')' : '') + (b.first ? ' · tháng đầu, từ ' + lhDm(b.from) : '') + '</p><p>Cách tính: ' + esc(b.how) + (b.lock ? ' · <b>đã chốt</b>' : '') + '</p></div>' +
      '<div class="grid2"><div><label class="l" for="heN">Số buổi</label><input class="t" id="heN" type="number" min="0" value="' + b.n + '"></div><div><label class="l" for="heR">Đơn giá/buổi</label><input class="t" id="heR" inputmode="numeric" value="' + hpIn(b.rate) + '"></div></div>' +
      '<label class="l" for="heB">Học phí tháng</label><input class="t" id="heB" inputmode="numeric" value="' + hpIn(b.base) + '"><p class="hint">Tự tính = số buổi × đơn giá; cô sửa thẳng ở đây nếu thu trọn gói.</p>' +
      '<div class="grid2"><div><label class="l" for="heA">Cộng / trừ</label><input class="t" id="heA" value="' + (b.adj ? (b.adj < 0 ? '-' : '') + hpIn(Math.abs(b.adj)) : '') + '" placeholder="VD: -150k"></div><div><label class="l" for="heAn">Lý do</label><input class="t" id="heAn" value="' + esc(b.adjNote) + '" placeholder="VD: cô nghỉ 1 buổi"></div></div>' +
      '<div class="hpbox"><p>Tổng cần đóng: <b id="heT"></b></p></div>' +
      '<div class="grid2"><div><label class="l" for="heP">Em đã đóng</label><input class="t" id="heP" inputmode="numeric" value="' + hpIn(b.paid) + '" placeholder="0"></div><div><label class="l" for="heD">Ngày đóng</label><input class="t" id="heD" type="date" value="' + esc(r.paidAt || "") + '"></div></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn sm ghost" id="heFull">Đóng đủ hôm nay</button></div>' +
      '<label class="l" for="heNote">Ghi chú (chỉ cô xem)</label><input class="t" id="heNote" value="' + esc(r.note || "") + '" placeholder="VD: chuyển khoản, tiền mặt">' +
      '<p class="err" id="heErr" hidden></p><div class="row"><button class="btn" id="heOk">Lưu</button><button class="btn ghost" data-close>Hủy</button>' + (b.lock && !b.paid ? '<span style="flex:1"></span><button class="btn sm ghost" id="heRe">Tính lại theo lịch</button>' : '') + '</div>', true);
    var q = function(x){ return md.el.querySelector(x); };
    var total = function(){ return hpNum(q("#heB").value) + hpNum(q("#heA").value); };
    var show = function(){ q("#heT").textContent = hpMoney(total()); };
    var auto = function(){ var n = parseInt(q("#heN").value, 10) || 0, rt = hpNum(q("#heR").value); if(rt) q("#heB").value = hpIn(n * rt); show(); };
    q("#heN").oninput = auto; q("#heR").oninput = auto; q("#heB").oninput = show; q("#heA").oninput = show; show();
    q("#heFull").onclick = function(){ q("#heP").value = hpIn(total()); q("#heD").value = lhIso(now); };
    q("#heOk").onclick = function(){
      var n = parseInt(q("#heN").value, 10) || 0, rt = hpNum(q("#heR").value), base = hpNum(q("#heB").value), err = q("#heErr");
      var d = hpKeep(b.rec);
      d.n = n; d.rate = rt; d.base = base;
      d.how = n === b.n && rt === b.rate && base === b.base ? b.how : rt && base === n * rt ? n + " buổi × " + hpMoney(rt) : "trọn gói tháng";
      d.adj = hpNum(q("#heA").value); d.adjNote = cleanName(q("#heAn").value); d.paid = hpNum(q("#heP").value); d.paidAt = q("#heD").value || ""; d.note = cleanName(q("#heNote").value);
      if(d.paid && !d.paidAt) d.paidAt = lhIso(now);
      hpSave(st, ym, d).then(function(){ md.close(); }, function(e){ err.textContent = "Không lưu được (" + (e && e.code) + ")."; err.hidden = false; });
    };
    var re = q("#heRe");
    if(re) re.onclick = function(){ var d = hpKeep(b.rec); delete d.n; delete d.rate; delete d.base; delete d.how; hpSave(st, ym, d).then(function(){ md.close(); }); };
  }
  function hpCfgEdit(){
    var c = hpCfg();
    var md = modal('<h3>Hạn đóng & chuyển khoản</h3><p class="hint">Dùng chung cho mọi thông báo học phí.</p>' +
      '<label class="l" for="hcDue">Hạn đóng học phí (ngày trong tháng)</label><input class="t" id="hcDue" type="number" min="1" max="28" value="' + c.due + '" style="max-width:120px">' +
      '<label class="l" for="hcBank">Thông tin chuyển khoản</label><textarea class="t" id="hcBank" rows="3" placeholder="VD: Vietcombank 0123456789 – Nguyễn Thị Ngân. Nội dung: tên em + tháng">' + esc(c.bank) + '</textarea>' +
      '<label class="l" for="hcNote">Lời nhắn thêm (không bắt buộc)</label><textarea class="t" id="hcNote" rows="2" placeholder="VD: Em đóng xong nhắn cô một tiếng nhé!">' + esc(c.note) + '</textarea>' +
      '<label class="l" for="hcSign">Ký tên cuối tin nhắn</label><input class="t" id="hcSign" value="' + esc(c.sign) + '">' +
      '<p class="err" id="hcErr" hidden></p><div class="row"><button class="btn" id="hcOk">Lưu</button><button class="btn ghost" data-close>Hủy</button></div>', true);
    var q = function(x){ return md.el.querySelector(x); };
    q("#hcOk").onclick = function(){
      var due = Math.min(28, Math.max(1, parseInt(q("#hcDue").value, 10) || 5));
      db.doc("hocphi/_cfg").set({due:due, bank:q("#hcBank").value.trim(), note:q("#hcNote").value.trim(), sign:cleanName(q("#hcSign").value) || hpCfg().sign, updated:Date.now()})
        .then(function(){ md.close(); }, function(e){ var err = q("#hcErr"); err.textContent = "Không lưu được (" + (e && e.code) + ")."; err.hidden = false; });
    };
  }
  function hsOpen(id){ S.nlId = id; S.hpt = "tq"; renderTab(); window.scrollTo(0, 0); }
  function hsList(hb){
    var f = S.nlf || (S.nlf = {d:30, q:""}), ps = nlPeople();
    var rank = function(p){ return !p.st ? 1 : p.st.active === false ? 2 : 0; };
    var list = ps.filter(function(p){ return !f.q || p.keys.concat([normName(p.name)]).some(function(k){ return k.indexOf(normName(f.q)) >= 0; }); })
      .sort(function(a,b){ return (rank(a) - rank(b)) || (b.last - a.last) || a.name.localeCompare(b.name); });
    var h = '<div class="card"><div class="grid2"><div><label class="l" for="nlQ">Tìm học sinh</label><input class="t" id="nlQ" value="' + esc(f.q) + '" placeholder="Gõ tên, không cần dấu"></div><div><label class="l" for="nlD">Tính điểm trong</label>' + hsPeriod("nlD", f) + '</div></div>' +
      '<p class="hint">Bấm vào một em để mở hồ sơ: tổng quan (chuyên cần + năng lực), mọi bài đã làm (đề thi, từ vựng, nghe, viết), nhận xét và gửi kết quả. Ô vuông là 14 ngày gần nhất: xanh đậm nộp đủ bài cô giao, vàng nộp thiếu, đỏ bỏ bài, xanh nhạt tự làm thêm (hôm đó không có bài giao).</p></div>';
    if(!S.loaded.st || !S.loaded.r) h += '<p class="hint">Đang tải…</p>';
    h += '<div class="nlcards">' + list.map(function(p){
      var o = nlBuild(p, f.d), n = p.e.length + p.v.length + p.n.length + p.w.length, F = hsFlags(p, o);
      return '<div class="card hscard' + (p.st && p.st.active === false ? ' inactive' : '') + '" tabindex="0" role="button" data-nl="' + esc(p.id) + '"><h3>' + esc(p.name) + '</h3>' +
        (p.st ? '<div class="facts">' + hsFacts(p.st) + '</div>' : '') +
        '<div class="hsflags">' + (F.length ? F.join("") : '<span class="pill good">đang ổn</span>') + '</div>' + nlMini(o) +
        nlDaysHTML(o, 14) + (o.cc && o.cc[1] ? '<div class="hsmeta">Chuyên cần ' + nlPct([o.cc[0], o.cc[1]]) + '% · nộp ' + o.cc[0] + '/' + o.cc[1] + ' bài cô giao</div>' : '') +
        '<div class="hsmeta">' + (n ? n + ' bài đã nộp · gần nhất ' + fmtDay(p.last) : 'Chưa có bài nào') + '</div></div>';
    }).join("") + '</div>';
    if(!list.length && S.loaded.st) h += '<div class="card"><p class="hint">' + (f.q ? 'Không có em nào khớp tên này.' : 'Chưa có học viên nào. Cô bấm “+ Thêm học viên”.') + '</p></div>';
    if(list.some(function(p){ return !p.st; })) h += '<p class="hint" style="margin-top:12px">“Chưa ghép học viên”: tên em nhập khi làm bài không khớp học viên nào. Cô mở hồ sơ học viên đúng của em đó, bấm “Sửa thông tin” và thêm tên này vào ô “Tên khác” để gom bài về một chỗ (bảng theo dõi của Lớp học cũng dùng tên này).</p>';
    hb.innerHTML = h;
    var q = $("#nlQ");
    q.oninput = function(){ f.q = q.value; var pos = q.selectionStart; renderTab(); var nq = $("#nlQ"); nq.focus(); try{ nq.setSelectionRange(pos, pos); }catch(e){} };
    $("#nlD").onchange = function(){ f.d = +this.value; renderTab(); };
    $$("[data-nl]", hb).forEach(function(c){ c.onclick = function(){ hsOpen(c.dataset.nl); }; c.onkeydown = function(e){ if(e.key === "Enter") hsOpen(c.dataset.nl); }; });
  }
  function hsLich(hb){
    var view = S.lichv === "hv" ? "hv" : "tuan";
    var tog = '<div class="hsv">' + [["tuan","Lịch tuần"],["hv","Bảng theo học viên"]].map(function(t){ return '<button class="btn sm' + (view === t[0] ? '' : ' ghost') + '" data-lichv="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '</div>';
    var wireTog = function(){ $$("[data-lichv]", hb).forEach(function(x){ x.onclick = function(){ S.lichv = x.dataset.lichv; renderTab(); }; }); };
    if(view === "hv"){ hb.innerHTML = tog + hsLichHv(); wireTog();
      $$("[data-nl]", hb).forEach(function(c){ c.onclick = function(){ hsOpen(c.dataset.nl); }; });
      var la = $("#lichAll"); if(la) la.onchange = function(){ S.lichAll = la.checked; renderTab(); };
      return; }
    var act = S.students.filter(function(st){ return st.active !== false; });
    var key = function(b, d, ca){ return b + "|" + d + "|" + (ca || ""); };
    var grid = {}; act.forEach(function(st){ (st.slots || []).forEach(function(sl){ var c = slotCa(sl), k = key(sl.slot, sl.day, c ? c.id : ""); (grid[k] = grid[k] || []).push(st); }); });
    var overlap = function(a, c){ return caMin(a.from) < caMin(c.to) && caMin(c.from) < caMin(a.to); };
    var clashes = 0, nCa = 0, mins = 0, noTime = 0, free = 0;
    var rows = '';
    SLOTS3.forEach(function(b){
      var cs = caOf(b), generic = !cs.length || DAYS7.some(function(d){ return (grid[key(b, d, "")] || []).length; });
      rows += '<tr class="bu"><td colspan="8">' + b + '<button class="btn sm ghost" data-caadd="' + b + '">+ Thêm ca</button></td></tr>';
      var list = cs.map(function(c){ return c; });
      if(generic) list.unshift(null);
      list.forEach(function(c){
        var lab = c ? '<button class="caed" data-caed="' + esc(c.id) + '" title="Sửa giờ ca">' + caTime(c) + '<span class="tm">' + (caLen(c) >= 60 ? hrs(caLen(c)) + ' tiếng' : caLen(c) + ' phút') + '</span></button><span class="caact"><button data-caed="' + esc(c.id) + '">Sửa</button><button class="del" data-cadel="' + esc(c.id) + '">Xóa</button></span>'
          : (cs.length ? 'Chưa chọn giờ<span class="tm no">bấm “+” ở ca có giờ để chuyển</span>' : '<span class="tm">chưa có ca có giờ</span>');
        rows += '<tr><td class="sl">' + lab + '</td>' + DAYS7.map(function(d){
          var ns = grid[key(b, d, c ? c.id : "")] || [];
          var bad = !!(c && ns.length && cs.some(function(o){ return o.id !== c.id && overlap(c, o) && (grid[key(b, d, o.id)] || []).length; }));
          var grp = c && ns.length > 1;
          if(ns.length){ nCa++; if(c) mins += caLen(c); else noTime++; } else if(c) free++;
          if(bad) clashes++;
          return '<td class="' + (bad ? "clash" : grp ? "wkg" : "") + '">' + (grp ? '<span class="grpl">Lớp 1:' + ns.length + '</span>' : '') + ns.map(function(st){ return '<span class="nm hc" style="--h:' + stHue(st) + '" tabindex="0" role="button" data-nl="s:' + esc(st.id) + '">' + esc(st.name) + (!c && b === "Tối" && st.eveTime ? ' <small>' + esc(st.eveTime) + '</small>' : '') + '</span>'; }).join("") +
            '<button class="wkadd" data-wkc="' + esc(key(b, d, c ? c.id : "")) + '" aria-label="Xếp học viên ' + b + ' ' + d + (c ? ' ' + caTime(c) : '') + '">+</button></td>';
        }).join("") + '</tr>';
      });
    });
    var h = '<div class="card"><h2>Lịch dạy trong tuần</h2><p class="hint">Mỗi buổi chia thành các ca có giờ, tự xếp theo giờ bắt đầu (“+ Thêm ca”; nút Sửa/Xóa ở từng ca). Bấm “+” trong ô để xếp học viên vào ca đó hoặc chuyển em sang ca, ngày khác; bấm tên để mở hồ sơ. Mỗi em một màu. Nhiều em cùng một ca là lớp ghép (ghi “Lớp 1:2”). Tên chuyển đỏ là trùng giờ: 2 ca chồng giờ nhau trong cùng ngày đều có lớp.</p>' +
      '<p class="wkstat"><b>' + nCa + '</b> ca dạy/tuần' + (mins ? ' · <b>' + hrs(mins) + '</b> giờ' + (noTime ? ' (chưa tính ' + noTime + ' ca chưa chọn giờ)' : '') : '') + ((S.ca || []).length ? ' · <b>' + free + '</b> ô trống ở các ca có giờ' : '') + '</p>' +
      '<div class="scroll"><table class="wk"><thead><tr><th>Ca</th>' + DAYS7.map(function(d){ return '<th>' + d + '</th>'; }).join("") + '</tr></thead><tbody>' + rows +
      '</tbody></table></div>' + (clashes ? '<p class="err">Có ' + clashes + ' ô bị trùng giờ.</p>' : '') + '</div>';
    hb.innerHTML = tog + h; wireTog();
    $$("[data-nl]", hb).forEach(function(c){ c.onclick = function(){ hsOpen(c.dataset.nl); }; c.onkeydown = function(e){ if(e.key === "Enter") hsOpen(c.dataset.nl); }; });
    $$("[data-caadd]", hb).forEach(function(x){ x.onclick = function(){ caEdit(x.dataset.caadd, null); }; });
    $$("[data-caed]", hb).forEach(function(x){ x.onclick = function(){ var c = caById(x.dataset.caed); if(c) caEdit(c.b, c); }; });
    $$("[data-cadel]", hb).forEach(function(x){ x.onclick = function(){ var c = caById(x.dataset.cadel); if(c) caDelete(c); }; });
    $$("[data-wkc]", hb).forEach(function(x){ x.onclick = function(){ var p = x.dataset.wkc.split("|"); caCell(p[0], p[1], p[2]); }; });
  }
  /* Bảng theo học viên: hàng = từng em (cột dọc bên trái), cột = thứ (hàng tiêu đề trên) + ca (hàng tiêu đề dưới); ô tô màu em đó; đỏ = trùng giờ. */
  function hsLichHv(){
    var act = S.students.filter(function(st){ return st.active !== false; });
    var rowsSt = act.filter(function(st){ return (st.slots || []).length; }), none = act.filter(function(st){ return !(st.slots || []).length; });
    var ov = function(a, c){ return caMin(a.from) < caMin(c.to) && caMin(c.from) < caMin(a.to); };
    var has = function(st, d, b, cid){ return (st.slots || []).some(function(z){ return z.day === d && z.slot === b && ((slotCa(z) && z.ca) || "") === cid; }); };
    var all = S.lichAll;
    var cols = [], days = [];
    DAYS7.forEach(function(d){
      var n = 0;
      SLOTS3.forEach(function(b){
        var list = caOf(b).map(function(c){ return [c.id, c]; });
        list.unshift(["", null]);
        list.forEach(function(r){
          var who = rowsSt.filter(function(st){ return has(st, d, b, r[0]); });
          if(!who.length && (!all || (!r[1] && caOf(b).length))) return;
          var bad = !!(r[1] && who.length && act.some(function(o){ return (o.slots || []).some(function(y){ var oc = slotCa(y); return y.day === d && oc && oc.id !== r[1].id && ov(r[1], oc); }); }));
          cols.push({d:d, b:b, id:r[0], c:r[1], who:who, bad:bad, first:n === 0}); n++;
        });
      });
      if(n) days.push([d, n]);
    });
    var mins = {};
    rowsSt.forEach(function(st){ mins[st.id] = 0; cols.forEach(function(k){ if(k.c && has(st, k.d, k.b, k.id)) mins[st.id] += caLen(k.c); }); });
    var dcls = function(k){ return k.first ? ' class="d0' : ' class="'; };
    var head = '<tr><th class="stn" rowspan="2">Học viên</th>' + days.map(function(x){ return '<th class="dl d0" colspan="' + x[1] + '">' + x[0] + '</th>'; }).join("") + '<th class="d0" rowspan="2">Buổi<br>/tuần</th><th rowspan="2">Giờ<br>/tuần</th></tr>' +
      '<tr>' + cols.map(function(k){ return '<th' + dcls(k) + (k.bad ? ' clash' : '') + '">' + k.b + '<span class="cat">' + (k.c ? caTime(k.c) : caOf(k.b).length ? 'chưa chọn giờ' : '&nbsp;') + '</span></th>'; }).join("") + '</tr>';
    var body = rowsSt.map(function(st){
      var n = st.slots.length, need = st.perWeek && st.perWeek !== n;
      return '<tr><th class="stn"><span class="nm hc" tabindex="0" role="button" data-nl="s:' + esc(st.id) + '" style="--h:' + stHue(st) + '">' + esc(st.name) + '</span></th>' + cols.map(function(k){
        var on = has(st, k.d, k.b, k.id);
        return '<td' + dcls(k) + (on && k.bad ? ' clash' : '') + '">' + (on ? '<span class="nm hc" style="--h:' + stHue(st) + '" title="' + esc(st.name + " · " + k.d + " · " + k.b + (k.c ? " " + caTime(k.c) : "")) + '">✓</span>' : '') + '</td>';
      }).join("") + '<td class="d0' + (need ? ' need" title="Hồ sơ ghi ' + st.perWeek + ' buổi/tuần' : '') + '"><b>' + n + (need ? ' / ' + st.perWeek : '') + '</b></td><td><b>' + (mins[st.id] ? hrs(mins[st.id]) : '–') + '</b></td></tr>';
    }).join("");
    var foot = '<tr class="tot"><th class="stn">Số em</th>' + cols.map(function(k){ return '<td' + dcls(k) + '">' + (k.who.length ? (k.who.length > 1 ? '1:' + k.who.length : '1') : '') + '</td>'; }).join("") + '<td class="d0"></td><td></td></tr>';
    return '<div class="card"><h2>Lịch tuần theo học viên</h2><p class="hint">Mỗi hàng là một em (bấm tên để mở hồ sơ), cột ngang là thứ và ca. Ô tô màu là buổi em học, ô đỏ là trùng giờ. Hai cột cuối: số buổi và số giờ mỗi tuần (đỏ “2 / 3” là ít hơn số buổi/tuần ghi trong hồ sơ). Hàng “Số em”: 1:2 là lớp ghép.</p>' +
      '<label class="check" style="margin:0 0 10px"><input type="checkbox" id="lichAll"' + (all ? ' checked' : '') + '> Hiện cả ca trống</label>' +
      (rowsSt.length ? '<div class="scroll"><table class="wk wkhv"><thead>' + head + '</thead><tbody>' + body + foot + '</tbody></table></div>' : '<p class="hint">Chưa em nào có lịch học.</p>') +
      (none.length ? '<p class="hint" style="margin-top:10px">Chưa xếp lịch: ' + none.map(function(st){ return esc(st.name); }).join(", ") + '.</p>' : '') + '</div>';
  }
  var CA_QUICK = {"Sáng":[["07:30","09:00"],["08:00","10:00"],["09:00","10:30"],["10:00","11:30"]], "Chiều":[["14:00","15:00"],["15:00","17:00"],["14:00","16:00"],["16:00","17:30"]], "Tối":[["18:00","19:30"],["19:30","21:00"],["20:00","22:00"]]};
  function caSaveList(list){ return db.doc("site/ca").set({list:list, updated:Date.now()}); }
  function caEdit(b, c){
    var md = modal('<h3>' + (c ? 'Sửa ca ' : 'Thêm ca ') + b.toLowerCase() + '</h3><p class="hint">Ca dùng chung cho cả tuần; ngày nào không có lớp thì ô để trống.</p>' +
      '<div class="capick">' + CA_QUICK[b].map(function(q){ return '<button class="btn sm ghost" data-q="' + q[0] + '|' + q[1] + '">' + caHm(q[0]) + '–' + caHm(q[1]) + '</button>'; }).join("") + '</div>' +
      '<div class="grid2"><div><label class="l" for="caF">Bắt đầu</label><input class="t" id="caF" type="time" step="300" data-focus value="' + esc(c ? c.from : "") + '"></div><div><label class="l" for="caT">Kết thúc</label><input class="t" id="caT" type="time" step="300" value="' + esc(c ? c.to : "") + '"></div></div>' +
      '<p class="err" id="caErr" hidden></p><div class="row"><button class="btn" id="caOk">Lưu</button><button class="btn ghost" data-close>Hủy</button>' + (c ? '<span style="flex:1"></span><button class="btn sm danger" id="caDel">Xóa ca</button>' : '') + '</div>');
    var q = function(x){ return md.el.querySelector(x); }, err = q("#caErr");
    var check = function(){
      var f = q("#caF").value, t = q("#caT").value; err.hidden = true;
      if(!f || !t) return null;
      if(caMin(t) <= caMin(f)){ err.textContent = "Giờ kết thúc phải sau giờ bắt đầu."; err.hidden = false; return null; }
      var hit = (S.ca || []).filter(function(o){ return (!c || o.id !== c.id) && caMin(f) < caMin(o.to) && caMin(o.from) < caMin(t); });
      if(hit.some(function(o){ return o.b === b && o.from === f && o.to === t; })){ err.textContent = "Đã có ca " + caHm(f) + "–" + caHm(t) + "."; err.hidden = false; return null; }
      if(hit.length){ err.textContent = "Lưu ý: chồng giờ với ca " + hit.map(caTime).join(", ") + ". Ngày nào cả hai ca đều có lớp sẽ tô đỏ."; err.hidden = false; }
      return {f:f, t:t};
    };
    $$("[data-q]", md.el).forEach(function(x){ x.onclick = function(){ var v = x.dataset.q.split("|"); q("#caF").value = v[0]; q("#caT").value = v[1]; check(); }; });
    q("#caF").oninput = check; q("#caT").oninput = check;
    q("#caOk").onclick = function(){
      var v = check(); if(!v){ if(err.hidden){ err.textContent = "Cô chọn giờ bắt đầu và kết thúc nhé."; err.hidden = false; } return; }
      var list = (S.ca || []).map(function(o){ return Object.assign({}, o); });
      if(c) list.forEach(function(o){ if(o.id === c.id){ o.from = v.f; o.to = v.t; } });
      else list.push({id:"C" + Date.now().toString(36), b:b, from:v.f, to:v.t});
      caSaveList(list).then(function(){ md.close(); }, function(e){ err.textContent = "Không lưu được (" + (e && e.code) + ")."; err.hidden = false; });
    };
    var del = q("#caDel");
    if(del) del.onclick = function(){ md.close(); caDelete(c); };
  }
  function caDelete(c){
    var used = S.students.filter(function(st){ return (st.slots || []).some(function(z){ return z.ca === c.id; }); });
    var go = function(){
      caSaveList((S.ca || []).filter(function(o){ return o.id !== c.id; })).then(function(){
        used.forEach(function(st){ db.doc("students/" + st.id).update({slots:(st.slots || []).map(function(z){ return z.ca === c.id ? {slot:z.slot, day:z.day} : z; }), updated:Date.now()}); });
      });
    };
    ask(used.length ? "Ca " + c.b.toLowerCase() + " " + caTime(c) + " đang có " + used.map(function(st){ return st.name; }).join(", ") + ". Xóa ca thì các buổi này chuyển về “chưa chọn giờ” (không mất lịch). Xóa ca?" : "Xóa ca " + c.b.toLowerCase() + " " + caTime(c) + "?", "Xóa ca").then(function(ok){ if(ok) go(); });
  }
  function caCell(b, d, caId){
    var c = caById(caId);
    var paint = function(md){
      var act = S.students.filter(function(st){ return st.active !== false; });
      md.el.querySelector("#ccList").innerHTML = act.length ? act.map(function(st){
        var on = (st.slots || []).some(function(z){ return z.slot === b && z.day === d && ((slotCa(z) && z.ca) || "") === (caId || ""); });
        var other = (st.slots || []).filter(function(z){ return z.day === d && !(z.slot === b && ((slotCa(z) && z.ca) || "") === (caId || "")); }).map(function(z){ var oc = slotCa(z); return z.slot.toLowerCase() + (oc ? " " + caTime(oc) : ""); });
        return '<div class="cst"><label class="castu"><input type="checkbox" data-cst="' + esc(st.id) + '"' + (on ? " checked" : "") + '> <span>' + esc(st.name) + '</span>' + (other.length ? '<small>đã có ' + esc(other.join(", ")) + '</small>' : '') +
          (on ? '<button type="button" class="mvbtn" data-mv="' + esc(st.id) + '"' + (other.length ? '' : ' style="margin-left:auto"') + '>Chuyển…</button>' : '') + '</label><div class="mv" data-mvbox="' + esc(st.id) + '" hidden></div></div>';
      }).join("") : '<p class="hint">Chưa có học viên đang học.</p>';
      $$("[data-mv]", md.el).forEach(function(bt){ bt.onclick = function(e){
        e.preventDefault();
        var box = md.el.querySelector('[data-mvbox="' + bt.dataset.mv + '"]');
        if(!box.hidden){ box.hidden = true; return; }
        var opts = []; SLOTS3.forEach(function(bb){ var cs = caOf(bb); cs.forEach(function(oc){ opts.push([bb + "|" + oc.id, bb + " " + caTime(oc)]); }); if(!cs.length) opts.push([bb + "|", bb]); });
        box.innerHTML = '<span class="hint" style="margin:0">Sang</span><select data-mvd aria-label="Ngày">' + DAYS7.map(function(x){ return '<option' + (x === d ? ' selected' : '') + '>' + x + '</option>'; }).join("") + '</select>' +
          '<select data-mvc aria-label="Ca">' + opts.map(function(o){ return '<option value="' + esc(o[0]) + '"' + (o[0] === b + "|" + (caId || "") ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join("") + '</select><button type="button" class="btn sm" data-mvgo>Chuyển</button>';
        box.hidden = false;
        box.querySelector("[data-mvgo]").onclick = function(){
          var st = S.students.find(function(x){ return x.id === bt.dataset.mv; }); if(!st) return;
          var nd = box.querySelector("[data-mvd]").value, t = box.querySelector("[data-mvc]").value.split("|"), nb = t[0], nc = t[1] || "";
          if(nd === d && nb === b && nc === (caId || "")){ box.hidden = true; return; }
          var sl = (st.slots || []).filter(function(z){
            var zc = (slotCa(z) && z.ca) || "";
            if(z.slot === b && z.day === d && zc === (caId || "")) return false;
            if(z.slot === nb && z.day === nd && (zc === nc || (nc && !zc))) return false;
            return true;
          });
          var o = {slot:nb, day:nd}; if(nc) o.ca = nc; sl.push(o);
          this.disabled = true;
          db.doc("students/" + st.id).update({slots:sl, updated:Date.now()}).then(function(){ st.slots = sl; paint(md); }, function(e){ var er = md.el.querySelector("#ccErr"); er.textContent = "Không chuyển được (" + (e && e.code) + ")."; er.hidden = false; });
        };
      }; });
      $$("[data-cst]", md.el).forEach(function(cb){ cb.onchange = function(){
        var st = S.students.find(function(x){ return x.id === cb.dataset.cst; }); if(!st) return;
        var sl = (st.slots || []).filter(function(z){ return !(z.slot === b && z.day === d && (((slotCa(z) && z.ca) || "") === (caId || "") || (caId && cb.checked && !slotCa(z)))); });
        if(cb.checked){ var o = {slot:b, day:d}; if(caId) o.ca = caId; sl.push(o); }
        cb.disabled = true;
        db.doc("students/" + st.id).update({slots:sl, updated:Date.now()}).then(function(){ st.slots = sl; paint(md); }, function(e){ cb.disabled = false; cb.checked = !cb.checked; var er = md.el.querySelector("#ccErr"); er.textContent = "Không lưu được (" + (e && e.code) + ")."; er.hidden = false; });
      }; });
    };
    var md = modal('<h3>' + d + ' · ' + b + (c ? ' ' + caTime(c) : caOf(b).length ? ' (chưa chọn giờ)' : '') + '</h3><p class="hint">Tick học viên học ca này; “Chuyển…” để đổi em sang ca hoặc ngày khác.' + (c ? ' Em đang ở “chưa chọn giờ” cùng buổi, cùng ngày sẽ được chuyển sang ca này.' : '') + '</p><div id="ccList"></div><p class="err" id="ccErr" hidden></p><div class="row"><button class="btn" data-close>Xong</button></div>');
    paint(md);
  }
  function nlDetail(body, p){
    var f = S.nlf || (S.nlf = {d:30, q:""}), st = p.st, tab = S.hpt || (S.hpt = "tq"), main = p.keys.slice().sort(function(a,b){
      var c = function(k){ return p.e.concat(p.v, p.n).filter(function(r){ return r.nameKey === k; }).length; }; return c(b) - c(a); })[0] || normName(p.name);
    var mixIds = []; p.e.forEach(function(r){ var ex = S.exams.find(function(e){ return e.id === r.examId; }); if(ex && ex.mix && !S.qcache[ex.id] && mixIds.indexOf(ex.id) < 0) mixIds.push(ex.id); });
    if(mixIds.length){ body.innerHTML = '<p class="hint">Đang tải đề trộn…</p>'; Promise.all(mixIds.map(function(id){ return loadQs(id); })).then(function(){ renderTab(); }, function(){ S.qcache[mixIds[0]] = {}; renderTab(); }); return; }
    var o = nlBuild(p, f.d), F = hsFlags(p, o);
    var eKey = p.keys.filter(function(k){ return p.e.some(function(r){ return r.nameKey === k && (r.wrong || []).length; }); })[0];
    var vKey = p.keys.filter(function(k){ return vStillWrong(k).length; })[0];
    var exNghe = function(r){ var ex = S.exams.find(function(e){ return e.id === r.examId; }); return !!(ex && ex.nghe); };
    var hist = p.e.map(function(r){ var ng = exNghe(r); return [r.submittedAt, ng ? "Đề nghe" : "Đề đọc", r.examTitle + " · câu " + r.from + "–" + r.to, r.score, r.total - (r.nokey || []).length, "e", r.id, ng ? "en" : "e"]; })
      .concat(p.n.map(function(r){ return [r.submittedAt, "Luyện nghe", r.title, r.score, r.total, "n", r.id, "n"]; }),
        p.v.map(function(r){ return [r.submittedAt, "Từ vựng", r.title + (r.type ? " · " + nlVtName(r.type) : ""), r.score, r.total, "v", r.id, "v"]; }),
        p.w.map(function(r){ return [r.submittedAt, "Bài viết", r.title, r.graded ? r.score : null, r.max, "w", r.id, "w"]; }))
      .sort(function(a,b){ return b[0] - a[0]; });
    var h = '<div class="row" style="margin:0 0 12px"><button class="btn ghost sm" id="nlBack">← Tất cả học sinh</button><span style="flex:1"></span><label class="hint" for="nlD2" style="margin:0">Tính điểm trong</label>' + hsPeriod("nlD2", f) + '</div>' +
      '<div class="card"><h2>' + esc(p.name) + '</h2>' + (st ? '<div class="hsfacts">' + hsFacts(st) + '</div>' + hsSlots(st) : '') +
      (F.length ? '<div class="hsflags">' + F.join("") + '</div>' : '') +
      (st && (st.alias || []).length ? '<p class="hint" style="margin:4px 0 0">Tên khác: ' + st.alias.map(esc).join(", ") + '</p>' : '') +
      (st && st.note ? '<p class="hint" style="margin:4px 0 0">' + esc(st.note) + '</p>' : '') +
      '<p class="hint" style="margin:4px 0 0">' + (st ? '' : 'Chưa ghép học viên · ') + 'Tên đã nhập khi làm bài: ' + esc((p.raw.length ? p.raw : p.keys).join(", ")) + '</p>' +
      '<div class="row">' + (st ? '<button class="btn sm ghost" id="hsEdit">Sửa thông tin</button><button class="btn sm ghost" id="hsApp">App' + (st.app ? ' · ' + esc(st.app) : '') + '</button>' + (st.page ? '<a class="btn sm ghost" href="' + esc(st.page) + '" target="_blank" rel="noopener">Trang học viên</a>' : '') : '') +
      (eKey ? '<button class="btn sm ghost" id="hsMix">Tạo đề ôn câu sai</button>' : '') + (vKey ? '<button class="btn sm ghost" id="hsVre">Giao bài ôn từ sai</button>' : '') + '</div></div>' +
      '<div class="row" style="margin:0 0 12px">' + [["tq","Tổng quan"]].concat(st ? [["lh","Lịch học (" + lhOf(st).length + " buổi)"],["hp","Học phí"]] : []).concat([["bai","Bài đã làm (" + hist.length + ")"],["nx","Nhận xét & gửi kết quả"]]).map(function(t){ return '<button class="btn' + (tab === t[0] ? '' : ' ghost') + '" data-hpt="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '</div>';
    if(tab === "lh" && st){
      h += lhHTML(st);
    } else if(tab === "hp" && st){
      h += hpStuHTML(st);
    } else if(tab === "bai"){
      var HK = [["","Tất cả"],["e","Đề đọc"],["en","Đề nghe"],["v","Từ vựng"],["n","Luyện nghe"],["w","Bài viết"]], hk = S.hpk || "";
      var cnt = {}; hist.forEach(function(x){ cnt[x[7]] = (cnt[x[7]] || 0) + 1; });
      if(hk && !cnt[hk]) hk = S.hpk = "";
      var all = hist; hist = hk ? hist.filter(function(x){ return x[7] === hk; }) : hist;
      h += '<div class="card"><h2>Bài đã làm (' + hist.length + ')</h2><div class="row" style="margin:6px 0 10px"><span class="seg">' + HK.filter(function(k){ return !k[0] || cnt[k[0]]; }).map(function(k){ return '<button data-hpk="' + k[0] + '" aria-pressed="' + (hk === k[0]) + '">' + k[1] + ' (' + (k[0] ? cnt[k[0]] : all.length) + ')</button>'; }).join("") + '</span></div><p class="hint">Bấm vào một dòng để xem chi tiết bài' + (p.w.length ? ' (bài viết: mở bảng chấm)' : '') + '.</p><div class="scroll"><table class="tbl"><thead><tr><th>Ngày</th><th>Phần</th><th>Bài</th><th>Điểm</th></tr></thead><tbody>' +
        hist.slice(0, 150).map(function(x){ var pc = x[3] == null ? null : nlPct([x[3], x[4]]); return '<tr class="click" tabindex="0" data-hr="' + x[5] + ':' + esc(x[6]) + '"><td>' + fmtDay(x[0]) + '</td><td>' + x[1] + '</td><td>' + esc(x[2]) + '</td><td>' + (x[3] == null ? '<span class="pill warn">chưa chấm</span>' : '<span class="pill ' + nlCls(pc) + '">' + x[3] + '/' + x[4] + '</span>') + '</td></tr>'; }).join("") +
        '</tbody></table></div>' + (hist.length > 150 ? '<p class="hint">Hiện 150 bài gần nhất.</p>' : '') + (hist.length ? '' : '<p class="hint">Em chưa nộp bài nào.</p>') + '</div>';
    } else if(tab === "nx"){
      h += '<div class="card"><h2>Nhận xét và việc cần làm</h2><p class="hint">Học sinh thấy 2 mục này ở đầu bảng đánh giá.</p>' +
        '<label class="l" for="nlC">Nhận xét của cô</label><textarea class="t" id="nlC" rows="4" placeholder="VD: Em tiến bộ rõ ở phần nghe. Phần đọc còn chậm ở dạng sắp xếp câu."></textarea>' +
        '<label class="l" for="nlX">Việc em cần làm tiếp</label><textarea class="t" id="nlX" rows="4"></textarea>' +
        '<div class="row"><button class="btn ghost sm" id="nlSug">Gợi ý từ số liệu</button><button class="btn ghost sm" id="nlSave">Lưu</button><span class="okmsg" id="nlOk" hidden></span></div>' +
        '<div class="row" style="border-top:1px solid var(--line);padding-top:12px"><button class="btn" id="nlSend">Tạo link đánh giá gửi em</button><button class="btn ghost" id="nlPrev">Xem trước bản của em</button></div>' +
        (eKey ? '<p class="hint" style="margin-top:10px">Cách cũ: <button class="lnk" id="hsOld">tin nhắn điểm đề thi</button> (mã kết quả em dán vào trang học viên).</p>' : '') + '</div>';
    } else {
      h += '<div class="card"><h2>Tổng quan</h2>' + nlReportHTML(o, true) + '</div>';
    }
    body.innerHTML = h;
    $("#nlBack").onclick = function(){ S.nlId = null; renderTab(); };
    $("#nlD2").onchange = function(){ f.d = +this.value; renderTab(); };
    $$("[data-hpt]", body).forEach(function(b){ b.onclick = function(){ S.hpt = b.dataset.hpt; renderTab(); }; });
    $$("[data-hpk]", body).forEach(function(b){ b.onclick = function(){ S.hpk = b.dataset.hpk; renderTab(); }; });
    if(tab === "lh" && st) lhWire(body, st);
    if(tab === "hp" && st) hpWire(body);
    if(st){ $("#hsEdit").onclick = function(){ editStudent(st); }; $("#hsApp").onclick = function(){ appStudent(st); }; }
    if(eKey) $("#hsMix").onclick = function(){ openMix(eKey); };
    if(vKey) $("#hsVre").onclick = function(){ S.vPreStu = vKey; S.vg = null; S.tab = "tuvung"; S.vsub = "giao"; render(); };
    $$("[data-hr]", body).forEach(function(tr){
      var go = function(){
        var k = tr.dataset.hr.slice(0, 1), id = tr.dataset.hr.slice(2);
        if(k === "e") openResult(id); else if(k === "v") openVResult(id); else if(k === "n") openNResult(id);
        else { var r = (S.wresults || []).find(function(x){ return x.id === id; }); if(r) wGradeModal(r, function(){ renderTab(); }); }
      };
      tr.onclick = go; tr.onkeydown = function(e){ if(e.key === "Enter") go(); };
    });
    if(tab !== "nx") return;
    var ta = $("#nlC"), tx = $("#nlX"), saved = {c:"", x:"", note:null};
    var nid = noteId(main);
    Promise.all(p.keys.concat(p.raw.filter(function(k){ return p.keys.indexOf(k) < 0; })).map(function(k){ return db.doc("notes/" + noteId(k)).get().then(function(d){ return d.exists ? d.data() : null; }, function(){ return null; }); })
      .concat([db.doc("nlnotes/" + nid).get().then(function(d){ return d.exists ? d.data() : null; }, function(){ return null; })])).then(function(ns){
      var x = ns.pop(), best = null;
      ns.forEach(function(n){ if(n && (!best || (n.updated || 0) > (best.updated || 0))) best = n; });
      saved.note = best; saved.c = best ? best.text || "" : ""; saved.x = x ? x.next || "" : "";
      if(!ta.value) ta.value = saved.c; if(!tx.value) tx.value = saved.x;
    });
    /* Chữ đang gõ dở giữ qua lần vẽ lại (VD sau khi “Sửa thông tin”). */
    var dr = S.nxDraft && S.nxDraft.id === p.id ? S.nxDraft : null;
    if(dr){ ta.value = dr.c; tx.value = dr.x; }
    ta.oninput = tx.oninput = function(){ S.nxDraft = {id:p.id, c:ta.value, x:tx.value}; };
    var save = function(){
      var c = ta.value.trim(), x = tx.value.trim(), w = [];
      if(c !== saved.c) w.push(db.doc("notes/" + nid).set(Object.assign({}, saved.note || {}, {name:p.name, nameKey:main, text:c, updated:Date.now()})).then(function(){ saved.c = c; }));
      if(x !== saved.x) w.push(db.doc("nlnotes/" + nid).set({name:p.name, nameKey:main, next:x, updated:Date.now()}).then(function(){ saved.x = x; }));
      return Promise.all(w).then(function(){ S.nxDraft = null; });
    };
    var pack = function(){ var q = Object.assign({}, o, {c:ta.value.trim(), m:tx.value.trim(), x:"Đánh giá của cô · " + fmtDay(o.g)}); delete q.es; return q; };
    $("#nlSug").onclick = function(){ var s = nlSuggest(o); tx.value = tx.value.trim() ? tx.value.trim() + "\n" + s : s; tx.focus(); };
    $("#nlSave").onclick = function(){ var ok = $("#nlOk"); save().then(function(){ ok.textContent = "Đã lưu."; ok.hidden = false; }, function(e){ ok.textContent = "Chưa lưu được (" + (e && e.code) + ")."; ok.hidden = false; }); };
    if(eKey) $("#hsOld").onclick = function(){ save().then(null, function(){}).then(function(){ openStudent(eKey); }); };
    $("#nlPrev").onclick = function(){
      modal('<div class="title"><h1 style="font-size:24px">학습 평가</h1><p>Bản em nhìn thấy</p></div><h2 style="margin:0;font-size:20px">' + esc(p.name) + '</h2>' + nlReportHTML(pack(), false) + '<div class="row"><button class="btn ghost" data-close>Đóng</button></div>', true);
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

  /* ===== Đánh dấu đã dạy (nút 📌 trong học liệu trên site, danh-dau/dd.js). Cô dán mã ND1- ở tab Chấm bài →
     daydau/M<sum(trang|mục)>_<id em> {k:"m", st, p: trang, i: mục, d: ngày, at};
     daydau/C<sum(trang)> {k:"c", p, t: tên trang, s:[{id, t, h: #link phần, it:[{k, t}]}]} = mục lục trang (để thấy cả mục chưa dạy);
     daydau/B<id em>_<ngày> {k:"b", st, d, u: link bảng giảng, at}.
     Lớp học → lớp → thẻ “Tiến độ dạy”; hồ sơ em → Lịch học hiện đã dạy gì ở từng buổi. ===== */
  var TD_SITE = "https://hoc.naritopik.com/";
  function tdDocs(k){ return (S.daydau || []).filter(function(x){ return x.k === k; }); }
  function tdCat(p){ return tdDocs("c").find(function(c){ return c.p === p; }) || null; }
  function tdMid(p, i, st){ return "M" + sum(p + "|" + i) + "_" + st; }
  function tdShort(st){ var w = cleanName(st.name).split(" "); return w[w.length - 1] || st.name; }
  function tdDm(iso){ var d = lhD(iso); return d ? lhDm(d) : ""; }
  function tdLink(p, g){ return TD_SITE + p + (g && g.h ? g.h : ""); }
  function tdFind(p, i){ var c = tdCat(p); if(c) for(var a = 0; a < c.s.length; a++) for(var b = 0; b < c.s[a].it.length; b++) if(c.s[a].it[b].k === i) return {c:c, g:c.s[a], it:c.s[a].it[b]}; return null; }
  /* Đã dạy gì cho em st trong ngày d: [{p, t, link, parts:[tên phần (mục…)]}] */
  function tdDay(stId, d){
    var by = {};
    tdDocs("m").filter(function(x){ return x.st === stId && x.d === d; }).forEach(function(x){
      var f = tdFind(x.p, x.i), pg = by[x.p] = by[x.p] || {p:x.p, t:(f ? f.c.t : x.p), g:{}, order:[]};
      var gk = f ? f.g.id : "?", g = pg.g[gk];
      if(!g){ g = pg.g[gk] = {t:f ? f.g.t : x.i, link:tdLink(x.p, f && f.g), it:[], self:f && f.g.it.length === 1 && f.g.it[0].k === f.g.id, n:f ? f.g.it.length : 0}; pg.order.push(gk); }
      if(f && !g.self) g.it.push(f.it.t);
    });
    return Object.keys(by).map(function(p){ var pg = by[p]; return {p:p, t:pg.t, parts:pg.order.map(function(k){ return pg.g[k]; })}; });
  }
  function tdDayText(stId, d){ return tdDay(stId, d).map(function(pg){ return pg.t + ": " + pg.parts.map(function(g){ return g.t; }).join(", "); }).join("; "); }
  function tdDayHTML(stId, d){
    var a = tdDay(stId, d), b = tdDocs("b").filter(function(x){ return x.st === stId && x.d === d; });
    if(!a.length && !b.length) return "";
    return '<div class="tdday">' + a.map(function(pg){ return '📌 <b>' + esc(pg.t) + '</b>: ' + pg.parts.map(function(g){
        return '<a href="' + esc(g.link) + '" target="_blank" rel="noopener">' + esc(g.t) + '</a>' + (g.self ? '' : g.it.length === g.n ? ' <span class="muted">(cả phần)</span>' : ' <span class="muted">(' + g.it.map(esc).join(" · ") + ')</span>'); }).join("; "); }).join("<br>") +
      b.map(function(x){ return (a.length ? '<br>' : '') + '📄 <a href="' + esc(x.u) + '" target="_blank" rel="noopener">Bảng giảng</a>'; }).join("") + '</div>';
  }
  function tdCss(){
    if(document.getElementById("tdCss")) return;
    var s = document.createElement("style"); s.id = "tdCss";
    s.textContent = '.tdday{font-size:13.5px;margin:4px 0 2px;padding:6px 10px;border-left:3px solid var(--ok);background:var(--ok-soft);border-radius:0 6px 6px 0;line-height:1.6}.tdday a{color:var(--violet)}' +
      '.tdt td,.tdt th{padding:5px 6px}.tdt td.c,.tdt th.c{text-align:center;white-space:nowrap}.tdt tr.g td{background:var(--violet-soft);font-weight:700}.tdt tr.g td a{color:var(--violet)}' +
      '.tdc{all:unset;cursor:pointer;display:inline-block;min-width:44px;border-radius:8px;padding:1px 6px;font-size:13px;font-weight:600;color:var(--muted);border:1px dashed var(--line)}' +
      '.tdc.on{background:var(--ok-soft);color:var(--ok);border:1px solid var(--ok)}.tdc:hover{border-color:var(--violet)}.tdc:focus-visible{outline:2px solid var(--violet)}' +
      'details.tdp{border:1px solid var(--line);border-radius:8px;margin:8px 0}details.tdp>summary{cursor:pointer;padding:9px 12px;font-weight:600;display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:space-between}details.tdp .scroll{padding:0 8px 8px}';
    document.head.appendChild(s);
  }

  /* Chấm bài: mã ND1- */
  function chamDay(fd){
    tdCss();
    var out = $("#cDay"), cats = [], ev = {}, boards = {}, bad = fd.bad, unknown = 0, now = Date.now();
    fd.codes.forEach(function(code){
      var m = String(code).match(/^ND1-([A-Za-z0-9_-]+)-([0-9a-z]{4})$/), o = null;
      if(m && sum(m[1]) === m[2]) try{ o = b64d(m[1]); }catch(e){}
      if(!o){ bad++; return; }
      Object.keys(o.c || {}).forEach(function(p){ var c = o.c[p]; cats.push(["C" + sum(p), {k:"c", p:p, t:c.t, s:(c.s || []).map(function(g){ return {id:g[0], t:g[1], h:g[2] || "", it:g[3].map(function(x){ return {k:x[0], t:x[1]}; })}; }), at:now}]); });
      (o.e || []).forEach(function(e){ var id = tdMid(e[0], e[1], e[2]); if(!ev[id] || ev[id][4] <= e[4]) ev[id] = e; });
      (o.b || []).forEach(function(e){ var id = "B" + e[0] + "_" + e[1]; if(!boards[id] || boards[id][3] <= e[3]) boards[id] = e; });
    });
    var stOf = function(id){ return S.students.find(function(st){ return st.id === id; }); };
    var ops = [], done = [], local = {};
    var put = function(id, doc){ local[id] = doc; ops.push(db.doc("daydau/" + id).set(doc)); };
    cats.forEach(function(c){ put(c[0], c[1]); });
    Object.keys(ev).forEach(function(id){
      var e = ev[id], ex = (S.daydau || []).find(function(x){ return x.id === id; });
      if(!stOf(e[2])){ unknown++; return; }
      if(ex && (ex.at || 0) > e[4]) return;
      if(e[5]){ if(ex){ local[id] = null; ops.push(db.doc("daydau/" + id).delete()); } return; }
      put(id, {k:"m", st:e[2], p:e[0], i:e[1], d:e[3], at:e[4]});
      done.push(e);
    });
    Object.keys(boards).forEach(function(id){ var e = boards[id]; if(!stOf(e[0])){ unknown++; return; } put(id, {k:"b", st:e[0], d:e[1], u:e[2], at:e[3]}); done.push([null, null, e[0], e[1]]); });
    if(!ops.length && !bad){ out.innerHTML = '<div class="card"><h2>Đánh dấu đã dạy</h2><p class="hint">Mã không có dấu mới (đã dán trước đó rồi).</p></div>'; return; }
    busy(true, "Đang ghi dấu đã dạy…");
    Promise.all(ops).then(function(){
      busy(false);
      /* cập nhật ngay S.daydau (chưa chờ onSnapshot) để báo cáo dưới đây có đủ dấu mới */
      var cur = (S.daydau || []).filter(function(x){ return !(x.id in local); });
      Object.keys(local).forEach(function(id){ if(local[id]) cur.push(Object.assign({id:id}, local[id])); });
      S.daydau = cur;
      var days = {}; done.forEach(function(e){ days[e[2] + "|" + e[3]] = 1; });
      var rows = Object.keys(days).sort(function(a, b){ return a.split("|")[1] < b.split("|")[1] ? 1 : -1; }).map(function(k){
        var st = stOf(k.split("|")[0]), d = k.split("|")[1], has = (S.buoi || []).some(function(l){ return l.st === st.id && l.date === d; });
        return '<div class="lhl" style="grid-template-columns:1fr auto"><div><div class="dt">' + esc(st.name) + ' · ' + fmtYMD(d) + (has ? '' : ' · <span class="pill warn">chưa có buổi trong Lịch học</span>') + '</div>' + tdDayHTML(st.id, d) + '</div>' +
          (has ? '' : '<div class="act"><button class="btn sm" data-tdlh="' + esc(st.id) + '|' + esc(d) + '">Ghi buổi</button></div>') + '</div>';
      }).join("");
      out.innerHTML = '<div class="card"><h2>Đánh dấu đã dạy</h2><p class="okmsg">Đã ghi ' + Object.keys(days).length + ' buổi dạy (' + done.length + ' dấu).</p>' +
        (unknown ? '<p class="err">' + unknown + ' dấu của học sinh không còn trong danh sách nên bỏ qua.</p>' : '') + (bad ? '<p class="err">' + bad + ' mã đánh dấu bị cắt hoặc sai, cô chép lại mã trong học liệu (nút 📌 cạnh “↺ Làm mới” → “Chép lại”).</p>' : '') +
        rows + '<p class="hint">Xem tổng hợp ở Lớp học → lớp → “Tiến độ dạy”, hoặc hồ sơ từng em → Lịch học.</p></div>';
      $$("[data-tdlh]", out).forEach(function(b){ b.onclick = function(){ var a = b.dataset.tdlh.split("|"), st = stOf(a[0]); tdNewBuoi(st, a[1]); }; });
    }, function(e){ busy(false); out.innerHTML = '<div class="card"><p class="err">Không ghi được (' + esc((e && e.code) || e) + ').</p></div>'; });
  }
  function tdNewBuoi(st, d){
    var b = tdDocs("b").filter(function(x){ return x.st === st.id && x.d === d; });
    var links = tdDay(st.id, d).map(function(pg){ return {label:pg.t, url:pg.parts[0].link}; }).concat(b.map(function(x){ return {label:"Bảng giảng", url:x.u}; }));
    lhEdit(st, null, {date:d, topic:tdDayText(st.id, d), links:links});
  }

  /* Thẻ “Tiến độ dạy” trong trang lớp */
  function tdCard(c){
    tdCss();
    var mem = clsMembers(c), ids = mem.map(function(st){ return st.id; }), M = {};
    tdDocs("m").forEach(function(x){ if(ids.indexOf(x.st) >= 0) M[x.p + "|" + x.i + "|" + x.st] = x; });
    var last = {}; Object.keys(M).forEach(function(k){ var x = M[k]; last[x.p] = Math.max(last[x.p] || 0, x.at || 0); });
    var pl = Object.keys(last).sort(function(a, b){ return last[b] - last[a]; });
    tdDocs("c").forEach(function(c){ if(pl.indexOf(c.p) < 0) pl.push(c.p); }); /* trang cô đã mở trên máy dạy nhưng chưa có dấu của lớp này */
    S.tdOpen = S.tdOpen || {};
    var h = '<div class="card" id="tdc"><div class="row" style="margin-top:0;justify-content:space-between"><h2 style="margin:0">Tiến độ dạy</h2><span><button class="btn sm ghost" id="tdInst">Cài tên học sinh vào máy cô</button></span></div>' +
      '<p class="hint">Trong học liệu, cạnh tiêu đề từng phần/mục có nút 📌: bấm, tick tên em, ngày tự ghi. Cuối buổi bấm nút 📌 cạnh “↺ Làm mới” ở đầu trang → “Chép mã gửi trang quản lý” → dán vào tab Chấm bài. Bấm vào ô trong bảng để đánh dấu / bỏ dấu tay.</p>';
    if(!mem.length) h += '<p class="hint">Lớp chưa có học sinh.</p>';
    else if(!pl.length) h += '<p class="hint">Chưa có dấu đã dạy nào. Lần đầu: bấm “Cài tên học sinh vào máy cô”, mở link đó trên máy dùng để dạy.</p>';
    else {
      h += '<label class="check" style="margin:4px 0 6px"><input type="checkbox" id="tdGap"' + (S.tdGap ? ' checked' : '') + '> Chỉ hiện mục còn em chưa học</label>';
      pl.forEach(function(p, pi){
        var cat = tdCat(p) || {t:p, s:[]}, groups = cat.s.slice();
        /* dấu của mục không còn trong mục lục (trang đã sửa tiêu đề) → nhóm “Mục cũ” */
        var known = {}; groups.forEach(function(g){ g.it.forEach(function(it){ known[it.k] = 1; }); });
        var old = {}; Object.keys(M).forEach(function(k){ var x = M[k]; if(x.p === p && !known[x.i]) old[x.i] = 1; });
        if(Object.keys(old).length) groups.push({id:"_old", t:"Mục cũ (trang đã đổi tiêu đề)", h:"", it:Object.keys(old).map(function(i){ return {k:i, t:i.split("/").pop()}; })});
        var all = []; groups.forEach(function(g){ g.it.forEach(function(it){ all.push(it.k); }); });
        var cnt = function(list, id){ return list.filter(function(k){ return M[p + "|" + k + "|" + id]; }).length; };
        var cell = function(k, st){ var x = M[p + "|" + k + "|" + st.id]; return '<td class="c"><button class="tdc' + (x ? ' on' : '') + '" data-tdp="' + esc(p) + '" data-tdi="' + esc(k) + '" data-tds="' + esc(st.id) + '" title="' + esc(st.name) + '">' + (x ? tdDm(x.d) : '–') + '</button></td>'; };
        var open = S.tdOpen[p] != null ? S.tdOpen[p] : pi === 0;
        h += '<details class="tdp" data-tdo="' + esc(p) + '"' + (open ? ' open' : '') + '><summary><span>' + esc(cat.t) + '</span><span class="muted" style="font-weight:400">' + mem.map(function(st){ return esc(tdShort(st)) + ' ' + cnt(all, st.id) + '/' + all.length; }).join(" · ") + '</span></summary>' +
          '<div class="scroll"><table class="tbl tdt"><thead><tr><th>Phần · mục</th>' + mem.map(function(st){ return '<th class="c">' + esc(tdShort(st)) + '</th>'; }).join("") + '</tr></thead><tbody>' +
          groups.map(function(g){
            var self = g.it.length === 1 && g.it[0].k === g.id, ks = g.it.map(function(it){ return it.k; });
            var gap = function(k){ return mem.some(function(st){ return !M[p + "|" + k + "|" + st.id]; }); };
            if(S.tdGap && !ks.some(gap)) return "";
            var head = '<tr class="g"><td><a href="' + esc(tdLink(p, g)) + '" target="_blank" rel="noopener">' + esc(g.t) + '</a></td>' +
              (self ? mem.map(function(st){ return cell(g.id, st); }).join("") : mem.map(function(st){ var n = cnt(ks, st.id); return '<td class="c">' + n + '/' + ks.length + '</td>'; }).join("")) + '</tr>';
            return head + (self ? "" : g.it.filter(function(it){ return !S.tdGap || gap(it.k); }).map(function(it){ return '<tr><td>' + esc(it.t) + '</td>' + mem.map(function(st){ return cell(it.k, st); }).join("") + '</tr>'; }).join(""));
          }).join("") + '</tbody></table></div></details>';
      });
    }
    return h + '</div>';
  }
  function tdWire(c, body){
    var ib = $("#tdInst", body); if(ib) ib.onclick = function(){ tdInstall(c); };
    var gp = $("#tdGap", body); if(gp) gp.onchange = function(){ S.tdGap = gp.checked; renderTab(); };
    $$("[data-tdo]", body).forEach(function(d){ d.addEventListener("toggle", function(){ S.tdOpen[d.dataset.tdo] = d.open; }); });
    $$("[data-tdi]", body).forEach(function(b){ b.onclick = function(){ tdEditCell(b.dataset.tdp, b.dataset.tdi, b.dataset.tds); }; });
  }
  function tdEditCell(p, i, stId){
    var st = S.students.find(function(x){ return x.id === stId; }), id = tdMid(p, i, stId), ex = (S.daydau || []).find(function(x){ return x.id === id; }), f = tdFind(p, i);
    var md = modal('<h3>' + esc(st ? st.name : stId) + '</h3><p class="hint">' + esc(f ? f.c.t + ' · ' + f.g.t + (f.g.id === i ? '' : ' · ' + f.it.t) : i) + '</p>' +
      '<label class="l" for="tdD">Ngày dạy</label><input class="t" type="date" id="tdD" value="' + esc(ex ? ex.d : ymdToday(0)) + '" style="width:auto">' +
      '<p class="err" id="tdE" hidden></p><div class="row"><button class="btn" id="tdOk">' + (ex ? 'Lưu ngày' : 'Đánh dấu đã dạy') + '</button>' + (ex ? '<button class="btn danger" id="tdDel">Bỏ dấu</button>' : '') + '<button class="btn ghost" data-close>Hủy</button></div>');
    var q = function(s2){ return md.el.querySelector(s2); };
    q("#tdOk").onclick = function(){ var d = q("#tdD").value; if(!lhD(d)){ q("#tdE").textContent = "Cô chọn ngày nhé."; q("#tdE").hidden = false; return; }
      db.doc("daydau/" + id).set({k:"m", st:stId, p:p, i:i, d:d, at:Date.now()}).then(function(){ md.close(); }, function(e){ q("#tdE").textContent = "Không lưu được (" + (e && e.code) + ")."; q("#tdE").hidden = false; }); };
    if(ex) q("#tdDel").onclick = function(){ db.doc("daydau/" + id).delete().then(function(){ md.close(); }); };
  }
  function tdInstall(c){
    var mem = clsMembers(c), ids = mem.map(function(st){ return st.id; });
    var m = tdDocs("m").filter(function(x){ return ids.indexOf(x.st) >= 0; }).map(function(x){ return [x.p, x.i, x.st, x.d]; });
    var url = TD_SITE + "danh-dau/#n=" + b64e({s:mem.map(function(st){ return [st.id, tdShort(st)]; }), m:m});
    var md = modal('<h3>Cài tên học sinh vào máy cô · ' + esc(c.name) + '</h3><p>Cô mở link này <b>một lần</b> trên máy dùng để dạy (máy khác thì mở lại trên máy đó). Từ đó học liệu hiện nút 📌 với tên ' + mem.map(function(st){ return '<b>' + esc(tdShort(st)) + '</b>'; }).join(", ") + '. Tên chỉ lưu trong trình duyệt máy cô.</p>' +
      '<p class="hint">Link kèm các dấu đã dạy đang có ở đây, nên mở lại link cũng cập nhật dấu cho máy đó. <b>Không gửi link này cho học sinh</b> (có tên các bạn).</p>' + copyBox(url, 3) +
      '<div class="row"><a class="btn ghost" href="' + esc(url) + '" target="_blank" rel="noopener">Mở link</a><button class="btn ghost" data-close>Đóng</button></div>', true);
    wireCopy(md.el);
  }
