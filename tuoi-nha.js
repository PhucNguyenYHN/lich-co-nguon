/*
 * tuoi-nha.js — Tuổi làm nhà: tuổi mụ, Kim Lâu, Hoang Ốc, Tam tai.
 * Phụ thuộc: kết quả LichCore.analyze() (trường yearNumbers) của ngày sinh và ngày khởi công.
 *
 * Bậc: Kim Lâu và Hoang Ốc là bậc C (quy ước dân gian). Tam tai xếp B- (suy từ nhóm tam hợp).
 * Chưa tìm thấy nguồn cổ cho cả ba (xem nguon/tuoi.md). Không dùng để chặn quyết định.
 * Năm tính theo cả hai mốc (Lập xuân / Tết) khi hai mốc cho kết quả khác nhau.
 */
(function (root) {
  'use strict';

  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  function mod(a, n) { return ((a % n) + n) % n; }

  var SOURCES = {
    KIMLAU: {
      bac: 'C', ref: 'dienmayxanh.com, vnreview.vn, vnexpress.net (xem nguon/tuoi.md)', kind: 'thứ cấp / dân gian', verified: 'cách tính khớp giữa các bài; nguồn cổ: chưa tìm thấy',
      note: 'Tuổi mụ chia 9, dư 1, 3, 6, 8 là phạm (Thân, Thê, Tử, Súc). Một nhà nghiên cứu dân gian nói xuất phát từ tín ngưỡng; một bài diễn đàn trích chuyên gia nói không có lời giải thích chặt chẽ. Làm nhà lấy tuổi chồng (một nguồn).'
    },
    HOANGOC: {
      bac: 'C', ref: 'wiki.batdongsan.com.vn/wiki/hoang-oc-la-gi-110059 (xem nguon/tuoi.md)', kind: 'thứ cấp / dân gian', verified: 'cách tính khớp giữa hai nguồn; nguồn cổ: chưa tìm thấy',
      note: '10 tuổi = Nhất Cát, rồi mỗi năm một cung theo vòng 6. Hai cách đếm (theo mốc chục / cộng chữ số rồi chia 6) cho kết quả giống nhau với mọi tuổi 1-99, đã kiểm bằng code.'
    },
    TAMTAI: {
      bac: 'B-', ref: 'nguoiquansat.vn, kienthuc.net.vn (xem nguon/tuoi.md)', kind: 'thứ cấp', verified: 'bảng khớp giữa hai nguồn; suy ra được từ nhóm tam hợp; nguồn cổ: chưa tìm thấy',
      note: 'Ba năm liên tiếp theo nhóm tam hợp của tuổi. Khác Tam sát (phương theo năm); nhiều bài báo trộn hai khái niệm này.'
    },
    MOCNAM: {
      bac: 'A / C', ref: 'nguon/tuoi.md mục 1', kind: 'thứ cấp', verified: 'chưa nguồn nào nói riêng cho tuổi làm nhà giữa Tết và Lập xuân',
      note: 'Tuổi mụ làm nhà dân gian thường tính theo năm âm lịch (Tết). Bát tự tính theo Lập xuân. App hiện cả hai khi khác nhau.'
    }
  };

  var HOANG_OC = [
    { ten: 'Nhất Cát', loai: 'cát' }, { ten: 'Nhì Nghi', loai: 'cát' }, { ten: 'Tam Địa Sát', loai: 'hung' },
    { ten: 'Tứ Tấn Tài', loai: 'cát' }, { ten: 'Ngũ Thọ Tử', loai: 'hung' }, { ten: 'Lục Hoang Ốc', loai: 'hung' }
  ];
  var KIM_LAU = { 1: 'Kim Lâu Thân', 3: 'Kim Lâu Thê', 6: 'Kim Lâu Tử', 8: 'Kim Lâu Súc' };

  function chiOfYear(y) { return mod(y - 4, 12); }
  function tuoiMu(buildYear, birthYear) { return buildYear - birthYear + 1; }

  function kimLau(tm) {
    var du = tm % 9;
    return { du: du, pham: !!KIM_LAU[du], ten: KIM_LAU[du] || null };
  }

  // Cách 1: theo mốc chục (10 = Nhất Cát, 20 = Nhì Nghi, ...), tuổi lẻ đếm tiếp từ mốc chục
  function hoangOcIdx(tm) {
    return mod(Math.floor(tm / 10) - 1 + (tm % 10), 6);
  }
  // Cách 2: cộng các chữ số rồi chia 6 (dư 1 = Nhất Cát ... dư 0 = Lục Hoang Ốc)
  function hoangOcIdxCongChuSo(tm) {
    var s = 0, t = String(tm);
    for (var i = 0; i < t.length; i++) s += +t.charAt(i);
    var v = s % 6;
    return v === 0 ? 5 : v - 1;
  }
  function hoangOc(tm) {
    var i = hoangOcIdx(tm);
    return { index: i, ten: HOANG_OC[i].ten, loai: HOANG_OC[i].loai };
  }

  // Tam tai: tuổi theo nhóm tam hợp (Thân-Tý-Thìn, Tỵ-Dậu-Sửu, Dần-Ngọ-Tuất, Hợi-Mão-Mùi)
  function tamTaiStart(birthChi) { return [2, 11, 8, 5][birthChi % 4]; }
  function tamTai(birthChi, buildChi) {
    var s = tamTaiStart(birthChi);
    var pos = mod(buildChi - s, 12); // 0,1,2 nếu rơi vào ba năm tam tai
    return {
      nhom: [CHI[mod(birthChi, 12)]],
      cacNam: [CHI[s], CHI[mod(s + 1, 12)], CHI[mod(s + 2, 12)]],
      pham: pos <= 2,
      namThu: pos <= 2 ? pos + 1 : null
    };
  }

  // birth, build: kết quả LichCore.analyze(...)
  function evaluate(birth, build) {
    var by = birth.yearNumbers, cy = build.yearNumbers;
    var mocs = [{ moc: 'Lập xuân', birth: by.lapXuan, build: cy.lapXuan }];
    if (by.tet !== by.lapXuan || cy.tet !== cy.lapXuan) mocs.push({ moc: 'Tết', birth: by.tet, build: cy.tet });
    else mocs[0].moc = 'Lập xuân và Tết (trùng nhau)';

    var out = mocs.map(function (m) {
      var tm = tuoiMu(m.build, m.birth);
      var bc = chiOfYear(m.birth), cc = chiOfYear(m.build);
      return {
        moc: m.moc, namSinh: m.birth, namXay: m.build, tuoiMu: tm,
        tuoiChi: CHI[bc], namXayChi: CHI[cc],
        kimLau: kimLau(tm), hoangOc: hoangOc(tm), tamTai: tamTai(bc, cc)
      };
    });
    return { ketQua: out, sources: ['KIMLAU', 'HOANGOC', 'TAMTAI', 'MOCNAM'] };
  }

  var api = {
    SOURCES: SOURCES, CHI: CHI,
    tuoiMu: tuoiMu, kimLau: kimLau, hoangOc: hoangOc, hoangOcIdx: hoangOcIdx, hoangOcIdxCongChuSo: hoangOcIdxCongChuSo,
    tamTai: tamTai, chiOfYear: chiOfYear, evaluate: evaluate
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TuoiNha = api;
})(typeof self !== 'undefined' ? self : this);
