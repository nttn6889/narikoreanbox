#!/usr/bin/env python3
"""Tạo trang thi thử cho học sinh (thi-thu/) từ bản HTML của trang quản lý trên claude.ai.

Cách dùng:  python3 tools/sync_thi_thu.py <file-html-tai-ve-tu-artifact>

- Chỉ giữ phần học sinh: bỏ khối quản lý (Admin) và đoạn khởi động kết nối claude.ai.
- Tách ảnh base64 trong đề ra thư mục thi-thu/img/ (tên file theo mã băm nên không trùng).
- Đổi link "Về cô" sang link trong config bên dưới.
"""
import base64, hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "thi-thu")
ABOUT_URL = "https://claude.ai/artifact/2XJHcdRJMNbKnDoMXqVZWQ"  # đổi khi trang "Về cô" có link riêng


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
    for f in os.listdir(img_dir):
        if f not in used:
            os.remove(os.path.join(img_dir, f))

    js = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    src = src[:m.start(2)] + js + src[m.end(2):]

    # Bỏ phần quản lý và kết nối claude.ai — học sinh không cần.
    src = cut(src, "var Admin = (function(){", "  return { init:init, render:render };\n})();\n")
    src = cut(src, 'if(window.claude && typeof window.claude.use === "function"){', "}).catch(function(){});\n}\n")
    src = re.sub(r'var PAGE_URL = "[^"]*";\n', "", src)
    src = cut(src, "var FIXED_LINKS = [", "];\n")
    src = re.sub(r'var ABOUT = "[^"]*";', 'var ABOUT = "%s";' % ABOUT_URL, src)
    src = src.replace("stopClock(); Admin.render(); };", "stopClock(); studentLanding(); };")

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(src)
    print("Đã tạo thi-thu/index.html (%d KB), %d ảnh, %d bài đang mở: %s" % (
        len(src.encode()) // 1024, len(used), len(data.get("assign", {})), ", ".join(sorted(data["assign"]))))


if __name__ == "__main__":
    main(sys.argv[1])
