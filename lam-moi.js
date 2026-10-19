/* Nút “↺ Làm mới” dùng chung cho các trang học liệu (bài làm lưu localStorage).
   Gắn trong <head>, trước script của trang:  <script src="../lam-moi.js" data-key="nari-51"></script>
   - Nút nằm cuối thanh chọn buổi (nav dính đầu trang; không có nav thì nổi góc phải trên). Bấm → xóa bài đã làm trên trang này (khóa data-key) rồi tải lại, mọi câu về như chưa làm.
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
    s.textContent='nav.lm{display:flex;align-items:stretch;gap:6px}nav.lm>.bar{flex:1;min-width:0}'+
      '.lammoi{flex:none;font-family:inherit;font-weight:bold;font-size:15px;line-height:1.2;padding:4px 10px;border:2px solid var(--ink,#53468F);border-radius:8px;'+
      'background:var(--bg,#fff);color:var(--ink,#53468F);cursor:pointer}.lammoi small{display:block;font-weight:normal;font-size:12px}'+
      '.lammoi:hover{background:var(--ink,#53468F);color:#fff}'+
      '.lammoi.fl{position:fixed;top:8px;right:8px;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.15)}'+
      '@media (max-width:560px){.lammoi{padding:4px 6px;font-size:16px}.lammoi small{font-size:10px}}'+
      '@media print{.lammoi{display:none}}';
    document.head.appendChild(s);
    var b=document.createElement('button');
    b.type='button';b.className='lammoi';b.innerHTML='↺<small>Làm mới</small>';
    b.title='Xóa mọi câu đã chọn / đã viết trên trang này để làm lại từ đầu';
    b.onclick=function(){
      if(!confirm('Xóa mọi câu đã chọn, đã viết và lịch ôn trên trang này (chỉ trên máy này) để làm lại từ đầu?'))return;
      clear();location.reload();
    };
    var nav=document.querySelector('nav');
    if(nav){nav.classList.add('lm');nav.appendChild(b);}
    else{b.classList.add('fl');document.body.appendChild(b);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
