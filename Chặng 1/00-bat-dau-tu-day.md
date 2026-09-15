# Chặng 1 — CSS & HTML Semantic — BẮT ĐẦU TỪ ĐÂY

> File này là "bản đồ" của cả Chặng 1. Đọc nó trước, rồi mới mở các file số tiếp theo.

---

## 1. Chặng này dành cho ai (chính là bạn)

Bạn là **backend dev (Java + Spring Boot)**, JavaScript đã vững (đã thông closure, event loop, box model cơ bản). Lỗ hổng thật sự nằm ở **CSS và HTML semantic** — đây là vùng mình xây mới hoàn toàn.

Mình nói thẳng một câu để bạn chuẩn bị tâm lý, vì nó quan trọng:

> **CSS sẽ làm bạn khó chịu theo kiểu KHÁC với backend.**
> Code Java sai → compiler la bạn ngay lập tức, chỉ rõ dòng nào.
> CSS "sai" → không ai báo gì cả. Cái `div` chỉ nằm lệch chỗ, và bạn ngồi nhìn không hiểu vì sao.

Cảm giác "mất kiểm soát" đó là **bình thường**, ai từ backend qua cũng dính. Nó không phải vì bạn dốt — mà vì CSS không vận hành bằng logic đúng/sai, nó vận hành bằng **quy ước + tầng lớp (layout flow)**. Khi bạn hiểu được "trình duyệt đang nghĩ gì khi nó xếp các thẻ", cảm giác ảo ma sẽ biến mất. Đó là mục tiêu của chặng này.

---

## 2. Thứ tự học (ĐỪNG nhảy cóc)

Học đúng thứ tự này, vì cái sau dựa trên cái trước:

| File | Nội dung | Vì sao học lúc này |
|------|----------|--------------------|
| `00-bat-dau-tu-day.md` | (file này) Bản đồ + cách học + setup | Định hướng |
| `01-html-semantic.md` | Cấu trúc trang bằng thẻ có ngữ nghĩa | Phải có "khung xương" trước khi tô màu |
| `02-css-nen-tang-va-box-model.md` | Selector, specificity, box model, normal flow, display | Đây là phần "trình duyệt nghĩ gì" — nền của mọi thứ |
| *(sắp có)* `03-flexbox.md` | Sắp xếp theo 1 chiều | Công cụ layout dùng 80% thời gian |
| *(sắp có)* `04-grid.md` | Sắp xếp theo 2 chiều | Bố cục cả trang |
| *(sắp có)* `05-responsive.md` | Co giãn theo màn hình | Bắt buộc cho web thật |

> Mình giao 3 file đầu trước. Khi bạn xong file `02`, nhắn mình một tiếng, mình viết tiếp Flexbox/Grid/Responsive. Lý do chia vậy: 02 là khúc xương khó nhất, cần bạn nắm chắc rồi mới đi tiếp cho đỡ loãng.

---

## 3. Cách học mỗi file (quan trọng — đọc kỹ)

Bạn chọn kiểu "trộn đều lý thuyết + thực hành", nên quy trình mỗi file là:

1. **Đọc một mục** trong file `.md` (mở bằng IDE, bật preview Markdown cho dễ nhìn — VS Code: `Ctrl/Cmd + Shift + V`).
2. **Mở file HTML thật bên cạnh và GÕ LẠI code mẫu bằng tay.** Không copy-paste. Tay gõ thì não mới nhớ. Đây là điều khoản số 1.
3. **Đổi số, đổi giá trị, xem nó vỡ ra sao.** Ví dụ thấy `padding: 20px` thì thử đổi `200px` xem chuyện gì xảy ra. Học CSS = phá rồi quan sát.
4. Gặp chỗ nào "ơ sao lạ vậy" → **hỏi mình ngay trên IDE.** Đừng để dồn.
5. Cuối mỗi file có mục **✅ Checkpoint** + **🏋️ Bài tập**. Làm xong bài tập mới qua file kế.

Mỗi file mình sẽ chèn các khối:
- 🧠 **Liên hệ Java** — nối khái niệm mới về thứ bạn đã biết.
- ⚠️ **Bẫy** — chỗ dân backend hay sụp.
- 🏋️ **Bài tập** — làm tay.
- ✅ **Checkpoint** — tự kiểm tra trước khi đi tiếp.

---

## 4. Setup môi trường (làm 1 lần, 5 phút)

Bạn đã có IDE rồi nên nhẹ nhàng:

1. **VS Code** (nếu chưa có thì cài). Bạn quen IntelliJ, nhưng FE thì VS Code tiện hơn nhiều.
2. Cài 2 extension:
   - **Live Server** (tác giả Ritwick Dey) — bấm chuột phải file HTML → "Open with Live Server" → trang tự reload mỗi khi bạn lưu. Không cần F5 thủ công.
   - **Prettier** — tự format code cho đẹp khi lưu.
3. Tạo một thư mục `chang-1-thuc-hanh/` để chứa file thực hành của bạn (tách khỏi thư mục chứa mấy file `.md` này).

> 🧠 **Liên hệ Java:** Live Server giống như Spring Boot DevTools auto-reload vậy — sửa code, lưu, thấy kết quả ngay, không cần restart.

Tạo sẵn 1 file `index.html` với bộ khung tối thiểu sau (gõ tay, đây cũng là bài khởi động):

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thực hành Chặng 1</title>
  <style>
    /* CSS viết ở đây cho nhanh trong lúc học.
       Sau này mình sẽ tách ra file .css riêng. */
  </style>
</head>
<body>
  <h1>Xin chào CSS</h1>
</body>
</html>
```

Giải thích nhanh mấy dòng trong `<head>` (bạn sẽ gặp hoài):
- `<!DOCTYPE html>` — báo cho trình duyệt "đây là HTML5", bật chế độ chuẩn. Thiếu nó trình duyệt chạy chế độ "quirks" cũ kỹ, layout sẽ loạn.
- `<meta charset="UTF-8">` — để hiển thị được tiếng Việt có dấu. Thiếu là ra "Tiáº¿ng Viá»t".
- `<meta name="viewport" ...>` — **cực kỳ quan trọng cho responsive sau này.** Bảo điện thoại đừng tự thu nhỏ trang. Giờ cứ để đó, file `05` sẽ giải thích kỹ.

---

## 5. Tâm thế

Đừng cố "nhớ thuộc lòng" mọi thuộc tính CSS — vô số, không ai nhớ hết, dân pro cũng tra suốt. Cái cần nhớ là **các mô hình tư duy**: trình duyệt xếp thẻ thế nào, box model ra sao, Flexbox/Grid giải quyết vấn đề gì. Nhớ mô hình thì thuộc tính chỉ là tra cú pháp.

Xong file này thì mở `01-html-semantic.md`. Đi thôi.
