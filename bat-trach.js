/*
 * bat-trach.js — Bát trạch: cung phi, Đông/Tây tứ mệnh, 8 hướng, trạch quái, hướng ngồi bàn làm việc.
 * Phụ thuộc: LichCore.analyze() (cho số năm theo hai mốc).
 *
 * Cảnh báo về nguồn: chưa đọc được văn bản gốc (Bát trạch minh cảnh, Dương trạch tam yếu).
 * Mọi nguồn dưới đây là thứ cấp. Xem BatTrach.SOURCES. App phải ghi "theo cách thuật lại của...".
 *
 * Không chọn thay người dùng:
 *  - Năm sinh: trả theo cả hai mốc (Lập xuân / Tết) khi khác nhau.
 *  - Trạch quái: trả cả hai cách (theo tọa nhà, theo hướng cửa chính).
 *  - Hướng ngồi: trả cả hai cách hiểu (mặt nhìn về / lưng tựa vào).
 */
(function (root) {
  'use strict';

  function mod(a, n) { return ((a % n) + n) % n; }

  var SOURCES = {
    CUNGPHI_A: {
      ref: 'wiki.batdongsan.com.vn/wiki/cung-phi-la-gi-768289', kind: 'thứ cấp (thương mại)', verified: 'đã đọc',
      note: 'Trước 2000: nam 10 - a, nữ 5 + a (a = tổng hai số cuối, rút gọn). Từ 2000: nam 9 - a, nữ 6 + a. Số 5: nam Khôn, nữ Cấn. Không nêu mốc năm.'
    },
    CUNGPHI_C: {
      ref: 'fengshuied.com/?p=23', kind: 'thứ cấp (thương mại, tiếng Anh)', verified: 'đã đọc',
      note: 'Nam 11 - tổng, nữ 4 + tổng (tổng toàn bộ chữ số rút gọn). Số 5: nam thành 2 (Khôn), nữ thành 8 (Cấn). Không nêu mốc năm.'
    },
    MOCNAM: {
      ref: 'fengshui4134.blogspot.com (2024/02)', kind: 'thứ cấp (blog)', verified: 'đã đọc; bài tự mâu thuẫn ở số 5',
      note: 'Dùng năm tính từ đầu năm Trung Quốc (Lập xuân). Các nguồn Việt đã đọc không nêu mốc.'
    },
    TAMHUONG: {
      ref: 'masterseanchan.com (bảng Kua 6) và suy ra từ biến hào', kind: 'thứ cấp + suy luận', verified: 'chỉ nhóm Càn có bảng nguồn; 7 nhóm còn lại do suy ra',
      note: 'Bảng 8 hướng suy từ biến hào của quẻ, khớp bảng Càn trên nguồn. Chưa đối chiếu bảng của bảy quẻ còn lại với một cuốn sách. Cần đối chiếu.'
    },
    TRACHQUAI: {
      ref: 'nguon/nha-cua.md (jendow.com.tw, fengshuitoday.com, các bài Việt)', kind: 'thứ cấp', verified: 'chỉ thấy các phái; văn bản gốc chưa đọc',
      note: 'Có phái lấy tọa nhà làm quái; có phái lấy hướng cửa chính (khí khẩu). Văn bản gốc chưa tìm thấy.'
    },
    MUCDICH: {
      ref: 'masterseanchan.com (Kua 6)', kind: 'thứ cấp', verified: 'một nguồn',
      note: 'Gán mục tiêu cho từng hướng tốt (Sinh khí: tài lộc/sự nghiệp, Thiên y: sức khỏe, Diên niên: quan hệ, Phục vị: ổn định) là quy ước của từng phái, không phải suy ra được.'
    }
  };

  // ---------- Bát quái ----------
  // lines: [hào 1 (dưới), hào 2, hào 3 (trên)], 1 = dương, 0 = âm. Số theo Lạc thư.
  var QUAI = {
    1: { ten: 'Khảm', huong: 'Bắc', lines: [0, 1, 0], nhom: 'Đông' },
    2: { ten: 'Khôn', huong: 'Tây Nam', lines: [0, 0, 0], nhom: 'Tây' },
    3: { ten: 'Chấn', huong: 'Đông', lines: [1, 0, 0], nhom: 'Đông' },
    4: { ten: 'Tốn', huong: 'Đông Nam', lines: [0, 1, 1], nhom: 'Đông' },
    6: { ten: 'Càn', huong: 'Tây Bắc', lines: [1, 1, 1], nhom: 'Tây' },
    7: { ten: 'Đoài', huong: 'Tây', lines: [1, 1, 0], nhom: 'Tây' },
    8: { ten: 'Cấn', huong: 'Đông Bắc', lines: [0, 0, 1], nhom: 'Tây' },
    9: { ten: 'Ly', huong: 'Nam', lines: [1, 0, 1], nhom: 'Đông' }
  };
  var HUONG_TO_QUAI = {};
  Object.keys(QUAI).forEach(function (k) { HUONG_TO_QUAI[QUAI[k].huong] = +k; });
  var OPPOSITE = { 'Bắc': 'Nam', 'Nam': 'Bắc', 'Đông': 'Tây', 'Tây': 'Đông', 'Đông Bắc': 'Tây Nam', 'Tây Nam': 'Đông Bắc', 'Đông Nam': 'Tây Bắc', 'Tây Bắc': 'Đông Nam' };

  function quaiFromLines(l) {
    for (var k in QUAI) {
      var q = QUAI[k].lines;
      if (q[0] === l[0] && q[1] === l[1] && q[2] === l[2]) return +k;
    }
    return null;
  }

  // Biến hào (mặt nạ đổi hào [dưới, giữa, trên]) cho từng loại du niên
  var DU_NIEN = [
    { ten: 'Sinh khí', loai: 'cát', mask: [0, 0, 1] },
    { ten: 'Thiên y', loai: 'cát', mask: [1, 1, 0] },
    { ten: 'Diên niên', loai: 'cát', mask: [1, 1, 1] },
    { ten: 'Phục vị', loai: 'cát', mask: [0, 0, 0] },
    { ten: 'Họa hại', loai: 'hung', mask: [1, 0, 0] },
    { ten: 'Ngũ quỷ', loai: 'hung', mask: [0, 1, 1] },
    { ten: 'Lục sát', loai: 'hung', mask: [1, 0, 1] },
    { ten: 'Tuyệt mệnh', loai: 'hung', mask: [0, 1, 0] }
  ];

  // Tám hướng của một quái (số 1-9, không gồm 5)
  function tamHuong(quaiNum) {
    var base = QUAI[quaiNum].lines;
    return DU_NIEN.map(function (d) {
      var l = [base[0] ^ d.mask[0], base[1] ^ d.mask[1], base[2] ^ d.mask[2]];
      var q = quaiFromLines(l);
      return { ten: d.ten, loai: d.loai, quai: QUAI[q].ten, huong: QUAI[q].huong };
    });
  }

  // ---------- Cung phi ----------
  function reduceDigits(n) {
    while (n > 9) {
      var s = 0, t = String(n);
      for (var i = 0; i < t.length; i++) s += +t.charAt(i);
      n = s;
    }
    return n;
  }
  function norm9(n) { n = mod(n, 9); return n === 0 ? 9 : n; }

  // Công thức gộp: nam 11 - s, nữ 4 + s (s = tổng toàn bộ chữ số năm, rút gọn), chuẩn hóa về 1..9.
  // Dạng "10 - a / 5 + a" (trước 2000) và "9 - a / 6 + a" (từ 2000) với a = tổng hai số cuối là cùng một công thức
  // (giống nhau theo modulo 9); xem test-bat-trach.js.
  function cungPhiSo(year, gender) {
    var s = reduceDigits(year);
    return gender === 'nam' ? norm9(11 - s) : norm9(4 + s);
  }

  // Dạng tách theo nguồn CUNGPHI_A (để đối chiếu)
  function cungPhiSoDangA(year, gender) {
    var a = reduceDigits((Math.floor(year / 10) % 10) + (year % 10)); // tổng hai số cuối, rút gọn (0 giữ nguyên)
    if (year < 2000) return gender === 'nam' ? norm9(10 - a) : norm9(5 + a);
    return gender === 'nam' ? norm9(9 - a) : norm9(6 + a);
  }

  function cungPhi(year, gender) {
    var so = cungPhiSo(year, gender);
    var gui = false, quaiSo = so;
    if (so === 5) { gui = true; quaiSo = gender === 'nam' ? 2 : 8; } // nam gửi Khôn, nữ gửi Cấn (hai nguồn thứ cấp thống nhất)
    var q = QUAI[quaiSo];
    return { soGoc: so, quaiSo: quaiSo, quai: q.ten, huong: q.huong, nhom: q.nhom + ' tứ mệnh', guiCung: gui };
  }

  // ---------- Nhà ----------
  function nhaTheoTa(toa) {
    var q = HUONG_TO_QUAI[toa];
    return { cach: 'theo tọa nhà', toa: toa, huongNha: OPPOSITE[toa], quai: QUAI[q].ten, nhom: QUAI[q].nhom + ' trạch' };
  }
  function nhaTheoCua(cua) {
    var q = HUONG_TO_QUAI[cua];
    return { cach: 'theo hướng cửa chính (khí khẩu)', cua: cua, quai: QUAI[q].ten, nhom: QUAI[q].nhom + ' trạch' };
  }

  // Một hướng, đối với người: nằm ở loại du niên nào
  function loaiHuong(tamH, huong) {
    for (var i = 0; i < tamH.length; i++) if (tamH[i].huong === huong) return tamH[i];
    return null;
  }

  function danhGiaNha(persons, house) {
    // persons: [{quaiSo,nhom,tamHuong}], house: {toa?, cua?}
    var out = [];
    var opts = [];
    if (house.toa) opts.push(nhaTheoTa(house.toa));
    if (house.cua) opts.push(nhaTheoCua(house.cua));
    opts.forEach(function (o) {
      var nhomNha = o.nhom.split(' ')[0];
      persons.forEach(function (p) {
        var cuaLoai = house.cua ? loaiHuong(p.tamHuong, house.cua) : (house.toa ? loaiHuong(p.tamHuong, OPPOSITE[house.toa]) : null);
        var toaLoai = house.toa ? loaiHuong(p.tamHuong, house.toa) : (house.cua ? loaiHuong(p.tamHuong, OPPOSITE[house.cua]) : null);
        out.push({
          cach: o.cach, trachQuai: o.quai, nhaThuoc: o.nhom,
          nguoi: p.label, nguoiThuoc: p.nhom, cungPhiNguoi: p.quai,
          hopNhom: p.nhom.split(' ')[0] === nhomNha,
          huongCuaDoiVoiNguoi: cuaLoai,
          toaDoiVoiNguoi: toaLoai
        });
      });
    });
    return out;
  }

  // ---------- Bàn làm việc ----------
  var MUC_DICH = {
    'Sinh khí': 'tài lộc, sự nghiệp, phát triển',
    'Thiên y': 'sức khỏe, an tâm',
    'Diên niên': 'quan hệ, hợp tác',
    'Phục vị': 'ổn định, học tập, tập trung'
  };

  function banLamViec(tamH) {
    var tot = tamH.filter(function (d) { return d.loai === 'cát'; });
    return {
      matNhinVe: tot.map(function (d) { return { duNien: d.ten, huong: d.huong, mucDich: MUC_DICH[d.ten] }; }),
      lungTuaVao: tot.map(function (d) { return { duNien: d.ten, huongLung: d.huong, tuongUngMatNhin: OPPOSITE[d.huong] }; }),
      ghiChu: 'Hai cách hiểu hướng ngồi (mặt nhìn về hướng tốt, hoặc lưng tựa vào hướng tốt) đều có người dùng. Chưa có nguồn gốc để chọn. Mục đích gán cho từng hướng là quy ước của phái. Quy tắc loan đầu (tựa tường, thấy cửa) thuộc bậc C, không tính ở đây.'
    };
  }

  // ---------- Hàm tổng ----------
  // birth: kết quả LichCore.analyze(...) của ngày sinh; gender: 'nam' | 'nu'
  // house (tùy chọn): { toa: 'Bắc', cua: 'Nam' } (có thể chỉ một trong hai)
  function evaluate(birth, gender, house) {
    var yn = birth.yearNumbers;
    var mocs = [{ moc: 'Lập xuân', year: yn.lapXuan }];
    if (yn.tet !== yn.lapXuan) mocs.push({ moc: 'Tết', year: yn.tet });
    else mocs[0].moc = 'Lập xuân và Tết (trùng nhau)';

    var results = mocs.map(function (m) {
      var cp = cungPhi(m.year, gender);
      var th = tamHuong(cp.quaiSo);
      var r = {
        moc: m.moc, namSinh: m.year, cungPhi: cp, tamHuong: th,
        banLamViec: banLamViec(th)
      };
      return r;
    });

    var nha = null;
    if (house && (house.toa || house.cua)) {
      nha = [];
      results.forEach(function (r) {
        var p = { label: r.moc, quaiSo: r.cungPhi.quaiSo, nhom: r.cungPhi.nhom, quai: r.cungPhi.quai, tamHuong: r.tamHuong };
        nha = nha.concat(danhGiaNha([p], house));
      });
    }

    return {
      ketQua: results,
      nha: nha,
      sources: ['CUNGPHI_A', 'CUNGPHI_C', 'MOCNAM', 'TAMHUONG', 'TRACHQUAI', 'MUCDICH'],
      canhBao: 'Chưa đọc được văn bản gốc Bát trạch minh cảnh / Dương trạch tam yếu. Thông tin lấy từ nguồn thứ cấp. Thứ tự độ xấu của bốn hướng hung khác nhau giữa các nguồn, nên không xếp hạng ở đây.'
    };
  }

  var api = {
    SOURCES: SOURCES, QUAI: QUAI, DU_NIEN: DU_NIEN,
    tamHuong: tamHuong, cungPhi: cungPhi, cungPhiSo: cungPhiSo, cungPhiSoDangA: cungPhiSoDangA,
    nhaTheoTa: nhaTheoTa, nhaTheoCua: nhaTheoCua, banLamViec: banLamViec, danhGiaNha: danhGiaNha,
    evaluate: evaluate, OPPOSITE: OPPOSITE
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BatTrach = api;
})(typeof self !== 'undefined' ? self : this);
