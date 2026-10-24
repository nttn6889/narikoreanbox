# Hàn Ngữ Nari — trang web cho học sinh

Site tĩnh, chạy bằng GitHub Pages từ nhánh `main` (push lên `main` là site tự cập nhật sau ~1 phút).
Tên miền học liệu **https://hoc.naritopik.com/** (file `CNAME`; DNS: CNAME `hoc` → `nttn6889.github.io`). Tên miền chính `naritopik.com`
để dành cho landing page / quảng cáo khóa học (làm riêng sau, không đặt trong repo này). Link cũ `nttn6889.github.io/narikoreanbox/…`
GitHub tự chuyển sang tên miền mới. Link tuyệt đối trong trang viết `https://hoc.naritopik.com/…`.
**Việc để sau (cô đã đồng ý hướng, chưa làm):** chuyển `ve-co/`, `hoc-cung-co/` và 3 bài “Làm thử” cho học sinh mới sang **naritopik.com** (hoc.naritopik.com là link học nội bộ).
Cách định làm: kho GitHub mới `nttn6889/naritopik` (Pages, CNAME `naritopik.com`; cô thêm 4 bản ghi A + CNAME `www` → `nttn6889.github.io`), bản ghi
trang thi thử học sinh + chỉ dữ liệu 3 bài (Ehot1, N001 + file nghe) ở `naritopik.com/lam-thu/`; trang cũ trên hoc.naritopik.com chuyển hướng sang. Khi đó sửa luôn link
“Liên kết” trong `fb/ca-nhan/caption.md`. Hỏi lại cô trước khi tạo kho.
Giáo án / bản trình chiếu của cô (`seoul/2a-1/`, `seoul/3a-1/`…) gắn `<meta name="robots" content="noindex">` để Google không đưa lên tìm kiếm.
Repo để công khai vì Pages miễn phí yêu cầu vậy — tuyệt đối không đưa dữ liệu học sinh vào repo.

## Phòng thi thử (`thi-thu/`)
- Trang **quản lý** của cô vẫn nằm trên claude.ai: https://claude.ai/artifact/7EWoCB9sEomX2FHY8d1QY8
  (dùng cơ sở dữ liệu của artifact: ngân hàng đề, học viên, sổ điểm). Cô giao bài ở đó.
- `thi-thu/index.html` là bản **chỉ dành cho học sinh**, được sinh tự động — không sửa tay.
- Giao bài thi thử **không cần đồng bộ**: link `thi-thu/#d=<base64>.<sum>` chứa mã bài, mã đề (`e`) và phạm vi câu (`f`,`t`);
  đề trộn thì chứa danh sách câu gốc `q:[[đề, câu],…]` và trang học sinh tự ghép lại bằng `mixQs` (giống hệt trang quản lý).
  Nội dung đề lấy từ `thi-thu/de/<id>.json`. Link cũ `?bai=MÃ` (bài nhúng trong index.html) vẫn chạy.
- **Bài luyện tập / thi thật** (Giao bài → “Kiểu bài”, `LT_KINDS`; mặc định luyện tập 10 từ/câu): luyện tập ghi `lt` vào `assigns` và link `#d=`
  (`lt` = số từ trắc nghiệm **mỗi câu**: 5/15; 20 (mặc định, giá trị cũ) hoặc 30 = 10 từ/câu — `tuPer`).
  Trang học sinh **làm từng câu** (`tuStage`/`tuTable`/`tuNext`/`tuWire`, ngoài khối Admin): với mỗi lượt `A.grp` (một câu; câu dùng chung đoạn văn
  `share` hoặc chung file nghe như 21–22 đi cùng một lượt) → trắc nghiệm nghĩa (Hàn → Việt, đúng sai hiện ngay) ≤ 10 từ của câu đó (từ đã hỏi ở lượt trước
  không hỏi lại) → bảng từ của câu → làm câu (câu đã làm vẫn hiện ở trên, sửa được) → “Câu tiếp ›” → … → lượt cuối mới có “Nộp bài”.
  Trạng thái ở `ST.vg = {i, ph: v|t|x, g:[{items, ans}], tx}`; giờ làm bài chỉ tính lúc làm câu. Bài làm dở theo kiểu cũ (`ST.vq`, từ vựng cả bài) đã qua
  phần từ thì làm tiếp như cũ, chưa qua thì làm lại theo từng câu. Trong đề từ được tô gạch chấm, chạm xem nghĩa, nút “Tách từng câu”, nút “Bảng từ”.
  Từ đã chọn đúng ở bài luyện tập trước không hỏi lại (localStorage `nari-tu-ok`). Mã nộp `NT2-` thêm `v:[đúng, số từ]` (cộng mọi lượt), `vw` (≤12 từ sai) →
  `results.vq`/`vw`, hiện ở phần chấm. Thi thật (không `lt`) như cũ. Bài hằng ngày theo Khung luyện tập (`ltCreate`) luôn là luyện tập (`lt:20`).
  Bảng từ theo câu: `python3 tools/tu_de.py [<dump>]` → `thi-thu/de/tu/<id>.json` ({w:[[từ gốc, nghĩa, số đề gặp, [chữ trong đề]]], q:{câu:[chỉ số]}};
  kiwipiepy, nghĩa như Từ cốt lõi, bỏ từ sơ cấp/`STOP`; đề nghe lấy thêm kịch bản ở đề `…k`, bài luyện nghe cùng file nghe, hoặc `explain` trong dump
  `bank/<id>/q` — dump cần ít nhất `bank/Etk083n/q`, `bank/Etk091n/q`, thiếu thì 2 đề này mất nửa số từ). **Chạy lại sau mỗi lần đồng bộ đề.**
  Danh từ làm tân ngữ ghi cả cụm động từ: “N을/를 (phó từ) V” → `N을/를 V다` (도움을 주다), “N을 하다” → `N하다` nếu có từ đó (공부를 하다 → 공부하다);
  không ghép với động từ mẫu ngữ pháp (`GRAM_V`: 을 통해, 을 위해…). Nghĩa cụm ở `tools/cum_de.tsv` (Claude soạn; `x` = không ghép), rồi mục “N을 V” của kho từ;
  cụm mới chưa có nghĩa thì script ghép tạm “nghĩa động từ + nghĩa danh từ” và ghi `<dump>/cum_de_thieu.tsv` → soạn nghĩa, thêm vào `cum_de.tsv`, chạy lại.
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

## Đánh dấu đã dạy → Tiến độ dạy (`danh-dau/`)
- Lớp 1:1 nhiều em cùng tiến độ: trong học liệu, cạnh tiêu đề từng phần/mục có nút 📌 (chỉ máy cô thấy), bấm → tick tên em, ngày tự ghi (sửa được ô “Ngày dạy”).
  Nút “📌 Cả phần” ở tiêu đề buổi (h2) đánh dấu / bỏ hết các mục của buổi. Nút 📌 trên thanh chọn buổi (cạnh “↺ Làm mới”; trang không có thanh thì nổi góc trái dưới):
  số dấu chưa gửi, “Chép mã gửi trang quản lý”, link bảng giảng Google Docs của buổi, “Ẩn nút khi chiếu cho học sinh” (localStorage `nari-dd-hide`).
- `danh-dau/dd.js` gắn cuối trang (`<script src="../danh-dau/dd.js"></script>`; đã gắn ở cau-5, 13-15, 16-18, 19-20, 25-27, ngu-phap-12/34, viet-51…54,
  viet-53/mau, seoul/2a-1, 3a-1, so-dem, tuong-dong, so-cap/noi-am). Trang học liệu mới thì gắn thêm dòng này. Tự tìm mục: `section.sec` = phần (h2),
  h3 con trực tiếp + h2 trong `.tab-page` = mục (phần không có mục thì cả phần là một mục); không có `section.sec` thì mỗi h2 là một mục.
  Khóa mục = id phần + tiêu đề bỏ số thứ tự → đổi tiêu đề thì dấu cũ hiện ở nhóm “Mục cũ” trong trang quản lý.
- Tên học sinh **không** vào repo: trang quản lý → Lớp học → lớp → thẻ “Tiến độ dạy” → “Cài tên học sinh vào máy cô” tạo link `danh-dau/#n=<base64 {s:[[id, tên ngắn]], m:[[trang, mục, id, ngày]]}>`
  → lưu localStorage máy cô (`nari-dd-st`, dấu `nari-dd-m`, chưa gửi `nari-dd-q`/`nari-dd-b`, mục lục trang `nari-dd-c`). Trang `danh-dau/` = cài đặt + xem dấu trên máy.
- Mã `ND1-<base64 {v, e:[[trang, mục, id, ngày, lúc, xóa?]], b:[[id, ngày, link, lúc]], c:{trang:{t, s:[[id phần, tên, #link, [[mục, tên]]]]}}}>-<sum>` → cô dán ở tab Chấm bài
  (`chamDay`) → collection `daydau`: `M<sum(trang|mục)>_<id em>` {k:"m", st, p, i, d, at}, `C<sum(trang)>` mục lục {k:"c", p, t, s:[{id, t, h, it:[{k, t}]}]},
  `B<id em>_<ngày>` link bảng giảng {k:"b", st, d, u, at}. Dấu mới hơn (`at`) thắng.
- Trang quản lý: thẻ “Tiến độ dạy” (bảng phần/mục × em, bấm ô để đánh dấu tay, lọc mục còn em chưa học), hồ sơ em → Lịch học: dưới mỗi buổi hiện đã dạy gì + bảng giảng,
  thẻ “Ngày có dấu đã dạy nhưng chưa ghi buổi” → “Ghi buổi” (điền sẵn nội dung + link). Code trong `tools/nangluc.js` (khối NLA, `td…`), móc bằng `nangluc.py`.

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
- Trang học liệu lưu bài làm ở localStorage (`var KEY` của trang) → mở lại vẫn hiện câu đã chọn. Mọi trang có `KEY` gắn `lam-moi.js`
  (`<script src="../lam-moi.js" data-key="<KEY>">` trong `<head>`): nút “↺ Làm mới” cuối thanh chọn buổi (đầu trang) xóa bài đã làm trên máy đó; link có `?moi`
  (vd. `viet-51/?moi#b=1`) tự xóa khi mở — cô dùng khi giảng. Trang học liệu mới cũng gắn script này.
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
- Ảnh quảng cáo / bài Facebook: địa chỉ ghi **naritopik.com** (không ghi `hoc.naritopik.com` — đó là link học nội bộ, chỉ gửi người có link).
  Mọi ảnh có dấu mờ giữa ảnh (biểu tượng trong vòng tròn có số Zalo, `<script src="../../quang-cao/wm.js"></script>` cuối trang) để ai cắt đầu/cuối ảnh vẫn còn tên + số cô.
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
  Viết kỳ 108 (18.10.2026, **đề thí sinh nhớ lại**, câu chữ theo bản của Tiếng Hàn Thầy Tư) đủ 51–54: `W51_108`…`W54_108` (đáp án 51–52 có nhiều cách viết, bài mẫu 53–54 do Claude soạn — giống bộ ảnh `fb/de-viet-108/`;
  ảnh `W53_108.jpg` = biểu đồ vẽ lại, chụp từ `fb/de-viet-108/4-cau-53-de.html` bỏ dấu mờ). Khi có đề công bố chính thức thì đối chiếu, sửa lại.
  Câu 53 kỳ 47, 70, 72–79 (`W53_047`, `W53_070`…`W53_079`): đề theo ảnh cô gửi (bản tổng hợp, kỳ 70–79 có thể là đề nhớ lại, chưa đối chiếu đề gốc),
  ảnh `thi-thu/viet/W53_<kỳ>.jpg` cắt bỏ dòng câu hỏi, bài mẫu + `blocks`/`hint`/`dang` do Claude soạn.
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
- Mọi bài từ vựng (link `#v=`, lộ trình `#l=`, app) có **Bước 0 “Học từ trước”** (`vLearnHTML`): bảng từ + nghĩa + câu ví dụ, 🔊 từ/câu; học sinh chép vào vở rồi bấm
  “Em chép xong · Bắt đầu làm bài” (`VS.learned`, đồng hồ `VS.start` tính từ lúc đó; vào bài không xem lại bảng). Bài làm dở từ trước (đã có đáp án) bỏ qua bước này.
  Dạng `cau` có nút **💡 Gợi ý** từng câu (`vHints`: mức 1 số âm tiết + chữ đầu, từ 1 âm tiết thì phụ âm đầu; mức 2 hiện hết trừ âm tiết cuối; `VS.hint[ô]`),
  không trừ điểm, tin nhắn kết quả ghi “Dùng gợi ý: N từ” (mã nộp không đổi).
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
- `tu-vung/tieu-de/` (trang học sinh, trang `tu-vung/` giữ nguyên, không đặt link sang): 63 tiêu đề câu 25–27 xếp theo nhóm từ `V25_*` (thứ tự như kho từ; câu ghép
  nhiều nhóm nằm ở nhóm số nhỏ nhất, còn lại “Chủ đề khác”), tô chữ của nhóm + nghĩa từ, tách khúc, 4 đáp án + bẫy, “Che đáp án” (localStorage `nari-2527td`).
  Không link sang `cau-25-27/` (giáo án của cô). Ghép tay ở `tools/tieu_de_tu.tsv` (câu, nhóm, chữ trong tiêu đề, từ trong kho hoặc trống = cùng chủ đề,
  ghi chú ≈ cách nói khác) → `python3 tools/tieu_de_tu.py` → `tu-vung/tieu-de/de.json` (lấy câu từ biến `R` của `cau-25-27/`). Sửa `R` hoặc nhóm V25 thì chạy lại.
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

## Từ vựng TOPIK trung cấp 30 ngày (`tu-30/`) — giáo trình “TOPIK Intermediate Vocabulary in 30 days” (박이정)
- Sách 30 Day × 33 từ (+ khung từ dễ nhầm, bài 복습). File cô gửi 22/10/2026 là PDF scan, chỉ tới Day 09; đã nhập **Day 1–3**. Cô dùng để luyện tập nên lấy
  nguyên câu ví dụ trong sách. Chưa có file mp3 của sách (track 01…) — cô tìm được thì thay máy đọc bằng file thật.
- Nguồn soạn tay `tools/t30/dNN.json` (từ: `ko, p 명/동/형/부, vi, hv, ex` câu sách có `__chữ__`, `exv` dịch, `r` 관련어, `tip`, `note` 출제 경향; `cf` khung dễ nhầm;
  `x` bài luyện sâu Claude soạn: `g` h họ từ / k kết hợp / c dễ nhầm, lựa chọn đầu là đáp án; `rv` bài 복습 của sách) → `python3 tools/t30.py <thư mục>` (cần kiwipiepy)
  → `tu-30/data/dNN.json` (thêm `k` số đề đọc có từ, `de` ≤ 2 câu trong 22 đề đọc, ưu tiên kỳ 83/91) + `<thư mục>/vocab/T30NN_1|2.json`
  → ArtifactData batch `set` collection `vocab` → đồng bộ kho từ `--vocab-only` (bỏ `VCD*`; khi `update` `site/kho` giữ dấu các phần cũ không có trong dump).
- Kho từ: phần `TOPIK 30 ngày · Day NN` (secOrder 200 + NN), nhóm Phần 1 = từ 1–17, Phần 2 = 18–33 (học sinh chia 2 ngày được), id `t30NN_MM` cố định.
  Trang `tu-vung/` bỏ các phần này. Giao hằng ngày: Lộ trình từ vựng chọn các phần `TOPIK 30 ngày`, 33 từ/ngày (hoặc 17 nếu chia 2 ngày), dạng nên có “Điền từ vào câu” (`cau`, dùng câu sách).
- Trang `tu-30/` (gửi học sinh, `#d=1&b=<bước>&p=all|1|2`): ① Học (thẻ từ, 🔊, 관련어, Tip, ★ số đề + câu trong đề, “Em thuộc”, “Che nghĩa”) · ② Nghĩa · ③ Điền câu sách ·
  ④ Họ từ · Kết hợp · ⑤ Dễ nhầm (khung sách + bài) · ⑥ Câu trong đề · ⑦ Dịch Việt → Hàn (câu sách ngắn, so LCS, tự chấm) · ⑧ Ôn (bài 복습 của sách); “Gửi kết quả cho cô”.
  localStorage `nari-t30`. Thêm Day: soạn `tools/t30/dNN.json`, chạy script (tự thêm vào `days.json`), ghi `vocab`, đồng bộ kho từ.

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

## Bài tập Seoul theo bài (`seoul/bai-tap/`) — trang học sinh, đã có 1A Bài 1–3, 2A Bài 1–3
- Link `seoul/bai-tap/#b=1A&c=1&t=v|g|r` (Từ vựng | Ngữ pháp | Kết quả); không có `c` = danh sách bài. Trang `seoul/` hiện dòng “Bài tập: Từ vựng · Ngữ pháp”
  dưới bài có trong biến `BT`. Chấm ngay từng câu, kèm giải thích; thẻ Kết quả → “Gửi kết quả cho cô” = link `#r=<base64>` (báo cáo: từ còn sai, đúng theo từng ngữ pháp, từng câu).
- **Từ vựng tự sinh** từ `thi-thu/vocab.json` (phần `Seoul 1A · Bài N · …`): mỗi từ vào đúng một dạng A Nghe – chọn từ (máy đọc) / B Hàn → Việt / C Việt → Hàn /
  D chọn từ điền câu ví dụ (`__…__`), thêm E gõ 5 từ; “Làm lại phần này” tăng `sd` → từ đổi dạng. F = câu soạn tay `v` trong data.
- **Ngữ pháp** soạn tay ở `seoul/bai-tap/data/<cuốn>-<bài>.json` = `{g:[tên 4 mẫu], v:[câu từ vựng F], q:[…]}`; câu `t:'c'` chọn (o[0] là đáp án, `x[i]` ghi chú lựa chọn sai),
  `t:'y'` gõ (`a` đáp án nhận, `e` {sai hay gặp: ghi chú}, `h` gợi ý), `t:'d'` dịch Việt → Hàn (`a` câu mẫu, khác thì em tự so); `g` = mẫu 1–4, 0 = tổng hợp. Chỉ dùng từ / ngữ pháp
  đã học tới bài đó. Thêm bài: soạn data, thêm vào `LS` của trang và `BT` của `seoul/index.html` (trang đầu tự chia nhóm theo cuốn). localStorage `nari-sbt`. Thêm câu dùng id mới.

## Kho ngữ pháp Nari (`ngu-phap-sau/`) — học liệu dạy sâu ngữ pháp của cô
- Trang `noindex`, cô dùng soạn bài + trình chiếu (nút góc trên: “Bản của cô” / “Bản chiếu cho học sinh” ẩn khung “Ghi chú cho cô”, localStorage `nari-nps`).
  Không đặt link từ trang học sinh (giống `seoul/3a-1/`). Link `#b=3A&c=2&g=3` (cùng kiểu `seoul/ngu-phap/`), `#v=cn` mục lục theo chức năng.
- Dữ liệu `ngu-phap-sau/data/<cuốn>-<bài>.json` (thêm tên vào biến `LS` trong trang): `tong` (tổng quan bài: t, p, tb) + `p:[{no, id (= id `grammar`, vd. g_3A_02_3), cn (chức năng),
  core, goc (cấu tạo / nghĩa gốc), chia (bảng), chiaNote, tinh:[{t, c bối cảnh, lv mức lịch sự, ko, vi, why}] (bản đồ tình huống), rb (ràng buộc), sai:[{x, o, why}],
  pb:[{vs, d, ex}] (phân biệt), topik:[{src, ko, note}], hoi:[{q, a}] (Cô hỏi), luyen:[{q, o (lựa chọn đầu là đáp án), w}], em (Câu của em), co (ghi chú cô)}]`. `**chữ**` = tô đỏ.
  Tên mẫu, số trang + khung “📖 Sách viết gì” lấy từ `seoul/ngu-phap/np.json` theo (cuốn, bài, no).
- Đã soạn: Seoul 1A Bài 1–3 + 2A Bài 1–3 + 3A Bài 1–3 (36 mẫu) + 3 chuyên đề. Câu đề TOPIK dẫn trong `topik` chỉ ghi câu đã kiểm tra trong `thi-thu/de/`.
- **Chuyên đề** (buổi gom các mẫu cùng chức năng nằm rải nhiều bài + ôn nền 1A–2B; cô chốt hướng học trước 3A theo nhóm): `data/cd-<id>.json` (thêm id vào biến `CDS`)
  = {t, ko, sub, tong, parts:[tên nửa buổi], p:[bước], co}; bước `{ref:'3A-1', no, part, m: phút, why}` dùng lại mẫu có sẵn, hoặc mẫu viết riêng cùng khung (`id` dạng `cd_…`, `t` tên,
  `src:{b,n,no}` để lấy khung “Sách viết gì”; mục nào thiếu thì trang bỏ qua). Link `#cd=` (danh sách), `#cd=gian-tiep` (giáo án buổi), `#cd=gian-tiep&g=3` (bước 3).
  Mẫu của bài có trong chuyên đề hiện nhãn “📚 Học trong chuyên đề …”.
- Mỗi mẫu (cả mẫu trong bài và bước chuyên đề) có thể thêm 2 mục: `doi` = **Chuyển từ câu gốc** (thẻ ví dụ: `{k: Kể|Hỏi|Bảo|Cấm|Nhờ|Rủ|Hứa, c hoàn cảnh, ai, g câu gốc,
  gv nghĩa, dh dấu hiệu nhận loại câu, b:[bước chuyển], gt câu gián tiếp, sat dịch từng chữ (gạch), vi dịch xuôi, dn ghi chú dịch}`, ô “em thử” lưu `ST.em`) và
  `go` = **Luyện chuyển câu** (gõ, tự chấm: `{k, c, ai, g, f khung có “(    )”, a:[đáp án nhận — so bỏ dấu cách/dấu câu], vi, w}`; học sinh chọn loại câu rồi gõ, lưu `ST.go`).
  Câu gián tiếp: `doi`/`go` ở 3A-1 mẫu 1 (kể), 3A-2 mẫu 2 (bảo/cấm/nhờ), 3A-3 mẫu 2 (hỏi), 3A-3 mẫu 4 (rủ); bước `cd_gt_lt` “Luyện tổng hợp” (cuối Nửa 1, 7 câu gốc
  cùng động từ 가다 đổi loại câu + bảng dịch xuôi theo loại câu + 22 câu gõ trộn); bước Tổng hợp thêm `doi`/`go` đổi ngôi, thời gian, nơi chốn.
  Thứ tự cô chốt (làm từng chuyên đề, cô duyệt rồi mới làm tiếp): 1 gián tiếp · 2 thời gian – lý do · 3 tiểu từ · 4 phỏng đoán · 5 -더- · 6 thái độ người nói · 7 bị động + mục đích · 8 nhượng bộ.
  Đã soạn `gian-tiep` (Câu gián tiếp, ~2 tiếng, 10 bước): Bước 0 한다체 + nhận loại câu (2B-18) · -다고 · -라고 · -냐고 · -자고 · Luyện tổng hợp câu gốc → gián tiếp ·
  rút gọn -대/-래/-냬/-재 · -다고 들었다 · -다고요? (3A Bài 8) · Tổng hợp (đổi ngôi/thời gian, động từ thuật, -겠다고, bỏ -시-).
  `thoi-gian-ly-do` (Thời gian – lý do, ~1 tiếng 45, 8 bước): Nửa 1 thời gian = Bước 0 nền -고/-아서/-고 나서/-다가/-(으)면서 (2A-7) · -자마자 · -았다가 (3A-7);
  Nửa 2 lý do = Bước 0 nền -아서/-(으)니까/-기 때문에/N(이)라서 (2B-13) · -느라고 · -다(가) nguyên nhân (3A-8) · -거든요 (3A-6, phân biệt -거든 “nếu… thì” — lựa chọn nhiễu
  câu 1–2 kỳ 41, 91) · Tổng hợp (bảng chọn đuôi, 3 bẫy, 12 câu gồm câu 1–2 kỳ 35, 41, 60, 91, 96). Đáp án câu đề thật lấy theo `R` của `ngu-phap-12/`.
  `tieu-tu` (Tiểu từ, ~1 tiếng 30, 7 bước): Nửa 1 phạm vi = Bước 0 nền 도 / 만 / 밖에 (+ phủ định) / số lượng + (이)나 (src 2A-9, cặp 70점이나 ↔ 70점밖에) ·
  누구나 / 무슨 N(이)나 (ref 3A-2 mẫu 4) · 아무 N도 (3A-6; bảng 아무도 / 아무나 / 누구나, lỗi “ai cũng không” → 누구나 안); Nửa 2 chọn lựa = Bước 0 (이)나 “hoặc” + 4 nghĩa
  của (이)나 (2A-1) · N(이)나 chọn tạm, rủ nhẹ (3A-4) · N(이)라도 (3A-5, phân biệt với (이)나, 만 / 밖에 / 조차) · Tổng hợp (bảng chọn tiểu từ, 12 câu gồm câu 1–2
  Yonsei 3, HOT 2, HOT 5, kỳ 52). Câu dẫn trong đoạn văn lấy từ đề luyện trong `thi-thu/de/` (kỳ thật chỉ có kỳ 64 câu 1, kỳ 52 câu 2, kỳ 91 câu 38).
  `dinh-ngu` (Định ngữ, cô yêu cầu cho lớp 2A–3B, ~2 tiếng 20, 10 bước, 3 nửa — ngoài thứ tự 8 chuyên đề trên): Nửa 1 = Bước 0 định ngữ là gì + A-(으)ㄴ N, N인 N (src 1B-14) ·
  V-는 N (src 1B-15) · ref 2A-2 mẫu 3 (-(으)ㄴ) · ref 2A-3 mẫu 4 (-(으)ㄹ) · bảng đã/đang/sẽ × loại từ + 12 câu gõ; Nửa 2 = ghép hai câu / đọc câu dài · định ngữ + danh từ phụ thuộc
  (chỉ -(으)ㄹ: 수 줄 때 뻔; chỉ -(으)ㄴ: 적 후 지; chỉ -는: 중 동안 바람에; theo thì: 것 같다 편 척 대로 탓; câu 1–3 kỳ 37, 47, 60, 96, 102); Nửa 3 = -던 · -았/었던 (chưa có `src` vì
  3B chưa nhập `grammar`) · Tổng hợp. Bài gõ không phải câu gián tiếp: `go` không có `k` → trang không hiện nút “Loại câu”; `goT` = tên riêng cho mục Luyện gõ.

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

## Kiểm tra sau mỗi bài Seoul 3A (`seoul/3a-kt/`)
- Hai phần (cô chốt): **bài về nhà** học sinh làm sau buổi học ở trường — chia 3 phần theo dạng Chọn · Gõ · Dịch Việt → Hàn (`qs`/`SEC`), trong mỗi phần các ngữ pháp để lẫn;
  **không có gợi ý** (cô bỏ): câu gõ phải tự đủ (câu nói trực tiếp đi trước, hoặc cho sẵn gốc từ như `찾(    )`), tick “Em không chắc”,
  link `seoul/3a-kt/#b=1`; nộp xong em tự so câu dịch với câu mẫu (trùng thì máy tự nhận), “Gửi kết quả cho cô” → link `#r=<base64>` = báo cáo cho cô:
  đúng theo từng ngữ pháp + phần trộn, lỗi quy về viên gạch (`NAME`/`GATE`: n1–n6 như `seoul/3a-1/`, `np` chọn sai mẫu, `tv` từ vựng/tiểu từ),
  “sai mà tưởng chắc”, từng câu kèm câu dịch của em. **Cô kiểm tra trên lớp** từng ngữ pháp: `seoul/3a-kt/?co#b=1&k=lop` (chỉ hiện khi có `?co`;
  cô hỏi miệng / dịch nói, bấm ✘ khi em sai → gom lỗi theo viên gạch, lưu trên máy cô).
- Dữ liệu biến `K['<bài>']` = {t, g:[4 mẫu], q:[{id, t: c|y|d, g, n, …}], co:[{g, lead, q:[[hỏi, đáp, viên gạch]], vn, ear}]}; lựa chọn đầu là đáp án,
  `x[i]` = viên gạch của lựa chọn sai i. Thêm câu dùng id mới. Đã soạn Bài 1 (21 câu). localStorage `nari-3akt`. Học sinh được gửi link này (khác `seoul/3a-1/`).

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
  Cuối mỗi thẻ nhóm (cô muốn bớt lý thuyết, luyện ngay sau từng nhóm): khối “📖 Ví dụ minh họa” (`.vd`, mỗi câu có nhãn mẫu `.tag`) + “✍ Luyện nhóm N”
  (`<div class="prac" id="pN">`, JS vẽ từ biến `P[N]` = `[loại, câu, đáp án, giải thích]`: `c` chọn (lựa chọn đầu là đáp án; “Câu nào sai?” thì lựa chọn đầu là câu sai),
  `y` gõ, `d` dịch Việt → Hàn (câu mẫu đầu + cách khác; trùng thì máy chấm, khác thì học sinh tự chấm), xen lẫn ~10 câu/nhóm; `st.p`, báo cáo gộp vào “Gửi kết quả cho cô”).
- `seoul/tu-de-hoi/` Từ để hỏi (học sinh lớp 3A hay nhầm): thẻ 10 từ hỏi (`#b=cb`, bản đồ + 5 nhóm), Vị trí & tiểu từ (`vt`: thay đúng chỗ, từ hỏi chủ ngữ luôn 이/가,
  bảng tiểu từ, rút gọn khẩu ngữ), Dễ nhầm (`nh`: 무슨/어느/어떤, 몇/얼마/얼마나/며칠, 어떻게/어때요/어떤, “sao” = 왜/어떻게/무슨 일로/웬일, 언제/몇 시…),
  Lịch sự (`ls`: “어떻게 되세요”, 4 kiểu đuôi hỏi, câu hỏi đề viết 54), Mở rộng (`md`: nghĩa bất định + ngữ điệu, 누구나/아무나/아무도, -는지/-냐고, câu tu từ), Luyện (`lt`).
  Cùng khuôn `so-dem/`: sau mỗi ý có ✋ Em thử (bộ `a1…f4`, danh sách `EM`, báo cáo gộp theo chữ cái đầu), 🗣 Nói to, 🎲 Quay câu (`HOI`/`VN`/`KN`).
  `M` trắc nghiệm (lựa chọn đầu là đáp án; `l3` tìm câu sai thì lựa chọn đầu là câu sai; `l4` phần tử 4 = câu máy đọc), `T` gõ (phần tử 4 `'d'` = khác đáp án thì em tự chấm “Em viết đúng / Em sai”). localStorage `nari-tdh`.
- Còn làm: Biến âm, Trợ từ.

## Đánh giá buổi học (`danh-gia/`)
- Phiếu dùng chung: `danh-gia/dg.js` gắn vào trang bằng `<div id="danhgia" data-buoi="<khóa>" data-title="…" data-parts="Phần 1|Phần 2"></div>` + script.
  8 câu: chung (5 mức), hiểu từng phần, tốc độ, lý thuyết/luyện tập, hoạt động thích nhất, tự tin dùng ngoài đời, chỗ chưa hiểu, góp ý; tên có thể để trống.
  “Gửi đánh giá cho cô…” chia sẻ đoạn chữ qua Zalo (không lưu lên mạng); nháp ở localStorage `nari-dg-<khóa>`.
- Trang riêng cho buổi bất kỳ: `danh-gia/#t=<tên buổi>&p=<phần 1>|<phần 2>`. `seoul/so-dem/` có sẵn phiếu thu gọn cuối trang (`#b=dg` mở thẳng).

## Giáo trình Cool TOPIK 쓰기 (câu 51–54) — Tài liệu gốc + thẻ “Cool TOPIK” ở viet-51/52/54
- File cô gửi 21/10/2026: Part 1 (51), Part 2 (52), Part 4 (54; tr.7–75 là ảnh scan), Part 5 (5 đề thi thử 51–54, **không có đáp án**). Part 3 (53) đã dùng trước cho `viet-53/`.
- Tài liệu gốc: `docs/Dcool`; ngữ pháp/biểu hiện `grammar/g_COOL_<51|52|54>_<nn>` (src `COOL`, 39 điểm: lưu ý 51, 16 cặp hô ứng + từ nối + đuôi -는다 của 52,
  dạng đề / khung mở–thân–kết / 글말 / 20 câu sửa lỗi của 54); đề viết `wbank`: `WC51_A01…A10` (bài “chọn tất cả”, đáp án = lựa chọn đúng theo sách),
  `WC51_01…10`, `WC52_01…10` (dự đoán), `WC54_P1…P5` (luyện dàn ý), `WC54_T1…T3` (30 phút), `WC54_B01…B10` (phụ lục, dàn ý sách trong `hint.a[0]`),
  `WC5x_M1…M5` (thi thử; ảnh câu 53 `thi-thu/viet/WC53_M<n>.jpg` cắt từ PDF), đề thật sách dẫn `W51_035`, `W51_060`, `W54_037`, `047`, `052`, `060`, `064`
  (bài mẫu chính thức 47/52/60 chép từ sách; còn lại đáp án / bài mẫu do Claude soạn, ghi ở `note`). Id `WC…` không có `round` nên đứng đầu danh sách Đề viết.
- `viet-51/#b=4`, `viet-52/#b=4`, `viet-54/#b=c` = thẻ **Cool TOPIK**: chiến lược theo sách + luyện chấm ngay. 51: bài “chọn tất cả” (`PK`, `st.pk`) +
  viết 5 phút (`PLAN[4]`, đề nhúng trong `QC`). 52: hô ứng / từ nối (`CQ`, trắc nghiệm, lựa chọn đầu là đáp án), viết nốt câu / đổi -는다 (`TY`, gõ, tự so),
  viết 5 phút (`PLAN[4]`). 54: văn viết + Cool TIP (`CQ.gm`), sửa câu (`TY.fix`), 28 đề sách (`CB`) thêm vào thẻ “Viết cả bài” (dàn ý sách `ol`, bài mẫu `model`).
  Bài lưu chung `st` của trang (nút “↺ Làm mới” xóa cả). Sửa đề trong `wbank` thì chép lại vào `QC`/`CB` của trang.

## Giáo trình Quick TOPIK 쓰기 câu 54 (`viet-54/quick/` + thẻ “Quick TOPIK” ở viet-54)
- File cô gửi 22/10/2026 (PDF scan): Unit 4 쓰기 54번 tr.138–177 (필수 표현 도입/전개/마무리, 6 문제 연습, Pass 전략, 어휘 연습 1–6) + Chapter 5 tr.180–237
  (12 분야 주제 × 2 đề; 출제 비중 높은 어휘 경제 85 · 사회 115 · 삶과 생활 100 · 과학·IT 100 · 환경 100 · 교육 chỉ tới câu 52 — các chủ đề sau chưa có file).
- Tài liệu gốc: `docs/Dquick`; `grammar/g_QUICK_54_01…24` = 24 nhóm biểu hiện (có dịch câu ví dụ), `25` Pass 전략, `26` Pass 정보, `27` 12 chủ đề, `28` 어휘 연습 1–6 (đáp án),
  `29…34` từ vựng theo chủ đề; đề viết `wbank/WQ54_01…06` (6 đề luyện, sách không in bài mẫu → bài mẫu Claude soạn bằng biểu hiện của sách), đã đồng bộ `thi-thu/viet/`.
- Trang `viet-54/quick/` (`noindex`; dữ liệu `data.js` biến `Q` = {G nhóm biểu hiện, E 6 đề, T 12 chủ đề, W từ vựng theo chủ đề, V bài từ 1–6, PASS}, sinh bằng script từ bản chép tay
  — sửa thẳng `data.js` được): `#b=bh&g=<id nhóm d1…m5>` Biểu hiện (★ mẫu hay dùng, ví dụ tô vàng, “Em thử” 3 câu/nhóm) · `#b=lb` Luyện (12 câu chọn biểu hiện + 6 câu dịch Việt → Hàn tự chấm)
  · `#b=de&e=WQ54_0n` 6 đề (bảng 생각해 보기, dàn ý gợi ý, bài mẫu tô biểu hiện, nút sang “Viết cả bài” của viet-54) · `#b=cd` 24 đề theo chủ đề (Claude tách 3 câu hỏi + gợi ý dàn ý)
  · `#b=tu` Từ vựng (mỗi phần 20 câu, chạm câu rồi chạm từ trong hộp) · `#b=pass` Chiến lược + “Gửi kết quả cho cô”. localStorage `nari-54q`.
- Đáp án bài từ 1–6 do Claude soạn (bài 3 sách in nhầm “문제2”; bài 3 câu 17 nhận cả 보완/정비; bài 6 hộp có “입장” thừa, “차이가 나다” dùng 2 lần).
- viet-54 thẻ `#b=q` “Quick TOPIK”: Pass 정보, bảng biểu hiện của sách theo kiểu đoạn (link sang `quick/#b=bh&g=…`), 6 đề vào “Viết cả bài” (biến `QK`, cùng khuôn `CB`). Nav viet-54 giờ 9 thẻ (5 cột).

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
- Thẻ **Từ vựng** (`viet-51/#b=tu`; trang học sinh `dau-hieu-51-52/#b=tu` chỉ có bảng cặp): thống kê động từ đáp án lấy từ đâu (78 ô: có sẵn trong bài 37 · danh từ trước ô gọi
  động từ đi cặp 31 · suy ra 9 · trái nghĩa 1), 4 bước soi đề, bảng cặp danh từ → động từ theo hoàn cảnh (nút “Che động từ”), luyện gõ động từ dạng gốc cho 72 ô
  (biến `TU` {'<kỳ><a|b>': [C|K|S|D, động từ nhận (|), chữ, giải thích có «chữ trong đề»]}, `st.tu`). `viet-52/` Bảng tra có khung ngắn: 28/32 ô câu 52 dùng lại từ trong bài.

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
- Thẻ **Khung đoạn** (`#b=k`, section `sk`; cô muốn “học tới đâu viết được tới đó” như khung câu 53): đơn vị học là **một đoạn ~200 chữ = khung 4 câu** (câu 1 trả lời câu hỏi + 3 tầng
  `먼저 · 또한 · 나아가/마지막으로`, câu kết tùy chọn). 29 câu hỏi của 10 đề (kỳ 37–108) chia 6 kiểu đoạn: ① Giải pháp 9/10 đề · ② Vấn đề 6 · ③ Ưu điểm 5 · ④ Lý do/nguyên nhân 5 ·
  ⑤ Hiện trạng/đặc điểm 3 · ⑥ Tán thành/phản đối 1. Ý đi theo **thang 3 tầng** (`KFR`): A gần → xa (cá nhân → tổ chức → nhà nước), B theo cách (luật → giáo dục → công nghệ),
  C một người 3 việc (hiểu biết → thái độ → thói quen). Đã soạn **① Giải pháp** (cô duyệt rồi mới làm ② ③): `KREAL` đoạn giải pháp bài mẫu chính thức 102, 96, 91, 83, 52 tách câu theo tầng,
  làm mẫu đề SNS, `CQ.gpt` chọn thang, `TY.gp` ghép câu, `KW` viết ngay đoạn (064, P01, 108, 037, 047; `ix` ý gợi ý, `md` 5 câu mẫu theo khung do Claude soạn) → `st.kd[id] = {v:[5 câu], h, sh, s}`,
  so từng câu với câu mẫu cùng chỗ (LCS). Báo cáo `renderSum('k')`/`kdRep`.

## Dịch đề câu 51–52 (`dich-51-52/`) — trang gửi học sinh, chỉ có đề
- Cô muốn học sinh dịch đề để quen nội dung câu 51, 52 hay ra (không có phần chiến thuật như `viet-51/`, `viet-52/` — 2 trang đó là giáo án của cô).
  36 đề câu 51 (kỳ 70–106, 4 nhóm: A hỏi/nhờ nơi dịch vụ, B gửi thầy cô/người quen, C bài đăng, D thông báo) + 16 đề câu 52 (S đời sống, T tâm lý – xã hội, K khoa học).
  Ô trống điền sẵn đáp án đầu tiên (`{…}` tô vàng). Mỗi câu: em dịch → “Xem bản dịch” → tự đánh dấu Đúng ý / Gần đúng / Sai; chế độ Hàn → Việt hoặc Việt → Hàn; thẻ “Câu hay gặp”.
- Dữ liệu biến `D` (`s:[[ko, vi]]`, `w` từ cần biết, bản dịch do Claude soạn; câu Hàn chép từ `Q` của `viet-51/`, `viet-52/`), `M51`/`M51b`/`M52`. Link `#b=51|52|mau`, `#b=51&q=W51_091`.
  Thêm đề mới vào `wbank` thì chép thêm vào `D`. localStorage `nari-dich5152`, “Gửi kết quả cho cô” chia sẻ đoạn chữ (kèm câu em đánh dấu Sai).

## Chuyên đề dấu hiệu nhận biết Đọc câu 1–50 (`dau-hieu/`) — bản nghiên cứu của cô (`noindex`, không đặt link từ trang học sinh)
- Cô muốn tổng kết thành một chuyên đề, đầy đủ và sâu (không rút gọn như bản gửi học sinh), có cả các dạng chưa có trang riêng; **các trang cũ giữ nguyên**.
- 5 họ dấu hiệu, mã chung cho mọi dạng: A Hô ứng `H` (+ `Q` ràng buộc vế sau ở câu 1–4: thì, kiểu câu, chủ ngữ vế sau loại đuôi) · B Từ nối 7 quan hệ `D` đảo chiều, `N` nhân quả, `T` thêm, `V` ví dụ, `L` nói lại, `K` kết luận, `C` chuyển ý ·
  C Dấu bám `B` (+ chuỗi từ khóa `W`) · D Ý chính `Y` (vị trí `y`: l câu cuối, d sau 그러나…, f câu đầu, m giữa, g tổng hợp) + thái độ / mục đích ·
  E bẫy của lựa chọn sai `x`: N ngược một chữ, T bài không nói, C chép chữ ghép sai, S đổi đối tượng, G đổi thời điểm / số liệu, A quá mức, H chi tiết hẹp, R ý bị lật / nhượng bộ, P lệch.
  Bảng đối chiếu nhãn cũ (16–18, 19–20, 52, 13–15, 25–27, 23–24) ↔ mã chung nằm trong thẻ B và E.
- Thẻ: Tổng quan (bản đồ dạng × họ, số liệu, bảng nhiệt, thứ tự dạy) · A · B · C · D · E · Dạng câu (`#b=dang&t=1-2`, 19 thẻ: 1-2, 3-4, 5-8, 9-10, 11-12 … 48-50; mỗi thẻ có
  “Số liệu dạng này” tính từ `index.json` + câu đề thi thật) · Luyện chéo (`#b=luyen&t=…&k=HD&id=Etk091-39`, lọc dạng / đề / mã) · Bảng tra. localStorage `nari-dhcd`.
- Dữ liệu `tools/dau_hieu/<dạng>.json` (1.126 câu, đủ 22 đề đọc cho mọi dạng; câu 1–4 thêm 9 kỳ thật Etk035…Etk102 trong `thi-thu/de/`)
  = `[{e, n, a (0-based), t (p điền ngữ pháp, u đồng nghĩa, v sản phẩm, l nơi chốn, z chiến dịch, g loại văn bản, s sắp xếp, o ô, y chủ đề, n nội dung, e tâm trạng, h tiêu đề,
  c chèn câu, d thái độ, m mục đích), k mã dấu hiệu, p vị trí manh mối (t trước ô, s sau ô, h hai bên, b trong <보기>), y, g chức năng đáp án câu 1–4 (`GNAME`: TG LC MD DK NB LD QS BS PD TT KN DG TU ML),
  c:[[chữ, mã]] (phải có đúng trong đề, câu ảnh thì trong `tx`), tx (chữ chép từ ảnh, câu 5–10 dạng ảnh), w giải thích, x:{chỉ số lựa chọn sai: mã bẫy}, xw:{chỉ số: ghi chú bẫy của trang cũ}, chk:1 = đáp án sách đáng ngờ}]`.
  Câu 1–5, 13–20, 23–27, 42–43 chép một lần từ `R` của các trang cũ (ngu-phap-12/34, cau-5, cau-13-15…; nhãn cũ đổi sang mã chung, ghi chú cũ ở `xw`) — sửa trang cũ thì trang này không tự đổi;
  câu 6–10, 21–22 soạn mới (đáp án theo bank). `python3 tools/dau_hieu.py [<dump>]` kiểm tra chữ tô, so đáp án với bank (dump `bank/<id>/q`), ghi `dau-hieu/data/*.json` + `index.json`. Đoạn văn trang đọc thẳng `thi-thu/de/`.
- Khi soát (23/10/2026) phát hiện bank `Etk091` sai đáp án 14 câu (19–34 trừ 27, 33; đúng: 19③ 20① 21③ 22④ 23① 24④ 25① 26③ 28① 29② 30③ 31③ 32④ 34②) và `Entk3` câu 2 (bank ①, đúng ④ 적응하느라고) — đã báo cô, chưa sửa bank.

## Chuyên đề Đồng nghĩa – trái nghĩa (`dong-trai/`) — bản nghiên cứu của cô (`noindex`, không đặt link từ trang học sinh)
- Câu hỏi của cô: có dấu hiệu đồng nghĩa / trái nghĩa giúp chọn đúng, loại sai không. Nghiên cứu 241 câu “nội dung khớp” (t = n trong `tools/dau_hieu`: câu 9–12, 20, 22, 24, 32–34, 43, 47, 50)
  của 22 đề đọc: đáp án đúng nói lại bằng chữ khác (90%; chỉ 25 câu chép gần nguyên), lựa chọn sai giữ chữ của bài đổi một chỗ (349 lựa chọn, 84% số câu có).
- Thẻ: Tổng quan · Đáp án đúng (7 cách: D đồng nghĩa, H Hán ↔ thuần Hàn, U suy ra, K gói chung, P nói ngược + phủ định, S tính số, C chép) + 30 cặp đồng nghĩa từ đề ·
  Bẫy đổi chữ (T trái nghĩa, F thêm/bỏ phủ định, B đảo so sánh, L phạm vi, G thời điểm/số; + S, R, O) + bảng cặp trái nghĩa · Chữ tín hiệu (tỉ lệ lựa chọn có chữ X là đáp án:
  전혀 0/7, 관계없다 2/19, 항상 1/11, 처음/이미 2/16, -기도 하다/-ㄹ 수도 있다 11/12; 모두/만 ≈ ngẫu nhiên) + tiền tố Hán phủ định · Cách làm 4 bước (mẫu kỳ 91 câu 32) ·
  Luyện (“Cùng ý hay khác ý?” 10 cặp/lượt; câu đề, tô cặp chữ sau khi chọn). Link `#b=tong|dung|bay|tu|cach|luyen`, `#b=luyen&m=de&n=32`, `#b=luyen&m=de&id=Etk091-32`. localStorage `nari-dongtrai`.
- Dữ liệu soạn tay `tools/dong_trai/*.txt`, mỗi dòng: `<đề> <câu> | <cách đáp án nói lại> | bài=>đáp án ; … | <i>:<kiểu> bài=>lựa chọn i ; …` (chữ phải có đúng trong đề / `tx`)
  → `python3 tools/dong_trai.py` (kiểm tra, thống kê, đếm chữ tín hiệu `SIG`) → `dong-trai/data.json`. Số trong phần chữ tĩnh của trang (90%, 25/241…) viết tay — chạy lại script thì đối chiếu.

## Dấu hiệu nhận biết câu 51–52 (`dau-hieu-51-52/`) — trang gửi học sinh
- `viet-51/`, `viet-52/` là bản trình chiếu của cô; trang này chỉ gom **dấu hiệu nhận biết** (thấy chữ gì quanh ô → viết mẫu gì) cho học sinh tự học.
  Thẻ Câu 51 (chữ sau ô · ô cuối câu 6 nhóm · ô giữa câu · tiêu đề/kính ngữ/thì · bảng tóm tắt 72 ô), Câu 52 (chữ sau ô · từ nối → đuôi 7 nhóm · ô giữa câu ·
  Chép hay Lật · từ đi theo cặp · bảng tóm tắt 32 ô), Luyện nhanh (38 câu = `MCQ` Buổi 1–2 của `viet-51/` + `viet-52/`, lựa chọn đầu là đáp án; “Gửi kết quả cho cô”).
  Nút “Che mẫu cần viết” để tự kiểm tra. Link `#b=51|52|luyen`, `#b=luyen&s=51a|51b|52a|52b`. localStorage `nari-dh5152`.
  Sửa dấu hiệu / câu luyện ở `viet-51/`, `viet-52/` thì chép lại vào đây.
  Thẻ **Từ vựng** (`#b=tu`): chỉ liệt kê bảng cặp danh từ → động từ theo hoàn cảnh (chép từ thẻ Từ vựng của `viet-51/`, nút “Che động từ”);
  thống kê + bài luyện chỉ có ở giáo án `viet-51/` (cô không muốn đưa vào trang học sinh). Sửa bảng cặp ở `viet-51/` thì chép lại vào đây.

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

## Tự luyện ngữ pháp câu 1–4 trong 20 ngày (`ngu-phap-luyen/`)
- Trang gửi học sinh trước kỳ thi (cô chọn “cách 2”): cô gửi **mỗi ngày một link** `ngu-phap-luyen/#d=1…20` qua Zalo; học sinh chỉ thấy các ngày tới link
  đã mở (`st.max`), ngày sau hiện 🔒. Trang của cô `ngu-phap-luyen/?co` (thẻ “Tin nhắn”) có sẵn 20 tin nhắn + nút Chép, mở trước mọi ngày.
- Lộ trình: Ngày 1–11 mỗi ngày một nhóm chức năng (biến `PLAN`: tên, nhóm kho từ `V01_*`/`V03_*` đọc từ `thi-thu/vocab.json`, “Chỗ hay nhầm” `tip`)
  → kiến thức + ≤ 14 câu của nhóm + ≤ 6 câu ôn đến hạn; Ngày 12 ôn, 13 kiểm tra 1 (đề thật kỳ 83, 91, 8 câu, 4 phút, chấm khi nộp), 14–17 trộn 10 câu
  (câu đến hạn, câu dư `m:1` của các nhóm, câu chưa làm), 18 ôn câu sai, 19 kiểm tra 2 (kỳ 96, 102), 20 về đích (Bảng tra + 10 câu yếu nhất).
  Bài của ngày tạo lúc mở lần đầu rồi giữ nguyên (`st.d[ngày] = {ids, rv, a, t0, sub, dur}`); ôn ngắt quãng `st.q[id] = {b, due, n, w, ok}` (sai → mai; đúng → 3, 7, 14 ngày; đúng lần thứ 4 = thuộc).
  Thẻ Kiến thức = 2 bảng ngữ pháp câu 1–2 / 3–4 của kho từ (giống `tu-vung/`, `#k=kt&c=12|34`), thẻ Bảng tra = mọi `tip`. localStorage `nari-np20`.
- Biến `R` (173 câu, sinh một lần): 61 câu `R` của `ngu-phap-12/` + 60 của `ngu-phap-34/` (giữ id, `w`) + 80 câu trang “Luyện tập Ngữ pháp TOPIK II”
  (https://claude.ai/artifact/1mkNvmWjkjFwgxHinJfiXk, id `L<số>`, giải thích HTML `e`), bỏ 27 câu trùng và 1 câu lỗi (gạch chân không khớp đáp án).
  4 câu sách 3급 sai đáp án đã sửa ở đây (L11 열리는데, L14 나오느라고, L17 아프거나, L23 맡게 됐다; trang claude.ai gốc chưa sửa).
  L47 (셈이다 → 편이다), L51 (편이다 → 셈이다) giữ lại theo ý cô: không trùng nghĩa nhưng 3 đáp án kia sai hẳn → giải thích “chọn đáp án gần nghĩa nhất”.
  `k` 12|34, `d` ngày học, `x` 13|19 = câu kiểm tra (không vào ngày học), `m` câu dư dành cho ngày trộn. Lựa chọn giữ thứ tự gốc.
- Bổ sung (cô góp ý 22/10): mỗi câu có `v` = nghĩa tiếng Việt (câu 1–2 để “(…)” chỗ trống; câu 3–4 `[…]` = nghĩa phần gạch chân, tô vàng).
  **💡 Gợi ý** 2 mức trên 4 đáp án (`D.h[id]`): mức 1 hiện nghĩa câu, mức 2 bỏ 2 đáp án sai (`outOf`, cố định theo id); đúng mà có xem gợi ý → mai ôn lại
  (`srs(id, ok, hinted)`), báo cáo ghi số câu xem gợi ý; ngày kiểm tra không có gợi ý. Sau khi chọn luôn hiện “Nghĩa:”.
  Bảng kiến thức: câu ví dụ có nghĩa Việt (biến `EXV` theo id mẫu trong kho từ, `[…]` = phần ứng với mẫu); mỗi nhóm có nhãn `GN[id nhóm] = [T|C|L, ghi chú]`
  (T thay thế được · C thay được có điều kiện · L liệt kê, không thay cho nhau — mọi nhóm câu 1–2 là L, ghi rõ cặp nào trong nhóm thay được).
  Thêm/sửa mẫu trong nhóm `V01_*`/`V03_*` của kho từ thì thêm nghĩa vào `EXV` (mẫu chưa có nghĩa chỉ hiện câu Hàn).
  Ngày 1–11 có phần **“2. Dịch câu · luyện chỗ hay nhầm”** (trước phần Luyện; chiều **Hàn → Việt**; cô muốn bám đúng “Chỗ hay nhầm” của ngày):
  biến `TR[ngày] = [[câu Hàn có __ngữ pháp__, bản dịch có [phần ứng với mẫu], mẫu, nghĩa mẫu]]` (7–10 câu/ngày, Claude soạn; mỗi mẫu nêu trong `tip` một câu,
  cặp dễ nhầm đứng cạnh nhau) → học sinh gõ nghĩa tiếng Việt → “Xem bản dịch” → tự chấm Đúng ý / Chưa đúng (`D.tr['t<ngày>_<i>'] = {t, c, m}`). Sửa `tip` thì sửa `TR` theo.

## Học câu 5 quảng cáo sản phẩm (`cau-5/`)
- Cùng khung với `cau-16-18/`. Ý cô: học từ vựng gắn với cách ví von của quảng cáo, luyện **hai chiều** (đồ vật → chọn tất cả cụm của nó; quảng cáo → đồ vật).
  Buổi 1 (bảng cụm theo 6 nhóm đồ vật dễ nhầm, “Che nghĩa”; luyện xuôi chọn nhiều + ngược theo nhóm), Buổi 2 (5 kiểu tín hiệu K kết quả / S so sánh / D động từ /
  B chức năng / V thứ được xử lý; chuỗi suy luận 3 bước kết quả → việc → đồ vật `CH`; bẫy chữ `MCQ[2]`; 6 câu đề thật hiện từng dòng, ghi chọn ở dòng mấy),
  Buổi 3 (16 câu như thi, 30 giây/câu), Ôn (ôn ngắt quãng thẻ cụm `c:<đồ vật>:<i>` + câu đề thật `r:<id>`), thẻ “22 câu”, Bảng tra. Link `cau-5/#b=1|2|3|on|all|tra`, `#b=all&q=<id đề>`.
- Nghĩa tiếng Việt: bảng học hiện sẵn; trong bài luyện ẩn, chọn xong mới hiện, nút 👁 xem trước (đếm vào báo cáo, ở Ôn thì đúng mà có xem vẫn ôn lại ngày mai).
- Biến `R` = 22 câu 5 (16 câu đề là ảnh, chữ chép tay từ ảnh; đáp án `a` 0-based, đã đối chiếu `bank/<đề>/q/q05`): `l` dòng, `v` nghĩa, `c` chữ quyết định (phải có đúng trong `l`),
  `k` tín hiệu, `x[i]` bẫy lựa chọn sai (G cùng nhóm / C chữ bẫy / K không liên quan). `P` = 30 đồ vật {vi, n: đồ vật dễ nhầm, c:[[ko, vi, 1 = ví von]]} — mỗi cụm chỉ đồ vật đó dùng được,
  `c[1]` là cụm phân biệt (bài ngược dùng `c[1]` + câu ví von đầu); `G` nhóm; `OV` cặp quá gần không lấy cụm của nhau làm nhiễu; `PX` nghĩa đồ vật chỉ làm lựa chọn nhiễu. localStorage `nari-5`.

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

## Học câu 23–24 tâm trạng trong tùy bút (`cau-23-24/`) và câu 42–43 tiểu thuyết (`cau-42-43/`)
- Hai trang riêng, cùng khung với `cau-19-20/` (một bài = đoạn văn + 2 câu; câu sau mở khi làm câu trước; ✕ gạch lựa chọn; Buổi 1–3, Ôn ngắt quãng 5 bài/lượt,
  thẻ tất cả bài, Bảng tra; 23–24: 2 phút/bài, localStorage `nari-2324`; 42–43: 2:30/bài, `nari-4243`). Link `#b=1|2|3|on|all|tra`, `#b=all&q=<id đề>`.
- Chiến thuật rút từ đề: câu gạch chân không chứa sẵn từ trong đáp án, là phản ứng cơ thể / quán ngữ / hành động / lời nói / cảnh → tìm **nguyên nhân** câu trước
  (9/22 bài phải đọc cả câu sau; gạch chân là cảnh thì cảm xúc ở câu sau) → chia + / − → chọn sắc thái (10 cặp dễ nhầm `CONF`). 42–43 thêm: khoanh tên nhân vật
  (7/19 bài hỏi người khác “tôi”; đề thật 83 hỏi ‘부모님’, 91 hỏi ‘미연’), đúng người – đúng lúc, gạch từ tả tính cách, câu 43 đáp án diễn đạt lại / suy ra.
- Dữ liệu `R` trong trang (22 bài 23–24 từ 22 đề đọc; 19 bài 42–43 — bỏ `Eebs1` vì đề không có câu gạch chân, kỳ 83/91 không công bố đoạn văn, chỉ để câu hỏi + lựa chọn
  ở Bảng tra): đoạn văn, câu hỏi, lựa chọn lấy từ `thi-thu/de/*.json`; đáp án `a`/`a2` (0-based) theo `bank`, **trừ `Etk091` câu 23–24** (bank ghi ④/①, đề thật là ① 의심스럽다 / ④).
  Chú giải Claude soạn: `u` dạng câu gạch chân (B cơ thể, Q quán ngữ, H hành động, L lời / suy nghĩ, C cảnh), `k` họ cảm xúc (`FAM`: S bất ngờ, F lo sợ, H xấu hổ – áy náy,
  B buồn – tiếc, A bực – oán, D nghi ngờ, P vui – yên tâm, T thái độ), `s` nguyên nhân ở t trước / s sau / h cả hai, `v` nghĩa câu gạch chân, `c` nguyên nhân (tô vàng, phải có
  đúng trong đoạn văn), `m` nghĩa 4 lựa chọn, `x[i]` bẫy (V ngược chiều, L khác loại, M gần nghĩa, G sai lúc, A sai người, K không phải cảm xúc, N ngược bài), `c2` chỗ chứa
  đáp án câu sau (tô xanh), `x2[i]` (N, T bài không nói, S đổi người, C đổi chi tiết, A quá mức, K chép chữ), `pp` đáp án câu sau diễn đạt lại, `wh` người được hỏi (khi câu hỏi
  không có tên trong ‘ ’), `tp` tên tác phẩm (chỉ ghi khi chắc). `BODY` (biểu hiện → cảm xúc), `EMO` (từ theo họ), `CONF`, `MCQ` (câu tự soạn, lựa chọn đầu là đáp án) dùng chung
  hai trang. Sửa thẳng trong `index.html` của từng trang (code giống nhau, sửa một trang thì sửa cả trang kia).

## Học câu 25–27 tiêu đề báo (`cau-25-27/`)
- Cùng khung với `ngu-phap-34/`: Buổi 1 (luật rút gọn của tiêu đề, quan hệ hai nửa, chữ cuối → thời điểm, quy trình 4 bước, 6 bẫy), Buổi 2 (ẩn dụ/quán ngữ theo nhóm nghĩa, biến `GL`),
  Buổi 3 (làm như thi, 40 giây/câu), Ôn (ôn ngắt quãng 10 câu), thẻ “63 câu” (giải thích từng câu, lọc theo buổi/quan hệ, “Che đáp án”), Bảng tra. Link `cau-25-27/#b=1|2|3|on|all|tra`, `#b=all&q=<id>`.
- Biến `R` = 63 câu 25–27 của 21 đề đọc đủ 50 câu (`Etk091` + 20 đề luyện; tiêu đề + lựa chọn lấy từ `thi-thu/de/*.json`) + đáp án `a`, tách khúc `t`, nghĩa `v`,
  giải thích `w`, `x[i]` = bẫy của đáp án sai (`N` nghĩa đen, `D` đảo nhân quả, `G` sai thời điểm, `C` ngược nghĩa, `T` thêm ý, `P` sai đối tượng) do Claude soạn.
  Đề thật giữ thứ tự ①–④; `MCQ` câu tự soạn (lựa chọn đầu là đáp án, trang tự đảo). Bài lưu localStorage `nari-2527`.

## Đọc hiểu đoạn văn (`doc-hieu/`) — bản trình chiếu của cô (dạy trên lớp, không giao bài)
- Trang `noindex`, không đặt link từ trang học sinh. Chọn đề → đoạn văn (đọc thẳng `thi-thu/de/<id>.json`, đoạn = câu có `passage` + các câu `share` theo sau;
  câu 1–4 lấy `stem`; câu ảnh hiện ảnh). Link `doc-hieu/#e=Etk091&n=21&b=tu|np|doc|tach|doan|cau&s=<câu>`. Nút A−/A+, “⛶ Chiếu” (toàn màn hình, chữ to; localStorage `nari-dh`).
- 6 thẻ: ① Từ vựng (che nghĩa, chạm ô để hiện) · ② Ngữ pháp (mẫu + câu trong bài) · ③ Thứ tự đọc (bấm bước → tô câu cần đọc, tín hiệu logic tô màu, bản đồ vai trò từng câu)
  · ④ Tách câu (mở dần 6 bước: câu gốc → khung câu → tách cụm theo vai trò → nghĩa từng cụm → xếp theo thứ tự tiếng Việt → câu dịch; phím ← → bước, ↑ ↓ câu)
  · ⑤ Cả đoạn (bật/tắt tô từ, ngữ pháp, tín hiệu, số câu, dịch song song, “Cô hỏi”) · ⑥ Câu hỏi (đáp án + vì sao sai). Chạm từ gạch chấm → nghĩa.
- Đoạn **chưa phân tích**: từ vựng tự lấy từ `thi-thu/de/tu/<id>.json` (★ số đề), câu tự tách; các thẻ khác báo “nhắn Claude: phân tích đề X câu Y”.
- **Phân tích** (cô nhắn “phân tích đề <id> câu <n>”): Claude soạn `doc-hieu/data/<đề>-<câu đầu>.json` = {e, n:[câu], t, cd, y ý chính,
  doc:[{t, d, s:[chỉ số câu cần tô]}] thứ tự đọc, l:[[chữ, loại TG|GT|CH|TD|NN|DL|KL|VD|TH, giải thích]] tín hiệu,
  s:[{c:[[cụm, vai trò CN|TN|VN|VP|DN|TR|NOI, nghĩa, thứ tự trong câu dịch 1…]], g khung câu, gv, r vai trò câu, y ý câu, vi câu dịch, tip mẹo dịch}],
  w:[[từ gốc, nghĩa trong bài, Hán Việt, chữ trong bài (| ngăn), ghi chú]], wo (từ trong câu hỏi/lựa chọn, cùng dạng), g:[{p mẫu, m nghĩa, f chữ trong bài, d, ex:[[ko, vi]]}],
  qa:{câu:{a (0-based), w, x:[vì sao sai]}}, hoi:[{q, a}]}; `**chữ**` = in đậm. Đáp án đối chiếu `bank` (trong `thi-thu/de/` không có đáp án).
  Rồi `python3 tools/doc_hieu.py` (kiểm tra cụm ghép lại đúng từng câu và đúng đoạn văn, chữ cần tô có trong đoạn; ghi `doc-hieu/index.json`). Chạy lại cả sau khi đồng bộ đề.
- Đã phân tích: kỳ 91 câu 19–20, 21–22.

## Facebook (`fb/`)
- `fb/ca-nhan/`: bài cho trang cá nhân "Tiếng Hàn Ngân Nguyễn" (cô có ảnh đại diện thật, giọng văn kể chuyện, lồng từ Hàn). `bia.html` ảnh bìa 1640×924
  (chữ để trên + hai bên, vì trên điện thoại ảnh đại diện che giữa phía dưới), `ghim-1` bài ghim, loạt “Một từ, một câu chuyện” `tu-NN-*.html`
  (khung `tu.css`, từ lấy từ phần `Cốt lõi` của `thi-thu/vocab.json` + số đề trong `tu-vung/de.json`), lời đăng ở `caption.md`.
  Dùng chung `quang-cao/topik2-len-3-4/base.css`. Chụp PNG: `node tools/chup_anh.js fb/ca-nhan/*.html` (cỡ khác 1080×1350 ghi `<meta name=size content="WxH">`).
- `fb/de-viet-108/`: đề viết kỳ 108 (18.10.2026, đề thí sinh nhớ lại, câu chữ theo bản của Tiếng Hàn Thầy Tư) — 2 ảnh đề sạch `de-1`/`de-2` cho bài chính,
  ảnh đáp án đăng ở comment: bìa, 51, 52 (đáp án + cách viết khác), 53 đề (biểu đồ vẽ lại bằng SVG) + bài mẫu, 54 đề + dàn ý + bài mẫu; `de.css`, lời đăng `caption.md`.
- Cô: cử nhân Quản trị kinh doanh Đại học Daegu, đang ở Quỳnh Lưu, dạy trực tiếp tại Quỳnh Lưu + online toàn quốc.
