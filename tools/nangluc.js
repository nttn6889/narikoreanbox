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
  app.innerHTML = '<div class="wrap">' + headerHTML() + '<main class="paper"><div class="title"><h1>학습 평가</h1><p>Đánh giá học tập · Hàn Ngữ Nari</p></div>' +
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
      ".wk .nm[data-nl]{cursor:pointer}.wk .nm[data-nl]:hover{text-decoration:underline}.hsfacts{font-size:14.5px;color:var(--muted);margin:2px 0 6px}.hsfacts b{color:var(--ink)}";
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
    }
    return F;
  }
  function renderHocSinh(body){
    nlCss(); hsCss();
    if(S.nlId){ var cur = nlPeople().find(function(p){ return p.id === S.nlId; }); if(cur) return nlDetail(body, cur); S.nlId = null; }
    var sub = S.hsub === "lich" ? "lich" : (S.hsub = "ds");
    body.innerHTML = '<div class="row" style="margin:0 0 14px">' + [["ds","Học sinh"],["lich","Lịch tuần"]].map(function(t){ return '<button class="btn' + (sub === t[0] ? '' : ' ghost') + '" data-hsub="' + t[0] + '">' + t[1] + '</button>'; }).join("") +
      '<span style="flex:1"></span><button class="btn ghost" id="stNew">+ Thêm học viên</button></div><div id="hsb"></div>';
    $$("[data-hsub]", body).forEach(function(b){ b.onclick = function(){ S.hsub = b.dataset.hsub; renderTab(); }; });
    $("#stNew").onclick = function(){ editStudent(null); };
    var hb = $("#hsb");
    if(sub === "lich") hsLich(hb); else hsList(hb);
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
    var ls = lhOf(st), need = st.perWeek || 0, now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
    var stTxt = need ? (miss === 0 ? 'ok' : dleft > 0 ? '' : 'bad') : '';
    h += '<div class="card"><h2 class="lhsec">Tuần này</h2><p class="hint" style="margin:2px 0 0">Theo dõi số buổi đã học trong tuần (Thứ 2 → Chủ nhật).</p>' +
      '<div class="lhwh"><span>Thứ 2, ' + lhDm(thisMon) + ' – Chủ nhật, ' + lhDm(lhAdd(thisMon, 6)) + '</span><span class="lhst ' + stTxt + '">Đã học ' + cw.ls.length + (need ? '/' + need : '') + ' buổi</span></div><div class="lhwk">' +
      ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"].map(function(nm, i){ var d = lhAdd(thisMon, i), td = d.getTime() === today.getTime(), dl = cw.ls.filter(function(l){ return l.d.getTime() === d.getTime(); });
        return '<div class="' + (dl.length ? 'has' : '') + (td ? ' td' : '') + '">' + nm + (td ? '<span class="tdl"> · hôm nay</span>' : '') + '<b>' + d.getDate() + '</b>' + dl.map(function(l){ return '<span class="tg">Buổi ' + l.no + (l.mk ? ' · bù' : '') + '</span>'; }).join("") + '</div>'; }).join("") + '</div>' +
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
    h += '<div class="card"><div class="row" style="margin:0 0 6px;justify-content:space-between;align-items:center"><h2 class="lhsec">Lịch học theo ngày (' + ls.length + ' buổi)</h2><button class="btn sm" id="lhNew">+ Thêm buổi học</button></div>' +
      (ls.length ? ls.slice().reverse().map(function(l){
        return '<div class="lhl"><div class="no"><small>Buổi</small>' + l.no + '</div><div><div class="dt">' + LH_DL[l.d.getDay()] + ', ' + lhDm(l.d) + '/' + l.d.getFullYear() + (l.mk ? ' · <span class="pill warn">học bù tuần ' + lhDm(l.mk.mon) + '</span>' : '') + '</div><h4>' + esc(l.topic || "(chưa ghi nội dung)") + '</h4>' +
          ((l.links || []).length ? '<div class="lhlk">' + l.links.map(function(k){ return '<a href="' + esc(k.url) + '" target="_blank" rel="noopener">' + esc(k.label || "Link") + '</a>'; }).join("") + '</div>' : '') +
          '</div><div class="act"><button class="btn sm ghost" data-lhed="' + esc(l.id) + '">Sửa</button><button class="btn sm danger" data-lhdel="' + esc(l.id) + '">Xóa</button></div></div>';
      }).join("") : '<p class="hint">Chưa có buổi nào. Cô bấm “+ Thêm buổi học”, hoặc gửi lịch cho Claude để nhập tự động.</p>') + '</div>';
    return h;
  }
  function lhWire(body, st){
    var nb = $("#lhNew"); if(nb) nb.onclick = function(){ lhEdit(st, null); };
    $$("[data-lhed]", body).forEach(function(b){ b.onclick = function(){ var l = (S.buoi || []).find(function(x){ return x.id === b.dataset.lhed; }); if(l) lhEdit(st, l); }; });
    $$("[data-lhdel]", body).forEach(function(b){ b.onclick = function(){ var l = (S.buoi || []).find(function(x){ return x.id === b.dataset.lhdel; }); if(!l) return;
      ask("Xóa buổi " + (l.no || "") + " ngày " + fmtYMD(l.date) + "?", "Xóa").then(function(ok){ if(ok) db.doc("buoi/" + l.id).delete(); }); }; });
  }
  function lhEdit(st, l){
    var x = l || {date:lhIso(new Date()), topic:"", links:[]};
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
      db.doc("buoi/" + (l ? l.id : "B" + Date.now().toString(36))).set(doc).then(function(){ md.close(); }, function(e){ err.textContent = "Không lưu được (" + (e && e.code) + ")."; err.hidden = false; });
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
      '<div class="row" style="margin:0 0 12px">' + [["tq","Tổng quan"]].concat(st ? [["lh","Lịch học (" + lhOf(st).length + " buổi)"]] : []).concat([["bai","Bài đã làm (" + hist.length + ")"],["nx","Nhận xét & gửi kết quả"]]).map(function(t){ return '<button class="btn' + (tab === t[0] ? '' : ' ghost') + '" data-hpt="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '</div>';
    if(tab === "lh" && st){
      h += lhHTML(st);
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
