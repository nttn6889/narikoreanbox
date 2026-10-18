// Dấu mờ giữa ảnh: biểu tượng Nari TOPIK trong vòng tròn có chữ "Zalo cô Ngân 0399 214 554 · naritopik.com".
// Đặt đè lên nội dung (không bị thẻ trắng che) để ai cắt phần đầu/cuối ảnh vẫn còn tên + số điện thoại.
// Dùng: <script src="../../quang-cao/wm.js"></script> ở cuối trang. Cỡ/độ mờ: data-size, data-op trên thẻ script.
(() => {
  const me = document.currentScript, base = me.src.replace(/quang-cao\/wm\.js.*$/, '');
  const S = +(me.dataset.size || 560), op = me.dataset.op || '.13';
  const t = 'ZALO CÔ NGÂN 0399 214 554 · NARITOPIK.COM · NARI TOPIK · ';
  const d = document.createElement('div');
  d.style.cssText = `position:absolute;left:50%;top:52%;width:${S}px;height:${S}px;transform:translate(-50%,-50%) rotate(-12deg);opacity:${op};pointer-events:none;z-index:50`;
  d.innerHTML = `<svg viewBox="0 0 400 400" width="${S}" height="${S}">
<defs><path id="wmc" d="M200,200 m-158,0 a158,158 0 1,1 316,0 a158,158 0 1,1 -316,0"/></defs>
<circle cx="200" cy="200" r="194" fill="none" stroke="#53468F" stroke-width="6"/>
<circle cx="200" cy="200" r="128" fill="none" stroke="#53468F" stroke-width="3"/>
<text font-family="Be Vietnam Pro" font-size="27" font-weight="800" fill="#53468F" letter-spacing="1.2"><textPath href="#wmc" textLength="985" lengthAdjust="spacing">${t}</textPath></text>
<image href="${base}logo/nari-topik-bieu-tuong.svg" x="112" y="88" width="176" height="176"/>
<text x="200" y="306" text-anchor="middle" font-family="Be Vietnam Pro" font-size="30" font-weight="900" fill="#53468F">0399 214 554</text>
</svg>`;
  document.body.appendChild(d);
})();
