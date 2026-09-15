# 01 — HTML Semantic — Khung xương của trang

> Đây là phần bị bỏ trống lúc chẩn đoán ("HTML mình không nhớ kỹ"). Học nhẹ nhàng, nhưng đừng coi thường: HTML tốt là nền cho CSS dễ và cho SEO/accessibility.

---

## 1. Đổi tư duy: HTML không phải để "trang trí", mà để "mô tả ý nghĩa"

Câu hỏi cốt lõi của HTML không phải *"cái này trông thế nào"* mà là ***"cái này LÀ cái gì"***.

- Một đoạn chữ to đậm trên cùng → nó **là tiêu đề** → `<h1>`, không phải `<div>` rồi chỉnh to.
- Thanh menu trên cùng → nó **là điều hướng** → `<nav>`.
- Khối nội dung chính → `<main>`.

Trình duyệt, Google, và phần mềm đọc màn hình cho người khiếm thị đều dựa vào *ý nghĩa* này. Một trang toàn `<div>` thì với máy nó như một tờ giấy trắng không có cấu trúc.

> 🧠 **Liên hệ Java:** Giống việc bạn đặt tên class/method cho đúng ngữ nghĩa (`UserService` chứ không phải `Thing1`). Code chạy vẫn chạy nếu đặt bậy, nhưng người khác (và máy) đọc không hiểu. HTML semantic = đặt tên đúng cho từng vùng nội dung.

---

## 2. `<div>` và `<span>` — hai thẻ "vô nghĩa"

- `<div>` — một cái hộp **khối** (block), không mang ý nghĩa gì. Dùng khi bạn chỉ cần gom nhóm để CSS, mà không có thẻ semantic nào hợp hơn.
- `<span>` — một cái hộp **trong dòng** (inline), cũng vô nghĩa, dùng để bọc một mẩu chữ giữa câu.

Chúng không xấu — chúng là công cụ "chữa cháy" khi không có thẻ ý nghĩa phù hợp. Nguyên tắc: **ưu tiên thẻ semantic, hết cách mới dùng `div`.**

(Phân biệt block vs inline mình dạy kỹ ở file `02`. Giờ chỉ cần biết: block chiếm nguyên một hàng ngang, inline nằm gọn trong dòng chữ.)

---

## 3. Bộ thẻ semantic xương sống của một trang

Hình dung một trang web điển hình được chia vùng:

```
┌─────────────────────────────────────┐
│  <header>  (logo + thanh menu)       │
│    └ <nav> (các link điều hướng)     │
├─────────────────────────────────────┤
│                                       │
│  <main>  (nội dung CHÍNH, duy nhất)  │
│    ├ <section> (một mục nội dung)    │
│    │    └ <article> (1 bài viết)     │
│    └ <section> ...                   │
│                                       │
│            <aside> (sidebar phụ)     │
├─────────────────────────────────────┤
│  <footer>  (bản quyền, link cuối)    │
└─────────────────────────────────────┘
```

Bảng tra nhanh ý nghĩa:

| Thẻ | Nó LÀ gì | Lưu ý |
|-----|----------|-------|
| `<header>` | Phần đầu của trang **hoặc** của một section | Có thể có nhiều header (mỗi article 1 cái) |
| `<nav>` | Khối các link điều hướng chính | Chỉ dùng cho menu *chính*, không phải mọi cụm link |
| `<main>` | Nội dung chính, độc nhất của trang | **Chỉ 1 thẻ `<main>` mỗi trang** |
| `<section>` | Một "mục" nội dung có chủ đề riêng | Thường nên có tiêu đề bên trong |
| `<article>` | Một đơn vị nội dung **đứng độc lập được** | Bài blog, sản phẩm, comment — tách ra vẫn có nghĩa |
| `<aside>` | Nội dung phụ, lề | Sidebar, box "bài liên quan" |
| `<footer>` | Phần chân trang/section | Bản quyền, liên hệ |
| `<figure>` / `<figcaption>` | Hình + chú thích của hình | Đi cặp |

### `<section>` khác `<div>` ở chỗ nào? (câu này lúc trước bạn bỏ trống)

- `<div>` = "gom nhóm, không nói gì thêm".
- `<section>` = "đây là **một mục nội dung có chủ đề riêng**", thường kèm một heading mô tả chủ đề đó.

Phép thử nhanh: nếu bạn diễn đạt được mục này bằng một dòng tiêu đề ("Phần đánh giá", "Sản phẩm nổi bật") → dùng `<section>`. Nếu chỉ là cái hộp để canh layout, không có chủ đề → dùng `<div>`.

### `<section>` khác `<article>` thế nào?

Phép thử: **lấy nó ra khỏi trang, đặt một mình, nó còn có nghĩa không?**
- Một bài blog → mang đi đâu cũng đọc được → `<article>`.
- "Mục bình luận của bài blog" → tách ra khỏi bài thì vô nghĩa → `<section>`.
- Mà mỗi *cái comment* lại độc lập → mỗi comment là một `<article>` nằm trong section đó. (Đúng, lồng nhau được.)

---

## 4. Heading `<h1>`–`<h6>` — phải đi theo thứ bậc

Heading không phải để làm chữ to. Nó tạo **dàn ý (outline)** của trang. Quy tắc:

- Mỗi trang nên có **một `<h1>`** — tiêu đề lớn nhất, nói trang này về cái gì.
- Xuống cấp tuần tự: `h1` → `h2` → `h3`... **không nhảy cóc** từ `h1` sang `h4` chỉ vì h4 trông nhỏ hơn cho đẹp.
- Muốn chữ nhỏ hơn? Đó là việc của CSS, không phải đổi cấp heading.

> ⚠️ **Bẫy:** Rất nhiều người chọn `<h3>` thay vì `<h2>` "vì h2 to quá". Sai. Chọn cấp heading theo **vai trò trong dàn ý**, rồi dùng CSS chỉnh kích thước. Trình đọc màn hình điều hướng trang bằng cây heading này — nhảy cóc làm họ lạc.

---

## 5. Mấy thẻ nội dung hay dùng

```html
<p>Đoạn văn.</p>

<a href="https://example.com">Một liên kết</a>
<a href="/lien-he">Link nội bộ (đường dẫn tương đối)</a>

<ul>                          <!-- danh sách KHÔNG thứ tự (bullet) -->
  <li>Mục 1</li>
  <li>Mục 2</li>
</ul>

<ol>                          <!-- danh sách CÓ thứ tự (1,2,3) -->
  <li>Bước 1</li>
  <li>Bước 2</li>
</ol>

<img src="anh.jpg" alt="Mô tả ảnh cho người không thấy được ảnh">

<button>Bấm tôi</button>

<strong>Quan trọng</strong>   <!-- in đậm CÓ ý nghĩa "quan trọng" -->
<em>Nhấn mạnh</em>            <!-- in nghiêng CÓ ý nghĩa "nhấn giọng" -->
```

> ⚠️ **Bẫy thuộc tính `alt` của ảnh:** `alt` không phải tùy chọn. Nó là chữ hiển thị khi ảnh lỗi, là thứ Google đọc, là thứ người khiếm thị nghe. Ảnh trang trí thuần túy thì để `alt=""` (rỗng), còn ảnh có nội dung thì luôn mô tả.

> ⚠️ **Bẫy nút bấm:** Cần một nút bấm? Dùng `<button>`, **đừng** dùng `<div onclick>`. `<button>` tự có: bấm được bằng phím Enter/Space, focus bằng Tab, trình đọc màn hình hiểu là nút. `<div>` thì không có gì cả, bạn phải tự code lại hết.

---

## 6. Form — backend của bạn sẽ thích phần này

Vì bạn làm Spring Boot, form là chỗ FE gặp BE. Mẫu cơ bản:

```html
<form>
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required>

  <label for="pass">Mật khẩu</label>
  <input type="password" id="pass" name="password" required>

  <button type="submit">Đăng nhập</button>
</form>
```

Vài điểm phải nhớ:
- `<label for="...">` phải khớp với `id` của input. Bấm vào label thì con trỏ nhảy vào ô input → trải nghiệm tốt + tốt cho accessibility.
- `name` là **cái tên field gửi lên server** (chính là cái Spring `@RequestParam` / DTO của bạn nhận). `id` là để CSS/JS/label tham chiếu trong trang. Hai cái này khác vai trò.
- `type` của input nhiều loại: `text`, `email`, `password`, `number`, `date`, `checkbox`, `radio`, `file`... Chọn đúng type thì điện thoại còn hiện đúng bàn phím (email hiện phím `@`).

> 🧠 **Liên hệ Java:** `name` của input ↔ tên thuộc tính trong DTO/`@RequestParam` của bạn. Đây đúng là điểm khớp giữa form HTML và controller Spring.

---

## 7. Quy tắc lồng thẻ (đừng phạm)

- Inline **không** bọc block. `<span><div>...</div></span>` là sai.
- `<a>` có thể bọc cả một khối lớn (HTML5 cho phép), nhưng đừng lồng `<a>` trong `<a>`.
- `<p>` không được chứa block như `<div>`. Trình duyệt sẽ tự "đá" cái div ra ngoài và bạn ngồi ngơ ngác vì layout sai.
- `<ul>`/`<ol>` chỉ được chứa `<li>` trực tiếp.

> ⚠️ **Bẫy hay gặp:** lồng sai thường KHÔNG báo lỗi — trình duyệt tự "sửa" theo cách của nó, và kết quả không như bạn nghĩ. Khi layout loạn một cách khó hiểu, hãy nghi ngờ chuyện lồng thẻ sai trước tiên.

---

## ✅ Checkpoint — tự trả lời trước khi đi tiếp

1. `<section>` khác `<div>` chỗ nào? Cho một ví dụ khi nào dùng cái nào.
2. Một trang được có bao nhiêu thẻ `<main>`? Bao nhiêu `<h1>`?
3. Vì sao không nên dùng `<div onclick>` làm nút bấm?
4. `id` và `name` của một `<input>` khác vai trò ra sao?
5. Phép thử để quyết định `<section>` hay `<article>` là gì?

Trả lời được trôi chảy 5 câu này (tự nói trong đầu cũng được) thì bạn nắm rồi.

---

## 🏋️ Bài tập — làm trước khi qua file `02`

Tạo file `bai-tap-01.html` trong thư mục thực hành. Dựng **khung một trang blog** chỉ bằng HTML semantic, **chưa đụng CSS**. Yêu cầu:

- Có `<header>` chứa tên blog và một `<nav>` với 3 link (Trang chủ, Bài viết, Liên hệ).
- Có `<main>` chứa **2 bài viết**, mỗi bài là một `<article>` gồm: tiêu đề (`<h2>`), đoạn mô tả (`<p>`), và một link "Đọc tiếp".
- Có một `<aside>` chứa danh sách "Bài viết gần đây" (dùng `<ul>`).
- Có `<footer>` ghi dòng bản quyền.
- Đảm bảo heading đi đúng cấp (1 cái `<h1>` cho tên blog, các bài dùng `<h2>`).

Mở bằng Live Server xem. Nó sẽ **xấu** (chữ đen, nền trắng, dồn cục) — **đúng rồi đấy**, vì chưa có CSS. Mục tiêu file này là *khung xương đúng*. Tô màu là việc của file `02` trở đi.

Làm xong, gửi mình đoạn HTML đó, mình soi cấu trúc trước khi ta bước vào CSS. 👇
