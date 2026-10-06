#!/usr/bin/env python3
"""Chuyển bản chép ngữ pháp (văn bản) thành tài liệu cho collection `grammar` của trang quản lý.

    python3 tools/nguphap_kho.py <ban-chep.txt> <ma-tai-lieu> "<tên sách>" <thư mục ra>

Ghi <thư mục ra>/grammar/<id>.json (id = g_<mã>_<bài>_<số>) để ArtifactData batch `set` (file_path).
Nội dung sách KHÔNG để trong repo (repo công khai) — bản chép chỉ nằm ở thư mục tạm và trong db.

Định dạng bản chép (mỗi điểm ngữ pháp):
    @ <bài> <số> <trang> | <mẫu ngữ pháp>
    = <nghĩa ko> | <en> | <vi>
    ~ <cách kết hợp ko> | <en>
    | ô | ô | ô          (bảng; dòng đầu là tiêu đề)
    - câu ví dụ, **phần in đậm**
    + <lưu ý ko> | <en> | <vi>   (bảng/câu ví dụ sau dòng này thuộc lưu ý)
Dòng bắt đầu bằng # là chú thích.
"""
import json, os, re, sys


def parse(text):
    pts, cur, blk = [], None, None
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        tag, rest = line[0], line[1:].strip()
        if tag == "@":
            head, title = rest.split("|", 1)
            lesson, no, page = head.split()
            cur = {"lesson": int(lesson), "no": int(no), "page": int(page), "title": title.strip(),
                   "mean": {}, "form": {}, "table": [], "ex": [], "notes": []}
            pts.append(cur)
            blk = cur
            continue
        if cur is None:
            raise SystemExit("Dòng nằm ngoài điểm ngữ pháp: " + raw)
        parts = [p.strip() for p in rest.split(" | ")] if tag in "=~+" else None
        if tag == "=":
            cur["mean"] = dict(zip(("ko", "en", "vi"), parts))
        elif tag == "~":
            cur["form"] = dict(zip(("ko", "en"), parts))
        elif tag == "+":
            blk = dict(zip(("ko", "en", "vi"), parts))
            blk.update(table=[], ex=[])
            cur["notes"].append(blk)
        elif tag == "|":
            row = [c.strip() for c in line.strip("|").split("|")]
            if line.startswith("| |"):
                row = [""] + row[1:] if row and row[0] == "" else [""] + row
            blk["table"].append(row)
        elif tag == "-":
            blk["ex"].append(rest)
        else:
            raise SystemExit("Không hiểu dòng: " + raw)
    return pts


def main():
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    src, code, book, out = sys.argv[1:]
    pts = parse(open(src, encoding="utf-8").read())
    d = os.path.join(out, "grammar")
    os.makedirs(d, exist_ok=True)
    for i, p in enumerate(pts):
        for b in [p] + p["notes"]:
            if not b["table"]:
                del b["table"]
            if not b["ex"]:
                del b["ex"]
        gid = "g_%s_%02d_%d" % (code, p["lesson"], p["no"])
        p.update(src=code, book=book, order=i)
        json.dump(p, open(os.path.join(d, gid + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ls = sorted({p["lesson"] for p in pts})
    print("%d điểm ngữ pháp, bài %s–%s → %s" % (len(pts), ls[0], ls[-1], d))


if __name__ == "__main__":
    main()
