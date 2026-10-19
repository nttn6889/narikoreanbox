/* Nút “↺ Làm mới” dùng chung cho các trang học liệu (bài làm lưu localStorage).
   Gắn trong <head>, trước script của trang:  <script src="../lam-moi.js" data-key="nari-51"></script>
   - Bấm nút → xóa bài đã làm trên trang này (khóa data-key) rồi tải lại, mọi câu về như chưa làm.
   - Mở link có ?moi (vd. viet-51/?moi#b=1) → tự xóa trước khi trang đọc bài cũ (cô dùng khi giảng). */
(function(){
  var me=document.currentScript, key=me&&me.getAttribute('data-key');
  if(!key)return;
  function clear(){try{localStorage.removeItem(key);}catch(e){}}
  if(/[?&]moi\b/.test(location.search)){
    clear();
    try{history.replaceState(null,'',location.pathname+location.hash);}catch(e){}
  }
  function add(){
    var s=document.createElement('style');
    s.textContent='.lammoi{position:fixed;left:10px;bottom:10px;z-index:50;font:600 13px/1 system-ui,sans-serif;padding:8px 12px;border-radius:999px;'+
      'border:1px solid #c9c3dc;background:#fff;color:#53468F;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;opacity:.85}'+
      '.lammoi:hover{opacity:1}@media (prefers-color-scheme:dark){.lammoi{background:#2a2738;color:#d9d2f5;border-color:#4a4462}}'+
      '@media print{.lammoi{display:none}}';
    document.head.appendChild(s);
    var b=document.createElement('button');
    b.type='button';b.className='lammoi';b.textContent='↺ Làm mới';
    b.title='Xóa mọi câu đã chọn / đã viết trên trang này để làm lại từ đầu';
    b.onclick=function(){
      if(!confirm('Xóa mọi câu đã chọn, đã viết và lịch ôn trên trang này (chỉ trên máy này) để làm lại từ đầu?'))return;
      clear();location.reload();
    };
    document.body.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
