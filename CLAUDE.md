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
- Trang đầu có “Bài của em” (mọi link `#d=`/`#v=`/`#l=`/`#n=`/`#w=` đã mở, localStorage `nari-app-saved`) và ô “Dán link bài cô gửi”;
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

## Đánh giá năng lực (tab "Đánh giá" trong trang quản lý)
- Gom đề thi (`results`), từ vựng (`vresults`), nghe (`nresults`) theo từng học sinh. Số liệu tính lại trong trình duyệt,
  không lưu thêm gì. Chỉ lưu nhận xét (`notes/<id>.text`, dùng chung với Sổ điểm) và việc cần làm (`nlnotes/<id>.next`).
- Đọc theo dạng câu TOPIK II (bảng `NL_RT`, theo số câu; đề trộn quy về câu gốc qua `src`), nghe theo phần và theo bài,
  từ vựng theo dạng bài và từ còn sai, chuyên cần 28 ngày, biểu đồ theo tuần, ước lượng điểm Đọc (chỉ cô thấy).
- Bản gửi học sinh: link `thi-thu/#r=<base64>.<sum>` chứa sẵn số liệu (không cần đồng bộ), mở bằng `reportBoot`.
- **Toàn bộ code nằm trong `tools/nangluc.js`** (trên dấu `/* ==ADMIN==` là phần chung, dưới là phần trong khối Admin).
  Sửa ở đó rồi:
  - chỉ sửa bản học sinh thấy: `python3 tools/nangluc.py --site` → commit (không cần tải trang quản lý);
  - có sửa phần của cô: Artifact `read` trang quản lý (bỏ lớp vỏ `<!doctype…><body>` ngoài cùng của file tải về),
    `python3 tools/nangluc.py <file>` (thay đoạn giữa dấu `==NL==`/`==NLA==`, tự móc tab), `publish` với `url`,
    rồi `python3 tools/sync_thi_thu.py <file>`.

## Lưu ý
- Repo không được chứa tên, điểm, nhận xét của học sinh.

## Về cô (`ve-co/`)
- Bản sao trang https://claude.ai/artifact/2XJHcdRJMNbKnDoMXqVZWQ, sửa trực tiếp ở đây (link "Trang chủ" trỏ về trang chủ site).

## Học cùng cô (`hoc-cung-co/`) — trang giới thiệu gửi học sinh mới khi tư vấn
- Sửa trực tiếp `hoc-cung-co/index.html`. Ảnh trong `img/` là ảnh chụp màn hình thật (Playwright, khung 390px, tên “Học viên”).
- 3 nút “Làm thử” là link bài thật: đề `Ehot1` câu 1–8 (mã `MDVV8`), 20 từ câu 7–8 dạng nối từ (mã `NM4F7`),
  nghe `N001` (mã `67BRN`). Muốn cô chấm được mã nộp thì 3 mã này phải có trong `assigns`/`vassigns`/`nassigns` của trang quản lý.

## Ngân hàng đề: 3 thẻ Đề đọc · Đề nghe · Đề viết (trong trang quản lý)
- `renderBank` chia thẻ con (`S.bsub`): Đọc = `renderBankDoc` (bank trắc nghiệm, đề trộn); Nghe = `renderBankNghe` (đề `bank` có `nghe` +
  bài luyện nghe `nlessons`); Viết = `renderBankViet`.
- **Đề viết** ở collection riêng `wbank/<id>` (id `W52_035` = câu 52 kỳ 35): `{type:51..54, src, round, passage (chỗ trống "( ㉠ )", "( ㉡ )"),
  keys:{a:[cách viết…], b:[…]}, pat:{a, b} (mẫu ngữ pháp, nhiều mẫu ngăn bằng dấu phẩy), note}`. Câu 53/54 chỉ dùng `keys.a` (bài mẫu).
  Không nằm trong `bank` nên không vào đồng bộ đề, thống kê, đề trộn, bài hằng ngày. Thẻ Viết có bảng “Mẫu ngữ pháp trong đáp án” đếm theo `pat`.
- Đã nhập câu 52 của 14 kỳ (35, 36, 37, 41, 47, 52, 60, 64, 83, 91, 92, 93, 94, 95), mỗi ô có 3 gợi ý (`hint:{a:[…3], b:[…3]}`):
  bậc 1 đọc tín hiệu (từ nối, vị trí ô), bậc 2 mẫu ngữ pháp, bậc 3 từ khóa. `«chữ»` trong gợi ý = tô vàng chữ đó trong đoạn văn (phải có đúng trong `passage`).
- Câu 51 đã nhập 36 kỳ (70, 72–106; `W51_070`…`W51_106`), cùng định dạng gợi ý 3 bậc. `W51_099` ㉡ ghi chú: file đáp án tham khảo ghi “참석하신”, đã sửa thành “참석하지 못한”.
- **Luyện viết** (thẻ Đề viết → tick câu → “Giao bài viết”): `wassigns/<code>` {code, title, items:[id wbank]}, link `thi-thu/#w=<base64>.<sum>`
  chứa sẵn đoạn văn + gợi ý + đáp án mẫu (không cần đồng bộ; sửa câu sau khi giao thì link cũ giữ bản cũ, “Tin nhắn” tạo link mới).
  Trang học sinh (`writeBoot`, code giữa dấu `==W==`, ngoài khối Admin): gợi ý mở dần, **không trừ điểm**; nộp xong **hiện đáp án mẫu ngay**;
  mã nộp `NW1-{c, n, a:[[㉠,㉡]…], h:[[số gợi ý]…], t, d}`. Chấm bài: dán mã → `wresults/<code>_<sum>` (ans/hints lưu dạng `[{v:[…]}]`
  vì db không nhận mảng lồng), cô chấm tay từng ô 0–5 + nhận xét (`wGradeModal`); danh sách ở cuối thẻ Đề viết. Chưa đưa vào Sổ điểm/Đánh giá.
- **Câu 53/54 + bảng sửa bài** (đề công khai kỳ 96, 102 đã nhập đủ 51–54: `W51_096`…`W54_102`): `wbank` thêm `img` (link ảnh biểu đồ
  `thi-thu/viet/W53_<kỳ>.jpg`), `blocks:[{k: tên ý, ko: câu bài mẫu}]` (bài mẫu chia ý), `nums` (số liệu phải có), `dang` (dạng trong trang khung câu 53).
  Giao bài có 2 tùy chọn (`wassigns.key` hiện đáp án ngay khi nộp — mặc định tắt, link khi đó không chứa đáp án, cờ `nk:1`; `wassigns.hint`).
  Ô viết 53/54 đếm chữ (tính dấu cách, không tính xuống dòng). Chấm: 3 tiêu chí (53: 7/7/16, 54: 12/12/26, `W_RUB`) + từng câu học sinh (`wSents`)
  gắn vào ý bài mẫu (máy đoán theo cặp chữ), cô gõ câu sửa + nhãn lỗi (`W_TAGS`) → `wresults.ev:[{i, rc, ro, rl, o, x:[{b,s,f,e}]}]`.
  “Lưu & gửi kết quả” / “Gửi kết quả” tạo link `thi-thu/#s=<base64>.<sum>` (`wsBoot`, bài làm + phần sửa nằm trong link, so chữ `<del>/<ins>`);
  đề + ảnh + bài mẫu chia ý trang lấy từ `thi-thu/viet/<id>.json`. Link `#s=` được nén (`#s=Z…`: deflate-raw + base64, `zPack` dùng CompressionStream ở
  trang quản lý, `zUnpack`/`zInflate` viết tay ở trang học sinh) → ngắn còn ~1/3 cho Zalo khỏi cắt; link cũ không có `Z` vẫn mở được. **Đồng bộ đề viết** (sau khi thêm/sửa câu viết — cô nhắn “đồng bộ đề viết”):
  ArtifactData `list` `wbank` với `out_dir` → `python3 tools/sync_viet.py <dump>` → commit + push.
- **So với bài mẫu tại chỗ, không gọi Claude** (không tốn token; cô không muốn bước gửi Claude chấm): `wCmp(câu em, câu mẫu)` so từng chữ
  (bỏ qua dấu cách, LCS) → chữ khác bài mẫu tô vàng gạch sóng (`mark.wdm`), chữ bài mẫu có mà học sinh thiếu tô xanh (`mark.wdk`), kèm % giống.
  53/54: tách câu bằng `wSents` (cắt ở `.!?` cả khi học sinh quên dấu cách sau dấu chấm, trừ `2.5`, `...`, ngoặc đóng); máy tách sai thì cô bấm
  “✂ Sửa cách tách câu” (mỗi dòng một câu, “Máy tách lại”; câu không đổi giữ phần chấm, câu bị tách/gộp chuyển nhận xét + nhãn lỗi sang câu đầu; `ev.sp:1` = cô đã tự tách);
  mỗi câu học sinh tự gắn vào ý bài mẫu (`wGuessBlock`), trang chấm hiện câu đã tô + câu mẫu tương ứng + “thiếu ý: …”; 51/52 so với
  cách viết mẫu gần nhất (`wBest`). Sửa câu, nhãn lỗi, nhận xét từng câu (`x.n`) / từng ô (`ev:[{i, nt:[㉠,㉡]}]`), tiến bộ (`tb`) là tùy cô.
- Bảng sửa bài `#s=` (gửi học sinh) = bảng đối chiếu từng câu **# ý | Bài mẫu | Em viết | Nhận xét** (tô màu theo `wCmp`; cột Nhận xét chỉ hiện khi cô có ghi;
  câu cô sửa hiện thêm dòng “Cô sửa” so chữ `<del>/<ins>`; điện thoại: mỗi câu một thẻ), ý học sinh bỏ sót tô đỏ, thêm “Tiến bộ so với bài lần trước”. Nhận xét viết được `**đậm**`, `` `chữ Hàn` ``. Ảnh biểu đồ không tải được thì hiện `data`
  (số liệu dạng chữ; link giao bài 53/54 kèm `dt`, `thi-thu/viet/<id>.json` kèm `data`).
- Ảnh biểu đồ `img` trỏ tới GitHub Pages → chỉ hiện khi nhánh có ảnh đã vào `main`.

## Nhập đề thi vào ngân hàng đề
- Đề nghe công khai TOPIK II kỳ 96, 102: `Etk096n`, `Etk102n` (`nghe:1`, câu 1–3 là ảnh tranh/biểu đồ, lựa chọn “Tranh ①…”; chưa có kịch bản/file nghe — cô gửi sau).
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

## Từ vựng học trước bài (`tu-vung/`)
- Trang bảng từ đơn giản (2 cột Từ vựng | Nghĩa, như sách), đọc thẳng `thi-thu/vocab.json` → kho từ đồng bộ xong là trang tự cập nhật.
- Mỗi câu là một thẻ (thanh chọn câu dính ở đầu trang; in ra thì in tất cả). Lọc theo câu bằng `#c=`: `tu-vung/#c=1-12`, `tu-vung/#c=11`, `tu-vung/#c=5,7,9` (không có `#c=` thì hiện tất cả). Số câu lấy từ tên phần (`Câu 11–12 · …` → 11).
- Ngữ pháp câu 1–4 cũng nằm trong kho từ (nguồn: https://claude.ai/artifact/UJJE6sP6ByFEpg7n2JNdRz): phần `Câu 1–2 · 문법`
  (secOrder -2, 13 nhóm `V01_00`…`V01_12`, 67 mẫu, xếp theo cụm của trang `ngu-phap-12/`: thời gian, lựa chọn, mục đích, điều kiện, nhượng bộ,
  lý do, quan sát, 3 nhóm đuôi câu, tiểu từ; 18 mẫu cũ giữ id `w01_*` (mẫu ít gặp ở 2 nhóm cuối “심화”), mẫu mới id `w01n_<nhóm>_<i>`, câu ví dụ lấy từ đề) và `Câu 3–4 · 유사 문법` (secOrder -1, `V03_00`…`V03_42`
  = 43 nhóm đồng nghĩa, 111 mẫu). Mỗi mẫu có thêm `ex` (câu ví dụ, `__x__` = gạch chân); `sync_kho.py` đưa `ex` thành phần tử
  thứ 4 của `w` trong `vocab.json`, trang `tu-vung/` hiện thành cột "Ví dụ". Sửa nhóm trong trang quản lý sẽ mất `ex` (form chỉ có ko = vi).
- Thẻ Câu 1–2 có nút “Luyện tập” trỏ sang `ngu-phap-12/`, thẻ Câu 3–4 trỏ sang `ngu-phap-34/` (biến `PRACTICE` trong trang). Trang bài tập ngữ pháp của cô
  https://claude.ai/artifact/1mkNvmWjkjFwgxHinJfiXk (link ở Bảng tra của `ngu-phap-34/`; 80 câu dạng A điền / B tương đồng, chưa đưa vào ngân hàng đề —
  ngân hàng đề cô để dành cho đề gốc). Trang đó còn 4 câu sai đáp án so với sách 3급 목표 (열리는데 ②, 나오느라고 ④, 아프거나 ④, 맡게 됐다 ①).
- Kho từ câu 11–12: phần `Câu 11–12 · 기사 주제` (nhóm `V11_00`…`V11_07`, secOrder 6); câu 51 đã lùi xuống secOrder 7.
- Kho từ từ sách “Giáo trình từ vựng TOPIK II (토픽Ⅱ 합격 레시피)” (1.157 mục, nghĩa tiếng Việt tự soạn): thêm nhóm `V09_10`…`V09_13`
  vào Câu 9 và các phần mới (secOrder): Câu 10 · 그래프 (6, kèm mẫu câu nghe 3), Câu 11–12 (7), Câu 19–20 · 접속 부사 (8),
  Câu 21–22 · 관용 표현 (9, 187 câu), Câu 23–24 · 감정 표현 (10), Câu 25–27 · 신문 기사 제목 (11), Câu 42–43 · 소설 감정 표현 (12),
  Câu 44–45 · 사회 이슈 어휘 (13), Câu 51 (14), Câu 53 · 그래프 쓰기 (15), Câu 54 · 속담 (16, 121 câu);
  phần nghe `Nghe 4–12 · 장소별 대화` (20), `Nghe 15 · 뉴스` (21), `Nghe 31–32 · 찬반 표현` (22), nhóm `VN04_…`, `VN15_…`, `VN31_…`.
- Từ danh sách “Từ vựng chọn lọc TOPIK II” (EBS, https://claude.ai/artifact/6NAJ7UnAGUQ6xWkbnhfbdi) đã gộp phần 4–7, bỏ trùng:
  quán ngữ → `V21_07`…`V21_12`, tượng thanh/tượng hình → `V42_03`…`V42_09` (Câu 42–43), tục ngữ → `V54_06`…`V54_08`,
  12 địa điểm → `VN04_12`…`VN04_26` (Nghe 4–12). Phần 1–3 (đồng nghĩa/đa nghĩa/trái nghĩa) và phần 8 (55 chủ đề) chưa đưa vào;
  cô định làm thẻ “Chủ đề” cùng với 10 chủ đề lớn × 12 chủ điểm ở https://claude.ai/artifact/ExdBDgYYhxrysxqHEDB27S.
- Trang `tu-vung/` lọc phần nghe bằng `#c=n4`, `#c=n15`, `#c=n4-31` (phần “Nghe …” có số câu +100 để không lẫn với câu đọc).
- Trang `tu-vung/` luôn có 3 thẻ Đọc (câu 1–50) / Nghe (phần `Nghe …`, nút ghi “Câu 4–12”) / Viết (câu ≥ 51); `#k=nghe`, `#k=viet` mở thẻ.
  `#c=` chỉ lọc trong thẻ có câu khớp (vd. `#c=1-12` lọc thẻ Đọc, thẻ Nghe/Viết vẫn hiện đủ) và thêm nút “Xem tất cả ›” để bỏ lọc.

## Thống kê đề → trang `tu-vung/` (thẻ ⭐ Ưu tiên, Chủ đề, dòng “Hay ra”, dấu ★)
- `python3 tools/thong_ke_de.py <dump>` (cần `pip install kiwipiepy`; `<dump>` = ArtifactData `list` collection `topics` với `out_dir`)
  đọc 20 đề **đọc** đủ 50 câu trong `thi-thu/de/*.json` (bỏ đề nghe, kịch bản nghe, đề câu 1–4, Ehot1old; bỏ dòng hướng dẫn), tách từ về dạng gốc rồi ghi `tu-vung/de.json`: `uu` = từ gặp trong ≥3 đề có nghĩa
  (kho từ, `tu-vung/chu-de.json`, `tools/nghia_de.tsv` hoặc `tools/cot_loi.tsv`; thẻ ⭐ của trang giờ hiện Từ cốt lõi nên `uu` không còn hiện), `kho`/`cdk` = số đề của từng mục kho / từ chủ đề (dấu ★),
  `cd` = từ khóa theo chủ đề, `hay` = dòng “Hay ra” (viết tay trong script, biến `HAY`).
  Script in ra từ chưa có nghĩa → bổ sung `tools/nghia_de.tsv` (từ sơ cấp thì bỏ qua). Chạy lại sau mỗi lần “đồng bộ đề”.
- **Chủ đề từng đoạn văn** nằm trong db trang quản lý, collection `topics/<id đề>` = `{units:[{n:[câu…], c: chủ đề lớn, s: số mục EBS 1–55}]}`
  (c ∈ MT KH KT YT VH XH PL GD KHAC=Lịch sử VHOC DS). Không để trong repo (chỉ cô xem). Khi đồng bộ đề mới: đọc đoạn văn câu 10–50,
  gắn chủ đề rồi ArtifactData `set` `topics/<id>`, sau đó chạy lại thống kê. Đề trộn (`mix`) và đề < 10 câu thì không gắn.
- Tab **“Phân tích đề”** trong trang quản lý (`renderPhanTich`, hằng `PT_BIG`/`PT_SUB`/`PT_GROUPS`): bảng số câu theo chủ đề, chủ đề hay ra theo
  dạng câu, lọc câu theo chủ đề/dạng câu/đề, sửa chủ đề từng đoạn, chọn câu → tạo đề trộn (dùng `buildMixDocs`/`sortMix` như “Tạo đề trộn”).
- **Thẻ “Từ cốt lõi”** (tab Phân tích đề → nút Chủ đề | Từ cốt lõi; code `renderCore`/`cwLoad`/`cwSave` trong khối Admin, chỉ cô thấy):
  từ gốc gặp trong ≥ 3 trên 20 đề **đọc** đủ 50 câu (bỏ đề nghe/kịch bản nghe, đề câu 1–4, Ehot1old), lọc theo số đề, dạng câu,
  chủ đề (chỉ từ có ≥ 30% số lần nằm trong chủ đề đó), loại từ, ẩn từ sơ cấp; xem câu trong đề có tô từ; cô xếp từ vào Tuần 1–6 hoặc Bỏ qua.
  Dữ liệu: `python3 tools/tu_cot_loi.py <dump>` (dump có `topics/`) → `<dump>/core/meta.json`, `d0…dN.json` → ArtifactData batch `set`
  collection `core` (≤ 1 MiB mỗi batch nên chia 2 lần). Lựa chọn của cô ở `core/marks` {m:{từ:{t, vi}}} — không ghi đè khi cập nhật.
  Nghĩa + cấp (1 sơ cấp / 0 / x = mảnh tách từ, ẩn) bổ sung trong `tools/cot_loi.tsv` (ưu tiên hơn kho từ); không có cấp thì từ có trong
  Seoul 1A–2B = sơ cấp. Cô nhắn “cập nhật từ cốt lõi” sau mỗi lần đồng bộ đề.
- **Từ cốt lõi trong kho từ → Lộ trình hàng ngày**: `python3 tools/cot_loi_kho.py <dump>` (dump có `core/d*.json`, tùy chọn `core/marks.json`)
  → `<dump>/vocab_cot/VC<tầng>_<nhóm>.json` → ArtifactData batch `set` collection `vocab` → đồng bộ kho từ `--vocab-only`.
  4 phần `Cốt lõi · Tầng 1…4` (secOrder 30–33; ≥15, 10–14, 7–9, 5–6 đề), bỏ từ sơ cấp / chưa có nghĩa / cô “Bỏ qua”, nhóm 20 từ,
  câu ví dụ lấy từ câu trong đề (bỏ câu có chỗ trống “( )”). Id từ `cl0001…` cố định theo từ gốc trong `tools/cot_loi_id.tsv`.
  Trang `tu-vung/` hiện các phần `Cốt lõi …` ở thẻ “⭐ Cốt lõi” (`#k=uu`, thay danh sách Ưu tiên cũ từ `de.json`; mỗi tầng một thẻ con,
  bảng Từ | Nghĩa | Câu trong đề), không lẫn vào thẻ Đọc. Cô giao bằng Từ vựng → Lộ trình hàng ngày (chọn các tầng, dạng “Điền từ vào câu”, ôn ngắt quãng).
  Lộ trình đang dùng: `vroutes/CL30K` “Từ vựng cốt lõi TOPIK II – 30 ngày” (Tầng 1–4, 33 từ/ngày, trắc nghiệm Hàn → Việt, ôn tối đa 20,
  ôn ngắt quãng, bắt đầu 2026-10-09). Form tạo lộ trình chọn phần theo nhóm thu gọn (`rtPickHTML`/`rtPickWire`), tới 40 từ/ngày.
- Các nhóm `VCD…` (phần `Chủ đề · …`, 180 nhóm) có trong collection `vocab` nhưng **chưa đưa lên site** — khi đồng bộ kho từ thì
  bỏ các tệp `VCD*.json` khỏi dump cho tới khi cô muốn đưa (nếu đưa, trang `tu-vung/` sẽ hiện thêm phần mới).
- `tu-vung/chu-de.json`: 55 mục từ vựng chủ đề EBS (phần 8 của https://claude.ai/artifact/6NAJ7UnAGUQ6xWkbnhfbdi, đã chia Danh/Động/Tính/Biểu hiện)
  xếp vào 10 chủ đề lớn + “Đời sống hằng ngày” (`DS`: gia đình, gọi món, chào hỏi, vị trí… — ít gặp ở bài đọc) (`topics[].m` = số mục;
  “Khác” = `KHAC` chỉ còn Lịch sử). Thẻ “Chủ đề” = từ khóa gặp trong đề + các mục EBS của chủ đề đó.

## Từ vựng giáo trình Seoul (`seoul/`) — lớp trung cấp 3 (Seoul 3A/3B) + ôn nền tảng 1A–2B
- Nguồn soạn tay: `tools/seoul/<cuốn>.tsv` (`# bài | tên Hàn | tên Việt`, `## nhóm Việt | nhóm Hàn`, dòng từ
  `ko<TAB>nghĩa<TAB>Hán Việt<TAB>câu ví dụ có __từ đã chia__`). Theo file cô gửi lần 2 (“từ vựng chính thức phần 번역 từng bài”,
  52 bài; tên bài 3A sửa theo mục lục sách, từ vựng 3A bài 3–8 và 2B bài 11–18 đối chiếu lại từ ảnh trang 번역 của sách): giữ đúng danh sách từng bài kể cả từ lặp lại giữa các bài; mục “A / B” tách thành
  từng từ, “(을) 하다” viết đầy đủ; nghĩa theo file cô (sửa lỗi gõ); Hán Việt + câu ví dụ do Claude soạn. 4A/4B chưa nhập.
  Cô sẽ gửi bảng 어휘 색인 cuối sách để bổ sung. Id từ theo vị trí (bài, nhóm, thứ tự) — sửa danh sách sau khi đã giao bài thì
  kiểm tra `vassigns`/`vroutes` có dùng từ Seoul không trước khi ghi đè.
- `python3 tools/seoul_kho.py <thư mục>` → `<thư mục>/vocab/S<cuốn><bài>_<nhóm>.json` (id cố định, từ `s3a01_1_0`…) +
  `seoul/bai.json` (tên bài tiếng Việt). Ghi vào db bằng ArtifactData batch `set` collection `vocab` (file_path), rồi đồng bộ kho từ.
  Phần: `Seoul 3A · Bài 1 · <tên bài>`, secOrder 100 + 20×(cấp−1) + số bài. Từ có thêm `hv` (Hán Việt) và `ex` (câu ví dụ).
- `vocab.json`: `w = [id, ko, vi, ex|"", hv]`. Trang `tu-vung/` bỏ các phần `Seoul …`; `thong_ke_de.py` chỉ lấy dấu ★ cho từ Seoul
  (không lấy nghĩa vào thẻ Ưu tiên).
- Trang `seoul/`: thẻ 1A…3B + “★ Cốt lõi” (từ 1A–2B gặp trong ≥ 3 đề TOPIK II). Link `seoul/#b=3A&c=5` (bài 5), `#c=1-3`, `#b=cot`.
- Chỉ đồng bộ kho từ (đề không đổi): ArtifactData `list` collection `vocab` với out_dir → `python3 tools/sync_kho.py --vocab-only <dump>`
  → ArtifactData `update` `site/kho` từ `<dump>/site_kho_v.json` (chỉ trường `v`, giữ dấu đề `e`).
- Dạng bài từ vựng `cau` (“Điền từ vào câu (chia đuôi)”): mục link `[ko, vi, ex]`, học sinh gõ phần `__…__` của câu ví dụ;
  từ không có câu thì làm như “Gõ từ”. Trang quản lý lấy câu theo id từ trong kho (`vExOf`) khi tạo link và khi chấm;
  `sync_app.py` lấy câu từ `thi-thu/vocab.json`. Sửa nhóm trong trang quản lý giữ nguyên `ex`/`hv` của từ không đổi.
- Lộ trình hàng ngày có “Cách ôn”: ôn ngắt quãng (`vroutes.srs`, link `q:1`) — localStorage `mem.srs[id] = {b, due}`:
  sai → ôn ngày hôm sau, đúng → hỏi lại sau 3, 7, 14 ngày, đúng ở lần 14 ngày → `mem.ok` (đã thuộc). Bài ngày k = từ mới + từ đến hạn
  (tối đa `review`). Chưa làm: nghe chép từ file nghe gốc của sách (cô chưa có file).

## Kiểm tra nền tảng Seoul (`seoul/kiem-tra/`)
- Bài chẩn đoán cho học sinh học tiếp 3A: 53 câu (A từ vựng 12 · B chia đuôi gõ 10 · C tiểu từ 6 · D ngữ pháp theo bài 1B–2B 17 ·
  E đọc 4 · F thử trước 3A 4) + tự đánh giá. Mỗi câu chọn “Chắc chắn/Đoán”, có nút “Em chưa học”. Đề nằm trong mảng `Q` của trang
  (lựa chọn đầu là đáp án, mỗi lựa chọn sai kèm ghi chú lỗi; `need` = bài 3A dùng lại). Bài làm lưu localStorage `nari-kt-seoul`.
- Nộp xong học sinh bấm “Gửi kết quả cho cô” → link `seoul/kiem-tra/#r=<base64>` (tên + đáp án, chỉ nằm trong link) mở bản báo cáo
  cho cô. Đổi thứ tự/đáp án câu cũ sẽ làm sai link đã gửi — thêm câu mới thì dùng id mới.

## Học câu 52 trong 3 buổi (`viet-52/`)
- Trang học liệu gửi học sinh: Buổi 1 (ô cuối câu, 5 nhóm từ nối: 47, 41, 52, 92, 96, 36, 37), Buổi 2 (ô giữa câu: 60, 83, 91, 64, 35),
  Buổi 3 (làm như thi, 6 phút/câu, không gợi ý: 93, 94, 95, 102), thẻ Bảng tra (9 nhóm tín hiệu → mẫu). Link `viet-52/#b=1|2|3|tra`.
- Mỗi buổi có trắc nghiệm nhận diện (mảng `MCQ`, câu tự soạn, lựa chọn đầu là đáp án) và đề thật: đề + đáp án + `pat` + gợi ý 3 bậc
  nhúng sẵn trong biến `Q` (lấy từ `wbank` lúc soạn trang; sửa gợi ý trong trang quản lý thì phải chép lại vào đây).
- Học sinh tự chấm 0–5 mỗi ô (trùng đáp án mẫu tự cho 5), bài lưu localStorage `nari-52`, nút “Gửi kết quả cho cô…” chia sẻ đoạn chữ qua Zalo.

## Học câu 51 trong 3 buổi (`viet-51/`)
- Cùng khung với `viet-52/` (code trang chép từ đó): Buổi 1 (ô cuối câu và câu hỏi “?”, 13 kỳ: 70, 72, 73, 74, 78, 79, 80, 82, 87, 91, 94, 95, 103),
  Buổi 2 (ô giữa câu, 13 kỳ: 75, 76, 77, 81, 83–86, 88–90, 92, 93), Buổi 3 (làm như thi, 4 phút/câu: 96–102, 104–106), thẻ Bảng tra (12 nhóm, thống kê 72 ô). Link `viet-51/#b=1|2|3|tra`.
- Đề + gợi ý nhúng trong biến `Q` (lấy từ `wbank` W51_*; sửa trong trang quản lý thì chép lại). Cảnh báo đuôi: ô cuối câu viết -다 / -요, ô giữa câu viết -ㅂ니다.
  Bài lưu localStorage `nari-51`.

## Học câu 1–2 ngữ pháp trong 4 buổi (`ngu-phap-12/`)
- Cùng khung với `viet-52/`, học theo **cặp dễ nhầm**: Buổi 1 đuôi nối thời gian/trình tự/lựa chọn (+ quy trình 3 bước), Buổi 2 mục đích/điều kiện/
  nhượng bộ/lý do/quan sát, Buổi 3 đuôi kết thúc câu (trạng từ → đuôi) + tiểu từ nâng cao, Buổi 4 trộn đề, Bảng tra (luật loại trừ, đáp án đề thật). Link `ngu-phap-12/#b=1|2|3|4|tra`.
- Biến `R` = 61 câu 1–2 lấy từ `thi-thu/de/*.json` (đề đọc, bỏ Ehot1old và `Eys5` câu 1 vì đáp án không tự nhiên) + đáp án `a`
  (chỉ số trong `o`) + giải thích `w` do Claude soạn (`src` “Kỳ N” = đề thật); `MCQ` = câu nhận diện tự soạn (lựa chọn đầu là đáp án).
- Buổi 4: lượt 10 câu, 30 giây/câu, ôn ngắt quãng (`st.r[id] = {b, due, n, w, ok}`: sai → ngày mai; đúng → 3, 7, 14 ngày; đúng lần 14 ngày = thuộc);
  câu làm ở Buổi 1–3 cũng vào lịch ôn. Bài lưu localStorage `nari-12`, nút “Gửi kết quả cho cô…” chia sẻ đoạn chữ.

## Học câu 3–4 ngữ pháp tương đồng trong 4 buổi (`ngu-phap-34/`)
- Cùng khung với `ngu-phap-12/`, học theo **tần suất trong đề thật** (21 câu 3–4 của kỳ 35–102; 6 nhóm = 16/21 câu), mỗi cặp học cả hai chiều:
  Buổi 1 đuôi nối lõi (để -고자 = -기 위해, vì – chuyện xấu 바람에 = 탓에, có làm cũng vô ích 봐야 = 다고 해도 / 나 마나 / 더라도) + quy trình 3 bước
  (gọi tên phần gạch chân bằng từ khóa → gọi tên 4 đáp án, gạch bẫy quen 대신에/김에/리가 없다/무섭게/반면에 và bẫy hình thức → kiểm tra dấu hiệu + thì),
  Buổi 2 đuôi câu lõi (thang độ chắc chắn 뻔하다 / 나 보다 / 지도 모르다 / 리가 없다, coi như 셈이다, tùy vào 나름이다), Buổi 3 vòng hai (5 cặp đề thật ra 1 lần,
  cặp đề luyện, “Nâng cao”), Buổi 4 trộn đề + ôn ngắt quãng, Bảng tra (đáp án đề thật, dấu hiệu → nhóm, luật loại trừ). Link `ngu-phap-34/#b=1|2|3|4|tra`.
- Tham khảo giáo án “Giáo án TOPIK II” (Claude Docs, https://claude.ai/artifact/1ZXx9PXJjapaWdjJMSjTPn): dấu hiệu nhận biết, quy tắc loại trừ, bẫy.
- Biến `R` = 60 câu 3–4 từ `thi-thu/de/*.json` (bỏ Ehot1old, Entk3 câu 3 trùng Entk1) + đáp án `a` + giải thích `w` do Claude soạn; `MCQ` câu tự soạn
  (lựa chọn đầu là đáp án). Bài lưu localStorage `nari-34`.
