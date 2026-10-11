# 02 — Props và Composition

> **Cần có trước:** xong `01` — đặc biệt mục 1 (JSX dịch thành gì) và mục 7 (component thuần). Nhớ file `02`, `03` chặng 2 (hàm, tham số, destructuring) và file `06` chặng 3 (kiểu object, union).
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** ở bài 4 file `01`, bạn đã vướng đúng một chỗ: các thẻ sản phẩm cùng cấu trúc nhưng cần hiện dữ liệu khác nhau. Props giải quyết chuyện đó. Còn `children` và composition là cách React cho phép bạn lắp ghép giao diện từ những mảnh nhỏ — kỹ năng phân biệt người viết React gọn gàng và người viết React rối rắm.

---

## 1. Vấn đề

```tsx
function TheSanPham() {
  return (
    <div className="the">
      <h3>Bàn phím cơ</h3>
      <p>1.500.000đ</p>
    </div>
  );
}

function App() {
  return (
    <>
      <TheSanPham />
      <TheSanPham />
      <TheSanPham />
    </>
  );
}
```

Ba thẻ giống hệt nhau. Muốn thẻ thứ hai hiện "Chuột không dây, 350.000đ" thì sao? Viết thêm `TheSanPham2`, `TheSanPham3`? Đó chính là vấn đề "viết lại cho từng kiểu" ở mục 1 file `07` chặng 3.

Câu trả lời đã có từ chặng 2: khi một hàm cần làm việc với dữ liệu khác nhau, bạn cho nó **tham số**. Component là hàm — nên nó cũng nhận tham số. Tham số của component gọi là **props**.

---

## 2. Props là tham số của component

```tsx
function TheSanPham(props: { ten: string; gia: number }) {
  return (
    <div className="the">
      <h3>{props.ten}</h3>
      <p>{props.gia.toLocaleString("vi-VN")}đ</p>
    </div>
  );
}

function App() {
  return (
    <>
      <TheSanPham ten="Bàn phím cơ" gia={1500000} />
      <TheSanPham ten="Chuột không dây" gia={350000} />
      <TheSanPham ten="Màn hình 27 inch" gia={5200000} />
    </>
  );
}
```

Một component, ba thẻ khác nhau.

### Thực ra chuyện gì đang xảy ra

Nhớ mục 1 file `01`: JSX dịch thành lời gọi hàm. Dòng

```tsx
<TheSanPham ten="Bàn phím cơ" gia={1500000} />
```

dịch thành

```javascript
jsx(TheSanPham, { ten: "Bàn phím cơ", gia: 1500000 });
```

Và khi render, React gọi hàm của bạn với đúng object đó:

```javascript
TheSanPham({ ten: "Bàn phím cơ", gia: 1500000 });
```

Vậy là:

- Các **thuộc tính** bạn viết trên thẻ JSX được gom thành **một object**
- Object đó được truyền vào component như **tham số đầu tiên**
- Tên gọi "props" chỉ là viết tắt của *properties*

Không có phép màu nào cả. Đây là truyền tham số cho hàm — thứ bạn đã làm từ file `02` chặng 2.

### Dấu nháy hay ngoặc nhọn

Quy tắc giống mục 3 file `01`:

```tsx
<TheSanPham ten="Bàn phím" />              // chuỗi cố định → dấu nháy
<TheSanPham ten={tenSanPham} />            // giá trị từ biến → ngoặc nhọn
<TheSanPham gia={1500000} />               // số → ngoặc nhọn
<TheSanPham gia="1500000" />               // ⚠ đây là CHUỖI "1500000", không phải số
```

Dòng cuối là nguồn bug quen thuộc — nhớ bài toán `"5" + 3 = "53"` ở file `01` chặng 2. May là TypeScript chặn được: khai báo `gia: number` thì truyền chuỗi sẽ báo lỗi ngay.

---

## 3. Destructuring props

Viết `props.ten`, `props.gia` lặp đi lặp lại rất dài. Gần như mọi dự án React đều destructuring ngay ở tham số — đúng kỹ thuật mục 3.2 file `03` chặng 2:

```tsx
function TheSanPham({ ten, gia }: { ten: string; gia: number }) {
  return (
    <div className="the">
      <h3>{ten}</h3>
      <p>{gia.toLocaleString("vi-VN")}đ</p>
    </div>
  );
}
```

### Tách kiểu ra cho gọn

Khi props nhiều lên, viết kiểu ngay trong tham số rất khó đọc. Tách ra một `type` riêng:

```tsx
type TheSanPhamProps = {
  ten: string;
  gia: number;
  anh: string;
  conHang: boolean;
};

function TheSanPham({ ten, gia, anh, conHang }: TheSanPhamProps) {
  return (
    <div className="the">
      <img src={anh} alt={ten} />
      <h3>{ten}</h3>
      <p>{gia.toLocaleString("vi-VN")}đ</p>
      {!conHang && <span className="het-hang">Hết hàng</span>}
    </div>
  );
}
```

Quy ước đặt tên phổ biến: `TenComponentProps`. Dùng `type` hay `interface` đều được — nhớ mục 8 file `06` chặng 3, quan trọng là nhất quán.

Giờ thử truyền thiếu hoặc sai:

```tsx
<TheSanPham ten="Bàn phím" gia={1500000} />
// ❌ Property 'anh' is missing ... Property 'conHang' is missing

<TheSanPham ten="Bàn phím" gia={1500000} anh="/a.png" conHang="có" />
// ❌ Type 'string' is not assignable to type 'boolean'
```

Editor còn gợi ý tên props khi bạn gõ. Đây là lợi ích lớn nhất của TypeScript trong React: dùng component do người khác viết mà không phải mở mã nguồn của nó ra đọc.

---

## 4. Props tùy chọn và giá trị mặc định

```tsx
type NutProps = {
  nhan: string;
  bienThe?: "chinh" | "phu" | "nguy-hiem";
  kichThuoc?: "nho" | "vua" | "lon";
  voHieu?: boolean;
};

function Nut({
  nhan,
  bienThe = "chinh",
  kichThuoc = "vua",
  voHieu = false,
}: NutProps) {
  return (
    <button className={`nut nut-${bienThe} nut-${kichThuoc}`} disabled={voHieu}>
      {nhan}
    </button>
  );
}
```

```tsx
<Nut nhan="Lưu" />                                // dùng toàn bộ mặc định
<Nut nhan="Xóa" bienThe="nguy-hiem" />
<Nut nhan="Hủy" bienThe="phu" kichThuoc="nho" />
```

Hai kỹ thuật kết hợp:

- **`?` trong kiểu** — prop không bắt buộc truyền (mục 6 file `06` chặng 3)
- **Giá trị mặc định khi destructuring** — mục 3.1 file `03` chặng 2

Nhắc lại cái bẫy ở file `03` chặng 2: giá trị mặc định **chỉ** kích hoạt khi giá trị là `undefined`, không phải `null`. Truyền `bienThe={null}` thì mặc định không áp dụng.

Bạn có thể gặp cú pháp `TheSanPham.defaultProps = { ... }` trong code cũ. Cách này đã bị loại bỏ cho function component ở React 19 — dùng giá trị mặc định khi destructuring.

### Literal union cho props

Để ý `bienThe?: "chinh" | "phu" | "nguy-hiem"`. Đây là literal union ở mục 7 file `06` chặng 3. Lợi ích:

- Gõ nhầm `bienThe="nguy hiem"` bị bắt ngay
- Editor gợi ý đủ ba lựa chọn hợp lệ
- Đọc kiểu là biết component hỗ trợ những biến thể nào

Đừng khai báo `bienThe?: string` cho những prop chỉ có vài giá trị hợp lệ.

### Boolean props có cú pháp rút gọn

```tsx
<Nut nhan="Lưu" voHieu />          // giống voHieu={true}
<Nut nhan="Lưu" voHieu={false} />
<Nut nhan="Lưu" />                  // voHieu = undefined → mặc định false
```

Viết tên prop không kèm giá trị nghĩa là `true` — giống thuộc tính `disabled` trong HTML.

---

## 5. Props là chỉ đọc

```tsx
function TheSanPham({ ten, gia }: TheSanPhamProps) {
  gia = gia * 0.9;   // ❌ đừng làm vậy
  return <p>{gia}</p>;
}
```

Gán lại biến cục bộ `gia` ở trên thực ra không làm hỏng gì bên ngoài (nó chỉ là biến cục bộ được destructuring ra). Nhưng trường hợp sau thì có:

```tsx
type Props = { sanPham: { ten: string; gia: number } };

function TheGiamGia({ sanPham }: Props) {
  sanPham.gia = sanPham.gia * 0.9;   // ❌ sửa object của CHA
  return <p>{sanPham.gia}</p>;
}
```

Nhớ file `01` chặng 2: object được truyền theo **tham chiếu**. `sanPham` trong component con và `sanPham` trong component cha là **cùng một object**. Sửa ở con là sửa luôn dữ liệu của cha — mà cha không hề biết.

Và nhớ mục 7 file `01`: component phải **thuần**, không được sửa thứ đã tồn tại trước khi nó chạy. Props chính là thứ đã tồn tại trước. `StrictMode` render hai lần sẽ lộ ra ngay: giá bị giảm 10% hai lần.

**Quy tắc: không bao giờ sửa props.** Cần giá trị khác thì tạo biến mới:

```tsx
function TheGiamGia({ sanPham }: Props) {
  const giaMoi = sanPham.gia * 0.9;   // ✓ tạo mới, không đụng gì
  return <p>{giaMoi}</p>;
}
```

Muốn TypeScript nhắc giúp, đánh dấu `readonly` (mục 6 file `06` chặng 3):

```tsx
type Props = { readonly sanPham: Readonly<{ ten: string; gia: number }> };
```

Nhiều dự án không làm vậy vì dài dòng, và dựa vào quy ước. Nhưng hiểu **vì sao** quy ước tồn tại thì quan trọng hơn cách ghi nhớ nó.

### Vậy làm sao một component thay đổi được gì?

Props chỉ đọc, component phải thuần — vậy làm sao bấm nút mà số trên màn hình đổi được? Câu trả lời là **state**, nội dung file `03`. Bảng phân biệt:

| | Props | State |
|---|---|---|
| Đến từ đâu | Component **cha** truyền vào | Component **tự** quản lý |
| Ai được thay đổi | Chỉ cha | Chỉ chính component đó |
| Giống với | Tham số của hàm | Biến được nhớ giữa các lần gọi |

---

## 6. Truyền gì cũng được

Props nhận **mọi** giá trị JavaScript:

```tsx
<HoSo
  ten="An"                                       // chuỗi
  tuoi={22}                                       // số
  daXacThuc                                       // boolean (true)
  soThich={["đọc sách", "code"]}                  // mảng
  diaChi={{ thanhPho: "HCM", quan: 1 }}           // object
  onChinhSua={() => console.log("sửa")}           // hàm
  anhDaiDien={<img src="/a.png" alt="An" />}      // JSX
/>
```

Chú ý dòng `diaChi={{ ... }}` — cặp ngoặc ngoài là "vào chế độ JavaScript", cặp trong là object literal. Cùng lý do với `style={{ ... }}` ở file `01`.

### Truyền hàm — cách con nói chuyện với cha

```tsx
type NutXoaProps = {
  onXoa: () => void;
};

function NutXoa({ onXoa }: NutXoaProps) {
  return <button onClick={onXoa}>Xóa</button>;
}

function DanhSach() {
  function xuLyXoa() {
    console.log("Cha nhận được yêu cầu xóa");
  }
  return <NutXoa onXoa={xuLyXoa} />;
}
```

Con không tự xóa được gì — nó chỉ báo cho cha biết "người dùng vừa bấm xóa". Cha quyết định làm gì. Đây là callback ở mục 8 file `02` chặng 2.

Quy ước đặt tên:

- Prop nhận hàm xử lý sự kiện: bắt đầu bằng **`on`** — `onXoa`, `onChon`, `onThayDoi`
- Hàm xử lý trong cha: bắt đầu bằng **`xuLy`** (hay `handle` trong code tiếng Anh) — `xuLyXoa`, `xuLyChon`

Chưa có state nên hàm `xuLyXoa` ở trên chỉ `console.log` được. File `03` và `07` sẽ làm nó thực sự xóa.

---

## 7. Dữ liệu chảy một chiều

```
          App
           │  props ↓
     ┌─────┴─────┐
  DanhSach     ThongKe
     │  props ↓
  TheViec (nhiều cái)
     │
     └── gọi onXoa() ↑  (sự kiện đi ngược lên)
```

Hai quy tắc:

1. **Dữ liệu chảy xuống:** cha truyền props cho con. Con không bao giờ truyền props lên cha
2. **Sự kiện chảy lên:** con muốn cha thay đổi gì thì gọi hàm mà cha đã truyền xuống

Mô hình này gọi là **luồng dữ liệu một chiều** (one-way data flow).

Vì sao React chọn cách này? Nhớ lại bug kinh điển ở chặng 2: *"dữ liệu bị đổi, không biết ai đổi"*. Ở React, khi một giá trị sai, bạn biết chắc nó chỉ có thể đến từ **một** nơi — component đang sở hữu nó — và chỉ có thể bị đổi qua những hàm mà component đó cho phép. Truy vết bug đơn giản hơn rất nhiều.

Đây chính là nguyên lý ở mục 4 file `05` chặng 2 (module pattern): dữ liệu riêng tư, chỉ thay đổi qua những cổng được kiểm soát.

---

## 8. `children` — composition

Đến giờ, component của bạn là thẻ **tự đóng**: `<TheSanPham />`. Nhưng thẻ HTML có thể chứa nội dung bên trong: `<div>...nội dung...</div>`. Component cũng làm được.

```tsx
<The>
  <h3>Bàn phím cơ</h3>
  <p>Switch đỏ, đèn RGB</p>
</The>
```

Mọi thứ nằm giữa thẻ mở và thẻ đóng được truyền vào component qua một prop đặc biệt tên là **`children`**:

```tsx
import type { ReactNode } from "react";

type TheProps = {
  children: ReactNode;
};

function The({ children }: TheProps) {
  return <div className="the">{children}</div>;
}
```

Nhớ lại mục 1 file `01`: JSX dịch thành `jsx("div", { className: "lon", children: "Xin chào" })`. Nội dung bên trong luôn là một prop tên `children` — với thẻ HTML lẫn với component của bạn.

`ReactNode` là kiểu của "bất cứ thứ gì render được": JSX, chuỗi, số, mảng, `null`, `undefined`, boolean — đúng bảng ở mục 3 file `01`.

### Vì sao `children` mạnh

`The` không biết và không cần biết bên trong nó chứa gì. Nó chỉ lo phần **khung**: viền, bo góc, khoảng đệm, đổ bóng. Nội dung do nơi dùng quyết định.

```tsx
<The>
  <h3>Bàn phím cơ</h3>
  <p>1.500.000đ</p>
</The>

<The>
  <p>Bạn chưa có đơn hàng nào.</p>
  <Nut nhan="Mua sắm ngay" />
</The>

<The>
  <BieuDoDoanhThu />
</The>
```

Một component khung, dùng cho mọi thứ. Đây là **composition** — lắp ghép giao diện bằng cách lồng component vào nhau.

### Component khung thường gặp

```tsx
function Modal({ tieuDe, children, onDong }: {
  tieuDe: string;
  children: ReactNode;
  onDong: () => void;
}) {
  return (
    <div className="lop-phu">
      <div className="modal">
        <div className="modal-dau">
          <h2>{tieuDe}</h2>
          <button onClick={onDong} aria-label="Đóng">×</button>
        </div>
        <div className="modal-than">{children}</div>
      </div>
    </div>
  );
}

function BoCucTrang({ children }: { children: ReactNode }) {
  return (
    <>
      <DauTrang />
      <main className="noi-dung">{children}</main>
      <ChanTrang />
    </>
  );
}
```

Mọi ứng dụng React đều có những component kiểu này: `The`, `Modal`, `BoCuc`, `KhungCuon`, `TheMo`...

### Nhiều "khe cắm"

`children` chỉ là **một** khe. Cần nhiều khe thì dùng nhiều prop kiểu `ReactNode`:

```tsx
type TheDayDuProps = {
  dauThe?: ReactNode;
  children: ReactNode;
  chanThe?: ReactNode;
};

function TheDayDu({ dauThe, children, chanThe }: TheDayDuProps) {
  return (
    <div className="the">
      {dauThe && <div className="the-dau">{dauThe}</div>}
      <div className="the-than">{children}</div>
      {chanThe && <div className="the-chan">{chanThe}</div>}
    </div>
  );
}

<TheDayDu
  dauThe={<h3>Đơn hàng #DH001</h3>}
  chanThe={<Nut nhan="Xem chi tiết" />}
>
  <p>3 sản phẩm — 1.200.000đ</p>
</TheDayDu>
```

`dauThe && ...` ở đây an toàn: `ReactNode` không phải số `0` trong trường hợp này (nó là JSX hoặc `undefined`). Nhưng nếu khe của bạn có thể nhận số, nhớ lại cái bẫy ở mục 4 file `01`.

---

## 9. Composition hay cấu hình

Đây là kỹ năng thiết kế, không phải cú pháp. Nó quyết định code của bạn sau sáu tháng còn dễ sửa hay không.

### Cách cấu hình — thêm prop cho mỗi biến thể

```tsx
<The
  tieuDe="Bàn phím"
  coAnh
  anh="/a.png"
  coNut
  nhanNut="Mua"
  coGiamGia
  phanTramGiam={10}
  hienDanhGia
  soSao={4.5}
  coBadgeMoi
/>
```

Mỗi lần có yêu cầu mới, bạn thêm một prop. Sau vài tháng, component có 25 prop boolean, thân hàm đầy `if`, và không ai dám sửa vì không biết tổ hợp nào đang được dùng ở đâu.

### Cách composition — để nơi dùng tự lắp

```tsx
<The>
  <AnhSanPham src="/a.png" />
  <h3>Bàn phím</h3>
  <GiaGiam giaGoc={1500000} phanTram={10} />
  <DanhGia soSao={4.5} />
  <Nut nhan="Mua" />
</The>
```

`The` vẫn chỉ lo khung. Mỗi mảnh là một component nhỏ, độc lập, tự kiểm thử được. Muốn thẻ không có đánh giá thì đơn giản là không đặt `<DanhGia />` vào.

### Khi nào dùng cách nào

- **Prop cấu hình** — khi biến thể là một lựa chọn trong một tập nhỏ, cố định: `bienThe="chinh" | "phu"`, `kichThuoc="nho" | "lon"`. Literal union ở mục 4 là đúng chỗ
- **Composition** — khi phần nội dung thay đổi nhiều, hoặc khi bạn thấy mình thêm prop boolean thứ ba, thứ tư để bật/tắt từng phần

Dấu hiệu cảnh báo: một component có nhiều prop dạng `coX`, `hienY`, `anZ`. Đó thường là lúc nên tách thành các mảnh nhỏ và dùng `children`.

Nhớ mục 12 file `07` chặng 2: **ưu tiên composition hơn kế thừa**. Đội ngũ React cũng khuyến nghị đúng điều đó — React gần như không dùng kế thừa giữa các component.

---

## 10. Props theo biến thể — discriminated union

Một số component có những prop chỉ hợp lý trong một biến thể nhất định:

```tsx
// ❌ Cho phép tổ hợp vô nghĩa
type ThongBaoProps = {
  loai: "thanh-cong" | "loi" | "dang-tai";
  noiDung?: string;
  onThuLai?: () => void;    // chỉ có nghĩa khi là lỗi
  phanTram?: number;         // chỉ có nghĩa khi đang tải
};

<ThongBao loai="thanh-cong" phanTram={50} onThuLai={() => {}} />
// TypeScript cho qua — nhưng vô nghĩa
```

Nhớ lại kỹ thuật quan trọng nhất của file `06` chặng 3:

```tsx
type ThongBaoProps =
  | { loai: "thanh-cong"; noiDung: string }
  | { loai: "loi"; noiDung: string; onThuLai: () => void }
  | { loai: "dang-tai"; phanTram?: number };

function ThongBao(props: ThongBaoProps) {
  switch (props.loai) {
    case "thanh-cong":
      return <div className="tb tb-ok">{props.noiDung}</div>;
    case "loi":
      return (
        <div className="tb tb-loi">
          {props.noiDung}
          <button onClick={props.onThuLai}>Thử lại</button>
        </div>
      );
    case "dang-tai":
      return <div className="tb">Đang tải {props.phanTram ?? 0}%</div>;
  }
}
```

```tsx
<ThongBao loai="loi" noiDung="Mất kết nối" onThuLai={taiLai} />   // ✓
<ThongBao loai="loi" noiDung="Mất kết nối" />
// ❌ Property 'onThuLai' is missing
<ThongBao loai="thanh-cong" noiDung="Đã lưu" phanTram={50} />
// ❌ Object literal may only specify known properties
```

Chú ý: ở đây **không** destructuring ngay tại tham số. Nếu destructuring sớm thành các biến rời, TypeScript mất khả năng liên kết `loai` với các trường đi kèm — thu hẹp kiểu không còn hoạt động. Giữ nguyên `props`, rồi thu hẹp bằng `props.loai`.

---

## 11. Chuyển tiếp props cho thẻ HTML

Khi viết một `Nut` dùng lại được, bạn sẽ muốn nó nhận **mọi** thuộc tính của `<button>` thật: `type`, `disabled`, `onClick`, `aria-label`, `title`... Khai báo lại từng cái thì không bao giờ hết.

```tsx
import type { ComponentProps } from "react";

type NutProps = ComponentProps<"button"> & {
  bienThe?: "chinh" | "phu" | "nguy-hiem";
};

function Nut({ bienThe = "chinh", className, ...conLai }: NutProps) {
  return (
    <button
      {...conLai}
      className={`nut nut-${bienThe} ${className ?? ""}`}
    />
  );
}
```

```tsx
<Nut type="submit" disabled={dangGui} onClick={gui} aria-label="Gửi đơn">
  Gửi
</Nut>
```

Đọc từng phần:

- **`ComponentProps<"button">`** — utility type của React, lấy toàn bộ kiểu thuộc tính của thẻ `<button>`. Generic ở file `07` chặng 3
- **`&`** — intersection: có đủ thuộc tính của button **và** thêm `bienThe` của riêng mình
- **`...conLai`** — rest destructuring (file `03` chặng 2): gom mọi prop còn lại
- **`{...conLai}`** — spread: trải tất cả lên thẻ `<button>` thật
- `children` cũng nằm trong `conLai`, nên nó tự đi xuống `<button>`

Hai điểm cẩn thận:

**Thứ tự quan trọng.** Thuộc tính viết **sau** đè thuộc tính viết **trước** — giống spread object ở mục 4.2 file `03` chặng 2. Ở trên, `{...conLai}` đứng trước nên `className` của component luôn thắng; còn `className` người dùng truyền vào được gộp vào chứ không bị mất.

**Đừng spread bừa.** `{...props}` lên mọi thứ là tiện, nhưng nó làm mờ đi việc component thực sự nhận gì. Chỉ dùng cho component bọc trực tiếp một thẻ HTML, như `Nut`, `OInput`, `LienKet`.

---

## 12. Hai prop đặc biệt: `key` và `ref`

```tsx
<TheSanPham key={sp.ma} ten={sp.ten} gia={sp.gia} />
```

`key` **không** được truyền vào component. React giữ nó lại cho mục đích riêng (nhận diện phần tử trong danh sách — file `04`). Bên trong `TheSanPham`, không có `props.key`. Cần dùng mã sản phẩm bên trong component thì truyền thêm một prop riêng:

```tsx
<TheSanPham key={sp.ma} ma={sp.ma} ten={sp.ten} />
```

`ref` cũng là prop đặc biệt — file `08`.

---

## 13. Prop drilling

```
App               (có thông tin người dùng)
 └── BoCuc
      └── DauTrang
           └── ThanhDieuHuong
                └── MenuNguoiDung   (cần thông tin người dùng)
```

`MenuNguoiDung` cần biết người dùng là ai. Dữ liệu nằm ở `App`. Vậy là `BoCuc`, `DauTrang`, `ThanhDieuHuong` đều phải nhận prop `nguoiDung` — **chỉ để truyền tiếp xuống**, chúng không dùng nó.

Hiện tượng này gọi là **prop drilling**. Hai, ba tầng thì chấp nhận được. Năm, sáu tầng thì mỗi lần đổi tên prop phải sửa năm, sáu file.

### Composition giải quyết được một phần

```tsx
function App() {
  const nguoiDung = { ten: "An" };
  return (
    <BoCuc
      dauTrang={
        <DauTrang
          dieuHuong={<ThanhDieuHuong menu={<MenuNguoiDung nguoiDung={nguoiDung} />} />}
        />
      }
    >
      <NoiDung />
    </BoCuc>
  );
}
```

`MenuNguoiDung` được tạo ngay ở `App` — nơi có dữ liệu — rồi được truyền xuống như **một mảnh giao diện đã lắp sẵn**. Các component ở giữa chỉ đặt mảnh đó vào đúng chỗ, không cần biết `nguoiDung` là gì.

Trước khi nghĩ tới công cụ phức tạp hơn, hãy thử cách này. Nó thường đủ.

Khi composition không đủ (dữ liệu cần ở rất nhiều nơi rải rác: theme, ngôn ngữ, người dùng đăng nhập), React có **Context** — chặng 5.

---

## 14. Khi nào tách component

Không có quy tắc tuyệt đối, nhưng có vài dấu hiệu:

- **Lặp lại** — cùng một cấu trúc xuất hiện hai lần trở lên
- **Quá dài** — một component vượt khoảng 100–150 dòng JSX là khó đọc
- **Một trách nhiệm** — nguyên lý "mỗi file một trách nhiệm" ở mục 13 file `13` chặng 2 áp dụng cho component
- **Đặt tên được** — nếu bạn đặt được một cái tên rõ nghĩa cho một khối giao diện (`ThanhTimKiem`, `BangGia`), đó thường là một component

Và một dấu hiệu ngược lại — **đừng tách quá sớm**. Component chỉ dùng một lần, ba dòng JSX, không có logic riêng thì tách ra thường chỉ làm code khó theo dõi hơn. Viết chung trước, thấy lặp hoặc thấy rối thì tách sau.

Đọc lại trang "Thinking in React" ở `react.dev` (bài 5 file `00`) sau khi xong file này — bạn sẽ thấy nó rõ hơn nhiều so với lần đầu.

---

## 15. Lỗi thường gặp

| Thông báo / hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Property 'x' is missing in type` | Quên truyền prop bắt buộc | Truyền vào, hoặc đánh dấu `?` nếu thật sự tùy chọn |
| Số hiện ra kiểu `"1500000"` cộng chuỗi lung tung | `gia="1500000"` truyền chuỗi | `gia={1500000}` |
| `Cannot read properties of undefined` bên trong component | Prop tùy chọn không được truyền, không có mặc định | Thêm giá trị mặc định hoặc kiểm tra trước |
| Dữ liệu ở component cha bị đổi bí ẩn | Con sửa object nhận qua props | Không sửa props; tạo giá trị mới |
| `props.key` là `undefined` | `key` không được truyền vào component | Truyền thêm một prop khác, ví dụ `ma` |
| `children` không hiện gì | Component không đặt `{children}` vào JSX | Thêm `{children}` vào đúng chỗ |
| Thu hẹp kiểu không hoạt động với props theo biến thể | Destructuring sớm làm mất liên kết | Giữ `props`, `switch (props.loai)` |
| `onClick` truyền xuống không chạy | Prop đặt tên khác, hoặc con không gắn nó vào phần tử nào | Kiểm tra con có `onClick={onXoa}` |
| `className` truyền vào bị mất | Spread `{...conLai}` đứng **sau** `className` | Đặt spread trước, gộp class sau |
| Sửa một prop phải sửa năm file | Prop drilling | Composition (mục 13), sau này Context |

---

## 16. Tóm tắt cần thuộc

1. Props là **tham số** của component; các thuộc tính JSX được gom thành **một object**
2. Destructuring ngay ở tham số, tách kiểu ra `type TenProps`
3. Chuỗi cố định dùng dấu nháy; mọi giá trị khác dùng ngoặc nhọn
4. Prop tùy chọn: `?` trong kiểu + giá trị mặc định khi destructuring. `defaultProps` đã lỗi thời
5. Literal union cho prop chỉ có vài giá trị hợp lệ
6. **Props là chỉ đọc** — không bao giờ sửa; object được truyền theo tham chiếu
7. Props đến từ cha, cha thay đổi; state do component tự quản lý (file `03`)
8. Truyền hàm qua props (`onXoa`) để con báo sự kiện lên cha
9. **Dữ liệu chảy xuống, sự kiện chảy lên**
10. `children` là nội dung giữa thẻ mở và thẻ đóng; kiểu `ReactNode`
11. Ưu tiên **composition** khi nội dung thay đổi nhiều; prop cấu hình khi chọn trong tập nhỏ cố định
12. Discriminated union cho props theo biến thể — không destructuring sớm
13. `ComponentProps<"button">` + rest/spread để chuyển tiếp thuộc tính HTML
14. `key` và `ref` không phải props thường
15. Prop drilling: thử composition trước, Context sau

---

## Bài tập

Làm trong `bai-tap/src/bai-02/`.

### Bài 1 — Đoán kết quả

Ghi đoán vào `ghi-chu.md` trước khi chạy:

```tsx
type P = { ten?: string; tuoi?: number; vip?: boolean };

function Hien({ ten = "Ẩn danh", tuoi = 18, vip = false }: P) {
  return <p>{ten} – {tuoi} – {vip ? "VIP" : "thường"}</p>;
}

export default function DoanProps() {
  return (
    <>
      <Hien /> -> Ẩn danh - 18 - thường
      <Hien ten="An" /> -> An - 18 - thường
      <Hien ten="" /> -> - 18 - thường
      <Hien tuoi={0} /> -> Ẩn danh - 0 - thường
      <Hien vip /> -> Ẩn danh - 18 - VIP
      <Hien vip={false} /> -> Ẩn danh - 18 - thường
      <Hien ten={undefined} tuoi={undefined} /> -> Ẩn danh - 18 - thường
    </>
  );
}
```

Thêm dòng `<Hien ten={null} />` — TypeScript báo gì? Nếu tạm bỏ qua lỗi kiểu (thêm `// @ts-expect-error` phía trên), màn hình hiện gì? Giải thích dựa trên mục 4. -> màn hình hiện - 18 - thường còn typescipt sẽ báo lỗi giá trị = null à 

> **[NOTE] Phần màn hình: ĐÚNG. Phần TypeScript: CHƯA ĐỦ, và còn thiếu phần giải thích.**
>
> 1. **TypeScript báo gì, nói cho chính xác:** `Type 'null' is not assignable to type 'string | undefined'.`
>    Lý do: `ten?: string` nghĩa là `ten` có kiểu `string | undefined`. Dấu `?` chỉ cho phép **thiếu** prop (tức `undefined`), **không** cho phép `null`. Muốn nhận `null` thì phải khai báo rõ `ten?: string | null`.
> 2. **Giải thích vì sao màn hình ra " – 18 – thường" (đề yêu cầu dựa trên mục 4):**
>    - Giá trị mặc định `ten = "Ẩn danh"` **chỉ** kích hoạt khi giá trị là `undefined`. `null` **không phải** `undefined`, nên mặc định bị bỏ qua → `ten` giữ nguyên là `null`.
>    - Khi render `{null}` trong JSX, React **không vẽ gì** (giống `undefined`, `true`, `false`) → chỗ tên bị trống.
>    - `tuoi` và `vip` không truyền → là `undefined` → mặc định chạy bình thường → `18`, `thường`.
> 3. **Bẫy cần nhớ:** `ten={null}` và `ten={undefined}` (dòng 745) trông giống nhau nhưng kết quả khác hẳn: `undefined` → "Ẩn danh", `null` → trống.

### Bài 2 — Sửa bài 4 của file 01

Mở lại trang bạn đã chuyển sang component ở bài 4 file `01`:

1. Chuyển mọi component đang hiện dữ liệu cứng sang nhận **props**
2. Định nghĩa `type ...Props` cho từng component
3. Dữ liệu lặp (danh sách sản phẩm...) khai báo một chỗ ở component cha, truyền xuống qua props
4. Thử truyền thiếu một prop, truyền sai kiểu — chụp lại lỗi TypeScript
5. Viết vào `ghi-chu.md`: vấn đề bạn ghi lại ở cuối bài 4 file `01` đã được giải quyết chưa?

### Bài 3 — Bộ component dùng lại (bài chính)

Xây một bộ component nhỏ trong `bai-02/ui/`, mỗi component một file, mỗi file có CSS Module riêng:

**`Nut`**
- Biến thể: `"chinh" | "phu" | "vien" | "nguy-hiem"`
- Kích thước: `"nho" | "vua" | "lon"`
- Prop `toanChieuRong` (boolean) — chiếm hết chiều rộng
- Prop `dangTai` (boolean) — hiện chữ "Đang xử lý..." và tự `disabled`
- Nhận **mọi** thuộc tính của `<button>` thật theo mục 11
- `className` truyền từ ngoài vào phải được gộp, không bị mất

**`The`**
- Khung có viền, bo góc, đệm
- Khe: `dauThe?`, `children`, `chanThe?`
- Prop `noiBat` (boolean) — viền màu nhấn

**`HuyHieu`**
- Biến thể theo màu: `"xam" | "xanh" | "do" | "vang"`
- Nội dung qua `children`

**`ThongBao`**
- Discriminated union theo mục 10, ba biến thể: `"thanh-cong"`, `"loi"` (bắt buộc có `onThuLai`), `"canh-bao"` (có thể có `onBoQua`)
- Kiểm tra đầy đủ bằng `never` (mục 11 file `06` chặng 3)

**`Modal`**
- `tieuDe`, `children`, `onDong`, `chanModal?` (khe cho các nút)
- Chưa cần mở/đóng được (chưa có state) — luôn hiển thị

Sau đó viết một trang `TrinhDien.tsx` dùng **mọi biến thể** của mọi component, giống một trang tài liệu nhỏ. Chụp màn hình.

Kiểm tra cuối: thử dùng sai từng component theo ít nhất ba cách — biến thể không tồn tại, thiếu prop bắt buộc, `ThongBao` loại `"loi"` thiếu `onThuLai`. TypeScript phải bắt được tất cả.

### Bài 4 — Composition hay cấu hình

Cho component viết theo kiểu cấu hình:

```tsx
type TheSanPhamProps = {
  ten: string;
  gia: number;
  anh?: string;
  coGiamGia?: boolean;
  phanTramGiam?: number;
  hienDanhGia?: boolean;
  soSao?: number;
  coNutMua?: boolean;
  nhanNutMua?: string;
  coHuyHieuMoi?: boolean;
  hetHang?: boolean;
};
```

1. Viết component này theo đúng kiểu dữ liệu trên — đếm số `if`/`&&` trong thân hàm
2. Liệt kê ít nhất hai tổ hợp prop vô nghĩa mà TypeScript vẫn cho qua (ví dụ `phanTramGiam` có mà `coGiamGia` là `false`)
3. Viết lại bằng **composition**: `The` (từ bài 3) + các mảnh nhỏ `AnhSanPham`, `GiaBan`, `DanhGia`, `HuyHieu`, `Nut`
4. Tạo cùng năm thẻ sản phẩm khác nhau bằng cả hai cách, đặt cạnh nhau
5. Ghi vào `ghi-chu.md`: nếu sếp yêu cầu thêm "thẻ có đồng hồ đếm ngược khuyến mãi", bạn phải sửa những gì ở mỗi cách?

### Bài 5 — Sửa props, quan sát hậu quả

```tsx
const sanPham = { ten: "Bàn phím", gia: 1000000 };

function TheGiamGia({ sp }: { sp: { ten: string; gia: number } }) {
  sp.gia = sp.gia * 0.9;
  return <p>{sp.ten}: {sp.gia}</p>;
}

export default function ThiNghiem() {
  return (
    <>
      <TheGiamGia sp={sanPham} /> => Bàn phím 900000
      <TheGiamGia sp={sanPham} /> => Bàn phím 810000
      <p>Giá gốc: {sanPham.gia}</p> => 810000
    </>
  );
}
```

1. Đoán ba con số hiện ra, rồi chạy
2. Kết quả có khác dự đoán không? Giải thích bằng **hai** lý do: tham chiếu (file `01` chặng 2) và `StrictMode` (file `01`)
3. Sửa lại cho đúng, không đụng vào dữ liệu gốc
4. Thêm `readonly` vào kiểu như mục 5 — TypeScript có bắt được dòng `sp.gia = ...` không?

### Bài 6 — Pokédex tĩnh

Lấy bản vẽ cây component Pokédex ở bài 5 file `00`. Dựng lại **giao diện** Pokédex bằng React, dùng **dữ liệu giả** (khai báo một mảng 8–10 Pokémon cố định, theo kiểu `Pokemon` ở bài 5 file `07` chặng 3):

1. Tối thiểu 6 component, mỗi cái một file, có `type ...Props`
2. Dùng lại `The`, `HuyHieu`, `Nut` từ bài 3
3. Loại Pokémon (grass, fire...) hiện bằng `HuyHieu`, mỗi loại một màu — dùng `Record<LoaiPokemon, ...>` (mục 8 file `07` chặng 3) để ánh xạ loại sang màu
4. Thanh tìm kiếm, bộ lọc, modal chi tiết — dựng giao diện thôi, **chưa** cần hoạt động
5. Truyền các hàm `onTimKiem`, `onChonLoai`, `onMoChiTiet` xuống, tạm thời chỉ `console.log`
6. So sánh với bản vẽ cây ở file `00`: bạn đã đổi cách chia ở đâu? Vì sao?

Giữ lại bài này. File `03` sẽ làm cho nó hoạt động.

### Bài 7 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Props thực chất là gì? Giải thích dựa trên việc JSX được dịch thành gì.
2. Vì sao không được sửa props? Đưa ra hai lý do.
3. "Dữ liệu chảy xuống, sự kiện chảy lên" nghĩa là gì? Vì sao React chọn mô hình này?
4. `children` là gì? Cho ví dụ một component khung bạn đã viết.
5. Khi nào nên dùng composition, khi nào nên dùng prop cấu hình?
6. Prop drilling là gì? Composition giảm nó bằng cách nào?

---

## Xong file này khi

- [ ] Bài 1 có phần đoán viết trước, giải thích được trường hợp `ten={null}`
- [ ] Trang ở bài 4 file `01` đã chuyển hết sang props
- [ ] Bộ 5 component ở bài 3 hoạt động đủ biến thể, TypeScript bắt được mọi cách dùng sai
- [ ] Bài 4 có cả hai phiên bản, trả lời được câu hỏi "thêm đồng hồ đếm ngược"
- [ ] Bài 5 giải thích được kết quả bằng cả tham chiếu lẫn `StrictMode`
- [ ] Pokédex tĩnh dựng xong, có `Record` ánh xạ loại sang màu
- [ ] Trả lời được 6 câu ở bài 7 bằng lời

**Hết khối A.** Bạn đã có đủ nền để dựng mọi giao diện tĩnh bằng React. Nhưng mọi thứ vẫn đứng yên — bấm gì cũng chỉ ra `console.log`. Từ file `03`, khối B, giao diện bắt đầu sống: `useState`, và lần đầu tiên luật bất biến của chặng 2 trở thành bắt buộc.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-02`, kèm **"viết file 03-usestate"**.