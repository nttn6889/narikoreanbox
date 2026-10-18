# Hàn Ngữ Nari — trang web cho học sinh

Site tĩnh, chạy bằng GitHub Pages từ nhánh `main` (push lên `main` là site tự cập nhật sau ~1 phút).
Tên miền học liệu **https://hoc.naritopik.com/** (file `CNAME`; DNS: CNAME `hoc` → `nttn6889.github.io`). Tên miền chính `naritopik.com`
để dành cho landing page / quảng cáo khóa học (làm riêng sau, không đặt trong repo này). Link cũ `nttn6889.github.io/narikoreanbox/…`
GitHub tự chuyển sang tên miền mới. Link tuyệt đối trong trang viết `https://hoc.naritopik.com/…`.
Giáo án / bản trình chiếu của cô (`seoul/2a-1/`, `seoul/3a-1/`…) gắn `<meta name="robots" content="noindex">` để Google không đưa lên tìm kiếm.
Repo để công khai vì Pages miễn phí yêu cầu vậy — tuyệt đối không đưa dữ liệu học sinh vào repo.

## Phòng thi thử (`thi-thu/`)
- Trang **quản lý** của cô vẫn nằm trên claude.ai: https://claude.ai/artifact/7EWoCB9sEomX2FHY8d1QY8
  (dùng cơ sở dữ liệu của artifact: ngân hàng đề, học viên, sổ điểm). Cô giao bài ở đó.
- `thi-thu/index.html` là bản **chỉ dành cho học sinh**, được sinh tự động — không sửa tay.
- Giao bài thi thử **không cần đồng bộ**: link `thi-thu/#d=<base64>.<sum>` chứa mã bài, mã đề (`e`) và phạm vi câu (`f`,`t`);
  đề trộn thì chứa danh sách câu gốc `q:[[đề, câu],…]` và trang học sinh tự ghép lại bằng `mixQs` (giống hệt trang quản lý).
  Nội dung đề lấy từ `thi-thu/de/<id>.json`. Link cũ `?bai=MÃ` (bài nhúng trong index.html) vẫn chạy.
- **Bài luyện tập / thi thật** (Giao bài → “Kiểu bài”; mặc định Luyện tập 20 từ): luyện tập ghi `lt` (số từ trắc nghiệm) vào `assigns` và link `#d=`.
  Trang học sinh (`tuStage`/`tuTable`/`tuWire`, ngoài khối Admin): trắc nghiệm nghĩa (Hàn → Việt, đúng sai hiện ngay) các từ trong những câu được giao →
  bảng từ theo câu → làm đề; trong đề từ được tô gạch chấm, chạm xem nghĩa, nút “Tách từng câu” (xuống dòng sau mỗi câu), nút “Bảng từ”.
  Từ đã chọn đúng ở bài luyện tập trước không hỏi lại (localStorage `nari-tu-ok`). Mã nộp `NT2-` thêm `v:[đúng, số từ]`, `vw` (≤12 từ sai) →
  `results.vq`/`vw`, hiện ở phần chấm. Thi thật (không `lt`) như cũ. Bài hằng ngày theo Khung luyện tập (`ltCreate`) luôn là luyện tập (`lt:20`).
  Bảng từ theo câu: `python3 tools/tu_de.py [<dump>]` → `thi-thu/de/tu/<id>.json` ({w:[[từ gốc, nghĩa, số đề gặp, [chữ trong đề]]], q:{câu:[chỉ số]}};
  kiwipiepy, nghĩa như Từ cốt lõi, bỏ từ sơ cấp/`STOP`; đề nghe lấy thêm kịch bản ở đề `…k`, bài luyện nghe cùng file nghe, hoặc `explain` trong dump
  `bank/<id>/q`). **Chạy lại sau mỗi lần đồng bộ đề.**
- **Đồng bộ ngân hàng đề + kho từ** (khi cô nhập/sửa đề hoặc thêm từ — cô nhắn “đồng bộ đề”/“đồng bộ kho từ”):
  1. ArtifactData `list` với `out_dir` (không đọc nội dung vào hội thoại): `bank`, từng `bank/<id>/q`, `vocab` → một thư mục dump.
  2. `python3 tools/sync_kho.py <dump>` — ghi `thi-thu/de/*.json` (bỏ đáp án, giải thích; bỏ đề trộn), `thi-thu/vocab.json`,
     ảnh vào `thi-thu/img/`, và `<dump>/site_kho.json`.
  3. ArtifactData `set` collection `site`, doc `kho` từ `site_kho.json` (dấu từng câu/từng phần; trang quản lý so dấu này để
     báo “câu đã sửa sau lần đồng bộ”). Hàm dấu `qSig`/`vSecSig` trong trang phải khớp `qcanon`/`vcanon` trong script.
  4. `python3 tools/tu_de.py <dump>` (bảng từ cho bài luyện tập), kiểm tra bằng Playwright, commit + push.
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
- **Khung luyện tập** (Lớp học → lớp → thẻ “Khung luyện tập”, thay cho chọn khối): `classes/<id>.lt = [{from, v:{r: mã lộ trình}, d:{f,t}, nd:{f,t,k}, nl:{f,t}}]`,
  mỗi mốc dùng từ ngày `from` tới mốc sau (không gắn với tuần/buổi). Ngày có khung thì “Tạo bài hôm nay”/“7 ngày tới” tạo bài theo khung
  (`ltCreate`/`ltMakeAuto`), không theo khối: từ vựng = bài “ngày k” của lộ trình (`cdays.vr`, `cdays.vk`, hết từ mới thì `R<yyyymmdd>` = bài ôn,
  không tạo `vassigns`); đề đọc câu f–t, mỗi ngày một đề lớp lâu chưa làm (`cdays.e`); đề nghe k câu/ngày nối tiếp câu lần trước, chỉ câu có
  file nghe, cặp 21–22… không tách (`cdays.en`, `assigns.nd = 1`); luyện nghe = bài `nlessons` có câu trong f–t (`cdays.nn`). Chuyên cần tính bài
  lộ trình theo `vresults.route` + `day`. Lộ trình từ vựng giờ tạo/quản lý ở nút “Lộ trình từ vựng” của thẻ này (đã bỏ khỏi tab Từ vựng).
  Bảng “Buổi học & khối kiến thức” cũ vẫn còn (thu gọn) cho lớp chưa có khung luyện tập.
  `classes.end` (ngày kết thúc khung tuần cũ) không chặn khung luyện tập (`ltAt` bỏ qua); muốn dừng thì xóa mốc khung.
- **Đăng bài** (cô nhắn “đăng bài”): ArtifactData `list` với `out_dir` các collection `classes`, `students`, `cdays`, `assigns`,
  `vassigns`, `nassigns`, `vroutes` → `python3 tools/sync_app.py <dump>` → ghi `thi-thu/app/<mã>.json` (chỉ mã, tên bài, nội dung link;
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

## Lịch cố định + Học phí (tab Học sinh, chỉ trong trang quản lý — code trong `tools/nangluc.js`)
- Lịch cố định của em = ca ở Học sinh → Lịch tuần (`students.slots`). Hồ sơ → Lịch học có thẻ “Lịch học cố định” (ca, buổi sắp tới), lưới “Tuần này”
  tô khung nét đứt ngày có lịch, nút “Ghi N buổi đã học theo lịch” tạo `buoi` (`tm` = giờ ca, `plan:1`) cho ngày có lịch chưa ghi (cô bỏ chọn buổi nghỉ).
- Học phí: `students/<id>.fee = {rate (đ/buổi), mode: lich (đếm buổi có lịch trong tháng) | 4t (4 tuần × buổi/tuần) | co (trọn gói, month), from}`.
  Tháng đầu vào giữa tháng = số buổi có lịch từ `from` đến hết tháng × đơn giá (hạn = buổi đầu tiên); từ tháng sau đóng đầu tháng (hạn ngày `due`).
  `hocphi/<id học viên>_<YYYY-MM>` = {n, rate, base, how (chốt khi “Đánh dấu đã gửi”/ghi đóng tiền), adj, adjNote, paid, paidAt, note, sent};
  `hocphi/_cfg` = {due, bank, note, sign}. Thẻ Học sinh → Học phí (bảng theo tháng) + hồ sơ → Học phí; “Thông báo” tạo tin nhắn Zalo.
- `nangluc.py` móc thêm 2 chỗ ngoài khối NLA: listener `hocphi`, và `editStudent` giữ `fee` khi cô sửa thông tin.

## Tư vấn (tab "Tư vấn" trong trang quản lý, chỉ cô xem)
- Lưu bài tìm gia sư học sinh đăng + 2 comment của cô (comment ngoài: giới thiệu cô ngắn gọn + trả lời; comment trả lời bên trong: lộ trình chi tiết)
  để lần sau tìm bài tương tự, “Dùng làm mẫu” rồi sửa; ô “Bản QnA” soạn sẵn bài hỏi – đáp cho trang Nari TOPIK (không tên người hỏi).
- Collection `tuvan/<id>` {date, st: chua|inbox|hoc|khong, kase (tóm tắt), tags, src, post, outer, inner, qna}. Code `renderTuVan`/`tvForm` trong khối Admin.
- Văn phong cô chốt cho comment ngoài: ngắn, 3–4 câu (ĐH Daegu, gần 10 năm sống và làm biên phiên dịch tại Hàn, dạy TOPIK online → trả lời câu hỏi →
  “Học thử miễn phí, em inbox cô”). Lộ trình để ở comment trả lời, giữ nguyên chữ cô đã duyệt.
- **Mỗi lần cô nhờ trả lời comment đấu giá / bài tìm gia sư:** soạn xong (cô duyệt bản cuối) thì tự lưu luôn, không cần cô nhắc:
  ArtifactData `set` collection `tuvan`, doc `T<yyyymmdd><a|b|c…>` (trang quản lý https://claude.ai/artifact/7EWoCB9sEomX2FHY8d1QY8),
  `st:"chua"`, `post` = bài học sinh đăng, `outer`/`inner` = bản cô chốt, `kase`/`tags` tóm tắt, `qna` = bản hỏi – đáp không tên. Cô sửa tiếp thì `update` bản đó.

## Lưu ý
- Repo không được chứa tên, điểm, nhận xét của học sinh.
- **Mỗi lần làm trang học liệu mới** (site hoặc claude.ai): tự thêm link vào trang “Mục lục học liệu Nari” (https://claude.ai/artifact/6bTfJWsvsCeMrmggceXPjQ,
  mảng `L` theo lớp → nhóm; Artifact `read` → sửa → `publish` với `url`, đổi ngày “cập nhật”), trang cũ đã gộp thì ghi chú “Bản cũ, đã gộp vào …”, trang đã xóa thì bỏ dòng.

## Logo Nari TOPIK (`logo/`) — bản cô đã chốt
- Tên **Nari TOPIK**, khẩu hiệu **Hiểu từng câu – Vững từng cấp**. Biểu tượng: tháp Namsan (chóp đỏ, chân là ngòi bút) cắm vào quyển sách mở
  (trang trái tím, trang phải vàng, 1 nét lượn bên dưới). Màu: tím `#53468F`, vàng `#D4A843` (chữ TOPIK `#C99A2E`), đỏ `#E0313F`, nền ảnh đại diện `#EFEAF8`.
- 5 bản: `nari-topik-logo` (hình + tên), `-logo-slogan`, `-ngang`, `-icon` (tròn tím nhạt), `-bieu-tuong` (chỉ hình); mỗi bản có `.svg`, `.png` (trong suốt),
  `-nen-trang.jpg`. Sinh lại: `pip install fonttools brotli`, `python3 tools/logo/mklogo.py logo` (chữ đổi thành nét vẽ, font Be Vietnam Pro trong
  `tools/logo/fonts/`), PNG chụp bằng Chromium. Logo cũ (đỏ – xanh “Hàn Ngữ Nari”, vòng tròn EPS) không dùng nữa.
- `hoc-cung-co/` đã đổi sang logo mới (đầu trang bản ngang, cuối trang bản có khẩu hiệu, favicon, ảnh chia sẻ; chế độ tối đặt logo trên nền `#EFEAF8`).
  Icon app thi thử (`thi-thu/icon/`) đã đổi sang biểu tượng mới (`node tools/logo/mkicons.js`, nền `#EFEAF8`) → favicon/ảnh xem trước của mọi trang dùng
  `thi-thu/icon/` cũng đổi theo; `thi-thu/` có `og:image` = `logo/nari-topik-logo-nen-trang.jpg` (trong `APP_HEAD` của `sync_thi_thu.py`).
  Đã đổi tên thương hiệu “Hàn Ngữ Nari” → **Nari TOPIK** trên mọi trang học sinh + trang quản lý (tiêu đề, og, tên app trong manifest, tin nhắn).
  Đầu trang: `.brand` dùng `logo/nari-topik-ngang.svg` (có khẩu hiệu); trang thi thử/quản lý nhúng SVG đó trong biến `LOGO_SVG` (`headerHTML`).
  `ve-co/` cuối trang dùng bản `-logo-slogan`; phần tiểu sử vẫn giữ “Trung tâm Hàn ngữ Nari” (tên trung tâm từ 2020).

## Ảnh quảng cáo / đấu giá lớp (`quang-cao/`)
- Mỗi bộ một thư mục, ảnh 1080×1350 (góc phải trên luôn có Zalo cô 0399 214 554) viết bằng HTML (`base.css` chung, logo `logo/nari-topik-ngang.svg`), chụp bằng Playwright ra PNG cùng tên.
- `topik2-len-3-4/`: cho bạn đã có TOPIK 2 (đề TOPIK I) muốn lên 3, gắng 4: `0-comment` (1080×1080, ảnh chung để comment, không lộ cách dạy), bìa, điểm 120→150, lộ trình 26 + 16 buổi, app, đánh giá, thông tin lớp, `7-ve-co` (profile cô, không ảnh chân dung — cô không muốn đưa ảnh; số liệu theo `ve-co/`).
  Ảnh app dùng `hoc-cung-co/img/` (trang vẫn mang tên cũ “Hàn Ngữ Nari” cho tới khi đổi logo trên site).

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
- **Câu 53/54 + bảng sửa bài** (đề công khai kỳ 91, 96, 102 đã nhập đủ 51–54: `W51_091`…`W54_102`; 53 kỳ 91 `dang:[3,7]` là đoán theo kỳ 96, có thêm ý “Triển vọng”): `wbank` thêm `img` (link ảnh biểu đồ
  `thi-thu/viet/W53_<kỳ>.jpg`), `blocks:[{k: tên ý, ko: câu bài mẫu}]` (bài mẫu chia ý), `nums` (số liệu phải có), `dang` (dạng trong trang khung câu 53).
  Giao bài có 2 tùy chọn (`wassigns.key` hiện đáp án ngay khi nộp — mặc định tắt, link khi đó không chứa đáp án, cờ `nk:1`; `wassigns.hint`).
  Ô viết 53/54 đếm chữ (tính dấu cách, không tính xuống dòng). Chấm: 3 tiêu chí (53: 7/7/16, 54: 12/12/26, `W_RUB`) + từng câu học sinh (`wSents`)
  đối chiếu với câu mẫu cùng số thứ tự (`wModelSents`: bài mẫu `keys.a[0]` tách thành Câu 1, Câu 2…), cô gõ câu sửa + nhãn lỗi (`W_TAGS`) → `wresults.ev:[{i, rc, ro, rl, o, x:[{b,s,f,e}]}]`.
  “Lưu & gửi kết quả” / “Gửi kết quả” tạo link `thi-thu/#s=<base64>.<sum>` (`wsBoot`, bài làm + phần sửa nằm trong link, so chữ `<del>/<ins>`);
  đề + ảnh + bài mẫu chia ý trang lấy từ `thi-thu/viet/<id>.json`. Link `#s=` được nén (`#s=Z…`: deflate-raw + base64, `zPack` dùng CompressionStream ở
  trang quản lý, `zUnpack`/`zInflate` viết tay ở trang học sinh) → ngắn còn ~1/3 cho Zalo khỏi cắt; link cũ không có `Z` vẫn mở được. **Đồng bộ đề viết** (sau khi thêm/sửa câu viết — cô nhắn “đồng bộ đề viết”):
  ArtifactData `list` `wbank` với `out_dir` → `python3 tools/sync_viet.py <dump>` → commit + push.
- **So với bài mẫu tại chỗ, không gọi Claude** (không tốn token; cô không muốn bước gửi Claude chấm): `wCmp(câu em, câu mẫu)` so từng chữ
  (bỏ qua dấu cách, LCS) → chữ khác bài mẫu tô vàng gạch sóng (`mark.wdm`), chữ bài mẫu có mà học sinh thiếu tô xanh (`mark.wdk`), kèm % giống.
  53/54: câu thứ j của học sinh so với câu mẫu thứ j (không gắn ý; `x.b` = j), học sinh viết dính/tách khác thì cô “Sửa cách tách câu” cho khớp;
  trang chấm hiện câu đã tô + câu mẫu cùng số + số câu so với bài mẫu; 51/52 so với
  cách viết mẫu gần nhất (`wBest`). Sửa câu, nhãn lỗi, nhận xét từng câu (`x.n`) / từng ô (`ev:[{i, nt:[㉠,㉡]}]`), tiến bộ (`tb`) là tùy cô.
- **Chấm câu 53 theo khung** (`wGradeModal` + bảng `#s=` gửi học sinh): nút “🤖 Claude chấm theo khung” (`wAiPrompt`/`wAiWire`, gọi Claude trong trang;
  khung lấy từ biến `W_KHUNG` = tóm tắt thẻ Khung câu của `viet-53/`, sửa khung ở `viet-53/` thì chép lại vào đây). Mỗi câu học sinh → `ev.x[].k =
  {d: tên khung, v: ok|lech|sai, t: khung viết ra, m:[{c, p, t, off}] chỗ trừ điểm (cô bỏ tick → off), ms: câu/đoạn bài mẫu cùng ý (Claude chép nguyên văn),
  mn: em học được gì từ câu mẫu}`; cô sửa được ở “Sửa khung / câu mẫu”. Cuối bài: tổng điểm trừ, ô “Tổng kết so với bài mẫu” (`ev.ks`), cả bài mẫu.
  **Không so câu thứ j với câu mẫu thứ j nữa** (máy tách câu không chuẩn, cô thấy rối). Bảng `#s=` câu 53 = `wsKhungHTML`: mỗi câu một thẻ
  (Khung · Em viết · Cô sửa · Nhận xét | Câu mẫu cùng ý · Em học được gì), rồi “So với bài mẫu”, bài mẫu. Câu 54 vẫn bảng cũ.
- Bảng sửa bài `#s=` (gửi học sinh) = bảng đối chiếu từng câu **# ý | Bài mẫu | Em viết | Nhận xét** (tô màu theo `wCmp`; cột Nhận xét chỉ hiện khi cô có ghi;
  câu cô sửa hiện thêm dòng “Cô sửa” so chữ `<del>/<ins>`; điện thoại: mỗi câu một thẻ), ý học sinh bỏ sót tô đỏ, thêm “Tiến bộ so với bài lần trước”. Nhận xét viết được `**đậm**`, `` `chữ Hàn` ``. Ảnh biểu đồ không tải được thì hiện `data`
  (số liệu dạng chữ; link giao bài 53/54 kèm `dt`, `thi-thu/viet/<id>.json` kèm `data`).
- Ảnh biểu đồ `img` trỏ tới GitHub Pages → chỉ hiện khi nhánh có ảnh đã vào `main`.

## Nhập đề thi vào ngân hàng đề
- Đề nghe công khai TOPIK II kỳ 96, 102: `Etk096n`, `Etk102n` (`nghe:1`, câu 1–3 là ảnh tranh/biểu đồ, lựa chọn “Tranh ①…”). `Etk096n` đã gắn file nghe
  đủ 50 câu, dùng lại file của bài luyện nghe N001–N011 (`audio` = link `thi-thu/nghe/audio/N0xx-<câu>.mp3`, cặp 21–22… chung một file). `Etk102n` chưa có file nghe.
- Kỳ 91 đủ cả đọc + nghe: `Etk091` (Đọc, 50 câu; câu 1–4 cô nhập trước giữ nguyên; câu 42–43 đề gốc không công bố đoạn văn) và
  `Etk091n` (Nghe, 50 câu; `explain` = kịch bản + đáp án). **File nghe từng câu**: trường `audio` của câu trong `bank` = link
  GitHub Pages `https://hoc.naritopik.com/thi-thu/de/audio/<đề>-<câu>.mp3` (link cũ `nttn6889.github.io/narikoreanbox/…` vẫn nhận) (trang quản lý phát được);
  `sync_kho.py` đổi thành đường dẫn tương đối `de/audio/…`. Cặp câu (21–22…) cùng một file ghi ở cả hai câu, trang chỉ hiện một
  trình phát (`buildSnapshot`/`mixQs` bỏ trình phát trùng với câu ngay trước). Không tính vào dấu `qSig`. Sửa câu có ô “File nghe”.
  File cô gửi (rar 31 track) chỉ có tới câu 30: track 1 giới thiệu, track 2–21 = câu 1–20, track 22/24/…/30 = cặp 21–22…29–30
  (nghe 2 lần), track lẻ 23…31 chỉ là “câu sau + thời gian làm bài”. Nén: `ffmpeg -af areverse,silenceremove=…,areverse -ac 1 -ar 24000 -b:a 40k`
  (cắt im lặng cuối). Câu 31–50 chưa có file nghe.
- Kỳ 83 làm y như kỳ 91: `Etk083` (Đọc, 50 câu; câu 1–4 cô nhập trước giữ nguyên, ảnh câu 5–10 cắt từ PDF scan; 42–43 không công bố đoạn văn)
  và `Etk083n` (Nghe, 50 câu, kịch bản + đáp án trong `explain`; tranh câu 1–3 cắt từ PDF đề). Rar 30 track (`unar` giải nén được rar5):
  track 1 giới thiệu, track 2–21 = câu 1–20, track chẵn 22…30 = cặp 21–22…29–30 → `de/audio/Etk083n-*.mp3` (câu 1–30; 31–50 chưa có).
  Đồng bộ chỉ 2 đề này (không dump cả ngân hàng): ghi `de/Etk083*.json` bằng hàm của `sync_kho.py`, rồi sửa mục `e.Etk083`, `e.Etk083n` trong `site/kho`.
  Câu 53 kỳ 64: `W53_064` (ảnh biểu đồ cắt từ ảnh đề cô gửi, `dang:[1,3,7]`, bài mẫu chính thức 3 ý).
  Viết kỳ 83 đủ 51–54 ở `wbank` (`W53_083` ảnh biểu đồ cắt từ PDF đề, có ý “Triển vọng”; `W54_083` sáng tạo – 창의력).
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
- **Lộ trình hàng ngày** (Lớp học → lớp → Khung luyện tập → “Lộ trình từ vựng”; trước nằm ở tab Từ vựng): collection `vroutes` (code, title, secs[thứ tự phần], per, type,
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
- **Bài từ vựng nhiều dạng** (lộ trình): `vroutes.type` có thể là 1–3 dạng nối bằng `+` (vd. `nk+nt+nc`), chọn ở form lộ trình hoặc
  Khung luyện tập → Từ vựng → “Dạng bài mỗi ngày” (lưu vào lộ trình, lớp khác dùng cùng lộ trình cũng đổi; sau đó “đăng bài” cho app).
  Học sinh làm lần lượt từng dạng với cùng danh sách từ (xong bước mới mở bước sau), đáp án `a` xếp nối nhau (ô j = dạng ⌊j/n⌋, từ j % n).
  Dạng mới: `nt` Nghe → gõ từ (chính tả), `nc` Nghe câu → điền từ khóa (máy đọc cả câu ví dụ, không gợi ý; có nút 🐢 đọc chậm).
  Hàm chung `vtSteps`/`vtOk`/`vtName`/`vScore`; chấm theo `p.y` của mã nộp; `vresults.steps:[{y, s, n}]` (Đánh giá cộng điểm theo từng dạng).
  Từ vựng ôn ngắt quãng: đúng ở mọi bước mới tính là đúng.
- `tools/nangluc.js` đã lấy lại theo bản trong trang quản lý (bản cũ trong repo bị lạc hậu); Đánh giá nằm trong tab Học sinh nên `nangluc.py` không móc tab nữa.
- Lộ trình hàng ngày có “Cách ôn”: ôn ngắt quãng (`vroutes.srs`, link `q:1`) — localStorage `mem.srs[id] = {b, due}`:
  sai → ôn ngày hôm sau, đúng → hỏi lại sau 3, 7, 14 ngày, đúng ở lần 14 ngày → `mem.ok` (đã thuộc). Bài ngày k = từ mới + từ đến hạn
  (tối đa `review`). Chưa làm: nghe chép từ file nghe gốc của sách (cô chưa có file).

## Ngữ pháp giáo trình Seoul (`seoul/ngu-phap/`)
- Nguồn: collection `grammar` của trang quản lý (Tài liệu gốc → Ngữ pháp; 170 điểm 1A–3A, `g_<cuốn>_<bài>_<số>`). 3B chưa nhập.
- **Đồng bộ ngữ pháp** (cô nhắn “đồng bộ ngữ pháp” sau khi nhập/sửa): ArtifactData `list` `grammar` với `out_dir` →
  `python3 tools/seoul_np.py <dump>` → `seoul/ngu-phap/np.json` (bỏ tiếng Anh; tên bài lấy từ `seoul/bai.json` + `thi-thu/vocab.json`;
  `form.ko` chưa có bản Việt thì dịch theo bảng `FORM_VI` trong script, câu lạ script in ra để bổ sung) → kiểm tra Playwright, commit + push.
- Trang: thẻ cuốn → “Mục lục” (mọi mẫu của cuốn + nghĩa) hoặc từng bài; link `#b=3A`, `#b=3A&c=1`, `#b=3A&c=1&g=2` (mẫu thứ 2). Ô tìm kiếm tìm trong
  mọi cuốn (tên mẫu, nghĩa, ví dụ, lưu ý). Giải thích tiếng Hàn gốc ẩn, nút “Hiện tiếng Hàn” (localStorage `nari-np-ko`). Ví dụ `" / "` = lượt hội thoại, 🔊 máy đọc.
- Trang từ vựng `seoul/` có nút chuyển Từ vựng | Ngữ pháp và dòng “Ngữ pháp bài này” dưới tên bài (đọc `ngu-phap/np.json`).

## Kiểm tra nền tảng Seoul (`seoul/kiem-tra/`)
- Bài chẩn đoán cho học sinh học tiếp 3A: 53 câu (A từ vựng 12 · B chia đuôi gõ 10 · C tiểu từ 6 · D ngữ pháp theo bài 1B–2B 17 ·
  E đọc 4 · F thử trước 3A 4) + tự đánh giá. Mỗi câu chọn “Chắc chắn/Đoán”, có nút “Em chưa học”. Đề nằm trong mảng `Q` của trang
  (lựa chọn đầu là đáp án, mỗi lựa chọn sai kèm ghi chú lỗi; `need` = bài 3A dùng lại). Bài làm lưu localStorage `nari-kt-seoul`.
- Nộp xong học sinh bấm “Gửi kết quả cho cô” → link `seoul/kiem-tra/#r=<base64>` (tên + đáp án, chỉ nằm trong link) mở bản báo cáo
  cho cô. Đổi thứ tự/đáp án câu cũ sẽ làm sai link đã gửi — thêm câu mới thì dùng id mới.

## Học liệu Seoul 3A theo bài (`seoul/3a-1/`)
- Lớp sinh viên chuyên ngành học gia sư song song với trường (đã học bài trên lớp rồi): mỗi buổi = ôn đúng phần nền 1A–2B bài đó cần + hiểu sâu bài + luyện có chấm ngay.
- `seoul/3a-1/` (Bài 1, 4 ngữ pháp sách tr.26–31 theo collection `grammar` `g_3A_01_*` của trang quản lý: `-다고 하다`, `-아/어야겠다`, `-다고 들었다`, `-대(요)`): thẻ Lộ trình (9 bài 3A ↔ nền cũ, đọc từ tên bài) · Nền tảng (6 viên gạch: động/tính từ,
  받침 + gốc ㄹ, bất quy tắc, thì, 이다/아니다, kính ngữ/반말) · Từ vựng (18 từ, phát âm, Hán tự, tiểu từ, phân biệt) · Ngữ pháp (4 thẻ con `#b=np&g=1…4`, mỗi mẫu Bậc 1 cơ bản → 2 chi tiết → 3 chuyên sâu + luyện ngay `y1/y2`, `h1/h2`, `d4/d5`;
  ① có hội thoại, đổi vai, xem trước Bài 2–3) · Luyện (gõ chữ, nghe – chép bằng giọng đọc máy `speechSynthesis`, kể lại tin nhắn nhóm, kiểm tra 18 câu, “Gửi kết quả cho cô”).
  Dữ liệu trong biến `M` (trắc nghiệm, lựa chọn đầu là đáp án; câu kiểm tra `ck` có nhãn viên gạch `n1…n6`), `T` (gõ chữ), `TV1/TV2`, `DLG`. localStorage `nari-3a1`.
- **Học sâu từ vựng trên trang `seoul/`**: phần từ vựng của trang học liệu (thẻ Từ vựng, từ mục 1 tới trước “Luyện từ vựng”) được trích thành
  `seoul/sau/3A-1.html` bằng `node tools/seoul_sau.js 3a-1` (không sửa tay; sửa trong trang học liệu rồi chạy lại). Trang `seoul/` hiện khung
  “Học sâu từ vựng bài này” dưới bảng từ của bài có trong biến `SAU` (`{'3A-1': 1}`), kèm “7. Luyện từ vựng”: dữ liệu trắc nghiệm M.v1…v4
  nằm trong `<script type="application/json" class="sau-q">` của đoạn trích, trang `seoul/` tự vẽ (`quiz`), chấm ngay, không lưu.
  **Không đặt link từ `seoul/` (hay trang học sinh nào) sang `seoul/3a-1/`** — cô coi trang học liệu như giáo án của cô.
  `TV1[i][5]` = cụm hay đi với `[[ko, nghĩa Việt]…]`.

## Học liệu Seoul 2A theo bài (`seoul/2a-1/`) — lớp 1:1, đích TOPIK 3 tháng 4/2027
- Học sinh: sinh viên ngoại ngữ (văn bằng 2 tiếng Anh), cần chứng chỉ ngoại ngữ thứ hai để tốt nghiệp; học **hết 2A → 2B rồi mới ôn TOPIK 3**.
  Cô muốn học liệu **bám theo từng trang sách**, học sâu đủ nội dung bài; điểm nào liên quan TOPIK thì chỉ ghi chú nhỏ (khung `.tp` “📝 TOPIK”),
  không thêm bài luyện đề (câu 51…) hay hội thoại tự viết thay cho sách.
- Sách cô gửi là PDF ảnh scan (không có chữ, ~1.500 token/trang khi đọc). Trang dùng hội thoại, bài đọc ngắn của sách (để học từng câu);
  file nghe của sách (track 08–11) không có → phần nghe chỉ chuẩn bị + giải thích câu hỏi + ô ghi đáp án, cô mở file trong buổi học.
- **Cấu trúc: mỗi trang sách là một mục** (cô không muốn chia theo kỹ năng Từ vựng/Ngữ pháp/Nói…): `seoul/2a-1/#b=p25` … `#b=p43`
  (p25 = tr.24–25). Mỗi trang: “Trang này có gì” (`.on-page`, liệt kê đúng những gì in trên trang) → các điểm **cô giảng sâu** (`.pt`: cấu tạo, nghĩa gốc,
  so sánh, Hán Việt, phát âm, lỗi người Việt hay mắc, văn hóa) → “Cô hỏi” (`.ask`, đáp án ẩn) → bài trong sách (đáp án / câu mẫu) → luyện thêm chấm ngay.
  Nút trang trước/sau và nút 🔊 cho mọi `.ex>.ko` do JS tự thêm.
- Mục đầu `#b=son` (section `id="sson"`, mở mặc định) **Ôn ngữ pháp 1A–1B**: Bước 0 bảng chia đuôi, 7 nhóm theo chức năng (tiểu từ, đuôi câu/kính ngữ,
  phủ định/khả năng, nối câu, muốn/định/phải, định ngữ, bất quy tắc), mỗi nhóm có “🔗 Nối sang Bài 1”; bài luyện xen sau các nhóm (cô thấy để cuối mục thì khó tìm): `M.o1` tiểu từ (sau nhóm 1), `M.o3` nối câu (sau nhóm 5),
  `T.o2` chia đuôi gõ (sau nhóm 7), cuối mục `M.o4` tìm câu sai (lựa chọn đầu là câu sai) + `M.o5` cầu nối sang Bài 1; đầu mục có nút `data-jump` nhảy tới từng bài; cuối mục bảng 64 mẫu (link `seoul/ngu-phap/#b=1A&c=…&g=…`).
- Dữ liệu `seoul/2a-1/`: `TV1` (tr.26), `M.v0`, `T.fr` (tr.26), `LIFE`, `TV2`, `M.v1` (tr.27), `T.ga` (28), `QA.qa1`, `T.gb`, `M.m1` (29), `D1`, `SUB1` (30),
  `QA.qa2`, `M.v2` (31), `QA.qa3`, `T.gc` (32), `QA.qa4`, `M.m2` (33), `D2`, `SUB2` (34), `QA.qa5`, `M.v3` (35), `M.h1` (36), `READ` (38), `M.r1` (39),
  `CUL` (41), `PRON`, `M.p1` (42), `SELF`, `T.s2` (đáp án sách), `M.ck` (43). Trắc nghiệm lựa chọn đầu là đáp án; bài viết/ghi chú `st.w` (tên trong `WNAME`)
  gửi kèm báo cáo. Máy đọc `speechSynthesis`, nam giọng trầm (`MALE`). localStorage `nari-2a1v2`.
  Không đặt link từ trang học sinh sang trang này (giống `seoul/3a-1/`). Bài 2, 3… làm cùng khuôn: `seoul/2a-<bài>/`.

## Học liệu nền tảng cho lớp 3A chuyên ngành (cô dùng làm bản trình chiếu)
- Mỗi chủ đề một trang riêng, cùng khung với `seoul/3a-1/` (thẻ lý thuyết + thẻ Luyện chấm ngay + “Gửi kết quả cho cô”). Không đặt link từ trang học sinh;
  cô gom link ở trang “Mục lục học liệu Nari” (https://claude.ai/artifact/6bTfJWsvsCeMrmggceXPjQ, nhóm “Seoul 3A · lớp chuyên ngành”).
- `seoul/so-dem/` Số Hán Hàn – thuần Hàn: hai bộ số + quy tắc chọn, lượng từ (`DVN`/`DVS`), thời gian, số lớn (만/억 so với nghìn/triệu), tiền, số và biến âm,
  “Máy đọc số” (`sino`/`nat`/`readNum`: số, giờ `15:20`, ngày `2026-10-13`). Thẻ “Đời sống” (`#b=ds`): bảng tình huống theo lĩnh vực trong biến `DS` ([tình huống, viết, đọc, T|H|C|M|E]),
  đọc từng chữ số, số 0, phân số/tỉ số, tuổi ở Hàn, văn hóa, thành ngữ; bài `q5`.
  **Sau mỗi phần lý thuyết có hoạt động** (cô thấy trang nhiều lý thuyết quá, học sinh cần được tham gia): `.try` “✋ Em thử” (bộ `e1…e13`, chấm ngay,
  báo cáo gộp dòng “Em thử trong bài”, danh sách `EM`), `.talk` “🗣 Nói to” (cô hỏi – em đáp, gợi ý ẩn), `.spin` “🎲 Quay số” (`SPK`: so, dem, gio, ngay, tien, mix;
  ra đề ngẫu nhiên, “Xem đáp án” có 🔊). Học liệu mới làm cùng khuôn: lý thuyết ngắn → ví dụ → em thử → nói to. Bài tập trong `M` (lựa chọn đầu là đáp án; phần tử 4 = câu máy đọc cho bài nghe), `T`. localStorage `nari-so`.
- `seoul/tuong-dong/` Ngữ pháp tương đồng 1A–3A: thẻ Bản đồ (5 câu hỏi phân biệt: chủ ngữ, thì, kiểu câu sau, loại từ, nguồn thông tin + bảng 25 nhóm),
  Tiểu từ (nhóm 1–5), Nối câu (6–10), Ý định (11–16), Phỏng đoán (17–21), Gián tiếp (22–25, kèm bảng danh từ phụ thuộc → đuôi định ngữ), Luyện.
  Mỗi nhóm một thẻ `.card id=gN` (link `#b=<thẻ>&g=gN`); cột “Sách” chỉ ghi số bài khi chắc (3A theo tên bài, 1B–2B theo `seoul/kiem-tra/`).
  Bài tập `M` (lựa chọn đầu là đáp án; bộ `l4` “tìm câu sai” thì lựa chọn đầu là câu sai), `T` (gõ). localStorage `nari-tuongdong`.
- Còn làm: Biến âm, Trợ từ.

## Đánh giá buổi học (`danh-gia/`)
- Phiếu dùng chung: `danh-gia/dg.js` gắn vào trang bằng `<div id="danhgia" data-buoi="<khóa>" data-title="…" data-parts="Phần 1|Phần 2"></div>` + script.
  8 câu: chung (5 mức), hiểu từng phần, tốc độ, lý thuyết/luyện tập, hoạt động thích nhất, tự tin dùng ngoài đời, chỗ chưa hiểu, góp ý; tên có thể để trống.
  “Gửi đánh giá cho cô…” chia sẻ đoạn chữ qua Zalo (không lưu lên mạng); nháp ở localStorage `nari-dg-<khóa>`.
- Trang riêng cho buổi bất kỳ: `danh-gia/#t=<tên buổi>&p=<phần 1>|<phần 2>`. `seoul/so-dem/` có sẵn phiếu thu gọn cuối trang (`#b=dg` mở thẳng).

## Học câu 52 trong 3 buổi (`viet-52/`)
- Trang học liệu gửi học sinh: Buổi 1 (ô cuối câu, 5 nhóm từ nối: 47, 41, 52, 92, 96, 36, 37), Buổi 2 (“Chép hay Lật” = tìm ý cho ô; đề 60, 83, 91, 64, 35),
  Buổi 3 (làm như thi, 6 phút/câu, không gợi ý: 93, 94, 95, 102), thẻ Bảng tra (9 nhóm tín hiệu → mẫu). Link `viet-52/#b=1|2|3|tra`.
- Mỗi buổi có trắc nghiệm nhận diện (mảng `MCQ`, câu tự soạn, lựa chọn đầu là đáp án) và đề thật: đề + đáp án + `pat` + gợi ý 3 bậc
  nhúng sẵn trong biến `Q` (lấy từ `wbank` lúc soạn trang; sửa gợi ý trong trang quản lý thì phải chép lại vào đây).
- Buổi 2 (viết lại sau khi cô dạy thử: phần tìm ý khó dạy): mỗi ô là **Chép** (ý giống câu bên cạnh, 15/32), **Lật** (ý ngược, 13/32) hoặc **Suy ra** (4/32);
  bảng tín hiệu cùng chiều/ngược chiều, 6 khuôn ô giữa câu, mẫu cũ thu vào `<details>`. Nhãn từng ô ở biến `LAB` ({id:{a:[C|L|S, chữ trong câu chứa ý, giải thích, câu khác cũng đúng?]}});
  đề Buổi 2 làm theo 3 bước: bấm câu chứa ý (thử 2 lần) → chọn Chép/Lật/Suy ra → viết (`st[id].f`). Sau khi nộp, mọi buổi đều tô câu chứa ý + nhãn.
- Học sinh tự chấm 0–5 mỗi ô (trùng đáp án mẫu tự cho 5), bài lưu localStorage `nari-52`, nút “Gửi kết quả cho cô…” chia sẻ đoạn chữ qua Zalo.

## Học câu 51 trong 3 buổi (`viet-51/`)
- Cùng khung với `viet-52/` (code trang chép từ đó): Buổi 1 (ô cuối câu và câu hỏi “?”, 13 kỳ: 70, 72, 73, 74, 78, 79, 80, 82, 87, 91, 94, 95, 103),
  Buổi 2 (ô giữa câu, 13 kỳ: 75, 76, 77, 81, 83–86, 88–90, 92, 93), Buổi 3 (làm như thi, 4 phút/câu: 96–102, 104–106), thẻ Bảng tra (12 nhóm, thống kê 72 ô). Link `viet-51/#b=1|2|3|tra`.
- Đề + gợi ý nhúng trong biến `Q` (lấy từ `wbank` W51_*; sửa trong trang quản lý thì chép lại). Cảnh báo đuôi: ô cuối câu viết -다 / -요, ô giữa câu viết -ㅂ니다.
  Bài lưu localStorage `nari-51`.

## Học câu 53 (`viet-53/`)
- Gộp 2 trang cũ trên claude.ai: “Khung câu 53 — 10 dạng” (https://claude.ai/artifact/3D57egxtLffpyYHR4ZbGWt) → thẻ **Khung câu** (`#b=khung&d=d1…d10`;
  HTML + CSS chép nguyên, CSS bọc trong `.kh`), “Luyện viết câu 53” (https://claude.ai/artifact/MBTxyhkb8maZmk9TnhJLAC) → thẻ **Luyện viết** (biến `GR`,
  8 dạng / 37 câu; bài lưu localStorage, “Tạo link gửi cô” → `viet-53/#s=<Z + deflate-raw base64url>` mở bản xem bài cho cô). Ảnh tách ra `viet-53/img/`
  (`k*` ảnh khung, `v*` ảnh đề luyện; nguồn Cool-Topik-쓰기) → trang đặt `noindex`. Từ nay sửa thẳng trong `viet-53/index.html`, không sửa 2 artifact cũ.
- Phần mới (cô thấy học sinh không biết viết nguyên nhân / triển vọng / phương án, không phân biệt mảnh thiếu động từ):
  Buổi 1 Mảnh → mệnh đề (5 dạng mảnh, câu hỏi “tự xảy ra hay có người làm?” → 이/가+되다 hay 을/를+하다, nhóm A/B/C, ↑↓ → động từ, tiểu từ),
  Buổi 2 Nguyên nhân (ký hiệu → từ nối, 때문 / 기 때문, khung câu), Buổi 3 Triển vọng + Phương án, Bảng tra. Link `#b=1|2|3|khung|viet|tra`.
- Dữ liệu: `MCQ` (lựa chọn đầu là đáp án), `FR1` (mảnh → mệnh đề, đáp án ngăn `|`, máy tự nhận thêm đuôi quá khứ/hiện tại qua `ENDS`),
  `TK` (đề viết câu: `fr` = mảnh + đáp án hoặc id `FR1`, `md` = câu mẫu; so câu bằng LCS từng chữ, học sinh tự chấm). Đề thật kỳ 83, 91, 96, 102 lấy từ
  `thi-thu/viet/W53_*.json`; đề phương án là câu tự soạn (4 đề thật chưa có ô 방안). localStorage `nari-53`. Kết quả Buổi 1–3 gửi cô bằng chia sẻ đoạn chữ.
- `viet-53/mau/` **Đọc mẫu trước giờ thi** (chỉ đọc, không chấm): 3 công thức, 8 đề nguyên nhân + 8 triển vọng + 5 phương án (biến `D.g1/g2/g3`:
  khung đề → bảng mảnh → mệnh đề → câu mẫu `md` tô màu `{n|…}` / khung `[[…]]` + nghĩa Việt), bài mẫu kỳ 91 cả bài, “Đọc liền”, “Che câu mẫu”. Bảng Bước 1 tô màu phần thêm vào: `{p|…}` tiểu từ, `{h|…}` 하다/되다, `{n|…}` động từ mới, `{o|…}` đổi đuôi; mỗi câu mẫu có “Nghĩa:”. Không có loa (cô bỏ).

## Học câu 54 (`viet-54/`)
- Cùng khung với `viet-53/`: Buổi 1 (câu 54 chấm gì 12/12/26, đề có câu dẫn + chủ đề ‘ ’ + 3 câu hỏi, **3 câu hỏi = 3 đoạn** như bài mẫu chính thức,
  6 kiểu câu hỏi: lý do / hiện trạng / ưu điểm / vấn đề / giải pháp / điều kiện, đổi lời câu dẫn, dàn ý 2–3 ý mỗi đoạn), Buổi 2 (đuôi -ㄴ/는다, văn nói → văn viết,
  từ thường → từ Hán, nối câu, danh từ hóa), Buổi 3 (câu dẫn, khung câu theo kiểu câu hỏi, từ nối trong/giữa đoạn), thẻ Bài mẫu (4 đề thật, từ nối + khung câu
  tô tự động bằng danh sách `CONN`/`FRM`), Viết cả bài (dàn ý → bài → tự soát `CHECKS`, đếm chữ tính dấu cách, bấm giờ 30 phút, “Xem bài mẫu”; link gửi cô
  `viet-54/#s=<Z + deflate-raw base64url>` = dàn ý + bài + ô tự soát, mở bản xem cho cô), Bảng tra. Link `#b=1|2|3|mau|viet|tra`, `#b=viet&e=W54_096`.
- Đề + bài mẫu kỳ 83, 91, 96, 102 nhúng trong biến `REAL` (lấy từ `thi-thu/viet/W54_*.json` lúc soạn trang; thêm đề 54 vào `wbank` thì chép thêm vào đây),
  ý chính tiếng Việt từng đoạn ở `IDEA`; 2 đề luyện tự soạn `PR` (`P01` thú cưng, `P02` SNS; bài mẫu do Claude soạn). `MCQ` (lựa chọn đầu là đáp án),
  `TK` câu viết lại / viết theo khung (so LCS với câu mẫu, tự chấm). Sửa thẳng trong `viet-54/index.html`. localStorage `nari-54`.

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

## Học câu 13–15 sắp xếp câu (`cau-13-15/`)
- Chiến thuật rút từ 66 câu của 22 đề đọc: 65/66 câu 4 đáp án chỉ có 2 câu đầu → chọn câu đầu (loại câu có **dấu bám**: từ nối, từ chỉ, câu lý do `때문이다`/`-ㄴ 것이다`;
  cả hai sạch thì phép thử “đứng một mình” + 4 kiểu câu đầu G/H/Q/T) → còn 2 đáp án, so đúng **một vị trí** (vị trí 2: 46, vị trí 3: 19). Câu đầu đúng không bao giờ có dấu bám (66/66).
  Đề thật kỳ 83, 91: 5/6 câu bị loại không có dấu bám.
- Buổi 1 (dấu bám, 18 câu làm từng bước), Buổi 2 (hai câu đều sạch, nối đuôi / thời gian, bẫy định nghĩa đứng sau hiện tượng, 20 câu từng bước), Buổi 3 (28 câu như thi, 1 phút/câu,
  báo sai ở bước câu đầu hay bước 3), Ôn (ôn ngắt quãng 10 câu), thẻ “66 câu”, Bảng tra. Link `cau-13-15/#b=1|2|3|on|all|tra`, `#b=all&q=<id>`.
- Biến `R` (66 câu, câu + đáp án lấy từ `thi-thu/de/*.json` và `bank` — đáp án `a` theo `bank`): `o` = 4 đáp án dạng `"나가다라"`, `f` kiểu câu đầu, `m` vì sao câu kia không đứng đầu
  (N C L K), `k` tín hiệu bước 3 (C L N K T D), `h` = chữ được tô theo từng câu (phải có đúng trong câu), `v` nghĩa tiếng Việt, `r`/`w` giải thích bước câu đầu / bước 3 do Claude soạn.
  Bước làm tự tính từ `o` (`stepsOf`). `MCQ` câu tự soạn (lựa chọn đầu là đáp án). Bài lưu localStorage `nari-1315`.
- **Trang tự luyện `cau-13-15/luyen/`** (gửi học sinh không có thời gian học cùng cô; chỉ có câu luyện, không phần kiến thức, chỉ một bảng dấu hiệu thu gọn):
  66 câu làm 2 bước (Bước 1 câu đầu → Bước 2 vị trí khác nhau), 4 thẻ `#p=1|2|3|4` (1–2: câu bị loại có dấu bám, 15+15; 3–4: hai câu đều sạch, 18+18) + `#p=on` ôn ngắt quãng
  10 câu (đúng mà có xem gợi ý → ôn lại ngày mai). Mỗi bước có 💡 gợi ý 2 mức (mức 1 = `g1`/`g3`, mức 2 = tô `h` của câu đang so + cách làm) và phản hồi tách
  “Vì sao chọn” (`c1`/`c3`) / “Vì sao loại” (`x1`/`x3`) + nghĩa 2 câu đang so. Dữ liệu `R` cùng câu, đáp án, `h`, `v` với trang chính + 6 trường trên, `p` = thẻ.
  Báo cáo gửi cô: đúng cả 2 bước / không cần gợi ý / sai bước nào. localStorage `nari-1315l`.

## Học câu 16–18 điền chỗ trống (`cau-16-18/`)
- Cùng khung với `cau-25-27/`: Buổi 1 (thói quen **đọc qua ô** — 39/65 câu manh mối nằm sau ô; quy trình 3 bước; khung quanh ô → loại ý; tín hiệu ① Đảo chiều, ② Giải thích ở sau),
  Buổi 2 (③ Ví dụ → tên chung, ④ Kết luận, ⑤ Nói lại; 4 bẫy), Buổi 3 (làm như thi, 1 phút/câu), Ôn (ôn ngắt quãng 10 câu), thẻ “65 câu”, Bảng tra. Link `cau-16-18/#b=1|2|3|on|all|tra`, `#b=all&q=<id>`.
- Biến `R` = 65 câu 16–18 của 22 đề đọc (đoạn văn + lựa chọn từ `thi-thu/de/*.json`; bỏ Ehot3 câu 17 vì cần hiểu biết văn hóa ngoài bài). Đáp án `a` đối chiếu với `bank` (khớp 65/65);
  tín hiệu `k` (D S V K L), vị trí manh mối `s` (t trước / s sau / h cả hai), `c` = chữ manh mối (phải có đúng trong đoạn văn, trang tô vàng), `t` ô cần gì, giải thích `w`,
  `x[i]` = bẫy của đáp án sai (`C` chép chữ, `N` ngược chiều, `T` bài không nói, `P` lệch) do Claude soạn. Khối “Làm mẫu” = `<div class="demo" data-id>`.
  `MCQ` câu tự soạn (lựa chọn đầu là đáp án, trang tự đảo). Bài lưu localStorage `nari-1618`.

## Học câu 19–20 phó từ nối + chủ đề (`cau-19-20/`)
- Cùng khung với `cau-16-18/`, mỗi bài = 1 đoạn văn + câu 19 + câu 20 (câu 20 mở sau khi làm câu 19). Chiến thuật rút từ 22 đề: Bước 1 **Tìm cặp**
  (phó từ đi cặp như 비록/만약/과연/어쩌면/차라리… mà cuối câu không có đuôi thì gạch ✕; 7/22 bài ra đáp án chỉ bằng bước này, cả kỳ 83, 91),
  Bước 2 **Xét quan hệ** câu trước + câu có ô (오히려 = đảo dự đoán, 반면 = hai đối tượng, 그러나 = trái ý, kết luận, thêm, chuyển ý), câu 20 chủ đề nằm ở
  câu có ô hoặc câu cuối (7/7). Buổi 1 (6 bài), Buổi 2 (10), Buổi 3 như thi (6, 1:30/bài), Ôn (6 bài/lượt), thẻ “22 bài”, Bảng tra. Link `cau-19-20/#b=1|2|3|on|all|tra`, `#b=all&q=<id đề>`.
- Biến `R` (id = id đề): `p`, `o`, `a`, `k` (quan hệ C O B G K T H), `c` (chỗ quyết định câu 19, tô vàng), `w`, `x[i]` (lỗi P thiếu cặp / N sai chiều / S sai sắc thái / M không hợp),
  `t` (J chủ đề / D nội dung khớp), `s`, `o2`, `a2`, `c2` (tô xanh), `w2`, `x2[i]` (H chi tiết hẹp / C chép chữ / N ngược / T không nói / A quá mức), `z` (vị trí đáp án chủ đề), `p1`, `mid`.
  Đáp án lấy từ `bank`, riêng `Etk091` dùng đáp án đúng ③ 비록 / ① (trong `bank` đang ghi sai ① / ③). `MCQ` câu tự soạn (lựa chọn đầu là đáp án). localStorage `nari-1920`.

## Học câu 25–27 tiêu đề báo (`cau-25-27/`)
- Cùng khung với `ngu-phap-34/`: Buổi 1 (luật rút gọn của tiêu đề, quan hệ hai nửa, chữ cuối → thời điểm, quy trình 4 bước, 6 bẫy), Buổi 2 (ẩn dụ/quán ngữ theo nhóm nghĩa, biến `GL`),
  Buổi 3 (làm như thi, 40 giây/câu), Ôn (ôn ngắt quãng 10 câu), thẻ “63 câu” (giải thích từng câu, lọc theo buổi/quan hệ, “Che đáp án”), Bảng tra. Link `cau-25-27/#b=1|2|3|on|all|tra`, `#b=all&q=<id>`.
- Biến `R` = 63 câu 25–27 của 21 đề đọc đủ 50 câu (`Etk091` + 20 đề luyện; tiêu đề + lựa chọn lấy từ `thi-thu/de/*.json`) + đáp án `a`, tách khúc `t`, nghĩa `v`,
  giải thích `w`, `x[i]` = bẫy của đáp án sai (`N` nghĩa đen, `D` đảo nhân quả, `G` sai thời điểm, `C` ngược nghĩa, `T` thêm ý, `P` sai đối tượng) do Claude soạn.
  Đề thật giữ thứ tự ①–④; `MCQ` câu tự soạn (lựa chọn đầu là đáp án, trang tự đảo). Bài lưu localStorage `nari-2527`.

## Facebook (`fb/`)
- `fb/ca-nhan/`: bài cho trang cá nhân "Tiếng Hàn Ngân Nguyễn" (cô có ảnh đại diện thật, giọng văn kể chuyện, lồng từ Hàn). `bia.html` ảnh bìa 1640×924
  (chữ để trên + hai bên, vì trên điện thoại ảnh đại diện che giữa phía dưới), `ghim-1` bài ghim, loạt “Một từ, một câu chuyện” `tu-NN-*.html`
  (khung `tu.css`, từ lấy từ phần `Cốt lõi` của `thi-thu/vocab.json` + số đề trong `tu-vung/de.json`), lời đăng ở `caption.md`.
  Dùng chung `quang-cao/topik2-len-3-4/base.css`. Chụp PNG: `node tools/chup_anh.js fb/ca-nhan/*.html` (cỡ khác 1080×1350 ghi `<meta name=size content="WxH">`).
- `fb/de-viet-108/`: đề viết kỳ 108 (18.10.2026, đề thí sinh nhớ lại) — 7 ảnh: bìa, 51, 52 (đáp án + cách viết khác), 53 đề (biểu đồ vẽ lại bằng SVG) + bài mẫu, 54 đề + dàn ý + bài mẫu; `de.css`, lời đăng `caption.md`.
- Cô: cử nhân Quản trị kinh doanh Đại học Daegu, đang ở Quỳnh Lưu, dạy trực tiếp tại Quỳnh Lưu + online toàn quốc.
