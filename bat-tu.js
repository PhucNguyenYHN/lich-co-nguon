/*
 * bat-tu.js — Bát tự (tứ trụ) của một thời điểm: can chi năm, tháng, ngày, giờ; ngũ hành; nạp âm;
 * thập thần so với nhật chủ.
 * Phụ thuộc: kết quả LichCore.analyze().
 *
 * Bát tự dùng mốc Lập xuân đổi năm (Wikipedia zh 八字; Aslaksen 2010, xem nguon/tuoi.md).
 * Khi ngày nằm giữa Lập xuân và Tết, trụ năm theo Tết hiện thêm ở dạng đối chiếu.
 *
 * Chưa tính: tàng can (can ẩn trong chi; có dị bản giữa các phái), đại vận, dụng thần, cách cục.
 * Thập thần chỉ tính cho can của năm, tháng, giờ so với can ngày (nhật chủ).
 */
(function (root) {
  'use strict';

  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  var STEM_EL = ['Mộc', 'Mộc', 'Hỏa', 'Hỏa', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Thủy', 'Thủy'];
  var BRANCH_EL = ['Thủy', 'Thổ', 'Mộc', 'Mộc', 'Thổ', 'Hỏa', 'Hỏa', 'Thổ', 'Kim', 'Kim', 'Thổ', 'Thủy'];

  function mod(a, n) { return ((a % n) + n) % n; }

  // 30 cặp nạp âm theo thứ tự 60 hoa giáp (Giáp Tý-Ất Sửu là cặp đầu)
  var NAP_AM = ['Hải trung kim', 'Lư trung hỏa', 'Đại lâm mộc', 'Lộ bàng thổ', 'Kiếm phong kim', 'Sơn đầu hỏa',
    'Giản hạ thủy', 'Thành đầu thổ', 'Bạch lạp kim', 'Dương liễu mộc', 'Tuyền trung thủy', 'Ốc thượng thổ',
    'Tích lịch hỏa', 'Tùng bách mộc', 'Trường lưu thủy', 'Sa trung kim', 'Sơn hạ hỏa', 'Bình địa mộc',
    'Bích thượng thổ', 'Kim bạc kim', 'Phú đăng hỏa', 'Thiên hà thủy', 'Đại trạch thổ', 'Thoa xuyến kim',
    'Tang đố mộc', 'Đại khê thủy', 'Sa trung thổ', 'Thiên thượng hỏa', 'Thạch lựu mộc', 'Đại hải thủy'];

  function idx60(stem, branch) {
    for (var n = 0; n < 60; n++) if (n % 10 === stem && n % 12 === branch) return n;
    return -1;
  }
  function napAm(stem, branch) {
    var name = NAP_AM[Math.floor(idx60(stem, branch) / 2)];
    var parts = name.split(' ');
    return { ten: name, hanh: parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1) };
  }

  // Cách tính hành nạp âm theo công thức quen dùng (tổng số can + số chi, chia 5)
  function napAmHanhCongThuc(stem, branch) {
    var s = Math.floor(stem / 2) + 1;                 // Giáp Ất 1 ... Nhâm Quý 5
    var b = [0, 0, 1, 1, 2, 2, 0, 0, 1, 1, 2, 2][branch]; // Tý Sửu Ngọ Mùi 0; Dần Mão Thân Dậu 1; Thìn Tỵ Tuất Hợi 2
    var r = (s + b) % 5;
    return ['Mộc', 'Kim', 'Thủy', 'Hỏa', 'Thổ'][r];
  }
  // Theo Hiệp kỷ q.1: số của can và chi, cộng hai trụ của cặp, chia 5 (金音四九 木音三八 水音五十 火音一六 土音二七)
  var HK_CAN = { 0: 9, 5: 9, 1: 8, 6: 8, 2: 7, 7: 7, 3: 6, 8: 6, 4: 5, 9: 5 };
  var HK_CHI = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];
  function napAmHanhHiepKy(stem, branch) {
    var n60 = idx60(stem, branch), first = n60 - (n60 % 2);
    var s1 = first % 10, b1 = first % 12, s2 = (first + 1) % 10, b2 = (first + 1) % 12;
    var total = HK_CAN[s1] + HK_CHI[b1] + HK_CAN[s2] + HK_CHI[b2];
    return { 4: 'Kim', 3: 'Mộc', 0: 'Thủy', 1: 'Hỏa', 2: 'Thổ' }[total % 5];
  }

  // Thập thần so với nhật chủ (can ngày)
  var SINH = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  var KHAC = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };
  function thapThan(dm, other) {
    var de = STEM_EL[dm], oe = STEM_EL[other], same = (dm % 2) === (other % 2);
    if (de === oe) return same ? 'Tỷ kiên' : 'Kiếp tài';
    if (SINH[de] === oe) return same ? 'Thực thần' : 'Thương quan';
    if (KHAC[de] === oe) return same ? 'Thiên tài' : 'Chính tài';
    if (KHAC[oe] === de) return same ? 'Thất sát' : 'Chính quan';
    return same ? 'Thiên ấn' : 'Chính ấn'; // oe sinh de
  }

  function trụ(ten, p, dm) {
    var na = napAm(p.stem, p.branch);
    return {
      ten: ten, name: p.name, can: CAN[p.stem], chi: CHI[p.branch],
      hanhCan: STEM_EL[p.stem], amDuongCan: p.stem % 2 === 0 ? 'dương' : 'âm', hanhChi: BRANCH_EL[p.branch],
      napAm: na.ten, napAmHanh: na.hanh,
      thapThan: ten === 'Ngày' ? 'Nhật chủ' : thapThan(dm, p.stem)
    };
  }

  function demHanh(list) {
    var c = { 'Kim': 0, 'Mộc': 0, 'Thủy': 0, 'Hỏa': 0, 'Thổ': 0 };
    list.forEach(function (t) { c[t.hanhCan]++; c[t.hanhChi]++; });
    return c;
  }

  function baTu(a, hasHour) {
    var dm = a.dayPillar.stem;
    var yp = a.yearPillar;
    function build(hourPillar) {
      var tr = [trụ('Năm', yp.byLapXuan, dm), trụ('Tháng', a.monthPillar, dm), trụ('Ngày', a.dayPillar, dm)];
      if (hourPillar) tr.push(trụ('Giờ', hourPillar, dm));
      return { tru: tr, demHanh: demHanh(tr), soChu: tr.length * 2 };
    }
    var bien = [];
    if (hasHour) {
      a.hourPillars.forEach(function (h) {
        var b = build(h.pillar); b.ghiChu = h.rule; bien.push(b);
      });
    } else bien.push(build(null));
    return {
      nhatChu: { can: CAN[dm], hanh: STEM_EL[dm], amDuong: dm % 2 === 0 ? 'dương' : 'âm' },
      bien: bien,
      namTheoTet: yp.differ ? yp.byTet.name : null,
      ghiChu: 'Bát tự tính trụ năm theo Lập xuân. ' + (yp.differ ? 'Ngày này nằm giữa Lập xuân và Tết nên trụ năm theo Tết khác: ' + yp.byTet.name + '. ' : '') +
        'Chưa tính tàng can, đại vận, dụng thần.'
    };
  }

  var SOURCES = {
    BATU: {
      ref: 'Wikipedia zh 八字; Aslaksen 2010 (mốc Lập xuân); Hiệp kỷ q.1 (số can chi để tính hành nạp âm)', kind: 'thứ cấp + văn bản gốc',
      verified: 'Hành của nạp âm khớp công thức Hiệp kỷ q.1 và công thức quen dùng cho cả 60 trụ (kiểm bằng code). Tên 30 nạp âm gõ theo bảng quen dùng, chưa đối chiếu văn bản. Thập thần suy từ ngũ hành và âm dương.',
      note: 'Nhiều nguồn dùng tàng can; có dị bản giữa các phái (ví dụ chi Tý chỉ chứa Quý, hay chứa Nhâm và Quý), nên chưa tính.'
    }
  };

  var api = {
    SOURCES: SOURCES, CAN: CAN, CHI: CHI, NAP_AM: NAP_AM, STEM_EL: STEM_EL, BRANCH_EL: BRANCH_EL,
    napAm: napAm, napAmHanhCongThuc: napAmHanhCongThuc, napAmHanhHiepKy: napAmHanhHiepKy, thapThan: thapThan, baTu: baTu
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BatTu = api;
})(typeof self !== 'undefined' ? self : this);
