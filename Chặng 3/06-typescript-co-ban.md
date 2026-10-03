# 06 — TypeScript cơ bản

> **Cần có trước:** xong khối B (`03` → `05`), có dự án Vite chạy được. Nắm chắc chặng 2 — đặc biệt file `01` (kiểu dữ liệu), `03` (object, mảng), `08` (DOM).
> **Thời gian:** 5 giờ.
> **Vì sao quan trọng:** TypeScript xuất hiện trong phần lớn tin tuyển dụng Front-End. Bạn không cần giỏi, nhưng phải đọc được code có kiểu và tự gắn kiểu cho code của mình mà không lúng túng. Từ file này, cách học quay lại giống chặng 2: cần **hiểu**, không chỉ gõ theo.

---

## 1. TypeScript là gì

TypeScript là JavaScript **cộng thêm hệ thống kiểu**. Mọi đoạn JavaScript hợp lệ đều là TypeScript hợp lệ — bạn chỉ thêm chú thích kiểu vào.

```typescript
// JavaScript
function tinhTong(gia, soLuong) {
  return gia * soLuong;
}

// TypeScript
function tinhTong(gia: number, soLuong: number): number {
  return gia * soLuong;
}

tinhTong(100, "5");
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'.
```

Lỗi hiện ra **ngay lúc bạn gõ**, trong editor, trước khi chạy dòng nào. Nhớ lại bug `"5" * 100` ở file `01` chặng 2 và bug `dataset.id` là chuỗi ở file `08` — TypeScript chặn được cả hai từ gốc.

### Điểm then chốt: kiểu chỉ tồn tại lúc viết code

```
  file .ts        ──(biên dịch: kiểm tra kiểu, rồi XÓA kiểu)──►   file .js     ──►  trình duyệt
  có kiểu                                                        không còn kiểu
```

Trình duyệt **không hiểu** TypeScript. Code phải được dịch sang JavaScript trước, và trong quá trình đó **mọi chú thích kiểu bị xóa sạch**. Hiện tượng này gọi là **type erasure**.

Hệ quả quan trọng:

```typescript
type User = { ten: string };

function kiemTra(x: unknown) {
  if (typeof x === "User") { }   // ❌ vô nghĩa — lúc chạy không có "User" nào cả
}
```

TypeScript **không** kiểm tra dữ liệu lúc chạy. Nếu API trả về dữ liệu sai cấu trúc, TypeScript không biết — nó chỉ tin vào những gì bạn khai báo. Mục 12 nói kỹ hơn, và đây là lý do thư viện như Zod (chặng 5) tồn tại.

**TypeScript bảo vệ bạn khỏi chính mình, không bảo vệ bạn khỏi thế giới bên ngoài.**

---

## 2. Dựng dự án

```bash
npm create vite@latest
# Project name: bai-tap-06-ts
# Framework: Vanilla
# Variant: TypeScript

cd bai-tap-06-ts
npm install
npm run dev
```

So với dự án JavaScript ở file `04`, có ba khác biệt:

```
bai-tap-06-ts/
├── src/
│   ├── main.ts          ← đuôi .ts thay vì .js
│   └── vite-env.d.ts     ← khai báo kiểu cho Vite (import.meta.env, import ảnh...)
├── tsconfig.json         ← cấu hình TypeScript
└── package.json
```

Mở `package.json`, xem phần `scripts`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

### Một điều rất hay bị hiểu nhầm

**Vite không kiểm tra kiểu.** Khi chạy `npm run dev`, Vite chỉ **xóa kiểu** rồi chạy — cực nhanh, nhưng code sai kiểu vẫn chạy bình thường.

Việc kiểm tra kiểu do hai nơi đảm nhận:

1. **Editor** (VS Code) — gạch đỏ ngay khi gõ. Đây là nơi bạn thấy lỗi nhiều nhất
2. **`tsc`** — trình biên dịch TypeScript, chạy trong `npm run build`. Có lỗi kiểu là build thất bại

Nên thêm một script để kiểm tra kiểu riêng, không build:

```json
"typecheck": "tsc --noEmit"
```

`--noEmit` nghĩa là chỉ kiểm tra, không sinh ra file `.js` nào (Vite lo việc đó rồi).

---

## 3. `tsconfig.json`

File Vite sinh ra có khá nhiều dòng. Những dòng quan trọng nhất:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- **`target`** — JavaScript phiên bản nào được sinh ra
- **`lib`** — những API có sẵn. Có `"DOM"` thì TypeScript mới biết `document`, `window`, `HTMLElement`
- **`strict: true`** — **quan trọng nhất**. Bật toàn bộ nhóm kiểm tra chặt chẽ
- **`include`** — kiểm tra những thư mục nào

### Luôn giữ `strict: true`

`strict` gộp nhiều cờ, quan trọng nhất là hai cờ:

- **`strictNullChecks`** — `null` và `undefined` là kiểu riêng, không tự lọt vào kiểu khác. Bắt được lỗi `Cannot read properties of null` — lỗi phổ biến nhất của JavaScript
- **`noImplicitAny`** — không cho TypeScript âm thầm đoán là `any` khi nó không biết kiểu

Tắt `strict` thì TypeScript trở thành JavaScript có thêm vài gợi ý — gần như mất hết giá trị. Nếu một dự án cũ đang tắt nó, đó là món nợ kỹ thuật, không phải lựa chọn hợp lý.

---

## 4. Kiểu cơ bản

### 4.1. Primitive

Bảy kiểu nguyên thủy ở file `01` chặng 2 đều có mặt, viết **chữ thường**:

```typescript
const ten: string = "An";
const tuoi: number = 22;
const daKichHoat: boolean = true;
const khong: null = null;
const chuaCo: undefined = undefined;
const id: symbol = Symbol("id");
const lon: bigint = 100n;
```

**Viết `string`, không viết `String`.** `String` viết hoa là kiểu của object bọc (wrapper object), gần như không bao giờ đúng ý bạn.

### 4.2. Suy luận kiểu (type inference)

Bạn **không cần** chú thích mọi thứ. TypeScript tự suy ra:

```typescript
const ten = "An";            // TypeScript biết: string
let dem = 0;                 // number
const ds = [1, 2, 3];        // number[]

ten.toUpperCase();           // OK
dem = "abc";                 // ❌ Type 'string' is not assignable to type 'number'
```

Rê chuột vào tên biến trong VS Code để xem kiểu TypeScript đã suy ra. Đây là thói quen nên tập: **rê chuột liên tục** khi học.

### Khi nào nên chú thích

Quy tắc thực dụng:

- **Tham số hàm** — luôn chú thích (TypeScript không đoán được)
- **Biến được gán ngay giá trị** — để TypeScript tự suy
- **Biến khai báo trước, gán sau** — chú thích
- **Kiểu trả về của hàm** — tùy; chú thích cho hàm quan trọng hoặc hàm export, để lỗi hiện đúng chỗ

```typescript
// Thừa — TypeScript đã biết
const ten: string = "An";

// Cần — không có giá trị ban đầu
let ketQua: number;
if (dieuKien) ketQua = 1; else ketQua = 2;

// Cần — tham số
function chao(ten: string) { }
```

### 4.3. `let` và `const` cho kiểu khác nhau

```typescript
let a = "xin chào";       // kiểu: string
const b = "xin chào";     // kiểu: "xin chào"  ← chính xác giá trị đó
```

`const` không gán lại được (file `01` chặng 2), nên TypeScript biết giá trị của nó **mãi mãi** là `"xin chào"` — và cho nó một kiểu hẹp hơn, gọi là **literal type**. Mục 7 sẽ dùng đến điều này.

---

## 5. Mảng và tuple

```typescript
const so: number[] = [1, 2, 3];
const ten: string[] = ["An", "Bình"];
const so2: Array<number> = [1, 2, 3];   // cách viết khác, tương đương

so.push("4");     // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
```

Hai cách viết `number[]` và `Array<number>` giống hệt nhau. Dạng thứ hai là **generic** — chủ đề của file `07`. Dùng dạng thứ nhất cho gọn.

### Mảng hỗn hợp

```typescript
const honHop: (string | number)[] = [1, "hai", 3];
```

Chú ý dấu ngoặc tròn: `(string | number)[]` là mảng mà mỗi phần tử là chuỗi **hoặc** số. Còn `string | number[]` là một chuỗi, **hoặc** một mảng số — khác hẳn.

### Tuple — mảng có độ dài và kiểu từng vị trí cố định

```typescript
const toaDo: [number, number] = [10, 20];
const nguoiDung: [string, number] = ["An", 22];

const [ten, tuoi] = nguoiDung;   // ten: string, tuoi: number

const sai: [number, number] = [1, 2, 3];   // ❌ quá nhiều phần tử
```

Bạn gặp tuple rất sớm ở React:

```typescript
const [count, setCount] = useState(0);
// useState trả về một tuple: [giá trị, hàm cập nhật]
```

Đây chính là destructuring mảng của file `03` chặng 2, giờ có thêm kiểu.

---

## 6. Kiểu object

```typescript
const user: { ten: string; tuoi: number } = {
  ten: "An",
  tuoi: 22,
};

user.email;    // ❌ Property 'email' does not exist on type '{ ten: string; tuoi: number; }'
```

Hãy so với JavaScript: `user.email` trả về `undefined` một cách im lặng (file `03` chặng 2). TypeScript báo ngay rằng thuộc tính đó không tồn tại — chặn được cả lỗi gõ nhầm tên trường.

### Thuộc tính tùy chọn

```typescript
const user: { ten: string; email?: string } = { ten: "An" };   // OK

user.email.toUpperCase();
// ❌ 'user.email' is possibly 'undefined'.

user.email?.toUpperCase();    // OK — optional chaining, file 03 chặng 2
```

`email?: string` nghĩa là kiểu thực sự của nó là `string | undefined`. TypeScript **bắt buộc** bạn xử lý trường hợp `undefined` trước khi dùng — đúng cái lỗi `Cannot read properties of undefined` mà bạn đã gặp nhiều lần ở chặng 2.

### `readonly`

```typescript
const cauHinh: { readonly apiUrl: string } = { apiUrl: "https://..." };
cauHinh.apiUrl = "khác";   // ❌ Cannot assign to 'apiUrl' because it is a read-only property.

const ds: readonly number[] = [1, 2, 3];
ds.push(4);                 // ❌ Property 'push' does not exist on type 'readonly number[]'.
```

Nhớ lại file `01` chặng 2: `const` khóa **liên kết**, không khóa **nội dung**. `readonly` khóa nội dung — nhưng **chỉ lúc viết code**. Lúc chạy, nó bị xóa như mọi kiểu khác.

Hữu ích khi viết code theo phong cách bất biến (file `03` chặng 2, và mọi state ở React).

---

## 7. Union và literal type

### Union — "cái này HOẶC cái kia"

```typescript
let id: string | number;
id = 42;       // OK
id = "abc";    // OK
id = true;     // ❌
```

### Literal type — chỉ chấp nhận đúng một vài giá trị

```typescript
let trangThai: "dang-cho" | "dang-giao" | "hoan-thanh";

trangThai = "dang-giao";     // OK
trangThai = "da-huy";        // ❌ Type '"da-huy"' is not assignable to type ...
trangThai = "dang giao";     // ❌ gõ nhầm — bắt được ngay
```

Đây là một trong những tính năng hữu ích nhất của TypeScript. Nhớ lại bộ lọc của todo app ở file `09` chặng 2:

```javascript
// JavaScript — gõ nhầm "chua-xong" thành "chua_xong" là bug im lặng
trangThai.boLoc = "chua_xong";
```

```typescript
// TypeScript — không thể gõ nhầm, editor còn gợi ý sẵn ba giá trị hợp lệ
type BoLoc = "tat-ca" | "chua-xong" | "da-xong";
let boLoc: BoLoc = "chua_xong";   // ❌
```

### `as const`

```typescript
const LOAI = ["do", "xanh", "vang"];          // string[]
const LOAI2 = ["do", "xanh", "vang"] as const; // readonly ["do", "xanh", "vang"]

type Loai = (typeof LOAI2)[number];            // "do" | "xanh" | "vang"
```

`as const` bảo TypeScript: "đừng nới rộng kiểu, giữ chính xác từng giá trị, và khóa readonly". Dòng cuối là một kỹ thuật rút kiểu từ mảng — không cần thuộc ngay, nhưng bạn sẽ thấy nó trong code thật.

### Enum — biết để đọc code cũ

```typescript
enum TrangThai {
  DangCho,
  DangGiao,
  HoanThanh,
}
```

TypeScript có `enum`, nhưng nó là một trong số ít tính năng **sinh ra code JavaScript thật** (không bị xóa hoàn toàn), và có vài hành vi gây bất ngờ. Nhiều đội ngũ hiện nay **ưu tiên union literal type** thay cho enum vì nó đơn giản và không sinh thêm code. Bạn cần đọc được enum khi gặp, nhưng khi tự viết, dùng union.

---

## 8. `type` và `interface`

Hai cách đặt tên cho một kiểu để dùng lại:

```typescript
type User = {
  id: number;
  ten: string;
  email?: string;
};

interface User2 {
  id: number;
  ten: string;
  email?: string;
}

const a: User = { id: 1, ten: "An" };
const b: User2 = { id: 1, ten: "An" };
```

Với object, hai cách gần như tương đương. Khác biệt:

| | `type` | `interface` |
|---|---|---|
| Đặt tên cho object | Được | Được |
| Union, literal, tuple, primitive | **Được** | Không |
| Mở rộng | Dùng `&` | Dùng `extends` |
| Khai báo trùng tên tự gộp | Không — báo lỗi | **Có** (declaration merging) |

```typescript
// type làm được những thứ interface không làm được
type Id = string | number;
type BoLoc = "tat-ca" | "chua-xong" | "da-xong";
type ToaDo = [number, number];
```

### Mở rộng

```typescript
// interface
interface ConVat {
  ten: string;
}
interface Cho extends ConVat {
  giong: string;
}

// type — dùng intersection &
type ConVat2 = { ten: string };
type Cho2 = ConVat2 & { giong: string };
```

`&` (intersection) nghĩa là "có **đủ** thuộc tính của cả hai". Ngược với `|` (union) nghĩa là "là một **trong** hai".

### Nên dùng cái nào

Đây là chủ đề tranh luận lâu năm trong cộng đồng, không có câu trả lời tuyệt đối. Một quy ước phổ biến và dễ áp dụng:

- **`type`** cho union, literal, tuple, và hầu hết mọi thứ khác
- **`interface`** cho hình dạng object, đặc biệt khi cần `extends`

Quan trọng hơn việc chọn cái nào là **nhất quán trong một dự án**. Khi vào công ty, theo quy ước của dự án đó. Khi tự làm, chọn một kiểu và giữ nó.

Câu trả lời phỏng vấn: *"`interface` chỉ mô tả được object và hỗ trợ declaration merging; `type` linh hoạt hơn, mô tả được union, tuple, primitive. Em thường dùng `type` cho union và `interface` cho object cần mở rộng, nhưng quan trọng nhất là thống nhất theo quy ước của dự án."*

---

## 9. Hàm

```typescript
function cong(a: number, b: number): number {
  return a + b;
}

const nhan = (a: number, b: number): number => a * b;
```

### Tham số tùy chọn và mặc định

```typescript
function chao(ten: string, loiChao?: string): string {
  return `${loiChao ?? "Xin chào"}, ${ten}`;
}

function chao2(ten: string, loiChao = "Xin chào"): string {
  return `${loiChao}, ${ten}`;   // TypeScript tự suy loiChao: string
}
```

Tham số tùy chọn phải đứng **sau** tham số bắt buộc.

### Rest parameter

```typescript
function tong(...so: number[]): number {
  return so.reduce((a, b) => a + b, 0);
}
```

### `void` và `never`

```typescript
function ghiLog(msg: string): void {
  console.log(msg);       // không trả về gì có ý nghĩa
}

function nemLoi(msg: string): never {
  throw new Error(msg);   // KHÔNG BAO GIỜ kết thúc bình thường
}
```

- **`void`** — hàm không trả về giá trị nào đáng quan tâm
- **`never`** — hàm không bao giờ chạy tới cuối (luôn ném lỗi, hoặc lặp vô hạn). Mục 11 sẽ dùng `never` cho một kỹ thuật rất hay

### Kiểu của chính hàm — callback

```typescript
type XuLy = (giaTri: string) => void;

function dangKy(callback: XuLy) {
  callback("xong");
}

// Nối lại file 05 chặng 2
function debounce(fn: (...args: any[]) => void, delay: number) {
  let idTimer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(idTimer);
    idTimer = setTimeout(() => fn(...args), delay);
  };
}
```

`ReturnType<typeof setTimeout>` là cách lấy đúng kiểu id mà `setTimeout` trả về — nó là `number` trên trình duyệt nhưng là một object trên Node, nên viết thế này chạy đúng ở cả hai môi trường.

Bản `debounce` trên còn dùng `any[]` — chưa hoàn hảo. File `07` sẽ viết lại bằng generic để giữ đúng kiểu tham số của hàm gốc.

---

## 10. `any`, `unknown` và lối thoát

### `any` — tắt kiểm tra kiểu

```typescript
let x: any = "abc";
x = 42;
x.khongTonTai.cungKhongSao();   // TypeScript không báo gì — nổ lúc chạy
```

`any` nghĩa là "TypeScript, đừng kiểm tra cái này". Nó **lây lan**: mọi thứ lấy ra từ một giá trị `any` cũng thành `any`, và lỗ hổng cứ thế loang ra.

**Tránh `any`.** Mỗi `any` là một chỗ bạn quay lại JavaScript thuần, mất mọi bảo vệ.

### `unknown` — bản an toàn của `any`

```typescript
let y: unknown = layDuLieuTuDauDo();

y.toUpperCase();          // ❌ 'y' is of type 'unknown'.

if (typeof y === "string") {
  y.toUpperCase();        // OK — đã kiểm tra, TypeScript biết y là string
}
```

`unknown` nghĩa là "tôi chưa biết đây là gì, và tôi **phải kiểm tra** trước khi dùng". Nhận được dữ liệu không rõ nguồn gốc — từ `JSON.parse`, từ API, từ `catch` — dùng `unknown`.

```typescript
try {
  // ...
} catch (e) {
  // Với strict: true, e có kiểu unknown
  if (e instanceof Error) {
    console.log(e.message);   // OK
  }
}
```

Nhớ lại file `07` chặng 2: bạn có thể `throw` **bất cứ thứ gì**, không chỉ `Error`. Đó là lý do `e` trong `catch` là `unknown` — TypeScript buộc bạn kiểm tra.

| | `any` | `unknown` |
|---|---|---|
| Gán gì vào cũng được | Có | Có |
| Dùng ngay không cần kiểm tra | **Có** — nguy hiểm | **Không** — phải thu hẹp trước |

### Type assertion — `as`

```typescript
const o = document.querySelector("#o-nhap") as HTMLInputElement;
o.value;   // OK
```

`as` nghĩa là "TypeScript, tin tôi đi, tôi biết đây là kiểu gì". TypeScript **không kiểm tra** lời khẳng định đó. Nếu bạn sai — ví dụ `#o-nhap` thật ra là một `<div>`, hoặc không tồn tại — lỗi chỉ lộ ra lúc chạy.

### Non-null assertion — `!`

```typescript
const el = document.querySelector("#app")!;   // khẳng định không phải null
```

Cùng bản chất với `as`: bạn tắt kiểm tra, tự chịu trách nhiệm.

**Quy tắc:** `as` và `!` là lối thoát, dùng **ít** và **có lý do**. Mục 11 — thu hẹp kiểu — là cách đúng trong hầu hết trường hợp.

---

## 11. Thu hẹp kiểu (narrowing)

Đây là mục quan trọng nhất của file. TypeScript **theo dõi luồng code** của bạn và tự thu hẹp kiểu sau mỗi lần kiểm tra.

```typescript
function inId(id: string | number) {
  // ở đây: string | number
  if (typeof id === "string") {
    // ở đây: string
    console.log(id.toUpperCase());
  } else {
    // ở đây: number
    console.log(id.toFixed(2));
  }
}
```

Bạn không cần ép kiểu gì cả. Chỉ cần viết những lần kiểm tra mà JavaScript vốn có — TypeScript tự hiểu.

### Các cách thu hẹp

```typescript
// 1. typeof — với primitive
if (typeof x === "string") { }

// 2. Kiểm tra null/undefined
if (el !== null) { }
if (el) { }          // truthiness — cẩn thận với 0 và "" (file 01 chặng 2)
if (x == null) { }   // bắt cả null lẫn undefined

// 3. instanceof — với class (file 07 chặng 2)
if (e instanceof Error) { }
if (target instanceof HTMLInputElement) { }

// 4. in — thuộc tính có tồn tại không
if ("email" in user) { }

// 5. Array.isArray
if (Array.isArray(x)) { }

// 6. Return sớm
function xuLy(el: HTMLElement | null) {
  if (!el) return;
  el.textContent = "OK";   // từ đây trở xuống: HTMLElement
}
```

Cách số 6 — return sớm — là cách gọn nhất và phổ biến nhất trong code thật.

### Discriminated union — kỹ thuật quan trọng nhất

Nhớ lại ba trạng thái của Pokédex ở file `12` chặng 2: đang tải, lỗi, có dữ liệu. Trong JavaScript, bạn có lẽ đã viết thế này:

```javascript
const trangThai = {
  dangTai: false,
  loi: null,
  duLieu: null,
};
```

Vấn đề: ba trường độc lập, nên có thể rơi vào những tổ hợp vô lý — `dangTai: true` **và** có `loi` **và** có `duLieu` cùng lúc. Không có gì ngăn điều đó.

TypeScript giải quyết bằng **discriminated union**:

```typescript
type TrangThai =
  | { loai: "dang-tai" }
  | { loai: "loi"; thongBao: string }
  | { loai: "thanh-cong"; duLieu: Pokemon[] };
```

Mỗi trạng thái là một object riêng, có chung một trường **`loai`** với giá trị literal khác nhau. Trường chung đó gọi là **discriminant**.

```typescript
function ve(tt: TrangThai) {
  switch (tt.loai) {
    case "dang-tai":
      return "Đang tải...";

    case "loi":
      return `Lỗi: ${tt.thongBao}`;           // TypeScript biết có thongBao

    case "thanh-cong":
      return `Có ${tt.duLieu.length} Pokémon`;  // TypeScript biết có duLieu
  }
}

// Truy cập sai trường
function sai(tt: TrangThai) {
  tt.duLieu;   // ❌ Property 'duLieu' does not exist on type '{ loai: "dang-tai"; }'
}
```

Lợi ích:

- **Không thể** tồn tại trạng thái vô lý — có `thongBao` thì không thể có `duLieu`
- Trong mỗi nhánh `case`, TypeScript tự biết chính xác có những trường nào
- Editor gợi ý đúng các giá trị `loai` hợp lệ

Đây là mẫu bạn sẽ dùng **rất** nhiều ở React (chặng 4, 5) để mô hình hóa trạng thái gọi API.

### Kiểm tra đầy đủ với `never`

```typescript
function ve(tt: TrangThai): string {
  switch (tt.loai) {
    case "dang-tai":   return "Đang tải...";
    case "loi":        return `Lỗi: ${tt.thongBao}`;
    case "thanh-cong": return `Có ${tt.duLieu.length} Pokémon`;
    default: {
      const kiemTra: never = tt;   // tt đã bị thu hẹp hết → còn lại never
      return kiemTra;
    }
  }
}
```

Giờ thêm trạng thái thứ tư:

```typescript
type TrangThai =
  | { loai: "dang-tai" }
  | { loai: "loi"; thongBao: string }
  | { loai: "thanh-cong"; duLieu: Pokemon[] }
  | { loai: "rong" };   // ← mới thêm
```

TypeScript lập tức báo lỗi ở dòng `const kiemTra: never = tt` — vì `{ loai: "rong" }` chưa được xử lý, nên `tt` ở nhánh `default` không còn là `never`. **Thêm trạng thái mới mà quên xử lý ở đâu đó là bị bắt ngay.**

Trong một dự án lớn có hàng chục chỗ `switch` trên cùng một kiểu, kỹ thuật này cứu bạn khỏi rất nhiều bug.

### Type guard tự viết

```typescript
type Cho = { loai: "cho"; sua(): void };
type Meo = { loai: "meo"; keu(): void };

function laCho(x: Cho | Meo): x is Cho {
  return x.loai === "cho";
}

function xuLy(x: Cho | Meo) {
  if (laCho(x)) {
    x.sua();    // TypeScript biết x là Cho
  } else {
    x.keu();    // và ở đây là Meo
  }
}
```

`x is Cho` gọi là **type predicate**: một hàm trả về `boolean`, nhưng đồng thời nói cho TypeScript biết "nếu tôi trả về `true` thì `x` là `Cho`". Hữu ích khi logic kiểm tra phức tạp và cần dùng lại.

---

## 12. Structural typing

TypeScript so sánh kiểu theo **hình dạng**, không theo tên:

```typescript
type Diem = { x: number; y: number };
type ToaDo = { x: number; y: number };

const a: Diem = { x: 1, y: 2 };
const b: ToaDo = a;     // OK — cùng hình dạng, tên không quan trọng
```

Một object có **nhiều hơn** thuộc tính yêu cầu cũng được chấp nhận:

```typescript
function in2D(p: { x: number; y: number }) { }

const diem3D = { x: 1, y: 2, z: 3 };
in2D(diem3D);        // OK — có đủ x, y; thừa z không sao
```

Ngoại lệ — **object literal viết trực tiếp** thì bị kiểm tra thuộc tính thừa:

```typescript
in2D({ x: 1, y: 2, z: 3 });
// ❌ Object literal may only specify known properties, and 'z' does not exist
```

Lý do: viết thừa thuộc tính ngay tại chỗ thường là dấu hiệu gõ nhầm tên trường, nên TypeScript chủ động bắt. Còn truyền một biến đã có sẵn thì có thể nó được dùng cho mục đích khác, TypeScript để yên.

Nguyên tắc này gọi là **"duck typing"**: *nếu nó đi như vịt và kêu như vịt, nó là vịt*. Nối với file `07` chặng 2: JavaScript không có class "thật" theo kiểu Java, và hệ thống kiểu của TypeScript cũng phản ánh đúng tinh thần đó.

---

## 13. TypeScript và DOM

Đây là chỗ bạn vấp đầu tiên khi chuyển code chặng 2 sang TypeScript.

### `querySelector` có thể trả về `null`

```typescript
const app = document.querySelector("#app");
app.textContent = "Xin chào";
// ❌ 'app' is possibly 'null'.
```

Nhớ file `08` chặng 2: `querySelector` trả về `null` khi không tìm thấy. JavaScript để bạn tự nhớ; TypeScript **bắt buộc** bạn xử lý.

```typescript
// Cách 1 — kiểm tra (tốt nhất)
const app = document.querySelector("#app");
if (!app) throw new Error("Không tìm thấy #app");
app.textContent = "Xin chào";

// Cách 2 — khẳng định (khi chắc chắn tuyệt đối, ví dụ phần tử gốc trong index.html)
const app2 = document.querySelector("#app")!;
```

### Kiểu phần tử cụ thể

```typescript
const o = document.querySelector("#o-nhap");
o?.value;
// ❌ Property 'value' does not exist on type 'Element'.
```

`querySelector` với selector bằng id hay class chỉ biết đó là một `Element` chung chung — không biết đó là `<input>` nên không biết có `.value`.

```typescript
// Cách 1 — generic (file 07 sẽ giải thích cú pháp <>)
const o = document.querySelector<HTMLInputElement>("#o-nhap");
o?.value;   // OK

// Cách 2 — selector bằng tên thẻ: TypeScript tự biết
const o2 = document.querySelector("input");   // HTMLInputElement | null

// Cách 3 — instanceof (an toàn nhất, kiểm tra thật lúc chạy)
const o3 = document.querySelector("#o-nhap");
if (o3 instanceof HTMLInputElement) {
  o3.value;
}
```

Cách 1 và 2 chỉ là khẳng định lúc viết code — nếu `#o-nhap` thật ra là `<div>`, lỗi vẫn lọt. Cách 3 kiểm tra thật lúc chạy.

Vài kiểu phần tử hay dùng: `HTMLElement`, `HTMLInputElement`, `HTMLButtonElement`, `HTMLFormElement`, `HTMLSelectElement`, `HTMLTextAreaElement`, `HTMLImageElement`, `HTMLUListElement`.

### Sự kiện

```typescript
const nut = document.querySelector("button");

nut?.addEventListener("click", (e) => {
  // TypeScript tự biết e là MouseEvent — vì nó biết sự kiện "click"
  console.log(e.clientX);
});

document.addEventListener("keydown", (e) => {
  // e: KeyboardEvent
  console.log(e.key);
});
```

Với sự kiện có tên chuẩn, TypeScript tự suy ra kiểu `e`. Nhưng `e.target` thì khác:

```typescript
ds.addEventListener("click", (e) => {
  e.target.closest("[data-hanh-dong]");
  // ❌ 'e.target' is possibly 'null'.
  // ❌ Property 'closest' does not exist on type 'EventTarget'.
});
```

Nhớ file `09` chặng 2: `e.target` có thể là **bất kỳ thứ gì** bên trong phần tử cha — kể cả một text node, không phải element. TypeScript chỉ biết nó là `EventTarget`.

```typescript
ds.addEventListener("click", (e) => {
  if (!(e.target instanceof Element)) return;

  const nut = e.target.closest<HTMLElement>("[data-hanh-dong]");
  if (!nut) return;

  const hanhDong = nut.dataset.hanhDong;   // string | undefined
  // ...
});
```

Đây là mẫu event delegation của file `09` chặng 2 viết lại bằng TypeScript. Thêm đúng **một** dòng `instanceof`, và từ đó mọi thứ đều được kiểm tra kiểu đầy đủ.

### `dataset` luôn là `string | undefined`

```typescript
const id = nut.dataset.id;            // string | undefined
const soId = Number(nut.dataset.id);  // number — nhưng có thể là NaN
```

Bug `"42" + 1 = "421"` ở file `08` chặng 2 không còn xảy ra được: TypeScript biết `dataset.id` là chuỗi, và nếu bạn truyền nó vào một hàm nhận `number`, nó báo lỗi ngay.

---

## 14. ESLint cho TypeScript

Cấu hình ESLint ở file `05` chỉ áp dụng cho `.js`. Với TypeScript, cài thêm:

```bash
npm install -D typescript-eslint
```

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  eslintConfigPrettier,
];
```

`tseslint.configs.recommended` là một **mảng** cấu hình, nên cần trải bằng `...`. Quy tắc `no-explicit-any` cảnh báo mỗi khi bạn viết `any` — rất hữu ích để giữ kỷ luật ở mục 10.

Một số quy tắc của ESLint thường không còn cần khi đã có TypeScript (ví dụ `no-undef` — TypeScript tự bắt biến chưa khai báo). Bộ `recommended` của `typescript-eslint` đã tự điều chỉnh những chỗ đó.

---

## 15. Lỗi thường gặp

Đọc thông báo lỗi TypeScript là một kỹ năng riêng. Thông báo dài, nhưng thường chỉ cần đọc **dòng đầu tiên**.

| Thông báo (rút gọn) | Ý nghĩa | Cách sửa |
|---|---|---|
| `Type 'X' is not assignable to type 'Y'` | Gán sai kiểu | Đổi giá trị, hoặc xem lại khai báo kiểu |
| `'x' is possibly 'null'` / `'undefined'` | Chưa xử lý trường hợp null | Kiểm tra trước, `?.`, hoặc return sớm |
| `Property 'x' does not exist on type 'Y'` | Gõ sai tên, hoặc kiểu chưa đủ cụ thể | Sửa tên; dùng kiểu phần tử cụ thể (mục 13) |
| `Parameter 'x' implicitly has an 'any' type` | Tham số thiếu chú thích kiểu | Thêm `: string`, `: number`... |
| `Object literal may only specify known properties` | Thừa thuộc tính, thường là gõ nhầm tên | Sửa tên trường |
| `'e' is of type 'unknown'` | Trong `catch`, chưa kiểm tra kiểu lỗi | `if (e instanceof Error)` |
| `Property 'value' does not exist on type 'Element'` | `querySelector` không biết là `<input>` | `querySelector<HTMLInputElement>` hoặc `instanceof` |
| `Not all code paths return a value` | Có nhánh `if` quên `return` | Thêm `return` cho mọi nhánh |
| Code sai kiểu nhưng `npm run dev` vẫn chạy | Vite không kiểm tra kiểu | Xem gạch đỏ trong editor, chạy `npm run typecheck` |
| Mọi thứ đều `any`, không bắt được lỗi gì | `strict` đang tắt | Bật `"strict": true` |

Mẹo: lỗi TypeScript hay xếp chồng lên nhau. **Sửa lỗi đầu tiên trước**, nhiều lỗi phía sau sẽ tự biến mất.

---

## 16. Tóm tắt cần thuộc

1. TypeScript = JavaScript + hệ thống kiểu; mọi kiểu **bị xóa** khi biên dịch
2. TypeScript **không** kiểm tra dữ liệu lúc chạy — dữ liệu từ API vẫn có thể sai
3. Vite không kiểm tra kiểu; editor và `tsc` mới làm việc đó
4. Luôn giữ `strict: true`
5. Để TypeScript tự suy kiểu khi có thể; luôn chú thích tham số hàm
6. `const` cho literal type hẹp; `let` cho kiểu rộng
7. `?` nghĩa là `| undefined`; `readonly` khóa nội dung lúc viết code
8. Union `|` = một trong; intersection `&` = có đủ cả
9. Literal union thay cho enum trong code mới
10. `type` linh hoạt hơn; `interface` cho object và `extends` — quan trọng nhất là nhất quán
11. **Tránh `any`**; dùng `unknown` cho dữ liệu không rõ nguồn gốc
12. `as` và `!` tắt kiểm tra — dùng ít, có lý do
13. **Thu hẹp kiểu** bằng `typeof`, `instanceof`, `in`, kiểm tra null, return sớm
14. **Discriminated union** cho các trạng thái loại trừ lẫn nhau; kết hợp `never` để kiểm tra đầy đủ
15. TypeScript so sánh theo **hình dạng**, không theo tên
16. `querySelector` trả `Element | null`; `e.target` là `EventTarget | null` — phải thu hẹp

---

## Bài tập

Tạo dự án Vite mới `bai-tap-06-ts` (Vanilla + TypeScript). Cài thêm ESLint + `typescript-eslint` + Prettier theo file `05` và mục 14. Thêm script `typecheck`.

### Bài 1 — Đoán lỗi

Dán từng đoạn vào `src/doan-loi.ts`. **Trước khi** xem editor, ghi vào `ghi-chu.md`: dòng nào lỗi, vì sao. Sau đó đối chiếu với gạch đỏ thật.

```typescript
// 1
let a = 5;
a = "năm"; -> lỗi vì gán number là string

// 2
const b = "xin chào"; 
let c: "xin chào" | "tạm biệt" = b;
let d: "xin chào" = "tạm biệt"; -> lỗi vì d chỉ có thể là "xin chào" thôi

// 3
const user: { ten: string; email?: string } = { ten: "An" };
console.log(user.email.length); -> lỗi vì không có email
// ⚠️ [Claude] ĐÚNG là lỗi, nhưng LÝ DO CHƯA CHÍNH XÁC. Không phải "không có email" mà là email CÓ THỂ không có.
//    `email?: string` nghĩa là `string | undefined`. TS báo: 'user.email' is possibly 'undefined'.
//    Nếu email có giá trị thì .length chạy bình thường; TS bắt lỗi vì nó không chắc chắn được điều đó.
console.log(user.tuoi);
// ❌ [Claude] SAI — BỎ SÓT. Dòng này CŨNG LỖI: Property 'tuoi' does not exist on type '{ ten: string; email?: string }'.
//    Kiểu của user chỉ khai báo `ten` và `email`, không có `tuoi`. TS không cho đọc thuộc tính chưa khai báo
//    (trong JS thì dòng này không lỗi, chỉ trả về undefined).

// 4
function f(x: string | number) {
  return x.toUpperCase(); -> lỗi vì không chắc x là string
}

// 5
const ds: number[] = [1, 2, 3];
ds.push("4"); -> lỗi vì ds là number làm gì push được string
const t: [string, number] = ["An", 22, true]; -> lỗi vì t đang là khai báo là tupple nhưng lại gáng mảng 3 phần tử

// 6
function g(n: number): string {
  if (n > 0) return "dương"; -> thiếu trường hợp ngược lại if thì trả gì không return sẽ báo lỗi
}

// 7
let e: unknown = "abc";
e.length; -> lỗi vì chưa check e có phải là string không vì đang gán là unknown
let f2: any = "abc";
f2.khongCo.goi();
// 💡 [Claude] Bạn không đánh dấu lỗi ở đây là ĐÚNG: `any` tắt toàn bộ kiểm tra nên TS không báo gì.
//    Nhưng nên ghi thêm: khi CHẠY thì dòng này sẽ crash (TypeError: Cannot read properties of undefined).
//    Đây chính là ý của câu 7: `unknown` bắt bạn kiểm tra trước, còn `any` thì im lặng cho tới lúc chạy mới nổ.

// 8
type P = { x: number; y: number };
function inP(p: P) {}
inP({ x: 1, y: 2, z: 3 }); -> lỗi vì type P chỉ có 2 phần tử nếu viết thẳng object như này báo lỗi viết dư
const p3 = { x: 1, y: 2, z: 3 };
inP(p3); -> ok vì truyền vào 1 object
// ⚠️ [Claude] Kết luận ĐÚNG (không lỗi), nhưng LÝ DO CHƯA ĐÚNG: cả hai lời gọi đều truyền vào object.
//    Điểm khác nhau là truyền OBJECT LITERAL (viết thẳng `{...}`) hay truyền một BIẾN:
//    - Object literal → TS kiểm tra "thuộc tính thừa" (excess property check), vì `z` viết thẳng ở đó gần như chắc là gõ nhầm.
//    - Biến p3 → TS chỉ so sánh theo HÌNH DẠNG (structural typing): p3 có đủ x: number và y: number là hợp lệ, `z` thừa được bỏ qua.

// 9
const el = document.querySelector("#o");
el.value = "x"; -> lỗi vì không biết ở đây có phải là input hay không ts chỉ biết nó là element phải check rồi mới dùng
// ⚠️ [Claude] ĐÚNG nhưng THIẾU một lỗi. Dòng này có 2 lỗi, và lỗi ĐẦU TIÊN là: 'el' is possibly 'null'.
//    querySelector trả về `Element | null` (không tìm thấy #o thì ra null). Lỗi thứ hai mới là
//    Property 'value' does not exist on type 'Element' (bạn đã nói đúng lỗi này).
//    Kiểm tra `if (el instanceof HTMLInputElement)` sẽ xử lý được cả hai lỗi cùng lúc.

// 10
try {
  JSON.parse("{abc");
} catch (err) {
  console.log(err.message); -> lỗi vì phải err là unknown nên phải check trước khi gọi nó
}
```

Câu 8 là câu đáng suy nghĩ nhất: vì sao hai lời gọi gần như giống nhau lại cho kết quả khác nhau?

> 💡 **[Claude]** Khi dán vào `src/doan-loi.ts` bạn sẽ thấy thêm các lỗi `'c' is declared but its value is never read` (TS6133), xuất hiện ở `a`, `c`, `d`, `f`, `t`, `g` và tham số `p`. Các lỗi này đến từ `noUnusedLocals` / `noUnusedParameters` trong `tsconfig.json`, **không phải** lỗi kiểu mà bài muốn bạn đoán, nên có thể bỏ qua.

### Bài 2 — Sửa lỗi

Sửa từng đoạn ở bài 1 cho hết lỗi, **không dùng `any`, `as`, hay `!`**. Chỉ dùng thu hẹp kiểu, sửa khai báo, hoặc sửa logic.

Sau đó làm lại câu 9 bằng **ba cách** ở mục 13 (`querySelector<...>`, selector bằng tên thẻ, `instanceof`). Ghi vào `ghi-chu.md`: cách nào an toàn nhất, vì sao.

### Bài 3 — Mô hình hóa dữ liệu

Viết kiểu cho dữ liệu đơn hàng ở bài 2 file `03` chặng 2 (mảng `donHang` có `khachHang`, `sanPham`, `trangThai`, `giamGia`...):

1. Kiểu `SanPham`, `KhachHang`, `DonHang` — chú ý trường nào bắt buộc, trường nào tùy chọn (`DH002`, `DH003` thiếu một số trường)
2. `trangThai` dùng literal union, không dùng `string`
3. Dùng `readonly` cho những trường không nên sửa (ví dụ `id`)
4. Gắn kiểu cho mảng dữ liệu mẫu — TypeScript phải chấp nhận cả ba đơn hàng
5. Viết lại hàm `tomTat(donHang)` của bài đó bằng TypeScript, có kiểu trả về rõ ràng
6. Cố tình gõ sai một tên trường trong dữ liệu mẫu — xác nhận TypeScript bắt được

Viết bằng `type` một lần, rồi viết lại bằng `interface` + `extends` (ví dụ `KhachHangVIP extends KhachHang`). Ghi nhận xét so sánh.

### Bài 4 — Discriminated union (bài chính)

Mô hình hóa trạng thái của một màn hình gọi API:

```typescript
type TrangThai =
  | { loai: "chua-bat-dau" }
  | { loai: "dang-tai" }
  | { loai: "loi"; thongBao: string; coThuLai: boolean }
  | { loai: "thanh-cong"; duLieu: string[]; tongSo: number };
```

1. Viết hàm `ve(tt: TrangThai): string` dùng `switch`, trả về chuỗi mô tả từng trạng thái
2. Thêm kiểm tra đầy đủ với `never` ở nhánh `default`
3. Thêm trạng thái thứ năm `{ loai: "rong" }` vào kiểu — xác nhận TypeScript báo lỗi ở đúng dòng `never`. Chụp lại thông báo lỗi
4. Xử lý trạng thái mới, lỗi biến mất
5. Trong nhánh `"dang-tai"`, thử truy cập `tt.duLieu` — chép lại thông báo lỗi
6. Viết hàm `chuyenTrangThai(hienTai: TrangThai, suKien: SuKien): TrangThai`, trong đó `SuKien` cũng là một discriminated union (`{ loai: "bat-dau" }`, `{ loai: "nhan-du-lieu"; duLieu: string[] }`, `{ loai: "gap-loi"; thongBao: string }`, `{ loai: "thu-lai" }`). Đây là mô hình **state machine** — rất gần với `useReducer` ở chặng 5

Ghi vào `ghi-chu.md`: so với cách dùng ba trường `dangTai`, `loi`, `duLieu` độc lập ở chặng 2, cách này ngăn được những lỗi nào?

### Bài 5 — Viết lại Todo App bằng TypeScript

Lấy Todo App từ file `09`/`13` chặng 2, chuyển sang dự án Vite + TypeScript:

1. Đổi đuôi mọi file `.js` thành `.ts`
2. Chạy `npm run typecheck` lần đầu — **đếm số lỗi**, ghi vào `ghi-chu.md`
3. Định nghĩa kiểu `Viec` (`id`, `noiDung`, `daXong`, `ngayTao`...) và `BoLoc` (literal union)
4. Định nghĩa kiểu cho toàn bộ object trạng thái
5. Gắn kiểu cho mọi hàm — tham số và giá trị trả về
6. Sửa toàn bộ lỗi DOM theo mục 13: `querySelector` null, `e.target`, kiểu phần tử
7. Lớp bọc `kho` (file `13` chặng 2): đọc từ `localStorage` trả về `unknown` hoặc kiểu cụ thể? Vì sao? Ghi lý do vào `ghi-chu.md`
8. Chạy `npm run typecheck` đến khi sạch, **không dùng `any`**. Được dùng `!` tối đa **2 lần**, mỗi lần ghi chú lý do
9. Liệt kê vào `ghi-chu.md`: những bug thật mà TypeScript phát hiện trong code cũ của bạn

Câu 9 là câu đáng giá nhất. Code chặng 2 của bạn đã chạy được, đã qua ESLint — nhưng TypeScript gần như chắc chắn vẫn tìm ra vài chỗ chưa xử lý `null`, vài chỗ nhầm chuỗi với số. Đó là tầng bảo vệ sâu hơn mà ESLint không có.

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Type erasure là gì? Hệ quả của nó với dữ liệu từ API?
2. `any` và `unknown` khác nhau thế nào? Khi nào dùng `unknown`?
3. `type` và `interface` khác nhau ra sao? Trả lời như đang phỏng vấn.
4. Thu hẹp kiểu là gì? Kể bốn cách.
5. Discriminated union giải quyết vấn đề gì? Cho ví dụ từ bài 4.
6. Vì sao `npm run dev` của Vite vẫn chạy được code sai kiểu?

---

## Xong file này khi

- [ ] Bài 1 đủ 10 câu có phần đoán viết trước, giải thích được câu 8
- [ ] Bài 2 sửa hết lỗi **không dùng `any`, `as`, `!`**
- [ ] Bài 3 mô hình hóa được dữ liệu đơn hàng, cả bản `type` lẫn `interface`
- [ ] Bài 4: thêm trạng thái mới và thấy `never` bắt được chỗ chưa xử lý
- [ ] Todo App chạy bằng TypeScript, `typecheck` sạch, không có `any`
- [ ] Liệt kê được ít nhất một bug thật mà TypeScript tìm ra trong code cũ
- [ ] Trả lời được 6 câu ở bài 6 bằng lời

File tiếp theo (`07-typescript-generics`) là file cuối chặng 3. Bạn sẽ hiểu dấu `<>` trong `Array<number>` và `querySelector<HTMLInputElement>` thực sự là gì, viết lại `debounce` cho đúng kiểu, và viết một hàm `fetch` có kiểu — rồi dùng tất cả để viết lại Pokédex bằng TypeScript.

Xong thì gửi mình `ghi-chu.md` và kho Todo App bản TypeScript, kèm **"viết file 07-typescript-generics"**.