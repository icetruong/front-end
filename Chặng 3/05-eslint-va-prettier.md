# 05 — ESLint và Prettier

> **Cần có trước:** xong `04` (có một dự án Vite chạy được), xong `03` (`devDependencies`, `scripts`).
> **Thời gian:** 3–4 giờ.
> **Vì sao quan trọng:** gần như mọi dự án công ty đều có hai công cụ này. Ngày đầu đi làm, bạn mở dự án ra, code bị gạch đỏ, file tự đổi định dạng khi lưu, commit bị chặn vì "lint failed" — nếu không hiểu chuyện gì đang xảy ra thì bạn sẽ rất bối rối. File này khép lại khối B.

---

## 1. Hai vấn đề khác nhau

Hai công cụ này hay bị gọi chung, nhưng giải quyết hai việc khác hẳn nhau.

**Vấn đề 1 — code chạy được nhưng có lỗi tiềm ẩn**

```javascript
const gia = 100;
let tong = 0;                 // khai báo let nhưng không gán lại bao giờ

if (soLuong == "5") {         // == thay vì === (file 01 chặng 2)
  tong = gia * soluong;       // gõ nhầm: soluong thay vì soLuong
}

function tinhThue(x) { }      // tham số x không dùng đến
```

Không có dòng nào gây lỗi cú pháp. Trình duyệt chạy bình thường — cho đến khi `soluong` nổ `ReferenceError` lúc người dùng bấm vào.

→ **ESLint** đọc code và cảnh báo những chỗ *đáng ngờ*. Gọi là **linter**.

**Vấn đề 2 — code đúng nhưng mỗi người viết một kiểu**

```javascript
const a = {ten:"An",tuoi:22}
const b = { ten: 'Bình', tuoi: 25 };
const c = {
    ten: "Cường",
    tuoi: 30,
}
```

Ba dòng chạy y hệt nhau. Nhưng khi làm nhóm, người A dùng nháy đơn, người B dùng nháy kép, người C thụt 4 dấu cách. Mỗi lần ai đó lưu file, editor của họ đổi định dạng theo ý họ, và diff trên Pull Request đầy những dòng "thay đổi" chỉ vì dấu cách — che mất thay đổi thật.

→ **Prettier** tự động định dạng lại code theo một quy tắc duy nhất. Gọi là **formatter**.

### Phân biệt cho chuẩn

| | ESLint (linter) | Prettier (formatter) |
|---|---|---|
| Quan tâm | Code có **đúng** và **an toàn** không | Code có **đẹp** và **thống nhất** không |
| Ví dụ | Biến không dùng, `==`, biến chưa khai báo | Nháy đơn/kép, dấu chấm phẩy, thụt lề, độ dài dòng |
| Cách làm | Báo lỗi, một số tự sửa được | Viết lại toàn bộ định dạng, không hỏi |
| Có ý kiến không | Rất nhiều tùy chỉnh | Cố ý **ít** tùy chỉnh |

Câu nhớ nhanh: **ESLint tìm bug, Prettier cãi nhau thay bạn.** Không ai phải tranh luận "nên dùng nháy đơn hay nháy kép" nữa — Prettier quyết định, cả nhóm theo.

---

## 2. ESLint — cài đặt

Làm trong dự án Vite từ file `04` (hoặc tạo mới bằng `npm create vite@latest`, chọn Vanilla + JavaScript).

Cách nhanh nhất — dùng bộ khởi tạo chính thức:

```bash
npm init @eslint/config@latest
```

Nó hỏi vài câu (dùng cho gì, loại module, framework nào, chạy ở đâu). Với dự án hiện tại: kiểm tra cú pháp và tìm lỗi, JavaScript modules, không framework, chạy trên trình duyệt. Bộ khởi tạo tự cài gói vào `devDependencies` và tạo file cấu hình.

Hoặc cài tay để hiểu từng phần:

```bash
npm install -D eslint @eslint/js globals
```

- `eslint` — bản thân công cụ
- `@eslint/js` — bộ quy tắc khuyến nghị chính thức
- `globals` — danh sách biến toàn cục có sẵn theo môi trường (`window`, `document` cho trình duyệt; `process` cho Node). Không có nó, ESLint sẽ báo `document is not defined`

---

## 3. File cấu hình — `eslint.config.js`

Từ ESLint 9, cấu hình nằm trong `eslint.config.js` theo định dạng gọi là **flat config**: một mảng các object, áp dụng **từ trên xuống**, object sau ghi đè object trước.

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";

export default [
  // 1. Bỏ qua thư mục không cần kiểm tra
  { ignores: ["dist/", "node_modules/"] },

  // 2. Bộ quy tắc khuyến nghị
  js.configs.recommended,

  // 3. Cấu hình riêng của dự án
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-console": "warn",
    },
  },
];
```

Đọc từng phần:

- **`ignores`** — object chỉ có mỗi `ignores` nghĩa là *bỏ qua toàn cục*. Không kiểm tra code build ra hay thư viện
- **`js.configs.recommended`** — khoảng vài chục quy tắc mà đội ESLint cho là gần như ai cũng nên bật. Đây là điểm xuất phát an toàn
- **`files`** — các object sau chỉ áp dụng cho file khớp mẫu này
- **`languageOptions`** — nói cho ESLint biết code chạy ở đâu, cú pháp nào
- **`globals.browser`** — trải (spread, file `03` chặng 2) toàn bộ biến có sẵn của trình duyệt vào

Bạn sẽ còn thấy file `.eslintrc.json` hoặc `.eslintrc.js` trong dự án cũ. Đó là định dạng cũ, ESLint 9 không còn dùng mặc định. Nhận ra được là đủ, không cần học.

### Ghi chú về `eqeqeq`

`{ null: "ignore" }` cho phép đúng một ngoại lệ đã học ở file `01` chặng 2: `x == null` để bắt cả `null` lẫn `undefined`. Mọi chỗ `==` khác đều bị chặn. Đây là ví dụ hay cho thấy quy tắc lint không phải luật cứng nhắc — nó mã hóa đúng quy ước mà bạn đã chọn.

---

## 4. Quy tắc và mức độ

Mỗi quy tắc có ba mức:

| Mức | Viết bằng chữ | Viết bằng số | Ý nghĩa |
|---|---|---|---|
| Tắt | `"off"` | `0` | Không kiểm tra |
| Cảnh báo | `"warn"` | `1` | Gạch vàng, **không** làm lệnh thất bại |
| Lỗi | `"error"` | `2` | Gạch đỏ, lệnh `eslint` trả về mã lỗi |

Dùng chữ cho dễ đọc. Quy tắc có tùy chọn thì viết dạng mảng: `["error", "always"]`.

### Vài quy tắc nên biết

Mỗi quy tắc dưới đây bắt đúng một loại bug bạn đã gặp ở chặng 2:

| Quy tắc | Bắt được gì | Liên quan |
|---|---|---|
| `no-undef` | Dùng biến chưa khai báo — gõ nhầm tên | File `02` chặng 2 |
| `no-unused-vars` | Biến, tham số, import không dùng đến | — |
| `eqeqeq` | Dùng `==` thay vì `===` | File `01` chặng 2 |
| `prefer-const` | `let` mà không bao giờ gán lại | File `01` chặng 2 |
| `no-var` | Dùng `var` | File `01` chặng 2 |
| `no-implicit-globals` | Vô tình tạo biến toàn cục | File `02` chặng 2 |
| `array-callback-return` | Quên `return` trong `map`, `filter`, `reduce` | File `04` chặng 2 |
| `no-loss-of-precision` | Số quá lớn bị mất độ chính xác | File `01` chặng 2 |
| `no-console` | Quên xóa `console.log` khi xong | — |
| `no-await-in-loop` | `await` tuần tự trong vòng lặp | File `11` chặng 2 |

`array-callback-return` đáng chú ý nhất: "quên `return` trong `map`" là lỗi phổ biến nhất của file `04` chặng 2. Bật quy tắc này là nó không bao giờ lọt qua được nữa.

`no-await-in-loop` cũng vậy — nó cảnh báo đúng cái bẫy "song song vs tuần tự" ở file `11`. Không phải lúc nào `await` trong vòng lặp cũng sai (đôi khi cần tuần tự thật), nên để mức `warn` thay vì `error`.

Tra cứu đầy đủ ở `eslint.org/docs/latest/rules`. Không cần học thuộc — gặp quy tắc lạ thì tra.

---

## 5. Chạy ESLint

Thêm vào `scripts` trong `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

```bash
npm run lint
```

Kết quả dạng:

```
/du-an/src/main.js
   3:5   warning  'tong' is assigned a value but never used   no-unused-vars
   5:16  error    Expected '===' and instead saw '=='           eqeqeq
   6:19  error    'soluong' is not defined                       no-undef

✖ 3 problems (2 errors, 1 warning)
```

Đọc từng dòng: **dòng:cột**, mức độ, mô tả, **tên quy tắc**. Tên quy tắc ở cuối là thứ bạn tra cứu khi không hiểu vì sao bị báo.

### Tự sửa

```bash
npm run lint:fix
```

Một số quy tắc tự sửa được (`prefer-const` đổi `let` thành `const`, `eqeqeq` trong vài trường hợp an toàn). Một số thì không — `no-undef` không thể tự đoán bạn định gõ tên biến nào. Những gì còn sót lại sau `--fix` là việc bạn phải tự xử lý.

**Đọc lại diff sau khi `--fix`**, đừng tin mù quáng. Đa số an toàn, nhưng bạn vẫn là người chịu trách nhiệm về code.

---

## 6. Tắt quy tắc khi thật sự cần

Đôi khi bạn có lý do chính đáng để vi phạm một quy tắc:

```javascript
// Tắt cho đúng dòng tiếp theo
// eslint-disable-next-line no-console
console.log("Khởi động ứng dụng");

// Tắt cho đúng dòng này
const x = y == null; // eslint-disable-line eqeqeq

// Tắt cho cả file — đặt ở đầu file, rất hạn chế dùng
/* eslint-disable no-console */
```

**Luôn ghi rõ tên quy tắc.** Viết `// eslint-disable-next-line` trần (không tên) sẽ tắt **tất cả** quy tắc cho dòng đó — kể cả những quy tắc đang bắt một bug thật mà bạn chưa nhận ra.

Quy tắc ngón tay cái: nếu bạn thấy mình tắt cùng một quy tắc ở nhiều chỗ, có lẽ nên đổi cấu hình quy tắc đó trong `eslint.config.js` thay vì rải comment khắp nơi.

---

## 7. Prettier — cài đặt

```bash
npm install -D --save-exact prettier
```

`--save-exact` ghi số phiên bản cố định, không có `^` (nhớ mục 5 file `03`). Đây là khuyến nghị chính thức của Prettier, vì sao?

Prettier thay đổi cách định dạng giữa các phiên bản, kể cả phiên bản nhỏ. Nếu hai người trong nhóm có hai bản Prettier khác nhau một chút, họ sẽ định dạng cùng một file ra hai kết quả khác nhau — và diff lại đầy những thay đổi vô nghĩa. Khóa cứng phiên bản là cách ngăn chuyện đó.

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

| Tùy chọn | Ý nghĩa | Mặc định |
|---|---|---|
| `semi` | Có dấu `;` cuối câu lệnh | `true` |
| `singleQuote` | Dùng nháy đơn thay vì nháy kép | `false` |
| `tabWidth` | Số dấu cách mỗi cấp thụt lề | `2` |
| `trailingComma` | Dấu phẩy sau phần tử cuối trong mảng/object | `"all"` |
| `printWidth` | Độ dài dòng tối đa trước khi tự xuống dòng | `80` |

Prettier **cố ý** có rất ít tùy chọn. Triết lý của nó: càng ít lựa chọn thì càng ít tranh cãi. Nếu không có lý do đặc biệt, để file `.prettierrc` gần như rỗng (`{}`) và dùng mặc định cũng hoàn toàn ổn.

### Vì sao `trailingComma: "all"` có lợi

```javascript
// Không có dấu phẩy cuối
const mau = [
  "đỏ",
  "xanh"
];

// Thêm một màu → diff hiện HAI dòng thay đổi
const mau = [
  "đỏ",
  "xanh",     // ← dòng này "bị sửa" chỉ để thêm dấu phẩy
  "vàng"
];
```

Có dấu phẩy cuối từ đầu thì thêm phần tử chỉ là **một** dòng mới trong diff. Chi tiết nhỏ, nhưng PR sạch hơn hẳn.

### `.prettierignore`

```
dist/
node_modules/
package-lock.json
```

`package-lock.json` do npm tự sinh — không nên để Prettier định dạng lại.

### Chạy Prettier

```json
"scripts": {
  "format": "prettier . --write",
  "format:check": "prettier . --check"
}
```

```bash
npm run format          # định dạng lại toàn bộ dự án
npm run format:check    # chỉ kiểm tra, không sửa — báo file nào chưa đúng
```

`--check` dùng trong môi trường tự động (CI), nơi bạn muốn **phát hiện** code chưa định dạng chứ không muốn máy tự sửa rồi commit hộ.

---

## 8. Cho ESLint và Prettier sống chung

Có một vấn đề: một số quy tắc của ESLint cũng quan tâm tới định dạng (ví dụ số dấu cách thụt lề, nháy đơn/kép). Nếu chúng mâu thuẫn với Prettier, bạn sẽ rơi vào vòng lặp: Prettier định dạng một kiểu, ESLint báo lỗi, `--fix` sửa lại kiểu khác, Prettier lại đổi về...

Giải pháp: cài gói tắt **mọi quy tắc ESLint dính đến định dạng**, để Prettier lo hết phần đó:

```bash
npm install -D eslint-config-prettier
```

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-unused-vars": "warn",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",
      "array-callback-return": "error",
      "no-console": "warn",
    },
  },

  // ĐẶT CUỐI CÙNG — để nó tắt được mọi quy tắc định dạng ở phía trên
  eslintConfigPrettier,
];
```

**Thứ tự quan trọng.** Flat config áp dụng từ trên xuống, object sau ghi đè object trước. `eslintConfigPrettier` phải nằm **cuối mảng** thì mới tắt được các quy tắc định dạng mà những object phía trên đã bật.

Ghi chú phiên bản: đường dẫn `eslint-config-prettier/flat` dùng cho bản mới (v10 trở lên). Bản cũ hơn import trực tiếp `eslint-config-prettier`. Nếu import báo lỗi không tìm thấy, kiểm tra phiên bản trong `package.json`.

### Phân công rõ ràng

Sau bước này:

- **ESLint** chỉ lo **chất lượng code**: biến không dùng, `==`, quên `return`...
- **Prettier** lo **toàn bộ định dạng**: dấu cách, nháy, xuống dòng...

Hai công cụ không còn giẫm chân nhau.

---

## 9. Tích hợp VS Code

Chạy lệnh trong terminal thì được, nhưng trải nghiệm thật sự là khi editor làm mọi thứ tự động.

Cài hai extension (đã nhắc ở file `00`): **ESLint** và **Prettier - Code formatter**.

Tạo file `.vscode/settings.json` trong dự án:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

- **`formatOnSave`** — lưu file là Prettier tự định dạng
- **`defaultFormatter`** — chỉ định Prettier là công cụ định dạng (nếu không, VS Code có thể dùng bộ định dạng có sẵn của nó)
- **`source.fixAll.eslint`** — lưu file là ESLint tự sửa những gì sửa được

Từ giờ: gõ code lộn xộn → `Ctrl + S` → code tự gọn gàng, `let` tự thành `const`, lỗi còn lại gạch đỏ ngay trên dòng.

### Nên commit `.vscode/settings.json` không?

File này nằm **trong dự án**, nên khác với cấu hình cá nhân. Commit nó lên thì mọi người trong nhóm dùng VS Code đều có cùng hành vi khi lưu file. Nhiều dự án làm vậy. Nhưng nếu nhóm dùng nhiều editor khác nhau, cấu hình chung nằm ở `eslint.config.js` và `.prettierrc` — đó mới là nguồn sự thật, không phải cấu hình editor.

---

## 10. Chặn code bẩn trước khi commit

Bạn có ESLint, có Prettier — nhưng nếu ai đó quên chạy? Hoặc editor của họ chưa cấu hình?

Giải pháp phổ biến: chạy tự động **ngay trước mỗi lần `git commit`**. Nếu có lỗi, commit bị chặn.

Hai công cụ:

- **Husky** — gắn script vào các "hook" của Git (sự kiện như trước commit, trước push)
- **lint-staged** — chỉ chạy lint/format trên **những file đang được commit**, không phải toàn bộ dự án (nhanh hơn rất nhiều)

```bash
npm install -D husky lint-staged
npx husky init
```

`husky init` tạo thư mục `.husky/` và file `.husky/pre-commit`, đồng thời thêm script `"prepare": "husky"` vào `package.json` (để ai `npm install` dự án cũng tự có hook).

Mở `.husky/pre-commit`, thay nội dung bằng:

```bash
npx lint-staged
```

Thêm cấu hình lint-staged vào `package.json`:

```json
"lint-staged": {
  "*.js": ["eslint --fix", "prettier --write"],
  "*.{css,html,json,md}": "prettier --write"
}
```

Giờ thử commit một file có lỗi ESLint:

```bash
git add .
git commit -m "Thử commit code có lỗi"

# ✖ eslint --fix:
#   5:16  error  Expected '===' and instead saw '=='  eqeqeq
# husky - pre-commit script failed (code 1)
```

Commit bị chặn. Sửa xong mới commit được.

Nhớ lại bảng ở file `01`: staging area cho bạn chọn file nào vào commit. lint-staged dựa đúng vào đó — nó chỉ kiểm tra các file **đã `git add`**.

### Lách hook

```bash
git commit -m "..." --no-verify
```

Bỏ qua mọi hook. Tồn tại cho trường hợp khẩn cấp thật sự, nhưng **lạm dụng nó là thói quen xấu** — trong nhiều công ty, CI vẫn chạy lại lint trên server, nên lách ở máy cũng chỉ là chậm thất bại một chút.

---

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `'document' is not defined` | Thiếu `globals.browser` | Thêm vào `languageOptions.globals` |
| `Parsing error: 'import' and 'export' may appear only with 'sourceType: module'` | ESLint đang đọc code như script cũ | `sourceType: "module"` |
| ESLint báo lỗi trong `dist/` | Chưa bỏ qua thư mục build | Thêm vào `ignores` |
| Lưu file, Prettier không chạy | Chưa đặt `defaultFormatter`, hoặc chưa cài extension | Xem mục 9 |
| Lưu file, code nhảy qua lại giữa hai kiểu | ESLint và Prettier mâu thuẫn | Cài `eslint-config-prettier`, đặt **cuối** mảng config |
| Cấu hình `.eslintrc.json` không có tác dụng | ESLint 9 dùng `eslint.config.js` | Chuyển sang flat config |
| Hai máy định dạng cùng file ra kết quả khác nhau | Phiên bản Prettier khác nhau | Cài bằng `--save-exact`, commit `package-lock.json` |
| Commit bị chặn mà không biết vì sao | Husky pre-commit đang chạy lint | Đọc output trong terminal — nó chỉ đúng dòng lỗi |
| Hook không chạy sau khi clone dự án | Chưa `npm install` (script `prepare` chưa chạy) | `npm install` |
| `eslint-disable` trần làm lọt bug | Tắt tất cả quy tắc thay vì một | Luôn ghi tên quy tắc cụ thể |

---

## 12. Tóm tắt cần thuộc

1. **ESLint** tìm lỗi tiềm ẩn (linter); **Prettier** định dạng code (formatter) — hai việc khác nhau
2. ESLint 9 dùng `eslint.config.js` dạng **flat config**: mảng object, áp dụng từ trên xuống
3. `js.configs.recommended` là điểm xuất phát an toàn; `globals.browser` để ESLint biết `window`, `document`
4. Ba mức quy tắc: `"off"`, `"warn"`, `"error"` — chỉ `"error"` làm lệnh thất bại
5. `--fix` tự sửa được một phần; phần còn lại bạn tự xử lý — và luôn đọc lại diff
6. Tắt quy tắc thì **ghi rõ tên**; tắt nhiều chỗ thì nên đổi cấu hình
7. Cài Prettier với `--save-exact` để cả nhóm định dạng giống hệt nhau
8. `prettier --write` để sửa, `prettier --check` để kiểm tra (dùng trong CI)
9. `eslint-config-prettier` tắt quy tắc định dạng của ESLint — đặt **cuối** mảng config
10. `formatOnSave` + `source.fixAll.eslint` trong VS Code: lưu là gọn
11. Husky + lint-staged chặn code bẩn ngay trước commit, chỉ kiểm tra file đã staged
12. `--no-verify` lách được hook — dùng cho khẩn cấp, không phải thói quen

---

## Bài tập

### Bài 1 — Gây lỗi có chủ đích (bài chính)

Tạo dự án Vite mới `bai-tap-05-lint` (Vanilla + JavaScript). Cài ESLint theo mục 2–3, **chưa** cài Prettier.

Dán đoạn code sau vào `src/main.js`:

```javascript
var tenUngDung = "Bài tập lint";
let gia = 100;
let soLuong = "5";

function tinhTong(x, y) {
  if (soLuong == 5) {
    return gia * soluong;
  }
}

const ds = [1, 2, 3].map((n) => {
  n * 2;
});

const ketQua = tinhTong();
console.log(ketQua);

async function luuHet(items) {
  for (const item of items) {
    await fetch("/api", { method: "POST", body: JSON.stringify(item) });
  }
}
```

**Trước khi chạy ESLint**, ghi vào `ghi-chu.md`: bạn tự tìm được bao nhiêu vấn đề trong đoạn code trên? Liệt kê từng cái kèm dòng.

Sau đó:

1. Bật đúng các quy tắc ở bảng mục 4 (`no-var`, `prefer-const`, `eqeqeq`, `array-callback-return`, `no-await-in-loop`, `no-unused-vars`, `no-console`)
2. `npm run lint` — chép nguyên văn output vào `ghi-chu.md`
3. So sánh: ESLint tìm được những gì bạn bỏ sót? Bạn tìm được gì mà ESLint không báo?
4. `npm run lint:fix` — liệt kê những lỗi được tự sửa, những lỗi còn lại
5. Tự sửa tay những lỗi còn lại cho đến khi `npm run lint` sạch hoàn toàn

Câu 3 là phần đáng suy nghĩ nhất: ESLint giỏi bắt lỗi *cơ học*, nhưng có những lỗi *logic* nó không hiểu được (ví dụ `tinhTong()` được gọi mà không truyền đối số).

### Bài 2 — Prettier

Vẫn trong dự án trên:

1. Cài Prettier theo mục 7, tạo `.prettierrc` và `.prettierignore`
2. Viết một file `src/lon-xon.js` cố tình định dạng lộn xộn: trộn nháy đơn và kép, thụt lề lung tung, một dòng dài 200 ký tự, object viết trên một dòng, thiếu dấu `;` chỗ có chỗ không
3. `npm run format:check` — Prettier báo gì?
4. `npm run format` — mở lại file, mô tả những thay đổi
5. Đổi `singleQuote` thành `true` trong `.prettierrc`, chạy lại — quan sát toàn bộ file đổi theo
6. Ghi vào `ghi-chu.md`: vì sao Prettier khuyên cài bằng `--save-exact`?

### Bài 3 — Cho hai công cụ sống chung

1. Thêm quy tắc định dạng vào ESLint để cố tình tạo mâu thuẫn, ví dụ `"quotes": ["error", "single"]`, trong khi `.prettierrc` đặt `"singleQuote": false`
2. Chạy `npm run format` rồi `npm run lint` — quan sát mâu thuẫn, ghi lại
3. Cài `eslint-config-prettier`, thêm vào **cuối** mảng config
4. Chạy lại cả hai lệnh — mâu thuẫn còn không?
5. Thử chuyển `eslintConfigPrettier` lên **đầu** mảng (trước object có quy tắc `quotes`). Chạy lại. Chuyện gì xảy ra? Giải thích dựa trên cách flat config áp dụng từ trên xuống
6. Xóa quy tắc `quotes` khỏi config — từ giờ Prettier lo định dạng

### Bài 4 — VS Code tự động

1. Tạo `.vscode/settings.json` theo mục 9
2. Mở `src/lon-xon.js`, làm nó lộn xộn trở lại, `Ctrl + S` — file tự gọn?
3. Viết `let x = 5;` (không gán lại `x` bao giờ), lưu — có tự đổi thành `const`?
4. Quay video ngắn hoặc chụp hai ảnh trước/sau, đính kèm vào `ghi-chu.md`

### Bài 5 — Husky và lint-staged

1. `git init` dự án (nếu chưa), cài Husky + lint-staged theo mục 10
2. Commit một lần với code sạch — xác nhận hook chạy và commit thành công
3. Cố tình thêm `if (a == b)` vào một file, `git add`, `git commit` — xác nhận bị chặn, chép thông báo
4. Sửa lỗi, commit lại thành công
5. Tạo hai file có lỗi, nhưng chỉ `git add` **một** file. Commit — lint-staged kiểm tra file nào? Giải thích dựa trên khái niệm staging area ở file `01`
6. Thử `--no-verify` một lần để thấy nó lách được. Ghi vào `ghi-chu.md`: trong tình huống nào bạn nghĩ việc này là chấp nhận được?

### Bài 6 — Áp dụng vào dự án thật

Lấy **Pokédex** đã module hóa ở file `13` chặng 2 (hoặc Quiz App):

1. Chuyển nó sang dự án Vite (nếu chưa) — copy các file `.js` vào `src/`, sửa `index.html` theo cấu trúc Vite
2. Cài đủ ESLint + Prettier + `eslint-config-prettier` + Husky + lint-staged
3. `npm run lint` lần đầu — đếm số lỗi và cảnh báo, ghi vào `ghi-chu.md`
4. Sửa cho đến khi sạch. Ghi lại: lỗi nào là bug thật mà bạn chưa từng phát hiện?
5. Commit, push lên kho GitHub của dự án (file `02`)

Câu 4 là câu đáng giá nhất của cả file. Hầu như dự án nào lint lần đầu cũng lộ ra vài bug ẩn — biến không dùng còn sót, `==` lọt qua, `map` quên `return`. Đó là bằng chứng cụ thể nhất cho việc vì sao công cụ này tồn tại.

### Bài 7 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Linter và formatter khác nhau ở điểm nào? Cho mỗi loại hai ví dụ cụ thể.
2. Vì sao `eslint-config-prettier` phải nằm cuối mảng cấu hình?
3. Husky và lint-staged mỗi cái làm gì? Vì sao không chạy lint trên toàn bộ dự án mỗi lần commit?
4. Một đồng nghiệp hỏi: "Có Prettier rồi thì cần ESLint làm gì nữa?" — bạn trả lời thế nào?

---

## Xong file này khi

- [ ] Bài 1: ESLint tìm ra các lỗi trong đoạn code mẫu, và bạn so sánh được với những gì tự tìm
- [ ] Prettier định dạng được file lộn xộn, hiểu vì sao dùng `--save-exact`
- [ ] Đã tự tạo và tự gỡ mâu thuẫn ESLint – Prettier, giải thích được vai trò của thứ tự trong flat config
- [ ] Lưu file trong VS Code là tự định dạng và tự sửa lint
- [ ] Husky chặn được một commit có lỗi; lint-staged chỉ kiểm tra file đã staged
- [ ] Pokédex (hoặc Quiz App) đã lint sạch, phát hiện được ít nhất một bug ẩn, đã push lên GitHub
- [ ] Trả lời được 4 câu ở bài 7 bằng lời

---

**Hết khối B.** Giờ bạn có một bộ khung dự án chuẩn công nghiệp: Git để quản lý lịch sử, npm để quản lý thư viện, Vite để chạy và build, ESLint và Prettier để giữ code sạch, Husky để chặn code bẩn trước khi vào kho. Đây gần như chính xác là bộ khung bạn sẽ thấy khi mở một dự án Front-End ở công ty.

Khối C (`06`, `07`) chuyển sang TypeScript — và cách học quay lại giống chặng 2: cần **hiểu**, không chỉ gõ theo. Bạn sẽ thấy ESLint chỉ bắt được một phần bug; TypeScript bắt được một tầng sâu hơn hẳn.

Xong thì gửi mình `ghi-chu.md` và link kho Pokédex, kèm **"viết file 06-typescript-co-ban"**.