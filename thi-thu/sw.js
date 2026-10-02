/* App "Hàn Ngữ Nari": luôn lấy bản mới qua mạng, mất mạng thì dùng bản đã lưu.
   Không cần đổi tên cache khi cập nhật trang — mỗi lần có mạng là tự lưu bản mới. */
var CACHE = "nari-v1";
var CORE = ["./", "vocab.json", "manifest.webmanifest", "icon/icon-192.png", "icon/apple-touch-icon.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).catch(function(){}));
  self.skipWaiting();
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var r = e.request;
  if(r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  var nav = r.mode === "navigate";
  e.respondWith(fetch(r).then(function(res){
    if(res.ok && res.status !== 206){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(nav ? "./" : r, copy); }); }
    return res;
  }).catch(function(){
    return caches.match(nav ? "./" : r, {ignoreSearch: true}).then(function(m){ return m || Response.error(); });
  }));
});
