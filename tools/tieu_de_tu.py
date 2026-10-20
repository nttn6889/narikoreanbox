#!/usr/bin/env python3
"""Câu tiêu đề báo (cau-25-27/, biến R) theo nhóm từ câu 25–27 → tu-vung/tieu-de.json.

Đọc bảng ghép tay tools/tieu_de_tu.tsv. Chạy lại khi thêm câu vào R hoặc sửa nhóm V25_* trong kho từ.
  python3 tools/tieu_de_tu.py
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'cau-25-27/index.html'), encoding='utf-8').read()
i = html.index('var R = ') + 8
R, _ = json.JSONDecoder().raw_decode(html[i:])
BY = {r['id']: r for r in R}
G = {g['id']: g for g in json.load(open(os.path.join(ROOT, 'thi-thu/vocab.json'), encoding='utf-8'))['g']
     if g['id'].startswith('V25_')}

out, bad = {}, 0
for ln in open(os.path.join(ROOT, 'tools/tieu_de_tu.tsv'), encoding='utf-8'):
    if not ln.strip() or ln.startswith('#'):
        continue
    f = (ln.rstrip('\n').split('\t') + ['', '', '', '', ''])[:5]
    qid, gid, chu, tu, note = f
    r, g = BY.get(qid), G.get(gid)
    if not r or not g or chu not in r['h']:
        print('Lỗi:', ln.strip()); bad += 1; continue
    wid = ''
    if tu:
        m = [w[0] for w in g['w'] if w[1] == tu]
        if not m:
            print('Không có từ trong nhóm:', ln.strip()); bad += 1; continue
        wid = m[0]
    q = out.setdefault(gid, {})
    q.setdefault(qid, []).append([chu, wid, note])

res = {'g': {}, 'q': {}}
order = {r['id']: k for k, r in enumerate(R)}
for gid, qs in out.items():
    res['g'][gid] = [[qid, v] for qid, v in sorted(qs.items(), key=lambda x: order[x[0]])]
    for qid in qs:
        r = BY[qid]
        res['q'][qid] = [r['h'], r['v'], r['src'], r['n']]
json.dump(res, open(os.path.join(ROOT, 'tu-vung/tieu-de.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))
n = len(res['q'])
print('tu-vung/tieu-de.json:', n, '/', len(R), 'câu,', len(res['g']), 'nhóm')
sys.exit(1 if bad else 0)
