#!/usr/bin/env python3
"""Giáo trình “TOPIK Intermediate Vocabulary in 30 days” (박이정) → trang tu-30/ + kho từ của trang quản lý.

Cách dùng:  pip install kiwipiepy
            python3 tools/t30.py [<thu-muc-ra>]

Nguồn (soạn tay, sửa trực tiếp): tools/t30/dNN.json — mỗi Day một file
  w:  [{n, ko, p (명/동/형/부), vi, hv, ex (câu sách, đúng một chỗ __chữ trong câu__), exv (dịch câu),
        r: [[từ liên quan, nghĩa]], tip: {t, c:[[cụm, nghĩa]] | x: chữ}, note (출제 경향)}]   — 33 từ, n = số trong sách
  cf: {poly: {w, m:[[nghĩa, câu, dịch]]}, ant / syn: {a:[từ, nghĩa], b:[…], ex:[[câu, dịch]]}}   (khung “từ dễ nhầm” của sách)
  x:  bài luyện sâu Claude soạn [{g: h họ từ | k kết hợp | c dễ nhầm, w (số từ; 0 = khung dễ nhầm), s (câu có “( )”
      hoặc __chữ__ + q câu hỏi), o (lựa chọn đầu là đáp án), v (dịch), why}]
  rv: bài 복습 của sách [{k: kv (chọn nghĩa) | vk (gõ từ Hàn) | c (chọn từ điền câu), w, s, o (lựa chọn đầu là đáp án)}]

Ghi ra:
  tu-30/data/dNN.json  = nguồn + mỗi từ thêm k (số đề đọc có từ này) và de [[đề, câu, câu văn, a, b]] (≤ 2 câu trong đề
                         đọc thật, a–b = chữ cần che), tu-30/data/days.json (danh sách Day).
  <thu-muc-ra>/vocab/T30NN_1.json, _2.json (nếu có <thu-muc-ra>): Phần 1 = từ 1–17, Phần 2 = từ 18–33, phần
  “TOPIK 30 ngày · Day NN”, secOrder 200 + NN; id từ t30NN_MM (MM = số trong sách) cố định → ArtifactData batch `set`
  collection `vocab` (file_path), rồi đồng bộ kho từ (tools/sync_kho.py --vocab-only).
"""
import glob, json, os, re, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from thong_ke_de import CLEAN, ROOT  # noqa: E402
from tu_cot_loi import lemma_spans, sentences  # noqa: E402

SRC = os.path.join(ROOT, "tools", "t30")
OUT = os.path.join(ROOT, "tu-30", "data")
POS = {"명", "동", "형", "부"}
GAP = re.compile(r"\(\s*\)|_{3,}|[㉠㉡㉢㉣]|\([가나다라]\)")
SPLIT = 17  # Phần 1 = từ 1–17, Phần 2 = 18–33


def label(d):
    m = re.match(r"TOPIK II 제(\d+)회", d["t"])
    return "TOPIK kỳ %s" % m.group(1) if m else re.sub(r"\s*\(.*\)$", "", d["t"])


def check(day):
    err = []
    W = day["w"]
    if [w["n"] for w in W] != list(range(1, len(W) + 1)):
        err.append("số thứ tự từ không liên tục")
    for w in W:
        if w["p"] not in POS:
            err.append("từ %d: loại từ %r" % (w["n"], w["p"]))
        if len(re.findall(r"__(.+?)__", w["ex"])) != 1:
            err.append("từ %d: câu ví dụ cần đúng một chỗ __…__" % w["n"])
    for i, x in enumerate(day["x"]):
        if x["g"] not in "hkc" or not 0 <= x["w"] <= len(W):
            err.append("x[%d]: g/w sai" % i)
        if "( )" not in x["s"] and not ("__" in x["s"] and x.get("q")):
            err.append("x[%d]: câu cần “( )” hoặc __chữ__ + q" % i)
    for i, r in enumerate(day["rv"]):
        if r["k"] == "c" and "( )" not in r["s"]:
            err.append("rv[%d]: câu cần “( )”" % i)
        if not 1 <= r["w"] <= len(W):
            err.append("rv[%d]: w sai" % i)
    if err:
        sys.exit("d%02d: %s" % (day["d"], "; ".join(err)))


def eojeol(s, a, b):
    """Mở rộng [a, b) ra cả cụm chữ (giữa hai dấu cách), bỏ dấu câu ở hai đầu."""
    while a > 0 and not s[a - 1].isspace():
        a -= 1
    while b < len(s) and not s[b].isspace():
        b += 1
    while a < b and not re.match(r"[가-힣A-Za-z0-9]", s[a]):
        a += 1
    while b > a and not re.match(r"[가-힣A-Za-z0-9]", s[b - 1]):
        b -= 1
    return a, b


def exam_hits(targets):
    """targets: {từ: loại} → {từ: {"k": số đề, "x": [(nhãn, đề thật?, câu, câu văn, a, b)]}}."""
    hits = {t: {"e": set(), "x": []} for t in targets}
    adv = [t for t, p in targets.items() if p == "부"]
    for f in sorted(glob.glob(os.path.join(ROOT, "thi-thu/de/*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        if re.search(r"(k|n|old)$", d["id"]) or len(d["q"]) < 40:
            continue
        lab, real = label(d), d["id"].startswith("Etk")
        for q in d["q"]:
            for s in sentences(CLEAN.sub(lambda m: m.group(0) if GAP.match(m.group(0)) else " ", q.get("passage") or "")):
                s = re.sub(r"\s+", " ", s).strip()
                found = []
                for lem, p, a, b in lemma_spans(s):
                    if lem in targets and targets[lem] != "부":
                        if targets[lem] in ("동", "형"):
                            a, b = eojeol(s, a, b)
                        found.append((lem, a, b))
                for t in adv:
                    for m in re.finditer(r"(?<![가-힣])" + t + r"(?![가-힣])", s):
                        found.append((t, m.start(), m.end()))
                for lem, a, b in found:
                    hits[lem]["e"].add(d["id"])
                    if not GAP.search(s) and 15 <= len(s) <= 75 and s.count(s[a:b]) == 1:
                        hits[lem]["x"].append((lab, real, q["n"], s, a, b))
    return hits


def pick(xs):
    """≤ 2 câu: đề thật trước, rồi câu ngắn vừa (25–55 chữ), khác đề."""
    xs = sorted(xs, key=lambda x: (not x[1], abs(len(x[3]) - 40), x[0], x[2]))
    out, used = [], set()
    for x in xs:
        if x[0] in used:
            continue
        used.add(x[0])
        out.append([x[0], x[2], x[3], x[4], x[5]])
        if len(out) == 2:
            break
    return out


def main(out):
    days = [json.load(open(f, encoding="utf-8")) for f in sorted(glob.glob(os.path.join(SRC, "d*.json")))]
    for day in days:
        check(day)
    targets = {w["ko"]: w["p"] for day in days for w in day["w"]}
    hits = exam_hits(targets)
    os.makedirs(OUT, exist_ok=True)
    now = int(time.time() * 1000)
    if out:
        os.makedirs(os.path.join(out, "vocab"), exist_ok=True)
    for day in days:
        dd = day["d"]
        for w in day["w"]:
            h = hits[w["ko"]]
            w["k"] = len(h["e"])
            w["de"] = pick(h["x"])
        with open(os.path.join(OUT, "d%02d.json" % dd), "w", encoding="utf-8") as f:
            json.dump(day, f, ensure_ascii=False, separators=(",", ":"))
        if out:
            for gi, (a, b) in enumerate(((1, SPLIT), (SPLIT + 1, len(day["w"]))), 1):
                words = []
                for w in day["w"][a - 1:b]:
                    v = {"id": "t30%02d_%02d" % (dd, w["n"]), "ko": w["ko"], "vi": w["vi"], "ex": w["ex"]}
                    if w.get("hv"):
                        v["hv"] = w["hv"]
                    words.append(v)
                doc = {"sec": "TOPIK 30 ngày · Day %02d" % dd, "secOrder": 200 + dd, "ko": "%d–%d" % (a, b),
                       "vi": "Phần %d (từ %d–%d)" % (gi, a, b), "order": gi, "words": words, "updated": now}
                with open(os.path.join(out, "vocab", "T30%02d_%d.json" % (dd, gi)), "w", encoding="utf-8") as f:
                    json.dump(doc, f, ensure_ascii=False)
        nde = sum(1 for w in day["w"] if w["de"])
        print("Day %02d: %d từ, %d từ có câu trong đề, %d bài luyện sâu, %d câu ôn" % (dd, len(day["w"]), nde, len(day["x"]), len(day["rv"])))
    with open(os.path.join(OUT, "days.json"), "w", encoding="utf-8") as f:
        json.dump([d["d"] for d in days], f)
    if out:
        print("Kho từ: %s/vocab/T30*.json → ArtifactData batch set collection vocab" % out)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
