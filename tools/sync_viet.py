#!/usr/bin/env python3
"""Đưa đề viết (câu 51–54) lên site để bảng sửa bài (link thi-thu/#s=…) hiện đề, ảnh và bài mẫu chia ý.

Cách dùng:  python3 tools/sync_viet.py <thu-muc-dump>

<thu-muc-dump> là thư mục ArtifactData (out_dir) của collection wbank: <dump>/wbank/<id>.json.
Ghi thi-thu/viet/<id>.json = {id, type, src, round, passage, img, keys, blocks, nums}
(bỏ gợi ý, ghi chú). Đề viết TOPIK công khai nên để trong repo được; không có dữ liệu học sinh.
"""
import glob, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "thi-thu", "viet")
FIELDS = ["type", "src", "round", "passage", "img", "keys", "blocks", "nums"]


def main(dump):
    os.makedirs(OUT, exist_ok=True)
    keep = set()
    for p in sorted(glob.glob(os.path.join(dump, "wbank", "*.json"))):
        wid = os.path.basename(p)[:-5]
        w = json.load(open(p, encoding="utf-8"))
        doc = {"id": wid}
        for k in FIELDS:
            if w.get(k) not in (None, "", [], {}):
                doc[k] = w[k]
        with open(os.path.join(OUT, wid + ".json"), "w", encoding="utf-8") as f:
            json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
        keep.add(wid + ".json")
    gone = [f for f in os.listdir(OUT) if f.endswith(".json") and f not in keep]
    for f in gone:
        os.remove(os.path.join(OUT, f))
    print("Đã ghi %d đề viết vào thi-thu/viet/ (xóa %d tệp cũ)." % (len(keep), len(gone)))


if __name__ == "__main__":
    main(sys.argv[1])
