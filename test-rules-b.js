// Chạy: node test-rules-b.js
// Mỗi kỳ vọng dựa trên câu Hiệp kỷ đã đối chiếu văn bản thô (xem RulesB.SOURCES), hoặc suy trực tiếp từ câu đó.
const L = require('./lich-core.js');
const R = require('./rules-b.js');
let pass = 0, fail = 0;
function eq(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); }
}
const A = (d, m, y, h, mi) => L.analyze(d, m, y, h, mi);
const C = R.CHI;

// --- Bảng khởi Thanh Long (HK7) ---
const start = [[2, 0], [8, 0], [3, 2], [9, 2], [4, 4], [10, 4], [5, 6], [11, 6], [0, 8], [6, 8], [1, 10], [7, 10]];
start.forEach(([b, s]) => eq('Thanh Long khởi ở ' + C[s] + ' khi khóa là ' + C[b], R.thanhLongStart(b), s));

// --- 12 Trực (HK4) ---
// Tháng Dần: ngày Dần là Kiến. 8/2/2024 là ngày Dần, sau Lập xuân 4/2/2024.
eq('Ngày 8/2/2024 là Dần', A(8, 2, 2024).dayPillar.branch, 2);
eq('8/2/2024 Trực Kiến', R.evaluate(A(8, 2, 2024)).truc[0].truc.vi, 'Kiến');
eq('9/2/2024 Trực Trừ', R.evaluate(A(9, 2, 2024)).truc[0].truc.vi, 'Trừ');
eq('10/2/2024 Trực Mãn', R.evaluate(A(10, 2, 2024)).truc[0].truc.vi, 'Mãn');
eq('Thứ tự 12 Trực', R.TRUC.map(t => t.vi), ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế']);
// Phân loại cát/hung theo 考原曰
const cat = {}; R.TRUC.forEach((t, i) => cat[t.vi] = R.trucOf(i, 0).loai);
eq('Cát: Trừ Nguy Định Chấp Thành Khai', ['Trừ', 'Nguy', 'Định', 'Chấp', 'Thành', 'Khai'].every(v => cat[v] === 'cát'), true);
eq('Hung: Kiến Phá Bình Thu Mãn Bế', ['Kiến', 'Phá', 'Bình', 'Thu', 'Mãn', 'Bế'].every(v => cat[v] === 'hung'), true);

// Ngày giao tiết lặp hai ngày liền (HK4 "疊兩值日"): Lập xuân 4/2/2024 (ngày Tuất)
const t3 = R.evaluate(A(3, 2, 2024)).truc[0].truc.vi;
const t5 = R.evaluate(A(5, 2, 2024)).truc[0].truc.vi;
const e4 = R.evaluate(A(4, 2, 2024));
eq('4/2/2024 là ngày giao tiết', e4.tietDay, true);
eq('Ngày giao tiết có hai cách', e4.truc.length, 2);
eq('Cách 1 (tháng mới): trùng ngày trước', e4.truc[0].truc.vi, t3);
eq('Cách 2 (tháng cũ): trùng ngày sau', e4.truc[1].truc.vi, t5);

// --- Hoàng đạo (HK7): tháng Dần, ngày Tý là Thanh Long, ngày Sửu là Minh Đường ---
eq('6/2/2024 là Tý', A(6, 2, 2024).dayPillar.branch, 0);
eq('Tháng Dần ngày Tý: Thanh Long', R.evaluate(A(6, 2, 2024)).hoangDao[0].than.vi, 'Thanh Long');
eq('Tháng Dần ngày Sửu: Minh Đường', R.evaluate(A(7, 2, 2024)).hoangDao[0].than.vi, 'Minh Đường');
eq('Tháng Dần ngày Dần: Thiên Hình (hắc đạo)', [R.evaluate(A(8, 2, 2024)).hoangDao[0].than.vi, R.evaluate(A(8, 2, 2024)).hoangDao[0].than.loai], ['Thiên Hình', 'hắc đạo']);
eq('Thứ tự 12 thần', R.THAN.map(t => t.vi), ['Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Thiên Đức', 'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Huyền Vũ', 'Tư Mệnh', 'Câu Trần']);
eq('Hoàng đạo gồm 6 thần', R.THAN.filter(t => t.hoang).map(t => t.vi), ['Thanh Long', 'Minh Đường', 'Kim Quỹ', 'Thiên Đức', 'Ngọc Đường', 'Tư Mệnh']);

// --- Giờ Hoàng đạo (HK7: ngày Tý, giờ Thân khởi Thanh Long, giờ Dậu là Minh Đường) ---
const gTy = R.gioHoangDao(0);
eq('Ngày Tý giờ Thân Thanh Long', gTy[8].than, 'Thanh Long');
eq('Ngày Tý giờ Dậu Minh Đường', gTy[9].than, 'Minh Đường');
eq('Ngày Tý, giờ hoàng đạo', gTy.filter(g => g.loai === 'hoàng đạo').map(g => g.chi), ['Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu']);
eq('Ngày Ngọ giống ngày Tý', R.gioHoangDao(6).map(g => g.than), gTy.map(g => g.than));
eq('Khoảng giờ Tý', gTy[0].khoang, '23h-01h');
eq('Khoảng giờ Ngọ', gTy[6].khoang, '11h-13h');

// --- Tam sát, Thái tuế, Tuế phá (HK3, HK8) ---
const y = n => R.huongNam(((n - 4) % 12 + 12) % 12);
eq('2024 Thìn: Tam sát Tỵ Ngọ Mùi, hướng Nam', [y(2024).tamSat.chi, y(2024).tamSat.huong], [['Tỵ', 'Ngọ', 'Mùi'], 'Nam']);
eq('2025 Tỵ: Tam sát Dần Mão Thìn, hướng Đông', [y(2025).tamSat.chi, y(2025).tamSat.huong], [['Dần', 'Mão', 'Thìn'], 'Đông']);
eq('2026 Ngọ: Tam sát Hợi Tý Sửu, hướng Bắc', [y(2026).tamSat.chi, y(2026).tamSat.huong], [['Hợi', 'Tý', 'Sửu'], 'Bắc']);
eq('2027 Mùi: Tam sát Thân Dậu Tuất, hướng Tây', [y(2027).tamSat.chi, y(2027).tamSat.huong], [['Thân', 'Dậu', 'Tuất'], 'Tây']);
// Kiếp sát/Tai sát/Tuế sát theo HK3 và phần mô tả
eq('Kiếp sát Thân-Tý-Thìn ở Tỵ', y(2024).tamSat.chi[0], 'Tỵ');
eq('Tai sát Thân-Tý-Thìn ở Ngọ', y(2024).tamSat.chi[1], 'Ngọ');
eq('Tuế sát Dần-Ngọ-Tuất ở Sửu', y(2026).tamSat.chi[2], 'Sửu');
eq('Kiếp sát Tỵ-Dậu-Sửu ở Dần', y(2025).tamSat.chi[0], 'Dần');
eq('Tuế phá 2024 ở Tuất', y(2024).tuePha.chi, 'Tuất');
eq('Thái tuế 2024 ở Thìn', y(2024).thaiTue.chi, 'Thìn');
eq('Tuế phá luôn xung Thái tuế', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].every(b => (C.indexOf(R.huongNam(b).tuePha.chi) - b + 12) % 12 === 6), true);

// --- Quan hệ địa chi ---
eq('Tý-Ngọ xung', R.relations(0, 6), ['lục xung']);
eq('Tý-Sửu hợp', R.relations(0, 1), ['lục hợp']);
eq('Thân-Tý tam hợp', R.relations(8, 0), ['tam hợp']);
eq('Tý-Mùi hại', R.relations(0, 7), ['tương hại']);
eq('Tý-Mão hình', R.relations(0, 3), ['tương hình']);
eq('Dần-Tỵ hình và hại', R.relations(2, 5), ['tương hại', 'tương hình']);
eq('Thìn-Thìn tự hình', R.relations(4, 4), ['tự hình']);
eq('Tý-Tý không quan hệ', R.relations(0, 0), []);

// --- Năm hai mốc ---
const e60 = R.evaluate(A(1, 2, 1960));
eq('1/2/1960 hiện hai mốc', e60.nam.map(n => n.moc + ':' + n.nam), ['Lập xuân:Kỷ Hợi', 'Tết:Canh Tý']);
const e24 = R.evaluate(A(10, 2, 2024));
eq('10/2/2024 chỉ một mốc', e24.nam.length, 1);

// --- Nguồn có đủ cho mọi mục ---
eq('Mọi nguồn có trạng thái xác minh', Object.keys(R.SOURCES).every(k => !!R.SOURCES[k].verified), true);
const ev = R.evaluate(A(10, 2, 2024));
eq('Mã nguồn đều tồn tại', [].concat.apply([], Object.keys(ev.sources).map(k => ev.sources[k])).every(id => R.SOURCES[id]), true);

console.log('\n' + pass + ' đạt, ' + fail + ' lỗi');
process.exit(fail ? 1 : 0);
