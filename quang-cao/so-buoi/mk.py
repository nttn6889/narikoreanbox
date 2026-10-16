import sys
DOC=[('1–2','Chọn ngữ pháp điền chỗ trống',2),('3–4','Ngữ pháp tương đồng',2),('5–8','Đoán chủ đề quảng cáo, thông báo',4),
('9–12','Nội dung giống: biểu đồ, bài báo',4),('13–15','Sắp xếp thứ tự câu',3),('16–18','Điền vào chỗ trống',3),
('19–20','Từ nối + nội dung',2),('21–22','Quán ngữ + nội dung',2),('23–24','Cảm xúc nhân vật + nội dung',2),
('25–27','Hiểu tiêu đề báo',3),('28–31','Điền chỗ trống đoạn dài',4),('32–34','Nội dung giống đoạn dài',3),('35','Chủ đề của đoạn văn',1)]
NGHE=[('1–3','Chọn tranh, biểu đồ',3),('4–8','Câu nói tiếp theo',5),('9–12','Hành động tiếp theo',4),('13–16','Nội dung giống',4),
('17–20','Ý chính người nói',4),('21–22','Hội thoại: ý chính',2),('23–24','Người nói đang làm gì',2),('25–26','Phỏng vấn: ý chính',2),
('27–28','Ý định người nói',2),('29–30','Người nói là ai',2),('31–32','Tranh luận: ý kiến, thái độ',2),('33–34','Bài giảng: chủ đề',2),('35–36','Phát biểu: đang làm gì',2)]
VIET=[('51','Điền câu: thư, thông báo','10đ'),('52','Điền câu: đoạn văn','10đ'),('53','Mô tả biểu đồ 200–300 chữ','30đ'),('54','Nghị luận 600–700 chữ','50đ')]
CFG={3:dict(total=120,doc=50,nghe=45,viet=25,nd=10,nn=5,nv=3,col='v',
  vdoc='Làm chắc câu 1–27',vnghe='Làm chắc câu 1–20',vviet='51 + 52 + 53 theo khung',months='~4 tháng',
  extra=''),
 4:dict(total=150,doc=60,nghe=55,viet=35,nd=13,nn=13,nv=4,col='g',
  vdoc='Làm chắc câu 1–35',vnghe='Làm chắc câu 1–36',vviet='53 đủ ý + viết được 54',months='~6,5 tháng',
  extra='Đã có TOPIK 3: chỉ học thêm 12 dạng = <b>36 buổi</b> (~2,5 tháng).')}
def rows(L,n,lv):
  out=[]
  for i,(c,t,k) in enumerate(L):
    if i>=n: break
    new=' class=nw' if lv==4 and ((L is DOC and i>=10) or (L is NGHE and i>=5)) else ''
    out.append(f'<li{new}><i>{c}</i><span>{t}</span><em>{k*2}đ</em></li>')
  return ''.join(out)
def page(lv):
  c=CFG[lv]; nd,nn,nv=c['nd'],c['nn'],c['nv']; dang=nd+nn+nv; buoi=dang*3
  mx_d=sum(k for _,_,k in DOC[:nd])*2; mx_n=sum(k for _,_,k in NGHE[:nn])*2
  last_d=DOC[nd-1][0].split('–')[-1]; last_n=NGHE[nn-1][0].split('–')[-1]
  viet=''.join(f'<li{" class=nw" if lv==4 and i==3 else ""}><i>{a}</i><span>{t}</span><em>{p}</em></li>' for i,(a,t,p) in enumerate(VIET[:nv]))
  legend='<div class=leg><span><b class=o></b>Phần của TOPIK 3</span><span><b class=n></b>Học thêm để lên TOPIK 4</span></div>' if lv==4 else ''
  return f'''<!doctype html><meta charset=utf-8><link rel=stylesheet href=../topik2-len-3-4/base.css><link rel=stylesheet href=so-buoi.css>
<body class=l{lv}>
<div class=top><img src="../../logo/nari-topik-ngang.svg"><div class="tag zalo"><small>Zalo cô Ngân</small>0399 214 554</div></div>
<div class=head><div><div class=eye>Lộ trình ôn TOPIK II</div><h1>TOPIK {lv} <span>cần {c['total']} / 300 điểm</span></h1></div>
<div class=rule>Mỗi dạng<b>3 buổi</b></div></div>
<div class=sc>
 <div class="card s"><div class=k>Đọc</div><div class=p>{c['doc']}<small>/100</small></div><div class=d>{c['vdoc']} ({mx_d}đ)</div></div>
 <div class="card s"><div class=k>Nghe</div><div class=p>{c['nghe']}<small>/100</small></div><div class=d>{c['vnghe']} ({mx_n}đ)</div></div>
 <div class="card s"><div class=k>Viết</div><div class=p>{c['viet']}<small>/100</small></div><div class=d>{c['vviet']}</div></div>
</div>
<div class=two>
 <div class="card lst"><div class=lh>Đọc · câu 1–{last_d}<b>{nd} dạng</b></div><ul>{rows(DOC,nd,lv)}</ul></div>
 <div class="card lst"><div class=lh>Nghe · câu 1–{last_n}<b>{nn} dạng</b></div><ul>{rows(NGHE,nn,lv)}</ul>{TIP if lv==3 else ''}</div>
</div>
<div class="card lst vt"><div class=lh>Viết · câu 51–{50+nv}<b>{nv} dạng</b></div><ul>{viet}</ul></div>
{legend}
<div class=tot>
 <div class=f>{dang} dạng × 3 buổi<b>{buoi} buổi</b></div>
 <div class=f>Học 3 buổi/tuần<b>{dang} tuần</b></div>
 <div class=f>~14 buổi/tháng<b>{c['months']}</b><small>{buoi} ÷ 14 ≈ {buoi/14:.1f}</small></div>
</div>
{CTA if lv==3 else ''}{'<p class=note>'+c['extra']+' Từ vựng làm hằng ngày trên app ở nhà, không tính vào số buổi.</p>' if lv==4 else ''}
'''.replace('.1f','').replace(f'{buoi/14:.1f}', f'{buoi/14:.1f}'.replace('.',','))
TIP='''<div class=tip><div class=th>Vì sao đủ điểm?</div>
<p><b>Đọc:</b> câu 1–27 tối đa 54đ + khoanh hết câu 28–50 (đoán trúng ~1/4) ≈ <b>+11đ</b></p>
<p><b>Nghe:</b> câu 1–20 tối đa 40đ + khoanh hết câu 21–50 ≈ <b>+15đ</b></p>
<p><b>Viết:</b> 51 + 52 khoảng 14đ, câu 53 viết theo khung khoảng 11đ</p></div>'''
CTA='''<div class="cta c2"><div><div class=t>Tính lộ trình theo điểm hiện tại và ngày thi của em</div><div class=s>theo điểm hiện tại và ngày thi</div></div><div class=btn>Inbox cô</div></div>'''
D=sys.argv[1]
for lv,f in [(3,'topik-3.html'),(4,'topik-4.html')]:
  open(f'{D}/{f}','w').write(page(lv))
