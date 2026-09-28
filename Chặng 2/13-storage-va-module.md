# 13 — Lưu trữ và ES Module

> **Cần có trước:** xong tất cả file `01` → `12`.
> **Thời gian:** 5 giờ.
> **Vì sao quan trọng:** đây là hai mảnh cuối cùng. Lưu trữ làm dữ liệu sống sót qua lần tải trang. Module là cách tổ chức code thành nhiều file — và là điều kiện tiên quyết để bước vào chặng 3 (Vite, TypeScript) và chặng 4 (React), nơi mọi thứ đều là module.

---

# PHẦN A — LƯU TRỮ

## 1. `localStorage` và `sessionStorage`

Hai kho lưu trữ dạng khóa-giá trị, chạy ngay trong trình duyệt.

| | `localStorage` | `sessionStorage` |
|---|---|---|
| Tồn tại đến khi | Bị xóa thủ công | Đóng tab |
| Phạm vi | Mọi tab **cùng origin** | Chỉ **tab hiện tại** |
| Dung lượng | ~5–10 MB | ~5–10 MB |
| Gửi lên server | Không | Không |

Cùng origin nghĩa là cùng giao thức + tên miền + cổng — đúng định nghĩa ở file `12`.

```javascript
// API giống hệt nhau
localStorage.setItem("ten", "An");
localStorage.getItem("ten");        // "An"
localStorage.removeItem("ten");
localStorage.clear();               // xóa sạch — cẩn thận

localStorage.length;                // số lượng khóa
localStorage.key(0);                // tên khóa thứ 0
Object.keys(localStorage);          // tất cả khóa
```

Chọn cái nào: dữ liệu cần giữ lâu (cài đặt, giỏ hàng, danh sách việc) → `localStorage`. Dữ liệu chỉ dùng trong phiên làm việc (bước đang làm dở của form nhiều trang) → `sessionStorage`.

---

## 2. Chỉ lưu được chuỗi

```javascript
localStorage.setItem("so", 42);
typeof localStorage.getItem("so");        // "string" — đã thành "42"

localStorage.setItem("obj", { a: 1 });
localStorage.getItem("obj");              // "[object Object]" — mất sạch dữ liệu!
```

Mọi giá trị đều bị ép sang chuỗi theo đúng quy tắc ở file `01`. Object thành `"[object Object]"`.

**Luôn đi qua JSON:**

```javascript
// Ghi
localStorage.setItem("user", JSON.stringify({ ten: "An", tuoi: 22 }));

// Đọc
const user = JSON.parse(localStorage.getItem("user"));
```

### Khóa không tồn tại trả về `null`

```javascript
localStorage.getItem("chua-co");            // null
JSON.parse(null);                            // null — không ném lỗi, may mắn
JSON.parse(localStorage.getItem("chua-co")); // null

// Nhưng dữ liệu hỏng thì ném lỗi
localStorage.setItem("hong", "{abc");
JSON.parse(localStorage.getItem("hong"));    // SyntaxError
```

Dữ liệu hỏng xảy ra thật: phiên bản cũ của app lưu định dạng khác, người dùng tự sửa trong DevTools, hoặc ghi bị gián đoạn. Luôn bọc `try/catch`.

### JSON làm mất một số kiểu

```javascript
const goc = {
  ngay: new Date(),
  khongXacDinh: undefined,
  ham: () => {},
  map: new Map([["a", 1]]),
  set: new Set([1, 2]),
  voCuc: Infinity,
  nan: NaN
};

JSON.parse(JSON.stringify(goc));
// {
//   ngay: "2026-09-13T...",   ← Date thành CHUỖI
//   map: {},                   ← Map thành object rỗng
//   set: {},                   ← Set thành object rỗng
//   voCuc: null,               ← Infinity thành null
//   nan: null                  ← NaN thành null
// }
// khongXacDinh và ham BIẾN MẤT hoàn toàn
```

Đây là cùng giới hạn mình đã nói ở mục sao chép sâu file `01`. Với `Date`, cách xử lý thông dụng:

```javascript
// Lưu dạng ISO hoặc timestamp, khôi phục khi đọc
const user = JSON.parse(chuoi, (key, value) => {
  if (key === "ngayTao") return new Date(value);
  return value;
});
```

Tham số thứ hai của `JSON.parse` gọi là **reviver** — hàm chạy cho từng cặp khóa-giá trị.

---

## 3. Giới hạn dung lượng

```javascript
try {
  localStorage.setItem("lon", duLieuRatLon);
} catch (e) {
  if (e.name === "QuotaExceededError") {
    console.error("Hết dung lượng lưu trữ");
  }
}
```

`setItem` còn có thể ném lỗi trong chế độ ẩn danh của một số trình duyệt. **Luôn bọc `try/catch`** — đừng để app chết chỉ vì không lưu được.

---

## 4. Lớp bọc an toàn

Trong dự án thật, không ai gọi `localStorage` trực tiếp rải rác. Viết một lớp bọc:

```javascript
export const kho = {
  doc(khoa, macDinh = null) {
    try {
      const raw = localStorage.getItem(khoa);
      if (raw === null) return macDinh;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`Dữ liệu hỏng ở khóa "${khoa}", dùng giá trị mặc định`, e);
      localStorage.removeItem(khoa);      // dọn rác
      return macDinh;
    }
  },

  ghi(khoa, giaTri) {
    try {
      localStorage.setItem(khoa, JSON.stringify(giaTri));
      return true;
    } catch (e) {
      if (e.name === "QuotaExceededError") {
        console.error("Hết dung lượng lưu trữ");
      }
      return false;
    }
  },

  xoa(khoa) {
    localStorage.removeItem(khoa);
  },

  co(khoa) {
    return localStorage.getItem(khoa) !== null;
  }
};
```

Dùng:

```javascript
const viec = kho.doc("todo:danh-sach", []);    // mặc định mảng rỗng
kho.ghi("todo:danh-sach", viec);
```

### Đặt tên khóa có tiền tố

```javascript
"todo:danh-sach"
"todo:bo-loc"
"pokedex:yeu-thich"
"app:cai-dat"
```

`localStorage` dùng chung cho cả origin. Nếu bạn deploy nhiều app lên cùng một domain (ví dụ GitHub Pages), khóa trùng tên sẽ đè nhau. Tiền tố giải quyết việc đó.

### Thêm phiên bản

```javascript
const PHIEN_BAN = 2;

function docCoPhienBan(khoa, macDinh) {
  const data = kho.doc(khoa);
  if (!data || data.v !== PHIEN_BAN) return macDinh;
  return data.noiDung;
}

function ghiCoPhienBan(khoa, noiDung) {
  kho.ghi(khoa, { v: PHIEN_BAN, noiDung });
}
```

Khi bạn đổi cấu trúc dữ liệu ở phiên bản sau, người dùng cũ sẽ không bị lỗi — app chỉ bỏ qua dữ liệu cũ và bắt đầu lại.

---

## 5. Sự kiện `storage` — đồng bộ giữa các tab

```javascript
window.addEventListener("storage", (e) => {
  console.log(e.key);         // khóa nào thay đổi
  console.log(e.oldValue);    // giá trị cũ
  console.log(e.newValue);    // giá trị mới
  console.log(e.url);         // trang nào gây ra
});
```

**Điểm quan trọng: sự kiện này KHÔNG bắn ở tab đã gây ra thay đổi.** Nó chỉ bắn ở các tab **khác** cùng origin.

Đây thực ra là tính năng hữu ích: mở app ở hai tab, sửa ở tab này thì tab kia tự cập nhật.

```javascript
window.addEventListener("storage", (e) => {
  if (e.key === "todo:danh-sach") {
    trangThai.viec = JSON.parse(e.newValue ?? "[]");
    render();
  }
});
```

Ứng dụng phổ biến nhất: đăng xuất ở một tab thì mọi tab khác cũng đăng xuất.

---

## 6. Cookie và các lựa chọn khác

### Cookie

```javascript
document.cookie = "ten=An; max-age=3600; path=/; SameSite=Lax";
document.cookie;    // "ten=An; khac=..." — chuỗi tất cả cookie
```

API rất khó dùng. Khác biệt then chốt so với `localStorage`: **cookie được gửi kèm mọi request lên server**.

| | `localStorage` | Cookie |
|---|---|---|
| Gửi lên server | Không | **Có, mọi request** |
| Dung lượng | ~5MB | ~4KB |
| JavaScript đọc được | Luôn luôn | Không, nếu `httpOnly` |
| Hết hạn | Không tự | Đặt được |

Dùng cookie khi server cần biết (phiên đăng nhập). Dùng `localStorage` khi chỉ client cần (giao diện, bộ lọc).

### IndexedDB

Cơ sở dữ liệu thật trong trình duyệt: dung lượng lớn (hàng trăm MB), lưu được cả object phức tạp và file, có index và truy vấn, hoạt động bất đồng bộ.

API gốc khá rườm rà; thực tế người ta dùng thư viện như `idb` hoặc `Dexie`.

Bạn chưa cần dùng ngay. Chỉ cần biết: **`localStorage` đầy hoặc cần lưu dữ liệu phức tạp → IndexedDB.**

### Đừng lưu dữ liệu nhạy cảm

`localStorage` không mã hóa, và mọi JavaScript chạy trên trang đều đọc được — kể cả script độc hại lọt vào qua lỗ hổng XSS (file `08`).

**Không lưu:** mật khẩu, số thẻ, dữ liệu cá nhân nhạy cảm.

Token đăng nhập là vùng xám: `localStorage` tiện nhưng dễ bị XSS đánh cắp; cookie `httpOnly` an toàn hơn trước XSS nhưng cần chống CSRF. Đây là chủ đề của chặng 5 và 6.

---

# PHẦN B — ES MODULE

## 7. Vấn đề module giải quyết

Từ đầu chặng 2, code của bạn nằm trong một file `main.js` duy nhất. Với todo app thì còn ổn; với Pokédex thì file đã bắt đầu dài và khó tìm.

Trước khi có module, người ta chia file rồi nhúng nhiều thẻ `<script>`:

```html
<script src="utils.js"></script>
<script src="api.js"></script>
<script src="main.js"></script>
```

Ba vấn đề:

1. **Mọi thứ dùng chung phạm vi toàn cục.** Hai file cùng đặt biến `config` là đè nhau.
2. **Thứ tự nhúng quan trọng.** Sai thứ tự là lỗi, và không ai nhắc bạn.
3. **Không thấy được phụ thuộc.** Nhìn file `main.js` không biết nó cần gì.

Đó là lý do người ta phải dùng IIFE và module pattern (file `05`). ES Module giải quyết triệt để.

---

## 8. `export` và `import`

### Named export

```javascript
// toan.js
export const PI = 3.14159;

export function cong(a, b) {
  return a + b;
}

export class MayTinh { }

// Hoặc gom lại ở cuối file — cách này dễ nhìn hơn
const E = 2.718;
function tru(a, b) { return a - b; }
export { E, tru };
```

```javascript
// main.js
import { PI, cong } from "./toan.js";

import { PI as SoPi } from "./toan.js";        // đổi tên
import * as Toan from "./toan.js";             // gom vào namespace
Toan.cong(1, 2);
```

### Default export

Mỗi file có **tối đa một**:

```javascript
// api.js
export default function goiAPI(url) { }

// main.js — tên gì cũng được
import goiAPI from "./api.js";
import batCuTen from "./api.js";     // vẫn là hàm đó
```

### Kết hợp

```javascript
// api.js
export default api;
export { LoiHTTP, taoUrl };

// main.js
import api, { LoiHTTP } from "./api.js";
```

### Nên dùng cái nào

Ưu tiên **named export**:

- Tên nhất quán trong toàn dự án, dễ tìm kiếm
- IDE tự động gợi ý và tự import chính xác
- Đổi tên hàm thì mọi chỗ import đều báo lỗi ngay — đó là điều tốt

Dùng default khi file chỉ xuất đúng một thứ rõ ràng (một component React, một class).

### Đường dẫn

```javascript
import { x } from "./cung-thu-muc.js";    // BẮT BUỘC có ./ và có .js
import { y } from "../len-mot-cap.js";
import { z } from "/goc-du-an/file.js";
```

Trong trình duyệt thuần, **bắt buộc ghi đủ đuôi `.js`** và bắt buộc có `./`. Bỏ được hai thứ đó là nhờ công cụ build (Vite, chặng 3), chưa phải bây giờ.

### Tái xuất — file gom

```javascript
// utils/index.js
export { debounce, throttle } from "./timing.js";
export { kho } from "./storage.js";
export * from "./format.js";
```

```javascript
// Nơi dùng chỉ cần một dòng import
import { debounce, kho, dinhDangTien } from "./utils/index.js";
```

---

## 9. Đặc tính của module

### Bật lên thế nào

```html
<script type="module" src="main.js"></script>
```

Thiếu `type="module"` thì `import` báo lỗi cú pháp ngay.

### Sáu đặc tính cần nhớ

**1. Có phạm vi riêng.** Biến khai báo trong module không rò ra global — vấn đề số 1 ở mục 7 được giải quyết.

**2. Luôn chạy strict mode.** Không cần viết `"use strict"`. Đây là lý do `this` mặc định là `undefined` như đã nói ở file `06`.

**3. Tự động `defer`.** Module luôn chạy sau khi HTML dựng xong — nhớ file `00`. Nên bạn không còn cần `defer` thủ công.

**4. Chỉ chạy một lần, dù được import bao nhiêu lần.**

```javascript
// dem.js
console.log("dem.js chạy");
export let dem = 0;
export const tang = () => ++dem;
```

```javascript
// a.js
import { tang } from "./dem.js";
tang();

// b.js
import { dem } from "./dem.js";
console.log(dem);      // 1 — CÙNG một instance
```

Chỉ in "dem.js chạy" **một lần**. Đây chính là mẫu singleton — và là cách hiện đại thay cho module pattern bằng IIFE ở file `05`.

**5. `import` được hoist và phân tích tĩnh.** Mọi `import` chạy trước toàn bộ code trong file, bất kể viết ở đâu. Nhờ tính tĩnh này, công cụ build biết được code nào không dùng và loại bỏ — gọi là **tree shaking** (chặng 3).

**6. Hỗ trợ top-level `await`** (đã nói ở file `11`).

### Module cần server

```
file:///C:/du-an/index.html    → lỗi CORS khi import
http://localhost:5500          → chạy được
```

Mở file bằng cách nháy đôi sẽ không chạy được module. Phải dùng Live Server — điều mình đã dặn từ file `00`, giờ bạn biết một lý do nữa.

---

## 10. Import động

`import` thường là tĩnh. Muốn tải theo điều kiện thì dùng `import()` — nó trả về Promise:

```javascript
nut.addEventListener("click", async () => {
  const { taoBieuDo } = await import("./bieu-do.js");
  taoBieuDo(duLieu);
});
```

Module `bieu-do.js` chỉ được tải khi người dùng thật sự bấm nút. Kỹ thuật này gọi là **code splitting**, giúp trang tải ban đầu nhẹ hơn nhiều.

Bạn sẽ gặp lại nó ở chặng 4 (`React.lazy`) và chặng 6 (tối ưu hiệu năng).

---

## 11. Phụ thuộc vòng tròn

```javascript
// a.js
import { b } from "./b.js";
export const a = "A";

// b.js
import { a } from "./a.js";
export const b = "B" + a;      // a có thể chưa được khởi tạo → undefined
```

ES Module xử lý được vòng tròn mà không treo, nhưng một trong hai module sẽ thấy giá trị chưa khởi tạo.

Phụ thuộc vòng tròn hầu như luôn là dấu hiệu thiết kế sai. Cách gỡ: tách phần dùng chung ra một module thứ ba mà cả hai cùng import.

---

## 12. CommonJS — để đọc code cũ

```javascript
// CommonJS — Node.js đời cũ
const fs = require("fs");
module.exports = { doc, ghi };

// ES Module — chuẩn hiện đại
import fs from "fs";
export { doc, ghi };
```

Khác biệt: `require` chạy lúc runtime và có thể đặt trong `if`; `import` là tĩnh, phân tích được trước khi chạy. Chính vì vậy ES Module mới tree-shake được.

Node hiện đại hỗ trợ cả hai. Front-End thì dùng ES Module hoàn toàn.

---

## 13. Tổ chức dự án bằng module

Cấu trúc bạn nên áp dụng từ bài tập file này trở đi:

```
pokedex/
├── index.html
├── style.css
└── js/
    ├── main.js              ← điểm khởi động, nối mọi thứ
    ├── api.js               ← gọi server (file 12)
    ├── kho.js               ← localStorage
    ├── trang-thai.js        ← trạng thái ứng dụng
    ├── render.js            ← vẽ giao diện
    ├── su-kien.js           ← gắn listener
    └── utils/
        ├── index.js
        ├── debounce.js      ← file 05
        └── dinh-dang.js
```

Nguyên tắc: **mỗi file một trách nhiệm**. Sửa cách gọi API thì chỉ động vào `api.js`.

Đây chính là cách một dự án React được tổ chức, chỉ khác tên thư mục. Làm quen từ bây giờ sẽ giúp chặng 4 nhẹ đi nhiều.

---

## 14. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Đọc ra `"[object Object]"` | Quên `JSON.stringify` khi ghi | Luôn qua JSON |
| `SyntaxError` khi `JSON.parse` | Dữ liệu trong storage hỏng | `try/catch` + xóa khóa hỏng |
| `Date` sau khi đọc lại thành chuỗi | JSON không giữ kiểu `Date` | Dùng reviver, hoặc lưu timestamp |
| App chết trong chế độ ẩn danh | `setItem` ném lỗi | Bọc `try/catch` |
| Hai app trên cùng domain đè dữ liệu nhau | Khóa trùng tên | Thêm tiền tố |
| Sự kiện `storage` không chạy | Nó không bắn ở tab gây ra thay đổi | Mở hai tab để thử |
| `Cannot use import outside a module` | Thiếu `type="module"` | Thêm vào thẻ script |
| `Failed to resolve module specifier` | Thiếu `./` hoặc thiếu `.js` | Ghi đủ đường dẫn |
| Lỗi CORS khi mở file HTML | Chạy bằng `file://` | Dùng Live Server |
| Hàm import về là `undefined` | Nhầm default với named export | Kiểm tra có ngoặc nhọn hay không |
| Biến từ module khác luôn `undefined` | Phụ thuộc vòng tròn | Tách phần chung ra module thứ ba |
| Module chạy nhiều lần | Không xảy ra — nếu thấy vậy thì do đường dẫn khác nhau trỏ cùng file | Thống nhất đường dẫn |

---

## 15. Tóm tắt cần thuộc

**Lưu trữ**

1. `localStorage` giữ mãi và dùng chung mọi tab; `sessionStorage` chỉ trong một tab
2. Chỉ lưu được **chuỗi** — luôn qua `JSON.stringify` / `JSON.parse`
3. Khóa không tồn tại trả `null`
4. Luôn `try/catch` cho cả đọc lẫn ghi
5. JSON làm mất `Date`, `undefined`, hàm, `Map`, `Set`
6. Giới hạn ~5MB, ném `QuotaExceededError`
7. Sự kiện `storage` chỉ bắn ở các tab **khác**
8. Cookie gửi kèm mọi request; `localStorage` thì không
9. Không lưu dữ liệu nhạy cảm trong `localStorage`

**Module**

10. Cần `<script type="module">` và phải chạy qua server
11. Ưu tiên named export; default cho file chỉ xuất một thứ
12. Trong trình duyệt thuần, đường dẫn cần `./` và đuôi `.js`
13. Module: phạm vi riêng, luôn strict, tự defer, **chạy đúng một lần**
14. `import` tĩnh → tree shaking; `import()` động → code splitting
15. Phụ thuộc vòng tròn là dấu hiệu thiết kế sai
16. Mỗi file một trách nhiệm

---

## Bài tập

### Bài 1 — Khám phá storage

Tạo `bai-tap-13/kham-pha/`. Mở DevTools → Application → Local Storage để quan sát trực tiếp.

Ghi kết quả vào `du-doan.md`:

1. Lưu số `42`, đọc ra và kiểm tra `typeof`
2. Lưu object trực tiếp không qua JSON — kết quả là gì?
3. Đọc một khóa không tồn tại — trả về gì? So sánh với `undefined`
4. Lưu object có `Date`, `undefined`, hàm, `Map`, `NaN`, `Infinity`. Đọc lại và ghi rõ **từng trường** bị biến đổi thế nào
5. Ghi `"{abc"` vào một khóa rồi `JSON.parse` — lỗi gì?
6. Thử lưu một chuỗi rất lớn (nhân đôi liên tục cho đến khi lỗi). Ghi lại dung lượng tối đa trình duyệt của bạn cho phép
7. Mở app ở **hai tab**. Ở tab 1 gọi `setItem`. Tab nào nhận được sự kiện `storage`?
8. So sánh `localStorage` và `sessionStorage`: lưu ở cả hai, đóng tab, mở lại — cái nào còn?
9. Mở chế độ ẩn danh và chạy lại câu 1. Có gì khác không?

### Bài 2 — Module hóa dự án cũ

Lấy **Pokédex** từ file `12` và tách thành module theo cấu trúc ở mục 13.

Yêu cầu:

1. Chuyển sang `<script type="module">`
2. Tách tối thiểu 6 file theo trách nhiệm
3. `utils/index.js` gom các tiện ích bằng tái xuất
4. **Không** còn biến nào ở phạm vi toàn cục — kiểm tra bằng cách gõ tên biến vào Console, phải ra `ReferenceError`
5. Dùng **import động** cho phần modal chi tiết — chỉ tải khi người dùng bấm vào thẻ đầu tiên. Mở tab Network và chụp lại bằng chứng file chỉ được tải lúc đó.
6. Ghi vào `du-doan.md`: trước và sau khi tách, file dài nhất giảm từ bao nhiêu dòng xuống bao nhiêu?

### Bài 3 — Thêm lưu trữ cho hai app cũ

**Phần A — Todo app (file `09`):**

1. Lưu danh sách việc, tải lại trang vẫn còn
2. Lưu cả bộ lọc đang chọn
3. Dùng lớp bọc `kho` ở mục 4, không gọi `localStorage` trực tiếp
4. Dữ liệu hỏng thì app vẫn chạy được, không màn hình trắng — tự tay vào DevTools ghi rác vào khóa đó để thử
5. Đồng bộ giữa hai tab bằng sự kiện `storage`
6. Nút "Xuất JSON" tải file về; nút "Nhập JSON" đọc file và khôi phục — dùng `FileReader` và thẻ `<a download>`

**Phần B — Pokédex (file `12`):**

7. Lưu danh sách yêu thích
8. Cache dữ liệu Pokémon vào `localStorage` kèm **thời hạn** — quá 24 giờ thì gọi lại API
9. Lưu từ khóa và bộ lọc cuối cùng, mở lại trang thì khôi phục
10. Nút "Xóa cache" kèm hiển thị dung lượng đang dùng

Câu 8 là câu đáng làm nhất: đây là mô hình cache thật, và bạn sẽ gặp lại đúng ý tưởng này ở TanStack Query (chặng 5).

### Bài 4 — Quiz app có đếm giờ (bài chính — dự án cuối chặng 2)

Tạo `bai-tap-13/quiz/`. Đây là sản phẩm tổng kết: nó dùng gần như mọi thứ bạn đã học.

**Nguồn câu hỏi:** Open Trivia DB — `https://opentdb.com/api.php?amount=10&type=multiple`, miễn phí, không cần key, có CORS.

**Luồng màn hình:**

```
[Màn hình bắt đầu]
   Chọn: chủ đề, độ khó, số câu (5/10/20), thời gian mỗi câu
   Hiển thị: điểm cao nhất đã đạt
   → [Bắt đầu]
        ↓
[Màn hình làm bài]
   ┌────────────────────────────────┐
   │ Câu 3/10        ⏱ 00:12  ▓▓▓░ │
   ├────────────────────────────────┤
   │ Thủ đô của Việt Nam là gì?     │
   │  ○ TP.HCM                      │
   │  ○ Hà Nội                      │
   │  ○ Đà Nẵng                     │
   │  ○ Huế                         │
   ├────────────────────────────────┤
   │ Điểm: 2   [Bỏ qua]  [Trả lời]  │
   └────────────────────────────────┘
        ↓
[Màn hình kết quả]
   Điểm, tỷ lệ đúng, thời gian trung bình
   Xem lại từng câu: đáp án bạn chọn vs đáp án đúng
   → [Chơi lại]  [Về đầu]
```

**Chức năng bắt buộc:**

1. Tải câu hỏi từ API, có loading và xử lý lỗi đầy đủ (file `12`)
2. **Giải mã HTML entity** — API trả về `&quot;`, `&#039;`... Xử lý **an toàn**, không dùng `innerHTML`
3. Xáo trộn thứ tự đáp án mỗi câu — viết hàm xáo trộn riêng, không dùng `sort(() => Math.random() - 0.5)` (cách đó cho phân bố lệch)
4. Đếm ngược mỗi câu, có thanh tiến trình; hết giờ tự chuyển câu và tính sai
5. Tính điểm; trả lời nhanh được thêm điểm thưởng
6. Màn hình kết quả có xem lại chi tiết từng câu
7. **Lưu lịch sử** 10 lần chơi gần nhất vào `localStorage`
8. **Lưu điểm cao nhất** theo từng chủ đề
9. **Khôi phục phiên đang dở**: đóng tab giữa chừng, mở lại thì hỏi "Tiếp tục bài đang làm?"
10. Bàn phím: `1`–`4` chọn đáp án, `Enter` xác nhận, `Space` bỏ qua

**Ràng buộc kỹ thuật:**

11. **ES Module**, tối thiểu 6 file, mỗi file một trách nhiệm
12. Kiến trúc `trạng thái → render()` — hàm logic **không** chứa `document.`
13. Event delegation (file `09`)
14. Bộ đếm giờ dùng `Date.now()` để tính hiệu, **không** cộng dồn bằng `setInterval` (nhớ bài 5 file `10`)
15. Toàn bộ nội dung từ API đi qua `textContent` (file `08`)
16. Lớp bọc `kho` xử lý được dữ liệu hỏng
17. Dùng `AbortController` — chuyển màn hình giữa lúc đang tải thì hủy request (file `12`)

**Nâng cao (chọn ít nhất hai):**

18. Chế độ luyện tập: sai thì hiện giải thích, không tính giờ
19. Bảng thống kê tỷ lệ đúng theo từng chủ đề, vẽ bằng CSS hoặc SVG
20. Chia sẻ kết quả — sinh URL có query string chứa điểm số
21. Chế độ offline: cache bộ câu hỏi, mất mạng vẫn chơi được bộ đã tải

**Tự kiểm tra:**

| Thử nghiệm | Kết quả mong đợi |
|---|---|
| Tắt mạng rồi bấm Bắt đầu | Thông báo lỗi rõ ràng + nút thử lại |
| Để hết giờ không trả lời | Tự chuyển câu, tính sai, không treo |
| Tải lại trang giữa bài | Hỏi có muốn tiếp tục |
| Ghi rác vào khóa lịch sử trong DevTools | App vẫn chạy, lịch sử về rỗng |
| Bấm Bắt đầu rồi thoát ngay | Không có lỗi trong Console (request đã bị hủy) |
| Câu hỏi có dấu nháy `'` hoặc `"` | Hiện đúng ký tự, không phải `&#039;` |
| Chạy 60 giây, so với đồng hồ thật | Sai lệch dưới 0.5 giây |
| Gõ tên biến bất kỳ vào Console | `ReferenceError` — không rò ra global |

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. `localStorage`, `sessionStorage`, cookie khác nhau ra sao? Khi nào dùng cái nào?
2. Vì sao phải `try/catch` khi đọc `localStorage`? Kể hai tình huống thật.
3. JSON làm mất những kiểu dữ liệu nào? Cách xử lý với `Date`?
4. ES Module giải quyết ba vấn đề gì của cách nhúng nhiều thẻ `<script>`?
5. Named export và default export khác nhau thế nào? Bạn ưu tiên cái nào, vì sao?
6. Vì sao module chỉ chạy một lần dù được import nhiều nơi? Điều đó có ích gì?
7. Import động dùng để làm gì? Cho một tình huống thật từ bài 2.

---

## Xong file này khi

- [ ] Bài 1 đủ 9 câu, có số liệu dung lượng tối đa thật
- [ ] Pokédex đã tách module, không còn biến toàn cục nào
- [ ] Todo app và Pokédex đều lưu được dữ liệu và chịu được dữ liệu hỏng
- [ ] Quiz app đủ 17 yêu cầu bắt buộc + ít nhất 2 nâng cao
- [ ] Quiz app vượt qua cả 8 thử nghiệm
- [ ] Trả lời được 7 câu ở bài 5 bằng lời

---

# HẾT CHẶNG 2

Bạn vừa đi qua 14 file và khoảng 6 tuần. Nhìn lại xem đã có gì.

## Bốn sản phẩm

1. **Máy tính** — DOM, sự kiện, quản lý trạng thái
2. **Todo app** — event delegation, sửa tại chỗ, lưu trữ, đồng bộ đa tab
3. **Pokédex** — gọi API, debounce, chống race condition, cache, module hóa
4. **Quiz app** — tổng hợp toàn bộ

Ba cái sau đều xứng đáng nằm trong portfolio. Trước khi sang chặng 3, dành một buổi: viết README cho từng cái (mô tả, ảnh chụp, công nghệ dùng, điều bạn học được), deploy lên Netlify hoặc Vercel, kiểm tra link demo chạy được.

## Bài kiểm tra cuối chặng

Trả lời **bằng lời**, không nhìn tài liệu. Tự quay video hoặc nói cho ai đó nghe — viết ra giấy dễ hơn nói thành lời rất nhiều, mà phỏng vấn thì bạn phải nói.

**Nền tảng**
1. Primitive và object khác nhau thế nào khi gán và khi so sánh?
2. Kể 8 giá trị falsy. Vì sao mảng rỗng lại truthy?
3. `==` và `===` khác nhau ra sao? Khi nào dùng `==` là hợp lý?

**Hàm và scope**
4. Hoisting là gì? Vì sao `let` được hoist mà vẫn báo lỗi?
5. Lexical scope nghĩa là gì?
6. Kể ba khác biệt giữa arrow function và function thường.

**Ba khái niệm lớn**
7. Closure là gì? Kể một chỗ bạn đã dùng nó trong code của mình.
8. Bốn quy tắc xác định `this`, theo thứ tự ưu tiên.
9. Prototype chain là gì? `class` trong JavaScript có phải class thật không?

**DOM và sự kiện**
10. Event delegation là gì? Vì sao nó cần thiết?
11. `e.target` và `e.currentTarget` khác nhau chỗ nào?
12. Vì sao dùng `innerHTML` với dữ liệu người dùng là nguy hiểm?

**Bất đồng bộ**
13. Event loop hoạt động thế nào? Microtask và macrotask khác gì?
14. `.then()` trả về gì? Vì sao nối chuỗi được?
15. Khi nào `await` tuần tự là sai?
16. Vì sao `fetch` không reject khi server trả 404?
17. CORS là gì? Ai sửa được lỗi CORS?

Trả lời trôi chảy được 14/17 câu là bạn đã sẵn sàng cho vòng kỹ thuật JavaScript của phỏng vấn Junior. Câu nào ấp úng, quay lại đúng file đó đọc lại mục tương ứng.

## Tiếp theo

Chặng 3 — Git, tooling, TypeScript. 8 file, khoảng 3 tuần. Nhẹ hơn chặng 2 nhiều, nhưng là chặng biến bạn từ "người viết được JavaScript" thành "người làm việc được trong một nhóm".

Việc đầu tiên của chặng 3: đưa toàn bộ chặng 1 và chặng 2 lên GitHub. Nhà tuyển dụng sẽ nhìn vào lịch sử commit của bạn.

Xong thì gửi mình cả thư mục `quiz/` + `du-doan.md`, kèm **"viết file 00-bat-dau-chang-3"**.