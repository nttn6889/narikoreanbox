"""Loạt bài Facebook "90 ngày TOPIK II" (trang cá nhân cô).
python3 tools/fb_90.py → fb/90-ngay/ngay-NN.html (+ ngay-00 lộ trình) + caption.md
Chụp ảnh: node tools/chup_anh.js fb/90-ngay/*.html
Khung ảnh fb/ca-nhan/khung.css (cô duyệt 30/10), không ghi số liệu thống kê riêng (số đề…).
Dữ liệu: thi-thu/vocab.json (Tầng cốt lõi, từ theo dạng câu), PLAN của ngu-phap-luyen/ (ngữ pháp câu 1–4).
Lịch ở biến LICH: mỗi 10 ngày = 9 bài + 1 ngày ôn (ảnh kiểm tra, đáp án ở comment)."""
import json, re, subprocess, html, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'fb/90-ngay')
V = json.load(open(os.path.join(ROOT, 'thi-thu/vocab.json')))['g']
G = {g['id']: g for g in V}

def plan():
    s = open(os.path.join(ROOT, 'ngu-phap-luyen/index.html')).read()
    m = re.search(r'var PLAN=(\[null,.*?\n\]);', s, re.S)
    js = 'const P=' + m.group(1) + ';console.log(JSON.stringify(P))'
    return json.loads(subprocess.run(['node', '-e', js], capture_output=True, text=True).stdout)
PLAN = plan()

def tang(t):
    return [w for g in V if g['sec'].startswith('Cốt lõi · Tầng %d' % t) for w in g['w']]

CHANG = [None,
  ('Chặng 1 · 30 ngày đầu', 'Nền: từ cốt lõi Tầng 1 + ngữ pháp câu 1–4'),
  ('Chặng 2 · 60 ngày', 'Đọc theo dạng câu + từ cốt lõi Tầng 2'),
  ('Chặng 3 · 90 ngày', 'Nghe, Viết + từ cốt lõi Tầng 3')]

# Bài theo dạng câu: (tiêu đề, dòng phụ, [(nhóm, số từ)])
CAU2 = [
  ('Câu 5 · Quảng cáo sản phẩm', 'Thấy cụm này → đoán ra đồ vật', [('V05_00', 2), ('V05_01', 2), ('V05_03', 2), ('V05_04', 2)]),
  ('Câu 6 · Quảng cáo nơi chốn', 'Thấy cụm này → đoán ra địa điểm', [('V06_03', 3), ('V06_18', 2), ('V06_20', 3), ('V06_32', 2)]),
  ('Câu 7 · Quảng cáo công ích', 'Chiến dịch nói về điều gì?', [('V07_02', 3), ('V07_04', 3), ('V07_06', 2), ('V07_08', 2)]),
  ('Câu 8–9 · Thông báo, áp phích', 'Từ hay gặp trong bản thông báo', [('V09_10', 10)]),
  ('Câu 10 · Biểu đồ', 'Đọc tăng – giảm – thứ hạng', [('V10_01', 3), ('V10_02', 3), ('V10_05', 2)]),
  ('Câu 11–12 · Tin ngắn', 'Từ hay gặp trong tin tức', [('V11_03', 4), ('V11_04', 3), ('V11_06', 3)]),
  ('Câu 19–20 · Từ nối', 'Phó từ quyết định ô trống', [('V19_00', 5), ('V19_01', 5)]),
  ('Câu 21–22 · Quán dụng ngữ', 'Nghĩa bóng, không dịch từng chữ', [('V21_00', 10)]),
  ('Câu 23–24 · Từ cảm xúc', 'Tâm trạng nhân vật trong tùy bút', [('V23_00', 10)]),
  ('Câu 25–27 · Tiêu đề báo', 'Được yêu thích – đông người', [('V25_00', 6), ('V25_01', 4)]),
  ('Câu 25–27 · Tiêu đề báo', 'Kinh tế, giá cả', [('V25_03', 10)]),
  ('Câu 42–43 · Tiểu thuyết', 'Cảm xúc nhân vật', [('V42_00', 10)]),
  ('Câu 44–45 · Đoạn văn xã hội', 'Từ của chủ đề xã hội, môi trường', [('V44_02', 5), ('V44_04', 5)]),
]
CAU3 = [
  ('Nghe 4–12 · Ở công ty', 'Hội thoại nơi làm việc', [('VN04_01', 10)]),
  ('Nghe 4–12 · Ở trường', 'Hội thoại trường học', [('VN04_06', 10)]),
  ('Nghe 4–12 · Bệnh viện, nhà thuốc', 'Biểu hiện hay nghe', [('VN04_22', 10)]),
  ('Nghe 4–12 · Ngân hàng', 'Từ hay nghe ở ngân hàng', [('VN04_25', 10)]),
  ('Nghe 4–12 · Bưu điện, đồ thất lạc', 'Gửi đồ – tìm đồ', [('VN04_23', 5), ('VN04_24', 5)]),
  ('Nghe 15 · Bản tin sự cố', 'Tai nạn, giao thông', [('VN15_00', 5), ('VN15_03', 5)]),
  ('Nghe 15 · Dự báo thời tiết', 'Mưa, nắng, nhiệt độ', [('VN15_07', 10)]),
  ('Nghe 31–32 · Tán thành – phản đối', 'Nhận ra lập trường người nói', [('VN31_00', 5), ('VN31_01', 5)]),
  ('Viết 51 · Thông báo', 'Từ hay dùng khi viết câu 51', [('V51_00', 10)]),
  ('Viết 51 · Email, tin nhắn', 'Từ hay dùng khi viết câu 51', [('V51_02', 6), ('V51_03', 4)]),
  ('Viết 53 · Biểu đồ', 'Khung câu viết câu 53', [('V53_00', 3), ('V53_01', 3)]),
  ('Viết 54 · Tục ngữ', 'Mở bài câu 54 cho “có nghề”', [('V54_00', 8)]),
  ('Viết 54 · Tục ngữ', 'Mở bài câu 54 cho “có nghề”', [('V54_04', 8)]),
]

def split(lst, n):
    k, r = divmod(len(lst), n)
    out, i = [], 0
    for j in range(n):
        s = k + (1 if j < r else 0); out.append(lst[i:i + s]); i += s
    return out

def lich():
    T1 = split(tang(1), 16); T2 = tang(2); T3 = tang(3)
    c1 = []
    t = n = 0
    for i in range(27):
        if i < 22 and i % 2: n += 1; c1.append(('np', n))
        else: c1.append(('tu', 1, t + 1, T1[t])); t += 1
    c2 = []
    for i in range(27):
        if i % 2: c2.append(('cau',) + CAU2[i // 2])
        else: k = i // 2; c2.append(('tu', 2, k + 1, T2[k * 8:k * 8 + 8]))
    c2.insert(1, c2.pop(1))
    c3 = []
    for i in range(27):
        if i % 2: c3.append(('cau',) + CAU3[i // 2])
        else: k = i // 2; c3.append(('tu', 3, k + 1, T3[k * 8:k * 8 + 8]))
    days = [None]
    for ch in (c1, c2, c3):
        for b in range(3):
            blk = ch[b * 9:b * 9 + 9]
            days += blk + [('on', blk)]
    return days
D = lich()

def R(k, t):
    return '<div class="r%s"><span class=k>%s</span><span class=t>%s</span></div>' % (' s' if len(k) > 13 else '', e(k), t)
def e(s): return html.escape(s or '', quote=False)
def ex(s): return re.sub(r'__(.+?)__', r'<u>\1</u>', e(s))
def ex_plain(s): return re.sub(r'__(.+?)__', r'\1', s or '')
def strip(s): return re.sub(r'<[^>]+>', '', s)

HEAD = """<!doctype html><meta charset=utf-8>
<meta name="robots" content="noindex">
<link rel=stylesheet href="../../quang-cao/topik2-len-3-4/base.css"><link rel=stylesheet href="../ca-nhan/khung.css"><link rel=stylesheet href=n90.css>
<div class=frame></div>
<div class=card>
<div class=hd><img src="../../logo/nari-topik-ngang.svg"><div class=zl>Zalo cô Ngân<b>0399 214 554</b></div></div>
"""
TAIL = '</div>\n<script src="../../quang-cao/wm.js" data-style="tile"></script>\n'
def chang(d): return 1 if d <= 30 else 2 if d <= 60 else 3
def top(d, emo, t, sub):
    return ('<div class=eye>90 ngày TOPIK II · Ngày %d/90 · %s</div>' % (d, CHANG[chang(d)][0].split(' · ')[0]) +
            '<h1 class="k%s"><span class=e>%s</span><span>%s<small>%s</small></span></h1><div class=bar></div>' % (' l' if len(t) > 22 else '', emo, t, sub))
def foot(d):
    return ('<div class=prog><i style="width:%.1f%%"></i></div><div class=ft><span>90 ngày TOPIK II · <b>Nari TOPIK</b></span>'
            '<span class=pg>Ngày %d/90</span><span>Lưu lại để ôn nhé 🔖</span></div>' % (d / 90 * 100, d)) + TAIL

def title(it):
    k = it[0]
    if k == 'np': return 'Ngữ pháp câu 1–4 · ' + PLAN[it[1]]['t']
    if k == 'tu': return 'Từ cốt lõi Tầng %d · Phần %d' % (it[1], it[2])
    if k == 'cau': return it[1] + ' — ' + it[2]
    return 'Ngày ôn'

TANG_SUB = {1: 'từ đề đọc nào cũng có', 2: 'từ đề đọc rất hay gặp', 3: 'từ đề đọc hay gặp'}
EMO = [('Câu 5 ', '🛍️'), ('Câu 6', '🏬'), ('Câu 7', '🌱'), ('Câu 8', '📋'), ('Câu 10', '📊'), ('Câu 11', '📰'), ('Câu 19', '🔗'),
       ('Câu 21', '💬'), ('Câu 23', '💭'), ('Câu 25', '🗞️'), ('Câu 42', '📖'), ('Câu 44', '🌏'), ('Nghe', '🎧'), ('Viết', '✍️')]

def item(i, k, m, x=''):
    return ('<div class=it><span class=n>%d</span><div><div class=a><b>%s</b><span class=m>%s</span></div>%s</div></div>'
            % (i, e(k), e(m), ('<div class=x><span class=ko>%s</span></div>' % x) if x else ''))
def xb(s): return re.sub(r'__(.+?)__', r'<b>\1</b>', e(s))

def page_tu(d, it):
    _, t, p, ws = it
    # câu ví dụ: thêm câu ngắn trước cho tới khi đầy thẻ (mỗi từ ~72px, mỗi dòng câu ~32px, dòng ~56 chữ)
    room, show = 780 - 72 * len(ws), set()
    for i in sorted((i for i, w in enumerate(ws) if len(w) > 3 and w[3]), key=lambda i: len(ws[i][3])):
        h = 34 * (1 + len(ws[i][3]) // 56)
        if h <= room: room -= h; show.add(i)
    rows = ''.join(item(i + 1, w[1], w[2], xb(w[3]) if i in show else '') for i, w in enumerate(ws))
    return HEAD + top(d, '⭐', 'Từ cốt lõi Tầng %d' % t, 'Phần %d · %s' % (p, TANG_SUB[t])) + rows + foot(d)

def np_rows(k, cap=4):
    out = []
    for gid in PLAN[k]['g']:
        for w in G[gid]['w']:
            if len(out) < cap and not any(w[1] == o[1] for o in out): out.append(w)
    return out
def page_np(d, it):
    k = it[1]; P = PLAN[k]
    rows = ''.join(item(i + 1, w[1], w[2], xb(w[3]) if len(w) > 3 else '') for i, w in enumerate(np_rows(k)))
    return (HEAD + top(d, '🧩', P['t'], 'Ngữ pháp câu 1–4') + rows +
            ''.join('<div class=how><b>💡 Chỗ hay nhầm:</b> %s</div>' % e(strip(x)) for x in P['tip'][:2]) + foot(d))

def cau_rows(groups, cap=8):
    out, tot = [], sum(n for _, n in groups)
    for gid, n in groups:
        g = G[gid]; ws = g['w'][:max(1, round(n * cap / tot)) if tot > cap else n]
        out.append((g['vi'] if len(groups) > 1 else None, ws))
    return out
def page_cau(d, it):
    _, t, sub, groups = it
    body, i = '', 0
    for h, ws in cau_rows(groups):
        if h: body += '<div class=gh>%s</div>' % e(h[0].upper() + h[1:])
        for w in ws: i += 1; body += item(i, w[1], w[2])
    emo = next(v for p, v in EMO if t.startswith(p))
    return HEAD + top(d, emo, t, sub) + body + foot(d)

def quiz_items(blk, n=7):
    pool = []
    for it in blk:
        if it[0] == 'tu': pool.append(it[3][:3])
        elif it[0] == 'np': pool.append(np_rows(it[1])[:2])
        else: pool.append([w for _, ws in cau_rows(it[3]) for w in ws][:2])
    out, i = [], 0
    while len(out) < n and any(pool):
        if pool[i % len(pool)]: out.append(pool[i % len(pool)].pop(0))
        i += 1
    return out
def page_on(d, it):
    qs = quiz_items(it[1])
    rows = ''.join('<div class=r><span class=n>%d</span><b>%s</b><span class=blank></span></div>' % (i + 1, e(w[1])) for i, w in enumerate(qs))
    return (HEAD + top(d, '📝', 'Ngày ôn', 'em nhớ được mấy từ?') +
            '<div class=how>7 từ trong 9 ngày vừa rồi. Em viết nghĩa ra giấy hoặc comment, <b>đáp án cô để ở comment</b>.</div>' +
            '<div class=quiz>%s</div>' % rows + foot(d))

def page0():
    def col(c, d1, d2, li):
        return ('<div class=cc><div class=nn>%s</div><div class=d>Ngày %d–%d</div><ul>%s</ul></div>'
                % (CHANG[c][0].split(' · ')[1], d1, d2, ''.join('<li>%s</li>' % x for x in li)))
    return (HEAD + '<div class=eye>Loạt bài mới · chia sẻ miễn phí</div>' +
            '<h1 class=cv><b>90 ngày</b> TOPIK II<br><span>học gì, học thế nào?</span></h1>' +
            '<div class=lead>Mỗi ngày một bài: từ vựng, ngữ pháp <b>theo đúng dạng câu</b> trong đề. Từ nào đề hay ra thì học trước.</div>' +
            '<div class=cols>' +
            col(1, 1, 30, ['Từ cốt lõi Tầng 1', 'Ngữ pháp câu 1–4 theo nhóm']) +
            col(2, 31, 60, ['Từ cốt lõi Tầng 2', 'Từ theo dạng câu đọc 5–45']) +
            col(3, 61, 90, ['Từ cốt lõi Tầng 3', 'Từ nghe 4–32, viết 51–54']) +
            '</div><div class=how>Còn <b>30 ngày</b>: theo chặng 1 · còn <b>60 ngày</b>: chặng 1–2 · còn <b>90 ngày</b>: đi hết.<br>Cứ <b>10 ngày</b> có 1 ngày ôn, đáp án ở comment.</div>' +
            '<div class=ft><span>Theo dõi trang để không lỡ ngày nào 💜</span><span class=pg>#90NgayTOPIK</span></div></div>\n'
            '<script src="../../quang-cao/wm.js" data-style="tile"></script>\n')

PAGE = {'tu': page_tu, 'np': page_np, 'cau': page_cau, 'on': page_on}

# ---- caption ----
HT = '#90NgayTOPIK #TOPIK2 #TuVungTOPIK #NariTOPIK'
def cap(d, it):
    k = it[0]; L = ['## Ngày %d — %s (ngay-%02d.png)' % (d, title(it), d), '']
    if k == 'tu':
        _, t, p, ws = it
        L += ['📅 90 ngày TOPIK II · Ngày %d/90' % d, '',
              'Hôm nay là %d từ cốt lõi Tầng %d — %s. Gặp lại trong đề là đọc được ngay.' % (len(ws), t, TANG_SUB[t]), '']
        L += ['• %s – %s' % (w[1], w[2]) for w in ws]
        w0 = next((w for w in ws if len(w) > 3 and w[3]), None)
        if w0: L += ['', 'Câu trong đề: %s' % ex_plain(w0[3])]
        L += ['', '👉 Em chọn 1 từ, đặt 1 câu ở comment, cô sửa cho nhé.']
    elif k == 'np':
        P = PLAN[it[1]]
        L += ['📅 90 ngày TOPIK II · Ngày %d/90' % d, '', 'Ngữ pháp câu 1–4: nhóm **%s**. Câu 1–2 điền ngữ pháp, câu 3–4 chọn mẫu cùng nghĩa — học theo nhóm là gặp mẫu nào cũng nhận ra.' % P['t'], '']
        L += ['• %s – %s' % (w[1], w[2]) for w in np_rows(it[1])]
        L += ['', '💡 Chỗ hay nhầm:'] + ['• ' + strip(x) for x in P['tip']]
        L += ['', '👉 Em thử đặt 1 câu với mẫu em hay nhầm nhất, comment để cô xem.']
    elif k == 'cau':
        L += ['📅 90 ngày TOPIK II · Ngày %d/90' % d, '', '%s — %s.' % (it[1], it[2][0].lower() + it[2][1:]), '']
        for h, ws in cau_rows(it[3]):
            if h: L.append('▸ ' + h)
            L += ['• %s – %s' % (w[1], w[2]) for w in ws]
        L += ['', '👉 Em đã gặp từ nào trong đề rồi? Comment cho cô biết nhé.']
    else:
        qs = quiz_items(it[1])
        L += ['📅 90 ngày TOPIK II · Ngày %d/90 — NGÀY ÔN' % d, '',
              '9 ngày vừa rồi em có theo kịp không? Đây là 7 từ trong các bài trước. Em viết nghĩa ra giấy (hoặc comment), rồi mới xem đáp án ở comment nhé.', '',
              'Em đúng được mấy từ? Comment số câu đúng: 7/7 là em đang đi rất đúng nhịp đó 💪', '',
              '**Comment đáp án** (đăng sau vài giờ):'] + ['%d. %s – %s' % (i + 1, w[1], w[2]) for i, w in enumerate(qs)]
    return '\n'.join(L + ['', HT, ''])

def main():
    open(os.path.join(OUT, 'ngay-00.html'), 'w').write(page0())
    md = ['# Loạt “90 ngày TOPIK II” — trang cá nhân', '',
          'Sinh tự động bằng `python3 tools/fb_90.py` (sửa lịch ở biến `CAU2`/`CAU3`/`lich()`); chụp ảnh `node tools/chup_anh.js fb/90-ngay/*.html`.',
          'Lời đăng dưới đây là bản nháp, cô sửa theo giọng của cô. Mỗi ngày 1 bài, ngày ôn (10, 20…) đăng đáp án ở comment.', '',
          '## Ngày 0 — Bài mở loạt (ngay-00.png)', '',
          'Rất nhiều em nhắn cô: “Em có 30 / 60 / 90 ngày trước kỳ thi TOPIK II thì học gì trước?”',
          '', 'Câu trả lời của cô: **học đúng phần đề hay ra, theo đúng dạng câu.** Có những từ đề đọc nào cũng gặp, có những nhóm ngữ pháp năm nào cũng ra ở câu 1–4 — học trước những phần đó là lời nhất.',
          '', 'Từ ngày mai cô đăng loạt **90 ngày TOPIK II**, mỗi ngày một bài, chia sẻ miễn phí:',
          '🔹 Ngày 1–30: từ cốt lõi Tầng 1 + ngữ pháp câu 1–4 — đủ nền để đọc nửa đầu đề.',
          '🔹 Ngày 31–60: từ cốt lõi Tầng 2 + từ theo từng dạng câu đọc (quảng cáo, thông báo, biểu đồ, tiêu đề báo, tiểu thuyết…).',
          '🔹 Ngày 61–90: từ cốt lõi Tầng 3 + từ nghe và viết 51–54.',
          '🔹 Cứ 10 ngày có 1 ngày ôn, đáp án ở comment.', '',
          'Em còn 30 ngày thì theo chặng 1, còn 60 ngày theo chặng 1–2, còn 90 ngày thì đi hết. Theo dõi trang và lưu bài lại để không lỡ ngày nào nhé 💜',
          '', 'Comment “90” nếu em học cùng cô từ ngày 1!', '', HT, '']
    for d in range(1, 91):
        open(os.path.join(OUT, 'ngay-%02d.html' % d), 'w').write(PAGE[D[d][0]](d, D[d]))
        md.append(cap(d, D[d]))
    open(os.path.join(OUT, 'caption.md'), 'w').write('\n'.join(md))
    for d in range(1, 91): print(d, title(D[d]))
main()
