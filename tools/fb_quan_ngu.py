#!/usr/bin/env python3
"""Sinh bộ ảnh Facebook "Quán ngữ tiếng Hàn theo bộ phận cơ thể" → fb/ca-nhan/qn-NN-*.html (chụp: node tools/chup_anh.js fb/ca-nhan/qn-*.html).
Khung khung.css (nền tím + viền vàng, thẻ trắng). Mỗi ảnh 8 quán ngữ: quán ngữ | nghĩa | câu ví dụ ({…} = phần quán ngữ, in đậm) + dịch. Nghĩa đối chiếu nhóm V21_* của kho từ."""
import html, re, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'fb', 'ca-nhan')
P = [
 ('nuan-1', '👀', '눈', 'mắt', 'Phần 1', [
  ('눈코 뜰 사이도 없다', 'bận tối mắt tối mũi', '연말이라 {눈코 뜰 사이도 없이} 바쁘다.', 'Cuối năm nên bận tối mắt tối mũi.'),
  ('눈 깜짝할 사이에', 'trong chớp mắt', '케이크가 {눈 깜짝할 사이에} 다 팔렸다.', 'Bánh bán hết trong chớp mắt.'),
  ('눈을 감아 주다', 'nhắm mắt bỏ qua (lỗi)', '이번 한 번만 {눈을 감아 줄게}.', 'Lần này thôi, cô bỏ qua cho.'),
  ('눈 밖에 나다', 'bị mất lòng, bị ghét', '자주 지각해서 사장님 {눈 밖에 났다}.', 'Hay đi muộn nên bị giám đốc ghét.'),
  ('눈이 높다', 'kén chọn, tiêu chuẩn cao', '{눈이 높아서} 아직 결혼을 못 했다.', 'Kén chọn nên vẫn chưa kết hôn.'),
  ('눈에 띄다', 'nổi bật, dễ thấy', '빨간 옷을 입어서 {눈에 띈다}.', 'Mặc áo đỏ nên rất nổi bật.'),
  ('눈길을 끌다', 'thu hút ánh nhìn', '독특한 디자인이 사람들의 {눈길을 끌었다}.', 'Thiết kế độc đáo thu hút mọi người.'),
  ('눈치를 보다', 'nhìn sắc mặt người khác', '신입 사원은 늘 상사의 {눈치를 본다}.', 'Nhân viên mới luôn nhìn sắc mặt cấp trên.')]),
 ('nuan-2', '👀', '눈', 'mắt', 'Phần 2', [
  ('눈치가 빠르다', 'nhanh ý, tinh ý', '그는 {눈치가 빨라서} 말하지 않아도 안다.', 'Anh ấy tinh ý, không nói cũng biết.'),
  ('눈에 밟히다', 'cứ hiện mãi trước mắt (nhớ, lo)', '고향에 두고 온 아이가 {눈에 밟힌다}.', 'Đứa con để lại quê cứ hiện mãi trước mắt.'),
  ('눈을 붙이다', 'chợp mắt', '잠깐 {눈을 붙이고} 다시 공부했다.', 'Chợp mắt một lát rồi học tiếp.'),
  ('눈이 빠지게 기다리다', 'chờ mòn mỏi', '합격 소식을 {눈이 빠지게 기다렸다}.', 'Chờ tin đỗ đến mòn mỏi.'),
  ('눈에 익다', 'quen mắt', '이 거리는 왠지 {눈에 익다}.', 'Con phố này sao trông quen quen.'),
  ('눈을 의심하다', 'không tin vào mắt mình', '성적표를 보고 내 {눈을 의심했다}.', 'Nhìn bảng điểm mà không tin vào mắt mình.'),
  ('눈에 불을 켜다', 'căng mắt săn tìm, rất hăng', '할인 상품을 {눈에 불을 켜고} 찾았다.', 'Căng mắt săn hàng giảm giá.'),
  ('눈을 돌리다', 'chuyển sự chú ý sang', '해외 시장으로 {눈을 돌렸다}.', 'Chuyển hướng sang thị trường nước ngoài.')]),
 ('gwi', '👂', '귀', 'tai', '', [
  ('귀가 얇다', 'cả tin, ai nói gì cũng nghe <i>(tai mỏng)</i>', '{귀가 얇아서} 광고만 보면 산다.', 'Cả tin nên cứ thấy quảng cáo là mua.'),
  ('귀를 기울이다', 'lắng tai nghe', '학생들의 의견에 {귀를 기울여야} 한다.', 'Phải lắng nghe ý kiến học sinh.'),
  ('귀에 못이 박히다', 'nghe đến nhàm tai <i>(đóng đinh vào tai)</i>', '공부하라는 말을 {귀에 못이 박히도록} 들었다.', 'Nghe câu “học đi” đến nhàm tai.'),
  ('귀가 솔깃하다', 'nghe xuôi tai, bị cuốn theo', '돈을 쉽게 번다는 말에 {귀가 솔깃했다}.', 'Nghe nói kiếm tiền dễ là thấy xuôi tai.'),
  ('귀를 의심하다', 'không tin vào tai mình', '합격했다는 말에 {귀를 의심했다}.', 'Nghe báo đỗ mà không tin vào tai mình.'),
  ('귀에 익다', 'quen tai', '이 노래는 {귀에 익다}.', 'Bài hát này nghe quen tai.'),
  ('귓등으로 듣다', 'nghe tai này lọt tai kia', '그는 내 충고를 {귓등으로 들었다}.', 'Anh ấy nghe lời khuyên tai này lọt tai kia.'),
  ('귀가 아프다', 'nghe mãi đến phát chán', '그 이야기는 {귀가 아프게} 들었다.', 'Chuyện đó nghe mãi phát chán rồi.')]),
 ('ip-1', '👄', '입', 'miệng', 'Phần 1', [
  ('입이 무겁다', 'kín miệng <i>(miệng nặng)</i>', '그 친구는 {입이 무거워서} 믿을 수 있다.', 'Bạn ấy kín miệng nên tin được.'),
  ('입이 가볍다', 'hay hớt lẻo <i>(miệng nhẹ)</i>', '{입이 가벼운} 사람에게 비밀을 말하지 마.', 'Đừng kể bí mật cho người hay hớt lẻo.'),
  ('입을 모으다', 'đồng thanh, cùng ý kiến', '전문가들은 {입을 모아} 운동이 중요하다고 했다.', 'Các chuyên gia đồng thanh nói vận động rất quan trọng.'),
  ('입에 맞다', 'hợp khẩu vị', '한국 음식이 {입에 맞아요}?', 'Đồ ăn Hàn có hợp khẩu vị không?'),
  ('입이 짧다', 'kén ăn, ăn ít', '아이가 {입이 짧아서} 걱정이다.', 'Con kén ăn nên lo.'),
  ('입이 귀에 걸리다', 'cười toe toét <i>(miệng treo lên tai)</i>', '선물을 받고 {입이 귀에 걸렸다}.', 'Nhận quà mà cười toe toét.'),
  ('입을 다물다', 'ngậm miệng, im lặng', '그는 그 일에 대해 {입을 다물었다}.', 'Anh ấy im lặng về chuyện đó.'),
  ('입 밖에 내다', 'nói ra ngoài', '이 일은 절대 {입 밖에 내지} 마세요.', 'Tuyệt đối đừng nói chuyện này ra ngoài.')]),
 ('ip-2', '👄', '입 · 말', 'miệng · lời', 'Phần 2', [
  ('입이 벌어지다', 'há hốc mồm (kinh ngạc)', '야경이 너무 아름다워서 {입이 벌어졌다}.', 'Cảnh đêm đẹp quá, há hốc mồm.'),
  ('입에 침이 마르도록', 'khen hết lời <i>(khô cả nước bọt)</i>', '{입에 침이 마르도록} 칭찬했다.', 'Khen hết lời.'),
  ('입만 살다', 'chỉ giỏi nói', '그 사람은 {입만 살았지} 하는 일이 없다.', 'Người đó chỉ giỏi nói, chẳng làm gì.'),
  ('입을 맞추다', 'thống nhất lời nói (khai)', '두 사람은 미리 {입을 맞춘} 것 같았다.', 'Hai người có vẻ đã thống nhất lời trước.'),
  ('입에 달고 다니다', 'nói luôn miệng', '그는 “힘들다”는 말을 {입에 달고 다닌다}.', 'Anh ấy lúc nào cũng kêu “mệt quá”.'),
  ('입에 풀칠하다', 'kiếm đủ ăn qua ngày', '월급으로 겨우 {입에 풀칠한다}.', 'Lương chỉ đủ ăn qua ngày.'),
  ('입이 아프다', 'nói mỏi miệng (mà vô ích)', '{입이 아프게} 말해도 듣지 않는다.', 'Nói mỏi miệng mà không nghe.'),
  ('말꼬리를 잡다', 'bắt bẻ câu chữ', '{말꼬리를 잡지} 말고 내 말을 들어 봐.', 'Đừng bắt bẻ câu chữ, nghe tôi nói đã.')]),
 ('son-1', '✋', '손', 'tay', 'Phần 1', [
  ('손이 크다', 'rộng rãi, làm gì cũng nhiều <i>(tay to)</i>', '어머니는 {손이 커서} 음식을 늘 많이 하신다.', 'Mẹ rộng tay nên lúc nào cũng nấu nhiều.'),
  ('손을 떼다', 'rút tay, thôi không làm', '그는 사업에서 {손을 뗐다}.', 'Anh ấy đã rút khỏi việc kinh doanh.'),
  ('손에 땀을 쥐다', 'hồi hộp <i>(nắm mồ hôi trong tay)</i>', '{손에 땀을 쥐는} 경기였다.', 'Trận đấu hồi hộp nghẹt thở.'),
  ('손이 모자라다', 'thiếu người làm', '주말에는 {손이 모자라서} 아르바이트생을 뽑는다.', 'Cuối tuần thiếu người nên tuyển làm thêm.'),
  ('손에 익다', 'quen tay', '일이 {손에 익으니} 속도가 빨라졌다.', 'Việc quen tay rồi nên nhanh hơn.'),
  ('손을 쓰다', 'ra tay xử lý', '빨리 {손을 쓰지} 않으면 문제가 커진다.', 'Không nhanh xử lý thì vấn đề sẽ lớn.'),
  ('손이 빠르다', 'nhanh tay', '그녀는 {손이 빨라서} 일을 금방 끝낸다.', 'Cô ấy nhanh tay nên xong việc ngay.'),
  ('손꼽아 기다리다', 'đếm từng ngày chờ đợi', '아이들은 방학을 {손꼽아 기다린다}.', 'Bọn trẻ đếm từng ngày chờ nghỉ hè.')]),
 ('son-2', '✋', '손', 'tay', 'Phần 2', [
  ('손발이 맞다', 'ăn ý', '두 사람은 {손발이 잘 맞는다}.', 'Hai người rất ăn ý.'),
  ('손을 놓다', 'buông tay, bỏ dở việc', '걱정이 돼서 일에 {손을 놓고} 있었다.', 'Lo quá nên bỏ dở công việc.'),
  ('손에 잡히지 않다', 'không tập trung làm được', '결과가 궁금해서 일이 {손에 잡히지 않는다}.', 'Mong kết quả nên chẳng làm được việc gì.'),
  ('손을 씻다', 'rửa tay gác kiếm', '그는 나쁜 일에서 {손을 씻었다}.', 'Hắn đã rửa tay gác kiếm.'),
  ('손을 벌리다', 'chìa tay xin (tiền, giúp đỡ)', '부모님께 {손을 벌리고} 싶지 않다.', 'Không muốn xin tiền bố mẹ.'),
  ('손사래를 치다', 'xua tay từ chối', '칭찬을 하자 그는 {손사래를 쳤다}.', 'Được khen, anh ấy xua tay.'),
  ('손을 대다', 'động tay vào, bắt tay làm', '그 일에는 아직 {손도 못 댔다}.', 'Việc đó còn chưa động tay đến.'),
  ('손이 많이 가다', 'tốn nhiều công', '김치는 {손이 많이 가는} 음식이다.', 'Kim chi là món tốn nhiều công.')]),
 ('bal', '🦶', '발', 'chân', '', [
  ('발이 넓다', 'quen biết rộng <i>(chân rộng)</i>', '그는 {발이 넓어서} 모르는 사람이 없다.', 'Anh ấy quen rộng, ai cũng biết.'),
  ('발등에 불이 떨어지다', 'nước đến chân (việc gấp)', '{발등에 불이 떨어져서야} 공부를 시작했다.', 'Nước đến chân mới bắt đầu học.'),
  ('발 벗고 나서다', 'hăng hái xắn tay vào giúp', '마을 사람들이 {발 벗고 나서서} 도왔다.', 'Dân làng hăng hái xắn tay giúp.'),
  ('발을 빼다', 'rút lui, không dính vào nữa', '문제가 생기자 그는 {발을 뺐다}.', 'Có chuyện là anh ta rút lui.'),
  ('발길을 돌리다', 'quay gót', '가게 문이 닫혀 있어서 {발길을 돌렸다}.', 'Cửa hàng đóng cửa nên đành quay về.'),
  ('발목을 잡다', 'níu chân, cản trở', '부상이 그의 {발목을 잡았다}.', 'Chấn thương đã níu chân anh ấy.'),
  ('발을 끊다', 'không lui tới nữa', '그 일 이후로 그 가게에 {발을 끊었다}.', 'Từ đó tôi không đến quán ấy nữa.'),
  ('발을 맞추다', 'bắt nhịp, đi cùng nhịp', '시대의 변화에 {발을 맞춰야} 한다.', 'Phải bắt nhịp với thay đổi của thời đại.')]),
 ('dau-mat', '🙂', '머리 · 얼굴 · 코', 'đầu · mặt · mũi', '', [
  ('머리를 맞대다', 'chụm đầu bàn bạc', '팀원들이 {머리를 맞대고} 방법을 찾았다.', 'Cả nhóm chụm đầu tìm cách.'),
  ('머리를 식히다', 'thư giãn đầu óc', '산책하면서 {머리를 식혔다}.', 'Đi dạo cho đầu óc thư thái.'),
  ('머리를 쥐어짜다', 'vắt óc suy nghĩ', '{머리를 쥐어짜도} 좋은 생각이 안 난다.', 'Vắt óc mà không nghĩ ra gì hay.'),
  ('골치가 아프다', 'đau đầu (vì việc khó)', '이 문제 때문에 {골치가 아프다}.', 'Đau đầu vì vấn đề này.'),
  ('얼굴이 두껍다', 'mặt dày', '{얼굴이 두꺼운} 그는 또 돈을 빌려 달라고 했다.', 'Mặt dày, anh ta lại hỏi vay tiền.'),
  ('얼굴을 붉히다', 'đỏ mặt (vì ngượng, vì to tiếng)', '사소한 일로 {얼굴을 붉히지} 맙시다.', 'Đừng vì chuyện nhỏ mà to tiếng với nhau.'),
  ('콧대가 높다', 'kiêu, chảnh <i>(sống mũi cao)</i>', '그녀는 {콧대가 높아서} 아무나 만나지 않는다.', 'Cô ấy chảnh, không gặp ai bừa.'),
  ('코앞에 닥치다', 'đến sát nút <i>(ngay trước mũi)</i>', '시험이 {코앞에 닥쳤다}.', 'Kỳ thi đã đến sát nút.')]),
 ('long', '💗', '가슴 · 마음', 'ngực · lòng', '', [
  ('가슴이 벅차다', 'lòng trào dâng', '합격 소식에 {가슴이 벅찼다}.', 'Tin đỗ làm lòng trào dâng.'),
  ('가슴이 찡하다', 'xúc động nghẹn ngào', '편지를 읽고 {가슴이 찡했다}.', 'Đọc thư mà nghẹn ngào.'),
  ('가슴을 쓸어내리다', 'thở phào nhẹ nhõm', '아이가 무사하다는 말에 {가슴을 쓸어내렸다}.', 'Nghe con bình an mới thở phào.'),
  ('가슴이 뜨끔하다', 'chột dạ', '거짓말이 들킬까 봐 {가슴이 뜨끔했다}.', 'Sợ lộ chuyện nói dối nên chột dạ.'),
  ('가슴에 새기다', 'khắc ghi trong lòng', '선생님 말씀을 {가슴에 새겼다}.', 'Khắc ghi lời thầy cô dặn.'),
  ('가슴이 내려앉다', 'thót tim, rụng rời', '한밤중 전화벨 소리에 {가슴이 내려앉았다}.', 'Chuông điện thoại lúc nửa đêm làm thót tim.'),
  ('마음을 놓다', 'yên tâm', '이제 {마음을 놓아도} 된다.', 'Giờ có thể yên tâm rồi.'),
  ('마음을 비우다', 'buông bỏ, giữ lòng thanh thản', '{마음을 비우니} 오히려 결과가 좋았다.', 'Không đặt nặng thì kết quả lại tốt.')]),
 ('ruot', '😣', '속 · 애 · 간', 'ruột · gan', '', [
  ('속이 타다', 'lo cháy ruột', '연락이 없어서 {속이 탄다}.', 'Không có tin tức nên lo cháy ruột.'),
  ('속을 썩이다', 'làm (ai) phiền lòng', '사춘기 아들이 부모 {속을 썩인다}.', 'Con trai tuổi dậy thì làm bố mẹ phiền lòng.'),
  ('속이 시원하다', 'hả lòng, nhẹ cả người', '하고 싶은 말을 다 하니 {속이 시원하다}.', 'Nói hết rồi thấy nhẹ cả người.'),
  ('속이 보이다', 'lộ rõ ý đồ', '갑자기 칭찬하는 게 {속이 보인다}.', 'Tự nhiên khen thế là lộ ý đồ.'),
  ('애를 쓰다', 'dồn sức cố gắng', '문제를 해결하려고 {애를 썼다}.', 'Cố hết sức để giải quyết.'),
  ('애를 먹다', 'vất vả, khổ sở', '길을 몰라서 {애를 먹었다}.', 'Không biết đường nên khổ sở.'),
  ('애가 타다', 'sốt ruột', '결과가 늦게 나와서 {애가 탄다}.', 'Kết quả ra muộn nên sốt ruột.'),
  ('간이 떨어지다', 'hú vía <i>(rụng gan)</i>', '뒤에서 갑자기 불러서 {간이 떨어질} 뻔했다.', 'Bị gọi giật sau lưng, suýt hú vía.')]),
 ('vai', '💪', '어깨 · 허리 · 등 · 목', 'vai · lưng · cổ', '', [
  ('어깨가 무겁다', 'trách nhiệm nặng nề', '팀장이 되니 {어깨가 무겁다}.', 'Lên trưởng nhóm thấy trách nhiệm nặng nề.'),
  ('어깨를 으쓱거리다', 'ưỡn ngực tự hào', '1등을 해서 {어깨를 으쓱거렸다}.', 'Được hạng nhất nên ưỡn ngực tự hào.'),
  ('허리띠를 졸라매다', 'thắt lưng buộc bụng', '물가가 올라서 {허리띠를 졸라매야} 한다.', 'Giá cả tăng, phải thắt lưng buộc bụng.'),
  ('등을 돌리다', 'quay lưng', '실망한 팬들이 {등을 돌렸다}.', 'Người hâm mộ thất vọng đã quay lưng.'),
  ('목이 빠지게 기다리다', 'chờ dài cổ', '엄마는 아들을 {목이 빠지게 기다렸다}.', 'Mẹ chờ con dài cả cổ.'),
  ('이를 갈다', 'nghiến răng (hận, quyết tâm)', '지난번 패배 후 {이를 갈며} 연습했다.', 'Sau trận thua, nghiến răng luyện tập.'),
  ('혀를 내두르다', 'lè lưỡi thán phục', '그의 실력에 모두 {혀를 내둘렀다}.', 'Ai cũng thán phục tài anh ấy.'),
  ('혀를 차다', 'tặc lưỡi chê', '할아버지는 뉴스를 보며 {혀를 찼다}.', 'Ông vừa xem thời sự vừa tặc lưỡi.')]),
]
N = len(P) + 2  # bìa + nội dung + ôn tập
HEAD = '''<!doctype html><meta charset=utf-8>
<meta name="robots" content="noindex">
<link rel=stylesheet href="../../quang-cao/topik2-len-3-4/base.css"><link rel=stylesheet href=khung.css>
<div class=frame></div>
<div class=card>
<div class=hd><img src="../../logo/nari-topik-ngang.svg"><div class=zl>Zalo cô Ngân<b>0399 214 554</b></div></div>
'''
def foot(i): return f'''<div class=ft><span>Quán ngữ tiếng Hàn · <b>Nari TOPIK</b></span><span class=pg>{i}/{N}</span><span>Lưu lại để ôn nhé 🔖</span></div>
</div>
<script src="../../quang-cao/wm.js" data-style="tile"></script>
'''
def ex(s): return re.sub(r'\{(.+?)\}', r'<b>\1</b>', html.escape(s))
total = sum(len(p[5]) for p in P)
files = []
# bìa
toc = ''.join(f'<div><span class=e>{e}</span><b>{k}</b><small>{vi}{" · " + ph if ph else ""}</small><i>{i + 2}</i></div>' for i, (_, e, k, vi, ph, _) in enumerate(P))
h = HEAD + f'''<div class=eye>Ôn TOPIK cùng cô Ngân · Bộ sưu tập</div>
<h1 class=cv><b>{total}</b> quán ngữ tiếng Hàn<br>theo <span>bộ phận cơ thể</span></h1>
<div class=lead>관용 표현 · nghĩa · câu ví dụ · bản dịch — dùng cho câu 21 đề đọc và cả bài nghe.</div>
<div class=toc>{toc}<div class=q><span class=e>✍️</span><b>Ôn tập</b><small>8 câu tự kiểm tra</small><i>{N}</i></div></div>
<div class=how><b>Cách học:</b> mỗi ngày 1 ảnh · che cột nghĩa, nhìn quán ngữ đoán nghĩa · tự đặt 1 câu về em.</div>
''' + foot(1)
files.append(('qn-01-bia.html', h))
for i, (slug, e, k, vi, ph, rows) in enumerate(P):
    it = ''.join(f'''<div class=it><span class=n>{j + 1}</span><div><div class=a><b>{html.escape(a)}</b><span class=m>{m}</span></div>
<div class=x><span class=ko>{ex(x)}</span><span class=vi>{html.escape(v)}</span></div></div></div>
''' for j, (a, m, x, v) in enumerate(rows))
    h = HEAD + f'''<div class=eye>Quán ngữ tiếng Hàn · {i + 2}/{N}</div>
<h1 class=k><span class=e>{e}</span><span>{k}<small>{vi}{" · " + ph if ph else ""}</small></span></h1>
<div class=bar></div>
{it}''' + foot(i + 2)
    files.append((f'qn-{i + 2:02d}-{slug}.html', h))
# ôn tập
Q = [('Mai thi rồi mà hôm nay mới bắt đầu học.', '발등에 불이 떨어지다'), ('Bạn ấy giữ bí mật rất tốt.', '입이 무겁다'),
     ('Cứ thấy quảng cáo là tin, mua ngay.', '귀가 얇다'), ('Mẹ nấu cỗ lúc nào cũng làm thật nhiều.', '손이 크다'),
     ('Cuối năm việc nhiều, không có thời gian thở.', '눈코 뜰 사이도 없다'), ('Cả nhóm ngồi lại cùng bàn cách giải quyết.', '머리를 맞대다'),
     ('Lạc đường ở Seoul, vất vả mãi mới tìm được.', '애를 먹다'), ('Vừa lên trưởng phòng, thấy trách nhiệm nặng nề.', '어깨가 무겁다')]
order = [3, 6, 0, 5, 2, 7, 1, 4]  # thứ tự lựa chọn A–H (đã trộn)
L = 'ABCDEFGH'
box = ''.join(f'<div><b>{L[i]}</b>{Q[o][1]}</div>' for i, o in enumerate(order))
qs = ''.join(f'<div class=r><span class=n>{j + 1}</span><span class=t>{s}</span><span class=blank></span></div>' for j, (s, _) in enumerate(Q))
ans = ' · '.join(f'{j + 1}{L[order.index(j)]}' for j in range(len(Q)))
h = HEAD + f'''<div class=eye>Quán ngữ tiếng Hàn · {N}/{N} · Ôn tập</div>
<h1 class=k><span class=e>✍️</span><span>Chọn quán ngữ<small>ghép mỗi tình huống với 1 quán ngữ</small></span></h1>
<div class=box>{box}</div>
<div class=quiz>{qs}</div>
<div class=how>Comment đáp án dạng <b>1A, 2B…</b> · cô chữa ở bình luận 💜</div>
''' + foot(N)
files.append((f'qn-{N:02d}-on-tap.html', h))
for f, h in files:
    open(os.path.join(OUT, f), 'w').write(h)
print(len(files), 'ảnh,', total, 'quán ngữ · đáp án ôn tập:', ans)
