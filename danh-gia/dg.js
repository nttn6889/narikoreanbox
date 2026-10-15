/* Phiếu đánh giá buổi học — dùng chung cho mọi trang học liệu.
   Cách gắn: <div id="danhgia" data-buoi="so-dem" data-title="Buổi 2 · Số Hán Hàn – thuần Hàn" data-parts="Hai bộ số|Lượng từ|…"></div>
             <script src="…/danh-gia/dg.js"></script>
   Học sinh điền → “Gửi đánh giá cho cô” chia sẻ đoạn chữ qua Zalo (không lưu lên mạng). Bản nháp lưu localStorage nari-dg-<buoi>. */
(function(){
var CSS='.dg{border:2px solid #53468F;border-radius:12px;padding:12px 14px;margin:24px 0;background:#faf9fd;font-size:15.5px}'+
'.dg h3{margin:0 0 2px;border:0;padding:0;font-size:20px;color:#53468F}.dg .sub{margin:0 0 10px;color:#666;font-size:14px}'+
'.dg .qq{margin:14px 0 6px;font-weight:bold}.dg .qq small{font-weight:normal;color:#666}'+
'.dg .ch{display:flex;flex-wrap:wrap;gap:6px}.dg .ch button{font:inherit;font-size:14.5px;padding:6px 11px;border:1px solid #999;border-radius:18px;background:#fff;color:#111;cursor:pointer}'+
'.dg .ch button.on{background:#53468F;border-color:#53468F;color:#fff}.dg .stars button{font-size:22px;padding:2px 8px;border-radius:8px}'+
'.dg table{border-collapse:collapse;width:100%;font-size:14.5px}.dg td{padding:5px 4px;border-bottom:1px solid #ddd;vertical-align:middle}.dg td:first-child{width:34%}'+
'.dg td .ch button{font-size:13.5px;padding:4px 8px}'+
'@media(max-width:560px){.dg table,.dg tbody,.dg tr,.dg td{display:block;width:auto!important}.dg td{border:0;padding:2px 0}.dg tr{border-bottom:1px solid #ddd;padding:6px 0}}'+
'.dg textarea,.dg input{width:100%;font:16px Arial,sans-serif;padding:7px 8px;border:1px solid #999;border-radius:6px;box-sizing:border-box}.dg textarea{min-height:70px}'+
'.dg .go{margin:14px 0 4px;font:bold 16px Arial,sans-serif;padding:10px 16px;border:0;border-radius:8px;background:#E0313F;color:#fff;cursor:pointer}'+
'.dg pre{white-space:pre-wrap;font:13px/1.5 Arial,sans-serif;background:#f2f2f2;padding:8px;border-radius:6px;max-height:240px;overflow:auto}'+
'.dg .ok{color:#1d7a3a;font-weight:bold}';
var HIEU=['Chưa hiểu','Hiểu một phần','Hiểu rõ','Không học hôm nay'];
var THICH=['Cô giảng lý thuyết','Ví dụ minh họa','✋ Em thử (chấm ngay)','🗣 Nói to – cô hỏi em đáp','🎲 Quay số / trò chơi','Nghe máy đọc','Bài kiểm tra cuối'];
var Q=[
 ['all','1. Nhìn chung, buổi học hôm nay em thấy thế nào?','star'],
 ['parts','2. Em hiểu từng phần đến đâu?','parts'],
 ['speed','3. Tốc độ cô giảng',['Nhanh quá','Vừa','Hơi chậm']],
 ['ratio','4. Lý thuyết và luyện tập',['Lý thuyết nhiều quá, em muốn luyện thêm','Vừa đủ','Em muốn cô giảng kỹ hơn']],
 ['like','5. Hoạt động em thích nhất <small>(chọn nhiều)</small>',THICH,1],
 ['use','6. Sau buổi này, em tự tin dùng được ngoài đời (nói chuyện, đi chợ, đọc số…)?',['Chưa tự tin','Hơi tự tin','Khá tự tin','Rất tự tin']],
 ['hard','7. Chỗ em chưa hiểu / muốn cô giảng lại','text'],
 ['wish','8. Góp ý cho buổi sau (cách dạy, bài tập, tốc độ…)','text']
];
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function mount(el){
  if(!document.getElementById('dg-css')){var s=document.createElement('style');s.id='dg-css';s.textContent=CSS;document.head.appendChild(s);}
  var buoi=el.dataset.buoi||'buoi',title=el.dataset.title||'Buổi học',parts=(el.dataset.parts||'').split('|').filter(Boolean);
  var KEY='nari-dg-'+buoi,st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
  st.p=st.p||{};st.like=st.like||[];
  function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
  function chips(name,opts,multi){return '<div class="ch">'+opts.map(function(o,i){var on=multi?st[name].indexOf(i)>=0:st[name]===i;
    return '<button type="button" class="'+(on?'on':'')+'" data-q="'+name+'" data-v="'+i+'"'+(multi?' data-m="1"':'')+'>'+o+'</button>';}).join('')+'</div>';}
  function render(){
    var h='<h3>📝 Đánh giá buổi học</h3><p class="sub">'+esc(title)+' · Em trả lời thật lòng nhé, cô đọc để buổi sau dạy hợp với em hơn. Không cần ghi tên nếu em không muốn.</p>';
    Q.forEach(function(q){
      h+='<div class="qq">'+q[1]+'</div>';
      if(q[2]==='star')h+='<div class="ch stars">'+[1,2,3,4,5].map(function(n){return '<button type="button" class="'+(st.all===n?'on':'')+'" data-q="all" data-v="'+n+'">'+['😞','🙁','😐','🙂','😍'][n-1]+'</button>';}).join('')+'</div>';
      else if(q[2]==='parts'){if(!parts.length){h+='<p class="sub">(trang này chưa ghi các phần)</p>';return;}
        h+='<table>'+parts.map(function(p,i){return '<tr><td>'+esc(p)+'</td><td><div class="ch">'+HIEU.map(function(o,k){return '<button type="button" class="'+(st.p[i]===k?'on':'')+'" data-q="p" data-i="'+i+'" data-v="'+k+'">'+o+'</button>';}).join('')+'</div></td></tr>';}).join('')+'</table>';}
      else if(q[2]==='text')h+='<textarea data-t="'+q[0]+'" placeholder="Em viết ở đây…">'+esc(st[q[0]])+'</textarea>';
      else h+=chips(q[0],q[2],q[3]);
    });
    h+='<div class="qq">Tên em <small>(có thể để trống)</small></div><input data-t="name" value="'+esc(st.name)+'" placeholder="Tên hoặc để trống">';
    h+='<button type="button" class="go" data-dg-send="1">Gửi đánh giá cho cô…</button><div class="dg-out"></div>';
    el.innerHTML=h;el.classList.add('dg');
  }
  function text(){
    var L=['ĐÁNH GIÁ BUỔI HỌC · '+title,'Học viên: '+(st.name||'(ẩn danh)'),'Ngày: '+new Date().toLocaleDateString('vi-VN')];
    L.push('1. Nhìn chung: '+(st.all?st.all+'/5 '+['😞','🙁','😐','🙂','😍'][st.all-1]:'—'));
    if(parts.length){L.push('2. Mức hiểu:');parts.forEach(function(p,i){L.push('   • '+p+': '+(st.p[i]!=null?HIEU[st.p[i]]:'—'));});}
    function one(k){var q=Q.filter(function(q){return q[0]===k;})[0];return st[k]!=null?q[2][st[k]]:'—';}
    L.push('3. Tốc độ: '+one('speed'));L.push('4. Lý thuyết – luyện tập: '+one('ratio'));
    L.push('5. Thích nhất: '+(st.like.length?st.like.map(function(i){return THICH[i];}).join(', '):'—'));
    L.push('6. Tự tin dùng ngoài đời: '+one('use'));
    L.push('7. Chưa hiểu: '+(st.hard||'—'));L.push('8. Góp ý: '+(st.wish||'—'));
    return L.join('\n');
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.dataset.dgSend){var t=text(),o=el.querySelector('.dg-out');o.innerHTML='<pre>'+esc(t)+'</pre>';
      if(navigator.share)navigator.share({text:t}).catch(function(){});
      else if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){o.insertAdjacentHTML('afterbegin','<p class="ok">Đã chép. Em dán vào Zalo gửi cô nhé.</p>');},function(){o.insertAdjacentHTML('afterbegin','<p class="ok">Em chép đoạn dưới gửi cô qua Zalo nhé.</p>');});
      else o.insertAdjacentHTML('afterbegin','<p class="ok">Em chép đoạn dưới gửi cô qua Zalo nhé.</p>');
      return;}
    var q=b.dataset.q;if(!q)return;var v=+b.dataset.v;
    if(q==='p')st.p[b.dataset.i]=v;
    else if(b.dataset.m){var a=st[q],k=a.indexOf(v);if(k>=0)a.splice(k,1);else a.push(v);}
    else st[q]=(st[q]===v?null:v);
    save();var y=scrollY;render();scrollTo(0,y);
  });
  el.addEventListener('input',function(e){var t=e.target.dataset.t;if(t){st[t]=e.target.value;save();}});
  render();
}
function boot(){document.querySelectorAll('[data-buoi]#danhgia,.danhgia[data-buoi]').forEach(mount);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.NariDG={mount:mount};
})();
