# 07 — TypeScript Generics

> **Cần có trước:** xong `06` (TypeScript cơ bản) — đặc biệt thu hẹp kiểu và discriminated union. Nhớ file `05` (closure, debounce), `11`–`13` chặng 2 (Promise, fetch, lưu trữ).
> **Thời gian:** 5 giờ, chưa tính dự án cuối chặng.
> **Vì sao quan trọng:** dấu `<>` có mặt khắp nơi — `Array<number>`, `Promise<User>`, `querySelector<HTMLInputElement>`, và ở React là `useState<User | null>`. Không hiểu generic thì bạn đọc được code nhưng không tự viết được hàm dùng lại có kiểu chính xác. Đây là file cuối chặng 3.

---

## 1. Vấn đề

Viết hàm lấy phần tử đầu của một mảng:

```typescript
function layDau(arr: number[]): number | undefined {
  return arr[0];
}

layDau([1, 2, 3]);          // OK
layDau(["a", "b"]);          // ❌ string[] không phải number[]
```

Muốn dùng cho mảng chuỗi thì sao? Ba lựa chọn, cả ba đều tệ:

```typescript
// 1. Viết lại cho từng kiểu — không bao giờ hết
function layDauChuoi(arr: string[]): string | undefined { return arr[0]; }
function layDauUser(arr: User[]): User | undefined { return arr[0]; }

// 2. Dùng any — mất hết kiểu
function layDau(arr: any[]): any { return arr[0]; }
const x = layDau(["a", "b"]);   // x: any
x.toFixed();                     // không báo lỗi — nổ lúc chạy

// 3. Dùng unknown — an toàn nhưng phải kiểm tra lại mọi lần dùng
function layDau(arr: unknown[]): unknown { return arr[0]; }
const y = layDau(["a", "b"]);   // y: unknown — dù ta BIẾT nó là string
```

Điều ta thực sự muốn: *"kiểu đầu ra giống kiểu phần tử đầu vào, dù đó là kiểu gì"*. Một **mối quan hệ** giữa các kiểu, chứ không phải một kiểu cố định.

Generic là cách diễn đạt mối quan hệ đó.

---

## 2. Hàm generic

```typescript
function layDau<T>(arr: T[]): T | undefined {
  return arr[0];
}

const a = layDau([1, 2, 3]);         // a: number | undefined
const b = layDau(["a", "b"]);         // b: string | undefined
const c = layDau([{ ten: "An" }]);    // c: { ten: string } | undefined
```

Đọc cú pháp:

- `<T>` khai báo một **tham số kiểu** (type parameter) tên là `T`
- `arr: T[]` — tham số là mảng các phần tử kiểu `T`
- `: T | undefined` — trả về một giá trị kiểu `T` (hoặc `undefined` nếu mảng rỗng)

### Cách nghĩ đúng

Hãy coi `T` như một **tham số của hàm, nhưng ở tầng kiểu**:

```
Hàm thường:      function f(x)        → gọi f(5)          → x = 5
Hàm generic:     function f<T>(x: T)  → gọi f("abc")      → T = string
```

Giống như tham số thường nhận một **giá trị** khi gọi hàm, tham số kiểu nhận một **kiểu** khi gọi hàm. Rồi kiểu đó được dùng ở mọi chỗ có chữ `T`.

### TypeScript tự suy ra `T`

Bạn gần như không bao giờ phải tự viết `T` là gì. TypeScript nhìn vào đối số và suy ra:

```typescript
layDau([1, 2, 3]);           // TypeScript suy: T = number
layDau<number>([1, 2, 3]);    // viết tường minh — tương đương, nhưng thừa
```

Viết tường minh chỉ cần khi TypeScript không suy được, hoặc suy ra kiểu không như ý:

```typescript
const ds = layDau([]);               // T = never — mảng rỗng, không có gì để suy
const ds2 = layDau<string>([]);       // T = string — ta nói rõ
```

### Tên tham số kiểu

`T` (viết tắt *Type*) là quy ước, không phải bắt buộc. Một số quy ước khác:

- `T`, `U`, `V` — kiểu chung chung
- `K` — key, `V` — value (như `Map<K, V>`)
- `E` — element hoặc error
- Tên đầy đủ khi có nhiều tham số và cần rõ nghĩa: `TDuLieu`, `TLoi`

### Arrow function generic

```typescript
const layDau = <T>(arr: T[]): T | undefined => arr[0];
```

Lưu ý: trong file `.tsx` (React, chặng 4), `<T>` có thể bị nhầm thành thẻ JSX. Cách né là thêm dấu phẩy: `<T,>(arr: T[]) => ...`. Chưa cần nhớ ngay, nhưng sẽ gặp.

---

## 3. Nhiều tham số kiểu

```typescript
function ghepCap<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const cap = ghepCap("An", 22);   // [string, number]
```

```typescript
function anhXa<T, U>(arr: T[], fn: (x: T) => U): U[] {
  const kq: U[] = [];
  for (const x of arr) kq.push(fn(x));
  return kq;
}

const doDai = anhXa(["a", "bb", "ccc"], (s) => s.length);   // number[]
```

Đây chính là `myMap` bạn tự viết ở bài 4 file `04` chặng 2 — giờ có kiểu đầy đủ. Chú ý: trong callback `(s) => s.length`, bạn **không** cần viết `s: string`. TypeScript đã suy `T = string` từ đối số đầu, nên biết luôn `s` là `string`.

Đây cũng chính xác là cách `Array.prototype.map` được khai báo trong thư viện chuẩn của TypeScript.

---

## 4. Ràng buộc — `extends`

Đôi khi `T` không được là "bất cứ thứ gì":

```typescript
function inDoDai<T>(x: T): number {
  return x.length;
  // ❌ Property 'length' does not exist on type 'T'.
}
```

TypeScript đúng: `T` có thể là `number`, mà `number` không có `.length`.

Giới hạn `T` lại:

```typescript
function inDoDai<T extends { length: number }>(x: T): number {
  return x.length;   // OK
}

inDoDai("abc");          // OK — chuỗi có length
inDoDai([1, 2, 3]);       // OK — mảng có length
inDoDai({ length: 5 });   // OK — structural typing, file 06 mục 12
inDoDai(42);              // ❌ number không có length
```

`T extends X` đọc là: *"`T` có thể là bất kỳ kiểu nào, **miễn là** nó có đủ những gì `X` yêu cầu"*.

Chữ `extends` ở đây không phải kế thừa class (file `07` chặng 2). Nó nghĩa là **"thỏa mãn"** — đúng tinh thần structural typing.

### Vì sao không viết thẳng `x: { length: number }`?

```typescript
function layDaiNhat1(a: { length: number }, b: { length: number }) {
  return a.length >= b.length ? a : b;
}
const k1 = layDaiNhat1("abc", "de");   // k1: { length: number } — mất thông tin là string

function layDaiNhat2<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
const k2 = layDaiNhat2("abc", "de");   // k2: string — giữ nguyên
k2.toUpperCase();                       // OK
```

Bản generic **giữ nguyên kiểu gốc** đi qua hàm. Bản không generic thì mọi thứ đi ra đều bị thu về kiểu ràng buộc chung chung. Đó là toàn bộ giá trị của generic.

---

## 5. `keyof` và indexed access

### `keyof` — tập các tên khóa

```typescript
type User = { id: number; ten: string; email: string };

type KhoaUser = keyof User;   // "id" | "ten" | "email"
```

`keyof` biến một kiểu object thành union các tên khóa của nó — tức là literal union ở file `06`.

### Indexed access — `T[K]`

```typescript
type KieuTen = User["ten"];          // string
type KieuId = User["id"];             // number
type CacKieu = User["id" | "ten"];    // number | string
```

Cú pháp giống truy cập thuộc tính bằng ngoặc vuông (file `03` chặng 2), nhưng ở tầng kiểu.

### Kết hợp — hàm lấy thuộc tính an toàn

```typescript
function layThuocTinh<T, K extends keyof T>(obj: T, khoa: K): T[K] {
  return obj[khoa];
}

const u: User = { id: 1, ten: "An", email: "an@x.com" };

const ten = layThuocTinh(u, "ten");      // ten: string
const id = layThuocTinh(u, "id");         // id: number
layThuocTinh(u, "tuoi");                   // ❌ "tuoi" không thuộc keyof User
```

Đọc từng phần:

- `K extends keyof T` — khóa phải là một trong các tên khóa có thật của `T`
- `T[K]` — kiểu trả về đúng bằng kiểu của thuộc tính đó

Editor còn gợi ý sẵn `"id"`, `"ten"`, `"email"` khi bạn gõ đối số thứ hai. Gõ nhầm tên trường là bị chặn ngay.

Ứng dụng thực tế — sắp xếp theo trường bất kỳ (nối lại file `04` chặng 2):

```typescript
function sapXepTheo<T, K extends keyof T>(ds: T[], khoa: K): T[] {
  return [...ds].sort((a, b) => {
    const x = a[khoa];
    const y = b[khoa];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

sapXepTheo(dsUser, "ten");     // OK
sapXepTheo(dsUser, "tenn");     // ❌ gõ nhầm — bị bắt
```

### `typeof` ở tầng kiểu

```typescript
const cauHinh = {
  apiUrl: "https://api.example.com",
  thoiHan: 5000,
  thuLai: true,
};

type CauHinh = typeof cauHinh;
// { apiUrl: string; thoiHan: number; thuLai: boolean }

type KhoaCauHinh = keyof typeof cauHinh;
// "apiUrl" | "thoiHan" | "thuLai"
```

Đặt ở vị trí kiểu, `typeof` lấy **kiểu** của một biến. Khác với `typeof` của JavaScript (file `01` chặng 2) vốn trả về chuỗi như `"object"` lúc chạy. Cùng một từ khóa, hai ý nghĩa tùy vị trí.

Hữu ích khi bạn có một object có sẵn và muốn suy kiểu từ nó, thay vì viết kiểu hai lần.

---

## 6. Kiểu generic

Không chỉ hàm — kiểu cũng nhận tham số kiểu được:

```typescript
type HopDung<T> = {
  giaTri: T;
  capNhatLuc: Date;
};

const hop1: HopDung<number> = { giaTri: 42, capNhatLuc: new Date() };
const hop2: HopDung<string[]> = { giaTri: ["a"], capNhatLuc: new Date() };
```

### Ứng dụng: response API

Nhiều API trả về cùng một "vỏ bọc", chỉ khác phần dữ liệu bên trong:

```typescript
interface PhanHoiApi<T> {
  thanhCong: boolean;
  duLieu: T;
  thongBao?: string;
}

type DanhSachUser = PhanHoiApi<User[]>;
type ChiTietSanPham = PhanHoiApi<SanPham>;
```

Không có generic, bạn phải viết lại phần vỏ bọc cho từng loại dữ liệu.

### Phân trang

```typescript
type PhanTrang<T> = {
  tongSo: number;
  trangHienTai: number;
  ketQua: T[];
};
```

### Giá trị mặc định cho tham số kiểu

```typescript
type PhanHoi<T = unknown> = {
  duLieu: T;
};

const x: PhanHoi = { duLieu: 5 };            // T = unknown
const y: PhanHoi<number> = { duLieu: 5 };     // T = number
```

### Discriminated union generic — mẫu `KetQua`

Kết hợp generic với kỹ thuật quan trọng nhất của file `06`:

```typescript
type KetQua<T, E = Error> =
  | { ok: true; giaTri: T }
  | { ok: false; loi: E };

function chiaAnToan(a: number, b: number): KetQua<number, string> {
  if (b === 0) return { ok: false, loi: "Không chia được cho 0" };
  return { ok: true, giaTri: a / b };
}

const kq = chiaAnToan(10, 2);
if (kq.ok) {
  console.log(kq.giaTri);   // number
} else {
  console.log(kq.loi);      // string
}
```

Đây là cách trả lỗi **không dùng `throw`**: hàm luôn trả về một giá trị, và kiểu buộc nơi gọi xử lý cả hai trường hợp. Không thể quên kiểm tra lỗi, vì không kiểm tra `kq.ok` thì không truy cập được `kq.giaTri`.

So với `try/catch`: lỗi được `throw` không xuất hiện trong kiểu của hàm, nên TypeScript không nhắc bạn bắt nó. `KetQua<T>` làm lỗi trở thành một phần của chữ ký hàm.

---

## 7. Generic có sẵn

Bây giờ bạn đọc được những thứ đã gặp từ trước:

```typescript
Array<number>                    // number[]
Promise<User>                    // Promise sẽ resolve ra User
Map<string, number>              // khóa string, giá trị number
Set<string>
ReadonlyArray<number>            // readonly number[]

document.querySelector<HTMLInputElement>("#o")
// khai báo trong thư viện chuẩn:
// querySelector<E extends Element = Element>(selectors: string): E | null
```

Dòng cuối giải thích mục 13 file `06`: `querySelector<HTMLInputElement>` là truyền tường minh tham số kiểu `E`. Ràng buộc `E extends Element` đảm bảo bạn không truyền được thứ gì không phải phần tử DOM. Mặc định `= Element` là lý do không truyền gì thì nhận về `Element`.

### Hàm `async` luôn trả `Promise<...>`

```typescript
async function layUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

const u = await layUser(1);   // u: User — await mở gói Promise<User>
```

Nhớ file `11` chặng 2: hàm `async` **luôn** trả về Promise. Kiểu trả về phải viết là `Promise<User>`, không phải `User`.

### Xem trước ở React

```typescript
const [user, setUser] = useState<User | null>(null);
```

`useState` là một hàm generic. Truyền `null` làm giá trị ban đầu thì TypeScript chỉ suy được `T = null` — không đủ, vì sau này bạn sẽ đặt một `User` vào. Nên phải viết tường minh `<User | null>`. Đây là trường hợp phổ biến nhất mà bạn **cần** viết tham số kiểu bằng tay.

---

## 8. Utility type

TypeScript có sẵn một bộ kiểu generic để biến đổi kiểu khác. Bạn sẽ gặp chúng thường xuyên.

```typescript
type User = {
  id: number;
  ten: string;
  email: string;
  matKhau: string;
};
```

| Utility | Kết quả | Dùng khi |
|---|---|---|
| `Partial<User>` | Mọi trường thành **tùy chọn** | Dữ liệu cập nhật một phần (PATCH) |
| `Required<User>` | Mọi trường thành **bắt buộc** | Ngược với `Partial` |
| `Readonly<User>` | Mọi trường thành **readonly** | State bất biến |
| `Pick<User, "id" \| "ten">` | **Chỉ giữ** các trường liệt kê | Hiển thị một phần dữ liệu |
| `Omit<User, "matKhau">` | **Bỏ** các trường liệt kê | Dữ liệu an toàn để gửi về client |
| `Record<K, V>` | Object với khóa `K`, giá trị `V` | Bảng tra cứu |
| `NonNullable<T>` | Bỏ `null` và `undefined` khỏi `T` | Sau khi đã kiểm tra null |
| `ReturnType<typeof f>` | Kiểu trả về của hàm `f` | Lấy kiểu từ hàm có sẵn |
| `Parameters<typeof f>` | Tuple kiểu tham số của `f` | Bọc một hàm có sẵn |
| `Awaited<T>` | Kiểu sau khi `await` | Mở gói `Promise<T>` |

### Ví dụ thực tế

```typescript
// Cập nhật một phần — nối với PATCH ở file 12 chặng 2
function capNhatUser(id: number, thayDoi: Partial<User>) { }
capNhatUser(1, { email: "moi@x.com" });   // không cần gửi đủ mọi trường

// Bỏ mật khẩu trước khi trả về — nối với rest destructuring ở file 03 chặng 2
type UserCongKhai = Omit<User, "matKhau">;

function anToan(u: User): UserCongKhai {
  const { matKhau, ...conLai } = u;
  return conLai;
}

// Tạo mới — chưa có id
type TaoUser = Omit<User, "id">;

// Bảng tra cứu — nối với reduce ở file 04 chặng 2
const theoId: Record<number, User> = {};

// Literal union làm khóa — bắt buộc có đủ mọi khóa
type BoLoc = "tat-ca" | "chua-xong" | "da-xong";
const nhanBoLoc: Record<BoLoc, string> = {
  "tat-ca": "Tất cả",
  "chua-xong": "Chưa xong",
  "da-xong": "Đã xong",
};
// Thiếu một khóa → lỗi. Thêm giá trị vào BoLoc → mọi Record<BoLoc, ...> báo lỗi chỗ thiếu.
```

Dòng cuối là một kỹ thuật rất hữu ích: `Record<LiteralUnion, ...>` buộc bạn có **đủ** mọi khóa. Cùng tinh thần với kiểm tra `never` ở file `06`.

### Chúng được viết bằng gì

Utility type không phải phép màu — chúng được viết bằng chính TypeScript. Ví dụ `Partial`:

```typescript
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};
```

Đọc: *"với mỗi khóa `K` trong `keyof T`, tạo thuộc tính `K` tùy chọn, kiểu `T[K]`"*. Cú pháp này gọi là **mapped type**. Bạn không cần tự viết mapped type ở mức Junior — chỉ cần đọc được dòng trên và hiểu `Partial` đến từ đâu.

---

## 9. Viết lại `debounce` cho đúng kiểu

Ở file `06`, `debounce` còn dùng `any[]`:

```typescript
function debounce(fn: (...args: any[]) => void, delay: number) {
  // ...
}

const timKiem = debounce((tuKhoa: string) => { }, 500);
timKiem(42);   // không báo lỗi — dù hàm gốc nhận string
```

Bản generic giữ nguyên chữ ký của hàm gốc:

```typescript
function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  let idTimer: ReturnType<typeof setTimeout> | undefined;

  return (...args: A) => {
    clearTimeout(idTimer);
    idTimer = setTimeout(() => fn(...args), delay);
  };
}

const timKiem = debounce((tuKhoa: string, trang: number) => { }, 500);

timKiem("bàn phím", 1);   // OK
timKiem(42);               // ❌ Argument of type 'number' is not assignable to parameter of type 'string'
timKiem("bàn phím");       // ❌ Expected 2 arguments, but got 1
```

Đọc từng phần:

- `A extends unknown[]` — `A` là một tuple chứa kiểu các tham số
- `fn: (...args: A) => void` — hàm gốc nhận các tham số kiểu `A`
- Kiểu trả về `(...args: A) => void` — hàm đã bọc nhận **đúng** các tham số đó

TypeScript suy `A = [string, number]` từ hàm bạn truyền vào. Hàm đã debounce giữ nguyên chữ ký — ở mọi chỗ gọi, mọi lỗi sai kiểu đều được bắt.

Đây là closure (file `05` chặng 2) gặp generic. Nó cũng là câu hỏi phỏng vấn TypeScript ở mức trung cấp khá phổ biến.

---

## 10. `fetch` có kiểu — và lời nói dối của `as`

### Bản đầu tiên

```typescript
async function goiApi<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

type Pokemon = { id: number; name: string };

const p = await goiApi<Pokemon>("https://pokeapi.co/api/v2/pokemon/1");
p.name;   // string — có gợi ý, có kiểm tra
```

Trông rất ổn. Nhưng hãy rê chuột vào `res.json()`: kiểu của nó là `Promise<any>`. Không có kiểm tra nào xảy ra cả.

### Lời nói dối

```typescript
type Pokemon = { id: number; name: string; canNang: number };

const p = await goiApi<Pokemon>("https://pokeapi.co/api/v2/pokemon/1");
console.log(p.canNang.toFixed(1));
// TypeScript: hoàn toàn OK
// Lúc chạy: TypeError — API trả về "weight", không có "canNang"
```

TypeScript tin bạn. Bạn nói "đây là `Pokemon`", nó tin là `Pokemon`. Nhưng dữ liệu thật đến từ mạng, và nhớ type erasure ở file `06`: **lúc chạy không còn kiểu nào để kiểm tra**.

Generic ở đây không kiểm tra gì cả — nó chỉ là một cách viết `as Pokemon` cho đẹp hơn. Hiểu rõ điều này là dấu hiệu bạn thật sự hiểu TypeScript, không chỉ dùng được.

### Bản trung thực — kiểm tra lúc chạy

```typescript
async function goiApi<T>(
  url: string,
  kiemTra: (x: unknown) => x is T,
): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const duLieu: unknown = await res.json();   // thừa nhận: chưa biết là gì
  if (!kiemTra(duLieu)) {
    throw new Error("Dữ liệu từ server không đúng cấu trúc");
  }
  return duLieu;   // đã thu hẹp thành T
}
```

Hàm `kiemTra` là một type guard tự viết (mục 11 file `06`):

```typescript
function laPokemon(x: unknown): x is Pokemon {
  return (
    typeof x === "object" &&
    x !== null &&
    "id" in x && typeof x.id === "number" &&
    "name" in x && typeof x.name === "string"
  );
}

const p = await goiApi("https://pokeapi.co/api/v2/pokemon/1", laPokemon);
// p: Pokemon — lần này là thật, đã kiểm tra
```

Chú ý: không cần viết `goiApi<Pokemon>` nữa. TypeScript suy `T = Pokemon` từ chữ ký `x is Pokemon` của `laPokemon`.

### Đánh đổi

Viết tay type guard cho mọi kiểu dữ liệu rất dài dòng — thử với một object lồng ba tầng là thấy. Trong thực tế:

- Dự án nhỏ, API do chính đội mình làm: thường chấp nhận bản "tin tưởng" ở đầu mục
- Dự án nghiêm túc: dùng thư viện **Zod** — viết schema một lần, vừa kiểm tra lúc chạy vừa tự sinh kiểu TypeScript. Bạn sẽ học Zod ở chặng 5

Điều quan trọng ở chặng này là **biết** bản đầu tiên đang nói dối, và biết lời nói dối đó nằm ở đâu.

---

## 11. Class generic — lớp bọc lưu trữ có kiểu

Nối lại lớp bọc `kho` ở file `13` chặng 2:

```typescript
class KhoLuuTru<T> {
  constructor(
    private readonly khoa: string,
    private readonly macDinh: T,
    private readonly kiemTra: (x: unknown) => x is T,
  ) {}

  doc(): T {
    try {
      const raw = localStorage.getItem(this.khoa);
      if (raw === null) return this.macDinh;

      const duLieu: unknown = JSON.parse(raw);
      return this.kiemTra(duLieu) ? duLieu : this.macDinh;
    } catch {
      return this.macDinh;
    }
  }

  ghi(giaTri: T): boolean {
    try {
      localStorage.setItem(this.khoa, JSON.stringify(giaTri));
      return true;
    } catch {
      return false;
    }
  }
}
```

`private readonly khoa: string` trong constructor là cú pháp rút gọn của TypeScript: vừa khai báo tham số, vừa tạo thuộc tính `this.khoa` riêng tư, chỉ đọc.

```typescript
type Viec = { id: number; noiDung: string; daXong: boolean };

function laDanhSachViec(x: unknown): x is Viec[] {
  return Array.isArray(x) && x.every(
    (v) => typeof v === "object" && v !== null &&
      typeof v.id === "number" &&
      typeof v.noiDung === "string" &&
      typeof v.daXong === "boolean",
  );
}

const khoViec = new KhoLuuTru("todo:danh-sach", [] as Viec[], laDanhSachViec);

const ds = khoViec.doc();       // Viec[]
khoViec.ghi(ds);                 // OK
khoViec.ghi("rác");              // ❌ string không phải Viec[]
```

Dữ liệu hỏng trong `localStorage` (người dùng sửa tay, phiên bản cũ của app) không còn lọt vào ứng dụng nữa — nó bị kiểm tra rồi thay bằng giá trị mặc định. Đây là cùng nguyên lý với mục 10: `localStorage` cũng là "thế giới bên ngoài".

---

## 12. Khi nào không nên dùng generic

Generic mạnh nên rất dễ lạm dụng.

```typescript
// Thừa — T chỉ xuất hiện một lần
function inRa<T>(x: T): void {
  console.log(x);
}

// Đủ
function inRa(x: unknown): void {
  console.log(x);
}
```

**Quy tắc ngón tay cái: tham số kiểu phải xuất hiện ít nhất hai lần.** Generic tồn tại để nối **hai** vị trí với nhau — đầu vào với đầu ra, hoặc hai tham số với nhau. Nếu `T` chỉ xuất hiện đúng một chỗ, nó không nối gì cả, và `unknown` là đủ.

```typescript
// Có giá trị — T nối đầu vào với đầu ra
function layDau<T>(arr: T[]): T | undefined

// Có giá trị — T nối hai tham số
function giongNhau<T>(a: T, b: T): boolean

// Thừa — T chỉ đứng một mình
function dem<T>(arr: T[]): number   // → dùng unknown[] là đủ
```

Vài dấu hiệu khác cho thấy đang lạm dụng:

- Ba, bốn tham số kiểu lồng nhau mà đọc lại không hiểu nổi
- Viết generic cho một hàm chỉ được gọi với đúng một kiểu
- Dùng `as T` bên trong thân hàm để "ép" cho qua — đó là `any` đội lốt

Code dễ đọc quan trọng hơn kiểu hoàn hảo. Ở mức Junior, mục tiêu là **đọc thành thạo** generic của thư viện, và **viết được** những generic đơn giản như ở mục 2–6.

---

## 13. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Property 'x' does not exist on type 'T'` | `T` có thể là bất cứ gì | Thêm ràng buộc `T extends { x: ... }` |
| Kết quả có kiểu `unknown` hoặc `never` bất ngờ | TypeScript không suy được `T` (thường do mảng rỗng) | Truyền tường minh `<KieuCuThe>` |
| `useState(null)` rồi không gán được object vào | Suy ra `T = null` | `useState<User \| null>(null)` |
| `Type 'string' is not assignable to type 'keyof T'` | Khóa là `string` chung chung | Ràng buộc `K extends keyof T` |
| `Argument of type '"x"' is not assignable to parameter of type 'keyof User'` | Gõ nhầm tên trường | Sửa tên — đây là TypeScript đang làm đúng việc |
| `<T>` bị hiểu là thẻ JSX trong file `.tsx` | Cú pháp arrow generic | `<T,>(x: T) => ...` |
| Dữ liệu API sai cấu trúc nhưng TypeScript không báo | `res.json()` trả `any`; generic không kiểm tra lúc chạy | Type guard, hoặc Zod (chặng 5) |
| `Record<BoLoc, ...>` báo thiếu khóa | Thêm giá trị mới vào union | Bổ sung khóa còn thiếu — TypeScript đang nhắc đúng chỗ |
| Generic chằng chịt, đọc không hiểu | Lạm dụng | Mục 12 — đơn giản hóa, `unknown` thường là đủ |

---

## 14. Tóm tắt cần thuộc

1. Generic diễn đạt **mối quan hệ giữa các kiểu**: đầu ra cùng kiểu với đầu vào, dù đó là kiểu gì
2. `<T>` là tham số ở tầng kiểu; TypeScript thường tự suy ra `T` từ đối số
3. `T extends X` nghĩa là `T` phải **thỏa mãn** `X` — không phải kế thừa class
4. Generic **giữ nguyên** kiểu cụ thể đi qua hàm; không generic thì kiểu bị thu về chung chung
5. `keyof T` = union các tên khóa; `T[K]` = kiểu của thuộc tính `K`
6. `K extends keyof T` để nhận tên trường an toàn, có gợi ý
7. `typeof` ở vị trí kiểu lấy kiểu của một biến
8. Kiểu cũng có tham số được: `PhanHoiApi<T>`, `KetQua<T, E>`
9. `KetQua<T, E>` biến lỗi thành một phần của chữ ký hàm
10. `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`... là generic có sẵn — đọc được và dùng được
11. `Record<LiteralUnion, V>` buộc có đủ mọi khóa
12. `useState<User | null>(null)` — trường hợp phổ biến nhất phải viết tham số kiểu bằng tay
13. `fetch<T>` **không** kiểm tra gì lúc chạy — nó chỉ là `as T` viết đẹp hơn
14. Tham số kiểu phải xuất hiện **ít nhất hai lần**; một lần thì dùng `unknown`

---

## Bài tập

Làm trong dự án `bai-tap-07-generics` (Vite + TypeScript, có ESLint và Prettier như file `06`).

### Bài 1 — Đoán kiểu

Với mỗi biến dưới đây, ghi vào `ghi-chu.md` kiểu bạn **đoán** TypeScript suy ra, rồi rê chuột để kiểm tra:

```typescript
function layDau<T>(arr: T[]): T | undefined { return arr[0]; }
function ghepCap<A, B>(a: A, b: B): [A, B] { return [a, b]; }
function layThuocTinh<T, K extends keyof T>(o: T, k: K): T[K] { return o[k]; }

// ⚠️ CHUNG: đề hỏi KIỂU CỦA BIẾN (v1, v2...), không chỉ hỏi T. Xác định T là bước 1,
//    bước 2 là thay T vào kiểu trả về. Ở đây kiểu trả về là T | undefined.

// ⚠️ THIẾU: T = number thì đúng, nhưng v1 có kiểu là number | undefined (kiểu trả về là T | undefined).
const v1 = layDau([1, 2, 3]); -> T là number
// ❌ SAI: không có lỗi. Mảng ["a", 1] được suy ra kiểu (string | number)[], vì vậy
//    T = string | number và v2: string | number | undefined.
//    T không bắt buộc là kiểu "đơn". Union cũng là một kiểu hợp lệ cho T.
//    Muốn TS báo lỗi thì phải truyền tường minh: layDau<string>(["a", 1]) → ❌ 1 không phải string.
const v2 = layDau(["a", 1]); -> lỗi phải là 1 kiểu thôi chứ sao 2 kiểu được
// ⚠️ THIẾU (đây là cái bẫy của câu này): T = never thì đúng, nhưng v3 có kiểu là never | undefined,
//    mà never là kiểu rỗng nên khi hợp vào union thì nó biến mất → v3: undefined.
//    (Phải bật "strict" thì mới ra như vậy. Tắt strict thì [] là any[] và T = any.)
const v3 = layDau([]); -> T là never
// ✅ ĐÚNG. v4: [string, boolean]
const v4 = ghepCap("x", true); -> A là string, B là boolean
// ✅ ĐÚNG (chữ "a" chỗ đầu nên viết hoa là "A"). v5: [number[], { a: number }]
const v5 = ghepCap([1], { a: 1 }); -> a là number[], B là {a: number}

const user = { id: 1, ten: "An", tags: ["admin"] };
// ❌ SAI 2 chỗ:
//  1. Không hề có kiểu nào tên "User". T được suy ra từ object literal:
//     T = { id: number; ten: string; tags: string[] }
//  2. K KHÔNG phải string[]. K là kiểu của KHÓA bạn truyền vào, tức là literal "tags".
//     Cái bạn viết (string[]) là T[K], tức là kiểu của GIÁ TRỊ. Đó chính là đáp án của v6.
//  → T = {id; ten; tags}, K = "tags", v6: T["tags"] = string[]
const v6 = layThuocTinh(user, "tags"); -> T là User {id: number, ten: string, tags: string[]}, K là string[]
// ❌ SAI, cùng lỗi với v6: K = "id" (literal), không phải number. number là T["id"], cũng chính là kiểu của v7.
//  → K = "id", v7: number
const v7 = layThuocTinh(user, "id"); ->  T là User {id: number, ten: string, tags: string[]}, K là number

type U = { id: number; ten: string; email?: string };
// ✅ ĐÚNG
type V8 = Partial<U>; -> { id?: number; ten?: string; email?: string }
// ✅ ĐÚNG. Pick giữ nguyên dấu ? của email
type V9 = Pick<U, "id" | "email">; -> {id: number, email?: string}
// ✅ ĐÚNG
type V10 = Omit<U, "id">; -> {ten: string, email?: string}
// ✅ ĐÚNG. Trường tùy chọn (email?) vẫn có mặt trong keyof
type V11 = keyof U; -> "id" | "ten" | "email"
// ✅ ĐÚNG. Trường tùy chọn có thể vắng mặt, nên khi đọc phải tính cả undefined
type V12 = U["email"]; -> string | undefined
// ✅ ĐÚNG. typeof layDau<string> là "instantiation expression" (TS 4.7+), cố định T = string
type V13 = ReturnType<typeof layDau<string>>; -> string | undefined
// ❌ SAI: Awaited mở gói ĐỆ QUY, mở tới khi không còn Promise nào nữa → number.
//    Nó mô phỏng đúng hành vi của await lúc chạy: Promise lồng nhau tự "phẳng" ra
//    (một Promise resolve bằng một Promise khác sẽ đi theo Promise đó),
//    nên await một Promise<Promise<number>> thì nhận được number, không bao giờ nhận được Promise<number>.
//    → V14 = number
type V14 = Awaited<Promise<Promise<number>>>; -> Promise<number>
```

Câu `v2`, `v3`, `V12`, `V14` là những câu dễ đoán sai nhất — giải thích kỹ.

### Bài 2 — Tự viết hàm generic

Viết các hàm sau với kiểu đầy đủ, **không dùng `any`**. Mỗi hàm test ít nhất ba trường hợp, kèm ít nhất một trường hợp **cố tình sai kiểu** để chứng minh TypeScript bắt được:

1. `layCuoi<T>(arr: T[]): T | undefined`
2. `daoNguoc<T>(arr: readonly T[]): T[]` — không sửa mảng gốc
3. `loaiTrung<T>(arr: T[]): T[]` — dùng `Set`
4. `nhomTheo<T, K extends keyof T>(arr: T[], khoa: K): Record<string, T[]>` — viết lại hàm nhóm ở file `04` chặng 2
5. `layNhieu<T, K extends keyof T>(obj: T, khoa: K[]): Pick<T, K>`
6. `chiMotLan<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R` — viết lại `once` ở file `05` chặng 2
7. `debounce` theo mục 9 — test bằng một hàm hai tham số, chứng minh gọi sai số lượng hoặc kiểu đối số bị bắt
8. `ghiNho<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R` — viết lại `memoize` ở file `05` chặng 2

Với hàm 4, giải thích trong `ghi-chu.md`: vì sao kiểu trả về là `Record<string, T[]>` mà không chính xác hơn được? (Gợi ý: giá trị của thuộc tính `khoa` có thể là số, chuỗi, boolean...)

### Bài 3 — Mô hình hóa API

1. Viết `PhanHoiApi<T>` và `PhanTrang<T>` theo mục 6
2. Viết `KetQua<T, E = string>` theo mục 6
3. Viết hàm `async function goiAnToan<T>(url: string, kiemTra: (x: unknown) => x is T): Promise<KetQua<T>>` — **không bao giờ `throw`**. Mọi lỗi (mạng, HTTP, dữ liệu sai cấu trúc) đều trả về `{ ok: false, loi: ... }`
4. Gọi thử với JSONPlaceholder (`https://jsonplaceholder.typicode.com/users/1`). Viết type guard `laUser`
5. Cố tình viết sai một trường trong kiểu `User` (ví dụ đổi `username` thành `tenDangNhap`) — xác nhận type guard phát hiện, `goiAnToan` trả về `ok: false`
6. So sánh với phiên bản "tin tưởng" (`return res.json()` thẳng): cùng lỗi ở câu 5, chuyện gì xảy ra? Ghi vào `ghi-chu.md`

Câu 5 và 6 đặt cạnh nhau là điểm mấu chốt của mục 10.

### Bài 4 — Utility type trong thực tế

Cho:

```typescript
type SanPham = {
  readonly id: number;
  ten: string;
  gia: number;
  moTa: string;
  danhMuc: "phu-kien" | "man-hinh" | "luu-tru";
  tonKho: number;
  ngayTao: string;
};
```

Chỉ dùng utility type (không viết lại tay), định nghĩa:

1. `TaoSanPham` — dữ liệu gửi lên khi tạo mới: không có `id`, không có `ngayTao`
2. `CapNhatSanPham` — dữ liệu gửi lên khi sửa: mọi trường tùy chọn, nhưng không được có `id`
3. `TheSanPham` — dữ liệu hiển thị trên thẻ: chỉ `id`, `ten`, `gia`
4. `NhanDanhMuc` — object ánh xạ mỗi danh mục sang tên tiếng Việt, **bắt buộc đủ mọi danh mục**
5. `ThongKeTheoDanhMuc` — object ánh xạ mỗi danh mục sang số lượng

Sau đó thêm danh mục `"am-thanh"` vào `SanPham`. Ghi lại: những chỗ nào TypeScript báo lỗi? Vì sao đó là điều tốt?

### Bài 5 — Pokédex bằng TypeScript (dự án cuối chặng 3)

Đây là dự án tổng kết chặng 3. Nó dùng **tất cả** những gì bạn học từ file `00` đến `07`.

**Khởi tạo**

1. Tạo dự án Vite + TypeScript mới, kho Git mới, đặt tên `pokedex-ts`
2. Cài đủ: ESLint + `typescript-eslint` + Prettier + `eslint-config-prettier` + Husky + lint-staged
3. Thêm script `typecheck`, và cho lint-staged chạy cả `tsc --noEmit`... rồi cân nhắc: `tsc` kiểm tra **toàn bộ dự án**, không chỉ file staged. Ghi vào `ghi-chu.md` cách bạn xử lý (gợi ý: chạy `typecheck` trong hook `pre-push` thay vì `pre-commit`)
4. Cấu hình alias `@` trỏ về `src/` (file `04`)

**Kiểu dữ liệu**

5. Viết kiểu cho response của PokéAPI. Chỉ khai báo những trường bạn thực sự dùng:

```typescript
// GET /pokemon?limit=20&offset=0
type DanhSachPokemon = {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
};

// GET /pokemon/{ten-hoac-id}
type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: { front_default: string | null };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};
```

Kiểm tra lại cấu trúc bằng cách mở URL thật trên trình duyệt — đừng tin hoàn toàn vào mẫu trên. Tự bổ sung kiểu cho phần chi tiết bạn muốn hiển thị.

6. Viết type guard cho `Pokemon` và `DanhSachPokemon`

**Trạng thái**

7. Mô hình hóa trạng thái màn hình bằng **discriminated union** (file `06` mục 11), có kiểm tra đầy đủ bằng `never`
8. Kiểu cho bộ lọc, từ khóa, trang hiện tại

**Logic**

9. Dùng lại `goiAnToan<T>` từ bài 3 — không có `throw` nào lọt ra khỏi tầng API
10. `debounce` có kiểu từ bài 2 cho ô tìm kiếm
11. Chống race condition bằng `AbortController` (file `12` chặng 2)
12. Cache chi tiết Pokémon bằng `Map<number, Pokemon>`
13. Lưu yêu thích và bộ lọc bằng `KhoLuuTru<T>` ở mục 11
14. Event delegation với thu hẹp kiểu `e.target` (file `06` mục 13)

**Ràng buộc**

15. Không có `any` nào. `npm run lint` không còn cảnh báo `no-explicit-any`
16. `as` và `!` dùng tối đa **3 lần** trong toàn dự án, mỗi lần có comment giải thích
17. `npm run typecheck` và `npm run lint` sạch
18. Mỗi tính năng làm trên một nhánh riêng, merge vào `main` qua Pull Request (file `02`). Tối thiểu 5 PR
19. README đầy đủ (file `02`), có mục "Điều học được" nói về TypeScript
20. Deploy lên Netlify hoặc Vercel, link demo chạy được

**Tự kiểm tra**

| Thử nghiệm | Kết quả mong đợi |
|---|---|
| Đổi một trường trong kiểu `Pokemon` cho sai tên | Type guard bắt được, app hiện thông báo lỗi thay vì vỡ |
| Thêm một trạng thái mới vào discriminated union | `never` báo lỗi đúng chỗ chưa xử lý |
| Gọi hàm debounce sai kiểu đối số | Lỗi đỏ trong editor |
| Ghi rác vào `localStorage` ở khóa yêu thích | App vẫn chạy, yêu thích về mặc định |
| Commit code có `==` | Husky chặn |
| `git log --oneline --graph` | Thấy được các nhánh tính năng đã merge |

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Generic giải quyết vấn đề gì mà `any` và `unknown` không giải quyết được?
2. `T extends X` nghĩa là gì? Vì sao nó khác `extends` của class?
3. Vì sao `async function goiApi<T>(url): Promise<T> { return res.json() }` được gọi là "nói dối"? Có những cách nào để trung thực hơn?
4. Kể bốn utility type và một tình huống thật cho mỗi cái.
5. Khi nào **không** nên dùng generic?

---

## Xong file này khi

- [ ] Bài 1 đoán đúng phần lớn, giải thích được các câu khó
- [ ] Tám hàm ở bài 2 không có `any`, mỗi hàm có test chứng minh bắt được lỗi
- [ ] `goiAnToan` không bao giờ `throw`, và bạn thấy tận mắt type guard bắt dữ liệu sai cấu trúc
- [ ] Bài 4 làm hoàn toàn bằng utility type
- [ ] Pokédex TypeScript đạt cả 20 yêu cầu và 6 thử nghiệm
- [ ] Trả lời được 5 câu ở bài 6 bằng lời

---

# HẾT CHẶNG 3

Bạn vừa đi qua 8 file và khoảng 3 tuần. Nhìn lại khác biệt so với lúc hết chặng 2.

## Trước và sau

| Hết chặng 2 | Hết chặng 3 |
|---|---|
| Code nằm trên ổ cứng | Code trên GitHub, có lịch sử commit |
| Mở file bằng Live Server | Dự án Vite, HMR, build tối ưu |
| Tự nhớ quy ước | ESLint, Prettier tự kiểm tra |
| Bug lộ ra lúc chạy | TypeScript bắt từ lúc gõ |
| Không có link nào để gửi | Link demo + link kho cho mỗi dự án |
| Làm một mình | Quy trình nhánh → PR → merge như làm nhóm |

## Kho dự án hiện có

1. `learning-frontend` — toàn bộ hành trình học
2. `todo-app` — JavaScript, có bản TypeScript
3. `pokedex-js` — JavaScript
4. `quiz-app` — JavaScript
5. `pokedex-ts` — **dự án tiêu biểu nhất**: Vite + TypeScript + lint + CI hook + PR workflow

## Bài kiểm tra cuối chặng

Trả lời **bằng lời**, không nhìn tài liệu:

**Git**
1. Ba khu vực của Git là gì? Staging area để làm gì?
2. `git revert` và `git reset --hard` khác nhau ra sao? Khi nào dùng cái nào?
3. Merge conflict xảy ra khi nào? Bạn xử lý thế nào?
4. `git fetch` và `git pull` khác nhau chỗ nào?
5. Mô tả quy trình làm một tính năng, từ tạo nhánh đến merge.

**Công cụ**
6. `dependencies` và `devDependencies` khác nhau ra sao?
7. Giải thích `^4.17.21`. `package-lock.json` để làm gì?
8. Vì sao Vite khởi động nhanh? `npm run dev` và `npm run build` khác nhau thế nào?
9. Linter và formatter khác nhau ra sao?

**TypeScript**
10. Type erasure là gì? Hệ quả với dữ liệu từ API?
11. `any` và `unknown` khác nhau thế nào?
12. `type` và `interface` khác nhau ra sao?
13. Discriminated union là gì, giải quyết vấn đề gì?
14. Generic là gì? Cho một ví dụ bạn đã viết.

Trả lời trôi chảy 11/14 câu là bạn đã sẵn sàng cho phần Git và TypeScript của phỏng vấn Junior.

## Tiếp theo

**Chặng 4 — React nền tảng.** 12 file, khoảng 5 tuần.

Bạn sẽ thấy rất nhiều thứ quen thuộc. Kiến trúc `trạng thái → render()` của máy tính và todo app chính là ý tưởng cốt lõi của React. Closure là cách `useState` hoạt động. Bất biến (file `03` chặng 2) là luật bắt buộc của state. Event delegation là việc React tự làm bên dưới. Discriminated union là cách bạn sẽ mô hình hóa trạng thái gọi API. Và mọi dự án React sẽ bắt đầu bằng `npm create vite@latest`, chọn React + TypeScript — đúng bộ khung bạn vừa dựng.

React không phải thứ hoàn toàn mới. Nó là cách tổ chức lại những gì bạn đã biết.

Xong thì gửi mình link kho `pokedex-ts` và link demo, kèm **"viết file 00-bat-dau-chang-4"**.