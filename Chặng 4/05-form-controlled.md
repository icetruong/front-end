# 05 — Form controlled

> **Cần có trước:** xong `03` (`useState`, thiết kế state — đặc biệt mục 10) và `04` (`key`). Nhớ file `09` chặng 2 (sự kiện form, `input` vs `change`, `FormData`), file `07` chặng 3 (`keyof`, generic).
> **Thời gian:** 4–5 giờ.
> **Vì sao quan trọng:** form là nơi người dùng đưa dữ liệu vào ứng dụng — đăng nhập, đăng ký, tìm kiếm, thanh toán. Mọi ứng dụng thật đều có. Và form là chỗ nguyên tắc "không lưu thứ tính được" ở file `03` phát huy rõ nhất: lỗi validate **không phải** state.

---

## 1. Hai nguồn sự thật

Ô `<input>` trong trình duyệt **tự giữ giá trị của nó**. Bạn gõ, chữ hiện ra — không cần JavaScript nào cả. Đó là cách mọi thứ hoạt động ở chặng 2: bạn đọc `input.value` khi cần.

Giờ bạn có React, với state riêng:

```tsx
function TimKiem() {
  const [tuKhoa, setTuKhoa] = useState("");
  return <input />;
}
```

Có **hai** nơi cùng giữ "từ khóa": ô input (trong DOM), và biến `tuKhoa` (trong React). Chúng không liên quan gì đến nhau. Gõ vào ô, `tuKhoa` vẫn là `""`. Gọi `setTuKhoa("abc")`, ô vẫn trống.

Đây là vấn đề quen thuộc của mục 10 file `03`: **hai nguồn sự thật thì sớm muộn sẽ lệch nhau.** Phải chọn một.

React cho bạn hai lựa chọn:

- **Controlled** — React state là nguồn duy nhất. Ô input chỉ hiển thị cái state đang có
- **Uncontrolled** — DOM là nguồn duy nhất. React không theo dõi, chỉ đọc giá trị khi cần

---

## 2. Controlled input

```tsx
function TimKiem() {
  const [tuKhoa, setTuKhoa] = useState("");

  return (
    <>
      <input
        value={tuKhoa}
        onChange={(e) => setTuKhoa(e.target.value)}
      />
      <p>Bạn đang tìm: {tuKhoa}</p>
    </>
  );
}
```

Hai thuộc tính đi cùng nhau:

- **`value={tuKhoa}`** — ô input **luôn** hiển thị đúng giá trị của state
- **`onChange={...}`** — mỗi khi người dùng gõ, cập nhật state

### Vòng lặp khi gõ một phím

```
Người dùng gõ "a"
      ↓
onChange chạy, e.target.value = "a"
      ↓
setTuKhoa("a")
      ↓
React render lại, tuKhoa = "a"
      ↓
<input value="a" />  → ô hiện "a"
```

Mỗi phím gõ đi trọn một vòng. Đây là `UI = f(state)` áp dụng cho ô input: ô input không tự giữ gì nữa, nó chỉ **phản chiếu** state.

### `onChange` của React khác `change` của chặng 2

Nhớ mục 7.3 file `09` chặng 2: sự kiện `change` của trình duyệt với ô text chỉ bắn **khi rời ô**. `input` mới bắn mỗi ký tự.

React đặt tên gây nhầm: **`onChange` của React bắn mỗi ký tự** — nó hoạt động như sự kiện `input` của trình duyệt. Đừng mang kiến thức chặng 2 vào chỗ này mà không để ý.

### Thử bỏ `onChange`

```tsx
<input value={tuKhoa} />
```

Gõ gì cũng không ra chữ. Console cảnh báo:

```
Warning: You provided a `value` prop to a form field without an `onChange` handler.
This will render a read-only field.
```

Hợp lý: bạn nói "ô này luôn hiển thị `tuKhoa`", nhưng không có cách nào để `tuKhoa` đổi. Ô bị khóa cứng.

### Controlled cho bạn điều khiển

Vì state là nguồn sự thật, bạn **can thiệp được** vào giá trị trước khi nó hiện ra:

```tsx
// Tự động viết hoa
<input
  value={maGiamGia}
  onChange={(e) => setMaGiamGia(e.target.value.toUpperCase())}
/>

// Chỉ cho gõ số, tối đa 10 ký tự
<input
  value={sdt}
  onChange={(e) => {
    const chiSo = e.target.value.replace(/\D/g, "").slice(0, 10);
    setSdt(chiSo);
  }}
/>

// Xóa từ ngoài
<button type="button" onClick={() => setTuKhoa("")}>Xóa</button>
```

Ở chặng 2, chặn ký tự không phải số cần bắt `keydown` và xử lý đủ thứ ngoại lệ (Backspace, mũi tên, dán chuột phải...) — bạn đã làm ở bài 3 file `09`. Ở đây chỉ cần lọc giá trị trong `onChange`, và mọi cách nhập (gõ, dán, kéo thả) đều được xử lý chung.

---

## 3. Các loại ô nhập

### Text, email, password, textarea

```tsx
<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

<textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} />
```

Với `textarea`, HTML đặt nội dung **giữa** hai thẻ. React thì dùng `value` như ô input — nhất quán hơn.

### Số — cái bẫy chuỗi

```tsx
const [tuoi, setTuoi] = useState(0);

<input
  type="number"
  value={tuoi}
  onChange={(e) => setTuoi(e.target.value)}   // ❌ TypeScript báo lỗi
/>
```

`e.target.value` **luôn là chuỗi**, kể cả với `type="number"` — nhớ mục 9 file `08` chặng 2. TypeScript chặn ngay vì `tuoi` là `number`.

Chuyển đổi thì sao?

```tsx
onChange={(e) => setTuoi(Number(e.target.value))}
```

Vấn đề: người dùng xóa hết để gõ lại, `Number("")` là `0` (bảng ép kiểu file `01` chặng 2). Ô nhảy về `0` ngay, không xóa trống được. Và state không còn phân biệt được "người dùng nhập số 0" với "người dùng chưa nhập gì" — hai trường hợp mà validate cần xử lý khác nhau.

Cách thực dụng: **lưu chuỗi trong state, chỉ chuyển sang số khi cần dùng**.

```tsx
const [tuoiNhap, setTuoiNhap] = useState("");

<input
  type="number"
  value={tuoiNhap}
  onChange={(e) => setTuoiNhap(e.target.value)}
/>

const tuoi = Number(tuoiNhap);             // tính trong lúc render
const tuoiHopLe = tuoiNhap !== "" && Number.isInteger(tuoi) && tuoi > 0;
```

Đây là một ví dụ của nguyên tắc chung: **state của form lưu đúng cái người dùng đang gõ**, còn giá trị đã chuẩn hóa thì tính ra.

### Checkbox — `checked`, không phải `value`

```tsx
const [dongY, setDongY] = useState(false);

<input
  type="checkbox"
  checked={dongY}
  onChange={(e) => setDongY(e.target.checked)}
/>
```

Nhớ mục 9 file `08` chặng 2: với checkbox, `value` gần như vô dụng (`"on"`), phải dùng `checked`. React cũng vậy — cả thuộc tính lẫn `e.target`.

### Radio — so sánh để quyết định cái nào được chọn

```tsx
type GoiCuoc = "co-ban" | "nang-cao" | "doanh-nghiep";
const [goi, setGoi] = useState<GoiCuoc>("co-ban");

{(["co-ban", "nang-cao", "doanh-nghiep"] as const).map((g) => (
  <label key={g}>
    <input
      type="radio"
      name="goi"
      value={g}
      checked={goi === g}
      onChange={() => setGoi(g)}
    />
    {g}
  </label>
))}
```

Một state cho cả nhóm. Mỗi radio tự hỏi "giá trị hiện tại có phải là mình không?".

### Select

```tsx
const [thanhPho, setThanhPho] = useState("");

<select value={thanhPho} onChange={(e) => setThanhPho(e.target.value)}>
  <option value="">-- Chọn --</option>
  <option value="hcm">TP. Hồ Chí Minh</option>
  <option value="hn">Hà Nội</option>
</select>
```

HTML dùng thuộc tính `selected` trên `<option>`. React đặt `value` lên chính thẻ `<select>` — lại nhất quán với input.

### Ngày tháng

```tsx
const [ngay, setNgay] = useState("");   // "2026-10-08"

<input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} />
```

`value` của `type="date"` là chuỗi dạng `YYYY-MM-DD`, không phải object `Date`. Lưu chuỗi, chuyển sang `Date` khi cần tính toán.

---

## 4. Uncontrolled input

Lựa chọn thứ hai: để DOM tự giữ giá trị, React không theo dõi.

```tsx
function FormLienHe() {
  function xuLyGui(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const duLieu = Object.fromEntries(fd);
    console.log(duLieu);   // { ten: "...", email: "..." }
  }

  return (
    <form onSubmit={xuLyGui}>
      <input name="ten" defaultValue="" />
      <input name="email" type="email" />
      <button type="submit">Gửi</button>
    </form>
  );
}
```

Đây chính là cách bạn làm ở bài 3 file `09` chặng 2: `FormData` + `Object.fromEntries`, chỉ đọc khi submit.

- **`defaultValue`** (và `defaultChecked` cho checkbox) — giá trị **ban đầu**, sau đó DOM tự quản lý. Khác `value`, nó không khóa ô
- Không có `useState`, không render lại khi gõ

### Khi nào chọn cái nào

| | Controlled | Uncontrolled |
|---|---|---|
| Nguồn sự thật | React state | DOM |
| Render lại khi gõ | Có | Không |
| Biết giá trị ngay khi gõ | Có | Không — chỉ khi đọc |
| Validate trong lúc gõ | Dễ | Khó |
| Biến đổi giá trị (viết hoa, lọc số) | Dễ | Khó |
| Đặt giá trị từ bên ngoài | Dễ | Khó |
| Lượng code | Nhiều hơn | Ít hơn |

Dùng **controlled** khi giao diện cần phản ứng theo từng ký tự: validate tức thì, đếm ký tự, lọc danh sách khi gõ, nút submit bật/tắt theo nội dung. Đây là phần lớn trường hợp trong ứng dụng thật, và là trọng tâm của file này.

Dùng **uncontrolled** khi chỉ cần giá trị lúc submit, không cần phản ứng gì trong lúc gõ — một form liên hệ đơn giản chẳng hạn.

React 19 còn có cách viết form mới: truyền thẳng một hàm vào `<form action={...}>`, hàm đó nhận `FormData`. Nó đi kèm vài hook mới (`useActionState`, `useFormStatus`) và hợp nhất nhất với render phía server. Bạn sẽ gặp nó ở chặng 5 và 7. Ở chặng này, `onSubmit` + controlled là nền tảng cần nắm trước.

### Lỗi chuyển từ uncontrolled sang controlled

```tsx
const [user, setUser] = useState<{ ten?: string }>({});

<input value={user.ten} onChange={(e) => setUser({ ten: e.target.value })} />
```

Gõ chữ đầu tiên, Console cảnh báo:

```
Warning: A component is changing an uncontrolled input to be controlled.
```

Lần render đầu, `user.ten` là `undefined`. React coi `value={undefined}` là **không có** `value` → uncontrolled. Sau khi gõ, `value` thành chuỗi → controlled. React không cho một ô đổi chế độ giữa chừng.

Cách sửa — đảm bảo `value` **không bao giờ** là `undefined` hay `null`:

```tsx
<input value={user.ten ?? ""} onChange={...} />
```

Hoặc tốt hơn — khởi tạo state với đủ trường, giá trị chuỗi rỗng.

---

## 5. Nhiều trường — một state, một hàm

Form đăng ký có năm trường. Năm `useState`, năm hàm `onChange` gần giống hệt nhau thì rất dài. Nhớ mục 7 file `03`: gom các giá trị **luôn đi cùng nhau** thành một object.

```tsx
type FormDangKy = {
  hoTen: string;
  email: string;
  matKhau: string;
  xacNhanMatKhau: string;
  thanhPho: string;
  dongY: boolean;
};

const BAN_DAU: FormDangKy = {
  hoTen: "",
  email: "",
  matKhau: "",
  xacNhanMatKhau: "",
  thanhPho: "",
  dongY: false,
};

function DangKy() {
  const [form, setForm] = useState<FormDangKy>(BAN_DAU);

  function capNhat<K extends keyof FormDangKy>(truong: K, giaTri: FormDangKy[K]) {
    setForm((f) => ({ ...f, [truong]: giaTri }));
  }

  return (
    <form>
      <input
        value={form.hoTen}
        onChange={(e) => capNhat("hoTen", e.target.value)}
      />
      <input
        type="email"
        value={form.email}
        onChange={(e) => capNhat("email", e.target.value)}
      />
      <input
        type="checkbox"
        checked={form.dongY}
        onChange={(e) => capNhat("dongY", e.target.checked)}
      />
      {/* ... */}
    </form>
  );
}
```

Hàm `capNhat` là thứ bạn đã viết ở mục 5 file `07` chặng 3 — `layThuocTinh<T, K extends keyof T>`, giờ ở chiều ghi:

- `truong` phải là một tên trường có thật — gõ `capNhat("hoTenn", ...)` bị bắt ngay
- `giaTri` phải đúng kiểu của trường đó — `capNhat("dongY", "có")` bị bắt, vì `dongY` là `boolean`
- `[truong]: giaTri` là computed property (mục 1.4 file `03` chặng 2)
- `{ ...f, ... }` tạo object mới — luật bất biến ở file `03`

### Cách viết dựa vào thuộc tính `name`

Bạn sẽ thấy cách này rất nhiều trong code thật:

```tsx
function xuLyThayDoi(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
  const { name, value } = e.target;
  setForm((f) => ({ ...f, [name]: value }));
}

<input name="hoTen" value={form.hoTen} onChange={xuLyThayDoi} />
<input name="email" value={form.email} onChange={xuLyThayDoi} />
```

Gọn hơn, nhưng mất kiểm tra kiểu: `name` chỉ là `string`, gõ nhầm `name="hoTenn"` không ai bắt, và checkbox phải xử lý riêng vì nó dùng `checked`. Biết để đọc được code người khác. Khi tự viết, bản `capNhat` có kiểu an toàn hơn.

---

## 6. Submit

```tsx
function xuLyGui(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  // dữ liệu đã có sẵn trong state `form`
  console.log(form);
}

<form onSubmit={xuLyGui}>
  {/* ... */}
  <button type="submit">Đăng ký</button>
</form>
```

Nhớ mục 7.3 file `09` chặng 2: gắn vào **`onSubmit` của `<form>`**, không gắn vào `onClick` của nút — để Enter trong ô nhập cũng gửi được. Và `preventDefault()` vẫn bắt buộc, nếu không trang tải lại.

Với controlled form, bạn không cần `FormData` — dữ liệu đã nằm trong state.

### Bẫy: nút nào trong form cũng là nút submit

```tsx
<form onSubmit={xuLyGui}>
  <input ... />
  <button onClick={() => setForm(BAN_DAU)}>Xóa hết</button>   {/* ❌ */}
  <button type="submit">Gửi</button>
</form>
```

Bấm "Xóa hết" — form bị **gửi đi**. Mặc định của HTML: `<button>` nằm trong `<form>` mà không ghi `type` thì là `type="submit"`.

```tsx
<button type="button" onClick={() => setForm(BAN_DAU)}>Xóa hết</button>   {/* ✓ */}
```

**Quy tắc: mọi `<button>` trong form, ghi rõ `type`.** `type="submit"` cho nút gửi, `type="button"` cho mọi nút khác.

---

## 7. Validate — lỗi không phải là state

Đây là mục quan trọng nhất của file.

### Cách sai — lưu lỗi thành state

```tsx
const [form, setForm] = useState(BAN_DAU);
const [loiEmail, setLoiEmail] = useState("");
const [loiMatKhau, setLoiMatKhau] = useState("");

function xuLyEmail(e: React.ChangeEvent<HTMLInputElement>) {
  const v = e.target.value;
  setForm({ ...form, email: v });
  setLoiEmail(v.includes("@") ? "" : "Email không hợp lệ");
}
```

Trông ổn. Nhưng thêm điều kiện "mật khẩu xác nhận phải khớp mật khẩu": người dùng gõ xác nhận khớp, rồi quay lại sửa mật khẩu. Lỗi xác nhận phải hiện ra — nhưng hàm xử lý ô mật khẩu không biết phải cập nhật lỗi của ô xác nhận. Mỗi quy tắc liên quan đến nhiều trường lại thêm một chỗ phải nhớ.

Đây là vi phạm nguyên tắc 1 ở mục 10 file `03`: **lỗi tính được từ dữ liệu form**. Lưu nó thành state riêng là tạo nguồn sự thật thứ hai.

### Cách đúng — tính lỗi trong lúc render

```tsx
type LoiForm = Partial<Record<keyof FormDangKy, string>>;

function kiemTra(f: FormDangKy): LoiForm {
  const loi: LoiForm = {};

  if (f.hoTen.trim().length < 2) loi.hoTen = "Họ tên tối thiểu 2 ký tự";

  if (!f.email.trim()) loi.email = "Vui lòng nhập email";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) loi.email = "Email không hợp lệ";

  if (f.matKhau.length < 8) loi.matKhau = "Mật khẩu tối thiểu 8 ký tự";

  if (f.xacNhanMatKhau !== f.matKhau) loi.xacNhanMatKhau = "Mật khẩu không khớp";

  if (!f.thanhPho) loi.thanhPho = "Vui lòng chọn thành phố";

  if (!f.dongY) loi.dongY = "Bạn cần đồng ý điều khoản";

  return loi;
}

function DangKy() {
  const [form, setForm] = useState<FormDangKy>(BAN_DAU);

  const loi = kiemTra(form);                          // tính mỗi lần render
  const hopLe = Object.keys(loi).length === 0;
  // ...
}
```

`kiemTra` là một **hàm thuần**: nhận dữ liệu, trả về lỗi, không đụng gì bên ngoài. Đặt nó ngoài component — nó không cần gì của React, và có thể viết test riêng cho nó (chặng 7).

Sửa mật khẩu → `form` đổi → render lại → `kiemTra` chạy lại với dữ liệu mới → lỗi xác nhận tự hiện. Không có chỗ nào phải nhớ cập nhật.

Kiểu `Partial<Record<keyof FormDangKy, string>>` là utility type ở mục 8 file `07` chặng 3: một object có thể có khóa là bất kỳ tên trường nào, giá trị là chuỗi thông báo, và mọi khóa đều tùy chọn.

### Nhưng đừng la mắng người dùng ngay từ đầu

Nếu hiện mọi lỗi ngay khi trang tải, người dùng chưa gõ gì đã thấy sáu dòng đỏ. Trải nghiệm tệ.

Cần thêm một thông tin: **người dùng đã tương tác với trường nào chưa**. Đây **là** state thật — nó không tính được từ dữ liệu form.

```tsx
const [daCham, setDaCham] = useState<Partial<Record<keyof FormDangKy, boolean>>>({});
const [daBamGui, setDaBamGui] = useState(false);

const loi = kiemTra(form);

function hienLoi(truong: keyof FormDangKy) {
  return (daCham[truong] || daBamGui) ? loi[truong] : undefined;
}

<input
  value={form.email}
  onChange={(e) => capNhat("email", e.target.value)}
  onBlur={() => setDaCham((d) => ({ ...d, email: true }))}
/>
{hienLoi("email") && <p className="loi">{hienLoi("email")}</p>}
```

- **`onBlur`** — bắn khi rời khỏi ô. Đánh dấu "đã chạm"
- Lỗi chỉ hiện khi trường **đã được chạm** hoặc người dùng **đã bấm gửi**
- Sau khi đã chạm, lỗi cập nhật **ngay trong lúc gõ** — người dùng sửa xong là lỗi biến mất, không phải đợi rời ô lần nữa

Đây là chiến lược phổ biến và dễ chịu nhất. So sánh với bài 3 file `09` chặng 2, nơi bạn thử validate theo `input` và theo `change` để thấy khác biệt trải nghiệm.

### Gửi khi có lỗi

```tsx
function xuLyGui(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setDaBamGui(true);
  if (!hopLe) return;     // dừng — lỗi sẽ hiện vì daBamGui = true
  // ... gửi đi
}
```

Có nên **vô hiệu nút Gửi** khi form chưa hợp lệ không? Cách đó phổ biến nhưng có nhược điểm: người dùng bấm không được mà không biết vì sao. Để nút bấm được, bấm thì hiện toàn bộ lỗi, thường dễ hiểu hơn. Cả hai cách đều gặp trong thực tế.

### Validate phía client không thay thế được phía server

Người dùng có thể tắt JavaScript, sửa request bằng DevTools, hay gọi thẳng API bằng công cụ khác. Validate phía client là để **trải nghiệm tốt**, không phải để **bảo mật**. Server luôn phải kiểm tra lại. Đây là điểm hay bị hỏi trong phỏng vấn.

---

## 8. Trạng thái gửi

Gửi form thường là gọi API — bất đồng bộ (file `11`, `12` chặng 2). Trong lúc chờ có ba chuyện cần xử lý: hiện đang gửi, chặn gửi hai lần, và báo kết quả.

Nhớ mục 10 file `03` — dùng discriminated union, đừng dùng nhiều boolean:

```tsx
type TrangThaiGui =
  | { loai: "nhap" }
  | { loai: "dang-gui" }
  | { loai: "thanh-cong"; maTaiKhoan: string }
  | { loai: "loi"; thongBao: string };

const [trangThai, setTrangThai] = useState<TrangThaiGui>({ loai: "nhap" });

async function xuLyGui(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setDaBamGui(true);
  if (!hopLe || trangThai.loai === "dang-gui") return;

  setTrangThai({ loai: "dang-gui" });
  try {
    const kq = await guiDangKy(form);       // giả lập hoặc API thật
    setTrangThai({ loai: "thanh-cong", maTaiKhoan: kq.id });
  } catch (err) {
    setTrangThai({
      loai: "loi",
      thongBao: err instanceof Error ? err.message : "Đã có lỗi xảy ra",
    });
  }
}
```

```tsx
const dangGui = trangThai.loai === "dang-gui";

<fieldset disabled={dangGui}>
  {/* các ô nhập */}
</fieldset>
<button type="submit" disabled={dangGui}>
  {dangGui ? "Đang gửi..." : "Đăng ký"}
</button>
{trangThai.loai === "loi" && <p className="loi">{trangThai.thongBao}</p>}
```

- `<fieldset disabled>` vô hiệu **toàn bộ** ô bên trong bằng một thuộc tính — tiện hơn vô hiệu từng ô
- Kiểm tra `trangThai.loai === "dang-gui"` trong `xuLyGui` chặn trường hợp bấm Enter hai lần rất nhanh — nhớ mục 1 file `12` chặng 2: `POST` không idempotent, gửi hai lần có thể tạo hai tài khoản
- `err instanceof Error` — thu hẹp kiểu `unknown` trong `catch` (mục 10 file `06` chặng 3)

Nhớ mục 4 file `03` — state là ảnh chụp. Bên trong `xuLyGui`, sau `await`, biến `form` vẫn là giá trị **lúc bấm gửi**, dù người dùng có gõ thêm gì trong lúc chờ. Ở đây đó đúng là điều ta muốn: gửi đúng dữ liệu người dùng đã xác nhận.

### Đặt lại form sau khi thành công

```tsx
setForm(BAN_DAU);
setDaCham({});
setDaBamGui(false);
```

Ba dòng, dễ quên một. Cách gọn hơn — kỹ thuật ở mục 7 file `04`: tách form thành một component, đặt `key` lên nó, đổi `key` khi muốn làm mới.

```tsx
const [lanThu, setLanThu] = useState(0);

<FormDangKy key={lanThu} onThanhCong={() => setLanThu((n) => n + 1)} />
```

---

## 9. Trim ở đâu

```tsx
// ❌ Không gõ được dấu cách giữa hai từ
<input
  value={hoTen}
  onChange={(e) => setHoTen(e.target.value.trim())}
/>
```

Gõ "Nguyễn", rồi dấu cách — dấu cách bị cắt ngay. Không bao giờ gõ được "Nguyễn An".

Biến đổi trong `onChange` chạy **ở mỗi phím gõ**, khi giá trị còn dang dở. Những biến đổi chỉ có nghĩa với giá trị **hoàn chỉnh** — `trim`, chuẩn hóa khoảng trắng, chuyển sang số — làm ở lúc validate hoặc lúc gửi:

```tsx
function kiemTra(f: FormDangKy): LoiForm {
  if (f.hoTen.trim().length < 2) ...          // trim khi kiểm tra
}

async function xuLyGui() {
  await guiDangKy({ ...form, hoTen: form.hoTen.trim() });   // trim khi gửi
}
```

Biến đổi trong `onChange` chỉ dành cho những thứ **đúng ở mọi thời điểm** — viết hoa, chỉ giữ chữ số, giới hạn độ dài.

---

## 10. Nhãn và khả năng truy cập

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  value={form.email}
  onChange={(e) => capNhat("email", e.target.value)}
  aria-invalid={Boolean(hienLoi("email"))}
  aria-describedby={hienLoi("email") ? "email-loi" : undefined}
/>
{hienLoi("email") && <p id="email-loi" className="loi">{hienLoi("email")}</p>}
```

- **`<label htmlFor>`** nối nhãn với ô: bấm vào chữ "Email" là focus vào ô, và trình đọc màn hình đọc đúng tên ô. `htmlFor` vì `for` là từ khóa (mục 2 file `01`)
- **`aria-invalid`** báo cho trình đọc màn hình ô này đang có lỗi
- **`aria-describedby`** nối ô với dòng thông báo lỗi, để lỗi được đọc lên khi focus vào ô

Không có `label`, form vẫn chạy với người dùng chuột — nhưng người dùng trình đọc màn hình sẽ nghe "ô nhập văn bản, ô nhập văn bản, ô nhập văn bản" mà không biết ô nào để làm gì. Chủ đề này đi sâu ở chặng 6; thói quen viết `label` thì nên có từ bây giờ.

Một thuộc tính hữu ích nữa: `autoComplete`. `autoComplete="email"`, `"new-password"`, `"name"` giúp trình duyệt và trình quản lý mật khẩu điền đúng.

---

## 11. Hiệu năng

Controlled form render lại **cả component form** ở mỗi phím gõ. Với form vài chục trường, việc này vẫn nhanh — React chỉ chạm DOM ở ô thật sự đổi.

Với form rất lớn (hàng trăm trường, bảng nhập liệu), hoặc khi một ô gõ kéo theo tính toán nặng, nó có thể giật. Khi đó có hai hướng: tách form thành các component con để giới hạn phạm vi render lại (file `07`, `09`), hoặc dùng thư viện chuyên cho form như **React Hook Form** — nó dựa trên uncontrolled input để tránh render lại, và đi kèm **Zod** cho validate theo schema. Cả hai đều ở chặng 5.

Học controlled thuần trước không phải là đi đường vòng. Bạn cần hiểu mô hình gốc để hiểu thư viện kia đang tối ưu cái gì.

---

## 12. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Gõ không ra chữ | Có `value` mà không có `onChange` | Thêm `onChange`, hoặc dùng `defaultValue` nếu muốn uncontrolled |
| `A component is changing an uncontrolled input to be controlled` | `value` là `undefined` ở lần render đầu | `value={x ?? ""}`, hoặc khởi tạo state đủ trường |
| Ô số không xóa trống được, nhảy về `0` | `Number("")` là `0` | Lưu chuỗi trong state, chuyển sang số khi dùng |
| Cộng hai ô số ra chuỗi dính nhau | `e.target.value` luôn là chuỗi | `Number(...)` khi tính toán |
| Checkbox không đổi | Dùng `value` thay vì `checked` | `checked={x}` và `e.target.checked` |
| Bấm nút "Xóa" mà form bị gửi | `<button>` trong form mặc định là submit | `type="button"` |
| Trang tải lại khi gửi | Thiếu `preventDefault()` | `e.preventDefault()` trong `onSubmit` |
| Bấm Enter không gửi được | Gắn xử lý vào `onClick` của nút thay vì `onSubmit` của form | Dùng `onSubmit` |
| Không gõ được dấu cách | `trim()` trong `onChange` | Trim khi validate / gửi |
| Lỗi "xác nhận mật khẩu" không cập nhật khi sửa mật khẩu | Lưu lỗi thành state | Tính lỗi trong lúc render |
| Lỗi đỏ hiện ngay khi trang tải | Hiện lỗi mà không xét đã chạm chưa | State `daCham` + `onBlur` |
| Bấm gửi nhanh hai lần tạo hai bản ghi | Không chặn lúc đang gửi | Kiểm tra trạng thái `dang-gui`, vô hiệu nút |
| Form vẫn giữ dữ liệu cũ sau khi gửi xong | Quên đặt lại một trong các state | Đặt lại bằng `key` |

---

## 13. Tóm tắt cần thuộc

1. Ô input tự giữ giá trị — cùng với React state thành **hai nguồn sự thật**; phải chọn một
2. **Controlled**: `value` + `onChange`, React state là nguồn duy nhất
3. `onChange` của React bắn **mỗi ký tự** — khác sự kiện `change` của trình duyệt
4. `value` không có `onChange` → ô bị khóa; `value={undefined}` → bị coi là uncontrolled
5. `e.target.value` **luôn là chuỗi** — lưu chuỗi, chuyển sang số khi dùng
6. Checkbox dùng `checked` / `e.target.checked`; radio so sánh `checked={x === giaTri}`; `select` và `textarea` dùng `value`
7. **Uncontrolled**: `defaultValue`, đọc bằng `FormData` lúc submit — hợp với form đơn giản
8. Nhiều trường → một object state + hàm `capNhat<K extends keyof T>` có kiểu an toàn
9. Gửi bằng `onSubmit` của `<form>` + `preventDefault()`; mọi `<button>` khác ghi `type="button"`
10. **Lỗi validate tính trong lúc render** từ dữ liệu form — không lưu thành state
11. "Đã chạm" **là** state thật — dùng `onBlur` để chỉ hiện lỗi đúng lúc
12. Trạng thái gửi là discriminated union; chặn gửi trùng; `<fieldset disabled>` khóa cả form
13. `trim` và chuẩn hóa khi validate/gửi, không làm trong `onChange`
14. `label htmlFor`, `aria-invalid`, `aria-describedby`, `autoComplete`
15. Validate phía client là trải nghiệm, không phải bảo mật — server luôn kiểm tra lại

---

## Bài tập

Làm trong `bai-tap/src/bai-05/`.

### Bài 1 — Đoán hành vi

Với mỗi đoạn, ghi vào `ghi-chu.md` trước khi chạy: gõ chữ "abc" vào ô thì chuyện gì xảy ra? Console có cảnh báo gì không?

```tsx
// A
function A() {
  const [v, setV] = useState("");
  return <input value={v} />;
} -> gõ chữ không thấy ô thay đổi vì chưa có onchange và console có cảnh báo

// B
function B() {
  return <input defaultValue="xin chào" />;
} -> hiển thị abc 
// ❌ NOTE: Sai. `defaultValue` chỉ là giá trị BAN ĐẦU, ô không bị xóa khi bạn gõ.
//    Ô có sẵn "xin chào", gõ thêm thì chữ chèn vào chỗ con trỏ → thường ra "xin chàoabc".
//    Console: không cảnh báo gì (uncontrolled hợp lệ).

// C
function C() {
  const [v, setV] = useState<string>();
  return <input value={v} onChange={(e) => setV(e.target.value)} />;
} -> hiển thị abc
// ⚠️ NOTE: Hiển thị đúng, nhưng thiếu phần Console. `useState<string>()` → v ban đầu là `undefined`
//    → React coi `value={undefined}` là uncontrolled. Gõ chữ đầu tiên v thành chuỗi → controlled.
//    Console: "A component is changing an uncontrolled input to be controlled" (xem mục 4).

// D
function D() {
  const [v, setV] = useState("");
  return <input value={v} onChange={(e) => setV(e.target.value.toUpperCase())} />;
} -> hiển thị ABC

// E
function E() {
  const [v, setV] = useState("");
  return <input value={v} onChange={(e) => setV(e.target.value.slice(0, 5))} />;
} -> hiển thị abc nếu nhập thêm hiển thị tối đa 5 phần tử

// F
function F() {
  const [v, setV] = useState("");
  return <input value={v} onChange={() => setV("cố định")} />;
} -> hiển thị cố định

// G — gõ "Nguyễn An"
function G() {
  const [v, setV] = useState("");
  return <input value={v} onChange={(e) => setV(e.target.value.trim())} />;
} -> gõ dấu cách nhưng mãi không thấy input thêm dấu cách
// ✅ NOTE: Đúng. Nên ghi rõ kết quả cuối: ô hiện "NguyễnAn". Lý do: lúc gõ dấu cách, nó đang ở
//    CUỐI chuỗi ("Nguyễn ") nên `trim()` cắt mất ngay (mục 9). Không có cảnh báo Console.

// H — gõ "12", rồi xóa hết bằng Backspace
function H() {
  const [n, setN] = useState(0);
  const [n, setN] = useState(""); -> sửa
  return (
    <>
      <input type="number" value={n} onChange={(e) => setN(Number(e.target.value))} />
      <p>{n * 2}</p>

      <input type="number" value={n} onChange={(e) => setN(e.target.value)} /> -> sửa
      <p>{Number(n) * 2}</p> -> sửa
    </>
  );
} -> Hiển thị 12, p hiển thị 24 sau khi xóa hiển thị 0, p cũng hiển thị 0 -> bản sửa sửa thẳng vào H rồi
// ⚠️ NOTE (phần đoán): gần đúng, nhưng thiếu bước giữa và thiếu "giải thích kỹ" như đề yêu cầu:
//    "12" → p 24; Backspace lần 1 → "1" → p 2; Backspace lần 2 → e.target.value = "" → Number("") = 0
//    → state 0 → ô hiện lại "0". Tức là KHÔNG BAO GIỜ xóa trống được ô. Thêm nữa state 0 không
//    phân biệt được "người dùng nhập 0" với "chưa nhập gì" → đây mới là ý chính cần giải thích (mục 3).
// ❌ NOTE (bản sửa): ý tưởng đúng (lưu chuỗi, Number() khi dùng) nhưng cách viết đang lỗi:
//    1. Hai dòng `const [n, setN]` cùng một scope → lỗi "Cannot redeclare block-scoped variable".
//    2. Ô input cũ vẫn còn `setN(Number(...))` → khi n là string thì TypeScript báo lỗi kiểu.
//    → Viết bản sửa thành một component RIÊNG (vd `function HSua()`), chỉ giữ code mới, bỏ code cũ.
//    3. Nghĩ thêm: khi ô trống, `Number("") * 2` vẫn ra 0 ở thẻ <p>. Có muốn <p> hiện gì khác
//       (để trống / "chưa nhập") khi n === "" không?

// I — bấm nút "Xóa"
function I() {
  const [v, setV] = useState("abc");
  return (
    <form onSubmit={(e) => { e.preventDefault(); alert("Đã gửi: " + v); }}>
      <input value={v} onChange={(e) => setV(e.target.value)} />
      <button onClick={() => setV("")}>Xóa</button>

      <button type="button" onClick={() => setV("")}>Xóa</button> -> sửa
    </form>
  );
} -> hiển thị thông báo Đã gửi: , không có nội dung
// ⚠️ NOTE (phần đoán): ý chính đúng — form BỊ GỬI dù chỉ bấm "Xóa". Nhưng thiếu giải thích:
//    `<button>` trong `<form>` không ghi `type` thì mặc định là `type="submit"` (mục 6). Thứ tự:
//    onClick chạy (setV("")) → trình duyệt bắn submit → onSubmit chạy → alert.
//    Còn alert hiện "Đã gửi: " (rỗng) hay "Đã gửi: abc" thì phụ thuộc React đã render lại kịp
//    giữa click và submit chưa (liên quan "state là ảnh chụp", mục 4 file 03) → hãy CHẠY THỬ
//    để xác nhận rồi ghi lại kết quả thật, đừng chỉ đoán.
// ❌ NOTE (bản sửa): `type="button"` là đúng, nhưng bạn đang để CẢ HAI nút trong form →
//    nút cũ vẫn còn bug. Viết bản sửa thành component riêng (vd `function ISua()`), chỉ có nút mới.
//    Và theo quy tắc mục 6, nên thêm một nút `type="submit"` rõ ràng nếu form cần nút gửi.
```

> 📝 **NOTE chung bài 1:**
> - Đề yêu cầu ghi vào `bai-tap/src/bai-05/ghi-chu.md` — hiện thư mục `bai-05` chưa có file này. Nên chuyển phần trả lời sang đó để file bài học giữ sạch.
> - Mỗi câu đề hỏi **hai** thứ: (1) gõ "abc" thì ra gì, (2) Console có cảnh báo không. Nhiều câu bạn mới trả lời (1) — ghi thêm "Console: không có gì" hoặc tên cảnh báo cho đủ.
> - A, D, E, F, G: đúng. B: sai. C: thiếu cảnh báo. H, I: đoán gần đúng nhưng thiếu giải thích kỹ, và bản sửa đang viết chồng lên code cũ.

Câu H và I là hai bẫy thực tế nhất — giải thích kỹ và viết bản sửa.

### Bài 2 — Ô nhập đặc biệt

Viết các component nhỏ, mỗi cái một controlled input:

1. **`OSoDienThoai`** — chỉ giữ chữ số, tối đa 10 số, hiển thị theo dạng `0901 234 567` (định dạng **trong lúc render** từ chuỗi số thuần; state chỉ lưu số thuần)
2. **`OTien`** — người dùng gõ số, ô hiển thị có dấu chấm ngăn cách hàng nghìn (`1.500.000`). State lưu chuỗi số thuần. Bên dưới hiện giá trị dạng số thật để kiểm chứng
3. **`ODemKyTu`** — `textarea` tối đa 200 ký tự, hiện "x / 200", đổi màu đỏ khi còn dưới 20 ký tự. Bộ đếm tính trong lúc render -> tôi skip đổi màu bạn làm đi
4. **`OMatKhau`** — có nút "Hiện/Ẩn" đổi `type` giữa `password` và `text`; thanh độ mạnh mật khẩu (yếu / trung bình / mạnh) **tính trong lúc render** theo độ dài, có chữ hoa, có số, có ký tự đặc biệt -> tôi skip thanh độ mạnh bạn làm đi
5. **`ChonNhieu`** — danh sách 6 sở thích dạng checkbox, state là mảng các giá trị đã chọn. Nút "Chọn tất cả" / "Bỏ chọn tất cả". Cập nhật mảng bất biến (bảng mục 8 file `03`)

Với số 2, ghi vào `ghi-chu.md`: khi định dạng lại số trong lúc gõ, con trỏ có bị nhảy về cuối ô không? Đây là một vấn đề thật của controlled input có biến đổi định dạng — không cần sửa, chỉ cần quan sát và mô tả.

### Bài 3 — Form đăng ký (bài chính)

Xây form đăng ký đầy đủ theo mục 5–10:

**Trường**
- Họ tên, email, số điện thoại (dùng lại `OSoDienThoai`), mật khẩu, xác nhận mật khẩu (dùng lại `OMatKhau`)
- Ngày sinh (`type="date"`)
- Giới tính (radio, ba lựa chọn)
- Thành phố (select)
- Sở thích (dùng lại `ChonNhieu`)
- Đồng ý điều khoản (checkbox)

**Quy tắc validate** — hàm `kiemTra` thuần, đặt ngoài component:
- Họ tên: tối thiểu 2 ký tự sau khi trim, chỉ chứa chữ và khoảng trắng
- Email: đúng định dạng
- Số điện thoại: đúng 10 số, bắt đầu bằng `0`
- Mật khẩu: tối thiểu 8 ký tự, có ít nhất một chữ hoa và một số
- Xác nhận: khớp mật khẩu
- Ngày sinh: phải đủ 16 tuổi
- Thành phố: bắt buộc chọn
- Sở thích: chọn ít nhất 1, nhiều nhất 3
- Điều khoản: bắt buộc

**Hành vi**
- Lỗi chỉ hiện sau khi chạm vào trường hoặc sau khi bấm gửi
- Sau khi đã chạm, lỗi cập nhật ngay trong lúc gõ
- Gửi giả lập: hàm `guiDangKy` trả về Promise, đợi 1,5 giây, ngẫu nhiên 30% thất bại với thông báo "Email đã được sử dụng"
- Trạng thái gửi là discriminated union
- Trong lúc gửi: toàn bộ form bị khóa bằng `<fieldset disabled>`, nút hiện "Đang gửi..."
- Thành công: hiện màn hình chào mừng có tên người dùng và nút "Đăng ký tài khoản khác" — bấm vào thì form được làm mới hoàn toàn bằng `key`
- Thất bại: hiện lỗi, form vẫn giữ dữ liệu để sửa
- Chặn gửi trùng — bấm Enter liên tục ba lần chỉ gửi một lần (thêm `console.log` trong `guiDangKy` để đếm)

**Ràng buộc**
- Một `useState` cho dữ liệu form, không phải mười cái
- **Không có state nào lưu lỗi**
- Mọi trường có `label` nối bằng `htmlFor`, ô lỗi có `aria-invalid` và `aria-describedby`
- Mọi `<button>` ghi rõ `type`
- `trim` chỉ xuất hiện trong `kiemTra` và lúc gửi

**Tự kiểm tra**

| Thử nghiệm | Kết quả mong đợi |
|---|---|
| Tải trang | Không có lỗi đỏ nào |
| Bấm vào ô email rồi bấm ra ngoài | Hiện lỗi email, các ô khác vẫn sạch |
| Gõ mật khẩu, gõ xác nhận khớp, rồi sửa mật khẩu | Lỗi "không khớp" tự hiện ở ô xác nhận |
| Bấm Gửi khi form trống | Mọi lỗi hiện ra cùng lúc |
| Gõ "Nguyễn Văn An" | Gõ được dấu cách bình thường |
| Bấm Enter ba lần liên tiếp khi form hợp lệ | Console chỉ ghi nhận một lần gửi |
| Bấm vào chữ "Email" | Ô email được focus |

### Bài 4 — Todo app có ô nhập thật

Lấy danh sách việc ở bài 3 file `03`, thay dãy nút gợi ý bằng ô nhập thật:

1. Form thêm việc: controlled input + `onSubmit`. Không cho thêm chuỗi rỗng hoặc toàn khoảng trắng. Thêm xong thì ô trống lại và **vẫn giữ focus** (gợi ý: form submit không làm mất focus nếu bạn không làm gì; kiểm tra xem có đúng vậy không)
2. **Sửa tại chỗ**: bấm nút sửa, dòng đó thành ô input với nội dung hiện tại. Enter để lưu, Escape để hủy (bắt `onKeyDown`, kiểm tra `e.key`). Sửa thành rỗng thì hủy. Gợi ý: state `idDangSua: string | null` ở danh sách, và một state `banNhap` cho nội dung đang sửa
3. Ô tìm kiếm lọc danh sách theo nội dung — danh sách hiển thị tính trong lúc render
4. Ghi vào `ghi-chu.md`: so với bản sửa tại chỗ của todo app ở file `09` chặng 2, cái nào ít code hơn? Cái nào dễ đọc hơn?

### Bài 5 — Pokédex có ô tìm kiếm

Cập nhật Pokédex:

1. Thay dãy nút gợi ý bằng ô tìm kiếm controlled thật
2. Thêm bộ lọc dạng `select` cho loại, và dạng checkbox "Chỉ hiện yêu thích"
3. Thêm thanh trượt (`type="range"`) lọc theo HP tối thiểu
4. Nút "Xóa bộ lọc" đặt lại mọi thứ — nhớ `type="button"` nếu nó nằm trong form
5. Mọi bộ lọc là state; danh sách hiển thị tính trong lúc render — kiểm tra lại không có state `dsDaLoc`
6. Gõ vào ô tìm kiếm đang lọc ngay mỗi ký tự. Đó là ổn với dữ liệu giả. Ghi vào `ghi-chu.md`: khi chuyển sang gọi API thật, vì sao lọc mỗi ký tự lại thành vấn đề? (Nhớ debounce ở file `05` chặng 2 — file `06` và `10` sẽ giải quyết.)

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Controlled và uncontrolled input khác nhau ra sao? Khi nào chọn cái nào?
2. Vì sao có `value` mà không có `onChange` thì ô bị khóa?
3. Vì sao lỗi validate không nên lưu thành state? Cho một kịch bản bug nếu làm vậy.
4. Vì sao "đã chạm" lại là state, còn lỗi thì không?
5. Vì sao không nên `trim` trong `onChange`?
6. Vì sao validate phía client không đủ để bảo vệ dữ liệu?

---

## Xong file này khi

- [ ] Bài 1 có phần đoán viết trước, sửa được câu H và I
- [ ] Năm ô nhập ở bài 2 hoạt động, đã quan sát và mô tả vấn đề con trỏ ở `OTien`
- [ ] Form đăng ký đạt cả 7 thử nghiệm; không có state nào lưu lỗi
- [ ] Todo app thêm và sửa tại chỗ được bằng ô nhập thật
- [ ] Pokédex có ô tìm kiếm, select, checkbox, thanh trượt; danh sách vẫn tính trong lúc render
- [ ] Trả lời được 6 câu ở bài 6 bằng lời

**Hết khối B.** Bạn đã có đủ công cụ để xây giao diện tương tác hoàn chỉnh: state, danh sách, form. Nhưng mọi thứ vẫn nằm trong bộ nhớ — tải lại trang là mất, và dữ liệu vẫn là dữ liệu giả. Khối C bắt đầu với `useEffect`: cách để component "nói chuyện" với thế giới bên ngoài — `localStorage`, API, timer. Và cũng là Hook bị dùng sai nhiều nhất trong React.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-05`, kèm **"viết file 06-useeffect"**.