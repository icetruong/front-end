# 03 — Mảng và Object

> **Cần có trước:** xong `01` và `02`.
> **Thời gian:** 3–4 giờ.
> **Vì sao quan trọng:** dữ liệu thật từ API luôn là object lồng mảng lồng object. Cú pháp trong file này — destructuring, spread, `?.` — là thứ bạn gõ nhiều nhất mỗi ngày khi đi làm. Không phải kiến thức hàn lâm, mà là công cụ dùng liên tục.

---

## 1. Object

### 1.1. Tạo và truy cập

```javascript
const user = {
  ten: "An",
  tuoi: 22,
  "so dien thoai": "0900000000",   // key có dấu cách phải để trong nháy
  diaChi: {
    thanhPho: "HCM",
    quan: 1
  },
  soThich: ["đọc sách", "code"]
};

// Hai cách truy cập
user.ten                    // "An"          — dấu chấm
user["ten"]                 // "An"          — ngoặc vuông
user["so dien thoai"]       // bắt buộc ngoặc vuông vì key có dấu cách

// Lồng nhau
user.diaChi.thanhPho        // "HCM"
user.soThich[0]             // "đọc sách"
```

Khi nào dùng ngoặc vuông:

```javascript
// 1. Key có ký tự đặc biệt hoặc bắt đầu bằng số
user["so dien thoai"]

// 2. Key nằm trong biến — đây là trường hợp hay gặp nhất
const truong = "tuoi";
user[truong]                // 22
user.truong                 // undefined — tìm key tên là "truong", không có
```

Khác biệt ở ví dụ 2 là chỗ người mới hay sai. `user.truong` tìm key tên đúng là `"truong"`. `user[truong]` lấy **giá trị** của biến `truong` làm key.

### 1.2. Thêm, sửa, xóa

```javascript
const o = { a: 1 };

o.b = 2;              // thêm
o.a = 99;             // sửa
delete o.a;           // xóa hẳn key

console.log(o);       // { b: 2 }

// Khác với gán undefined
const p = { a: 1 };
p.a = undefined;
console.log(p);            // { a: undefined } — key vẫn còn
console.log("a" in p);     // true
```

`delete` gỡ hẳn key. Gán `undefined` thì key vẫn tồn tại với giá trị `undefined`. Khác biệt này lộ ra khi bạn đếm key hoặc gửi dữ liệu lên server.

### 1.3. Kiểm tra key tồn tại

```javascript
const o = { a: 1, b: undefined };

o.a !== undefined       // true
o.b !== undefined       // false — nhưng key b CÓ tồn tại!

"a" in o                // true
"b" in o                // true   ← chính xác hơn
"c" in o                // false

Object.hasOwn(o, "b")   // true   ← cách hiện đại, nên dùng
o.hasOwnProperty("b")   // true   ← cách cũ
```

Khác nhau giữa `in` và `hasOwn`: `in` cũng tìm cả trong chuỗi prototype, `hasOwn` chỉ tìm thuộc tính của chính object đó.

```javascript
"toString" in {}              // true  — kế thừa từ Object.prototype
Object.hasOwn({}, "toString") // false
```

Chuỗi prototype là nội dung file `07`. Giờ chỉ cần nhớ: **muốn kiểm tra key của chính object thì dùng `Object.hasOwn`.**

### 1.4. Cú pháp rút gọn và key động

```javascript
const ten = "An";
const tuoi = 22;

// Rút gọn khi tên biến trùng tên key
const user = { ten, tuoi };
// tương đương { ten: ten, tuoi: tuoi }

// Key động — computed property name
const truong = "email";
const o = {
  [truong]: "an@example.com",
  [`${truong}Phu`]: "an2@example.com"
};
console.log(o);   // { email: "...", emailPhu: "..." }
```

Key động rất hữu ích khi xây object từ dữ liệu chạy được:

```javascript
function taoLoi(truong, thongBao) {
  return { [truong]: thongBao };
}
taoLoi("email", "Email không hợp lệ");   // { email: "Email không hợp lệ" }
```

### 1.5. Duyệt object

```javascript
const diem = { toan: 8, ly: 7, hoa: 9 };

Object.keys(diem);      // ["toan", "ly", "hoa"]
Object.values(diem);    // [8, 7, 9]
Object.entries(diem);   // [["toan", 8], ["ly", 7], ["hoa", 9]]

// Duyệt bằng for...of với entries — cách nên dùng
for (const [mon, so] of Object.entries(diem)) {
  console.log(`${mon}: ${so}`);
}

// Duyệt bằng for...in — cách cũ, duyệt cả prototype
for (const key in diem) {
  console.log(key, diem[key]);
}
```

Ba hàm `Object.keys/values/entries` trả về **mảng**, nghĩa là bạn dùng được `map`, `filter`, `reduce` trên chúng. Đây là cầu nối quan trọng giữa object và mảng, dùng rất nhiều ở file `04`.

```javascript
// Lọc môn trên 7.5 điểm
const gioi = Object.entries(diem).filter(([mon, so]) => so > 7.5);
console.log(gioi);   // [["toan", 8], ["hoa", 9]]

// Chuyển mảng entries ngược lại thành object
Object.fromEntries(gioi);   // { toan: 8, hoa: 9 }
```

Cặp `Object.entries` → biến đổi → `Object.fromEntries` là mẫu code bạn sẽ dùng thường xuyên.

---

## 2. Mảng

Mảng trong JavaScript là object có key là số. Nên `typeof [] === "object"`, và kiểm tra bằng `Array.isArray`.

### 2.1. Cơ bản

```javascript
const arr = ["a", "b", "c"];

arr[0]              // "a"
arr[arr.length - 1] // "c"  — phần tử cuối
arr.at(-1)          // "c"  — cách hiện đại, gọn hơn
arr.at(-2)          // "b"

arr.length          // 3
arr[10]             // undefined — không lỗi, chỉ là không có

// Gán ngoài phạm vi tạo "lỗ hổng"
arr[5] = "f";
console.log(arr);        // ["a","b","c", <2 empty items>, "f"]
console.log(arr.length); // 6
```

Mảng có lỗ hổng là dấu hiệu code có vấn đề. Tránh gán bằng index vượt quá `length`.

### 2.2. Thêm và xóa

```javascript
const arr = [1, 2, 3];

// Sửa trực tiếp mảng gốc (mutating)
arr.push(4);        // thêm cuối    → [1,2,3,4], trả về length mới
arr.pop();          // xóa cuối     → [1,2,3],   trả về phần tử bị xóa
arr.unshift(0);     // thêm đầu     → [0,1,2,3]
arr.shift();        // xóa đầu      → [1,2,3]

// splice: xóa/chèn ở giữa — SỬA mảng gốc
const a = [1, 2, 3, 4, 5];
a.splice(1, 2);            // xóa 2 phần tử từ index 1 → a = [1, 4, 5]
a.splice(1, 0, 99);        // chèn 99 vào index 1      → a = [1, 99, 4, 5]

// slice: cắt ra mảng mới — KHÔNG sửa mảng gốc
const b = [1, 2, 3, 4, 5];
b.slice(1, 3);      // [2, 3]        — lấy từ index 1 đến TRƯỚC index 3
b.slice(2);         // [3, 4, 5]
b.slice(-2);        // [4, 5]
console.log(b);     // [1,2,3,4,5] — nguyên vẹn
```

**`splice` sửa mảng gốc, `slice` không.** Hai tên gần giống nhau nhưng hành vi đối lập — đây là chỗ nhầm kinh điển. Mẹo nhớ: `splice` có chữ `p` như "phá".

Muốn thêm/xóa mà không sửa mảng gốc, dùng spread (mục 4):

```javascript
const arr = [1, 2, 3];
const themCuoi = [...arr, 4];         // [1,2,3,4], arr nguyên vẹn
const themDau  = [0, ...arr];         // [0,1,2,3]
const boIndex1 = [...arr.slice(0,1), ...arr.slice(2)];  // [1,3]
```

Cách viết bất biến này là bắt buộc khi làm React ở chặng 4.

### 2.3. Tìm kiếm

```javascript
const arr = ["a", "b", "c", "b"];

arr.indexOf("b");        // 1     — vị trí đầu tiên, không có thì -1
arr.lastIndexOf("b");    // 3
arr.includes("b");       // true  — chỉ hỏi có hay không

// Với object thì indexOf/includes vô dụng vì so sánh tham chiếu
const users = [{ id: 1 }, { id: 2 }];
users.includes({ id: 1 });   // false! — object khác địa chỉ
users.find(u => u.id === 1); // { id: 1 } — dùng find, học kỹ ở file 04
```

---

## 3. Destructuring

Cú pháp rút giá trị ra khỏi object/mảng và gán vào biến. Đây là phần dùng nhiều nhất trong file này.

### 3.1. Destructuring object

```javascript
const user = { ten: "An", tuoi: 22, email: "an@x.com" };

// Cách cũ
const ten = user.ten;
const tuoi = user.tuoi;

// Destructuring
const { ten, tuoi } = user;
console.log(ten, tuoi);   // "An" 22
```

**Đổi tên biến:**

```javascript
const { ten: hoTen, tuoi: soTuoi } = user;
console.log(hoTen);   // "An"
console.log(ten);     // ReferenceError — biến `ten` không được tạo
```

**Giá trị mặc định:**

```javascript
const { ten, quocTich = "Việt Nam" } = user;
console.log(quocTich);   // "Việt Nam" — vì user.quocTich là undefined
```

Giống tham số mặc định ở file `02`: chỉ kích hoạt khi giá trị là `undefined`, không phải `null`.

```javascript
const o = { a: null };
const { a = 10 } = o;
console.log(a);   // null — KHÔNG phải 10
```

**Kết hợp đổi tên và mặc định:**

```javascript
const { quocTich: nuoc = "Việt Nam" } = user;
```

**Object lồng nhau:**

```javascript
const user = {
  ten: "An",
  diaChi: { thanhPho: "HCM", quan: 1 }
};

const { diaChi: { thanhPho } } = user;
console.log(thanhPho);   // "HCM"
console.log(diaChi);     // ReferenceError — diaChi KHÔNG được tạo ra

// Muốn có cả hai
const { diaChi, diaChi: { thanhPho } } = user;
```

Điểm dễ nhầm: khi bạn viết `{ diaChi: { thanhPho } }`, phần `diaChi:` chỉ là **đường đi**, không tạo biến. Chỉ `thanhPho` được tạo.

Lồng sâu mà dữ liệu thiếu thì lỗi:

```javascript
const u = { ten: "An" };
const { diaChi: { thanhPho } } = u;   // TypeError: Cannot destructure property 'thanhPho' of undefined

// Cách an toàn: mặc định object rỗng
const { diaChi: { thanhPho } = {} } = u;
console.log(thanhPho);   // undefined — không lỗi
```

**Rest trong destructuring object:**

```javascript
const user = { id: 1, ten: "An", tuoi: 22, email: "an@x.com" };

const { id, ...thongTin } = user;
console.log(id);         // 1
console.log(thongTin);   // { ten: "An", tuoi: 22, email: "an@x.com" }
```

Mẫu này cực hữu dụng để **loại bỏ một trường** khỏi object mà không sửa object gốc:

```javascript
// Bỏ matKhau trước khi gửi về client
const { matKhau, ...duLieuAnToan } = user;
```

### 3.2. Destructuring trong tham số hàm

Đây là nơi destructuring có giá trị nhất, và bạn sẽ thấy nó khắp nơi trong React.

```javascript
// Không destructuring
function hienThi(user) {
  console.log(user.ten, user.tuoi);
}

// Có destructuring
function hienThi({ ten, tuoi }) {
  console.log(ten, tuoi);
}

hienThi({ ten: "An", tuoi: 22 });
```

Kèm mặc định:

```javascript
function taoNut({ nhan = "Gửi", mau = "xanh", to = false } = {}) {
  console.log(nhan, mau, to);
}

taoNut();                        // "Gửi" "xanh" false
taoNut({ nhan: "Hủy" });         // "Hủy" "xanh" false
```

Phần `= {}` ở cuối rất quan trọng. Không có nó, gọi `taoNut()` sẽ ném TypeError vì không destructure được `undefined`.

### 3.3. Destructuring mảng

Khác object ở chỗ: lấy **theo vị trí**, không theo tên.

```javascript
const arr = ["a", "b", "c"];

const [x, y] = arr;
console.log(x, y);      // "a" "b"

// Bỏ qua phần tử bằng dấu phẩy trống
const [, , z] = arr;
console.log(z);         // "c"

// Mặc định
const [p, q, r, s = "mặc định"] = arr;
console.log(s);         // "mặc định"

// Rest
const [dau, ...conLai] = arr;
console.log(dau);       // "a"
console.log(conLai);    // ["b", "c"]

// Hoán đổi hai biến — không cần biến trung gian
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);      // 2 1

// Lồng nhau
const toaDo = [[1, 2], [3, 4]];
const [[x1, y1], [x2, y2]] = toaDo;
```

Destructuring mảng chạy được với **mọi iterable**, không chỉ mảng:

```javascript
const [c1, c2] = "abc";           // "a" "b"
const [m1] = new Set([10, 20]);   // 10
```

Ứng dụng hay gặp — duyệt entries:

```javascript
for (const [key, value] of Object.entries(diem)) { ... }
```

Và ở React:

```javascript
const [count, setCount] = useState(0);   // đây chính là destructuring mảng
```

---

## 4. Spread `...`

Cùng ký hiệu ba chấm với rest, nhưng ngược chiều: **rest gom lại, spread trải ra**.

Cách phân biệt: nằm ở **vế trái** phép gán hoặc trong danh sách tham số → rest. Nằm ở **vế phải** hoặc trong lời gọi hàm → spread.

### 4.1. Spread mảng

```javascript
const a = [1, 2];
const b = [3, 4];

[...a, ...b]            // [1, 2, 3, 4]
[0, ...a, 5]            // [0, 1, 2, 5]

// Sao chép mảng (một tầng)
const banSao = [...a];
banSao.push(99);
console.log(a);         // [1, 2] — nguyên vẹn

// Trải mảng thành đối số
Math.max(...[3, 7, 2]);      // 7
Math.max([3, 7, 2]);         // NaN — không trải thì sai

// Chuyển iterable thành mảng
[..."abc"]                        // ["a","b","c"]
[...new Set([1, 1, 2])]           // [1, 2]  — mẹo loại trùng
[...document.querySelectorAll("p")]  // NodeList → mảng thật
```

Mẹo loại phần tử trùng bằng `Set` rất hay dùng:

```javascript
const coTrung = [1, 2, 2, 3, 3, 3];
const khongTrung = [...new Set(coTrung)];   // [1, 2, 3]
```

### 4.2. Spread object

```javascript
const co = { a: 1, b: 2 };

const moi = { ...co, c: 3 };        // { a: 1, b: 2, c: 3 }

// Ghi đè: cái viết SAU thắng
const suaB = { ...co, b: 99 };      // { a: 1, b: 99 }
const khongSua = { b: 99, ...co };  // { b: 2, a: 1 }  ← co ghi đè lại!

// Gộp nhiều object
const gop = { ...mac_dinh, ...tuyChon, ...ghiDe };
```

Thứ tự quyết định kết quả. Quy tắc: **giá trị mặc định để trước, giá trị ưu tiên để sau.**

### 4.3. Nhắc lại: spread chỉ sao chép một tầng

```javascript
const goc = { ten: "An", diaChi: { thanhPho: "HCM" } };
const ban = { ...goc };

ban.ten = "Bình";
console.log(goc.ten);               // "An" — ổn

ban.diaChi.thanhPho = "Hà Nội";
console.log(goc.diaChi.thanhPho);   // "Hà Nội" — vẫn dùng chung tầng trong!
```

Muốn sửa dữ liệu lồng mà giữ nguyên gốc, phải trải từng tầng:

```javascript
const ban = {
  ...goc,
  diaChi: { ...goc.diaChi, thanhPho: "Hà Nội" }
};
```

Với mảng object thì kết hợp `map`:

```javascript
const state = {
  users: [{ id: 1, diem: 5 }, { id: 2, diem: 7 }]
};

const stateMoi = {
  ...state,
  users: state.users.map(u =>
    u.id === 1 ? { ...u, diem: 10 } : u
  )
};
```

Đoạn trên là mẫu cập nhật state điển hình trong React. Bạn sẽ viết nó rất nhiều ở chặng 4–5. Đọc kỹ và tự viết lại một lần.

---

## 5. Optional chaining `?.`

Giải quyết vấn đề truy cập thuộc tính lồng sâu mà dữ liệu có thể thiếu.

```javascript
const user = { ten: "An" };

user.diaChi.thanhPho     // TypeError: Cannot read properties of undefined
user?.diaChi?.thanhPho   // undefined — không lỗi
```

Cách hoạt động: nếu giá trị trước `?.` là `null` hoặc `undefined`, toàn bộ biểu thức dừng lại và trả về `undefined`. Chỉ `null`/`undefined` mới kích hoạt — `0`, `""`, `false` đều đi tiếp bình thường.

Ba dạng:

```javascript
obj?.thuocTinh        // truy cập thuộc tính
obj?.[bienKey]        // truy cập bằng ngoặc vuông
obj.ham?.()           // gọi hàm nếu nó tồn tại
arr?.[0]              // phần tử mảng
```

Dạng gọi hàm rất tiện với callback tùy chọn:

```javascript
function taoNut({ onClick }) {
  // Chỉ gọi nếu onClick được truyền vào
  onClick?.();
}
```

### Ngắn mạch

```javascript
const u = null;
u?.a.b.c        // undefined — KHÔNG lỗi
```

Nhìn thì tưởng `.b` sẽ nổ, nhưng không: khi `u?.` gặp `null`, **toàn bộ chuỗi còn lại bị bỏ qua**. Đây gọi là ngắn mạch (short-circuit).

### Đừng lạm dụng

```javascript
// Xấu — rải ?. khắp nơi
const x = user?.ten?.length;

// Tốt hơn — chỉ đặt ở chỗ THỰC SỰ có thể thiếu
const x = user?.ten.length;
```

Nếu bạn chắc chắn `user` có `ten`, đừng viết `?.` ở đó. Đặt `?.` bừa bãi che giấu bug: dữ liệu sai đáng lẽ phải nổ lỗi để bạn biết, thì lại âm thầm trả về `undefined` và gây lỗi khó tìm ở chỗ khác.

---

## 6. Nullish coalescing `??`

```javascript
a ?? b
```

Trả về `a` nếu `a` **không phải** `null`/`undefined`, ngược lại trả về `b`.

Khác `||` ở chỗ: `||` xét mọi giá trị falsy.

```javascript
0 || 10             // 10   ← 0 là falsy
0 ?? 10             // 0    ← 0 không phải null/undefined

"" || "mặc định"    // "mặc định"
"" ?? "mặc định"    // ""

false || true       // true
false ?? true       // false

null ?? "x"         // "x"
undefined ?? "x"    // "x"
```

Vì sao quan trọng — một bug thật:

```javascript
function hienThiSoLuong(soLuong) {
  const hienThi = soLuong || "Chưa có";
  console.log(hienThi);
}

hienThiSoLuong(0);    // "Chưa có" ← SAI, 0 là một số lượng hợp lệ!
```

Sửa:

```javascript
const hienThi = soLuong ?? "Chưa có";
hienThiSoLuong(0);    // 0 ← đúng
```

**Quy tắc:** dùng `??` khi giá trị `0`, `""`, `false` là hợp lệ. Dùng `||` khi bạn thực sự muốn bắt mọi giá trị "rỗng".

### Không trộn `??` với `||`/`&&`

```javascript
a ?? b || c        // SyntaxError
(a ?? b) || c      // OK
a ?? (b || c)      // OK
```

JavaScript bắt buộc bạn đặt ngoặc, vì thứ tự ưu tiên ở đây quá dễ gây hiểu nhầm.

### Kết hợp `?.` với `??`

Cặp đôi này đi cùng nhau rất thường xuyên:

```javascript
const thanhPho = user?.diaChi?.thanhPho ?? "Chưa cập nhật";
```

Một dòng thay cho cả khối `if` lồng nhau.

---

## 7. Toán tử gán logic

```javascript
a ||= b     // a = a || b   — gán nếu a falsy
a &&= b     // a = a && b   — gán nếu a truthy
a ??= b     // a = a ?? b   — gán nếu a là null/undefined
```

Dùng nhiều nhất là `??=` để đặt giá trị mặc định:

```javascript
const config = { theme: "dark" };
config.fontSize ??= 14;
config.theme ??= "light";      // không đổi, vì đã có
console.log(config);           // { theme: "dark", fontSize: 14 }
```

---

## 8. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Cannot read properties of undefined (reading 'x')` | Truy cập lồng sâu mà tầng giữa thiếu | Dùng `?.` ở đúng tầng có thể thiếu |
| `Cannot destructure property 'x' of undefined` | Destructure từ `undefined` | Thêm mặc định: `const { x } = obj ?? {}` |
| Hàm gọi không đối số thì nổ lỗi | Destructure tham số mà thiếu `= {}` | `function f({ a } = {}) {}` |
| Sửa bản sao thì bản gốc cũng đổi | Spread chỉ sao chép một tầng | Trải từng tầng, hoặc `structuredClone` |
| Gộp object mà giá trị không được ghi đè | Sai thứ tự spread | Giá trị ưu tiên đặt sau |
| `soLuong \|\| "trống"` cho sai khi `soLuong` là `0` | `\|\|` bắt mọi falsy | Đổi sang `??` |
| Xóa phần tử mảng mà mảng gốc bị đổi | `splice` sửa mảng gốc | Dùng `filter` hoặc `slice` + spread |
| `arr.includes(obj)` luôn `false` | So sánh tham chiếu, không so nội dung | `arr.some(o => o.id === id)` |
| `const { a } = obj` mà `a` là `undefined` dù có mặc định | Giá trị là `null`, không phải `undefined` | Dùng `obj.a ?? mặc_định` |

---

## 9. Tóm tắt cần thuộc

1. `obj.key` tìm key tên "key"; `obj[bien]` lấy giá trị của `bien` làm key
2. `Object.keys/values/entries` biến object thành mảng để dùng `map`/`filter`
3. `Object.entries` → biến đổi → `Object.fromEntries` là mẫu rất hay dùng
4. `splice` sửa mảng gốc, `slice` không
5. Destructuring object theo **tên**, destructuring mảng theo **vị trí**
6. Trong `{ a: { b } }`, chỉ `b` được tạo ra, `a` thì không
7. Giá trị mặc định chỉ kích hoạt bởi `undefined`, không phải `null`
8. Rest gom lại (vế trái), spread trải ra (vế phải)
9. Spread chỉ sao chép một tầng — dữ liệu lồng phải trải từng tầng
10. `?.` ngắn mạch khi gặp `null`/`undefined`
11. `??` chỉ bắt `null`/`undefined`; `||` bắt mọi falsy
12. `??` không trộn được với `||`/`&&` nếu thiếu ngoặc

---

## Bài tập

Tạo `bai-tap-03/` với `index.html`, `main.js`, `du-doan.md`.

### Bài 1 — Đoán output

Ghi phần đoán vào `du-doan.md` trước khi chạy:

```javascript
// A
const o = { a: 1, b: { c: 2 } };
const { a, b: { c } } = o;
console.log(a, c); -> 1 2
console.log(typeof b); -> object

// B
const arr = [1, 2, 3];
const [x, , z = 99, w = 99] = arr;
console.log(x, z, w); -> 1 3 99

// C
const u = { ten: "An", tuoi: null };
const { ten = "N/A", tuoi = 0, email = "chưa có" } = u;
console.log(ten, tuoi, email); -> An null "chưa có"

// D
const a1 = { x: 1, y: 2 };
const a2 = { y: 99, z: 3 };
console.log({ ...a1, ...a2 }); -> {x: 1, y: 99, z: 3}
console.log({ ...a2, ...a1 }); -> {x: 1, y: 2, z: 3}

// E
console.log(0 || "A"); -> "A"
console.log(0 ?? "A"); -> 0
console.log("" || "B"); -> "B"
console.log("" ?? "B"); -> ""
console.log(null || "C"); -> "C"
console.log(false ?? "D"); -> false

// F
const user = { ten: "An", diaChi: null };
console.log(user?.diaChi?.thanhPho); -> undefined
console.log(user?.diaChi?.thanhPho ?? "Không rõ"); -> "Không rõ"
console.log(user.ten?.length); -> 2

// G
const goc = { a: 1, sau: { b: 2 } };
const ban = { ...goc };
ban.a = 99;
ban.sau.b = 99;
console.log(goc.a, goc.sau.b); -> 1 99
```

### Bài 2 — Biến đổi dữ liệu API (bài chính)

Đây là dữ liệu kiểu bạn sẽ nhận từ API thật:

```javascript
const duLieuAPI = {
  status: "success",
  data: {
    donHang: [
      {
        id: "DH001",
        khachHang: {
          ten: "Nguyễn Văn An",
          lienHe: { email: "an@example.com", sdt: "0901234567" },
          diaChi: { thanhPho: "HCM", quan: "1" }
        },
        sanPham: [
          { ma: "SP1", ten: "Bàn phím", gia: 500000, soLuong: 2 },
          { ma: "SP2", ten: "Chuột", gia: 200000, soLuong: 1 }
        ],
        trangThai: "đang giao",
        giamGia: 0
      },
      {
        id: "DH002",
        khachHang: {
          ten: "Trần Thị Bình",
          lienHe: { email: "binh@example.com" },
          diaChi: { thanhPho: "Hà Nội" }
        },
        sanPham: [
          { ma: "SP3", ten: "Màn hình", gia: 3000000, soLuong: 1 }
        ],
        trangThai: "hoàn thành",
        giamGia: 10
      },
      {
        id: "DH003",
        khachHang: { ten: "Lê Văn Cường" },
        sanPham: [],
        trangThai: "đã hủy"
      }
    ]
  }
};
```

Chú ý: `DH002` thiếu `sdt` và `quan`. `DH003` thiếu hẳn `lienHe`, `diaChi`, `giamGia`, và có mảng `sanPham` rỗng. Dữ liệu thật luôn thiếu chỗ này chỗ kia như vậy.

**Yêu cầu:**

1. Dùng destructuring lấy ra mảng `donHang` từ `duLieuAPI` chỉ bằng **một dòng**.

2. Viết hàm `tomTat(donHang)` trả về mảng object dạng:
```javascript
{
  id: "DH001",
  tenKhach: "Nguyễn Văn An",
  email: "an@example.com",
  sdt: "Chưa cập nhật",        // khi thiếu
  thanhPho: "HCM",
  soMatHang: 2,
  tongTien: 1200000,           // đã trừ giảm giá
  trangThai: "đang giao"
}
```
Không được để lọt `undefined` vào kết quả. Không được ném lỗi với `DH003`.

3. Viết hàm `capNhatTrangThai(donHang, id, trangThaiMoi)` trả về **mảng mới** với đơn hàng có `id` tương ứng được đổi trạng thái. Sau khi gọi, `duLieuAPI` phải **hoàn toàn không đổi**. Tự viết code chứng minh điều đó.

4. Viết hàm `nhomTheoThanhPho(donHang)` trả về object dạng:
```javascript
{
  "HCM": ["DH001"],
  "Hà Nội": ["DH002"],
  "Chưa rõ": ["DH003"]
}
```

5. Viết hàm `boThongTinNhayCam(donHang)` trả về mảng đơn hàng đã **loại bỏ hẳn** trường `lienHe` khỏi `khachHang` — dùng rest destructuring, không dùng `delete`.

### Bài 3 — Gộp cấu hình

```javascript
const macDinh = {
  theme: "light",
  fontSize: 14,
  thongBao: { email: true, push: false, sms: false },
  ngonNgu: "vi"
};

const nguoiDung = {
  theme: "dark",
  thongBao: { push: true }
};
```

Viết hàm `gopCauHinh(macDinh, nguoiDung)` sao cho kết quả là:

```javascript
{
  theme: "dark",
  fontSize: 14,
  thongBao: { email: true, push: true, sms: false },   // ← gộp cả tầng trong
  ngonNgu: "vi"
}
```

Cái bẫy: `{ ...macDinh, ...nguoiDung }` sẽ làm mất `email` và `sms`. Bạn phải xử lý tầng lồng riêng.

Làm xong thì thử: nếu `nguoiDung` là `undefined` thì hàm có còn chạy không?

### Bài 4 — `??` và `||`

Với mỗi tình huống, chọn `??` hoặc `||` và **giải thích vì sao** trong `du-doan.md`:

1. `soLuongTonKho` — hiện "Hết hàng" khi không có dữ liệu, nhưng `0` là giá trị hợp lệ cần hiển thị  -> ??
2. `tenHienThi` — nếu người dùng để trống (`""`) thì dùng "Người dùng ẩn danh" -> ||
3. `choPhepBinhLuan` — mặc định `true`, nhưng người dùng đặt `false` thì phải tôn trọng -> ??
4. `ghiChu` — chuỗi rỗng và `null` đều nên thành "Không có ghi chú" -> ||
5. `soTrang` — mặc định `1`, `0` là giá trị không hợp lệ -> ||

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 3–5 dòng, bằng lời của bạn:

1. Rest và spread khác nhau chỗ nào? Làm sao nhìn code là biết cái nào?
2. Vì sao `{...obj}` không đủ để sao chép object có dữ liệu lồng?
3. `??` và `||` khác nhau ra sao? Cho một ví dụ dùng `||` gây bug.
4. `?.` ngắn mạch nghĩa là gì? Vì sao không nên rải `?.` khắp nơi?

---

## Xong file này khi

- [ ] Bài 1 có đủ phần đoán viết trước khi chạy
- [ ] Bài 2 chạy đúng cả 5 yêu cầu, không lỗi với `DH003`
- [ ] Bài 2 câu 3 có code chứng minh dữ liệu gốc không đổi
- [ ] Bài 3 giữ được đủ `email`, `push`, `sms`
- [ ] Trả lời được 4 câu ở bài 5 mà không nhìn tài liệu
- [ ] Viết lại được mẫu cập nhật state lồng ở mục 4.3 mà không copy

Xong thì gửi mình `main.js` + `du-doan.md`, kèm **"viết file 04-cac-ham-mang-quan-trong"**.