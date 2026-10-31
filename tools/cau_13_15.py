#!/usr/bin/env python3
"""Học câu 13–15 theo khuôn bài dạng câu (cau-13-15/moi/): gom phần câu 13–15 của trang cũ + 5 chuyên đề, ghi cau-13-15/moi/data.json.

Nguồn (không soạn lại, sửa nguồn thì chạy lại script này):
  cau-13-15/index.html        biến R (66 câu: đáp án, kiểu câu đầu f, vì sao câu kia không đứng đầu m, tín hiệu bước 3 k, chữ tô h,
                              dịch v, giải thích r / w), MCQ (câu tự soạn), F, K2 — đọc bằng node
  cau-13-15/luyen/index.html  gợi ý + “vì sao chọn / vì sao loại” từng bước (g1 c1 x1 g3 c3 x3)
  tools/dau_hieu/13-15.json   mã dấu hiệu chung (B dấu bám, T thêm, D đảo chiều, N nhân quả, K kết luận, L nói lại, W chuỗi từ khóa)
  thi-thu/de/tu/<đề>.json     từ của câu 13–15
  tools/cau_13_15/bai.txt     khuôn đoạn, vai trò từng câu, cặp chữ bám → chữ được bám (Claude soạn)
"""
import json, os, re, subprocess, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LET = '가나다라'

JS = r"""
const fs=require('fs');
function grab(f,a,b){const h=fs.readFileSync(f,'utf8');const i=h.indexOf(a);return h.slice(i,h.indexOf(b,i));}
const o=new Function(grab(process.argv[1],'var R = [','var KEY=')+';return {R,MCQ,F,M,K2};')();
const l=new Function(grab(process.argv[2],'var R = [','}];')+'}];return R;')();
o.L=l;process.stdout.write(JSON.stringify(o));
"""


def load_old():
    out = subprocess.run(['node', '-e', JS, os.path.join(ROOT, 'cau-13-15', 'index.html'), os.path.join(ROOT, 'cau-13-15', 'luyen', 'index.html')],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def nos(s):
    return re.sub(r'[\s.,!?“”"\'‘’·]', '', s)


def load_bai():
    out = {}
    for ln in open(os.path.join(ROOT, 'tools', 'cau_13_15', 'bai.txt'), encoding='utf-8'):
        ln = ln.rstrip('\n')
        if not ln.strip() or ln.startswith('#'):
            continue
        p = [x.strip() for x in ln.split('|')]
        links = [tuple(x.strip().split('>', 1)) for x in p[3].split(';') if x.strip()] if len(p) > 3 else []
        out[p[0]] = {'mk': p[1], 'ro': p[2].split(), 'ln': links}
    return out


def main():
    old = load_old()
    bai = load_bai()
    lu = {x['id']: x for x in old['L']}
    dh = {'%s-%d' % (x['e'], x['n']): x for x in json.load(open(os.path.join(ROOT, 'tools', 'dau_hieu', '13-15.json'), encoding='utf-8'))}
    items, err = [], []
    st = collections.defaultdict(collections.Counter)
    wc = collections.Counter()
    wm = {}
    rd, rd1 = [], []
    for r in old['R']:
        i = r['id']
        b = bai.get(i)
        if not b:
            err.append(i + ': chưa có trong bai.txt'); continue
        ordr = r['o'][r['a']]
        ix = [LET.index(c) for c in ordr]
        if len(b['ro']) != 4:
            err.append(i + ': cần 4 vai trò')
        # cặp chữ bám: chữ bám ở câu thứ j (theo thứ tự đúng), chữ được bám ở câu trước j
        lk = []
        for a, ref in b['ln']:
            j = next((p for p in range(1, 4) if nos(a) in nos(r['s'][ix[p]])), -1)
            k = next((p for p in range(j - 1, -1, -1) if nos(ref) in nos(r['s'][ix[p]])), -1) if j > 0 else -1
            if j < 0 or k < 0:
                err.append('%s: không thấy cặp %s > %s' % (i, a, ref)); continue
            lk.append([ordr[j], a, ordr[k], ref])
        # bước 1: hai câu có thể đứng đầu; bước 3: vị trí đầu tiên hai đáp án còn lại khác nhau
        heads = sorted(set(o[0] for o in r['o']), key=lambda c: [o[0] for o in r['o']].index(c))
        rest = [o for o in r['o'] if o[0] == ordr[0]]
        pos, pair = -1, []
        if len(rest) == 2:
            pos = next(p for p in range(4) if rest[0][p] != rest[1][p])
            pair = [rest[0][pos], rest[1][pos]]
        rej = [c for c in heads if c != ordr[0]]
        hm = r.get('h', {})
        # câu bị loại có dấu bám ngay đầu câu (3 âm tiết đầu)?
        rjh = ''
        if rej:
            s0 = r['s'][LET.index(rej[0])]
            for f in (hm.get(rej[0]) or '').split('|'):
                if f and s0.find(f) >= 0 and s0.find(f) <= 4:
                    rjh = f; break
        need = set(heads) | set(pair)
        tot = sum(len(nos(s)) for s in r['s'])
        rd.append(100.0 * sum(len(nos(r['s'][LET.index(c)])) for c in need) / tot)
        rd1.append(100.0 * sum(len(nos(r['s'][LET.index(c)])) for c in heads) / tot)
        e = i.rsplit('-', 1)[0]
        wl = []
        tp = os.path.join(ROOT, 'thi-thu', 'de', 'tu', e + '.json')
        if os.path.exists(tp):
            tu = json.load(open(tp, encoding='utf-8'))
            for q in tu['q'].get(str(r['n']), []):
                w = tu['w'][q]
                wl.append([w[0], w[1], w[2]])
                if w[0] not in wm:
                    wm[w[0]] = [w[0], w[1], w[2]]
                wc[w[0]] += 1
        L = lu.get(i, {})
        d = dh.get(i, {})
        it = {
            'id': i, 'src': r['src'], 'n': r['n'], 'real': r['real'], 'b': r['b'],
            's': r['s'], 'v': r['v'], 'o': r['o'], 'a': r['a'], 'h': hm,
            'f': r['f'], 'm': r['m'], 'k': r['k'], 'r': r['r'], 'w': r['w'],
            'mk': b['mk'], 'ro': b['ro'], 'lk': lk,
            'hd': heads, 'rj': rej[0] if rej else '', 'rjh': rjh, 'pos': pos, 'pr': pair,
            'g1': L.get('g1', ''), 'c1': L.get('c1', ''), 'x1': L.get('x1', ''), 'g3': L.get('g3', ''), 'c3': L.get('c3', ''), 'x3': L.get('x3', ''),
            'dk': d.get('k', ''), 'tu': wl,
        }
        items.append(it)
        st['f'][r['f']] += 1
        st['m'][r['m']] += 1
        st['k'][r['k']] += 1
        st['mk'][b['mk']] += 1
        st['nh'][len(heads)] += 1
        st['pos'][pos + 1] += 1
        st['rjh']['y' if rjh else 'n'] += 1
        st['src']['real' if r['real'] else 'luyen'] += 1
        for k_, ro in enumerate(b['ro']):
            for c in ro:
                st['ro'][c] += 1
                st['ro%d' % k_][c] += 1
        # câu đầu đúng có dấu bám không (phải là 0)
        if hm.get(ordr[0]):
            s0 = r['s'][LET.index(ordr[0])]
            if any(f and 0 <= s0.find(f) <= 4 for f in hm[ordr[0]].split('|')):
                st['firstbam']['y'] += 1
        st['ans'][r['a']] += 1
        st['lk'][len(lk)] += 1
    for x in err:
        print('LỖI', x)
    top = [wm[w] + [c] for w, c in wc.most_common() if c >= 2][:60]
    out = {'it': items, 'st': {k: dict(v) for k, v in st.items()}, 'rd': round(sum(rd) / len(rd)), 'rd1': round(sum(rd1) / len(rd1)),
           'w': top, 'MCQ': old['MCQ'], 'F': old['F'], 'K2': old['K2']}
    os.makedirs(os.path.join(ROOT, 'cau-13-15', 'moi'), exist_ok=True)
    with open(os.path.join(ROOT, 'cau-13-15', 'moi', 'data.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(len(items), 'câu · đọc', out['rd'], '% (bước 1:', out['rd1'], ')', '% chữ · từ hay gặp', len(top))
    for k in sorted(out['st']):
        print(k, out['st'][k])


if __name__ == '__main__':
    main()
