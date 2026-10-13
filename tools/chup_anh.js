// Chụp các trang HTML (ảnh quảng cáo, bài Facebook) ra PNG cùng tên.
// node tools/chup_anh.js fb/ca-nhan/*.html
// Cỡ ảnh mặc định 1080×1350; trang khác cỡ ghi <meta name=size content="1640x924">.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch();
  for (const f of process.argv.slice(2)) {
    const m = fs.readFileSync(f, 'utf8').match(/name=size content="(\d+)x(\d+)"/);
    const [w, h] = m ? [+m[1], +m[2]] : [1080, 1350];
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + path.resolve(f), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: f.replace(/\.html$/, '.png') });
    await p.close();
    console.log('✓', f, w + '×' + h);
  }
  await b.close();
})();
