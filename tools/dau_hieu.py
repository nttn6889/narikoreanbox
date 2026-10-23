#!/usr/bin/env python3
"""Kiểm tra + ghép dữ liệu trang dau-hieu/ (Chuyên đề dấu hiệu nhận biết).

Nguồn soạn tay: tools/dau_hieu/<dạng>.json = [{e, n, a (0-based), k, p, c:[[chữ, mã]], w, x?, chk?}]
- chữ trong c phải có đúng trong đoạn văn / câu hỏi / lựa chọn của câu đó (thi-thu/de/<e>.json);
- `python3 tools/dau_hieu.py [<dump>]` : <dump> = ArtifactData `list` bank/<id>/q (tùy chọn) → so đáp án a với bank.
Ghi dau-hieu/data/<dạng>.json (giữ nguyên nội dung, thêm số thứ tự) và dau-hieu/data/index.json (thống kê).
"""
import json, os, sys, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'dau_hieu')
OUT = os.path.join(ROOT, 'dau-hieu', 'data')
# Đáp án bank sai đã biết (đề thật kỳ 91) — không báo lại
BANK_WRONG = {('Etk091', n) for n in range(19, 35) if n != 33}

_cache = {}
def exam(e):
    if e not in _cache:
        _cache[e] = json.load(open(os.path.join(ROOT, 'thi-thu', 'de', e + '.json'), encoding='utf-8'))
    return _cache[e]

def qtext(e, n):
    """đoạn văn (kể cả đoạn dùng chung), câu hỏi, lựa chọn"""
    prev = ''
    for q in exam(e)['q']:
        if not q.get('share'):
            prev = q.get('passage') or ''
        if q['n'] == n:
            return prev, q.get('stem') or '', q.get('opts') or []
    raise KeyError((e, n))

def main():
    dump = sys.argv[1] if len(sys.argv) > 1 else None
    os.makedirs(OUT, exist_ok=True)
    errs, warn = [], []
    index = {}
    for f in sorted(glob.glob(os.path.join(SRC, '*.json'))):
        name = os.path.basename(f)[:-5]
        items = json.load(open(f, encoding='utf-8'))
        seen = set()
        kc, pc, yc, xc, tc = (collections.Counter() for _ in range(5))
        for it in items:
            key = (it['e'], it['n'])
            if key in seen:
                errs.append('%s: trùng %s-%d' % (name, *key))
            seen.add(key)
            try:
                p, s, o = qtext(*key)
            except KeyError:
                errs.append('%s: không có câu %s-%d' % (name, *key)); continue
            allt = p + '\n' + s + '\n' + '\n'.join(o)
            for c in it.get('c', []):
                if c[0] not in allt:
                    errs.append('%s %s-%d: không thấy «%s»' % (name, it['e'], it['n'], c[0]))
            if not (0 <= it['a'] < len(o)):
                errs.append('%s %s-%d: a ngoài phạm vi' % (name, *key))
            if dump:
                bf = os.path.join(dump, 'bank', it['e'], 'q', 'q%02d.json' % it['n'])
                if os.path.exists(bf):
                    ba = json.load(open(bf, encoding='utf-8')).get('answer')
                    if ba is not None and ba - 1 != it['a'] and key not in BANK_WRONG:
                        warn.append('%s %s-%d: a=%d (%s) nhưng bank ghi %s' % (name, it['e'], it['n'], it['a'] + 1, o[it['a']][:20], ba))
            if it.get('chk'):
                continue  # câu nghi đáp án sách: không tính vào thống kê
            tc[it.get('t', '')] += 1
            for ch in set(it.get('k', '')):
                kc[ch] += 1
            for ch in set(it.get('p', '')):
                pc[ch] += 1
            for ch in set(it.get('y', '')):
                yc[ch] += 1
            for v in it.get('x', {}).values():
                xc[v] += 1
        json.dump(items, open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        index[name] = {'n': sum(tc.values()), 'k': dict(kc), 'p': dict(pc), 'y': dict(yc), 'x': dict(xc), 't': dict(tc)}
    json.dump(index, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for w in warn: print('?', w)
    for e in errs: print('!', e)
    for k, v in index.items(): print(k, v['n'], v['k'])
    if errs: sys.exit(1)

if __name__ == '__main__':
    main()
