// Chạy: node test-bat-tu-viec.js
const L = require('./lich-core.js');
const T = require('./bat-tu.js');
const V = require('./viec.js');
let pass = 0, fail = 0;
function eq(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); }
}

// --- Nạp âm: hành theo tên, theo công thức quen dùng, theo Hiệp kỷ q.1 phải trùng nhau cho 60 trụ ---
let lech = [];
for (let n = 0; n < 60; n++) {
  const s = n % 10, b = n % 12;
  const a1 = T.napAm(s, b).hanh, a2 = T.napAmHanhCongThuc(s, b), a3 = T.napAmHanhHiepKy(s, b);
  if (a1 !== a2 || a1 !== a3) lech.push(n + ':' + a1 + '/' + a2 + '/' + a3);
}
eq('Hành nạp âm: tên = công thức = Hiệp kỷ (60 trụ), số trụ lệch', lech.length, 0);
if (lech.length) console.log('  lệch:', lech.slice(0, 8).join(' '));
eq('Giáp Tý Hải trung kim', T.napAm(0, 0).ten, 'Hải trung kim');
eq('Ất Sửu cùng cặp', T.napAm(1, 1).ten, 'Hải trung kim');
eq('Nhâm Tuất Đại hải thủy', T.napAm(8, 10).ten, 'Đại hải thủy');
eq('Quý Hợi cuối vòng', T.napAm(9, 11).ten, 'Đại hải thủy');
eq('Mỗi tên nạp âm xuất hiện đúng hai trụ', (() => { const c = {}; for (let n = 0; n < 60; n++) { const t = T.napAm(n % 10, n % 12).ten; c[t] = (c[t] || 0) + 1; } return Object.keys(c).length === 30 && Object.values(c).every(v => v === 2); })(), true);

// --- Thập thần (Giáp là nhật chủ) ---
const gi = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'].map((_, i) => T.thapThan(0, i));
eq('Thập thần của Giáp', gi, ['Tỷ kiên', 'Kiếp tài', 'Thực thần', 'Thương quan', 'Thiên tài', 'Chính tài', 'Thất sát', 'Chính quan', 'Thiên ấn', 'Chính ấn']);
eq('Thập thần của Canh (Canh thấy Giáp là Thiên tài)', T.thapThan(6, 0), 'Thiên tài');
eq('Mọi cặp can cho ra mười tên thập thần', (() => { const s = new Set(); for (let i = 0; i < 10; i++) s.add(T.thapThan(4, i)); return s.size; })(), 10);

// --- Bát tự một ngày: 10/2/2024 giờ Thìn (8h) ---
const a = L.analyze(10, 2, 2024, 8, 0);
const bt = T.baTu(a, true);
eq('Trụ năm Giáp Thìn', bt.bien[0].tru[0].name, 'Giáp Thìn');
eq('Trụ tháng Bính Dần', bt.bien[0].tru[1].name, 'Bính Dần');
eq('Trụ ngày Giáp Thìn', bt.bien[0].tru[2].name, 'Giáp Thìn');
eq('Trụ giờ Mậu Thìn (ngày Giáp, giờ Thìn)', bt.bien[0].tru[3].name, 'Mậu Thìn');
eq('Nhật chủ Giáp Mộc dương', [bt.nhatChu.can, bt.nhatChu.hanh, bt.nhatChu.amDuong], ['Giáp', 'Mộc', 'dương']);
eq('Tám chữ', bt.bien[0].soChu, 8);
eq('Tổng ngũ hành là 8', Object.values(bt.bien[0].demHanh).reduce((x, y) => x + y, 0), 8);
eq('Không nhập giờ thì sáu chữ', T.baTu(L.analyze(10, 2, 2024), false).bien[0].soChu, 6);
eq('Giờ Tý muộn có hai bản', T.baTu(L.analyze(10, 2, 2024, 23, 30), true).bien.length, 2);
eq('Giữa Lập xuân và Tết có ghi trụ năm theo Tết', T.baTu(L.analyze(1, 2, 1960), false).namTheoTet, 'Canh Tý');
eq('Bát tự dùng Lập xuân cho trụ năm', T.baTu(L.analyze(1, 2, 1960), false).bien[0].tru[0].name, 'Kỷ Hợi');

// --- Việc nên/tránh theo Trực (Hiệp kỷ q.10) ---
const has = (list, vi) => list.some(x => x.vi === vi);
let conLai = '';
for (let i = 0; i < 12; i++) conLai += V.theoTruc(i).chuaNhanRa;
eq('Mọi chữ Hán trong danh sách gốc đều nhận ra', conLai, '');
const tr = i => V.theoTruc(i);
eq('Trừ nên giải trừ, chữa bệnh, tắm gội', ['Cúng giải trừ', 'Chữa bệnh', 'Tắm gội'].every(v => has(tr(1).nen, v)), true);
eq('Trừ không có việc kỵ riêng', tr(1).tranh.length, 0);
eq('Phá nên chữa bệnh và phá nhà', has(tr(6).nen, 'Chữa bệnh') && has(tr(6).nen, 'Phá nhà, tháo tường'), true);
eq('Phá kỵ cưới gả, động thổ, an táng', ['Cưới gả', 'Khởi công, động thổ', 'An táng'].every(v => has(tr(6).tranh, v)), true);
eq('Nguy nên kê giường; không có việc kỵ riêng', has(tr(7).nen, 'Kê giường') && tr(7).tranh.length === 0, true);
eq('Khai nên khai trương và động thổ', has(tr(10).nen, 'Khai trương') && has(tr(10).nen, 'Khởi công, động thổ'), true);
eq('Khai kỵ an táng, đốn cây', has(tr(10).tranh, 'An táng') && has(tr(10).tranh, 'Đốn cây'), true);
eq('Bế nên đắp đê', has(tr(11).nen, 'Đắp đê, đắp bờ'), true);
eq('Bình có danh sách "chỉ không kỵ" từ chính sách', tr(3).khongKy.length > 0 && has(tr(3).khongKy, 'Cúng tế'), true);
eq('Thành nên nhập học', has(tr(8).nen, 'Nhập học'), true);
eq('Trực có điều kiện ngoại lệ trong sách: Kiến, Mãn, Bình, Phá, Thu, Bế', [0, 2, 3, 6, 9, 11].every(i => tr(i).coNgoaiLe), true);
eq('Trực không ghi điều kiện ngoại lệ: Trừ, Định, Chấp, Nguy, Thành, Khai', [1, 4, 5, 7, 8, 10].every(i => !tr(i).coNgoaiLe), true);
eq('Kỵ của Mãn không có việc ngoài danh sách', tr(2).tranh.every(x => x.nhom), true);
eq('Điều kiện ngoại lệ là chữ Hán nguyên văn', /[一-鿿]/.test(tr(3).dieuKien[0]), true);

console.log('\n' + pass + ' đạt, ' + fail + ' lỗi');
process.exit(fail ? 1 : 0);
