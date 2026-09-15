# 02 — CSS Nền Tảng & Box Model — "Trình duyệt đang nghĩ gì"

> Đây là file QUAN TRỌNG NHẤT của Chặng 1. Nếu hiểu chắc file này, Flexbox/Grid sau đó sẽ nhẹ tênh. Nếu lướt qua nó, bạn sẽ "ảo ma" suốt phần còn lại. Học chậm, gõ tay nhiều.

---

## Phần 1 — CSS gắn vào trang bằng cách nào & "Selector"

### 1.1 Ba cách viết CSS

```html
<!-- 1. Inline (tránh dùng, chỉ để test nhanh) -->
<p style="color: red;">Chữ đỏ</p>

<!-- 2. Internal: trong thẻ <style> ở <head> (ta dùng trong lúc học) -->
<style>
  p { color: red; }
</style>

<!-- 3. External: file .css riêng (dùng cho dự án thật) -->
<link rel="stylesheet" href="style.css">
```

Trong lúc học mình dùng cách 2 cho nhanh. Dự án thật luôn dùng cách 3.

### 1.2 Cấu trúc một "luật" CSS

```css
selector {
  property: value;   /* đây là một "declaration" */
  color: red;
  font-size: 16px;
}
```

- **Selector**: chọn cái cần style.
- Trong `{ }` là các cặp `thuộc-tính: giá-trị;`. Nhớ dấu `;` cuối mỗi dòng.

### 1.3 Các selector phải thuộc nằm lòng

```css
/* Theo tên thẻ */
p { }                 /* mọi thẻ <p> */

/* Theo class — DÙNG NHIỀU NHẤT. HTML: <div class="card"> */
.card { }

/* Theo id — HTML: <div id="header">. Hạn chế dùng để style (xem phần specificity) */
#header { }

/* Kết hợp: thẻ p CÓ class "intro" */
p.intro { }

/* Hậu duệ: thẻ <a> nằm BÊN TRONG .nav (ở bất kỳ độ sâu nào) */
.nav a { }

/* Con trực tiếp: <li> là con NGAY DƯỚI .menu */
.menu > li { }

/* Nhóm: áp cùng luật cho nhiều selector */
h1, h2, h3 { }

/* Trạng thái (pseudo-class): khi rê chuột lên */
button:hover { }
```

> 🧠 **Liên hệ Java:** class trong CSS không giống `class` trong Java. Nó gần với khái niệm "tag/nhãn" bạn dán lên nhiều phần tử để xử lý hàng loạt — kiểu như một annotation đánh dấu. Một phần tử mang nhiều class được: `<div class="card featured big">`.

> ⚠️ **Bẫy:** `.nav a` (có dấu cách) ≠ `.nav.active` (không cách) ≠ `.nav > a` (dấu lớn hơn). Dấu cách = "bên trong". Không dấu = "cùng một phần tử mang cả hai class". Dấu `>` = "con trực tiếp". Sai một dấu cách là sai hết.

---

## Phần 2 — Specificity: vì sao CSS của tôi "không ăn"?

Đây là câu hỏi đau đầu số 1 của người mới. Bạn viết luật mà chữ không đổi màu. Lý do: **một luật khác mạnh hơn đang thắng.**

Khi nhiều luật cùng nhắm một phần tử, trình duyệt tính **độ mạnh (specificity)** để quyết ai thắng. Tính như một bộ ba số `(A, B, C)`:

- A = số lượng `#id`
- B = số lượng `.class` (và `:hover`, `[attr]`)
- C = số lượng tên thẻ (`p`, `div`...)

So sánh từ trái sang: ai có A lớn hơn thắng; bằng thì xét B; rồi C.

```css
p             { color: black; }   /* (0,0,1) */
.intro        { color: blue;  }   /* (0,1,0) → mạnh hơn dòng trên */
p.intro       { color: green; }   /* (0,1,1) → mạnh hơn nữa */
#main p.intro { color: red;   }   /* (1,1,1) → thắng tất cả */
```

Quy tắc phụ:
- **Hòa specificity** → luật **viết sau** trong file thắng (thứ tự từ trên xuống).
- `!important` → phá luật, ép thắng mọi thứ. **Đừng dùng** trừ khi cực chẳng đã; nó là nợ kỹ thuật, sau này gỡ rất mệt.

> ⚠️ **Bẫy `#id`:** id rất "nặng" specificity, dễ làm bạn không ghi đè nổi sau này. **Lời khuyên thực chiến: style bằng `class` gần như mọi lúc.** Để dành `id` cho việc JS chọn phần tử hoặc làm anchor link. Cứ xài class hết là đời nhẹ nhàng.

🛠️ **Thử ngay:** dán 4 dòng CSS trên + một thẻ `<p class="intro" id="x">` (bọc trong `<div id="main">`), rồi xóa dần từng dòng từ dưới lên, xem màu đổi ra sao. Hiểu specificity bằng mắt nhanh hơn đọc lý thuyết.

---

## Phần 3 — BOX MODEL (xương sống tuyệt đối)

Bạn đã trả lời đúng câu `250px` lúc chẩn đoán — nghĩa là nền đã có. Giờ ta đào sâu vì mọi layout đều dựng trên cái này.

### 3.1 Mọi phần tử là một cái HỘP gồm 4 lớp

Từ trong ra ngoài:

```
        ┌───────────────────────────────────┐  ← margin (lề NGOÀI, trong suốt)
        │   ┌───────────────────────────┐   │
        │   │        border (viền)       │   │
        │   │   ┌───────────────────┐   │   │
        │   │   │  padding (đệm      │   │   │
        │   │   │   trong, quanh     │   │   │
        │   │   │   nội dung)        │   │   │
        │   │   │   ┌───────────┐   │   │   │
        │   │   │   │  content  │   │   │   │  ← nội dung (chữ, ảnh)
        │   │   │   └───────────┘   │   │   │
        │   │   └───────────────────┘   │   │
        │   └───────────────────────────┘   │
        └───────────────────────────────────┘
```

- **content** — nội dung thật (chữ, ảnh). `width`/`height` mặc định nhắm vào đây.
- **padding** — khoảng đệm **bên trong** viền, giữa nội dung và border. Có màu nền.
- **border** — đường viền.
- **margin** — khoảng cách **bên ngoài**, đẩy các hộp khác ra xa. Trong suốt.

Cách nhớ: **padding đẩy nội dung vào trong; margin đẩy hàng xóm ra ngoài.**

### 3.2 Cú pháp viết tắt 4 hướng (gặp suốt)

```css
padding: 10px;                 /* cả 4 hướng = 10px */
padding: 10px 20px;            /* trên-dưới=10, trái-phải=20 */
padding: 10px 20px 30px 40px;  /* trên, phải, dưới, trái (chiều kim đồng hồ) */

/* margin/border tương tự */
margin: 0 auto;   /* trên-dưới=0; trái-phải=auto → CĂN GIỮA khối theo chiều ngang */
```

> Mẹo nhớ thứ tự 4 giá trị: **TRÊN → PHẢI → DƯỚI → TRÁI**, đi theo chiều kim đồng hồ, bắt đầu từ 12 giờ.

### 3.3 BÀI TOÁN "250px" và `box-sizing` (đây là phần lúc trước bạn chưa học)

Mặc định, `width` chỉ tính **content**. Nên:

```css
.hop {
  width: 200px;
  padding: 20px;     /* +20 mỗi bên = +40 */
  border: 5px solid; /* +5 mỗi bên = +10 */
}
/* Bề rộng thực chiếm = 200 + 40 + 10 = 250px  ← đáp án bạn trả lời đúng */
```

Vấn đề: bạn *muốn* hộp rộng đúng 200px, nhưng thêm padding lại phình thành 250 → vỡ layout. Giải pháp là dòng CSS huyền thoại:

```css
.hop {
  box-sizing: border-box;   /* width giờ TÍNH CẢ padding + border */
  width: 200px;
  padding: 20px;
  border: 5px solid;
}
/* Bề rộng thực = đúng 200px. Nội dung tự co lại còn 200-40-10 = 150px */
```

`box-sizing: border-box` đảo ngược cách tính: `width` bạn khai = bề rộng **tổng** của hộp (gồm padding + border), nội dung tự co cho vừa. Dễ tính hơn nhiều.

> ✅ **Quy ước vàng của nghề:** mọi dự án thật mở đầu file CSS bằng đoạn này để cho TẤT CẢ phần tử dùng border-box:
> ```css
> *, *::before, *::after {
>   box-sizing: border-box;
> }
> ```
> `*` nghĩa là "mọi phần tử". Cứ dán dòng này đầu file CSS, từ giờ về sau bạn tính width dễ thở. Đây là dòng đầu tiên gần như dev nào cũng gõ.

### 3.4 `margin` collapse — một "đặc sản" gây bối rối

Khi hai khối nằm chồng dọc, margin trên-dưới của chúng **không cộng lại** mà **lấy giá trị LỚN HƠN**.

```
Hộp A có margin-bottom: 30px
Hộp B có margin-top:    20px
→ Khoảng cách giữa chúng KHÔNG phải 50px, mà là 30px (lấy max)
```

Lần đầu gặp ai cũng tưởng mình tính sai. Không, đó là "margin collapse" — chỉ xảy ra với margin **dọc** (trên/dưới) của các block. Margin ngang không bị. Biết để khỏi hoảng; cách né triệt để (dùng `gap` của Flexbox/Grid) mình dạy ở file sau.

---

## Phần 4 — NORMAL FLOW: trình duyệt xếp thẻ ra sao khi bạn KHÔNG làm gì

Đây là phần mình hứa dạy đầu chặng. Hiểu cái này thì sau này Flexbox/Grid mới không "ảo ma" — vì chúng chẳng qua là cách *bẻ* dòng chảy mặc định này.

Khi chưa có CSS layout nào, trình duyệt xếp phần tử theo **"normal flow"** (dòng chảy thường), dựa trên giá trị `display` của mỗi thẻ. Hai loại nền tảng:

### 4.1 `display: block`

- Chiếm **nguyên một hàng ngang**, đẩy phần tử kế xuống dòng mới.
- Mặc định rộng hết chiều ngang cha (full width), dù nội dung ngắn.
- **Nhận** `width` và `height`.
- Ví dụ thẻ block: `<div>`, `<p>`, `<h1>`–`<h6>`, `<section>`, `<header>`, `<main>`, `<li>`...

```
[====== block 1 chiếm cả hàng ======]
[====== block 2 chiếm cả hàng ======]
[====== block 3 chiếm cả hàng ======]
```

### 4.2 `display: inline`

- Nằm **trong dòng chữ**, các phần tử inline xếp cạnh nhau ngang cho tới khi hết chỗ thì xuống dòng (như chữ).
- Chỉ chiếm đúng bề rộng nội dung.
- **BỎ QUA `width`/`height`** — bạn set cũng không ăn.
- Margin/padding **dọc** (trên/dưới) hành xử kỳ lạ (không đẩy được dòng). Margin/padding ngang thì bình thường.
- Ví dụ thẻ inline: `<a>`, `<span>`, `<strong>`, `<em>`.

```
chữ chữ [inline] chữ [inline] chữ chữ chữ [inline]
xuống dòng tự nhiên khi hết chỗ...
```

> ⚠️ **Bẫy kinh điển:** bạn set `width: 200px` cho một thẻ `<a>` (inline) mà nó *không đổi gì cả*, ngồi gãi đầu. Vì inline bỏ qua width/height. Cảm giác "CSS không ăn" của người mới rất hay đến từ đây.

### 4.3 `display: inline-block` — kẻ lai

- Xếp cạnh nhau **như inline**...
- ...nhưng **nhận `width`/`height`/margin/padding đầy đủ như block**.
- Hữu ích khi muốn nhiều ô nằm ngang mà vẫn chỉnh được kích thước.

### 4.4 `display: none`

- Phần tử **biến mất hoàn toàn**, không chiếm chỗ (khác `visibility: hidden` — cái này ẩn nhưng vẫn chừa chỗ trống).

### 4.5 Bảng tổng kết — IN RA DÁN LÊN BÀN

| | block | inline | inline-block |
|---|---|---|---|
| Xuống dòng riêng? | Có | Không (nằm ngang) | Không (nằm ngang) |
| Nhận width/height? | Có | **KHÔNG** | Có |
| Margin/padding dọc? | Có | Lỗi/không đẩy | Có |
| Ví dụ | div, p, h1 | a, span | (thường tự set) |

> 🧠 **Liên hệ tư duy:** Đừng học vẹt thẻ nào block thẻ nào inline. Hiểu theo **vai trò**: thứ chia khối lớn (đoạn văn, vùng) thì block; thứ nằm chen trong câu chữ (link, từ in đậm) thì inline. Logic, không cần thuộc lòng.

🛠️ **Thử ngay (bắt buộc làm, đây là cốt lõi):**
1. Tạo 3 thẻ `<div>`, mỗi cái một màu nền (`background`), xem chúng xếp dọc (block).
2. Đổi cả 3 thành `display: inline` → xem width "biến mất" và chúng dồn lại.
3. Đổi thành `display: inline-block` + cho `width: 100px; height: 100px` → xem 3 ô vuông nằm ngang.
4. Cho 1 ô `display: none` → xem nó biến mất và 2 ô kia khít lại.

Làm 4 bước này, bạn sẽ *thấy tận mắt* normal flow vận hành — giá trị hơn đọc 10 lần.

---

## Phần 5 — Vài thứ vặt nhưng dùng mỗi ngày

### Màu sắc
```css
color: red;                    /* tên màu */
color: #ff0000;                /* hex */
color: rgb(255, 0, 0);         /* rgb */
color: rgba(255, 0, 0, 0.5);   /* rgb + độ trong suốt (alpha 0–1) */
```

### Đơn vị (file `05` đào sâu, giờ biết cơ bản)
- `px` — pixel, tuyệt đối, cố định.
- `%` — phần trăm so với phần tử cha.
- `rem` — gấp mấy lần cỡ chữ gốc của trang (mặc định 1rem = 16px). **Dùng rem cho font và spacing** để trang co giãn tốt; lý do kỹ ở file `05`.

### `color` vs `background`
```css
.box {
  color: white;            /* màu CHỮ */
  background-color: navy;  /* màu NỀN */
}
```

---

## ✅ Checkpoint — tự trả lời

1. Tại sao một luật CSS bạn viết lại "không ăn"? Kể 2 nguyên nhân (gợi ý: specificity, và...).
2. Dòng `box-sizing: border-box` làm thay đổi cách tính `width` thế nào?
3. Vì sao set `width` cho thẻ `<a>` thường không có tác dụng?
4. `display: none` khác `visibility: hidden` ở điểm gì?
5. `padding` và `margin` — cái nào đẩy nội dung vào, cái nào đẩy hàng xóm ra?
6. `.nav a` và `.nav > a` khác nhau ra sao?

---

## 🏋️ Bài tập — làm trước khi mình giao Flexbox

Lấy lại file `bai-tap-01.html` (trang blog ở file trước), giờ **thêm CSS** (viết trong `<style>`):

1. Dán đoạn `box-sizing: border-box` cho `*` ở đầu.
2. Cho `<body>` một màu nền nhạt và `font-family: sans-serif`.
3. Cho mỗi `<article>`:
   - nền trắng, `padding: 20px`, một `border` mỏng, `margin-bottom: 20px`.
   - Quan sát box model bạn vừa tạo.
4. Cho các link trong `<nav>` `display: inline-block` và `padding: 10px`, xem chúng dàn ngang và bấm được vùng rộng hơn.
5. Đổi màu chữ heading.
6. **Thử nghiệm có chủ đích:** tạm bỏ dòng `box-sizing`, đặt `width: 300px` cho article, rồi thêm/bớt padding — quan sát hộp phình ra sao. Sau đó bật lại border-box. Cảm nhận sự khác biệt bằng mắt.

> Lưu ý: ta **chưa** xếp được các thứ nằm cạnh nhau cho ra layout đẹp đâu — vì đó cần Flexbox (file `03`). File này mục tiêu là bạn *điều khiển được từng cái hộp* và *hiểu trình duyệt xếp chúng thế nào*. Xếp chúng theo ý mình là chương sau.

Làm xong, gửi mình code CSS của bạn. Mình review, và nếu checkpoint ổn thì mình viết tiếp **`03-flexbox.md`** — đây là lúc CSS bắt đầu "đã tay". 👇
