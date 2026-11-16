// Chạy: node test-tuoi-nha.js
const L = require('./lich-core.js');
const T = require('./tuoi-nha.js');
let pass = 0, fail = 0;
function eq(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); }
}

// Kim Lâu: dư 1,3,6,8 phạm (dienmayxanh, vnreview)
[1, 3, 6, 8, 10, 12, 15, 17, 19, 21].forEach(t => eq('Kim Lâu phạm ở tuổi mụ ' + t, T.kimLau(t).pham, true));
[2, 4, 5, 7, 9, 18, 27, 36].forEach(t => eq('Kim Lâu không phạm ở tuổi mụ ' + t, T.kimLau(t).pham, false));
eq('Dư 1 là Kim Lâu Thân', T.kimLau(10).ten, 'Kim Lâu Thân');
eq('Dư 3 là Kim Lâu Thê', T.kimLau(12).ten, 'Kim Lâu Thê');
eq('Dư 6 là Kim Lâu Tử', T.kimLau(15).ten, 'Kim Lâu Tử');
eq('Dư 8 là Kim Lâu Súc', T.kimLau(17).ten, 'Kim Lâu Súc');

// Hoang Ốc: ví dụ trong nguồn batdongsan: 26 = Nhì Nghi; 28 -> Tứ Tấn Tài; 10 = Nhất Cát; 60 = Lục Hoang Ốc
eq('Tuổi 10 Nhất Cát', T.hoangOc(10).ten, 'Nhất Cát');
eq('Tuổi 20 Nhì Nghi', T.hoangOc(20).ten, 'Nhì Nghi');
eq('Tuổi 30 Tam Địa Sát', T.hoangOc(30).ten, 'Tam Địa Sát');
eq('Tuổi 40 Tứ Tấn Tài', T.hoangOc(40).ten, 'Tứ Tấn Tài');
eq('Tuổi 50 Ngũ Thọ Tử', T.hoangOc(50).ten, 'Ngũ Thọ Tử');
eq('Tuổi 60 Lục Hoang Ốc', T.hoangOc(60).ten, 'Lục Hoang Ốc');
eq('Tuổi 70 lại Nhất Cát', T.hoangOc(70).ten, 'Nhất Cát');
eq('Tuổi 26 Nhì Nghi', T.hoangOc(26).ten, 'Nhì Nghi');
eq('Tuổi 28 Tứ Tấn Tài', T.hoangOc(28).ten, 'Tứ Tấn Tài');
// Hai cách đếm có trùng nhau mọi tuổi 1-99? (nguon/tuoi.md ghi là chưa kiểm)
let lech = [];
for (let t = 1; t <= 99; t++) if (T.hoangOcIdx(t) !== T.hoangOcIdxCongChuSo(t)) lech.push(t);
eq('Hai cách đếm Hoang Ốc trùng nhau tuổi 1-99, số tuổi lệch', lech.length, 0);

// Tam tai theo nguồn (nguoiquansat): Dần-Ngọ-Tuất hạn Thân-Dậu-Tuất; Hợi-Mão-Mùi hạn Tỵ-Ngọ-Mùi;
// Thân-Tý-Thìn hạn Dần-Mão-Thìn; Tỵ-Dậu-Sửu hạn Hợi-Tý-Sửu
const C = T.CHI;
eq('Tý: Dần Mão Thìn', T.tamTai(0, 2).cacNam, ['Dần', 'Mão', 'Thìn']);
eq('Hợi: Tỵ Ngọ Mùi', T.tamTai(11, 5).cacNam, ['Tỵ', 'Ngọ', 'Mùi']);
eq('Ngọ: Thân Dậu Tuất', T.tamTai(6, 8).cacNam, ['Thân', 'Dậu', 'Tuất']);
eq('Dậu: Hợi Tý Sửu', T.tamTai(9, 11).cacNam, ['Hợi', 'Tý', 'Sửu']);
eq('Tuổi Tý, năm Thìn là năm thứ 3', T.tamTai(0, 4).namThu, 3);
eq('Tuổi Tý, năm Tý không phạm', T.tamTai(0, 0).pham, false);
// Cả bốn nhóm: mọi tuổi trong nhóm cho cùng ba năm
[[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]].forEach(g => {
  const ref = JSON.stringify(T.tamTai(g[0], 0).cacNam);
  eq('Nhóm ' + g.map(i => C[i]).join('-') + ' cùng ba năm', g.every(c => JSON.stringify(T.tamTai(c, 0).cacNam) === ref), true);
});

// Tổng hợp: người sinh 1984 (Tý) làm nhà năm 2024 (Thìn), khởi công 10/6/2024
const b = L.analyze(10, 6, 1984), c = L.analyze(10, 6, 2024);
const e = T.evaluate(b, c);
eq('1984, khởi công 2024: một mốc', e.ketQua.length, 1);
eq('Tuổi mụ 41', e.ketQua[0].tuoiMu, 41);
eq('Tam tai: 2024 là năm thứ 3 của tuổi Tý', e.ketQua[0].tamTai.namThu, 3);
eq('Kim Lâu: 41 chia 9 dư 5, không phạm', e.ketQua[0].kimLau.pham, false);
// Giữa Tết và Lập xuân: sinh 1/2/1960 khởi công 10/2/2021 -> hai mốc, hai kết quả
const e2 = T.evaluate(L.analyze(1, 2, 1960), L.analyze(10, 2, 2021));
eq('Hai mốc', e2.ketQua.map(r => r.moc + ':' + r.tuoiMu), ['Lập xuân:63', 'Tết:61']); // 2021-1959+1 và 2020-1960+1
eq('Mọi mã nguồn tồn tại', e.sources.every(id => !!T.SOURCES[id]), true);

console.log('\n' + pass + ' đạt, ' + fail + ' lỗi');
process.exit(fail ? 1 : 0);
