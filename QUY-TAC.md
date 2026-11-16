# Bảng quy tắc: app lịch & phong thủy (Safari, offline)

Nguyên tắc: mỗi quy tắc có **bậc**, **nguồn**, **chỗ các phái bất đồng**. App luôn hiện "vì sao" kèm kết luận.

**Không mặc định theo trường phái nào.** Khi có bất đồng, app trình bày mỗi nguồn tính ra sao và ra kết luận gì, như một người đứng ngoài thuật lại các quan điểm. Hiện số nguồn nhất trí và nguồn bất đồng, không chọn thay người dùng. Mỗi nguồn phải trích đúng (sách, chương, cách tính); chưa xác minh được thì ghi "chưa xác minh", không bịa.

- **Bậc A** thiên văn/toán, kiểm chứng được. Chỉ đúng hoặc sai.
- **Bậc B** có hệ thống lý luận, suy ra được từ tiên đề, có văn bản gốc.
- **Bậc C** quy ước dân gian, không có phép suy ra. Mặc định tắt, không tính vào điểm chính.

> Lưu ý: bảng này soạn từ kiến thức nền. Mọi mục ghi "ĐỐI CHIẾU" phải được kiểm với văn bản gốc (Hiệp kỷ biện phương thư, Ngọc hạp thông thư) và lịch vạn niên trước khi viết code.

---

## 1. Lõi lịch (dùng chung)

| Quy tắc | Bậc | Ghi chú |
|---|---|---|
| Lịch âm theo múi giờ **UTC+7** (thuật toán Hồ Ngọc Đức) | A | Lịch Việt và lịch Trung Quốc **khác nhau ở một số tháng/năm** vì múi giờ. Phải dùng UTC+7. |
| Tháng nhuận | A | Quy tắc: tháng không có trung khí. |
| Can chi ngày (qua số ngày Julian) | A | Chu kỳ 60, không có bất đồng. |
| Tiết khí (24, theo kinh độ Mặt Trời mỗi 15°) | A | Tính thiên văn, không tra bảng cứng. |
| Can chi tháng (theo **tiết**, không theo mùng 1 âm) | A | Đổi tháng tại Tiết, không phải mùng 1. |
| Mốc đổi năm: **Lập xuân** (hệ Hiệp kỷ, Bát tự, tính theo khí) và **Tết** (dân gian, tiện lịch âm) | A / C | Hai cách chỉ lệch nhau khi ngày xem rơi giữa Tết và Lập xuân (vài tuần mỗi năm). Khi rơi vào khoảng đó, app hiện **cả hai kết quả** kèm mốc của từng bên. Ngoài khoảng đó thì trùng nhau. |
| Giờ can chi (Tý bắt đầu 23h), Ngũ Thử độn | A | Giờ Tý chia sớm/muộn (23-24h tính sang ngày sau). |

## 2. Ngày giờ tốt xấu

| Quy tắc | Bậc | Nguồn | Bất đồng |
|---|---|---|---|
| Lục xung, lục hợp, tam hợp, tương hình, tương hại của địa chi | B | Địa chi, suy ra được | Gần như không |
| Tuế phá, Nguyệt phá (chi ngày xung chi năm/tháng) | B | Hiệp kỷ | Ít |
| 12 Trực (Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thu, Khai, Bế) | B | Hiệp kỷ | Ngày đổi tiết thì Trực **lặp lại một lần**. Một số app bỏ quy tắc này. |
| Hoàng đạo / Hắc đạo (12 thần, khởi theo chi tháng) | B | Hiệp kỷ | Bảng khởi theo tháng có bản khác nhau. ĐỐI CHIẾU. |
| Giờ Hoàng đạo (theo chi ngày) | B | Suy từ 12 thần | Ít |
| Nhị thập bát tú (28 sao, vòng liên tục theo ngày) | B | Hiệp kỷ | Mỗi sao có việc kiêng cữ khác nhau giữa các nguồn. ĐỐI CHIẾU. |
| Thiên đức, Nguyệt đức và các cát thần tháng | B- | Hiệp kỷ | Bảng tra, ít lập luận. |
| Tam Nương (3,7,13,18,22,27 âm) | C | Dân gian | Không có phép suy ra |
| Nguyệt kỵ (5,14,23 âm) | C | Dân gian | Không có phép suy ra |
| Dương công kỵ, Sát chủ, Thọ tử, Vãng vong, Bành Tổ bách kỵ | C | Ngọc hạp / dân gian | Nhiều bản |

Cách hiển thị: không gộp thành một điểm duy nhất. Mỗi ngày hiện từng quy tắc bậc A và B với kết luận của từng nguồn, kèm số nguồn nhất trí. Mục C hiện thành "quy ước dân gian", có nhãn, bật tắt được.

## 3. Hướng nhà (Bát trạch)

| Quy tắc | Bậc | Nguồn | Bất đồng |
|---|---|---|---|
| Cung phi từ năm sinh (nam: 11 - tổng số, nữ: tổng + 4; sinh từ 2000 dùng 9 và 6) | B | Lạc thư, Hậu thiên bát quái | Năm sinh phải theo **Lập xuân**. Số 5: nam gửi Khôn, nữ gửi Cấn (một số phái nam gửi Cấn). ĐỐI CHIẾU. |
| Đông tứ mệnh (Khảm, Ly, Chấn, Tốn) / Tây tứ mệnh (Càn, Khôn, Cấn, Đoài) | B | Như trên | Không |
| 8 hướng: Sinh khí, Thiên y, Diên niên, Phục vị / Họa hại, Ngũ quỷ, Lục sát, Tuyệt mệnh | B | Suy từ biến hào của quẻ | Tên và thứ tự độ tốt có bản khác |
| Trạch quái (hướng nhà theo **tọa**, không chỉ hướng cửa) | B | Dương trạch | Hướng cửa hay tọa nhà là **bất đồng chính**. App hiện **kết quả theo cả hai cách**, nêu nguồn của mỗi cách. |
| Huyền không phi tinh (nhà theo vận 9: 2024-2043) | B | Huyền không | Phái khác hẳn Bát trạch. **Không trộn.** Làm sau, thành mô-đun riêng. |
| Loan đầu (núi, sông, đường xung) | C | Dân gian | Không tính toán được |

### Hướng theo năm (thần sát phương vị)

| Quy tắc | Bậc | Cách tính | Ghi chú |
|---|---|---|---|
| Thái tuế, Tuế phá (phương của địa chi năm và phương xung) | B | Suy từ địa chi của năm | Năm tính theo mốc ở mục 1, hiện cả hai khi cần |
| Tam sát (3 phương sát theo nhóm tam hợp của năm; ví dụ năm Thân-Tý-Thìn sát ở phương Nam) | B- | Suy từ tam hợp | Nguồn nêu cách gọi và phạm vi kiêng khác nhau. ĐỐI CHIẾU |
| Phi tinh lưu niên (Ngũ hoàng, Nhị hắc di chuyển mỗi năm) | B | Thuộc Huyền không | Phái riêng, để chung mô-đun Huyền không, không trộn vào Bát trạch |

## 4. Bàn làm việc

| Quy tắc | Bậc | Ghi chú |
|---|---|---|
| Hướng ngồi (mặt nhìn về): Sinh khí (tài lộc), Thiên y (sức khỏe), Diên niên (quan hệ), Phục vị (ổn định) | B | Dùng cung phi như mục 3 |
| Chọn hướng theo mục tiêu (công việc, học tập) | B- | Cách gán mục tiêu vào hướng là quy ước của từng phái |
| Lưng tựa tường, thấy cửa, tránh ngồi dưới xà | C | Loan đầu, hợp lý về công thái học nhưng không phải tính toán |

## 5. Tuổi làm nhà

| Quy tắc | Bậc | Cách tính | Bất đồng |
|---|---|---|---|
| Kim Lâu | C | Tuổi mụ chia 9; dư 1, 3, 6, 8 phạm (thân, thê, tử, lục súc) | Có nơi tính tuổi dương |
| Hoang Ốc | C | Tuổi mụ chia 6 theo vòng: Nhất cát, Nhì nghi, Tam địa sát, Tứ tấn tài, Ngũ thọ tử, Lục hoang ốc | Cách khởi đếm (từ tuổi 10) khác nhau giữa nguồn |
| Tam Tai | B- | 3 năm liên tiếp theo nhóm tam hợp của tuổi (Thân-Tý-Thìn: Dần Mão Thìn; Hợi-Mão-Mùi: Tỵ Ngọ Mùi; Dần-Ngọ-Tuất: Thân Dậu Tuất; Tỵ-Dậu-Sửu: Hợi Tý Sửu) | Gần như thống nhất. Suy ra được từ tam hợp, nên xếp B-. |
| Tuổi mụ | A | Năm làm nhà (âm lịch) - năm sinh + 1 | Mốc năm: Tết hay Lập xuân. ĐỐI CHIẾU. |
| Hợp mệnh gia chủ với năm, ngày khởi công | B | Ngũ hành sinh khắc + mục 2 | Dùng bảng nạp âm 60 hoa giáp |

Mặc định: Kim Lâu, Hoang Ốc hiển thị ở mục "quy ước dân gian", không chặn kết luận.

---

## Các điểm bất đồng cần thu thập nguồn thật

Mỗi điểm dưới đây app sẽ trình bày theo kiểu "nguồn X nói..., nguồn Y nói...". Chi tiết và URL ở thư mục `nguon/` (ngay-gio.md, nha-cua.md, tuoi.md).

Quy ước: **cổ thư** = đã đọc văn bản gốc (qua bản số hóa); **thứ cấp** = bài hiện đại, báo, blog; **trống** = chưa tìm thấy. Lưu ý: mọi lần đọc qua công cụ đều là bản tóm tắt, nên câu Hán trích ra phải mở trang gốc đối chiếu từng chữ trước khi đưa vào app.

| Điểm bất đồng | Tình trạng nguồn |
|---|---|
| Hướng nhà: tọa hay hướng cửa | **Hai cách cùng tồn tại, đã xác nhận bằng thứ cấp.** Văn bản gốc *Bát trạch minh cảnh* và *Dương trạch tam yếu*: **trống**. Thông tin "sách nói gì" đều do người khác thuật lại. Riêng Hiệp kỷ có câu liên quan tọa/hướng cho Tam sát (xem dưới). |
| Cung phi số 5 | Nam Khôn, nữ Cấn: **hai nguồn thứ cấp thống nhất**. **Không tìm thấy nguồn nào nói ngược**, nên giả thiết "có phái nam gửi Cấn" của mình **chưa có căn cứ**, bỏ khỏi bảng. Nguồn cổ: trống. |
| Trực: quy tắc lặp ở ngày đổi tiết | **Cổ thư:** Hiệp kỷ q.4 có quy tắc khởi từ chi tháng và "mỗi tháng giao tiết thì lặp hai ngày". Chưa thấy nguồn nào bỏ lặp. Chưa rõ ngày giao tiết lặp Trực của ngày trước hay ngày mới: **trống**, cần đọc chú giải. |
| Hoàng đạo/Hắc đạo: bảng khởi | **Cổ thư:** Hiệp kỷ q.7 có bảng khởi theo cặp chi tháng. Chưa thấy nguồn nào có bảng khác. Chính Hiệp kỷ coi thuyết này "giữ lại mà không bàn" (存而弗論), thiếu căn cứ trong kinh truyện. App nên ghi đúng nhận định đó. Tên thần có lệch nhẹ giữa nguồn (Kim Quỹ/Kim Quý/Kim Đường; "Bảo Quang" không thấy trong nguồn nào). |
| 28 sao: việc kiêng từng sao | **Trống phần lớn.** Chỉ có thứ tự vòng (thứ cấp). Sao khởi cho ngày mốc và việc nên/kiêng từng sao: **chưa tìm thấy**. Đây là mục khó nhất. |
| Mốc năm: Lập xuân hay Tết | **Thứ cấp:** Bát tự dùng Lập xuân (Wikipedia zh, Aslaksen 2010); tra tuổi âm phổ thông Việt dùng Tết. Aslaksen còn nêu thêm mốc Đông chí và mùng 7 tháng Giêng ở các truyền thống khác. **Cổ thư: chưa tìm thấy câu quy định mốc đổi năm** (Hiệp kỷ q.1-4, 33 và Tam mệnh thông hội q.1 đã quét, không có). Cung phi: blog Hoa dùng Lập xuân, hai nguồn Việt không nêu mốc. **Chưa nguồn nào xử lý riêng cho ca tuổi làm nhà giữa Tết và Lập xuân.** |
| Kim Lâu | Cách tính (tuổi mụ, chia 9, dư 1/3/6/8) khớp giữa các nguồn thứ cấp. **Không tìm thấy nguồn cổ nào**; một nhà nghiên cứu dân gian nói xuất phát từ tín ngưỡng, và một bài diễn đàn trích chuyên gia nói không có lời giải thích chặt chẽ. Củng cố xếp **bậc C**. |
| Hoang Ốc | Cách đếm (10 tuổi = Nhất Cát) khớp giữa hai nguồn thứ cấp. **Nguồn cổ: trống.** Hai cách đếm (theo mốc chục / cộng chữ số rồi chia 6) **chưa kiểm là trùng nhau mọi tuổi**: phải kiểm bằng code. |
| Tam tai | Bảng theo nhóm tam hợp khớp giữa nguồn thứ cấp. Nguồn cổ: trống. Nhiều bài báo **trộn Tam tai (theo tuổi người) với Tam sát (theo phương năm)**; app phải tách hai khái niệm. |
| Tam sát: phạm vi kiêng | **Cổ thư, đã đọc:** Hiệp kỷ q.3 nói năm Thân-Tý-Thìn Tam sát ở Tỵ-Ngọ-Mùi. Ba nhóm còn lại suy từ bảng Kiếp sát/Tuế sát, chưa thấy câu liệt kê. Có phân biệt rõ: Thái tuế "có thể tọa, không thể hướng"; Tam sát "có thể hướng, không thể tọa"; chiếm sơn (tọa) thì kỵ cả tạo táng, chiếm phương thì chế hóa được. Trong chính Hiệp kỷ, Thông thư (chỉ kiêng tu phương) và Tông kính (nặng hơn, cần chế hóa) **khác nhau**, và phần Án phê cả hai. Tuế phá được coi hung nhất, không có cách chế hóa. |

### Đã đối chiếu văn bản thô (2026-11-16)

Các câu Hán sau đã được đối chiếu trực tiếp với văn bản thô Wikisource (`action=raw`), không qua bản tóm tắt, và đã đưa vào `rules-b.js`:
- **q.4:** 每月交節則疊兩值日; quy tắc khởi Trực từ chi tháng; 除危定執成開為吉, 建破平收滿閉為凶 (考原曰).
- **q.7:** thứ tự 12 thần; bảng khởi Thanh Long theo cặp chi tháng; **bảng giờ** 子日申時起青龍 (nguồn cho giờ Hoàng đạo, lúc đầu agent báo "chưa tìm thấy"); phần Án 黑道之説葢不見經傳, 存而弗論.
- **q.3:** Tam sát = Kiếp + Tai + Tuế sát; 申子辰年三煞在巳午未; Kiếp sát/Tai sát cho các nhóm; 歲破者太歲所衝之辰.
- **q.8:** 太嵗可坐不可向三煞可向不可坐, nhưng đây là câu Hiệp kỷ **trích từ 選擇宗鏡**, không phải lời của Hiệp kỷ.

**Không tìm thấy** trong các quyển 1-12 đã tải: câu 占山則造葬皆忌 / 占方則可制而修 mà agent thu thập đã báo. Bỏ khỏi app cho đến khi tìm được.

Chưa đối chiếu: quan hệ địa chi (lục xung, hợp, hình, hại) mới là quy ước chuẩn, chưa trích sách; hai nhóm Tam sát Dần-Ngọ-Tuất và Hợi-Mão-Mùi suy theo cùng quy luật, chưa có câu liệt kê.

### Bát trạch (`bat-trach.js`, 2026-11-16)

- **Cung phi:** hai dạng công thức (nguồn A: 10 - a / 5 + a trước 2000, 9 - a / 6 + a từ 2000; nguồn C: 11 - tổng / 4 + tổng) **cho kết quả giống nhau với mọi năm 1900-2099**, đã kiểm bằng code. Chúng là cùng một phép tính theo modulo 9. Dạng "9 - tổng toàn năm" cho năm từ 2000 là **sai**; phải dùng tổng hai số cuối, hoặc dùng công thức gộp.
- **8 hướng:** suy từ biến hào của quẻ. Bốn hướng cát của mỗi quẻ luôn cùng nhóm Đông/Tây tứ mệnh (đã kiểm cho cả 8 quẻ). Chỉ bảng của **Càn** có nguồn đọc được (masterseanchan); bảy quẻ còn lại do suy ra, khớp bảng chuẩn mình nhớ nhưng **chưa đối chiếu sách**. Một nguồn cùng trang còn có bảng Càn lệch (xem như lỗi).
- **Trạch quái:** hiện cả hai cách (theo tọa, theo hướng cửa/khí khẩu). Nguồn thứ cấp, văn bản gốc chưa đọc.
- **Hướng ngồi bàn:** hiện hai cách hiểu (mặt nhìn về hướng tốt, lưng tựa vào hướng tốt). Chưa có nguồn để chọn.
- **Không xếp hạng** bốn hướng hung, vì nguồn khác nhau (Việt: Tuyệt mệnh > Ngũ quỷ > Lục sát > Họa hại; masterseanchan: Tuyệt mệnh > Lục sát > Ngũ quỷ > Họa hại).

### Điều rút ra cho thiết kế

1. **Hiệp kỷ có thể trích trực tiếp** cho Trực, 12 thần, Tam sát, Thái tuế, Tuế phá, và app trích được kèm quyển/mục. Đây là phần mạnh nhất.
2. **Kim Lâu, Hoang Ốc, Tam tai chưa có nguồn cổ.** App ghi thẳng: "quy ước dân gian, chưa tìm thấy nguồn cổ", không viết "theo sách cổ".
3. **Bát trạch chỉ có nguồn thứ cấp** vì chưa đọc được văn bản gốc. App ghi rõ "theo cách thuật lại của...", và mục tọa/hướng chỉ trình bày hai cách, không phán.
4. **Điểm hay:** Tam sát "có thể hướng, không thể tọa" nối trực tiếp vấn đề tọa hay hướng. App tính cả hai thì sẽ ra kết quả khác nhau, và đó là thông tin thật cho người dùng.
5. **28 sao** chưa nên đưa vào bản đầu, vì chưa có nguồn cho bảng khởi và việc kiêng.

### Việc còn trống (cần tra thêm)
- Văn bản gốc *Bát trạch minh cảnh*, *Dương trạch tam yếu*, *Ngọc hạp thông thư*, bản dịch Việt của Hiệp kỷ.
- Bảng 28 sao theo ngày và việc kiêng từng sao.
- Ngày giao tiết lặp Trực theo ngày trước hay ngày mới (đọc chú giải Hiệp kỷ).
- Kiểm bằng code: hai cách Hoang Ốc có trùng nhau; hai công thức cung phi (10 - a và 11 - tổng) có trùng nhau mọi năm sinh.

Còn một quyết định thuộc về bạn: Huyền không phi tinh làm luôn ở bản đầu hay để sau (mặc định: để sau).

## Kiểm chứng sau khi viết code

- Đối chiếu lịch âm và can chi với lịch vạn niên (ít nhất 50 ngày, gồm tháng nhuận, ngày đổi tiết, giờ Tý).
- Đối chiếu cung phi với ví dụ trong sách Bát trạch.
- Chạy kiểm thử tự động cho mọi quy tắc B tính được từ công thức.

## Kiểu app

Web app một file, chạy **offline trong Safari** (macOS và iPhone), không cần máy chủ. Thêm vào Dock/Màn hình chính để dùng như app. Tránh cú pháp quá mới để chạy được trên Safari của MacBook 2015.
