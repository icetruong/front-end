# 06 — Từ khóa `this`

> **Cần có trước:** xong `02` (scope) và `05` (closure).
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** `this` là khái niệm gây nhầm lẫn nhiều nhất trong JavaScript, và là câu hỏi phỏng vấn quen thuộc. Nhưng nó chỉ khó khi bạn cố hiểu bằng trực giác. Thực ra nó vận hành theo đúng **bốn quy tắc**, học thuộc bốn quy tắc đó là hết khó.

---

## 1. Điều cần gỡ bỏ trước

Nhiều người học từ ngôn ngữ khác (Java, C#, Python) sang thường nghĩ:

> `this` trỏ vào instance của class chứa nó.

Ở JavaScript, **sai**.

Một hiểu lầm khác:

> `this` trỏ vào nơi hàm được định nghĩa.

Cũng **sai**. Đó là cách **scope** hoạt động, không phải `this`.

### Nguyên tắc cốt lõi

> **`this` được xác định tại thời điểm hàm được GỌI, không phải nơi hàm được VIẾT.**

Đối chiếu với file `02` và `05`:

| | Quyết định bởi | Thời điểm |
|---|---|---|
| **Scope / closure** | Nơi hàm được **viết** | Lúc viết code (lexical) |
| **`this`** | Cách hàm được **gọi** | Lúc chạy (dynamic) |

Hai cơ chế hoàn toàn khác nhau. Nhầm lẫn giữa chúng là nguồn gốc của mọi rắc rối với `this`.

Câu hỏi bạn phải tập đặt ra mỗi khi thấy `this`:

> **"Hàm này được gọi như thế nào?"**

Không phải "hàm này nằm ở đâu".

---

## 2. Bốn quy tắc

Xếp theo **thứ tự ưu tiên từ cao xuống thấp**. Khi nhiều quy tắc cùng áp dụng được, quy tắc ở trên thắng.

### Quy tắc 1 — `new` binding

Gọi hàm với `new`:

```javascript
function NguoiDung(ten) {
  this.ten = ten;
}

const u = new NguoiDung("An");
console.log(u.ten);   // "An"
```

Khi gọi với `new`, JavaScript làm bốn việc:

1. Tạo một object rỗng mới
2. Nối object đó vào prototype của hàm (chi tiết ở file `07`)
3. Gán `this` = object mới
4. Trả về object đó, **trừ khi** hàm `return` một object khác

```javascript
function A() {
  this.x = 1;
  return { y: 2 };      // trả object khác → cái này thắng
}
console.log(new A());   // { y: 2 }

function B() {
  this.x = 1;
  return 42;            // trả primitive → bị bỏ qua
}
console.log(new B());   // { x: 1 }
```

### Quy tắc 2 — Explicit binding (`call`, `apply`, `bind`)

Bạn chỉ định `this` một cách tường minh:

```javascript
function chao() {
  console.log(`Xin chào ${this.ten}`);
}

const u = { ten: "An" };

chao.call(u);    // "Xin chào An"
chao.apply(u);   // "Xin chào An"

const chaoAn = chao.bind(u);
chaoAn();        // "Xin chào An"
```

Chi tiết ba hàm này ở mục 4.

### Quy tắc 3 — Implicit binding (gọi qua object)

Hàm được gọi như một method của object → `this` là object **đứng ngay trước dấu chấm**.

```javascript
const u = {
  ten: "An",
  chao() {
    console.log(this.ten);
  }
};

u.chao();      // "An"  — this là u
```

Chỉ tính object **gần nhất** bên trái dấu chấm:

```javascript
const app = {
  ten: "App",
  con: {
    ten: "Con",
    chao() {
      console.log(this.ten);
    }
  }
};

app.con.chao();   // "Con" — không phải "App"
```

### Quy tắc 4 — Default binding

Không rơi vào ba quy tắc trên → dùng mặc định.

```javascript
function f() {
  console.log(this);
}

f();
// Không strict mode: globalThis (window trong trình duyệt)
// Có strict mode:    undefined
```

```javascript
"use strict";
function f() {
  console.log(this);   // undefined
}
f();
```

Nhắc lại từ file `02`: **ES module luôn chạy ở strict mode**. Nên trong code hiện đại, default binding hầu như luôn cho `undefined`.

Đây là lý do bạn hay gặp lỗi `Cannot read properties of undefined (reading 'ten')`.

### Thứ tự ưu tiên — chứng minh

```javascript
function f() {
  console.log(this.ten);
}

const a = { ten: "A" };
const b = { ten: "B" };

const daBind = f.bind(a);
daBind();                 // "A"

// new thắng bind
function G(ten) {
  this.ten = ten;
}
const GdaBind = G.bind(a);
const kq = new GdaBind("C");
console.log(kq.ten);      // "C" — không phải "A"
console.log(a.ten);       // "A" — a không bị đụng
```

```javascript
// explicit thắng implicit
const obj = {
  ten: "obj",
  f() { console.log(this.ten); }
};
obj.f();            // "obj"    — implicit
obj.f.call(b);      // "B"      — explicit thắng
```

**Thứ tự cần thuộc: `new` > `call`/`apply`/`bind` > gọi qua object > mặc định.**

---

## 3. Mất `this` — nơi bug thực sự xảy ra

Ba quy tắc đầu đều rõ ràng. Rắc rối nằm ở chỗ: rất nhiều tình huống **vô tình** rơi xuống quy tắc 4.

### 3.1. Gán method ra biến

```javascript
const u = {
  ten: "An",
  chao() {
    console.log(this.ten);
  }
};

u.chao();                    // "An"

const f = u.chao;            // chỉ lấy HÀM, không lấy object
f();                         // undefined (hoặc lỗi ở strict mode)
```

`u.chao` chỉ là một tham chiếu tới hàm. Object `u` không "dính" vào hàm. Khi gọi `f()`, không có gì đứng trước dấu chấm → default binding.

### 3.2. Truyền method làm callback

Đây là biến thể phổ biến nhất của lỗi trên:

```javascript
const u = {
  ten: "An",
  chao() {
    console.log(this.ten);
  }
};

setTimeout(u.chao, 100);           // undefined
[1].forEach(u.chao);               // undefined
nut.addEventListener("click", u.chao);   // this là phần tử DOM, không phải u
```

Bạn truyền **hàm**, không truyền "hàm gắn với object". Đến lúc callback được gọi, người gọi (là `setTimeout`) không biết gì về `u`.

**Ba cách sửa:**

```javascript
// 1. Bọc trong arrow function
setTimeout(() => u.chao(), 100);      // gọi qua u → implicit binding

// 2. bind
setTimeout(u.chao.bind(u), 100);

// 3. Định nghĩa method bằng arrow (chỉ hợp trong class field, xem mục 6)
```

Cách 1 thường dễ đọc nhất.

### 3.3. Hàm lồng trong method

```javascript
const app = {
  ten: "App",
  chay() {
    console.log(this.ten);        // "App" — ổn

    function bentrong() {
      console.log(this.ten);      // undefined!
    }
    bentrong();                   // gọi trần → default binding
  }
};
```

Hàm `bentrong` được gọi **không qua object nào**, nên nó rơi vào quy tắc 4, bất kể nó nằm bên trong method.

Cách sửa cũ (còn thấy nhiều trong code cũ):

```javascript
chay() {
  const self = this;              // lưu this vào biến thường
  function bentrong() {
    console.log(self.ten);        // dùng closure!
  }
  bentrong();
}
```

Chú ý cách sửa này chính là **dùng closure để né `this`** — nối lại kiến thức file `05`.

Cách sửa hiện đại:

```javascript
chay() {
  const bentrong = () => {
    console.log(this.ten);        // arrow lấy this từ chay()
  };
  bentrong();
}
```

### 3.4. Callback bên trong method

```javascript
const gioHang = {
  ten: "Giỏ hàng",
  danhSach: ["Áo", "Quần"],

  inSai() {
    this.danhSach.forEach(function (item) {
      console.log(this.ten, item);    // this là undefined
    });
  },

  inDung1() {
    this.danhSach.forEach((item) => {
      console.log(this.ten, item);    // arrow → this là gioHang
    });
  },

  inDung2() {
    // forEach nhận tham số thứ hai để chỉ định this
    this.danhSach.forEach(function (item) {
      console.log(this.ten, item);
    }, this);
  }
};
```

Tham số thứ hai của `forEach`/`map`/`filter` để chỉ định `this` — ít dùng ngày nay vì arrow function tiện hơn, nhưng đáng biết.

---

## 4. `call`, `apply`, `bind`

### 4.1. `call` — gọi ngay, đối số rời

```javascript
function gioiThieu(nghe, tuoi) {
  console.log(`${this.ten}, ${tuoi} tuổi, làm ${nghe}`);
}

const u = { ten: "An" };
gioiThieu.call(u, "lập trình viên", 22);
```

### 4.2. `apply` — gọi ngay, đối số dạng mảng

```javascript
gioiThieu.apply(u, ["lập trình viên", 22]);
```

Chỉ khác `call` ở cách truyền đối số. Mẹo nhớ: **a**pply → **a**rray.

Ngày xưa `apply` hay dùng để trải mảng:

```javascript
Math.max.apply(null, [3, 7, 2]);   // 7
```

Nay có spread rồi nên không cần:

```javascript
Math.max(...[3, 7, 2]);            // 7
```

### 4.3. `bind` — không gọi, trả về hàm mới

```javascript
const chaoAn = gioiThieu.bind(u);
chaoAn("lập trình viên", 22);      // gọi sau, lúc nào cũng được
```

Điểm khác biệt cốt lõi: `call`/`apply` **gọi luôn**, `bind` **trả về một hàm mới** với `this` đã được khóa.

### 4.4. `bind` khóa vĩnh viễn

```javascript
const a = { ten: "A" };
const b = { ten: "B" };

function f() { console.log(this.ten); }

const daBind = f.bind(a);
daBind();              // "A"
daBind.call(b);        // "A"  ← call KHÔNG đổi được nữa
daBind.bind(b)();      // "A"  ← bind lần hai cũng vô tác dụng
```

Hàm đã bind không thể bind lại. Đây là câu hỏi phỏng vấn hay gặp.

### 4.5. `bind` với đối số — partial application

```javascript
function nhan(a, b, c) {
  return a * b * c;
}

const nhanVoi2 = nhan.bind(null, 2);        // khóa a = 2
nhanVoi2(3, 4);                              // 24

const nhanVoi2va3 = nhan.bind(null, 2, 3);  // khóa a = 2, b = 3
nhanVoi2va3(4);                              // 24
```

`null` ở vị trí đầu vì hàm này không dùng `this`. Kỹ thuật khóa sẵn một phần đối số gọi là **partial application**, họ hàng với currying ở file `05`.

### 4.6. Bảng so sánh

| | Gọi ngay? | Đối số | Trả về |
|---|---|---|---|
| `call(this, a, b)` | Có | Rời | Kết quả hàm |
| `apply(this, [a, b])` | Có | Mảng | Kết quả hàm |
| `bind(this, a, b)` | **Không** | Rời | **Hàm mới** |

---

## 5. Arrow function và `this`

Đây là phần quan trọng nhất của file.

> **Arrow function không có `this` của riêng nó.**

Không phải "arrow function có `this` khác". Nó **không có** `this`. Khi bạn viết `this` trong arrow function, JavaScript tìm `this` theo đúng cách nó tìm một biến thường: leo ra scope bên ngoài.

Nghĩa là `this` trong arrow function tuân theo **quy tắc lexical**, giống mọi biến khác.

```javascript
const obj = {
  ten: "obj",

  thuong() {
    console.log(this.ten);       // "obj" — this quyết định lúc gọi
  },

  mui_ten: () => {
    console.log(this?.ten);      // undefined — this lấy từ scope ngoài object
  }
};

obj.thuong();     // "obj"
obj.mui_ten();    // undefined
```

Điểm dễ nhầm: object **không tạo ra scope**. Chỉ hàm và khối `{}` của lệnh mới tạo scope. Nên arrow trong object literal lấy `this` từ scope bao ngoài object đó — thường là module (→ `undefined`) hoặc global.

### `call`/`apply`/`bind` không đổi được `this` của arrow

```javascript
const f = () => console.log(this);
f.call({ ten: "A" });    // vẫn là this của scope ngoài, không phải { ten: "A" }
```

Vì arrow không có `this` để mà gán.

### Khi nào arrow là lựa chọn đúng

Chính vì arrow "thừa kế" `this`, nó giải quyết gọn bài toán mục 3.3 và 3.4:

```javascript
const dongHo = {
  giay: 0,

  batDau() {
    setInterval(() => {
      this.giay++;              // this vẫn là dongHo
      console.log(this.giay);
    }, 1000);
  }
};

dongHo.batDau();   // 1, 2, 3, ...
```

Nếu dùng `function` thường bên trong `setInterval`, `this` sẽ là `undefined` và code nổ lỗi.

### Quy tắc thực dụng

| Vị trí | Dùng gì |
|---|---|
| Method của object/class | **Function thường** |
| Callback bên trong method | **Arrow** |
| Callback cho `map`/`filter`/`setTimeout` | **Arrow** |
| Hàm dùng với `new` | **Function thường** (arrow không dùng `new` được) |
| Event handler cần `this` là phần tử DOM | **Function thường** |

---

## 6. `this` trong class

Thân class **luôn** chạy ở strict mode, kể cả khi bạn không viết `"use strict"`.

```javascript
class BoDem {
  constructor() {
    this.dem = 0;
  }

  tang() {
    this.dem++;
    console.log(this.dem);
  }
}

const b = new BoDem();
b.tang();          // 1 — ổn

const f = b.tang;
f();               // TypeError: Cannot read properties of undefined
```

Class không miễn nhiễm với chuyện mất `this`. Đây là bug rất hay gặp khi truyền method của class làm event handler.

**Ba cách sửa:**

```javascript
// 1. bind trong constructor — cách cũ, hay thấy trong React class component
class BoDem {
  constructor() {
    this.dem = 0;
    this.tang = this.tang.bind(this);
  }
  tang() { this.dem++; }
}

// 2. Class field với arrow — cách hiện đại
class BoDem {
  dem = 0;
  tang = () => {
    this.dem++;      // arrow lấy this từ instance
  };
}

// 3. Bọc lúc truyền
nut.addEventListener("click", () => b.tang());
```

Cách 2 gọn nhất, nhưng có đánh đổi: mỗi instance có một bản sao riêng của hàm, thay vì dùng chung qua prototype. Với vài chục instance thì không sao; với hàng chục nghìn thì đáng cân nhắc. Chi tiết prototype ở file `07`.

---

## 7. `this` trong xử lý sự kiện DOM

```javascript
const nut = document.querySelector("button");

nut.addEventListener("click", function () {
  console.log(this);          // chính phần tử <button>
});

nut.addEventListener("click", () => {
  console.log(this);          // undefined trong module — KHÔNG phải nút
});
```

Với function thường, trình duyệt gọi handler theo cách khiến `this` là phần tử đang gắn listener — tức là bằng `event.currentTarget`.

Vì `event.currentTarget` cho cùng kết quả và rõ ràng hơn, code hiện đại thường viết:

```javascript
nut.addEventListener("click", (e) => {
  console.log(e.currentTarget);    // phần tử gắn listener
  console.log(e.target);           // phần tử thực sự bị click (có thể là con)
});
```

Phân biệt `target` và `currentTarget` là nội dung file `09`. Ở đây chỉ cần nhớ: **dùng arrow trong event handler thì đừng trông chờ `this`.**

---

## 8. `this` ở cấp cao nhất

```javascript
// Trong <script> thường, không strict
console.log(this);        // Window

// Trong <script type="module"> hoặc file ES module
console.log(this);        // undefined

// Trong hàm thường, không strict
function f() { console.log(this); }
f();                      // Window

// Trong hàm, strict mode
"use strict";
function g() { console.log(this); }
g();                      // undefined
```

`globalThis` là cách chuẩn để lấy object toàn cục ở mọi môi trường (`window` trên trình duyệt, `global` trên Node).

---

## 9. Quy trình xác định `this`

Khi gặp một đoạn code có `this` và cần trả lời nó là gì, đi theo thứ tự sau:

**Bước 0.** Hàm này là arrow function?
→ Nếu có: `this` không thuộc về nó. Nhìn ra scope bao ngoài, lặp lại quy trình cho hàm bao ngoài đó.

**Bước 1.** Hàm được gọi với `new`?
→ `this` = object mới tạo.

**Bước 2.** Hàm được gọi bằng `call`/`apply`, hoặc đã qua `bind`?
→ `this` = object được chỉ định.

**Bước 3.** Hàm được gọi qua một object (`obj.f()`)?
→ `this` = object ngay trước dấu chấm.

**Bước 4.** Không cái nào ở trên?
→ strict mode: `undefined`. Không strict: `globalThis`.

Ghi bốn bước này ra giấy dán màn hình. Làm 8 tình huống ở bài tập theo đúng quy trình, vài lần là thành phản xạ.

---

## 10. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Cannot read properties of undefined (reading 'x')` trong method | `this` là `undefined` do mất binding | `bind`, hoặc bọc trong arrow |
| Method truyền vào `setTimeout` không chạy đúng | Truyền hàm trần, mất object | `setTimeout(() => obj.f(), 100)` |
| `this` trong arrow của object là `undefined` | Arrow không có `this`, object không tạo scope | Đổi sang function thường |
| `this` trong `forEach` callback sai | Callback thường rơi vào default binding | Dùng arrow, hoặc truyền `this` làm tham số thứ hai |
| Method của class mất `this` khi làm event handler | Class chạy strict, mất binding → `undefined` | Class field arrow, hoặc bind trong constructor |
| `this` trong event handler không phải phần tử | Dùng arrow function | Dùng function thường, hoặc `e.currentTarget` |
| `bind` rồi mà `call` không đổi được | `bind` khóa vĩnh viễn | Bind lại từ hàm gốc |
| Arrow dùng với `new` báo lỗi | Arrow không có `[[Construct]]` | Dùng function thường hoặc class |
| Hàm lồng trong method mất `this` | Gọi trần → default binding | Đổi hàm lồng sang arrow |

---

## 11. Tóm tắt cần thuộc

1. `this` xác định lúc **gọi**, scope xác định lúc **viết**
2. Bốn quy tắc, ưu tiên: `new` > `call`/`apply`/`bind` > gọi qua object > mặc định
3. Default binding: strict → `undefined`, không strict → `globalThis`
4. ES module luôn strict → `this` mặc định là `undefined`
5. Chỉ object **gần nhất bên trái dấu chấm** mới tính
6. Gán method ra biến hoặc truyền làm callback là **mất `this`**
7. `call` gọi ngay đối số rời, `apply` gọi ngay đối số mảng, `bind` trả hàm mới
8. Hàm đã `bind` không bind hay `call` lại được
9. **Arrow không có `this`**, nó lấy từ scope ngoài theo quy tắc lexical
10. `call`/`apply`/`bind` vô tác dụng với arrow
11. Class luôn chạy strict; method class truyền ra ngoài sẽ mất `this`
12. Event handler function thường → `this` là phần tử; arrow → không phải

---

## Bài tập

Tạo `bai-tap-06/` với `index.html`, `main.js`, `du-doan.md`.

### Bài 1 — Đoán `this` trong 12 tình huống (bài chính)

Với **mỗi** tình huống, ghi vào `du-doan.md`: giá trị `this` bạn đoán, **quy tắc số mấy** áp dụng, và output. Rồi chạy kiểm chứng.

Bắt buộc ghi rõ quy tắc — đây mới là phần rèn tư duy, không phải đoán đúng kết quả.

```javascript
"use strict";

// --- 1 ---
const o1 = {
  ten: "o1",
  f() { console.log(this?.ten); }
};
o1.f(); -> Quy tắc 3 -> "o1"

// --- 2 ---
const g = o1.f;
g(); -> Quy tắt 4, undefine

// --- 3 ---
const o2 = { ten: "o2", f: o1.f };
o2.f(); -> Quy tắc 3 -> "o2"

// --- 4 ---
o1.f.call({ ten: "o3" }); -> Quy tắt 2 -> "o3"

// --- 5 ---
const daBind = o1.f.bind({ ten: "o4" });
daBind(); -> Quy tắt 2 -> "o4"
daBind.call({ ten: "o5" }); -> bind khóa cứng nên gọi call không đổi this -> "o4"

// --- 6 ---
const o6 = {
  ten: "o6",
  f: () => { console.log(this?.ten); }
};
o6.f(); -> this ở đây là undefine theo quy tắt 4 -> undefine
// ❌ SAI (lý luận): arrow không tự áp dụng quy tắc nào trong 4 quy tắc — nó không có this riêng.
// Theo mục 9 Bước 0: phải "nhìn ra scope bao ngoài". f nằm trong object literal, mà object KHÔNG
// tạo scope, nên scope bao ngoài chính là TOP-LEVEL của file (mục 8), không phải một lệnh gọi hàm
// nào để mà xét quy tắc 4. Nếu main.js là script thường (không phải module) thì "use strict" ở đầu
// KHÔNG đổi được this top-level — this top-level vẫn là window (object thật), không phải undefined.
// this?.ten -> window.ten -> undefined là do window không có thuộc tính ten, KHÔNG phải vì this là
// undefined. Output đoán đúng (undefine) nhưng lý do sai — nếu main.js chạy như module thì this
// top-level mới thật là undefined, một lý do khác hẳn.

// --- 7 ---
const o7 = {
  ten: "o7",
  f() {
    const trong = () => console.log(this?.ten);
    trong();
  }
};
o7.f(); -> vì hàm trong là arrow function nên this sẽ ra ngoài lấy tức là this của f() mà áp dụng quy tắt 3 thì this là o7 -> "o7"

// --- 8 ---
const o8 = {
  ten: "o8",
  f() {
    function trong() { console.log(this?.ten); }
    trong();
  }
};
o8.f(); -> vì hàm trong là function nên this sẽ là đối tượng gọi hàm đó mà ở đây khoogn có nên áp dụng quy tắt 4 thì this là undefine -> undefine

// --- 9 ---
const o9 = {
  ten: "o9",
  ds: [1, 2],
  f() {
    this.ds.forEach(function () {
      console.log(this?.ten);
    });
  }
};
o9.f(); -> this?.ten ở đây this là của hàm function bên trong forEach mà nó không có object nào gọi nên áp dụng quy tắt 4 thì this là undefine -> undefine

// --- 10 ---
const o10 = {
  ten: "o10",
  sau: {
    ten: "sau",
    f() { console.log(this?.ten); }
  }
};
o10.sau.f(); -> quy tắt 3 -> "sau"

// --- 11 ---
function N(ten) {
  this.ten = ten;
  this.f = function () { console.log(this?.ten); };
}
-> this ở ngoài thì áp dụng quy tắt 1 nên n sẽ có 2 prototype là ten và f
// ❌ SAI (thuật ngữ): số quy tắc (1 = new) đúng, nhưng "ten" và "f" KHÔNG phải prototype.
// this.ten = ... và this.f = ... gán trực tiếp lên object mới tạo (chính là n) -> đó là
// OWN PROPERTY (thuộc tính riêng của instance n), khác hẳn thuộc tính nằm trên N.prototype
// (kiểu N.prototype.f = ...). Phân biệt hai cái này là trọng tâm file 07-prototype-va-class.md.
const n = new N("n11");
n.f(); -> this bên trong( this?.ten) là this của hàm f nên ở đây n gọi tức là this là n( áp dụng quy tắt 3) -> "n11"
const h = n.f;
h(); -> áp dụng quy tắt 4 -> undefine

// --- 12 ---
class C {
  ten = "c12";
  thuong() { console.log(this?.ten); }
  muiTen = () => console.log(this?.ten);
}
const c = new C();
const t = c.thuong;
const m = c.muiTen;
t(); -> quy tắt 4 -> undefine
m(); -> arrow function nên tìm this bên ngoài mà this bên ngoài ở đây theo quy tắt 1 là c -> "c12"
```

### Bài 2 — Sửa code

Mỗi đoạn đều có bug về `this`. Tìm, giải thích, sửa bằng **hai cách khác nhau**:

```javascript
// --- A ---
const dongHo = {
  giay: 0,
  batDau() {
    setInterval(function () {
      this.giay++;
      console.log(this.giay);
    }, 1000); -> this ở đây là this của function và áp dụng quy tắt 4 thì this ở đây là undefine
  }
};
dongHo.batDau();

// --- B ---
const nguoiDung = {
  ten: "An",
  banBe: ["Bình", "Cường"],
  inDanhSach() {
    this.banBe.forEach(function (b) {
      console.log(`${this.ten} là bạn của ${b}`); -> this ở đây là this của function và áp dụng quy tắt 4 thì this ở đây là undefine
    });
  }
};
nguoiDung.inDanhSach();

// --- C ---
class NutBam {
  constructor(el) {
    this.el = el;
    this.soLan = 0;
    this.el.addEventListener("click", this.xuLy);
  }
  xuLy() {
    this.soLan++; -> với addEventListener thì this ở đây là el chứ không phải NutBam 
    console.log(this.soLan);
  }
}

// --- D ---
const api = {
  url: "https://example.com",
  layDuLieu() {
    const goi = () => {
      console.log(this.url); -> this trong arrow function nên sẽ ra bên ngoài ở đây là this của hàm layDuLieu
    };
    return goi;
  }
};
const f = api.layDuLieu(); -> this là api theo quy tắt 3
f(); -> đúng
// Đoạn này thực ra CHẠY ĐÚNG. Giải thích vì sao, và
// chỉ ra nó sẽ hỏng nếu đổi `goi` sang function thường. -> với function thường thì this là hàm nớ nó không ra ngoài nên lúc đó this là undefine nên sai 
```

### Bài 3 — Tự cài đặt `call`, `apply`, `bind`

Viết ba hàm sau, mỗi hàm nhận hàm gốc làm tham số đầu:

```javascript
function myCall(fn, thisArg, ...args)  { ... }
function myApply(fn, thisArg, argsArr) { ... }
function myBind(fn, thisArg, ...args)  { ... }
```

Gợi ý cho `myCall`: mẹo kinh điển là gắn tạm `fn` làm thuộc tính của `thisArg`, gọi nó qua object đó để kích hoạt implicit binding, rồi xóa thuộc tính đi. Dùng `Symbol()` làm tên thuộc tính để không đè lên key có sẵn.

Yêu cầu thêm cho `myBind`:
- Hàm trả về nhận thêm đối số ở lần gọi sau (partial application)
- Kết quả `myBind` không bị `call` đổi `this`

Test:

```javascript
function f(a, b) { return `${this.ten}: ${a}, ${b}`; }
const o = { ten: "test" };

myCall(f, o, 1, 2);            // "test: 1, 2"
myApply(f, o, [1, 2]);         // "test: 1, 2"
const bd = myBind(f, o, 1);
bd(2);                         // "test: 1, 2"
bd.call({ ten: "khac" }, 2);   // "test: 1, 2"  ← vẫn là "test"
```

Đây là câu hỏi phỏng vấn thật. Làm được nghĩa là bạn hiểu binding hoạt động ra sao.

### Bài 4 — Ứng dụng thật

Dựng trong `index.html`:

```html
<div id="app">
  <button data-hanh-dong="tang">+</button>
  <span id="gia-tri">0</span>
  <button data-hanh-dong="giam">-</button>
  <button data-hanh-dong="datLai">Đặt lại</button>
</div>
```

Viết class `BoDemUI`:

```javascript
class BoDemUI {
  constructor(idGoc, batDau = 0) { ... }
  tang()   { ... }
  giam()   { ... }
  datLai() { ... }
  capNhatHienThi() { ... }
}
```

Yêu cầu:
- Mỗi nút gọi đúng method tương ứng dựa trên `data-hanh-dong`
- Method giữ đúng `this` — **làm bằng cả hai cách**: một bản dùng `bind` trong constructor, một bản dùng class field arrow. Đặt tên `BoDemUI_Bind` và `BoDemUI_Arrow`.
- Tạo **hai** instance trên cùng trang (thêm một `<div id="app2">`), chứng minh chúng đếm độc lập
- Thêm method `huy()` gỡ hết listener. Giải thích trong `du-doan.md` vì sao bản dùng `bind` cần lưu lại hàm đã bind mới gỡ được listener.

Câu cuối là điểm tinh tế thật: `removeEventListener` cần **đúng tham chiếu hàm** đã truyền vào `addEventListener`. Mỗi lần gọi `.bind()` tạo ra một hàm mới, nên `el.removeEventListener("click", this.xuLy.bind(this))` sẽ không gỡ được gì.

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. `this` khác scope ở điểm nào? Trả lời như đang phỏng vấn.
2. Kể bốn quy tắc theo thứ tự ưu tiên, mỗi quy tắc một ví dụ tự nghĩ.
3. Vì sao arrow function "giải quyết" được vấn đề `this`? Nói cho chính xác — nó *giải quyết* hay *né tránh*?
4. `call`, `apply`, `bind` khác nhau ra sao? Khi nào dùng cái nào?
5. Bạn có một method của object cần truyền vào `addEventListener`. Kể ba cách giữ `this`, và ưu nhược của từng cách.

---

## Xong file này khi

- [ ] Bài 1 làm đủ 12 tình huống, mỗi tình huống có ghi **quy tắc số mấy**
- [ ] Bài 2 mỗi đoạn sửa bằng hai cách khác nhau
- [ ] `myCall`, `myApply`, `myBind` chạy đúng mọi test
- [ ] Bài 4 có cả hai phiên bản, hai instance độc lập, `huy()` gỡ được listener
- [ ] Áp dụng được quy trình 4 bước ở mục 9 mà không nhìn tài liệu
- [ ] Trả lời được 5 câu ở bài 5 **bằng lời**

Còn một file nữa là hết khối B. File `07` (prototype) sẽ giải thích nốt phần "vì sao `new` hoạt động như vậy" mà mục 2 mới chỉ nói lướt qua.

Xong thì gửi mình `main.js`, `index.html`, `du-doan.md`, kèm **"viết file 07-prototype-va-class"**.