#!/usr/bin/env python3
"""Sinh bộ ảnh Facebook "80 từ vựng đọc tiêu đề báo TOPIK" (câu 25–27) → fb/ca-nhan/tb-NN-*.html
(chụp: node tools/chup_anh.js fb/ca-nhan/tb-*.html). Khung qn.css như bộ quán ngữ; mỗi ảnh 8 từ:
từ | nghĩa (Hán Việt) | tiêu đề mẫu ({…} = từ đang học, in đậm) + dịch. Từ lấy theo nhóm V25_* của kho từ, tiêu đề mẫu Claude soạn
(không lấy đề thật, không đưa số liệu thống kê riêng)."""
import html, re, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'fb', 'ca-nhan')
P = [
 ('yeu-thich', '🔥', 'Được yêu thích', 'cơn sốt · thu hút', [
  ('열풍', 'cơn sốt <i>(nhiệt phong)</i>', '전국에 {캠핑 열풍}… 장비 판매 두 배', 'Cơn sốt cắm trại khắp cả nước… dụng cụ bán gấp đôi'),
  ('인기몰이', 'gây sốt, hút khách', '신제품 라면, 출시 한 달 만에 {인기몰이}', 'Mì mới ra mắt một tháng đã gây sốt'),
  ('각광', 'được săn đón, chú ý <i>(cước quang – đèn sân khấu)</i>', '{각광받는} 친환경 포장재', 'Bao bì thân thiện môi trường được săn đón'),
  ('흥행', 'thắng lớn phòng vé <i>(hưng hành)</i>', '독립 영화의 깜짝 {흥행}… 관객 100만 돌파', 'Phim độc lập thắng lớn bất ngờ… vượt 1 triệu khán giả'),
  ('반응이 뜨겁다', 'được hưởng ứng nồng nhiệt', '무료 공연에 시민 {반응 뜨거워}', 'Buổi diễn miễn phí được người dân hưởng ứng nồng nhiệt'),
  ('입소문', 'tiếng lành đồn xa, truyền miệng', '{입소문 타고} 손님 줄 잇는 시골 빵집', 'Tiệm bánh quê được truyền miệng, khách nối đuôi'),
  ('사로잡다', 'chinh phục, hớp hồn', '전통 공예품, 외국인 관광객 마음 {사로잡아}', 'Đồ thủ công truyền thống hớp hồn du khách nước ngoài'),
  ('전성시대', 'thời hoàng kim <i>(toàn thịnh thời đại)</i>', '1인 방송 {전성시대}', 'Thời hoàng kim của kênh phát sóng cá nhân')]),
 ('dong-vang', '👥', 'Đông – vắng', 'người đổ về · vắng tanh', [
  ('인파', 'biển người <i>(nhân ba – sóng người)</i>', '불꽃 축제에 100만 {인파}', 'Biển người 1 triệu tại lễ hội pháo hoa'),
  ('북새통', 'cảnh chen chúc, nhốn nháo', '연휴 첫날 공항 {북새통}', 'Ngày đầu kỳ nghỉ, sân bay chen chúc'),
  ('몰리다', 'đổ dồn về', '할인 행사에 손님 {몰려}… 매장 앞 긴 줄', 'Khách đổ dồn về đợt giảm giá… xếp hàng dài'),
  ('북적이다', 'nhộn nhịp, đông đúc', '방학 맞은 박물관, 가족 관람객으로 {북적}', 'Bảo tàng mùa nghỉ hè nhộn nhịp khách gia đình'),
  ('성업', 'làm ăn phát đạt <i>(thịnh nghiệp)</i>', '추위에 호떡 가게 {성업}', 'Trời lạnh, quán bánh hotteok đắt khách'),
  ('한산하다', 'vắng vẻ <i>(nhàn tản)</i>', '폭염에 도심 거리 {한산}', 'Nắng nóng gay gắt, phố xá vắng vẻ'),
  ('썰렁하다', 'vắng tanh, lạnh lẽo', '관광객 끊긴 해수욕장 {썰렁}', 'Bãi biển vắng khách, lạnh tanh'),
  ('지옥철', 'tàu điện chật cứng <i>(“tàu địa ngục”)</i>', '출근길 {지옥철}, 언제쯤 나아질까', 'Tàu điện chật cứng giờ đi làm, bao giờ mới đỡ?')]),
 ('tang', '📈', 'Tăng – kỷ lục', 'tăng vọt · vượt mốc', [
  ('껑충', '(tăng) vọt', '배춧값 한 달 새 두 배 {껑충}', 'Giá cải thảo vọt gấp đôi trong một tháng'),
  ('급등', 'tăng vọt <i>(cấp đằng)</i>', '한파에 난방비 {급등}', 'Rét đậm, tiền sưởi tăng vọt'),
  ('고공행진', '(giá) leo thang, cao mãi <i>(cao không hành tiến)</i>', '채소 가격 석 달째 {고공행진}', 'Giá rau leo thang suốt ba tháng'),
  ('하늘 높은 줄 모르다', 'tăng không biết điểm dừng', '집값 {하늘 높은 줄 모르고} 치솟아', 'Giá nhà tăng chóng mặt, không điểm dừng'),
  ('신기록', 'kỷ lục mới <i>(tân ký lục)</i>', '여름 전력 사용량 또 {신기록}', 'Lượng điện dùng mùa hè lại lập kỷ lục mới'),
  ('역대 최고', 'cao nhất từ trước tới nay <i>(lịch đại tối cao)</i>', '수출액 {역대 최고}… 반도체가 이끌어', 'Xuất khẩu cao nhất lịch sử… nhờ chất bán dẫn'),
  ('돌파', 'vượt mốc <i>(đột phá)</i>', '외국인 관광객 1,000만 명 {돌파}', 'Khách du lịch nước ngoài vượt mốc 10 triệu'),
  ('오름세', 'đà tăng', '금값 {오름세} 이어져', 'Giá vàng tiếp đà tăng')]),
 ('giam', '📉', 'Giảm – chững lại', 'lao dốc · đóng băng', [
  ('뚝', '(giảm) mạnh, đột ngột', '기온 {뚝}… 내일 첫눈', 'Nhiệt độ giảm mạnh… mai có tuyết đầu mùa'),
  ('곤두박질', 'lao dốc', '주가 하루 만에 {곤두박질}', 'Giá cổ phiếu lao dốc chỉ trong một ngày'),
  ('내림세', 'đà giảm', '휘발유 가격 3주째 {내림세}', 'Giá xăng giảm tuần thứ ba liên tiếp'),
  ('주춤', 'chững lại', '독감 환자 증가세 {주춤}', 'Đà tăng bệnh nhân cúm chững lại'),
  ('한풀 꺾이다', 'dịu bớt, hạ nhiệt', '무더위 {한풀 꺾여}… 아침저녁 선선', 'Nắng nóng dịu bớt… sáng tối mát mẻ'),
  ('거품이 빠지다', 'hết “bong bóng”, giá ảo hạ xuống', '중고차 가격 {거품 빠진다}', 'Giá xe cũ bắt đầu hết giá ảo'),
  ('제자리걸음', 'giậm chân tại chỗ', '청년 고용률 3년째 {제자리걸음}', 'Tỷ lệ việc làm thanh niên giậm chân tại chỗ ba năm'),
  ('얼어붙다', 'đóng băng, ảm đạm', '고금리에 부동산 시장 {꽁꽁 얼어붙어}', 'Lãi suất cao, thị trường nhà đất đóng băng')]),
 ('gia-ca', '💰', 'Giá cả – mua bán', 'vật giá · khan hàng', [
  ('물가', 'giá cả sinh hoạt <i>(vật giá)</i>', '장바구니 {물가} 비상', 'Giá đi chợ báo động'),
  ('인상 ⇔ 인하', 'tăng giá ⇔ giảm giá <i>(dẫn thượng ⇔ dẫn hạ)</i>', '버스 요금 {인상}… 다음 달부터 1,500원', 'Tăng giá vé xe buýt… từ tháng sau 1.500 won'),
  ('유가', 'giá dầu <i>(du giá)</i>', '국제 {유가} 하락에 항공권 가격도 내려', 'Giá dầu thế giới giảm, vé máy bay cũng giảm'),
  ('출하량', 'lượng hàng đưa ra chợ <i>(xuất hà lượng)</i>', '태풍 피해로 사과 {출하량} 급감', 'Bão gây thiệt hại, lượng táo ra chợ giảm mạnh'),
  ('품귀', 'khan hàng, cháy hàng <i>(phẩm quý)</i>', '마스크 {품귀}… 약국마다 긴 줄', 'Khẩu trang khan hiếm… hiệu thuốc nào cũng xếp hàng'),
  ('분양', 'mở bán căn hộ <i>(phân nhượng)</i>', '신도시 아파트 {분양}에 수만 명 몰려', 'Hàng vạn người đổ về đợt mở bán căn hộ khu đô thị mới'),
  ('매매', 'mua bán (nhà đất) <i>(mại mãi)</i>', '아파트 {매매} 거래 절반으로 뚝', 'Giao dịch mua bán căn hộ giảm còn một nửa'),
  ('허리띠를 졸라매다', 'thắt lưng buộc bụng', '고물가에 가계 {허리띠 졸라매}', 'Giá cả cao, các gia đình thắt lưng buộc bụng')]),
 ('tin-hieu', '🚦', 'Tín hiệu tốt – xấu', 'đèn xanh · đèn đỏ', [
  ('청신호', 'tín hiệu tốt – đèn xanh <i>(thanh tín hiệu)</i>', '수출 회복에 경제 {청신호}', 'Xuất khẩu phục hồi, kinh tế bật đèn xanh'),
  ('적신호', 'tín hiệu xấu – đèn đỏ <i>(xích tín hiệu)</i>', '청소년 수면 부족, 건강에 {적신호}', 'Thanh thiếu niên thiếu ngủ, sức khỏe báo động đỏ'),
  ('기지개를 켜다', 'vươn vai → khởi sắc trở lại', '관광 업계 3년 만에 {기지개}', 'Ngành du lịch khởi sắc trở lại sau ba năm'),
  ('봄바람', 'gió xuân → dấu hiệu khởi sắc', '얼어붙은 취업 시장에 {봄바람}', 'Gió xuân thổi vào thị trường việc làm đóng băng'),
  ('웃다 ⇔ 울상', 'làm ăn thuận lợi ⇔ mặt mếu', '폭염에 에어컨 업계 {웃고} 채소 농가 {울상}', 'Nắng nóng: hãng điều hòa vui, nhà vườn rau mếu máo'),
  ('즐거운 비명', '“kêu” vì bận, làm ăn quá tốt', '주문 폭주에 {즐거운 비명}', 'Đơn hàng dồn dập, bận mà vui'),
  ('한숨', 'tiếng thở dài (lo lắng)', '쌀값 하락에 농민들 {한숨}', 'Giá gạo giảm, nông dân thở dài'),
  ('비상', 'báo động, khẩn cấp <i>(phi thường)</i>', '가뭄에 식수 {비상}', 'Hạn hán, báo động nước sinh hoạt')]),
 ('huy-ket', '⛔', 'Hủy – kẹt – trì hoãn', 'hủy chuyến · đổ bể', [
  ('결항', 'hủy chuyến bay / tàu <i>(khuyết hàng)</i>', '태풍에 제주 항공편 무더기 {결항}', 'Bão, hàng loạt chuyến bay Jeju bị hủy'),
  ('발이 묶이다', 'bị kẹt, không đi được', '폭설로 관광객 수천 명 {발 묶여}', 'Tuyết dày, hàng nghìn du khách bị kẹt lại'),
  ('지연', 'chậm trễ <i>(trì diên)</i>', '부품 부족으로 신차 출고 {지연}', 'Thiếu linh kiện, giao xe mới bị chậm'),
  ('무산', 'đổ bể, bị hủy <i>(vụ tán – tan như sương)</i>', '주민 반대로 공원 건설 계획 {무산}', 'Dân phản đối, kế hoạch xây công viên đổ bể'),
  ('마비', 'tê liệt <i>(ma tý)</i>', '폭우에 도심 교통 {마비}', 'Mưa lớn, giao thông nội đô tê liệt'),
  ('표류', 'trôi nổi → bế tắc <i>(phiêu lưu)</i>', '노사 협상 석 달째 {표류}', 'Đàm phán chủ – thợ bế tắc ba tháng'),
  ('존폐 위기', 'nguy cơ phải đóng cửa <i>(tồn phế)</i>', '학생 줄어든 시골 학교 {존폐 위기}', 'Trường làng ít học sinh đứng trước nguy cơ đóng cửa'),
  ('찬물을 끼얹다', 'dội gáo nước lạnh', '갑작스러운 비, 축제 분위기에 {찬물}', 'Mưa bất chợt dội gáo nước lạnh vào lễ hội')]),
 ('bat-tay', '🤝', 'Bắt tay – thúc đẩy', 'hợp tác · vào cuộc', [
  ('손을 잡다', 'bắt tay hợp tác', '대기업·대학 {손잡고} 인재 키운다', 'Doanh nghiệp và đại học bắt tay đào tạo nhân tài'),
  ('머리를 맞대다', 'chụm đầu bàn bạc', '정부·업계 {머리 맞대고} 대책 마련', 'Chính phủ và doanh nghiệp cùng bàn giải pháp'),
  ('발 벗고 나서다', 'xắn tay vào cuộc', '주민들 {발 벗고 나서} 하천 살렸다', 'Người dân xắn tay vào cuộc, hồi sinh dòng suối'),
  ('팔을 걷어붙이다', 'xắn tay áo bắt tay vào làm', '지자체, 저출산 해결에 {팔 걷어붙여}', 'Chính quyền địa phương xắn tay giải bài toán sinh ít'),
  ('박차를 가하다', 'đẩy mạnh <i>(phách xa – thúc cựa ngựa)</i>', '전기차 개발에 {박차}', 'Đẩy mạnh phát triển xe điện'),
  ('첫 삽을 뜨다', 'khởi công <i>(nhát xẻng đầu tiên)</i>', '지하철 연장 공사 {첫 삽}', 'Khởi công kéo dài tuyến tàu điện ngầm'),
  ('부심', 'trăn trở tìm cách <i>(hủ tâm)</i>', '쓰레기 처리 방안 마련에 {부심}', 'Trăn trở tìm cách xử lý rác'),
  ('탈바꿈', 'lột xác, thay đổi hoàn toàn', '폐공장, 문화 공간으로 {탈바꿈}', 'Nhà máy bỏ hoang lột xác thành không gian văn hóa')]),
 ('lien-tiep', '⏩', 'Liên tiếp – sắp tới', 'nối đuôi · đếm ngược', [
  ('줄을 잇다', 'nối đuôi nhau', '이웃 돕기 기부 {줄 이어}', 'Quyên góp giúp hàng xóm nối dài'),
  ('속출', 'liên tiếp xảy ra <i>(tục xuất)</i>', '한파에 수도관 동파 {속출}', 'Rét đậm, ống nước vỡ do đóng băng liên tiếp'),
  ('꼬리를 물다', 'nối tiếp nhau (sự việc)', '{꼬리 무는} 의혹… 진실은?', 'Nghi vấn nối tiếp nghi vấn… sự thật là gì?'),
  ('봇물 터지다', 'ồ ạt như vỡ đập', '여름 휴가 예약 {봇물}', 'Đặt chỗ nghỉ hè ồ ạt'),
  ('연일', 'nhiều ngày liền <i>(liên nhật)</i>', '{연일} 계속되는 폭염', 'Nắng nóng kéo dài nhiều ngày liền'),
  ('성큼', '(đến) gần, nhanh', '{성큼} 다가온 가을', 'Mùa thu đã đến gần'),
  ('코앞', 'ngay trước mũi, cận kề', '수능 {코앞}… 막바지 건강 관리', 'Kỳ thi đại học cận kề… giữ sức khỏe giai đoạn cuối'),
  ('초읽기', 'đếm ngược <i>(đọc từng giây)</i>', '우주 발사체 발사 {초읽기}', 'Đếm ngược phóng tên lửa đẩy vũ trụ')]),
 ('y-kien', '💬', 'Ý kiến – phản ứng', 'trái chiều · ghẻ lạnh', [
  ('목소리가 높다', 'nhiều người lên tiếng đòi', '규제 강화 {목소리 높아}', 'Ngày càng nhiều ý kiến đòi siết quy định'),
  ('엇갈리다', '(ý kiến) trái chiều', '주 4일제 도입, 의견 {엇갈려}', 'Áp dụng tuần làm 4 ngày: ý kiến trái chiều'),
  ('쓴소리', 'lời góp ý thẳng thắn <i>(lời đắng)</i>', '원로 감독의 {쓴소리}', 'Lời góp ý thẳng của đạo diễn lão làng'),
  ('물음표', 'dấu chấm hỏi → còn nghi ngờ', '새 정책 효과에 {물음표}', 'Hiệu quả chính sách mới vẫn là dấu hỏi'),
  ('글쎄', '“chưa chắc đâu” (hoài nghi)', '“요금 인하” 발표에 소비자들 “{글쎄}”', 'Thông báo giảm cước, người tiêu dùng: “Chưa chắc”'),
  ('찬밥 신세', 'bị ghẻ lạnh <i>(phận cơm nguội)</i>', '스마트폰에 밀려 {찬밥 신세} 된 디지털카메라', 'Bị điện thoại lấn át, máy ảnh số bị ghẻ lạnh'),
  ('뭇매를 맞다', 'bị chỉ trích dồn dập', '과대 광고에 소비자 {뭇매}', 'Quảng cáo phóng đại, bị người tiêu dùng chỉ trích'),
  ('환영', 'hoan nghênh <i>(hoan nghênh)</i>', '대중교통 할인 확대에 시민들 “{환영}”', 'Người dân hoan nghênh mở rộng giảm giá xe buýt, tàu điện')]),
]
N = len(P) + 2  # bìa + nội dung + ôn tập
HEAD = '''<!doctype html><meta charset=utf-8>
<meta name="robots" content="noindex">
<link rel=stylesheet href="../../quang-cao/topik2-len-3-4/base.css"><link rel=stylesheet href=qn.css>
<style>h1.pt{font-size:58px;white-space:nowrap}h1.pt small{white-space:normal;font-size:24px}.it{grid-template-columns:330px 1fr}.it .a b{font-size:31px}.toc div{padding:7px 18px}</style>
<div class=top><img src="../../logo/nari-topik-ngang.svg"><div class="tag zalo"><small>Zalo cô Ngân</small>0399 214 554</div></div>
'''
def foot(i): return f'''<div class=foot><span>Từ vựng tiêu đề báo · <b>Nari TOPIK</b></span><span class=pg>{i}/{N}</span><span>Lưu lại để ôn nhé 🔖</span></div>
<script src="../../quang-cao/wm.js" data-style="tile"></script>
'''
def ex(s): return re.sub(r'\{(.+?)\}', r'<b>\1</b>', html.escape(s))
total = sum(len(p[4]) for p in P)
files = []
toc = ''.join(f'<div><span class=e>{e}</span><b>{k}</b><small>{vi}</small><i>{i + 2}</i></div>' for i, (_, e, k, vi, _) in enumerate(P))
h = HEAD + f'''<div class=eye>Ôn TOPIK cùng cô Ngân · Bộ sưu tập</div>
<h1 class=cv><b>{total}</b> từ vựng<br>đọc <span>tiêu đề báo</span> TOPIK</h1>
<div class=lead>Câu 25–27 đề đọc · nghĩa · âm Hán Việt · tiêu đề mẫu + bản dịch</div>
<div class=toc>{toc}<div class=q><span class=e>✍️</span><b>Ôn tập</b><small>8 câu tự kiểm tra</small><i>{N}</i></div></div>
<div class=how><b>Mẹo đọc tiêu đề:</b> báo bỏ tiểu từ và đuôi câu, hay kết thúc bằng danh từ:
<b>물가 급등</b> = 물가가 급등했다. Gặp từ ví von (껑충, 기지개, 찬물…) thì nghĩ nghĩa bóng trước.</div>
''' + foot(1)
files.append(('tb-01-bia.html', h))
for i, (slug, e, k, vi, rows) in enumerate(P):
    it = ''.join(f'''<div class=it><div class=a><span class=n>{j + 1:02d}</span><b>{html.escape(a)}</b></div><div class=m>{m}</div>
<div class=x><span class=ko>{ex(x)}</span><span class=vi>{html.escape(v)}</span></div></div>
''' for j, (a, m, x, v) in enumerate(rows))
    h = HEAD + f'''<div class=eye>Từ vựng tiêu đề báo · {i + 2}/{N}</div>
<h1 class=pt><span class=e>{e}</span>{k}<small>{vi}</small></h1>
<div class=list>{it}</div>
''' + foot(i + 2)
    files.append((f'tb-{i + 2:02d}-{slug}.html', h))
Q = [('Giá rau tăng vọt chỉ sau một tuần.', '껑충'), ('Chuyến bay bị hủy vì bão.', '결항'),
     ('Bãi biển vắng tanh, không một bóng người.', '썰렁하다'), ('Ngành du lịch bắt đầu khởi sắc trở lại.', '기지개를 켜다'),
     ('Hai công ty hợp tác phát triển sản phẩm mới.', '손을 잡다'), ('Kế hoạch bị hủy bỏ vì người dân phản đối.', '무산'),
     ('Kỳ thi chỉ còn vài ngày nữa.', '코앞'), ('Người dân chia làm hai luồng ý kiến.', '엇갈리다')]
order = [4, 1, 6, 0, 7, 3, 5, 2]
L = 'ABCDEFGH'
box = ''.join(f'<div><b>{L[i]}</b>{Q[o][1]}</div>' for i, o in enumerate(order))
qs = ''.join(f'<div class=r><span class=n>{j + 1}</span><span class=t>{s}</span><span class=blank></span></div>' for j, (s, _) in enumerate(Q))
ans = ' · '.join(f'{j + 1}{L[order.index(j)]}' for j in range(len(Q)))
h = HEAD + f'''<div class=eye>Từ vựng tiêu đề báo · {N}/{N} · Ôn tập</div>
<h1 class="pt q"><span class=e>✍️</span>Chọn từ<small>ghép mỗi tin với 1 từ trong khung</small></h1>
<div class=box>{box}</div>
<div class=quiz>{qs}</div>
<div class=how>Comment đáp án dạng <b>1A, 2B…</b> · cô chữa ở bình luận 💜</div>
''' + foot(N)
files.append((f'tb-{N:02d}-on-tap.html', h))
for f, h in files:
    open(os.path.join(OUT, f), 'w').write(h)
print(len(files), 'ảnh,', total, 'từ · đáp án ôn tập:', ans)
