# 04 — Vite

> **Cần có trước:** xong `03` (npm, `package.json`).
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** Vite là công cụ dựng dự án gần như mặc định cho Front-End hiện đại — thay thế hoàn toàn cách làm "mở file bằng Live Server" của chặng 2. Ở chặng 4, mọi dự án React bạn dựng đều bắt đầu bằng Vite.

---

## 1. Vấn đề trước khi có Vite

Nhớ lại cách bạn làm việc suốt chặng 2: mở file HTML bằng Live Server, sửa code, F5 (hoặc tự động reload). Với vài file JavaScript thuần, cách đó ổn.

Nhưng khi dự án lớn lên — nhiều module (nhớ file `13` chặng 2), dùng TypeScript, dùng React với cú pháp JSX mà trình duyệt không hiểu được — bạn cần một công cụ đứng giữa code bạn viết và trình duyệt, làm ba việc:

1. **Dịch** — biến TypeScript/JSX thành JavaScript thuần trình duyệt hiểu được
2. **Gộp** — nối hàng trăm file module thành ít file hơn để tải nhanh
3. **Tối ưu** — nén code, loại bỏ phần không dùng đến, cho bản chạy thật (production)

Công cụ làm việc này gọi chung là **build tool**. Trước Vite, công cụ phổ biến nhất là Webpack — mạnh nhưng cấu hình phức tạp và dev server khởi động chậm với dự án lớn. Vite (đọc là "veet", tiếng Pháp nghĩa là "nhanh") sinh ra để giải quyết đúng vấn đề tốc độ đó.

---

## 2. Vite khác gì — và vì sao nhanh

### Cách cũ (Webpack và tương tự)

Trước khi dev server chạy được, công cụ phải **gộp toàn bộ dự án** thành một bundle, dù bạn chỉ cần xem một trang. Dự án càng lớn, thời gian chờ khởi động càng lâu — có dự án mất hàng chục giây chỉ để mở server.

### Cách của Vite

Vite tận dụng một tính năng có sẵn trong mọi trình duyệt hiện đại: **ES Module** (chính là thứ bạn đã học ở file `13` chặng 2 — `import`/`export` chạy thẳng trong trình duyệt, không cần dịch trước).

Ở chế độ phát triển, Vite **không gộp gì cả**. Nó chỉ dịch từng file khi trình duyệt yêu cầu (qua `import`), gần như tức thì. Dev server khởi động trong khoảng một giây, bất kể dự án lớn cỡ nào.

```
Cách cũ:  gộp TOÀN BỘ trước → mở server (chậm dần theo kích thước dự án)
Vite:     mở server ngay → dịch từng file theo yêu cầu (gần như không đổi theo kích thước)
```

Khi build cho production (mục 8), Vite mới thực sự gộp và tối ưu toàn bộ — dùng một công cụ khác tên **Rollup** ở bên dưới, vì lúc đó tốc độ khởi động không còn quan trọng, quan trọng là kết quả cuối gọn và nhanh khi người dùng tải về.

---

## 3. Dựng dự án đầu tiên

```bash
npm create vite@latest
```

Lệnh này dùng `npx`/`npm create` để tải và chạy bộ khởi tạo của Vite mà không cần cài vĩnh viễn (nhớ mục 8 file `03`). Nó sẽ hỏi lần lượt:

```
Project name: ten-du-an
Select a framework: Vanilla / React / Vue / ...
Select a variant: JavaScript / TypeScript
```

Cho bài tập file này, chọn **Vanilla** + **JavaScript** — bạn chưa học React, và mục tiêu là hiểu bản thân Vite trước khi nó bị che bởi một framework khác.

```bash
cd ten-du-an
npm install
npm run dev
```

Terminal hiện một địa chỉ, thường là `http://localhost:5173`. Mở nó — trang mẫu của Vite hiện ra.

---

## 4. Cấu trúc dự án Vite (Vanilla)

```
ten-du-an/
├── index.html          ← ĐIỂM VÀO, không nằm trong thư mục con nào
├── package.json
├── package-lock.json
├── vite.config.js       ← cấu hình Vite (mục 7)
├── public/               ← file tĩnh, copy y nguyên khi build
│   └── vite.svg
├── src/
│   ├── main.js           ← JavaScript khởi động
│   ├── style.css
│   └── counter.js
└── node_modules/
```

Khác biệt lớn nhất so với thói quen chặng 2: `index.html` **là điểm vào**, không phải file tĩnh để mở trực tiếp. Mở nó:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Ten Du An</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

Thẻ `<script type="module" src="/src/main.js">` chính là nơi Vite bắt đầu. Từ đây, mọi `import` trong `main.js` sẽ được Vite dịch và phục vụ theo yêu cầu, đúng cơ chế ở mục 2.

### `public/` vs `src/`

Đây là chỗ người mới hay nhầm.

- **`src/`** — mọi thứ Vite sẽ **xử lý**: dịch, gộp, tối ưu, đổi tên file (thêm hash) khi build. Ảnh, CSS, JS trong đây được `import` từ code
- **`public/`** — file được **copy y nguyên**, không qua xử lý gì. Dùng cho: `favicon.ico`, `robots.txt`, hoặc file cần giữ đúng tên/đường dẫn cố định

```javascript
// Import ảnh từ src/ — Vite xử lý, tối ưu, đổi tên khi build
import logo from './logo.png';
document.querySelector('#app').innerHTML = `<img src="${logo}">`;

// Tham chiếu file trong public/ — viết đường dẫn thẳng, không import
// public/anh-nen.jpg → dùng như /anh-nen.jpg
```

**Quy tắc:** không chắc thì để trong `src/` và `import` nó — đây là cách hiện đại, cho Vite tối ưu giúp bạn. Chỉ dùng `public/` khi có lý do cụ thể (cần đường dẫn cố định, hoặc file không được xử lý bởi bất kỳ công cụ nào, như `robots.txt`).

---

## 5. Hot Module Replacement (HMR)

Đây là tính năng làm thay đổi hẳn cảm giác code so với chặng 2.

```javascript
// src/main.js
document.querySelector('#app').innerHTML = `
  <h1>Xin chào</h1>
`;
```

Sửa dòng `Xin chào` thành `Chào bạn`, lưu file — trình duyệt **cập nhật ngay lập tức**, không reload cả trang.

### Khác biệt so với Live Server (chặng 2)

- **Live Server** — reload **toàn bộ trang**. Nếu bạn có một ô input đang gõ dở, hay một modal đang mở, tất cả mất sạch sau mỗi lần lưu file
- **HMR của Vite** — chỉ thay **đúng phần code vừa đổi**, giữ nguyên trạng thái hiện tại của ứng dụng (ô input vẫn còn nội dung đang gõ, modal vẫn đang mở)

Với dự án nhỏ, khác biệt này chưa rõ. Với ứng dụng phức tạp — ví dụ một form nhiều bước hay một giỏ hàng đang có dữ liệu — HMR tiết kiệm rất nhiều thời gian vì bạn không phải lặp lại thao tác để quay về đúng trạng thái đang test.

### CSS được HMR hoàn toàn miễn phí

```javascript
import './style.css';
```

Import CSS theo cách này, Vite tự động HMR nó — sửa màu, sửa khoảng cách, thấy ngay không cần reload gì cả, kể cả không cần cấu hình thêm.

---

## 6. Import mọi thứ

Một trong những điều hay nhất của Vite: gần như mọi loại file đều `import` được thẳng, Vite tự biết cách xử lý.

```javascript
// CSS
import './style.css';

// Ảnh — trả về đường dẫn (string) tới file đã xử lý
import logoUrl from './logo.png';

// JSON — tự động parse thành object
import data from './du-lieu.json';
console.log(data.ten);

// File JS thường
import { format } from './utils.js';
```

### Import động cho code splitting

Nhớ lại mục 10 file `13` chặng 2 — `import()` động trả về Promise, chỉ tải khi cần:

```javascript
document.querySelector('#nut-nang').addEventListener('click', async () => {
  const { taoBieuDo } = await import('./bieu-do.js');
  taoBieuDo();
});
```

Vite tự động tách phần này thành một file riêng, chỉ tải khi người dùng thật sự bấm nút — đúng khái niệm code splitting bạn đã học lý thuyết ở chặng 2, giờ Vite làm nó tự động không cần cấu hình gì thêm.

---

## 7. `vite.config.js`

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,          // đổi cổng mặc định (5173) nếu muốn
    open: true            // tự mở trình duyệt khi chạy npm run dev
  },
  build: {
    outDir: 'dist'         // thư mục chứa bản build, mặc định đã là "dist"
  }
});
```

`defineConfig` không bắt buộc về mặt kỹ thuật — bạn có thể `export default { ... }` trực tiếp — nhưng nó cho IDE gợi ý đúng các trường hợp lệ, và là quy ước gần như mọi dự án dùng.

### Proxy — giải quyết CORS lúc phát triển

Nhớ lại file `12` chặng 2: CORS chặn trình duyệt gọi thẳng tới một API khác origin trong lúc phát triển. Vite có sẵn giải pháp:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api-that-su.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

Với cấu hình này, code của bạn gọi `fetch('/api/users')` — Vite dev server sẽ âm thầm chuyển tiếp request đó tới `https://api-that-su.example.com/users`. Vì trình duyệt chỉ thấy bạn gọi tới chính domain đang chạy (`localhost:5173`), **không có chuyện cross-origin nào xảy ra** — CORS không còn là vấn đề trong lúc phát triển.

Đây là cách giải quyết CORS lúc học/phát triển mà file `12` chặng 2 đã hẹn để dành tới chặng 3.

**Lưu ý quan trọng:** proxy chỉ hoạt động khi chạy `npm run dev`. Khi build production thật, request vẫn đi thẳng và CORS thật vẫn cần được xử lý ở phía server (đúng như đã học — chỉ server sửa được CORS).

---

## 8. Build cho production

```bash
npm run build
```

Lệnh này (mặc định Vite tạo sẵn trong `scripts`) chạy `vite build`, tạo ra thư mục `dist/`:

```
dist/
├── index.html
└── assets/
    ├── index-a3f5c9d2.js
    ├── index-8b21e7f1.css
    └── logo-4c9d1a3e.png
```

So sánh với code gốc, ba việc đã xảy ra:

1. **Minify** — xóa khoảng trắng, đổi tên biến thành ngắn nhất có thể, code người đọc gần như không đọc nổi nhưng máy chạy y hệt
2. **Bundle** — gộp nhiều file module thành ít file hơn, giảm số lần trình duyệt phải request
3. **Đặt tên có hash** — `index-a3f5c9d2.js` thay vì `index.js`. Chuỗi hash đó tính từ **nội dung** file: nội dung đổi thì hash đổi tên file theo. Nhờ đó, trình duyệt của người dùng cache file mãi mãi (vì tên không đổi nghĩa là nội dung không đổi) — cập nhật code thì tên file mới tự sinh, buộc trình duyệt tải bản mới, không cần người dùng tự xóa cache

```bash
npm run preview
```

Chạy thử **chính bản build** ở `dist/` (không phải mã nguồn `src/`) trên một server cục bộ nhỏ — cách duy nhất để kiểm tra chắc chắn bản production hoạt động đúng trước khi deploy thật. `npm run dev` và `npm run preview` là hai thứ khác nhau: dev chạy mã nguồn qua HMR, preview chạy đúng file sẽ được deploy.

### So sánh kích thước

```bash
du -sh dist/
```

Một dự án Vanilla JS nhỏ, bản build thường chỉ vài chục KB — nhẹ hơn rất nhiều so với toàn bộ `node_modules` vài trăm MB. Đây chính là điều `dependencies` (chạy thật) và `devDependencies` (chỉ lúc code) ở file `03` giải quyết: `devDependencies` như Vite hoàn toàn không có mặt trong `dist/`.

---

## 9. Biến môi trường

```bash
# .env
VITE_API_URL=https://api.example.com

# .env.local — riêng cho máy bạn, KHÔNG commit
VITE_API_KEY=abc123xyz
```

```javascript
console.log(import.meta.env.VITE_API_URL);
```

Hai quy tắc bắt buộc của Vite:

1. **Chỉ biến có tiền tố `VITE_`** mới lộ ra phía client. Đây là lớp bảo vệ có chủ đích — một biến không có `VITE_` (ví dụ `DATABASE_PASSWORD=...`) sẽ **không bao giờ** xuất hiện trong code build ra, tránh việc lỡ tay để lộ secret nhạy cảm ra trình duyệt của người dùng
2. **`.env.local` không bao giờ commit** — Vite tự động thêm nó vào `.gitignore` khi tạo dự án, kiểm tra lại cho chắc

```bash
# .gitignore (Vite tự sinh sẵn, kiểm tra có đủ)
.env.local
.env.*.local
```

```javascript
console.log(import.meta.env.MODE);   // "development" hoặc "production"
console.log(import.meta.env.DEV);    // true khi npm run dev
console.log(import.meta.env.PROD);   // true khi build production
```

Dùng để viết code khác nhau tùy môi trường, ví dụ chỉ log debug lúc phát triển:

```javascript
if (import.meta.env.DEV) {
  console.log('Đang chạy dev, dữ liệu:', duLieu);
}
```

---

## 10. Alias đường dẫn

Nhớ lại cơn đau đầu ở file `13` chặng 2: `import '../../../components/Button.js'`. Vite cho phép đặt bí danh:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

```javascript
// Thay vì
import { debounce } from '../../../utils/timing.js';

// Viết
import { debounce } from '@/utils/timing.js';
```

`@` là quy ước phổ biến trỏ về thư mục `src/`. Đường dẫn ngắn hơn, và quan trọng hơn: **di chuyển file đi đâu cũng không hỏng import** — vì nó không còn phụ thuộc vào file hiện tại nằm ở cấp nào.

---

## 11. Plugin

Vite có hệ sinh thái plugin để mở rộng khả năng dịch các loại file khác nhau. Cài React sau này (chặng 4) chính là cài một plugin:

```bash
npm create vite@latest ten-du-an -- --template react
```

Nhìn vào `vite.config.js` của một dự án React vừa tạo, bạn sẽ thấy:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
});
```

Plugin `@vitejs/plugin-react` dạy Vite cách dịch cú pháp JSX (thứ bạn sẽ học ở chặng 4) thành JavaScript thường. Bạn chưa cần hiểu JSX bây giờ — chỉ cần thấy được: **cấu trúc dự án React bạn sẽ dùng ở chặng 4 chính là dự án Vite bạn vừa học, cộng thêm một plugin.**

---

## 12. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Mở `index.html` bằng cách nháy đôi, trang trắng | Vite dự án cần chạy qua dev server, không mở file trực tiếp | Luôn dùng `npm run dev` |
| Sửa CSS/JS, trình duyệt không cập nhật | Dev server đã tắt, hoặc lỗi cú pháp chặn HMR | Kiểm tra terminal có báo lỗi đỏ không |
| `import` ảnh báo lỗi "does not provide an export" | Nhầm cú pháp `import` ảnh với `import` module thường | Với ảnh, biến nhận được là **đường dẫn** (string), không phải object |
| File trong `public/` không load được | Viết `import` cho nó, hoặc sai đường dẫn | File trong `public/` tham chiếu thẳng bằng đường dẫn, không `import` |
| Biến môi trường ra `undefined` | Thiếu tiền tố `VITE_` | Đổi tên biến, thêm `VITE_` phía trước |
| `npm run build` lỗi dù `npm run dev` chạy tốt | Dev bỏ qua một số lỗi mà build thì kiểm tra chặt hơn (ví dụ import sai chính tả, file không tồn tại) | Đọc kỹ thông báo lỗi, thường chỉ đúng dòng gây lỗi |
| Deploy lên rồi trang lỗi, nhưng `npm run preview` chạy tốt local | Cấu hình `base` sai với đường dẫn thực tế trên server (thường gặp với GitHub Pages đặt trong thư mục con) | Xem cấu hình `base` trong `vite.config.js` |
| Đổi `vite.config.js` nhưng không thấy tác dụng | Dev server không tự đọc lại cấu hình khi đang chạy | Dừng (`Ctrl+C`) và chạy lại `npm run dev` |

---

## 13. Tóm tắt cần thuộc

1. Vite nhanh vì không gộp gì lúc phát triển — tận dụng ES Module chạy thẳng trong trình duyệt
2. `index.html` là điểm vào của dự án Vite, không phải file tĩnh để mở trực tiếp
3. `src/` được Vite xử lý và tối ưu; `public/` chỉ copy nguyên vẹn
4. HMR giữ nguyên trạng thái ứng dụng khi sửa code, khác hẳn reload toàn trang của Live Server
5. Gần như mọi loại file `import` được thẳng — CSS, ảnh, JSON
6. `vite.config.js` cấu hình server, build, proxy, alias, plugin
7. `proxy` giải quyết CORS lúc phát triển bằng cách chuyển tiếp request qua chính dev server
8. `npm run build` tạo `dist/`: minify, bundle, đặt tên file theo hash nội dung
9. `npm run preview` chạy thử đúng bản build, khác với `npm run dev` chạy mã nguồn
10. Chỉ biến môi trường có tiền tố `VITE_` mới lộ ra phía client — lớp bảo vệ secret có chủ đích
11. Alias (`@/...`) giúp import không phụ thuộc vị trí file hiện tại
12. Dự án React ở chặng 4 chính là dự án Vite này cộng thêm plugin `@vitejs/plugin-react`

---

## Bài tập

### Bài 1 — Dựng dự án từ đầu (bài chính)

1. `npm create vite@latest` — chọn Vanilla + JavaScript, đặt tên `bai-tap-04-vite`
2. `npm install`, `npm run dev`
3. Mở `vite.config.js`, xác nhận nó chưa có gì đặc biệt (cấu hình rỗng hoặc gần rỗng)
4. Đọc `package.json` được Vite tự sinh — so với những gì bạn học ở file `03`, chỉ ra: `scripts` có gì, `devDependencies` có gì
5. Sửa nội dung trong `src/main.js`, quan sát HMR hoạt động — ghi lại cảm giác so với Live Server ở chặng 2 vào `ghi-chu.md`

### Bài 2 — Import mọi thứ // skip

Trong dự án bài 1:

1. Thêm một file `du-lieu.json` chứa mảng vài object bất kỳ (ví dụ danh sách sản phẩm), `import` nó vào `main.js`, in ra Console — xác nhận nó tự thành object, không cần `JSON.parse`
2. Thêm một ảnh bất kỳ vào `src/assets/`, `import` nó, gắn vào một thẻ `<img>` trên trang — kiểm tra `console.log` giá trị `import` ra là gì (kiểu dữ liệu, nội dung)
3. Thêm cùng một ảnh đó vào `public/`, tham chiếu bằng đường dẫn thẳng (không `import`), so sánh cách viết với bước 2
4. Viết một nút bấm, dùng `import()` động để tải một module riêng chỉ khi bấm nút — mở tab Network của DevTools, xác nhận file JS đó **chỉ** được tải sau khi bấm, không phải lúc trang load

### Bài 3 — Build và so sánh // skip

1. `npm run build`
2. Mở thư mục `dist/`, liệt kê các file bên trong vào `ghi-chu.md`
3. Mở file JS trong `dist/assets/` bằng VS Code — so sánh với code gốc trong `src/`, mô tả sự khác biệt bạn thấy (khoảng trắng, tên biến...)
4. `npm run preview`, mở trình duyệt, xác nhận trang chạy đúng y như `npm run dev`
5. `du -sh dist/` (hoặc kiểm tra dung lượng qua file explorer nếu dùng Windows) và `du -sh node_modules/` — so sánh hai con số, ghi nhận xét

### Bài 4 — Biến môi trường // skip

1. Tạo file `.env` với một biến `VITE_TEN_UNG_DUNG=Bai Tap Vite`
2. Tạo file `.env.local` với một biến `VITE_API_KEY=bi-mat-cua-toi`
3. Trong `main.js`, in cả hai ra Console bằng `import.meta.env`
4. Thêm một biến **không** có tiền tố `VITE_`, ví dụ `SECRET_KEY=xxx`, thử in ra — xác nhận nó là `undefined`, giải thích vì sao trong `ghi-chu.md`
5. `npm run build`, mở file trong `dist/assets/`, tìm (Ctrl+F) xem chuỗi `bi-mat-cua-toi` (từ `.env.local`) có nằm trong file build ra không — đây là điều cần biết trước khi tưởng nhầm biến môi trường Vite là nơi giấu secret an toàn tuyệt đối
6. Xác nhận `.env.local` đã nằm trong `.gitignore`

### Bài 5 — Alias và proxy

**Phần A — Alias:**

1. Tạo cấu trúc `src/utils/timing.js` chứa một hàm `debounce` bất kỳ (lấy lại từ file `05` chặng 2)
2. Cấu hình alias `@` trỏ về `src/` trong `vite.config.js`
3. Từ `main.js`, `import` hàm đó bằng cả hai cách: đường dẫn tương đối (`./utils/timing.js`) và bằng alias (`@/utils/timing.js`) — xác nhận cả hai đều chạy được

**Phần B — Proxy (cần một API công khai có CORS mở, ví dụ PokéAPI từ chặng 2):**

1. Trong `vite.config.js`, cấu hình `server.proxy` để `/poke-api` chuyển tiếp tới `https://pokeapi.co/api/v2`
2. Trong `main.js`, `fetch('/poke-api/pokemon/1')` thay vì gọi thẳng URL đầy đủ
3. Mở tab Network của DevTools, xác nhận request đi tới `localhost` chứ không phải domain thật của PokéAPI
4. Ghi vào `ghi-chu.md`: proxy này còn hoạt động khi bạn `npm run build` rồi deploy thật không? Vì sao?

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Vì sao Vite khởi động dev server nhanh hơn nhiều so với cách gộp toàn bộ trước khi phục vụ?
2. `src/` và `public/` khác nhau ở điểm nào? Cho một ví dụ nên đặt ở mỗi thư mục.
3. HMR khác reload toàn trang ở điểm nào? Vì sao điều đó quan trọng với ứng dụng có nhiều state?
4. Vì sao chỉ biến có tiền tố `VITE_` mới lộ ra phía client? Điều đó bảo vệ được gì?
5. `npm run dev`, `npm run build`, `npm run preview` khác nhau ra sao? Khi nào dùng lệnh nào?

---

## Xong file này khi

- [ ] Dựng được một dự án Vite từ con số không, chạy `npm run dev` thành công
- [ ] Import được cả JSON, ảnh trong `src/`, và dùng đúng một file trong `public/` để so sánh
- [ ] Xác nhận được import động chỉ tải file khi cần, qua tab Network
- [ ] Chạy được `npm run build` và `npm run preview`, so sánh được dung lượng `dist/` với `node_modules/`
- [ ] Thấy tận mắt biến không có `VITE_` bị loại khỏi bản build (bài 4 câu 4–5)
- [ ] Cấu hình được alias và proxy chạy đúng
- [ ] Trả lời được 5 câu ở bài 6 bằng lời

File tiếp theo (`05-eslint-prettier`) sẽ thêm vào chính dự án Vite này hai công cụ giữ code sạch: ESLint bắt lỗi tiềm ẩn, Prettier tự định dạng. Sau đó khối B khép lại, và bạn sẵn sàng cho TypeScript ở khối C.

Xong thì gửi mình `ghi-chu.md`, kèm **"viết file 05-eslint-prettier"**.