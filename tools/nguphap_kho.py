#!/usr/bin/env python3
"""Chuyển phụ lục 문법 해설 đã chép (tools/seoul/sach/<cuốn>.md) thành tài liệu collection `grammar`
của trang quản lý (Tài liệu gốc → Ngữ pháp).

  python3 tools/nguphap_kho.py 1A <thư mục ra>   → <ra>/grammar/g_1A_<bài>_<số>.json + <ra>/batch_1A.json

Nghĩa tiếng Việt lấy từ tools/seoul/sach/<cuốn>-vi.tsv (id<TAB>m|n<số>|f<TAB>câu tiếng Việt).
Định dạng .md: xem chú thích đầu tools/seoul/sach/1A.md.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OX = lambda s: s.replace("(X)", "(×)").replace("(O)", "(○)")


def hdr(s):
    return s.replace("받침 X", "받침 ×").replace("받침 O", "받침 ○")


def labeled(cell):
    m = re.match(r"^([^:→]{1,14}?): (.+)$", cell)
    return (m.group(1).strip(), m.group(2).strip()) if m else None


def table(lines):
    """Các dòng '| … |' liền nhau → bảng [[hàng tiêu đề], …] như trang quản lý."""
    rows = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines]
    out, head = [], None
    for cells in rows:
        rl, cs = None, cells
        m = re.match(r"^(.+?) — (.+)$", cells[0])
        if m and labeled(m.group(2)):
            rl, cs = m.group(1).strip(), [m.group(2)] + cells[1:]
        lab = [labeled(c) for c in cs]
        if all(lab) and len(cs) > 1:
            h = ([""] if rl is not None else []) + [hdr(a) for a, _ in lab]
            if head is None:
                head = h
                out.append(h)
            out.append(([rl] if rl is not None else []) + [OX(b) for _, b in lab])
            continue
        if len(cells) >= 5 and all(re.match(r"^\S+ \S+$", c) for c in cells):
            out += [[c.split()[0] for c in cells], [c.split()[1] for c in cells]]
            continue
        out.append([OX(hdr(c)) for c in cells])
    return out


def exs(s):
    return [OX(x.strip()) for x in s.split(" / ") if x.strip()]


def parse(book):
    src = open(os.path.join(ROOT, "seoul", "sach", book + ".md"), encoding="utf-8").read()
    src = src.split("\n---\n")[0]
    pts, cur, blk, lesson = [], None, None, None
    tbuf = []

    def flush():
        if tbuf:
            blk.setdefault("table", []).extend(table(tbuf))
            tbuf.clear()

    for line in src.split("\n"):
        if line.startswith("<!--") or not line.strip():
            if cur: flush()
            continue
        m = re.match(r"^## (\d+)과", line)
        if m:
            if cur: flush()
            lesson = int(m.group(1)); continue
        m = re.match(r"^### (\d+)\. (.+?) \| p\.(\d+)", line)
        if m:
            if cur: flush()
            cur = {"book": "Seoul " + book, "src": book, "lesson": lesson, "no": int(m.group(1)), "title": m.group(2),
                   "page": int(m.group(3)), "mean": {}, "form": {}, "ex": [], "notes": []}
            blk = cur
            pts.append(cur); continue
        if not cur: continue
        if not line.startswith("|"): flush()
        t = line.strip()
        if t.startswith("|"):
            tbuf.append(t)
        elif t.startswith("▶"):
            if not cur["mean"]:
                cur["mean"]["ko"] = t[1:].strip(); blk = cur
            else:
                blk = {"ko": t[1:].strip()}; cur["notes"].append(blk)
        elif t.startswith("∞"):
            if blk is cur and not cur["form"]: cur["form"]["ko"] = t[1:].strip()
            else: blk["ko"] = blk.get("ko", "") + " (" + t[1:].strip() + ")"
        elif t.startswith("＋"):
            blk = {"ko": OX(t[1:].strip())}; cur["notes"].append(blk)
        elif t.startswith("예)"):
            blk.setdefault("ex", []).extend(exs(t[2:]))
        elif t.startswith("[tranh]"):
            blk.setdefault("ex", []).append("[Tranh] " + OX(t[7:].strip()))
        elif t.startswith("("):
            blk.setdefault("ex", []).append(t)
        else:
            raise SystemExit("Không hiểu dòng: " + line)
    if cur: flush()
    return pts


def main():
    book, out = sys.argv[1], sys.argv[2]
    pts = parse(book)
    vi = {}
    vf = os.path.join(ROOT, "seoul", "sach", book + "-vi.tsv")
    if os.path.exists(vf):
        for l in open(vf, encoding="utf-8"):
            if l.strip() and not l.startswith("#"):
                a, k, v = l.rstrip("\n").split("\t")
                vi[(a, k)] = v
    os.makedirs(os.path.join(out, "grammar"), exist_ok=True)
    writes, miss = [], []
    for i, g in enumerate(pts):
        gid = "g_%s_%02d_%d" % (book, g["lesson"], g["no"])
        g["order"] = i
        if (gid, "m") in vi: g["mean"]["vi"] = vi[(gid, "m")]
        else: miss.append(gid + " m")
        if (gid, "f") in vi: g["form"]["vi"] = vi[(gid, "f")]
        for j, n in enumerate(g["notes"]):
            k = "n%d" % (j + 1)
            if (gid, k) in vi: n["vi"] = vi[(gid, k)]
            elif n.get("ko"): miss.append(gid + " " + k)
        if not g["form"]: del g["form"]
        p = os.path.join(out, "grammar", gid + ".json")
        json.dump(g, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        writes.append({"op": "set", "collection": "grammar", "doc_id": gid, "file_path": os.path.abspath(p)})
    json.dump(writes, open(os.path.join(out, "batch_%s.json" % book), "w"), ensure_ascii=False, indent=1)
    print(book, len(pts), "điểm ngữ pháp")
    if miss: print("Chưa có nghĩa Việt:", len(miss), " ".join(miss[:20]))


if __name__ == "__main__":
    main()
