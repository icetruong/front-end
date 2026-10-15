# 03 — `useState`

> **Cần có trước:** xong `01`, `02`. Nhớ chắc file `01` chặng 2 (tham trị, tham chiếu), `03` (spread), `04` (method mảng — bảng sửa gốc/trả mới), `05` (closure).
> **Thời gian:** 5 giờ.
> **Vì sao quan trọng:** đây là file làm giao diện "sống". Và cũng là file mà luật bất biến bạn học từ chặng 2 chuyển từ "thói quen tốt" thành **bắt buộc** — vi phạm là giao diện không cập nhật. Mục 4 (state là ảnh chụp) là chỗ người mới hiểu sai nhiều nhất trong cả React.

---

## 1. Vì sao biến thường không đủ

```tsx
export default function BoDem() {
  let dem = 0;

  function tang() {
    dem = dem + 1;
    console.log(dem);
  }

  return (
    <div>
      <p>Đếm: {dem}</p>
      <button onClick={tang}>+1</button>
    </div>
  );
}
```

Bấm nút: Console in `1`, `1`, `1`... Màn hình vẫn đứng ở `0`.

Hai vấn đề chồng lên nhau:

**1. Không ai bảo React vẽ lại.** Đổi một biến JavaScript không làm React biết gì cả. Nhớ file `00`: bạn không tự gọi `render()`. Nhưng React cũng không tự theo dõi mọi biến của bạn. Phải có một cách để nói *"dữ liệu đổi rồi, vẽ lại đi"*.

**2. Biến cục bộ bị tạo lại mỗi lần render.** Kể cả nếu React có vẽ lại, nó làm vậy bằng cách **gọi lại hàm `BoDem`** từ đầu. Dòng `let dem = 0` chạy lại, `dem` lại về `0`. Đó là lý do Console luôn in `1`: mỗi lần bấm, `dem` vẫn đang là `0` của lần render đầu rồi tăng lên `1`.

Vậy ta cần hai thứ:

1. Một giá trị **được nhớ** giữa các lần gọi hàm component
2. Một cách cập nhật giá trị đó mà **báo cho React vẽ lại**

`useState` cung cấp đúng hai thứ đó.

---

## 2. `useState`

```tsx
import { useState } from "react";

export default function BoDem() {
  const [dem, setDem] = useState(0);

  return (
    <div>
      <p>Đếm: {dem}</p>
      <button onClick={() => setDem(dem + 1)}>+1</button>
    </div>
  );
}
```

Đọc từng phần:

- **`useState(0)`** — khai báo một biến state, giá trị ban đầu là `0`
- Nó trả về một **tuple** hai phần tử (mục 5 file `06` chặng 3)
  - `dem` — giá trị **hiện tại**
  - `setDem` — **hàm** để cập nhật giá trị đó và kích hoạt render lại
- `const [dem, setDem] = ...` là destructuring mảng (mục 3.3 file `03` chặng 2) — bạn tự đặt tên. Quy ước: `[x, setX]`

### Chuyện gì xảy ra khi bấm nút

1. Lần render đầu: React gọi `BoDem()`. `useState(0)` trả về `[0, setDem]`. Màn hình hiện `0`
2. Bấm nút: `setDem(0 + 1)` được gọi
3. React **ghi nhớ** giá trị mới là `1`, rồi **lên lịch** render lại `BoDem`
4. React gọi lại `BoDem()`. Lần này `useState(0)` **bỏ qua** số `0` và trả về `[1, setDem]`
5. JSX mới có `1`. React so sánh với lần trước, thấy chỉ chữ số đổi, cập nhật đúng chỗ đó trên DOM

Bước 4 là chìa khóa: **giá trị ban đầu chỉ dùng ở lần render đầu tiên**. Từ lần thứ hai trở đi, `useState` trả về giá trị React đã nhớ.

### State thuộc về từng component riêng

```tsx
function App() {
  return (
    <>
      <BoDem />
      <BoDem />
    </>
  );
}
```

Hai bộ đếm hoàn toàn độc lập. Bấm cái này, cái kia không đổi.

Nhớ bài 2 file `05` chặng 2: gọi `taoBoDem()` hai lần cho hai bộ đếm riêng, mỗi cái có biến `dem` riêng trong closure. State của React hoạt động theo cùng tinh thần: mỗi **lần xuất hiện** của một component trên cây có một bộ nhớ riêng.

Mở React DevTools, chọn từng `BoDem` — mỗi cái có giá trị state riêng.

---

## 3. Luật của Hook

`useState` là một **Hook**. Mọi hàm bắt đầu bằng `use` trong React đều là Hook: `useState`, `useEffect`, `useRef`... Chúng có hai luật cứng:

**Luật 1 — Chỉ gọi Hook ở cấp cao nhất của component.** Không gọi trong `if`, vòng lặp, hàm lồng bên trong, hay sau một lệnh `return` sớm.

**Luật 2 — Chỉ gọi Hook trong component React** (hoặc trong custom hook — file `10`). Không gọi trong hàm JavaScript thường.

```tsx
function SaiLam({ coTen }: { coTen: boolean }) {
  if (coTen) {
    const [ten, setTen] = useState("");     // ❌ trong if
  }

  for (let i = 0; i < 3; i++) {
    const [x, setX] = useState(0);           // ❌ trong vòng lặp
  }

  function xuLy() {
    const [y, setY] = useState(0);           // ❌ trong hàm lồng
  }

  if (!coTen) return null;
  const [z, setZ] = useState(0);             // ❌ sau return sớm
  // ...
}
```

### Vì sao có luật kỳ lạ này

Bạn gọi `useState(0)` mà không đưa cho nó tên gì cả. Vậy React làm sao biết lần gọi này ứng với state nào?

Câu trả lời: **theo thứ tự**. Mỗi component có một danh sách ô nhớ. Lần gọi Hook thứ nhất lấy ô số 1, lần thứ hai lấy ô số 2...

```tsx
function HoSo() {
  const [ten, setTen] = useState("An");       // ô 1
  const [tuoi, setTuoi] = useState(22);        // ô 2
  const [vip, setVip] = useState(false);       // ô 3
  // ...
}
```

Giờ hình dung `ten` nằm trong một `if`, và ở lần render thứ hai điều kiện đó sai:

```
Lần 1:  ten → ô 1,  tuoi → ô 2,  vip → ô 3
Lần 2:  (bỏ qua ten)  tuoi → ô 1 ← nhận giá trị "An"!   vip → ô 2 ← nhận 22!
```

Mọi thứ lệch đi một nhịp. `tuoi` nhận chuỗi `"An"`, `vip` nhận số `22`. Ứng dụng hỏng theo cách cực kỳ khó hiểu.

Thứ tự gọi Hook phải **giống hệt nhau** ở mọi lần render. Luật 1 đảm bảo điều đó.

Bạn không cần tự nhớ luật này: plugin `eslint-plugin-react-hooks` mà Vite cài sẵn (mục 10 file `00`) báo lỗi ngay khi bạn vi phạm. Đừng tắt nó.

Muốn có state "có điều kiện" thì khai báo state ở cấp cao nhất như thường, và để **giá trị** của nó phụ thuộc điều kiện — hoặc tách phần có điều kiện ra một component riêng.

---

## 4. State là một ảnh chụp

**Đây là mục quan trọng nhất của file.** Đọc chậm.

```tsx
export default function BoDem() {
  const [dem, setDem] = useState(0);

  function tangBa() {
    setDem(dem + 1);
    setDem(dem + 1);
    setDem(dem + 1);
  }

  return (
    <>
      <p>{dem}</p>
      <button onClick={tangBa}>+3</button>
    </>
  );
}
```

Bấm nút. Bạn mong đợi `3`. Màn hình hiện `1`.

### Vì sao

Trong **một lần render**, `dem` là một **hằng số**. Nó được khai báo bằng `const`. Nó không đổi cho tới hết lần render đó.

Ở lần render đầu, `dem` là `0`. Hàm `tangBa` được tạo ra **trong** lần render đó, nên khi nhìn vào `dem` nó thấy `0`. Ba dòng kia thực chất là:

```tsx
setDem(0 + 1);
setDem(0 + 1);
setDem(0 + 1);
```

Ba lần yêu cầu "đặt thành `1`". Kết quả: `1`.

### `setDem` không đổi biến `dem`

```tsx
function xuLy() {
  setDem(dem + 1);
  console.log(dem);   // vẫn là giá trị CŨ
}
```

`setDem` không sửa biến `dem` đang đứng trước mắt bạn. Nó yêu cầu React tạo ra một **lần render mới**, và **ở lần render mới đó**, `dem` sẽ là một hằng số khác.

Hình dung mỗi lần render là một **bức ảnh chụp**: props, state, các hàm xử lý sự kiện — tất cả đều được chụp cùng một lúc, cố định trong bức ảnh đó. Gọi `setDem` không sửa bức ảnh hiện tại; nó yêu cầu React chụp một bức mới.

### Kết nối với closure

```tsx
function xuLy() {
  setDem(dem + 5);
  setTimeout(() => {
    alert(dem);    // hiện gì?
  }, 3000);
}
```

Bấm khi `dem` là `0`. Ba giây sau, dù màn hình đã hiện `5` từ lâu, `alert` vẫn hiện **`0`**.

Đây chính là **closure** ở file `05` chặng 2. Hàm callback của `setTimeout` được tạo ra trong lần render mà `dem = 0`, nên nó giữ tham chiếu tới biến `dem` **của lần render đó**. Mỗi lần render có một biến `dem` riêng; callback cũ không bao giờ nhìn thấy biến của lần render mới.

Và đây chính là **stale closure** mà mục 8 file `05` chặng 2 đã cảnh báo trước: *"Một callback được tạo ở lần render thứ 1 sẽ mãi mãi nhìn thấy state của lần render thứ 1."* Giờ bạn đã thấy nó thật.

Có phải là bug không? Không — đây là thiết kế có chủ đích. Hình dung bạn gửi tin nhắn với nội dung đang gõ, nhưng trong lúc chờ gửi bạn đã đổi người nhận. Bạn muốn tin nhắn đến người **lúc bấm gửi**, không phải người đang chọn hiện tại. Ảnh chụp giúp mỗi sự kiện hành xử nhất quán với những gì người dùng thấy **lúc nó xảy ra**.

---

## 5. Cập nhật theo hàm

Vậy làm sao tăng đúng 3?

```tsx
function tangBa() {
  setDem((d) => d + 1);
  setDem((d) => d + 1);
  setDem((d) => d + 1);
}
```

Bây giờ màn hình hiện `3`.

Thay vì truyền **giá trị** mới, bạn truyền một **hàm** nhận giá trị trước đó và trả về giá trị mới. Gọi là **updater function**.

### Cách React xử lý

Mỗi lời gọi `setDem` được đưa vào một **hàng đợi**. Đến lần render tiếp theo, React chạy qua hàng đợi theo thứ tự:

| Trong hàng đợi | `d` nhận vào | Trả về |
|---|---|---|
| `d => d + 1` | 0 | 1 |
| `d => d + 1` | 1 | 2 |
| `d => d + 1` | 2 | 3 |

Mỗi updater nhận kết quả của updater trước. Giống hệt `reduce` ở mục 8 file `04` chặng 2.

So với cách truyền giá trị:

| Trong hàng đợi | Kết quả |
|---|---|
| "thay bằng 1" | 1 |
| "thay bằng 1" | 1 |
| "thay bằng 1" | 1 |

Và trộn lẫn hai kiểu:

```tsx
setDem(dem + 5);         // "thay bằng 5"      → 5
setDem((d) => d + 1);    // "lấy cái trước + 1" → 6
setDem(42);              // "thay bằng 42"     → 42
```

### Khi nào dùng cách nào

- Giá trị mới **phụ thuộc** giá trị cũ → **updater** (`d => d + 1`)
- Giá trị mới **không liên quan** giá trị cũ → giá trị thường (`setTen("An")`, `setMo(false)`)

Một số đội ngũ dùng updater mọi lúc khi phụ thuộc giá trị cũ, kể cả khi chỉ gọi một lần — để không bao giờ phải nghĩ xem có đang bị ảnh chụp cũ hay không. Đó là thói quen tốt, và sẽ cứu bạn khỏi bug stale closure ở file `06`.

Quy ước đặt tên tham số: chữ cái đầu của tên state (`d` cho `dem`), hoặc `truoc` (trong code tiếng Anh thường là `prev`).

**Updater phải thuần.** React có thể gọi nó hai lần trong `StrictMode` để kiểm tra. Đừng gọi API hay sửa gì bên ngoài trong updater.

---

## 6. Batching và khi nào React render lại

### Batching

Ba lời gọi `setDem` ở mục 5 chỉ gây ra **một** lần render, không phải ba. React gom mọi cập nhật trong cùng một lượt xử lý sự kiện lại, chờ hàm xử lý chạy xong, rồi mới render một lần.

Giống người phục vụ nhà hàng: không chạy vào bếp sau mỗi món bạn gọi, mà chờ bạn gọi xong cả bàn rồi mới đi.

Từ React 18, batching áp dụng **ở mọi nơi**: trong sự kiện, trong `setTimeout`, trong `.then()` của Promise. Bạn sẽ thấy tài liệu cũ nói batching chỉ áp dụng cho sự kiện — điều đó không còn đúng.

### Ba lý do một component render lại

1. **Lần đầu** xuất hiện trên màn hình
2. **State của chính nó** thay đổi
3. **Component cha render lại** — mặc định, mọi con của nó cũng render lại

Lý do 3 hay gây bất ngờ. Bật "Highlight updates" trong DevTools (mục 9 file `00`) và quan sát. Nó **không** có nghĩa là DOM của mọi con đều bị sửa — React chỉ gọi lại hàm, so sánh kết quả, và chỉ chạm DOM ở chỗ thật sự khác. Tối ưu chuyện này là nội dung file `09`.

Chú ý: **props đổi không phải là lý do riêng**. Props của con chỉ đổi khi cha render lại — tức là lý do 3.

### Đặt cùng giá trị thì không render

```tsx
setDem(dem);   // giá trị không đổi
```

React so sánh giá trị mới với giá trị cũ bằng `Object.is` — gần giống `===`. Nếu bằng nhau, React bỏ qua việc render lại.

Chi tiết nhỏ này chính là lý do của mục 7.

---

## 7. Object trong state — bất biến là bắt buộc

```tsx
const [user, setUser] = useState({ ten: "An", tuoi: 22 });

function tangTuoi() {
  user.tuoi = user.tuoi + 1;   // sửa trực tiếp
  setUser(user);
}
```

Bấm nút. Không có gì xảy ra.

### Vì sao

Nhớ file `01` chặng 2: object được lưu theo **tham chiếu**. `user.tuoi = ...` sửa **nội dung** của object, nhưng `user` vẫn trỏ vào **cùng một object**.

Rồi `setUser(user)` — React so sánh `Object.is(cũ, mới)`. Cùng một tham chiếu → `true` → "không có gì thay đổi" → không render.

Bạn đã sửa dữ liệu, nhưng React không hề biết.

### Cách đúng — tạo object mới

```tsx
function tangTuoi() {
  setUser({ ...user, tuoi: user.tuoi + 1 });
}

// Hoặc với updater
function tangTuoi() {
  setUser((u) => ({ ...u, tuoi: u.tuoi + 1 }));
}
```

Spread tạo ra object **mới** (mục 4.2 file `03` chặng 2). Tham chiếu mới → React thấy khác → render lại.

Đây là lý do mình nói ở file `01` chặng 2: *"Nguyên tắc này... React dựa hoàn toàn vào nó để biết khi nào cần render lại. Ở chặng 4 bạn sẽ gặp lại nguyên tắc này mỗi ngày."* Hôm nay là ngày đó.

**Quy tắc: coi mọi object và mảng trong state là chỉ đọc.** Muốn đổi thì thay bằng bản mới.

### Object lồng nhau

Nhớ mục 4.3 file `03` chặng 2 — spread chỉ sao chép **một tầng**:

```tsx
const [hoSo, setHoSo] = useState({
  ten: "An",
  diaChi: { thanhPho: "HCM", quan: "1" },
});

// ❌ Sai — sửa object lồng bên trong
hoSo.diaChi.thanhPho = "Hà Nội";
setHoSo({ ...hoSo });   // object ngoài mới, nhưng diaChi vẫn là object cũ đã bị sửa

// ✓ Đúng — trải từng tầng
setHoSo({
  ...hoSo,
  diaChi: { ...hoSo.diaChi, thanhPho: "Hà Nội" },
});
```

Dòng "sai" ở trên đôi khi **trông như** chạy được, vì object ngoài là mới nên React vẫn render lại. Nhưng nó đã sửa ngầm object cũ — mọi nơi khác đang giữ tham chiếu tới `diaChi` cũ (ví dụ lịch sử để hoàn tác) đều bị hỏng theo. Bug kiểu này rất khó tìm.

Nếu bạn thấy mình trải ba, bốn tầng lồng nhau, đó là dấu hiệu cấu trúc state quá sâu. Mục 10 nói cách làm phẳng nó.

### Gom state hay tách state

```tsx
// Tách — mỗi giá trị một state
const [ten, setTen] = useState("");
const [email, setEmail] = useState("");

// Gom — một object
const [form, setForm] = useState({ ten: "", email: "" });
setForm({ ...form, email: "moi@x.com" });
```

Cả hai đều đúng. Gom khi các giá trị **luôn thay đổi cùng nhau** (ví dụ tọa độ `x`, `y`; dữ liệu của một form). Tách khi chúng độc lập. Khi phân vân, tách — đơn giản hơn.

---

## 8. Mảng trong state

Cùng nguyên tắc: không sửa mảng gốc, luôn tạo mảng mới.

Đây là lúc bảng ở mục 12 file `04` chặng 2 phát huy tác dụng:

| Muốn | ❌ Tránh (sửa gốc) | ✓ Dùng (trả mảng mới) |
|---|---|---|
| Thêm | `push`, `unshift` | `[...arr, moi]`, `[moi, ...arr]` |
| Xóa | `pop`, `shift`, `splice` | `filter` |
| Sửa một phần tử | `arr[i] = x` | `map` |
| Chèn ở giữa | `splice` | `[...arr.slice(0, i), moi, ...arr.slice(i)]` |
| Sắp xếp | `sort` | `toSorted`, hoặc `[...arr].sort()` |
| Đảo ngược | `reverse` | `toReversed`, hoặc `[...arr].reverse()` |

```tsx
type Viec = { id: number; noiDung: string; daXong: boolean };

const [ds, setDs] = useState<Viec[]>([]);

// Thêm
function them(noiDung: string) {
  setDs((d) => [...d, { id: Date.now(), noiDung, daXong: false }]);
}

// Xóa
function xoa(id: number) {
  setDs((d) => d.filter((v) => v.id !== id));
}

// Bật/tắt hoàn thành — sửa MỘT phần tử
function batTat(id: number) {
  setDs((d) =>
    d.map((v) => (v.id === id ? { ...v, daXong: !v.daXong } : v)),
  );
}

// Sắp xếp
function sapXep() {
  setDs((d) => d.toSorted((a, b) => a.noiDung.localeCompare(b.noiDung, "vi")));
}
```

Mẫu `batTat` là mẫu bạn sẽ viết nhiều nhất trong React. Nó chính là mẫu cập nhật state lồng ở mục 4.3 file `03` chặng 2 — mình đã nói lúc đó *"Bạn sẽ viết nó rất nhiều ở chặng 4–5. Đọc kỹ và tự viết lại một lần."* Hai chi tiết:

- `map` tạo mảng mới — mảng ngoài có tham chiếu mới
- `{ ...v, daXong: !v.daXong }` tạo object mới **chỉ cho phần tử bị sửa**; các phần tử khác giữ nguyên tham chiếu cũ. Điều này quan trọng cho tối ưu ở file `09`

### Bẫy: sửa object bên trong mảng đã sao chép

```tsx
// ❌ Sai
setDs((d) => {
  const banSao = [...d];
  banSao[0].daXong = true;   // banSao là mảng mới, NHƯNG banSao[0] vẫn là object cũ
  return banSao;
});
```

Spread mảng chỉ sao chép **danh sách tham chiếu**, không sao chép các object bên trong. Sửa `banSao[0]` là sửa object mà mảng cũ cũng đang trỏ vào. Lại là chuyện sao chép một tầng.

### Về `id`

`Date.now()` làm `id` ở trên là cách tạm cho bài tập — hai lần thêm trong cùng một mili giây sẽ trùng. Trình duyệt hiện đại có `crypto.randomUUID()` cho ra chuỗi duy nhất. Dữ liệu thật thì thường dùng `id` do server cấp. File `04` nói kỹ vì sao `id` ổn định lại quan trọng.

---

## 9. Khởi tạo lười

```tsx
function DanhSachViec() {
  const [ds, setDs] = useState(docTuLocalStorage());   // ⚠
  // ...
}
```

Nhìn có vẻ ổn. Nhưng nhớ mục 2: giá trị ban đầu **chỉ dùng ở lần render đầu**, các lần sau bị bỏ qua. Vậy mà `docTuLocalStorage()` vẫn **được gọi ở mọi lần render** — vì JavaScript tính đối số trước khi gọi hàm. Đọc và `JSON.parse` lại toàn bộ dữ liệu mỗi lần bạn gõ một phím, rồi vứt kết quả đi.

```tsx
const [ds, setDs] = useState(() => docTuLocalStorage());   // ✓
// hoặc
const [ds, setDs] = useState(docTuLocalStorage);            // ✓ truyền hàm, không gọi
```

Truyền một **hàm** thay vì giá trị, React chỉ gọi hàm đó **một lần** ở lần render đầu.

Cùng cái bẫy với `onClick={fn()}` ở mục 8 file `01`: phân biệt **truyền hàm** và **gọi hàm**.

Dùng khởi tạo lười khi giá trị ban đầu cần tính toán tốn kém: đọc `localStorage`, phân tích dữ liệu lớn, tạo mảng nhiều phần tử. Với giá trị đơn giản như `0`, `""`, `[]` thì không cần.

---

## 10. Thiết kế cấu trúc state

Viết `useState` thì dễ. Quyết định **cái gì** nên là state mới khó. Đây là kỹ năng tạo khác biệt giữa code React dễ bảo trì và code React đầy bug đồng bộ.

### Nguyên tắc 1 — Không lưu thứ tính được

```tsx
// ❌
const [ds, setDs] = useState<Viec[]>([]);
const [soChuaXong, setSoChuaXong] = useState(0);

function batTat(id: number) {
  setDs(/* ... */);
  setSoChuaXong(/* phải nhớ tính lại */);   // quên một lần là lệch
}
```

`soChuaXong` hoàn toàn **suy ra được** từ `ds`. Lưu nó thành state riêng nghĩa là bạn có hai nguồn sự thật, và phải nhớ cập nhật cả hai ở **mọi** chỗ thay đổi `ds`. Quên một lần là màn hình hiện số sai.

```tsx
// ✓ Tính ngay trong lúc render
const [ds, setDs] = useState<Viec[]>([]);
const soChuaXong = ds.filter((v) => !v.daXong).length;
```

Mỗi lần `ds` đổi → component render lại → `soChuaXong` được tính lại → luôn đúng. Nhớ công thức `UI = f(state)`: những gì suy ra được từ state thì cứ suy ra trong lúc render.

Đây là lỗi thiết kế phổ biến nhất của người mới học React, nên mình nhắc lại: **nếu một giá trị tính được từ props hoặc state khác, nó không nên là state.**

Ví dụ khác cùng loại:

```tsx
// ❌ Ba state cho thứ chỉ cần một
const [ho, setHo] = useState("");
const [ten, setTen] = useState("");
const [hoTen, setHoTen] = useState("");

// ✓
const hoTen = `${ho} ${ten}`;

// ❌ Lưu danh sách đã lọc
const [dsDaLoc, setDsDaLoc] = useState<Viec[]>([]);

// ✓ Lưu điều kiện lọc, tính danh sách khi render
const [boLoc, setBoLoc] = useState<BoLoc>("tat-ca");
const dsHienThi = ds.filter((v) => khopBoLoc(v, boLoc));
```

"Tính lại mỗi lần render có chậm không?" — Với vài trăm phần tử, `filter` mất chưa tới một mili giây. Đừng lo trước. Nếu đo được là chậm thật, file `09` có `useMemo`.

### Nguyên tắc 2 — Tránh trạng thái mâu thuẫn

```tsx
// ❌ Có thể rơi vào: dangGui = true VÀ daGui = true
const [dangGui, setDangGui] = useState(false);
const [daGui, setDaGui] = useState(false);
const [loi, setLoi] = useState<string | null>(null);
```

Ba biến độc lập cho phép 2 × 2 × 2 = 8 tổ hợp, mà chỉ 4 cái có nghĩa. Bạn đã gặp vấn đề này ở Pokédex chặng 2 và giải quyết nó ở mục 11 file `06` chặng 3:

```tsx
type TrangThaiGui =
  | { loai: "nhap" }
  | { loai: "dang-gui" }
  | { loai: "da-gui" }
  | { loai: "loi"; thongBao: string };

const [trangThai, setTrangThai] = useState<TrangThaiGui>({ loai: "nhap" });
```

Một state, không thể mâu thuẫn.

### Nguyên tắc 3 — Không nhân bản dữ liệu

```tsx
// ❌ Lưu nguyên object đang chọn
const [ds, setDs] = useState<SanPham[]>(duLieu);
const [dangChon, setDangChon] = useState<SanPham | null>(null);
```

Người dùng chọn một sản phẩm, rồi sửa tên sản phẩm đó trong danh sách. `dangChon` vẫn giữ object **cũ** với tên cũ — giờ có hai bản của cùng một sản phẩm, lệch nhau.

```tsx
// ✓ Lưu id, tra cứu khi render
const [ds, setDs] = useState<SanPham[]>(duLieu);
const [idDangChon, setIdDangChon] = useState<number | null>(null);

const dangChon = ds.find((sp) => sp.id === idDangChon) ?? null;
```

Đây là nguyên tắc 1 áp dụng cho object: `dangChon` suy ra được từ `ds` và `idDangChon`.

### Nguyên tắc 4 — Tránh lồng sâu

State lồng ba, bốn tầng khiến mỗi lần cập nhật phải trải từng tầng (mục 7). Nếu dữ liệu tự nhiên có dạng cây, cân nhắc làm phẳng nó: lưu mảng phẳng các phần tử, mỗi phần tử tham chiếu tới cha bằng `id` — giống cách cơ sở dữ liệu lưu bảng.

Bạn chưa cần làm điều này ngay. Chỉ cần nhận ra dấu hiệu: khi cập nhật state cần quá nhiều `...`.

### Danh sách tự kiểm tra

Mỗi khi thêm một `useState`, tự hỏi:

1. Giá trị này có **thay đổi theo thời gian** không? Không → không cần state, dùng hằng số
2. Nó có **tính được** từ props hoặc state khác không? Có → không phải state, tính khi render
3. Nó có **mâu thuẫn** được với state khác không? Có → gộp lại thành discriminated union
4. Nó có **trùng lặp** dữ liệu đã có không? Có → lưu `id`, tra cứu khi render

---

## 11. Sự kiện trong React

Đến giờ bạn đã dùng `onClick`. Vài điều cần biết thêm.

### Đối tượng sự kiện

```tsx
function xuLyClick(e: React.MouseEvent<HTMLButtonElement>) {
  console.log(e.clientX, e.currentTarget);
}

<button onClick={xuLyClick}>Bấm</button>
```

Khi viết hàm xử lý **riêng** như trên, TypeScript cần biết kiểu của `e`. Khi viết **trực tiếp** trong JSX, nó tự suy ra:

```tsx
<button onClick={(e) => console.log(e.clientX)}>Bấm</button>   // e được suy kiểu sẵn
```

Mẹo: không nhớ kiểu sự kiện thì viết trực tiếp trong JSX trước, rê chuột vào `e` để xem kiểu, rồi copy ra.

Các kiểu hay gặp: `React.MouseEvent`, `React.ChangeEvent`, `React.FormEvent`, `React.KeyboardEvent` — đều nhận tham số là kiểu phần tử, ví dụ `React.ChangeEvent<HTMLInputElement>`.

Object `e` này là **sự kiện tổng hợp** (synthetic event) của React — một lớp bọc quanh sự kiện thật của trình duyệt, có cùng giao diện (`preventDefault`, `stopPropagation`, `target`, `currentTarget`) nhưng hoạt động nhất quán giữa các trình duyệt.

### React tự làm event delegation

Nhớ file `09` chặng 2: gắn một listener ở cha thay vì mỗi phần tử con. React làm điều đó **cho bạn**: dù bạn viết `onClick` trên 1000 nút, React chỉ gắn listener ở gốc ứng dụng. Bạn có được lợi ích của delegation mà vẫn viết code theo kiểu gắn trực tiếp từng phần tử. Không cần `closest`, không cần `data-hanh-dong` nữa.

### Truyền đối số

```tsx
{ds.map((v) => (
  <button key={v.id} onClick={() => xoa(v.id)}>Xóa</button>
))}
```

Arrow function bọc lại, nhờ closure nó nhớ đúng `v.id` của từng phần tử.

### Hành vi mặc định và lan truyền

```tsx
<form onSubmit={(e) => {
  e.preventDefault();   // vẫn cần, giống file 09 chặng 2
  gui();
}}>
```

`preventDefault` và `stopPropagation` hoạt động như bạn đã học. Một khác biệt: trong React, **trả về `false` không chặn được** hành vi mặc định — phải gọi `preventDefault()` tường minh.

### Hàm xử lý sự kiện là nơi để có tác dụng phụ

Nhớ mục 7 file `01`: component phải thuần lúc render. Vậy những việc như gọi API, ghi `localStorage`, đổi `document.title` làm ở đâu? **Trong hàm xử lý sự kiện.** Hàm xử lý chạy khi người dùng tương tác, không phải lúc render — nên nó không bị ràng buộc bởi luật thuần.

```tsx
function xuLyLuu() {
  setDs((d) => [...d, viecMoi]);                          // cập nhật state
  localStorage.setItem("ds", JSON.stringify([...ds, viecMoi]));   // tác dụng phụ — OK ở đây
}
```

(Lưu ý dòng `localStorage` ở trên dùng `ds` từ ảnh chụp hiện tại — đúng như mục 4. Cách gọn hơn để đồng bộ state với `localStorage` là `useEffect`, file `06`.)

---

## 12. TypeScript với `useState`

TypeScript thường tự suy kiểu từ giá trị ban đầu:

```tsx
const [dem, setDem] = useState(0);            // number
const [ten, setTen] = useState("");           // string
const [mo, setMo] = useState(false);          // boolean

setDem("năm");   // ❌ string không phải number
```

Ba trường hợp **phải** viết kiểu tường minh (mục 7 file `07` chặng 3):

```tsx
// 1. Giá trị ban đầu là null, sau này sẽ có object
const [user, setUser] = useState<User | null>(null);

// 2. Mảng rỗng — nếu không ghi, TypeScript suy ra never[], không thêm được gì vào
const [ds, setDs] = useState<Viec[]>([]);

// 3. Literal union — nếu không ghi, TypeScript suy ra string chung chung
const [boLoc, setBoLoc] = useState<"tat-ca" | "chua-xong" | "da-xong">("tat-ca");
```

Trường hợp 3 hay bị bỏ sót: `useState("tat-ca")` cho kiểu `string`, nghĩa là `setBoLoc("bat-ky")` vẫn hợp lệ. Ghi rõ kiểu để TypeScript bắt lỗi gõ nhầm.

---

## 13. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Bấm nút, giá trị không đổi trên màn hình | Dùng biến thường thay vì state | `useState` |
| Sửa object/mảng, giao diện không cập nhật | Sửa trực tiếp, tham chiếu không đổi | Tạo object/mảng mới (mục 7, 8) |
| `console.log` sau `setX` in giá trị cũ | State là ảnh chụp | Đúng thiết kế; dùng giá trị mới bạn vừa tính |
| Gọi `setX(x + 1)` ba lần, chỉ tăng 1 | Ba lần dùng cùng ảnh chụp | `setX(x => x + 1)` |
| `alert` / `setTimeout` hiện giá trị cũ | Stale closure | Đúng thiết kế; nếu cần giá trị mới nhất, xem file `08` (`useRef`) |
| `React Hook "useState" is called conditionally` | Gọi Hook trong `if`, vòng lặp, sau return | Đưa lên cấp cao nhất |
| `Too many re-renders` | `onClick={setX(1)}` — gọi ngay khi render, gây render vô hạn | `onClick={() => setX(1)}` |
| `Argument of type 'X' is not assignable to parameter of type 'never'` | `useState([])` suy ra `never[]` | `useState<Kieu[]>([])` |
| Số liệu tổng/đếm hiển thị lệch với danh sách | Lưu giá trị tính được thành state riêng | Tính trong lúc render (mục 10) |
| Thông tin "đang chọn" không cập nhật khi sửa danh sách | Lưu nguyên object thay vì `id` | Lưu `id`, tra cứu khi render |
| Trang chậm khi gõ, đọc `localStorage` mỗi lần | Giá trị ban đầu tính lại mỗi render | Khởi tạo lười `useState(() => ...)` |
| Hai bộ đếm cùng loại dùng chung giá trị | Khai báo biến ngoài component thay vì state | Dùng `useState` bên trong component |

`Too many re-renders` đáng giải thích: `onClick={setX(1)}` gọi `setX` **trong lúc render** → lên lịch render mới → render mới lại gọi `setX` → vô hạn. React phát hiện và dừng lại bằng lỗi này.

---

## 14. Tóm tắt cần thuộc

1. Biến thường không được nhớ giữa các lần render và không kích hoạt render lại
2. `const [x, setX] = useState(giaTriDau)` — giá trị ban đầu chỉ dùng ở lần render đầu
3. Mỗi lần xuất hiện của component có state riêng, độc lập
4. **Luật Hook**: chỉ gọi ở cấp cao nhất của component — React nhận diện Hook theo **thứ tự gọi**
5. **State là ảnh chụp**: trong một lần render, giá trị state là hằng số; `setX` không đổi biến hiện tại
6. Callback giữ ảnh chụp của lần render tạo ra nó — đó là closure, và là nguồn gốc của stale closure
7. Giá trị mới phụ thuộc giá trị cũ → dùng **updater**: `setX(x => x + 1)`
8. React **gom** mọi cập nhật trong một lượt thành một lần render (batching), ở mọi nơi
9. Ba lý do render lại: lần đầu, state của nó đổi, cha render lại
10. React so sánh bằng `Object.is` — cùng tham chiếu là không render
11. **Không bao giờ sửa trực tiếp object/mảng trong state** — luôn tạo bản mới
12. Thêm `[...a, x]`, xóa `filter`, sửa `map` + spread, sắp xếp `toSorted`
13. Khởi tạo lười `useState(() => ...)` cho giá trị ban đầu tốn kém
14. **Không lưu thứ tính được** — tính trong lúc render
15. Trạng thái loại trừ lẫn nhau → một discriminated union, không phải nhiều boolean
16. Lưu `id` thay vì nhân bản object
17. `useState<T>` tường minh với `null`, mảng rỗng, literal union

---

## Bài tập

Làm trong `bai-tap/src/bai-03/`.

### Bài 1 — Đoán kết quả (bài chính)

Mỗi đoạn là một component có một nút. Với **mỗi** đoạn, ghi vào `ghi-chu.md` trước khi chạy: sau **một** lần bấm, màn hình hiện số mấy, và Console / `alert` hiện gì.

```tsx
// --- A ---
function A() {
  const [n, setN] = useState(0);
  return <button onClick={() => {
    setN(n + 1);
    setN(n + 1);
    console.log(n); -> 0 
  }}>{n}</button>; -> 1
} 

// --- B ---
function B() {
  const [n, setN] = useState(0);
  return <button onClick={() => {
    setN((x) => x + 1);
    setN((x) => x + 1);
    console.log(n); -> 0 
  }}>{n}</button>; -> 2
}  

// --- C ---
function C() {
  const [n, setN] = useState(0);
  return <button onClick={() => {
    setN(n + 5);
    setN((x) => x + 1);
  }}>{n}</button>; -> 6
}

// --- D ---
function D() {
  const [n, setN] = useState(0);
  return <button onClick={() => {
    setN((x) => x + 1);
    setN(n + 5);
  }}>{n}</button>; -> 5
}

// --- E ---
function E() {
  const [n, setN] = useState(0);
  return <button onClick={() => {
    setN(n + 5);
    setN((x) => x + 1);
    setN(42);
    setN((x) => x * 2);
  }}>{n}</button>; -> 84
}

// --- F ---
function F() {
  const [n, setN] = useState(0);
  return <button onClick={() => {
    setN(n + 1);
    setTimeout(() => alert(n), 1000); -> 0
  }}>{n}</button>; -> 1
}

// --- G ---
function G() {
  const [o, setO] = useState({ dem: 0 });
  return <button onClick={() => {
    o.dem = o.dem + 1;
    setO(o);
  }}>{o.dem}</button>; -> 0
}

// --- H ---
function H() {
  const [o, setO] = useState({ dem: 0 });
  return <button onClick={() => {
    o.dem = o.dem + 1;
    setO({ ...o });
  }}>{o.dem}</button>; -> 1
}

// --- I ---
function I() {
  const [ds, setDs] = useState([1, 2, 3]);
  return <button onClick={() => {
    ds.push(4);
    setDs(ds);
  }}>{ds.length}</button>; -> 3
}

// --- J ---
function J() {
  const [n, setN] = useState(0);
  console.log("render J", n); -> render J 0
  return <button onClick={() => setN(0)}>{n}</button>; -> 0
}
// Câu hỏi riêng cho J: bấm nút nhiều lần, "render J" có in thêm không? -> không thì react so sánh thì 2 cái bằng nhau nên k render lại
```

Sau đó chạy thử từng đoạn, bấm **hai lần** liên tiếp cho các đoạn A–E, ghi lại kết quả lần bấm thứ hai.

Câu G và H đặt cạnh nhau là điểm mấu chốt của mục 7: H trông như chạy đúng — giải thích vì sao nó vẫn là cách viết sai. vì thay đổi giá trị rồi mới tạo ra object mới vậy thì object cũ đã bị thay đổi rồi sẽ có trường hợp dùng object cũ và thấy sai liền chỉ đugns ở hiện tại thôi

> **[Ghi chú check bài]** ✅ Cả 10 đoạn A–J đoán đúng. Câu H đúng ý, bổ sung cho cụ thể hơn:
> - `o` là **ảnh chụp của lần render cũ**. Dòng `o.dem = o.dem + 1` sửa thẳng vào ảnh chụp đó, tức là quá khứ bị viết lại. Ví dụ: nếu thêm `setTimeout(() => alert(o.dem), 1000)` như ở F, bạn sẽ thấy `1` chứ không phải `0`. Đảm bảo "state là ảnh chụp" ở mục 4 đã bị phá.
> - `{ ...o }` chỉ là **bản sao nông**. Nếu `o` có object lồng bên trong (như `o.diaChi.thanhPho`) thì object mới và object cũ vẫn dùng chung phần lồng đó, nên sửa kiểu này sẽ hỏng cả hai.
> - Những chỗ so sánh cũ với mới (`React.memo`, mảng phụ thuộc của `useEffect`/`useMemo` ở các bài sau) cần object cũ giữ nguyên. Object cũ đã bị sửa thì việc so sánh không còn đáng tin.
> - Cách đúng là **không đụng vào `o`**: `setO({ ...o, dem: o.dem + 1 })`.
>
> Thêm một chi tiết cho G và I: tuy màn hình không đổi nhưng giá trị bên trong **vẫn bị sửa ngầm** (`o.dem` là 1, 2, ...; `ds` thành `[1,2,3,4,4,...]`). Chỉ cần component render lại vì một lý do khác là con số "nhảy" lên đột ngột. Lỗi kiểu này rất khó lần ra.

### Bài 2 — Ba component nhỏ

1. **`BoDemNangCao`**: các nút `-1`, `+1`, `+5`, `×2`, "Đặt lại". Ô nhập bước nhảy (chưa cần form controlled — tạm dùng ba nút chọn bước `1`, `5`, `10`). Không cho xuống dưới `0`. Nút "Hoàn tác" quay lại giá trị trước — gợi ý: state là một **mảng lịch sử** chứ không phải một số; giá trị hiện tại **tính ra** từ lịch sử
2. **`TheMoRong`**: tiêu đề + nội dung, bấm tiêu đề thì đóng/mở. Dùng lại `The` từ bài 3 file `02`. Đặt ba cái cạnh nhau, xác nhận chúng độc lập
3. **`ChonMau`**: lưới 8 ô màu, bấm để chọn, ô đang chọn có viền. Lưu **chỉ số** hoặc **mã màu** — không lưu object

### Bài 3 — Danh sách việc (state mảng)

Không dùng form controlled (file `05`). Thêm việc bằng cách chọn từ một danh sách gợi ý cố định — bấm một gợi ý là thêm nó vào danh sách.

1. State `ds: Viec[]` với kiểu tường minh
2. Thêm, xóa, bật/tắt hoàn thành, đổi tên (bấm nút "Viết hoa" để đổi nội dung thành chữ hoa) — mỗi thao tác dùng đúng phương thức ở bảng mục 8
3. Nút "Sắp xếp A–Z" dùng `toSorted` với `localeCompare(..., "vi")`
4. Nút "Đảo thứ tự", "Đưa lên đầu" (cho từng việc), "Xóa đã xong"
5. Bộ lọc ba trạng thái — state lưu **điều kiện lọc**, danh sách hiển thị **tính trong lúc render**
6. Bộ đếm "x việc chưa xong / y việc" — **tính trong lúc render**, không phải state
7. Không có `push`, `splice`, `sort`, `reverse`, hay gán `ds[i] = ...` ở bất cứ đâu. Tìm bằng Ctrl+F để chắc chắn

Rồi thêm một lỗi có chủ đích: trong hàm bật/tắt, dùng cách "sai" ở mục 8 (`[...d]` rồi sửa `banSao[i].daXong`). Thêm một nút "Xem lịch sử" in ra mảng lúc mới tải trang (lưu tham chiếu đầu tiên vào một biến ngoài component). Mảng cũ có bị đổi theo không? Ghi lại và khôi phục cách đúng.

### Bài 4 — Thiết kế lại state

Mỗi component dưới đây chạy được nhưng thiết kế state sai. Với mỗi cái: chỉ ra vi phạm nguyên tắc nào ở mục 10, viết lại.

```tsx
// --- A ---
function GioHang() {
  const [ds, setDs] = useState<{ ten: string; gia: number; sl: number }[]>([]);
  const [tongTien, setTongTien] = useState(0); -> có thể tính tổng tiền được vi phạm quy tắc 1
  const [tongSoLuong, setTongSoLuong] = useState(0); -> có thể tính ni được vi phạm 1
  const [rong, setRong] = useState(true); -> có thể tính ni được vi phạm 1
  // ... mỗi hàm thêm/xóa đều phải cập nhật cả bốn state
}

// --- B ---
function TaiDuLieu() {
  const [dangTai, setDangTai] = useState(false);
  const [coLoi, setCoLoi] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState("");
  const [duLieu, setDuLieu] = useState<string[] | null>(null);
  const [thanhCong, setThanhCong] = useState(false);
} -> vi phạm 2

// --- C ---
function DanhBa() {
  const [lienHe, setLienHe] = useState<LienHe[]>(duLieuMau);
  const [dangXem, setDangXem] = useState<LienHe | null>(null); -> vi phạm 3 nên đổi thành 1 biến ví dụ như id trong liên hệ thôi
  const [tuKhoa, setTuKhoa] = useState("");
  const [ketQuaTim, setKetQuaTim] = useState<LienHe[]>(duLieuMau); -> vi phạm 3 nên đổi thành list id
}

// --- D ---
function HoSo() {
  const [ho, setHo] = useState("Nguyễn");
  const [ten, setTen] = useState("An");
  const [hoTen, setHoTen] = useState("Nguyễn An"); -> vi phạm 1 do có thể tính được hoTen từ 2 biến trên
  const [chuCaiDau, setChuCaiDau] = useState("NA"); -> vi phạm 1
}
```

Với C, hãy viết một kịch bản bug cụ thể: người dùng làm gì, theo thứ tự nào, để `dangXem` hiển thị dữ liệu sai? khi người dùng xem 1 lien hệ cụ thể xong họ sửa nó thì danhBa vẫn lưu Liên Hệ cũ khiến dữ liệu hiển thị sai tương tự kết quả tìm

> **[Ghi chú check bài 4]** A ✅, B ✅, D ✅. C: `dangXem` ✅, nhưng `ketQuaTim` ❌ sai nguyên tắc.
>
> **C — `ketQuaTim` là vi phạm nguyên tắc 1, không phải 3.** Kết quả tìm **tính được** từ `lienHe` + `tuKhoa` (`lienHe.filter(...)`), nên **không cần state nào cả** — tính trong lúc render. Đổi sang "list id" vẫn là lưu một thứ tính được, nên vẫn lệch:
> - Đang tìm "an" → `ketQuaTim = [1, 3]`. Thêm liên hệ mới tên "Lan" → không có trong kết quả, vì không ai cập nhật mảng id.
> - Xóa liên hệ id 3 → mảng id vẫn còn 3, trỏ vào thứ không tồn tại.
>
> Khác biệt cần nhớ: `dangXem` là **lựa chọn của người dùng** (không tính được) → phải là state, chỉ cần lưu gọn bằng id. `ketQuaTim` **tính được** → không là state.
>
> **B — bổ sung cho đầy đủ:** đúng là nguyên tắc 2 — 5 boolean/giá trị rời cho phép tổ hợp vô lý như `dangTai = true` và `thanhCong = true` cùng lúc, hoặc `coLoi = false` mà `thongBaoLoi` có chữ. Ngoài ra còn dính nguyên tắc 1: `coLoi` suy ra được từ `thongBaoLoi !== ""`, `thanhCong` suy ra được từ `duLieu !== null`. Hướng sửa: một state union kiểu `trangThai` (giống `pokedex-ts` ở chặng 3).
>
> **Kịch bản bug của C — viết lại cho cụ thể:** (1) bấm xem liên hệ "An" → `dangXem` giữ **chính object** của An lúc đó; (2) sửa SĐT của An → `lienHe` có object mới; (3) khung chi tiết vẫn hiện SĐT cũ vì `dangXem` vẫn trỏ object cũ. Lưu ý chữ: không phải "danh bạ lưu liên hệ cũ" — `lienHe` đã đúng, chính **`dangXem`** mới là bản cũ bị bỏ lại.

### Bài 5 — Pokédex hoạt động

Lấy Pokédex tĩnh ở bài 6 file `02`. Làm cho nó hoạt động — vẫn dùng dữ liệu giả, chưa gọi API:

1. **Tìm kiếm** — tạm thời dùng một dãy nút gợi ý (`"pika"`, `"char"`, `"bul"`, xóa) thay cho ô nhập, vì form ở file `05`. State lưu **từ khóa**
2. **Lọc theo loại** — bấm `HuyHieu` một loại để lọc, bấm lại để bỏ lọc. State lưu **loại đang chọn**
3. Danh sách hiển thị **tính trong lúc render** từ dữ liệu + từ khóa + loại. Không có state nào tên `dsDaLoc`
4. **Yêu thích** — mỗi thẻ có nút trái tim. State lưu `Set<number>` hoặc `number[]` các `id`. Chú ý: `Set` cũng phải cập nhật bất biến — `new Set(cu).add(id)` chứ không phải `cu.add(id)`
5. **Modal chi tiết** — bấm thẻ để mở. State lưu `idDangXem: number | null`, **không** lưu object. Dùng `Modal` từ bài 3 file `02`
6. **Sắp xếp** — theo số thứ tự, theo tên, theo chỉ số HP — một state kiểu literal union
7. Hiển thị "Đang hiện x / y Pokémon" — tính trong lúc render
8. Mở React DevTools, đếm tổng số `useState` trong toàn ứng dụng. Ghi lại. Với mỗi cái, tự hỏi bốn câu ở cuối mục 10. Có cái nào không nên là state?

### Bài 6 — Vi phạm luật Hook

1. Viết một component có hai `useState`, đặt cái thứ nhất trong một `if` phụ thuộc một prop boolean
2. Đọc thông báo của ESLint — chép lại
3. Tạm tắt quy tắc đó bằng comment (`// eslint-disable-next-line react-hooks/rules-of-hooks`), chạy thử, đổi prop từ `true` sang `false`. Chuyện gì xảy ra? Màn hình hay Console báo gì?
4. Giải thích dựa trên mục 3 (thứ tự ô nhớ), rồi xóa comment và sửa cho đúng
5. Ghi vào `ghi-chu.md`: vì sao plugin `react-hooks` là thứ không bao giờ nên tắt

### Bài 7 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Vì sao biến thường không dùng được làm state? Kể đủ hai lý do.
2. "State là ảnh chụp" nghĩa là gì? Cho một ví dụ bằng code.
3. Vì sao `setN(n + 1)` gọi ba lần chỉ tăng 1, còn `setN(x => x + 1)` thì tăng 3?
4. Vì sao không được gọi Hook trong `if`?
5. Vì sao sửa trực tiếp một object trong state không làm giao diện cập nhật? Liên hệ với file `01` chặng 2.
6. Vì sao không nên lưu `tongTien` thành state khi đã có danh sách sản phẩm?
7. Stale closure là gì? Bạn đã thấy nó ở câu nào trong bài 1?

---

## Xong file này khi

- [ ] Bài 1 đủ 10 đoạn có phần đoán viết trước; giải thích được C khác D, và G khác H ra sao
- [ ] `BoDemNangCao` có hoàn tác dựa trên mảng lịch sử
- [ ] Danh sách việc ở bài 3 không có bất kỳ phương thức sửa gốc nào; đã thấy tận mắt bug sửa object trong mảng sao chép
- [ ] Bài 4 viết lại đủ bốn component, có kịch bản bug cho C
- [ ] Pokédex lọc, tìm, sắp xếp, yêu thích, mở chi tiết được; không có state nào lưu danh sách đã lọc
- [ ] Bài 6 đã thấy hậu quả thật của việc gọi Hook có điều kiện
- [ ] Trả lời được 7 câu ở bài 7 bằng lời, đặc biệt câu 2 và 3

File tiếp theo (`04-render-list-va-key`) mổ xẻ thứ bạn đã dùng nhiều lần mà chưa giải thích: `key`. Bạn sẽ thấy vì sao `key={index}` — thứ mình tạm cho dùng ở file `01` — có thể khiến ô input nhảy sai dòng và checkbox tự tick nhầm.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-03`, kèm **"viết file 04-render-list-va-key"**.