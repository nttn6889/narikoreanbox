#!/usr/bin/env python3
"""Số liệu cho giáo án doc-chon-loc/ (Đọc chọn lọc — làm bài khi không hiểu hết đoạn văn).

Đọc tools/dau_hieu/<dạng>.json (đáp án, mã dấu hiệu, vị trí manh mối, bẫy) + đoạn văn trong thi-thu/de/<đề>.json.
`python3 tools/doc_chon_loc.py` → doc-chon-loc/data.json:
- t[<dạng>:<loại câu>] = {n, len (số chữ Hàn trung bình của đoạn), rd (% chữ của đoạn nằm trong câu chứa manh mối),
  ns (số câu trung bình của đoạn), p (đếm theo cả mã vị trí manh mối, vd. hs = hai bên + sau), y (đếm từng chữ), x, k (đếm), m (thí nghiệm “máy không đọc”: mn = % lựa chọn ít chữ của bài nhất là đáp án,
  mx = % lựa chọn nhiều chữ của bài nhất là đáp án, la = % lựa chọn giống câu cuối nhất là đáp án, cb = % đúng khi loại chữ tuyệt đối +
  lựa chọn ít chữ của bài nhất rồi đoán (câu ý chính: chọn lựa chọn giống câu cuối nhất))}
- sig[<họ>][<chữ>] = [số lần là đáp án, số lựa chọn có chữ đó]  (họ nd = nội dung khớp, y = ý chính)
- pos = số câu có đáp án ①②③④
So chữ bằng cặp âm tiết (bigram), không cần kiwipiepy.
"""
import json, os, re, glob, collections as C

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def clean(s):
    return re.sub(r'<[^>]+>|[^가-힣]', '', s or '')

def bg(s):
    s = clean(s)
    return {s[i:i + 2] for i in range(len(s) - 1)}

def sents(p):
    p = re.sub(r'<[^>]+>|__|\*\*', ' ', p or '')
    return [x for x in re.split(r'(?<=[.!?])\s+|\n+', p) if clean(x)]

def ovr(o, b):
    g = bg(o)
    return len(g & b) / max(1, len(g))

SIG = {'전혀': '전혀', '항상 · 언제나': '항상|언제나', '반드시 · 꼭': '반드시|꼭 ', '관계없다 · 상관없다': '관계없|상관없|관계가 없',
       '처음 · 이미': '처음|이미', '모든 · 모두': '모든|모두', '만 · 뿐 (chỉ)': '만 |만이|에만|뿐', '가장 · 제일': '가장|제일',
       '-기도 하다': '기도 한다|기도 했다|기도 하다|기도 하는', '-ㄹ 수(도) 있다': '수 있다|수도 있다', '-아야 한다 · 필요하다': '야 한다|필요가 있다|필요하다|해야',
       'phủ định (안 · 못 · 않 · 없)': ' 안 |지 않|못 |지 못|없다|없는'}
ABS = '전혀|항상|언제나|반드시|관계없|상관없|관계가 없'
MAINY = lambda f, t: f == '35-38' or t in ('y', 'm')

def main():
    P, O = {}, {}
    for f in glob.glob(os.path.join(ROOT, 'thi-thu', 'de', '*.json')):
        d = json.load(open(f, encoding='utf-8'))
        if not isinstance(d, dict) or 'q' not in d:
            continue
        last = ''
        for q in d['q']:
            if not q.get('share'):
                last = q.get('passage') or ''
            P[(d['id'], q['n'])] = last
            O[(d['id'], q['n'])] = q.get('opts') or []
    T = C.defaultdict(lambda: {'n': 0, 'L': [], 'R': [], 'S': [], 'p': C.Counter(), 'y': C.Counter(), 'x': C.Counter(), 'k': C.Counter(),
                               'mn': [0, 0], 'mx': [0, 0], 'la': [0, 0], 'cb': [0, 0.0]})
    sig = C.defaultdict(lambda: C.defaultdict(lambda: [0, 0]))
    pos = [0, 0, 0, 0]
    for fp in sorted(glob.glob(os.path.join(ROOT, 'tools', 'dau_hieu', '*.json'))):
        f = os.path.basename(fp)[:-5]
        for q in json.load(open(fp, encoding='utf-8')):
            key = f + ':' + (q.get('t') or '')
            r = T[key]
            r['n'] += 1
            pos[q['a']] += 1
            if q.get('p'):
                r['p'][q['p']] += 1
                r['p']['#'] += 1
            for c in (q.get('y') or ''):
                r['y'][c] += 1
            if q.get('y'):
                r['y']['#'] += 1
            for c in set(q.get('k') or ''):
                r['k'][c] += 1
            for v in (q.get('x') or {}).values():
                r['x'][v] += 1
            k = (q['e'], q['n'])
            tx = q.get('tx')
            tx = ' '.join(tx) if isinstance(tx, list) else (tx or '')
            p = (P.get(k, '') + ' ' + tx).strip()
            o = O.get(k) or []
            if clean(p):
                r['L'].append(len(clean(p)))
                ss = sents(p)
                r['S'].append(len(ss))
                cs = [c[0] for c in (q.get('c') or []) if c and c[0]]
                if cs and len(ss) > 1:
                    hit = [s for s in ss if any(c in s or s in c for c in cs)]
                    if hit:
                        r['R'].append(sum(len(clean(s)) for s in hit) / max(1, sum(len(clean(s)) for s in ss)))
            if len(o) != 4:
                continue
            fam = 'nd' if q.get('t') == 'n' else ('y' if MAINY(f, q.get('t')) else None)
            if fam:
                for i, x in enumerate(o):
                    for nm, rx in SIG.items():
                        if re.search(rx, ' ' + x + ' '):
                            sig[fam][nm][1] += 1
                            sig[fam][nm][0] += i == q['a']
            if not clean(p) or any(not clean(x) for x in o):
                continue
            pb = bg(p)
            ov = [ovr(x, pb) for x in o]
            a = q['a']
            r['mn'][0] += 1; r['mn'][1] += ov.index(min(ov)) == a
            r['mx'][0] += 1; r['mx'][1] += ov.index(max(ov)) == a
            ss = sents(p)
            lb = bg(ss[-1]) if ss else set()
            ol = [ovr(x, lb) for x in o]
            r['la'][0] += 1; r['la'][1] += ol.index(max(ol)) == a
            keep = [i for i in range(4) if not re.search(ABS, o[i])] or list(range(4))
            if len(keep) > 1:
                keep.remove(min(keep, key=lambda i: ov[i]))
            if MAINY(f, q.get('t')):
                acc = float(max(keep, key=lambda i: ol[i]) == a)
            else:
                acc = (a in keep) / len(keep)
            r['cb'][0] += 1; r['cb'][1] += acc
    out = {}
    pc = lambda v: round(100 * v[1] / v[0]) if v[0] else None
    for key, r in sorted(T.items()):
        out[key] = {'n': r['n'], 'len': round(sum(r['L']) / len(r['L'])) if r['L'] else 0,
                    'ns': round(sum(r['S']) / len(r['S']), 1) if r['S'] else 0,
                    'rd': round(100 * sum(r['R']) / len(r['R'])) if r['R'] else None, 'nr': len(r['R']),
                    'p': dict(r['p']), 'y': dict(r['y']), 'x': dict(r['x']), 'k': dict(r['k']),
                    'm': {'n': r['mn'][0], 'mn': pc(r['mn']), 'mx': pc(r['mx']), 'la': pc(r['la']), 'cb': pc(r['cb'])}}
    data = {'t': out, 'sig': {f: {k: v for k, v in d.items()} for f, d in sig.items()}, 'pos': pos}
    os.makedirs(os.path.join(ROOT, 'doc-chon-loc'), exist_ok=True)
    json.dump(data, open(os.path.join(ROOT, 'doc-chon-loc', 'data.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    for key, v in out.items():
        print(key, v['n'], 'len', v['len'], 'câu', v['ns'], 'đọc', v['rd'], '%', v['m'])
    print('pos', pos)

if __name__ == '__main__':
    main()
