/* ---------- App cài trên điện thoại (PWA) ----------
   Chèn vào thi-thu/index.html bởi tools/sync_thi_thu.py (không có trong trang quản lý).
   - Mỗi link bài (#d= thi thử, #v= từ vựng, #l= lộ trình, #n= luyện nghe) em đã mở được nhớ trong máy (nari-app-saved).
   - Trang đầu có "Bài của em" (bấm là vào) và ô dán link cô gửi → không phải cài lại app khi có bài mới.
   - Đang ở trong bài có nút "Trang đầu"; nút Quay lại của điện thoại cũng về được. */
var APP_KEY = "nari-app-saved", APP_KINDS = {l:"Lộ trình từ vựng", v:"Bài từ vựng", d:"Đề thi thử", n:"Bài luyện nghe"};
function appParse(s){
  var m = String(s || "").match(/(?:^|[#&?\s\/])([dvln])=([A-Za-z0-9_-]+\.[0-9a-z]{4})/);
  if(!m) return null;
  var p = vUnpack(m[2]);
  if(!p) return null;
  return {k:m[1], h:"#" + m[1] + "=" + m[2], t:p.x || p.t || ""};
}
function appRemember(){
  var it = appParse(location.hash);
  if(!it) return;
  var list = (lsGet(APP_KEY) || []).filter(function(x){ return x.h !== it.h; });
  it.at = Date.now();
  list.unshift(it);
  var routes = list.filter(function(x){ return x.k === "l"; }).slice(0, 5);
  var others = list.filter(function(x){ return x.k !== "l"; }).slice(0, 15);
  lsSet(APP_KEY, routes.concat(others));
}
function appRun(){
  stopClock(); if(typeof vStopClock === "function") vStopClock();
  window.scrollTo(0, 0);
  appRemember();
  if(!examBoot() && !vocabBoot() && !routeBoot() && !ngheBoot()) studentLanding();
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
      '<p class="hint">Chưa có bài nào. Em dán link cô gửi qua Zalo vào ô dưới đây là làm được ngay.</p>') +
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
  title.insertAdjacentHTML("afterend", appHomeHTML());
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
    ".apphome{padding:6px 10px;font-size:13.5px;margin-left:auto;margin-right:8px}";
  document.head.appendChild(st);
  window.addEventListener("popstate", appRun);
  document.addEventListener("click", function(e){ if(e.target.closest && e.target.closest(".apphome")) appHomeClick(); });
  if("serviceWorker" in navigator) window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); });
})();
appRun();
