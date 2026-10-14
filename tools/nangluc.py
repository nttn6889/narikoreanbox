#!/usr/bin/env python3
"""Chèn module "Đánh giá năng lực" (tools/nangluc.js) vào trang.

Cách dùng:
  python3 tools/nangluc.py <file-html-trang-quan-ly>   # sửa tại chỗ: phần chung + khối Admin + tab "Đánh giá"
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
# Đánh giá giờ nằm trong tab Học sinh của trang quản lý (đã móc sẵn trong trang), không thêm tab riêng nữa.
BUOI_LINE = '    db.collection("buoi").onSnapshot(function(s){ S.buoi = s.docs.map(function(d){ var x = Object.assign({}, d.data()); x.id = d.id; return x; }); softRender("buoi"); }, dbErr);\n'
HOOKS = [  # (đã có thì bỏ qua, chưa có thì thay)
    # Học phí (Học sinh → Học phí): tải collection hocphi
    ('db.collection("hocphi")', BUOI_LINE, BUOI_LINE +
     '    db.collection("hocphi").onSnapshot(function(s){ S.hocphi = s.docs.map(function(d){ var x = Object.assign({}, d.data()); x.id = d.id; return x; }); softRender("hocphi"); }, dbErr);\n'),
    # Sửa thông tin học viên không làm mất cách tính học phí
    ('if(x.fee) doc.fee = x.fee;', '      if(x.app) doc.app = x.app;\n      var id = st ? st.id : "H"',
     '      if(x.app) doc.app = x.app;\n      if(x.fee) doc.fee = x.fee;\n      var id = st ? st.id : "H"'),
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
    for done, old, new in HOOKS:
        if done not in src:
            assert src.count(old) == 1, "không thấy chỗ móc: " + old
            src = src.replace(old, new)
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
