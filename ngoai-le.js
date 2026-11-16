/* Lớp ngoại lệ cho việc nên/tránh theo Trực.
 * Nguồn: 欽定協紀辨方書 q.10 (điều kiện sau mỗi Trực: 建日, 滿日, 平日, 破日, 收日, 閉日) và
 * q.5 (bảng các sao đức). Bản số hóa chưa hiệu đính với bản quét.
 * Chỉ mã hóa sáu Trực có điều kiện trong sách. Sáu Trực còn lại (Trừ, Định, Chấp, Nguy, Thành, Khai)
 * sách không ghi điều kiện theo tháng ở q.10.
 * Nguyên tắc: chỗ sách bảo "tính theo sao khác" (月刑, 月厭, 月煞, 劫煞, 災煞) thì KHÔNG tự suy,
 * app trả về trạng thái "tham chiếu" và giữ nguyên danh sách gốc kèm cảnh báo.
 * Chi: 0=Tý 1=Sửu 2=Dần 3=Mão 4=Thìn 5=Tỵ 6=Ngọ 7=Mùi 8=Thân 9=Dậu 10=Tuất 11=Hợi. Can: 0=Giáp ... 9=Quý. */
(function (root) {
  'use strict';
  function mod(a, n) { return ((a % n) + n) % n; }
  var Viec = (typeof module !== 'undefined' && module.exports) ? require('./viec.js') : root.Viec;

  // ---------- Bảng sao đức (q.5), tháng theo tiết: 1 = tháng Dần ... 12 = tháng Sửu ----------
  var G = { Giap: 0, At: 1, Binh: 2, Dinh: 3, Mau: 4, Ky: 5, Canh: 6, Tan: 7, Nham: 8, Quy: 9 };
  // 天德: mục là Can (c) hoặc Chi (b). Tháng 2,5,8,11 sách ghi quẻ (坤 乾 艮 巽); chuyển quẻ -> chi là cách hiểu chuẩn (坤=Thân, 乾=Hợi, 艮=Dần, 巽=Tỵ) nhưng sách q.5 dòng này không tự ghi chi.
  var THIEN_DUC = [
    { c: G.Dinh }, { b: 8 }, { c: G.Nham }, { c: G.Tan }, { b: 11 }, { c: G.Giap },
    { c: G.Quy }, { b: 2 }, { c: G.Binh }, { c: G.At }, { b: 5 }, { c: G.Canh }
  ];
  // 天德合 (tháng 2,5,8,11 không có: "四仲之月天徳居四維故無合")
  var THIEN_DUC_HOP = [G.Nham, null, G.Dinh, G.Binh, null, G.Ky, G.Mau, null, G.Tan, G.Canh, null, G.At];
  // 月德: tháng Dần-Ngọ-Tuất = Bính; Mão-Mùi-Hợi = Giáp; Thân-Tý-Thìn = Nhâm; Tỵ-Dậu-Sửu = Canh
  function nguyetDucStem(monthBranch) { return [G.Nham, G.Canh, G.Binh, G.Giap][mod(monthBranch, 4)]; }
  var NGUYET_DUC_HOP_OF = {}; NGUYET_DUC_HOP_OF[G.Binh] = G.Tan; NGUYET_DUC_HOP_OF[G.Giap] = G.Ky; NGUYET_DUC_HOP_OF[G.Nham] = G.Dinh; NGUYET_DUC_HOP_OF[G.Canh] = G.At;
  // 月恩 theo tháng 1..12
  var NGUYET_AN = [G.Binh, G.Dinh, G.Canh, G.Ky, G.Mau, G.Tan, G.Nham, G.Quy, G.Canh, G.At, G.Giap, G.Tan];
  // 天願 theo tháng 1..12: bảng đã được Hiệp kỷ chỉnh (q.5), khác bảng lịch cũ
  var THIEN_NGUYEN = [[1, 11], [0, 10], [1, 9], [2, 8], [3, 7], [4, 6], [5, 5], [6, 4], [7, 3], [8, 2], [9, 1], [0, 0]]
    .map(function (p) { return { c: p[0], b: p[1] }; });
  // mùa: 0 xuân (tháng 1-3), 1 hạ, 2 thu, 3 đông
  function season(monthBranch) { return Math.floor(mod(monthBranch - 2, 12) / 3); }
  var THIEN_XA = [{ c: 4, b: 2 }, { c: 0, b: 6 }, { c: 4, b: 8 }, { c: 0, b: 0 }];          // 春戊寅 夏甲午 秋戊申 冬甲子
  var TU_TUONG = [[G.Binh, G.Dinh], [G.Mau, G.Ky], [G.Nham, G.Quy], [G.Giap, G.At]];         // 春丙丁 夏戊己 秋壬癸 冬甲乙
  var THOI_DUC = [6, 4, 0, 2];                                                             // 春午 夏辰 秋子 冬寅

  var TEN = {
    thienDuc: 'Thiên Đức', nguyetDuc: 'Nguyệt Đức', thienDucHop: 'Thiên Đức hợp', nguyetDucHop: 'Nguyệt Đức hợp',
    thienXa: 'Thiên Xá', thienNguyen: 'Thiên Nguyện', nguyetAn: 'Nguyệt Ân', tuTuong: 'Tứ Tướng', thoiDuc: 'Thời Đức'
  };
  var HAN = {
    thienDuc: '天德', nguyetDuc: '月德', thienDucHop: '天德合', nguyetDucHop: '月德合',
    thienXa: '天赦', thienNguyen: '天願', nguyetAn: '月恩', tuTuong: '四相', thoiDuc: '時德'
  };

  // Sao đức có mặt vào ngày (stem, branch) của tháng monthBranch
  function ducOf(monthBranch, stem, branch) {
    var m = mod(monthBranch - 2, 12), s = season(monthBranch), r = {}, t;
    t = THIEN_DUC[m]; if ((t.c !== undefined && t.c === stem) || (t.b !== undefined && t.b === branch)) r.thienDuc = true;
    if (stem === nguyetDucStem(monthBranch)) r.nguyetDuc = true;
    if (THIEN_DUC_HOP[m] !== null && THIEN_DUC_HOP[m] === stem) r.thienDucHop = true;
    if (stem === NGUYET_DUC_HOP_OF[nguyetDucStem(monthBranch)]) r.nguyetDucHop = true;
    if (THIEN_XA[s].c === stem && THIEN_XA[s].b === branch) r.thienXa = true;
    t = THIEN_NGUYEN[m]; if (t.c === stem && t.b === branch) r.thienNguyen = true;
    if (NGUYET_AN[m] === stem) r.nguyetAn = true;
    if (TU_TUONG[s][0] === stem || TU_TUONG[s][1] === stem) r.tuTuong = true;
    if (THOI_DUC[s] === branch) r.thoiDuc = true;
    return r;
  }
  function ducNames(d) {
    var out = [], k;
    for (k in TEN) if (d[k]) out.push({ key: k, vi: TEN[k], han: HAN[k] });
    return out;
  }
  function any(d, keys) { for (var i = 0; i < keys.length; i++) if (d[keys[i]]) return true; return false; }

  // ---------- Hán văn các danh sách ghi trong điều kiện ----------
  var KIEN_CHI_KY = '營建宮室修宫室繕城郭築隄防興造動土修倉庫修置產室開渠穿井安碓磑補垣修飾垣墻平治道塗破屋壞垣伐木栽種破土';
  var QUAN_Y = '安撫邊境選將訓兵出師求醫療病';
  var PHA_THEM = '解除求醫療病破屋壞垣';

  var NGUON = {
    0: '建日 (q.10): 與天德月德天德合月德合天赦月恩四相併 止忌營建…破土 餘皆不忌; 子午月值月厭, 辰午酉亥月值月刑 從刑厭論; 未月己未日為陽錯不作德合論; 隂陽小㑹, 三月庚辰九月甲戌為隂位 諸事皆忌',
    2: '滿日 (q.10): 寅申月值守日 子午夘酉月值相日 與月德天德合月德合月恩四相併則不忌; 辰戌丑未月值災煞從災煞論; 己亥月值月厭從月厭論; 申月又為天狗忌祭祀 與德合併猶忌',
    3: '平日 (q.10): 亥月值相日又值時德六合 止忌安撫邊境選將訓兵出師求醫療病; 申月值月害與德併亦同; 子午夘酉月值天吏 與德併則忌者不註宜 宜者不註忌; 寅巳子月從月刑論; 辰戌丑未月從月煞論; 不與德合併如常例',
    6: '破日 (q.10): 與德併猶忌; 子午月值災煞, 未申月值月刑 與德併不忌祭祀覃恩肆赦等事 仍忌解除求醫療病破屋壞垣 不與德併諸事皆忌; 卯酉月值災煞又值月厭 雖與德併仍諸事皆忌; 四月癸亥十月丁巳 六月癸丑十二月丁未 諸事皆忌',
    9: '收日 (q.10): 寅申巳亥月從刼煞論; 子午夘酉月值大時 子午月與月德合併 酉月與月德併 則不註宜忌; 夘月丑戌月從月刑論; 辰未月與德合併止忌安撫邊境選將訓兵出師求醫療病 餘皆不忌; 不與德合併如常例',
    11: '閉日 (q.10): 子午夘酉月值王日 辰戌丑未月值官日天吏 與天德月德天德合月德合天赦天願併 則不註宜忌; 不併如常例; 寅申巳亥月從月煞論'
  };

  // Trả về kết quả cho một Trực, một tháng, một ngày.
  // kết quả: { ma, trangThai, ji (Hán, null = giữ nguyên), neutral, tatCaKy, thamChieu: [tên], giaiThich, ducs }
  function xet(trucIdx, mb, stem, branch) {
    var d = ducOf(mb, stem, branch), ducs = ducNames(d);
    var res = { ma: 'goc', trangThai: 'goc', ji: null, jiThem: null, jiBot: null, neutral: false, tatCaKy: false,
                thamChieu: [], giaiThich: '', ducs: ducs, nguon: NGUON[trucIdx] || '', moHo: '' };
    var s = res;
    function ref(names, why) { s.trangThai = 'tham-chieu'; s.ma = 'tham-chieu'; s.thamChieu = names; s.giaiThich = why; return s; }
    function all(why) { s.trangThai = 'tat-ca-ky'; s.ma = 'tat-ca-ky'; s.tatCaKy = true; s.giaiThich = why; return s; }
    function newJi(han, why, ma) { s.trangThai = 'doi'; s.ma = ma; s.ji = han; s.giaiThich = why; return s; }
    function neu(why) { s.trangThai = 'trung-tinh'; s.ma = 'trung-tinh'; s.neutral = true; s.giaiThich = why; return s; }
    var MB = { mb: mb };

    // ===== Kiến (建日) =====
    if (trucIdx === 0) {
      var XIAOHUI = { 3: 5, 4: 4, 5: 5, 6: 4, 9: 5, 10: 4, 11: 5, 0: 4 }; // chi tháng -> can ngày (己卯 戊辰 己巳 戊午 己酉 戊戌 己亥 戊子)
      if ((mb === 4 && stem === G.Canh) || (mb === 10 && stem === G.Giap)) return all('Ngày này là "âm vị" (三月庚辰 / 九月甲戌): sách ghi "諸事皆忌".');
      if (XIAOHUI[mb] === stem) return all('Ngày này là "âm dương tiểu hội" (' + (mod(mb - 2, 12) + 1) + ' tháng): sách ghi "諸事皆忌" (mục 月厭 q.10).');
      var ref1 = [];
      if (mb === 0 || mb === 6) ref1.push('Nguyệt Yếm (月厭)');
      if (mb === 4 || mb === 6 || mb === 9 || mb === 11) ref1.push('Nguyệt Hình (月刑)');
      if (ref1.length) return ref(ref1, 'Sách bảo "從刑厭論": ngày Kiến gặp ' + ref1.join(' và ') + ' thì tính theo sao đó, vì sách coi hung của sao này nặng hơn Kiến. Dù có sao đức cũng vậy.');
      var dd = { thienDuc: d.thienDuc, nguyetDuc: d.nguyetDuc, thienDucHop: d.thienDucHop, nguyetDucHop: d.nguyetDucHop, thienXa: d.thienXa, nguyetAn: d.nguyetAn, tuTuong: d.tuTuong };
      if (mb === 7 && stem === G.Ky) { dd.thienDucHop = false; dd.nguyetDucHop = false; s.giaiThich = 'Tháng Mùi, ngày Kỷ Mùi là "dương thác": sách không tính là đức hợp. '; }
      if (any(dd, ['thienDuc', 'nguyetDuc', 'thienDucHop', 'nguyetDucHop', 'thienXa', 'nguyetAn', 'tuTuong'])) {
        newJi(KIEN_CHI_KY, s.giaiThich + 'Gặp sao đức (' + ducs.map(function (x) { return x.vi; }).join(', ') + ') thì chỉ còn kỵ nhóm việc xây cất, động thổ, đào đất, trồng trọt mà sách liệt kê; các việc khác không kỵ. Thiên Nguyện không tính vì sách ghi 天願不得與月建併.', 'kien-duc');
        return res;
      }
      s.giaiThich = (s.giaiThich || '') + 'Không có sao đức kèm theo: dùng danh sách gốc.';
      if (mb === 2) { s.jiThem = '出師'; s.giaiThich += ' Tháng Dần (正月建日) kỵ thêm xuất quân.'; s.ma = 'kien-goc-dan'; }
      return res;
    }

    // ===== Mãn (滿日) =====
    if (trucIdx === 2) {
      if (mb === 4 || mb === 10 || mb === 1 || mb === 7) return ref(['Tai Sát (災煞)'], 'Sách bảo tháng Thìn, Tuất, Sửu, Mùi gặp ngày Mãn thì "從災煞論".');
      if (mb === 5 || mb === 11) return ref(['Nguyệt Yếm (月厭)'], 'Sách bảo tháng Tỵ, Hợi gặp ngày Mãn thì "從月厭論".');
      // 寅申 (值守日), 子午夘酉 (值相日)
      var okSet = ['nguyetDuc', 'thienDucHop', 'nguyetDucHop', 'nguyetAn', 'tuTuong'];
      var thienXaTat = mb === 8; // 申月又為天狗 忌祭祀
      if (any(d, okSet)) {
        newJi(thienXaTat ? '祭祀' : '', 'Gặp sao đức (' + ducs.map(function (x) { return x.vi; }).join(', ') + '): sách ghi "則不忌".' +
          (thienXaTat ? ' Riêng tháng Thân ngày Mãn còn là "Thiên Cẩu", kỵ tế tự, dù có đức vẫn kỵ.' : ''), 'man-duc');
        return res;
      }
      if (d.thienDuc) { s.moHo = 'Chữ "月德天德合月德合" có thể đọc là "Nguyệt Đức, Thiên Đức hợp, Nguyệt Đức hợp" hoặc có cả Thiên Đức. Hôm nay chỉ có Thiên Đức nên không kết luận.'; }
      s.giaiThich = 'Không thấy sao đức đủ điều kiện: dùng danh sách gốc.' + (thienXaTat ? ' Tháng Thân còn thêm kỵ tế tự (Thiên Cẩu).' : '');
      if (thienXaTat) s.jiThem = '祭祀';
      return res;
    }

    // ===== Bình (平日) =====
    if (trucIdx === 3) {
      var dg = any(d, ['thienDuc', 'nguyetDuc', 'thienDucHop', 'nguyetDucHop']);
      if (mb === 11) return newJi(QUAN_Y, 'Tháng Hợi ngày Bình trùng Tương nhật, Thời Đức và lục hợp: "吉已足勝凶", chỉ kỵ quân sự và chữa bệnh.', 'binh-hoi');
      if (mb === 8) {
        if (dg) { s.moHo = 'Chữ "天德月德合" mơ hồ; app lấy hợp của Thiên Đức, Nguyệt Đức và hai sao hợp.'; return newJi(QUAN_Y, 'Tháng Thân ngày Bình gặp Nguyệt Hại nhưng có đức (' + ducs.map(function (x) { return x.vi; }).join(', ') + '): chỉ kỵ quân sự và chữa bệnh.', 'binh-than-duc'); }
        s.giaiThich = 'Tháng Thân ngày Bình gặp Nguyệt Hại, không có đức: như lệ thường (danh sách gốc).'; return res;
      }
      if (mb === 2 || mb === 5 || mb === 0) return ref(['Nguyệt Hình (月刑)'], 'Sách bảo tháng Dần, Tỵ, Tý ngày Bình "從月刑論".');
      if (mb === 1 || mb === 4 || mb === 7 || mb === 10) return ref(['Nguyệt Sát (月煞)'], 'Sách bảo tháng Sửu, Thìn, Mùi, Tuất ngày Bình "從月煞論".');
      // 卯酉 (月德併), 午 (月德合併); 子 đã xử lý ở trên
      var duoc = ((mb === 3 || mb === 9) && d.nguyetDuc) || (mb === 6 && d.nguyetDucHop);
      if (duoc) return neu('Gặp ' + (mb === 6 ? 'Nguyệt Đức hợp' : 'Nguyệt Đức') + ': sách ghi "凡所忌者則不註宜, 所宜者亦不註忌", tức cát hung gần ngang nhau nên không khuyên làm cũng không kỵ.');
      s.giaiThich = 'Không có đức đủ điều kiện: như lệ thường (danh sách gốc).'; return res;
    }

    // ===== Phá (破日) =====
    if (trucIdx === 6) {
      var pgHop = (mb === 5 && stem === G.Quy && branch === 11) || (mb === 11 && stem === G.Dinh && branch === 5);
      if (pgHop) return all('"Âm dương giao phá" (四月癸亥 / 十月丁巳): sách ghi "諸事皆忌".');
      if ((mb === 7 && stem === G.Quy && branch === 1) || (mb === 1 && stem === G.Dinh && branch === 7)) return all('"Dương phá âm xung" (六月癸丑 / 十二月丁未): sách ghi "諸事皆忌".');
      var dgp = any(d, ['thienDuc', 'nguyetDuc', 'thienDucHop', 'nguyetDucHop']);
      if (mb === 3 || mb === 9) return all('Tháng Mão/Dậu gặp Tai Sát lại gặp Nguyệt Yếm: "雖與德合併仍諸事皆忌", có đức cũng vậy.');
      if (mb === 0 || mb === 6 || mb === 7 || mb === 8) {
        var tenSao = (mb === 0 || mb === 6) ? 'Tai Sát' : 'Nguyệt Hình';
        if (dgp) return newJi(PHA_THEM, 'Ngày Phá gặp ' + tenSao + ' nhưng có đức (' + ducs.map(function (x) { return x.vi; }).join(', ') + '): sách ghi không kỵ tế tự, ân xá và các việc tương tự, nhưng vẫn kỵ giải trừ, chữa bệnh, phá nhà. Danh sách kỵ gốc vẫn giữ.', 'pha-duc-nang');
        return all('Ngày Phá gặp ' + tenSao + ' mà không có đức: "不與德合併諸事皆忌".');
      }
      s.giaiThich = dgp ? 'Có đức (' + ducs.map(function (x) { return x.vi; }).join(', ') + ') nhưng sách ghi 與德併猶忌之: ngày Phá đức mất lực, danh sách kỵ gốc vẫn giữ.' : 'Dùng danh sách gốc.';
      return res;
    }

    // ===== Thu (收日) =====
    if (trucIdx === 9) {
      if (mb === 2 || mb === 5 || mb === 8 || mb === 11) return ref(['Kiếp Sát (刼煞)'], 'Sách bảo tháng Dần, Thân, Tỵ, Hợi ngày Thu "從刼煞論".');
      if (mb === 3 || mb === 1 || mb === 10) return ref(['Nguyệt Hình (月刑)'], 'Sách bảo tháng Mão, Sửu, Tuất ngày Thu "從月刑論".');
      if (mb === 0 || mb === 6) { if (d.nguyetDucHop) return neu('Tháng Tý/Ngọ gặp Đại Thời, có Nguyệt Đức hợp: sách ghi không chú nên cũng không chú kỵ.'); s.giaiThich = 'Không có Nguyệt Đức hợp: như lệ thường.'; return res; }
      if (mb === 9) { if (d.nguyetDuc) return neu('Tháng Dậu gặp Đại Thời, có Nguyệt Đức: sách ghi không chú nên cũng không chú kỵ.'); s.giaiThich = 'Không có Nguyệt Đức: như lệ thường.'; return res; }
      if (mb === 4 || mb === 7) {
        if (d.thienDucHop || d.nguyetDucHop) return newJi(QUAN_Y, 'Tháng Thìn/Mùi ngày Thu có đức hợp: chỉ kỵ quân sự và chữa bệnh.', 'thu-duc-hop');
        s.giaiThich = 'Không có đức hợp: như lệ thường.'; return res;
      }
      return res;
    }

    // ===== Bế (閉日) =====
    if (trucIdx === 11) {
      if (mb === 2 || mb === 5 || mb === 8 || mb === 11) return ref(['Nguyệt Sát (月煞)'], 'Sách bảo tháng Dần, Thân, Tỵ, Hợi ngày Bế "從月煞論".');
      if (any(d, ['thienDuc', 'nguyetDuc', 'thienDucHop', 'nguyetDucHop', 'thienXa', 'thienNguyen']))
        return neu('Ngày Bế có đức hoặc xá/nguyện (' + ducs.map(function (x) { return x.vi; }).join(', ') + '): sách ghi không chú nên cũng không chú kỵ.');
      s.giaiThich = 'Không có đức/xá/nguyện: như lệ thường.'; return res;
    }

    s.giaiThich = 'Hiệp kỷ q.10 không ghi điều kiện ngoại lệ theo tháng cho Trực này.';
    s.ma = 'khong-co';
    return res;
  }

  // Kết hợp với danh sách gốc: trả về {nen, tranh, khongKy, ...}
  function theoNgay(trucIdx, mb, stem, branch) {
    var base = Viec.theoTruc(trucIdx);
    var x = xet(trucIdx, mb, stem, branch);
    var out = { truc: base.truc, nen: base.nen, tranh: base.tranh, khongKy: base.khongKy, chuaNhanRa: base.chuaNhanRa,
                trangThai: x.trangThai, ma: x.ma, giaiThich: x.giaiThich, ducs: x.ducs, thamChieu: x.thamChieu,
                tatCaKy: x.tatCaKy, neutral: x.neutral, nguon: x.nguon, moHo: x.moHo };
    if (x.trangThai === 'doi') {
      var jt = Viec.tokenize(x.ji);
      var tranh = jt.items;
      if (trucIdx === 6) { // Phá: giữ danh sách gốc, thêm ba việc
        var seen = {}; var merged = [];
        base.tranh.concat(jt.items).forEach(function (i) { if (!seen[i.vi]) { seen[i.vi] = 1; merged.push(i); } });
        tranh = merged;
      }
      out.tranh = tranh; out.khongKy = [];
    } else if (x.trangThai === 'tat-ca-ky') { out.tranh = []; out.nen = []; out.khongKy = []; }
    else if (x.trangThai === 'trung-tinh') { out.nen = []; out.tranh = []; out.khongKy = []; }
    else if (x.jiThem) { var jj = Viec.tokenize(x.jiThem).items; var s2 = {}; out.tranh = base.tranh.concat(jj).filter(function (i) { if (s2[i.vi]) return false; s2[i.vi] = 1; return true; }); }
    return out;
  }

  var api = { ducOf: ducOf, ducNames: ducNames, xet: xet, theoNgay: theoNgay, TEN: TEN, HAN: HAN, THIEN_DUC: THIEN_DUC,
              THIEN_NGUYEN: THIEN_NGUYEN, season: season, nguyetDucStem: nguyetDucStem };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NgoaiLe = api;
})(typeof self !== 'undefined' ? self : this);
