// Trích phần từ vựng (thẻ "Từ vựng", mục 1 tới trước mục "Luyện từ vựng", kèm dữ liệu bài luyện từ vựng) của trang học liệu seoul/<bài>/
// thành đoạn HTML seoul/sau/<cuốn>-<bài>.html để trang seoul/ hiện dưới bảng từ của bài.
// Dùng: node tools/seoul_sau.js 3a-1   (cần Playwright; Chromium có sẵn ở /opt/pw-browsers)
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const slug = process.argv[2]; if (!/^\d[ab]-\d+$/i.test(slug || '')) { console.error('Dùng: node tools/seoul_sau.js 3a-1'); process.exit(1); }
  const root = path.resolve(__dirname, '..'), out = path.join(root, 'seoul/sau', slug.toUpperCase().replace(/^(\d[AB])-/, '$1-') + '.html');
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('file://' + path.join(root, 'seoul', slug, 'index.html') + '#b=tv');
  const html = await p.evaluate(() => {
    const sec = document.getElementById('stv'), kids = [...sec.children];
    const i0 = kids.findIndex(e => e.tagName === 'H3'), i1 = kids.findIndex(e => e.tagName === 'H3' && /Luyện/.test(e.textContent));
    // Bài luyện từ vựng (trắc nghiệm M.v1…v4, lựa chọn đầu là đáp án): tiêu đề h4 + dữ liệu JSON, trang seoul/ tự vẽ.
    const q = [...sec.querySelectorAll('h4')].map(h => { const set = h.nextElementSibling && h.nextElementSibling.dataset.set; return set && M[set] ? {t: h.textContent.replace(/^[\d.]+\s*/, ''), q: M[set]} : null; }).filter(Boolean);
    return kids.slice(i0, i1 < 0 ? undefined : i1).map(e => e.outerHTML).join('\n') +
      '\n<h3>7. Luyện từ vựng</h3>\n<script type="application/json" class="sau-q">' + JSON.stringify(q).replace(/</g, '\\u003c') + '</' + 'script>';
  });
  await b.close();
  fs.writeFileSync(out, '<!-- Sinh tự động từ seoul/' + slug + '/ bằng tools/seoul_sau.js — không sửa tay -->\n<meta name="robots" content="noindex">\n' + html + '\n');
  console.log('Đã ghi', path.relative(root, out), html.length, 'ký tự');
})();
