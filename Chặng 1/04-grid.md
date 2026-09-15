# 04 — CSS Grid — Xếp đồ theo HAI chiều

> Flexbox xếp một chiều (hàng *hoặc* cột). Grid xếp **hai chiều cùng lúc** (hàng *và* cột) — như kẻ một cái bảng ô lưới rồi đặt đồ vào. Dùng Grid cho **bố cục tổng thể của trang**; Flexbox cho **các cụm nhỏ bên trong**.

---

## 1. Flexbox hay Grid? — quyết trong 1 câu

> **Sắp một dãy theo một chiều → Flexbox. Sắp theo lưới hàng-và-cột → Grid.**

Ví dụ thực tế:
- Navbar (một hàng) → Flexbox.
- Các link trong navbar → Flexbox.
- **Bố cục cả trang** (header trên, sidebar trái, nội dung phải, footer dưới) → Grid.
- Lưới ảnh/sản phẩm dạng bảng đều tăm tắp → Grid.

Và chúng **kết hợp** với nhau: dùng Grid chia khung trang, rồi trong từng ô lại dùng Flexbox xếp nội dung. Đây là cách dev thật làm.

---

## 2. Container & Items (giống Flexbox)

```html
<div class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
</div>
```

```css
.grid {
  display: grid;   /* biến cha thành grid container, con thành grid items */
}
```

Khác Flexbox ở chỗ: với Grid, bạn **định nghĩa lưới trước** (mấy cột, mấy hàng, rộng bao nhiêu), rồi item rơi vào các ô.

---

## 3. Định nghĩa CỘT và HÀNG

### 3.1 `grid-template-columns` — định nghĩa các cột
```css
.grid {
  display: grid;
  grid-template-columns: 200px 200px 200px;  /* 3 cột, mỗi cột 200px */
}
```
Số giá trị = số cột. Ở trên là 3 cột cố định 200px.

### 3.2 Đơn vị `fr` — "phần" của không gian còn lại (đặc sản của Grid)
`fr` = fraction = chia không gian trống theo tỉ lệ.
```css
grid-template-columns: 1fr 1fr 1fr;   /* 3 cột rộng BẰNG NHAU, tự co giãn */
grid-template-columns: 2fr 1fr;       /* cột trái gấp đôi cột phải */
grid-template-columns: 200px 1fr;     /* cột trái cố định 200px, cột phải ăn hết phần còn lại */
```

> 🧠 Cái `200px 1fr` chính là mẫu **sidebar cố định + nội dung co giãn** kinh điển. Nhớ nó.

### 3.3 `repeat()` — đỡ phải gõ lặp
```css
grid-template-columns: repeat(3, 1fr);        /* = 1fr 1fr 1fr */
grid-template-columns: repeat(4, 1fr);        /* 4 cột đều nhau */
grid-template-columns: 200px repeat(2, 1fr);  /* trộn được */
```

### 3.4 `grid-template-rows` — định nghĩa hàng (tương tự)
```css
grid-template-rows: 100px 300px 80px;   /* header 100, giữa 300, footer 80 */
```
Thường bạn chỉ cần khai cột; hàng cứ để nó tự cao theo nội dung.

### 3.5 `gap` — khoảng cách giữa các ô (giống Flexbox)
```css
gap: 16px;          /* cách đều */
gap: 20px 10px;     /* hàng cách 20, cột cách 10 */
```

🛠️ **Thử ngay:** 6 div trong một grid, `grid-template-columns: repeat(3, 1fr); gap: 10px`. Xem 6 ô tự xếp thành lưới 3 cột × 2 hàng. Đổi `repeat(3,...)` thành `repeat(2,...)` xem nó thành 2 cột × 3 hàng.

---

## 4. Đặt item vào ô cụ thể — cho item "trải" qua nhiều ô

Mặc định item rơi tuần tự vào từng ô. Nhưng bạn có thể bắt một item **chiếm nhiều cột/hàng**:

```css
.item-lon {
  grid-column: span 2;   /* trải rộng 2 cột */
  grid-row: span 2;      /* và cao 2 hàng */
}
```

Hoặc chỉ định chính xác từ đường kẻ nào đến đường kẻ nào (Grid đánh số các "đường kẻ" lưới từ 1):
```css
.item {
  grid-column: 1 / 3;   /* từ đường kẻ dọc 1 đến 3 → chiếm cột 1 và 2 */
  grid-row: 1 / 2;      /* hàng 1 */
}
```

> ⚠️ **Bẫy số đường kẻ:** đường kẻ đánh số từ 1, và `1 / 3` nghĩa là "từ vạch 1 đến vạch 3" → chiếm 2 cột (cột 1 và 2), KHÔNG phải 3 cột. Nghĩ theo "vạch ngăn" chứ không phải "số cột".

---

## 5. `grid-template-areas` — bố cục trang bằng "bản đồ chữ" (siêu trực quan)

Đây là tính năng làm Grid tỏa sáng cho layout cả trang. Bạn "vẽ" layout bằng tên:

```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;   /* sidebar 200px, nội dung co giãn */
  grid-template-rows: auto 1fr auto;  /* header, giữa, footer */
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  gap: 10px;
  min-height: 100vh;     /* cao tối thiểu = cả màn hình */
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

```html
<div class="layout">
  <header class="header">...</header>
  <aside class="sidebar">...</aside>
  <main class="main">...</main>
  <footer class="footer">...</footer>
</div>
```

Nhìn cái khối `grid-template-areas` là thấy ngay layout: header trải hết bề ngang, dưới là sidebar + main nằm cạnh nhau, footer trải hết. Đọc CSS như đọc bản đồ. Đây là cách sạch và dễ bảo trì nhất để dựng khung trang — và ở file `05` bạn sẽ thấy nó **dễ làm responsive kinh khủng** (chỉ cần vẽ lại bản đồ cho màn hình nhỏ).

---

## 6. Lưới TỰ ĐỘNG responsive — một dòng thần thánh

Đây là thứ bạn sẽ mê. Tạo lưới tự động điều chỉnh số cột theo bề rộng màn hình, **không cần media query**:

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

Dịch nghĩa dòng giữa: "tạo bao nhiêu cột tùy thích (`auto-fit`), mỗi cột **tối thiểu 200px, tối đa 1fr**". Kết quả: màn hình rộng → nhiều cột; màn hình hẹp → tự bớt cột; mỗi ô không bao giờ nhỏ hơn 200px. Co giãn mượt mà mà bạn không viết một media query nào.

> Học thuộc `repeat(auto-fit, minmax(XXXpx, 1fr))`. Đây là "phép thuật" cho mọi lưới ảnh/sản phẩm responsive. `minmax(a, b)` nghĩa là "rộng tối thiểu a, tối đa b".

🛠️ **Thử ngay (rất đã):** 8 thẻ trong `.gallery` với dòng trên, rồi kéo co cửa sổ trình duyệt qua lại. Xem số cột tự tăng giảm. Đây là khoảnh khắc "à há" của nhiều người với Grid.

---

## 7. Căn item bên trong ô lưới

Grid cũng có cặp căn chỉnh (lưu ý tên hơi khác Flexbox):
```css
.grid {
  justify-items: center;   /* căn item theo chiều NGANG trong ô */
  align-items: center;     /* căn item theo chiều DỌC trong ô */
}
/* place-items: center;  → viết tắt cho cả hai, căn giữa hoàn toàn */
```

---

## 8. Grid + Flexbox: cách dùng chung trong thực tế

```
Grid  → dựng khung lớn (header / sidebar / main / footer)
  └─ trong <main>, Grid → lưới sản phẩm (auto-fit)
        └─ trong mỗi card, Flexbox → xếp ảnh, tên, giá, nút theo cột
  └─ trong <header>, Flexbox → logo trái, menu phải
```

Không phải "chọn một bỏ một". Grid lo bố cục 2 chiều cấp cao, Flexbox lo sắp xếp 1 chiều cấp thấp. Dùng đúng việc.

---

## ✅ Checkpoint

1. Một câu: khi nào Flexbox, khi nào Grid?
2. `1fr` nghĩa là gì? `grid-template-columns: 200px 1fr` cho layout kiểu gì?
3. `grid-column: 1 / 3` chiếm mấy cột? Vì sao?
4. `grid-template-areas` giúp gì cho việc đọc/bảo trì layout?
5. Giải thích `repeat(auto-fit, minmax(200px, 1fr))` bằng lời.
6. Grid và Flexbox có loại trừ nhau không?

---

## 🏋️ Bài tập

Tạo `bai-tap-04.html`. Hai phần:

**1. Bố cục trang bằng `grid-template-areas`:** dựng khung header / sidebar / main / footer đúng như mẫu mục 5. Cho mỗi vùng một màu nền khác nhau để thấy rõ ranh giới. `min-height: 100vh`.

**2. Gallery responsive:** trong `<main>`, làm một lưới 8–10 thẻ dùng `repeat(auto-fit, minmax(200px, 1fr))` + `gap`. Kéo co cửa sổ, xem số cột tự đổi.

**Thử thách (không bắt buộc):** trong mỗi card của gallery, dùng **Flexbox** xếp dọc: tên thẻ ở trên, một đoạn mô tả ở giữa, một nút ở dưới cùng — luyện việc lồng Flexbox trong Grid.

Gửi mình code. Xong file này bạn đã có đủ hai công cụ layout mạnh nhất — file `05` sẽ dạy cách làm chúng thích nghi với mọi kích thước màn hình.
