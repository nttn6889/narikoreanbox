#!/usr/bin/env python3
"""Dữ liệu “Từ cốt lõi” cho trang quản lý (tab Phân tích đề → thẻ Từ cốt lõi). KHÔNG ghi gì vào repo.

Cách dùng:  pip install kiwipiepy
            python3 tools/tu_cot_loi.py <thu-muc-dump>
  <thu-muc-dump>/topics/*.json  (ArtifactData `list` collection `topics` với out_dir) — chủ đề từng đoạn văn.
Kết quả: <dump>/core/meta.json, <dump>/core/d0.json, d1.json… → ArtifactData batch `set` collection `core`
(doc `meta`, `d0`…; doc `marks` là lựa chọn của cô, script không đụng tới).

Chỉ tính đề ĐỌC đủ 50 câu (bỏ đề nghe, kịch bản nghe, đề câu 1–4, đề trộn). Với mỗi từ gốc gặp trong ≥ MIN_DE đề:
  l từ gốc · vi nghĩa (cot_loi.tsv, kho từ, chu-de.json, nghia_de.tsv; "" nếu chưa có) · p loại từ (N/V/A/AD)
  sc 1 = sơ cấp (cột cấp trong tools/cot_loi.tsv, không có thì: từ có trong Seoul 1A–2B)
  d số đề · c số lần · g {câu đầu của dạng câu: số lần} · t {chủ đề: số lần} · k [phần kho từ có từ này]
  x [{e đề, n câu, s câu văn, a, b vị trí từ trong câu}] tối đa 3 câu ví dụ (khác đề).
"""
import collections, glob, json, os, re, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from thong_ke_de import kiwi, SUF, CLEAN, GROUPS, group_of, glabel, ROOT  # noqa: E402

MIN_DE = 3
CHUNK = 250
GAP = re.compile(r"\(\s*\)|_{3,}")
POS = {"NNG": "N", "NNP": "N", "VV": "V", "VA": "A", "MAG": "AD"}


def reading_exams():
    for f in sorted(glob.glob(os.path.join(ROOT, "thi-thu/de/*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        if d.get("tu") or re.search(r"(k|n|old)$", d["id"]) or d["id"].startswith("Etk") or len(d["q"]) < 40:
            continue
        yield d


def sentences(text):
    for line in text.split("\n"):
        for s in re.split(r"(?<=[.?!])\s+", line):
            s = s.strip()
            if s:
                yield s


def lemma_spans(s):
    """[(từ gốc, loại, a, b)] — a, b = vị trí chữ trong s."""
    out, toks = [], kiwi.tokenize(s)
    for i, t in enumerate(toks):
        nxt = toks[i + 1] if i + 1 < len(toks) else None
        tag = t.tag.split("-")[0]
        if tag in ("NNG", "NNP", "XR"):
            if nxt is not None and nxt.tag in ("XSV", "XSA") and nxt.form in SUF:
                out.append((t.form + SUF[nxt.form], "V" if nxt.tag == "XSV" else "A", t.start, nxt.start + nxt.len))
            elif tag != "XR":
                out.append((t.form, "N", t.start, t.start + t.len))
        elif tag in ("VV", "VA"):
            out.append((t.form + "다", POS[tag], t.start, t.start + t.len))
        elif tag == "MAG":
            out.append((t.form, "AD", t.start, t.start + t.len))
    return out


def meanings():
    vi, kho = {}, collections.defaultdict(list)
    vocab = json.load(open(os.path.join(ROOT, "thi-thu/vocab.json"), encoding="utf-8"))
    for g in vocab["g"]:
        if g.get("so", 0) < 0:
            continue
        tag = g["sec"].split(" · ")[0]
        for w in g["w"]:
            base = re.sub(r"\(.*?\)|[~…]", "", w[1]).strip()
            if " " in base or not base:
                continue
            vi.setdefault(base, w[2])
            if tag not in kho[base]:
                kho[base].append(tag)
    ebs = json.load(open(os.path.join(ROOT, "tu-vung/chu-de.json"), encoding="utf-8"))
    for m in ebs["muc"]:
        for _, items in m["g"]:
            for ko, v in items:
                if " " not in ko:
                    vi.setdefault(ko, v)
    for line in open(os.path.join(ROOT, "tools/nghia_de.tsv"), encoding="utf-8"):
        if line.strip() and not line.startswith("#") and "\t" in line:
            k, v = line.rstrip("\n").split("\t", 1)
            vi.setdefault(k.strip(), v.strip())
    lv = {}
    for line in open(os.path.join(ROOT, "tools/cot_loi.tsv"), encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            k, v, c = (line.rstrip("\n").split("\t") + ["", ""])[:3]
            if v:
                vi[k] = v
            lv[k] = c
    return vi, kho, lv


def main(dump):
    topic_of = {}
    for f in glob.glob(os.path.join(dump, "topics", "*.json")):
        e = os.path.splitext(os.path.basename(f))[0]
        d = json.load(open(f, encoding="utf-8"))
        d = d.get("data", d)
        for it in d.get("units", []):
            for n in it["n"]:
                topic_of[(e, n)] = it["c"]

    exams = list(reading_exams())
    cnt, de = collections.Counter(), collections.defaultdict(set)
    pos = collections.defaultdict(collections.Counter)
    cau = collections.defaultdict(collections.Counter)
    tp = collections.defaultdict(collections.Counter)
    exs = collections.defaultdict(list)
    for d in exams:
        e = d["id"]
        for q in d["q"]:
            st = q.get("stem") or ""
            parts = [q.get("passage") or ""] + [st if "십시오" not in st else ""] + list(q.get("opts") or [])
            for part in parts:
                for raw in sentences(part):
                    gap = GAP.search(raw)  # câu có chỗ trống của đề → không dùng làm câu ví dụ
                    s = re.sub(r"\s+", " ", CLEAN.sub(" ", raw)).strip()
                    for l, p, a, b in lemma_spans(s):
                        cnt[l] += 1
                        de[l].add(e)
                        pos[l][p] += 1
                        cau[l][group_of(q["n"])] += 1
                        if (e, q["n"]) in topic_of:
                            tp[l][topic_of[(e, q["n"])]] += 1
                        if not gap and 12 <= len(s) <= 110:
                            exs[l].append({"e": e, "n": q["n"], "s": s, "a": a, "b": b})

    vi, kho, lv = meanings()
    seoul_sc = {"Seoul 1A", "Seoul 1B", "Seoul 2A", "Seoul 2B"}
    words = []
    for l in sorted(cnt, key=lambda l: (-len(de[l]), -cnt[l], l)):
        if len(de[l]) < MIN_DE or lv.get(l) == "x":
            continue
        sc = lv[l] == "1" if lv.get(l) in ("0", "1") else bool(seoul_sc & set(kho.get(l, [])))
        x, used = [], set()
        for it in sorted(exs[l], key=lambda it: abs(len(it["s"]) - 50)):  # câu dài vừa phải trước, mỗi đề một câu
            if it["e"] not in used and len(x) < 3:
                used.add(it["e"])
                x.append(it)
        words.append({"l": l, "vi": re.sub(r"\s*★+$", "", vi.get(l, "")), "p": pos[l].most_common(1)[0][0], "sc": 1 if sc else 0, "d": len(de[l]), "c": cnt[l],
                      "g": {str(k): v for k, v in cau[l].items()}, "t": dict(tp[l]), "k": kho.get(l, []), "x": x})

    out = os.path.join(dump, "core")
    os.makedirs(out, exist_ok=True)
    for f in glob.glob(os.path.join(out, "d*.json")):
        os.remove(f)
    chunks = [words[i:i + CHUNK] for i in range(0, len(words), CHUNK)]
    for i, ch in enumerate(chunks):
        with open(os.path.join(out, "d%d.json" % i), "w", encoding="utf-8") as f:
            json.dump({"w": ch}, f, ensure_ascii=False, separators=(",", ":"))
    meta = {"at": int(time.time() * 1000), "nde": len(exams), "min": MIN_DE, "n": len(words), "chunks": len(chunks),
            "ex": [{"id": d["id"], "t": d.get("t", d["id"])} for d in exams],
            "groups": [{"a": a, "t": glabel(a)} for a, _ in GROUPS]}
    with open(os.path.join(out, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, separators=(",", ":"))
    sizes = [os.path.getsize(os.path.join(out, "d%d.json" % i)) for i in range(len(chunks))]
    print("%d đề đọc · %d từ (≥%d đề) · %d phần %s byte · chưa có nghĩa: %d" % (
        len(exams), len(words), MIN_DE, len(chunks), sizes, sum(1 for w in words if not w["vi"])))
    print("  sơ cấp: %d" % sum(w["sc"] for w in words))
    for t in (len(exams), 15, 10, 7, 5, 3):
        print("  ≥%d đề: %d từ" % (t, sum(1 for w in words if w["d"] >= t)))


if __name__ == "__main__":
    if len(sys.argv) < 2 or not os.path.isdir(os.path.join(sys.argv[1], "topics")):
        sys.exit("Cần thư mục dump có topics/*.json (ArtifactData list collection topics với out_dir).")
    main(sys.argv[1])
