/*
 * viec.js — Việc nên làm / nên tránh theo 12 Trực, từ Hiệp kỷ quyển 10 (宜忌).
 * Dữ liệu chữ Hán lấy tự động vào viec-data.js; tệp này chỉ tách từng việc và dịch.
 *
 * PHẠM VI, nói rõ:
 *  - Đây là danh sách GỐC của từng Trực. Hiệp kỷ còn một lớp ngoại lệ: theo THÁNG và theo các sao
 *    (Thiên đức, Nguyệt đức, Thiên xá, Tam sát tháng, Nguyệt hình, Nguyệt hại, Nguyệt yếm...) mà một
 *    ngày trùng với. Lớp đó CHƯA được tính tự động. Điều kiện ngoại lệ được trả kèm nguyên văn.
 *  - Bản dịch tiếng Việt của từng việc là cách hiểu của người làm app, chưa được ai hiệu đính.
 */
(function (root) {
  'use strict';
  var DATA = (typeof module !== 'undefined' && module.exports) ? require('./viec-data.js') : root.VIEC_DATA;

  var NHOM = {
    te: 'Tế lễ', cuoi: 'Cưới hỏi', nha: 'Nhà cửa, xây dựng', kd: 'Kinh doanh, may mặc', sk: 'Sức khỏe, chăm sóc bản thân',
    hoc: 'Học tập', nong: 'Nông nghiệp, săn bắt', tang: 'An táng', xh: 'Giao tiếp, tiệc tùng', quan: 'Việc quan, triều chính, quân sự (ít dùng)'
  };

  // [các dạng chữ Hán, tiếng Việt, nhóm]
  var LEX = [
    [['祭祀'], 'Cúng tế', 'te'], [['祈福'], 'Cầu phúc', 'te'], [['求嗣'], 'Cầu con', 'te'],
    [['結婚姻'], 'Kết hôn', 'cuoi'], [['納采問名'], 'Ăn hỏi (nạp thái, vấn danh)', 'cuoi'], [['嫁娶'], 'Cưới gả', 'cuoi'],
    [['營建宮室', '營建宫室'], 'Xây dựng nhà lớn', 'nha'], [['修宮室', '修宫室'], 'Sửa nhà', 'nha'], [['繕城郭'], 'Tu sửa thành quách', 'nha'],
    [['興造動土'], 'Khởi công, động thổ', 'nha'], [['豎柱上梁'], 'Dựng cột, lên đòn nóc', 'nha'], [['修倉庫'], 'Sửa kho', 'nha'],
    [['開倉庫出貨財'], 'Mở kho, xuất của', 'nha'], [['修置產室'], 'Sửa hoặc đặt buồng sinh', 'nha'], [['開渠穿井'], 'Đào mương, đào giếng', 'nha'],
    [['安碓磑'], 'Đặt cối giã, cối xay', 'nha'], [['補垣塞穴', '補垣'], 'Vá tường, lấp lỗ', 'nha'], [['修飾垣墻'], 'Sửa sang tường rào', 'nha'],
    [['平治道塗'], 'San đường, sửa lối đi', 'nha'], [['破屋壞垣'], 'Phá nhà, tháo tường', 'nha'], [['築隄防'], 'Đắp đê, đắp bờ', 'nha'],
    [['掃舍宇'], 'Quét dọn nhà cửa', 'nha'], [['安牀'], 'Kê giường', 'nha'], [['般移'], 'Dọn nhà, chuyển chỗ ở', 'nha'], [['進人口'], 'Nhận người vào nhà', 'nha'],
    [['開市'], 'Khai trương', 'kd'], [['立劵交易'], 'Lập khế ước, giao dịch', 'kd'], [['納財'], 'Thu nhận tiền của', 'kd'],
    [['經絡'], 'Dệt, chăng tơ', 'kd'], [['醞釀'], 'Ủ rượu, ủ men', 'kd'], [['鼓鑄'], 'Đúc đồ kim loại', 'kd'], [['裁製'], 'May cắt quần áo', 'kd'],
    [['解除'], 'Cúng giải trừ', 'sk'], [['沐浴'], 'Tắm gội', 'sk'], [['整容剃頭'], 'Chỉnh trang, cắt tóc', 'sk'], [['整手足甲'], 'Cắt móng tay chân', 'sk'],
    [['求醫療病'], 'Chữa bệnh', 'sk'], [['求醫療目'], 'Chữa bệnh (bản chép là "療目")', 'sk'], [['冠帶'], 'Lễ đội mũ, thắt đai (trưởng thành)', 'sk'],
    [['入學'], 'Nhập học', 'hoc'],
    [['栽種'], 'Trồng trọt', 'nong'], [['牧養'], 'Chăn nuôi', 'nong'], [['納畜'], 'Nhập gia súc', 'nong'], [['伐木'], 'Đốn cây', 'nong'],
    [['畋獵'], 'Đi săn', 'nong'], [['取魚'], 'Đánh cá', 'nong'], [['捕捉', '補捉'], 'Bắt bắt (săn bắt)', 'nong'],
    [['破土'], 'Phá thổ (đào huyệt)', 'tang'], [['安葬'], 'An táng', 'tang'], [['啟攢', '啓攢'], 'Dời quan, cải táng', 'tang'],
    [['宴㑹', '宴會'], 'Yến tiệc, họp mặt', 'xh'], [['慶賜賞賀'], 'Thưởng và chúc mừng', 'xh'],
    [['上冊', '上册'], 'Dâng sách phong', 'quan'], [['進表章'], 'Dâng biểu chương', 'quan'], [['頒詔'], 'Ban chiếu', 'quan'],
    [['覃恩'], 'Ban ơn rộng', 'quan'], [['肆赦'], 'Ân xá', 'quan'], [['施恩惠'], 'Ban ơn huệ', 'quan'], [['施恩'], 'Ban ơn', 'quan'],
    [['封拜'], 'Phong chức', 'quan'], [['詔命公卿'], 'Ban mệnh cho quan lớn', 'quan'], [['招賢'], 'Chiêu mộ người hiền', 'quan'],
    [['舉正直'], 'Cử người ngay thẳng', 'quan'], [['恤孤惸'], 'Cứu giúp người cô độc', 'quan'], [['宣布政事', '宣政事'], 'Ban bố chính sự', 'quan'],
    [['行惠愛'], 'Thi hành ân huệ', 'quan'], [['雪寃枉'], 'Giải oan', 'quan'], [['緩刑獄'], 'Giảm nhẹ hình ngục', 'quan'],
    [['行幸'], 'Vua đi tuần', 'quan'], [['遣使'], 'Sai sứ', 'quan'], [['安撫邊境'], 'Vỗ yên biên cương', 'quan'],
    [['選將訓兵'], 'Chọn tướng, luyện binh', 'quan'], [['出師'], 'Xuất quân', 'quan'], [['上官赴任'], 'Nhậm chức', 'quan'], [['臨政親民'], 'Cai quản dân', 'quan']
  ];

  var FORMS = [];
  LEX.forEach(function (e) { e[0].forEach(function (f) { FORMS.push({ han: f, vi: e[1], nhom: e[2] }); }); });
  FORMS.sort(function (a, b) { return b.han.length - a.han.length; });

  // Tách chuỗi Hán liền thành các việc (so khớp dài nhất trước). Trả về {items, conLai}: conLai là chữ chưa nhận ra.
  function tokenize(s) {
    var items = [], rest = '', i = 0;
    while (i < s.length) {
      var hit = null;
      for (var k = 0; k < FORMS.length; k++) {
        if (s.substr(i, FORMS[k].han.length) === FORMS[k].han) { hit = FORMS[k]; break; }
      }
      if (hit) { items.push({ han: hit.han, vi: hit.vi, nhom: hit.nhom }); i += hit.han.length; }
      else { rest += s.charAt(i); i++; }
    }
    // bỏ trùng theo tên Việt
    var seen = {}, out = [];
    items.forEach(function (it) { if (!seen[it.vi]) { seen[it.vi] = 1; out.push(it); } });
    return { items: out, conLai: rest };
  }

  var TRUC_VI = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];

  var SOURCES = {
    HK10: {
      book: '欽定協紀辨方書 (四庫全書本)', volume: 10, section: '宜忌 (建日, 除日, 滿日, 平日, 定日, 執日, 破日, 危日, 成日, 收日, 開日, 閉日; 月建, 月破, 平日, 收日, 滿日, 閉日)',
      verified: 'gốc, trích tự động theo số dòng; bản số hóa chưa hiệu đính với bản quét',
      quotes: [
        '舊厯宜忌多與神煞名義不合且凡吉神所宜之事一遇凶煞則無論輕重而概忌之尤為未當 (đầu quyển 10)',
        '青龍明堂金匱寶光玉堂司命 與吉神併則從所宜與凶神併則從所忌 ... 六黃道以位置得宜為吉 ... 今選時之法謂諸事皆宜而無專宜之事六黑道亦無專忌之事當以時例為斷',
        '其上吉足勝凶從宜不從忌 ... 最下凶叠大凶遇德仍諸事皆忌 (phép chia sáu bậc, phần 按 của mục 平日)'
      ],
      note: 'Sách chấm ngày theo cân bằng giữa sao tốt và sao xấu, chia sáu bậc; không dùng quy tắc "gặp sao xấu là kỵ hết" của lịch cũ. App áp lớp ngoại lệ theo tháng và sao đức cho sáu Trực có điều kiện trong sách (Kiến, Mãn, Bình, Phá, Thu, Bế); chỗ sách bảo tính theo sao khác (Nguyệt Hình, Nguyệt Yếm, Nguyệt Sát, Kiếp Sát, Tai Sát) thì app chưa kết luận và nói rõ.'
    }
  };

  // Quan điểm về Hoàng đạo/Hắc đạo trong chính sách
  var HOANG_HAC = {
    hiepKy: 'Hiệp kỷ (q.10): sáu Hoàng đạo "諸事皆宜而無專宜之事", sáu Hắc đạo "亦無專忌之事", việc cụ thể phải xét theo thời và các sao khác. Hoàng đạo gặp sao tốt thì theo điều nên, gặp sao xấu thì theo điều kỵ.',
    lichThu: 'Lịch thư mà Hiệp kỷ trích (q.7): ngày Hoàng đạo "皆宜興衆務不避太嵗將軍月刑一切凶惡自然避之"; ngày Hắc đạo "皆不可興土功營屋舍移徙遠行嫁娶出軍". Hiệp kỷ không đồng ý quan điểm tuyệt đối này.',
    nguon: ['HK7', 'HK10']
  };

  function labelsOf(h) {
    var t = tokenize(h);
    return t;
  }

  // trucIndex: 0 = Kiến ... 11 = Bế
  function theoTruc(trucIndex) {
    var d = DATA[trucIndex];
    var nen = tokenize(d.yi), tranh = tokenize(d.ji), khongKy = tokenize(d.khongKy);
    var conLai = nen.conLai + tranh.conLai + khongKy.conLai;
    return {
      truc: TRUC_VI[trucIndex],
      nen: nen.items, tranh: tranh.items, khongKy: khongKy.items,
      chuaNhanRa: conLai,
      yiThem: d.yiThem, jiThem: d.jiThem, dieuKien: d.dieuKien, an: d.an,
      coNgoaiLe: d.dieuKien.length > 0,
      ghiChu: d.ji === '' ? 'Hiệp kỷ không ghi việc kỵ riêng cho Trực này.' : ''
    };
  }

  var api = {
    NHOM: NHOM, SOURCES: SOURCES, HOANG_HAC: HOANG_HAC, DATA: DATA,
    tokenize: tokenize, theoTruc: theoTruc, labelsOf: labelsOf, TRUC_VI: TRUC_VI
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Viec = api;
})(typeof self !== 'undefined' ? self : this);
