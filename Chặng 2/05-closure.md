# 05 — Closure

> **Cần có trước:** xong `02` (đặc biệt mục lexical scope) và `04`.
> **Thời gian:** 4–5 giờ.
> **Vì sao quan trọng:** đây là khái niệm bị hỏi nhiều nhất trong phỏng vấn Front-End. Nhưng quan trọng hơn: `useState` của React chạy được là nhờ closure, mọi hàm `debounce` bạn viết đều là closure, mọi callback giữ được dữ liệu đều là closure. Bạn đã dùng closure từ file `02` mà không biết tên nó.

---

## 1. Nhắc lại nền tảng

Nhớ lại lexical scope ở file `02`:

> Scope được quyết định bởi **vị trí hàm được viết ra**, không phải nơi hàm được gọi.

Và hàm là giá trị — truyền được, trả về được:

```javascript
function taoNhanBoi(heSo) {
  return function (x) {
    return x * heSo;
  };
}

const nhanDoi = taoNhanBoi(2);
console.log(nhanDoi(5));   // 10
```

Đây là ví dụ ở cuối file `02`, lúc đó mình bảo để dành. Giờ mổ xẻ nó.

---

## 2. Câu hỏi cốt lõi

```javascript
function taoNhanBoi(heSo) {
  return function (x) {
    return x * heSo;
  };
}

const nhanDoi = taoNhanBoi(2);
// taoNhanBoi đã chạy xong. Nó đã return. Nó biến mất khỏi call stack.
// Biến heSo của nó đáng lẽ phải bị dọn đi.

console.log(nhanDoi(5));   // 10 — nhưng heSo vẫn còn đó!
```

Theo trực giác thông thường: hàm chạy xong thì biến cục bộ của nó bị hủy. Nhưng ở đây `heSo` vẫn sống.

**Vì sao?**

Vì hàm bên trong vẫn giữ một tham chiếu tới môi trường nơi nó được sinh ra. Chừng nào hàm bên trong còn tồn tại, môi trường đó không bị dọn.

Hiện tượng này gọi là **closure**.

---

## 3. Định nghĩa

> **Closure là một hàm cùng với môi trường từ vựng nơi nó được tạo ra.**

Ba từ khóa cần hiểu:

- **hàm** — bản thân đoạn code
- **môi trường từ vựng** — tập các biến mà hàm nhìn thấy được tại nơi nó được **viết ra**
- **cùng với** — hai thứ này dính liền nhau, đi đâu cũng mang theo

Cách nói ngắn gọn cho phỏng vấn:

> *Closure là khi một hàm vẫn truy cập được các biến ở scope bên ngoài, ngay cả khi hàm bên ngoài đó đã chạy xong.*

Một điểm kỹ thuật ít người biết: về mặt định nghĩa, **mọi hàm trong JavaScript đều là closure**, vì hàm nào cũng giữ tham chiếu tới scope chứa nó. Nhưng ta chỉ gọi tên "closure" khi tính chất đó tạo ra hành vi đáng chú ý — tức là khi hàm bên trong sống lâu hơn hàm bên ngoài.

---

## 4. Mô hình trong đầu

Đừng nghĩ closure là "hàm sao chép giá trị". Nó **không sao chép**. Nó giữ **tham chiếu** tới ô nhớ.

Bằng chứng:

```javascript
function taoBoDem() {
  let dem = 0;

  return function () {
    dem = dem + 1;      // đọc VÀ ghi cùng một ô nhớ
    return dem;
  };
}

const tang = taoBoDem();
console.log(tang());   // 1
console.log(tang());   // 2
console.log(tang());   // 3
```

Nếu closure sao chép giá trị, mỗi lần gọi `tang()` sẽ đều trả về `1`. Nó trả về `1, 2, 3` chứng tỏ cả ba lần gọi đều thao tác trên **cùng một biến `dem`**.

### Mỗi lần gọi hàm ngoài tạo ra một môi trường mới

```javascript
const demA = taoBoDem();
const demB = taoBoDem();

console.log(demA());   // 1
console.log(demA());   // 2
console.log(demB());   // 1  ← độc lập hoàn toàn với demA
console.log(demA());   // 3
```

Gọi `taoBoDem()` hai lần tạo ra hai môi trường riêng biệt, mỗi cái có một biến `dem` riêng. Đây là điểm khiến closure hữu dụng: nó tạo ra **trạng thái riêng tư, độc lập**.

### Hình dung

Hãy hình dung mỗi lần gọi `taoBoDem()`:

1. Một hộp mới được tạo ra, bên trong có biến `dem = 0`
2. Một hàm mới được tạo ra, trên hàm đó dán nhãn "hộp của tôi là hộp số 1"
3. `taoBoDem` kết thúc, nhưng hộp không bị vứt vì còn hàm đang trỏ vào
4. Mỗi lần gọi hàm đó, nó mở đúng hộp của mình ra dùng

Gọi `taoBoDem()` lần nữa thì có hộp số 2, không liên quan gì hộp số 1.

---

## 5. Closure trong vòng lặp

Đây là ví dụ ở file `01` mà mình hẹn giải thích. Giờ bạn có đủ nền để hiểu.

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100);
}
// In ra: 3, 3, 3
```

### Vì sao ra `3, 3, 3`

`var` có phạm vi hàm, không phải phạm vi khối. Nên trong toàn bộ vòng lặp chỉ tồn tại **một biến `i` duy nhất**.

Cả ba hàm callback đều là closure trỏ vào **cùng một ô nhớ `i`** đó.

`setTimeout` không chạy callback ngay — nó xếp hàng đợi (cơ chế đầy đủ ở file `10`). Đến lúc callback chạy, vòng lặp đã kết thúc từ lâu và `i` đã tăng đến `3` (giá trị làm điều kiện `i < 3` sai).

Cả ba callback mở cùng một hộp, và trong hộp đó `i` đang là `3`.

### Vì sao `let` lại đúng

```javascript
for (let j = 0; j < 3; j++) {
  setTimeout(function () {
    console.log(j);
  }, 100);
}
// In ra: 0, 1, 2
```

Đặc tả JavaScript quy định: với `let` trong vòng `for`, **mỗi vòng lặp tạo ra một binding mới** cho biến đó, và giá trị được sao chép sang binding mới ở đầu mỗi vòng.

Nói cách khác, có **ba** biến `j` riêng biệt, giữ giá trị `0`, `1`, `2`. Ba closure trỏ vào ba hộp khác nhau.

Đây không phải hành vi tình cờ — nó được thiết kế có chủ đích chính vì mẫu code này quá phổ biến và quá dễ sai.

### Cách sửa với `var` (thời chưa có `let`)

Dùng IIFE để tạo scope mới thủ công:

```javascript
for (var i = 0; i < 3; i++) {
  (function (biCopy) {
    setTimeout(function () {
      console.log(biCopy);
    }, 100);
  })(i);
}
// 0, 1, 2
```

Mỗi vòng lặp gọi IIFE một lần, tạo một scope hàm mới, và `i` được **truyền vào làm đối số** — mà đối số primitive thì truyền theo giá trị (nhớ file `01`). Nên mỗi scope có bản sao riêng.

Cách thứ hai, dùng tham số thứ ba của `setTimeout`:

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function (x) {
    console.log(x);
  }, 100, i);      // đối số từ thứ ba trở đi được truyền vào callback
}
```

Bạn sẽ gặp cả hai cách này khi đọc code cũ.

---

## 6. Closure dùng để làm gì

Phần này quan trọng ngang phần lý thuyết. Phỏng vấn hỏi "closure là gì" thì ai cũng trả lời được; hỏi "bạn dùng nó ở đâu" mới lộ ra ai đã thật sự viết code.

### 6.1. Biến riêng tư

JavaScript không có `private` như Java. Closure là cách kinh điển để mô phỏng.

```javascript
function taoTaiKhoan(soDuBanDau) {
  let soDu = soDuBanDau;          // không ai bên ngoài chạm được

  return {
    napTien(soTien) {
      if (soTien <= 0) throw new Error("Số tiền phải dương");
      soDu += soTien;
      return soDu;
    },
    rutTien(soTien) {
      if (soTien > soDu) throw new Error("Không đủ số dư");
      soDu -= soTien;
      return soDu;
    },
    xemSoDu() {
      return soDu;
    }
  };
}

const tk = taoTaiKhoan(1000);
tk.napTien(500);        // 1500
tk.xemSoDu();           // 1500

tk.soDu;                // undefined — không truy cập trực tiếp được
tk.soDu = 999999;       // tạo thuộc tính mới vô hại, không đụng tới soDu thật
tk.xemSoDu();           // 1500 — vẫn nguyên
```

Điểm mấu chốt: `soDu` chỉ thay đổi được qua các hàm đã kiểm tra điều kiện. Không có cách nào đặt số dư âm hay số dư tùy ý từ bên ngoài.

Ghi chú: JavaScript hiện đại có trường riêng tư trong class (`#soDu`) làm được điều tương tự. Nhưng mẫu closure vẫn dùng rộng rãi, và vẫn là câu hỏi phỏng vấn.

### 6.2. Module pattern

Cùng ý tưởng, áp cho cả một module:

```javascript
const gioHang = (function () {
  // --- Riêng tư ---
  let danhSach = [];

  function tinhTong() {
    return danhSach.reduce((t, sp) => t + sp.gia * sp.soLuong, 0);
  }

  // --- Công khai ---
  return {
    them(sp) {
      const daCo = danhSach.find(x => x.ma === sp.ma);
      if (daCo) {
        daCo.soLuong += 1;
      } else {
        danhSach.push({ ...sp, soLuong: 1 });
      }
      return this;             // cho phép nối chuỗi
    },
    xoa(ma) {
      danhSach = danhSach.filter(sp => sp.ma !== ma);
      return this;
    },
    xemGio() {
      return [...danhSach];    // trả bản sao, không trả mảng gốc
    },
    tongTien() {
      return tinhTong();
    }
  };
})();

gioHang.them({ ma: "SP1", gia: 100 }).them({ ma: "SP1", gia: 100 });
console.log(gioHang.tongTien());   // 200
console.log(gioHang.danhSach);     // undefined
```

Chú ý `xemGio` trả về `[...danhSach]` chứ không trả `danhSach`. Nếu trả thẳng mảng gốc thì người bên ngoài sửa được nó (nhớ tham chiếu ở file `01`), và cả cái vỏ bọc riêng tư trở nên vô nghĩa.

Ngày nay ES module (file `13`) làm việc này gọn hơn. Nhưng mẫu này vẫn xuất hiện dày đặc trong code cũ, và hiểu nó giúp bạn hiểu vì sao module tồn tại.

### 6.3. Function factory

```javascript
function taoLoiChao(loiChao) {
  return function (ten) {
    return `${loiChao}, ${ten}!`;
  };
}

const chaoBuoiSang = taoLoiChao("Chào buổi sáng");
const chaoTamBiet  = taoLoiChao("Tạm biệt");

chaoBuoiSang("An");     // "Chào buổi sáng, An!"
chaoTamBiet("Bình");    // "Tạm biệt, Bình!"
```

Ứng dụng thật — tạo hàm kiểm tra dữ liệu:

```javascript
function taoKiemTraDoDai(min, max) {
  return function (chuoi) {
    const n = chuoi.trim().length;
    if (n < min) return `Phải có ít nhất ${min} ký tự`;
    if (n > max) return `Không quá ${max} ký tự`;
    return null;
  };
}

const kiemTraTen    = taoKiemTraDoDai(2, 50);
const kiemTraMatKhau = taoKiemTraDoDai(8, 100);

kiemTraTen("A");           // "Phải có ít nhất 2 ký tự"
kiemTraMatKhau("123");     // "Phải có ít nhất 8 ký tự"
```

### 6.4. Chỉ chạy một lần

```javascript
function chiMotLan(fn) {
  let daChay = false;
  let ketQua;

  return function (...args) {
    if (daChay) return ketQua;
    daChay = true;
    ketQua = fn(...args);
    return ketQua;
  };
}

const khoiTao = chiMotLan(() => {
  console.log("Đang khởi tạo...");
  return { sanSang: true };
});

khoiTao();   // in "Đang khởi tạo...", trả về object
khoiTao();   // không in gì, trả về đúng object cũ
khoiTao();   // không in gì
```

Hữu ích cho: khởi tạo kết nối, chống người dùng bấm nút gửi hai lần.

### 6.5. Ghi nhớ kết quả (memoize)

```javascript
function ghiNho(fn) {
  const cache = new Map();

  return function (...args) {
    const khoa = JSON.stringify(args);

    if (cache.has(khoa)) {
      console.log("Lấy từ cache");
      return cache.get(khoa);
    }

    const kq = fn(...args);
    cache.set(khoa, kq);
    return kq;
  };
}

const tinhNang = ghiNho((n) => {
  console.log("Đang tính...");
  let t = 0;
  for (let i = 0; i < n; i++) t += i;
  return t;
});

tinhNang(1000000);   // "Đang tính..." — chậm
tinhNang(1000000);   // "Lấy từ cache" — tức thì
```

`cache` sống nhờ closure. Nó không phải biến toàn cục, và mỗi hàm được bọc có cache riêng.

Lưu ý thực tế: `JSON.stringify(args)` chỉ dùng được khi đối số là dữ liệu thuần. Với đối số là hàm hoặc object có vòng tham chiếu thì cách này không hoạt động.

### 6.6. Debounce

Đây là hàm bạn sẽ viết trong công việc thật, và cũng là bài tập chính của file này.

**Bài toán:** ô tìm kiếm gọi API mỗi lần người dùng gõ một ký tự. Gõ "bàn phím cơ" là 11 lần gọi API. Lãng phí và chậm.

**Giải pháp:** chỉ gọi API sau khi người dùng **ngừng gõ** một khoảng thời gian.

```javascript
function debounce(fn, delay) {
  let idTimer;                       // sống nhờ closure

  return function (...args) {
    clearTimeout(idTimer);           // hủy lịch hẹn cũ
    idTimer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const timKiem = debounce((tuKhoa) => {
  console.log("Gọi API với:", tuKhoa);
}, 500);

// Người dùng gõ nhanh
timKiem("b");
timKiem("ba");
timKiem("bàn");
// Sau 500ms kể từ lần gõ CUỐI: chỉ in "Gọi API với: bàn"
```

Closure ở đây giữ `idTimer` giữa các lần gọi. Không có closure, mỗi lần gọi sẽ có `idTimer` mới và `clearTimeout` không hủy được gì.

### 6.7. Throttle

Anh em với debounce nhưng khác mục đích:

```javascript
function throttle(fn, khoang) {
  let choPhep = true;

  return function (...args) {
    if (!choPhep) return;
    fn(...args);
    choPhep = false;
    setTimeout(() => { choPhep = true; }, khoang);
  };
}
```

Khác biệt:

- **Debounce** — chờ đến khi *ngừng* rồi mới chạy một lần. Dùng cho: ô tìm kiếm, tự động lưu, validate form.
- **Throttle** — chạy đều đặn tối đa `n` lần mỗi khoảng thời gian. Dùng cho: sự kiện cuộn trang, thay đổi kích thước cửa sổ, theo dõi chuột.

Câu phân biệt hai cái này rất hay bị hỏi.

### 6.8. Currying

```javascript
const cong = (a) => (b) => (c) => a + b + c;

cong(1)(2)(3);     // 6

const cong1 = cong(1);
const cong1va2 = cong1(2);
cong1va2(10);      // 13
```

Mỗi tầng là một closure giữ đối số của tầng trước. Bạn sẽ ít viết currying kiểu này, nhưng gặp nó trong Redux và một số thư viện.

---

## 7. Closure và bộ nhớ

Closure giữ biến sống, nên dùng sai có thể gây rò rỉ bộ nhớ.

```javascript
function taoVanDe() {
  const duLieuLon = new Array(1000000).fill("x");   // ~vài MB

  return function () {
    return "xin chào";      // không hề dùng duLieuLon
  };
}

const f = taoVanDe();
// Chừng nào f còn sống, duLieuLon có nguy cơ không được dọn
```

Thực tế các engine hiện đại (V8 trong Chrome) có tối ưu: chúng phân tích xem hàm bên trong **thực sự tham chiếu** biến nào, và chỉ giữ lại những biến đó. Nên ví dụ trên thường không rò rỉ.

Nhưng vấn đề thật vẫn tồn tại khi bạn **có** dùng biến:

```javascript
function gan(element) {
  const duLieuLon = new Array(1000000).fill("x");

  element.addEventListener("click", function () {
    console.log(duLieuLon.length);   // có dùng → phải giữ
  });
}
```

Chừng nào listener chưa được gỡ, `duLieuLon` còn nằm trong bộ nhớ. Với một trang chạy lâu và gắn hàng trăm listener, đây là rò rỉ thật.

**Cách phòng:**

```javascript
function gan(element) {
  const duLieuLon = new Array(1000000).fill("x");
  const doDai = duLieuLon.length;      // chỉ giữ thứ cần

  const handler = () => console.log(doDai);
  element.addEventListener("click", handler);

  // Trả về hàm dọn dẹp
  return () => element.removeEventListener("click", handler);
}
```

Mẫu "trả về hàm dọn dẹp" này chính là thứ bạn sẽ viết trong `useEffect` của React ở file `06` của chặng 4.

---

## 8. Stale closure — cái bẫy sẽ gặp ở React

Closure chụp lại môi trường tại thời điểm hàm được **tạo ra**. Nếu môi trường đó cũ, bạn có "closure cũ" (stale closure).

```javascript
function viDu() {
  let dem = 0;

  const in1 = () => console.log("Ngay lúc tạo:", dem);

  dem = 100;

  const in2 = () => console.log("Sau khi đổi:", dem);

  in1();   // 100 — cả hai đều thấy giá trị MỚI, vì cùng một biến
  in2();   // 100
}
```

Trường hợp trên không có vấn đề vì cùng một biến. Vấn đề xảy ra khi mỗi lần chạy tạo ra **biến mới**:

```javascript
function moPhongReact() {
  let dem = 0;                     // mỗi lần gọi moPhongReact tạo `dem` MỚI

  setTimeout(() => {
    console.log(dem);              // closure này gắn với `dem` của LẦN NÀY
  }, 1000);

  dem = 5;
}
```

Ở React, mỗi lần component render là một lần hàm component chạy lại, sinh ra bộ biến mới. Một callback được tạo ở lần render thứ 1 sẽ mãi mãi nhìn thấy state của lần render thứ 1 — kể cả khi nó chạy ở thời điểm state đã là lần render thứ 10.

```javascript
// Bug điển hình ở React (xem trước, chưa cần hiểu cú pháp)
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);       // `count` bị đóng băng ở giá trị lần render đầu
  }, 1000);
  return () => clearInterval(id);
}, []);                        // mảng rỗng → effect chỉ chạy một lần
```

Bộ đếm sẽ dừng ở `1` mãi mãi. Cách sửa dùng dạng hàm: `setCount(c => c + 1)`.

Bạn chưa cần hiểu hết cú pháp React lúc này. Mục đích của mục này là: **khi bạn gặp bug đó ở chặng 4, bạn sẽ nhớ ra tên nó và biết nguyên nhân nằm ở đây.**

---

## 9. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Vòng lặp `var` + `setTimeout` in ra toàn số cuối | Ba closure dùng chung một biến | Đổi sang `let`, hoặc IIFE |
| Debounce không hoạt động, vẫn gọi mỗi lần gõ | Tạo hàm debounce **bên trong** handler, mỗi lần một `idTimer` mới | Tạo hàm debounce một lần, bên ngoài |
| Biến "riêng tư" vẫn sửa được từ ngoài | Trả về thẳng mảng/object gốc | Trả bản sao: `[...danhSach]` |
| Callback đọc giá trị cũ | Stale closure | Dùng dạng cập nhật theo hàm, hoặc `useRef` ở React |
| Bộ đếm luôn trả về `1` | Gọi hàm factory lại mỗi lần thay vì giữ kết quả | Gọi factory **một lần**, lưu vào biến |
| Trang chậm dần theo thời gian | Listener + closure không được gỡ | `removeEventListener` khi không dùng nữa |
| Tất cả nút bấm đều xử lý item cuối cùng | Closure trong vòng lặp gắn listener | Dùng `let`, hoặc event delegation (file `09`) |

Lỗi hàng thứ hai đáng nói kỹ, vì rất hay gặp:

```javascript
// SAI — mỗi lần gõ tạo một hàm debounce mới
input.addEventListener("input", (e) => {
  const f = debounce(goiAPI, 500);
  f(e.target.value);
});

// ĐÚNG — tạo một lần, dùng nhiều lần
const timKiemDebounce = debounce(goiAPI, 500);
input.addEventListener("input", (e) => {
  timKiemDebounce(e.target.value);
});
```

---

## 10. Trả lời phỏng vấn thế nào

Khi bị hỏi "Closure là gì?", trả lời theo ba nhịp:

**1. Định nghĩa (1 câu):**
> Closure là hàm cùng với môi trường từ vựng nơi nó được tạo ra. Nó vẫn truy cập được biến của scope ngoài kể cả khi hàm ngoài đã chạy xong.

**2. Ví dụ ngắn (30 giây):** viết bộ đếm ra giấy hoặc bảng.

**3. Ứng dụng thật (quan trọng nhất):**
> Em dùng nó khi viết hàm debounce cho ô tìm kiếm — `idTimer` được giữ giữa các lần gọi nhờ closure. Ngoài ra dùng để tạo biến riêng tư, và ở React thì mọi hook đều dựa trên closure.

Nhịp thứ ba là nhịp phân biệt. Rất nhiều ứng viên dừng ở nhịp một.

---

## 11. Tóm tắt cần thuộc

1. Closure = hàm + môi trường từ vựng nơi nó được tạo ra
2. Closure giữ **tham chiếu**, không sao chép giá trị
3. Mỗi lần gọi hàm ngoài tạo ra một môi trường mới, độc lập
4. `var` trong vòng lặp: một biến chung → mọi closure thấy giá trị cuối
5. `let` trong vòng lặp: mỗi vòng một binding mới → mỗi closure thấy giá trị riêng
6. Ứng dụng: biến riêng tư, module pattern, factory, once, memoize, debounce, throttle, currying
7. Debounce chờ ngừng rồi chạy; throttle chạy đều đặn có giới hạn
8. Closure giữ biến sống → gỡ listener khi không dùng để tránh rò rỉ
9. Stale closure: callback nhìn thấy giá trị của thời điểm nó được tạo
10. Khi trả lời phỏng vấn, luôn kèm ứng dụng thật

---

## Bài tập

Tạo `bai-tap-05/` với `index.html`, `main.js`, `du-doan.md`.

### Bài 1 — Đoán output

Ghi phần đoán vào `du-doan.md` trước khi chạy:

```javascript
// A
function f() {
  let x = 0;
  return () => ++x;
}
const a = f();
const b = f();
console.log(a(), a(), b(), a()); -> 1 2 1 3

// B
function g() {
  let x = 0;
  return () => ++x;
}
console.log(g()(), g()(), g()()); -> 1 1 1

// C
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 0);
} -> 3 3 3
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 0);
} -> 0 1 2
// SAI — đáp án đúng: 0 1 2 (không phải 1 2 3)
// `let` tạo MỘT binding mới cho mỗi vòng lặp, mang giá trị j tại thời điểm bắt đầu vòng đó (0, 1, 2).
// j chỉ tăng lên 3 sau khi thân vòng thứ 3 (ứng với j=2) chạy xong và điều kiện j<3 thất bại —
// không có closure nào "thấy" được giá trị 3. Bạn đang nhớ nhầm sang kết quả kiểu var (câu D).

// D
function h() {
  const ds = [];
  for (var i = 0; i < 3; i++) {
    ds.push(() => i);
  }
  return ds;
}
console.log(h().map(fn => fn())); -> 3 3 3

// E
function k() {
  let n = 0;
  return {
    tang: () => ++n,
    giam: () => --n,
    xem: () => n
  };
}
const c = k();
c.tang(); c.tang(); c.giam();
console.log(c.xem()); -> 1
console.log(c.n); -> undefine

// F
let bien = "ngoài";
function outer() {
  console.log(bien);
  let bien = "trong";
}
outer(); -> "ngoài"
// SAI — đáp án đúng: ReferenceError: Cannot access 'bien' before initialization
// Vì trong `outer` có khai báo `let bien = "trong"`, biến `bien` cục bộ được hoisted lên đầu
// scope hàm nhưng nằm trong TDZ cho tới đúng dòng khai báo. Dòng console.log(bien) tham chiếu
// tới `bien` CỤC BỘ (che mất biến "ngoài" ở scope ngoài do cùng tên) — nhưng lúc đó nó chưa được
// khởi tạo nên ném lỗi ngay, KHÔNG rơi xuống dùng biến "ngoài" ở scope cha. Đây đúng là bẫy TDZ
// mà ghi chú phía dưới đang nhắc bạn. -> OK
```

Câu B khác câu A ở một chỗ nhỏ nhưng kết quả hoàn toàn khác — giải thích rõ vì sao. -> vì đều là tạo mới nên nó không liên quan tới nhau

> CHƯA ĐỦ — mới giải thích được vì sao B ra `1 1 1`, còn thiếu vế quan trọng hơn: tại sao A **không** bị reset như B.
> Khác biệt thật sự: ở A, `f()` chỉ gọi **2 lần** để tạo `a` và `b`, sau đó gọi lại **chính `a`/`b`** nhiều lần —
> mỗi lần gọi `a()` dùng chung một `x` đã tồn tại từ trước (closure của `a` sống xuyên suốt giữa các lần gọi).
> Ở B, `g()` được gọi **3 lần riêng biệt** ngay trong `console.log`, mỗi lần gọi `g()` tạo `x` hoàn toàn mới
> rồi gọi luôn — không giữ tham chiếu hàm lại để gọi tiếp, nên không lần nào "kế thừa" `x` của lần trước.
Câu F là bẫy TDZ từ file `02`, xem bạn còn nhớ không.

### Bài 2 — Bộ đếm

Viết hàm `taoBoDem(batDau = 0, buoc = 1)` trả về object có:

- `tang()` — tăng theo `buoc`, trả giá trị mới
- `giam()` — giảm theo `buoc`, trả giá trị mới
- `datLai()` — về `batDau`
- `xem()` — xem giá trị hiện tại
- `lichSu()` — trả về mảng các giá trị đã đi qua, kể cả giá trị ban đầu

Yêu cầu:
- Không truy cập được biến đếm từ bên ngoài
- `lichSu()` phải trả về bản sao, sửa nó không ảnh hưởng bên trong
- Hai bộ đếm tạo ra phải hoàn toàn độc lập — viết code chứng minh

### Bài 3 — Debounce (bài chính)

**Phần A.** Viết `debounce(fn, delay)` theo mô tả ở mục 6.6.

**Phần B.** Dựng giao diện thật trong `index.html`:

```html
<input id="o-tim" placeholder="Nhập từ khóa...">
<p>Số lần gõ: <span id="so-lan-go">0</span></p>
<p>Số lần gọi API: <span id="so-lan-api">0</span></p>
<div id="ket-qua"></div>
```

Yêu cầu:
- Mỗi lần gõ tăng `so-lan-go`
- Chỉ sau khi ngừng gõ 500ms mới "gọi API" (giả lập bằng `console.log` và tăng `so-lan-api`)
- Gõ "bàn phím" liên tục phải cho: số lần gõ = 8, số lần gọi API = 1

**Phần C.** Nâng cấp thành `debounce(fn, delay, chayNgay = false)`. Khi `chayNgay` là `true`, hàm chạy **ngay lần gọi đầu tiên** rồi mới chặn các lần sau. Đây là biến thể "leading edge" mà lodash cũng có.

**Phần D.** Viết `throttle(fn, khoang)`. Gắn nó vào sự kiện `mousemove` trên trang, in tọa độ chuột. So sánh số lần in khi có và không có throttle — ghi con số vào `du-doan.md`.

**Phần E.** Trả lời trong `du-doan.md`: debounce và throttle khác nhau thế nào? Cho hai tình huống thật, mỗi cái dùng một loại. -> 1 cái là trong khoảng thời gian đó chỉ chạy 1 lệnh(throttle), 1 cái là nếu không gọi trong khoảng thời gian đó thì sẽ chạy(debounce) khác nhau như vậy á. 
VD: debounce: khi người dùng nhập trên ô input 
    throttle: khi người dùng di chuyển chuột

### Bài 4 — Module pattern

Viết module `quanLyTodo` bằng IIFE, không để lộ dữ liệu ra ngoài:

Công khai:
- `them(noiDung)` — thêm việc mới, tự sinh `id` tăng dần, trả về object việc vừa tạo
- `xong(id)` — đánh dấu hoàn thành, trả `true`/`false` tùy có tìm thấy không
- `xoa(id)` — xóa, trả `true`/`false`
- `danhSach(loc)` — `loc` là `"tat-ca"` (mặc định), `"chua-xong"`, `"da-xong"`
- `thongKe()` — `{ tong, daXong, chuaXong }`

Riêng tư (không truy cập được từ ngoài):
- Mảng dữ liệu
- Bộ đếm id
- Hàm `timTheoId(id)`

Yêu cầu kiểm chứng, viết code chứng minh cả ba:
1. `quanLyTodo.danhSach` không lộ mảng gốc — sửa kết quả trả về không ảnh hưởng bên trong
2. Không có cách nào đặt `id` tùy ý từ bên ngoài
3. `quanLyTodo.timTheoId` là `undefined`

### Bài 5 — Sửa stale closure

Đoạn code sau có bug. Tìm, giải thích, và sửa:

```javascript
function taoDongHo(idPhanTu) {
  let giay = 0;
  const el = document.getElementById(idPhanTu);

  function batDau() {
    setInterval(function () {
      el.textContent = giay;
    }, 1000);
    giay++; -> giây tăng ở ngoài hàm tức là nó chỉ tăng đúng 1 lần khi hàm batDau được gọi sau đó thì giây không tăng nữa -> bug
  }

  return { batDau }; -> tôi đoán chỗ ni lỗi nhưng không chứng minh được
}
```

Sau khi sửa, thêm hàm `dung()` để dừng đồng hồ. Gợi ý: `setInterval` trả về một id, và closure là chỗ để giữ id đó.

### Bài 6 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng, bằng lời của bạn:

1. Closure là gì? Trả lời như đang phỏng vấn — đủ ba nhịp ở mục 10.
2. Vì sao `var` trong vòng lặp cho kết quả sai còn `let` thì đúng? Giải thích cơ chế, đừng chỉ nói "vì `let` là block scope".
3. Closure gây rò rỉ bộ nhớ thế nào? Cho một ví dụ và cách phòng.
4. Kể 3 nơi trong code thật mà bạn đã dùng closure ở các bài tập trên.

---

## Xong file này khi

- [ ] Bài 1 có đủ phần đoán viết trước khi chạy, giải thích được câu A khác câu B ở đâu
- [ ] Bộ đếm ở bài 2 độc lập, có code chứng minh
- [ ] Debounce chạy đúng: gõ 8 lần → gọi API 1 lần
- [ ] Throttle gắn được vào `mousemove`, có số liệu so sánh
- [ ] Module todo không lộ bất kỳ dữ liệu riêng tư nào
- [ ] Đồng hồ ở bài 5 chạy đúng và dừng được
- [ ] Trả lời được câu 1 và 2 ở bài 6 **bằng lời, không nhìn giấy** — tự quay video hoặc nói cho ai đó nghe

Đây là file khó nhất từ đầu chặng đến giờ. Nếu đọc một lượt thấy chưa thấm, đó là bình thường — làm bài tập rồi quay lại đọc lần hai, mọi thứ sẽ khác.

Xong thì gửi mình `main.js`, `index.html` và `du-doan.md`, kèm **"viết file 06-tu-khoa-this"**.