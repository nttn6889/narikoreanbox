#!/usr/bin/env python3
"""Từ vựng giáo trình Seoul (서울대 한국어 1A–3B) → tài liệu cho kho từ của trang quản lý (collection `vocab`).

Cách dùng:  python3 tools/seoul_kho.py <thu-muc-ra>

Nguồn: tools/seoul/<cuốn>.tsv (soạn tay, sửa trực tiếp ở đây):
  # <số bài> | <tên bài tiếng Hàn> | <tên bài tiếng Việt>
  ## <tên nhóm tiếng Việt> | <tên nhóm tiếng Hàn>
  từ<TAB>nghĩa<TAB>Hán Việt (bỏ trống nếu là từ thuần Hàn/ngoại lai)<TAB>câu ví dụ (__…__ = chỗ điền, đã chia đuôi)
Dòng bắt đầu bằng "#" mà không đúng mẫu trên là ghi chú.

Ghi ra <thu-muc-ra>/vocab/<id>.json — mỗi nhóm một tài liệu {sec, secOrder, ko, vi, order, words[{id, ko, vi, hv, ex}]}
rồi ArtifactData batch `set` vào collection `vocab` (file_path). Id cố định (S3A01_1, s3a01_1_0…) nên chạy lại là ghi đè
đúng nhóm cũ, bài đã giao và điểm cũ vẫn khớp từ. Sau đó “đồng bộ kho từ” như thường lệ (tools/sync_kho.py).

Cũng ghi seoul/bai.json (tên bài tiếng Việt cho trang seoul/).
Tên phần: "Seoul 3A · Bài 1 · 처음 만난 사람과 …" (trang seoul/ đọc tên này; trang tu-vung/ bỏ qua các phần "Seoul …").
secOrder = 100 + 20 × (cấp − 1) + số bài  → 1A/1B: 101–116, 2A/2B: 121–138, 3A/3B: 141–158.
"""
import glob, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "seoul")
BOOKS = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]


def parse(book):
    lessons, les, grp = [], None, None
    for no, line in enumerate(open(os.path.join(SRC, book + ".tsv"), encoding="utf-8"), 1):
        line = line.rstrip("\n")
        if not line.strip():
            continue
        m = re.match(r"^# (\d+) \| (.+?) \| (.+)$", line)
        if m:
            les = {"n": int(m.group(1)), "ko": m.group(2).strip(), "vi": m.group(3).strip(), "g": []}
            lessons.append(les)
            grp = None
            continue
        m = re.match(r"^## (.+?) \| (.*)$", line)
        if m:
            grp = {"vi": m.group(1).strip(), "ko": m.group(2).strip(), "w": []}
            les["g"].append(grp)
            continue
        if line.startswith("#"):
            continue
        p = line.split("\t")
        if len(p) != 4 or grp is None:
            sys.exit("%s.tsv dòng %d: cần 4 cột (từ, nghĩa, Hán Việt, câu ví dụ) dưới một nhóm ##" % (book, no))
        ko, vi, hv, ex = [x.strip() for x in p]
        if ex and len(re.findall(r"__(.+?)__", ex)) != 1:
            sys.exit("%s.tsv dòng %d: câu ví dụ cần đúng một chỗ __…__" % (book, no))
        grp["w"].append({"ko": ko, "vi": vi, "hv": hv, "ex": ex})
    return lessons


def main(out):
    vdir = os.path.join(out, "vocab")
    os.makedirs(vdir, exist_ok=True)
    now = int(time.time() * 1000)
    ng = nw = 0
    bai = {}
    for book in BOOKS:
        if not os.path.exists(os.path.join(SRC, book + ".tsv")):
            continue
        level = int(book[0])
        for les in parse(book):
            bai["%s-%d" % (book, les["n"])] = les["vi"]
            sec = "Seoul %s · Bài %d · %s" % (book, les["n"], les["ko"])
            for gi, g in enumerate(les["g"], 1):
                gid = "S%s%02d_%d" % (book, les["n"], gi)
                words = []
                for wi, w in enumerate(g["w"]):
                    d = {"id": "s%s%02d_%d_%d" % (book.lower(), les["n"], gi, wi), "ko": w["ko"], "vi": w["vi"]}
                    if w["hv"]:
                        d["hv"] = w["hv"]
                    if w["ex"]:
                        d["ex"] = w["ex"]
                    words.append(d)
                doc = {"sec": sec, "secOrder": 100 + 20 * (level - 1) + les["n"], "ko": g["ko"] or g["vi"], "vi": g["vi"],
                       "order": gi, "words": words, "updated": now}
                with open(os.path.join(vdir, gid + ".json"), "w", encoding="utf-8") as f:
                    json.dump(doc, f, ensure_ascii=False)
                ng += 1
                nw += len(words)
    with open(os.path.join(ROOT, "seoul", "bai.json"), "w", encoding="utf-8") as f:
        json.dump(bai, f, ensure_ascii=False, separators=(",", ":"))
    print("Ghi %d nhóm / %d từ vào %s" % (ng, nw, vdir))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
