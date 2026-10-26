#!/usr/bin/env python3
"""Học câu 11–12 (cau-11-12/): gom phần câu 11–12 của 5 chuyên đề + số liệu 44 câu, ghi cau-11-12/data.json.

Nguồn (không soạn lại, sửa nguồn thì chạy lại script này):
  doc-dap-an/data.json     câu đã tách, lựa chọn, nghĩa Việt lựa chọn, cặp chữ bài ⇒ lựa chọn, khuôn câu
                           (chạy `python3 tools/dong_trai.py` rồi `python3 tools/doc_dap_an.py` trước nếu sửa tools/dong_trai/)
  dong-trai/data.json      cách đáp án nói lại (ok)
  tools/dau_hieu/11-12.json  đáp án, chữ manh mối (c), giải thích (w), mã bẫy từng lựa chọn sai (x)
  thi-thu/de/tu/<đề>.json  từ của câu (vốn từ tin tức)
  tools/cau_11_12/bai.txt  dịch từng câu của tin + vai trò câu + kiểu tin (Claude soạn)
"""
import json, os, re, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REAL = {'Etk091': 'Kỳ 91', 'Etk083': 'Kỳ 83'}
# chữ tín hiệu trong lựa chọn (giống SIG của tools/dong_trai.py, thêm nhóm hay gặp ở tin)
SIG = [
    ['처음 · 최초 · 새로 · 이미', r'처음|최초|새로|이미'],
    ['매년 · 매일 · 항상 · 내내 · 계속', r'매년|매일|매달|매주|항상|내내|언제나|계속'],
    ['모든 · 모두 · 누구나 · 상관없이', r'모든|모두|누구나|누구든지|상관없|관계없|구분 없'],
    ['N만 · 뿐 (chỉ)', r'[가-힣]만 |[가-힣]만이 |[가-힣]만을 |뿐'],
    ['무료 · 할인 · 싸다 · 비싸다', r'무료|할인|싸게|싼 |싸다|저렴|비싸'],
    ['phủ định (안 · 못 · 않 · 없)', r'지 않|지 못|않는|않았|않다|없다|없었|없는|없이|없게|[^가-힣]안 [가-힣]|[^가-힣]못 [가-힣]'],
    ['-아야 한다 · 반드시', r'야 한|야 하|반드시|꼭 '],
    ['-ㄹ 수 있다', r'수 있'],
    ['-ㄹ 것이다 · 예정 · 계획', r'ㄹ 것이다|을 것이다|예정|계획'],
    ['가장 · 제일 · 더 · 보다', r'가장|제일|더 |보다 '],
    ['늘다 · 줄다 · 증가 · 감소', r'늘|줄어|줄었|증가|감소|높아|낮아|올라'],
]
# câu đầu → kiểu tin (đuôi / chữ hay gặp)
LEAD = [
    ['A', 'Sự kiện · chương trình · chính sách', r'운영한다|개최한다|열린다|연다|실시한다|제공한다|생긴다|펼쳐진다|발표했다|예정이다|확대할 것|강화할'],
    ['B', 'Câu chuyện người thật', r'사연|화제|감동'],
    ['C', 'Xu hướng mới', r'인기|증가하고 있|늘고 있|등장했|변하고 있|늦어지고 있|있다\.$'],
    ['D', 'Kiến thức · ý kiến', r''],
]
KIEU = {'A': 'Sự kiện · chương trình · chính sách', 'B': 'Câu chuyện người thật', 'C': 'Xu hướng mới', 'D': 'Kiến thức · ý kiến'}


def load_bai():
    out, cur = {}, None
    for ln in open(os.path.join(ROOT, 'tools', 'cau_11_12', 'bai.txt'), encoding='utf-8'):
        ln = ln.rstrip('\n')
        if not ln.strip() or ln.startswith('# '):
            continue
        if ln.startswith('## '):
            e, n, k = ln[3:].split()
            cur = out[(e, int(n))] = {'k': k, 's': []}
            continue
        r, v = [x.strip() for x in ln.split('|', 1)]
        cur['s'].append([v, r])
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
    dd = {(x['e'], x['n']): x for x in json.load(open(os.path.join(ROOT, 'doc-dap-an', 'data.json'), encoding='utf-8'))['it']}
    dt = {(x['e'], x['n']): x for x in json.load(open(os.path.join(ROOT, 'dong-trai', 'data.json'), encoding='utf-8'))['it']}
    dh = json.load(open(os.path.join(ROOT, 'tools', 'dau_hieu', '11-12.json'), encoding='utf-8'))
    bai = load_bai()
    tu_cache = {}
    items, err = [], []
    st = collections.defaultdict(collections.Counter)
    words = {}
    for h in dh:
        key = (h['e'], h['n'])
        d, t, b = dd[key], dt.get(key, {}), bai.get(key)
        if not b:
            err.append('thiếu dịch %s %s' % key); continue
        if len(b['s']) != len(d['s']):
            err.append('%s %s: %d câu, dịch %d' % (key[0], key[1], len(d['s']), len(b['s'])))
            continue
        a = h['a']
        # câu chứa căn cứ của đáp án: theo chữ manh mối của dau-hieu, không có thì theo doc-dap-an
        ev = -1
        for c in h.get('c', []):
            ev = find_sent(d['s'], c[0])
            if ev >= 0:
                break
        if ev < 0:
            ev = d['at'][a]
        at = list(d['at']); at[a] = ev
        if key[0] not in tu_cache:
            p = os.path.join(ROOT, 'thi-thu', 'de', 'tu', key[0] + '.json')
            tu_cache[key[0]] = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else None
        tu = tu_cache[key[0]]
        wl = []
        if tu and str(key[1]) in tu['q']:
            for i in tu['q'][str(key[1])]:
                w = tu['w'][i]
                wl.append([w[0], w[1], w[2], w[3]])
                if ' ' not in w[0]:
                    words.setdefault(w[0], [w[0], w[1], w[2], set()])[3].add('%s-%d' % key)
        lead = next(k for k, _, r in LEAD if not r or re.search(r, d['s'][0]))
        it = {
            'id': '%s-%d' % key, 'e': key[0], 'n': key[1], 'src': REAL.get(key[0], ''),
            'kt': b['k'], 'kl': lead,
            's': [[ko, vi, r] for ko, (vi, r) in zip(d['s'], b['s'])],
            'o': d['o'], 'v': d['v'], 'a': a, 'ok': t.get('ok', d.get('ok', '')),
            'p': d['p'], 'at': at, 'b': h.get('x', {}), 'kh': d['k'],
            'c': [c[0] for c in h.get('c', [])], 'w': h['w'], 'tu': wl,
        }
        items.append(it)
        n = key[1]
        for tag in ('all', str(n)):
            st['kt_' + tag][b['k']] += 1
            st['ok_' + tag][it['ok']] += 1
            st['ans_' + tag][a] += 1
            st['ns_' + tag][len(d['s'])] += 1
            m = len(d['s'])
            st['ev_' + tag]['f' if ev == 0 else 'l' if ev == m - 1 else 'm' if ev > 0 else '?'] += 1
            for i, x in h.get('x', {}).items():
                st['bay_' + tag][x] += 1
            for i, pp in enumerate(d['p']):
                if i != a:
                    for q in pp:
                        if q[0]:
                            st['doi_' + tag][q[0]] += 1
            for r in b['s']:
                for ch in r[1]:
                    st['vai_' + tag][ch] += 1
        st['kl'][lead + ('=' if lead == b['k'] else '≠') + b['k']] += 1
        # khuôn câu: đáp án / lựa chọn sai
        for i, k in enumerate(d['k']):
            for kk in k:
                st['kh_ok' if i == a else 'kh_no'][kk] += 1
        # chữ tín hiệu trong lựa chọn: [số lần là đáp án, số lựa chọn có chữ]
        for i, o in enumerate(d['o']):
            for name, rg in SIG:
                if re.search(rg, ' ' + o):
                    st['sig_' + name]['n'] += 1
                    st['sig_' + name]['a'] += (i == a)
        # thứ tự lựa chọn theo bài
        ix = [x for x in at if x >= 0]
        st['ord']['y' if ix == sorted(ix) else 'n'] += 1
        st['len']['c'] += len(''.join(d['s']))
        st['len']['n'] += 1
    for e in err:
        print('LỖI', e)
    sig = [[name, st['sig_' + name]['a'], st['sig_' + name]['n']] for name, _ in SIG]
    wtop = sorted(words.values(), key=lambda w: (-len(w[3]), -w[2]))
    wtop = [[w[0], w[1], w[2], len(w[3])] for w in wtop if len(w[3]) >= 2]
    out = {
        'it': items,
        'st': {k: dict(v) for k, v in st.items() if not k.startswith('sig_')},
        'sig': sig, 'kieu': KIEU, 'w': wtop,
    }
    with open(os.path.join(ROOT, 'cau-11-12', 'data.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(len(items), 'câu')
    for k in sorted(out['st']):
        print(k, out['st'][k])
    for s in sig:
        print('sig', s)
    print('từ gặp ≥2 bài:', len(wtop), wtop[:40])


if __name__ == '__main__':
    main()
