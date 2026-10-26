#!/usr/bin/env python3
"""Đọc đáp án (doc-dap-an/): ghép dữ liệu luyện đọc 4 lựa chọn + tìm chỗ trong bài, ghi doc-dap-an/data.json.

Nguồn (không soạn lại):
  dong-trai/data.json      241 câu "nội dung khớp" (câu 9–12, 20, 22, 24, 32–34, 43, 47, 50): cặp chữ bài ⇒ lựa chọn,
                           cách đáp án nói lại (ok), kiểu bẫy đổi chữ (x) — chạy `python3 tools/dong_trai.py` trước nếu sửa tools/dong_trai/
  tools/dau_hieu/*.json    đáp án, mã bẫy của từng lựa chọn sai (x), chữ chép từ ảnh (tx, câu 9–10)
  tools/doc_dap_an/vi-*.txt nghĩa tiếng Việt 4 lựa chọn (Claude soạn): <đề> <câu> | ① | ② | ③ | ④
  thi-thu/de/<đề>.json     đoạn văn, lựa chọn
  thi-thu/de/tu/<đề>.json  từ của câu (chạm từ trong lựa chọn → nghĩa)
Khuôn câu của lựa chọn (KH) tính bằng regex — sửa danh sách KH thì chạy lại.
"""
import json, os, re, sys, glob, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from dau_hieu import qtext

# khuôn câu: [mã, tên, regex] — một lựa chọn có thể có nhiều khuôn; khuôn chính = khuôn đầu tiên khớp theo thứ tự này
KH = [
    ['F', 'Phủ định · không / chưa / không thể', r'지 않|지 못|않는다|않았|않다|없다|없었|없는|없이|없게|아니다|아니었|불가능|[^가-힣]안 [가-힣]|[^가-힣]못 [가-힣]'],
    ['M', 'Bắt buộc · phải / nhất định', r'야 한|야 했|야 하|야만|반드시|꼭 '],
    ['N', 'Khả năng · có thể / được', r'수(도)? 있|수 없'],
    ['B', 'So sánh · tăng giảm · số lượng', r'보다|더 |가장|제일|많아|많다|많은|많이|늘|줄어|줄었|줄고|증가|감소|높아|낮아|높다|낮다|높은|낮은|두 배|절반|반 이상|떨어지|떨어졌|올라갔'],
    ['L', 'Phạm vi · thời điểm (chỉ, mọi, luôn, lần đầu)', r'모두|모든|누구나|누구든지|[가-힣]만 |[가-힣]만이|[가-힣]만을|뿐|항상|늘 |매일|매년|내내|전혀|처음|최초|이미|아무'],
    ['D', 'Đang diễn ra · xu hướng (-고 있다)', r'고 있'],
    ['Q', 'Đã xảy ra (quá khứ)', r'(았|었|였|했)다\.?$'],
    ['K', 'Câu kể · định nghĩa, đặc điểm', r''],
]

def split_sents(p):
    p = (p or '').strip()
    if not p:
        return []
    out = []
    for blk in re.split(r'\n+', p):
        for s in re.split(r'(?<=[.?!])\s+', blk.strip()):
            if s.strip():
                out.append(s.strip())
    return out

def kh_of(o):
    o = ' ' + o.strip()
    tags = [k for k, _, r in KH if r and re.search(r, o)]
    return tags or ['K']

def main():
    dt = json.load(open(os.path.join(ROOT, 'dong-trai', 'data.json'), encoding='utf-8'))['it']
    dh = {}
    for f in glob.glob(os.path.join(ROOT, 'tools', 'dau_hieu', '*.json')):
        for it in json.load(open(f, encoding='utf-8')):
            dh[(it['e'], it['n'])] = it
    vi = {}
    for f in sorted(glob.glob(os.path.join(ROOT, 'tools', 'doc_dap_an', 'vi-*.txt'))):
        for ln in open(f, encoding='utf-8'):
            ln = ln.strip()
            if not ln or ln[0] == '#':
                continue
            p = [x.strip() for x in ln.split('|')]
            e, n = p[0].split()
            vi[(e, int(n))] = p[1:]
    tu = {}
    errs = []
    items = []
    for r in dt:
        e, n = r['e'], r['n']
        psg, stem, o = qtext(e, n)
        d = dh[(e, n)]
        ss = split_sents(psg) or [s for s in (d.get('tx') or []) if s.strip()]
        if not ss:
            errs.append('%s-%d: không có đoạn văn' % (e, n)); continue
        joined, offs = '', []
        for s in ss:
            offs.append(len(joined)); joined += s + ' '

        def where(frag):
            for i, s in enumerate(ss):
                if frag in s:
                    return i
            k = joined.find(frag)
            if k < 0:
                return -1
            return max(i for i, a in enumerate(offs) if a <= k)

        v = vi.get((e, n))
        if not v or len(v) != 4:
            errs.append('%s-%d: thiếu nghĩa tiếng Việt' % (e, n)); continue
        at = [-1] * 4
        pairs = [[] for _ in range(4)]
        for a, b in r['op']:
            pairs[r['a']].append(['', a, b])
        for i, lst in r['x'].items():
            for k, a, b in lst:
                pairs[int(i)].append([k, a, b])
        for i in range(4):
            for _, a, _ in pairs[i]:
                w = where(a)
                if w >= 0:
                    at[i] = w; break
            if pairs[i] and at[i] < 0:
                errs.append('%s-%d lựa chọn %d: không tìm thấy câu chứa “%s”' % (e, n, i + 1, pairs[i][0][1]))
        # lựa chọn chưa có cặp chữ: máy dò câu gần nhất (trùng nhiều cặp âm tiết nhất) — chỉ để gợi ý, không chấm
        nb = [-1] * 4
        for i in range(4):
            if at[i] < 0:
                bo = bigr(o[i])
                sc = [len(bo & bigr(x)) for x in ss]
                if sc and max(sc) >= 3 and sc.count(max(sc)) == 1:
                    nb[i] = sc.index(max(sc))
        if e not in tu:
            fp = os.path.join(ROOT, 'thi-thu', 'de', 'tu', e + '.json')
            tu[e] = json.load(open(fp, encoding='utf-8')) if os.path.exists(fp) else None
        gl = [[] for _ in range(4)]
        if tu[e]:
            W = tu[e]['w']
            for idx in tu[e]['q'].get(str(n), []):
                ko, mean, _, forms = W[idx][:4]
                for i, op in enumerate(o):
                    for f in sorted(forms, key=len, reverse=True):
                        if len(f) >= 2 and f in op:
                            gl[i].append([f, ko, mean]); break
        items.append({'e': e, 'n': n, 'a': r['a'], 'ok': r['ok'], 's': ss, 'o': [x.strip() for x in o], 'v': v,
                      'p': pairs, 'at': at, 'nb': nb, 'b': {str(k): c for k, c in (d.get('x') or {}).items()},
                      'k': [kh_of(x) for x in o], 'g': gl})
    if errs:
        print('\n'.join(errs)); sys.exit(1)
    # thống kê
    by = collections.defaultdict(lambda: {'q': 0, 'pos': collections.Counter(), 'ord': collections.Counter(), 'one': 0})
    kh = collections.defaultdict(lambda: [0, 0])
    for it in items:
        b = by[str(it['n'])]; b['q'] += 1
        L, i = len(it['s']), it['at'][it['a']]
        if i >= 0:
            b['pos']['f' if i == 0 else ('l' if i == L - 1 else 'm')] += 1
            if len({p[1] and where_s(it['s'], p[1]) for p in it['p'][it['a']]}) == 1:
                b['one'] += 1
        w = [x for j, x in enumerate(it['at']) if x >= 0 and j != it['a']]
        if len(w) >= 2:
            b['ord']['y' if w == sorted(w) else 'n'] += 1
        for j, ks in enumerate(it['k']):
            kh[ks[0]][0] += 1
            if j == it['a']:
                kh[ks[0]][1] += 1
    st = {'n': len(items), 'by': {k: {'q': v['q'], 'pos': dict(v['pos']), 'ord': dict(v['ord']), 'one': v['one']} for k, v in by.items()},
          'kh': {k: v for k, v in kh.items()}}
    out = os.path.join(ROOT, 'doc-dap-an', 'data.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump({'kh': [[k, t, r] for k, t, r in KH], 'st': st, 'it': items}, open(out, 'w', encoding='utf-8'),
              ensure_ascii=False, separators=(',', ':'))
    print(json.dumps(st, ensure_ascii=False))

STOPB = {'있다', '한다', '하는', '하고', '되었', '이다', '에서', '으로', '하였', '했다', '었다', '는다', '않는', '않다', '없다', '하기'}
def bigr(t):
    t = re.sub(r'[^가-힣0-9 ]', ' ', t)
    return {w[i:i + 2] for w in t.split() for i in range(len(w) - 1)} - STOPB

def where_s(ss, frag):
    for i, s in enumerate(ss):
        if frag in s:
            return i
    return -1

if __name__ == '__main__':
    main()
