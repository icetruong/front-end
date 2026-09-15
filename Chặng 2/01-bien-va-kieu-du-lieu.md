# 01 — Biến và kiểu dữ liệu

> **Cần có trước:** đã làm xong bài tập file `00`.
> **Thời gian:** 3–4 giờ (đọc + làm bài tập).
> **Vì sao file này quan trọng:** đây là gốc rễ. Phần "tham trị và tham chiếu" ở mục 5 là nguyên nhân của một tỷ lệ lớn bug mà người mới không hiểu nổi, và cũng là nền cho toàn bộ chuyện "state phải bất biến" ở React sau này.

---

## 1. Biến là gì

Biến là một cái tên gắn với một giá trị. Bạn đặt tên để dùng lại, thay vì viết giá trị ra khắp nơi.

```javascript
let diem = 8;
console.log(diem);   // 8

diem = 9;            // gán lại
console.log(diem);   // 9
```

Có ba từ khóa khai báo biến trong JavaScript: `let`, `const`, `var`.

---

## 2. `let`, `const`, `var`

### 2.1. Bảng so sánh

| | `var` | `let` | `const` |
|---|---|---|---|
| Phạm vi | Hàm (function scope) | Khối (block scope) | Khối (block scope) |
| Gán lại được không | Được | Được | **Không** |
| Khai báo trùng tên | Được | Lỗi | Lỗi |
| Dùng trước khi khai báo | Ra `undefined` | **Lỗi** (TDZ) | **Lỗi** (TDZ) |

### 2.2. Block scope nghĩa là gì

"Khối" là bất cứ thứ gì nằm trong cặp `{ }`: thân `if`, thân `for`, thân hàm, hoặc một khối đứng riêng.

```javascript
if (true) {
  var a = 1;
  let b = 2;
}

console.log(a);   // 1  — var thoát ra được khỏi khối
console.log(b);   // ReferenceError: b is not defined
```

`var` không quan tâm đến `{ }` của `if`, nó chỉ bị chặn bởi ranh giới của hàm. `let` và `const` thì bị nhốt trong khối.

Ví dụ kinh điển cho thấy điều này gây rắc rối:

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100);
}
// In ra: 3, 3, 3

for (let j = 0; j < 3; j++) {
  setTimeout(function () {
    console.log(j);
  }, 100);
}
// In ra: 0, 1, 2
```

Với `var` chỉ có **một** biến `i` duy nhất tồn tại; đến khi `setTimeout` chạy thì vòng lặp đã kết thúc và `i` đã là `3`. Với `let`, mỗi vòng lặp tạo ra một biến `j` mới riêng biệt.

Bạn chưa cần hiểu hết cơ chế lúc này — nó sẽ được mổ xẻ ở file `05-closure`. Giờ chỉ cần ghi nhận: **`let` cư xử đúng như trực giác, `var` thì không.**

### 2.3. Dùng trước khi khai báo

```javascript
console.log(x);   // undefined  — kỳ lạ, nhưng không lỗi
var x = 5;

console.log(y);   // ReferenceError: Cannot access 'y' before initialization
let y = 5;
```

`var` được "kéo lên đầu" và tự gán `undefined` — hành vi này gọi là **hoisting**. `let`/`const` cũng được kéo lên, nhưng nằm trong vùng cấm gọi là **TDZ** (Temporal Dead Zone) cho đến dòng khai báo, chạm vào là lỗi ngay.

Lỗi ngay tốt hơn `undefined` âm thầm. Chi tiết ở file `02`.

### 2.4. `const` không có nghĩa là "bất biến"

Đây là hiểu lầm phổ biến nhất về `const`.

```javascript
const n = 1;
n = 2;              // TypeError: Assignment to constant variable

const arr = [1, 2, 3];
arr.push(4);        // Hoàn toàn hợp lệ
console.log(arr);   // [1, 2, 3, 4]

arr = [9];          // TypeError — cái này mới bị cấm
```

`const` khóa **liên kết giữa tên biến và giá trị**, không khóa nội dung bên trong giá trị đó. Với object và mảng, nội dung vẫn sửa được thoải mái.

Muốn khóa nội dung thật thì dùng `Object.freeze` — nhưng lưu ý nó chỉ đóng băng **một tầng**:

```javascript
const user = Object.freeze({
  ten: "An",
  diaChi: { thanhPho: "HCM" }
});

user.ten = "Bình";                  // không có tác dụng (im lặng, hoặc lỗi ở strict mode)
user.diaChi.thanhPho = "Hà Nội";    // vẫn đổi được! vì tầng trong không bị freeze
console.log(user.diaChi.thanhPho);  // "Hà Nội"
```

### 2.5. Quy tắc thực dụng

**Mặc định dùng `const`. Chỉ đổi sang `let` khi bạn thực sự cần gán lại. Không bao giờ dùng `var`.**

Lý do không phải vì `const` "an toàn hơn" theo nghĩa mơ hồ, mà vì khi đọc code, thấy `const` là biết ngay biến này không bị đổi ở đâu đó phía dưới — bớt được một thứ phải theo dõi trong đầu.

`var` chỉ còn tồn tại vì lý do tương thích ngược. Bạn sẽ gặp nó khi đọc code cũ, nên cần **hiểu** nó, nhưng đừng **viết** nó.

---

## 3. Bảy kiểu nguyên thủy

JavaScript có 7 kiểu **primitive** (nguyên thủy) và 1 kiểu **object**.

| Kiểu | Ví dụ | `typeof` trả về |
|---|---|---|
| `string` | `"An"`, `'An'`, `` `An` `` | `"string"` |
| `number` | `42`, `3.14`, `-0`, `Infinity`, `NaN` | `"number"` |
| `boolean` | `true`, `false` | `"boolean"` |
| `undefined` | `undefined` | `"undefined"` |
| `null` | `null` | **`"object"`** ← bug lịch sử |
| `symbol` | `Symbol("id")` | `"symbol"` |
| `bigint` | `9007199254740993n` | `"bigint"` |

Mọi thứ còn lại — object, mảng, hàm, `Date`, `Map`... — đều là **object**.

```javascript
typeof {}            // "object"
typeof []            // "object"   ← mảng cũng là object
typeof function(){}  // "function" ← ngoại lệ tiện lợi, nhưng hàm vẫn là object
typeof null          // "object"   ← SAI, nhưng không sửa được nữa
```

`typeof null === "object"` là một lỗi từ phiên bản JavaScript đầu tiên năm 1995. Sửa nó sẽ làm hỏng vô số website đang chạy, nên nó được giữ nguyên vĩnh viễn. Cần nhớ, vì đây là câu hỏi phỏng vấn quen thuộc.

Muốn kiểm tra mảng, dùng:

```javascript
Array.isArray([]);    // true
Array.isArray({});    // false
```

### 3.1. `null` và `undefined` khác nhau chỗ nào

Cả hai đều nghĩa là "không có giá trị", nhưng khác nhau ở **ai gây ra**:

- `undefined` — **JavaScript** nói: chỗ này chưa có gì. Biến khai báo mà chưa gán, thuộc tính object không tồn tại, hàm không `return`, tham số không truyền.
- `null` — **lập trình viên** nói: chỗ này cố ý để trống.

```javascript
let a;
console.log(a);              // undefined — máy tự gán

let b = null;
console.log(b);              // null — mình chủ động gán

const user = { ten: "An" };
console.log(user.tuoi);      // undefined — thuộc tính không tồn tại

function f() {}
console.log(f());            // undefined — không return gì
```

Quy tắc dùng: khi bạn muốn diễn đạt "chưa chọn", "đã xóa", "không có" một cách có chủ ý, hãy gán `null`. Để `undefined` cho hệ thống.

### 3.2. Vài điều về `number`

JavaScript chỉ có **một** kiểu số duy nhất, là số thực dấu phẩy động 64-bit (chuẩn IEEE-754). Không có `int` riêng.

Hệ quả nổi tiếng nhất:

```javascript
0.1 + 0.2              // 0.30000000000000004
0.1 + 0.2 === 0.3      // false
```

Đây **không phải bug của JavaScript**. Mọi ngôn ngữ dùng số thực nhị phân đều thế (Python, Java, C đều vậy). Nguyên nhân: `0.1` không biểu diễn chính xác được ở hệ nhị phân, giống như `1/3` không viết hết được ở hệ thập phân.

Cách xử lý khi cần so sánh số thực:

```javascript
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;   // true
```

Với tiền tệ, quy tắc trong nghề là **lưu bằng đơn vị nhỏ nhất dạng số nguyên** — lưu 150000 (đồng) chứ đừng lưu 1500.00.

`NaN` (Not a Number) là giá trị đặc biệt, xuất hiện khi một phép toán số thất bại:

```javascript
Number("abc")     // NaN
0 / 0             // NaN
Math.sqrt(-1)     // NaN

typeof NaN        // "number"  ← nó là kiểu number
NaN === NaN       // false     ← nó không bằng chính nó
```

`NaN` là giá trị duy nhất trong JavaScript không bằng chính nó. Nên muốn kiểm tra:

```javascript
Number.isNaN(NaN);        // true
Number.isNaN("abc");      // false — "abc" đâu phải NaN, nó là chuỗi

isNaN("abc");             // true  — hàm cũ, ép kiểu trước rồi mới kiểm tra
```

**Luôn dùng `Number.isNaN`, đừng dùng `isNaN` trần.** Hàm cũ ép kiểu tham số trước khi kiểm tra nên cho kết quả gây hiểu nhầm.

### 3.3. Chuỗi và template literal

Ba cách viết chuỗi, nhưng dấu backtick là loại bạn nên dùng khi cần ghép:

```javascript
const ten = "An";
const tuoi = 22;

// Cách cũ, khó đọc
const s1 = "Tôi là " + ten + ", " + tuoi + " tuổi.";

// Template literal — dùng cái này
const s2 = `Tôi là ${ten}, ${tuoi} tuổi.`;

// Xuống dòng tự nhiên, không cần \n
const s3 = `Dòng một
Dòng hai`;

// Trong ${} có thể đặt bất kỳ biểu thức nào
const s4 = `Sang năm ${ten} ${tuoi + 1} tuổi`;
```

Chuỗi trong JavaScript là **bất biến**. Không sửa được từng ký tự:

```javascript
let s = "abc";
s[0] = "X";
console.log(s);   // "abc" — không đổi, và cũng không báo lỗi

s = "Xbc";        // muốn đổi thì tạo chuỗi mới
```

---

## 4. Kiểm tra kiểu

```javascript
typeof "An"          // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof null          // "object"     ← nhớ
typeof {}            // "object"
typeof []            // "object"
typeof function(){}  // "function"
typeof Symbol()      // "symbol"
typeof 10n           // "bigint"
```

Vì `typeof` không phân biệt được `null`, mảng và object, trong thực tế bạn kiểm tra thế này:

```javascript
// Có phải mảng không
Array.isArray(x);

// Có phải object thuần không (không phải null, không phải mảng)
typeof x === "object" && x !== null && !Array.isArray(x);

// Có phải null không
x === null;
```

---

## 5. Tham trị và tham chiếu

**Đây là mục quan trọng nhất của file này.** Đọc chậm.

### 5.1. Primitive được sao chép theo giá trị

```javascript
let a = 10;
let b = a;      // b nhận một BẢN SAO của giá trị 10

b = 20;

console.log(a); // 10  — a không bị ảnh hưởng
console.log(b); // 20
```

`a` và `b` là hai ô nhớ độc lập. Đổi cái này không đụng cái kia.

### 5.2. Object được sao chép theo tham chiếu

```javascript
let x = { ten: "An" };
let y = x;          // y KHÔNG nhận bản sao của object
                    // y nhận địa chỉ trỏ tới CÙNG một object

y.ten = "Bình";

console.log(x.ten); // "Bình"  ← x cũng đổi theo!
console.log(y.ten); // "Bình"
console.log(x === y); // true — cùng trỏ vào một object
```

Hình dung: object nằm ở một chỗ trong bộ nhớ. `x` và `y` chỉ là hai tờ giấy cùng ghi một địa chỉ nhà. Sửa nhà qua tờ giấy nào thì cũng là sửa cùng một căn nhà.

### 5.3. So sánh object

```javascript
{ a: 1 } === { a: 1 }     // false
[1, 2]   === [1, 2]       // false

const p = { a: 1 };
const q = p;
p === q                    // true
```

Hai object trông giống hệt nhau vẫn khác nhau, vì `===` với object so sánh **địa chỉ**, không so sánh nội dung. Đây là lý do bạn không thể kiểm tra hai object "bằng nhau" bằng `===`.

### 5.4. Cái bẫy trong thực tế

```javascript
const goc = { ten: "An", diem: 8 };

function tangDiem(user) {
  user.diem = user.diem + 1;   // sửa trực tiếp object được truyền vào
  return user;
}

const moi = tangDiem(goc);

console.log(goc.diem);   // 9  ← object gốc bị sửa!
console.log(moi === goc); // true — không hề tạo ra object mới
```

Hàm này trông như "trả về một user mới", nhưng thực ra nó phá hủy dữ liệu gốc. Trong một ứng dụng nhỏ, bạn sẽ mất hàng giờ tìm xem "ai đã đổi dữ liệu của tôi".

Cách viết đúng — tạo object mới:

```javascript
function tangDiem(user) {
  return { ...user, diem: user.diem + 1 };
}

const moi = tangDiem(goc);
console.log(goc.diem);    // 8  ← nguyên vẹn
console.log(moi.diem);    // 9
```

Nguyên tắc này gọi là **immutability** (bất biến). Nó không chỉ là thói quen tốt — React dựa hoàn toàn vào nó để biết khi nào cần render lại. Ở chặng 4 bạn sẽ gặp lại nguyên tắc này mỗi ngày.

### 5.5. Sao chép nông và sao chép sâu

Cả `...` (spread) lẫn `Object.assign` đều chỉ sao chép **một tầng**:

```javascript
const goc = {
  ten: "An",
  diaChi: { thanhPho: "HCM" }
};

const ban = { ...goc };

ban.ten = "Bình";
console.log(goc.ten);              // "An"     ← tầng 1 độc lập, ổn

ban.diaChi.thanhPho = "Hà Nội";
console.log(goc.diaChi.thanhPho);  // "Hà Nội" ← tầng 2 vẫn dùng chung!
```

Ba cách sao chép sâu, xếp theo thứ tự nên dùng:

```javascript
// 1. structuredClone — chuẩn của trình duyệt hiện đại, nên dùng
const sau1 = structuredClone(goc);

// 2. JSON — cách cũ, có giới hạn
const sau2 = JSON.parse(JSON.stringify(goc));

// 3. lodash cloneDeep — khi dự án đã có sẵn lodash
```

Cách JSON có những giới hạn cần biết: nó **làm mất** hàm, `undefined`, `Symbol`; **đổi** `Date` thành chuỗi; và **báo lỗi** nếu object tự tham chiếu vòng tròn. Với dữ liệu thuần từ API thì dùng được, ngoài ra thì nên tránh.

---

## 6. Ép kiểu

JavaScript tự động chuyển đổi kiểu trong rất nhiều tình huống. Hiểu quy tắc thì đây là tiện lợi, không hiểu thì đây là nguồn bug.

### 6.1. Ép sang chuỗi

Toán tử `+` mà có **một** vế là chuỗi thì kết quả là **ghép chuỗi**:

```javascript
"5" + 3        // "53"     — 3 bị biến thành "3"
5 + "3"        // "53"
"5" + true     // "5true"
"5" + null     // "5null"
"5" + undefined // "5undefined"
1 + 2 + "3"    // "33"     — tính trái sang phải: (1+2)=3, rồi 3+"3"="33"
"1" + 2 + 3    // "123"    — ("1"+2)="12", rồi "12"+3="123"
```

Ép tường minh:

```javascript
String(123)     // "123"
String(null)    // "null"
(123).toString() // "123"
```

### 6.2. Ép sang số

Mọi toán tử số học **khác** `+` đều ép cả hai vế thành số:

```javascript
"5" - 3        // 2
"5" * "2"      // 10
"10" / "2"     // 5
true + 1       // 2      — true thành 1
false + 1      // 1      — false thành 0
null + 1       // 1      — null thành 0
undefined + 1  // NaN    — undefined thành NaN
```

Bảng ép sang số cần thuộc:

| Giá trị | `Number(...)` |
|---|---|
| `"123"` | `123` |
| `"12.5"` | `12.5` |
| `""` | **`0`** |
| `"   "` | **`0`** |
| `"12abc"` | `NaN` |
| `true` / `false` | `1` / `0` |
| `null` | **`0`** |
| `undefined` | **`NaN`** |
| `[]` | **`0`** |
| `[5]` | `5` |
| `[1, 2]` | `NaN` |
| `{}` | `NaN` |

`Number("")` ra `0` và `Number(null)` ra `0` là hai chỗ hay bị sai nhất.

Phân biệt `Number` và `parseInt`:

```javascript
Number("12abc")     // NaN   — phải chuyển được TOÀN BỘ chuỗi
parseInt("12abc")   // 12    — đọc từ trái, gặp ký tự lạ thì dừng
parseInt("abc12")   // NaN   — ngay ký tự đầu đã lạ
parseFloat("12.5m") // 12.5

Number("")          // 0
parseInt("")        // NaN
```

Luôn truyền cơ số cho `parseInt` để tránh bất ngờ: `parseInt("08", 10)`.

### 6.3. Ép sang boolean

Có đúng **8 giá trị falsy** trong JavaScript. Thuộc lòng danh sách này:

```
false
0
-0
0n        (bigint không)
""        (chuỗi rỗng)
null
undefined
NaN
```

**Mọi thứ khác đều truthy.** Kể cả những thứ trông như "rỗng":

```javascript
Boolean([])          // true   ← mảng rỗng là TRUTHY
Boolean({})          // true   ← object rỗng là TRUTHY
Boolean("0")         // true   ← chuỗi "0" là TRUTHY
Boolean("false")     // true   ← chuỗi "false" là TRUTHY
Boolean(" ")         // true   ← chuỗi một dấu cách là TRUTHY
Boolean(-1)          // true
Boolean(Infinity)    // true
```

Mảng rỗng là truthy nhưng `Number([])` là `0` — nghịch lý này gây ra kết quả sau:

```javascript
if ([]) {
  console.log("chạy");    // có chạy
}

[] == false               // true  ← nhưng lại "bằng" false
```

Không mâu thuẫn, chỉ là hai cơ chế khác nhau: `if` dùng ép **boolean**, còn `==` với `false` thì ép cả hai vế về **số**.

Muốn kiểm tra mảng rỗng, dùng `arr.length === 0`, đừng dùng `if (!arr)`.

---

## 7. `==` và `===`

`===` so sánh **không ép kiểu**: khác kiểu là `false` ngay.

`==` cho phép ép kiểu trước khi so sánh, theo một bộ quy tắc dài và không trực giác.

```javascript
1 === "1"     // false
1 == "1"      // true   — "1" được ép thành 1

0 === false   // false
0 == false    // true

"" == false   // true
[] == false   // true
null == undefined  // true
null === undefined // false
```

Vài quy tắc của `==` cần biết:

```javascript
null == undefined     // true  — trường hợp đặc biệt, được định nghĩa riêng
null == 0             // false ← null KHÔNG được ép sang số ở đây
null == false         // false
undefined == 0        // false

NaN == NaN            // false — NaN không bằng gì cả, kể cả ==
```

`null == 0` ra `false` trong khi `Number(null)` ra `0` — đây là ngoại lệ được ghi cứng trong đặc tả ngôn ngữ. `null` chỉ `==` với `undefined` và với chính nó, không với gì khác.

### Quy tắc dùng

**Luôn dùng `===`.** Ngoại lệ duy nhất được chấp nhận rộng rãi:

```javascript
if (x == null) {
  // đúng khi x là null HOẶC undefined
}
```

Đây là cách viết gọn để bắt cả hai trường hợp "không có giá trị" cùng lúc.

---

## 8. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Sửa biến này, biến kia đổi theo | Hai biến cùng trỏ vào một object | Tạo bản sao bằng `{...obj}` hoặc `structuredClone` |
| Cộng hai số ra chuỗi dính nhau | Một vế là chuỗi (thường từ `input.value`) | `Number(input.value)` trước khi cộng |
| `if (x)` không chạy dù `x` là `0` | `0` là falsy | Dùng `if (x !== undefined)` hoặc `if (x != null)` |
| `if (!arr)` không bắt được mảng rỗng | Mảng rỗng là truthy | `if (arr.length === 0)` |
| So sánh hai object luôn ra `false` | `===` so địa chỉ, không so nội dung | So từng thuộc tính, hoặc `JSON.stringify` với dữ liệu đơn giản |
| `const` mà vẫn sửa được mảng | `const` khóa liên kết, không khóa nội dung | Đây là hành vi đúng, không phải bug |
| `TypeError: Cannot read properties of undefined` | Truy cập thuộc tính của `undefined` | Dùng `?.` — sẽ học ở file `03` |

---

## 9. Tóm tắt cần thuộc

1. Mặc định `const`, cần đổi thì `let`, không bao giờ `var`
2. `const` khóa liên kết, không khóa nội dung object
3. 7 primitive: string, number, boolean, undefined, null, symbol, bigint. Còn lại là object
4. `typeof null === "object"` — bug lịch sử
5. Primitive sao chép theo **giá trị**, object sao chép theo **tham chiếu**
6. Spread `{...obj}` chỉ sao chép **một tầng**
7. 8 giá trị falsy: `false 0 -0 0n "" null undefined NaN`. Mảng rỗng và object rỗng là **truthy**
8. `NaN !== NaN`. Kiểm tra bằng `Number.isNaN`
9. `Number("")` là `0`, `Number(undefined)` là `NaN`
10. Luôn dùng `===`, trừ `x == null`

---

## Bài tập

Tạo thư mục `bai-tap-01/` với `index.html` và `main.js`.

### Bài 1 — Đoán trước, chạy sau (bài chính)

Tạo file `bai-tap-01/du-doan.md`. Với **từng** biểu thức dưới đây:

1. Viết ra kết quả bạn **đoán**
2. Chạy trong Console để lấy kết quả **thật**
3. Nếu đoán sai, viết một câu giải thích vì sao

```javascript
1.  "5" + 3 -> "53"
2.  "5" - 3 -> 2
3.  1 + 2 + "3" -> "123"   // SAI — thật ra là "33". Tính trái sang phải: 1+2 là số cộng số = 3 (chưa gặp chuỗi nên vẫn cộng số), rồi 3 + "3" mới ép chuỗi = "33". Bạn đang nhầm với câu 4.
4.  "1" + 2 + 3 -> "123"
5.  true + true -> 2
6.  null + 1 -> 1
7.  undefined + 1 -> 1   // SAI — thật ra là NaN. undefined không có quy tắc ép về 0 như null; nó ép thành NaN, và NaN cộng gì cũng ra NaN. Bạn đang lẫn với dòng 6 (null + 1 = 1, vì null mới ép về 0).
8.  "5" * "2" ->10
9.  0.1 + 0.2 === 0.3 -> false
10. NaN === NaN -> false
11. typeof NaN -> number
12. typeof null -> object
13. typeof [] -> object
14. [] + [] -> 0   // SAI — thật ra là "" (chuỗi rỗng). Toán tử + với object/mảng sẽ gọi .toString() trước: [].toString() là "", nên phép tính thành "" + "" = "". Không liên quan gì đến Number([]) = 0 cả — đó là quy tắc ép kiểu khác (ép sang số), còn đây đang ép sang chuỗi vì cả hai vế đều không phải số.
15. Boolean("0") -> true
16. Boolean([]) -> true
17. [] == false -> false ( tôi skip ==)   // SAI — thật ra là true. Với ==, cả hai vế đều bị ép về số: Number([]) = 0 và Number(false) = 0, nên 0 == 0 → true. (Bạn ghi "skip ==" nhưng đã điền đáp án rồi nên vẫn tính là câu trả lời — và câu này khác câu 16, ở đó Boolean([]) là true vì if/Boolean ép trực tiếp sang boolean, còn == lại ép sang số trước, hai cơ chế khác nhau như mục 6.3 của file đã nói.)
18. null == undefined -> false ( tôi skip ==)   // SAI — thật ra là true. Đây là trường hợp đặc biệt được định nghĩa cứng trong spec: null chỉ == với undefined và với chính nó, không theo quy tắc ép số thông thường.
19. null == 0 -> false ( tôi skip ==)
20. Number("") -> 0
21. Number(" ") -> 0
22. Number("12abc") -> NaN
23. parseInt("12abc") -> 12
24. { a: 1 } === { a: 1 } -> false
25. "abc" < "abd" -> true
```

Đoán sai không sao — sai chỗ nào chính là chỗ mô hình trong đầu bạn đang lệch, và đó là thứ có giá trị nhất trong bài này. **Đừng chạy trước rồi mới điền phần "đoán".** Tự lừa mình thì không học được gì.

### Bài 2 — Tham chiếu

Trong `main.js`, dự đoán output của từng `console.log` **trước khi chạy**, ghi vào `du-doan.md`:

```javascript
const a = { x: 1 };
const b = a;
const c = { x: 1 };

b.x = 99;

console.log(a.x);      // ? -> 99
console.log(c.x);      // ? -> 99 hay 1
console.log(a === b);  // ? -> true
console.log(a === c);  // ? -> false

const arr1 = [1, 2, 3];
const arr2 = arr1;
const arr3 = [...arr1];

arr2.push(4);

console.log(arr1);     // ? 1 2 3 4
console.log(arr3);     // ? 1 2 3
```

### Bài 3 — Sửa hàm phá dữ liệu

Hàm này đang sửa trực tiếp object gốc. Viết lại để nó trả về object mới mà không đụng vào `sanPham`:

```javascript
const sanPham = {
  ten: "Bàn phím",
  gia: 500000,
  thongTin: { baoHanh: 12, mau: "đen" }
};

function giamGia(sp, phanTram) {
  sp.gia = sp.gia * (1 - phanTram / 100);
  return sp;
}
```

Sau khi sửa xong, viết code chứng minh:
- `sanPham.gia` vẫn là `500000`
- Object trả về có giá đúng
- **Sửa `thongTin.mau` của object mới không làm đổi `thongTin.mau` của object gốc** ← đây mới là phần khó, spread một tầng không đủ

### Bài 4 — Hàm kiểm tra rỗng

Viết hàm `laRong(giaTri)` trả về `true` khi giá trị được coi là "rỗng":

- `null`, `undefined` → `true`
- Chuỗi rỗng hoặc chỉ toàn dấu cách → `true`
- Mảng không phần tử → `true`
- Object không thuộc tính → `true`
- `0`, `false`, `NaN` → **`false`** (chúng là giá trị hợp lệ, không phải rỗng)

Test đủ 12 trường hợp và in kết quả ra Console.

Gợi ý: bài này bắt bạn dùng đúng lúc `typeof`, `Array.isArray`, `x == null`, `.trim()`, `Object.keys()`. Nếu bạn thấy mình đang viết `if (!giaTri)` thì dừng lại đọc lại mục 6.3.

### Bài 5 — Chuyển đổi dữ liệu form

Giả sử form trả về dữ liệu toàn chuỗi:

```javascript
const duLieuForm = {
  ten: "  An  ",
  tuoi: "22",
  diem: "8.5",
  daKichHoat: "false",
  soDienThoai: ""
};
```

Viết hàm chuyển thành object đúng kiểu:

```javascript
{
  ten: "An",              // đã trim
  tuoi: 22,               // number
  diem: 8.5,              // number
  daKichHoat: false,      // boolean — chú ý: Boolean("false") là true!
  soDienThoai: null       // chuỗi rỗng chuyển thành null
}
```

Bài này mô phỏng đúng thứ bạn sẽ làm hàng ngày khi đi làm. Cái bẫy `Boolean("false")` là bẫy thật, không phải bẫy học thuật.

---

## Xong file này khi

- [ ] Có `du-doan.md` với đủ 25 biểu thức, phần "đoán" viết trước khi chạy
- [ ] Bài 2–5 chạy được, không lỗi Console
- [ ] Đọc thuộc 8 giá trị falsy mà không nhìn tài liệu
- [ ] Giải thích được bằng lời: vì sao `const arr = []` rồi `arr.push(1)` không lỗi
- [ ] Giải thích được bằng lời: vì sao `{a:1} === {a:1}` là `false`

Xong thì gửi mình `du-doan.md` + `main.js` để review, kèm câu **"viết file 02-ham-va-scope"**.