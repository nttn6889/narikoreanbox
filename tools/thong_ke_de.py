#!/usr/bin/env python3
"""Thống kê từ vựng trong các đề thi thử → tu-vung/de.json (thẻ ⭐ Ưu tiên, Chủ đề, dòng “Hay ra”, dấu ★ trong kho từ).

Cách dùng:  pip install kiwipiepy   (bộ tách từ tiếng Hàn, chỉ cần cài một lần)
            python3 tools/thong_ke_de.py

Đầu vào:
  thi-thu/de/*.json      đề (chỉ đọc đoạn văn, câu hỏi, lựa chọn; bỏ dòng hướng dẫn “…고르십시오”)
  thi-thu/vocab.json     kho từ (từ trong kho được đánh ★ số đề đã gặp)
  tools/nghia_de.tsv     nghĩa tiếng Việt cho từ gặp trong đề mà kho chưa có
  tools/chu_de.json      chủ đề của từng đoạn văn câu 10–50 (chỉ dùng để gom từ theo chủ đề;
                         bảng phân loại câu không đưa ra trang học sinh)
Từ ưu tiên = từ gặp trong ít nhất MIN_DE đề và có nghĩa (trong kho hoặc nghia_de.tsv);
từ chưa có nghĩa được in ra cuối để bổ sung vào nghia_de.tsv.
"""
import collections, glob, json, os, re, time

from kiwipiepy import Kiwi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_DE = 3

# Dòng “Hay ra” trên thẻ câu (khóa = số câu đầu của phần trong kho từ). Viết lại khi thống kê chủ đề đổi.
HAY = {
    10: "biểu đồ khảo sát xã hội: thời gian rảnh, SNS, tình nguyện, rác thải, nghề nghiệp mơ ước",
    11: "tin địa phương, chính sách thành phố (hỗ trợ việc làm, y tế, người khuyết tật), người tốt việc tốt, sự kiện, mẹo sức khỏe",
    19: "khoa học – công nghệ (AI, mô phỏng sinh học, ô tô), văn hóa",
    21: "kinh tế cá nhân (cổ phiếu, mua hàng nước ngoài), tâm lý, xã hội",
    23: "tùy bút: cảm xúc nhân vật, kỷ niệm gia đình, trường học",
    25: "kinh tế – giá cả (rau, cải thảo, suy thoái), sức khỏe, nắng nóng, văn hóa giải trí",
    42: "tiểu thuyết: gia đình, cảm xúc nhân vật",
    44: "khoa học, sức khỏe, kinh tế – xã hội",
}
# Nhóm dạng câu để ghi “thuộc câu nào”
GROUPS = [(1, 2), (3, 4), (5, 8), (9, 9), (10, 10), (11, 12), (13, 15), (16, 18), (19, 20), (21, 22), (23, 24),
          (25, 27), (28, 31), (32, 34), (35, 38), (39, 41), (42, 43), (44, 45), (46, 47), (48, 50)]
TOPIC_ORDER = ["MT", "KH", "KT", "YT", "VH", "XH", "PL", "GD", "KHAC", "VHOC"]
TOPIC_MAX = 80

kiwi = Kiwi()
SUF = {"하": "하다", "되": "되다", "스럽": "스럽다", "롭": "롭다", "답": "답다"}


def lemmas(text):
    out, toks = [], kiwi.tokenize(text)
    for i, t in enumerate(toks):
        nxt = toks[i + 1] if i + 1 < len(toks) else None
        if t.tag in ("NNG", "NNP", "XR"):
            if nxt is not None and nxt.tag in ("XSV", "XSA") and nxt.form in SUF:
                out.append(t.form + SUF[nxt.form])
            elif t.tag != "XR":
                out.append(t.form)
        elif t.tag.split("-")[0] in ("VV", "VA"):
            out.append(t.form + "다")
        elif t.tag == "MAG":
            out.append(t.form)
    return out


CLEAN = re.compile(r"\*\*|__|\(\s*\)|\(\s*[㉠㉡㉢㉣]\s*\)|\([가나다라]\)")


def exam_questions():
    for f in sorted(glob.glob(os.path.join(ROOT, "thi-thu/de/*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        if d["id"].endswith("old"):  # bản bìa xanh trùng đề Ehot1
            continue
        for q in d["q"]:
            parts = [q.get("passage") or ""] + list(q.get("opts") or [])
            st = q.get("stem") or ""
            if "십시오" not in st:
                parts.append(st)
            yield d["id"], q["n"], CLEAN.sub(" ", " ".join(parts))


def group_of(n):
    for a, b in GROUPS:
        if a <= n <= b:
            return a
    return n


def glabel(a):
    for x, b in GROUPS:
        if x == a:
            return str(a) if a == b else "%d–%d" % (a, b)
    return str(a)


def main():
    vocab = json.load(open(os.path.join(ROOT, "thi-thu/vocab.json"), encoding="utf-8"))
    tags = json.load(open(os.path.join(ROOT, "tools/chu_de.json"), encoding="utf-8"))
    nghia = {}
    for line in open(os.path.join(ROOT, "tools/nghia_de.tsv"), encoding="utf-8"):
        if line.strip() and not line.startswith("#") and "\t" in line:
            k, v = line.rstrip("\n").split("\t", 1)
            nghia[k.strip()] = v.strip()
    topic_of = {}
    for it in tags["items"]:
        for n in it["n"]:
            topic_of[(it["e"], n)] = it["c"]

    qs = [(e, n, lemmas(t)) for e, n, t in exam_questions()]
    exams = sorted({e for e, _, _ in qs})
    cnt, de, cau = collections.Counter(), collections.defaultdict(set), collections.defaultdict(collections.Counter)
    tcnt = collections.defaultdict(collections.Counter)  # từ → chủ đề → số lần
    tunits = collections.defaultdict(lambda: collections.defaultdict(set))
    for e, n, ls in qs:
        tp = topic_of.get((e, n))
        for l in ls:
            cnt[l] += 1
            de[l].add(e)
            cau[l][group_of(n)] += 1
            if tp:
                tcnt[l][tp] += 1
                tunits[l][tp].add((e, n))

    # Kho từ: dấu ★ = số đề có từ (cụm từ: các từ gốc xuất hiện theo thứ tự, sát nhau trong cùng câu)
    def phrase_de(ws):
        hit = set()
        for e, _, ls in qs:
            j, last = 0, -1
            for i, l in enumerate(ls):
                if l == ws[j] and (j == 0 or i - last <= 3):
                    j, last = j + 1, i
                    if j == len(ws):
                        hit.add(e)
                        break
                elif l == ws[0]:
                    j, last = 1, i
        return hit

    seen = {}

    def star(ko):
        """Số đề có mục từ này (0 nếu không gặp)."""
        if ko not in seen:
            base = re.sub(r"\(.*?\)|[~…]", "", ko).strip()
            ws = lemmas(base) if base and not base.startswith("-") else []
            if " " not in base and base in cnt:
                seen[ko] = len(de[base])
            elif len(ws) > 1:
                seen[ko] = len(phrase_de(ws))
            elif len(ws) == 1 and ws[0] == base:
                seen[ko] = len(de.get(base, ()))
            else:
                seen[ko] = 0
        return seen[ko]

    kho, kho_vi = {}, {}
    for g in vocab["g"]:
        if g.get("so", 0) < 0:  # ngữ pháp câu 1–4
            continue
        for w in g["w"]:
            k = star(w[1])
            if k:
                kho[w[0]] = k
            base = re.sub(r"\(.*?\)|[~…]", "", w[1]).strip()
            if " " not in base:
                kho_vi.setdefault(base, w[2])

    # Từ vựng theo chủ đề (EBS phần 8): dấu ★ theo từ
    ebs = json.load(open(os.path.join(ROOT, "tu-vung/chu-de.json"), encoding="utf-8"))
    cdk = {}
    for m in ebs["muc"]:
        for _, items in m["g"]:
            for ko, vi in items:
                k = star(ko)
                if k:
                    cdk[ko] = k
                if " " not in ko:
                    kho_vi.setdefault(ko, vi)

    def meaning(l):
        return kho_vi.get(l) or nghia.get(l)

    missing = []
    uu = []
    for l in sorted(cnt, key=lambda l: (-len(de[l]), -cnt[l], l)):
        if len(de[l]) < MIN_DE:
            continue
        vi = meaning(l)
        if not vi:
            missing.append(l)
            continue
        # “thuộc câu”: tối đa 3 dạng câu gặp nhiều nhất; gặp ở hơn 5 dạng thì ghi “nhiều dạng”
        top = [a for a, _ in cau[l].most_common(3)]
        where = "nhiều dạng" if len(cau[l]) > 5 else ", ".join(glabel(a) for a in sorted(top))
        uu.append([l, vi, len(de[l]), cnt[l], where])

    cd = []
    for tp in TOPIC_ORDER:
        rows = []
        for l, tc in tcnt.items():
            k = tc[tp]
            share = k / sum(tc.values())
            if k < 2 or len(tunits[l][tp]) < 2 or share < 0.6:
                continue
            vi = meaning(l)
            if vi:
                rows.append([l, vi, len(tunits[l][tp]), share])
        # ưu tiên từ gặp ở nhiều đoạn của chủ đề và ít gặp ở chủ đề khác
        rows.sort(key=lambda r: (-r[2] * r[3], r[0]))
        rows = [r[:3] for r in rows]
        cd.append({"k": tp, "t": tags["big"][tp], "w": rows[:TOPIC_MAX]})

    out = {"at": int(time.time() * 1000), "nde": len(exams), "hay": HAY, "kho": kho, "cdk": cdk, "uu": uu, "cd": cd}
    with open(os.path.join(ROOT, "tu-vung/de.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("%d đề · %d từ ưu tiên · %d mục kho có ★ · %d từ chủ đề EBS có ★ · từ khóa chủ đề: %s" % (
        len(exams), len(uu), len(kho), len(cdk), ", ".join("%s %d" % (c["k"], len(c["w"])) for c in cd)))
    if missing:
        print("Chưa có nghĩa (thêm vào tools/nghia_de.tsv nếu cần, từ sơ cấp thì bỏ qua): %d" % len(missing))
        print(" ".join(missing))


if __name__ == "__main__":
    main()
