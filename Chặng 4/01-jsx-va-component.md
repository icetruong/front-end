# 01 — JSX và Component

> **Cần có trước:** xong `00` — dự án `bai-tap` chạy được, React DevTools đã cài.
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** JSX là thứ bạn sẽ viết nhiều nhất trong React, và component là đơn vị tổ chức của mọi ứng dụng React. Phần lớn lỗi người mới gặp trong tuần đầu là lỗi cú pháp JSX — file này dọn sạch chúng một lượt.

---

## 1. JSX là gì

```tsx
const tieuDe = <h1 className="lon">Xin chào</h1>;
```

Trông như HTML nằm giữa JavaScript. Nhưng đây **không phải HTML**, và cũng không phải chuỗi. Đây là **JSX** — một phần mở rộng cú pháp cho JavaScript.

Trình duyệt không hiểu JSX. Giống TypeScript ở chặng 3, nó phải được **dịch** trước khi chạy. Vite (qua plugin React) dịch dòng trên thành:

```javascript
import { jsx } from "react/jsx-runtime";

const tieuDe = jsx("h1", { className: "lon", children: "Xin chào" });
```

Và lời gọi `jsx(...)` đó trả về một **object JavaScript bình thường**, đại loại:

```javascript
{
  type: "h1",
  props: { className: "lon", children: "Xin chào" },
  // ...vài trường nội bộ khác
}
```

### Ba thứ cần phân biệt

Đây là chỗ nhiều người nhầm ngay từ đầu:

| | Là gì | Ví dụ |
|---|---|---|
| **React element** | Object mô tả "tôi muốn thấy gì" | Kết quả của `<h1>Xin chào</h1>` |
| **Component** | Hàm trả về React element | `function TieuDe() { return <h1>...</h1> }` |
| **DOM node** | Phần tử thật trên trang | Thứ `document.querySelector` trả về |

`<h1>Xin chào</h1>` **không** tạo ra thẻ `<h1>` trên trang. Nó chỉ tạo ra một object nhẹ mô tả thẻ đó. React mới là bên đọc những object mô tả này rồi quyết định tạo, sửa hay xóa DOM node thật.

Nhớ lại file `08` chặng 2: chạm vào DOM thì đắt, tính toán trong JavaScript thì rẻ. React element là object JavaScript thuần — tạo ra hàng nghìn cái cũng rẻ. Đó là nền tảng để React tự so sánh cũ với mới mà không tốn kém (file `11`).

Bạn sẽ còn thấy cách dịch cũ trong tài liệu và dự án cũ:

```javascript
React.createElement("h1", { className: "lon" }, "Xin chào");
```

Trước đây mọi file JSX phải có `import React from "react"` ở đầu vì lý do này. Từ React 17 trở đi, cơ chế dịch mới tự import `jsx` — bạn không cần dòng đó nữa.

---

## 2. Năm luật của JSX

### Luật 1 — Chỉ một phần tử gốc

```tsx
// ❌ Lỗi: Adjacent JSX elements must be wrapped in an enclosing tag
function The() {
  return (
    <h2>Tiêu đề</h2>
    <p>Nội dung</p>
  );
}
```

Vì sao? Nhìn lại mục 1: JSX dịch thành lời gọi hàm. Một hàm `return` được **một** giá trị — không thể `return jsx(...), jsx(...)`.

Cách sửa 1 — bọc trong một thẻ:

```tsx
return (
  <div>
    <h2>Tiêu đề</h2>
    <p>Nội dung</p>
  </div>
);
```

Cách sửa 2 — dùng **Fragment** khi không muốn thêm thẻ thừa vào DOM:

```tsx
return (
  <>
    <h2>Tiêu đề</h2>
    <p>Nội dung</p>
  </>
);
```

`<>...</>` gom nhiều phần tử lại mà **không** sinh ra thẻ nào trên DOM. Dùng nó thay vì rải `<div>` vô nghĩa — nhất là khi CSS Grid hoặc Flexbox của cha (chặng 1) phụ thuộc vào cấu trúc con trực tiếp.

Dấu ngoặc tròn `( ... )` quanh JSX nhiều dòng là để tránh cái bẫy tự chèn dấu chấm phẩy sau `return` (file `02` chặng 2, mục 6).

### Luật 2 — Mọi thẻ phải đóng

```tsx
// HTML cho phép
<img src="a.png">
<br>
<input type="text">

// JSX bắt buộc
<img src="a.png" />
<br />
<input type="text" />
```

### Luật 3 — Thuộc tính viết theo camelCase

JSX dịch thành object JavaScript, nên tên thuộc tính phải là tên hợp lệ trong JavaScript — và theo quy ước của DOM API (file `08` chặng 2):

| HTML | JSX | Vì sao |
|---|---|---|
| `class` | `className` | `class` là từ khóa của JavaScript (file `07` chặng 2) |
| `for` | `htmlFor` | `for` là từ khóa vòng lặp |
| `onclick` | `onClick` | camelCase |
| `tabindex` | `tabIndex` | camelCase |
| `readonly` | `readOnly` | camelCase |

Hai ngoại lệ giữ nguyên dấu gạch ngang: `aria-*` và `data-*`.

```tsx
<button aria-label="Đóng" data-id="42">X</button>
```

### Luật 4 — `style` nhận object, không nhận chuỗi

```tsx
// ❌ HTML
<div style="color: red; font-size: 16px">

// ✓ JSX
<div style={{ color: "red", fontSize: 16 }}>
```

Hai dấu ngoặc nhọn không phải cú pháp đặc biệt: cặp ngoài là "vào chế độ JavaScript" (mục 3), cặp trong là một object literal bình thường. Tên thuộc tính CSS viết camelCase giống `el.style.fontSize` ở file `08` chặng 2. Số không đơn vị được hiểu là `px`.

Nhưng nhớ lời khuyên ở file `08` chặng 2: **ưu tiên đổi class, hạn chế style inline**. Mục 9 nói cách làm.

### Luật 5 — Comment viết trong ngoặc nhọn

```tsx
return (
  <div>
    {/* Đây là comment trong JSX */}
    <p>Nội dung</p>
  </div>
);
```

`<!-- -->` của HTML không dùng được.

---

## 3. Ngoặc nhọn — cửa sổ vào JavaScript

Bên trong JSX, `{ }` cho phép bạn chèn **bất kỳ biểu thức JavaScript nào**:

```tsx
const ten = "An";
const gia = 150000;
const tags = ["mới", "giảm giá"];

return (
  <div>
    <h2>Xin chào {ten}</h2>
    <p>Giá: {gia.toLocaleString("vi-VN")}đ</p>
    <p>Sau thuế: {Math.round(gia * 1.1)}đ</p>
    <p>{tags.join(", ")}</p>
    <img src={`/anh/${ten}.png`} alt={ten} />
  </div>
);
```

Dùng được ở hai chỗ: **nội dung** giữa hai thẻ, và **giá trị thuộc tính** (thay cho dấu nháy).

```tsx
<img src="/logo.png" />          // chuỗi cố định → dấu nháy
<img src={duongDanAnh} />        // giá trị từ biến → ngoặc nhọn
<img src="{duongDanAnh}" />      // ❌ sai — đây là chuỗi "{duongDanAnh}" theo nghĩa đen
```

### Biểu thức, không phải câu lệnh

Trong `{ }` chỉ được đặt **biểu thức** — thứ trả về một giá trị. Không đặt được **câu lệnh** như `if`, `for`, `while`, khai báo biến.

```tsx
// ❌ Lỗi cú pháp
<p>{if (daXong) { "Xong" }}</p>
<ul>{for (const x of ds) { <li>{x}</li> }}</ul>

// ✓ Dùng biểu thức tương đương
<p>{daXong ? "Xong" : "Chưa"}</p>
<ul>{ds.map((x) => <li key={x}>{x}</li>)}</ul>
```

Vì sao? Lại nhìn về mục 1: nội dung trong `{ }` trở thành một **đối số** của lời gọi `jsx(...)`. Bạn không thể truyền một câu lệnh `if` làm đối số cho hàm — chỉ truyền được giá trị.

Đây cũng là lý do `map` (file `04` chặng 2) trở thành cách duy nhất để render danh sách: nó là **biểu thức** trả về mảng. Vòng `for` thì không. Chi tiết ở file `04`.

### Cái gì render được, cái gì không

| Giá trị trong `{ }` | Hiển thị |
|---|---|
| Chuỗi, số | Hiện ra như text |
| React element | Hiện ra phần tử đó |
| Mảng (chuỗi, số, element) | Hiện từng phần tử nối tiếp |
| `true`, `false` | **Không hiện gì** |
| `null`, `undefined` | **Không hiện gì** |
| `0` | **Hiện số `0`** ← bẫy |
| `NaN` | Hiện `NaN` |
| Object thường `{ a: 1 }` | **Lỗi**: Objects are not valid as a React child |

Hai dòng cần nhớ kỹ nhất:

```tsx
const user = { ten: "An", tuoi: 22 };
return <p>{user}</p>;
// ❌ Objects are not valid as a React child
return <p>{user.ten}</p>;
// ✓
```

Khi gặp lỗi "Objects are not valid as a React child", gần như luôn là bạn quên lấy ra một thuộc tính cụ thể. Một trường hợp hay gặp nữa: render thẳng một `Date` — `{new Date()}` cũng lỗi, phải chuyển sang chuỗi trước.

Dòng `0` sẽ được nói kỹ ở mục 4.

---

## 4. Render có điều kiện

Không có `if` trong JSX, nhưng có ba cách thay thế.

### Cách 1 — Toán tử ba ngôi

```tsx
<p>{daDangNhap ? `Chào ${ten}` : "Vui lòng đăng nhập"}</p>

<button className={dangChon ? "nut nut-chon" : "nut"}>Lọc</button>
```

Dùng khi có **hai** nhánh.

### Cách 2 — `&&`

```tsx
{coLoi && <p className="loi">{thongBaoLoi}</p>}
```

Dùng khi chỉ có **một** nhánh: có thì hiện, không thì thôi.

Cách hoạt động: nhớ file `01` chặng 2 — `a && b` trả về `a` nếu `a` falsy, ngược lại trả về `b`. Khi `coLoi` là `false`, biểu thức trả về `false` → không hiện gì (bảng mục 3). Khi `coLoi` là `true`, trả về phần tử `<p>`.

### Cái bẫy số `0`

```tsx
const soThongBao = 0;

return <div>{soThongBao && <span>Bạn có {soThongBao} thông báo</span>}</div>;
// Màn hình hiện: 0
```

`soThongBao` là `0` → falsy → `&&` trả về chính `0`. Và theo bảng ở mục 3, `0` **được** render ra màn hình.

Đây là bug React kinh điển. Gặp ở các danh sách rỗng (`{ds.length && ...}`), bộ đếm, giỏ hàng.

```tsx
// Cách sửa — luôn để vế trái là boolean thật
{soThongBao > 0 && <span>...</span>}
{ds.length > 0 && <DanhSach ds={ds} />}
{Boolean(soThongBao) && <span>...</span>}
```

**Quy tắc:** vế trái của `&&` trong JSX phải là **boolean**. Nếu đó là một con số, so sánh nó với gì đó trước.

### Cách 3 — `if` bên ngoài JSX

Khi logic phức tạp, đưa ra ngoài phần `return`:

```tsx
function TrangThaiDonHang({ trangThai }: { trangThai: string }) {
  if (trangThai === "huy") {
    return <p className="loi">Đơn hàng đã bị hủy</p>;
  }

  let nhan;
  if (trangThai === "giao") nhan = "Đang giao hàng";
  else if (trangThai === "xong") nhan = "Đã giao thành công";
  else nhan = "Đang xử lý";

  return <p>{nhan}</p>;
}
```

Hai kỹ thuật ở đây:

- **Return sớm** — giống thu hẹp kiểu ở file `06` chặng 3. Xử lý trường hợp đặc biệt trước, phần còn lại gọn hơn
- **Biến trung gian** — tính toán bằng câu lệnh thường, rồi chèn kết quả vào JSX

Một component có thể `return null` để **không render gì cả**:

```tsx
function ThongBao({ noiDung }: { noiDung: string }) {
  if (!noiDung) return null;
  return <div className="thong-bao">{noiDung}</div>;
}
```

### Tránh lồng ba ngôi

```tsx
// ❌ Khó đọc
{dangTai ? <Spinner /> : coLoi ? <Loi /> : duLieu.length === 0 ? <Rong /> : <DanhSach />}
```

Hai tầng là giới hạn hợp lý. Nhiều hơn thì dùng cách 3. Và với trạng thái loại trừ lẫn nhau như trên, nhớ lại discriminated union ở file `06` chặng 3 — đó là cách mô hình hóa sạch nhất, kết hợp với `switch` ngoài JSX.

---

## 5. React tự thoát chuỗi — an toàn mặc định

Nhớ lại thí nghiệm XSS ở bài 3 file `08` chặng 2:

```tsx
const binhLuan = '<img src="x" onerror="alert(\'XSS!\')">';

return <p>{binhLuan}</p>;
```

Kết quả: màn hình hiện **đúng nguyên văn chuỗi** đó, không có `alert` nào chạy.

React đối xử với mọi chuỗi trong `{ }` như `textContent`, không bao giờ như `innerHTML`. Bạn được bảo vệ khỏi XSS **mặc định**, không cần làm gì thêm. Đây là một lợi ích lớn so với chặng 2, nơi bạn phải tự nhớ dùng `textContent`.

### Lối thoát có tên đáng sợ

Khi thật sự cần chèn HTML (ví dụ nội dung bài viết đã được server làm sạch):

```tsx
<div dangerouslySetInnerHTML={{ __html: noiDungHtml }} />
```

Tên dài và đáng sợ là **cố ý**. Nó nhắc bạn rằng mọi bảo vệ đã bị tắt, và bạn chịu hoàn toàn trách nhiệm. Không bao giờ truyền dữ liệu người dùng nhập vào đây mà chưa qua làm sạch.

### Chỗ React không bảo vệ được

```tsx
const trangCaNhan = layTuNguoiDung();   // người dùng nhập: "javascript:alert(1)"
return <a href={trangCaNhan}>Trang của tôi</a>;
```

URL có giao thức `javascript:` sẽ chạy code khi bấm vào. Các phiên bản React gần đây đã cảnh báo và chặn trường hợp này, nhưng **đừng dựa vào đó** — khi URL đến từ người dùng, tự kiểm tra nó bắt đầu bằng `http://` hoặc `https://`.

---

## 6. Component

### Định nghĩa

Một component là **một hàm JavaScript trả về JSX**.

```tsx
function TheSanPham() {
  return (
    <div className="the">
      <h3>Bàn phím cơ</h3>
      <p>1.500.000đ</p>
    </div>
  );
}
```

Dùng nó như một thẻ HTML:

```tsx
function App() {
  return (
    <main>
      <h1>Cửa hàng</h1>
      <TheSanPham />
      <TheSanPham />
      <TheSanPham />
    </main>
  );
}
```

Ba thẻ sản phẩm giống hệt nhau — chưa hữu ích lắm. File `02` (props) sẽ cho mỗi thẻ hiện dữ liệu khác nhau.

### Tên component phải viết hoa chữ cái đầu

```tsx
function theSanPham() { return <div>...</div>; }

<theSanPham />
// React hiểu đây là thẻ HTML tên "thesanpham" — không phải component của bạn
```

Đây là cách React phân biệt: **chữ thường** → thẻ HTML có sẵn (`div`, `button`). **Chữ hoa** → component bạn tự viết. Bạn đã gặp lỗi này ở bài 4 file `00`.

Quy ước đặt tên **PascalCase**: `TheSanPham`, `ThanhTimKiem`, `DanhSachViec`.

### Component trong component

```tsx
function DauTrang() {
  return (
    <header>
      <Logo />
      <ThanhDieuHuong />
    </header>
  );
}

function App() {
  return (
    <>
      <DauTrang />
      <NoiDung />
      <ChanTrang />
    </>
  );
}
```

Component có thể chứa component khác, tạo thành **cây component** — đúng thứ bạn đã vẽ cho Pokédex ở bài 5 file `00`, và thứ bạn thấy trong tab Components của React DevTools.

### Không định nghĩa component bên trong component

```tsx
// ❌ ĐỪNG
function App() {
  function NutBam() {           // định nghĩa BÊN TRONG App
    return <button>Bấm</button>;
  }
  return <NutBam />;
}

// ✓ Định nghĩa ở cấp cao nhất của file
function NutBam() {
  return <button>Bấm</button>;
}
function App() {
  return <NutBam />;
}
```

Mỗi lần `App` chạy, một hàm `NutBam` **mới** được tạo ra (nhớ file `01` chặng 2: hai hàm giống hệt nhau vẫn khác tham chiếu). React thấy "loại component" đã khác, nên **hủy toàn bộ** cái cũ và dựng lại từ đầu — mất sạch state bên trong, kể cả nội dung ô input đang gõ dở. Hiện tượng này sẽ được giải thích đầy đủ ở file `11`. Giờ chỉ cần nhớ quy tắc.

### Mỗi component một file

```
src/
├── App.tsx
└── components/
    ├── DauTrang.tsx
    ├── TheSanPham.tsx
    └── NutBam.tsx
```

```tsx
// components/TheSanPham.tsx
export default function TheSanPham() {
  return <div className="the">...</div>;
}
```

```tsx
// App.tsx
import TheSanPham from "@/components/TheSanPham";
```

Nhớ file `13` chặng 2: default export cho file chỉ xuất **một** thứ chính — đúng trường hợp của component. Nhiều dự án dùng named export cho component; cả hai đều phổ biến. Chọn một và giữ nhất quán.

Tên file trùng tên component. Đuôi `.tsx` vì có JSX.

### Kiểu trả về

Bạn **không cần** chú thích kiểu trả về cho component — TypeScript tự suy ra (file `06` chặng 3, mục 4). Bạn có thể gặp các cách viết sau trong dự án khác:

```tsx
function A(): JSX.Element { ... }
const B: React.FC = () => { ... };
```

Cả hai đều chạy được, nhưng không bắt buộc. Cách viết đơn giản nhất — hàm thường, không chú thích kiểu trả về — là đủ và đang ngày càng phổ biến.

---

## 7. Component phải thuần khiết

Đây là mục quan trọng nhất của file.

Nhớ công thức ở file `00`: `UI = f(state)`. Một hàm "đúng nghĩa toán học" có hai tính chất:

1. **Cùng đầu vào → luôn cùng đầu ra**
2. **Không làm thay đổi gì bên ngoài nó** (không có tác dụng phụ)

React **giả định** mọi component của bạn thỏa mãn cả hai. Hàm như vậy gọi là **hàm thuần** (pure function).

### Vi phạm

```tsx
let dem = 0;

function Khach() {
  dem = dem + 1;               // sửa biến bên ngoài trong lúc render
  return <p>Khách số {dem}</p>;
}

function App() {
  return (
    <>
      <Khach />
      <Khach />
      <Khach />
    </>
  );
}
```

Bạn mong đợi: "Khách số 1", "Khách số 2", "Khách số 3".

Chạy ở chế độ dev với `StrictMode`: "Khách số 2", "Khách số 4", "Khách số 6".

Đây chính là lý do `StrictMode` render mỗi component **hai lần** (file `00`, mục 8). Một component thuần thì render bao nhiêu lần cũng cho cùng kết quả. Component không thuần thì lộ ngay. `StrictMode` không gây ra bug — nó **phơi bày** bug có sẵn.

### Vì sao React cần điều này

React tự quyết định **khi nào** và **bao nhiêu lần** gọi hàm component của bạn. Nó có thể gọi lại khi cha render lại, có thể gọi rồi bỏ kết quả, có thể tạm dừng giữa chừng. Nếu component có tác dụng phụ, mỗi lần gọi thêm là một lần tác dụng phụ xảy ra thêm — và hành vi ứng dụng trở nên không đoán trước được.

### Những gì không được làm trong lúc render

```tsx
function SaiLam() {
  bienNgoai.push(1);                     // ❌ sửa dữ liệu bên ngoài
  document.title = "Trang mới";          // ❌ chạm vào DOM trực tiếp
  fetch("/api/log");                      // ❌ gọi API
  localStorage.setItem("x", "1");         // ❌ ghi lưu trữ
  const id = Math.random();               // ⚠ kết quả khác nhau mỗi lần gọi
  return <p>...</p>;
}
```

Vậy những việc đó làm ở đâu? Ở hai chỗ:

- **Trong hàm xử lý sự kiện** (`onClick`, `onSubmit`) — file `03`. Đây là nơi chính
- **Trong `useEffect`** — file `06`, cho những việc cần đồng bộ với thế giới bên ngoài

### Được phép: tạo và sửa dữ liệu *cục bộ*

```tsx
function DanhSachDaSapXep({ ds }: { ds: number[] }) {
  const banSao = [...ds];        // tạo mới trong lúc render — OK
  banSao.sort((a, b) => a - b);   // sửa bản sao của chính mình — OK
  return <p>{banSao.join(", ")}</p>;
}
```

Sửa thứ **chính hàm vừa tạo ra** thì không phải tác dụng phụ — không ai bên ngoài thấy được. Điều bị cấm là sửa thứ **đã tồn tại trước** khi hàm chạy. Nhớ bảng method sửa mảng gốc ở file `04` chặng 2 — `ds.sort()` trực tiếp trên dữ liệu được truyền vào là vi phạm.

---

## 8. Sự kiện — xem trước

File `03` sẽ dạy kỹ, nhưng bạn cần biết ngay một cái bẫy:

```tsx
function xinChao() {
  alert("Xin chào");
}

<button onClick={xinChao}>Bấm</button>      // ✓ truyền HÀM
<button onClick={xinChao()}>Bấm</button>    // ❌ GỌI hàm ngay khi render
```

Dòng thứ hai gọi `xinChao()` **ngay lúc render**, rồi truyền kết quả (`undefined`) vào `onClick`. `alert` hiện lên ngay khi trang tải, và bấm nút thì không có gì xảy ra.

Đúng cái bẫy của `setTimeout(fn())` hay `addEventListener("click", fn())` ở chặng 2. Truyền tên hàm, không gọi nó. Cần truyền đối số thì bọc trong arrow function:

```tsx
<button onClick={() => xoa(id)}>Xóa</button>
```

---

## 9. CSS trong React

### Cách 1 — Import file CSS thường

```tsx
import "./TheSanPham.css";
```

Đơn giản, nhưng **mọi class đều là toàn cục**. Hai component cùng đặt class `.tieu-de` là đè nhau — đúng vấn đề của biến toàn cục ở file `13` chặng 2.

### Cách 2 — CSS Modules (khuyến nghị)

Đặt tên file có `.module.css`:

```css
/* TheSanPham.module.css */
.the {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
}

.tieuDe {
  font-size: 18px;
}

.dangChon {
  border-color: blue;
}
```

```tsx
import styles from "./TheSanPham.module.css";

export default function TheSanPham() {
  return (
    <div className={styles.the}>
      <h3 className={styles.tieuDe}>Bàn phím</h3>
    </div>
  );
}
```

Vite tự động đổi tên class khi build — `.the` thành dạng `.the_a3f5c` duy nhất. Hai component dùng chung tên `.the` cũng không đè nhau. Đây là **ES Module cho CSS**: mỗi file có phạm vi riêng.

Vite hỗ trợ CSS Modules sẵn, không cần cài thêm gì. Đặt tên class bằng camelCase để truy cập bằng dấu chấm cho gọn (`styles.tieuDe` thay vì `styles["tieu-de"]`).

### Class có điều kiện

```tsx
<div className={dangChon ? `${styles.the} ${styles.dangChon}` : styles.the}>
```

Viết vậy nhanh chóng rối khi có nhiều điều kiện. Một hàm nhỏ giải quyết:

```tsx
function cx(...lop: (string | false | null | undefined)[]) {
  return lop.filter(Boolean).join(" ");
}

<div className={cx(styles.the, dangChon && styles.dangChon, hetHang && styles.mo)} />
```

Đây là `filter(Boolean)` ở file `04` chặng 2: loại bỏ các giá trị falsy, nối phần còn lại. Thư viện `clsx` làm đúng việc này — rất phổ biến trong dự án thật. Tự viết một lần để hiểu nó, sau này cài thư viện cũng được.

### Còn Tailwind?

Tailwind là cách tiếp cận rất phổ biến hiện nay, nằm ở chặng 6. Ở chặng 4 dùng CSS Modules để giữ trọng tâm vào React.

---

## 10. Lỗi thường gặp

| Thông báo / hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Adjacent JSX elements must be wrapped in an enclosing tag` | Nhiều phần tử gốc | Bọc trong `<>...</>` |
| `Expected corresponding JSX closing tag` | Thẻ chưa đóng, thường là `<img>`, `<input>`, `<br>` | Thêm `/>` |
| `Invalid DOM property 'class'. Did you mean 'className'?` | Dùng tên thuộc tính HTML | `className`, `htmlFor` |
| `Objects are not valid as a React child` | Render nguyên một object hoặc `Date` | Lấy thuộc tính cụ thể, hoặc chuyển thành chuỗi |
| Màn hình hiện số `0` lạc lõng | `{soLuong && ...}` với `soLuong = 0` | `{soLuong > 0 && ...}` |
| Component không hiện, DevTools thấy thẻ HTML lạ | Tên component viết thường | PascalCase |
| `The style prop expects a mapping from style properties to values, not a string` | `style="..."` dạng chuỗi | `style={{ ... }}` |
| Hàm xử lý chạy ngay khi trang tải | `onClick={fn()}` | `onClick={fn}` hoặc `onClick={() => fn(x)}` |
| Ô input mất nội dung mỗi khi gõ | Component được định nghĩa bên trong component khác | Đưa ra cấp cao nhất của file |
| Giá trị hiển thị gấp đôi mong đợi khi dev | Component có tác dụng phụ lúc render | Làm cho component thuần (mục 7) |
| `'X' is not defined` / `Cannot find module` | Quên `import` component | Thêm `import` |

---

## 11. Tóm tắt cần thuộc

1. JSX không phải HTML — nó được dịch thành lời gọi hàm trả về **object** mô tả giao diện
2. React element (object mô tả) ≠ component (hàm) ≠ DOM node (thẻ thật)
3. Một phần tử gốc — dùng Fragment `<>...</>` khi không muốn thẻ thừa
4. Mọi thẻ phải đóng; thuộc tính camelCase: `className`, `htmlFor`, `onClick`
5. `style` nhận object: `style={{ fontSize: 16 }}`
6. `{ }` nhận **biểu thức**, không nhận câu lệnh
7. `true`, `false`, `null`, `undefined` không render gì; **`0` thì có**
8. Object thường không render được
9. Điều kiện: ba ngôi cho hai nhánh, `&&` với vế trái **boolean**, `if` + return sớm cho logic phức tạp
10. React tự thoát chuỗi — an toàn trước XSS mặc định; `dangerouslySetInnerHTML` là lối thoát có chủ đích
11. Component là hàm trả về JSX, tên **PascalCase**
12. Không định nghĩa component bên trong component khác
13. Component phải **thuần**: cùng đầu vào cùng đầu ra, không tác dụng phụ lúc render
14. `StrictMode` render hai lần để **phơi bày** component không thuần
15. `onClick={fn}`, không phải `onClick={fn()}`
16. CSS Modules (`.module.css`) cho class có phạm vi riêng

---

## Bài tập

Làm trong `bai-tap/src/bai-01/`. Sửa `App.tsx` để hiển thị component của bài đang làm.

### Bài 1 — Đoán kết quả render

Với mỗi dòng, ghi vào `ghi-chu.md` thứ bạn **đoán** sẽ hiện trên màn hình, rồi chạy thử:

```tsx
export default function DoanRender() {
  const so = 0;
  const rong = "";
  const ds: string[] = [];
  const user = { ten: "An" };
  const coCo = true;

  return (
    <ul>
      <li>1: {so}</li>  => 1: 0
      <li>2: {rong}</li> =>2: 
      <li>3: {true}</li> => 3: 
      <li>4: {null}</li> => 4: 
      <li>5: {undefined}</li> => 5: 
      <li>6: {NaN}</li> => 6: NaN
      <li>7: {so && "có số"}</li> => 7: 0
      <li>8: {rong && "có chuỗi"}</li> => 8: 
      <li>9: {ds.length && "có phần tử"}</li> => 9: 0
      <li>10: {ds.length > 0 && "có phần tử"}</li> => 10: có phần tử
      ❌ SAI — đúng là "10: " (trống). ds rỗng nên ds.length = 0, và 0 > 0 là false → false && ... trả về false, mà React không vẽ gì cho boolean. Đây chính là cách SỬA câu 9: so sánh trước để vế trái là boolean, không phải số 0.
      <li>11: {coCo && "có cờ"}</li> => 11: có cờ
      <li>12: {coCo || "không cờ"}</li> => 12: 
      <li>13: {[1, 2, 3]}</li> => 13: 1 2 3
      ❌ SAI — đúng là "13: 123" (dính liền, không có dấu cách). React render mảng bằng cách vẽ lần lượt từng phần tử cạnh nhau, không tự chèn dấu cách hay dấu phẩy. Muốn có dấu phân cách thì phải tự làm, như câu 14 dùng .join(" - ").
      <li>14: {["a", "b"].join(" - ")}</li> 14: a - b 
      <li>15: {user.ten}</li> => 15: An
      <li>16: {"<b>đậm</b>"}</li> => 16: đậm ( có in đậm)
      ❌ SAI — đúng là hiện nguyên văn "16: <b>đậm</b>", cả dấu < > và chữ b, KHÔNG in đậm. Đây là chuỗi, và React tự thoát (escape) mọi chuỗi nên nó chỉ là chữ, không bao giờ thành thẻ HTML (xem mục 5 — an toàn mặc định chống XSS). Muốn in đậm phải viết thẻ JSX thật: <b>đậm</b>, không bọc trong ngoặc kép.
      <li>17: {so ?? "rỗng"}</li> => 17: 0
      <li>18: {so || "rỗng"}</li> => 18: rỗng
    </ul>
  );
}
```

Sau đó thêm dòng `<li>19: {user}</li>` — ghi lại thông báo lỗi, rồi xóa đi.

Câu 7, 9, 12 là những câu dễ sai nhất. Câu 17 và 18 nối lại `??` và `||` ở file `03` chặng 2.

### Bài 2 — Sửa JSX hỏng

Mỗi component sau có ít nhất một lỗi. Ghi lỗi vào `ghi-chu.md`, rồi sửa:

```tsx
function A() {
  return (
    <h1>Tiêu đề</h1>
    <p>Đoạn văn</p>
  );
} => lỗi quy tắc 1 chỉ được trả về 1 JSX thôi

function B() {
  return <img src="logo.png" class="logo">;
} => lỗi phải đổi class thành className và không có đóng

function C() {
  return (
    <label for="email">Email</label>
    <input id="email" type="email">
  );
} => lỗi quy tắc 1 chỉ được trả về 1 JSX thôi, lỗi input chưa có đóng, phải đổi for thành htmlFor

function D() {
  const mau = "red";
  return <p style="color: {mau}; font-size: 20px">Chữ đỏ</p>;
} => lỗi style nhận object không nhận chuỗi
function E() {
  const daXong = true;
  return <p>{if (daXong) { "Đã xong" } else { "Chưa xong" }}</p>;
} => lỗi không dùng if trong {}

function f() {
  return <div>Component F</div>;
} => lỗi hàm f không viết hoa, 
  ⚠️ CHẨN ĐOÁN ĐÚNG nhưng Sua.tsx CHƯA SỬA — vẫn là `function f()`. Nói rõ hơn vì sao sai: bản thân hàm viết thường không lỗi, lỗi xảy ra khi dùng nó `<f />` — JSX thấy chữ thường nên coi là thẻ HTML tên "f" (không tồn tại), không gọi hàm của bạn → không hiện gì (xem mục 6, "Tên component phải viết hoa").

function G() {
  const thoiGian = new Date();
  return <p>Bây giờ là {thoiGian}</p>;
} => lỗi render thẳng 1 date
  ⚠️ CHẨN ĐOÁN ĐÚNG nhưng THIẾU lý do và Sua.tsx CHƯA SỬA. Lý do: Date là một object, mà React không render được object → lỗi "Objects are not valid as a React child". Gợi ý sửa: biến Date thành CHUỖI trước khi đặt vào {} — Date có sẵn các method trả về chuỗi, tìm họ toLocale...() (xem mục 3, "Cái gì render được").

function H() {
  function chao() { alert("Xin chào"); }
  return <button onclick={chao()}>Chào</button>;
} => lỗi gọi thẳng hàm trong {} chỉ nên truyền callback không gọi nó, onclick viết sai phải là onClick
```

### Bài 3 — Render có điều kiện

Viết component `TrangThaiTaiKhoan` nhận dữ liệu cố định (khai báo ngay trong component, chưa cần props):

```tsx
const taiKhoan = {
  ten: "Nguyễn Văn An",
  vaiTro: "admin" as "admin" | "thanh-vien" | "khach",
  soThongBao: 0,
  daXacThucEmail: false,
  bienLaiGanNhat: null as string | null,
};
```

Yêu cầu hiển thị:

1. Lời chào kèm tên
2. Huy hiệu vai trò: "Quản trị viên" / "Thành viên" / "Khách", mỗi loại một màu (dùng CSS Modules). Dùng `switch` bên ngoài JSX hoặc một object tra cứu — **không** lồng ba ngôi
3. Số thông báo — **chỉ hiện khi lớn hơn 0**. Đổi `soThongBao` thành `0` và `5` để kiểm tra, chắc chắn không có số `0` lạc lõng
4. Cảnh báo "Vui lòng xác thực email" chỉ khi `daXacThucEmail` là `false`
5. Biên lai gần nhất nếu có, ngược lại hiện "Chưa có giao dịch"
6. Nếu `vaiTro` là `"khach"`, toàn bộ component chỉ hiện một nút "Đăng nhập" — dùng return sớm

Thử mọi tổ hợp giá trị bằng cách sửa dữ liệu, chụp lại từng trường hợp.

### Bài 4 — Chuyển trang HTML thành component (bài chính)

Chọn **một** trang trong số các bài tập ở chặng 1 (hoặc giao diện Pokédex), tốt nhất là trang có nhiều khối lặp lại.

1. Copy toàn bộ HTML vào một component React
2. Sửa hết lỗi JSX theo các luật ở mục 2 — ghi lại mỗi loại lỗi bạn đã sửa và số lần gặp
3. Chuyển CSS sang **CSS Modules**
4. **Tách thành component**: tối thiểu 5 component, mỗi cái một file trong `components/`. Ví dụ với trang sản phẩm: `DauTrang`, `ThanhDieuHuong`, `TheSanPham`, `LuoiSanPham`, `ChanTrang`
5. Dữ liệu lặp lại (ví dụ danh sách sản phẩm) — khai báo thành một mảng ở đầu file, render bằng `map`. Bạn sẽ thấy cảnh báo về `key` trong Console; tạm thêm `key={index}` để tắt nó (file `04` sẽ giải thích vì sao đây **không** phải cách đúng)
6. Mở React DevTools, chụp lại cây component — so với bản vẽ cây Pokédex ở bài 5 file `00`, cách chia của bạn có hợp lý không?

Ghi vào `ghi-chu.md`: lúc tách component, bạn gặp khó ở đâu? Thường câu trả lời sẽ là *"các thẻ sản phẩm giống nhau về cấu trúc nhưng cần hiện dữ liệu khác nhau"* — đó chính xác là vấn đề mà props (file `02`) giải quyết.

### Bài 5 — Component không thuần

1. Dán ví dụ `Khach` ở mục 7 vào dự án, chạy với `StrictMode` — ghi lại kết quả thật
2. Tạm gỡ `StrictMode` trong `main.tsx`, chạy lại — kết quả khác thế nào? Giải thích
3. Khôi phục `StrictMode`
4. Viết một component `DanhSachSapXep` nhận mảng số khai báo ở **ngoài** component, hiện danh sách đã sắp xếp. Viết hai bản: một bản dùng `ds.sort()` trực tiếp, một bản sao chép trước rồi sắp. Ở cả hai bản, sau khi render, `console.log` mảng gốc bên ngoài — bản nào làm hỏng dữ liệu gốc?
5. Viết `ThoiGianHienTai` hiện `new Date().toLocaleTimeString()`. Nó có thuần không? Vì sao? (Gợi ý: cùng đầu vào — không có đầu vào nào — có cho cùng đầu ra không?) Ghi suy nghĩ vào `ghi-chu.md`; file `06` sẽ trả lời cách xử lý đúng => không thuần vì cùng đầu vào khác đầu ra

### Bài 6 — XSS

1. Render chuỗi `'<img src=x onerror="alert(\'XSS\')">'` bằng `{ }` — có `alert` không?
2. Render cùng chuỗi bằng `dangerouslySetInnerHTML` — có không?
3. So sánh với bài 3 file `08` chặng 2: trong React, cách nào tương ứng với `textContent`, cách nào tương ứng với `innerHTML`?
4. Ghi vào `ghi-chu.md`: khi nào bạn nghĩ mình thật sự cần dùng `dangerouslySetInnerHTML`?

### Bài 7 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. JSX được dịch thành gì? Vì sao điều đó giải thích được luật "chỉ một phần tử gốc" và "chỉ biểu thức trong ngoặc nhọn"?
2. React element, component, DOM node khác nhau thế nào?
3. Vì sao `{soLuong && <X />}` có thể hiện số `0` ra màn hình?
4. Component thuần là gì? Vì sao React cần component thuần?
5. Vì sao `StrictMode` render hai lần lại giúp ích?
6. Vì sao tên component phải viết hoa chữ cái đầu?

---

## Xong file này khi

- [ ] Bài 1 đủ 18 câu có phần đoán viết trước, giải thích được câu 7, 9, 12
- [ ] Bài 2 sửa đúng cả 8 component, ghi rõ từng lỗi
- [ ] Bài 3 không có số `0` lạc lõng, không lồng ba ngôi
- [ ] Bài 4: trang HTML thành tối thiểu 5 component, CSS Modules, có ảnh cây component trong DevTools
- [ ] Bài 5: giải thích được vì sao `Khach` cho kết quả khác khi có và không có `StrictMode`
- [ ] Trả lời được 6 câu ở bài 7 bằng lời

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-01` trên GitHub, kèm **"viết file 02-props-va-composition"**.