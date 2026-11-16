/* app.js — giao diện. Viết kiểu ES5 để chạy được trên Safari cũ. Không gửi dữ liệu đi đâu, mọi tính toán tại máy. */
(function () {
  'use strict';
  var LC = window.LichCore, RB = window.RulesB, BT = window.BatTrach, TN = window.TuoiNha, BU = window.BatTu, VI = window.Viec, NL = window.NgoaiLe;
  var EL = { 'Kim': 'Kim', 'Mộc': 'Moc', 'Thủy': 'Thuy', 'Hỏa': 'Hoa', 'Thổ': 'Tho' };

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
    var cls = bacs ? ' card-' + String(bacs).charAt(0) : '';
    return '<div class="card' + cls + '"><h3>' + esc(title) + (bacs ? ' ' + bac(bacs) : '') + '</h3>' + body + '</div>';
  }
  // Chip màu theo ngũ hành. Màu chỉ là gợi ý thêm: tên hành luôn có trong thuộc tính title và trong bảng.
  function elChip(text, hanh) {
    return '<span class="el el-' + EL[hanh] + '" title="' + esc(hanh) + '">' + esc(text) + '</span>';
  }
  function pill(p) {
    return '<span class="pill">' + elChip(BU.CAN[p.stem], BU.STEM_EL[p.stem]) + elChip(BU.CHI[p.branch], BU.BRANCH_EL[p.branch]) + '</span>';
  }
  function nap(p) {
    var n = BU.napAm(p.stem, p.branch);
    return ' <span class="nap">Nạp âm: <b>' + esc(n.ten) + '</b> ' + elChip(n.hanh, n.hanh) + '</span>';
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

  // ---------- Bát tự ----------
  function batTuCard(a, hasHour) {
    var bt = BU.baTu(a, hasHour), html = '';
    html += '<p>Nhật chủ (can ngày): ' + elChip(bt.nhatChu.can, bt.nhatChu.hanh) + ' <span class="sub">' + esc(bt.nhatChu.hanh + ' ' + bt.nhatChu.amDuong) + '</span></p>';
    for (var b = 0; b < bt.bien.length; b++) {
      var v = bt.bien[b];
      if (v.ghiChu) html += '<p class="sub">' + esc(v.ghiChu) + '</p>';
      var order = [];                       // hiện theo thứ tự truyền thống: Giờ, Ngày, Tháng, Năm
      for (var i = v.tru.length - 1; i >= 0; i--) order.push(v.tru[i]);
      var th = '<tr><th></th>', r1 = '<tr><th>Thập thần</th>', r2 = '<tr><th>Can</th>', r3 = '<tr><th>Chi</th>', r4 = '<tr><th>Nạp âm</th>';
      for (var j = 0; j < order.length; j++) {
        var t = order[j];
        th += '<th>' + esc(t.ten) + '</th>';
        r1 += '<td>' + esc(t.thapThan) + '</td>';
        r2 += '<td>' + elChip(t.can, t.hanhCan) + ' <span class="sub">' + esc(t.hanhCan + ' ' + t.amDuongCan) + '</span></td>';
        r3 += '<td>' + elChip(t.chi, t.hanhChi) + ' <span class="sub">' + esc(t.hanhChi) + '</span></td>';
        r4 += '<td>' + elChip(t.napAm, t.napAmHanh) + '</td>';
      }
      html += '<div class="scroll"><table><thead>' + th + '</tr></thead><tbody>' + r1 + '</tr>' + r2 + '</tr>' + r3 + '</tr>' + r4 + '</tr></tbody></table></div>';
      var cnt = '';
      var names = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
      for (var n = 0; n < names.length; n++) cnt += elChip(names[n] + ' ' + v.demHanh[names[n]], names[n]) + ' ';
      html += '<p>Ngũ hành trong ' + v.soChu + ' chữ: ' + cnt + '</p>';
    }
    if (!hasHour) html += '<p class="sub">Chưa nhập giờ nên mới có 6 chữ. Nhập giờ để đủ 8 chữ (tứ trụ).</p>';
    html += '<p class="sub">' + esc(bt.ghiChu) + ' Thập thần tính cho can năm, tháng, giờ so với nhật chủ.</p>';
    return card('Bát tự (tứ trụ)', 'A / B', html);
  }

  // ---------- Việc nên làm / nên tránh ----------
  function chips(items, cls) {
    var h = '';
    for (var i = 0; i < items.length; i++) {
      h += '<span class="v ' + cls + '">' + esc(items[i].vi) + ' <span class="han">' + esc(items[i].han) + '</span></span> ';
    }
    return h;
  }
  function viecLists(items, cls) {
    if (!items.length) return '<p class="sub">Không có.</p>';
    var order = ['te', 'cuoi', 'nha', 'kd', 'sk', 'hoc', 'nong', 'tang', 'xh'], out = '', i, k;
    for (i = 0; i < order.length; i++) {
      var g = [];
      for (k = 0; k < items.length; k++) if (items[k].nhom === order[i]) g.push(items[k]);
      if (g.length) out += '<div class="vgroup"><span class="vtitle">' + esc(VI.NHOM[order[i]]) + '</span> ' + chips(g, cls) + '</div>';
    }
    var q = [];
    for (k = 0; k < items.length; k++) if (items[k].nhom === 'quan') q.push(items[k]);
    if (q.length) out += '<details><summary>' + esc(VI.NHOM.quan) + ': ' + q.length + ' việc</summary><div class="vgroup">' + chips(q, cls) + '</div></details>';
    return out;
  }
  function viecCard(r, a) {
    var body = '<p class="sub">' + esc(VI.SOURCES.HK10.note) + '</p>';
    for (var i = 0; i < r.truc.length; i++) {
      var o = r.truc[i], v = VI.theoTruc(o.truc.index);
      var x = NL.theoNgay(o.truc.index, o.thangChi, a.dayPillar.stem, a.dayPillar.branch);
      var st = x.trangThai;
      var badge = { 'goc': 'Danh sách gốc', 'doi': 'Đã đổi theo ngoại lệ', 'trung-tinh': 'Không khuyên, không kỵ', 'tat-ca-ky': 'Mọi việc đều kỵ', 'tham-chieu': 'Chưa kết luận: sách bảo tính theo sao khác' }[st];
      var inner = '<p><b>Trực ' + esc(v.truc) + '</b> ' + (st === 'tat-ca-ky' ? tag('hung') : (st === 'doi' ? tag('đã đổi') : (st === 'trung-tinh' ? tag('trung tính') : ''))) +
        ' <span class="sub">' + esc(badge || '') + '</span></p>';
      if (x.ducs.length) {
        var dn = [];
        for (var q = 0; q < x.ducs.length; q++) dn.push(esc(x.ducs[q].vi) + ' <span class="han">' + x.ducs[q].han + '</span>');
        inner += '<p class="sub">Sao đức trùng ngày (theo tháng ' + esc(o.thang) + '): ' + dn.join(', ') + '</p>';
      } else inner += '<p class="sub">Không có sao đức nào trùng ngày này (theo tháng ' + esc(o.thang) + ').</p>';
      if (x.giaiThich) inner += '<p class="note">' + esc(x.giaiThich) + '</p>';
      if (x.thamChieu.length) inner += '<p class="note">Sách bảo tính theo ' + esc(x.thamChieu.join(', ')) + '. App chưa có bảng đó, nên <b>danh sách dưới đây là danh sách gốc, chưa phải kết luận</b>; ngày thật có thể nặng hơn.</p>';
      if (x.moHo) inner += '<p class="note">' + esc(x.moHo) + '</p>';
      if (st === 'tat-ca-ky') inner += '<p class="vh">Nên làm ' + tag('cát') + '</p><p class="sub">Không có.</p><p class="vh">Nên tránh ' + tag('hung') + '</p><p><span class="v v-tranh">Mọi việc <span class="han">諸事皆忌</span></span></p>';
      else if (st === 'trung-tinh') inner += '<p class="sub">Sách ghi "不註宜, 不註忌": việc nên và việc kỵ đều không chú. Việc cụ thể phải xét theo sao khác.</p>';
      else {
        inner += '<p class="vh">Nên làm ' + tag('cát') + '</p>' + viecLists(x.nen, 'v-nen') +
          '<p class="vh">Nên tránh ' + tag('hung') + '</p>' + (x.tranh.length ? viecLists(x.tranh, 'v-tranh') : '<p class="sub">' + esc(st === 'doi' ? 'Theo ngoại lệ, không còn việc nào kỵ.' : (v.ghiChu || 'Hiệp kỷ không ghi việc kỵ riêng.')) + '</p>');
        if (x.khongKy.length) inner += '<p class="vh">Sách ghi rõ chỉ không kỵ' + '</p>' + viecLists(x.khongKy, 'v-neu');
      }
      if (v.coNgoaiLe) {
        inner += '<details><summary>Điều kiện ngoại lệ, nguyên văn Hiệp kỷ q.10</summary><p class="han">' + esc(v.dieuKien.join('\n')).replace(/\n/g, '<br>') + '</p>' +
          (v.an.length ? '<p class="han q">' + esc(v.an.join('\n')).replace(/\n/g, '<br>') + '</p>' : '') + '</details>';
      } else inner += '<p class="sub">Trực này Hiệp kỷ q.10 không ghi điều kiện ngoại lệ theo tháng.</p>';
      if (v.yiThem.length || v.jiThem.length) {
        inner += '<details><summary>Điều kiện kèm theo (sao trùng ngày, tháng riêng), nguyên văn</summary><p class="han">' +
          esc(v.yiThem.concat(v.jiThem).join('\n')).replace(/\n/g, '<br>') + '</p></details>';
      }
      body += opt(o.rule, inner);
    }
    var hd = r.hoangDao[0].than;
    body += '<details><summary>Hoàng đạo / Hắc đạo ảnh hưởng thế nào? Ngày này: ' + esc(hd.vi) + ' (' + esc(hd.loai) + ')</summary>' +
      '<p>' + esc(VI.HOANG_HAC.hiepKy) + '</p><p>' + esc(VI.HOANG_HAC.lichThu) + '</p>' +
      '<p class="sub">Hai quan điểm này khác nhau. App không chọn; ngoại lệ Hoàng/Hắc đạo chưa được tính vào danh sách trên.</p></details>';
    body += '<p class="sub">Đây chỉ là các việc ghi cho 12 Trực. Hiệp kỷ còn hàng chục sao khác, mỗi sao có điều nên và kỵ riêng, chưa có trong app. Bản dịch tên việc là cách hiểu của người làm app.</p>';
    return card('Việc nên làm, việc nên tránh (theo Trực)', 'B', body);
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
      '<p>Can chi ngày: ' + pill(a.dayPillar) + ' <span class="sub">' + esc(a.dayPillar.name) + '</span>' + nap(a.dayPillar) + '</p>';
    if (a.tietToday.length) {
      var t = a.tietToday[0];
      body += '<p>Ngày có giao tiết <b>' + esc(t.name) + '</b> lúc ' + pad2(t.local.hour) + ':' + pad2(t.local.minute) + '. Sai số tính tiết vài phút.</p>';
    }
    html += card('Ngày', 'A', body);

    // 2. Can chi
    var yp = a.yearPillar, tb = '<div class="scroll"><table><tbody>';
    if (yp.differ) {
      var lx = LC.jdToLocal(LC.lapXuanJD(y), 7);
      tb += '<tr><th>Năm</th><td>Theo Lập xuân: ' + pill(yp.byLapXuan) + ' ' + esc(yp.byLapXuan.name) + '<br>Theo mùng 1 Tết: ' + pill(yp.byTet) + ' ' + esc(yp.byTet.name) +
        '<div class="sub">Ngày này nằm giữa hai mốc nên hai cách cho kết quả khác nhau. Lập xuân năm ' + y + ' lúc ' +
        pad2(lx.hour) + ':' + pad2(lx.minute) + ' ngày ' + lx.day + '/' + lx.month + '.</div></td></tr>';
    } else {
      tb += '<tr><th>Năm</th><td>' + pill(yp.byLapXuan) + ' ' + esc(yp.byLapXuan.name) + nap(yp.byLapXuan) + ' <span class="sub">(hai mốc Lập xuân và Tết trùng nhau)</span></td></tr>';
    }
    if (a.tietToday.length) {
      var ab = LC.analyze(d, m, y, 0, 0), aa = LC.analyze(d, m, y, 23, 59);
      tb += '<tr><th>Tháng</th><td>Trước giao tiết: ' + pill(ab.monthPillar) + ' ' + esc(ab.monthPillar.name) + '<br>Sau giao tiết: ' + pill(aa.monthPillar) + ' ' + esc(aa.monthPillar.name) +
        '<div class="sub">Can chi tháng đổi ở thời điểm giao tiết, không phải mùng 1 âm lịch.</div></td></tr>';
    } else {
      tb += '<tr><th>Tháng</th><td>' + pill(a.monthPillar) + ' ' + esc(a.monthPillar.name) + nap(a.monthPillar) + ' <span class="sub">(tính theo Tiết)</span></td></tr>';
    }
    if (hasHour) {
      var hh = '';
      for (var i = 0; i < a.hourPillars.length; i++) {
        var hp = a.hourPillars[i];
        hh += '<div>' + pill(hp.pillar) + ' ' + esc(hp.pillar.name) + nap(hp.pillar) + (hp.rule ? ' <span class="sub">(' + esc(hp.rule) + ')</span>' : '') + '</div>';
      }
      tb += '<tr><th>Giờ</th><td>' + hh + (a.hourPillars.length > 1 ? '<div class="sub">Giờ Tý muộn (23h) có hai cách tính; app hiện cả hai.</div>' : '') + '</td></tr>';
    } else {
      tb += '<tr><th>Giờ</th><td class="hint">Nhập giờ để xem can chi giờ.</td></tr>';
    }
    tb += '</tbody></table></div>';
    html += card('Can chi', 'A', tb);
    html += batTuCard(a, hasHour);

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
    html += viecCard(r, a);

    // 4. Hoàng đạo / Hắc đạo
    var hd = '';
    for (var q = 0; q < r.hoangDao.length; q++) {
      var z = r.hoangDao[q];
      hd += opt(z.rule, '<b>' + esc(z.than.vi) + '</b> <span class="han">(' + esc(z.than.han) + ')</span> ' + tag(z.than.loai) +
        ' <span class="sub">tháng ' + esc(z.thang) + '</span>');
    }
    hd += '<p class="sub">' + esc(r.canhBao.hoangDao) + '</p>';
    var gt = '', gx = '';
    for (var g0 = 0; g0 < r.gioHoangDao.length; g0++) {
      var g1 = r.gioHoangDao[g0];
      var chip = '<span class="v ' + (g1.loai === 'hoàng đạo' ? 'v-nen' : 'v-tranh') + '">' + esc(g1.chi) + ' <span class="han">' + esc(g1.khoang) + '</span></span>';
      if (g1.loai === 'hoàng đạo') gt += chip; else gx += chip;
    }
    hd += '<p class="vh">Giờ hoàng đạo hôm nay ' + tag('hoàng đạo') + '</p><div class="vgroup">' + gt + '</div>' +
      '<p class="vh">Giờ hắc đạo ' + tag('hắc đạo') + '</p><div class="vgroup">' + gx + '</div>';
    if (hasHour) {
      var hi = Math.floor((h + 1) / 2) % 12, cur = r.gioHoangDao[hi];
      hd += '<p class="note">Giờ bạn nhập (' + pad2(h) + ':' + pad2(mi) + ') thuộc giờ <b>' + esc(cur.chi) + '</b>, thần <b>' + esc(cur.than) + '</b>: ' + esc(cur.loai) + '.</p>';
    }
    hd += '<div class="scroll"><table><thead><tr><th>Giờ</th><th>Khoảng</th><th>Thần</th><th></th></tr></thead><tbody>';
    for (var g = 0; g < r.gioHoangDao.length; g++) {
      var gi = r.gioHoangDao[g];
      hd += '<tr' + (gi.loai === 'hoàng đạo' ? ' class="hl"' : '') + '><td>' + esc(gi.chi) + '</td><td>' + esc(gi.khoang) + '</td><td>' +
        esc(gi.than) + '</td><td>' + tag(gi.loai) + '</td></tr>';
    }
    hd += '</tbody></table></div>';
    html += card('Hoàng đạo / Hắc đạo, giờ hoàng đạo', 'B', hd);

    // 4b. Hỷ thần và chi xung của ngày
    var hy = RB.hyThan(a.dayPillar.stem), cx = RB.chiXung(a.dayPillar.branch);
    html += card('Hỷ thần và chi xung của ngày', 'B',
      '<p>Hỷ thần ngày này ở hướng <b>' + esc(hy.huong) + '</b> <span class="han">(' + esc(hy.quai) + ')</span>, giờ Hỷ thần là giờ <b>' + esc(hy.gioChi) + '</b> (' + esc(hy.gioKhoang) + ').</p>' +
      '<p>Chi ngày <b>' + RB.CHI[a.dayPillar.branch] + '</b> xung với chi <b>' + RB.CHI[cx] + '</b>: người tuổi ' + RB.CHI[cx] + ' thường được xem là kỵ ngày này.</p>' +
      '<p class="sub">Hỷ thần: Hiệp kỷ q.7 (喜神, tính theo Can ngày, suy ra bằng Ngũ hổ độn từ Bính; sách lưu ý vẫn phải xét cùng các thần sát khác, ví dụ gặp ngày phá thì không dùng). Chi xung là phép địa chi chuẩn. Các trang lịch phổ thông còn liệt kê tuổi xung theo cả Can (ví dụ Quý Mùi, Đinh Mùi, Ất Dậu, Ất Mão cho ngày Tân Sửu); công thức đó app chưa có nguồn nên chưa đưa vào. Tài thần cũng chưa có bảng nguồn nên chưa hiện.</p>');

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
    html += '<div class="card">' + sourceBlock(pick(RB.SOURCES, flat(r.sources).concat(['DIACHI'])).concat(pick(VI.SOURCES, ['HK10'])).concat(pick(BU.SOURCES, ['BATU']))) + '</div>';
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

  // ---------- Nút tăng giảm to, tách riêng; nút chọn nhanh ----------
  function fire(el) {
    var ev;
    try { ev = new Event('input', { bubbles: true }); } catch (e) { ev = document.createEvent('Event'); ev.initEvent('input', true, true); }
    el.dispatchEvent(ev);
  }
  function setDate(prefix, dt) {
    var ids = prefix === 'd' ? ['d-day', 'd-month', 'd-year'] : prefix === 'a' ? ['a-cday', 'a-cmonth', 'a-cyear'] : null;
    if (!ids) return;
    $(ids[0]).value = dt.getDate(); $(ids[1]).value = dt.getMonth() + 1; $(ids[2]).value = dt.getFullYear();
    fire($(ids[0]));
  }
  // nhóm ngày/tháng/năm: id đầu là ngày, tiếp là tháng, năm
  var DATE_GROUPS = [['d-day', 'd-month', 'd-year'], ['a-cday', 'a-cmonth', 'a-cyear'], ['a-bday', 'a-bmonth', 'a-byear'], ['h-day', 'h-month', 'h-year']];
  function stepDate(group, which, dir) {
    var D = $(group[0]), M = $(group[1]), Y = $(group[2]);
    var now = new Date();
    var d = parseInt(D.value, 10), m = parseInt(M.value, 10), y = parseInt(Y.value, 10);
    if (isNaN(d)) d = now.getDate(); if (isNaN(m)) m = now.getMonth() + 1; if (isNaN(y)) y = now.getFullYear();
    var dt = new Date(y, m - 1, d, 12, 0, 0);
    if (which === 0) dt.setDate(dt.getDate() + dir);
    else if (which === 1) { var dd = dt.getDate(); dt.setDate(1); dt.setMonth(dt.getMonth() + dir); var last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate(); dt.setDate(Math.min(dd, last)); }
    else dt.setFullYear(dt.getFullYear() + dir);
    var ny = dt.getFullYear(); if (ny < 1900 || ny > 2100) return;
    D.value = dt.getDate(); M.value = dt.getMonth() + 1; Y.value = ny; fire(D);
  }
  function stepSimple(el, dir, lo, hi, wrap) {
    var v = parseInt(el.value, 10), now = new Date();
    if (isNaN(v)) v = el.id === 'd-hour' ? now.getHours() : el.id === 'd-min' ? now.getMinutes() : (lo === 1900 ? 1990 : lo);
    else v += dir;
    if (v > hi) v = wrap ? lo : hi;
    if (v < lo) v = wrap ? hi : lo;
    el.value = v; fire(el);
  }
  function makeSteppers() {
    var all = document.querySelectorAll('input[type=number]');
    for (var i = 0; i < all.length; i++) (function (el) {
      var id = el.id, grp = null, which = 0, g, k;
      for (g = 0; g < DATE_GROUPS.length; g++) for (k = 0; k < 3; k++) if (DATE_GROUPS[g][k] === id) { grp = DATE_GROUPS[g]; which = k; }
      var lo = +el.min || 0, hi = +el.max || 9999, wrap = (id === 'd-hour' || id === 'd-min');
      var wrapEl = document.createElement('div'); wrapEl.className = 'stepper';
      function btn(sym, dir, label) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'stp'; b.textContent = sym;
        b.setAttribute('aria-label', label);
        b.addEventListener('click', function () { if (grp) stepDate(grp, which, dir); else stepSimple(el, dir, lo, hi, wrap); });
        return b;
      }
      el.parentNode.insertBefore(wrapEl, el);
      wrapEl.appendChild(btn('‹', -1, 'Giảm'));
      wrapEl.appendChild(el);
      wrapEl.appendChild(btn('›', 1, 'Tăng'));
    })(all[i]);
  }
  function quickButtons() {
    var bs = document.querySelectorAll('[data-quick]');
    for (var i = 0; i < bs.length; i++) (function (b) {
      b.addEventListener('click', function () {
        var q = b.getAttribute('data-quick'), now = new Date();
        if (q === 'today') setDate('d', now);
        else if (q === 'now') { setDate('d', now); $('d-hour').value = now.getHours(); $('d-min').value = now.getMinutes(); fire($('d-hour')); }
        else if (q === 'clear-time') { $('d-hour').value = ''; $('d-min').value = ''; fire($('d-hour')); }
        else if (q === 'build-today') setDate('a', now);
      });
    })(bs[i]);
  }

  function init() {
    dirOptions('h-toa'); dirOptions('h-cua');
    var now = new Date();
    $('d-day').value = now.getDate(); $('d-month').value = now.getMonth() + 1; $('d-year').value = now.getFullYear();
    $('a-cday').value = now.getDate(); $('a-cmonth').value = now.getMonth() + 1; $('a-cyear').value = now.getFullYear();

    makeSteppers(); quickButtons();
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
