#!/usr/bin/env python3
"""63 câu tiêu đề báo (cau-25-27/, biến R) xếp theo nhóm từ câu 25–27 của kho từ → tu-vung/tieu-de/de.json.

Đọc bảng ghép tay tools/tieu_de_tu.tsv. Mỗi câu nằm ở nhóm có số nhỏ nhất trong các nhóm đã ghép (nhóm chủ đề 인기, 사람,
변화, 경제 đứng trước), câu không ghép được nhóm nào vào “Chủ đề khác”. Chạy lại khi thêm câu vào R hoặc sửa nhóm V25_*.
  python3 tools/tieu_de_tu.py
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'cau-25-27/index.html'), encoding='utf-8').read()
i = html.index('var R = ') + 8
R, _ = json.JSONDecoder().raw_decode(html[i:])
BY = {r['id']: r for r in R}
G = sorted((g for g in json.load(open(os.path.join(ROOT, 'thi-thu/vocab.json'), encoding='utf-8'))['g']
            if g['id'].startswith('V25_')), key=lambda g: (g['so'], g['o']))
GI = {g['id']: g for g in G}

tags, bad = {}, 0
for ln in open(os.path.join(ROOT, 'tools/tieu_de_tu.tsv'), encoding='utf-8'):
    if not ln.strip() or ln.startswith('#'):
        continue
    qid, gid, chu, tu, note = (ln.rstrip('\n').split('\t') + [''] * 5)[:5]
    r, g = BY.get(qid), GI.get(gid)
    if not r or not g or chu not in r['h']:
        print('Lỗi:', ln.strip()); bad += 1; continue
    w = None
    if tu:
        w = next((w for w in g['w'] if w[1] == tu), None)
        if not w:
            print('Không có từ trong nhóm:', ln.strip()); bad += 1; continue
    tags.setdefault(qid, []).append([chu, gid, w[1] if w else '', w[2] if w else '', note])

rank = {g['id']: k for k, g in enumerate(G)}
groups = [{'id': g['id'], 'ko': g['ko'], 'vi': g['vi'], 'q': []} for g in G]
groups.append({'id': 'KHAC', 'ko': 'Chủ đề khác', 'vi': 'xã hội, an toàn, môi trường…', 'q': []})
gpos = {g['id']: g for g in groups}
for r in R:
    m = tags.get(r['id'], [])
    gid = min((x[1] for x in m), key=lambda x: rank[x]) if m else 'KHAC'
    q = {k: r[k] for k in ('id', 'src', 'n', 'h', 'o', 'a', 't', 'v', 'w', 'x')}
    q['m'] = m
    gpos[gid]['q'].append(q)
groups = [g for g in groups if g['q']]
os.makedirs(os.path.join(ROOT, 'tu-vung/tieu-de'), exist_ok=True)
json.dump({'g': groups}, open(os.path.join(ROOT, 'tu-vung/tieu-de/de.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))
print('tu-vung/tieu-de/de.json:', sum(len(g['q']) for g in groups), 'câu,', len(groups), 'nhóm:',
      ', '.join('%s %d' % (g['ko'], len(g['q'])) for g in groups))
sys.exit(1 if bad else 0)
