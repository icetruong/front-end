# 08 — `useRef`

> **Cần có trước:** xong `03` (state là ảnh chụp), `06` (effect, dọn dẹp, stale closure). Nhớ file `08` chặng 2 (DOM, đo kích thước, `focus`), file `05` chặng 2 (closure).
> **Thời gian:** 3–4 giờ.
> **Vì sao quan trọng:** state làm component render lại mỗi khi đổi. Nhưng có những giá trị bạn cần **nhớ** mà không cần **hiển thị** — id của interval, bộ hẹn giờ debounce, phần tử DOM để focus. `useRef` là chỗ cho chúng. Nó cũng là lối thoát khi bạn thật sự cần chạm vào DOM — thứ React vẫn giấu bạn từ đầu chặng.

---

## 1. Vấn đề

Đồng hồ bấm giờ với nút Bắt đầu và Dừng:

```tsx
function DongHoBam() {
  const [batDau, setBatDau] = useState<number | null>(null);
  const [bayGio, setBayGio] = useState<number | null>(null);

  function xuLyBatDau() {
    setBatDau(Date.now());
    setBayGio(Date.now());
    setInterval(() => setBayGio(Date.now()), 10);
  }

  function xuLyDung() {
    clearInterval(/* ??? */);
  }

  const daQua = batDau && bayGio ? (bayGio - batDau) / 1000 : 0;
  return (
    <>
      <p>{daQua.toFixed(2)}s</p>
      <button onClick={xuLyBatDau}>Bắt đầu</button>
      <button onClick={xuLyDung}>Dừng</button>
    </>
  );
}
```

`setInterval` trả về một id. Hàm `xuLyDung` cần id đó để gọi `clearInterval`. Lưu nó ở đâu?

**Biến cục bộ?**

```tsx
let idInterval: number;
function xuLyBatDau() { idInterval = setInterval(...); }
function xuLyDung() { clearInterval(idInterval); }   // ❌
```

Mỗi lần render, hàm component chạy lại, `idInterval` được khai báo mới — `undefined`. Mà interval gọi `setBayGio` mười lần mỗi giây, nên component render liên tục. Lúc bấm Dừng, `idInterval` đã là biến của một lần render khác, rỗng không.

**Biến ngoài component?**

```tsx
let idInterval: number;   // ngoài component
function DongHoBam() { ... }
```

Chạy được — cho tới khi trang có **hai** đồng hồ bấm giờ. Chúng dùng chung một biến, đồng hồ này ghi đè id của đồng hồ kia. Đúng vấn đề biến toàn cục ở file `13` chặng 2.

**State?**

```tsx
const [idInterval, setIdInterval] = useState<number | null>(null);
```

Chạy đúng. Nhưng id interval **không bao giờ hiển thị** trên màn hình. Đổi nó gây ra một lần render hoàn toàn vô ích.

Ta cần một thứ:

- **Được nhớ** giữa các lần render — như state
- **Riêng** cho từng lần xuất hiện của component — như state
- **Không** gây render lại khi thay đổi — khác state

Đó là `useRef`.

---

## 2. `useRef`

```tsx
import { useRef } from "react";

const ref = useRef(0);
```

`useRef` trả về một **object** có đúng một thuộc tính:

```javascript
{ current: 0 }
```

Hai tính chất quan trọng:

1. **Cùng một object ở mọi lần render.** React tạo object này một lần, rồi lần nào gọi `useRef` cũng trả lại đúng object đó
2. **Sửa `ref.current` không làm gì cả.** React không theo dõi, không render lại

```tsx
function DongHoBam() {
  const [batDau, setBatDau] = useState<number | null>(null);
  const [bayGio, setBayGio] = useState<number | null>(null);
  const idInterval = useRef<number | null>(null);

  function xuLyBatDau() {
    setBatDau(Date.now());
    setBayGio(Date.now());
    if (idInterval.current !== null) clearInterval(idInterval.current);
    idInterval.current = window.setInterval(() => setBayGio(Date.now()), 10);
  }

  function xuLyDung() {
    if (idInterval.current !== null) clearInterval(idInterval.current);
    idInterval.current = null;
  }
  // ...
}
```

Giờ bấm Dừng thì `idInterval.current` vẫn đúng là id đã lưu lúc bấm Bắt đầu, dù component đã render hàng trăm lần ở giữa.

Dòng `if (...) clearInterval(...)` trong `xuLyBatDau` chặn trường hợp bấm Bắt đầu hai lần — không có nó, interval cũ chạy mãi không ai dừng được.

`window.setInterval` thay vì `setInterval` là để TypeScript biết chắc kiểu trả về là `number` của trình duyệt (nhớ `ReturnType<typeof setTimeout>` ở mục 9 file `06` chặng 3).

### Vì sao ref "thoát" được ảnh chụp

Nhớ mục 4 file `03`: state là ảnh chụp — mỗi lần render có một biến `dem` riêng, hằng số. Hàm tạo ra ở lần render nào thì nhìn thấy `dem` của lần đó.

Ref thì khác. Mọi lần render đều nhận **cùng một object**. Hàm tạo ra ở lần render số 1 và hàm tạo ra ở lần render số 100 đều giữ tham chiếu tới **cùng** object đó. Sửa `.current` ở bất kỳ đâu, mọi nơi đều thấy giá trị mới.

Đây chính là tham chiếu ở file `01` chặng 2 — object được chia sẻ qua tham chiếu, sửa nội dung ở đâu thì ở đâu cũng thấy.

### So sánh

| | `useState` | `useRef` |
|---|---|---|
| Trả về | `[giaTri, setGiaTri]` | `{ current: giaTri }` |
| Đổi giá trị | Gọi `setGiaTri` | Gán `ref.current = ...` |
| Gây render lại | **Có** | **Không** |
| Trong một lần render, giá trị | Cố định (ảnh chụp) | Có thể đổi bất cứ lúc nào |
| Đọc trong lúc render | Được | **Không nên** (mục 3) |
| Dùng cho | Thứ cần hiển thị | Thứ cần nhớ nhưng không hiển thị |

Mẹo nhớ: hình dung `useRef` như một `useState` mà bạn không bao giờ gọi hàm `set` — chỉ đổi thẳng nội dung bên trong object.

---

## 3. Không đọc hoặc ghi ref trong lúc render

```tsx
function DemSoLanRender() {
  const soLan = useRef(0);
  soLan.current = soLan.current + 1;          // ❌ ghi trong lúc render
  return <p>Đã render {soLan.current} lần</p>; // ❌ đọc trong lúc render
}
```

Hai vấn đề:

**1. Không thuần.** Nhớ mục 7 file `01`: render phải thuần — không sửa thứ tồn tại trước khi hàm chạy. Ref tồn tại trước lần render. Ghi vào nó là tác dụng phụ. `StrictMode` render hai lần sẽ cho ra số gấp đôi — giống hệt ví dụ `Khach` ở file `01`.

**2. Màn hình không khớp với dữ liệu.** Đổi `ref.current` không gây render, nên giá trị hiển thị trên màn hình có thể là cũ.

```tsx
function NutRef() {
  const dem = useRef(0);
  return (
    <button onClick={() => { dem.current = dem.current + 1; }}>
      Đã bấm {dem.current} lần
    </button>
  );
}
```

Bấm bao nhiêu lần, nút vẫn hiện `0`. `dem.current` thật ra đã tăng — `console.log` sẽ thấy — nhưng React không biết để vẽ lại.

**Quy tắc:**

- Đọc và ghi `ref.current` **trong hàm xử lý sự kiện** hoặc **trong effect** — được
- Đọc và ghi trong **thân component lúc render** — không, trừ trường hợp khởi tạo lười bên dưới
- Nếu giá trị cần **hiển thị** → nó là **state**, không phải ref

### Ngoại lệ: khởi tạo lười

```tsx
const trinhPhat = useRef<TrinhPhatVideo | null>(null);
if (trinhPhat.current === null) {
  trinhPhat.current = new TrinhPhatVideo();   // chỉ tạo một lần
}
```

Đây là cách tương đương khởi tạo lười của `useState` (mục 9 file `03`). Được chấp nhận vì nó chỉ chạy đúng một lần và luôn cho cùng kết quả. Lưu ý `useRef(new TrinhPhatVideo())` sẽ tạo object mới ở **mọi** lần render rồi vứt đi — cùng cái bẫy với `useState(tinhNang())`.

---

## 4. Các ứng dụng của ref làm "biến nhớ"

### Id của timer

Đồng hồ bấm giờ ở mục 2. Mọi trường hợp cần hủy timer từ **hàm xử lý sự kiện** (không phải từ hàm dọn dẹp của effect):

```tsx
function NutGuiCham() {
  const [dangCho, setDangCho] = useState(false);
  const idHen = useRef<number | null>(null);

  function gui() {
    setDangCho(true);
    idHen.current = window.setTimeout(() => {
      thucSuGui();
      setDangCho(false);
    }, 5000);
  }

  function huy() {
    if (idHen.current !== null) clearTimeout(idHen.current);
    setDangCho(false);
  }

  return dangCho
    ? <button onClick={huy}>Hủy gửi (5 giây)</button>
    : <button onClick={gui}>Gửi</button>;
}
```

Đây là tính năng "hoàn tác gửi" của Gmail — đúng ý tưởng hoàn tác bằng `setTimeout` và closure ở bài 4 file `09` chặng 2.

### Giá trị mới nhất, thoát khỏi ảnh chụp

```tsx
function HopChat() {
  const [noiDung, setNoiDung] = useState("");

  function guiSau3Giay() {
    setTimeout(() => {
      alert("Đang gửi: " + noiDung);
    }, 3000);
  }

  return (
    <>
      <input value={noiDung} onChange={(e) => setNoiDung(e.target.value)} />
      <button onClick={guiSau3Giay}>Gửi sau 3 giây</button>
    </>
  );
}
```

Gõ "xin", bấm nút, rồi gõ tiếp "xin chào" trong 3 giây chờ. `alert` hiện "xin" — ảnh chụp lúc bấm (mục 4 file `03`).

Thường đó là đúng ý. Nhưng nếu bạn thật sự muốn gửi **nội dung mới nhất lúc hết giờ**:

```tsx
const noiDungRef = useRef(noiDung);

function xuLyGo(e: React.ChangeEvent<HTMLInputElement>) {
  setNoiDung(e.target.value);         // để hiển thị
  noiDungRef.current = e.target.value; // để đọc giá trị mới nhất
}

function guiSau3Giay() {
  setTimeout(() => {
    alert("Đang gửi: " + noiDungRef.current);   // luôn là giá trị mới nhất
  }, 3000);
}
```

Ref không bị đóng băng trong ảnh chụp, nên callback đọc được giá trị mới nhất. Đây là một cách thoát khỏi stale closure khi updater function (mục 10 file `06`) không áp dụng được — ví dụ khi bạn cần **đọc** giá trị chứ không phải **cập nhật** nó.

Dùng cẩn thận: bạn đang chủ động bỏ qua ảnh chụp, nên phải chắc đó là điều bạn muốn.

### Giá trị của lần render trước

```tsx
function GiaCoPhieu({ gia }: { gia: number }) {
  const giaTruoc = useRef(gia);

  useEffect(() => {
    giaTruoc.current = gia;    // cập nhật SAU khi render xong
  }, [gia]);

  const xuHuong = gia > giaTruoc.current ? "▲" : gia < giaTruoc.current ? "▼" : "";
  return <p>{gia.toLocaleString("vi-VN")} {xuHuong}</p>;
}
```

Dòng `xuHuong` đọc ref trong lúc render — vi phạm mục 3. Mẫu này rất phổ biến và thường chạy đúng, nhưng tài liệu React khuyên cách khác khi có thể: lưu giá trị trước thành **state**, và cập nhật nó ngay trong lúc render khi thấy prop đổi. Mình nhắc để bạn nhận ra mẫu này khi đọc code người khác, và biết nó nằm trong vùng xám.

Thường thì câu hỏi đúng là: có thật cần giá trị trước không, hay nên lưu sự **thay đổi** ở nơi gây ra nó? Nếu giá được cập nhật từ một hàm xử lý sự kiện, tính xu hướng ngay trong hàm đó và lưu cùng giá — đơn giản hơn.

---

## 5. Ref trỏ tới phần tử DOM

Đây là cách dùng phổ biến nhất của `useRef`.

Đến giờ, bạn chưa từng gọi `document.querySelector` trong React. React tự quản lý DOM. Nhưng có những việc chỉ làm được bằng cách gọi thẳng API của DOM:

- `focus()` một ô nhập
- `scrollIntoView()` cuộn tới một phần tử
- `getBoundingClientRect()` đo kích thước
- `play()` / `pause()` một thẻ `<video>`

```tsx
function ONhapCoNutFocus() {
  const oNhapRef = useRef<HTMLInputElement>(null);

  function xuLyBam() {
    oNhapRef.current?.focus();
  }

  return (
    <>
      <input ref={oNhapRef} />
      <button onClick={xuLyBam}>Focus vào ô nhập</button>
    </>
  );
}
```

Ba bước:

1. **Khai báo** ref với giá trị ban đầu `null`, kiểu là loại phần tử: `useRef<HTMLInputElement>(null)`
2. **Gắn** vào JSX bằng thuộc tính `ref={oNhapRef}`
3. **Dùng** `oNhapRef.current` — giờ nó là phần tử `<input>` thật trên DOM

### Khi nào `ref.current` có giá trị

```
Render  →  React cập nhật DOM  →  React gán ref.current = phần tử  →  Effect chạy
```

- **Trong lúc render**: chưa có — DOM chưa được tạo, `ref.current` là `null` (lần đầu) hoặc phần tử cũ
- **Sau khi DOM cập nhật**: React gán phần tử vào `ref.current`
- **Khi phần tử bị gỡ**: React gán lại `null`

Đó là lý do bạn chỉ dùng DOM ref trong **hàm xử lý sự kiện** hoặc **effect** — cả hai đều chạy sau khi DOM đã sẵn sàng. Đúng quy tắc ở mục 3.

Và là lý do phải dùng `?.`: TypeScript biết `ref.current` có thể là `null`, và nó đúng.

### Focus khi component xuất hiện

```tsx
function ModalTimKiem() {
  const oNhapRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    oNhapRef.current?.focus();
  }, []);

  return <input ref={oNhapRef} placeholder="Tìm kiếm..." />;
}
```

Modal mở ra là ô tìm kiếm được focus ngay. Đây là một việc đồng bộ với hệ thống bên ngoài (trạng thái focus của trình duyệt) xảy ra **vì component đang hiển thị** — đúng chỗ cho effect (mục 9 file `06`).

Với trường hợp đơn giản này, HTML còn có sẵn thuộc tính `autoFocus` — React hỗ trợ nó. Nhưng effect + ref cho bạn kiểm soát nhiều hơn (focus có điều kiện, focus lại sau khi đóng một modal con...).

### Cuộn tới phần tử

```tsx
function KhungChat({ tinNhan }: { tinNhan: TinNhan[] }) {
  const cuoiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cuoiRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tinNhan]);

  return (
    <div className="khung-chat">
      {tinNhan.map((t) => <p key={t.id}>{t.noiDung}</p>)}
      <div ref={cuoiRef} />
    </div>
  );
}
```

Có tin nhắn mới → tự cuộn xuống cuối. Một `<div>` rỗng ở cuối danh sách làm mốc.

### Đo kích thước

```tsx
function HopCoKichThuoc() {
  const hopRef = useRef<HTMLDivElement>(null);
  const [rong, setRong] = useState(0);

  useEffect(() => {
    if (hopRef.current) {
      setRong(hopRef.current.getBoundingClientRect().width);
    }
  }, []);

  return <div ref={hopRef}>Chiều rộng: {rong}px</div>;
}
```

Nhớ mục 11 file `06`: nếu bạn cần đo rồi **định vị lại** ngay (tooltip, menu thả xuống), dùng `useLayoutEffect` để tránh khung hình sai chớp lên.

### Mọi phần tử, không chỉ input

```tsx
const videoRef = useRef<HTMLVideoElement>(null);

<video ref={videoRef} src="/clip.mp4" />
<button onClick={() => videoRef.current?.play()}>Phát</button>
<button onClick={() => videoRef.current?.pause()}>Dừng</button>
```

Kiểu phần tử tương ứng với thẻ: `HTMLDivElement`, `HTMLButtonElement`, `HTMLVideoElement`, `HTMLCanvasElement`... — cùng bộ kiểu ở mục 13 file `06` chặng 3.

---

## 6. Đừng giành quyền quản lý DOM với React

Ref cho bạn phần tử DOM thật. Bạn **có thể** gọi bất kỳ API nào trên nó. Nhưng không phải việc gì cũng **nên**.

```tsx
function NguyHiem() {
  const [hien, setHien] = useState(true);
  const ref = useRef<HTMLParagraphElement>(null);

  return (
    <>
      <button onClick={() => setHien(!hien)}>Bật/tắt bằng state</button>
      <button onClick={() => ref.current?.remove()}>Xóa bằng DOM</button>
      {hien && <p ref={ref}>Xin chào</p>}
    </>
  );
}
```

Bấm "Xóa bằng DOM", rồi bấm "Bật/tắt bằng state". Ứng dụng có thể sập với lỗi kiểu `Failed to execute 'removeChild' on 'Node'`.

React tưởng thẻ `<p>` vẫn còn đó (state nói vậy). Nó cố gỡ thẻ mà bạn đã tự tay xóa. DOM thật và hình dung của React về DOM đã lệch nhau.

**Quy tắc:**

- **An toàn** — thao tác không phá hủy, không thay đổi cấu trúc: `focus`, `blur`, `scrollIntoView`, đo kích thước, `play`/`pause`, `select()` chữ trong ô nhập
- **Nguy hiểm** — thao tác mà React cũng đang quản lý: thêm/xóa phần tử, đổi `textContent`, đổi `className`, đổi `style`

Muốn đổi nội dung, class, hiển thị/ẩn — dùng state và để React làm. Nhớ file `00`: lý do bạn dùng React là để **không phải** tự sửa DOM.

Ngoại lệ hợp lệ: một phần tử mà React **không đụng tới** — ví dụ `<div ref={ref} />` rỗng, dùng làm khung để một thư viện bản đồ hay biểu đồ vẽ vào. React không quản lý gì bên trong nó, nên thư viện tự do thao tác.

---

## 7. Ref cho danh sách phần tử

Không gọi `useRef` trong vòng lặp được (luật Hook — mục 3 file `03`). Vậy làm sao có ref cho từng Pokémon trong một danh sách để cuộn tới con được chọn?

Dùng **ref callback**: truyền một **hàm** vào thuộc tính `ref` thay vì object ref.

```tsx
function DanhSachPokemon({ ds, idCanCuon }: { ds: Pokemon[]; idCanCuon: number | null }) {
  const cacPhanTu = useRef(new Map<number, HTMLLIElement>());

  useEffect(() => {
    if (idCanCuon === null) return;
    cacPhanTu.current.get(idCanCuon)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [idCanCuon]);

  return (
    <ul>
      {ds.map((p) => (
        <li
          key={p.id}
          ref={(node) => {
            if (node) cacPhanTu.current.set(p.id, node);
            return () => { cacPhanTu.current.delete(p.id); };
          }}
        >
          {p.name}
        </li>
      ))}
    </ul>
  );
}
```

- Một ref duy nhất giữ một `Map` từ `id` sang phần tử
- Mỗi `<li>` nhận một hàm ở thuộc tính `ref`. React gọi hàm đó với phần tử thật khi gắn phần tử vào DOM
- Hàm ref có thể **trả về hàm dọn dẹp** — React gọi nó khi phần tử bị gỡ. Đây là tính năng từ React 19. Trong code cũ, bạn sẽ thấy React gọi lại hàm ref với `null` khi gỡ, thay vì dùng hàm dọn dẹp

Ghi chú: `useRef(new Map())` tạo `Map` mới ở mọi lần render rồi vứt đi (mục 3). Với `Map` rỗng thì gần như không tốn gì, nên chấp nhận được. Nếu muốn chặt chẽ, dùng mẫu khởi tạo lười ở mục 3.

---

## 8. Truyền ref vào component của bạn

```tsx
function OInput(props: ComponentProps<"input">) {
  return <input className="o-input" {...props} />;
}

function Form() {
  const ref = useRef<HTMLInputElement>(null);
  return <OInput ref={ref} />;
}
```

Bạn muốn `ref` từ `Form` đi xuống tới thẻ `<input>` thật bên trong `OInput`.

Từ **React 19**, `ref` là một prop bình thường với function component. `ComponentProps<"input">` (mục 11 file `02`) đã bao gồm `ref`, và `{...props}` trải nó xuống `<input>`. Đoạn code trên chạy đúng.

### Đọc code cũ: `forwardRef`

Trước React 19, function component **không** nhận được `ref` qua props. Phải bọc bằng `forwardRef`:

```tsx
const OInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  function OInput(props, ref) {
    return <input className="o-input" ref={ref} {...props} />;
  },
);
```

Bạn sẽ gặp mẫu này rất nhiều trong các thư viện và dự án viết trước React 19. Nhận ra được là đủ — code mới không cần nó.

### `useImperativeHandle` — biết tên là đủ

Đôi khi bạn không muốn cha nhận **toàn bộ** phần tử DOM, mà chỉ một vài hàm do bạn quy định (ví dụ chỉ `focus()` và `xoaNoiDung()`). `useImperativeHandle` làm việc đó. Hiếm khi cần ở mức Junior.

---

## 9. Tóm lại khi nào dùng gì

| Bạn cần | Dùng |
|---|---|
| Giá trị **hiển thị** trên màn hình | `useState` |
| Giá trị **tính được** từ props/state | Biến thường, tính trong lúc render |
| Giá trị cần **nhớ** giữa các lần render, **không hiển thị** | `useRef` |
| Gọi API của DOM (focus, cuộn, đo, phát video) | `useRef` gắn vào phần tử |
| Hằng số không bao giờ đổi | Biến ngoài component |

Câu hỏi quyết định giữa state và ref: **nếu giá trị này đổi, màn hình có cần đổi theo không?** Có → state. Không → ref.

Ref là **lối thoát** — như `useEffect`. Phần lớn logic ứng dụng không nên dựa vào ref. Nếu bạn thấy mình dùng ref ở khắp nơi, có lẽ đang chống lại cách React hoạt động.

---

## 10. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Đổi `ref.current` mà màn hình không cập nhật | Ref không gây render | Giá trị cần hiển thị → dùng state |
| Số đếm render gấp đôi khi dev | Ghi ref trong lúc render, `StrictMode` render hai lần | Chỉ ghi ref trong sự kiện/effect |
| `Cannot read properties of null (reading 'focus')` | Dùng DOM ref trong lúc render, hoặc phần tử chưa/đã không còn trên DOM | Dùng trong effect/sự kiện; `ref.current?.focus()` |
| `clearInterval` không dừng được | Id lưu trong biến cục bộ, mất sau mỗi render | Lưu id trong ref |
| Hai component cùng loại đè id timer của nhau | Lưu id trong biến ngoài component | Ref — mỗi lần xuất hiện có ref riêng |
| Bấm "Bắt đầu" hai lần, đồng hồ chạy gấp đôi | Không xóa interval cũ trước khi tạo mới | Kiểm tra và `clearInterval` trước |
| `Failed to execute 'removeChild'` | Tự xóa/thêm phần tử DOM mà React quản lý | Chỉ thao tác không phá hủy; đổi giao diện bằng state |
| `React Hook "useRef" cannot be called inside a callback` | `useRef` trong `map` | Ref callback + `Map` |
| `ref` truyền vào component không tới phần tử bên trong | Component không chuyển `ref` xuống (hoặc phiên bản trước React 19 không có `forwardRef`) | Trải `{...props}` xuống phần tử; code cũ dùng `forwardRef` |
| TypeScript báo ref không gán được cho thuộc tính `ref` của thẻ, hoặc `.focus` không tồn tại trên `never` | `useRef(null)` không ghi kiểu phần tử | `useRef<HTMLInputElement>(null)` |

---

## 11. Tóm tắt cần thuộc

1. `useRef(x)` trả về `{ current: x }` — **cùng một object** ở mọi lần render
2. Đổi `ref.current` **không** gây render lại
3. Ref thoát khỏi ảnh chụp — mọi hàm đều thấy giá trị mới nhất
4. **Không đọc/ghi ref trong lúc render** — chỉ trong sự kiện và effect (trừ khởi tạo lười)
5. Giá trị cần hiển thị → state; cần nhớ nhưng không hiển thị → ref
6. Dùng ref cho: id timer, giá trị mới nhất trong callback trễ, phần tử DOM
7. DOM ref: `useRef<HTMLXElement>(null)` + `ref={...}` + `ref.current?.method()`
8. `ref.current` có phần tử **sau khi** DOM cập nhật, về `null` khi phần tử bị gỡ
9. Chỉ thao tác DOM **không phá hủy**: focus, cuộn, đo, phát video. Đổi nội dung/cấu trúc bằng state
10. Danh sách phần tử: ref callback + `Map`; hàm ref có thể trả về dọn dẹp (React 19)
11. React 19: `ref` là prop bình thường; code cũ dùng `forwardRef`
12. Ref là lối thoát — dùng khi cần, không dùng làm mặc định

---

## Bài tập

Làm trong `bai-tap/src/bai-08/`.

### Bài 1 — Đoán kết quả

Với mỗi component, ghi vào `ghi-chu.md` trước khi chạy: bấm nút ba lần thì màn hình hiện gì, Console in gì.

```tsx
// --- A ---
function A() {
  const r = useRef(0);
  return (
    <button onClick={() => { r.current++; console.log(r.current); }}> -> 3
      {r.current} -> 0 
    </button>
  );
}

// --- B ---
function B() {
  const r = useRef(0);
  const [n, setN] = useState(0);
  return (
    <button onClick={() => { r.current++; setN(n + 1); }}>
      ref: {r.current} — state: {n}
    </button>
  );
} -> ref: 3 - state: 3

// --- C ---
function C() {
  const r = useRef(0);
  r.current++;
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>render lần {r.current}</button>;
} -> render lần 7

// --- D ---
function D() {
  const [n, setN] = useState(0);
  const r = useRef(n);
  return (
    <button onClick={() => {
      setN(n + 1);
      r.current = n + 1;
      setTimeout(() => console.log("state:", n, "ref:", r.current), 1000);
    }}>{n}</button>
  );
} -> state: 0 ref: 3
```

Câu B cho thấy điều gì về thời điểm màn hình hiển thị giá trị của ref? Câu C, với `StrictMode`, số hiển thị tăng theo bước mấy?

### Bài 2 — Đồng hồ bấm giờ (bài chính)

Viết `DongHoBam` đầy đủ:

1. Hiển thị dạng `mm:ss.cc` (phút, giây, phần trăm giây)
2. Các nút: **Bắt đầu**, **Tạm dừng**, **Tiếp tục**, **Đặt lại**, **Ghi vòng**. Nút nào hiện ra phụ thuộc trạng thái — mô hình hóa trạng thái bằng discriminated union (`"cho" | "dang-chay" | "tam-dung"`)
3. Thời gian tính bằng hiệu `Date.now()`, không cộng dồn (nhớ bài 5 file `10` chặng 2). Tạm dừng rồi tiếp tục không được mất thời gian đã trôi
4. Id interval lưu trong ref. Bấm "Bắt đầu" nhanh hai lần không được tạo hai interval
5. Danh sách vòng hiển thị từng vòng và khoảng cách với vòng trước; vòng nhanh nhất màu xanh, chậm nhất màu đỏ — tính trong lúc render
6. Đặt **hai** đồng hồ trên cùng trang, xác nhận chúng độc lập hoàn toàn
7. Thêm nút ở cha để ẩn đồng hồ đang chạy. Interval có dừng không? Nếu không, thêm effect dọn dẹp — interval tạo trong hàm xử lý sự kiện, nhưng dọn dẹp khi component biến mất thì cần effect

Ghi vào `ghi-chu.md`: những giá trị nào là state, giá trị nào là ref, giá trị nào tính được? Với mỗi cái, giải thích vì sao.

### Bài 3 — Focus và cuộn

1. **Todo app**: sau khi thêm việc, ô nhập vẫn giữ focus. Khi bấm nút "Sửa" một dòng, ô sửa được focus **và** toàn bộ chữ được bôi đen (`select()`). Nhấn Escape thì focus quay lại nút "Sửa" của dòng đó
2. **Khung chat**: danh sách tin nhắn, ô nhập ở dưới. Có tin mới thì tự cuộn xuống cuối — **nhưng** nếu người dùng đang cuộn lên đọc tin cũ (cách đáy hơn 100px), thì **không** tự cuộn, thay vào đó hiện nút "↓ Có tin nhắn mới". Gợi ý: đo `scrollTop`, `scrollHeight`, `clientHeight` (mục 10 file `08` chặng 2) của khung chat qua ref
3. Thêm nút "Giả lập tin mới" gửi một tin nhắn ngẫu nhiên mỗi 2 giây để thử

### Bài 4 — Pokédex

1. Thanh tìm kiếm: nhấn phím `/` ở bất kỳ đâu trên trang thì focus vào ô tìm kiếm (nhớ phím tắt ở bài 4 file `09` chặng 2). Đây là listener trên `window`, đặt trong effect. Ô tìm kiếm được focus thì phím `/` gõ ra chữ bình thường
2. Khi mở modal chi tiết, focus vào nút đóng. Khi đóng modal, focus **quay lại** thẻ Pokémon vừa mở — người dùng bàn phím không bị lạc
3. Khu vực "Đội hình" (bài 5 file `07`): bấm một Pokémon trong đội hình thì danh sách chính cuộn tới thẻ của nó và làm nổi bật trong 1 giây. Dùng ref callback + `Map` theo mục 7
4. Nếu Pokédex đang có debounce viết bằng effect (file `06`), giờ thử viết lại bằng ref lưu id `setTimeout` bên trong hàm `onChange`. So sánh hai cách trong `ghi-chu.md` — cách nào dễ đọc hơn? Cách nào xử lý đúng khi component biến mất giữa chừng?

### Bài 5 — Phá DOM có chủ đích

1. Dựng lại ví dụ ở mục 6, chạy và ghi lại thông báo lỗi
2. Thử thêm: đổi `ref.current.textContent = "Đã sửa"` bằng nút, rồi đổi một state khiến React render lại đoạn chữ đó. Chữ của bạn còn không?
3. Thử đổi `ref.current.style.color = "red"` rồi render lại. Màu còn không? Vì sao trường hợp này khác trường hợp 2?
4. Ghi vào `ghi-chu.md`: quy tắc của bạn để quyết định thao tác DOM nào an toàn qua ref

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. `useRef` khác `useState` ở điểm nào? Câu hỏi nào giúp bạn chọn giữa hai cái?
2. Vì sao ref "thoát" được khỏi ảnh chụp của state?
3. Vì sao không nên đọc hoặc ghi `ref.current` trong lúc render?
4. Khi nào `ref.current` của một DOM ref có giá trị, khi nào là `null`?
5. Thao tác DOM nào an toàn qua ref, thao tác nào nguy hiểm? Vì sao?
6. Kể ba trường hợp thật bạn đã dùng ref trong bài tập.

---

## Xong file này khi

- [ ] Bài 1 có phần đoán viết trước; giải thích được câu B và C
- [ ] Đồng hồ bấm giờ đủ năm nút, hai đồng hồ độc lập, ẩn đi thì interval dừng thật
- [ ] Todo app focus đúng chỗ; khung chat chỉ tự cuộn khi người dùng đang ở gần đáy
- [ ] Pokédex có phím `/`, focus quay về đúng thẻ khi đóng modal, cuộn tới thẻ trong đội hình
- [ ] Bài 5 đã thấy tận mắt lỗi khi giành quyền quản lý DOM với React
- [ ] Trả lời được 6 câu ở bài 6 bằng lời

File tiếp theo (`09-usememo-usecallback`) nói về tối ưu hiệu năng — và điều quan trọng nhất trong đó là: hầu hết thời gian, bạn **không cần** tối ưu.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-08`, kèm **"viết file 09-usememo-usecallback"**.