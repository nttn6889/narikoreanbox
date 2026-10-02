#!/usr/bin/env python3
"""Đưa ngân hàng đề (không kèm đáp án) và kho từ vựng lên trang học sinh.

Cách dùng:  python3 tools/sync_kho.py <thu-muc-dump>

<thu-muc-dump> là thư mục ArtifactData (out_dir) đã tải từ cơ sở dữ liệu của trang quản lý:
  bank/<id>.json, bank/<id>/q/qNN.json, vocab/<id>.json

Tạo ra:
  thi-thu/de/<id>.json   nội dung đề (bỏ đáp án, giải thích); đề trộn (mix) không cần vì
                         trang học sinh tự ghép lại từ đề gốc.
  thi-thu/vocab.json     kho từ vựng.
  thi-thu/img/           ảnh tách từ đề.
  <thu-muc-dump>/site_kho.json  dấu kiểm tra để ghi vào db (collection "site", doc "kho");
                         trang quản lý so dấu này để biết đề/từ nào đã sửa sau lần đồng bộ.
"""
import base64, glob, hashlib, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "thi-thu")


def jsum(s):
    """Giống hàm sum() trong trang (JS charCodeAt = đơn vị UTF-16)."""
    b = s.encode("utf-16-le")
    h = 7
    for i in range(0, len(b), 2):
        h = (h * 31 + (b[i] | (b[i + 1] << 8))) % 1679616
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while True:
        out = digits[h % 36] + out
        h //= 36
        if not h:
            break
    return out.rjust(4, "0")


def qcanon(q):
    opts = list(q.get("opts") or [])[:4]
    return "\u0002".join([q.get("group") or "", q.get("passage") or "", q.get("image") or "", q.get("stem") or "",
                          "\u0001".join(str(o) for o in opts), "1" if q.get("share") else "0"])


def vcanon(groups):
    gs = sorted(groups, key=lambda g: (g.get("order") or 0, g["id"]))
    return "\u0003".join("\u0002".join("%s\u0001%s\u0001%s" % (w.get("id", ""), w.get("ko", ""), w.get("vi", ""))
                                        for w in (g.get("words") or [])) for g in gs)


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_img(data_url, img_dir, used):
    m = re.match(r"data:image/(\w+);base64,(.*)", data_url or "", re.S)
    if not m:
        return data_url or ""
    raw = base64.b64decode(m.group(2))
    ext = {"jpeg": "jpg"}.get(m.group(1), m.group(1))
    name = hashlib.sha1(raw).hexdigest()[:12] + "." + ext
    p = os.path.join(img_dir, name)
    if not os.path.exists(p):
        with open(p, "wb") as f:
            f.write(raw)
    used.add(name)
    return "img/" + name


def clean_images():
    """Xóa ảnh không còn trang/đề nào dùng (cả bài cũ nhúng trong index.html)."""
    img_dir = os.path.join(OUT, "img")
    refs = set()
    srcs = [os.path.join(OUT, "index.html")] + glob.glob(os.path.join(OUT, "de", "*.json"))
    for p in srcs:
        if os.path.exists(p):
            refs.update(re.findall(r"img/([0-9a-f]{12}\.\w+)", open(p, encoding="utf-8").read()))
    n = 0
    for f in os.listdir(img_dir):
        if f not in refs:
            os.remove(os.path.join(img_dir, f))
            n += 1
    return n


def main(dump):
    img_dir = os.path.join(OUT, "img")
    de_dir = os.path.join(OUT, "de")
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(de_dir, exist_ok=True)
    used = set()
    site = {"at": int(time.time() * 1000), "e": {}, "v": {}}

    keep = set()
    for mp in sorted(glob.glob(os.path.join(dump, "bank", "*.json"))):
        eid = os.path.basename(mp)[:-5]
        meta = load(mp)
        if meta.get("mix"):
            continue
        qs, hs = [], {}
        for qp in sorted(glob.glob(os.path.join(dump, "bank", eid, "q", "*.json"))):
            q = load(qp)
            n = int(q["n"])
            hs[str(n)] = jsum(qcanon(q))
            qs.append({"n": n, "group": q.get("group") or "", "passage": q.get("passage") or "",
                       "image": save_img(q.get("image"), img_dir, used), "stem": q.get("stem") or "",
                       "opts": list(q.get("opts") or ["", "", "", ""])[:4], "share": bool(q.get("share"))})
        qs.sort(key=lambda x: x["n"])
        with open(os.path.join(de_dir, eid + ".json"), "w", encoding="utf-8") as f:
            json.dump({"id": eid, "t": meta.get("title", ""), "total": meta.get("total", len(qs)), "q": qs},
                      f, ensure_ascii=False, separators=(",", ":"))
        keep.add(eid + ".json")
        site["e"][eid] = {"t": meta.get("title", ""), "h": hs}
    for f in os.listdir(de_dir):
        if f not in keep:
            os.remove(os.path.join(de_dir, f))

    groups = [dict(load(p), id=os.path.basename(p)[:-5]) for p in glob.glob(os.path.join(dump, "vocab", "*.json"))]
    groups.sort(key=lambda g: (g.get("secOrder") or 0, g.get("order") or 0, g["id"]))
    by_sec = {}
    for g in groups:
        by_sec.setdefault(g.get("sec", ""), []).append(g)
    for sec, gs in by_sec.items():
        site["v"][sec] = jsum(vcanon(gs))
    vocab = {"at": site["at"], "g": [{"id": g["id"], "sec": g.get("sec", ""), "so": g.get("secOrder") or 0,
                                      "o": g.get("order") or 0, "ko": g.get("ko", ""), "vi": g.get("vi", ""),
                                      "w": [[w.get("id", ""), w.get("ko", ""), w.get("vi", "")] for w in (g.get("words") or [])]}
                                     for g in groups]}
    with open(os.path.join(OUT, "vocab.json"), "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False, separators=(",", ":"))

    with open(os.path.join(dump, "site_kho.json"), "w", encoding="utf-8") as f:
        json.dump(site, f, ensure_ascii=False)
    removed = clean_images()
    nw = sum(len(g["w"]) for g in vocab["g"])
    print("Đã đồng bộ %d đề (%s), %d ảnh, kho từ %d nhóm / %d từ. Xóa %d ảnh thừa." % (
        len(keep), ", ".join(sorted(k[:-5] for k in keep)), len(used), len(groups), nw, removed))
    print("Ghi dấu kiểm tra: ArtifactData set site/kho từ", os.path.join(dump, "site_kho.json"))


if __name__ == "__main__":
    main(sys.argv[1])
