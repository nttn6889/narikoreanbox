/* ---------- App cài trên điện thoại (PWA) ----------
   Chèn vào thi-thu/index.html bởi tools/sync_thi_thu.py (không có trong trang quản lý).
   - Mỗi link bài (#d= thi thử, #v= từ vựng, #l= lộ trình, #n= luyện nghe, #w= luyện viết, #s= bảng sửa bài viết, #r= bảng đánh giá) em đã mở được nhớ trong máy (nari-app-saved).
   - Trang đầu có "Bài của em" (bấm là vào) và ô dán link cô gửi → không phải cài lại app khi có bài mới.
   - Đang ở trong bài có nút "Trang đầu"; nút Quay lại của điện thoại cũng về được.
   - "Bài hôm nay": em nhập mã lớp + mã riêng một lần (hoặc bấm link #a= cô gửi), app đọc app/<mã>.json. */
var APP_KEY = "nari-app-saved", APP_KINDS = {l:"Lộ trình từ vựng", v:"Bài từ vựng", d:"Đề thi thử", n:"Bài luyện nghe", w:"Bài luyện viết", s:"Bảng sửa bài viết", r:"Đánh giá của cô"};
function appParse(s){
  var m = String(s || "").match(/(?:^|[#&?\s\/])([dvlnwrs])=([A-Za-z0-9_-]+\.[0-9a-z]{4})/);
  if(!m) return null;
  var p = vUnpack(m[2]);
  if(!p) return null;
  return {k:m[1], h:"#" + m[1] + "=" + m[2], t:p.x || p.t || ""};
}
function appRemember(){
  var it = appParse(location.hash);
  if(!it) return;
  var list = (lsGet(APP_KEY) || []).filter(function(x){ return x.h !== it.h && !(it.k === "r" && x.k === "r"); }); /* chỉ giữ bảng đánh giá mới nhất */
  it.at = Date.now();
  list.unshift(it);
  var routes = list.filter(function(x){ return x.k === "l"; }).slice(0, 5);
  var others = list.filter(function(x){ return x.k !== "l"; }).slice(0, 15);
  lsSet(APP_KEY, routes.concat(others));
}
/* ---------- Bài hôm nay: mã lớp + mã riêng ----------
   Hồ sơ trong máy (nari-app-me): {l: mã lớp, h: mã riêng, n: họ tên}. Link #a=… cô gửi một lần sẽ điền sẵn hồ sơ.
   Bài lấy từ app/<mã>.json (tools/sync_app.py, khi cô nhắn Claude “đăng bài”). Bài đã nộp = máy có bài làm đã nộp. */
var ME_KEY = "nari-app-me", APP_DONE = {v:"nari-v-", n:"nari-n-", d:"nari-tt-"}, APP_WD = ["CN","T2","T3","T4","T5","T6","T7"];
var APP_YK = {v:"Từ vựng", l:"Từ vựng", n:"Luyện nghe", d:"Đề đọc"};
function appYmd(off){ var d = new Date(Date.now() + (off || 0)*864e5); return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }
function appDay(ymd){ var m = String(ymd).split("-"), d = new Date(+m[0], +m[1]-1, +m[2]); return APP_WD[d.getDay()] + " " + m[2] + "/" + m[1]; }
function appCode(s){ return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function appMeBoot(){
  var m = String(location.hash || "").match(/[#&]a=([A-Za-z0-9_-]+\.[0-9a-z]{4})/);
  if(!m) return;
  var p = vUnpack(m[1]);
  history.replaceState(null, "", location.pathname + location.search);
  if(!p || !(p.l || p.h)) return;
  var me = {l:appCode(p.l), h:appCode(p.h), n:cleanName(p.n)};
  lsSet(ME_KEY, me);
  var last = lsGet("nari-tt-last") || {}; last.name = me.n; lsSet("nari-tt-last", last);
}
function appFetch(code){
  if(!code) return Promise.resolve(null);
  return fetch("app/" + code + ".json", {cache:"no-cache"}).then(function(r){
    return r.ok ? r.json() : (r.status === 404 ? {miss:code} : {net:true});
  }).catch(function(){ return {net:true}; });
}
function appLoad(me){
  return Promise.all([appFetch(me.l), appFetch(me.h)]).then(function(r){
    var cls = r[0], stu = r[1], extra = [];
    if(stu && stu.cls) extra = stu.cls.filter(function(c){ return c !== me.l; });
    return Promise.all(extra.map(appFetch)).then(function(more){
      var out = {days:{}, it:[], due:22, miss:[], net:false}, cl = [cls].concat(more);
      cl.concat([stu]).forEach(function(x){ if(!x) return; if(x.miss) out.miss.push(x.miss); if(x.net) out.net = true; if(x.due) out.due = x.due; });
      cl.forEach(function(x){ (x && x.days || []).forEach(function(d){ var o = out.days[d.d] || (out.days[d.d] = {f:d.f, it:[]}); o.it = o.it.concat(d.it || []); }); });
      out.it = (stu && stu.it) || [];
      return out;
    });
  });
}
function appDone(x, name){
  if(x.y === "l"){ var m = lsGet("nari-l-" + x.p.c + "-" + normName(name).replace(/[^a-z0-9]/g, "")); return !!(m && m.done && m.done[x.k]); } /* lộ trình: bài ngày k đã làm */
  var s = lsGet(APP_DONE[x.y] + x.p.c + "-" + normName(name).replace(/[^a-z0-9]/g, ""));
  return !!(s && s.submitted);
}
function appTask(x, i, me, sub){
  var done = appDone(x, me.n);
  return '<button class="appitem' + (done ? ' done' : '') + '" type="button" data-task="' + i + '"><span class="ak">' + esc(x.lb || APP_YK[x.y] || "") + (sub ? ' · ' + esc(sub) : '') + (done ? ' · <b class="ok">✓ Đã nộp</b>' : '') + '</span>' +
    '<span class="at">' + esc(x.t || APP_YK[x.y]) + '</span><span class="ago">›</span></button>';
}
function appTodayHTML(){
  var me = lsGet(ME_KEY);
  if(!me || !(me.l || me.h)){
    return '<section class="apphomebox" id="appMe"><h2>Vào lớp của em</h2><p class="hint" style="margin-top:0">Em nhập mã cô gửi một lần. Từ đó mỗi ngày mở app là thấy bài hôm nay, không phải mở link.</p>' +
      '<div class="grid2"><div><label class="l" for="meL">Mã lớp</label><input class="t code" id="meL" maxlength="8" autocomplete="off" placeholder="VD: K7Q2MA"></div>' +
      '<div><label class="l" for="meH">Mã của em</label><input class="t code" id="meH" maxlength="8" autocomplete="off" placeholder="VD: B3HX9P"></div></div>' +
      '<label class="l" for="meN">Họ và tên của em</label><input class="t" id="meN" autocomplete="name" placeholder="VD: Nguyễn Thị Lan" value="' + esc((lsGet("nari-tt-last") || {}).name || "") + '">' +
      '<p class="err" id="meErr" hidden></p><div class="row"><button class="btn wide" id="meGo" type="button">Lưu và xem bài</button></div></section>';
  }
  return '<section class="apphomebox" id="appMe"><h2>Bài hôm nay · ' + esc(appDay(appYmd(0))) + '</h2>' +
    '<p class="hint" style="margin-top:0">Em: <strong>' + esc(me.n) + '</strong> · <button class="lnk" id="meEdit" type="button">Đổi mã / tên</button></p>' +
    '<div id="appTasks"><p class="hint">Đang tải bài…</p></div></section>';
}
function appTodayWire(){
  var me = lsGet(ME_KEY), box = $("#appTasks");
  if(!me || !(me.l || me.h)){
    var go = $("#meGo"); if(!go) return;
    go.onclick = function(){
      var l = appCode($("#meL").value), h = appCode($("#meH").value), n = cleanName($("#meN").value), err = $("#meErr");
      var bad = function(t){ err.textContent = t; err.hidden = false; };
      if(!l && !h) return bad("Em nhập mã lớp hoặc mã của em nhé.");
      if((l && l.length !== 6) || (h && h.length !== 6)) return bad("Mã gồm 6 chữ và số. Em xem lại tin nhắn của cô nhé.");
      if(!n) return bad("Em nhập họ tên nhé (giống tên cô gọi trong lớp).");
      go.disabled = true; go.textContent = "Đang kiểm tra mã…";
      Promise.all([appFetch(l), appFetch(h)]).then(function(r){
        go.disabled = false; go.textContent = "Lưu và xem bài";
        var miss = r.filter(function(x){ return x && x.miss; }).map(function(x){ return x.miss; });
        if(miss.length) return bad("Mã " + miss.join(", ") + " chưa đúng hoặc cô chưa đăng bài. Em xem lại tin nhắn của cô nhé.");
        lsSet(ME_KEY, {l:l, h:h, n:n});
        var last = lsGet("nari-tt-last") || {}; last.name = n; lsSet("nari-tt-last", last);
        appGo();
      });
    };
    return;
  }
  $("#meEdit").onclick = function(){
    ask("Đổi mã lớp, mã của em hoặc họ tên? Bài đã làm vẫn giữ trong máy.", "Đổi", "Thôi").then(function(ok){
      if(!ok) return;
      try{ localStorage.removeItem(ME_KEY); }catch(e){}
      appGo();
      var f = function(id, v){ var el = $(id); if(el) el.value = v || ""; };
      f("#meL", me.l); f("#meH", me.h); f("#meN", me.n);
    });
  };
  appLoad(me).then(function(D){
    if(!box.isConnected) return;
    var today = appYmd(0), tasks = [], h = "";
    var list = function(arr, sub){ return '<div class="applist">' + arr.map(function(x){ tasks.push(x); return appTask(x, tasks.length - 1, me, sub ? sub(x) : ""); }).join("") + '</div>'; };
    var td = D.days[today];
    if(td && td.it.length) h += (td.f ? '<p class="hint" style="margin:0 0 6px">Trọng tâm: ' + esc(td.f) + ' · hạn nộp ' + D.due + 'h</p>' : '<p class="hint" style="margin:0 0 6px">Hạn nộp ' + D.due + 'h hôm nay</p>') + list(td.it);
    else if(!D.net) h += '<p class="hint">Hôm nay cô chưa giao bài trong app.</p>';
    var late = [];
    Object.keys(D.days).sort().reverse().forEach(function(d){ if(d < today && d >= appYmd(-7)) D.days[d].it.forEach(function(x){ if(!appDone(x, me.n)) late.push(Object.assign({_d:d}, x)); }); });
    if(late.length) h += '<h3 class="appsub">Bài những ngày trước em chưa nộp</h3>' + list(late, function(x){ return appDay(x._d); });
    var mine = D.it.filter(function(x){ return !appDone(x, me.n) || x.d >= appYmd(-7); }).slice(0, 12);
    if(mine.length) h += '<h3 class="appsub">Bài riêng cô giao cho em</h3>' + list(mine, function(x){ return x.d ? appDay(x.d) : ""; });
    if(D.miss.length) h += '<p class="err">Mã ' + esc(D.miss.join(", ")) + ' chưa đúng hoặc cô chưa đăng bài. Em bấm “Đổi mã / tên” để nhập lại.</p>';
    if(D.net) h += '<p class="err">Chưa tải được bài mới. Em kiểm tra mạng rồi mở lại app nhé.</p>';
    box.innerHTML = h;
    box.querySelectorAll("[data-task]").forEach(function(b){
      b.onclick = function(){
        var x = tasks[+b.getAttribute("data-task")]; if(!x) return;
        var last = lsGet("nari-tt-last") || {}; last.name = me.n; lsSet("nari-tt-last", last);
        appGo("#" + x.y + "=" + vPack(x.p));
      };
    });
  });
}
/* Nút “Gửi qua Zalo…” cạnh nút Sao chép tin nhắn kết quả (mở bảng chia sẻ của điện thoại). */
function appShareButtons(){
  if(!navigator.share) return;
  app.querySelectorAll("[data-copy]").forEach(function(b){
    if(b.parentNode.querySelector(".appshare")) return;
    var s = document.createElement("button");
    s.type = "button"; s.className = "btn ghost appshare"; s.textContent = "Gửi qua Zalo…";
    s.onclick = function(){ var box = b.closest(".row").previousElementSibling; navigator.share({text:box.value}).catch(function(){}); };
    b.insertAdjacentElement("afterend", s);
  });
}
function appRun(){
  stopClock(); if(typeof vStopClock === "function") vStopClock();
  window.scrollTo(0, 0);
  appMeBoot();
  appRemember();
  if(!examBoot() && !writeBoot() && !vocabBoot() && !routeBoot() && !ngheBoot() && !reportBoot()) studentLanding();
}
function appGo(h){ history.pushState(null, "", h || location.pathname + location.search); appRun(); }
var headerHTMLBase = headerHTML;
headerHTML = function(){
  var h = headerHTMLBase();
  return location.hash ? h.replace('<a class="about"', '<button class="btn ghost apphome" type="button">⌂ Trang đầu</button><a class="about"') : h;
};
function appHomeClick(){
  var busy = [].some.call(app.querySelectorAll("#submit, #vsub, #nsub, #nnext"), function(x){ return x.offsetParent; });
  if(!busy){ appGo(); return; }
  ask("Về trang đầu? Bài đang làm dở máy em vẫn nhớ, mở lại bài là làm tiếp.", "Về trang đầu", "Ở lại").then(function(ok){ if(ok) appGo(); });
}
function appHomeHTML(){
  var list = lsGet(APP_KEY) || [];
  var row = function(x, i){
    return '<button class="appitem" type="button" data-i="' + i + '"><span class="ak">' + esc(APP_KINDS[x.k] || "") + '</span>' +
      '<span class="at">' + esc(x.t || APP_KINDS[x.k] || "Bài") + '</span><span class="ago">›</span></button>';
  };
  return '<section class="apphomebox"><h2>Bài của em</h2>' +
    (list.length ? '<div class="applist">' + list.map(row).join("") + '</div>' :
      '<p class="hint">' + (lsGet(ME_KEY) ? 'Bài cô gửi bằng link qua Zalo: em dán link vào ô dưới đây.' : 'Chưa có bài nào. Em dán link cô gửi qua Zalo vào ô dưới đây là làm được ngay.') + '</p>') +
    '<label class="l" for="applink">Dán link bài cô gửi</label>' +
    '<div class="row" style="margin-top:0;flex-wrap:nowrap"><input class="t" id="applink" autocomplete="off" placeholder="Dán link vào đây"><button class="btn" id="appopen" type="button">Mở</button></div>' +
    '<p class="err" id="apperr" hidden></p></section>';
}
var studentLandingBase = studentLanding;
studentLanding = function(prefill){
  studentLandingBase(prefill);
  if(prefill && prefill.link) return;
  var title = app.querySelector("main.paper .title");
  if(!title) return;
  title.insertAdjacentHTML("afterend", appTodayHTML() + appHomeHTML());
  var sc = $("#scode");  // mã của bài làm qua link không nhập lại được ở ô mã → để trống
  if(sc && sc.type !== "hidden" && !DATA.assign[sc.value.trim().toUpperCase()]) sc.value = "";
  var list = lsGet(APP_KEY) || [];
  app.querySelectorAll(".appitem").forEach(function(b){ b.onclick = function(){ var x = list[+b.getAttribute("data-i")]; if(x) appGo(x.h); }; });
  var open = function(){
    var v = $("#applink").value.trim(), e = $("#apperr"), it = appParse(v);
    if(it){ appGo(it.h); return; }
    if(/^[A-Za-z0-9]{3,8}$/.test(v) && DATA.assign[v.toUpperCase()]){ $("#scode").value = v.toUpperCase(); $("#sname").focus(); e.hidden = true; return; }
    e.textContent = v ? "Link chưa đúng hoặc bị cắt. Em sao chép lại đủ cả link cô gửi nhé." : "Em dán link cô gửi vào ô trên nhé.";
    e.hidden = false;
  };
  $("#appopen").onclick = open;
  appTodayWire();
  $("#applink").addEventListener("keydown", function(e){ if(e.key === "Enter") open(); });
};
(function(){
  var st = document.createElement("style");
  st.textContent = ".apphomebox{margin:4px 0 22px;padding-bottom:18px;border-bottom:1px dashed var(--line)}" +
    ".apphomebox h2{font-size:17px;margin:0 0 8px}.applist{display:flex;flex-direction:column;gap:8px}" +
    ".appitem{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:10px 12px;border:1.5px solid var(--line);border-radius:8px;background:var(--paper)}" +
    ".appitem:hover,.appitem:focus-visible{border-color:var(--violet)}" +
    ".appitem .ak{grid-column:1;font-size:12px;color:var(--muted)}.appitem .at{grid-column:1;font-weight:600;overflow-wrap:anywhere}" +
    ".appitem .ago{grid-column:2;grid-row:1/3;align-self:center;font-size:22px;color:var(--violet)}" +
    ".apphome{padding:6px 10px;font-size:13.5px;margin-left:auto;margin-right:8px}" +
    ".appitem.done{background:var(--ok-soft);border-color:var(--ok)}.appitem .ok{color:var(--ok)}" +
    ".appsub{font-size:14.5px;margin:16px 0 6px}#appMe .grid2{margin-top:-4px}.appshare{margin-left:2px}";
  document.head.appendChild(st);
  window.addEventListener("popstate", appRun);
  new MutationObserver(appShareButtons).observe(app, {childList:true, subtree:true});
  document.addEventListener("click", function(e){ if(e.target.closest && e.target.closest(".apphome")) appHomeClick(); });
  if("serviceWorker" in navigator) window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
})();
appRun();
