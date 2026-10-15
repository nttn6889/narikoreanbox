// Sinh biểu tượng app thi thử (thi-thu/icon/) từ logo mới logo/nari-topik-bieu-tuong.svg.
// node tools/logo/mkicons.js
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const mark = fs.readFileSync(path.join(ROOT, 'logo/nari-topik-bieu-tuong.svg'), 'utf8');
// [tên, cỡ, tỉ lệ hình so với khung] — maskable để hình trong vùng an toàn 80%
const OUT = [['favicon-64', 64, 0.96], ['apple-touch-icon', 180, 0.86], ['icon-192', 192, 0.9],
             ['icon-512', 512, 0.9], ['maskable-512', 512, 0.66]];
(async () => {
  const b = await chromium.launch();
  for (const [name, s, k] of OUT) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    const m = (s * k).toFixed(1), o = (s * (1 - k) / 2).toFixed(1);
    await p.setContent(`<body style="margin:0;background:#EFEAF8"><div style="position:absolute;left:${o}px;top:${o}px;width:${m}px;height:${m}px">${mark.replace('width="200" height="200"', 'width="100%" height="100%"')}</div></body>`);
    await p.screenshot({ path: path.join(ROOT, 'thi-thu/icon', name + '.png') });
    await p.close();
    console.log('✓', name, s);
  }
  await b.close();
})();
