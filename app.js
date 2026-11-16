/* app.js — giao diện. Viết kiểu ES5 để chạy được trên Safari cũ. Không gửi dữ liệu đi đâu, mọi tính toán tại máy. */
(function () {
  'use strict';
  var LC = window.LichCore, RB = window.RulesB, BT = window.BatTrach, TN = window.TuoiNha;

  var DIRS = ['', 'Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
  var WEEK = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(id) {
    var v = $(id).value.replace(/^\s+|\s+$/g, '');
    if (v === '') return null;
    var n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function mod(a, n) { return ((a % n) + n) % n; }

  function validDate(d, m, y) {
    if (!d || !m || !y || m < 1 || m > 12 || d < 1 || y < 1900 || y > 2100) return false;
    var x = LC.jdToDate(LC.jdFromDate(d, m, y));
    return x.day === d && x.month === m && x.year === y;
  }

  // ---------- Thành phần giao diện ----------
  function bac(t) {
    var parts = String(t).split(' / '), out = '';
    for (var i = 0; i < parts.length; i++) {
      out += '<span class="bac bac-' + parts[i].charAt(0) + '" title="Bậc ' + esc(parts[i]) + '">' + esc(parts[i]) + '</span>';
    }
    return out;
  }
  function tag(loai) {
    var cls = 'tag-neu';
    if (loai === 'cát' || loai === 'hoàng đạo') cls = 'tag-cat';
    else if (loai === 'hung' || loai === 'hắc đạo') cls = 'tag-hung';
    return '<span class="tag ' + cls + '">' + esc(loai) + '</span>';
  }
  function card(title, bacs, body) {
    return '<div class="card"><h3>' + esc(title) + (bacs ? ' ' + bac(bacs) : '') + '</h3>' + body + '</div>';
  }
  function errCard(msg) { return '<div class="card err" role="alert">' + esc(msg) + '</div>'; }

  function sourceBlock(items) {
    var li = '';
    for (var i = 0; i < items.length; i++) {
      var s = items[i].obj, id = items[i].id, line = '<b>' + esc(id) + '</b>: ';
      if (s.book) line += esc(s.book) + (s.volume ? ', quyển ' + s.volume : '') + (s.section ? ', mục ' + esc(s.section) : '');
      if (s.ref) line += esc(s.ref);
      if (s.kind) line += ' (' + esc(s.kind) + ')';
      if (s.bac) line += ' ' + bac(s.bac);
      line += '. <i>Mức xác minh: ' + esc(s.verified || 'không rõ') + '.</i>';
      if (s.note) line += ' ' + esc(s.note);
      if (s.quotes && s.quotes.length) {
        line += '<ul>';
        for (var q = 0; q < s.quotes.length; q++) line += '<li class="han q">' + esc(s.quotes[q]) + '</li>';
        line += '</ul>';
      }
      li += '<li>' + line + '</li>';
    }
    return '<details><summary>Nguồn và mức xác minh</summary><ul>' + li + '</ul></details>';
  }
  function pick(map, ids) {
    var out = [];
    for (var i = 0; i < ids.length; i++) if (map[ids[i]]) out.push({ id: ids[i], obj: map[ids[i]] });
    return out;
  }
  function flat(obj) {
    var out = [];
    for (var k in obj) if (obj.hasOwnProperty(k)) out = out.concat(obj[k]);
    var seen = {}, res = [];
    for (var i = 0; i < out.length; i++) if (!seen[out[i]]) { seen[out[i]] = 1; res.push(out[i]); }
    return res;
  }
  function opt(rule, html) {
    return '<div class="opt">' + (rule ? '<div class="rule">' + esc(rule) + '</div>' : '') + html + '</div>';
  }
  function dirOptions(selectId) {
    var s = $(selectId), h = '';
    for (var i = 0; i < DIRS.length; i++) h += '<option value="' + esc(DIRS[i]) + '">' + (DIRS[i] || '(không chọn)') + '</option>';
    s.innerHTML = h;
  }

  // ---------- Tab 1: Xem ngày ----------
  function renderDay() {
    var out = $('out-day');
    var d = num('d-day'), m = num('d-month'), y = num('d-year'), h = num('d-hour'), mi = num('d-min'), by = num('d-birth');
    if (d === null && m === null && y === null) { out.innerHTML = '<p class="hint">Nhập ngày dương lịch để xem.</p>'; return; }
    if (!validDate(d, m, y)) { out.innerHTML = errCard('Ngày không hợp lệ (năm từ 1900 đến 2100).'); return; }
    var hasHour = h !== null;
    if (h === null) h = 12;
    if (mi === null) mi = 0;
    if (h < 0 || h > 23 || mi < 0 || mi > 59) { out.innerHTML = errCard('Giờ hoặc phút không hợp lệ.'); return; }

    var a = LC.analyze(d, m, y, h, mi);
    var r = RB.evaluate(a);
    var html = '';

    // 1. Ngày
    var jdn = LC.jdFromDate(d, m, y);
    var lu = a.lunar;
    var body = '<p><b>' + WEEK[(jdn + 1) % 7] + ', ' + d + '/' + m + '/' + y + '</b></p>' +
      '<p>Âm lịch (múi giờ UTC+7): <b>ngày ' + lu.day + ' tháng ' + lu.month + (lu.leap ? ' nhuận' : '') + ' năm ' + lu.year + '</b></p>' +
      '<p>Can chi ngày: <b>' + esc(a.dayPillar.name) + '</b></p>';
    if (a.tietToday.length) {
      var t = a.tietToday[0];
      body += '<p>Ngày có giao tiết <b>' + esc(t.name) + '</b> lúc ' + pad2(t.local.hour) + ':' + pad2(t.local.minute) + '. Sai số tính tiết vài phút.</p>';
    }
    html += card('Ngày', 'A', body);

    // 2. Can chi
    var yp = a.yearPillar, tb = '<div class="scroll"><table><tbody>';
    if (yp.differ) {
      var lx = LC.jdToLocal(LC.lapXuanJD(y), 7);
      tb += '<tr><th>Năm</th><td>Theo Lập xuân: <b>' + esc(yp.byLapXuan.name) + '</b><br>Theo mùng 1 Tết: <b>' + esc(yp.byTet.name) +
        '</b><div class="sub">Ngày này nằm giữa hai mốc nên hai cách cho kết quả khác nhau. Lập xuân năm ' + y + ' lúc ' +
        pad2(lx.hour) + ':' + pad2(lx.minute) + ' ngày ' + lx.day + '/' + lx.month + '.</div></td></tr>';
    } else {
      tb += '<tr><th>Năm</th><td><b>' + esc(yp.byLapXuan.name) + '</b> <span class="sub">(hai mốc Lập xuân và Tết trùng nhau)</span></td></tr>';
    }
    if (a.tietToday.length) {
      var ab = LC.analyze(d, m, y, 0, 0), aa = LC.analyze(d, m, y, 23, 59);
      tb += '<tr><th>Tháng</th><td>Trước giao tiết: <b>' + esc(ab.monthPillar.name) + '</b><br>Sau giao tiết: <b>' + esc(aa.monthPillar.name) +
        '</b><div class="sub">Can chi tháng đổi ở thời điểm giao tiết, không phải mùng 1 âm lịch.</div></td></tr>';
    } else {
      tb += '<tr><th>Tháng</th><td><b>' + esc(a.monthPillar.name) + '</b> <span class="sub">(tính theo Tiết)</span></td></tr>';
    }
    if (hasHour) {
      var hh = '';
      for (var i = 0; i < a.hourPillars.length; i++) {
        var hp = a.hourPillars[i];
        hh += '<div><b>' + esc(hp.pillar.name) + '</b>' + (hp.rule ? ' <span class="sub">(' + esc(hp.rule) + ')</span>' : '') + '</div>';
      }
      tb += '<tr><th>Giờ</th><td>' + hh + (a.hourPillars.length > 1 ? '<div class="sub">Giờ Tý muộn (23h) có hai cách tính; app hiện cả hai.</div>' : '') + '</td></tr>';
    } else {
      tb += '<tr><th>Giờ</th><td class="hint">Nhập giờ để xem can chi giờ.</td></tr>';
    }
    tb += '</tbody></table></div>';
    html += card('Can chi', 'A', tb);

    // 3. Trực
    var tr = '';
    for (var k = 0; k < r.truc.length; k++) {
      var x = r.truc[k];
      tr += opt(x.rule, '<b>Trực ' + esc(x.truc.vi) + '</b> <span class="han">(' + esc(x.truc.han) + ')</span> ' + tag(x.truc.loai) +
        ' <span class="sub">tháng ' + esc(x.thang) + '</span>');
    }
    if (r.canhBao.truc) tr += '<p class="sub">' + esc(r.canhBao.truc) + '</p>';
    var npha = false;
    for (var n1 = 0; n1 < r.nguyetPha.length; n1++) if (r.nguyetPha[n1].phaThang) npha = true;
    if (npha) tr += '<p>Chi ngày xung chi tháng (Nguyệt phá) ' + tag('hung') + ' <span class="sub">suy từ địa chi, chưa trích sách.</span></p>';
    tr += '<p class="sub">Phân loại cát/hung theo phần 考原曰 của Hiệp kỷ. Các trang lịch phổ thông có thể xếp khác.</p>';
    html += card('12 Trực', 'B', tr);

    // 4. Hoàng đạo / Hắc đạo
    var hd = '';
    for (var q = 0; q < r.hoangDao.length; q++) {
      var z = r.hoangDao[q];
      hd += opt(z.rule, '<b>' + esc(z.than.vi) + '</b> <span class="han">(' + esc(z.than.han) + ')</span> ' + tag(z.than.loai) +
        ' <span class="sub">tháng ' + esc(z.thang) + '</span>');
    }
    hd += '<p class="sub">' + esc(r.canhBao.hoangDao) + '</p>';
    hd += '<div class="scroll"><table><thead><tr><th>Giờ</th><th>Khoảng</th><th>Thần</th><th></th></tr></thead><tbody>';
    for (var g = 0; g < r.gioHoangDao.length; g++) {
      var gi = r.gioHoangDao[g];
      hd += '<tr' + (gi.loai === 'hoàng đạo' ? ' class="hl"' : '') + '><td>' + esc(gi.chi) + '</td><td>' + esc(gi.khoang) + '</td><td>' +
        esc(gi.than) + '</td><td>' + tag(gi.loai) + '</td></tr>';
    }
    hd += '</tbody></table></div>';
    html += card('Hoàng đạo / Hắc đạo, giờ hoàng đạo', 'B', hd);

    // 5. Quan hệ với tuổi
    if (by !== null && by >= 1900 && by <= 2100) {
      var bc = mod(by - 4, 12), dayB = a.dayPillar.branch;
      var rel = RB.relations(dayB, bc);
      var rb = '<p>Chi ngày <b>' + RB.CHI[dayB] + '</b> với tuổi <b>' + RB.CHI[bc] + '</b> (năm ' + by + '): ';
      if (rel.length) {
        for (var w = 0; w < rel.length; w++) rb += tag(rel[w] === 'lục hợp' || rel[w] === 'tam hợp' ? 'cát' : 'hung') + ' ' + esc(rel[w]) + ' ';
      } else rb += 'không có quan hệ xung, hợp, hình, hại đặc biệt.';
      rb += '</p><p class="sub">Quan hệ địa chi là quy ước chuẩn của hệ địa chi, chưa trích từ sách cụ thể. Chi tuổi tính theo năm bạn nhập, chưa xét mốc Lập xuân hay Tết.</p>';
      html += card('Ngày với tuổi của bạn', 'B', rb);
    }

    // 6. Phương vị theo năm
    var pv = '';
    for (var p = 0; p < r.nam.length; p++) {
      var nn = r.nam[p], v = nn.phuongVi;
      pv += '<h4>' + (r.nam.length > 1 ? 'Theo mốc ' + esc(nn.moc) + ': ' : '') + 'năm ' + esc(nn.nam) + '</h4>' +
        '<div class="scroll"><table><tbody>' +
        '<tr><th>Thái tuế</th><td><b>' + esc(v.thaiTue.chi) + '</b>, hướng ' + esc(v.thaiTue.huong) + '<div class="sub">' + esc(v.thaiTue.ghiChu) + '</div></td></tr>' +
        '<tr><th>Tuế phá</th><td><b>' + esc(v.tuePha.chi) + '</b>, hướng ' + esc(v.tuePha.huong) + '<div class="sub">' + esc(v.tuePha.ghiChu) + '</div></td></tr>' +
        '<tr><th>Tam sát</th><td><b>' + esc(v.tamSat.chi.join(', ')) + '</b>, phương ' + esc(v.tamSat.huong) + '<div class="sub">' + esc(v.tamSat.ghiChu) + '</div></td></tr>' +
        '</tbody></table></div>' +
        (nn.ngayPhaNam ? '<p>Chi ngày xung chi năm (ngày Tuế phá) ' + tag('hung') + '</p>' : '');
      pv += '<p class="sub">' + esc(v.verification) + '</p>';
    }
    html += card('Phương vị theo năm (Thái tuế, Tam sát)', 'B', pv);

    // Nguồn
    html += '<div class="card">' + sourceBlock(pick(RB.SOURCES, flat(r.sources).concat(['DIACHI']))) + '</div>';
    out.innerHTML = html;
  }

  // ---------- Tab 2: Hướng nhà và bàn ----------
  function renderHouse() {
    var out = $('out-house');
    var d = num('h-day'), m = num('h-month'), y = num('h-year');
    if (d === null && m === null && y === null) { out.innerHTML = '<p class="hint">Nhập ngày sinh để tính cung phi và 8 hướng.</p>'; return; }
    if (!validDate(d, m, y)) { out.innerHTML = errCard('Ngày sinh không hợp lệ.'); return; }
    var gender = $('h-gender').value;
    var toa = $('h-toa').value, cua = $('h-cua').value;
    var house = {};
    if (toa) house.toa = toa;
    if (cua) house.cua = cua;

    var a = LC.analyze(d, m, y, 12, 0);
    var res = BT.evaluate(a, gender, (toa || cua) ? house : null);
    var html = '';

    for (var i = 0; i < res.ketQua.length; i++) {
      var k = res.ketQua[i], cp = k.cungPhi;
      var b = '<p>Cung phi: <b>' + esc(cp.quai) + '</b> (' + esc(cp.nhom) + '), hướng ' + esc(cp.huong) + '.</p>';
      if (cp.guiCung) b += '<p class="sub">Số gốc là 5 (cung giữa), ' + (gender === 'nam' ? 'nam gửi Khôn' : 'nữ gửi Cấn') + ' theo hai nguồn thứ cấp thống nhất. Chưa tìm thấy nguồn nào nói khác.</p>';
      b += '<div class="scroll"><table><thead><tr><th>Du niên</th><th></th><th>Hướng</th><th>Quái</th></tr></thead><tbody>';
      for (var j = 0; j < k.tamHuong.length; j++) {
        var t = k.tamHuong[j];
        b += '<tr' + (t.loai === 'cát' ? ' class="hl"' : '') + '><td>' + esc(t.ten) + '</td><td>' + tag(t.loai) + '</td><td>' + esc(t.huong) + '</td><td>' + esc(t.quai) + '</td></tr>';
      }
      b += '</tbody></table></div>';
      html += card('Cung phi và 8 hướng' + (res.ketQua.length > 1 ? ' (mốc ' + k.moc + ', năm sinh ' + k.namSinh + ')' : ''), 'B', b);
    }
    if (res.ketQua.length > 1) {
      html += '<div class="card"><p class="sub">Ngày sinh nằm giữa Tết và Lập xuân nên hai mốc cho năm sinh khác nhau, và có thể ra hai cung phi khác nhau. App hiện cả hai.</p></div>';
    }

    if (res.nha) {
      var nb = '';
      for (var n = 0; n < res.nha.length; n++) {
        var x = res.nha[n];
        var line = '<p><b>' + esc(x.cach) + '</b>: nhà thuộc quái <b>' + esc(x.trachQuai) + '</b> (' + esc(x.nhaThuoc) + '). Bạn thuộc ' + esc(x.nguoiThuoc) + ' (cung ' + esc(x.cungPhiNguoi) + '). ' +
          (x.hopNhom ? tag('cát') + ' cùng nhóm Đông/Tây' : tag('hung') + ' khác nhóm Đông/Tây') + '</p>';
        if (x.huongCuaDoiVoiNguoi) line += '<p class="sub">Hướng cửa ' + esc(x.huongCuaDoiVoiNguoi.huong) + ' là <b>' + esc(x.huongCuaDoiVoiNguoi.ten) + '</b> đối với bạn ' + tag(x.huongCuaDoiVoiNguoi.loai) + '</p>';
        if (x.toaDoiVoiNguoi) line += '<p class="sub">Tọa ' + esc(x.toaDoiVoiNguoi.huong) + ' là <b>' + esc(x.toaDoiVoiNguoi.ten) + '</b> đối với bạn ' + tag(x.toaDoiVoiNguoi.loai) + '</p>';
        nb += opt(res.ketQua.length > 1 ? 'Mốc ' + x.nguoi : '', line);
      }
      nb += '<p class="sub">Có phái lấy tọa nhà, có phái lấy hướng cửa chính làm quái của nhà. Văn bản gốc chưa đọc được nên app không chọn giúp.</p>';
      html += card('Ngôi nhà', 'B', nb);
    }

    var k0 = res.ketQua[0], bl = k0.banLamViec;
    var dk = '<div class="scroll"><table><thead><tr><th>Hướng tốt</th><th>Mục đích (quy ước phái)</th><th>Nếu mặt nhìn về</th><th>Nếu lưng tựa vào</th></tr></thead><tbody>';
    for (var q = 0; q < bl.matNhinVe.length; q++) {
      dk += '<tr><td>' + esc(bl.matNhinVe[q].duNien) + '</td><td>' + esc(bl.matNhinVe[q].mucDich) + '</td><td>' + esc(bl.matNhinVe[q].huong) + '</td><td>' + esc(bl.lungTuaVao[q].huongLung) + '</td></tr>';
    }
    dk += '</tbody></table></div><p class="sub">' + esc(bl.ghiChu) + '</p>';
    if (res.ketQua.length > 1) dk += '<p class="sub">Bảng trên theo mốc ' + esc(k0.moc) + '. Xem mốc còn lại ở phần cung phi.</p>';
    dk = dk.replace('Nếu mặt nhìn về', 'Cách 1: mặt nhìn về').replace('Nếu lưng tựa vào', 'Cách 2: lưng tựa vào');
    html += card('Hướng ngồi bàn làm việc', 'B', dk);

    html += '<div class="card"><p class="sub">' + esc(res.canhBao) + '</p>' + sourceBlock(pick(BT.SOURCES, res.sources)) + '</div>';
    out.innerHTML = html;
  }

  // ---------- Tab 3: Tuổi làm nhà ----------
  function renderAge() {
    var out = $('out-age');
    var bd = num('a-bday'), bm = num('a-bmonth'), byy = num('a-byear');
    var cd = num('a-cday'), cm = num('a-cmonth'), cy = num('a-cyear');
    if (bd === null && bm === null && byy === null) { out.innerHTML = '<p class="hint">Nhập ngày sinh gia chủ và ngày dự định khởi công.</p>'; return; }
    if (!validDate(bd, bm, byy)) { out.innerHTML = errCard('Ngày sinh không hợp lệ.'); return; }
    if (!validDate(cd, cm, cy)) { out.innerHTML = errCard('Ngày khởi công không hợp lệ.'); return; }
    var birth = LC.analyze(bd, bm, byy, 12, 0), build = LC.analyze(cd, cm, cy, 12, 0);
    var res = TN.evaluate(birth, build);
    var html = '<div class="card"><p class="sub">Cả ba mục dưới đây chưa tìm thấy nguồn cổ. Kim Lâu và Hoang Ốc là quy ước dân gian (bậc C); Tam tai suy từ nhóm tam hợp. Dùng để tham khảo, không dùng để chặn quyết định.</p></div>';

    for (var i = 0; i < res.ketQua.length; i++) {
      var k = res.ketQua[i];
      var b = '<p>Năm sinh <b>' + k.namSinh + '</b> (tuổi <b>' + esc(k.tuoiChi) + '</b>), năm khởi công <b>' + k.namXay + '</b> (' + esc(k.namXayChi) + '). Tuổi mụ: <b>' + k.tuoiMu + '</b>.</p>';
      b += '<div class="scroll"><table><tbody>';
      b += '<tr><th>Kim Lâu ' + bac('C') + '</th><td>' + (k.kimLau.pham ? tag('hung') + ' phạm <b>' + esc(k.kimLau.ten) + '</b>' : tag('cát') + ' không phạm') +
        '<div class="sub">Tuổi mụ ' + k.tuoiMu + ' chia 9 dư ' + k.kimLau.du + '. Phạm khi dư 1, 3, 6, 8.</div></td></tr>';
      b += '<tr><th>Hoang Ốc ' + bac('C') + '</th><td>' + tag(k.hoangOc.loai) + ' <b>' + esc(k.hoangOc.ten) + '</b><div class="sub">Vòng: Nhất Cát, Nhì Nghi, Tam Địa Sát, Tứ Tấn Tài, Ngũ Thọ Tử, Lục Hoang Ốc.</div></td></tr>';
      b += '<tr><th>Tam tai ' + bac('B-') + '</th><td>' + (k.tamTai.pham ? tag('hung') + ' phạm, năm thứ <b>' + k.tamTai.namThu + '</b> trong 3 năm' : tag('cát') + ' không phạm') +
        '<div class="sub">Tuổi ' + esc(k.tuoiChi) + ' gặp tam tai các năm ' + esc(k.tamTai.cacNam.join(', ')) + '.</div></td></tr>';
      b += '</tbody></table></div>';
      html += card(res.ketQua.length > 1 ? 'Theo mốc ' + k.moc : 'Kết quả', '', b);
    }
    if (res.ketQua.length > 1) html += '<div class="card"><p class="sub">Ngày sinh hoặc ngày khởi công nằm giữa Tết và Lập xuân, nên hai mốc cho tuổi mụ khác nhau. Chưa có nguồn nào nói nên dùng mốc nào cho tuổi làm nhà. App hiện cả hai.</p></div>';
    html += '<div class="card"><p class="sub">Tam tai (theo tuổi người) khác Tam sát (theo phương của năm). Nhiều bài báo trộn hai khái niệm này. Tam sát xem ở tab Xem ngày.</p>' + sourceBlock(pick(TN.SOURCES, res.sources)) + '</div>';
    out.innerHTML = html;
  }

  // ---------- Điều khiển ----------
  var TABS = ['day', 'house', 'age'];
  function showTab(name) {
    for (var i = 0; i < TABS.length; i++) {
      var on = TABS[i] === name;
      $('tab-' + TABS[i]).setAttribute('aria-selected', on ? 'true' : 'false');
      $('panel-' + TABS[i]).hidden = !on;
    }
    try { localStorage.setItem('lichnguon.tab', name); } catch (e) { /* không có bộ nhớ thì bỏ qua */ }
  }

  function init() {
    dirOptions('h-toa'); dirOptions('h-cua');
    var now = new Date();
    $('d-day').value = now.getDate(); $('d-month').value = now.getMonth() + 1; $('d-year').value = now.getFullYear();
    $('a-cday').value = now.getDate(); $('a-cmonth').value = now.getMonth() + 1; $('a-cyear').value = now.getFullYear();

    var renders = { day: renderDay, house: renderHouse, age: renderAge };
    for (var i = 0; i < TABS.length; i++) {
      (function (name) {
        $('tab-' + name).addEventListener('click', function () { showTab(name); });
        var els = $('panel-' + name).querySelectorAll('input, select');
        for (var j = 0; j < els.length; j++) {
          els[j].addEventListener('input', renders[name]);
          els[j].addEventListener('change', renders[name]);
        }
      })(TABS[i]);
    }
    var start = 'day';
    try { var s = localStorage.getItem('lichnguon.tab'); if (s && TABS.indexOf(s) >= 0) start = s; } catch (e) { /* bỏ qua */ }
    showTab(start);
    renderDay(); renderHouse(); renderAge();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
