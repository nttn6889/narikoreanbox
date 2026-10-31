#!/usr/bin/env python3
"""Sinh fb/index.html: trang gom ảnh + lời đăng Facebook theo từng bài (đọc fb/*/caption.md).

Mỗi mục `## ` của caption.md là một bài. Ảnh = tên file .png (không đuôi) nhắc trong tiêu đề / thân bài,
tìm trong cùng thư mục rồi tới quang-cao/*/; `a → b` cùng tiền tố (qn-01-bia → qn-14-on-tap) lấy cả dãy.
Lời đăng = thân bài tới dòng "**Comment đáp án**", bỏ dòng ghi chú kỹ thuật; phần sau = bình luận đáp án.
Chạy lại sau mỗi lần sửa caption.md hoặc thêm ảnh.
"""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FB = os.path.join(ROOT, 'fb')
NOTE = re.compile(r'node tools|python3 tools|Sinh bằng|Facebook cho đăng|^Chụp|Sửa chữ trong')
TOK = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')

def stems(d):
    return sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(d, '*.png')))

QC = {}
for d in sorted(glob.glob(os.path.join(ROOT, 'quang-cao', '*'))):
    for s in stems(d):
        QC.setdefault(s, os.path.relpath(os.path.join(d, s + '.png'), FB))

def plain(t):
    t = re.sub(r'\*\*(.+?)\*\*', r'\1', t)
    t = re.sub(r'`([^`]*)`', r'\1', t)
    return t.strip()

def images(text, folder, own):
    out, prev = [], None
    for m in TOK.finditer(text):
        w = m.group(0)
        if w in own: path = folder + '/' + w + '.png'
        elif w in QC: path = QC[w]
        else: continue
        before = text[:m.start()].rstrip()
        if prev and before.endswith('→') and w in own and prev in own:
            pre = re.match(r'[a-z]+-', w)
            if pre and prev.startswith(pre.group(0)):
                for s in own:
                    if s.startswith(pre.group(0)) and prev < s < w:
                        p = folder + '/' + s + '.png'
                        if p not in out: out.append(p)
        if path not in out: out.append(path)
        prev = w
    return out

def parse(md, folder):
    own = stems(os.path.join(FB, folder))
    group, posts, cur = '', [], None
    for line in open(md, encoding='utf-8').read().split('\n'):
        if line.startswith('# '):
            group = plain(line[2:]); cur = None; continue
        if line.startswith('## '):
            cur = {'g': group, 't': plain(line[3:]), 'body': []}; posts.append(cur); continue
        if line.strip() == '---': cur = None; continue
        if cur is not None: cur['body'].append(line)
    res = []
    for p in posts:
        body = '\n'.join(p['body'])
        imgs = images(p['t'] + '\n' + body, folder, own)
        if not imgs: continue
        parts = re.split(r'^\*\*Comment đáp án\*\*.*$', body, maxsplit=1, flags=re.M)
        def clean(t):
            ls = [l for l in t.split('\n') if not NOTE.search(l)]
            return re.sub(r'\n{3,}', '\n\n', plain('\n'.join(ls)))
        cm = ''
        if len(parts) > 1:
            head = re.search(r'^\*\*Comment đáp án\*\*(.*)$', body, re.M).group(1)
            cm = (plain(re.sub(r'^[:\s]*', '', head.split(':', 1)[1])) + '\n' if ':' in head and head.split(':', 1)[1].strip() else '') + clean(parts[1])
        t = re.sub(r'\s*[—(]\s*(?:ảnh:|[a-z0-9-]+\.png|mỗi comment|bài chính|\d+ ảnh \().*$', '', p['t']).strip()
        if folder != 'ca-nhan': t = p['g'].split('—')[0].strip() + ' · ' + t
        res.append({'g': p['g'], 't': t, 'i': imgs, 'c': clean(parts[0]), 'm': cm.strip()})
    return res

def main():
    data = []
    for md in sorted(glob.glob(os.path.join(FB, '*', 'caption.md'))):
        data += parse(md, os.path.basename(os.path.dirname(md)))
    tpl = open(os.path.join(FB, 'trang.tpl.html'), encoding='utf-8').read()
    html = tpl.replace('/*DATA*/[]', json.dumps(data, ensure_ascii=False))
    open(os.path.join(FB, 'index.html'), 'w', encoding='utf-8').write(html)
    print(len(data), 'bài,', sum(len(d['i']) for d in data), 'ảnh')
    for d in data: print(' -', d['t'][:60], len(d['i']))

if __name__ == '__main__':
    main()
