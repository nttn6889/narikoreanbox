#!/usr/bin/env python3
"""Ngữ pháp giáo trình Seoul (collection `grammar` của trang quản lý) → seoul/ngu-phap/np.json cho trang seoul/ngu-phap/.

Cách dùng:  python3 tools/seoul_np.py <dump>
  <dump> = thư mục ArtifactData `list` collection `grammar` với out_dir (có <dump>/grammar/g_*.json).

grammar/<id>: {src, book, lesson, no, page, title, mean{ko,vi}, form{ko,vi?}, table[[…]], ex[…], notes[{ko,vi,table,ex}], order}
→ np.json: {at, b:{"3A":[{n, ko (tên bài tiếng Hàn), vi, g:[{no, t, p, m, f, tb, ex, nt}]}]}}
Tên bài lấy từ seoul/bai.json (Việt) và thi-thu/vocab.json (phần "Seoul 3A · Bài 1 · <tên Hàn>").
Chỉ lấy nguồn là giáo trình Seoul (src 1A…4B). Bỏ tiếng Anh nếu có.
"""
import glob, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]

# Cách kết hợp (form.ko) của 2A–3A chưa có bản Việt → dịch các câu hay gặp.
FORM_VI = {
    "동사와 결합한다.": "Kết hợp với động từ.",
    "형용사와 결합한다.": "Kết hợp với tính từ.",
    "명사와 결합한다.": "Kết hợp với danh từ.",
    "명사와 함께 쓴다.": "Dùng với danh từ.",
    "명사 뒤에 쓴다.": "Đặt sau danh từ.",
    "동사 뒤에 쓴다.": "Đặt sau động từ.",
    "형용사, 동사와 결합한다.": "Kết hợp với tính từ, động từ.",
    "형용사나 동사와 결합한다.": "Kết hợp với tính từ, động từ.",
    "형용사, 동사, 명사와 결합한다.": "Kết hợp với tính từ, động từ, danh từ.",
    "형용사, 동사, 명사와 모두 결합한다.": "Kết hợp được với cả tính từ, động từ, danh từ.",
    "동사, 명사와 결합한다.": "Kết hợp với động từ, danh từ.",
    "명사, 동사와 결합한다.": "Kết hợp với danh từ, động từ.",
    "형용사, 동사와 결합하며 주로 동사가 오는 경우가 많고 형용사는 다소 제한적이다.":
        "Kết hợp với tính từ, động từ; chủ yếu là động từ, tính từ dùng hạn chế hơn.",
    "동사와 결합한다('-는 중이다'). 명사와 함께 쓴다('중이다').":
        "Động từ + -는 중이다; danh từ + 중이다.",
    "주로 결합하는 동사가 한정되어 있다. 다음은 자주 결합되는 동사의 목록이다.":
        "Chỉ đi với một số động từ nhất định. Dưới đây là các động từ hay đi kèm.",
    "반말의 종결어미는 해요체의 '-아요/어요'에서 '-요'를 제외한 형태를 사용한다. 명사가 선행될 경우 '(이)야'를 사용한다.":
        "Đuôi 반말 = bỏ '-요' của -아요/어요; sau danh từ dùng '(이)야'.",
    "의문의 뜻을 나타내는 명사 또는 대명사와 결합한다.": "Kết hợp với danh từ / đại từ nghi vấn (누구, 무엇, 어디…).",
}


def tri(o):
    o = o or {}
    return {k: o[k] for k in ("ko", "vi") if o.get(k)}


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    dump = sys.argv[1]
    files = sorted(glob.glob(os.path.join(dump, "grammar", "*.json")))
    if not files:
        sys.exit("Không thấy " + os.path.join(dump, "grammar", "*.json"))
    bai = json.load(open(os.path.join(ROOT, "seoul", "bai.json"), encoding="utf-8"))
    ko_title = {}
    for g in json.load(open(os.path.join(ROOT, "thi-thu", "vocab.json"), encoding="utf-8"))["g"]:
        m = re.match(r"^Seoul (\w+) · Bài (\d+) · (.*)$", g.get("sec", ""))
        if m:
            ko_title[m.group(1) + "-" + m.group(2)] = m.group(3)
    pts, miss = [], set()
    for f in files:
        d = json.load(open(f, encoding="utf-8"))
        d = d.get("data", d)
        if d.get("src") not in BOOKS:
            continue
        form = tri(d.get("form"))
        if form.get("ko") and not form.get("vi"):
            if form["ko"] in FORM_VI:
                form["vi"] = FORM_VI[form["ko"]]
            else:
                miss.add(form["ko"])
        p = {"no": d.get("no"), "t": d.get("title", ""), "p": d.get("page"), "m": tri(d.get("mean"))}
        if form:
            p["f"] = form
        if d.get("table"):
            p["tb"] = d["table"]
        if d.get("ex"):
            p["ex"] = d["ex"]
        nt = []
        for n in d.get("notes") or []:
            x = tri(n)
            if n.get("table"):
                x["tb"] = n["table"]
            if n.get("ex"):
                x["ex"] = n["ex"]
            if x:
                nt.append(x)
        if nt:
            p["nt"] = nt
        pts.append((d["src"], int(d.get("lesson") or 0), d.get("order") or 0, p))
    pts.sort(key=lambda x: (BOOKS.index(x[0]), x[1], x[2]))
    out = {"at": int(time.time() * 1000), "b": {}}
    for src, les, _, p in pts:
        lst = out["b"].setdefault(src, [])
        if not lst or lst[-1]["n"] != les:
            k = src + "-" + str(les)
            lst.append({"n": les, "ko": ko_title.get(k, ""), "vi": bai.get(k, ""), "g": []})
        lst[-1]["g"].append(p)
    path = os.path.join(ROOT, "seoul", "ngu-phap", "np.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    for b, lst in out["b"].items():
        print(b, len(lst), "bài,", sum(len(x["g"]) for x in lst), "điểm ngữ pháp")
    for s in sorted(miss):
        print("Chưa có bản Việt cho cách kết hợp:", s)
    print("→", os.path.relpath(path, ROOT), os.path.getsize(path), "byte")


if __name__ == "__main__":
    main()
