#!/usr/bin/env python3
"""Sinh doc-hieu/index.json cho trang Đọc hiểu đoạn văn (doc-hieu/).

  python3 tools/doc_hieu.py

- `de`: danh sách đề có chữ để đọc trong thi-thu/de/ ([id, tên]); bỏ đề nghe (…n, chỉ có file nghe) và Ehot1old.
- `a`: các đoạn đã có phân tích chi tiết = tên tệp doc-hieu/data/<đề>-<câu đầu>.json.
Chạy lại sau mỗi lần đồng bộ đề hoặc khi thêm tệp phân tích.
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DE = os.path.join(ROOT, 'thi-thu', 'de')
OUT = os.path.join(ROOT, 'doc-hieu')


def order(id_):
    # Đề thật trước (mới → cũ), rồi đề luyện theo tên
    m = re.match(r'Etk(\d+)', id_)
    return (0, -int(m.group(1)), id_) if m else (1, 0, id_)


def plain(t):
    return re.sub(r'\s+', ' ', t.replace('**', '').replace('__', '')).strip()


def check(k, d):
    """Cụm ghép lại phải đúng từng câu, câu ghép lại đúng đoạn văn; chữ cần tô phải có trong đoạn văn."""
    de = json.load(open(os.path.join(DE, d['e'] + '.json'), encoding='utf-8'))
    q = next(x for x in de['q'] if x['n'] == d['n'][0])
    p = plain(q['passage'] or q['stem'])
    bad = []
    if d.get('s'):
        ss = [' '.join(c[0] for c in s['c']) for s in d['s']]
        if plain(' '.join(ss)) != p:
            bad.append('các câu ghép lại khác đoạn văn:\n  ' + plain(' '.join(ss)) + '\n  ' + p)
        for i, s in enumerate(d['s']):
            if any(not c[0].strip() for c in s['c']):
                bad.append('câu %d: có cụm rỗng' % (i + 1))
            if any(c[1] not in ROLES for c in s['c']):
                bad.append('câu %d: vai trò lạ %s' % (i + 1, [c[1] for c in s['c'] if c[1] not in ROLES]))
            od = sorted(c[3] for c in s['c'])
            if od != list(range(1, len(od) + 1)):
                bad.append('câu %d: thứ tự dịch phải là 1…%d: %s' % (i + 1, len(od), od))
    for x in d.get('w', []):
        for f in (x[3] if len(x) > 3 else '').split('|'):
            if f and f not in p:
                bad.append('từ “%s”: không có “%s” trong đoạn' % (x[0], f))
    for x in d.get('g', []):
        for f in x.get('f', '').split('|'):
            if f and f not in p:
                bad.append('ngữ pháp “%s”: không có “%s” trong đoạn' % (x['p'], f))
    for x in d.get('l', []):
        if x[0] not in p:
            bad.append('tín hiệu “%s” không có trong đoạn' % x[0])
        if x[1] not in SIGS:
            bad.append('tín hiệu “%s”: loại lạ %s' % (x[0], x[1]))
    if bad:
        raise SystemExit(k + ':\n- ' + '\n- '.join(bad))


ROLES = {'CN', 'TN', 'VN', 'VP', 'DN', 'TR', 'NOI'}
SIGS = {'TG', 'GT', 'CH', 'TD', 'NN', 'DL', 'KL', 'VD', 'TH'}


def main():
    de = []
    for f in glob.glob(os.path.join(DE, '*.json')):
        id_ = os.path.basename(f)[:-5]
        if id_ == 'Ehot1old' or re.search(r'\dn$', id_):
            continue
        d = json.load(open(f, encoding='utf-8'))
        de.append([id_, d.get('t') or id_])
    de.sort(key=lambda x: order(x[0]))
    a = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(OUT, 'data', '*.json')))
    for k in a:
        d = json.load(open(os.path.join(OUT, 'data', k + '.json'), encoding='utf-8'))
        assert d.get('e') and d.get('n'), k
        assert k == '%s-%d' % (d['e'], d['n'][0]), 'tên tệp phải là <đề>-<câu đầu>: ' + k
        check(k, d)
    json.dump({'de': de, 'a': a}, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, separators=(',', ':'))
    print('doc-hieu/index.json:', len(de), 'đề,', len(a), 'đoạn đã phân tích')


if __name__ == '__main__':
    main()
