#!/usr/bin/env python3
"""Đăng bài lên app học sinh: bài hằng ngày của lớp và bài riêng của từng em.

Cách dùng:  python3 tools/sync_app.py <thu-muc-dump>

<thu-muc-dump> là thư mục ArtifactData (out_dir) tải từ cơ sở dữ liệu của trang quản lý:
  classes/, students/, cdays/, assigns/, vassigns/, nassigns/, vroutes/   (mỗi tài liệu một file <id>.json)

Tạo ra:
  thi-thu/app/<mã lớp>.json   {due, days:[{d, f, it:[{y, t, p}]}]}   bài hằng ngày của lớp (14 ngày qua → tương lai)
  thi-thu/app/<mã em>.json    {due, cls:[mã lớp], it:[{y, t, p, d}]}  bài riêng cô tick trong “App · bài riêng”
  <thu-muc-dump>/site_app.json  ghi vào db (collection "site", doc "app") để trang quản lý hiện “đã lên app”.

y = loại link (v từ vựng, n nghe, d đề, l lộ trình từ vựng), p = nội dung link (trang tự đóng gói thành #y=…), t = tên hiển thị.
Không ghi tên học sinh, tên lớp hay ghi chú: tên bài riêng và tên đề trộn có thể chứa tên em nên đặt lại tên chung.
"""
import datetime, glob, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "thi-thu", "app")
KEEP_DAYS = 14
CODE = re.compile(r"^[A-Z0-9]{6}$")
VTYPES = {"match": "Nối từ", "kv": "Hàn → Việt", "vk": "Việt → Hàn", "nk": "Nghe → nghĩa", "type": "Gõ từ", "cau": "Điền câu"}
_EX = None


def ex_of(wid):
    """Câu ví dụ của từ trong kho (thi-thu/vocab.json) — dạng “điền câu” cần câu trong link."""
    global _EX
    if _EX is None:
        _EX = {}
        p = os.path.join(ROOT, "thi-thu", "vocab.json")
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                for g in json.load(f).get("g", []):
                    for w in g.get("w", []):
                        if len(w) > 3 and w[3]:
                            _EX[w[0]] = w[3]
    return _EX.get(wid, "")


def docs(dump, col):
    out = []
    for p in sorted(glob.glob(os.path.join(dump, col, "*.json"))):
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
        d.setdefault("id", os.path.basename(p)[:-5])
        out.append(d)
    return out


def bank_title(eid):
    p = os.path.join(ROOT, "thi-thu", "de", "%s.json" % eid)
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            return json.load(f).get("t") or ""
    return ""


def v_item(a, mine):
    cau = a.get("type") == "cau"
    words = [[it.get("ko", ""), it.get("vi", "")] + ([ex_of(it.get("w"))] if cau else []) for it in a.get("items") or []]
    t = "Ôn từ vựng" if mine else a.get("title", "")
    show = "%s · %d từ · %s" % (t, len(words), VTYPES.get(a.get("type"), "Nối từ"))
    return {"y": "v", "t": show, "p": {"c": a["code"], "t": t, "y": a.get("type") or "match", "w": words}}


def lesson_title(lid):
    p = os.path.join(ROOT, "thi-thu", "nghe", "%s.json" % lid)
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            return json.load(f).get("title") or lid
    return lid


def n_item(a, mine):
    t = lesson_title(a.get("lesson", "")) if mine else a.get("title", "")
    return {"y": "n", "t": t, "p": {"c": a["code"], "t": t, "l": a.get("lesson", "")}}


def d_item(a, mine):
    lp = dict(a.get("lp") or {})
    if not lp.get("c") or not (lp.get("e") or lp.get("q")):
        return None
    lp["c"] = a["code"]
    if lp.get("q"):
        lp["x"] = "Đề ôn câu sai"
    elif mine or not lp.get("x"):
        lp["x"] = bank_title(lp.get("e")) or "Đề thi thử"
    t = "%s · câu %s–%s" % (lp["x"], lp.get("f"), lp.get("t"))
    if lp.get("lt"):  # bài luyện tập: trắc nghiệm từ vựng trước khi làm đề
        t += " · kèm từ vựng"
    return {"y": "d", "t": t, "p": lp}


def l_item(r, vk):
    """Bài lộ trình từ vựng của ngày (khung luyện tập): link #l= của lộ trình, k = bài “ngày k” hoặc bài ôn “R…”."""
    p = {"c": r["code"], "t": r.get("title", ""), "s": r.get("secs") or [], "n": r.get("per"), "y": r.get("type") or "match",
         "d": r.get("start"), "r": r.get("review") or 0}
    if r.get("srs"):
        p["q"] = 1
    day = "bài ôn từ" if str(vk).startswith("R") else "ngày %s" % vk
    return {"y": "l", "t": "%s · %s · %s" % (r.get("title", ""), day, VTYPES.get(p["y"], "")), "p": p, "k": str(vk)}


def ymd(ms):
    return datetime.date.fromtimestamp((ms or 0) / 1000).isoformat()


def write(code, obj, keep):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, code + ".json"), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
    keep.add(code + ".json")


def main(dump):
    classes, students = docs(dump, "classes"), docs(dump, "students")
    cdays = docs(dump, "cdays")
    va = {a["code"]: a for a in docs(dump, "vassigns") if a.get("code")}
    na = {a["code"]: a for a in docs(dump, "nassigns") if a.get("code")}
    ea = {a["code"]: a for a in docs(dump, "assigns") if a.get("code")}
    ra = {r["code"]: r for r in docs(dump, "vroutes") if r.get("code")}
    since = (datetime.date.today() - datetime.timedelta(days=KEEP_DAYS)).isoformat()
    now = int(time.time() * 1000)
    site = {"at": now, "days": [], "a": []}
    keep, report = set(), []

    for c in classes:
        if not CODE.match(c.get("app") or ""):
            continue
        days = []
        for cd in sorted((d for d in cdays if d.get("cls") == c["id"] and (d.get("day") or "") >= since), key=lambda d: d["day"]):
            it = []
            if cd.get("v") in va:
                it.append(v_item(va[cd["v"]], False))
            if cd.get("vr") in ra and cd.get("vk"):
                it.append(l_item(ra[cd["vr"]], cd["vk"]))
            if cd.get("nn") in na:
                it.append(n_item(na[cd["nn"]], False))
            if cd.get("e") in ea:
                x = d_item(ea[cd["e"]], False)
                if x:
                    it.append(x)
            if cd.get("en") in ea:
                x = d_item(ea[cd["en"]], False)
                if x:
                    x["lb"] = "Đề nghe"
                    it.append(x)
            if it:
                days.append({"d": cd["day"], "f": cd.get("focus") or "", "it": it})
                site["days"].append("%s_%s" % (c["id"], cd["day"]))
        write(c["app"], {"v": 1, "at": now, "due": c.get("due") or 22, "days": days}, keep)
        report.append("lớp %s: %d ngày" % (c["app"], len(days)))

    for st in students:
        if not CODE.match(st.get("app") or ""):
            continue
        it = []
        for col, fn in ((va, v_item), (na, n_item), (ea, d_item)):
            for a in col.values():
                if st["id"] in (a.get("app") or []) and a.get("active") is not False:
                    x = fn(a, True)
                    if x:
                        x["d"] = ymd(a.get("created"))
                        it.append(x)
                        site["a"].append("%s@%s" % (a["code"], st["id"]))
        it.sort(key=lambda x: x["d"], reverse=True)
        cls = [c["app"] for c in classes if CODE.match(c.get("app") or "") and st["id"] in (c.get("members") or [])]
        due = next((c.get("due") or 22 for c in classes if st["id"] in (c.get("members") or [])), 22)
        write(st["app"], {"v": 1, "at": now, "due": due, "cls": cls, "it": it}, keep)
        report.append("em %s: %d bài riêng" % (st["app"], len(it)))

    if os.path.isdir(OUT):
        for f in os.listdir(OUT):
            if f.endswith(".json") and f not in keep:
                os.remove(os.path.join(OUT, f))
    with open(os.path.join(dump, "site_app.json"), "w", encoding="utf-8") as f:
        json.dump(site, f, ensure_ascii=False)
    print("Đã đăng lên app: " + ("; ".join(report) or "chưa có lớp / học sinh nào có mã"))
    print("Ghi dấu: ArtifactData set site/app từ", os.path.join(dump, "site_app.json"))


if __name__ == "__main__":
    main(sys.argv[1])
