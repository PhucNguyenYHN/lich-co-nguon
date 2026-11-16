// Chạy: node test-core.js
// Các giá trị chuẩn lấy từ sự kiện lịch đã biết rõ (mùng 1 Tết, tháng nhuận, ngày Lập xuân công bố).
const L = require('./lich-core.js');
let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else { fail++; console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); }
}
function near(name, gotMin, wantMin, tol) {
  const ok = Math.abs(gotMin - wantMin) <= tol;
  if (ok) pass++; else { fail++; console.log('FAIL', name, 'lệch', (gotMin - wantMin).toFixed(1), 'phút (cho phép', tol + ')'); }
}

// 1. Ngày Julian và can chi ngày
eq('JDN 2000-01-01', L.jdFromDate(1, 1, 2000), 2451545);
eq('Can chi ngày 2000-01-01', L.dayPillarFromJDN(2451545).name, 'Mậu Ngọ');
eq('Can chi ngày 2024-02-10', L.analyze(10, 2, 2024).dayPillar.name, 'Giáp Thìn');
eq('Can chi ngày 2025-01-29', L.analyze(29, 1, 2025).dayPillar.name, 'Mậu Tuất');
eq('jdToDate vòng', L.jdToDate(L.jdFromDate(29, 2, 2024)), { day: 29, month: 2, year: 2024 });

// 2. Mùng 1 Tết (UTC+7)
const tet = [[5, 2, 2019], [25, 1, 2020], [12, 2, 2021], [1, 2, 2022], [22, 1, 2023], [10, 2, 2024], [29, 1, 2025], [17, 2, 2026], [6, 2, 2027]];
tet.forEach(([d, m, y]) => {
  const r = L.solarToLunar(d, m, y);
  eq('Tết ' + y, [r.day, r.month, r.year, r.leap], [1, 1, y, false]);
});
// Ngày trước Tết 2024 phải là 30 hoặc 29 tháng Chạp
const pre = L.solarToLunar(9, 2, 2024);
eq('Trước Tết 2024', [pre.month, pre.year], [12, 2023]);

// 3. Tháng nhuận
[[22, 3, 2023, 2], [25, 7, 2025, 6], [23, 5, 2020, 4]].forEach(([d, m, y, lm]) => {
  const r = L.solarToLunar(d, m, y);
  eq('Mùng 1 nhuận ' + lm + '/' + y, [r.day, r.month, r.year, r.leap], [1, lm, y, true]);
});

// 4. Khác biệt UTC+7 và UTC+8: Tết 1968 Việt Nam 29/1, Trung Quốc 30/1
const vn = L.solarToLunar(29, 1, 1968, 7), cn = L.solarToLunar(29, 1, 1968, 8);
eq('Tết 1968 theo UTC+7', [vn.day, vn.month], [1, 1]);
eq('29/1/1968 theo UTC+8 là tháng Chạp', cn.month, 12);

// 5. Lập xuân (giờ công bố UTC+8 trừ 1 giờ = UTC+7); cho phép lệch 10 phút
function lapXuanMinutes(y) {
  const t = L.jdToLocal(L.lapXuanJD(y, 7), 7);
  return t;
}
[[2024, 4, 15, 27], [2006, 4, 6, 27], [1984, 4, 22, 18]].forEach(([y, d, h, mi]) => {
  const t = lapXuanMinutes(y);
  eq('Lập xuân ' + y + ' ngày', [t.month, t.day], [2, d]);
  near('Lập xuân ' + y + ' giờ', t.hour * 60 + t.minute, h * 60 + mi, 10);
});

// 6. Can chi năm: hai mốc
const a1960 = L.analyze(1, 2, 1960);
eq('1/2/1960 theo Tết', a1960.yearPillar.byTet.name, 'Canh Tý');
eq('1/2/1960 theo Lập xuân', a1960.yearPillar.byLapXuan.name, 'Kỷ Hợi');
eq('1/2/1960 hai mốc khác nhau', a1960.yearPillar.differ, true);
const a2024 = L.analyze(10, 2, 2024);
eq('10/2/2024 năm', a2024.yearPillar.byTet.name, 'Giáp Thìn');
eq('10/2/2024 hai mốc trùng', a2024.yearPillar.differ, false);
// Ngày giữa Lập xuân (3/2/2021) và Tết (12/2/2021): hai mốc lệch nhau theo chiều ngược lại
const a2021 = L.analyze(10, 2, 2021);
eq('10/2/2021: Tết cho Canh Tý', a2021.yearPillar.byTet.name, 'Canh Tý');
eq('10/2/2021: Lập xuân cho Tân Sửu', a2021.yearPillar.byLapXuan.name, 'Tân Sửu');
eq('10/2/2021: hai mốc khác nhau', a2021.yearPillar.differ, true);

// Năm 1985: Việt Nam (UTC+7) Tết 21/1, Trung Quốc (UTC+8) Tết 20/2, lệch cả một tháng.
// Đối chiếu độc lập: các trang lịch Việt (xemlicham.com, baonghean.vn) và Wikipedia "Vietnamese calendar".
const vn85 = L.solarToLunar(21, 1, 1985, 7), cn85 = L.solarToLunar(20, 2, 1985, 8);
eq('Tết 1985 theo UTC+7 là 21/1', [vn85.day, vn85.month, vn85.year, vn85.leap], [1, 1, 1985, false]);
eq('Tết 1985 theo UTC+8 là 20/2', [cn85.day, cn85.month, cn85.year, cn85.leap], [1, 1, 1985, false]);
const cnLeap = L.solarToLunar(23, 11, 1984, 8);
eq('1984 theo UTC+8 có nhuận tháng 10', [cnLeap.month, cnLeap.leap], [10, true]);

// 7. Can chi tháng (theo Tiết)
eq('Tháng 10/2/2024', a2024.monthPillar.name, 'Bính Dần');
eq('Tháng 1/2/2024 (trước Lập xuân)', L.analyze(1, 2, 2024).monthPillar.name, 'Ất Sửu');
eq('Tháng 5/3/2024 (sau Kinh trập)', L.analyze(10, 3, 2024).monthPillar.name, 'Đinh Mão');
eq('Tháng 15/12/2023', L.analyze(15, 12, 2023).monthPillar.name, 'Giáp Tý');

// 8. Giờ: Ngũ thử độn
eq('Ngày Giáp giờ Tý', L.hourPillar(0, 0).name, 'Giáp Tý');
eq('Ngày Giáp giờ Ngọ', L.hourPillar(0, 12).name, 'Canh Ngọ');
eq('Ngày Ất giờ Ngọ', L.hourPillar(1, 12).name, 'Nhâm Ngọ');
eq('Ngày Mậu giờ Hợi', L.hourPillar(4, 21).name, 'Quý Hợi');
const h23 = L.analyze(10, 2, 2024, 23, 30);
eq('23h có 2 cách', h23.hourPillars.length, 2);
eq('23h ngày Giáp Thìn cách 1', h23.hourPillars[0].pillar.name, 'Giáp Tý');
eq('23h cách 2 (ngày Ất Tỵ)', h23.hourPillars[1].pillar.name, 'Bính Tý');

// 9. Tiết trong ngày
const t4 = L.analyze(4, 2, 2024);
eq('Có Tiết Lập xuân ngày 4/2/2024', t4.tietToday.map(x => x.name), ['Lập xuân']);
eq('Ngày thường không có Tiết', L.analyze(10, 2, 2024).tietToday.length, 0);

console.log('\n' + pass + ' đạt, ' + fail + ' lỗi');
process.exit(fail ? 1 : 0);
