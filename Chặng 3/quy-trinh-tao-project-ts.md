# Quy trình tạo project Vite + TypeScript + ESLint + Prettier

> Ghi chú tra nhanh. Không cần thuộc lòng — mở file này ra làm theo, hoặc copy config từ `bai-tap-06/bai-tap-06-ts`.
> Muốn hiểu chi tiết: xem file `05-eslint-va-prettier.md` và mục 14 file `06-typescript-co-ban.md`.

---

## Bước 1 — Tạo project

```bash
npm create vite@latest
# Project name: ten-project
# Framework: Vanilla
# Variant: TypeScript

cd ten-project
npm install
```

## Bước 2 — Cài ESLint (+ typescript-eslint)

**Cách A — để công cụ tự tạo:**

```bash
npm init @eslint/config@latest
# chọn: JavaScript/TypeScript → TypeScript: Yes → chạy trên Browser
```

**Cách B — cài tay rồi copy config:**

```bash
npm install -D eslint @eslint/js globals typescript-eslint
```

## Bước 3 — Cài Prettier

```bash
npm install -D prettier eslint-config-prettier
```

## Bước 4 — Tạo các file config

### `eslint.config.js`

```js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  { ignores: ["dist/", "node_modules/"] }, // 1. bỏ qua thư mục build
  js.configs.recommended,                  // 2. rule JS cơ bản
  tseslint.configs.recommended,            // 3. PHẦN CHÍNH cho TS: parser + rule TS
  {
    files: ["**/*.ts"],
    languageOptions: { globals: globals.browser },
    rules: {
      // tuỳ chỉnh cá nhân — PHẢI đặt SAU tseslint thì mới ghi đè được
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  eslintConfigPrettier,                    // 4. LUÔN đặt CUỐI CÙNG
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

## Bước 5 — Thêm scripts vào `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier . --write",
  "format:check": "prettier . --check"
}
```

## Bước 5b — (Tùy chọn) Alias `@` → `src/`

Cần khai báo ở **2 nơi**: Vite hiểu để chạy, TypeScript hiểu để kiểm tra kiểu.

```bash
npm install -D @types/node
```

### `vite.config.ts` (tự tạo — template Vanilla không có sẵn)

```ts
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

### `tsconfig.json` — thêm vào `compilerOptions`

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Dùng: `import { setupCounter } from "@/counter.ts";`

## Bước 6 — Chạy thử

```bash
npm run typecheck
npm run lint
npm run format:check
```

Cả ba đều không báo lỗi là xong.

---

## Những điều cần nhớ

| Điều | Vì sao |
|---|---|
| `tseslint.configs.recommended` là phần chính cho TS | Cài parser để ESLint đọc được cú pháp TS, bật rule TS, tắt rule JS bị trùng (vd `no-undef`) |
| `no-explicit-any: "warn"` chỉ là tuỳ chỉnh | Bộ recommended đã bật rule này ở mức `error`; dòng này chỉ hạ xuống `warn` |
| Object đứng **sau** ghi đè object đứng **trước** | Đặt rule tuỳ chỉnh trước `tseslint` thì bị ghi đè, không có tác dụng |
| `eslintConfigPrettier` luôn đặt cuối | Tắt các rule ESLint xung đột với định dạng của Prettier |
| Đặt tên `eslint.config.js`, không đặt `.ts` | File `.ts` bắt cài thêm `jiti`, nếu không ESLint báo lỗi |
| Vite **không** kiểm tra kiểu | Phải xem gạch đỏ trong editor hoặc chạy `npm run typecheck` |
| `strict` | TS 6.0 bật mặc định, nhưng nên ghi rõ `"strict": true` trong `tsconfig.json` |
| Alias khai báo ở `vite.config.ts` **và** `tsconfig.json` | Thiếu `paths` thì Vite chạy được nhưng `tsc`/editor báo `Cannot find module '@/...'` |
| Alias đặt trong `vite.config.ts`, **không** đặt trong `eslint.config.js` | `resolve.alias` là tùy chọn của Vite; ESLint không biết và còn báo lỗi cú pháp nếu nhét `key: value` vào mảng config |
| Không dùng `__dirname` trong `vite.config.ts` | Project là ESM (`"type": "module"`), không có `__dirname` — dùng `new URL(..., import.meta.url)` |

---

## Khi qua React (Vite React + TS)

Template React đã có sẵn `eslint.config.js` (gồm `typescript-eslint`, `react-hooks`, `react-refresh`). Chỉ cần:

1. `npm install -D prettier eslint-config-prettier`
2. Thêm `eslintConfigPrettier` vào **cuối** mảng config
3. Tạo `.prettierrc`, `.prettierignore`
4. Thêm script `format`, `format:check`, `typecheck` (và `lint:fix` nếu chưa có)
