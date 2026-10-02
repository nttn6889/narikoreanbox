# Hàn Ngữ Nari — trang web cho học sinh

Site tĩnh, deploy bằng Netlify từ repo này (mỗi lần push nhánh chính là site tự cập nhật).

## Phòng thi thử (`thi-thu/`)
- Trang **quản lý** của cô vẫn nằm trên claude.ai: https://claude.ai/artifact/7EWoCB9sEomX2FHY8d1QY8
  (dùng cơ sở dữ liệu của artifact: ngân hàng đề, học viên, sổ điểm). Cô giao bài ở đó.
- `thi-thu/index.html` là bản **chỉ dành cho học sinh**, được sinh tự động — không sửa tay.
- Đồng bộ sau khi cô giao/đóng bài:
  1. Đọc artifact trên bằng Artifact tool (`action: "read"`), lấy đường dẫn file HTML đã lưu.
  2. `python3 tools/sync_thi_thu.py <file-html>` — tách ảnh ra `thi-thu/img/`, bỏ phần quản lý.
  3. Kiểm tra bằng Playwright (nhập mã bài, làm, nộp), rồi commit + push.
- Sửa giao diện/chức năng phía học sinh: sửa trong artifact gốc (để trang quản lý dùng chung), rồi chạy lại bước đồng bộ.

## Lưu ý
- Repo không được chứa tên, điểm, nhận xét của học sinh.
