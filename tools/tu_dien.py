"""Từ điển nhỏ cho nút “📖 Tra từ” (tra-tu.js) trên trang giáo án.
Gom nghĩa từ kho từ (thi-thu/vocab.json), tools/cot_loi.tsv, tools/nghia_de.tsv, tools/cum_de.tsv và bảng từ theo câu (thi-thu/de/tu/*.json)
→ tra-tu/tu.json = {d: {từ gốc: nghĩa}, f: {chữ trong đề: từ gốc}}. Chạy lại sau khi đồng bộ đề / kho từ: python3 tools/tu_dien.py"""
import glob, json, os, re
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
d, f = {}, {}

def add(ko, vi):
    ko, vi = (ko or '').strip(), (vi or '').strip()
    if not ko or not vi or vi == 'x' or not re.search('[가-힣]', ko):
        return
    old = d.get(ko)
    if not old:
        d[ko] = vi
    elif vi not in old and len(old) < 60:
        d[ko] = old + '; ' + vi

v = json.load(open(os.path.join(R, 'thi-thu/vocab.json'), encoding='utf-8'))
for g in v['g']:
    if g['sec'].startswith('Chủ đề'):
        continue
    for w in g['w']:
        for k in re.split(r'\s*/\s*', w[1]):
            add(re.sub(r'\(([을를])\)\s*', r'\1 ', k), w[2])
for fn in ('cot_loi.tsv', 'nghia_de.tsv', 'cum_de.tsv'):
    for ln in open(os.path.join(R, 'tools', fn), encoding='utf-8'):
        if ln.startswith('#') or '\t' not in ln:
            continue
        p = ln.rstrip('\n').split('\t')
        if fn == 'cot_loi.tsv' and len(p) > 2 and p[2].strip() == 'x':
            continue
        add(p[0], p[1])
for fp in sorted(glob.glob(os.path.join(R, 'thi-thu/de/tu/*.json'))):
    for w in json.load(open(fp, encoding='utf-8'))['w']:
        add(w[0], w[1])
        if w[0] in d:
            for s in w[3]:
                if s != w[0]:
                    f.setdefault(s, w[0])
out = os.path.join(R, 'tra-tu/tu.json')
json.dump({'d': d, 'f': f}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(d), 'từ,', len(f), 'dạng chia →', os.path.relpath(out, R), os.path.getsize(out) // 1024, 'KB')
