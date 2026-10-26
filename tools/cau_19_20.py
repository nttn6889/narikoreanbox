#!/usr/bin/env python3
"""Học câu 19–20 theo khuôn bài dạng câu (cau-19-20/moi/): gom phần câu 19–20 của trang cũ + 5 chuyên đề, ghi cau-19-20/moi/data.json.

Nguồn (không soạn lại, sửa nguồn thì chạy lại script này):
  cau-19-20/index.html       biến R (22 bài: đáp án, chữ quyết định, giải thích, lỗi từng lựa chọn câu 19 + 20), ADV (14 phó từ đi cặp),
                             REL2 / CMP2 (từ nối), MCQ / MV (câu luyện + nghĩa) — đọc bằng node
  tools/dau_hieu/19-20.json  mã dấu hiệu câu 19 (H hô ứng, D đảo chiều, K kết luận, T thêm, C chuyển), mã bẫy câu 20 (N T C H A)
  doc-dap-an/data.json       câu 20 dạng nội dung: nghĩa Việt lựa chọn, cặp chữ bài ⇒ lựa chọn, câu căn cứ
  dong-trai/data.json        cách đáp án câu 20 nói lại (ok)
  thi-thu/de/tu/<đề>.json    từ của bài
  tools/cau_19_20/bai.txt    dịch từng câu + vai trò câu (Claude soạn); vi20.txt nghĩa lựa chọn câu 20 dạng chủ đề
"""
import json, os, re, subprocess, collections, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from doc_dap_an import split_sents

JS = r"""
const fs=require('fs');const h=fs.readFileSync(process.argv[1],'utf8');
const a=h.slice(h.indexOf('var R = ['),h.indexOf('var MNAME'));
const b=h.slice(h.indexOf("MCQ['2nK']=["),h.indexOf('Object.assign(MNAME'));
const o=new Function(a+';'+b+';return {R,PAIRS,REL,MCQ,MV,ADV,REL2,CMP2};')();
process.stdout.write(JSON.stringify(o));
"""


def load_old():
    out = subprocess.run(['node', '-e', JS, os.path.join(ROOT, 'cau-19-20', 'index.html')], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def load_bai():
    out, cur = {}, None
    for ln in open(os.path.join(ROOT, 'tools', 'cau_19_20', 'bai.txt'), encoding='utf-8'):
        ln = ln.rstrip('\n')
        if not ln.strip() or ln.startswith('# '):
            continue
        if ln.startswith('## '):
            cur = out[ln[3:].strip()] = []
            continue
        r, v = [x.strip() for x in ln.split('|', 1)]
        cur.append([v, r])
    return out


def nos(s):
    return re.sub(r'[\s.,!?“”"\'‘’·]', '', s)


def find_sent(ss, frag):
    f = nos(frag)
    for i, s in enumerate(ss):
        if f and f in nos(s):
            return i
    return -1


def main():
    old = load_old()
    bai = load_bai()
    vi20 = {}
    for ln in open(os.path.join(ROOT, 'tools', 'cau_19_20', 'vi20.txt'), encoding='utf-8'):
        if ln.strip() and not ln.startswith('#'):
            p = [x.strip() for x in ln.split('|')]
            vi20[p[0]] = p[1:]
    dh = {(x['e'], x['n']): x for x in json.load(open(os.path.join(ROOT, 'tools', 'dau_hieu', '19-20.json'), encoding='utf-8'))}
    dd = {x['e']: x for x in json.load(open(os.path.join(ROOT, 'doc-dap-an', 'data.json'), encoding='utf-8'))['it'] if x['n'] == 20}
    dt = {x['e']: x for x in json.load(open(os.path.join(ROOT, 'dong-trai', 'data.json'), encoding='utf-8'))['it'] if x['n'] == 20}
    items, err = [], []
    st = collections.defaultdict(collections.Counter)
    for r in old['R']:
        e = r['id']
        ss = split_sents(r['p'])
        tr = bai.get(e)
        if not tr or len(tr) != len(ss):
            err.append('%s: %d câu, dịch %d' % (e, len(ss), len(tr or [])))
            continue
        bi = next(i for i, s in enumerate(ss) if re.search(r'\(\s+\)', s))
        ev2 = -1
        for c in r.get('c2') or []:
            ev2 = find_sent(ss, c)
            if ev2 >= 0:
                break
        h19, h20 = dh.get((e, 19), {}), dh.get((e, 20), {})
        d20 = dd.get(e)
        v2 = vi20.get(e) or (d20['v'] if d20 else ['', '', '', ''])
        p2 = d20['p'] if d20 else [[], [], [], []]
        at2 = d20['at'] if d20 else [-1, -1, -1, -1]
        at2 = list(at2)
        at2[r['a2']] = ev2 if ev2 >= 0 else at2[r['a2']]
        tu_p = os.path.join(ROOT, 'thi-thu', 'de', 'tu', e + '.json')
        wl = []
        if os.path.exists(tu_p):
            tu = json.load(open(tu_p, encoding='utf-8'))
            seen = set()
            for n in ('19', '20'):
                for i in tu['q'].get(n, []):
                    if i not in seen:
                        seen.add(i); w = tu['w'][i]; wl.append([w[0], w[1], w[2]])
        head = re.sub(r'\(\s+\)', '', ss[bi]).strip()
        pos = 'd' if re.match(r'^\(\s+\)', ss[bi].strip()) else 'g'
        it = {
            'id': e, 'src': r['src'], 'real': r.get('real', 0), 'b': r['b'],
            's': [[ko, vi, ro] for ko, (vi, ro) in zip(ss, tr)], 'bi': bi, 'pos': pos,
            # câu 19
            'o': r['o'], 'a': r['a'], 'k': r['k'], 'c': r['c'], 'w': r['w'], 'x': r['x'], 'dk': h19.get('k', ''),
            # câu 20
            't': r['t'], 'q2': r['s'], 'o2': r['o2'], 'v2': v2, 'a2': r['a2'], 'c2': r['c2'], 'w2': r['w2'], 'x2': r['x2'],
            'b2': h20.get('x', {}), 'ok2': (dt.get(e) or {}).get('ok', ''), 'p2': p2, 'at2': at2, 'ev2': ev2, 'z': r.get('z', ''),
            'tu': wl,
        }
        items.append(it)
        m = len(ss)
        st['rel'][r['k']] += 1
        st['dk'][h19.get('k', '')] += 1
        st['pos'][pos] += 1
        st['bi']['f' if bi == 0 else 'l' if bi == m - 1 else 'm'] += 1
        st['ans19'][r['o'][r['a']]] += 1
        for x in r['x']:
            if x:
                st['x19'][x[0]] += 1
        st['t'][r['t']] += 1
        st['ev2_' + r['t']]['o' if ev2 == bi else 'l' if ev2 == m - 1 else 'f' if ev2 == 0 else 'm' if ev2 > 0 else '?'] += 1
        for v in h20.get('x', {}).values():
            st['b2_' + r['t']][v] += 1
            st['b2'][v] += 1
        if it['ok2']:
            st['ok2'][it['ok2']] += 1
        st['ns'][m] += 1
        st['src'][str(r['b'])] += 1
    for x in err:
        print('LỖI', x)
    out = {'it': items, 'st': {k: dict(v) for k, v in st.items()},
           'ADV': old['ADV'], 'REL2': old['REL2'], 'CMP2': old['CMP2'], 'PAIRS': old['PAIRS'], 'REL': old['REL'],
           'MCQ': old['MCQ'], 'MV': old['MV']}
    os.makedirs(os.path.join(ROOT, 'cau-19-20', 'moi'), exist_ok=True)
    with open(os.path.join(ROOT, 'cau-19-20', 'moi', 'data.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(len(items), 'bài')
    for k in sorted(out['st']):
        print(k, out['st'][k])


if __name__ == '__main__':
    main()
