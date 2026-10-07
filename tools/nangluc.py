#!/usr/bin/env python3
"""Chèn module "Đánh giá năng lực" (tools/nangluc.js) vào trang.

Cách dùng:
  python3 tools/nangluc.py <file-html-trang-quan-ly>   # sửa tại chỗ: phần chung + khối Admin + tab "Học sinh"
                                                        # rồi Artifact publish file đó (url trang quản lý)
                                                        # và python3 tools/sync_thi_thu.py <file> để cập nhật site
  python3 tools/nangluc.py --site                       # chỉ sửa phần học sinh thấy: chèn lại phần chung vào
                                                        # thi-thu/index.html, không cần tải trang quản lý

Chạy lại bao nhiêu lần cũng được: bản cũ giữa hai dấu ==NL== / ==NLA== được thay bằng bản mới.
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "nangluc.js")
SITE = os.path.join(ROOT, "thi-thu", "index.html")

BOOT_MARK = "/* ---------- boot ---------- */"
ADMIN_END = "  return { init:init, render:render };\n})();"
OLD_BOOT = "!ngheBoot()) studentLanding();"
NEW_BOOT = "!ngheBoot() && !reportBoot()) studentLanding();"
HOOKS = [  # (cũ, mới): còn chỗ cũ thì thay; đã là bản mới thì bỏ qua. Tab "Học sinh" thay 3 tab Học viên & lịch, Đánh giá, Sổ điểm.
    ('var S = { tab:"hocvien",', 'var S = { tab:"hocsinh",'),
    ('tabBtn("hocvien","Học viên & lịch") + tabBtn("lop","Lớp học") + tabBtn("danhgia","Đánh giá")', 'tabBtn("hocsinh","Học sinh") + tabBtn("lop","Lớp học")'),
    (' + tabBtn("so","Sổ điểm")', ''),
    ('    if(S.tab === "giao") renderGiao(body);\n',
     '    if(S.tab === "hocvien" || S.tab === "danhgia" || S.tab === "so") S.tab = "hocsinh";\n    if(S.tab === "hocsinh") renderHocSinh(body);\n    else if(S.tab === "giao") renderGiao(body);\n'),
    ('    else if(S.tab === "so") renderSo(body);\n', ''),
    ('    else if(S.tab === "hocvien") renderStudents(body);\n', ''),
    ('    else if(S.tab === "danhgia") renderDanhGia(body);\n', ''),
    ('    if(S.tab === "danhgia" && S.nlId) return;\n', '    if(S.tab === "hocsinh" && S.nlId && S.hpt === "nx" && kind !== "students") return;\n'),
]


def parts():
    js = open(SRC, encoding="utf-8").read()
    shared, admin = js.split("/* ==ADMIN==", 1)
    admin = admin.split("\n", 1)[1]
    return shared.rstrip("\n"), admin.rstrip("\n")


def put(src, start, end, body, anchor):
    """Thay đoạn start..end (kể cả dấu); chưa có thì chèn ngay trước anchor."""
    block = start + "\n" + body + "\n" + end + "\n"
    i = src.find(start)
    if i >= 0:
        j = src.index(end, i) + len(end) + 1
        return src[:i] + block + src[j:]
    k = src.index(anchor)
    return src[:k] + block + src[k:]


def boot(src):
    if NEW_BOOT not in src:
        assert src.count(OLD_BOOT) == 1, "không thấy dòng khởi động trang"
        src = src.replace(OLD_BOOT, NEW_BOOT)
    return src


def admin_page(path):
    src = open(path, encoding="utf-8").read()
    shared, admin = parts()
    src = put(src, "/* ==NL== */", "/* ==/NL== */", shared, BOOT_MARK)
    src = put(src, "  /* ==NLA== */", "  /* ==/NLA== */", admin, ADMIN_END)
    for old, new in HOOKS:
        if old in src:
            assert src.count(old) == 1, "chỗ móc bị lặp: " + old
            src = src.replace(old, new)
        else:
            assert not new or new in src, "không thấy chỗ móc: " + old
    src = boot(src)
    open(path, "w", encoding="utf-8").write(src)
    print("Đã chèn Đánh giá năng lực vào", path)


def site():
    src = open(SITE, encoding="utf-8").read()
    src = put(src, "/* ==NL== */", "/* ==/NL== */", parts()[0], BOOT_MARK)
    src = boot(src)
    open(SITE, "w", encoding="utf-8").write(src)
    print("Đã cập nhật phần Đánh giá trong thi-thu/index.html")


if __name__ == "__main__":
    if sys.argv[1:] == ["--site"]:
        site()
    elif len(sys.argv) == 2:
        admin_page(sys.argv[1])
    else:
        print(__doc__)
