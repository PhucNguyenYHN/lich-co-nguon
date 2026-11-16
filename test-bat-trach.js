// Chạy: node test-bat-trach.js
const L = require('./lich-core.js');
const B = require('./bat-trach.js');
let pass = 0, fail = 0;
function eq(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log('FAIL', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); }
}

// --- Bảng 8 hướng của Càn (nguồn: masterseanchan Kua 6) ---
const can = {};
B.tamHuong(6).forEach(d => can[d.ten] = d.huong);
eq('Càn: Sinh khí Tây', can['Sinh khí'], 'Tây');
eq('Càn: Thiên y Đông Bắc', can['Thiên y'], 'Đông Bắc');
eq('Càn: Diên niên Tây Nam', can['Diên niên'], 'Tây Nam');
eq('Càn: Phục vị Tây Bắc', can['Phục vị'], 'Tây Bắc');
eq('Càn: Họa hại Đông Nam', can['Họa hại'], 'Đông Nam');
eq('Càn: Ngũ quỷ Đông', can['Ngũ quỷ'], 'Đông');
eq('Càn: Lục sát Bắc', can['Lục sát'], 'Bắc');
eq('Càn: Tuyệt mệnh Nam', can['Tuyệt mệnh'], 'Nam');

// --- Khảm (bảng chuẩn thường gặp; chưa có nguồn đọc được, kiểm để phát hiện suy luận sai) ---
const kh = {};
B.tamHuong(1).forEach(d => kh[d.ten] = d.huong);
eq('Khảm: Sinh khí Đông Nam', kh['Sinh khí'], 'Đông Nam');
eq('Khảm: Thiên y Đông', kh['Thiên y'], 'Đông');
eq('Khảm: Diên niên Nam', kh['Diên niên'], 'Nam');
eq('Khảm: Phục vị Bắc', kh['Phục vị'], 'Bắc');
eq('Khảm: Tuyệt mệnh Tây Nam', kh['Tuyệt mệnh'], 'Tây Nam');
eq('Khảm: Ngũ quỷ Đông Bắc', kh['Ngũ quỷ'], 'Đông Bắc');
eq('Khảm: Lục sát Tây Bắc', kh['Lục sát'], 'Tây Bắc');
eq('Khảm: Họa hại Tây', kh['Họa hại'], 'Tây');

// --- Bất biến cấu trúc ---
[1, 2, 3, 4, 6, 7, 8, 9].forEach(q => {
  const t = B.tamHuong(q);
  const hs = t.map(d => d.huong);
  eq('Quái ' + q + ': đủ 8 hướng khác nhau', new Set(hs).size, 8);
  eq('Quái ' + q + ': Phục vị là chính hướng quái', t.find(d => d.ten === 'Phục vị').huong, B.QUAI[q].huong);
  const nhom = B.QUAI[q].nhom;
  eq('Quái ' + q + ': bốn hướng cát đều cùng nhóm ' + nhom, t.filter(d => d.loai === 'cát').every(d => {
    const k = Object.keys(B.QUAI).find(x => B.QUAI[x].huong === d.huong); return B.QUAI[k].nhom === nhom; }), true);
  eq('Quái ' + q + ': bốn hướng hung đều thuộc nhóm kia', t.filter(d => d.loai === 'hung').every(d => {
    const k = Object.keys(B.QUAI).find(x => B.QUAI[x].huong === d.huong); return B.QUAI[k].nhom !== nhom; }), true);
});

// --- Cung phi ---
eq('Nam 1990', B.cungPhi(1990, 'nam').quai, 'Khảm');
eq('Nữ 1990', B.cungPhi(1990, 'nu').quai, 'Cấn'); // 4 + 1 = 5 -> gửi Cấn
eq('Nữ 1990 đánh dấu gửi cung', B.cungPhi(1990, 'nu').guiCung, true);
eq('Nam 1984', B.cungPhi(1984, 'nam').quai, 'Đoài');
eq('Nữ 1984', B.cungPhi(1984, 'nu').quai, 'Cấn');
// số 5: nam gửi Khôn, nữ gửi Cấn. Nam sinh có s = 6: ví dụ 1986 (1+9+8+6=24 -> 6) => 11 - 6 = 5
const n86 = B.cungPhi(1986, 'nam');
eq('Nam 1986 ra số 5 gửi Khôn', [n86.soGoc, n86.quai, n86.guiCung], [5, 'Khôn', true]);
eq('Nam 2000', B.cungPhi(2000, 'nam').quai, 'Ly');   // 11 - 2 = 9; nguồn A: 9 - 0 = 9
eq('Nữ 2000', B.cungPhi(2000, 'nu').quai, 'Càn');    // 4 + 2 = 6; nguồn A: 6 + 0 = 6

// --- Hai dạng công thức (nguồn A và C) có trùng nhau với mọi năm 1900-2099? ---
let lech = [];
for (let y = 1900; y <= 2099; y++) ['nam', 'nu'].forEach(g => {
  if (B.cungPhiSo(y, g) !== B.cungPhiSoDangA(y, g)) lech.push(y + g);
});
eq('Công thức gộp = công thức tách (1900-2099), số năm lệch', lech.length, 0);
if (lech.length) console.log('  lệch:', lech.slice(0, 10).join(', '));

// --- Đông/Tây tứ mệnh ---
eq('Đông tứ mệnh', [1, 3, 4, 9].every(q => B.QUAI[q].nhom === 'Đông'), true);
eq('Tây tứ mệnh', [2, 6, 7, 8].every(q => B.QUAI[q].nhom === 'Tây'), true);

// --- Nhà: hai cách trạch quái ---
const person = B.cungPhi(1990, 'nam'); // Khảm, Đông tứ mệnh
const ph = { label: 'x', quaiSo: person.quaiSo, nhom: person.nhom, quai: person.quai, tamHuong: B.tamHuong(person.quaiSo) };
const nha = B.danhGiaNha([ph], { toa: 'Bắc', cua: 'Nam' });
eq('Hai cách trạch quái', nha.map(x => x.cach), ['theo tọa nhà', 'theo hướng cửa chính (khí khẩu)']);
eq('Tọa Bắc: Khảm trạch', nha[0].trachQuai, 'Khảm');
eq('Cửa Nam: Ly trạch (cách khí khẩu)', nha[1].trachQuai, 'Ly');
eq('Người Khảm hợp Khảm trạch', nha[0].hopNhom, true);
eq('Người Khảm, cửa Nam là Diên niên', nha[0].huongCuaDoiVoiNguoi.ten, 'Diên niên');
eq('Chỉ có tọa thì cửa suy ra từ tọa', B.danhGiaNha([ph], { toa: 'Bắc' })[0].huongCuaDoiVoiNguoi.huong, 'Nam');
eq('Nhà tọa Nam, nhà hướng Bắc (đối nhau)', B.nhaTheoTa('Nam').huongNha, 'Bắc');
eq('Người Khảm ở nhà Tây trạch (tọa Tây) không hợp', B.danhGiaNha([ph], { toa: 'Tây' })[0].hopNhom, false);

// --- Bàn làm việc ---
const bl = B.banLamViec(B.tamHuong(1));
eq('Bàn: Khảm có 4 hướng tốt', bl.matNhinVe.length, 4);
eq('Bàn: Sinh khí Đông Nam gắn tài lộc', bl.matNhinVe[0].mucDich.indexOf('tài lộc') >= 0, true);
eq('Bàn: hai cách hiểu cùng độ dài', bl.lungTuaVao.length, 4);
eq('Bàn: lưng tựa Đông Nam thì mặt nhìn Tây Bắc', bl.lungTuaVao[0].tuongUngMatNhin, 'Tây Bắc');

// --- Hai mốc năm sinh ---
const b60 = L.analyze(1, 2, 1960); // Tết 28/1/1960, Lập xuân 5/2/1960
const e60 = B.evaluate(b60, 'nam');
eq('1/2/1960 hiện hai mốc', e60.ketQua.map(r => r.moc + ':' + r.namSinh), ['Lập xuân:1959', 'Tết:1960']);
eq('1/2/1960 nam: 1959 Khôn? (11 - 6 = 5 gửi Khôn)', [e60.ketQua[0].cungPhi.soGoc, e60.ketQua[0].cungPhi.quai], [5, 'Khôn']);
eq('1/2/1960 nam theo Tết (1960): 11 - 7 = 4 Tốn', [e60.ketQua[1].cungPhi.soGoc, e60.ketQua[1].cungPhi.quai], [4, 'Tốn']);
const b90 = B.evaluate(L.analyze(10, 6, 1990), 'nam');
eq('10/6/1990 chỉ một mốc', b90.ketQua.length, 1);

// --- Nguồn ---
eq('Mọi mã nguồn tồn tại', b90.sources.every(id => !!B.SOURCES[id]), true);

console.log('\n' + pass + ' đạt, ' + fail + ' lỗi');
process.exit(fail ? 1 : 0);
