# 09 — `useMemo`, `useCallback` và tối ưu render

> **Cần có trước:** xong `03` (mục 6 — ba lý do render lại, `Object.is`), `06` (mục 10 — object và hàm làm phụ thuộc), `07` (mục 6 — đừng đưa state lên quá cao). Nhớ file `01` chặng 2 (so sánh tham chiếu), file `05` chặng 2 (memoize).
> **Thời gian:** 4 giờ.
> **Vì sao quan trọng:** đây là chủ đề phỏng vấn React rất quen thuộc — *"`useMemo` và `useCallback` khác nhau thế nào, khi nào dùng?"*. Nhưng điều quan trọng nhất của file này không phải cú pháp, mà là: **phần lớn thời gian bạn không cần chúng**. Người dùng sai còn tệ hơn người không dùng.

---

## 1. Điểm xuất phát: render lại thường là rẻ

Nhớ mục 6 file `03`: một component render lại khi state của nó đổi, và **mọi con** của nó render lại theo.

Nghe có vẻ lãng phí. Nhưng nhớ lại cơ chế:

1. "Render" là React **gọi hàm component** để lấy JSX — tức là tạo ra các object JavaScript nhẹ (mục 1 file `01`)
2. React so sánh kết quả mới với cũ
3. React **chỉ chạm DOM** ở những chỗ thật sự khác

Bước 1 và 2 diễn ra hoàn toàn trong JavaScript, và JavaScript rất nhanh. Bước 3 — phần đắt (mục 8 file `08` chặng 2) — chỉ xảy ra khi có thay đổi thật.

Một component với vài chục phần tử render lại mất vài phần trăm mili giây. Màn hình cập nhật 60 lần mỗi giây, tức mỗi khung hình có khoảng 16 mili giây. Còn rất nhiều chỗ trống.

**Render lại tự nó không phải là vấn đề.** Vấn đề chỉ xuất hiện khi:

- Một component **tính toán nặng** trong lúc render (lọc, sắp xếp, tổng hợp hàng chục nghìn phần tử)
- Một cây component **rất lớn** render lại liên tục (mỗi phím gõ, mỗi lần cuộn)
- Bạn **đo được** độ trễ mà người dùng cảm nhận thấy

Khi chưa có cả ba dấu hiệu đó, đừng tối ưu.

---

## 2. Đo trước, tối ưu sau

Nguyên tắc này áp dụng cho mọi tối ưu hiệu năng trong lập trình, không riêng React.

### React DevTools Profiler

Tab **Profiler** của React DevTools (mục 9 file `00`):

1. Bấm nút ghi (hình tròn)
2. Làm thao tác bạn thấy chậm — gõ vào ô tìm kiếm, bấm nút
3. Bấm dừng

Bạn thấy:

- **Mỗi lần commit** (mỗi lần React cập nhật DOM) là một cột
- **Flamegraph** — cây component, độ rộng mỗi thanh là thời gian render của nó. Màu xám là component **không** render lại
- Bấm vào một component để xem nó render bao nhiêu lần, mất bao lâu mỗi lần

Trong phần cài đặt Profiler, bật **"Record why each component rendered while profiling"**. Mỗi component sẽ hiện lý do nó render: state đổi, props đổi (prop nào), hay cha render lại.

### Đo bằng tay

```tsx
console.time("loc");
const dsDaLoc = locVaSapXep(ds, boLoc);
console.timeEnd("loc");   // loc: 0.42 ms
```

Tài liệu React gợi ý một ngưỡng tham khảo: một phép tính mất **từ khoảng 1 mili giây trở lên** thì mới đáng cân nhắc ghi nhớ kết quả.

### Đo đúng môi trường

Chế độ dev chậm hơn production đáng kể: `StrictMode` render hai lần, React chạy thêm rất nhiều kiểm tra. Số đo ở dev phóng đại vấn đề. Trước khi kết luận "chậm", thử `npm run build && npm run preview` (mục 8 file `04` chặng 3) xem cảm giác thật thế nào.

Một cách khác để mô phỏng máy yếu: DevTools → tab Performance → **CPU throttling** (giảm tốc CPU 4 hoặc 6 lần). Người dùng của bạn không phải ai cũng có máy mạnh như máy lập trình.

---

## 3. Trước khi dùng công cụ — sửa cấu trúc

Hai kỹ thuật này giải quyết phần lớn vấn đề render thừa mà **không cần** `memo`, `useMemo` hay `useCallback`.

### Kỹ thuật 1 — Đưa state xuống

```tsx
function TrangChu() {
  const [tuKhoa, setTuKhoa] = useState("");

  return (
    <>
      <input value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} />
      <p>Bạn đang gõ: {tuKhoa}</p>
      <BieuDoNang />           {/* không dùng tuKhoa, nhưng vẫn render lại mỗi phím gõ */}
      <DanhSachDai />          {/* tương tự */}
    </>
  );
}
```

`tuKhoa` chỉ được dùng bởi ô nhập và một dòng chữ. Tách chúng ra:

```tsx
function OTimKiem() {
  const [tuKhoa, setTuKhoa] = useState("");
  return (
    <>
      <input value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} />
      <p>Bạn đang gõ: {tuKhoa}</p>
    </>
  );
}

function TrangChu() {
  return (
    <>
      <OTimKiem />
      <BieuDoNang />
      <DanhSachDai />
    </>
  );
}
```

Gõ phím chỉ làm `OTimKiem` render lại. `BieuDoNang` và `DanhSachDai` không bị ảnh hưởng.

Đây chính là **colocation** ở mục 6 file `07`: giữ state gần nơi dùng nhất có thể. Mình đã nói lúc đó rằng đưa state lên quá cao khiến cả ứng dụng nhấp nháy theo từng phím gõ. Đây là cách sửa.

### Kỹ thuật 2 — Đưa nội dung lên, truyền qua `children`

Đôi khi state **phải** nằm ở trên, vì nó ảnh hưởng tới khung bao ngoài:

```tsx
function TrangCuon() {
  const [daCuon, setDaCuon] = useState(false);
  // ... lắng nghe cuộn, setDaCuon(window.scrollY > 100)

  return (
    <div className={daCuon ? "dau-thu-gon" : "dau-day-du"}>
      <NoiDungRatNang />    {/* render lại mỗi lần daCuon đổi */}
    </div>
  );
}
```

Không thể đưa `daCuon` xuống vì `<div>` bao ngoài cần nó. Nhưng có thể đưa **nội dung** lên:

```tsx
function KhungCuon({ children }: { children: ReactNode }) {
  const [daCuon, setDaCuon] = useState(false);
  // ...
  return <div className={daCuon ? "dau-thu-gon" : "dau-day-du"}>{children}</div>;
}

function App() {
  return (
    <KhungCuon>
      <NoiDungRatNang />
    </KhungCuon>
  );
}
```

Giờ `daCuon` đổi → `KhungCuon` render lại → nhưng `NoiDungRatNang` **không** render lại.

Vì sao? `<NoiDungRatNang />` được tạo ra ở **`App`**, không phải ở `KhungCuon`. Với `KhungCuon`, nó chỉ là một prop `children` — một object mà nó nhận vào. `App` không render lại, nên object đó **vẫn là object cũ**, cùng tham chiếu. React thấy phần tử con không đổi, bỏ qua nó.

Đây là composition ở mục 8 file `02`, giờ với một lợi ích bạn chưa thấy lúc đó: **component dùng `children` không làm `children` render lại.**

Hai kỹ thuật này đều là **sửa thiết kế**, không thêm công cụ nào. Thử chúng trước. Chỉ khi không áp dụng được, mới đi tiếp.

---

## 4. `useMemo` — ghi nhớ kết quả tính toán

```tsx
function DanhSachSanPham({ ds, tuKhoa, sapXep }: Props) {
  const dsHienThi = ds
    .filter((sp) => sp.ten.toLowerCase().includes(tuKhoa.toLowerCase()))
    .toSorted(soSanhTheo(sapXep));
  // ...
}
```

Nếu `ds` có 50.000 phần tử, dòng này có thể mất vài mili giây — và nó chạy lại ở **mọi** lần render, kể cả khi component render lại vì một lý do không liên quan (ví dụ đổi theme sáng/tối).

```tsx
import { useMemo } from "react";

const dsHienThi = useMemo(
  () => ds
    .filter((sp) => sp.ten.toLowerCase().includes(tuKhoa.toLowerCase()))
    .toSorted(soSanhTheo(sapXep)),
  [ds, tuKhoa, sapXep],
);
```

`useMemo(hamTinh, phuThuoc)`:

- Lần render đầu: gọi `hamTinh`, lưu kết quả
- Các lần sau: so từng phụ thuộc với lần trước bằng `Object.is`
  - Giống hết → **trả lại kết quả cũ**, không gọi `hamTinh`
  - Có cái khác → gọi lại `hamTinh`, lưu kết quả mới

Đây chính là hàm `ghiNho` (memoize) bạn tự viết ở mục 6.5 file `05` chặng 2 — chỉ khác là nó nhớ **một** kết quả gần nhất, không nhớ mọi tổ hợp đối số.

Mảng phụ thuộc theo đúng luật của `useEffect` (mục 3 file `06`): **mọi giá trị component dùng bên trong đều phải liệt kê**. `exhaustive-deps` kiểm tra cả `useMemo`.

### Hàm tính phải thuần

`useMemo` dành cho **tính toán**, không phải tác dụng phụ. Không gọi API, không `setState` bên trong. Đó là việc của effect hoặc hàm xử lý sự kiện.

### `useMemo` là tối ưu, không phải đảm bảo

React có thể **vứt bỏ** kết quả đã nhớ trong một số trường hợp — ví dụ trong dev khi bạn sửa file, hoặc trong tương lai để tiết kiệm bộ nhớ. Code của bạn phải **chạy đúng** kể cả khi `useMemo` tính lại mọi lần.

Nói cách khác: xóa `useMemo` đi, ứng dụng phải chạy đúng y hệt, chỉ có thể chậm hơn. Nếu xóa đi mà sai, bạn đang dùng `useMemo` cho việc khác ngoài tối ưu — dùng state hoặc ref thay vào.

### Khi nào không cần

```tsx
// Thừa — phép tính quá rẻ
const tongTien = useMemo(() => gio.reduce((t, m) => t + m.gia * m.sl, 0), [gio]);
const hoTen = useMemo(() => `${ho} ${ten}`, [ho, ten]);
```

Với giỏ hàng vài chục món, `reduce` mất chưa tới một phần trăm mili giây. Còn `useMemo` thì có chi phí riêng: tạo mảng phụ thuộc, so sánh từng phần tử, lưu kết quả. Bọc phép tính rẻ trong `useMemo` có thể **chậm hơn** không bọc — và chắc chắn khó đọc hơn.

---

## 5. `memo` — bỏ qua render lại của component con

`useMemo` tránh tính lại một **giá trị**. `memo` tránh render lại cả một **component**.

```tsx
import { memo } from "react";

const TheSanPham = memo(function TheSanPham({ sp, onThem }: TheSanPhamProps) {
  console.log("render", sp.ten);
  return (
    <div className="the">
      <h3>{sp.ten}</h3>
      <button onClick={() => onThem(sp.id)}>Thêm vào giỏ</button>
    </div>
  );
});
```

Bọc component trong `memo`: khi cha render lại, React so **từng prop** mới với prop cũ bằng `Object.is`. Mọi prop giống hệt → **bỏ qua** render component này, dùng lại kết quả cũ.

Lưu ý: `memo` chỉ chặn render lại do **cha render**. Nếu state bên trong `TheSanPham` đổi, nó vẫn render lại bình thường.

### Cái bẫy: props mới mỗi lần render

```tsx
function LuoiSanPham({ ds }: { ds: SanPham[] }) {
  const [gio, setGio] = useState<number[]>([]);

  function themVaoGio(id: number) {
    setGio((g) => [...g, id]);
  }

  return (
    <>
      <p>Giỏ: {gio.length}</p>
      {ds.map((sp) => (
        <TheSanPham key={sp.id} sp={sp} onThem={themVaoGio} />
      ))}
    </>
  );
}
```

Bấm "Thêm vào giỏ" ở một thẻ. Console in tên **mọi** sản phẩm — tất cả đều render lại, dù đã bọc `memo`.

Vì sao? `themVaoGio` là một hàm khai báo trong thân `LuoiSanPham`. Mỗi lần `LuoiSanPham` render là một hàm **mới** (mục 10 file `06`, mục 6 file `01` — hai hàm giống hệt nhau vẫn khác tham chiếu). `memo` so `Object.is(onThemCu, onThemMoi)` → `false` → render lại.

`memo` vô dụng nếu bạn truyền vào props mới mỗi lần. Những thứ sau **luôn** mới mỗi lần render:

```tsx
<The onClick={() => xuLy(id)} />          // arrow function viết tại chỗ
<The onClick={xuLy} />                      // hàm khai báo trong thân component
<The style={{ color: "red" }} />            // object literal
<The tags={["moi", "giam-gia"]} />          // array literal
<The cauHinh={{ ...macDinh, x: 1 }} />      // spread tạo object mới
<The>{<span>Xin chào</span>}</The>          // children là JSX — object mới mỗi lần
```

Dòng cuối hay bị bỏ qua: JSX là object (mục 1 file `01`). Truyền `children` là JSX vào một component `memo` thì `memo` gần như vô tác dụng — trừ khi JSX đó được tạo ở một component không render lại (kỹ thuật 2 ở mục 3).

---

## 6. `useCallback` — giữ nguyên tham chiếu hàm

```tsx
import { useCallback } from "react";

const themVaoGio = useCallback((id: number) => {
  setGio((g) => [...g, id]);
}, []);
```

`useCallback(ham, phuThuoc)` trả về **cùng một hàm** qua các lần render, chừng nào phụ thuộc chưa đổi.

Giờ `onThem` giữ nguyên tham chiếu → `memo` thấy props không đổi → các thẻ không bị bấm **không** render lại.

Mảng phụ thuộc rỗng ở đây hợp lệ vì hàm dùng **updater** `setGio((g) => ...)`, không đọc `gio` trực tiếp. Nếu viết `setGio([...gio, id])`, phải thêm `gio` vào phụ thuộc — và khi đó hàm đổi mỗi lần `gio` đổi, mất luôn lợi ích. Đây là lần thứ ba thói quen dùng updater (mục 5 file `03`, mục 10 file `06`) giúp bạn.

### `useCallback` thực chất là gì

```tsx
const f = useCallback(fn, deps);
// tương đương
const f = useMemo(() => fn, deps);
```

`useCallback` chỉ là `useMemo` dành riêng cho hàm. `useMemo` nhớ **kết quả của việc gọi** hàm; `useCallback` nhớ **chính hàm đó**.

### `useCallback` một mình không làm gì cả

```tsx
function Form() {
  const xuLyGui = useCallback(() => { ... }, []);
  return <button onClick={xuLyGui}>Gửi</button>;   // <button> không phải memo
}
```

`useCallback` không làm hàm chạy nhanh hơn. Nó chỉ giữ **tham chiếu** ổn định. Tham chiếu ổn định chỉ có ích khi **có ai đó so sánh** nó:

1. Một component con bọc `memo` nhận hàm đó qua props
2. Hàm đó nằm trong mảng phụ thuộc của `useEffect`, `useMemo`, hoặc `useCallback` khác

Không có ai so sánh → `useCallback` chỉ thêm chi phí và làm code khó đọc.

### Trường hợp 2: phụ thuộc của effect

Nhớ ví dụ `Modal` ở mục 8 file `06`:

```tsx
function Modal({ onDong, children }: ModalProps) {
  useEffect(() => {
    function xuLyPhim(e: KeyboardEvent) {
      if (e.key === "Escape") onDong();
    }
    window.addEventListener("keydown", xuLyPhim);
    return () => window.removeEventListener("keydown", xuLyPhim);
  }, [onDong]);
  // ...
}
```

Cha truyền `onDong={() => setMo(false)}` → hàm mới mỗi lần cha render → effect gỡ và gắn lại listener. Sửa ở phía cha:

```tsx
const dongModal = useCallback(() => setMo(false), []);
<Modal onDong={dongModal}>...</Modal>
```

Lần này `useCallback` có lý do: `onDong` nằm trong mảng phụ thuộc của effect.

---

## 7. Ba công cụ đi cùng nhau

Thường bạn cần cả ba để `memo` thực sự có tác dụng:

```tsx
const TheSanPham = memo(function TheSanPham({ sp, cauHinh, onThem }: Props) {
  // ...
});

function LuoiSanPham({ ds, tienTe }: { ds: SanPham[]; tienTe: string }) {
  const [gio, setGio] = useState<number[]>([]);

  const onThem = useCallback((id: number) => {           // hàm ổn định
    setGio((g) => [...g, id]);
  }, []);

  const cauHinh = useMemo(() => ({                         // object ổn định
    tienTe,
    hienThiThue: true,
  }), [tienTe]);

  return (
    <>
      <p>Giỏ: {gio.length}</p>
      {ds.map((sp) => (
        <TheSanPham key={sp.id} sp={sp} cauHinh={cauHinh} onThem={onThem} />
      ))}
    </>
  );
}
```

- `memo` — bỏ qua render nếu props không đổi
- `useCallback` — giữ `onThem` ổn định
- `useMemo` — giữ `cauHinh` ổn định (object literal sẽ mới mỗi lần)
- `sp` — mỗi sản phẩm vẫn là object cũ, vì `ds` không đổi khi thêm vào giỏ

Bấm "Thêm vào giỏ": chỉ dòng "Giỏ: x" cập nhật, không thẻ nào render lại.

Để ý dòng cuối cùng: `sp` ổn định nhờ cách bạn cập nhật mảng **bất biến** ở mục 8 file `03` — `map` tạo object mới **chỉ cho phần tử bị sửa**, các phần tử khác giữ nguyên tham chiếu. Mình đã nói lúc đó: *"Điều này quan trọng cho tối ưu ở file `09`."* Đây là lý do. Nếu bạn sao chép sâu toàn bộ danh sách mỗi lần sửa một phần tử, mọi `sp` đều mới, và `memo` trên từng thẻ mất tác dụng.

### Chỉ cần một chỗ hở là hỏng cả

Quên `useCallback` ở `onThem`, hoặc thêm một prop `style={{...}}` viết tại chỗ — `memo` lại vô dụng. Chuỗi tối ưu này **mong manh**: một thay đổi nhỏ của người khác vài tháng sau có thể âm thầm phá nó mà không ai nhận ra, vì ứng dụng vẫn chạy đúng — chỉ chậm hơn.

Đó là lý do nên đo trước, và chỉ dựng chuỗi này ở nơi đo được là cần.

---

## 8. Khi nào thật sự cần

Danh sách ngắn gọn:

**`useMemo`** khi:
- Phép tính **đo được** là chậm (khoảng 1ms trở lên), và các phụ thuộc ít khi đổi
- Giá trị là object/mảng được truyền cho component `memo`
- Giá trị là object/mảng nằm trong mảng phụ thuộc của Hook khác

**`useCallback`** khi:
- Hàm được truyền cho component `memo`
- Hàm nằm trong mảng phụ thuộc của Hook khác

**`memo`** khi:
- Component render lại **thường xuyên** với **cùng props**
- Và mỗi lần render của nó **tốn kém** (cây con lớn, nhiều phần tử)
- Và bạn đã thử hai kỹ thuật ở mục 3 mà không áp dụng được

Còn lại: **không dùng**.

### Có nên bọc hết cho chắc?

Một số đội ngũ chọn bọc `useMemo`/`useCallback` ở mọi nơi để khỏi phải nghĩ. Tài liệu React nói rõ cách này không gây hại lớn nhưng cũng không giúp nhiều, và làm code khó đọc hơn. Tốt hơn là sửa cấu trúc (mục 3), giữ props ổn định một cách tự nhiên, giữ component thuần, và tránh effect không cần thiết (mục 9 file `06`) — những thói quen này giải quyết phần lớn vấn đề hiệu năng trước khi chúng xuất hiện.

---

## 9. React Compiler

Mọi điều phức tạp ở mục 5–7 — nhớ bọc `memo`, nhớ `useCallback`, nhớ `useMemo` cho object, một chỗ hở là hỏng — đội ngũ React cũng thấy là quá nhiều gánh nặng cho người viết code.

**React Compiler** là công cụ chạy lúc build, **tự động** chèn việc ghi nhớ vào component và Hook của bạn. Bạn viết code bình thường, không `memo`, không `useMemo`, không `useCallback` — compiler phân tích và ghi nhớ những chỗ cần, chi tiết hơn cả mức bạn tự làm tay.

Compiler đã có bản ổn định và đang được nhiều dự án mới bật lên. Với Vite, nó được thêm dưới dạng một plugin Babel trong cấu hình plugin React. Tra tài liệu chính thức ở `react.dev` khi cần cài, vì cách cấu hình có thể thay đổi theo phiên bản.

Vậy sao vẫn phải học file này?

1. **Code hiện có** — phần lớn dự án bạn sẽ làm ở công ty viết trước khi có compiler, đầy `useMemo` và `useCallback`. Bạn phải đọc và sửa được
2. **Phỏng vấn** — câu hỏi về hai Hook này vẫn rất phổ biến
3. **Compiler có giới hạn** — nó chỉ tối ưu được code tuân thủ quy tắc của React (component thuần, không sửa props, không đọc ref lúc render...). Code vi phạm, compiler bỏ qua. Hiểu vì sao các quy tắc đó tồn tại chính là hiểu những gì file này dạy
4. **Gỡ lỗi** — khi một thứ không được tối ưu như mong đợi, bạn cần biết cơ chế bên dưới

Tóm lại: compiler thay đổi **cách bạn viết** code mới, nhưng không thay đổi **những gì bạn cần hiểu**.

---

## 10. Hai công cụ khác — biết tên là đủ

**`useDeferredValue`** — khi gõ vào ô tìm kiếm làm một danh sách lớn render chậm, bạn có thể để ô nhập cập nhật ngay còn danh sách cập nhật "sau một chút":

```tsx
const [tuKhoa, setTuKhoa] = useState("");
const tuKhoaTre = useDeferredValue(tuKhoa);
// ô input dùng tuKhoa — luôn mượt
// danh sách nặng dùng tuKhoaTre — được phép trễ
```

React ưu tiên cập nhật ô nhập trước, rồi mới render danh sách với giá trị trễ khi có thời gian rảnh. Gõ không còn bị giật.

**`useTransition`** — đánh dấu một cập nhật state là "không khẩn cấp", để React có thể gián đoạn nó nếu có việc quan trọng hơn (người dùng gõ phím).

Cả hai thuộc về cơ chế render đồng thời của React. Bạn sẽ gặp lại chúng ở chặng 5. Chỉ cần biết: khi danh sách lớn làm ô nhập giật, đây là những từ khóa đáng tra — trước cả khi nghĩ tới `memo`.

Và nhớ mục 10 file `04`: với danh sách hàng nghìn phần tử, **ảo hóa** thường là giải pháp đúng nhất, vì nó giảm số phần tử phải render ngay từ đầu.

---

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Bọc `memo` rồi mà component vẫn render lại | Có prop là hàm/object/mảng/JSX mới mỗi lần | `useCallback`/`useMemo` cho prop đó, hoặc bỏ `memo` |
| `useCallback` mà hàm vẫn đổi mỗi lần | Phụ thuộc đổi mỗi lần, thường là state | Dùng updater để bỏ phụ thuộc |
| Hàm trong `useCallback` dùng giá trị cũ | Thiếu phụ thuộc — stale closure | Thêm phụ thuộc, hoặc dùng updater |
| `React Hook useMemo has a missing dependency` | Thiếu phụ thuộc | Liệt kê đủ; không tắt cảnh báo |
| Xóa `useMemo` thì ứng dụng chạy sai | Dùng `useMemo` cho việc khác ngoài tối ưu | State hoặc ref |
| Code đầy `useMemo` mà không nhanh hơn | Ghi nhớ phép tính vốn rẻ | Đo trước; bỏ những chỗ không cần |
| Cả trang render lại theo từng phím gõ | State đặt quá cao | Đưa state xuống (mục 3) |
| Nội dung nặng render lại khi khung bao ngoài đổi state | Nội dung tạo bên trong khung | Đưa nội dung lên, truyền qua `children` |
| `memo` trên từng thẻ vô dụng sau khi sửa một phần tử | Sao chép sâu cả danh sách khi cập nhật | Cập nhật bất biến bằng `map` — chỉ tạo mới phần tử bị sửa |
| Đo thấy chậm ở dev nhưng production thì nhanh | Dev có `StrictMode` và kiểm tra thêm | Đo trên bản build |
| Ô nhập giật khi gõ do danh sách lớn | Render danh sách chặn ô nhập | `useDeferredValue`, ảo hóa |

---

## 12. Tóm tắt cần thuộc

1. Render lại thường **rẻ** — React chỉ chạm DOM ở chỗ thật sự đổi
2. **Đo trước**, tối ưu sau — Profiler, `console.time`, và đo trên bản build
3. Thử **sửa cấu trúc** trước: đưa state xuống; đưa nội dung lên qua `children`
4. Component dùng `children` không làm `children` render lại — vì chúng được tạo ở nơi khác
5. `useMemo(fn, deps)` — nhớ **kết quả**; chỉ tính lại khi phụ thuộc đổi
6. `useMemo` là tối ưu, không phải đảm bảo — xóa đi ứng dụng phải vẫn đúng
7. `memo(Component)` — bỏ qua render khi mọi prop giống hệt (`Object.is`)
8. Hàm, object, mảng, JSX viết tại chỗ là **mới mỗi lần render** → phá `memo`
9. `useCallback(fn, deps)` — nhớ **chính hàm**; tương đương `useMemo(() => fn, deps)`
10. `useCallback` chỉ có ích khi có ai so sánh hàm: con `memo`, hoặc mảng phụ thuộc
11. Updater function giúp bỏ phụ thuộc, giữ `useCallback` ổn định
12. Cập nhật mảng bất biến bằng `map` giữ nguyên tham chiếu các phần tử không đổi
13. React Compiler tự động ghi nhớ — nhưng bạn vẫn cần hiểu để đọc code cũ, phỏng vấn, và viết code đúng quy tắc
14. `useDeferredValue`, ảo hóa cho danh sách lớn làm giật ô nhập

---

## Bài tập

Làm trong `bai-tap/src/bai-09/`.

### Bài 1 — Đo trước, sửa sau (bài chính)

Dựng một trang có:

```tsx
function ChamCoChuDich({ ten }: { ten: string }) {
  const batDau = performance.now();
  while (performance.now() - batDau < 2) {}     // cố tình chậm 2ms mỗi lần render
  return <li>{ten}</li>;
}
```

- Một ô nhập ở đầu trang (state ở component trang)
- Một danh sách 100 `ChamCoChuDich` bên dưới, dữ liệu cố định

**Bước 1 — Đo.** Gõ vào ô nhập. Cảm giác thế nào? Mở Profiler, ghi lại lúc gõ 5 ký tự. Mỗi lần commit mất bao lâu? Chụp flamegraph. Bật "Record why each component rendered" — lý do các `ChamCoChuDich` render lại là gì?

**Bước 2 — Sửa cấu trúc.** Áp dụng kỹ thuật 1 ở mục 3. Đo lại, chụp lại.

**Bước 3 — Quay lại bản gốc**, lần này giả định ô nhập **bắt buộc** ở component trang vì khung trang đổi màu theo nội dung ô. Áp dụng kỹ thuật 2 ở mục 3. Đo lại.

**Bước 4 — Quay lại bản gốc** lần nữa, lần này dùng `memo` cho `ChamCoChuDich`. Đo lại.

**Bước 5** — Thêm prop `style={{ color: "black" }}` cho mỗi `ChamCoChuDich`. Đo lại. Chuyện gì xảy ra với `memo`?

Lập bảng thời gian commit trung bình cho cả 5 bước vào `ghi-chu.md`. Ghi nhận xét: cách nào bạn sẽ thử đầu tiên trong dự án thật, vì sao?

### Bài 2 — `useMemo` cho phép tính nặng

1. Sinh 50.000 sản phẩm ngẫu nhiên (tên, giá, danh mục) — sinh **một lần**, ngoài component
2. Component có ba state: `tuKhoa`, `sapXep`, và `cheDoToi` (boolean — nút bật tắt nền tối)
3. Danh sách hiển thị 50 kết quả đầu sau khi lọc + sắp xếp
4. Đo phép lọc + sắp xếp bằng `console.time`. Mất bao lâu?
5. Bật tắt chế độ tối — phép lọc có chạy lại không? Có cần không?
6. Bọc trong `useMemo` với phụ thuộc đúng. Bật tắt chế độ tối lần nữa — có chạy lại không?
7. Thử bỏ một phụ thuộc khỏi mảng, gõ vào ô tìm kiếm. Kết quả có cập nhật không? Ghi lại vì sao đây là bug nguy hiểm, rồi khôi phục
8. Bật CPU throttling 4× và cảm nhận lại cả hai phiên bản

### Bài 3 — Chuỗi `memo` + `useCallback` + `useMemo`

Dựng lại ví dụ ở mục 7 với 200 sản phẩm:

1. Bản không tối ưu — mỗi `TheSanPham` có `console.log` khi render. Bấm "Thêm vào giỏ", đếm số dòng log
2. Thêm `memo` — đếm lại. Vì sao vẫn chưa giảm?
3. Thêm `useCallback` cho `onThem` — đếm lại
4. Thêm prop `cauHinh` là object literal — đếm lại. Rồi sửa bằng `useMemo`
5. Đổi `onThem` sang `setGio([...gio, id])` (không dùng updater), cập nhật phụ thuộc cho đúng. Đếm lại. Vì sao?
6. Thêm một nút "Tăng giá 10%" cho từng sản phẩm. Viết hai bản cập nhật: một bản dùng `map` tạo object mới chỉ cho sản phẩm bị sửa, một bản dùng `structuredClone` cả danh sách. Bấm tăng giá một sản phẩm, đếm số thẻ render lại ở mỗi bản

Lập bảng số lần render ở mỗi bước. Câu 5 và 6 là hai câu cho thấy chuỗi tối ưu mong manh thế nào.

### Bài 4 — Sửa những chỗ lạm dụng

Đoạn code dưới đây dùng `useMemo` và `useCallback` ở khắp nơi. Với **mỗi** cái, ghi vào `ghi-chu.md`: nó có ích không? Vì sao? Rồi viết lại, chỉ giữ những cái có lý do.

```tsx
function HoSo({ user }: { user: User }) {
  const hoTen = useMemo(() => `${user.ho} ${user.ten}`, [user.ho, user.ten]); -> dư vì này không tốn nhiều time tính toán để lưu
  const tuoi = useMemo(() => 2026 - user.namSinh, [user.namSinh]); -> dư vì này cũng không tốn time tính toán nhiều

  const xuLyBam = useCallback(() => {
    alert(hoTen);
  }, [hoTen]); -> dư vì hàm này truyền cho button và không có component nào dùng nó để so sánh 

  const kieu = useMemo(() => ({ color: "blue" }), []); -> dư vì hàm này truyền cho div và không có component nào dùng nó để so sánh giống trên

  const dsBanBe = useMemo(
    () => user.banBe.filter((b) => b.dangOnline),
    [user.banBe],
  ); -> ok vì danh sách bạn bè có thể nhiều

  const xuLyGo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  }, []); -> dư vì hàm này truyền cho input và không có component nào dùng nó để so sánh 

  return (
    <div style={kieu}>
      <h2>{hoTen} ({tuoi})</h2>
      <button onClick={xuLyBam}>Chào</button>
      <input onChange={xuLyGo} />
      <ul>{dsBanBe.map((b) => <li key={b.id}>{b.ten}</li>)}</ul>
    </div>
  );
}
```

Gợi ý: không có component con nào được bọc `memo`, và không có effect nào.

### Bài 5 — Pokédex

1. Ghi Profiler khi gõ vào ô tìm kiếm Pokédex. Component nào render lại? Có cái nào không cần không?
2. Áp dụng mục 3 trước: có state nào đang đặt quá cao không? Có khu vực nào (đội hình, đầu trang) nên nhận nội dung qua `children` không?
3. Modal chi tiết có listener Escape trong effect phụ thuộc `onDong`. Kiểm tra bằng `console.log` trong hàm dọn dẹp: listener có bị gỡ và gắn lại mỗi lần cha render không? Sửa bằng `useCallback`
4. Thử `useDeferredValue` cho từ khóa tìm kiếm. Bật CPU throttling 6× và so sánh cảm giác gõ trước và sau
5. Ghi vào `ghi-chu.md`: sau bài này, Pokédex của bạn có bao nhiêu `useMemo`, `useCallback`, `memo`? Mỗi cái có số liệu đo chứng minh nó cần không?

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Vì sao render lại thường không phải là vấn đề hiệu năng?
2. Kể hai cách giảm render thừa **không** dùng `memo`, `useMemo`, `useCallback`. Giải thích vì sao cách thứ hai (`children`) hoạt động.
3. `useMemo` và `useCallback` khác nhau thế nào? Trả lời như đang phỏng vấn.
4. Vì sao `useCallback` không có tác dụng gì nếu không có `memo` hoặc mảng phụ thuộc nào dùng hàm đó?
5. Vì sao bọc `memo` rồi mà component vẫn render lại? Kể ba nguyên nhân.
6. React Compiler là gì? Nếu đã có compiler, vì sao vẫn cần hiểu những Hook này?

---

## Xong file này khi

- [ ] Bài 1 có bảng số đo cho cả 5 bước, chọn được cách sẽ thử đầu tiên
- [ ] Bài 2 thấy `useMemo` chặn được phép lọc chạy lại khi đổi chế độ tối; đã thấy hậu quả thiếu phụ thuộc
- [ ] Bài 3 có bảng số lần render; giải thích được câu 5 và 6
- [ ] Bài 4 phân loại đúng từng `useMemo`/`useCallback`
- [ ] Mọi tối ưu trong Pokédex đều có số đo chứng minh
- [ ] Trả lời được 6 câu ở bài 6 bằng lời, đặc biệt câu 3

File tiếp theo (`10-custom-hook`) gom lại mọi thứ bạn đã viết đi viết lại — `useState` + `useEffect` để gọi API, đọc ghi `localStorage`, debounce — thành những Hook của riêng bạn.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-09`, kèm **"viết file 10-custom-hook"**.