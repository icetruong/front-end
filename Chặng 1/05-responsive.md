# 05 — Responsive Design — Web co giãn theo mọi màn hình

> File cuối Chặng 1. Mục tiêu: trang của bạn đẹp trên cả điện thoại lẫn màn hình lớn. Đây là kỹ năng BẮT BUỘC cho web thật — không ai chấp nhận trang vỡ trên mobile.

---

## 1. Bắt đầu từ thẻ `<meta viewport>` (giờ giải thích lời hứa ở file `00`)

Dòng này trong `<head>` là điều kiện tiên quyết của mọi thứ responsive:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Không có nó, điện thoại sẽ giả vờ màn hình rộng ~980px rồi **thu nhỏ cả trang lại** cho vừa — chữ tí xíu, người dùng phải zoom. Dòng này bảo: "lấy đúng bề rộng thật của thiết bị, đừng thu nhỏ". **Thiếu nó thì mọi media query bên dưới đều vô dụng.** Luôn có dòng này.

---

## 2. Tư duy "Mobile-First" — viết CSS cho điện thoại TRƯỚC

Cách làm chuẩn của nghề: viết CSS mặc định cho màn hình **nhỏ nhất** (điện thoại), rồi *thêm* điều chỉnh khi màn hình **rộng dần ra**.

Vì sao? Layout mobile thường đơn giản (mọi thứ xếp dọc một cột) → làm nền dễ. Rồi màn rộng mới thêm cột, thêm sidebar. Ngược lại (desktop-first rồi bóp nhỏ) thường rối hơn.

```css
/* MẶC ĐỊNH = mobile: mọi thứ 1 cột, xếp dọc */
.container {
  display: flex;
  flex-direction: column;
}

/* Màn rộng hơn 768px thì mới chuyển sang nằm ngang */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}
```

> 🧠 **Liên hệ tư duy:** giống viết code xử lý trường hợp cơ bản trước, rồi thêm nhánh `if` cho các trường hợp đặc biệt. Mặc định = mobile; `@media (min-width...)` = các nhánh "nếu màn rộng hơn thì...".

---

## 3. Media Query — cú pháp & breakpoint

```css
@media (min-width: 768px) {
  /* CSS ở đây CHỈ áp dụng khi màn hình RỘNG TỪ 768px trở lên */
}

@media (max-width: 767px) {
  /* CHỈ áp dụng khi màn hình HẸP DƯỚI 767px */
}
```

- Mobile-first dùng `min-width` (rộng từ X trở lên thì thêm style).
- Các mốc (breakpoint) thông dụng — không có chuẩn cứng, đây là mốc hay dùng:

| Mốc | Thiết bị tham chiếu |
|-----|---------------------|
| `min-width: 640px` | điện thoại lớn / tablet dọc |
| `min-width: 768px` | tablet |
| `min-width: 1024px` | tablet ngang / laptop nhỏ |
| `min-width: 1280px` | desktop |

> ⚠️ **Bẫy:** đừng chọn breakpoint theo "tên thiết bị" (iPhone bao nhiêu px...). Cách đúng: kéo co cửa sổ trình duyệt từ từ, **đến khi nào layout bắt đầu xấu/vỡ thì đặt breakpoint ở đó**. Breakpoint phục vụ nội dung, không phục vụ một cái máy cụ thể.

---

## 4. ĐƠN VỊ — chọn đúng đơn vị là nửa cuộc chơi responsive

Đây là phần file `02` mình hẹn đào sâu.

### `px` — tuyệt đối, cố định
Dùng cho thứ KHÔNG nên co giãn: border, đôi khi bo góc. `border: 1px solid` thì cứ px.

### `%` — phần trăm so với phần tử CHA
```css
.col { width: 50%; }   /* rộng bằng nửa cha */
```

### `rem` — gấp mấy lần cỡ chữ GỐC của trang ⭐
- `1rem` = cỡ chữ gốc, mặc định **16px**.
- `1.5rem` = 24px, `0.875rem` = 14px...
- **Dùng `rem` cho font-size, padding, margin, gap.** Vì sao quan trọng: nếu người dùng (hoặc bạn) đổi cỡ chữ gốc, **toàn trang co giãn đồng bộ theo**. Đây là chuẩn accessibility — người mắt kém phóng to chữ thì cả layout giãn theo, không vỡ.

```css
html { font-size: 16px; }   /* gốc */
.title { font-size: 2rem; }    /* = 32px, nhưng co giãn theo gốc */
.card  { padding: 1.5rem; }    /* = 24px */
```

### `em` — gấp mấy lần cỡ chữ của CHÍNH phần tử đó
Giống rem nhưng mốc là font của phần tử hiện tại (không phải gốc). Dễ "dồn tích" khi lồng nhau → người mới dùng rem cho an toàn, em để dành cho vài trường hợp đặc thù.

### `vw` / `vh` — phần trăm bề rộng/cao của VIEWPORT (cả màn hình)
```css
.hero { height: 100vh; }   /* cao đúng bằng cả màn hình */
.full { width: 100vw; }    /* rộng đúng bằng cả màn hình */
```
`1vw` = 1% bề rộng cửa sổ; `1vh` = 1% chiều cao. Hay dùng cho banner/hero full màn hình.

### `clamp()` — co giãn có giới hạn (xịn, nên biết)
```css
.title {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```
Dịch: "cỡ chữ = 4vw (co giãn theo màn hình), nhưng **không nhỏ hơn 1.5rem và không lớn hơn 3rem**". Chữ tự to nhỏ theo màn hình mà vẫn nằm trong khoảng an toàn — gọi là *fluid typography*. Một dòng thay cho mấy media query chỉnh font.

> ✅ **Quy tắc chọn đơn vị nhanh:** font & spacing → `rem`; bề rộng layout → `%` hoặc `fr` (Grid); chiều cao full màn → `vh`; viền → `px`; muốn co giãn có chặn → `clamp()`.

---

## 5. Ghép với Flexbox & Grid — responsive thường KHÔNG cần nhiều media query

Hai công cụ ở file 03–04 vốn đã co giãn sẵn. Tận dụng trước, media query chỉ để "chỉnh nốt":

### Flexbox tự xuống dòng
```css
.cards {
  display: flex;
  flex-wrap: wrap;       /* hẹp thì tự xuống dòng — không cần media query */
  gap: 1rem;
}
.cards > * { flex: 1 1 250px; }
```

### Grid tự đổi số cột (đã học ở file 04)
```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  /* tự responsive, KHÔNG cần một media query nào */
}
```

### `grid-template-areas` đổi bố cục theo màn hình (cực sạch)
```css
.layout {
  display: grid;
  grid-template-columns: 1fr;          /* mobile: 1 cột */
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 200px 1fr;  /* desktop: sidebar + main cạnh nhau */
    grid-template-areas:
      "header  header"
      "sidebar main"
      "footer  footer";
  }
}
```

Chỉ cần **vẽ lại bản đồ** trong media query — bố cục đảo hoàn toàn mà không đụng HTML. Đây là lý do `grid-template-areas` rất được yêu cho layout responsive.

---

## 6. Ảnh responsive — đừng để ảnh tràn vỡ trang

Một dòng phải nhớ, nếu không ảnh to sẽ phá layout trên mobile:
```css
img {
  max-width: 100%;   /* ảnh không bao giờ rộng quá khung chứa */
  height: auto;      /* giữ đúng tỉ lệ, không méo */
  display: block;    /* bỏ khoảng trắng thừa dưới ảnh inline */
}
```

> ⚠️ **Bẫy:** quên `max-width: 100%` → một tấm ảnh 2000px sẽ phá toang layout mobile, đẩy mọi thứ tràn ngang, xuất hiện thanh cuộn ngang khó chịu. Gần như luôn đặt luật này cho `img`.

---

## 7. Công cụ kiểm tra responsive

Trong trình duyệt: mở DevTools (`F12`) → bấm icon điện thoại/tablet (Toggle device toolbar, `Ctrl/Cmd + Shift + M`) → chọn kích thước máy để xem trang trên mobile mà không cần điện thoại thật. Kéo co cạnh cửa sổ cũng được. **Test responsive thường xuyên trong lúc làm, đừng để cuối mới test.**

---

## ✅ Checkpoint

1. Thẻ `<meta viewport>` để làm gì? Thiếu nó thì sao?
2. "Mobile-first" nghĩa là viết CSS theo thứ tự nào? Dùng `min-width` hay `max-width`?
3. Vì sao nên dùng `rem` cho font/spacing thay vì `px`?
4. Giải thích `clamp(1.5rem, 4vw, 3rem)` bằng lời.
5. Hai cách làm layout responsive mà gần như KHÔNG cần media query là gì?
6. Vì sao `img` cần `max-width: 100%`?

---

## 🏋️ Bài tập CUỐI CHẶNG 1 — Đồ án nhỏ (gộp tất cả)

Đây là bài "tốt nghiệp" Chặng 1. Tạo `do-an-chang-1.html` — một **trang giới thiệu (landing page)** responsive hoàn chỉnh, gom mọi thứ đã học:

**Yêu cầu cấu trúc (HTML semantic — file 01):**
- `<header>` có logo + `<nav>`.
- `<main>` gồm: một khu "hero" (tiêu đề lớn + mô tả + nút), một `<section>` "tính năng" với 3–4 thẻ, một `<section>` "bảng giá" với vài gói.
- `<footer>`.

**Yêu cầu CSS (file 02–05):**
- Dán reset `box-sizing: border-box` + `img { max-width:100% }` đầu file.
- Dùng `rem` cho font và spacing.
- Navbar dùng **Flexbox** (`space-between`).
- Khu tính năng và bảng giá dùng **Grid** `repeat(auto-fit, minmax(...))` để tự responsive.
- Tiêu đề hero dùng `clamp()` cho cỡ chữ co giãn.
- Có **ít nhất một media query** đổi layout giữa mobile và desktop (ví dụ hero: mobile xếp dọc, desktop chia 2 cột).
- Test bằng DevTools device toolbar: phải đẹp ở cả 375px (điện thoại) lẫn 1280px (desktop).

Đây là **trang đầu tiên trong portfolio** của bạn. Làm kỹ, không vội. Gửi mình toàn bộ code (HTML + CSS), mình review chi tiết: cấu trúc semantic, cách dùng layout, đặt đơn vị, breakpoint hợp lý chưa.

---

## 🎓 Hết Chặng 1

Xong đồ án này, bạn đã có thể **tự dựng một trang tĩnh đẹp và responsive từ đầu** — điều mà lúc bắt đầu chặng bạn còn "không nhớ kỹ HTML/CSS". Đó là một bước nhảy lớn.

Chặng 2 (theo lộ trình đã chốt) là **JavaScript & DOM thực chiến**: cho trang "sống dậy" — bắt sự kiện, đổi nội dung động, và gọi vào một API Spring Boot bạn tự viết. Đó là lúc nền backend của bạn bắt đầu phát huy. Nhưng cứ chinh phục đồ án Chặng 1 trước đã. 💪
