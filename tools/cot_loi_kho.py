#!/usr/bin/env python3
"""Đưa “Từ cốt lõi” vào kho từ (collection vocab của trang quản lý) để giao Lộ trình hàng ngày.

Cách dùng:  python3 tools/cot_loi_kho.py <dump>
  <dump>/core/d*.json      (python3 tools/tu_cot_loi.py <dump>)
  <dump>/core/marks.json   (tùy chọn: ArtifactData get core/marks với out_dir) — từ cô “Bỏ qua” bị loại, nghĩa cô sửa được dùng
Kết quả: <dump>/vocab_cot/VC<tầng>_<nhóm>.json → ArtifactData batch `set` collection `vocab` (tối đa 50 doc mỗi batch),
rồi đồng bộ kho từ (--vocab-only). Trang tu-vung/ không hiện các phần “Cốt lõi …”.

Bỏ từ sơ cấp (sc) và từ chưa có nghĩa. Mỗi tầng một phần, nhóm 20 từ, xếp theo số đề rồi số lần gặp.
Id từ cố định theo từ gốc, lưu trong tools/cot_loi_id.tsv (từ mới được số tiếp theo) → chạy lại không làm đổi id,
lộ trình đã giao vẫn chấm đúng (thứ tự từ trong lộ trình có thể đổi nếu thêm/bớt từ).
Câu ví dụ (dạng bài “Điền từ vào câu”) lấy từ câu trong đề: danh từ gạch đúng từ, động/tính từ gạch cả cụm đã chia.
"""
import glob, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDS = os.path.join(ROOT, "tools/cot_loi_id.tsv")
GROUP = 20
TIERS = [  # (số đề tối thiểu, tối đa, tên phần, secOrder)
    (15, 99, "Cốt lõi · Tầng 1 · gặp ở ≥ 15/20 đề", 30),
    (10, 14, "Cốt lõi · Tầng 2 · gặp ở 10–14 đề", 31),
    (7, 9, "Cốt lõi · Tầng 3 · gặp ở 7–9 đề", 32),
    (5, 6, "Cốt lõi · Tầng 4 · gặp ở 5–6 đề", 33),
]
PUNCT = ".,!?…”’\"')]·:;"


def example(w):
    for x in w.get("x") or []:
        s, a, b = x["s"], x["a"], x["b"]
        m = re.match(r"<[^>]*>\s*", s)  # bỏ nhãn “<보기>” đầu câu
        if m and a >= m.end():
            s, a, b = s[m.end():], a - m.end(), b - m.end()
        if w["p"] in ("V", "A"):  # cả cụm đã chia, tới khoảng trắng
            while b < len(s) and not s[b].isspace():
                b += 1
            while b > a and s[b - 1] in PUNCT:
                b -= 1
        if b > a and "__" not in s:
            return s[:a] + "__" + s[a:b] + "__" + s[b:]
    return ""


def main(dump):
    words = []
    for f in sorted(glob.glob(os.path.join(dump, "core", "d*.json")), key=lambda f: int(re.sub(r"\D", "", os.path.basename(f)))):
        words += json.load(open(f, encoding="utf-8"))["w"]
    marks = {}
    mf = os.path.join(dump, "core", "marks.json")
    if os.path.exists(mf):
        d = json.load(open(mf, encoding="utf-8"))
        marks = d.get("data", d).get("m", {})

    ids = {}
    if os.path.exists(IDS):
        for line in open(IDS, encoding="utf-8"):
            if line.strip() and not line.startswith("#"):
                k, v = line.rstrip("\n").split("\t")
                ids[k] = v
    nxt = max([int(v[2:]) for v in ids.values()] + [0]) + 1

    out = os.path.join(dump, "vocab_cot")
    os.makedirs(out, exist_ok=True)
    for f in glob.glob(os.path.join(out, "*.json")):
        os.remove(f)
    now = int(time.time() * 1000)
    total = 0
    for ti, (lo, hi, sec, so) in enumerate(TIERS, 1):
        rows = []
        for w in words:
            mk = marks.get(w["l"], {})
            vi = mk.get("vi") or w["vi"]
            if w["sc"] or not vi or mk.get("t", 0) < 0 or not (lo <= w["d"] <= hi):
                continue
            if w["l"] not in ids:
                ids[w["l"]] = "cl%04d" % nxt
                nxt += 1
            it = {"id": ids[w["l"]], "ko": w["l"], "vi": vi}
            ex = example(w)
            if ex:
                it["ex"] = ex
            rows.append(it)
        for gi in range(0, len(rows), GROUP):
            n = gi // GROUP + 1
            ch = rows[gi:gi + GROUP]
            doc = {"sec": sec, "secOrder": so, "order": n, "ko": "핵심 어휘 %d-%d" % (ti, n),
                   "vi": "Nhóm %d (%d từ)" % (n, len(ch)), "words": ch, "updated": now}
            with open(os.path.join(out, "VC%d_%02d.json" % (ti, n)), "w", encoding="utf-8") as f:
                json.dump(doc, f, ensure_ascii=False)
        total += len(rows)
        print("%s: %d từ, %d nhóm" % (sec, len(rows), (len(rows) + GROUP - 1) // GROUP))

    with open(IDS, "w", encoding="utf-8") as f:
        f.write("# Id cố định của từ cốt lõi trong kho từ (tools/cot_loi_kho.py). Không sửa/xóa dòng cũ.\n")
        for k, v in sorted(ids.items(), key=lambda kv: kv[1]):
            f.write("%s\t%s\n" % (k, v))
    print("Tổng %d từ → %s" % (total, out))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
