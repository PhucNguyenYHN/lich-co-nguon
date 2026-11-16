/*
 * lich-core.js — Lõi lịch bậc A (thiên văn/toán). Không phụ thuộc thư viện, chạy trong Safari cũ và Node.
 *
 * Gồm: ngày Julian, lịch âm Việt Nam (UTC+7), can chi ngày/tháng/năm/giờ, 24 tiết khí.
 * Lịch âm: thuật toán Hồ Ngọc Đức (new moon + kinh độ Mặt Trời theo Meeus).
 * Tiết khí: kinh độ biểu kiến của Mặt Trời (Meeus ch.25), giải bằng chia đôi. Sai số cỡ vài phút;
 *   chỉ quan trọng khi ngày giờ xem sát ngay thời điểm giao tiết.
 *
 * Mốc năm cho can chi: trả CẢ HAI (Lập xuân và mùng 1 Tết), không chọn thay người dùng.
 */
(function (root) {
  'use strict';

  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

  // 24 tiết khí, bắt đầu từ Lập xuân (315°), mỗi 15°. Số chẵn (0,2,..) là Tiết, số lẻ là Trung khí.
  var TERMS = ['Lập xuân', 'Vũ thủy', 'Kinh trập', 'Xuân phân', 'Thanh minh', 'Cốc vũ',
    'Lập hạ', 'Tiểu mãn', 'Mang chủng', 'Hạ chí', 'Tiểu thử', 'Đại thử',
    'Lập thu', 'Xử thử', 'Bạch lộ', 'Thu phân', 'Hàn lộ', 'Sương giáng',
    'Lập đông', 'Tiểu tuyết', 'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn'];

  var RAD = Math.PI / 180;
  function INT(d) { return Math.floor(d); }
  function mod(a, n) { return ((a % n) + n) % n; }

  // ---------- Ngày Julian (số nguyên, theo ngày lịch địa phương) ----------
  function jdFromDate(dd, mm, yy) {
    var a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    var jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    return jd;
  }

  function jdToDate(jd) {
    var a, b, c;
    if (jd > 2299160) {
      a = jd + 32044;
      b = INT((4 * a + 3) / 146097);
      c = a - INT((b * 146097) / 4);
    } else {
      b = 0;
      c = jd + 32082;
    }
    var d = INT((4 * c + 3) / 1461);
    var e = c - INT((1461 * d) / 4);
    var m = INT((5 * e + 2) / 153);
    return {
      day: e - INT((153 * m + 2) / 5) + 1,
      month: m + 3 - 12 * INT(m / 10),
      year: b * 100 + d - 4800 + INT(m / 10)
    };
  }

  // ---------- Lịch âm (Hồ Ngọc Đức) ----------
  function newMoon(k) {
    var T = k / 1236.85, T2 = T * T, T3 = T2 * T;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * RAD);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * RAD) + 0.0021 * Math.sin(2 * RAD * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * RAD) + 0.0161 * Math.sin(RAD * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(RAD * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(RAD * 2 * F) - 0.0051 * Math.sin(RAD * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(RAD * (M - Mpr)) + 0.0004 * Math.sin(RAD * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(RAD * (2 * F - M)) - 0.0006 * Math.sin(RAD * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(RAD * (2 * F - Mpr)) + 0.0005 * Math.sin(RAD * (2 * Mpr + M));
    var deltat;
    if (T < -11) {
      deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    } else {
      deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    }
    return Jd1 + C1 - deltat;
  }

  // Kinh độ Mặt Trời (radian), dùng cho việc xếp tháng nhuận (chỉ cần độ chính xác thấp).
  function sunLongitudeRad(jdn) {
    var T = (jdn - 2451545.0) / 36525, T2 = T * T;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(RAD * M);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(RAD * 2 * M) + 0.000290 * Math.sin(RAD * 3 * M);
    var L = (L0 + DL) * RAD;
    return L - Math.PI * 2 * INT(L / (Math.PI * 2));
  }

  function getSunLongitudeIdx(dayNumber, tz) { // 0..11, mỗi 30° (theo Trung khí)
    return INT(sunLongitudeRad(dayNumber - 0.5 - tz / 24.0) / Math.PI * 6);
  }

  function getNewMoonDay(k, tz) { return INT(newMoon(k) + 0.5 + tz / 24.0); }

  function getLunarMonth11(yy, tz) {
    var off = jdFromDate(31, 12, yy) - 2415021;
    var k = INT(off / 29.530588853);
    var nm = getNewMoonDay(k, tz);
    if (getSunLongitudeIdx(nm, tz) >= 9) nm = getNewMoonDay(k - 1, tz);
    return nm;
  }

  function getLeapMonthOffset(a11, tz) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last = 0, i = 1;
    var arc = getSunLongitudeIdx(getNewMoonDay(k + i, tz), tz);
    do {
      last = arc;
      i++;
      arc = getSunLongitudeIdx(getNewMoonDay(k + i, tz), tz);
    } while (arc !== last && i < 14);
    return i - 1;
  }

  // Trả {day, month, year, leap} (leap: true nếu là tháng nhuận). tz mặc định UTC+7.
  function solarToLunar(dd, mm, yy, tz) {
    if (tz === undefined) tz = 7;
    var dayNumber = jdFromDate(dd, mm, yy);
    var k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = getNewMoonDay(k + 1, tz);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz);
    var a11 = getLunarMonth11(yy, tz);
    var b11 = a11, lunarYear;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, tz);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, tz);
    }
    var lunarDay = dayNumber - monthStart + 1;
    var diff = INT((monthStart - a11) / 29);
    var lunarLeap = false;
    var lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      var leapMonthDiff = getLeapMonthOffset(a11, tz);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff === leapMonthDiff) lunarLeap = true;
      }
    }
    if (lunarMonth > 12) lunarMonth = lunarMonth - 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap };
  }

  // ---------- Tiết khí (kinh độ biểu kiến của Mặt Trời) ----------
  function sunLongitudeDeg(jd) { // jd ~ UT; trả độ [0,360)
    var T = (jd - 2451545.0) / 36525, T2 = T * T;
    var M = (357.52911 + 35999.05029 * T - 0.0001537 * T2) * RAD;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    var omega = (125.04 - 1934.136 * T) * RAD;
    return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(omega), 360);
  }

  function wrap180(x) { return mod(x + 180, 360) - 180; }

  // Thời điểm (JD, UT) Mặt Trời đạt kinh độ lon (độ), gần jdGuess (±20 ngày).
  function termTimeJD(lon, jdGuess) {
    var lo = jdGuess - 20, hi = jdGuess + 20;
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      if (wrap180(sunLongitudeDeg(mid) - lon) < 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // jd (UT) -> {year,month,day,hour,minute} theo múi giờ tz
  function jdToLocal(jdUT, tz) {
    var x = jdUT + 0.5 + tz / 24;
    var dn = INT(x);
    var d = jdToDate(dn);
    var minutes = Math.round((x - dn) * 1440);
    if (minutes >= 1440) { // làm tròn vắt sang ngày sau
      d = jdToDate(dn + 1);
      minutes -= 1440;
    }
    return { year: d.year, month: d.month, day: d.day, hour: INT(minutes / 60), minute: minutes % 60 };
  }

  function localToJD(dd, mm, yy, h, mi, tz) { // giờ địa phương -> JD (UT)
    return jdFromDate(dd, mm, yy) - 0.5 + ((h || 0) + (mi || 0) / 60) / 24 - tz / 24;
  }

  // 24 tiết khí bắt đầu từ Lập xuân năm y (Lập xuân y ... Đại hàn tháng 1 năm y+1)
  function solarTermsFromLapXuan(y, tz) {
    if (tz === undefined) tz = 7;
    var out = [];
    var base = jdFromDate(4, 2, y) - 0.5 - tz / 24;
    for (var k = 0; k < 24; k++) {
      var lon = (315 + 15 * k) % 360;
      var jd = termTimeJD(lon, base + k * 15.2184);
      out.push({ index: k, name: TERMS[k], isTiet: k % 2 === 0, longitude: lon, jd: jd, local: jdToLocal(jd, tz) });
    }
    return out;
  }

  function lapXuanJD(y, tz) {
    if (tz === undefined) tz = 7;
    return termTimeJD(315, jdFromDate(4, 2, y) - 0.5 - tz / 24);
  }

  // ---------- Can chi ----------
  function pillar(stem, branch) {
    stem = mod(stem, 10); branch = mod(branch, 12);
    return { stem: stem, branch: branch, name: CAN[stem] + ' ' + CHI[branch] };
  }

  function yearPillarFromYear(y) { return pillar(y - 4, y - 4); }

  // Ngày: JDN của ngày lịch địa phương
  function dayPillarFromJDN(jdn) { return pillar(jdn + 9, jdn + 1); }

  // Tháng theo Tiết: idx 0 = Dần (từ Lập xuân), ... 11 = Sửu (Tiểu hàn -> Lập xuân)
  function monthPillar(jdUT, astroYear) {
    var idx = INT(mod(sunLongitudeDeg(jdUT) - 315, 360) / 30);
    var yearStem = mod(astroYear - 4, 10);
    // Ngũ hổ độn: tháng Dần có can = (can năm mod 5)*2 + 2
    var stem = (yearStem % 5) * 2 + 2 + idx;
    return pillar(stem, 2 + idx);
  }

  // Giờ: Ngũ thử độn. Giờ Tý có can = (can ngày mod 5)*2
  function hourBranch(h) { return INT((h + 1) / 2) % 12; }
  function hourPillar(dayStem, hour) {
    var b = hourBranch(hour);
    return pillar((dayStem % 5) * 2 + b, b);
  }

  // Phân tích đầy đủ một thời điểm. h, mi: giờ phút địa phương (mặc định 12:00).
  function analyze(dd, mm, yy, h, mi, tz) {
    if (tz === undefined) tz = 7;
    if (h === undefined) h = 12;
    if (mi === undefined) mi = 0;
    var jdn = jdFromDate(dd, mm, yy);
    var jdUT = localToJD(dd, mm, yy, h, mi, tz);
    var lunar = solarToLunar(dd, mm, yy, tz);

    // Năm: hai cách tính, luôn trả cả hai
    var astroYear = jdUT < lapXuanJD(yy, tz) ? yy - 1 : yy;
    var byLapXuan = yearPillarFromYear(astroYear);
    var byTet = yearPillarFromYear(lunar.year);

    var dayP = dayPillarFromJDN(jdn);

    // Giờ: giờ Tý muộn (23h) có hai cách: dùng can của ngày đó, hoặc can của ngày kế tiếp
    var hours = [];
    if (h === 23) {
      hours.push({ rule: 'giờ Tý tính theo ngày hiện tại', pillar: hourPillar(dayP.stem, h) });
      hours.push({ rule: 'giờ Tý tính theo ngày kế tiếp', pillar: hourPillar(dayPillarFromJDN(jdn + 1).stem, h) });
    } else {
      hours.push({ rule: '', pillar: hourPillar(dayP.stem, h) });
    }

    // Tiết xảy ra trong ngày này (nếu có) — tháng can chi đổi ở thời điểm đó
    var tietToday = [];
    var termsA = solarTermsFromLapXuan(yy - 1, tz).concat(solarTermsFromLapXuan(yy, tz));
    for (var i = 0; i < termsA.length; i++) {
      var t = termsA[i];
      if (t.isTiet && t.local.year === yy && t.local.month === mm && t.local.day === dd) tietToday.push(t);
    }

    return {
      solar: { day: dd, month: mm, year: yy, hour: h, minute: mi, tz: tz },
      lunar: lunar,
      dayPillar: dayP,
      monthPillar: monthPillar(jdUT, astroYear),
      hourPillars: hours,
      yearNumbers: { lapXuan: astroYear, tet: lunar.year }, // số năm theo từng mốc (dùng cho cung phi, tuổi mụ)
      yearPillar: {
        byLapXuan: byLapXuan,
        byTet: byTet,
        differ: byLapXuan.name !== byTet.name // ngày nằm giữa Tết và Lập xuân: hai cách cho kết quả khác nhau
      },
      tietToday: tietToday
    };
  }

  var api = {
    CAN: CAN, CHI: CHI, TERMS: TERMS,
    jdFromDate: jdFromDate, jdToDate: jdToDate,
    solarToLunar: solarToLunar,
    sunLongitudeDeg: sunLongitudeDeg,
    termTimeJD: termTimeJD, solarTermsFromLapXuan: solarTermsFromLapXuan, lapXuanJD: lapXuanJD,
    jdToLocal: jdToLocal, localToJD: localToJD,
    yearPillarFromYear: yearPillarFromYear, dayPillarFromJDN: dayPillarFromJDN,
    monthPillar: monthPillar, hourPillar: hourPillar, hourBranch: hourBranch,
    analyze: analyze
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LichCore = api;
})(typeof self !== 'undefined' ? self : this);
