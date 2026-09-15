# 02 — Hàm và Scope

> **Cần có trước:** xong `01-bien-va-kieu-du-lieu`.
> **Thời gian:** 3–4 giờ.
> **Vì sao quan trọng:** hàm là đơn vị tổ chức code cơ bản nhất, và scope là luật quyết định biến nào nhìn thấy được từ đâu. Hiểu chắc scope ở đây thì file `05-closure` sẽ nhẹ nhàng; không hiểu thì closure sẽ như phép thuật.

---

## 1. Hàm là gì

Hàm là một khối code có tên, nhận đầu vào, trả ra đầu ra, và dùng lại được nhiều lần.

```javascript
function tinhDienTich(rong, cao) {
  return rong * cao;
}

console.log(tinhDienTich(5, 3));   // 15
console.log(tinhDienTich(2, 8));   // 16
```

Ba phần cần phân biệt rõ tên gọi, vì mình sẽ dùng suốt:

- **Tham số** (parameter): `rong`, `cao` — tên trong định nghĩa hàm
- **Đối số** (argument): `5`, `3` — giá trị thật khi gọi hàm
- **Lời gọi** (call/invocation): `tinhDienTich(5, 3)`

---

## 2. Bốn cách viết hàm

### 2.1. Function declaration (khai báo hàm)

```javascript
function chao(ten) {
  return `Xin chào ${ten}`;
}
```

Đặc điểm: được **hoist đầy đủ**, gọi trước khi khai báo vẫn chạy.

```javascript
console.log(chao("An"));   // "Xin chào An" — chạy bình thường

function chao(ten) {
  return `Xin chào ${ten}`;
}
```

### 2.2. Function expression (biểu thức hàm)

Hàm được gán vào một biến:

```javascript
const chao = function (ten) {
  return `Xin chào ${ten}`;
};
```

Đặc điểm: **không** gọi trước được, vì đây thực chất là khai báo biến `const` — nó nằm trong TDZ cho đến dòng gán.

```javascript
console.log(chao("An"));   // ReferenceError: Cannot access 'chao' before initialization

const chao = function (ten) { ... };
```

Chú ý dấu `;` ở cuối — vì đây là một câu lệnh gán, khác với function declaration không cần dấu `;`.

### 2.3. Arrow function (hàm mũi tên)

```javascript
const chao = (ten) => {
  return `Xin chào ${ten}`;
};

// Thân hàm chỉ có một biểu thức return → bỏ được { } và return
const chao2 = (ten) => `Xin chào ${ten}`;

// Đúng một tham số → bỏ được ngoặc tròn (nhưng nên giữ cho nhất quán)
const chao3 = ten => `Xin chào ${ten}`;

// Không tham số → bắt buộc có ngoặc rỗng
const layNgay = () => new Date();

// Trả về object → phải bọc ngoặc tròn, nếu không { } bị hiểu là thân hàm
const taoUser = (ten) => ({ ten: ten, diem: 0 });
```

Cái bẫy cuối cùng đáng nhớ:

```javascript
const sai  = (ten) => { ten: ten };     // trả về undefined!
const dung = (ten) => ({ ten: ten });   // trả về { ten: "..." }
```

Ở dòng `sai`, `{ }` được hiểu là thân hàm, `ten:` được hiểu là một nhãn (label), và hàm không `return` gì cả.

### 2.4. Method trong object

```javascript
const may = {
  gia: 100,
  // cú pháp rút gọn
  tangGia(them) {
    return this.gia + them;
  }
};
```

Trong object, **đừng dùng arrow function cho method** nếu bên trong cần `this`. Lý do sẽ giải thích ở mục 6 và mổ xẻ đầy đủ ở file `06`.

---

## 3. Hoisting

Hoisting là hành vi JavaScript "kéo" các khai báo lên đầu phạm vi chứa nó, **trước khi** chạy dòng nào.

Cần hiểu chính xác: JavaScript không thực sự di chuyển code. Nó chạy qua hai giai đoạn — giai đoạn **biên dịch** đăng ký tất cả tên biến/hàm trong phạm vi, giai đoạn **thực thi** mới chạy từng dòng. Hoisting là hệ quả nhìn thấy được của giai đoạn một.

### 3.1. Bảng hành vi

| Khai báo | Được hoist? | Truy cập trước khi khai báo |
|---|---|---|
| `function` declaration | Có, cả thân hàm | Chạy được bình thường |
| `var` | Có, nhưng chỉ tên | Ra `undefined` |
| `let` / `const` | Có, nhưng vào TDZ | **ReferenceError** |
| `class` | Có, nhưng vào TDZ | **ReferenceError** |
| function expression | Theo `var`/`let`/`const` của nó | Theo bảng trên |

### 3.2. Ví dụ đối chiếu

```javascript
// --- function declaration ---
noiXinChao();          // "Xin chào" — OK
function noiXinChao() {
  console.log("Xin chào");
}

// --- var ---
console.log(a);        // undefined
var a = 1;
console.log(a);        // 1

// --- let ---
console.log(b);        // ReferenceError
let b = 1;

// --- function expression với var ---
f();                   // TypeError: f is not a function
var f = function () {};
```

Chú ý ví dụ cuối: lỗi là **TypeError** chứ không phải ReferenceError. Vì `var f` đã được hoist với giá trị `undefined`, nên `f` tồn tại — chỉ là nó chưa phải hàm. Gọi `undefined()` cho ra TypeError.

Phân biệt được hai loại lỗi này là dấu hiệu bạn thực sự hiểu hoisting.

### 3.3. TDZ — Temporal Dead Zone

Vùng từ đầu khối cho đến dòng khai báo `let`/`const` gọi là TDZ. Biến đã tồn tại trong đó nhưng chưa khởi tạo, chạm vào là lỗi.

```javascript
{
  // TDZ của x bắt đầu từ đây
  console.log(typeof x);   // ReferenceError — kể cả typeof cũng lỗi
  let x = 1;
  // TDZ kết thúc
  console.log(typeof x);   // "number"
}
```

Điểm thú vị: `typeof` với biến **chưa hề khai báo** thì lại không lỗi:

```javascript
console.log(typeof bienKhongTonTai);   // "undefined" — không lỗi
```

Nhưng `typeof` với biến trong TDZ thì lỗi. Đây là chỗ khác biệt tinh tế hay được hỏi.

### 3.4. Kết luận thực dụng

Đừng dựa vào hoisting để viết code. Khai báo trước, dùng sau. Hoisting là thứ bạn cần **hiểu để đọc code người khác và trả lời phỏng vấn**, không phải thứ để tận dụng.

---

## 4. Scope — phạm vi

Scope trả lời câu hỏi: từ vị trí này trong code, tôi nhìn thấy những biến nào?

### 4.1. Ba loại scope

```javascript
const toanCuc = "global";              // Global scope

function ham() {
  const trongHam = "function scope";   // Function scope

  if (true) {
    const trongKhoi = "block scope";   // Block scope
    console.log(toanCuc);              // OK
    console.log(trongHam);             // OK
    console.log(trongKhoi);            // OK
  }

  console.log(trongKhoi);              // ReferenceError
}

console.log(trongHam);                 // ReferenceError
```

Quy tắc một chiều: **bên trong nhìn ra được ngoài, bên ngoài không nhìn vào được trong.**

### 4.2. Scope chain

Khi gặp một biến, JavaScript tìm ở scope hiện tại. Không thấy thì leo ra scope cha. Vẫn không thấy thì leo tiếp, cho đến global. Đến global vẫn không có thì báo `ReferenceError`.

```javascript
const a = 1;

function ngoai() {
  const b = 2;

  function trong() {
    const c = 3;
    console.log(a, b, c);   // 1 2 3
  }

  trong();
}

ngoai();
```

Trong hàm `trong`, tìm `c` thấy ngay tại chỗ; tìm `b` phải leo ra `ngoai`; tìm `a` phải leo ra global.

Chuỗi này gọi là **scope chain**, và nó là nền tảng của closure ở file `05`.

### 4.3. Lexical scope — điểm mấu chốt

Scope được quyết định bởi **vị trí hàm được viết ra trong code**, không phải bởi nơi hàm được gọi.

```javascript
const x = "toàn cục";

function in() {
  console.log(x);
}

function goi() {
  const x = "trong hàm goi";
  in();          // in ra gì?
}

goi();           // "toàn cục"
```

Hàm `in` được **viết** ở global, nên nó nhìn thấy `x` của global. Việc nó được **gọi** từ trong `goi` hoàn toàn không liên quan.

Đây gọi là **lexical scoping** (hay static scoping). Ghi nhớ câu này: *scope quyết định lúc viết, không phải lúc chạy.*

### 4.4. Shadowing — che biến

Biến trong che biến ngoài cùng tên:

```javascript
const ten = "ngoài";

function f() {
  const ten = "trong";
  console.log(ten);      // "trong"
}

f();
console.log(ten);        // "ngoài"
```

Shadowing hợp lệ nhưng dễ gây nhầm khi đọc. Đặt tên khác nhau nếu được.

### 4.5. Biến toàn cục ngầm — cái bẫy của `var`

Trong chế độ không strict, gán cho một biến chưa khai báo sẽ **tự tạo biến global**:

```javascript
function f() {
  bien = 10;        // không có let/const/var
}

f();
console.log(bien);  // 10 — biến rò ra global!
```

Đây là nguồn bug nghiêm trọng: hai hàm khác nhau vô tình dùng cùng tên biến sẽ ghi đè lẫn nhau.

Cách phòng: bật **strict mode**, khi đó dòng trên sẽ báo `ReferenceError`.

```javascript
"use strict";
```

Tin tốt: **ES module (file `.js` nhúng bằng `<script type="module">`) tự động chạy ở strict mode**. Từ file `13` trở đi bạn sẽ dùng module, nên chuyện này tự được giải quyết. Trước đó, cứ thêm `"use strict";` ở đầu file cho chắc.

---

## 5. Tham số và đối số

### 5.1. Tham số mặc định

```javascript
function chao(ten = "bạn", loiChao = "Xin chào") {
  return `${loiChao} ${ten}`;
}

chao();                    // "Xin chào bạn"
chao("An");                // "Xin chào An"
chao("An", "Hê lô");       // "Hê lô An"
chao(undefined, "Hê lô");  // "Hê lô bạn"
```

Giá trị mặc định chỉ áp dụng khi đối số là **`undefined`**, không áp dụng với `null`:

```javascript
chao(null);        // "Xin chào null"  ← null KHÔNG kích hoạt giá trị mặc định
```

Tham số mặc định được tính **tại thời điểm gọi hàm**, và tính từ trái sang phải, nên tham số sau dùng được tham số trước:

```javascript
function f(a, b = a * 2) {
  return [a, b];
}

f(3);      // [3, 6]
f(3, 10);  // [3, 10]

function g(a = b, b = 1) {   // lỗi: b còn trong TDZ khi tính a
  return [a, b];
}
g();       // ReferenceError
```

### 5.2. Thừa và thiếu đối số

JavaScript không kiểm tra số lượng đối số:

```javascript
function f(a, b) {
  console.log(a, b);
}

f(1);           // 1 undefined   — thiếu thì thành undefined
f(1, 2, 3);     // 1 2           — thừa thì bị bỏ qua (nhưng không mất, xem 5.3)
```

Đây là lý do TypeScript (chặng 3) tồn tại.

### 5.3. `arguments` và rest parameter

`arguments` là object giống-mảng chứa mọi đối số, có sẵn trong function thường:

```javascript
function f() {
  console.log(arguments);          // [Arguments] { '0': 1, '1': 2, '2': 3 }
  console.log(arguments.length);   // 3
  console.log(arguments[0]);       // 1
  // arguments.map(...)            // TypeError — nó KHÔNG phải mảng thật
}

f(1, 2, 3);
```

Cách hiện đại là **rest parameter**, cho ra mảng thật:

```javascript
function tong(...soLieu) {
  return soLieu.reduce((a, b) => a + b, 0);   // dùng được mọi method của mảng
}

tong(1, 2, 3);       // 6
tong(1, 2, 3, 4, 5); // 15

// Kết hợp tham số thường
function f(dau, ...conLai) {
  console.log(dau);     // 1
  console.log(conLai);  // [2, 3, 4]
}
f(1, 2, 3, 4);
```

Rest parameter phải là tham số **cuối cùng**, và chỉ được có một.

**Arrow function không có `arguments`.** Dùng rest parameter thay thế.

### 5.4. Đừng sửa đối số là object

Nối lại bài học ở file `01`:

```javascript
function themDiem(user) {
  user.diem += 1;      // sửa trực tiếp object gốc bên ngoài
}

const u = { diem: 5 };
themDiem(u);
console.log(u.diem);   // 6 — object bên ngoài đã bị đổi
```

Với primitive thì không có chuyện này, vì chúng được truyền theo giá trị:

```javascript
function tang(n) {
  n += 1;
}

let so = 5;
tang(so);
console.log(so);       // 5 — không đổi
```

---

## 6. `return`

```javascript
function f() {
  return 1;
  console.log("không bao giờ chạy");   // code sau return bị bỏ qua
}

function g() {
  // không có return
}
console.log(g());      // undefined
```

Một hàm chỉ trả về được **một** giá trị. Muốn trả nhiều thứ thì gói vào object hoặc mảng:

```javascript
function tinh(a, b) {
  return { tong: a + b, hieu: a - b };
}

const { tong, hieu } = tinh(5, 3);   // destructuring, học kỹ ở file 03
```

### Cái bẫy tự động chèn dấu chấm phẩy

```javascript
function f() {
  return
  {
    a: 1
  };
}

console.log(f());   // undefined!
```

JavaScript tự chèn dấu `;` ngay sau `return`, biến nó thành `return;`. **Luôn đặt giá trị trả về cùng dòng với `return`**, hoặc mở ngoặc ngay trên cùng dòng đó:

```javascript
function f() {
  return {
    a: 1
  };
}
```

---

## 7. Arrow function khác function thường ở đâu

Đây là câu hỏi phỏng vấn gần như chắc chắn gặp. Có 5 khác biệt:

| | Function thường | Arrow function |
|---|---|---|
| `this` | Có `this` riêng, tùy cách gọi | **Không có** `this` riêng, lấy từ scope bao ngoài |
| `arguments` | Có | Không |
| Gọi với `new` | Được | **Không**, lỗi TypeError |
| `prototype` | Có | Không |
| Hoisting | Declaration được hoist đầy đủ | Không (nó là expression) |

Khác biệt về `this` là quan trọng nhất và sẽ được mổ xẻ đầy đủ ở file `06`. Bây giờ chỉ cần nắm hệ quả thực dụng:

```javascript
const may = {
  ten: "Máy A",

  hienThiSai: () => {
    console.log(this.ten);      // undefined — arrow không lấy `this` là `may`
  },

  hienThiDung() {
    console.log(this.ten);      // "Máy A"
  }
};

may.hienThiSai();
may.hienThiDung();
```

**Quy tắc tạm dùng cho đến file 06:**

- Method trong object hoặc class → dùng **function thường**
- Callback ngắn (`map`, `filter`, `setTimeout`, xử lý sự kiện trong React) → dùng **arrow**
- Cần dùng `new` → bắt buộc function thường

---

## 8. Hàm là giá trị

Trong JavaScript, hàm là một loại giá trị bình thường. Nó gán được vào biến, truyền được vào hàm khác, trả về được từ hàm khác.

```javascript
// Gán vào biến
const f = function () { return 1; };

// Cho vào mảng
const dsHam = [() => 1, () => 2];
console.log(dsHam[0]());     // 1

// Cho vào object
const obj = { chay: () => "xong" };

// Truyền vào hàm khác — đây gọi là CALLBACK
function thucThi(callback) {
  return callback();
}
console.log(thucThi(() => "kết quả"));   // "kết quả"

// Trả về từ hàm khác — đây là mầm mống của CLOSURE
function taoNhanBoi(heSo) {
  return function (x) {
    return x * heSo;
  };
}

const nhanDoi = taoNhanBoi(2);
console.log(nhanDoi(5));     // 10
```

Ví dụ cuối là closure. Hàm bên trong vẫn "nhớ" được `heSo` kể cả khi `taoNhanBoi` đã chạy xong từ lâu. Vì sao nhớ được — đó là toàn bộ nội dung file `05`.

### Callback ở khắp nơi

```javascript
[1, 2, 3].map(function (x) { return x * 2; });   // callback
setTimeout(function () { console.log("hi"); }, 1000);
nut.addEventListener("click", function () { ... });
```

Bạn sẽ viết callback nhiều hơn viết hàm thường trong công việc thật.

---

## 9. IIFE

Hàm tự gọi ngay lập tức. Cú pháp:

```javascript
(function () {
  const rieng = "không rò ra ngoài";
  console.log(rieng);
})();

// Dạng arrow
(() => {
  console.log("chạy ngay");
})();
```

Ngày xưa IIFE là cách duy nhất để tạo phạm vi riêng, tránh làm bẩn global. Từ khi có `let`/`const` block scope và ES module, nó ít cần thiết hơn nhiều. Bạn cần biết để đọc code cũ, không cần chủ động dùng.

---

## 10. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `ReferenceError: Cannot access 'x' before initialization` | Dùng biến `let`/`const` khi còn trong TDZ | Chuyển lời gọi xuống sau khai báo |
| `TypeError: f is not a function` | `var f = function(){}` bị gọi trước dòng gán | Khai báo trước, gọi sau |
| Arrow function trả về `undefined` | Viết `x => { a: 1 }` — `{}` bị hiểu là thân hàm | Bọc ngoặc: `x => ({ a: 1 })` |
| `return` trả về `undefined` dù có giá trị | Xuống dòng ngay sau `return` | Đặt giá trị cùng dòng với `return` |
| `this` là `undefined` trong method | Dùng arrow function làm method | Đổi sang function thường |
| Biến bị hàm khác ghi đè bất ngờ | Quên `const`/`let`, tạo biến global ngầm | Bật `"use strict"` |
| `arguments is not defined` | Dùng `arguments` trong arrow function | Dùng rest parameter `(...args)` |
| `arr.map is not a function` khi gọi trên `arguments` | `arguments` không phải mảng thật | `Array.from(arguments)` hoặc rest parameter |

---

## 11. Tóm tắt cần thuộc

1. Function declaration hoist đầy đủ; function expression và arrow thì không
2. `var` hoist thành `undefined`; `let`/`const` hoist vào TDZ, chạm vào là lỗi
3. `typeof` biến chưa khai báo → `"undefined"`; `typeof` biến trong TDZ → **lỗi**
4. Scope: trong nhìn ra được, ngoài nhìn vào không được
5. **Lexical scope**: scope quyết định lúc viết code, không phải lúc gọi
6. Giá trị mặc định chỉ kích hoạt bởi `undefined`, không phải `null`
7. Rest `(...args)` cho mảng thật; `arguments` chỉ giống mảng và không có trong arrow
8. Arrow khác function thường ở 5 điểm — quan trọng nhất là `this`
9. Không xuống dòng ngay sau `return`
10. Hàm là giá trị: truyền được, trả về được — đây là nền của callback và closure

---

## Bài tập

Tạo `bai-tap-02/` với `index.html`, `main.js`, và `du-doan.md`.

### Bài 1 — Sửa 6 đoạn code lỗi scope (bài chính)

Với mỗi đoạn: ghi vào `du-doan.md` **lỗi gì, dòng nào, vì sao**, rồi viết bản sửa vào `main.js`.

```javascript
// --- Đoạn 1 ---
function tinhTong(arr) {
  let tong = 0;
  for (let i = 0; i < arr.length; i++) {
    let giaTri = arr[i];
    tong += giaTri;
  }
  console.log(giaTri); -> không in giá trị ở đây được vì chưa khai bao
  return tong;
}

// --- Đoạn 2 ---
console.log(nhanDoi(5)); -> không gọi hàm được vì đây là dạng hàm expression
const nhanDoi = function (x) {
  return x * 2;
};

// --- Đoạn 3 ---
function demNguoiDung() {
  for (var i = 0; i < 3; i++) {
    setTimeout(function () {
      console.log("Người dùng thứ " + i);
    }, 100);
  }
}
-> sửa var i vì var được đưa lên đầu nên i như nhau
// Mong muốn in: Người dùng thứ 0, 1, 2

// --- Đoạn 4 ---
const gioHang = {
  danhSach: ["Áo", "Quần"],
  inDanhSach: () => {
    this.danhSach.forEach((item) => {
      console.log(item);
    });
  }
};
gioHang.inDanhSach(); -> sai vì lamda không dùng this được

// --- Đoạn 5 ---
function taoUser(ten) {
  return
  {
    ten: ten,
    ngayTao: new Date()
  };
}
console.log(taoUser("An")); -> sau return không được xuống dòng

// --- Đoạn 6 ---
"use strict";
function capNhatDiem(diem) {
  ketQua = diem * 2; -> thiếu khai báo
  return ketQua;
}
console.log(capNhatDiem(5));
```

Đoạn 3 khó nhất và có ít nhất hai cách sửa. Tìm được cả hai thì càng tốt.

### Bài 2 — Đoán output

Ghi phần đoán vào `du-doan.md` **trước khi chạy**:

```javascript
// A
console.log(a);
console.log(b); -> lỗi 
console.log(c);
var a = 1;
let b = 2;
function c() {}

// B
function f() {
  console.log(x);
  var x = 1;
  console.log(x);
}
f();
-> undefined
  1
// C
const ten = "toàn cục";
function hienThi() {
  console.log(ten);
}
function chay() {
  const ten = "trong chay";
  hienThi();
}
chay();
// toàn cục
// D
function g(a, b = a + 1, c = b + 1) {
  return [a, b, c];
}
console.log(g(1));
console.log(g(1, 5));
-> [1,2,3]
-> [1,5,6]
// E
function h(x = 10) {
  return x;
}
console.log(h(undefined));
console.log(h(null));
console.log(h(0));
-> 10 
0
0
// F
console.log(typeof chuaKhaiBao); -> undefined
console.log(typeof trongTDZ); -> lỗi
let trongTDZ = 1;
```

### Bài 3 — Viết hàm

Viết 5 hàm sau, mỗi hàm dùng arrow function và test ít nhất 3 trường hợp:

1. `tinhTrungBinh(...diem)` — trung bình cộng, không có đối số nào thì trả `0`
2. `laSoChan(n)` — trả `true`/`false`, phải xử lý được cả `"4"` (chuỗi số) và `"abc"`
3. `rutGon(chuoi, doDai = 20)` — cắt chuỗi và thêm `"..."` nếu dài hơn `doDai`; ngắn hơn thì giữ nguyên
4. `dem(mang, dieuKien)` — đếm số phần tử thỏa điều kiện, `dieuKien` là một hàm callback
5. `taoBoDem(batDau = 0)` — trả về một hàm, mỗi lần gọi hàm đó thì tăng và trả về số đếm

Bài 5 chính là closure. Chưa hiểu vì sao nó chạy được cũng không sao — cứ viết cho nó chạy, file `05` sẽ giải thích.

### Bài 4 — Hàm nhận hàm

Viết hàm `thuLai(hamCanChay, soLan)`:

- Gọi `hamCanChay()`
- Nếu nó ném lỗi (`throw`), thử lại, tối đa `soLan` lần
- Thành công thì trả về kết quả
- Hết số lần vẫn lỗi thì ném lỗi cuối cùng ra

Test bằng một hàm giả lập chỉ thành công ở lần gọi thứ 3.

Gợi ý: dùng `try { ... } catch (e) { ... }` và một vòng `for`.

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 3–5 dòng, **bằng lời của bạn**, không copy từ file này:

1. Hoisting là gì, và vì sao `let` vẫn được hoist mà lại báo lỗi? -> là cơ chế đưa lên trên trước và chạy trước, let báo lỗi vì cơ chế NFE tức là nó khai báo trước nhưng nếu dùng thì lỗi phải chờ tới khi nào tới đoạn gán giá trị mới được dùng
2. Vì sao `f(); var f = function(){}` cho TypeError chứ không phải ReferenceError? -> khai báo var mà truy cập trước thì trả về undefine mà gọi undefine() thì typeError còn ReferenceError chỉ xảy ra khi khai báo let/ const, class mà truy cập trước thôi
3. Lexical scope nghĩa là gì? Cho một ví dụ tự nghĩ. -> scope được quyết định bởi hàm được viết ở đâu chứ không phải nơi hàm được chạy? như ví dụ của bạn thôi
4. Kể 3 khác biệt giữa arrow function và function thường.
this, argument, new, prototype, hoisting

Bốn câu này là câu hỏi phỏng vấn thật. Tập viết ra giấy trước, sau này tập nói.

---

## Xong file này khi

- [ ] 6 đoạn ở bài 1 đều sửa chạy đúng, có ghi rõ nguyên nhân
- [ ] Bài 2 có phần đoán viết trước khi chạy
- [ ] 5 hàm ở bài 3 chạy đúng với mọi trường hợp test
- [ ] Bài 4 chạy đúng
- [ ] Trả lời được 4 câu ở bài 5 mà không nhìn tài liệu

Xong thì gửi mình `main.js` + `du-doan.md`, kèm **"viết file 03-mang-va-object"**.