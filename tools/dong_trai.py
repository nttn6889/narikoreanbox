#!/usr/bin/env python3
"""Chuyên đề Đồng nghĩa – trái nghĩa (dong-trai/): ghép + kiểm tra chú giải, ghi dong-trai/data.json.

Nguồn soạn tay tools/dong_trai/*.txt, mỗi dòng một câu "nội dung khớp" (câu 9–12, 20, 22, 24, 32–34, 43, 47, 50):
  <đề> <câu> | <cách đáp án đúng viết lại> | <chữ trong bài>=><chữ trong đáp án> ; … | <i>:<kiểu bẫy> <chữ trong bài>=><chữ trong lựa chọn i> ; …
Cách viết lại (OK): C chép gần nguyên chữ · D đổi từ đồng nghĩa · H từ Hán ↔ cụm thuần Hàn · K gói nhiều chi tiết thành một từ chung ·
  P nói ngược + phủ định (불가 → 할 수 없다) · S tính từ số liệu · U suy ra một bước.
Kiểu bẫy đổi chữ (X): T từ trái nghĩa · F thêm / bỏ phủ định (있다 ↔ 없다, 관계없다) · B đảo chiều so sánh / thứ tự / nguyên nhân – kết quả ·
  L đổi phạm vi (만, 모두, 누구나, 항상) · G đổi thời điểm / con số · S đổi đối tượng · R ý bị bài bác · O khác.
Chữ hai bên "=>" phải có đúng trong đoạn văn (hoặc chữ chép từ ảnh `tx` của tools/dau_hieu) / trong lựa chọn.
"""
import json, os, re, sys, glob, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from dau_hieu import qtext

# chữ tín hiệu trong lựa chọn: [tên, regex] → đếm lựa chọn đúng / sai trong mọi câu "nội dung khớp" (t = n) của tools/dau_hieu
SIG = [
    ['전혀 · 절대(로) · 거의 없다', r'전혀|절대|거의 (없|안)'],
    ['관계없다 · 상관없다 · 관련이 없다 · 필요 없다', r'관계(가)? ?없|상관(이)? ?없|관련이 없|필요 없'],
    ['항상 · 늘 · 매일 · 내내 · 언제나 · 매년', r'항상|늘 |매일|내내|언제나|매년|매달'],
    ['처음(으로) · 최초 · 이미 · 오랜만', r'처음|최초|이미|오랜만'],
    ['-는 편이다', r'편이'],
    ['두 배 · 절반 · 반 이상 · 과반', r'두 배|절반|반 이상|과반'],
    ['반드시 · 꼭 · -아/어야 한다', r'반드시|꼭 |야 한다|야 했|야만'],
    ['… 보다 (so sánh)', r'보다 '],
    ['가장 · 제일', r'가장|제일'],
    ['모두 · 모든 · 누구나', r'모두|모든|누구나|누구든지'],
    ['N만 · 뿐 (chỉ)', r'[가-힣]만 |만이 |만을 |뿐'],
    ['-ㄹ 수 있다', r'수 있'],
    ['-기도 하다 · -ㄹ 수도 있다 · N도 있다 · 경우에 따라', r'기도 (하|한|했)|수도 있|(도|들도) 있다|경우도|경우에 따라'],
]

def signals(dh):
    c = [[k, 0, 0] for k, _ in SIG]
    for it in dh.values():
        if it.get('t') != 'n' or it.get('chk'):
            continue
        _, _, o = qtext(it['e'], it['n'])
        for i, op in enumerate(o):
            for j, (_, r) in enumerate(SIG):
                if re.search(r, op):
                    c[j][1 if i == it['a'] else 2] += 1
    return c

def main():
    dh = {}
    for f in glob.glob(os.path.join(ROOT, 'tools', 'dau_hieu', '*.json')):
        for it in json.load(open(f, encoding='utf-8')):
            dh[(it['e'], it['n'])] = it
    items, errs = [], []
    for f in sorted(glob.glob(os.path.join(ROOT, 'tools', 'dong_trai', '*.txt'))):
        for ln in open(f, encoding='utf-8'):
            ln = ln.strip()
            if not ln or ln[0] == '#':
                continue
            p = [x.strip() for x in ln.split('|')]
            e, n = p[0].split(); n = int(n)
            it = dh[(e, n)]
            psg, stem, o = qtext(e, n)
            allp = psg + '\n' + '\n'.join(it.get('tx') or []) + '\n' + stem
            rec = {'e': e, 'n': n, 'a': it['a'], 'ok': p[1], 'op': [], 'x': {}}
            if it.get('tx'):
                rec['tx'] = it['tx']
            for pr in filter(None, (s.strip() for s in p[2].split(';'))):
                a, b = [s.strip() for s in pr.split('=>')]
                if a not in allp or b not in o[it['a']]:
                    errs.append('%s-%d đáp án: %s => %s' % (e, n, a, b))
                rec['op'].append([a, b])
            for pr in filter(None, (s.strip() for s in p[3].split(';'))):
                m = re.match(r'(\d):(\w) (.*)=>(.*)$', pr)
                i, k, a, b = int(m.group(1)), m.group(2), m.group(3).strip(), m.group(4).strip()
                if i == it['a'] or a not in allp or b not in o[i]:
                    errs.append('%s-%d lựa chọn %d: %s => %s' % (e, n, i + 1, a, b))
                rec['x'].setdefault(str(i), []).append([k, a, b])
            items.append(rec)
    if errs:
        print('\n'.join(errs)); sys.exit(1)
    # thống kê
    ok = collections.Counter(r['ok'] for r in items)
    xk = collections.Counter(); nx = collections.Counter(); per = collections.Counter()
    for r in items:
        ks = set()
        for i, lst in r['x'].items():
            nx[r['n']] += 1
            first = lst[0][0]
            xk[first] += 1
            ks.add(i)
        per[len(ks)] += 1
    byn = collections.defaultdict(collections.Counter)
    for r in items:
        byn[r['n']][r['ok']] += 1
    st = {'n': len(items), 'ok': dict(ok), 'x': dict(xk), 'per': {str(k): v for k, v in per.items()},
          'byn': {str(k): dict(v) for k, v in sorted(byn.items())}, 'nx': {str(k): v for k, v in sorted(nx.items())},
          'q': {str(k): sum(1 for r in items if r['n'] == k) for k in sorted({r['n'] for r in items})}}
    st['sig'] = signals(dh)
    out = os.path.join(ROOT, 'dong-trai', 'data.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump({'st': st, 'it': items}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(json.dumps(st, ensure_ascii=False))

if __name__ == '__main__':
    main()
