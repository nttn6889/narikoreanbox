# Hàn Ngữ Nari — trang web cho học sinh

Site tĩnh, chạy bằng GitHub Pages từ nhánh `main` (push lên `main` là site tự cập nhật sau ~1 phút).
Repo để công khai vì Pages miễn phí yêu cầu vậy — tuyệt đối không đưa dữ liệu học sinh vào repo.

## Phòng thi thử (`thi-thu/`)
- Trang **quản lý** của cô vẫn nằm trên claude.ai: https://claude.ai/artifact/7EWoCB9sEomX2FHY8d1QY8
  (dùng cơ sở dữ liệu của artifact: ngân hàng đề, học viên, sổ điểm). Cô giao bài ở đó.
- `thi-thu/index.html` là bản **chỉ dành cho học sinh**, được sinh tự động — không sửa tay.
- Giao bài thi thử **không cần đồng bộ**: link `thi-thu/#d=<base64>.<sum>` chứa mã bài, mã đề (`e`) và phạm vi câu (`f`,`t`);
  đề trộn thì chứa danh sách câu gốc `q:[[đề, câu],…]` và trang học sinh tự ghép lại bằng `mixQs` (giống hệt trang quản lý).
  Nội dung đề lấy từ `thi-thu/de/<id>.json`. Link cũ `?bai=MÃ` (bài nhúng trong index.html) vẫn chạy.
- **Đồng bộ ngân hàng đề + kho từ** (khi cô nhập/sửa đề hoặc thêm từ — cô nhắn “đồng bộ đề”/“đồng bộ kho từ”):
  1. ArtifactData `list` với `out_dir` (không đọc nội dung vào hội thoại): `bank`, từng `bank/<id>/q`, `vocab` → một thư mục dump.
  2. `python3 tools/sync_kho.py <dump>` — ghi `thi-thu/de/*.json` (bỏ đáp án, giải thích; bỏ đề trộn), `thi-thu/vocab.json`,
     ảnh vào `thi-thu/img/`, và `<dump>/site_kho.json`.
  3. ArtifactData `set` collection `site`, doc `kho` từ `site_kho.json` (dấu từng câu/từng phần; trang quản lý so dấu này để
     báo “câu đã sửa sau lần đồng bộ”). Hàm dấu `qSig`/`vSecSig` trong trang phải khớp `qcanon`/`vcanon` trong script.
  4. Kiểm tra bằng Playwright, commit + push.
- Sửa giao diện/chức năng: sửa trong artifact gốc (Artifact `read` → sửa → `publish` với `url`), rồi
  `python3 tools/sync_thi_thu.py <file-html>` để sinh lại `thi-thu/index.html` (bỏ khối Admin và đoạn kết nối claude.ai).
- Tên đề trộn có thể chứa tên học sinh: chỉ được nằm trong link, không đưa vào repo (sync_kho bỏ đề trộn vì vậy).

## App trên điện thoại (PWA)
- `thi-thu/` cài được như app (“Thêm vào màn hình chính”): `manifest.webmanifest`, `sw.js` (lấy mạng trước, mất mạng dùng
  bản lưu), biểu tượng trong `thi-thu/icon/` (từ logo). `sync_thi_thu.py` tự chèn thẻ head + đoạn khởi động app (`add_app`).
- Mở app không kèm link → tự mở lại link lộ trình `#l=` gần nhất (localStorage `nari-app-route`).

## Lưu ý
- Repo không được chứa tên, điểm, nhận xét của học sinh.

## Về cô (`ve-co/`)
- Bản sao trang https://claude.ai/artifact/2XJHcdRJMNbKnDoMXqVZWQ, sửa trực tiếp ở đây (link "Trang chủ" trỏ về trang chủ site).

## Nhập đề thi vào ngân hàng đề
- Ngân hàng đề nằm trong cơ sở dữ liệu của trang quản lý (collection `bank`, câu hỏi ở `bank/<id>/q/<qid>`).
- Cô gửi file đề trong phiên Code → trích nội dung → ghi thẳng vào ngân hàng bằng ArtifactData (batch), hoặc
  xuất văn bản theo định dạng “Dán nhiều câu” của trang quản lý để cô tự dán.
- PDF có chữ (không phải bản scan) rẻ nhất: dùng `pdftotext` thay vì xem ảnh từng trang.

## Đề trộn (ôn câu sai) — trong trang quản lý
- Ngân hàng đề → "Tạo đề trộn", hoặc Sổ điểm → thẻ học sinh → "Tạo đề ôn câu sai".
- Đề trộn có id `M…` và `mix:true`; mỗi câu chép đủ nội dung + `src:{e,n,t}` (đề gốc, câu gốc).
- Thống kê câu sai quy bài làm đề trộn về câu gốc qua `src`, nên làm lại đúng sẽ gỡ câu khỏi danh sách.
- Kiểm thử trang quản lý: chạy bằng Playwright với `window.claude` giả (db trong bộ nhớ), không ghi vào dữ liệu thật.

## Từ vựng (tab "Từ vựng" trong trang quản lý)
- Collections: `vocab` (nhóm từ: sec, secOrder, ko, vi, order, words[{id,ko,vi}]), `vassigns` (bài đã giao: code, title,
  type match|kv|vk|type, items[{w,ko,vi}]), `vresults` (bài đã chấm, id `<code>_<sum>`).
- Bài từ vựng nằm ngay trong link học sinh: `thi-thu/#v=<base64>.<sum>` → giao bài **không cần đồng bộ**.
  Học sinh nộp → mã `NV1-…` gửi Zalo → cô dán vào tab Chấm bài (chấm chung với mã `NT2-…` của đề thi).
- Code phía học sinh (vocabBoot, vEntry, vRender…) nằm ngoài khối Admin nên `sync_thi_thu.py` giữ lại.
- **Lộ trình hàng ngày** (Từ vựng → “Lộ trình hàng ngày”): collection `vroutes` (code, title, secs[thứ tự phần], per, type,
  start YYYY-MM-DD, review). Link cố định `thi-thu/#l=<base64>.<sum>`; trang tự tính “ngày k” từ ngày bắt đầu, lấy từ trong
  `thi-thu/vocab.json` theo thứ tự phần → nhóm (order) → từ. Từ sai được nhớ trong localStorage máy học sinh và tự thêm vào
  bài sau (tối đa `review`). Mã nộp `NV1-` có thêm `k` (ngày, hoặc `R<ngày>` cho bài ôn) và `w` (id từ); trang quản lý chấm
  theo kho từ và lưu `items` vào `vresults` để “từ còn sai” vẫn đúng.
