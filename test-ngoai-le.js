'use strict';
const N = require('./ngoai-le.js');
const V = require('./viec.js');
let pass = 0, fail = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log('FAIL:', msg); } }
function eq(a, b, msg) { ok(a === b, msg + ' (được ' + a + ', mong ' + b + ')'); }
const G = { Giap: 0, At: 1, Binh: 2, Dinh: 3, Mau: 4, Ky: 5, Canh: 6, Tan: 7, Nham: 8, Quy: 9 };
const names = d => N.ducNames(d).map(x => x.han).sort().join(',');

// ---- bảng sao đức, theo q.5 ----
// tháng Dần (2): Thiên Đức = Đinh, Nguyệt Đức = Bính, Đức hợp Nhâm / Tân, Nguyệt Ân = Bính, Tứ Tướng Bính Đinh
eq(names(N.ducOf(2, G.Dinh, 3)), '四相,天德', 'Dần: Đinh Mão = Thiên Đức + Tứ Tướng');
eq(names(N.ducOf(2, G.Binh, 0)), '四相,月德,月恩', 'Dần: Bính Tý = Nguyệt Đức, Nguyệt Ân, Tứ Tướng');
eq(names(N.ducOf(2, G.Nham, 0)), '天德合', 'Dần: Nhâm = Thiên Đức hợp');
eq(names(N.ducOf(2, G.Tan, 1)), '月德合', 'Dần: Tân = Nguyệt Đức hợp');
// Thiên Đức tháng Mão (仲月) = 坤 -> Thân (chi); không có Thiên Đức hợp
eq(N.ducOf(3, G.Giap, 8).thienDuc, true, 'Mão: ngày chi Thân = Thiên Đức');
eq(N.ducOf(3, G.Giap, 9).thienDuc, undefined, 'Mão: ngày chi Dậu không có Thiên Đức');
for (const mb of [3, 6, 9, 0]) for (let s = 0; s < 10; s++) ok(!N.ducOf(mb, s, 5).thienDucHop, 'tháng tứ trọng không có Thiên Đức hợp');
// Thiên Xá
eq(N.ducOf(2, G.Mau, 2).thienXa, true, 'xuân: Mậu Dần = Thiên Xá');
eq(N.ducOf(6, G.Giap, 6).thienXa, true, 'hạ: Giáp Ngọ = Thiên Xá');
eq(N.ducOf(9, G.Mau, 8).thienXa, true, 'thu: Mậu Thân = Thiên Xá');
eq(N.ducOf(0, G.Giap, 0).thienXa, true, 'đông: Giáp Tý = Thiên Xá');
eq(N.ducOf(2, G.Giap, 0).thienXa, undefined, 'xuân: Giáp Tý không phải Thiên Xá');
// Thiên Nguyện (bảng Hiệp kỷ chỉnh): tháng Dần Ất Hợi, tháng Hợi Nhâm Dần
eq(N.ducOf(2, G.At, 11).thienNguyen, true, 'Dần: Ất Hợi = Thiên Nguyện');
eq(N.ducOf(11, G.Nham, 2).thienNguyen, true, 'Hợi: Nhâm Dần = Thiên Nguyện');
// 12 tháng đều có đúng 1 ngày Thiên Nguyện trong 60 Giáp Tý
for (let mb = 0; mb < 12; mb++) {
  let c = 0; for (let i = 0; i < 60; i++) if (N.ducOf(mb, i % 10, i % 12).thienNguyen) c++;
  eq(c, 1, 'tháng ' + mb + ': 1 ngày Thiên Nguyện/60');
}
// Nguyệt Đức: mỗi tháng 6 ngày/60 (một can, 60/10), Thiên Xá mỗi tháng 1 ngày
for (let mb = 0; mb < 12; mb++) {
  let c = 0, x = 0; for (let i = 0; i < 60; i++) { const d = N.ducOf(mb, i % 10, i % 12); if (d.nguyetDuc) c++; if (d.thienXa) x++; }
  eq(c, 6, 'tháng ' + mb + ': Nguyệt Đức 6/60'); eq(x, 1, 'tháng ' + mb + ': Thiên Xá 1/60');
}
// Thời Đức: xuân Ngọ, hạ Thìn, thu Tý, đông Dần
eq(N.ducOf(2, G.Giap, 6).thoiDuc, true, 'xuân Ngọ'); eq(N.ducOf(5, G.Giap, 4).thoiDuc, true, 'hạ Thìn');
eq(N.ducOf(8, G.Giap, 0).thoiDuc, true, 'thu Tý'); eq(N.ducOf(11, G.Giap, 2).thoiDuc, true, 'đông Dần');

// ---- Kiến ----
let r = N.xet(0, 2, G.Binh, 2);   // tháng Dần, Bính Dần: Nguyệt Đức + Nguyệt Ân + Tứ Tướng
eq(r.trangThai, 'doi', 'Kiến tháng Dần Bính Dần có đức'); eq(r.ma, 'kien-duc', 'mã Kiến có đức');
r = N.xet(0, 2, G.Giap, 2);       // Giáp Dần, không đức
eq(r.trangThai, 'goc', 'Kiến tháng Dần không đức'); eq(r.jiThem, '出師', 'tháng Dần Kiến kỵ thêm xuất quân');
r = N.xet(0, 4, G.Canh, 4);       eq(r.trangThai, 'tat-ca-ky', 'Canh Thìn tháng Thìn = âm vị');
r = N.xet(0, 10, G.Giap, 10);     eq(r.trangThai, 'tat-ca-ky', 'Giáp Tuất tháng Tuất = âm vị');
r = N.xet(0, 3, G.Ky, 3);         eq(r.trangThai, 'tat-ca-ky', 'Kỷ Mão tháng Mão = tiểu hội');
r = N.xet(0, 6, G.Giap, 6);       eq(r.trangThai, 'tham-chieu', 'Kiến tháng Ngọ: nguyệt yếm + nguyệt hình');
ok(r.thamChieu.length === 2, 'tháng Ngọ tham chiếu hai sao');
r = N.xet(0, 0, G.Nham, 0);       eq(r.trangThai, 'tham-chieu', 'Kiến tháng Tý tham chiếu nguyệt yếm');
r = N.xet(0, 7, G.Ky, 7);         eq(r.ducs.some(x => x.key === 'nguyetDucHop'), true, 'Kỷ Mùi tháng Mùi có Nguyệt Đức hợp trong bảng');
ok(r.giaiThich.indexOf('dương thác') >= 0, 'Kỷ Mùi tháng Mùi: ghi chú dương thác');
r = N.xet(0, 7, G.Giap, 7);       eq(r.trangThai === 'doi' || r.trangThai === 'goc', true, 'Kiến tháng Mùi hợp lệ');

// ---- Mãn ----
r = N.xet(2, 4, G.Binh, 6);       eq(r.trangThai, 'tham-chieu', 'Mãn tháng Thìn -> tai sát');
r = N.xet(2, 5, G.Giap, 7);       eq(r.trangThai, 'tham-chieu', 'Mãn tháng Tỵ -> nguyệt yếm');
r = N.xet(2, 2, G.Binh, 4);       eq(r.trangThai, 'doi', 'Mãn tháng Dần có Nguyệt Đức'); eq(r.ji, '', 'ji rỗng = không kỵ');
r = N.xet(2, 2, G.Giap, 4);       eq(r.trangThai, 'goc', 'Mãn tháng Dần không đức');
r = N.xet(2, 8, G.Nham, 10);      // Thân: Nguyệt Đức = Nhâm
eq(r.ji, '祭祀', 'Mãn tháng Thân có đức vẫn kỵ tế tự');

// ---- Bình ----
r = N.xet(3, 11, G.Giap, 2);      eq(r.ma, 'binh-hoi', 'Bình tháng Hợi'); eq(r.ji, '安撫邊境選將訓兵出師求醫療病', 'danh sách kỵ Bình Hợi');
r = N.xet(3, 8, G.Giap, 11);      eq(r.trangThai, 'goc', 'Bình tháng Thân không đức như lệ thường');
r = N.xet(3, 8, G.Nham, 11);      eq(r.trangThai, 'doi', 'Bình tháng Thân có Nguyệt Đức (Nhâm)');
r = N.xet(3, 2, G.Giap, 5);       eq(r.trangThai, 'tham-chieu', 'Bình tháng Dần -> nguyệt hình');
r = N.xet(3, 4, G.Giap, 7);       eq(r.trangThai, 'tham-chieu', 'Bình tháng Thìn -> nguyệt sát');
r = N.xet(3, 3, G.Giap, 6);       eq(r.trangThai, 'trung-tinh', 'Bình tháng Mão có Nguyệt Đức (Giáp)');
r = N.xet(3, 6, G.Tan, 9);        eq(r.trangThai, 'trung-tinh', 'Bình tháng Ngọ có Nguyệt Đức hợp (Tân)');
r = N.xet(3, 6, G.Giap, 9);       eq(r.trangThai, 'goc', 'Bình tháng Ngọ không đức');

// ---- Phá ----
r = N.xet(6, 5, G.Quy, 11);       eq(r.trangThai, 'tat-ca-ky', 'Quý Hợi tháng Tỵ');
r = N.xet(6, 11, G.Dinh, 5);      eq(r.trangThai, 'tat-ca-ky', 'Đinh Tỵ tháng Hợi');
r = N.xet(6, 7, G.Quy, 1);        eq(r.trangThai, 'tat-ca-ky', 'Quý Sửu tháng Mùi');
r = N.xet(6, 1, G.Dinh, 7);       eq(r.trangThai, 'tat-ca-ky', 'Đinh Mùi tháng Sửu');
r = N.xet(6, 3, G.Giap, 9);       eq(r.trangThai, 'tat-ca-ky', 'Phá tháng Mão');
r = N.xet(6, 0, G.Giap, 6);       eq(r.trangThai, 'tat-ca-ky', 'Phá tháng Tý không đức');
r = N.xet(6, 0, G.Nham, 6);       eq(r.trangThai, 'doi', 'Phá tháng Tý có Nguyệt Đức (Nhâm)');
r = N.xet(6, 2, G.Giap, 8);       eq(r.trangThai, 'goc', 'Phá tháng Dần dùng danh sách gốc');
r = N.xet(6, 2, G.Binh, 8);       eq(r.trangThai, 'goc', 'Phá tháng Dần có đức vẫn gốc (猶忌之)');

// ---- Thu ----
r = N.xet(9, 2, G.Giap, 11);      eq(r.trangThai, 'tham-chieu', 'Thu tháng Dần -> kiếp sát');
r = N.xet(9, 3, G.Giap, 0);       eq(r.trangThai, 'tham-chieu', 'Thu tháng Mão -> nguyệt hình');
r = N.xet(9, 0, G.Dinh, 9);       eq(r.trangThai, 'trung-tinh', 'Thu tháng Tý có Nguyệt Đức hợp (Đinh)');
r = N.xet(9, 9, G.Canh, 1);       eq(r.trangThai, 'trung-tinh', 'Thu tháng Dậu có Nguyệt Đức (Canh)');
r = N.xet(9, 4, G.Tan, 1);        // Thìn: Nguyệt Đức = Nhâm, hợp = Đinh; Thiên Đức hợp tháng 3 = Đinh
r = N.xet(9, 4, G.Dinh, 1);       eq(r.trangThai, 'doi', 'Thu tháng Thìn có đức hợp');

// ---- Bế ----
r = N.xet(11, 5, G.Giap, 7);      eq(r.trangThai, 'tham-chieu', 'Bế tháng Tỵ -> nguyệt sát');
r = N.xet(11, 3, G.Giap, 10);     eq(r.trangThai, 'trung-tinh', 'Bế tháng Mão có Nguyệt Đức');
r = N.xet(11, 3, G.Mau, 10);      eq(r.trangThai, 'goc', 'Bế tháng Mão không đức');

// ---- Các Trực không có điều kiện ----
for (const t of [1, 4, 5, 7, 8, 10]) { r = N.xet(t, 2, G.Binh, 2); eq(r.ma, 'khong-co', 'Trực ' + t + ' không có ngoại lệ'); }

// ---- Kết hợp với danh sách gốc ----
let n = N.theoNgay(2, 2, G.Binh, 4);       eq(n.tranh.length, 0, 'Mãn có đức: không còn việc kỵ');
n = N.theoNgay(3, 11, G.Giap, 2);          ok(n.tranh.length > 0 && n.tranh.length < V.theoTruc(3).tranh.length, 'Bình Hợi: danh sách kỵ rút gọn');
ok(n.tranh.every(i => ['quan'].concat(['te', 'cuoi', 'nha', 'kd', 'sk', 'hoc', 'nong', 'tang', 'xh']).indexOf(i.nhom) >= 0), 'nhóm hợp lệ');
n = N.theoNgay(3, 3, G.Giap, 6);           ok(n.nen.length === 0 && n.tranh.length === 0, 'trung tính: không nên, không tránh');
n = N.theoNgay(6, 3, G.Giap, 9);           ok(n.tatCaKy && n.nen.length === 0, 'tất cả kỵ');
n = N.theoNgay(6, 0, G.Nham, 6);           ok(n.tranh.length >= V.theoTruc(6).tranh.length, 'Phá có đức nặng: giữ danh sách gốc cộng thêm');
const han = n.tranh.map(i => i.vi).join('|');
ok(han.length > 0, 'Phá có danh sách');
n = N.theoNgay(2, 2, G.Giap, 4);           eq(n.trangThai, 'goc', 'giữ nguyên khi không đức');

console.log('Đạt ' + pass + ', lỗi ' + fail);
process.exit(fail ? 1 : 0);
