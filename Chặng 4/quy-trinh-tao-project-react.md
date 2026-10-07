# Quy trình tạo project Vite + React + TypeScript + ESLint + Prettier

> Ghi chú tra nhanh. Không cần thuộc lòng — mở file này ra làm theo.
> Bản cho TS thuần: `Chặng 3/quy-trinh-tao-project-ts.md`. Giải thích chi tiết: mục 8 và 10 file `00-bat-dau-chang-4.md`.
>
> Khác chặng 3: template React **đã có sẵn** ESLint (gồm `typescript-eslint`, `react-hooks`, `react-refresh`) và `@types/node`. Ta chỉ **bổ sung** chứ không cài ESLint từ đầu.

---

## Bước 1 — Tạo project

```bash
npm create vite@latest
# Project name: ten-project
# Framework: React
# Variant: TypeScript   (hoặc TypeScript + SWC — học thì bản nào cũng được)

cd ten-project
npm install
npm run dev
```

Mở `http://localhost:5173` thấy logo React + nút đếm là được.

## Bước 2 — Cài Prettier

```bash
npm install -D prettier eslint-config-prettier
```

## Bước 3 — Sửa / tạo các file config

### `eslint.config.js` — chỉ thêm 2 dòng (đánh dấu `// ← THÊM`)

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat"; // ← THÊM

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended, // ĐỪNG BAO GIỜ tắt
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  eslintConfigPrettier, // ← THÊM — LUÔN đặt CUỐI CÙNG
]);
```

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80
}
```

### `.prettierignore`

```
dist/
node_modules/
package-lock.json
```

## Bước 4 — Thêm scripts vào `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "typecheck": "tsc -b",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier . --write",
  "format:check": "prettier . --check"
}
```

> `typecheck` dùng `tsc -b`, **không** dùng `tsc --noEmit` như chặng 3 — xem bảng "Những điều cần nhớ".

Chạy `npm run format` **một lần** ngay sau bước này: code mẫu của Vite viết theo kiểu `'nháy đơn'` + không chấm phẩy, Prettier sẽ đổi hết theo `.prettierrc` của mình.

## Bước 5 — Alias `@` → `src/`

Khai báo ở **2 nơi**. `@types/node` template đã cài sẵn, không cần cài thêm.

### `vite.config.ts` — thêm `resolve`

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

### `tsconfig.app.json` (⚠ **không phải** `tsconfig.json`) — thêm vào `compilerOptions`

```json
"strict": true,
"paths": {
  "@/*": ["./src/*"]
}
```

Dùng: `import App from "@/App.tsx";`

## Bước 6 — Husky + lint-staged (tự lint/format trước mỗi commit)

```bash
npm install -D husky lint-staged
```

Thêm vào `package.json` (ngang hàng với `"scripts"`):

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md,html}": "prettier --write"
}
```

Phần cài Husky **khác nhau** tùy project có kho Git riêng hay không:

### Trường hợp A — project là kho Git riêng (vd `du-an-quan-ly-chi-tieu`)

Thư mục `.git` nằm ngay trong project:

```bash
git init            # nếu chưa có
npx husky init      # tạo .husky/pre-commit + script "prepare": "husky"
```

Mở `.husky/pre-commit`, thay nội dung bằng:

```sh
npx lint-staged
```

### Trường hợp B — project nằm trong kho `LearningFE` (vd `Chặng 4/bai-tap`)

`.git` nằm ở `D:\LearningFE`, **không** trong project → `npx husky init` sẽ báo `.git can't be found`. Làm tay:

1. Thêm script vào `package.json` của project:

   ```json
   "prepare": "cd ../.. && husky \"Chặng 4/bai-tap/.husky\""
   ```

2. Tạo file `.husky/pre-commit` trong project:

   ```sh
   cd "Chặng 4/bai-tap"
   npx lint-staged
   ```

3. Chạy `npm run prepare` một lần để Husky gắn hook vào kho `LearningFE`.

> Hook chạy từ gốc kho Git nên phải `cd` vào project trước. Đổi tên thư mục → nhớ sửa cả 2 chỗ.
> Hook áp dụng cho **cả kho** `LearningFE`, nhưng lint-staged chỉ xử lý file nằm trong project có config — commit file chặng khác vẫn bình thường.

## Bước 7 — Chạy thử

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Cả bốn không báo lỗi là xong. Thử thêm: sửa 1 file `.tsx` cho lệch format, `git add` + `git commit` → file phải được Prettier sửa lại tự động.

## Bước 8 — Git + GitHub (trường hợp A)

```bash
git add .
git commit -m "chore: khởi tạo project Vite React TS"
# tạo repo trống trên GitHub rồi:
git remote add origin <url>
git push -u origin main
```

`.gitignore` Vite đã tạo sẵn (có `node_modules`, `dist`).

---

## Những điều cần nhớ

| Điều | Vì sao |
|---|---|
| Template React đã có ESLint | Không chạy `npm init @eslint/config` nữa — chỉ thêm `eslintConfigPrettier` vào **cuối** mảng |
| `eslintConfigPrettier` đặt **ngoài** object `extends`, ở cuối mảng | Đặt cuối mới tắt được rule format của các config phía trước |
| Không tắt `react-hooks` | Rule `exhaustive-deps` sẽ cứu bạn nhiều lần ở file `06` (`useEffect`) |
| Cảnh báo của `react-refresh` | File export thêm hằng/hàm thường ngoài component → HMR mất state. Tách hằng/hàm ra file riêng |
| tsconfig bị **tách 3 file** | `tsconfig.json` chỉ là "mục lục" (`files: []` + `references`). Code trong `src/` do `tsconfig.app.json` quản; `vite.config.ts` do `tsconfig.node.json` quản |
| `paths`, `strict` đặt trong `tsconfig.app.json` | Đặt ở `tsconfig.json` thì không có tác dụng với `src/` vì file đó không kiểm tra file nào |
| `typecheck` = `tsc -b`, không phải `tsc --noEmit` | `tsc --noEmit` đọc `tsconfig.json` (rỗng) → không kiểm tra gì mà vẫn báo "ok". `-b` đi theo `references`; các tsconfig con đã có `noEmit: true` nên không sinh file |
| Vite **không** kiểm tra kiểu | Như chặng 3 — xem gạch đỏ trong editor hoặc `npm run typecheck` |
| Đuôi `.tsx` cho file có JSX | File `.ts` viết JSX sẽ báo lỗi cú pháp |
| `console.log` in 2 lần khi dev | `StrictMode` — bình thường, đừng tắt. Build production thì hết |
| Husky cần thấy `.git` | Project trong kho chung → dùng cách B (`cd ../.. && husky <đường-dẫn>/.husky`) |
| Alias khai báo ở `vite.config.ts` **và** `tsconfig.app.json` | Thiếu `paths` thì Vite chạy được nhưng `tsc`/editor báo `Cannot find module '@/...'` |
