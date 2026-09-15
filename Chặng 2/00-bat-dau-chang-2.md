# 00 — Bắt đầu Chặng 2: JavaScript

> File này chưa dạy cú pháp. Nó dựng môi trường và giải thích bạn sắp đi đâu. Đọc hết rồi làm bài tập cuối file, xong mới sang `01`.

---

## 1. Bạn đang ở đâu trong bức tranh

Chặng 1 bạn đã làm chủ hai thứ:

- **HTML** — cấu trúc và ý nghĩa của nội dung
- **CSS** — hình thức, bố cục, cách nó co giãn theo màn hình

Kết quả là bạn dựng được trang đẹp, responsive. Nhưng nó **tĩnh**. Người dùng bấm nút, không có gì xảy ra. Dữ liệu là do bạn gõ tay vào HTML.

JavaScript là mảnh còn thiếu: nó cho trang web **phản ứng** và **thay đổi**.

Một cách hình dung quen thuộc:

| | Vai trò | Ví dụ |
|---|---|---|
| HTML | Bộ xương | Trang có một cái nút |
| CSS | Da thịt, quần áo | Nút màu xanh, bo tròn, hover đổi màu |
| JavaScript | Cơ và thần kinh | Bấm nút thì thêm sản phẩm vào giỏ hàng |

Điều quan trọng cần hiểu ngay: **CSS không phải ngôn ngữ lập trình, JavaScript thì có.** Ở chặng 1 bạn mô tả *cái gì trông như thế nào*. Từ chặng 2 bạn ra lệnh *máy tính phải làm gì, theo thứ tự nào, trong điều kiện nào*. Đây là một kiểu tư duy khác, và nó cần thời gian để quen. Đừng sốt ruột nếu vài file đầu thấy nặng hơn CSS.

---

## 2. Vì sao chặng này quan trọng hơn cả React

Bạn học để đi phỏng vấn. Nên mình nói thẳng một điều mà nhiều lộ trình trên mạng né tránh:

**Người phỏng vấn Junior Front-End hỏi JavaScript nhiều hơn hỏi React.**

Lý do đơn giản. React thì học 3 tuần là dùng được. Nhưng một người không hiểu closure, không hiểu event loop, không phân biệt được tham trị với tham chiếu — người đó sẽ viết ra bug mà chính họ không sửa nổi, và người phỏng vấn biết điều đó.

Những câu bạn gần như chắc chắn gặp:

- "Closure là gì? Bạn đã dùng nó ở đâu?"
- "Giải thích event loop."
- `==` và `===` khác nhau chỗ nào?
- "Đoán output của đoạn code này." *(rồi đưa một đoạn trộn `setTimeout` với `Promise`)*
- "`this` trong hàm này trỏ vào đâu?"

Cả 5 câu đều nằm trong chặng 2. Không câu nào nằm ở React.

Đây là chặng dài nhất — 14 file, khoảng 6 tuần. Làm chắc chặng này thì chặng 4 và 5 sẽ nhẹ đi rất nhiều, vì React chỉ là JavaScript được tổ chức lại.

---

## 3. Bản đồ chặng 2

Mình chia 14 file thành 4 khối. Bạn nên biết trước để không bị mất phương hướng giữa chừng.

**Khối A — Nền tảng ngôn ngữ** (file `01` → `04`)
Biến, kiểu dữ liệu, hàm, scope, mảng, object. Bạn đã học sơ phần này trước đây nên sẽ đi nhanh, nhưng mình vẫn viết đầy đủ vì phần `01` (tham trị vs tham chiếu) và `02` (hoisting) là gốc rễ của rất nhiều bug về sau.

**Khối B — Những thứ khiến JavaScript là JavaScript** (file `05` → `07`)
Closure, `this`, prototype. Đây là ba khái niệm đặc trưng nhất, khó nhất, và bị hỏi nhiều nhất. Nếu có một khối cần đọc chậm gấp đôi thì là khối này.

**Khối C — Điều khiển trang web** (file `08` → `09`)
DOM và sự kiện. Từ đây bạn bắt đầu thấy code của mình *làm được gì đó* trên màn hình. Vui hơn hẳn.

**Khối D — Bất đồng bộ và thế giới bên ngoài** (file `10` → `13`)
Event loop, Promise, gọi API, lưu trữ. Đây là phần khiến trang web trở thành ứng dụng thật.

Sau `13`, bạn sẽ có 4 sản phẩm chạy được: máy tính, todo app, app gọi API, quiz app có đếm giờ.

---

## 4. Chuẩn bị môi trường

Chặng 2 vẫn chạy trực tiếp trên trình duyệt, chưa cần build tool (cái đó để chặng 3). Nhưng có vài thứ cần chuẩn.

### 4.1. VS Code

Bạn đã dùng rồi. Cài thêm hai extension nếu chưa có:

- **Live Server** (Ritwick Dey) — chạy trang web trên máy chủ cục bộ, tự reload khi lưu file
- **ESLint** — chưa cấu hình vội, nhưng cài sẵn để dùng từ file `12`

### 4.2. Node.js

Chặng 2 chưa thực sự cần Node để chạy code, nhưng chặng 3 thì cần, và cài sớm thì đỡ vướng sau. Tải bản **LTS** ở nodejs.org.

Kiểm tra bằng cách mở terminal, gõ:

```bash
node -v
npm -v
```

Ra được hai số phiên bản là xong.

### 4.3. Trình duyệt và DevTools

Dùng Chrome hoặc Edge. Từ chặng này trở đi, **DevTools là nơi bạn sống**. Mở bằng `F12` hoặc `Ctrl + Shift + I`.

Ba tab bạn cần biết ngay:

- **Console** — nơi code của bạn nói chuyện với bạn, và là nơi báo lỗi
- **Sources** — xem file JS, đặt breakpoint để dừng code lại và soi từng dòng
- **Elements** — bạn đã quen từ chặng 1

---

## 5. Ba cách chạy JavaScript

Cần phân biệt rõ, vì mỗi file bài tập mình sẽ nói rõ dùng cách nào.

### Cách 1 — Gõ thẳng vào Console

Nhanh nhất để thử một dòng. Mở DevTools, sang tab Console, gõ:

```javascript
1 + 1
```

Enter, ra `2`. Dùng cách này khi bạn muốn kiểm tra nhanh một biểu thức, **không dùng để làm bài tập**.

### Cách 2 — Thẻ `<script>` viết thẳng trong HTML

```html
<body>
  <h1>Xin chào</h1>

  <script>
    console.log("Chạy từ trong HTML");
  </script>
</body>
```

Chỉ nên dùng cho ví dụ cực ngắn. Trộn HTML với JS trong một file là thói quen xấu — giống như viết CSS bằng thuộc tính `style` vậy.

### Cách 3 — File `.js` riêng *(đây là cách bạn sẽ dùng)*

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Bài tập</title>
</head>
<body>
  <h1>Xin chào</h1>

  <script src="main.js"></script>
</body>
</html>
```

```javascript
// main.js
console.log("Chạy từ file riêng");
```

### Vì sao thẻ `<script>` đặt cuối `<body>`?

Vì trình duyệt đọc HTML từ trên xuống. Gặp thẻ `<script>` thì nó **dừng đọc HTML lại**, tải file JS, chạy xong mới đọc tiếp.

Nếu bạn đặt `<script>` ở `<head>`, code JS chạy khi `<body>` chưa tồn tại — và mọi thao tác tìm phần tử trên trang sẽ thất bại. Đây là lỗi kinh điển của người mới.

Có một cách tốt hơn, dùng thuộc tính `defer`:

```html
<head>
  <script src="main.js" defer></script>
</head>
```

`defer` nghĩa là: *tải file JS song song với việc đọc HTML, nhưng đợi HTML đọc xong hết mới chạy JS*. Vừa nhanh hơn, vừa an toàn.

**Từ giờ hãy dùng `defer` và đặt script trong `<head>`.** Bài tập cuối file sẽ cho bạn tự nhìn thấy sự khác biệt.

---

## 6. `console` — công cụ bạn dùng nhiều nhất

Trong suốt chặng 2, cách bạn kiểm tra code có đúng không chủ yếu là in nó ra.

```javascript
console.log("Thông tin thường");
console.warn("Cảnh báo, chữ vàng");
console.error("Lỗi, chữ đỏ");

// In nhiều giá trị cùng lúc
const ten = "An";
const tuoi = 22;
console.log(ten, tuoi);

// Mẹo hay: bọc trong object để biết tên biến
console.log({ ten, tuoi });   // { ten: "An", tuoi: 22 }

// In mảng object dưới dạng bảng, rất dễ nhìn
console.table([
  { ten: "An", tuoi: 22 },
  { ten: "Bình", tuoi: 25 }
]);
```

`console.log({ ten, tuoi })` là mẹo nhỏ nhưng dùng cả đời. Khi log 5–6 biến một lúc, bạn sẽ không còn phải đoán số nào là của biến nào.

---

## 7. Cấu trúc thư mục chặng 2

Tạo đúng như sau, cạnh thư mục `Chặng 1`:

```
LearningFE/
├── Chặng 1/
└── Chặng 2/
    ├── 00-bat-dau-chang-2.md      ← file này
    ├── 01-bien-va-kieu-du-lieu.md
    ├── ...
    ├── bai-tap-00/
    │   ├── index.html
    │   └── main.js
    ├── bai-tap-01/
    └── ...
```

Khác chặng 1 một chút: từ giờ mỗi bài tập là **một thư mục**, vì cần ít nhất 2 file (HTML + JS). Sau này thêm CSS nữa.

---

## 8. Cách học chặng này

**Tỷ lệ 30/70.** Đọc file mình viết là 30% công sức. Gõ code là 70%. Đọc xong thấy "hiểu rồi" là cảm giác đánh lừa — hiểu khi đọc và tự viết được là hai chuyện hoàn toàn khác.

**Gõ lại ví dụ, đừng copy.** Nghe cũ nhưng có lý do thật: khi gõ tay bạn sẽ gõ sai, và sửa lỗi gõ sai là cách nhanh nhất để nhớ cú pháp.

**Đoán trước rồi mới chạy.** Với mọi đoạn code trong file, hãy tự đoán output trước khi bấm chạy. Đoán sai là tín hiệu quý — nó chỉ đúng chỗ mô hình trong đầu bạn đang lệch.

**Đừng bỏ bài tập rồi tính quay lại sau.** Không ai quay lại cả. Mình thiết kế bài tập của file `N` làm nền cho file `N+1`.

**Gửi bài cho mình review.** Code chạy được không có nghĩa là code đúng. Rất nhiều bài chạy ra kết quả đúng bằng một cách viết sẽ gây bug ở dự án lớn hơn — đó là thứ chỉ có người review mới chỉ ra được.

---

## 9. Lỗi thường gặp ngay từ hôm nay

| Hiện tượng | Nguyên nhân |
|---|---|
| Console báo `404` cho file JS | Sai đường dẫn `src`, hoặc sai tên file (JS phân biệt hoa/thường) |
| Code không chạy, Console trống trơn | Quên hẳn thẻ `<script>`, hoặc gõ `<script href=...>` thay vì `src` |
| `Uncaught SyntaxError` | Thiếu dấu ngoặc, dấu nháy chưa đóng |
| Sửa code, lưu, nhưng trang không đổi | Chưa reload, hoặc trình duyệt cache — thử `Ctrl + Shift + R` |
| Mở file bằng cách nháy đôi, thanh địa chỉ là `file:///...` | Nên dùng Live Server. Một số tính năng (fetch, module) không chạy với `file://` |

Và một lời khuyên chung: **luôn mở Console khi làm bài.** Trang trắng không có nghĩa là không có gì xảy ra — thường là có lỗi đỏ đang nằm im trong Console chờ bạn đọc.

---

## Bài tập

Làm trong thư mục `bai-tap-00/`.

### Bài 1 — Dựng khung

Tạo `bai-tap-00/index.html` và `bai-tap-00/main.js`. Nhúng JS bằng cách 3, dùng `defer`, đặt script trong `<head>`. Trong `main.js` in ra `"Chặng 2 bắt đầu"`.

Mở bằng Live Server, xác nhận Console hiện đúng dòng đó.

### Bài 2 — Tự chứng minh vì sao cần `defer`

Trong `index.html`, thêm một thẻ `<h1 id="tieu-de">Xin chào</h1>` trong `<body>`.

Trong `main.js`, viết đúng một dòng:

```javascript
console.log(document.getElementById("tieu-de"));
```

*(Bạn chưa học DOM, không sao. Dòng này chỉ có nghĩa là "tìm phần tử có id là `tieu-de` trên trang".)*

Bây giờ chạy ba lần, mỗi lần đổi cách nhúng:

1. `<script src="main.js"></script>` đặt trong `<head>` — **không** có `defer`
2. `<script src="main.js" defer></script>` đặt trong `<head>`
3. `<script src="main.js"></script>` đặt cuối `<body>`

Ghi lại kết quả Console của cả ba trường hợp vào một file `ghi-chu.md`, và **tự giải thích bằng lời của bạn** vì sao trường hợp 1 khác hai trường hợp còn lại.

Đây là bài quan trọng nhất trong file này. Đừng bỏ.

### Bài 3 — Làm quen `console`

Trong `main.js`, tạo ba biến `ten`, `tuoi`, `ngheNghiep` với thông tin của bạn. Sau đó:

- In cả ba bằng `console.log` thường
- In lại bằng mẹo `console.log({ ... })`
- Tạo một mảng gồm 3 object (bạn và 2 người bạn tưởng tượng), in bằng `console.table`
- Thử `console.warn` và `console.error` một lần cho biết mặt

### Bài 4 — Gây lỗi có chủ đích

Cố ý làm hỏng code theo 3 cách, mỗi lần đọc kỹ thông báo lỗi trong Console rồi sửa lại:

1. Xóa một dấu ngoặc đóng
2. Đổi `src="main.js"` thành `src="Main.js"`
3. Gọi một hàm không tồn tại, ví dụ `chaoMung()`

Ghi vào `ghi-chu.md`: mỗi lỗi hiện ra thông báo gì, và thông báo đó gợi ý điều gì.

Nghe hơi lạ khi bài tập đầu tiên lại bảo bạn phá code. Nhưng đọc được thông báo lỗi là kỹ năng bạn dùng nhiều hơn bất kỳ kỹ năng nào khác trong nghề này. Bắt đầu luyện từ hôm nay.

---

## Xong file này khi

- [ ] Node.js đã cài, `node -v` chạy được
- [ ] Live Server hoạt động
- [ ] Thư mục `Chặng 2/` đã dựng đúng cấu trúc
- [ ] Bài 1–4 làm xong, có file `ghi-chu.md`
- [ ] Giải thích được `defer` làm gì mà không cần đọc lại file

Xong hết thì nhắn mình: **"viết file 01-bien-va-kieu-du-lieu"** — kèm code bài tập 00 để mình review luôn.