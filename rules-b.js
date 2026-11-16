/*
 * rules-b.js — Lớp quy tắc bậc B (có hệ thống lý luận, có văn bản gốc).
 * Phụ thuộc: kết quả của LichCore.analyze() (lich-core.js).
 *
 * Nguyên tắc: không chọn trường phái thay người dùng.
 *  - Ngày giao tiết: trả cả hai cách hiểu về Trực và Hoàng đạo.
 *  - Năm: trả cho cả hai mốc (Lập xuân / Tết) khi hai mốc khác nhau.
 *  - Mỗi kết quả gắn `sources` (mã nguồn) và `verification`, tra trong RulesB.SOURCES.
 *
 * Gồm: 12 Trực, Hoàng đạo/Hắc đạo (ngày và giờ), Tuế phá/Nguyệt phá, Thái tuế/Tam sát (phương),
 * quan hệ địa chi (lục xung, lục hợp, tam hợp, hình, hại).
 * Chưa có: 28 sao (chưa tìm thấy nguồn cho bảng khởi và việc kiêng), Bát trạch, Huyền không.
 */
(function (root) {
  'use strict';

  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  function mod(a, n) { return ((a % n) + n) % n; }

  // ---------- Nguồn ----------
  // verified: 'gốc' = đã đối chiếu văn bản thô Wikisource (action=raw), không qua tóm tắt.
  var SOURCES = {
    HK4: {
      book: '欽定協紀辨方書 (四庫全書本)', volume: 4, section: '建除十二神',
      verified: 'gốc',
      quotes: [
        '其法從月建上起建與斗杓所指相應如正月建寅則寅日起建順行十二辰是也',
        '每月交節則疊兩值日',
        '除危定執成開為吉建破平收滿閉為凶 (考原曰)'
      ],
      note: 'Quy tắc khởi từ chi tháng; ngày giao tiết lặp hai ngày liền cùng một Trực. Sách không nói rõ ngày giao tiết lặp theo ngày trước hay ngày mới.'
    },
    HK7: {
      book: '欽定協紀辨方書 (四庫全書本)', volume: 7, section: '黃道黑道',
      verified: 'gốc',
      quotes: [
        '一青龍二明堂三天刑四朱雀五金匱六天德七白虎八玉堂九天牢十元武十一司命十二勾陳 (考原曰)',
        '寅申青龍起子卯酉起寅辰戌起辰巳亥起午子午起申丑未起戌順行十二辰',
        '月起日則建寅之月子日為青龍丑日為明堂日起時則子日申時起青龍酉時為明堂',
        '黑道之説葢不見經傳 / 存而弗論 (phần Án của chính Hiệp kỷ)'
      ],
      note: 'Hiệp kỷ chép bảng khởi nhưng tự nhận thuyết hoàng/hắc đạo không có căn cứ trong kinh truyện, giữ lại mà không bàn.'
    },
    HK3: {
      book: '欽定協紀辨方書 (四庫全書本)', volume: 3, section: '劫煞/災煞/歲煞, 歲破',
      verified: 'gốc',
      quotes: [
        '災煞歲煞是為三煞',
        '申子辰年合水局水絶於巳故劫煞在巳, 胎於午故災煞在午; 巳酉丑年劫煞在寅災煞在夘 (洞源經, 曹氏)',
        '申子辰年三煞在巳午未伏兵大禍則在丙丁是也餘倣此',
        '歲破者太歲所衝之辰也其地不可興造移徙嫁娶逺行 (廣聖厯)'
      ],
      note: 'Tam sát = Kiếp sát + Tai sát + Tuế sát, ba chi liên tiếp. Sách cũng nêu cách giải thích khác (Tam sát là phương xung với tam hợp đang vượng).'
    },
    HK8: {
      book: '欽定協紀辨方書 (四庫全書本)', volume: 8, section: 'phần Án về 坐煞向煞',
      verified: 'gốc',
      quotes: ['按選擇宗鏡曰太嵗可坐不可向三煞可向不可坐'],
      note: 'Câu này do Hiệp kỷ trích từ 選擇宗鏡 (không phải lời riêng của Hiệp kỷ). Chưa tìm thấy câu 占山/占方 mà agent thu thập đã báo; không dùng.'
    },
    DIACHI: {
      book: 'Quan hệ địa chi (lục xung, lục hợp, tam hợp, hình, hại)',
      verified: 'chưa đối chiếu văn bản',
      note: 'Quy ước chuẩn của hệ địa chi. Chưa trích từ sách cụ thể.'
    }
  };

  // ---------- 12 Trực ----------
  var TRUC = [
    { vi: 'Kiến', han: '建' }, { vi: 'Trừ', han: '除' }, { vi: 'Mãn', han: '滿' }, { vi: 'Bình', han: '平' },
    { vi: 'Định', han: '定' }, { vi: 'Chấp', han: '執' }, { vi: 'Phá', han: '破' }, { vi: 'Nguy', han: '危' },
    { vi: 'Thành', han: '成' }, { vi: 'Thu', han: '收' }, { vi: 'Khai', han: '開' }, { vi: 'Bế', han: '閉' }
  ];
  // 考原曰: 除危定執成開為吉, 建破平收滿閉為凶
  var TRUC_CAT = ['hung', 'cát', 'hung', 'hung', 'cát', 'cát', 'hung', 'cát', 'cát', 'hung', 'cát', 'hung'];

  function trucOf(dayBranch, monthBranch) {
    var i = mod(dayBranch - monthBranch, 12); // ngày trùng chi tháng là Kiến
    return { index: i, vi: TRUC[i].vi, han: TRUC[i].han, loai: TRUC_CAT[i] };
  }

  // ---------- 12 thần Hoàng đạo / Hắc đạo ----------
  var THAN = [
    { vi: 'Thanh Long', han: '青龍', hoang: true }, { vi: 'Minh Đường', han: '明堂', hoang: true },
    { vi: 'Thiên Hình', han: '天刑', hoang: false }, { vi: 'Chu Tước', han: '朱雀', hoang: false },
    { vi: 'Kim Quỹ', han: '金匱', hoang: true }, { vi: 'Thiên Đức', han: '天德', hoang: true },
    { vi: 'Bạch Hổ', han: '白虎', hoang: false }, { vi: 'Ngọc Đường', han: '玉堂', hoang: true },
    { vi: 'Thiên Lao', han: '天牢', hoang: false }, { vi: 'Huyền Vũ', han: '玄武 (sách chép 元武)', hoang: false },
    { vi: 'Tư Mệnh', han: '司命', hoang: true }, { vi: 'Câu Trần', han: '勾陳', hoang: false }
  ];

  // Chi khởi Thanh Long: Dần/Thân→Tý, Mão/Dậu→Dần, Thìn/Tuất→Thìn, Tỵ/Hợi→Ngọ, Tý/Ngọ→Thân, Sửu/Mùi→Tuất
  function thanhLongStart(branch) { return mod((mod(branch, 6) - 2) * 2, 12); }

  function thanOf(branch, startKey) {
    var i = mod(branch - thanhLongStart(startKey), 12);
    var t = THAN[i];
    return { index: i, vi: t.vi, han: t.han, loai: t.hoang ? 'hoàng đạo' : 'hắc đạo' };
  }

  function hourRange(b) {
    var s = mod(2 * b - 1, 24), e = mod(2 * b + 1, 24);
    return (s < 10 ? '0' : '') + s + 'h-' + (e < 10 ? '0' : '') + e + 'h';
  }

  // Giờ hoàng đạo: cùng bảng khởi, khóa là chi của ngày (HK7: "日起時")
  function gioHoangDao(dayBranch) {
    var out = [];
    for (var b = 0; b < 12; b++) {
      var t = thanOf(b, dayBranch);
      out.push({ chi: CHI[b], khoang: hourRange(b), than: t.vi, han: t.han, loai: t.loai });
    }
    return out;
  }

  // ---------- Quan hệ địa chi ----------
  var LUC_HOP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  var TAM_HOP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]]; // Thân-Tý-Thìn, Hợi-Mão-Mùi, Dần-Ngọ-Tuất, Tỵ-Dậu-Sửu
  var LUC_HAI = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
  var HINH = [[2, 5], [5, 8], [8, 2], [1, 10], [10, 7], [7, 1], [0, 3], [3, 0]]; // a hình b
  var TU_HINH = [4, 6, 9, 11];

  function inPair(list, a, b) {
    for (var i = 0; i < list.length; i++) {
      if ((list[i][0] === a && list[i][1] === b) || (list[i][0] === b && list[i][1] === a)) return true;
    }
    return false;
  }

  function relations(a, b) {
    var r = [];
    if (mod(a - b, 12) === 6) r.push('lục xung');
    if (inPair(LUC_HOP, a, b)) r.push('lục hợp');
    for (var i = 0; i < TAM_HOP.length; i++) {
      if (a !== b && TAM_HOP[i].indexOf(a) >= 0 && TAM_HOP[i].indexOf(b) >= 0) r.push('tam hợp');
    }
    if (inPair(LUC_HAI, a, b)) r.push('tương hại');
    for (var j = 0; j < HINH.length; j++) {
      if (HINH[j][0] === a && HINH[j][1] === b) { r.push('tương hình'); break; }
    }
    if (a === b && TU_HINH.indexOf(a) >= 0) r.push('tự hình');
    return r;
  }

  // ---------- Phương vị theo năm: Thái tuế, Tuế phá, Tam sát ----------
  var COMPASS12 = ['Bắc', 'Đông Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây Nam', 'Tây', 'Tây Bắc', 'Tây Bắc'];

  // Chi khởi Kiếp sát theo nhóm tam hợp của năm (HK3: 申子辰→巳, 巳酉丑→寅; các nhóm khác suy theo cùng quy luật
  // tuyệt/thai của ngũ hành tam hợp: 寅午戌→亥, 亥卯未→申). Ba chi liên tiếp: Kiếp, Tai, Tuế.
  function kiepSatStart(yearBranch) {
    var g = mod(yearBranch, 4); // 0: Tý,Thìn,Thân; 1: Sửu,Tỵ,Dậu; 2: Dần,Ngọ,Tuất; 3: Mão,Mùi,Hợi
    return [5, 2, 11, 8][g];    // Tỵ, Dần, Hợi, Thân
  }

  function huongNam(yearBranch) {
    var k = kiepSatStart(yearBranch);
    var sat = [k, mod(k + 1, 12), mod(k + 2, 12)];
    var tp = mod(yearBranch + 6, 12);
    return {
      thaiTue: { chi: CHI[yearBranch], huong: COMPASS12[yearBranch], ghiChu: 'Thái tuế "có thể tọa, không thể hướng" (選擇宗鏡, Hiệp kỷ q.8 trích)' },
      tuePha: { chi: CHI[tp], huong: COMPASS12[tp], ghiChu: 'Phương xung với Thái tuế; sách xếp là hung nhất (HK3)' },
      tamSat: {
        chi: [CHI[sat[0]], CHI[sat[1]], CHI[sat[2]]],
        ten: ['Kiếp sát', 'Tai sát', 'Tuế sát'],
        huong: COMPASS12[sat[1]],
        ghiChu: 'Tam sát "có thể hướng, không thể tọa" (選擇宗鏡, Hiệp kỷ q.8 trích). Nguồn khác nhau về phạm vi kiêng: xem nguon/nha-cua.md.'
      },
      sources: ['HK3', 'HK8'],
      verification: 'Nhóm Thân-Tý-Thìn và Tỵ-Dậu-Sửu: có câu/bảng trong HK3. Hai nhóm Dần-Ngọ-Tuất và Hợi-Mão-Mùi: suy theo cùng quy luật, khớp phần mô tả Tuế sát, chưa thấy câu liệt kê trực tiếp.'
    };
  }

  // ---------- Hàm tổng ----------
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function monthOptions(a) {
    var tt = a.tietToday;
    if (tt && tt.length) {
      var t = tt[0];
      var nb = mod(2 + t.index / 2, 12), ob = mod(nb - 1, 12);
      var when = t.name + ' lúc ' + pad2(t.local.hour) + ':' + pad2(t.local.minute);
      return {
        tietDay: true,
        options: [
          { branch: nb, rule: 'cả ngày thuộc tháng mới (ngày có giao tiết ' + when + ')' },
          { branch: ob, rule: 'cả ngày thuộc tháng cũ (ngày có giao tiết ' + when + ')' }
        ]
      };
    }
    return { tietDay: false, options: [{ branch: a.monthPillar.branch, rule: '' }] };
  }

  // a: kết quả LichCore.analyze(...)
  function evaluate(a) {
    var dayB = a.dayPillar.branch;
    var mo = monthOptions(a);

    var truc = [], hoang = [], nguyetPha = [];
    for (var i = 0; i < mo.options.length; i++) {
      var o = mo.options[i];
      var tr = trucOf(dayB, o.branch);
      truc.push({ rule: o.rule, thang: CHI[o.branch], truc: tr });
      hoang.push({ rule: o.rule, thang: CHI[o.branch], than: thanOf(dayB, o.branch) });
      nguyetPha.push({ rule: o.rule, thang: CHI[o.branch], phaThang: mod(dayB - o.branch, 12) === 6 });
    }

    // Năm theo từng mốc; nếu hai mốc trùng nhau thì chỉ một mục
    var years = [];
    var yp = a.yearPillar;
    years.push({ moc: yp.differ ? 'Lập xuân' : 'Lập xuân và Tết (trùng nhau)', pillar: yp.byLapXuan });
    if (yp.differ) years.push({ moc: 'Tết', pillar: yp.byTet });

    var nam = years.map(function (y) {
      var d = huongNam(y.pillar.branch);
      return {
        moc: y.moc, nam: y.pillar.name,
        phuongVi: d,
        ngayPhaNam: mod(dayB - y.pillar.branch, 12) === 6 // chi ngày xung chi năm (Tuế phá ngày)
      };
    });

    return {
      tietDay: mo.tietDay,
      truc: truc,
      hoangDao: hoang,
      gioHoangDao: gioHoangDao(dayB),
      nguyetPha: nguyetPha,
      nam: nam,
      sources: {
        truc: ['HK4'], hoangDao: ['HK7'], gioHoangDao: ['HK7'], phuongViNam: ['HK3', 'HK8'], quanHeDiaChi: ['DIACHI']
      },
      canhBao: {
        hoangDao: 'Chính Hiệp kỷ coi thuyết Hoàng đạo/Hắc đạo là "giữ lại mà không bàn", không có căn cứ trong kinh truyện.',
        truc: mo.tietDay ? 'Ngày có giao tiết: sách chỉ nói "lặp hai ngày", không nói lặp theo ngày trước hay ngày mới, nên hiện cả hai.' : ''
      }
    };
  }

  var api = {
    SOURCES: SOURCES, CHI: CHI, TRUC: TRUC, THAN: THAN,
    trucOf: trucOf, thanOf: thanOf, thanhLongStart: thanhLongStart,
    gioHoangDao: gioHoangDao, relations: relations, huongNam: huongNam,
    evaluate: evaluate
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RulesB = api;
})(typeof self !== 'undefined' ? self : this);
