#!/usr/bin/env python3
"""Tạo trang thi thử cho học sinh (thi-thu/) từ bản HTML của trang quản lý trên claude.ai.

Cách dùng:  python3 tools/sync_thi_thu.py <file-html-tai-ve-tu-artifact>

- Chỉ giữ phần học sinh: bỏ khối quản lý (Admin) và đoạn khởi động kết nối claude.ai.
- Tách ảnh base64 trong đề ra thư mục thi-thu/img/ (tên file theo mã băm nên không trùng).
- Đổi link "Về cô" sang link trong config bên dưới.

Bài thi giao kiểu mới (link #d=…) và bài từ vựng không cần bước này; chỉ cần khi sửa mã trang.
Ngân hàng đề và kho từ đồng bộ riêng bằng tools/sync_kho.py.
"""
import base64, hashlib, json, os, re, sys

from sync_kho import clean_images

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "thi-thu")
ABOUT_URL = "../ve-co/"

# Cài thành app trên điện thoại (PWA): manifest + biểu tượng + service worker (thi-thu/sw.js).
APP_HEAD = """<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#1b2a5c">
<link rel="icon" type="image/png" href="icon/favicon-64.png">
<link rel="apple-touch-icon" href="icon/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Hàn Ngữ Nari">
"""
# Trang đầu "Bài của em", ô dán link, nút Trang đầu, service worker — thay cho dòng khởi động của trang.
APP_SHELL = os.path.join(ROOT, "tools", "app_shell.js")
BOOT_LINE = "if(!examBoot() && !writeBoot() && !vocabBoot() && !routeBoot() && !ngheBoot() && !reportBoot()) studentLanding();"


def add_app(src):
    if "manifest.webmanifest" not in src:
        src = src.replace("</title>\n", "</title>\n" + APP_HEAD, 1)
    i = src.find("/* ---------- App cài trên điện thoại (PWA) ----------")
    if i >= 0:  # bỏ bản cũ để chèn lại bản mới nhất
        j = src.index("appRun();\n", i) + len("appRun();\n")
        src = src[:i] + BOOT_LINE + "\n" + src[j:]
    assert BOOT_LINE in src, "không thấy dòng khởi động trang"
    src = src.replace(BOOT_LINE, open(APP_SHELL, encoding="utf-8").read().rstrip("\n"), 1)
    return src


def cut(src, start, end, repl=""):
    i = src.index(start)
    j = src.index(end, i) + len(end)
    return src[:i] + repl + src[j:]


def main(path):
    src = open(path, encoding="utf-8").read()

    m = re.search(r'(<script id="data" type="application/json">)(.*?)(</script>)', src, re.S)
    data = json.loads(m.group(2))

    img_dir = os.path.join(OUT, "img")
    os.makedirs(img_dir, exist_ok=True)
    used = set()
    for a in data.get("assign", {}).values():
        for q in a.get("qs", []):
            im = q.get("image") or ""
            dm = re.match(r"data:image/(\w+);base64,(.*)", im, re.S)
            if not dm:
                continue
            raw = base64.b64decode(dm.group(2))
            ext = {"jpeg": "jpg"}.get(dm.group(1), dm.group(1))
            name = hashlib.sha1(raw).hexdigest()[:12] + "." + ext
            with open(os.path.join(img_dir, name), "wb") as f:
                f.write(raw)
            used.add(name)
            q["image"] = "img/" + name

    js = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    src = src[:m.start(2)] + js + src[m.end(2):]

    # Bỏ phần quản lý và kết nối claude.ai — học sinh không cần.
    src = cut(src, "var Admin = (function(){", "  return { init:init, render:render };\n})();\n")
    src = cut(src, 'if(window.claude && typeof window.claude.use === "function"){', "}).catch(function(){});\n}\n")
    src = re.sub(r'var PAGE_URL = "[^"]*";\n', "", src)
    src = cut(src, "var FIXED_LINKS = [", "];\n")
    src = re.sub(r'var ABOUT = "[^"]*";', 'var ABOUT = "%s";' % ABOUT_URL, src)
    src = src.replace("stopClock(); Admin.render(); };", "stopClock(); studentLanding(); };")

    src = add_app(src)

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(src)
    clean_images()  # ảnh thừa: không còn trong index.html lẫn thi-thu/de/*.json
    print("Đã tạo thi-thu/index.html (%d KB), %d ảnh, %d bài đang mở: %s" % (
        len(src.encode()) // 1024, len(used), len(data.get("assign", {})), ", ".join(sorted(data["assign"]))))


if __name__ == "__main__":
    if sys.argv[1:] == ["--app-only"]:  # chỉ thêm phần app vào thi-thu/index.html hiện có
        f = os.path.join(OUT, "index.html")
        s = open(f, encoding="utf-8").read()
        open(f, "w", encoding="utf-8").write(add_app(s))
    else:
        main(sys.argv[1])
