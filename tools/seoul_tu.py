#!/usr/bin/env python3
"""Từ vựng dạy sâu theo bài Seoul (lớp cần học nhanh nền để vào ôn TOPIK) → trang seoul/tu-sau/.

Cách dùng:  pip install kiwipiepy
            python3 tools/seoul_tu.py

Nguồn (soạn tay): tools/seoul_tu/<cuốn>-<bài>.json
  {b, c, lead, top:[[từ, loại, nghĩa, Hán Việt?]] (từ chủ đề của bài trong TOPIK), topNote,
   w:[{ko (đúng như tools/seoul/<cuốn>.tsv), q:[từ gốc để đếm trong đề] (mặc định ko; [] = không đếm, vd. 일 lẫn với “việc”), p 명/동/형/부, exv (dịch câu ví dụ),
       qv (nghĩa của chữ q khi khác nghĩa cả cụm, vd. 장학금을 신청하다 → q 신청, qv “sự đăng ký” — ⑥ hỏi nghĩa này),
       r:[[từ liên quan, nghĩa]], tip:{t, c:[[cụm, nghĩa]] | x}, up:[[từ trung cấp, loại, nghĩa, Hán Việt?]], note}],
   x:[{g: k kết hợp | h mở rộng | c dễ nhầm, w (số từ), s (câu có “( )”; có q thì s là câu có __chữ__ và q là câu hỏi),
       o (lựa chọn đầu là đáp án), v (dịch), why}],
   cf:[{t tên khung, k loại (Gần nghĩa, Đồng âm, Nhiều nghĩa, Chủ động – bị động…), d giải thích, it:[[từ, nghĩa, dùng khi]], ex:[[câu có __chữ__, dịch]]}]}
  ⑤ Dễ nhầm = khung cf + câu x có g = c; ⑧ Ôn tự sinh trong trang (gõ từ của bài + từ các bài trước cùng cuốn).
  Nghĩa, Hán Việt, câu ví dụ, id từ lấy từ tools/seoul/<cuốn>.tsv (id giống seoul_kho.py: s2a02_<nhóm>_<thứ tự>).

Ghi ra seoul/tu-sau/data/<cuốn>-<bài>.json (thêm k = số đề đọc có từ, de = ≤ 2 câu trong đề, cho từ, từ `up` và `top`)
và seoul/tu-sau/data/ls.json (danh sách bài).
"""
import glob, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seoul_kho import parse  # noqa: E402
from t30 import exam_hits, pick, ROOT  # noqa: E402

SRC = os.path.join(ROOT, "tools", "seoul_tu")
OUT = os.path.join(ROOT, "seoul", "tu-sau", "data")


def book_words(b, c):
    les = [x for x in parse(b) if x["n"] == c]
    if not les:
        sys.exit("%s.tsv không có bài %d" % (b, c))
    out = {}
    for gi, g in enumerate(les[0]["g"], 1):
        for wi, w in enumerate(g["w"]):
            out[w["ko"]] = dict(w, id="s%s%02d_%d_%d" % (b.lower(), c, gi, wi), grp=g["vi"])
    return les[0], out


def main():
    srcs = [json.load(open(f, encoding="utf-8")) for f in sorted(glob.glob(os.path.join(SRC, "*.json")))]
    targets = {}
    for s in srcs:
        for w in s["w"]:
            for q in w.get("q", [w["ko"]]):
                targets[q] = "부" if w["p"] == "부" else (w["p"] if q == w["ko"] else ("동" if q.endswith("다") and w["p"] in "동형" else "명"))
            for u in w.get("up", []):
                targets[u[0]] = u[1]
        for t in s.get("top", []):
            targets[t[0]] = t[1]
    targets = {k: v for k, v in targets.items() if " " not in k}
    hits = exam_hits(targets)

    def info(lems):
        lems = [x for x in lems if x in hits]
        if not lems:
            return {"k": 0, "de": []}
        ks = {x: len(hits[x]["e"]) for x in lems}
        xs = hits[lems[0]]["x"]
        if len(lems) > 1:  # câu có đủ mọi từ gốc → tô từ đầu tới cuối
            other = {(x[0], x[2], x[3]): x for x in hits[lems[1]]["x"]}
            both = [(x[0], x[1], x[2], x[3], min(x[4], other[k][4]), max(x[5], other[k][5]))
                    for x in xs for k in [(x[0], x[2], x[3])] if k in other]
            xs = both or xs
        return {"k": max(ks.values()), "ks": ks if len(lems) > 1 else None, "de": pick(xs)}

    os.makedirs(OUT, exist_ok=True)
    ls = []
    for s in srcs:
        les, bw = book_words(s["b"], s["c"])
        seen = set()
        for n, w in enumerate(s["w"], 1):
            if w["ko"] not in bw:
                sys.exit("%s-%d: “%s” không có trong %s.tsv" % (s["b"], s["c"], w["ko"], s["b"]))
            seen.add(w["ko"])
            t = bw[w["ko"]]
            w.update(n=n, id=t["id"], grp=t["grp"], vi=w.get("vi") or t["vi"], hv=w.get("hv", t["hv"]), ex=w.get("ex") or t["ex"])
            w.update({k: v for k, v in info(w.get("q", [w["ko"]])).items() if v is not None})
            w["up"] = [u + [None] * (4 - len(u)) + [len(hits[u[0]]["e"]) if u[0] in hits else 0,
                                                    pick(hits[u[0]]["x"])[:1] if u[0] in hits else []] for u in w.get("up", [])]
        miss = [k for k in bw if k not in seen]
        if miss:
            print("  %s-%d: chưa soạn: %s" % (s["b"], s["c"], ", ".join(miss)))
        s["top"] = [t + [None] * (4 - len(t)) + [len(hits[t[0]]["e"]), pick(hits[t[0]]["x"])[:1]] for t in s.get("top", [])]
        s.update(ko=les["ko"], vi=les["vi"])
        for i, x in enumerate(s.get("x", [])):
            if ("__" not in x["s"] if x.get("q") else "( )" not in x["s"]) or x["g"] not in ("k", "h", "c") or not 1 <= x["w"] <= len(s["w"]):
                sys.exit("%s-%d x[%d]: cần “( )” (hoặc __chữ__ khi có q), g k|h|c, w đúng" % (s["b"], s["c"], i))
        for i, c in enumerate(s.get("cf", [])):
            if not c.get("t") or not (c.get("it") or c.get("ex")) or any("__" not in e[0] for e in c.get("ex", [])):
                sys.exit("%s-%d cf[%d]: cần t, it hoặc ex (câu có __chữ__)" % (s["b"], s["c"], i))
        name = "%s-%d" % (s["b"], s["c"])
        with open(os.path.join(OUT, name + ".json"), "w", encoding="utf-8") as f:
            json.dump(s, f, ensure_ascii=False, separators=(",", ":"))
        ls.append([s["b"], s["c"], s["ko"], s["vi"], len(s["w"])])
        print("%s: %d từ (%d có câu trong đề), %d từ mở rộng, %d câu luyện (%d dễ nhầm), %d khung dễ nhầm" % (
            name, len(s["w"]), sum(1 for w in s["w"] if w["de"]), sum(len(w["up"]) for w in s["w"]), len(s.get("x", [])),
            sum(1 for x in s.get("x", []) if x["g"] == "c"), len(s.get("cf", []))))
    with open(os.path.join(OUT, "ls.json"), "w", encoding="utf-8") as f:
        json.dump(ls, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
