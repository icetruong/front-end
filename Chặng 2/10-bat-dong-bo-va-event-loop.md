# 10 — Bất đồng bộ và Event Loop

> **Cần có trước:** xong `09`, và nhớ `02` (hàm), `05` (closure).
> **Thời gian:** 4–5 giờ.
> **Vì sao quan trọng:** đây là file lý thuyết nặng nhất còn lại của chặng 2, và cũng là chủ đề bị hỏi nhiều nhất trong phỏng vấn sau closure. Câu "đoán thứ tự output của đoạn code này" mà người phỏng vấn đưa ra gần như luôn là bài kiểm tra event loop. Hiểu file này thì bạn cũng sẽ hết bối rối trước những bug kiểu "vì sao dữ liệu chưa có mà code đã chạy".

> **Ghi chú về Promise:** file này dùng `.then()` ở mức tối thiểu — bạn chỉ cần biết nó đưa một callback vào hàng đợi microtask. Cú pháp và cách dùng đầy đủ là nội dung file `11`.

---

## 1. JavaScript chỉ có một luồng

> JavaScript là ngôn ngữ **đơn luồng**: tại một thời điểm chỉ chạy được đúng một đoạn code.

Không có chuyện hai hàm chạy song song. Không có race condition kiểu đa luồng.

Điều này vừa là ưu điểm (code dễ suy luận hơn nhiều) vừa là vấn đề: nếu một tác vụ mất 5 giây, toàn bộ trang **đóng băng** trong 5 giây đó. Không bấm được nút, không cuộn được, không gõ được.

Hãy tự thử ngay:

```javascript
console.log("bắt đầu");
const ketThuc = Date.now() + 3000;
while (Date.now() < ketThuc) { }      // bận rộn 3 giây
console.log("xong");
```

Chạy đoạn này rồi thử bấm nút hay bôi đen chữ trên trang. Không làm được gì cả.

Câu hỏi của cả file này: **nếu JavaScript đơn luồng, làm sao nó tải dữ liệu từ server mà không đóng băng trang?**

---

## 2. Call stack

Call stack là nơi JavaScript theo dõi "đang chạy hàm nào".

```javascript
function ba()  { console.log("ba"); }
function hai() { ba(); }
function mot() { hai(); }
mot();
```

Diễn biến:

```
[ ]                     ← rỗng
[mot]                   ← gọi mot()
[mot, hai]              ← mot gọi hai()
[mot, hai, ba]          ← hai gọi ba()
[mot, hai, ba]          ← ba in ra "ba"
[mot, hai]              ← ba xong, pop
[mot]                   ← hai xong, pop
[ ]                     ← mot xong, pop
```

Vào sau ra trước (LIFO). Hàm trên đỉnh stack chạy xong mới đến hàm dưới.

Stack đầy thì:

```javascript
function deQuy() { deQuy(); }
deQuy();   // RangeError: Maximum call stack size exceeded
```

Điểm cần nhớ: **chừng nào call stack chưa rỗng, không có gì khác được chạy.** Kể cả việc vẽ lại màn hình.

---

## 3. Runtime — nơi phép màu xảy ra

Bản thân JavaScript engine (V8) chỉ có call stack, heap, và hàng đợi. Nó **không** biết `setTimeout` là gì, cũng không biết `fetch` là gì.

Những thứ đó do **môi trường chạy** cung cấp — trình duyệt (hoặc Node.js). Và trình duyệt thì **có nhiều luồng**.

```
┌──────────────────────────┐
│   JavaScript Engine      │
│  ┌────────┐  ┌────────┐  │
│  │ Call   │  │ Heap   │  │
│  │ Stack  │  │        │  │
│  └────────┘  └────────┘  │
└──────────────────────────┘
           ↕
┌──────────────────────────┐
│   Web APIs (trình duyệt) │
│  setTimeout, fetch,      │
│  DOM events, geolocation │   ← chạy ở luồng khác
└──────────────────────────┘
           ↓ khi xong, đẩy callback vào hàng đợi
┌──────────────────────────┐
│  Microtask Queue         │  ← ưu tiên cao
├──────────────────────────┤
│  Task Queue (macrotask)  │  ← ưu tiên thấp
└──────────────────────────┘
           ↑
      ┌──────────┐
      │Event Loop│  ← đưa callback vào stack khi stack rỗng
      └──────────┘
```

Khi bạn gọi `setTimeout(fn, 1000)`:

1. JavaScript **bàn giao** cho trình duyệt: "đếm 1000ms hộ tôi"
2. `setTimeout` trả về ngay lập tức, call stack tiếp tục chạy dòng sau
3. Trình duyệt đếm ở luồng riêng, không ảnh hưởng gì tới JavaScript
4. Hết 1000ms, trình duyệt đẩy `fn` vào **hàng đợi**
5. Event loop chờ call stack rỗng rồi mới đưa `fn` vào stack chạy

**Kết luận quan trọng:** JavaScript vẫn đơn luồng. Việc chờ đợi được làm bởi trình duyệt, không phải bởi JavaScript.

---

## 4. Event Loop

Event loop là một vòng lặp đơn giản đến bất ngờ:

```
lặp mãi mãi:
    1. Call stack có rỗng không?
       Không → chờ
    2. Rỗng → chạy HẾT SẠCH microtask queue
       (microtask mới sinh ra trong lúc này cũng phải chạy luôn)
    3. Lấy MỘT task từ task queue, chạy nó
    4. Chạy hết sạch microtask queue lần nữa
    5. Nếu đến lúc vẽ lại màn hình → vẽ
    6. Quay lại bước 1
```

Ba điều cần thuộc từ vòng lặp này:

1. **Code đồng bộ luôn chạy hết trước.** Không có callback nào chen ngang được.
2. **Microtask được vét cạn.** Không phải lấy một cái, mà lấy cho đến khi hàng đợi rỗng.
3. **Macrotask lấy từng cái một**, giữa các lần có cơ hội vẽ lại màn hình.

---

## 5. Hai hàng đợi

### Macrotask (task queue)

- `setTimeout`, `setInterval`
- Sự kiện DOM (click, input...)
- `setImmediate` (chỉ có ở Node)
- Thao tác I/O

### Microtask

- Callback của Promise: `.then`, `.catch`, `.finally`
- Code sau `await`
- `queueMicrotask()`
- `MutationObserver`

**Microtask luôn được ưu tiên hơn macrotask.**

```javascript
console.log("1 — đồng bộ");

setTimeout(() => console.log("2 — macrotask"), 0);

Promise.resolve().then(() => console.log("3 — microtask"));

console.log("4 — đồng bộ");
```

Output:

```
1 — đồng bộ
4 — đồng bộ
3 — microtask
2 — macrotask
```

Diễn giải từng bước:

1. `console.log("1")` chạy ngay
2. `setTimeout` bàn giao cho trình duyệt, callback vào **task queue** ngay (vì delay 0)
3. `Promise.resolve().then(...)` đưa callback vào **microtask queue**
4. `console.log("4")` chạy ngay
5. Code đồng bộ hết → call stack rỗng
6. Event loop: vét microtask trước → in `3`
7. Microtask rỗng → lấy một macrotask → in `2`

Đây chính là câu trả lời cho câu hỏi ở "tự kiểm tra" file `00`: *tại sao `setTimeout(fn, 0)` chạy sau `Promise.resolve().then(fn)`.*

### Microtask vét cạn — kể cả cái sinh ra giữa chừng

```javascript
console.log("bắt đầu");

setTimeout(() => console.log("macro 1"), 0);
setTimeout(() => console.log("macro 2"), 0);

Promise.resolve().then(() => {
  console.log("micro 1");
  Promise.resolve().then(() => console.log("micro 1.1"));   // sinh thêm
});

Promise.resolve().then(() => console.log("micro 2"));

console.log("kết thúc");
```

Output:

```
bắt đầu
kết thúc
micro 1
micro 2
micro 1.1      ← vẫn chạy TRƯỚC mọi macrotask
macro 1
macro 2
```

`micro 1.1` được sinh ra trong lúc đang vét microtask, nhưng nó vẫn phải chạy xong trước khi chạm tới macrotask đầu tiên.

### Hệ quả: microtask vô hạn làm treo trang

```javascript
function treo() {
  Promise.resolve().then(treo);   // microtask sinh microtask vô tận
}
treo();
// Trang đóng băng vĩnh viễn — không bao giờ tới bước vẽ lại màn hình
```

Trong khi đó:

```javascript
function khongTreo() {
  setTimeout(khongTreo, 0);       // macrotask — giữa các lần có cơ hội vẽ
}
khongTreo();
// Trang vẫn dùng được, chỉ tốn CPU
```

Khác biệt này là câu hỏi phỏng vấn ở mức khó.

---

## 6. `setTimeout` và độ trễ

`setTimeout(fn, 1000)` **không** đảm bảo chạy sau đúng 1000ms. Nó đảm bảo chạy **không sớm hơn** 1000ms.

```javascript
setTimeout(() => console.log("timeout"), 0);

const ketThuc = Date.now() + 2000;
while (Date.now() < ketThuc) { }     // chiếm stack 2 giây

console.log("đồng bộ xong");
// "đồng bộ xong" rồi mới tới "timeout" — sau khoảng 2 giây
```

Callback đã sẵn sàng trong hàng đợi từ lâu, nhưng call stack còn bận nên event loop không đưa nó vào được.

### `setTimeout(fn, 0)` không thực sự là 0

Đặc tả HTML quy định: khi các `setTimeout` lồng nhau vượt quá 5 tầng, trình duyệt kẹp độ trễ tối thiểu ở **4ms**. Vì vậy `setTimeout(fn, 0)` trong vòng lặp lồng sâu sẽ chậm hơn bạn tưởng.

Cần một macrotask thật nhanh thì có `MessageChannel`, nhưng hiếm khi cần tới.

### `setInterval` và cái bẫy chồng lấn

```javascript
setInterval(() => {
  // Nếu việc này mất 1500ms mà interval là 1000ms?
}, 1000);
```

Trình duyệt không xếp chồng: nếu callback trước chưa xong, nó bỏ qua nhịp đó. Kết quả là khoảng cách thực tế không đều.

Cách chắc chắn hơn — tự lên lịch lại sau khi xong:

```javascript
function chay() {
  lamViec();
  setTimeout(chay, 1000);    // luôn cách đúng 1000ms sau khi việc xong
}
chay();
```

Nhớ luôn lưu id để dừng được:

```javascript
const id = setInterval(fn, 1000);
clearInterval(id);
```

---

## 7. `requestAnimationFrame`

Hàng đợi riêng cho việc vẽ. Callback chạy **ngay trước khi trình duyệt vẽ khung hình tiếp theo**, khoảng 60 lần mỗi giây.

```javascript
function chuyenDong() {
  hop.style.left = (x += 2) + "px";
  requestAnimationFrame(chuyenDong);
}
requestAnimationFrame(chuyenDong);
```

So với `setInterval(fn, 16)`: `requestAnimationFrame` đồng bộ với chu kỳ vẽ của màn hình nên mượt hơn, và tự động dừng khi tab bị ẩn (tiết kiệm pin).

**Quy tắc:** làm animation bằng JavaScript → dùng `requestAnimationFrame`, không dùng `setInterval`.

---

## 8. Callback và callback hell

Trước khi có Promise, mọi thứ bất đồng bộ đều viết bằng callback:

```javascript
layNguoiDung(id, function (user) {
  layDonHang(user.id, function (donHang) {
    layChiTiet(donHang[0].id, function (chiTiet) {
      laySanPham(chiTiet.maSP, function (sanPham) {
        console.log(sanPham);
      });
    });
  });
});
```

Gọi là **callback hell** hay "kim tự tháp của sự diệt vong". Vấn đề không chỉ là xấu:

- **Xử lý lỗi kinh khủng.** Mỗi tầng phải tự bắt lỗi riêng, không có chỗ bắt chung.
- **Không chạy song song dễ dàng.** Muốn gọi 3 API cùng lúc rồi chờ cả ba thì phải tự đếm thủ công.
- **Khó đọc ngược.** Luồng thực thi chạy từ trong ra ngoài.

Quy ước Node cũ là `callback(err, data)` — lỗi ở tham số đầu:

```javascript
doc(file, function (err, data) {
  if (err) return xuLyLoi(err);
  // ...
});
```

Promise (file `11`) sinh ra để giải quyết đúng những vấn đề này. Bạn cần thấy callback hell một lần để hiểu vì sao Promise tồn tại.

---

## 9. Đừng chặn luồng chính

Việc nặng chạy đồng bộ sẽ đóng băng giao diện:

```javascript
// XẤU — trang treo cho tới khi xong
function xuLyTrieuBanGhi(duLieu) {
  return duLieu.map(x => tinhToanNang(x));
}
```

**Cách 1 — chia nhỏ theo lô:**

```javascript
function xuLyTheoLo(duLieu, kichThuocLo = 1000) {
  let i = 0;
  const kq = [];

  function lo() {
    const het = Math.min(i + kichThuocLo, duLieu.length);
    for (; i < het; i++) {
      kq.push(tinhToanNang(duLieu[i]));
    }
    if (i < duLieu.length) {
      setTimeout(lo, 0);     // nhường luồng cho trình duyệt vẽ
    } else {
      xong(kq);
    }
  }

  lo();
}
```

Mỗi lô là một macrotask, và giữa các macrotask trình duyệt có cơ hội vẽ lại — nên trang vẫn phản hồi.

**Cách 2 — Web Worker** (luồng thật sự riêng biệt):

```javascript
const worker = new Worker("tinh-toan.js");
worker.postMessage(duLieu);
worker.onmessage = (e) => console.log(e.data);
```

Worker chạy ở luồng riêng, hoàn toàn không chặn giao diện. Đổi lại nó không truy cập được DOM. Bạn chưa cần dùng Worker ngay, nhưng nên biết nó tồn tại.

---

## 10. Node.js khác gì

Ngắn gọn, để bạn không bối rối khi đọc tài liệu:

- Node cũng có event loop nhưng chia thành nhiều **pha** (timers, poll, check, close)
- Node có thêm `process.nextTick()`, ưu tiên **cao hơn cả** microtask của Promise
- `setImmediate()` chỉ có ở Node

Với công việc Front-End, mô hình trình duyệt ở các mục trên là đủ. Biết có khác biệt là được.

---

## 11. Luyện đoán thứ tự

Đây là kỹ năng bị kiểm tra trực tiếp trong phỏng vấn. Quy trình làm:

1. **Quét lượt một:** ghi ra tất cả `console.log` **đồng bộ** theo thứ tự
2. **Quét lượt hai:** ghi các microtask theo thứ tự chúng được đăng ký
3. **Quét lượt ba:** ghi các macrotask theo thứ tự (cùng delay thì theo thứ tự đăng ký)
4. Nối ba danh sách lại, chú ý microtask sinh ra giữa chừng

### Ví dụ mẫu

```javascript
console.log("A");

setTimeout(() => {
  console.log("B");
  Promise.resolve().then(() => console.log("C"));
}, 0);

Promise.resolve().then(() => {
  console.log("D");
  setTimeout(() => console.log("E"), 0);
});

console.log("F");
```

**Lượt 1 — đồng bộ:** `A`, `F`

**Lượt 2 — microtask:** callback `.then` đầu tiên → in `D`, và đăng ký một `setTimeout` (macrotask, xếp **sau** cái của `B`)

**Lượt 3 — macrotask:**
- Macro 1: in `B`, sinh microtask in `C`
- Vét microtask → in `C`
- Macro 2: in `E`

**Kết quả:** `A F D B C E`

Điểm tinh tế: `C` chạy trước `E` dù `E` được đăng ký trước — vì sau mỗi macrotask, event loop vét sạch microtask rồi mới sang macrotask tiếp theo.

---

## 12. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Biến chưa có giá trị dù đã "gọi hàm lấy dữ liệu" | Code đồng bộ chạy trước callback bất đồng bộ | Xử lý bên trong callback / `await` (file `11`) |
| `setTimeout` chạy muộn hơn nhiều so với đặt | Call stack đang bận | Chia nhỏ công việc nặng |
| Vòng `for` + `var` + `setTimeout` in sai số | Closure dùng chung biến (file `05`) | Dùng `let` |
| Trang đóng băng hoàn toàn | Vòng lặp đồng bộ dài, hoặc microtask vô hạn | Chia lô, hoặc Web Worker |
| `setInterval` chạy chồng lấn | Callback lâu hơn chu kỳ | Tự lên lịch bằng `setTimeout` đệ quy |
| Animation giật | Dùng `setInterval` | `requestAnimationFrame` |
| Interval vẫn chạy sau khi component biến mất | Quên `clearInterval` | Lưu id và dọn dẹp |
| Đếm số lần gọi API ra nhiều hơn dự kiến | Không debounce sự kiện dày | `debounce` (file `05`) |

---

## 13. Tóm tắt cần thuộc

1. JavaScript **đơn luồng**, một call stack
2. Tính bất đồng bộ đến từ **môi trường chạy** (trình duyệt/Node), không phải từ engine
3. Call stack rỗng thì event loop mới đưa callback vào
4. Thứ tự: **đồng bộ hết → vét sạch microtask → một macrotask → vét microtask → vẽ → lặp lại**
5. Microtask: `.then`, `.catch`, `.finally`, code sau `await`, `queueMicrotask`
6. Macrotask: `setTimeout`, `setInterval`, sự kiện DOM, I/O
7. Microtask được **vét cạn**, kể cả cái sinh ra giữa chừng
8. Microtask vô hạn treo trang; macrotask vô hạn thì không
9. `setTimeout(fn, 0)` nghĩa là "sớm nhất có thể", không phải "ngay lập tức"
10. `setTimeout` lồng sâu bị kẹp tối thiểu 4ms
11. Animation dùng `requestAnimationFrame`
12. Việc nặng phải chia lô hoặc đẩy sang Web Worker

---

## Bài tập

Tạo `bai-tap-10/` với `index.html`, `main.js`, `du-doan.md`.

### Bài 1 — Đoán thứ tự output (bài chính)

**Quy tắc bắt buộc:** với mỗi đoạn, viết thứ tự bạn đoán vào `du-doan.md` **trước khi chạy**, kèm giải thích ngắn cho những chỗ bạn phải suy nghĩ. Chạy trước rồi điền thì bài này mất sạch giá trị.

```javascript
// --- Đoạn 1 ---
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
-> "A" "D" "C" "B"

// --- Đoạn 2 ---
console.log("1");
setTimeout(() => console.log("2"), 100);
setTimeout(() => console.log("3"), 0);
Promise.resolve().then(() => console.log("4"));
queueMicrotask(() => console.log("5"));
console.log("6");
-> "1" "6" "4" "5" "3" "2" 

// --- Đoạn 3 ---
console.log("start");
setTimeout(() => {
  console.log("timeout 1");
  Promise.resolve().then(() => console.log("promise trong timeout"));
}, 0);
Promise.resolve().then(() => {
  console.log("promise 1");
  setTimeout(() => console.log("timeout trong promise"), 0);
});
setTimeout(() => console.log("timeout 2"), 0);
console.log("end");
-> "start" "end" "promise 1" "timeout 1" "promise trong timeout" "timeout 2" "timeout trong promise"

// --- Đoạn 4 ---
Promise.resolve().then(() => {
  console.log("p1");
  Promise.resolve().then(() => {
    console.log("p2");
    Promise.resolve().then(() => console.log("p3"));
  });
});
setTimeout(() => console.log("t1"), 0);
-> "p1" "p2" "p3" "t1"

// --- Đoạn 5 ---
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var", i), 0);
}
-> "var 3" "var 3" "var 3"
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let", j), 0);
}
-> "let 0" "let 1" "let 2"

// --- Đoạn 6 ---
console.log("A");
setTimeout(() => console.log("B"), 0);
const het = Date.now() + 500;
while (Date.now() < het) {}
console.log("C");
Promise.resolve().then(() => console.log("D"));
console.log("E");
-> "A" "C" "E" "D" "B"

// --- Đoạn 7 ---
const nut = document.querySelector("#nut");
nut.addEventListener("click", () => {
  console.log("click 1");
  Promise.resolve().then(() => console.log("micro trong click"));
});
nut.addEventListener("click", () => console.log("click 2"));
nut.click();
console.log("sau khi click");
// Đoạn này tinh tế — nut.click() gọi handler ĐỒNG BỘ hay bất đồng bộ?
-> "click 1" "click 2" "sau khi click" "micro trong click" 

// --- Đoạn 8 ---
console.log("1");
setTimeout(() => {
  console.log("2");
  setTimeout(() => console.log("3"), 0);
  Promise.resolve().then(() => console.log("4"));
}, 0);
Promise.resolve().then(() => {
  console.log("5");
  setTimeout(() => console.log("6"), 0);
});
console.log("7");
-> "1" "7" "5" "2" "4" "6" "3"

// --- Đoạn 9 ---
function f() {
  console.log("f bắt đầu");
  Promise.resolve().then(() => console.log("f microtask"));
  console.log("f kết thúc");
}
setTimeout(f, 0);
Promise.resolve().then(() => console.log("ngoài microtask"));
console.log("đồng bộ");
-> "đồng bộ" "ngoài microtask" "f bắt đầu" "f kết thúc" "f microtask"

// --- Đoạn 10 ---
let dem = 0;
const id = setInterval(() => {
  dem++;
  console.log("interval", dem);
  if (dem === 3) clearInterval(id);
}, 0);
Promise.resolve().then(() => console.log("promise"));
setTimeout(() => console.log("timeout"), 0);
console.log("sync");
-> "sync" "promise" "interval 1" "timeout" "interval 2" "interval 3"
```

Đoạn 7 là đoạn tinh tế nhất — suy nghĩ kỹ trước khi chạy.

### Bài 2 — Trực quan hóa call stack

Tạo `bai-tap-10/truc-quan/`. Dựng giao diện hiển thị ba cột: **Call Stack**, **Microtask Queue**, **Task Queue**.

Viết hàm `moPhong(cacBuoc)` nhận một kịch bản và hiển thị từng bước với độ trễ, để "xem" event loop hoạt động:

```javascript
const kichBan = [
  { hanhDong: "push", cot: "stack", nhan: "main()" },
  { hanhDong: "log", nhan: "A" },
  { hanhDong: "push", cot: "task", nhan: "setTimeout cb" },
  { hanhDong: "push", cot: "micro", nhan: "then cb" },
  { hanhDong: "pop", cot: "stack" },
  { hanhDong: "move", tu: "micro", den: "stack" },
  // ...
];
```

Không cần đẹp. Mục đích là bạn phải **tự viết ra thứ tự các bước**, và chính việc đó làm rõ mô hình trong đầu.

### Bài 3 — Chứng minh việc chặn luồng

Tạo `bai-tap-10/chan-luong/`:

```html
<button id="dem">Bấm tôi: <span id="so">0</span></button>
<div id="quay" style="width:50px;height:50px;background:red"></div>
<hr>
<button id="nang-dong-bo">Chạy việc nặng (đồng bộ)</button>
<button id="nang-chia-lo">Chạy việc nặng (chia lô)</button>
<p id="tien-do"></p>
```

1. Cho hình vuông `#quay` xoay liên tục bằng `requestAnimationFrame`
2. Nút `#dem` tăng bộ đếm mỗi lần bấm
3. `#nang-dong-bo` chạy một vòng lặp tính toán 3 giây **đồng bộ**
4. `#nang-chia-lo` chạy cùng khối lượng đó nhưng **chia lô** bằng `setTimeout`, cập nhật `#tien-do` theo phần trăm

Trong lúc mỗi nút chạy, thử bấm `#dem` và quan sát hình vuông. Ghi vào `du-doan.md`:
- Hình vuông có dừng xoay không, ở trường hợp nào? -> có dừng khi bấm chạy việc nặng( cả 2 trường hợp)
  ❌ SAI — chỉ dừng ở `nangDongBo` (đồng bộ). Ở `nangChiaLo`, hình vuông vẫn tiếp tục xoay
  (có thể hơi giật nhẹ mỗi 50ms) vì `requestAnimationFrame` chạy được ngay trong khoảng
  "nhường luồng" giữa hai lô — đó chính là điểm khác biệt cốt lõi mà bài này muốn chứng minh.
  Nếu cả hai trường hợp đều làm hình vuông đứng hình như nhau thì chia lô coi như không có tác dụng gì.
- Bấm `#dem` trong lúc chạy đồng bộ thì chuyện gì xảy ra? Số có tăng không, tăng lúc nào? -> số sẽ tăng sau khi chạy đồng bộ xong với nặng đồng bộ còn với chia lô thì sẽ tăng ngay lập tức dó 50ms là nhanh nên mình sẽ thấy gần như ngay lập tức
- Vì sao chia lô lại giữ được giao diện phản hồi? -> Vì mỗi lần macrotask chỉ chiếm 50ms sau đó trả về trình duyệt vẽ rồi mới lấy macrotask tiếp

Câu hỏi thứ hai đáng suy nghĩ: click **không bị mất**, nó được xếp hàng. Hiểu vì sao là hiểu event loop.

### Bài 4 — Callback hell rồi gỡ ra

**Phần A.** Viết bốn hàm giả lập gọi API bằng `setTimeout`, theo quy ước `callback(err, data)`:

```javascript
function layUser(id, cb)        { /* trễ 300ms */ }
function layDonHang(userId, cb) { /* trễ 300ms */ }
function layChiTiet(donId, cb)  { /* trễ 300ms */ }
function laySanPham(maSP, cb)   { /* trễ 300ms */ }
```

Cho mỗi hàm có khoảng 20% khả năng trả về lỗi (dùng `Math.random()`).

**Phần B.** Gọi lồng nhau đủ bốn tầng để lấy được sản phẩm cuối cùng, xử lý lỗi ở **từng** tầng. Đếm số dòng code dành riêng cho xử lý lỗi.

**Phần C.** Thêm yêu cầu: gọi `layDonHang` cho **ba** user cùng lúc, chờ cả ba xong rồi mới in kết quả. Làm bằng callback thuần — bạn phải tự đếm số lần hoàn thành.

**Phần D.** Ghi vào `du-doan.md`: ba khó khăn cụ thể bạn gặp khi làm phần B và C. Giữ lại file này — sang file `11` bạn sẽ viết lại toàn bộ bằng Promise và so sánh.

### Bài 5 — Bộ đếm giờ

Viết `taoDongHoBam()` trả về object có `batDau()`, `dung()`, `tiepTuc()`, `datLai()`, `layThoiGian()`.

Yêu cầu:
- Hiển thị đến **phần trăm giây** (`00:00.00`)
- **Không** dùng `setInterval` để cộng dồn — vì `setInterval` trôi sai. Thay vào đó lưu `Date.now()` lúc bắt đầu và tính hiệu.
- Dùng `requestAnimationFrame` để cập nhật hiển thị
- Dừng rồi tiếp tục phải đúng, không mất thời gian đã trôi
- Trạng thái lưu trong closure, không truy cập được từ ngoài (file `05`)

Kiểm chứng: chạy đồng hồ 60 giây, so với đồng hồ điện thoại. Sai lệch phải dưới 0.1 giây. Nếu bạn cài bằng `setInterval` cộng dồn, sai lệch sẽ thấy rõ — thử cả hai cách và ghi số liệu vào `du-doan.md`.

### Bài 6 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. JavaScript đơn luồng, vậy làm sao nó xử lý được nhiều việc cùng lúc?
2. Event loop hoạt động thế nào? Kể đủ các bước.
3. Microtask và macrotask khác nhau ra sao? Cái nào ưu tiên hơn, và vì sao điều đó quan trọng?
4. Vì sao `setTimeout(fn, 1000)` có thể chạy sau nhiều hơn 1000ms?
5. Vì sao microtask vô hạn làm treo trang mà macrotask vô hạn thì không?
6. Callback hell là gì? Ba vấn đề cụ thể của nó — dựa trên trải nghiệm bài 4.

---

## Xong file này khi

- [ ] Bài 1 đủ 10 đoạn, phần đoán viết **trước** khi chạy
- [ ] Đoán đúng ít nhất 7/10 đoạn ở lần đầu; đoạn sai đều có giải thích nguyên nhân
- [ ] Giải thích được đoạn 7 (`nut.click()` chạy đồng bộ hay không)
- [ ] Bài 3 tự tay thấy trang đóng băng, và thấy chia lô giải quyết được
- [ ] Bài 4 làm xong cả phần C, và **giữ lại file** để dùng ở file `11`
- [ ] Đồng hồ bấm giờ sai lệch dưới 0.1 giây sau 60 giây
- [ ] Trả lời được 6 câu ở bài 6 **bằng lời**, đặc biệt câu 2 và 3

File tiếp theo (`11-promise-va-async-await`) sẽ dùng chính bài 4 làm điểm khởi đầu — bạn sẽ viết lại callback hell bằng Promise và thấy khác biệt ngay trên code của mình.

Xong thì gửi mình `main.js` + `du-doan.md`, kèm **"viết file 11-promise-va-async-await"**.