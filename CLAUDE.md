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
  bản lưu), biểu tượng trong `thi-thu/icon/` (từ logo). `sync_thi_thu.py` tự chèn thẻ head + `tools/app_shell.js`
  (thay dòng khởi động trang; code này chỉ có ở site, không có trong trang quản lý — sửa thẳng trong `tools/app_shell.js`,
  rồi `python3 tools/sync_thi_thu.py --app-only` để chèn lại vào `thi-thu/index.html` hiện có).
- Trang đầu có “Bài của em” (mọi link `#d=`/`#v=`/`#l=`/`#n=` đã mở, localStorage `nari-app-saved`) và ô “Dán link bài cô gửi”;
  trong bài có nút “⌂ Trang đầu”, nút Quay lại cũng về được → giao bài mới không phải cài lại app.

## Bài hôm nay trong app (mã lớp + mã học sinh)
- Trang quản lý: Lớp học → lớp → thẻ “App học sinh”: “Tin nhắn vào app cho từng em” tạo mã (`classes/<id>.app`,
  `students/<id>.app`, 6 ký tự ngẫu nhiên) và tin nhắn có link `thi-thu/#a=<base64>.<sum>` ({l, h, n}) để máy học sinh nhớ mã + tên.
  “Tạo bài 7 ngày tới” tạo bài hằng ngày (giống “Tạo bài hôm nay”, lấy lựa chọn sẵn). Bài riêng: Học viên → nút “App” → tick bài
  (ghi `app:[id học viên]` vào `assigns`/`vassigns`/`nassigns`).
- **Đăng bài** (cô nhắn “đăng bài”): ArtifactData `list` với `out_dir` các collection `classes`, `students`, `cdays`, `assigns`,
  `vassigns`, `nassigns` → `python3 tools/sync_app.py <dump>` → ghi `thi-thu/app/<mã>.json` (chỉ mã, tên bài, nội dung link;
  không tên học sinh/tên lớp; bài riêng và đề trộn đặt lại tên chung) → ArtifactData `set` `site/app` từ `<dump>/site_app.json`
  (trang quản lý hiện “đã lên app”) → kiểm tra Playwright, commit + push.
- App (`tools/app_shell.js`): hồ sơ `nari-app-me` {l, h, n}; trang đầu “Bài hôm nay”, “Bài những ngày trước em chưa nộp” (7 ngày),
  “Bài riêng cô giao”. Đã nộp = localStorage `nari-v-|nari-n-|nari-tt-<mã bài>-<tên>` có `submitted`. Học sinh vẫn gửi mã nộp qua
  Zalo (có nút “Gửi qua Zalo…” dùng bảng chia sẻ của máy).

## Lưu ý
- Repo không được chứa tên, điểm, nhận xét của học sinh.

## Về cô (`ve-co/`)
- Bản sao trang https://claude.ai/artifact/2XJHcdRJMNbKnDoMXqVZWQ, sửa trực tiếp ở đây (link "Trang chủ" trỏ về trang chủ site).

## Học cùng cô (`hoc-cung-co/`) — trang giới thiệu gửi học sinh mới khi tư vấn
- Sửa trực tiếp `hoc-cung-co/index.html`. Ảnh trong `img/` là ảnh chụp màn hình thật (Playwright, khung 390px, tên “Học viên”).
- 3 nút “Làm thử” là link bài thật: đề `Ehot1` câu 1–8 (mã `MDVV8`), 20 từ câu 7–8 dạng nối từ (mã `NM4F7`),
  nghe `N001` (mã `67BRN`). Muốn cô chấm được mã nộp thì 3 mã này phải có trong `assigns`/`vassigns`/`nassigns` của trang quản lý.

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

## Luyện nghe (tab "Luyện nghe" trong trang quản lý)
- Mỗi bài nghe là `thi-thu/nghe/<id>.json` (id `N001`, `N002`…) + file nghe `thi-thu/nghe/audio/<id>-<câu>.mp3`.
  Cùng nội dung đó ghi vào collection `nlessons/<id>` (ArtifactData `set` với `file_path`) để trang quản lý liệt kê và chấm.
- Định dạng: `items[{n, audio, script[{s: người nói, ko, vi, end?}], qs[{q, o[4], a}], next{q, o[2], a}}]`.
  `qs` = Phần 1 (câu hỏi tiếng Việt, 4 lựa chọn), `next` = Phần 2 (câu nói tiếp theo), từ trong `[ ]` của `script` = Phần 3
  (điền từ, nhiều đáp án ngăn bằng `/`); dòng `end:true` là câu đáp đúng, chỉ hiện sau khi nộp. `a` là chỉ số đáp án gốc (trang tự đảo thứ tự).
- Cô gửi mp3 + đề → nén: `ffmpeg -i in.mp3 -ac 1 -ar 24000 -b:a 40k thi-thu/nghe/audio/<id>-<n>.mp3`, soạn json, ghi `nlessons`, commit + push.
- Giao bài trong trang quản lý (`nassigns`), link `thi-thu/#n=<base64>.<sum>` ({c, t, l}). Học sinh nộp mã `NN1-…`, cô dán vào
  tab Chấm bài; kết quả ở `nresults`. Hàm chấm `nSlots`/`nScore` dùng chung cho cả hai trang (code học sinh nằm ngoài khối Admin).
