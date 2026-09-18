# 07 — Prototype và Class

> **Cần có trước:** xong `05` (closure) và `06` (`this`).
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** prototype là cơ chế kế thừa **duy nhất** của JavaScript. `class` chỉ là lớp vỏ đẹp đặt lên trên nó. Hiểu prototype thì bạn giải thích được vì sao `[].map` tồn tại, vì sao `new` hoạt động, và trả lời được câu hỏi phỏng vấn quen thuộc: *"class trong JavaScript có phải class thật không?"*

---

## 1. Bài toán

```javascript
function taoNguoiDung(ten) {
  return {
    ten: ten,
    chao() {
      console.log(`Xin chào ${this.ten}`);
    }
  };
}

const a = taoNguoiDung("An");
const b = taoNguoiDung("Bình");

a.chao();              // "Xin chào An"
console.log(a.chao === b.chao);   // false
```

Mỗi object có **bản sao riêng** của hàm `chao`. Với 2 object thì không sao. Với 10.000 object thì bạn có 10.000 bản sao của cùng một đoạn code trong bộ nhớ.

Điều ta muốn: dữ liệu (`ten`) thì riêng, hành vi (`chao`) thì **dùng chung**.

Prototype là câu trả lời của JavaScript cho bài toán này.

---

## 2. Mọi object đều có một prototype

Mỗi object trong JavaScript có một liên kết ẩn tới một object khác, gọi là **prototype** của nó. Đặc tả ký hiệu liên kết này là `[[Prototype]]`.

```javascript
const o = { a: 1 };

Object.getPrototypeOf(o);        // Object.prototype
Object.getPrototypeOf(o) === Object.prototype;   // true
```

Khi bạn truy cập một thuộc tính:

1. JavaScript tìm trên chính object đó
2. Không thấy → tìm trên prototype của nó
3. Không thấy → tìm trên prototype của prototype
4. Cứ thế cho đến khi gặp `null`
5. Vẫn không thấy → trả về `undefined`

Chuỗi này gọi là **prototype chain**.

```javascript
const o = { a: 1 };

o.a;              // 1 — có ngay trên object
o.toString;       // hàm — không có trên o, lấy từ Object.prototype
o.abc;            // undefined — hết chuỗi vẫn không thấy

Object.getPrototypeOf(Object.prototype);   // null — điểm cuối
```

Điểm giống và khác với **scope chain** (file `02`):

| | Scope chain | Prototype chain |
|---|---|---|
| Tra cứu cái gì | Biến | Thuộc tính của object |
| Leo theo | Vị trí viết code | Liên kết `[[Prototype]]` |
| Hết chuỗi thì | `ReferenceError` | `undefined` |

### Ví dụ chuỗi thật

```javascript
const arr = [1, 2, 3];

arr.map(...)
// arr không có `map`
// → Array.prototype có `map`  ✓

arr.toString()
// arr không có
// → Array.prototype có (bản riêng của mảng)  ✓

arr.hasOwnProperty("length")
// arr không có, Array.prototype không có
// → Object.prototype có  ✓
```

Chuỗi đầy đủ: `arr` → `Array.prototype` → `Object.prototype` → `null`

Đây là câu trả lời cho câu hỏi bạn có thể đã tự hỏi từ file `04`: **`map` đến từ đâu?** Nó nằm trên `Array.prototype`, và mọi mảng đều nối tới đó.

---

## 3. `prototype` và `__proto__` — phân biệt cốt lõi

Hai cái tên gần giống nhau nhưng là hai thứ **hoàn toàn khác**. Đây là chỗ nhầm phổ biến nhất.

| | `fn.prototype` | `obj.__proto__` |
|---|---|---|
| Có trên | Chỉ **hàm** | Mọi object |
| Là gì | Object sẽ được dùng làm prototype cho instance | Prototype **thật sự** của object này |
| Vai trò | Khuôn mẫu, dùng khi gọi `new` | Liên kết đang tồn tại |

```javascript
function NguoiDung(ten) {
  this.ten = ten;
}

NguoiDung.prototype.chao = function () {
  console.log(`Xin chào ${this.ten}`);
};

const a = new NguoiDung("An");

a.chao();                                        // "Xin chào An"
Object.getPrototypeOf(a) === NguoiDung.prototype; // true
```

Nói cách khác: `NguoiDung.prototype` **không phải** prototype của hàm `NguoiDung`. Nó là object mà `NguoiDung` sẽ **gán làm prototype** cho những instance nó tạo ra.

### `__proto__` là gì

`__proto__` là một accessor cũ để đọc/ghi `[[Prototype]]`. Nó vẫn chạy trên mọi trình duyệt, nhưng chính thức bị coi là **di sản**. Code hiện đại dùng:

```javascript
Object.getPrototypeOf(obj);            // đọc
Object.setPrototypeOf(obj, proto);     // ghi — nhưng hạn chế dùng, xem mục 6
```

Bạn vẫn cần biết `__proto__` vì nó xuất hiện trong DevTools và trong code cũ.

### Điều được giải quyết

```javascript
const a = new NguoiDung("An");
const b = new NguoiDung("Bình");

console.log(a.chao === b.chao);   // true — DÙNG CHUNG một hàm
```

Đúng thứ ta muốn ở mục 1: `ten` riêng, `chao` chung.

---

## 4. `new` thực sự làm gì

Ở file `06` mình đã liệt kê bốn bước. Giờ bạn có đủ nền để hiểu bước 2.

```javascript
const a = new NguoiDung("An");
```

Tương đương với:

```javascript
function myNew(Constructor, ...args) {
  // 1. Tạo object rỗng
  const obj = {};

  // 2. Nối prototype  ← bước mà file 06 chưa giải thích được
  Object.setPrototypeOf(obj, Constructor.prototype);

  // 3. Gọi constructor với this = obj
  const kq = Constructor.apply(obj, args);

  // 4. Trả về obj, trừ khi constructor trả về object khác
  return (kq !== null && typeof kq === "object") ? kq : obj;
}

const a = myNew(NguoiDung, "An");
a.chao();   // "Xin chào An"
```

Bốn bước này là bài tập ở cuối file, và cũng là câu hỏi phỏng vấn quen thuộc.

Ghi chú: arrow function không có thuộc tính `prototype`, nên không dùng với `new` được — đây chính là lý do kỹ thuật đằng sau điều mình nói ở file `02` và `06`.

```javascript
const F = () => {};
console.log(F.prototype);   // undefined
new F();                    // TypeError: F is not a constructor
```

---

## 5. Che phủ thuộc tính

Thuộc tính trên chính object **che** thuộc tính cùng tên trên prototype.

```javascript
function NguoiDung(ten) {
  this.ten = ten;
}
NguoiDung.prototype.chao = function () {
  console.log("Chào chung");
};

const a = new NguoiDung("An");
a.chao();                     // "Chào chung"

a.chao = function () {        // gán lên chính instance
  console.log("Chào riêng");
};
a.chao();                     // "Chào riêng"

delete a.chao;                // xóa bản riêng
a.chao();                     // "Chào chung" — lộ lại bản trên prototype
```

**Quan trọng: gán không bao giờ ghi lên prototype.** Nó luôn tạo thuộc tính mới trên chính object.

```javascript
const b = new NguoiDung("Bình");
b.chao();     // "Chào chung" — b không bị ảnh hưởng bởi a
```

Đây là lý do `Object.hasOwn` (file `03`) tồn tại:

```javascript
Object.hasOwn(a, "chao");     // false sau khi delete
"chao" in a;                  // true — vẫn tìm thấy trên prototype
```

---

## 6. `Object.create`

Tạo object với prototype do bạn chỉ định:

```javascript
const conVat = {
  keu() {
    console.log(`${this.ten} kêu`);
  }
};

const cho = Object.create(conVat);
cho.ten = "Milu";
cho.keu();                                    // "Milu kêu"

Object.getPrototypeOf(cho) === conVat;        // true
```

Tạo object hoàn toàn "trần", không có cả `Object.prototype`:

```javascript
const tran = Object.create(null);
tran.a = 1;
tran.toString;              // undefined — không kế thừa gì cả
```

Object trần hữu ích khi bạn dùng object làm từ điển thuần và không muốn key trùng với `toString`, `constructor`... (ngày nay thường dùng `Map` cho việc này).

### Vì sao tránh `Object.setPrototypeOf` trên object đã tạo

Các engine JavaScript tối ưu dựa trên giả định "hình dạng" object ổn định. Đổi prototype sau khi object đã tạo phá vỡ giả định đó và làm chậm đáng kể.

**Quy tắc:** xác định prototype ngay lúc tạo (`new`, `Object.create`, `class`), đừng đổi về sau.

---

## 7. Kế thừa theo kiểu cũ

Trước ES6, kế thừa viết thế này:

```javascript
function ConVat(ten) {
  this.ten = ten;
}
ConVat.prototype.keu = function () {
  console.log(`${this.ten} phát ra tiếng`);
};

function Cho(ten, giong) {
  ConVat.call(this, ten);      // gọi constructor cha — nhớ file 06
  this.giong = giong;
}

// Nối chuỗi prototype
Cho.prototype = Object.create(ConVat.prototype);
Cho.prototype.constructor = Cho;   // sửa lại constructor bị mất

Cho.prototype.keu = function () {
  console.log(`${this.ten} sủa gâu gâu`);
};

const c = new Cho("Milu", "Corgi");
c.keu();                        // "Milu sủa gâu gâu"
c instanceof Cho;               // true
c instanceof ConVat;            // true
```

Rườm rà, dễ quên bước sửa `constructor`, và `Cho.prototype = Object.create(...)` phải viết **trước** khi thêm method (nếu không sẽ bị ghi đè mất).

Chính vì vậy ES6 đưa ra `class`. Nhưng bạn cần thấy đoạn code trên một lần, vì đó là những gì `class` làm bên dưới.

---

## 8. `class` — cú pháp đường

```javascript
class ConVat {
  constructor(ten) {
    this.ten = ten;
  }

  keu() {
    console.log(`${this.ten} phát ra tiếng`);
  }
}

class Cho extends ConVat {
  constructor(ten, giong) {
    super(ten);              // thay cho ConVat.call(this, ten)
    this.giong = giong;
  }

  keu() {
    console.log(`${this.ten} sủa gâu gâu`);
  }

  keuNhuCha() {
    super.keu();             // gọi method của lớp cha
  }
}

const c = new Cho("Milu", "Corgi");
c.keu();          // "Milu sủa gâu gâu"
c.keuNhuCha();    // "Milu phát ra tiếng"
```

### Chứng minh nó vẫn là prototype

```javascript
typeof ConVat;                                       // "function" ← không phải "class"
Object.getPrototypeOf(c) === Cho.prototype;          // true
Object.getPrototypeOf(Cho.prototype) === ConVat.prototype;   // true
Object.hasOwn(Cho.prototype, "keu");                 // true — method nằm trên prototype
```

`class` **không** thêm mô hình đối tượng mới vào ngôn ngữ. Nó chỉ là cú pháp gọn cho đúng cơ chế ở mục 7. Đây là câu trả lời cho câu hỏi phỏng vấn ở đầu file.

### Khác biệt thật giữa `class` và function constructor

Không phải hoàn toàn tương đương. Có vài điểm khác:

- Thân class **luôn** chạy ở strict mode
- Class **không được hoist** — nằm trong TDZ như `let`/`const`
- Gọi class mà thiếu `new` → **TypeError** (function constructor thì chạy im lặng và gây bug)
- Method trong class là **non-enumerable** — không hiện ra trong `for...in`
- Trong constructor lớp con, **phải gọi `super()` trước khi chạm vào `this`**

```javascript
class A {}
new A();      // OK
A();          // TypeError: Class constructor A cannot be invoked without 'new'
```

```javascript
class B extends A {
  constructor() {
    this.x = 1;    // ReferenceError: Must call super constructor first
    super();
  }
}
```

---

## 9. Các tính năng của class

### 9.1. Class field

```javascript
class BoDem {
  dem = 0;                    // field — nằm trên INSTANCE
  buoc = 1;

  tang() {                    // method — nằm trên PROTOTYPE
    this.dem += this.buoc;
  }
}
```

Khác biệt quan trọng:

```javascript
const b = new BoDem();
Object.hasOwn(b, "dem");       // true  — field ở trên instance
Object.hasOwn(b, "tang");      // false — method ở trên prototype
```

Nối lại file `06`: class field dùng arrow tạo ra hàm **riêng cho mỗi instance**, nên `this` được khóa — nhưng mất lợi ích dùng chung của prototype.

```javascript
class C {
  ten = "C";
  thuong() { ... }             // dùng chung, nhưng mất this khi tách ra
  muiTen = () => { ... };      // giữ this, nhưng mỗi instance một bản sao
}
```

### 9.2. Trường riêng tư `#`

```javascript
class TaiKhoan {
  #soDu = 0;                   // riêng tư THẬT, không phải quy ước

  constructor(banDau) {
    this.#soDu = banDau;
  }

  napTien(x) {
    if (x <= 0) throw new Error("Số tiền phải dương");
    this.#soDu += x;
    return this.#soDu;
  }

  get soDu() {
    return this.#soDu;
  }
}

const tk = new TaiKhoan(1000);
tk.napTien(500);      // 1500
tk.soDu;              // 1500
tk.#soDu;             // SyntaxError — không truy cập được từ ngoài
```

So với cách dùng closure ở file `05`: kết quả tương đương, nhưng `#` gọn hơn và giữ được lợi ích prototype. Cách closure vẫn phổ biến trong code không dùng class.

Mẹo kiểm tra một object có phải instance thật không:

```javascript
class TaiKhoan {
  #soDu = 0;
  static laTaiKhoan(o) {
    return #soDu in o;         // chỉ true nếu o thật sự có field riêng tư này
  }
}
```

### 9.3. Getter và setter

```javascript
class HinhChuNhat {
  constructor(rong, cao) {
    this.rong = rong;
    this.cao = cao;
  }

  get dienTich() {
    return this.rong * this.cao;
  }

  set kichThuoc({ rong, cao }) {
    if (rong <= 0 || cao <= 0) throw new Error("Kích thước phải dương");
    this.rong = rong;
    this.cao = cao;
  }
}

const h = new HinhChuNhat(3, 4);
h.dienTich;                       // 12 — truy cập như thuộc tính, KHÔNG có ()
h.kichThuoc = { rong: 5, cao: 6 };
h.dienTich;                       // 30
```

Getter cho phép giá trị tính toán trông như thuộc tính thường. Setter cho phép chèn kiểm tra khi gán.

### 9.4. Thành viên tĩnh

```javascript
class MathHelper {
  static PI = 3.14159;

  static tinhChuVi(r) {
    return 2 * MathHelper.PI * r;
  }

  static #dem = 0;              // field tĩnh riêng tư

  static tangDem() {
    return ++MathHelper.#dem;
  }
}

MathHelper.tinhChuVi(5);        // 31.4159
new MathHelper().tinhChuVi;     // undefined — không có trên instance
```

Thành viên tĩnh nằm trên **chính class**, không nằm trên instance. Dùng cho hàm tiện ích và hằng số liên quan tới class.

Ứng dụng hay gặp — factory method:

```javascript
class NguoiDung {
  constructor(ten, email) {
    this.ten = ten;
    this.email = email;
  }

  static tuJSON(json) {
    const { ten, email } = JSON.parse(json);
    return new NguoiDung(ten, email);
  }
}
```

---

## 10. `instanceof` và `constructor`

```javascript
const c = new Cho("Milu", "Corgi");

c instanceof Cho;         // true
c instanceof ConVat;      // true — đi theo cả chuỗi prototype
c instanceof Object;      // true
c instanceof Array;       // false

c.constructor === Cho;    // true
c.constructor.name;       // "Cho"
```

`instanceof` không kiểm tra "được tạo bởi class nào". Nó kiểm tra: **`X.prototype` có nằm trên chuỗi prototype của object này không.**

Vì thế nó có thể bị đánh lừa:

```javascript
const gia = Object.create(Cho.prototype);
gia instanceof Cho;       // true — dù chưa bao giờ gọi new Cho()
```

Và nó không hoạt động qua ranh giới iframe hay các "realm" khác nhau — mảng từ iframe khác sẽ `arr instanceof Array === false`. Đây là lý do `Array.isArray` (file `03`) tồn tại.

`constructor` cũng chỉ là một thuộc tính thường nằm trên prototype, nên sửa được và không đáng tin tuyệt đối.

---

## 11. Đừng sửa prototype của built-in

```javascript
// ĐỪNG LÀM
Array.prototype.lay = function (i) {
  return this[i];
};

[1, 2, 3].lay(0);   // 1 — chạy được, nhưng...
```

Vì sao không nên:

1. **Xung đột.** Nếu một thư viện khác cũng thêm `lay` với hành vi khác, một trong hai sẽ hỏng.
2. **Tương lai.** Ngôn ngữ có thể thêm method cùng tên trong tương lai. Chuyện này đã xảy ra thật: khi `Array.prototype.flat` được đề xuất, thư viện MooTools đã có `flat` riêng với hành vi khác, và làm hỏng hàng loạt trang web. Ủy ban chuẩn hóa phải đổi tên trong quá trình bàn thảo — sự cố này được nhắc đến với tên "SmooshGate".
3. **`for...in` bị bẩn.** Thuộc tính tự thêm mặc định là enumerable, nên nó hiện ra trong `for...in` của mọi mảng.

Thay vì vậy, viết hàm tiện ích thường:

```javascript
function lay(arr, i) { return arr[i]; }
```

---

## 12. Khi nào dùng class

Class hữu ích khi:

- Bạn cần nhiều instance có trạng thái riêng và hành vi chung
- Có quan hệ kế thừa tự nhiên và không quá sâu
- Đang làm việc với thư viện dùng class (nhiều thư viện đồ họa, game engine)

Class **không** phải mặc định. Front-End hiện đại nghiêng về hàm:

- React đã chuyển hẳn sang function component và hooks; class component vẫn chạy nhưng không còn được dùng cho code mới
- Xử lý dữ liệu thuần thì object + hàm gọn hơn class
- Kế thừa sâu quá 2–3 tầng thường là dấu hiệu thiết kế sai — ưu tiên **composition** (ghép các phần) hơn **inheritance** (kế thừa)

```javascript
// Kế thừa — cứng nhắc
class ConVat {}
class Cho extends ConVat {}
class ChoRobot extends Cho {}     // vừa là chó vừa là robot? bắt đầu gượng ép

// Composition — linh hoạt hơn
const biet_sua = (o) => ({ ...o, sua: () => console.log("gâu") });
const chay_pin = (o) => ({ ...o, sac: () => console.log("đang sạc") });

const choRobot = chay_pin(biet_sua({ ten: "R2" }));
```

Bạn vẫn cần hiểu class kỹ, vì phỏng vấn hỏi và code cũ dùng nhiều. Nhưng đừng ép mọi thứ vào class.

---

## 13. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Nhầm `fn.prototype` với prototype của `fn` | Hai khái niệm khác nhau | `fn.prototype` là khuôn cho instance |
| Method thêm vào prototype không có tác dụng | Gán `Fn.prototype = ...` **sau** khi thêm method | Gán prototype trước, thêm method sau |
| `c.constructor` sai sau khi kế thừa kiểu cũ | Ghi đè `prototype` làm mất `constructor` | Gán lại `Fn.prototype.constructor = Fn` |
| `Cannot read properties of undefined` trong class | Mất `this` (file `06`) | Class field arrow, hoặc `bind` |
| `Must call super constructor first` | Dùng `this` trước `super()` | Gọi `super()` ở dòng đầu |
| `Class constructor cannot be invoked without 'new'` | Gọi class như hàm thường | Thêm `new` |
| `instanceof` trả `false` với mảng từ iframe | Khác realm | `Array.isArray` |
| Sửa method trên một instance làm hỏng instance khác | Sửa nhầm lên `prototype` chứ không phải instance | Gán lên chính object |
| `for...in` trả về key lạ | Có ai đó thêm thuộc tính enumerable vào built-in prototype | `Object.keys` hoặc `Object.hasOwn` |
| Class dùng trước khi khai báo báo lỗi | Class không được hoist | Khai báo trước khi dùng |

---

## 14. Tóm tắt cần thuộc

1. Mọi object có liên kết `[[Prototype]]`; chuỗi kết thúc ở `null`
2. Tra cứu thuộc tính leo theo prototype chain; không thấy thì `undefined`
3. `fn.prototype` là **khuôn cho instance**, khác với prototype của chính `fn`
4. `Object.getPrototypeOf` là cách hiện đại; `__proto__` là di sản
5. `new` làm 4 việc: tạo object, nối prototype, gọi hàm với `this`, trả về object
6. Arrow không có `prototype` → không dùng với `new` được
7. Gán thuộc tính **luôn** tạo trên chính object, không bao giờ ghi lên prototype
8. `class` là cú pháp đường trên prototype — `typeof Class === "function"`
9. Class: luôn strict, không hoist, bắt buộc `new`, `super()` trước `this`
10. Class field ở trên **instance**, method ở trên **prototype**
11. `#field` là riêng tư thật; closure là cách thay thế khi không dùng class
12. `instanceof` kiểm tra chuỗi prototype, không kiểm tra nguồn gốc
13. Đừng sửa prototype của built-in
14. Ưu tiên composition hơn inheritance

---

## Bài tập

Tạo `bai-tap-07/` với `index.html`, `main.js`, `du-doan.md`.

### Bài 1 — Đoán output

Ghi phần đoán vào `du-doan.md` trước khi chạy:

```javascript
// A
function F() {}
F.prototype.x = 1;
const a = new F();
const b = new F();
a.x = 99;
console.log(a.x, b.x, F.prototype.x); -> 99 1 1
delete a.x;
console.log(a.x); -> 1 

// B
function G() {}
G.prototype.say = function () { return "cha"; };
const g = new G();
G.prototype.say = function () { return "sửa sau"; };
console.log(g.say()); -> "sửa sau"

// C
function H() {}
const h = new H();
H.prototype = { moi: true };
console.log(h.moi); -> true
// ❌ SAI: h.moi phải là `undefined`, không phải `true`.
// h được tạo bằng `new H()` TRƯỚC khi `H.prototype` bị gán lại. Lúc new H() chạy,
// [[Prototype]] của h đã nối tới prototype CŨ (object rỗng, không có `moi`).
// Gán `H.prototype = { moi: true }` tạo ra một object HOÀN TOÀN MỚI và chỉ gán nó làm
// khuôn cho những lần `new H()` gọi SAU thời điểm này — h đã tạo trước đó vẫn giữ nguyên
// liên kết prototype cũ, không tự động "cập nhật" theo.
console.log(new H().moi); -> không được vì mất constructor rồi sao gọi H() được
// ❌ SAI: new H().moi phải là `true`, và lý do bạn nêu ("mất constructor nên không gọi được H()")
// không đúng bản chất. Gọi `H()`/`new H()` không phụ thuộc vào thuộc tính `.constructor` bên trong
// prototype — H vẫn là một hàm bình thường, gọi `new H()` lúc nào cũng được dù prototype của nó
// có gì bên trong. Vấn đề "mất constructor" (xem mục 13, dòng "c.constructor sai sau khi kế thừa
// kiểu cũ") chỉ ảnh hưởng khi bạn ĐỌC `obj.constructor`, không liên quan tới việc gọi hàm.
// new H() gọi SAU khi gán lại prototype sẽ nối với prototype MỚI ({ moi: true }), nên .moi là true.
// Đây chính là cái bẫy: reassign `fn.prototype` KHÔNG ảnh hưởng tới instance đã tạo từ trước, chỉ
// ảnh hưởng instance tạo SAU đó.

// D
const proto = { chao() { return `Xin chào ${this.ten}`; } };
const o = Object.create(proto);
o.ten = "An";
console.log(o.chao()); -> "Xin chào An"
console.log(Object.hasOwn(o, "chao"), "chao" in o); -> false true

// E
class C1 { m() {} }
const c1 = new C1();
console.log(Object.hasOwn(c1, "m")); -> false
console.log(Object.hasOwn(C1.prototype, "m")); -> true
console.log(typeof C1); -> function

// F
class C2 { m = () => {} }
const c2 = new C2();
console.log(Object.hasOwn(c2, "m")); -> true

// G
const gia = Object.create(Array.prototype);
console.log(gia instanceof Array); -> false
// ❌ SAI: phải là `true`. `instanceof` chỉ kiểm tra Array.prototype có nằm trên chuỗi
// prototype của gia không (mục 10) — mà gia được tạo trực tiếp với [[Prototype]] = Array.prototype,
// nên chắc chắn có mặt. So sánh với ví dụ ngay phía trên trong mục 10:
// `Object.create(Cho.prototype)` → `gia instanceof Cho` là `true` dù chưa từng gọi `new`.
// Cùng logic đó áp dụng ở đây.
//
// Vì sao true dù "cùng cấp" (gia trỏ THẲNG tới Array.prototype, không phải đi qua vài lớp
// trung gian trước khi tới nó)? Vì `instanceof` không đếm số bước, nó chỉ hỏi "X.prototype
// có xuất hiện ở bước nào đó không" — kể cả bước ĐẦU TIÊN cũng tính. Thuật toán thật:
//   p = Object.getPrototypeOf(gia)
//   lặp: p === Array.prototype ? → true : p = Object.getPrototypeOf(p), tới khi p === null
// Với gia, `Object.getPrototypeOf(gia)` CHÍNH LÀ Array.prototype ngay từ vòng lặp đầu (vì
// Object.create(X) đặt [[Prototype]] = X trực tiếp) → khớp ngay lập tức, "cùng cấp" vẫn tính.
// Điều thú vị: một mảng thật `[]` cũng đứng ở đúng vị trí đó — `Object.getPrototypeOf([])`
// cũng === Array.prototype, không hề "sâu" hơn gia. Tức là XÉT THEO CHUỖI PROTOTYPE, gia và
// `[]` giống hệt nhau. Đó chính là lý do `instanceof` (chỉ nhìn chuỗi prototype) không phân
// biệt được chúng — nó không có cách nào biết `[]` được tạo ra bởi cơ chế array literal còn
// gia là Object.create thủ công, vì cả hai chỉ để lại một dấu vết: [[Prototype]] === Array.prototype.
// Cái khác nhau thật sự nằm ở chỗ instanceof KHÔNG NHÌN TỚI: mảng thật có "internal slot"
// đặc biệt (exotic array object) khiến `length` tự cập nhật và engine đánh dấu nội bộ là
// array; gia không có slot đó dù prototype giống hệt. Đây là phần `Array.isArray` kiểm tra.
console.log(Array.isArray(gia)); -> true
// ❌ SAI: phải là `false`. gia chỉ là một object thường được gắn prototype của Array — nó KHÔNG
// PHẢI là "exotic array object" thật sự (không có cơ chế tự cập nhật `length`, không được engine
// đánh dấu nội bộ là array). `Array.isArray` kiểm tra bản chất nội tại đó, chứ không kiểm tra
// prototype chain, nên nó thấy gia không phải mảng thật. Đây đúng là lý do `Array.isArray` tồn tại
// thay vì dùng `instanceof Array` (mục 10, đoạn nói về iframe/realm) — hai cách kiểm tra cho ra
// kết quả khác nhau trong đúng tình huống này.

// H
const arrow = () => {};
console.log(arrow.prototype); -> undefine vì arrow function không có prototype

// I
class P { constructor() { this.x = 1; } }
class Q extends P {}
const q = new Q();
console.log(q.x, q instanceof P, q.constructor.name);-> 1 true "Q"
// ✓ ĐÚNG cả 3 giá trị: 1 true "Q"
// Giải thích .constructor.name: Q không tự viết constructor riêng, nhưng `class` vẫn tự
// sinh ra một constructor mặc định gắn trên Q.prototype.constructor, và nó trỏ về CHÍNH Q
// (không phải P). Khi tra `q.constructor`, JS tìm trên chuỗi prototype: thấy ngay trên
// Q.prototype (không cần leo lên tới P.prototype), nên q.constructor === Q,
// và q.constructor.name === "Q".

// J
console.log(Object.getPrototypeOf(Object.prototype)); -> null
// ❌ SAI: phải là `null`, không phải `undefined`. Chính file này đã nói ở mục 2:
// "Object.getPrototypeOf(Object.prototype); // null — điểm cuối"
// `null` đánh dấu điểm KẾT THÚC của prototype chain (đáy chuỗi). `undefined` chỉ xuất hiện khi
// TRUY CẬP một THUỘC TÍNH không tồn tại sau khi đã đi hết chuỗi (mục 2, bước 5) — đây là hai tình
// huống khác nhau: getPrototypeOf trả về mắt xích tiếp theo của chuỗi (kết thúc = null), còn
// truy cập property trả undefined khi không tìm thấy tên thuộc tính đó ở bất kỳ đâu trong chuỗi.
```

Câu C là bẫy thật và rất hay bị hỏi — giải thích cho kỹ.

### Bài 2 — Tự cài đặt `new`

Viết `myNew(Constructor, ...args)` theo đúng bốn bước ở mục 4.

Test đủ các trường hợp:

```javascript
function NguoiDung(ten) { this.ten = ten; }
NguoiDung.prototype.chao = function () { return `Chào ${this.ten}`; };

const a = myNew(NguoiDung, "An");
a.chao();                          // "Chào An"
a instanceof NguoiDung;            // true
Object.getPrototypeOf(a) === NguoiDung.prototype;   // true

// Constructor trả về object
function A() { this.x = 1; return { y: 2 }; }
myNew(A);                          // { y: 2 }

// Constructor trả về primitive
function B() { this.x = 1; return 42; }
myNew(B);                          // { x: 1 }
```

### Bài 3 — Kế thừa kiểu cũ rồi chuyển sang class

**Phần A.** Viết hệ sau **không dùng `class`**, chỉ dùng constructor function và prototype:

- `PhuongTien(ten, banhXe)` — có method `moTa()` trả `"<ten> có <banhXe> bánh"`
- `XeMay(ten)` kế thừa `PhuongTien`, luôn 2 bánh, thêm method `noMay()`
- `OTo(ten, soCho)` kế thừa `PhuongTien`, luôn 4 bánh, ghi đè `moTa()` để thêm số chỗ

Yêu cầu kiểm chứng:
- `new XeMay("Wave") instanceof PhuongTien` là `true`
- `new OTo("Vios", 5).constructor.name` là `"OTo"`
- `new XeMay("Wave").moTa === new XeMay("Dream").moTa` là `true` (dùng chung method)

**Phần B.** Viết lại hệ y hệt bằng `class`. So sánh số dòng code, ghi nhận xét vào `du-doan.md`.

### Bài 4 — Hệ thống quản lý thư viện (bài chính)

Xây hệ class sau:

**`TaiLieu`** (lớp cơ sở)
- Field riêng tư: `#id`, `#daMuon = false`
- Constructor nhận `{ tieuDe, tacGia, nam }`
- `#id` tự sinh, tăng dần — dùng **static private field** làm bộ đếm
- Getter: `id`, `daMuon`, `thongTin` (trả chuỗi mô tả)
- `muon()` — nếu đã được mượn thì ném lỗi; ngược lại đánh dấu và trả về ngày hết hạn
- `tra()` — đánh dấu trả
- `phiTre(soNgayTre)` — trả `0`, lớp con sẽ ghi đè
- Static: `soLuongDaTao()`

**`Sach extends TaiLieu`**
- Thêm `soTrang`, `isbn`
- Ghi đè `thongTin` để thêm số trang
- `phiTre(n)` — 5000đ/ngày
- Static `tuISBN(isbn)` — giả lập tra cứu, trả về một `Sach` mới

**`DVD extends TaiLieu`**
- Thêm `thoiLuong` (phút), `doTuoi`
- `phiTre(n)` — 10000đ/ngày, tối đa 100000đ
- Ghi đè `muon()` để nhận thêm tham số `tuoiNguoiMuon`, ném lỗi nếu chưa đủ tuổi, còn lại gọi `super.muon()`

**`TapChi extends TaiLieu`**
- Thêm `soPhatHanh`
- `muon()` ném lỗi luôn — tạp chí chỉ đọc tại chỗ

**`ThuVien`** (không kế thừa)
- Chứa mảng tài liệu (riêng tư)
- `them(taiLieu)` — chỉ nhận instance của `TaiLieu`, ngược lại ném lỗi
- `timTheoId(id)`
- `danhSachDangMuon()`
- `thongKeTheoLoai()` → `{ Sach: 3, DVD: 2, TapChi: 1 }` — gợi ý: dùng `constructor.name`
- `tongPhiTre(soNgay)` — tổng phí trễ nếu mọi tài liệu đang mượn đều trễ `soNgay` ngày

Viết phần kiểm thử chứng minh:
1. `#id` không truy cập được từ ngoài
2. Mượn hai lần liên tiếp thì ném lỗi
3. `DVD` chặn đúng theo độ tuổi
4. `TapChi` không mượn được
5. `them()` từ chối object không phải `TaiLieu`
6. `phiTre` của `DVD` bị chặn trần ở 100000
7. Method `muon` được dùng chung qua prototype, không nhân bản trên từng instance

### Bài 5 — Vẽ chuỗi prototype

Với đoạn code ở bài 4, vẽ (bằng chữ hoặc ASCII trong `du-doan.md`) chuỗi prototype đầy đủ của một instance `DVD`, từ instance cho tới `null`. Ghi rõ mỗi mắt xích chứa những method nào.

### Bài 6 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. Prototype chain là gì? So sánh với scope chain — giống và khác chỗ nào?
2. `fn.prototype` và `Object.getPrototypeOf(fn)` khác nhau ra sao?
3. `new` làm những gì? Kể đủ bốn bước.
4. "Class trong JavaScript có phải class thật không?" — trả lời như đang phỏng vấn, kèm bằng chứng.
5. Vì sao không nên thêm method vào `Array.prototype`?
6. Khi nào bạn chọn class, khi nào chọn hàm thuần? Cho ví dụ mỗi bên.

---

## Xong file này khi

- [ ] Bài 1 đủ 10 câu có phần đoán viết trước, giải thích được câu C
- [ ] `myNew` chạy đúng cả trường hợp constructor trả object và trả primitive
- [ ] Bài 3 có cả hai phiên bản, ba điều kiện kiểm chứng đều đạt
- [ ] Hệ thư viện ở bài 4 chạy đúng cả 7 điểm kiểm thử
- [ ] Vẽ được chuỗi prototype của một `DVD` mà không nhìn tài liệu
- [ ] Trả lời được 6 câu ở bài 6 **bằng lời**

**Hết khối B.** Bạn vừa qua ba khái niệm khó nhất của JavaScript: closure, `this`, prototype. Ba file này chiếm phần lớn nội dung vòng kỹ thuật của phỏng vấn Junior — nếu làm chắc, bạn đã vượt qua phần khó nhất của chặng 2.

Từ file `08` là khối C: DOM và sự kiện. Nhẹ nhàng hơn nhiều, và bắt đầu thấy code của mình chạy trên màn hình thật. Nghỉ một buổi trước khi vào.

Xong thì gửi mình `main.js` + `du-doan.md`, kèm **"viết file 08-dom-co-ban"**.