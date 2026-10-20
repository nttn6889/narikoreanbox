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
Danh từ làm tân ngữ thì ghi cả cụm động từ: “N을/를 (phó từ) V” → “N을/를 V다” (도움을 주다, 문제를 해결하다);
“N을/를 하다” → “N하다” nếu có từ đó (공부를 하다 → 공부하다), không thì “N을 하다” (역할을 하다). Không ghép với động từ
của mẫu ngữ pháp (을 통해, 을 위해…: GRAM_V). Nghĩa cụm: kho từ (mục dạng “N을 V”), tools/cum_de.tsv, không có thì ghép
“nghĩa động từ + nghĩa danh từ” (script in ra cụm chưa có nghĩa trong cum_de.tsv → bổ sung khi rảnh). Cụm được giữ khi
danh từ không phải từ sơ cấp hoặc cụm có nghĩa riêng (kho từ / cum_de.tsv); không thì chỉ giữ động từ như cũ.

Định dạng: {"id", "w": [[từ gốc, nghĩa, số đề gặp, [chữ trong đề…]], …], "q": {"<câu>": [chỉ số w…]}}
  số đề gặp = số đề (trong tất cả đề) có từ này — trang ưu tiên từ hay gặp khi chọn câu hỏi trắc nghiệm;
  chữ trong đề = dạng xuất hiện trong câu (để tô và chạm xem nghĩa trong bài làm).
"""
import collections, glob, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from thong_ke_de import CLEAN, ROOT, SUF, kiwi  # noqa: E402
from tu_cot_loi import meanings, sentences  # noqa: E402

OUT = os.path.join(ROOT, "thi-thu/de/tu")
SEOUL_SC = {"Seoul 1A", "Seoul 1B", "Seoul 2A", "Seoul 2B"}
# từ gốc chỉ là một phần của mẫu ngữ pháp (에 대해, 에 의하면, 을 위해…) hoặc đại từ — không đưa vào bảng từ
STOP = {"이러하다", "그러하다", "저러하다", "어떠하다", "대하다", "의하다", "위하다", "관하다", "인하다", "비하다", "아니하다", "못하다", "말다"}
# động từ chỉ là một phần mẫu ngữ pháp sau 을/를 (을 통해, 을 위해, 을 비롯해…) — không ghép thành cụm
GRAM_V = {"통하다", "위하다", "대하다", "비롯하다", "제외하다", "막론하다", "불문하다", "중심하다", "바탕하다", "향하다", "말하다"}
SUF2 = dict(SUF, 시키="시키다")
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


def obj(n):
    c = ord(n[-1]) - 0xAC00
    return n + ("을" if 0 <= c < 11172 and c % 28 else "를")


def spans(s):
    """[(kiểu, từ gốc, a, b)] — kiểu N/V/A/AD hoặc P (cụm tân ngữ: từ gốc = (danh từ, động từ)); a, b = vị trí chữ trong s."""
    out, toks, i = [], kiwi.tokenize(s), 0
    while i < len(toks):
        t = toks[i]
        tag, nxt = t.tag.split("-")[0], toks[i + 1] if i + 1 < len(toks) else None
        if tag in ("NNG", "NNP", "XR"):
            if nxt is not None and nxt.tag in ("XSV", "XSA") and nxt.form in SUF2:
                out.append(("V" if nxt.tag == "XSV" else "A", t.form + SUF2[nxt.form], t.start, nxt.start + nxt.len))
                i += 2
                continue
            if tag != "XR" and nxt is not None and nxt.tag == "JKO":
                j = i + 2
                while j < len(toks) and toks[j].tag == "MAG":
                    j += 1
                v = toks[j] if j < len(toks) else None
                vl, last = None, j
                if v is not None and v.tag == "VV":
                    vl = v.form + "다"
                elif v is not None and v.tag == "NNG" and j + 1 < len(toks) and toks[j + 1].tag == "XSV" and toks[j + 1].form in SUF2:
                    vl, last = v.form + SUF2[toks[j + 1].form], j + 1
                if vl and vl not in GRAM_V:
                    out.append(("P", (t.form, vl), t.start, toks[last].start + toks[last].len, j))
                    i += 1  # danh từ + động từ: nếu không giữ cụm thì động từ vẫn được xét riêng (chỉ số j)
                    continue
            if tag != "XR":
                out.append(("N", t.form, t.start, t.start + t.len))
        elif tag in ("VV", "VA"):
            out.append(("V" if tag == "VV" else "A", t.form + "다", t.start, t.start + t.len, i))
        elif tag == "MAG":
            out.append(("AD", t.form, t.start, t.start + t.len))
        i += 1
    return out


def phrases(vi):
    """Nghĩa cụm “N을/를 V다”: kho từ, rồi tools/cum_de.tsv (ưu tiên)."""
    out = {}
    vocab = json.load(open(os.path.join(ROOT, "thi-thu/vocab.json"), encoding="utf-8"))
    for g in vocab["g"]:
        if g.get("so", 0) < 0:
            continue
        for w in g["w"]:
            k = re.sub(r"\(.*?\)|[~…]", "", w[1]).strip()
            if re.match(r"^[가-힣]+[을를] [가-힣]+다$", k):
                out.setdefault(k, w[2])
    f = os.path.join(ROOT, "tools/cum_de.tsv")
    if os.path.exists(f):
        for line in open(f, encoding="utf-8"):
            if line.strip() and not line.startswith("#") and "\t" in line:
                k, v = line.rstrip("\n").split("\t", 1)
                out[k.strip()] = v.strip()
    return out


def first_sense(v):
    v = re.sub(r"\s*★+$", "", v or "")
    v = re.sub(r"\(.*?\)", "", re.split(r"[,;/]", v)[0]).strip()
    return re.sub(r"^(sự|việc|cái)\s+", "", v)


def q_text(q):
    st = q.get("stem") or ""
    return [q.get("passage") or "", st if "십시오" not in st else ""] + list(q.get("opts") or [])


def main(dump):
    vi, kho, lv = meanings()
    phr = phrases(vi)
    missing = collections.Counter()

    def sc(l):
        return lv[l] == "1" if lv.get(l) in ("0", "1") else bool(SEOUL_SC & set(kho.get(l, [])))

    def phrase_of(n, v):
        """Từ gốc của cụm tân ngữ (đồng thời ghi nghĩa vào vi), None nếu không giữ cụm."""
        if v == "하다" and vi.get(n + "하다"):
            return n + "하다"
        k = obj(n) + " " + v
        if phr.get(k) == "x":
            return None
        if k in phr:
            vi[k] = phr[k]
            lv[k] = "0"
            return k
        if lv.get(n) == "x" or n in STOP or not vi.get(n) or sc(n):
            return None
        missing[k] += 1
        vv = first_sense(vi.get(v, "")) if v != "하다" else "làm"
        vi[k] = (vv + " " + first_sense(vi[n])).strip() if vv else first_sense(vi[n]) + " (" + v + ")"
        lv[k] = "0"
        return k
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
                    sp = spans(s)
                    skip = set()
                    picked = []
                    for x in sp:
                        if x[0] == "P":
                            n, v = x[1]
                            l = phrase_of(n, v)
                            if l:
                                picked.append((l, x[2], x[3]))
                                skip.add(x[4])
                            continue
                        if len(x) > 4 and x[4] in skip:
                            continue
                        picked.append((x[1], x[2], x[3]))
                    for l, a, b in picked:
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
    if missing:
        f = os.path.join(dump or ".", "cum_de_thieu.tsv")
        with open(f, "w", encoding="utf-8") as fo:
            for k, c in missing.most_common():
                fo.write("%s\t%s\t%d\n" % (k, vi[k], c))
        print("%d cụm “N을/를 V” chưa có nghĩa trong tools/cum_de.tsv (đang ghép tạm) → %s" % (len(missing), f))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
