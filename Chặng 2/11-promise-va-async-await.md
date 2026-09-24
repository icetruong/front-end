# 11 — Promise và async/await

> **Cần có trước:** xong `10` (event loop) — đặc biệt phần microtask. Và giữ lại bài 4 của file `10`.
> **Thời gian:** 5 giờ.
> **Vì sao quan trọng:** mọi thao tác với server đều đi qua Promise. Ở React, mỗi lần gọi API là một `async` function. Đây cũng là file có nhiều cái bẫy tinh vi nhất chặng 2 — đặc biệt mục 10 (song song vs tuần tự), thứ mà rất nhiều người viết sai mà không biết.

---

## 1. Promise là gì

Promise là một object đại diện cho **kết quả của một việc sẽ hoàn thành trong tương lai**.

Nó có đúng ba trạng thái:

- **pending** — đang chờ, chưa xong
- **fulfilled** — thành công, có giá trị
- **rejected** — thất bại, có lý do

```
        ┌─→ fulfilled (có giá trị)
pending ─┤
        └─→ rejected (có lý do lỗi)
```

Hai điều cố định:

1. Từ `pending` chỉ đi được **một** chiều, một lần. Đã `fulfilled` thì không thành `rejected` được nữa.
2. Đã chuyển trạng thái (gọi là **settled**) thì giá trị **không đổi** được.

---

## 2. Tạo Promise

```javascript
const p = new Promise((resolve, reject) => {
  // Hàm này gọi là "executor", chạy NGAY LẬP TỨC và ĐỒNG BỘ
  setTimeout(() => {
    const thanhCong = Math.random() > 0.3;
    if (thanhCong) {
      resolve("Dữ liệu");        // → fulfilled
    } else {
      reject(new Error("Hỏng")); // → rejected
    }
  }, 1000);
});
```

Điểm dễ bất ngờ: **executor chạy đồng bộ**.

```javascript
console.log("A");
const p = new Promise((resolve) => {
  console.log("B");              // chạy NGAY
  resolve();
});
console.log("C");
p.then(() => console.log("D"));  // callback mới là microtask
console.log("E");

// A B C E D
```

`new Promise(...)` không "đợi" gì cả. Chỉ callback trong `.then` mới được hoãn.

### Cách tạo nhanh

```javascript
Promise.resolve(42);                      // fulfilled ngay với giá trị 42
Promise.reject(new Error("lỗi"));         // rejected ngay
```

**Luôn `reject` bằng một `Error`**, không phải chuỗi. `Error` mang theo stack trace, giúp bạn tìm ra lỗi phát sinh ở đâu.

```javascript
reject("hỏng");                  // xấu
reject(new Error("hỏng"));       // tốt
```

### Bọc API callback thành Promise

Mẫu rất hay dùng:

```javascript
function cho(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await cho(1000);    // tạm dừng 1 giây
```

---

## 3. Tiêu thụ Promise

```javascript
p.then(giaTri => {
  console.log("Thành công:", giaTri);
})
.catch(loi => {
  console.log("Thất bại:", loi.message);
})
.finally(() => {
  console.log("Luôn chạy, thành công hay thất bại");
});
```

`.finally` **không nhận** giá trị hay lỗi — nó chỉ để dọn dẹp (tắt loading spinner, đóng kết nối).

### `.then` nhận hai tham số

```javascript
p.then(
  giaTri => console.log("ok", giaTri),
  loi    => console.log("lỗi", loi)
);
```

Nhưng dạng này có nhược điểm: nó **không bắt được lỗi ném ra từ chính callback thành công**.

```javascript
p.then(
  giaTri => { throw new Error("lỗi trong then"); },
  loi    => console.log("không bắt được lỗi trên")
);

// Nên dùng
p.then(giaTri => { throw new Error("x"); })
 .catch(loi => console.log("bắt được"));    // ✓
```

**Quy tắc: dùng `.then().catch()`, đừng dùng tham số thứ hai của `.then`.**

---

## 4. Chuỗi Promise

Đây là điểm khiến Promise vượt trội callback.

> **`.then()` luôn trả về một Promise MỚI.**

```javascript
layUser(1)
  .then(user => layDonHang(user.id))       // trả về Promise → chờ nó
  .then(donHang => layChiTiet(donHang[0])) // nhận kết quả của bước trước
  .then(chiTiet => console.log(chiTiet))
  .catch(loi => console.error(loi));       // MỘT chỗ bắt lỗi cho cả chuỗi
```

So với callback hell ở file `10`: phẳng, đọc từ trên xuống, và chỉ một `catch`.

### Ba kiểu `return` trong `.then`

```javascript
// 1. Trả giá trị thường → truyền thẳng sang then kế
.then(x => x * 2)
.then(y => console.log(y))

// 2. Trả Promise → CHỜ nó settle rồi mới truyền giá trị đã mở gói
.then(x => fetch(`/api/${x}`))
.then(res => console.log(res))      // res là kết quả của fetch, không phải Promise

// 3. Không return gì → then kế nhận undefined
.then(x => { x * 2; })              // quên return!
.then(y => console.log(y))          // undefined
```

Lỗi số 3 giống hệt lỗi quên `return` trong `map` ở file `04`. Cùng một cái bẫy.

### Ném lỗi trong chuỗi

```javascript
layUser(1)
  .then(user => {
    if (!user.hoatDong) throw new Error("Tài khoản bị khóa");
    return layDonHang(user.id);
  })
  .then(dh => console.log(dh))
  .catch(loi => console.error(loi.message));   // bắt được cả hai loại lỗi
```

`throw` trong bất kỳ `.then` nào đều nhảy tới `.catch` gần nhất phía dưới.

### `.catch` có thể phục hồi chuỗi

```javascript
layUser(1)
  .then(u => layAvatar(u.id))
  .catch(() => "/anh-mac-dinh.png")     // trả giá trị → chuỗi TIẾP TỤC bình thường
  .then(url => hienThi(url))            // vẫn chạy, nhận url mặc định
  .catch(loi => console.error(loi));
```

Đây là mẫu rất hữu ích: bắt lỗi, đưa giá trị dự phòng, chuỗi chạy tiếp.

Nhưng cần đặt `.catch` đúng chỗ:

```javascript
// catch ở CUỐI → bắt lỗi của mọi bước
a().then(b).then(c).catch(xuLy);

// catch ở GIỮA → chỉ bắt lỗi của a và b, lỗi của c không ai bắt
a().then(b).catch(xuLy).then(c);
```

### `.finally` truyền giá trị qua

```javascript
Promise.resolve(1)
  .finally(() => 999)           // giá trị trả về bị BỎ QUA
  .then(v => console.log(v));   // 1 — không phải 999
```

Ngoại lệ: nếu `.finally` **ném lỗi** hoặc trả về Promise bị reject, thì lỗi đó sẽ ghi đè.

---

## 5. Chạy nhiều Promise cùng lúc

### `Promise.all` — tất cả phải thành công

```javascript
const [user, sanPham, tinTuc] = await Promise.all([
  fetch("/api/user").then(r => r.json()),
  fetch("/api/san-pham").then(r => r.json()),
  fetch("/api/tin-tuc").then(r => r.json())
]);
```

- Chạy **song song** — tổng thời gian bằng cái chậm nhất, không phải tổng
- Kết quả giữ **đúng thứ tự** đầu vào, bất kể cái nào xong trước
- **Một cái reject → cả `Promise.all` reject ngay**, các cái khác vẫn chạy nhưng kết quả bị bỏ

### `Promise.allSettled` — chờ tất cả, không quan tâm thành bại

```javascript
const kq = await Promise.allSettled([p1, p2, p3]);
// [
//   { status: "fulfilled", value: ... },
//   { status: "rejected",  reason: ... },
//   { status: "fulfilled", value: ... }
// ]

const thanhCong = kq.filter(r => r.status === "fulfilled").map(r => r.value);
const thatBai   = kq.filter(r => r.status === "rejected").map(r => r.reason);
```

**Không bao giờ reject.** Dùng khi bạn muốn hiển thị được phần nào hay phần đó — ví dụ dashboard có 5 widget, một cái hỏng thì bốn cái kia vẫn hiện.

### `Promise.race` — cái nào settle trước thì lấy

```javascript
const kq = await Promise.race([p1, p2]);
```

Lấy cái **settle đầu tiên**, dù là fulfilled hay rejected.

Ứng dụng kinh điển — đặt thời hạn:

```javascript
function hetGio(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Quá thời gian")), ms)
  );
}

const duLieu = await Promise.race([
  fetch("/api/cham"),
  hetGio(5000)
]);
```

Lưu ý: `race` không **hủy** promise thua. `fetch` vẫn chạy tiếp. Muốn hủy thật thì dùng `AbortController` (file `12`).

### `Promise.any` — cái nào thành công trước

```javascript
const kq = await Promise.any([p1, p2, p3]);
```

Bỏ qua các cái reject, lấy cái **fulfilled** đầu tiên. Tất cả đều reject thì ném `AggregateError` chứa toàn bộ lý do.

### Bảng so sánh

| | Khi nào xong | Reject khi nào |
|---|---|---|
| `all` | Tất cả fulfilled | Cái **đầu tiên** reject |
| `allSettled` | Tất cả settled | **Không bao giờ** |
| `race` | Cái đầu tiên **settled** | Nếu cái đó là reject |
| `any` | Cái đầu tiên **fulfilled** | Khi **tất cả** reject |

---

## 6. `async` / `await`

Cú pháp giúp viết code bất đồng bộ trông như đồng bộ. Bên dưới vẫn là Promise nguyên vẹn.

```javascript
async function layDuLieu() {
  const res = await fetch("/api/user");
  const user = await res.json();
  return user;
}
```

### Hai quy tắc nền tảng

**1. `async` function LUÔN trả về Promise.**

```javascript
async function f() {
  return 42;
}

f();                    // Promise { 42 } — không phải 42
f().then(v => console.log(v));   // 42
await f();                        // 42
```

**2. `await` mở gói Promise.**

```javascript
const p = Promise.resolve(42);
const v = await p;      // 42
```

`await` với giá trị không phải Promise cũng chạy được — nó tự bọc lại. Nhưng vẫn nhường luồng cho microtask:

```javascript
console.log("A");
(async () => {
  console.log("B");
  await 1;                   // không phải Promise, nhưng VẪN nhường
  console.log("C");
})();
console.log("D");

// A B D C
```

Nối lại file `10`: **code sau `await` là microtask**.

### `throw` trong async

```javascript
async function f() {
  throw new Error("lỗi");
}

f().catch(e => console.log(e.message));   // "lỗi"
```

Ném lỗi trong `async` function = trả về Promise bị reject.

### Xử lý lỗi

```javascript
async function layDuLieu() {
  try {
    const res = await fetch("/api/user");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (loi) {
    console.error("Lỗi:", loi.message);
    return null;                    // giá trị dự phòng
  } finally {
    tatLoading();
  }
}
```

`try/catch` bắt được cả lỗi đồng bộ lẫn lỗi từ `await`. Đây là ưu điểm lớn nhất so với `.then().catch()`.

Chú ý `return await res.json()` bên trong `try`: nếu viết `return res.json()` thì lỗi của `.json()` **không** bị `catch` này bắt, vì hàm đã return trước khi Promise settle.

### Top-level await

Trong ES module, `await` dùng được ở cấp cao nhất mà không cần bọc `async`:

```javascript
// file.js chạy với <script type="module">
const cauHinh = await fetch("/config.json").then(r => r.json());
```

Trong script thường thì không. Cách né:

```javascript
(async () => {
  const data = await layDuLieu();
})();
```

---

## 7. Song song và tuần tự — cái bẫy lớn nhất

Đây là mục quan trọng nhất của file.

```javascript
// TUẦN TỰ — 3 giây
async function cham() {
  const a = await layA();    // chờ 1s
  const b = await layB();    // rồi mới bắt đầu, chờ thêm 1s
  const c = await layC();    // rồi mới bắt đầu, chờ thêm 1s
  return [a, b, c];
}

// SONG SONG — 1 giây
async function nhanh() {
  const [a, b, c] = await Promise.all([layA(), layB(), layC()]);
  return [a, b, c];
}
```

Rất nhiều người viết bản `cham` mà không nhận ra. Code chạy đúng, chỉ là chậm gấp ba.

**Quy tắc: nếu các lời gọi không phụ thuộc nhau, chạy chúng song song.**

Khi có phụ thuộc thì tuần tự là bắt buộc:

```javascript
const user = await layUser(id);
const donHang = await layDonHang(user.id);    // cần user.id → phải chờ
```

### Cách viết song song thứ hai

```javascript
async function nhanh2() {
  const pA = layA();         // KHỞI ĐỘNG ngay, không await
  const pB = layB();
  const pC = layC();

  const a = await pA;        // giờ mới chờ
  const b = await pB;
  const c = await pC;
  return [a, b, c];
}
```

Promise bắt đầu chạy ngay khi được tạo, không phải khi `await`. Nên cách này cũng song song.

Cẩn thận một điểm: nếu `pB` reject trước khi bạn `await pA` xong, bạn sẽ có cảnh báo "unhandled rejection". `Promise.all` an toàn hơn vì nó gắn handler cho tất cả ngay lập tức.

---

## 8. `await` trong vòng lặp

### `forEach` không chờ — bẫy kinh điển

```javascript
// SAI
async function xuLy(ds) {
  ds.forEach(async (item) => {
    await luu(item);
  });
  console.log("Xong!");     // in NGAY, trước khi lưu xong cái nào
}
```

`forEach` không quan tâm callback trả về gì. Nó gọi hết rồi đi tiếp, không chờ.

### Tuần tự — dùng `for...of`

```javascript
async function tuanTu(ds) {
  for (const item of ds) {
    await luu(item);         // chờ từng cái
  }
  console.log("Xong!");      // đúng thời điểm
}
```

Dùng khi thứ tự quan trọng, hoặc cần tránh gửi quá nhiều request cùng lúc.

### Song song — `map` + `Promise.all`

```javascript
async function songSong(ds) {
  await Promise.all(ds.map(item => luu(item)));
  console.log("Xong!");
}
```

Nhanh hơn nhiều, nhưng 1000 item nghĩa là 1000 request cùng lúc — server có thể từ chối.

### Chia lô — cân bằng giữa hai cách

```javascript
async function theoLo(ds, kichThuoc = 5) {
  for (let i = 0; i < ds.length; i += kichThuoc) {
    const lo = ds.slice(i, i + kichThuoc);
    await Promise.all(lo.map(item => luu(item)));
  }
}
```

Đây là cách bạn sẽ dùng trong thực tế khi xử lý danh sách lớn.

---

## 9. Lỗi không được bắt

```javascript
layDuLieu();    // không .then, không .catch, không await
```

Nếu Promise này reject, không ai bắt. Trình duyệt in cảnh báo "Uncaught (in promise)".

Bắt toàn cục để ghi log:

```javascript
window.addEventListener("unhandledrejection", (e) => {
  console.error("Promise chưa bắt:", e.reason);
  e.preventDefault();      // chặn cảnh báo mặc định
});
```

Đây là lưới an toàn, không phải cách xử lý lỗi. Luôn bắt lỗi ở đúng chỗ.

Nếu cố ý không quan tâm kết quả, hãy viết rõ ý định:

```javascript
ghiLog(duLieu).catch(() => {});     // rõ ràng là cố tình bỏ qua
```

---

## 10. Promise và microtask

Nối trực tiếp file `10`:

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

(async () => {
  console.log("3");
  await null;
  console.log("4");
})();

Promise.resolve().then(() => console.log("5"));

console.log("6");

// 1 3 6 4 5 2
```

Giải thích:
- `1` — đồng bộ
- `3` — đồng bộ (code trước `await` đầu tiên chạy ngay)
- `6` — đồng bộ
- `4` — microtask (đăng ký khi gặp `await`, tức là trước dòng `Promise.resolve`)
- `5` — microtask (đăng ký sau)
- `2` — macrotask

Điểm mấu chốt: phần thân `async` function **trước** `await` đầu tiên chạy **đồng bộ**, giống executor của `new Promise`.

---

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Nhận `Promise { <pending> }` thay vì dữ liệu | Quên `await` hoặc `.then` | Thêm `await` |
| Hàm chạy chậm gấp nhiều lần cần thiết | `await` tuần tự các việc độc lập | `Promise.all` |
| "Xong!" in ra trước khi thật sự xong | `forEach` với callback `async` | `for...of` hoặc `Promise.all(map())` |
| `.then` kế nhận `undefined` | Quên `return` trong `.then` trước | Thêm `return` |
| `try/catch` không bắt được lỗi | Quên `await` bên trong `try` | `return await ...` |
| `catch` không chạy | Đặt `.catch` giữa chuỗi thay vì cuối | Chuyển `.catch` xuống cuối |
| Uncaught (in promise) | Promise không có ai bắt lỗi | Thêm `.catch` hoặc `try/catch` |
| Lỗi HTTP 404 không vào `catch` | `fetch` không reject với status lỗi | Kiểm tra `res.ok` (file `12`) |
| Chuỗi lỗi không có stack trace | `reject("chuỗi")` | `reject(new Error(...))` |
| `await` ở cấp cao nhất báo lỗi cú pháp | Không phải ES module | Dùng `type="module"` hoặc bọc IIFE async |
| `finally` trả giá trị nhưng bị mất | `finally` không truyền giá trị | Trả giá trị ở `then` |
| `Promise.all` hỏng hết vì một cái lỗi | `all` reject ngay khi có lỗi đầu | `Promise.allSettled` |

---

## 12. Tóm tắt cần thuộc

1. Promise có 3 trạng thái, chuyển một lần, không quay lại
2. Executor của `new Promise` chạy **đồng bộ**
3. `.then` luôn trả về Promise **mới** → nối chuỗi được
4. `return` giá trị → truyền đi; `return` Promise → chờ và mở gói; quên `return` → `undefined`
5. `throw` trong `.then` nhảy tới `.catch` gần nhất phía dưới
6. `.catch` trả giá trị thì chuỗi **phục hồi** và chạy tiếp
7. Đặt `.catch` ở **cuối** chuỗi
8. `all` (một lỗi là hỏng hết), `allSettled` (không bao giờ reject), `race` (settle đầu tiên), `any` (fulfilled đầu tiên)
9. `async` function luôn trả Promise; `throw` = reject
10. Thân `async` trước `await` đầu tiên chạy **đồng bộ**; sau `await` là **microtask**
11. `await` tuần tự việc độc lập = chậm không cần thiết → `Promise.all`
12. `forEach` **không** chờ `async`; dùng `for...of` hoặc `Promise.all(map())`
13. Luôn `reject(new Error(...))`, không reject chuỗi

---

## Bài tập

Tạo `bai-tap-11/` với `index.html`, `main.js`, `du-doan.md`.

### Bài 1 — Đoán thứ tự output

Ghi đoán vào `du-doan.md` trước khi chạy:

```javascript
// --- 1 ---
console.log("A");
const p = new Promise((resolve) => {
  console.log("B");
  resolve("C");
});
console.log("D");
p.then(v => console.log(v));
console.log("E");

-> "A" "B" "D" "E" "C"

// --- 2 ---
async function f() {
  console.log("1");
  await null;
  console.log("2");
}
console.log("3");
f();
console.log("4");

-> "3" "1" "4" "2"

// --- 3 ---
Promise.resolve(1)
  .then(v => { console.log(v); return v + 1; })
  .then(v => { console.log(v); v + 1; })
  .then(v => console.log(v))
  .then(v => console.log("cuối", v));

-> 1 2 3 "cuối" undefine
// ❌ SAI. Đáp án đúng: 1  2  undefined  "cuối" undefined
// Tại sao: .then thứ 2 viết `{ console.log(v); v + 1; }`, có dấu ngoặc nhọn {} mà KHÔNG có `return`.
//   `v + 1` được tính ra 3 rồi bị vứt đi, hàm không return gì nên trả về undefined.
//   → .then thứ 3 nhận v = undefined, in ra undefined (không phải 3).
//   → console.log trả về undefined, nên .then cuối in "cuối" undefined (chỗ này bạn đúng).
//   Đây chính là "Lỗi số 3" trong bài: quên return giống như quên return trong map.

// --- 4 ---
Promise.resolve()
  .then(() => { throw new Error("X"); })
  .then(() => console.log("A"))
  .catch(e => { console.log("B", e.message); return "phục hồi"; })
  .then(v => console.log("C", v))
  .catch(() => console.log("D"));

-> "B" "X" "C" "phục hồi" 

// --- 5 ---
Promise.reject(new Error("lỗi"))
  .catch(e => console.log("bắt 1"))
  .then(() => console.log("then sau catch"))
  .catch(e => console.log("bắt 2"));

-> "bắt 1" "then sau catch"

// --- 6 ---
Promise.resolve(1)
  .finally(() => { console.log("finally"); return 999; })
  .then(v => console.log("giá trị:", v));

-> "finally" "giá trị: 1"

// --- 7 ---
async function g() { return 42; }
console.log(g());
g().then(v => console.log(v));

-> "Promise { <fulfilled>: "42" }" 42
// ⚠️ GẦN ĐÚNG (ý đúng, chỉ sai chi tiết nhỏ): giá trị bên trong là SỐ 42, không phải chuỗi "42".
//   Trình duyệt in: Promise {<fulfilled>: 42}   —   Node in: Promise { 42 }
//   Ý chính bạn nắm đúng: async function LUÔN trả về Promise, `return 42` được gói thành Promise.

// --- 8 ---
console.log("s1");
setTimeout(() => console.log("t1"), 0);
(async () => {
  console.log("a1");
  await Promise.resolve();
  console.log("a2");
  await Promise.resolve();
  console.log("a3");
})();
Promise.resolve().then(() => console.log("p1"));
console.log("s2");

-> "s1" "a1" "s2" "a2" "a3" "p1" "t1"
// ❌ SAI. Đáp án đúng: s1  a1  s2  a2  p1  a3  t1   (p1 chen vào GIỮA a2 và a3)
// Tại sao: xem hàng đợi microtask chạy từng bước:
//   Đồng bộ: in s1 → setTimeout đưa t1 vào macrotask → vào hàm async in a1
//     → gặp await đầu: phần sau (a2) vào microtask   | hàng đợi: [a2]
//     → hàm async tạm dừng, code bên ngoài chạy tiếp
//     → Promise.resolve().then đưa p1 vào microtask  | hàng đợi: [a2, p1]
//     → in s2
//   Hết code đồng bộ, lấy microtask ra chạy:
//     → chạy a2, rồi gặp await thứ hai: phần sau (a3) xếp vào CUỐI hàng | hàng đợi: [p1, a3]
//     → chạy p1
//     → chạy a3
//   Hết microtask thì mới tới macrotask: t1
// Điểm mấu chốt: mỗi `await` là một lần "xếp hàng lại". a3 không chạy liền sau a2,
//   nó phải xếp sau p1, vì p1 đã vào hàng trước.

// --- 9 ---
const ds = [1, 2, 3];
ds.forEach(async (n) => {
  await new Promise(r => setTimeout(r, 100));
  console.log("item", n);
});
console.log("xong forEach");
-> "xong forEach" "item 1" "item 2" "item 3"

// --- 10 ---
async function h() {
  try {
    return Promise.reject(new Error("R"));
  } catch (e) {
    console.log("catch trong h");
    return "đã bắt";
  }
}
h().then(v => console.log("then:", v)).catch(e => console.log("catch ngoài:", e.message));
// Đoạn này tinh tế: đổi `return` thành `return await` thì kết quả khác thế nào?
-> "catch ngoài R"
-> thay thành return await thì in ra như sau: "catch trong h" "then: đã bắt";
```

### Bài 2 — Viết lại bài 4 của file 10 (bài chính)

Mở lại thư mục `bai-tap-10/` của bạn.

**Phần A.** Chuyển bốn hàm giả lập sang Promise:

```javascript
function layUser(id)         { /* trả về Promise */ }
function layDonHang(userId)  { /* trả về Promise */ }
function layChiTiet(donId)   { /* trả về Promise */ }
function laySanPham(maSP)    { /* trả về Promise */ }
```

Giữ nguyên độ trễ 300ms và tỷ lệ lỗi 20%.

**Phần B.** Viết lại chuỗi bốn tầng bằng `.then()`. Đếm số dòng, so với bản callback.

**Phần C.** Viết lại lần nữa bằng `async/await` + `try/catch`. So sánh cả ba bản, ghi nhận xét vào `du-doan.md`.

**Phần D.** Viết lại phần "gọi cho ba user cùng lúc" bằng `Promise.all`. So với bản callback tự đếm thủ công ở file `10` — ghi rõ bạn tiết kiệm được bao nhiêu dòng và bao nhiêu chỗ dễ sai.

**Phần E.** Làm thêm ba biến thể:
1. Dùng `Promise.allSettled` — một user lỗi thì hai user kia vẫn có kết quả
2. Thêm thời hạn 500ms cho mỗi lời gọi bằng `Promise.race`
3. Viết `thuLai(fn, soLan, khoangCho)` — tự động gọi lại khi lỗi, chờ giữa các lần thử. Bọc `layUser` bằng nó và đo tỷ lệ thành công qua 50 lần chạy.

### Bài 3 — Song song vs tuần tự

Viết bốn hàm, mỗi hàm gọi ba tác vụ mất 1 giây, đo thời gian bằng `performance.now()`:

```javascript
async function tuanTu()      { /* ~3000ms */ }
async function songSongAll() { /* ~1000ms */ }
async function songSongTay()  { /* ~1000ms — khởi động trước, await sau */ }
async function phuThuoc()     { /* bắt buộc tuần tự vì b cần kết quả a */ }
```

Ghi bốn con số thực đo vào `du-doan.md`.

Sau đó làm thêm: danh sách 20 tác vụ, mỗi cái 200ms. Viết ba phiên bản (tuần tự, song song hết, chia lô 5) và đo cả ba. Nhận xét: khi nào chia lô đáng dùng hơn song song hết?

### Bài 4 — Bộ công cụ Promise

Tự cài đặt, **không** dùng bản có sẵn:

1. `myAll(danhSach)` — như `Promise.all`, giữ đúng thứ tự, reject ngay khi có lỗi đầu tiên
2. `myAllSettled(danhSach)` — như `Promise.allSettled`
3. `myRace(danhSach)` — như `Promise.race`
4. `cho(ms)` — Promise tự resolve sau `ms`
5. `hetGio(promise, ms)` — reject nếu quá hạn
6. `thuLai(fn, soLan = 3, khoangCho = 1000)` — thử lại khi lỗi, mỗi lần chờ lâu gấp đôi (exponential backoff)
7. `gioiHanSongSong(danhSachHam, n)` — chạy tối đa `n` tác vụ cùng lúc, xong cái nào thì lấy cái tiếp theo vào

Câu 7 là câu khó nhất và là câu hỏi phỏng vấn ở mức trung cấp. Gợi ý: giữ một tập các promise đang chạy, dùng `Promise.race` để biết cái nào vừa xong.

Test `myAll` với: mảng rỗng, mảng chứa giá trị không phải Promise, mảng có một cái reject.

### Bài 5 — Sửa code sai

Mỗi đoạn có bug. Tìm, giải thích, sửa:

```javascript
// --- A ---
async function layTatCa(ids) {
  const kq = [];
  ids.forEach(async (id) => {
    const u = await layUser(id);
    kq.push(u);
  });
  return kq;
} -> return kq rỗng ngay lập tức vì forEach không chờ
// ✅ ĐÚNG. (Thêm: lỗi trong từng callback async cũng không ai bắt → unhandled rejection.)

// --- B ---
async function layDuLieu() {
  try {
    return fetch("/api/data").then(r => r.json());
  } catch (e) {
    console.log("Lỗi:", e);
    return null;
  }
} -> không bọc await nên lỗi
// ⚠️ ĐÚNG HƯỚNG nhưng giải thích chưa rõ. Nói cho đúng là: `return promise` không có await thì hàm
//    trả promise đó ra NGAY → khối try kết thúc liền, lúc đó fetch còn chưa xong. Sau này fetch/json
//    có reject thì lỗi đi thẳng ra người gọi, KHÔNG đi qua catch → catch vô dụng, không bao giờ
//    trả về null. `return await` bắt hàm đứng chờ BÊN TRONG try, nên lỗi mới rơi vào catch.

// --- C ---
function xuLy() {
  layUser(1)
    .then(u => layDonHang(u.id))
    .catch(e => console.log("lỗi user"))
    .then(dh => hienThi(dh));
} -> vì catch return undefine nên .then phía dưới bắt được giá trị là undefine nên hàm hienThi(dh) lỗi
// ✅ ĐÚNG. Còn một ý nữa: catch đặt ở giữa bắt luôn cả lỗi của layDonHang, nên log "lỗi user" có
//    thể là log sai. (Cách sửa bên .js chưa ổn — xem note trên hàm xuLy.)

// --- D ---
async function tai() {
  const a = await layA();
  const b = await layB();
  const c = await layC();
  return { a, b, c };
} -> 3 ham layA, layB, layC không liên quan nhau nên t nên dùng phương pháp chạy đồng bộ
// ❌ SAI THUẬT NGỮ: phải là chạy SONG SONG (parallel, dùng Promise.all), không phải "đồng bộ".
//    "Đồng bộ" (synchronous) là chạy chặn, từng dòng một — ngược với cái bạn muốn. Code hiện tại mới
//    là kiểu TUẦN TỰ: chờ A xong mới gọi B. Ý thì đúng, sửa bên .js cũng đúng.
// Chạy đúng nhưng chậm gấp 3. Sửa lại.

// --- E ---
async function luuTatCa(ds) {
  const kq = await Promise.all(ds.map(x => luu(x)));
  console.log("Đã lưu hết");
  return kq;
}
// Chạy đúng với 10 item, nhưng server trả 429 khi ds có 500 item. Sửa.
// ⚠️ CHƯA CÓ GIẢI THÍCH. Gợi ý viết: 429 = "Too Many Requests". ds.map(x => luu(x)) gọi luu cho
//    CẢ 500 item ngay lập tức (Promise.all chỉ chờ, không giới hạn) → 500 request cùng lúc → server
//    chặn. Phải giới hạn số request chạy đồng thời. (Code bên .js có lỗi — xem note trên luuTatCa.)

// --- F ---
function taoPromise() {
  return new Promise((resolve, reject) => {
    const kq = tinhToan();
    if (kq) resolve(kq);
    reject("Không có kết quả");
  });
} -> reject bên trong phải là new error, phải là nếu có kết quả resolve ngược lại là reject( không biết ý này đúng không nữa do tôi thấy để vậy vẫn đúng), 
// ✅ Bug 1 ĐÚNG: reject nên dùng new Error(...) (có stack trace, e.message dùng được).
// 💬 Chuyện thiếu else: bạn thấy "vẫn đúng" là ĐÚNG. Promise chỉ settle MỘT lần — resolve(kq) rồi thì
//    reject(...) phía sau bị bỏ qua, không có tác dụng gì. Thêm else (hoặc `return resolve(kq)`)
//    cho rõ ý và an toàn nếu sau này có thêm code phía dưới — nên làm, nhưng không phải bug chính.
// ❌ Bug 2 thật sự bạn chưa tìm ra: `if (kq)`. Nếu tinhToan() trả về 0, "" hoặc false — vẫn là
//    kết quả hợp lệ — thì if coi là falsy và reject "Không có kết quả". Sửa: chỉ loại đúng cái cần
//    loại, vd `if (kq !== undefined && kq !== null)`.
// Hai bug. Tìm cả hai.
```

### Bài 6 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. Promise giải quyết được vấn đề gì của callback? Dựa trên trải nghiệm bài 2, kể ba điểm cụ thể.
2. `.then()` trả về gì? Vì sao điều đó cho phép nối chuỗi?
3. Phân biệt `Promise.all`, `allSettled`, `race`, `any`. Mỗi cái một tình huống thật.
4. Vì sao `forEach` với `async` không hoạt động như mong đợi? Có mấy cách thay thế?
5. Khi nào `await` tuần tự là sai, khi nào là bắt buộc?
6. Thân `async` function chạy đồng bộ tới đâu? Chứng minh bằng một đoạn code.

---

## Xong file này khi

- [ ] Bài 1 đủ 10 đoạn có phần đoán viết trước; giải thích được đoạn 10
- [ ] Bài 2 có đủ ba phiên bản (callback, `.then`, `async/await`) để so sánh
- [ ] Bài 2 phần E làm đủ cả ba biến thể
- [ ] Bài 3 có số liệu đo thời gian thật của cả 4 + 3 phiên bản
- [ ] Bảy hàm ở bài 4 chạy đúng, kể cả `gioiHanSongSong`
- [ ] Bài 5 sửa đúng cả 6 đoạn, tìm được **hai** bug ở đoạn F
- [ ] Trả lời được 6 câu ở bài 6 bằng lời

File tiếp theo (`12-fetch-va-http`) bạn sẽ dùng Promise với dữ liệu thật từ server, và sản phẩm cuối là app gọi API có loading, error, debounce — gom lại kiến thức của file `05`, `08`, `09`, `10`, `11`.

Xong thì gửi mình `main.js` + `du-doan.md`, kèm **"viết file 12-fetch-va-http"**.