# 04 — Các hàm mảng quan trọng

> **Cần có trước:** xong `01`, `02`, `03`.
> **Thời gian:** 4–5 giờ.
> **Vì sao quan trọng:** đây là file "làm được việc" nhất của khối A. Khoảng 80% code xử lý dữ liệu ngoài đời thật là chuỗi `filter → map → reduce`. Ở React, bạn render danh sách bằng `map` trong mọi component. Làm chắc file này thì code của bạn ngắn đi một nửa và dễ đọc gấp đôi.

---

## 1. Vì sao không dùng `for` nữa

```javascript
const soLieu = [1, 2, 3, 4, 5];

// Cách cũ
const chan = [];
for (let i = 0; i < soLieu.length; i++) {
  if (soLieu[i] % 2 === 0) {
    chan.push(soLieu[i]);
  }
}

// Cách dùng method
const chan = soLieu.filter(n => n % 2 === 0);
```

Không phải chỉ vì ngắn hơn. Lý do thật:

- Vòng `for` bắt người đọc **giải mã** xem nó đang làm gì. `filter` **tuyên bố** ngay ý định.
- Vòng `for` có biến đếm `i` và mảng `chan` thay đổi liên tục — hai thứ phải theo dõi trong đầu. `filter` không có gì để theo dõi.
- `for` dễ sai off-by-one (`<=` thay vì `<`), `filter` thì không có chỗ để sai.

Đây là chuyển từ tư duy **mệnh lệnh** (kể từng bước máy phải làm) sang tư duy **khai báo** (nói kết quả mình muốn). Mất vài ngày để quen, nhưng quen rồi thì không quay lại.

`for` vẫn cần khi bạn muốn `break` sớm, hoặc khi xử lý mảng cực lớn cần tối ưu. Mục 12 nói kỹ hơn.

---

## 2. Chữ ký của callback

Mọi method trong file này đều nhận một callback với **ba tham số**:

```javascript
arr.map((phanTu, chiSo, mangGoc) => { ... });
```

Hầu như lúc nào bạn cũng chỉ dùng tham số đầu. Nhưng biết là có ba, vì:

```javascript
["a", "b", "c"].map((item, i) => `${i}: ${item}`);
// ["0: a", "1: b", "2: c"]
```

### Một cái bẫy thật

```javascript
["1", "2", "3"].map(parseInt);
// [1, NaN, NaN]  ← không phải [1, 2, 3]!
```

Vì `map` truyền **ba** đối số cho `parseInt`, mà `parseInt(chuoi, coSo)` nhận đối số thứ hai là cơ số. Kết quả thành `parseInt("1", 0)`, `parseInt("2", 1)`, `parseInt("3", 2)`.

Cách viết đúng:

```javascript
["1", "2", "3"].map(s => parseInt(s, 10));   // [1, 2, 3]
["1", "2", "3"].map(Number);                  // [1, 2, 3] — Number chỉ nhận 1 đối số
```

Bài học: **cẩn thận khi truyền thẳng tên hàm làm callback** nếu hàm đó nhận nhiều tham số.

---

## 3. `forEach` — duyệt để làm gì đó

```javascript
["a", "b"].forEach((item, i) => {
  console.log(i, item);
});
```

Đặc điểm: **luôn trả về `undefined`**. Nó không tạo ra gì cả, chỉ chạy callback cho từng phần tử.

```javascript
const kq = [1, 2, 3].forEach(n => n * 2);
console.log(kq);   // undefined
```

Không `break` hay `continue` được:

```javascript
[1, 2, 3].forEach(n => {
  if (n === 2) return;    // chỉ bỏ qua vòng này, giống `continue`
  console.log(n);         // 1, 3
});
// Không có cách nào dừng hẳn forEach
```

Cần dừng sớm thì dùng `for...of`:

```javascript
for (const n of [1, 2, 3]) {
  if (n === 2) break;
  console.log(n);   // 1
}
```

**Khi nào dùng `forEach`:** khi bạn chỉ muốn gây tác dụng phụ — in ra, gọi API, cập nhật DOM. Nếu bạn muốn **tạo ra dữ liệu mới**, dùng `map` hoặc `reduce`.

---

## 4. `map` — biến đổi từng phần tử

Trả về mảng **mới**, cùng độ dài, mỗi phần tử là kết quả callback.

```javascript
[1, 2, 3].map(n => n * 2);              // [2, 4, 6]

const users = [
  { ten: "An", tuoi: 22 },
  { ten: "Bình", tuoi: 25 }
];

users.map(u => u.ten);                  // ["An", "Bình"]
users.map(({ ten }) => ten);            // ["An", "Bình"] — destructuring
users.map(u => ({ ...u, tuoi: u.tuoi + 1 }));   // thêm tuổi, không sửa gốc
```

Chú ý dấu ngoặc tròn ở dòng cuối — nhắc lại cái bẫy ở file `02`: arrow trả về object phải bọc `({...})`.

### Lỗi phổ biến nhất: quên `return`

```javascript
const sai = [1, 2, 3].map(n => {
  n * 2;                // không có return
});
console.log(sai);       // [undefined, undefined, undefined]

const dung1 = [1, 2, 3].map(n => n * 2);        // thân là biểu thức, tự return
const dung2 = [1, 2, 3].map(n => { return n * 2; });
```

Khi thấy mảng toàn `undefined`, chín trên mười lần là quên `return`.

### `map` giữ nguyên độ dài

Đây là điểm phân biệt với `filter`. `map` **không** lọc bỏ gì cả:

```javascript
[1, 2, 3, 4].map(n => n % 2 === 0 ? n : null);
// [null, 2, null, 4]  ← vẫn 4 phần tử

// Muốn lọc thì dùng filter
[1, 2, 3, 4].filter(n => n % 2 === 0);   // [2, 4]
```

---

## 5. `filter` — giữ lại phần tử thỏa điều kiện

Callback trả về giá trị truthy thì phần tử được giữ.

```javascript
[1, 2, 3, 4].filter(n => n > 2);         // [3, 4]

users.filter(u => u.tuoi >= 23);          // [{ ten: "Bình", tuoi: 25 }]

// Không thỏa gì cả → mảng rỗng, không phải undefined
[1, 2].filter(n => n > 100);              // []
```

Mẹo hay dùng — lọc bỏ giá trị falsy:

```javascript
[0, 1, "", "a", null, 2, undefined, NaN].filter(Boolean);
// [1, "a", 2]
```

`Boolean` được dùng làm callback: mỗi phần tử được ép sang boolean, falsy thì bị loại. Rất tiện khi làm sạch dữ liệu.

### `filter` cũng dùng để xóa bất biến

```javascript
const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];

// Xóa id 2 mà không sửa mảng gốc
const moi = arr.filter(item => item.id !== 2);
console.log(arr.length);   // 3 — nguyên vẹn
console.log(moi.length);   // 2
```

Đây là cách xóa phần tử chuẩn trong React, thay cho `splice`.

---

## 6. `find`, `findIndex`, `findLast`, `findLastIndex`

```javascript
const users = [
  { id: 1, ten: "An" },
  { id: 2, ten: "Bình" },
  { id: 3, ten: "An" }
];

users.find(u => u.id === 2);         // { id: 2, ten: "Bình" }
users.find(u => u.id === 99);        // undefined  ← không phải null

users.findIndex(u => u.id === 2);    // 1
users.findIndex(u => u.id === 99);   // -1         ← không phải undefined

users.findLast(u => u.ten === "An");      // { id: 3, ten: "An" }
users.findLastIndex(u => u.ten === "An"); // 2
```

Hai giá trị "không tìm thấy" khác nhau: `find` cho `undefined`, `findIndex` cho `-1`. Nhớ kỹ vì đây là nguồn bug:

```javascript
const i = users.findIndex(u => u.id === 99);
if (i) { ... }        // SAI — nếu tìm thấy ở index 0 thì i = 0, là falsy
if (i !== -1) { ... } // ĐÚNG
```

### `find` vs `filter`

```javascript
users.find(u => u.id === 2);      // { id: 2, ... }  — một object
users.filter(u => u.id === 2);    // [{ id: 2, ... }] — mảng chứa một object
```

Cần **một** kết quả thì dùng `find`. Nó cũng nhanh hơn vì dừng ngay khi tìm thấy, còn `filter` luôn duyệt hết mảng.

---

## 7. `some` và `every`

```javascript
[1, 2, 3].some(n => n > 2);      // true  — CÓ ÍT NHẤT MỘT phần tử thỏa
[1, 2, 3].every(n => n > 2);     // false — KHÔNG PHẢI TẤT CẢ đều thỏa
[1, 2, 3].every(n => n > 0);     // true
```

Cả hai đều dừng sớm: `some` dừng khi gặp `true` đầu tiên, `every` dừng khi gặp `false` đầu tiên.

Dùng để kiểm tra object trong mảng:

```javascript
const gioHang = [{ id: 1 }, { id: 2 }];

gioHang.includes({ id: 1 });               // false — so tham chiếu
gioHang.some(item => item.id === 1);       // true  — dùng cái này
```

### Mảng rỗng — chỗ dễ bất ngờ

```javascript
[].some(n => true);      // false
[].every(n => false);    // true   ← đúng vậy, TRUE
```

`every` trên mảng rỗng luôn trả `true`. Logic học gọi đây là "chân lý rỗng": không có phần tử nào vi phạm điều kiện, nên mệnh đề "mọi phần tử đều thỏa" được coi là đúng.

Hệ quả thực tế cần cẩn thận:

```javascript
function taoDonHang(sanPham) {
  if (sanPham.every(sp => sp.conHang)) {
    // Mảng rỗng cũng lọt vào đây!
    xuLyDonHang();
  }
}
```

Sửa: kiểm tra độ dài trước.

```javascript
if (sanPham.length > 0 && sanPham.every(sp => sp.conHang)) { ... }
```

---

## 8. `reduce` — gộp mảng thành một giá trị

Đây là method mạnh nhất và cũng khó nhất. Đọc chậm mục này.

### 8.1. Cấu trúc

```javascript
mang.reduce((tichLuy, phanTu, chiSo, mangGoc) => {
  return giaTriTichLuyMoi;
}, giaTriKhoiTao);
```

- `tichLuy` (accumulator) — giá trị mang theo qua từng vòng
- Callback **phải `return`**, giá trị trả về thành `tichLuy` của vòng sau
- `giaTriKhoiTao` — giá trị của `tichLuy` ở vòng đầu

### 8.2. Ví dụ chạy từng bước

```javascript
[1, 2, 3, 4].reduce((tong, n) => tong + n, 0);
```

| Vòng | `tong` vào | `n` | `return` |
|---|---|---|---|
| 1 | 0 | 1 | 1 |
| 2 | 1 | 2 | 3 |
| 3 | 3 | 3 | 6 |
| 4 | 6 | 4 | **10** |

Kết quả: `10`.

Tự vẽ bảng như trên cho mỗi `reduce` bạn không hiểu — đây là cách hiệu quả nhất để nắm nó.

### 8.3. Luôn truyền giá trị khởi tạo

```javascript
[1, 2, 3].reduce((a, b) => a + b);       // 6 — chạy được
[].reduce((a, b) => a + b);              // TypeError: Reduce of empty array with no initial value
[].reduce((a, b) => a + b, 0);           // 0 — an toàn
```

Không truyền giá trị khởi tạo thì phần tử đầu tiên trở thành `tichLuy`, và mảng rỗng sẽ ném lỗi. **Luôn truyền giá trị khởi tạo**, kể cả khi bạn chắc mảng không rỗng.

### 8.4. Các mẫu `reduce` hay dùng

**Tính tổng có điều kiện:**

```javascript
const gioHang = [
  { ten: "Bàn phím", gia: 500000, soLuong: 2 },
  { ten: "Chuột", gia: 200000, soLuong: 1 }
];

const tongTien = gioHang.reduce((tong, sp) => tong + sp.gia * sp.soLuong, 0);
// 1200000
```

**Gộp mảng thành object (đếm tần suất):**

```javascript
const mau = ["đỏ", "xanh", "đỏ", "vàng", "đỏ"];

const dem = mau.reduce((acc, m) => {
  acc[m] = (acc[m] ?? 0) + 1;
  return acc;
}, {});
// { đỏ: 3, xanh: 1, vàng: 1 }
```

**Nhóm theo thuộc tính:**

```javascript
const users = [
  { ten: "An", thanhPho: "HCM" },
  { ten: "Bình", thanhPho: "HN" },
  { ten: "Cường", thanhPho: "HCM" }
];

const theoThanhPho = users.reduce((acc, u) => {
  acc[u.thanhPho] ??= [];
  acc[u.thanhPho].push(u.ten);
  return acc;
}, {});
// { HCM: ["An", "Cường"], HN: ["Bình"] }
```

Ghi chú: JavaScript hiện đại có `Object.groupBy` làm sẵn việc này, nhưng nó còn khá mới nên hỗ trợ chưa đồng đều. Cứ viết `reduce` như trên cho chắc — và vì bài phỏng vấn hay hỏi đúng bài này.

**Chuyển mảng thành object tra cứu theo id:**

```javascript
const bangTraCuu = users.reduce((acc, u) => {
  acc[u.id] = u;
  return acc;
}, {});
// { "1": {...}, "2": {...} }
```

Mẫu này rất hữu ích: tra cứu theo id trong object là tức thời, còn `find` trên mảng phải duyệt.

**Tìm max theo thuộc tính:**

```javascript
const datNhat = gioHang.reduce((max, sp) => sp.gia > max.gia ? sp : max);
```

### 8.5. Lỗi thường gặp với `reduce`

```javascript
// Quên return
const sai = [1, 2, 3].reduce((acc, n) => {
  acc + n;              // không return
}, 0);
console.log(sai);       // undefined

// Quên return khi tích lũy là object
const sai2 = mau.reduce((acc, m) => {
  acc[m] = 1;           // sửa được acc nhưng không trả về
}, {});
// TypeError ở vòng thứ hai, vì acc đã thành undefined
```

### 8.6. Đừng lạm dụng `reduce`

`reduce` làm được mọi thứ, nhưng không phải lúc nào cũng nên:

```javascript
// Dùng reduce để lọc — khó đọc
const chan = arr.reduce((acc, n) => n % 2 === 0 ? [...acc, n] : acc, []);

// Dùng filter — rõ ràng hơn và nhanh hơn
const chan = arr.filter(n => n % 2 === 0);
```

Bản `reduce` còn tạo ra một mảng mới ở mỗi vòng lặp, nên chậm hơn hẳn với dữ liệu lớn.

**Quy tắc:** dùng `reduce` khi kết quả có **kiểu khác** với phần tử mảng (mảng → số, mảng → object). Nếu kết quả vẫn là mảng cùng loại, gần như luôn có method phù hợp hơn.

---

## 9. `sort` — cẩn thận, nó sửa mảng gốc

### 9.1. Hai điều phải nhớ ngay

```javascript
const arr = [10, 9, 1, 100];

arr.sort();
console.log(arr);   // [1, 10, 100, 9]  ← KHÔNG phải thứ tự số!
```

**Thứ nhất:** `sort()` mặc định chuyển mọi phần tử thành **chuỗi** rồi so sánh theo bảng mã. `"10"` đứng trước `"9"` vì ký tự `"1"` nhỏ hơn `"9"`.

```javascript
const goc = [3, 1, 2];
const daSap = goc.sort();
console.log(goc);           // [1, 2, 3]  ← mảng gốc BỊ ĐỔI
console.log(daSap === goc); // true       ← trả về chính nó, không phải mảng mới
```

**Thứ hai:** `sort` sửa mảng gốc và trả về chính mảng đó. Đây là nguồn bug rất khó tìm, đặc biệt trong React.

### 9.2. Hàm so sánh

```javascript
arr.sort((a, b) => { ... });
```

Quy ước giá trị trả về:

- Số **âm** → `a` đứng trước `b`
- Số **dương** → `b` đứng trước `a`
- **`0`** → giữ nguyên thứ tự tương đối

```javascript
// Số tăng dần
[10, 9, 1].sort((a, b) => a - b);      // [1, 9, 10]

// Số giảm dần
[10, 9, 1].sort((a, b) => b - a);      // [10, 9, 1]

// Object theo thuộc tính số
users.sort((a, b) => a.tuoi - b.tuoi);
```

Mẹo nhớ: `a - b` là tăng dần (nghĩ "a trước b" theo thứ tự tự nhiên).

### 9.3. Sắp xếp chuỗi

```javascript
// Sai với tiếng Việt và chữ hoa/thường
["Bình", "an", "Cường"].sort();
// ["Bình", "Cường", "an"] — chữ thường xếp sau hết vì mã lớn hơn

// Đúng
["Bình", "an", "Cường"].sort((a, b) => a.localeCompare(b, "vi"));
// ["an", "Bình", "Cường"]
```

`localeCompare` xử lý đúng dấu tiếng Việt và không phân biệt hoa/thường theo cách người dùng mong đợi. **Với chuỗi tiếng Việt, luôn dùng `localeCompare`.**

### 9.4. Sắp xếp nhiều tiêu chí

```javascript
users.sort((a, b) => {
  // Ưu tiên 1: theo thành phố
  const theoTP = a.thanhPho.localeCompare(b.thanhPho, "vi");
  if (theoTP !== 0) return theoTP;

  // Ưu tiên 2: tuổi giảm dần
  return b.tuoi - a.tuoi;
});
```

Mẫu này rất hay dùng: so tiêu chí đầu, khác `0` thì trả về ngay, bằng `0` thì mới xét tiêu chí sau.

### 9.5. Sắp xếp mà không sửa mảng gốc

```javascript
// Cách 1: sao chép trước
const daSap = [...arr].sort((a, b) => a - b);

// Cách 2: toSorted — mới hơn, gọn hơn
const daSap = arr.toSorted((a, b) => a - b);
```

`toSorted` là bản không-sửa-gốc của `sort`, thuộc nhóm method mới (ES2023). Cùng nhóm có `toReversed`, `toSpliced`, `with`. Chúng chạy tốt trên trình duyệt hiện đại và Node 20+, nhưng nếu dự án cần hỗ trợ trình duyệt cũ thì cứ dùng `[...arr].sort()` cho an toàn.

---

## 10. Vài method khác cần biết

```javascript
// flat — làm phẳng mảng lồng
[1, [2, 3], [4, [5]]].flat();          // [1, 2, 3, 4, [5]]  — mặc định 1 tầng
[1, [2, [3, [4]]]].flat(2);            // [1, 2, 3, [4]]
[1, [2, [3, [4]]]].flat(Infinity);     // [1, 2, 3, 4]

// flatMap — map rồi flat 1 tầng
const cauNoi = ["xin chào", "thế giới"];
cauNoi.flatMap(c => c.split(" "));     // ["xin", "chào", "thế", "giới"]

// join — nối thành chuỗi
["a", "b", "c"].join(", ");            // "a, b, c"
["a", "b"].join("");                   // "ab"

// includes vs indexOf với NaN
[NaN].includes(NaN);                   // true
[NaN].indexOf(NaN);                    // -1   ← indexOf dùng ===, mà NaN !== NaN

// Array.from — tạo mảng từ iterable, có thể kèm hàm biến đổi
Array.from("abc");                              // ["a","b","c"]
Array.from({ length: 5 }, (_, i) => i * 2);     // [0, 2, 4, 6, 8]

// fill
new Array(3).fill(0);                  // [0, 0, 0]
```

`Array.from({ length: n }, (_, i) => ...)` là cách gọn để tạo dãy số — hay dùng khi render phân trang.

---

## 11. Chuỗi method

Vì `map`, `filter` trả về mảng, bạn nối chúng lại được:

```javascript
const donHang = [
  { id: 1, tien: 500000, trangThai: "xong" },
  { id: 2, tien: 200000, trangThai: "hủy" },
  { id: 3, tien: 900000, trangThai: "xong" }
];

const tongDoanhThu = donHang
  .filter(d => d.trangThai === "xong")
  .map(d => d.tien)
  .reduce((tong, t) => tong + t, 0);
// 1400000
```

**Quy tắc thứ tự:** `filter` trước, `map` sau. Lọc bớt rồi mới biến đổi thì ít việc hơn — và đúng logic hơn.

```javascript
// Kém hiệu quả: biến đổi cả những phần tử sẽ bị loại
arr.map(bienDoiNang).filter(dieuKien)

// Tốt hơn
arr.filter(dieuKien).map(bienDoiNang)
```

Mỗi bước trong chuỗi tạo ra một mảng trung gian. Với vài nghìn phần tử thì không đáng lo. Với hàng trăm nghìn thì cân nhắc gộp lại thành một `reduce` hoặc một vòng `for`.

Đừng nối quá dài. Ba đến bốn bước là dễ đọc; bảy bước thì nên tách ra biến trung gian có tên rõ nghĩa.

---

## 12. Method nào sửa mảng gốc

Bảng này đáng để dán lên tường.

| **Sửa mảng gốc** | **Trả về mảng mới** |
|---|---|
| `push`, `pop` | `map`, `filter` |
| `shift`, `unshift` | `slice`, `concat` |
| `splice` | `toSpliced` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `fill` | `flat`, `flatMap` |
| — | `with` |

Trong React, dùng nhầm nhóm bên trái là bug kinh điển: state bị sửa trực tiếp, React không biết có thay đổi, giao diện không cập nhật.

```javascript
// SAI trong React
setDanhSach(danhSach.sort((a, b) => a - b));   // sort sửa mảng cũ

// ĐÚNG
setDanhSach([...danhSach].sort((a, b) => a - b));
setDanhSach(danhSach.toSorted((a, b) => a - b));
```

### Khi nào vẫn nên dùng `for`

- Cần `break` để dừng sớm (dù `find`/`some` thường đủ)
- Cần `await` tuần tự trong vòng lặp — `forEach` không chờ `async`, chuyện này sẽ nói ở file `11`
- Mảng rất lớn (hàng trăm nghìn phần tử) và đã đo được rằng đây là nút thắt

Ngoài ba trường hợp đó, dùng method.

---

## 13. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `map` trả về mảng toàn `undefined` | Quên `return` trong callback | Bỏ `{}` hoặc thêm `return` |
| `sort` số ra thứ tự lạ | Mặc định so sánh theo chuỗi | `sort((a, b) => a - b)` |
| Mảng gốc bị đổi sau khi sort | `sort` sửa tại chỗ | `[...arr].sort()` hoặc `toSorted()` |
| `reduce` báo lỗi với mảng rỗng | Không truyền giá trị khởi tạo | Luôn truyền tham số thứ hai |
| `reduce` trả `undefined` | Callback quên `return` | Thêm `return acc` |
| `if (findIndex(...))` sai khi phần tử ở đầu | Index `0` là falsy | So sánh `!== -1` |
| `includes` không tìm thấy object | So sánh tham chiếu | Dùng `some(o => o.id === id)` |
| `every` trả `true` với mảng rỗng | Chân lý rỗng | Kiểm tra `length > 0` trước |
| `map(parseInt)` ra `NaN` | `map` truyền 3 đối số | `map(s => parseInt(s, 10))` |
| Sắp xếp tiếng Việt sai dấu | So sánh mã ký tự | `localeCompare(b, "vi")` |
| `forEach` không dừng được | Bản chất của `forEach` | Dùng `for...of` với `break` |

---

## 14. Tóm tắt cần thuộc

1. `forEach` trả `undefined`, dùng cho tác dụng phụ; muốn tạo dữ liệu thì `map`
2. `map` giữ nguyên độ dài; `filter` mới lọc bỏ
3. Quên `return` trong `map`/`reduce` là lỗi phổ biến nhất
4. `find` trả `undefined` khi không thấy; `findIndex` trả `-1`
5. `every` trên mảng rỗng luôn là `true`
6. `reduce` **luôn** truyền giá trị khởi tạo
7. Dùng `reduce` khi kiểu kết quả khác kiểu phần tử; ngoài ra tìm method phù hợp hơn
8. `sort` mặc định so sánh theo **chuỗi** và **sửa mảng gốc**
9. Tiếng Việt phải dùng `localeCompare(b, "vi")`
10. `filter` trước, `map` sau
11. Nhóm sửa gốc: `push/pop/shift/unshift/splice/sort/reverse/fill`
12. `filter(Boolean)` để loại giá trị falsy

---

## Bài tập

Tạo `bai-tap-04/` với `index.html`, `main.js`, `du-doan.md`.

### Bài 1 — Đoán output

Ghi phần đoán vào `du-doan.md` trước khi chạy:

```javascript
// A
console.log([1, 2, 3].map(n => { n * 2 })); -> lỗi do trong map không có return
// ❌ SAI: không hề bị lỗi/throw. Arrow thân khối không return → tự trả undefined.
// Đáp án đúng: [undefined, undefined, undefined] (xem lại mục 4, dòng 130-142)

// B
console.log([10, 9, 1, 100].sort()); -> [1,10,100,9]
console.log([10, 9, 1, 100].sort((a, b) => a - b)); -> [1,9,10,100]

// C
const arr = [3, 1, 2];
const kq = arr.sort();
console.log(arr === kq); -> falsy
// ❌ SAI: sort() sửa tại chỗ và trả về CHÍNH mảng gốc (cùng reference).
// Đáp án đúng: true (xem lại mục 9.1, dòng 420-440)

// D
console.log([].every(n => false)); -> true
console.log([].some(n => true)); -> false

// E
console.log([1, 2, 3].forEach(n => n)); -> undefine

// F
console.log(["1", "2", "3"].map(parseInt)); -> [1,undefine, undefine]
// ❌ SAI: không phải undefined mà là NaN. parseInt("2",1) và parseInt("3",2)
// có radix không hợp lệ/không parse được -> NaN.
// Đáp án đúng: [1, NaN, NaN] (xem lại mục 2, dòng 53-69)
console.log(["1", "2", "3"].map(Number)); -> [1,2,3]

// G
const users = [{ id: 0, ten: "An" }, { id: 1, ten: "Bình" }];
const i = users.findIndex(u => u.ten === "An");
console.log(i ? "tìm thấy" : "không thấy"); -> "Không thấy"

// H
console.log([0, 1, "", "a", null, NaN, 2].filter(Boolean)); -> [1,"a", 2]

// I
console.log([NaN].includes(NaN), [NaN].indexOf(NaN)); -> true -1

// J
console.log([1, [2, [3, [4]]]].flat(2)); -> [1, 2, 3, [4]]

// K
console.log([1, 2, 3].reduce((a, b) => a + b)); -> 6
console.log([].reduce((a, b) => a + b, 0)); -> 0
```

### Bài 2 — Xử lý mảng sản phẩm (bài chính)

```javascript
const sanPham = [
  { ma: "SP01", ten: "Bàn phím cơ",   danhMuc: "Phụ kiện", gia: 1500000, soLuong: 12, danhGia: 4.5, conHang: true },
  { ma: "SP02", ten: "Chuột không dây", danhMuc: "Phụ kiện", gia: 350000,  soLuong: 0,  danhGia: 4.0, conHang: false },
  { ma: "SP03", ten: "Màn hình 27 inch", danhMuc: "Màn hình", gia: 5200000, soLuong: 5, danhGia: 4.8, conHang: true },
  { ma: "SP04", ten: "Ổ cứng SSD 1TB", danhMuc: "Lưu trữ",  gia: 2100000, soLuong: 20, danhGia: 4.7, conHang: true },
  { ma: "SP05", ten: "Tai nghe",       danhMuc: "Phụ kiện", gia: 890000,  soLuong: 3,  danhGia: 3.9, conHang: true },
  { ma: "SP06", ten: "Màn hình 32 inch", danhMuc: "Màn hình", gia: 8900000, soLuong: 0, danhGia: 4.9, conHang: false },
  { ma: "SP07", ten: "Ổ cứng HDD 2TB", danhMuc: "Lưu trữ",  gia: 1400000, soLuong: 8,  danhGia: 4.2, conHang: true }
];
```

Viết các hàm sau. **Không hàm nào được sửa mảng `sanPham` gốc** — cuối bài viết code chứng minh mảng gốc còn nguyên.

1. `layTenSanPham(ds)` → mảng tên sản phẩm.

2. `locConHang(ds)` → chỉ sản phẩm còn hàng.

3. `locTheoKhoangGia(ds, min, max)` → sản phẩm có giá trong khoảng (bao gồm hai đầu).

4. `sapXepTheoGia(ds, tangDan = true)` → mảng **mới** đã sắp xếp.

5. `sapXepTheoTen(ds)` → sắp xếp theo tên tiếng Việt cho đúng.

6. `tinhGiaTriKho(ds)` → tổng `gia × soLuong` của toàn bộ kho.

7. `demTheoDanhMuc(ds)` → `{ "Phụ kiện": 3, "Màn hình": 2, "Lưu trữ": 2 }`

8. `nhomTheoDanhMuc(ds)` → `{ "Phụ kiện": [<3 object>], ... }`

9. `giaTrungBinhMoiDanhMuc(ds)` → `{ "Phụ kiện": 913333, ... }` (làm tròn về số nguyên)

10. `sanPhamDatNhat(ds)` và `sanPhamReNhat(ds)` → trả về object sản phẩm, không phải giá.

11. `coSanPhamHetHang(ds)` → `true`/`false`.

12. `tatCaDeuTrenBonSao(ds)` → `true`/`false`. **Phải trả `false` với mảng rỗng.**

13. `timTheoMa(ds, ma)` → object hoặc `null` (không phải `undefined`).

14. `capNhatSoLuong(ds, ma, soLuongMoi)` → mảng **mới**, sản phẩm tương ứng có số lượng mới và `conHang` được tính lại theo số lượng.

15. `bangTraCuu(ds)` → `{ "SP01": {<object>}, "SP02": {...} }`

16. `top3DanhGia(ds)` → 3 sản phẩm đánh giá cao nhất, dạng `["Màn hình 32 inch (4.9)", ...]`. Làm bằng **một chuỗi method**, không dùng biến trung gian.

17. `bangDoanhThu(ds)` → mảng đã lọc còn hàng, sắp xếp theo giá trị tồn kho giảm dần, mỗi phần tử dạng:
```javascript
{ ma: "SP04", ten: "Ổ cứng SSD 1TB", giaTriTon: 42000000, tyLe: "58.3%" }
```
`tyLe` là phần trăm so với tổng giá trị tồn của các sản phẩm còn hàng, một chữ số thập phân.

### Bài 3 — Viết lại `for` thành method

Chuyển mỗi đoạn sau sang dùng method mảng. Giữ nguyên kết quả:

```javascript
// A
let tong = 0;
for (let i = 0; i < sanPham.length; i++) {
  if (sanPham[i].conHang) {
    tong += sanPham[i].gia;
  }
}

// B
const ten = [];
for (const sp of sanPham) {
  if (sp.danhGia >= 4.5) {
    ten.push(sp.ten.toUpperCase());
  }
}

// C
let coHang = false;
for (const sp of sanPham) {
  if (sp.danhMuc === "Màn hình" && sp.conHang) {
    coHang = true;
    break;
  }
}

// D
const theoMa = {};
for (const sp of sanPham) {
  theoMa[sp.ma] = sp.ten;
}
```

### Bài 4 — Tự cài đặt lại

Viết lại bốn method bằng vòng `for` thuần, đặt tên `myMap`, `myFilter`, `myFind`, `myReduce`. Chúng nhận mảng làm tham số đầu:

```javascript
function myMap(arr, callback) { ... }

// Test
myMap([1, 2, 3], n => n * 2);              // [2, 4, 6]
myFilter([1, 2, 3, 4], n => n % 2 === 0);  // [2, 4]
myFind([1, 2, 3], n => n > 1);             // 2
myReduce([1, 2, 3], (a, b) => a + b, 0);   // 6
```

Yêu cầu thêm:
- `myMap` và `myFilter` phải truyền đủ **ba** đối số cho callback
- `myFind` trả `undefined` khi không thấy
- `myReduce` phải xử lý được trường hợp **không** truyền giá trị khởi tạo, và ném lỗi đúng như bản gốc với mảng rỗng

Bài này là câu hỏi phỏng vấn thật, và nó ép bạn hiểu method hoạt động thế nào bên trong chứ không chỉ biết gọi.

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 3–5 dòng:

1. `map` và `forEach` khác nhau ở đâu? Khi nào dùng cái nào?
2. Vì sao `[10, 9, 1].sort()` cho `[1, 10, 9]`?
3. `reduce` hoạt động thế nào? Vẽ bảng từng vòng cho `[1,2,3].reduce((a,b) => a+b, 10)`.
4. Vì sao `[].every(...)` trả về `true`? Điều đó gây bug gì trong thực tế?
5. Kể 5 method sửa mảng gốc. Vì sao điều đó nguy hiểm trong React?

---

## Xong file này khi

- [ ] Bài 1 có đủ phần đoán viết trước khi chạy
- [ ] 17 hàm ở bài 2 chạy đúng, có code chứng minh mảng gốc không đổi
- [ ] Bài 2 câu 16 làm bằng đúng một chuỗi method
- [ ] Bài 3 chuyển đủ 4 đoạn
- [ ] Bài 4 cả bốn hàm chạy đúng, kể cả `myReduce` không có giá trị khởi tạo
- [ ] Trả lời được 5 câu ở bài 5 mà không nhìn tài liệu
- [ ] Đọc bảng ở mục 12 và nhớ được nhóm method sửa mảng gốc

**Hết khối A.** Bạn đã xong phần nền tảng ngôn ngữ. Từ file `05` là khối B — closure, `this`, prototype — ba khái niệm khó nhất và bị hỏi nhiều nhất trong phỏng vấn. Nghỉ một buổi trước khi vào.

Xong thì gửi mình `main.js` + `du-doan.md`, kèm **"viết file 05-closure"**.