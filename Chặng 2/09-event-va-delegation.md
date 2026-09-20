# 09 — Sự kiện và Event Delegation

> **Cần có trước:** xong `08` (DOM), và nhớ `06` (`this`), `05` (closure).
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** sự kiện là cách trang web phản ứng với người dùng. Event delegation là kỹ thuật bị hỏi trong hầu hết buổi phỏng vấn Front-End, và là thứ khiến code của bạn chạy đúng với nội dung được tạo động — thứ mà cách gắn listener ngây thơ không làm được.

---

## 1. Gắn sự kiện

### 1.1. `addEventListener`

```javascript
const nut = document.querySelector("#nut");

nut.addEventListener("click", function (e) {
  console.log("Đã bấm");
});
```

### 1.2. Vì sao không dùng `onclick`

```javascript
nut.onclick = () => console.log("một");
nut.onclick = () => console.log("hai");
// Chỉ chạy "hai" — cái sau ghi đè cái trước
```

```javascript
nut.addEventListener("click", () => console.log("một"));
nut.addEventListener("click", () => console.log("hai"));
// Chạy cả hai, theo thứ tự gắn
```

Ngoài ra `addEventListener` còn cho bạn tùy chọn (`once`, `capture`, `passive`) và kiểm soát pha lan truyền. Còn `onclick` viết thẳng trong HTML (`<button onclick="...">`) thì trộn lẫn HTML với JavaScript — tránh hẳn.

### 1.3. Gỡ listener

```javascript
function xuLy(e) { ... }

nut.addEventListener("click", xuLy);
nut.removeEventListener("click", xuLy);     // OK
```

**Phải là cùng một tham chiếu hàm.** Đây là lỗi rất hay gặp:

```javascript
nut.addEventListener("click", () => console.log("x"));
nut.removeEventListener("click", () => console.log("x"));   // KHÔNG gỡ được
```

Hai arrow function trông giống nhau nhưng là hai object khác nhau — nhớ so sánh tham chiếu ở file `01`.

Tương tự với `bind` (bạn đã gặp ở bài 4 file `06`):

```javascript
el.addEventListener("click", this.xuLy.bind(this));
el.removeEventListener("click", this.xuLy.bind(this));   // KHÔNG gỡ được
// Mỗi lần gọi .bind() tạo ra một hàm MỚI

// Đúng:
this.xuLyDaBind = this.xuLy.bind(this);
el.addEventListener("click", this.xuLyDaBind);
el.removeEventListener("click", this.xuLyDaBind);
```

### 1.4. Các tùy chọn

```javascript
el.addEventListener("click", xuLy, {
  once: true,       // chạy một lần rồi tự gỡ
  capture: true,    // bắt ở pha capturing (mục 3)
  passive: true,    // hứa sẽ không gọi preventDefault
  signal: ac.signal // gỡ qua AbortController
});
```

**`once`** tiện cho khởi tạo hoặc nút chỉ được bấm một lần:

```javascript
nutGui.addEventListener("click", guiForm, { once: true });
```

**`passive`** dùng cho sự kiện cuộn và chạm. Bình thường trình duyệt phải đợi handler chạy xong mới biết bạn có gọi `preventDefault()` không, nên nó không dám cuộn ngay. `passive: true` là lời hứa "tôi sẽ không chặn", cho phép trình duyệt cuộn mượt ngay lập tức.

```javascript
window.addEventListener("scroll", xuLyCuon, { passive: true });
```

**`signal`** là cách hiện đại để gỡ nhiều listener cùng lúc:

```javascript
const ac = new AbortController();

el1.addEventListener("click", f1, { signal: ac.signal });
el2.addEventListener("input", f2, { signal: ac.signal });
window.addEventListener("resize", f3, { signal: ac.signal });

ac.abort();    // gỡ cả ba trong một dòng
```

Rất hữu ích cho hàm dọn dẹp — và bạn sẽ dùng đúng mẫu này trong `useEffect` ở chặng 4.

---

## 2. Đối tượng sự kiện

Handler nhận một object chứa mọi thông tin về sự kiện:

```javascript
el.addEventListener("click", (e) => {
  e.type;             // "click"
  e.target;           // phần tử thực sự bị tác động
  e.currentTarget;    // phần tử đang gắn listener
  e.timeStamp;        // thời điểm
  e.clientX, e.clientY;   // tọa độ so với viewport
  e.pageX, e.pageY;       // tọa độ so với trang (kể cả phần đã cuộn)
  e.shiftKey, e.ctrlKey, e.altKey, e.metaKey;   // phím bổ trợ đang giữ
});
```

Với bàn phím:

```javascript
document.addEventListener("keydown", (e) => {
  e.key;      // "a", "Enter", "Escape", "ArrowUp" — KÝ TỰ tạo ra
  e.code;     // "KeyA", "Enter", "Escape" — VỊ TRÍ phím vật lý
  e.repeat;   // true nếu đang giữ phím
});
```

Khác biệt giữa `key` và `code`: nếu người dùng giữ Shift và bấm phím `a`, thì `e.key` là `"A"` còn `e.code` vẫn là `"KeyA"`. Với bàn phím bố cục khác (AZERTY), phím vật lý ở vị trí `Q` cho `e.code === "KeyQ"` nhưng `e.key === "a"`.

**Quy tắc:** cần biết người dùng *gõ ra chữ gì* → `e.key`. Cần biết *vị trí phím* (game, phím tắt WASD) → `e.code`.

---

## 3. Ba pha lan truyền

Đây là phần cốt lõi của file. Khi bạn bấm vào một phần tử, sự kiện không chỉ xảy ra ở đó.

```html
<div id="ngoai">
  <div id="giua">
    <button id="trong">Bấm tôi</button>
  </div>
</div>
```

Bấm vào `#trong`, sự kiện đi qua **ba pha**:

```
          ↓ PHA 1: CAPTURING (bắt xuống)
document → html → body → #ngoai → #giua
                                     ↓
                                  #trong    ← PHA 2: TARGET
                                     ↑
document ← html ← body ← #ngoai ← #giua
          ↑ PHA 3: BUBBLING (nổi lên)
```

Mặc định, `addEventListener` lắng nghe ở pha **bubbling**.

```javascript
["ngoai", "giua", "trong"].forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    console.log("bubbling:", id);
  });
});
// Bấm #trong → in: trong, giua, ngoai
```

Với `capture: true`:

```javascript
["ngoai", "giua", "trong"].forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    console.log("capturing:", id);
  }, { capture: true });
});
// Bấm #trong → in: ngoai, giua, trong
```

Gắn cả hai thì thứ tự đầy đủ là: `capturing ngoai`, `capturing giua`, `capturing trong`, `bubbling trong`, `bubbling giua`, `bubbling ngoai`.

Trong 99% trường hợp bạn dùng bubbling. Capturing hữu ích khi bạn cần chặn sự kiện **trước** khi nó tới đích — ví dụ một lớp phủ nuốt hết click.

### Không phải sự kiện nào cũng nổi lên

| Không bubble | Có bubble (thay thế) |
|---|---|
| `focus` | `focusin` |
| `blur` | `focusout` |
| `load`, `unload` | — |
| `mouseenter`, `mouseleave` | `mouseover`, `mouseout` |
| `scroll` (trên element) | `scroll` trên `document` |

Điều này quan trọng với event delegation: bạn không delegate được `focus`, phải dùng `focusin`.

---

## 4. `target` và `currentTarget`

```javascript
document.querySelector("#ngoai").addEventListener("click", (e) => {
  console.log("target:", e.target.id);              // phần tử BỊ BẤM
  console.log("currentTarget:", e.currentTarget.id); // phần tử GẮN LISTENER
});
```

Bấm vào `#trong`:
```
target: trong
currentTarget: ngoai
```

Bấm vào chính `#ngoai`:
```
target: ngoai
currentTarget: ngoai
```

Phân biệt này là **nền tảng của event delegation**. Không nắm chắc thì mục 6 sẽ không hiểu được.

Nhắc lại file `06`: trong handler viết bằng `function` thường, `this` chính là `e.currentTarget`. Với arrow function thì không — nên cứ dùng `e.currentTarget` cho rõ ràng.

Một chi tiết nhỏ: `e.currentTarget` trở thành `null` sau khi handler chạy xong. Nên nếu bạn dùng nó trong một callback bất đồng bộ:

```javascript
el.addEventListener("click", (e) => {
  setTimeout(() => {
    console.log(e.currentTarget);    // null!
  }, 0);
});

// Lưu lại trước
el.addEventListener("click", (e) => {
  const el = e.currentTarget;
  setTimeout(() => console.log(el), 0);   // OK
});
```

---

## 5. Chặn hành vi

### 5.1. `preventDefault` — chặn hành vi mặc định của trình duyệt

```javascript
form.addEventListener("submit", (e) => {
  e.preventDefault();        // không tải lại trang
  // tự xử lý dữ liệu
});

link.addEventListener("click", (e) => {
  e.preventDefault();        // không điều hướng
});

o.addEventListener("keydown", (e) => {
  if (!/[0-9]/.test(e.key) && e.key.length === 1) {
    e.preventDefault();      // chỉ cho gõ số
  }
});
```

`preventDefault` **không** chặn sự kiện lan truyền. Nó chỉ hủy hành động mặc định.

Kiểm tra xem đã bị chặn chưa: `e.defaultPrevented`.

### 5.2. `stopPropagation` — chặn lan truyền

```javascript
trong.addEventListener("click", (e) => {
  e.stopPropagation();       // sự kiện dừng ở đây, không nổi lên nữa
});
```

`stopPropagation` **không** chặn hành vi mặc định. Hai hàm này độc lập hoàn toàn.

| | Chặn hành vi mặc định | Chặn lan truyền |
|---|---|---|
| `preventDefault()` | Có | Không |
| `stopPropagation()` | Không | Có |

### 5.3. `stopImmediatePropagation`

```javascript
el.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  console.log("một");
});
el.addEventListener("click", () => console.log("hai"));
// Chỉ in "một" — cả listener khác trên CÙNG phần tử cũng bị chặn
```

### 5.4. Dùng `stopPropagation` cho cẩn thận

Nó phá vỡ event delegation của code khác — kể cả code của thư viện hay của đồng nghiệp. Một menu dropdown gọi `stopPropagation()` sẽ khiến listener "click ra ngoài thì đóng" ở `document` không bao giờ chạy.

Thường có cách tốt hơn:

```javascript
// Thay vì stopPropagation trong menu
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target)) {
    dongMenu();
  }
});
```

---

## 6. Event Delegation

### 6.1. Bài toán

```html
<ul id="ds">
  <li>Item 1 <button class="xoa">X</button></li>
  <li>Item 2 <button class="xoa">X</button></li>
  <li>Item 3 <button class="xoa">X</button></li>
</ul>
```

Cách ngây thơ:

```javascript
document.querySelectorAll(".xoa").forEach(nut => {
  nut.addEventListener("click", (e) => {
    e.target.closest("li").remove();
  });
});
```

Ba vấn đề:

1. **Không chạy với phần tử mới.** Thêm item sau khi gắn listener thì nút xóa của nó chết. Đây là vấn đề lớn nhất — và nó gặp ngay khi bạn làm todo app.
2. **Tốn bộ nhớ.** 1000 item = 1000 listener. Mỗi listener lại là một closure giữ biến (nhớ file `05`).
3. **Phải gắn lại mỗi lần render.** Nếu bạn dựng lại danh sách, phải nhớ gắn lại — quên là hỏng.

### 6.2. Giải pháp

Gắn **một** listener lên phần tử cha, dựa vào bubbling để bắt mọi click từ các con:

```javascript
document.querySelector("#ds").addEventListener("click", (e) => {
  const nutXoa = e.target.closest(".xoa");
  if (!nutXoa) return;              // click chỗ khác → bỏ qua

  nutXoa.closest("li").remove();
});
```

Một listener, hoạt động với mọi item — kể cả item được thêm sau đó một giờ.

### 6.3. Vì sao phải dùng `closest`, không dùng `e.target` trực tiếp

```html
<button class="xoa">
  <svg>...</svg>
  <span>Xóa</span>
</button>
```

Người dùng bấm vào chữ "Xóa" → `e.target` là thẻ `<span>`, không phải `<button>`.

```javascript
// SAI — chỉ chạy khi bấm đúng vào phần trống của button
if (e.target.classList.contains("xoa")) { ... }

// ĐÚNG — leo lên tìm button gần nhất
const nut = e.target.closest(".xoa");
if (nut) { ... }
```

`closest` bắt đầu từ chính `e.target` rồi leo lên, nên nó xử lý được cả trường hợp bấm trực tiếp lẫn bấm vào phần tử con.

### 6.4. Mẫu chuẩn — nhiều hành động

Dùng `data-*` (file `08`) để phân luồng:

```html
<ul id="ds">
  <li data-id="1">
    <input type="checkbox" data-hanh-dong="xong">
    <span class="noi-dung">Học JavaScript</span>
    <button data-hanh-dong="sua">Sửa</button>
    <button data-hanh-dong="xoa">Xóa</button>
  </li>
</ul>
```

```javascript
ds.addEventListener("click", (e) => {
  const el = e.target.closest("[data-hanh-dong]");
  if (!el) return;

  const li = el.closest("li");
  const id = Number(li.dataset.id);

  switch (el.dataset.hanhDong) {
    case "xong": danhDauXong(id); break;
    case "sua":  batDauSua(id);   break;
    case "xoa":  xoa(id);         break;
  }
});
```

Đây là mẫu bạn nên thuộc. Nó ngắn, mở rộng được (thêm hành động chỉ cần thêm một `case`), và không quan tâm phần tử được tạo lúc nào.

### 6.5. Khi nào không dùng delegation

- Sự kiện **không bubble** (`focus`, `blur`, `mouseenter`) — dùng `focusin`/`focusout`, hoặc gắn trực tiếp
- Chỉ có **một** phần tử cố định — gắn thẳng cho rõ ràng
- Cần chặn sự kiện ngay tại phần tử con trước khi nó nổi lên

### 6.6. Trả lời phỏng vấn

Câu hỏi: *"Event delegation là gì?"*

> Thay vì gắn listener cho từng phần tử con, ta gắn một listener duy nhất lên phần tử cha và dựa vào cơ chế bubbling. Trong handler, dùng `e.target.closest(selector)` để xác định phần tử nào thực sự được tác động.
>
> Lợi ích: chạy được với phần tử tạo động sau này, tiết kiệm bộ nhớ, và không phải gắn lại listener mỗi lần render.
>
> Em dùng nó trong todo app — danh sách việc được thêm động, nếu gắn listener từng nút thì nút của item mới sẽ không hoạt động.

Nhịp cuối là nhịp tạo khác biệt.

---

## 7. Các sự kiện thường dùng

### 7.1. Chuột

```javascript
"click"        // bấm và thả
"dblclick"
"mousedown" / "mouseup"
"mousemove"    // rất dày — cần throttle (file 05)
"mouseenter" / "mouseleave"   // KHÔNG bubble, không kích hoạt với phần tử con
"mouseover"  / "mouseout"     // CÓ bubble, kích hoạt cả với con
"contextmenu"  // chuột phải
```

Khác biệt `mouseenter` và `mouseover` hay gây bug: khi rê chuột qua một phần tử con, `mouseover`/`mouseout` bắn liên tục, còn `mouseenter`/`mouseleave` thì không. Làm hiệu ứng hover nên dùng cặp thứ hai.

### 7.2. Bàn phím

```javascript
"keydown"      // dùng cái này
"keyup"
"keypress"     // ĐÃ LỖI THỜI, đừng dùng
```

```javascript
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") dongModal();
  if (e.key === "Enter" && e.ctrlKey) gui();
  if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();     // chặn hộp thoại lưu trang của trình duyệt
    luu();
  }
});
```

`e.metaKey` là phím Command trên macOS — nhớ kiểm tra cả hai nếu làm phím tắt.

### 7.3. Form

```javascript
"input"     // mỗi lần giá trị đổi — kể cả dán chuột phải
"change"    // với text: khi rời ô. Với checkbox/select: ngay lập tức
"submit"    // trên thẻ <form>
"focus" / "blur"           // không bubble
"focusin" / "focusout"     // có bubble — dùng cho delegation
"reset"
```

Phân biệt `input` và `change` với ô text:

```javascript
o.addEventListener("input",  () => console.log("input"));   // mỗi ký tự
o.addEventListener("change", () => console.log("change"));  // khi rời ô
```

Validate khi đang gõ → `input`. Chỉ kiểm tra khi gõ xong → `change`.

```javascript
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // FormData gom toàn bộ dữ liệu form
  const fd = new FormData(form);
  const duLieu = Object.fromEntries(fd);     // nhớ file 03
  console.log(duLieu);
});
```

Lưu ý: `FormData` chỉ lấy field có thuộc tính `name`.

Luôn dùng sự kiện `submit` trên form, đừng dùng `click` trên nút — vì `submit` cũng kích hoạt khi người dùng bấm Enter trong ô input.

### 7.4. Cửa sổ và tài liệu

```javascript
"DOMContentLoaded"   // HTML đã dựng xong, chưa đợi ảnh
"load"               // tất cả tài nguyên đã tải xong
"resize"             // cần throttle
"scroll"             // cần throttle, thêm passive: true
"beforeunload"       // trước khi rời trang
```

Nếu bạn đã dùng `defer` (file `00`) thì thường không cần `DOMContentLoaded` nữa — script đã chạy sau khi DOM dựng xong.

---

## 8. Sự kiện tùy chỉnh

```javascript
// Tạo và phát
const sk = new CustomEvent("gio-hang:them", {
  detail: { ma: "SP1", soLuong: 2 },
  bubbles: true      // mặc định FALSE — phải bật nếu muốn nổi lên
});

document.querySelector("#nut").dispatchEvent(sk);

// Lắng nghe
document.addEventListener("gio-hang:them", (e) => {
  console.log(e.detail.ma, e.detail.soLuong);
});
```

Dùng để các phần của ứng dụng nói chuyện với nhau mà không cần gọi trực tiếp. Đặt tên theo quy ước `khonggian:hanhdong` để tránh trùng.

Nhớ `bubbles: true` — mặc định là `false`, và đây là lý do phổ biến khiến custom event "không chạy".

---

## 9. Sự kiện dày và closure

Nối lại file `05`:

```javascript
// XẤU — mousemove bắn hàng trăm lần mỗi giây
window.addEventListener("mousemove", capNhatViTri);

// TỐT
window.addEventListener("mousemove", throttle(capNhatViTri, 100));
window.addEventListener("scroll", throttle(xuLyCuon, 100), { passive: true });
window.addEventListener("resize", debounce(tinhLaiBoCuc, 250));
oTimKiem.addEventListener("input", debounce(goiAPI, 500));
```

Nhắc lại cái bẫy ở file `05`: tạo hàm debounce **một lần** bên ngoài, đừng tạo bên trong handler.

```javascript
// SAI — mỗi lần gõ tạo một debounce mới, idTimer luôn mới
o.addEventListener("input", (e) => {
  debounce(goiAPI, 500)(e.target.value);
});

// ĐÚNG
const tim = debounce(goiAPI, 500);
o.addEventListener("input", (e) => tim(e.target.value));
```

---

## 10. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Nút mới thêm không hoạt động | Listener gắn trước khi phần tử tồn tại | Event delegation |
| `removeEventListener` không gỡ được | Truyền hàm khác tham chiếu | Lưu hàm vào biến trước |
| Form tải lại trang khi submit | Thiếu `preventDefault` | `e.preventDefault()` trong handler `submit` |
| Bấm vào icon trong nút thì không chạy | Dùng `e.target` trực tiếp | `e.target.closest(".nut")` |
| Delegation cho `focus` không chạy | `focus` không bubble | Dùng `focusin` |
| Listener ở cha chạy cả khi bấm chỗ khác | Thiếu kiểm tra `if (!el) return` | Thêm điều kiện sau `closest` |
| Menu "click ra ngoài để đóng" không hoạt động | Code khác gọi `stopPropagation` | Bỏ `stopPropagation`, dùng `contains` |
| Custom event không ai nghe thấy | Thiếu `bubbles: true` | Thêm vào options |
| Cuộn trang giật | Handler `scroll` nặng | `throttle` + `{ passive: true }` |
| `this` trong handler là `undefined` | Dùng arrow function | Dùng `e.currentTarget` |
| `e.currentTarget` là `null` | Đọc trong callback bất đồng bộ | Lưu vào biến ngay trong handler |
| Debounce không có tác dụng | Tạo hàm debounce bên trong handler | Tạo một lần ở ngoài |

---

## 11. Tóm tắt cần thuộc

1. `addEventListener` cho phép nhiều handler; `onclick` thì ghi đè
2. `removeEventListener` cần **đúng tham chiếu hàm** đã truyền vào
3. Ba pha: capturing (xuống) → target → bubbling (lên). Mặc định nghe ở bubbling
4. `e.target` = phần tử bị tác động; `e.currentTarget` = phần tử gắn listener
5. `preventDefault` chặn hành vi mặc định; `stopPropagation` chặn lan truyền — độc lập
6. `focus`/`blur`/`mouseenter`/`mouseleave` **không** bubble
7. Delegation: một listener ở cha + `e.target.closest(selector)` + `if (!el) return`
8. Delegation chạy với phần tử tạo động — đây là lợi ích lớn nhất
9. `input` bắn mỗi ký tự; `change` bắn khi rời ô (với text)
10. Dùng `submit` trên form, không dùng `click` trên nút
11. Custom event cần `bubbles: true` để nổi lên
12. Sự kiện dày (`scroll`, `mousemove`, `input`) phải throttle/debounce
13. `AbortController` + `signal` để gỡ nhiều listener một lượt

---

## Bài tập

### Bài 1 — Thí nghiệm lan truyền

Tạo `bai-tap-09/lan-truyen/`:

```html
<div id="ngoai" style="padding:40px;background:#fee">
  ngoai
  <div id="giua" style="padding:40px;background:#efe">
    giua
    <button id="trong">trong</button>
  </div>
</div>
<button id="xoa-log">Xóa log</button>
<pre id="log"></pre>
```

**Phần A.** Gắn listener bubbling cho cả ba, in ra `#log` theo thứ tự. Bấm `#trong`, ghi thứ tự vào `du-doan.md`. **Đoán trước khi chạy.** -> in ra bubbling trong bubbling giua  bubbling ngoai

**Phần B.** Thêm listener capturing cho cả ba. Đoán và ghi lại thứ tự đầy đủ 6 dòng. -> in ra capturing từ ngoài vào trong xong bubbling từ trong ra ngoài

**Phần C.** Với mỗi listener, in ra cả `e.target.id` và `e.currentTarget.id`. Bấm lần lượt vào `#trong`, `#giua`, `#ngoai`. Lập bảng 9 ô kết quả trong `du-doan.md`. -> target in ra cái bị bấm còn currentTarget là cái gắn sự kiện

**Phần D.** Thêm `e.stopPropagation()` vào listener của `#giua`. Đoán rồi chạy, ghi kết quả. -> n ra capturing từ ngoài vào trong xong bubbling từ trong tới giữa là dừng

**Phần E.** Thêm hai listener bubbling cho `#trong`, listener đầu gọi `stopImmediatePropagation()`. Ghi kết quả và giải thích khác biệt với phần D.

**Phần F.** Trả lời: nếu bạn chỉ được gắn **một** listener duy nhất trên cả trang để bắt mọi click, bạn gắn ở đâu và dùng pha nào? -> gán ở ngoai và dùng bubbling 

### Bài 2 — Delegation vs gắn trực tiếp

Tạo `bai-tap-09/so-sanh/`:

```html
<button id="them">Thêm item</button>
<h3>Cách 1: gắn trực tiếp</h3>
<ul id="ds1"></ul>
<h3>Cách 2: delegation</h3>
<ul id="ds2"></ul>
```

Cả hai danh sách bắt đầu với 3 item, mỗi item có nút "Xóa". Nút "Thêm item" thêm một item vào **cả hai** danh sách.

- `#ds1` gắn listener cho từng nút xóa, gắn một lần lúc khởi tạo
- `#ds2` dùng delegation

Bấm "Thêm item" vài lần rồi thử xóa ở cả hai danh sách. Ghi vào `du-doan.md`: cái nào hỏng, hỏng thế nào, và vì sao. -> khi thêm item thì cái thứ 1 thêm nhưng khoogn có sự kiện xóa còn cái thứ 2 thì có

> **NOTE:** Đúng về khái niệm (đây chính xác là điều đáng lẽ phải xảy ra), nhưng CHƯA được xác nhận bằng code thật — `main.js` hiện tại bị crash ngay từ dòng đầu (xem comment "SAI" trong file đó), nên nút "Thêm item" thực tế không hoạt động, chưa item nào được thêm vào danh sách nào cả. Sửa hết lỗi trong `main.js`, chạy lại thật trong trình duyệt rồi xác nhận đúng như dự đoán này.

Thêm phần đo: dùng `getEventListeners` trong DevTools Console (hoặc tự đếm bằng biến) để so sánh số listener của hai cách khi có 50 item.

### Bài 3 — Bàn phím và form

Tạo `bai-tap-09/form/`:

```html
<form id="form">
  <input name="ten" placeholder="Họ tên" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="tuoi" placeholder="Tuổi (chỉ số)">
  <select name="thanhPho">
    <option value="">-- Chọn --</option>
    <option value="hcm">HCM</option>
    <option value="hn">Hà Nội</option>
  </select>
  <label><input type="checkbox" name="dongY"> Đồng ý điều khoản</label>
  <button type="submit">Gửi</button>
</form>
<pre id="ket-qua"></pre>
```

Yêu cầu:

1. Submit **không** tải lại trang; gom dữ liệu bằng `FormData` + `Object.fromEntries`, in ra `#ket-qua`
2. Ô "Tuổi" chỉ cho gõ số — chặn bằng `keydown`, nhưng vẫn cho dùng `Backspace`, mũi tên, `Tab`, và Ctrl+V
3. Validate **khi đang gõ** (`input`) cho ô email, hiện lỗi đỏ dưới ô
4. Ô "Họ tên" chỉ validate **khi rời ô** (`change` hoặc `blur`) — quan sát sự khác biệt trải nghiệm và ghi nhận xét
5. Dùng **delegation với `focusin`/`focusout`** để tô sáng ô đang được focus — chỉ một listener trên `#form`
6. `Escape` xóa toàn bộ form; `Ctrl/Cmd + Enter` submit
7. Checkbox chưa tick thì nút Gửi bị `disabled`

Câu 5 là điểm mấu chốt: thử dùng `focus` trước rồi mới đổi sang `focusin`, để tự thấy vì sao phải dùng cái sau.

### Bài 4 — Todo app (bài chính)

Tạo `bai-tap-09/todo/` với `index.html`, `style.css`, `main.js`.

**Giao diện:**

```
┌──────────────────────────────────┐
│  [ Thêm việc mới...      ] [+]   │
├──────────────────────────────────┤
│  [Tất cả] [Chưa xong] [Đã xong]  │
├──────────────────────────────────┤
│  ☐ Học JavaScript      [✎] [✕]  │
│  ☑ Làm bài tập 08      [✎] [✕]  │
│  ☐ Đọc tài liệu        [✎] [✕]  │
├──────────────────────────────────┤
│  2 việc chưa xong   [Xóa đã xong]│
└──────────────────────────────────┘
```

**Ràng buộc bắt buộc:**

1. **Đúng một** `addEventListener("click", ...)` cho toàn bộ danh sách — mọi hành động đi qua delegation
2. **Không** gọi `addEventListener` bên trong hàm render
3. **Không** dùng `innerHTML` với dữ liệu người dùng — nội dung việc phải qua `textContent`
4. Kiến trúc như bài máy tính: `trạng thái → render()`. Hàm xử lý logic không được chứa `document.`

**Chức năng:**

1. Thêm việc — bấm nút hoặc Enter. Không cho thêm chuỗi rỗng/toàn khoảng trắng
2. Tick checkbox đánh dấu hoàn thành, chữ gạch ngang
3. Xóa một việc
4. **Sửa tại chỗ**: bấm nút sửa → biến thành ô input → Enter lưu, Escape hủy, click ra ngoài lưu. Nội dung rỗng thì hủy
5. Ba bộ lọc, nút đang chọn được làm nổi bật
6. Đếm số việc chưa xong, đúng ngữ pháp
7. "Xóa đã xong" — xóa tất cả việc đã hoàn thành, hỏi xác nhận nếu có trên 3 việc
8. Danh sách rỗng hiện thông báo phù hợp với bộ lọc đang chọn (rỗng thật vs không có kết quả lọc)
9. Nút "Đánh dấu tất cả" bật/tắt toàn bộ

**Yêu cầu nâng cao:**

10. **Kéo thả sắp xếp** — dùng thuộc tính `draggable` và các sự kiện `dragstart`, `dragover`, `drop`
11. **Hoàn tác**: sau khi xóa, hiện thông báo "Đã xóa. Hoàn tác?" trong 5 giây. Dùng `setTimeout` và closure để giữ dữ liệu đã xóa
12. Phím tắt: `/` focus vào ô nhập, `Escape` bỏ focus

**Tự kiểm tra** — ghi kết quả vào `du-doan.md`:

| Thao tác | Kết quả mong đợi |
|---|---|
| Thêm 5 việc rồi xóa việc thứ 3 | Đúng việc bị xóa, bộ đếm đúng |
| Thêm việc mới rồi bấm xóa nó ngay | Xóa được — chứng minh delegation hoạt động |
| Nhập tên việc là `<img src=x onerror=alert(1)>` | Hiện ra đúng chuỗi đó, **không** có alert |
| Bấm vào icon bên trong nút xóa | Vẫn xóa được |
| Sửa việc rồi bấm Escape | Nội dung cũ giữ nguyên |
| Lọc "Chưa xong" rồi tick hết | Hiện thông báo rỗng phù hợp |
| Đếm số listener trên trang | Chỉ vài cái cố định, không tăng theo số việc |

Ghi chú: app này chưa lưu dữ liệu — tải lại trang là mất. Ở file `13` bạn sẽ thêm `localStorage` vào đúng app này, nên hãy viết code gọn gàng để dễ mở rộng.

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. Ba pha lan truyền là gì? Vẽ sơ đồ.
2. `e.target` và `e.currentTarget` khác nhau ra sao? Cho ví dụ cả hai giống nhau và khác nhau.
3. Event delegation là gì? Trả lời như đang phỏng vấn, đủ ba nhịp như ở mục 6.6.
4. `preventDefault` và `stopPropagation` khác nhau thế nào? Cho ví dụ dùng từng cái.
5. Vì sao `removeEventListener` với arrow function thường thất bại?
6. Vì sao không delegate được sự kiện `focus`? Dùng gì thay thế?

---

## Xong file này khi

- [ ] Bài 1 đủ 6 phần, mỗi phần có phần đoán viết trước
- [ ] Bài 2 chứng minh được cách gắn trực tiếp hỏng với phần tử mới
- [ ] Form ở bài 3 đủ 7 yêu cầu, dùng `focusin` cho câu 5
- [ ] Todo app đủ 9 chức năng cơ bản, tối thiểu 1 trong 3 chức năng nâng cao
- [ ] Todo app chỉ có **một** listener cho danh sách — tự kiểm tra lại code
- [ ] Thử nhập `<img src=x onerror=alert(1)>` và xác nhận không có alert
- [ ] Trả lời được 6 câu ở bài 5 bằng lời

**Hết khối C.** Bạn đã có hai sản phẩm chạy được: máy tính và todo app. Từ file `10` là khối D — bất đồng bộ, Promise, gọi API. Đây là khối biến trang web thành ứng dụng thật, và file `10` là file lý thuyết nặng nhất còn lại của chặng 2.

Xong thì gửi mình cả thư mục `todo/` + `du-doan.md`, kèm **"viết file 10-bat-dong-bo-va-event-loop"**.