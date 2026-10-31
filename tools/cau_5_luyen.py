#!/usr/bin/env python3
"""Bài trắc nghiệm của trang cau-5/luyen/ (theo nhóm đồ vật câu 5 + từ láy câu 5–8 trong kho từ).

python3 tools/cau_5_luyen.py [<thư mục ra vassigns>]
  đọc thi-thu/vocab.json (phần `Câu 5 · 제품 광고 N · …`, `Câu 5–8 · 의성어·의태어 …`)
  → cau-5/luyen/tq.json  [[mã, tên, số từ, link #v=, thẻ]]
  → <thư mục>/vassigns/<mã>.json (ArtifactData batch set collection vassigns để cô chấm được mã NV1-)
Mỗi bài ≤ MAX từ (nhóm lớn chia 2–3 phần theo ranh giới đồ vật). Chạy lại sau khi sửa từ câu 5 trong kho từ.
"""
import base64, json, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAX = 36
TYPE = 'kv+vk'


def ssum(s):
    h = 7
    for ch in s:
        h = (h * 31 + ord(ch)) % 1679616
    out = ''
    while h:
        h, r = divmod(h, 36)
        out = '0123456789abcdefghijklmnopqrstuvwxyz'[r] + out
    return out.rjust(4, '0')


def link(obj):
    raw = base64.b64encode(json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode()).decode()
    raw = raw.replace('+', '-').replace('/', '_').rstrip('=')
    return 'v=' + raw + '.' + ssum(raw)


def chunks(objs):
    """objs = [[nhóm, [từ]]] → chia ≤ MAX từ/phần, không cắt đôi đồ vật."""
    n = sum(len(o[1]) for o in objs)
    k = -(-n // MAX)
    if k <= 1:
        return [objs]
    goal, out, cur, c = n / k, [], [], 0
    for o in objs:
        if cur and c + len(o[1]) / 2 > goal * (len(out) + 1) and len(out) < k - 1:
            out.append(cur); cur = []
        cur.append(o); c += len(o[1])
    out.append(cur)
    return out


def main():
    voc = json.load(open(os.path.join(ROOT, 'thi-thu/vocab.json'), encoding='utf-8'))
    gs = sorted(voc['g'], key=lambda g: (g['so'], g['o']))
    secs, tl = {}, []
    for g in gs:
        m = re.match(r'^Câu 5 · 제품 광고 (\d+) · (.+)$', g['sec'])
        if m:
            secs.setdefault(int(m.group(1)), [m.group(2), []])[1].append(g)
        elif g['sec'].startswith('Câu 5–8 · 의성어'):
            tl.append(g)
    tq, docs = [], []
    def add(code, title, tab, objs):
        items = [w for o in objs for w in o['w']]
        obj = {'c': code, 't': title, 'y': TYPE, 'w': [[w[1], w[2], ''] for w in items]}
        tq.append([code, title, len(items), link(obj), tab])
        docs.append({'code': code, 'title': title, 'type': TYPE, 'created': int(time.time() * 1000),
                     'items': [{'w': w[0], 'ko': w[1], 'vi': w[2]} for w in items]})
    for n in sorted(secs):
        name, objs = secs[n]
        parts = chunks([[o, o['w']] for o in objs])
        for pi, part in enumerate(parts):
            code = 'C5G%d%s' % (n, 'ABC'[pi] if len(parts) > 1 else '')
            title = 'Câu 5 · Nhóm %d: %s%s' % (n, name, ' (%d/%d)' % (pi + 1, len(parts)) if len(parts) > 1 else '')
            add(code, title, 'n%d' % n, [o[0] for o in part])
    half = (len(tl) + 1) // 2
    for i, part in enumerate([tl[:half], tl[half:]]):
        add('C5T%d' % (i + 1), 'Câu 5–8 · Từ láy, tượng thanh %d/2' % (i + 1), 'l%d' % (i + 1), part)
    json.dump(tq, open(os.path.join(ROOT, 'cau-5/luyen/tq.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    if len(sys.argv) > 1:
        d = os.path.join(sys.argv[1], 'vassigns'); os.makedirs(d, exist_ok=True)
        for x in docs:
            json.dump(x, open(os.path.join(d, x['code'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    for x in tq:
        print(x[0], x[2], x[1])


if __name__ == '__main__':
    main()
