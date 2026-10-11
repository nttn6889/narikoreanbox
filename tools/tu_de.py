#!/usr/bin/env python3
"""Từ vựng theo từng câu đề → thi-thu/de/tu/<id đề>.json (bài “Luyện tập”: trắc nghiệm từ trước khi làm đề).

Cách dùng:  pip install kiwipiepy
            python3 tools/tu_de.py [<thu-muc-dump>]
  <thu-muc-dump> (tùy chọn): ArtifactData `list` `bank/<id>/q` với out_dir → <dump>/bank/<id>/q/*.json;
  chỉ dùng trường `explain` (kịch bản) của đề NGHE chưa có kịch bản trong repo (vd. Etk091n). Không ghi kịch bản ra file,
  chỉ ghi từ gốc + nghĩa.

Nguồn chữ của từng câu: đoạn văn, câu hỏi (bỏ dòng hướng dẫn “…십시오”), 4 lựa chọn.
Đề nghe (…n): thêm kịch bản — đề kịch bản cùng tên (…k), bài luyện nghe thi-thu/nghe/N*.json có cùng file nghe, hoặc dump.
Chỉ giữ từ có nghĩa (cot_loi.tsv, kho từ, chu-de.json, nghia_de.tsv), bỏ từ sơ cấp và mảnh tách từ (cấp x).

Định dạng: {"id", "w": [[từ gốc, nghĩa, số đề gặp, [chữ trong đề…]], …], "q": {"<câu>": [chỉ số w…]}}
  số đề gặp = số đề (trong tất cả đề) có từ này — trang ưu tiên từ hay gặp khi chọn câu hỏi trắc nghiệm;
  chữ trong đề = dạng xuất hiện trong câu (để tô và chạm xem nghĩa trong bài làm).
"""
import collections, glob, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from thong_ke_de import CLEAN, ROOT  # noqa: E402
from tu_cot_loi import lemma_spans, meanings, sentences  # noqa: E402

OUT = os.path.join(ROOT, "thi-thu/de/tu")
SEOUL_SC = {"Seoul 1A", "Seoul 1B", "Seoul 2A", "Seoul 2B"}
# từ gốc chỉ là một phần của mẫu ngữ pháp (에 대해, 에 의하면, 을 위해…) hoặc đại từ — không đưa vào bảng từ
STOP = {"이러하다", "그러하다", "저러하다", "어떠하다", "대하다", "의하다", "위하다", "관하다", "인하다", "비하다", "아니하다", "못하다", "말다"}
SPEAKER = re.compile(r"^\s*\*{0,2}[가-힣A-Za-z]{1,4}\s*:\s*\*{0,2}\s*", re.M)


def exams():
    for f in sorted(glob.glob(os.path.join(ROOT, "thi-thu/de/*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        if d["id"].endswith("old"):
            continue
        yield d


def lesson_scripts():
    """file nghe → kịch bản (bài luyện nghe N*.json)."""
    out = {}
    for f in glob.glob(os.path.join(ROOT, "thi-thu/nghe/N*.json")):
        L = json.load(open(f, encoding="utf-8"))
        for it in L.get("items", []):
            if it.get("audio"):
                out[it["audio"]] = " ".join(re.sub(r"[\[\]]", "", s.get("ko", "")) for s in it.get("script", []))
    return out


def dump_explain(dump, eid):
    out = {}
    for f in glob.glob(os.path.join(dump or "", "bank", eid, "q", "*.json")):
        d = json.load(open(f, encoding="utf-8"))
        d = d.get("data", d)
        if d.get("n") and d.get("explain"):
            out[int(d["n"])] = d["explain"]
    return out


def q_text(q):
    st = q.get("stem") or ""
    return [q.get("passage") or "", st if "십시오" not in st else ""] + list(q.get("opts") or [])


def main(dump):
    vi, kho, lv = meanings()
    all_ex = list(exams())
    by_id = {d["id"]: d for d in all_ex}
    scripts = lesson_scripts()

    per = {}  # đề → câu → Counter(từ gốc) ; surf[đề][từ] = set(chữ)
    surf = collections.defaultdict(lambda: collections.defaultdict(set))
    de = collections.defaultdict(set)
    for d in all_ex:
        e = d["id"]
        extra = {}
        if e.endswith("n"):
            k = by_id.get(e[:-1] + "k")
            if k:
                extra = {q["n"]: q.get("passage") or "" for q in k["q"]}
            for q in d["q"]:
                if q.get("audio") and q["audio"] in scripts:
                    extra.setdefault(q["n"], scripts[q["audio"]])
            for n, t in dump_explain(dump, e).items():
                extra.setdefault(n, t)
        qs = {}
        for q in d["q"]:
            parts = q_text(q)
            if extra.get(q["n"]):
                parts.append(SPEAKER.sub("", extra[q["n"]]))
            c = collections.Counter()
            for part in parts:
                for raw in sentences(part):
                    s = re.sub(r"\s+", " ", CLEAN.sub(" ", raw)).strip()
                    for l, p, a, b in lemma_spans(s):
                        c[l] += 1
                        de[l].add(e)
                        x = s[a:b].strip()
                        if len(x) >= 2:
                            surf[e][l].add(x)
            qs[q["n"]] = c
        per[e] = qs

    def keep(l):
        if lv.get(l) == "x" or l in STOP or not vi.get(l):
            return False
        sc = lv[l] == "1" if lv.get(l) in ("0", "1") else bool(SEOUL_SC & set(kho.get(l, [])))
        return not sc

    os.makedirs(OUT, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, "*.json")):
        os.remove(f)
    tot = 0
    for e, qs in per.items():
        idx, w, q_out = {}, [], {}
        for n in sorted(qs):
            ids = []
            for l, _ in qs[n].most_common():
                if not keep(l):
                    continue
                if l not in idx:
                    idx[l] = len(w)
                    w.append([l, re.sub(r"\s*★+$", "", vi[l]), len(de[l]), sorted(surf[e][l], key=lambda x: -len(x))])
                ids.append(idx[l])
            if ids:
                q_out[str(n)] = ids
        if not w:
            continue
        with open(os.path.join(OUT, e + ".json"), "w", encoding="utf-8") as f:
            json.dump({"id": e, "w": w, "q": q_out}, f, ensure_ascii=False, separators=(",", ":"))
        tot += 1
        nq = [len(v) for v in q_out.values()]
        print("%-9s %3d từ · %2d câu · trung bình %.1f từ/câu" % (e, len(w), len(q_out), sum(nq) / max(1, len(nq))))
    print("Ghi %d tệp vào thi-thu/de/tu/" % tot)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
