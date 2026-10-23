# 06 — `useEffect`

> **Cần có trước:** xong `03` (state là ảnh chụp, updater), `04` (dùng `key` để đặt lại state), `05`. Nhớ chắc file `05` chặng 2 (closure, stale closure, debounce), `10`–`12` chặng 2 (event loop, Promise, `fetch`, `AbortController`, race condition).
> **Thời gian:** 5–6 giờ.
> **Vì sao quan trọng:** `useEffect` là cánh cửa để component nói chuyện với thế giới bên ngoài React — API, `localStorage`, timer, sự kiện của `window`. Nó cũng là Hook bị dùng **sai** nhiều nhất. Một nửa file này dạy cách dùng; nửa còn lại (mục 9) dạy khi nào **không** dùng — và nửa sau quan trọng không kém.

---

## 1. Chỗ còn thiếu

Đến giờ bạn có hai nơi để viết code:

1. **Thân component** — chạy khi render. Phải **thuần** (mục 7 file `01`): không gọi API, không đụng DOM, không ghi `localStorage`
2. **Hàm xử lý sự kiện** — chạy khi người dùng làm gì đó. Được phép có tác dụng phụ (mục 11 file `03`)

Nhưng có những việc không thuộc chỗ nào:

- Màn hình chat vừa hiện ra thì phải **kết nối** tới server. Người dùng không bấm gì cả — chính việc màn hình xuất hiện là lý do
- Danh sách việc thay đổi thì phải **ghi** vào `localStorage`, dù thay đổi đến từ nút thêm, nút xóa hay nút sửa
- Modal đang mở thì phải **lắng nghe** phím Escape trên `window`
- Đồng hồ đang hiển thị thì phải **chạy** `setInterval`

Điểm chung: chúng xảy ra **vì component đang hiển thị với một trạng thái nào đó**, không phải vì một hành động cụ thể của người dùng. Và chúng chạm tới thứ **nằm ngoài React**.

`useEffect` là chỗ thứ ba để viết code, dành riêng cho những việc này.

---

## 2. Cú pháp

```tsx
import { useEffect, useState } from "react";

function TieuDeTrang() {
  const [dem, setDem] = useState(0);

  useEffect(() => {
    document.title = `Đã bấm ${dem} lần`;
  });

  return <button onClick={() => setDem(dem + 1)}>Bấm ({dem})</button>;
}
```

`useEffect` nhận một hàm. React gọi hàm đó **sau khi** render xong và **sau khi** DOM đã được cập nhật.

Thứ tự trong một lần cập nhật:

```
1. React gọi TieuDeTrang()          ← render: tính JSX, phải thuần
2. React cập nhật DOM                ← commit
3. Trình duyệt vẽ lên màn hình
4. React chạy hàm trong useEffect    ← effect: được có tác dụng phụ
```

Vì effect chạy sau khi DOM đã cập nhật, bên trong nó bạn đọc được DOM mới nhất.

`useEffect` là một Hook — luật ở mục 3 file `03` áp dụng: gọi ở cấp cao nhất, không đặt trong `if`. Muốn effect làm việc có điều kiện thì đặt `if` **bên trong** hàm effect.

---

## 3. Mảng phụ thuộc

Không có tham số thứ hai, effect chạy **sau mỗi lần render**. Thường đó là quá nhiều.

```tsx
useEffect(() => {
  // ...
}, [a, b]);
```

Tham số thứ hai là **mảng phụ thuộc**. React so sánh từng phần tử với lần render trước bằng `Object.is` (mục 6 file `03`). Có phần tử khác → chạy effect. Giống hết → bỏ qua.

| Viết | Chạy khi |
|---|---|
| `useEffect(fn)` | Sau **mọi** lần render |
| `useEffect(fn, [])` | Chỉ sau lần render **đầu tiên** |
| `useEffect(fn, [a, b])` | Lần đầu, và mỗi khi `a` hoặc `b` đổi |

```tsx
useEffect(() => {
  document.title = `Đã bấm ${dem} lần`;
}, [dem]);
```

Giờ effect chỉ chạy khi `dem` đổi — các state khác của component đổi thì không.

### Phụ thuộc không phải do bạn chọn

Đây là điều nhiều người hiểu sai. Mảng phụ thuộc **không** phải chỗ bạn khai báo "tôi muốn effect chạy khi nào". Nó là danh sách **mọi giá trị đến từ component** mà effect đang dùng — props, state, và biến hay hàm khai báo trong thân component.

```tsx
function PhongChat({ idPhong }: { idPhong: string }) {
  const [maySo, setMaySo] = useState("1");

  useEffect(() => {
    const kn = ketNoi(idPhong, maySo);
    // ...
  }, [idPhong, maySo]);   // dùng hai giá trị này → phải liệt kê cả hai
}
```

Effect dùng `idPhong` và `maySo`, nên cả hai **phải** có trong mảng. Không có lựa chọn.

Plugin `eslint-plugin-react-hooks` (mục 10 file `00`) có quy tắc `exhaustive-deps` kiểm tra đúng điều này. Thiếu một giá trị là nó cảnh báo.

### Nói dối về phụ thuộc

```tsx
useEffect(() => {
  const kn = ketNoi(idPhong);
  return () => kn.ngat();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);   // "chỉ muốn kết nối một lần"
```

Người dùng chuyển phòng, `idPhong` đổi. Effect không chạy lại. Ứng dụng vẫn kết nối tới **phòng cũ**, và tin nhắn hiện ra sai chỗ.

Đây là **stale closure** (mục 8 file `05` chặng 2, mục 4 file `03`): hàm effect được tạo ở lần render đầu, nhìn thấy `idPhong` của lần render đầu, và không bao giờ được thay bằng hàm mới.

**Quy tắc: không bao giờ tắt cảnh báo `exhaustive-deps`.** Khi bạn thấy mình muốn tắt, đó là dấu hiệu code có vấn đề — mục 10 có cách giải quyết đúng.

---

## 4. Hàm dọn dẹp

```tsx
useEffect(() => {
  const id = setInterval(() => console.log("tích"), 1000);

  return () => {
    clearInterval(id);
  };
}, []);
```

Hàm effect có thể **trả về một hàm**. Đó là hàm **dọn dẹp** (cleanup). React gọi nó:

- **Trước khi chạy lại effect** (vì phụ thuộc đổi) — dọn effect cũ trước khi dựng effect mới
- **Khi component rời khỏi màn hình** (unmount)

Không có dọn dẹp, mỗi lần component xuất hiện lại tạo thêm một interval — chúng chồng lên nhau, chạy mãi kể cả khi component đã biến mất. Đây là rò rỉ bộ nhớ ở mục 7 file `05` chặng 2: *"Mẫu 'trả về hàm dọn dẹp' này chính là thứ bạn sẽ viết trong `useEffect` của React."* Giờ là lúc đó.

### Các cặp dựng – dọn

| Dựng | Dọn |
|---|---|
| `setInterval` / `setTimeout` | `clearInterval` / `clearTimeout` |
| `addEventListener` | `removeEventListener` (cùng tham chiếu hàm — mục 1.3 file `09` chặng 2) |
| Mở kết nối | Đóng kết nối |
| Bắt đầu `fetch` | `AbortController.abort()` hoặc cờ bỏ qua (mục 7) |
| Thay `document.title` | Khôi phục tiêu đề cũ (nếu cần) |

### Thứ tự khi phụ thuộc đổi

```tsx
useEffect(() => {
  console.log("kết nối", idPhong);
  return () => console.log("ngắt", idPhong);
}, [idPhong]);
```

Chuyển từ phòng `"chung"` sang `"tin-tuc"`:

```
kết nối chung        ← lần đầu
ngắt chung           ← dọn effect của lần render cũ
kết nối tin-tuc      ← chạy effect của lần render mới
```

Hàm dọn dẹp in `"chung"`, không phải `"tin-tuc"`. Vì nó được tạo trong cùng lần render với effect cũ — nó giữ ảnh chụp của lần đó (mục 4 file `03`). Đúng điều ta muốn: dọn cái **cũ**.

---

## 5. `StrictMode` chạy effect hai lần

Thêm `console.log` vào effect có `[]`, tải lại trang:

```
kết nối chung
ngắt chung
kết nối chung
```

Effect "chỉ chạy một lần" lại chạy hai lần, xen giữa là một lần dọn.

Đây là `StrictMode` (mục 8 file `00`). Ở chế độ dev, ngay sau khi gắn component, React cố tình **gắn → gỡ → gắn lại**. Mục đích: kiểm tra hàm dọn dẹp của bạn có thật sự dọn sạch không.

Nếu dọn dẹp đúng, người dùng không thể phân biệt "chạy một lần" và "chạy, dọn, chạy lại". Nếu dọn dẹp thiếu, bạn sẽ thấy ngay: hai interval cùng chạy, hai listener cùng bắt sự kiện, hai kết nối cùng mở.

Câu hỏi đúng **không phải** "làm sao để effect chỉ chạy một lần", mà là **"làm sao để effect chạy hai lần cũng không sao"**. Câu trả lời luôn là: viết hàm dọn dẹp cho đúng.

Bạn sẽ thấy trên mạng những mẹo dùng cờ để chặn lần chạy thứ hai. Đó là che giấu bug, không phải sửa bug — vì ngoài dev, component vẫn có thể bị gỡ rồi gắn lại thật (chuyển trang rồi quay lại chẳng hạn).

Khi build production, hành vi này biến mất.

---

## 6. Nghĩ theo đồng bộ hóa, không theo vòng đời

Có hai cách nghĩ về effect.

**Cách nghĩ theo vòng đời** (kiểu class component cũ): "chạy cái này khi component được gắn", "chạy cái kia khi nó cập nhật", "chạy cái này khi nó bị gỡ".

**Cách nghĩ theo đồng bộ hóa**: "khi component đang hiển thị với `idPhong` là X, thế giới bên ngoài phải ở trạng thái **kết nối tới phòng X**".

```tsx
useEffect(() => {
  const kn = ketNoi(idPhong);   // bắt đầu đồng bộ
  return () => kn.ngat();        // ngừng đồng bộ
}, [idPhong]);
```

Effect chỉ trả lời hai câu: **bắt đầu đồng bộ thế nào**, và **ngừng đồng bộ thế nào**. React lo việc gọi chúng đúng lúc — kể cả khi `idPhong` đổi, khi component biến mất, hay khi `StrictMode` thử gắn lại.

Cách nghĩ thứ hai khớp với `UI = f(state)` của file `00`: giao diện là hàm của state, và effect làm cho **thế giới bên ngoài** cũng là hàm của state.

Hệ quả thực tế: mỗi effect nên lo **một** việc đồng bộ. Hai việc độc lập (kết nối chat và ghi log phân tích) thì viết hai `useEffect` riêng, mỗi cái có phụ thuộc riêng.

---

## 7. Gọi API trong effect

Đây là trường hợp bạn sẽ gặp đầu tiên, và cũng là chỗ nhiều cái bẫy nhất.

### Không viết được `async` trực tiếp

```tsx
useEffect(async () => {    // ❌
  const res = await fetch(url);
}, [url]);
```

Hàm `async` luôn trả về Promise (mục 6 file `11` chặng 2). Nhưng hàm effect chỉ được trả về **hàm dọn dẹp** hoặc không gì cả. TypeScript báo lỗi ngay.

Cách viết: khai báo hàm `async` bên trong, rồi gọi nó.

```tsx
useEffect(() => {
  async function tai() {
    const res = await fetch(url);
    // ...
  }
  tai();
}, [url]);
```

### Race condition

Nhớ mục 10 file `12` chặng 2. Người dùng chọn Pokémon số 1, rồi nhanh chóng chọn số 2. Hai request được gửi. Nếu request số 1 về **sau** request số 2, màn hình hiện Pokémon số 1 trong khi người dùng đang chọn số 2.

Trong React, chuyện này xảy ra mỗi khi phụ thuộc đổi nhanh hơn tốc độ mạng. Hàm dọn dẹp là chỗ xử lý nó.

**Cách 1 — cờ bỏ qua:**

```tsx
useEffect(() => {
  let boQua = false;

  async function tai() {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const duLieu = await res.json();
    if (!boQua) setPokemon(duLieu);   // chỉ cập nhật nếu effect này còn hiệu lực
  }
  tai();

  return () => {
    boQua = true;    // id đổi hoặc component biến mất → bỏ kết quả của lần này
  };
}, [id]);
```

Mỗi lần effect chạy có một biến `boQua` riêng (closure — file `05` chặng 2). Khi `id` đổi, hàm dọn dẹp của lần **cũ** đặt `boQua` của lần **cũ** thành `true`. Request cũ về muộn thì cũng không được ghi vào state.

**Cách 2 — `AbortController`** (mục 6 file `12` chặng 2):

```tsx
useEffect(() => {
  const ac = new AbortController();

  async function tai() {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
        signal: ac.signal,
      });
      setPokemon(await res.json());
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      throw err;
    }
  }
  tai();

  return () => ac.abort();
}, [id]);
```

Cách này **thực sự hủy** request, tiết kiệm băng thông. Nhớ lọc `AbortError` — hủy request không phải lỗi cần báo người dùng.

### Mẫu đầy đủ

Kết hợp discriminated union (mục 11 file `06` chặng 3, mục 10 file `03`):

```tsx
type TrangThai =
  | { loai: "dang-tai" }
  | { loai: "loi"; thongBao: string }
  | { loai: "thanh-cong"; duLieu: Pokemon };

function ChiTietPokemon({ id }: { id: number }) {
  const [tt, setTt] = useState<TrangThai>({ loai: "dang-tai" });

  useEffect(() => {
    const ac = new AbortController();
    setTt({ loai: "dang-tai" });

    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((duLieu: Pokemon) => setTt({ loai: "thanh-cong", duLieu }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setTt({
          loai: "loi",
          thongBao: err instanceof Error ? err.message : "Lỗi không xác định",
        });
      });

    return () => ac.abort();
  }, [id]);

  switch (tt.loai) {
    case "dang-tai":   return <p>Đang tải...</p>;
    case "loi":        return <p className="loi">{tt.thongBao}</p>;
    case "thanh-cong": return <h2>{tt.duLieu.name}</h2>;
  }
}
```

Nhớ `res.ok` (mục 3 file `12` chặng 2): `fetch` không reject với lỗi 404.

Dòng `.then((duLieu: Pokemon) => ...)` vẫn là "lời nói dối" ở mục 10 file `07` chặng 3 — `res.json()` trả `any`. Muốn trung thực thì dùng type guard như bài 3 file đó.

### Thực tế không ai viết thế này mãi

Effect gọi API viết tay như trên chạy được, nhưng thiếu rất nhiều thứ ứng dụng thật cần: cache (mở lại Pokémon đã xem thì không gọi lại), tải lại khi quay lại tab, thử lại khi lỗi, chia sẻ dữ liệu giữa nhiều component. Viết đủ những thứ đó bằng tay là một khối lượng lớn và dễ sai.

Vì vậy dự án thật dùng thư viện — **TanStack Query** là phổ biến nhất (chặng 5) — hoặc cơ chế lấy dữ liệu của framework như Next.js (chặng 7). Học cách viết tay trước để hiểu những thư viện đó đang giải quyết vấn đề gì.

---

## 8. Các ứng dụng hay gặp khác

### Lắng nghe sự kiện của `window` hoặc `document`

```tsx
function Modal({ onDong, children }: { onDong: () => void; children: ReactNode }) {
  useEffect(() => {
    function xuLyPhim(e: KeyboardEvent) {
      if (e.key === "Escape") onDong();
    }
    window.addEventListener("keydown", xuLyPhim);
    return () => window.removeEventListener("keydown", xuLyPhim);
  }, [onDong]);

  return <div className="modal">{children}</div>;
}
```

`onDong` được dùng bên trong → phải nằm trong mảng phụ thuộc. Nhưng nếu cha truyền `onDong={() => setMo(false)}`, mỗi lần cha render là một hàm **mới** → effect gỡ và gắn lại listener. Không sai, chỉ hơi thừa. File `09` (`useCallback`) và mục 10 dưới đây có cách xử lý.

Chú ý: hàm `xuLyPhim` được khai báo **bên trong** effect, nên cùng một tham chiếu được dùng cho cả `add` và `remove`. Đúng yêu cầu ở mục 1.3 file `09` chặng 2.

### Đồng bộ với `localStorage`

```tsx
function DanhSachViec() {
  const [ds, setDs] = useState<Viec[]>(() => docDanhSach());   // đọc: khởi tạo lười (file 03)

  useEffect(() => {
    localStorage.setItem("todo:ds", JSON.stringify(ds));      // ghi: effect
  }, [ds]);
  // ...
}
```

`localStorage` là hệ thống bên ngoài, và việc ghi cần xảy ra mỗi khi `ds` đổi — bất kể nguyên nhân. Đúng trường hợp dành cho effect.

So với mục 11 file `03`, nơi mình ghi `localStorage` trong hàm xử lý sự kiện và phải tự tính `[...ds, viecMoi]`: giờ mọi hàm thêm, xóa, sửa chỉ lo cập nhật state, một effect duy nhất lo việc lưu.

### Timer

```tsx
function DongHo() {
  const [bayGio, setBayGio] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setBayGio(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{bayGio.toLocaleTimeString("vi-VN")}</p>;
}
```

Đây là câu trả lời cho câu hỏi ở bài 5 file `01`: `new Date()` trong thân component làm component không thuần. Cách đúng là đưa thời gian vào state, và để một effect đồng bộ state đó với đồng hồ thật.

Mảng phụ thuộc rỗng hợp lệ ở đây: effect không dùng giá trị nào từ component (`setBayGio` là ngoại lệ — React đảm bảo hàm `set` không bao giờ đổi, nên không cần liệt kê).

### Debounce bằng hàm dọn dẹp

```tsx
function TimKiem() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [ketQua, setKetQua] = useState<string[]>([]);

  useEffect(() => {
    if (!tuKhoa.trim()) {
      setKetQua([]);
      return;
    }

    const id = setTimeout(() => {
      timKiemAPI(tuKhoa).then(setKetQua);
    }, 400);

    return () => clearTimeout(id);
  }, [tuKhoa]);

  return <input value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} />;
}
```

Người dùng gõ một ký tự → effect hẹn giờ 400ms. Gõ thêm ký tự trước khi hết 400ms → `tuKhoa` đổi → hàm dọn dẹp **hủy** hẹn giờ cũ → effect mới hẹn giờ mới. Chỉ khi người dùng ngừng gõ đủ 400ms, hẹn giờ mới chạy được tới cùng.

Đây là debounce ở mục 6.6 file `05` chặng 2 — nhưng không cần hàm `debounce` riêng. Hàm dọn dẹp làm đúng vai trò `clearTimeout(idTimer)`.

Ví dụ trên vẫn còn lỗ hổng race condition: request của từ khóa cũ về muộn vẫn ghi đè. Kết hợp với mục 7 để chống — đó là một phần bài tập.

---

## 9. Có thể bạn không cần effect

**Đây là mục quan trọng nhất của file.**

Effect là lối thoát ra khỏi React để đồng bộ với hệ thống bên ngoài. Nếu không có hệ thống bên ngoài nào dính vào, bạn gần như chắc chắn **không** cần effect.

Người mới học React hay lạm dụng `useEffect` như một cách "chạy code khi gì đó thay đổi". Kết quả là code chậm hơn, rối hơn, và đầy bug. Dưới đây là những trường hợp phổ biến nhất.

### 9.1. Dữ liệu tính được

```tsx
// ❌
const [ho, setHo] = useState("Nguyễn");
const [ten, setTen] = useState("An");
const [hoTen, setHoTen] = useState("");

useEffect(() => {
  setHoTen(`${ho} ${ten}`);
}, [ho, ten]);
```

Chạy ra sao: render với `hoTen` cũ → effect chạy → `setHoTen` → **render lần nữa** với `hoTen` mới. Hai lần render thay vì một, và có một khoảnh khắc màn hình hiện giá trị sai.

```tsx
// ✓
const hoTen = `${ho} ${ten}`;
```

Nguyên tắc 1 ở mục 10 file `03`. Effect + `setState` để tính một giá trị suy ra được là dấu hiệu sai phổ biến nhất.

Tương tự với lọc danh sách:

```tsx
// ❌
const [dsDaLoc, setDsDaLoc] = useState<Viec[]>([]);
useEffect(() => {
  setDsDaLoc(ds.filter((v) => khop(v, boLoc)));
}, [ds, boLoc]);

// ✓
const dsDaLoc = ds.filter((v) => khop(v, boLoc));
```

### 9.2. Đặt lại state khi prop đổi

```tsx
// ❌
function FormChinhSua({ userId }: { userId: number }) {
  const [ghiChu, setGhiChu] = useState("");

  useEffect(() => {
    setGhiChu("");
  }, [userId]);
  // ...
}
```

Lần render đầu với `userId` mới vẫn hiện ghi chú **cũ**, rồi effect mới xóa nó — một khoảnh khắc hiện sai, rồi một lần render thừa.

```tsx
// ✓ — mục 7 file 04
<FormChinhSua key={userId} userId={userId} />
```

### 9.3. Logic thuộc về một sự kiện cụ thể

```tsx
// ❌
const [daMua, setDaMua] = useState(false);

useEffect(() => {
  if (daMua) {
    hienThongBao("Đã thêm vào giỏ!");
    fetch("/api/gio-hang", { method: "POST", body: ... });
  }
}, [daMua]);

<button onClick={() => setDaMua(true)}>Mua</button>
```

Câu hỏi then chốt: **vì sao** đoạn code này cần chạy? Vì người dùng **bấm nút Mua**. Không phải vì component đang hiển thị.

Đặt nó trong effect sinh bug: người dùng tải lại trang, nếu `daMua` được khôi phục từ `localStorage`, thông báo lại hiện ra và request lại được gửi. Hoặc `StrictMode` chạy effect hai lần → gửi hai request.

```tsx
// ✓
function xuLyMua() {
  hienThongBao("Đã thêm vào giỏ!");
  fetch("/api/gio-hang", { method: "POST", body: ... });
}

<button onClick={xuLyMua}>Mua</button>
```

**Phân biệt:**

- Code chạy **vì người dùng làm một hành động** → hàm xử lý sự kiện
- Code chạy **vì component đang hiển thị** với một trạng thái nào đó → effect

Gửi form là sự kiện. Kết nối chat khi màn hình mở là effect. Ghi log "người dùng đã xem trang" là effect (vì xem trang = trang đang hiển thị). Ghi log "người dùng đã bấm Mua" là sự kiện.

### 9.4. Chuỗi effect

```tsx
// ❌
useEffect(() => {
  if (the?.vang) setSoTheVang((n) => n + 1);
}, [the]);

useEffect(() => {
  if (soTheVang > 3) { setVong((v) => v + 1); setSoTheVang(0); }
}, [soTheVang]);

useEffect(() => {
  if (vong > 5) setKetThuc(true);
}, [vong]);
```

Mỗi bước gây một lần render, rồi một effect, rồi một `setState`, rồi một lần render nữa. Logic nằm rải rác, khó theo dõi, và mỗi lần thêm điều kiện mới lại thêm một mắt xích dễ gãy.

```tsx
// ✓ Tính hết trong hàm xử lý sự kiện
function xuLyChonThe(theMoi: The) {
  setThe(theMoi);
  if (!theMoi.vang) return;

  if (soTheVang < 3) {
    setSoTheVang(soTheVang + 1);
    return;
  }
  setSoTheVang(0);
  setVong(vong + 1);
  if (vong + 1 > 5) setKetThuc(true);
}
```

Hoặc với dữ liệu suy ra được (`ketThuc` rõ ràng tính được từ `vong`) — bỏ luôn state đó.

### 9.5. Báo cho cha khi state thay đổi

```tsx
// ❌
function CongTac({ onThayDoi }: { onThayDoi: (bat: boolean) => void }) {
  const [bat, setBat] = useState(false);

  useEffect(() => {
    onThayDoi(bat);
  }, [bat, onThayDoi]);

  return <button onClick={() => setBat(!bat)}>{bat ? "Bật" : "Tắt"}</button>;
}
```

```tsx
// ✓ Báo ngay trong sự kiện
function xuLyBam() {
  const moi = !bat;
  setBat(moi);
  onThayDoi(moi);
}
```

Hoặc tốt hơn nữa: nếu cha cần biết giá trị, có lẽ state nên nằm ở cha luôn. Đó là nội dung file `07`.

### 9.6. Khởi tạo một lần cho cả ứng dụng

```tsx
// ❌ — StrictMode chạy hai lần, và mọi lần App gắn lại
useEffect(() => {
  khoiTaoThuVienPhanTich();
}, []);

// ✓ — đặt ngoài component, chạy đúng một lần khi module được nạp
khoiTaoThuVienPhanTich();

function App() { ... }
```

Nhớ mục 9 file `13` chặng 2: module chỉ chạy **một lần** dù được import bao nhiêu nơi.

### Bảng tự kiểm tra

Trước khi viết `useEffect`, hỏi:

| Câu hỏi | Nếu có | Dùng |
|---|---|---|
| Giá trị tính được từ props/state? | | Tính trong lúc render |
| Cần làm mới state khi một prop đổi? | | `key` |
| Code chạy vì người dùng làm một hành động cụ thể? | | Hàm xử lý sự kiện |
| Chỉ cần chạy một lần cho cả ứng dụng? | | Code cấp module |
| Đồng bộ với hệ thống **ngoài React**? | | **`useEffect`** |

Chỉ dòng cuối mới thật sự cần effect.

---

## 10. Stale closure và cách thoát

### Bộ đếm đứng yên

```tsx
function BoDemTuDong() {
  const [dem, setDem] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setDem(dem + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);   // ⚠ ESLint cảnh báo: thiếu `dem`

  return <p>{dem}</p>;
}
```

Bộ đếm hiện `1`, rồi đứng yên mãi mãi.

Đây chính là ví dụ mình đưa ra ở mục 8 file `05` chặng 2 — lúc đó bạn chưa có React, giờ bạn đã chạy được nó. Hàm callback của interval được tạo ở lần render đầu, nhìn thấy `dem = 0`. Nó gọi `setDem(0 + 1)` mỗi giây — mãi mãi là `1`.

**Cách 1 — thêm `dem` vào phụ thuộc:**

```tsx
useEffect(() => {
  const id = setInterval(() => setDem(dem + 1), 1000);
  return () => clearInterval(id);
}, [dem]);
```

Chạy đúng, nhưng mỗi giây interval bị hủy và tạo lại. Hơi thừa.

**Cách 2 — updater function** (mục 5 file `03`):

```tsx
useEffect(() => {
  const id = setInterval(() => setDem((d) => d + 1), 1000);
  return () => clearInterval(id);
}, []);   // không còn dùng `dem` → không cần phụ thuộc
```

Effect không đọc `dem` nữa, nên nó không phụ thuộc vào `dem`. Updater nhận giá trị **mới nhất** từ React, không phải từ ảnh chụp.

Đây là cách tốt nhất. Mình đã nói ở file `03`: *"thói quen dùng updater sẽ cứu bạn khỏi bug stale closure ở file `06`."*

**Nguyên tắc chung:** khi ESLint đòi thêm phụ thuộc mà bạn không muốn effect chạy lại, đừng tắt cảnh báo. Hãy **sửa code để effect không cần giá trị đó nữa**.

### Object và hàm làm phụ thuộc

```tsx
function PhongChat({ idPhong }: { idPhong: string }) {
  const tuyChon = { idPhong, maySo: "1" };   // object mới mỗi lần render

  useEffect(() => {
    const kn = ketNoi(tuyChon);
    return () => kn.ngat();
  }, [tuyChon]);    // ⚠ khác tham chiếu mỗi lần render → chạy lại mỗi lần
}
```

Nhớ file `01` chặng 2: hai object giống hệt nhau vẫn khác tham chiếu. Mỗi lần render tạo `tuyChon` mới → `Object.is` báo khác → effect gỡ và kết nối lại sau **mọi** lần render, kể cả khi bạn chỉ gõ vào một ô không liên quan.

Cách sửa — đưa object **vào trong** effect:

```tsx
useEffect(() => {
  const tuyChon = { idPhong, maySo: "1" };
  const kn = ketNoi(tuyChon);
  return () => kn.ngat();
}, [idPhong]);    // chỉ phụ thuộc vào giá trị nguyên thủy
```

Cùng nguyên tắc với hàm: hàm khai báo trong thân component là hàm **mới** mỗi lần render. Nếu chỉ effect dùng hàm đó, khai báo nó **bên trong** effect.

Khi không đưa vào trong được (ví dụ hàm `onDong` truyền từ cha ở mục 8), có `useCallback` và `useMemo` — file `09`.

---

## 11. `useLayoutEffect` — biết tên là đủ

```tsx
useLayoutEffect(() => {
  const { height } = ref.current!.getBoundingClientRect();
  setChieuCao(height);
}, []);
```

Giống `useEffect`, nhưng chạy **trước** khi trình duyệt vẽ lên màn hình (bước 3 ở mục 2). Dùng khi bạn cần **đo** kích thước phần tử rồi đặt lại vị trí ngay, để người dùng không thấy khung hình sai chớp lên — ví dụ tooltip phải đặt sao cho không tràn khỏi màn hình.

Nó chặn trình duyệt vẽ, nên làm chậm trang nếu lạm dụng. **Mặc định luôn dùng `useEffect`.** Chỉ đổi sang `useLayoutEffect` khi thấy giao diện chớp nháy vì đo đạc.

---

## 12. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Effect chạy hai lần khi dev | `StrictMode` kiểm tra dọn dẹp | Viết hàm dọn dẹp đúng; không chặn lần chạy thứ hai |
| Interval/listener chồng lên nhau | Thiếu hàm dọn dẹp | `return () => clearInterval(id)` |
| `React Hook useEffect has a missing dependency` | Dùng giá trị component mà không liệt kê | Thêm vào mảng, hoặc sửa code để không cần nó |
| Bộ đếm trong interval đứng ở `1` | Stale closure, thiếu phụ thuộc | Updater `setX(x => x + 1)` |
| Effect chạy sau mọi lần render dù có mảng phụ thuộc | Phụ thuộc là object/hàm mới mỗi lần render | Đưa vào trong effect, hoặc dùng giá trị nguyên thủy |
| Render vô hạn | Effect `setState` → render → effect lại `setState` | Kiểm tra phụ thuộc; thường là dấu hiệu không cần effect |
| `Effect callbacks are synchronous to prevent race conditions` | Viết `useEffect(async () => ...)` | Khai báo hàm `async` bên trong rồi gọi |
| Dữ liệu cũ đè dữ liệu mới khi đổi lựa chọn nhanh | Race condition khi `fetch` | Cờ `boQua` hoặc `AbortController` trong dọn dẹp |
| `AbortError` hiện như lỗi thật | Không lọc lỗi hủy | Kiểm tra `err.name === "AbortError"` |
| Màn hình chớp giá trị sai một khoảnh khắc | Effect + `setState` cho dữ liệu tính được | Tính trong lúc render |
| Request gửi hai lần / thông báo hiện lại khi tải trang | Logic sự kiện đặt trong effect | Chuyển vào hàm xử lý sự kiện |
| `removeEventListener` không gỡ được | Truyền hàm khác tham chiếu | Khai báo hàm xử lý bên trong effect |

---

## 13. Tóm tắt cần thuộc

1. Effect là chỗ để **đồng bộ component với hệ thống bên ngoài React**
2. Effect chạy **sau** khi render và cập nhật DOM
3. Không có mảng phụ thuộc → sau mọi render; `[]` → chỉ lần đầu; `[a, b]` → khi `a` hoặc `b` đổi
4. Phụ thuộc **không do bạn chọn** — mọi giá trị component dùng trong effect đều phải liệt kê
5. **Không bao giờ tắt `exhaustive-deps`** — sửa code để không cần phụ thuộc đó
6. Hàm dọn dẹp chạy trước lần chạy lại và khi component biến mất
7. `StrictMode` gắn → gỡ → gắn lại để kiểm tra dọn dẹp; câu hỏi đúng là "chạy hai lần có sao không"
8. Nghĩ theo **đồng bộ hóa** (bắt đầu/ngừng), không theo vòng đời
9. Không viết `useEffect(async ...)` — khai báo hàm async bên trong
10. Chống race condition bằng cờ `boQua` hoặc `AbortController` trong dọn dẹp
11. Dự án thật dùng TanStack Query hoặc framework cho việc lấy dữ liệu
12. Hàm dọn dẹp + `setTimeout` = debounce
13. **Không dùng effect** cho: dữ liệu tính được, đặt lại state (dùng `key`), logic của sự kiện, chuỗi cập nhật, báo cho cha, khởi tạo một lần
14. Code chạy **vì hành động** → hàm xử lý sự kiện; **vì đang hiển thị** → effect
15. Stale closure trong interval → updater function
16. Object/hàm làm phụ thuộc → đưa vào trong effect
17. Mặc định `useEffect`; `useLayoutEffect` chỉ khi cần đo trước khi vẽ

---

## Bài tập

Làm trong `bai-tap/src/bai-06/`.

### Bài 1 — Đoán thứ tự log

Với mỗi component, ghi vào `ghi-chu.md` thứ tự Console sẽ in khi: (a) tải trang, (b) bấm nút một lần. Nhớ `StrictMode`. Đoán trước, chạy sau.

```tsx
// --- A ---
function A() {
  const [n, setN] = useState(0);
  console.log("render", n);
  useEffect(() => {
    console.log("effect", n);
  });
  return <button onClick={() => setN(n + 1)}>{n}</button>;
} -> render 0 effect 0 render 1 effect 1
// ⚠️ NOTE (A): Thứ tự render → effect đúng, nhưng thiếu StrictMode và chưa tách (a)/(b).
//   StrictMode (dev) làm 2 việc:
//     - Gọi thân component 2 lần MỖI lần render → "render" in 2 lần (React 19 in lần 2 màu mờ)
//     - Chỉ lúc mount: gắn → gỡ → gắn lại → effect chạy 2 lần (không có hàm dọn nên không in gì xen giữa)
//   Đáp án đúng:
//   (a) tải trang: render 0, render 0 (mờ), effect 0, effect 0
//   (b) bấm 1 lần: render 1, render 1 (mờ), effect 1      ← sau mount thì effect không bị chạy đôi nữa

// --- B ---
function B() {
  const [n, setN] = useState(0);
  useEffect(() => {
    console.log("effect", n);
    return () => console.log("dọn", n);
  }, [n]);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
} -> effect 0 dọn 0 effect 1 
// ⚠️ NOTE (B): Phần bấm nút đúng (dọn 0 rồi mới effect 1, vì hàm dọn giữ n của lần render cũ). Thiếu StrictMode lúc tải trang.
//   (a) tải trang: effect 0, dọn 0, effect 0     ← gắn → gỡ (dọn) → gắn lại
//   (b) bấm 1 lần: dọn 0, effect 1

// --- C ---
function C() {
  const [n, setN] = useState(0);
  const [m, setM] = useState(0);
  useEffect(() => {
    console.log("effect n", n);
  }, [n]);
  return <button onClick={() => setM(m + 1)}>m = {m}</button>;
} -> effect n 0, khi bấm thì chỗ button thay đổi m n không thay đổi nên useEffect không chạy nên không in console
// ⚠️ NOTE (C): Lập luận đúng. Chỉ thiếu StrictMode:
//   (a) tải trang: effect n 0, effect n 0
//   (b) bấm 1 lần: không in gì. Nói chính xác: component VẪN render lại (m đổi, nút hiện m = 1),
//       chỉ có effect là bị bỏ qua vì n không đổi.

// --- D ---
function D() {
  const [n, setN] = useState(0);
  useEffect(() => {
    console.log("effect []");
    return () => console.log("dọn []");
  }, []);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
} -> effect [] 
// ⚠️ NOTE (D): Thiếu StrictMode, và nên ghi rõ phần bấm nút.
//   (a) tải trang: effect [], dọn [], effect []
//   (b) bấm 1 lần: không in gì ([] → effect không chạy lại khi render lại)
//   "dọn []" chỉ in thêm lần nữa khi component bị gỡ thật.

// --- E ---
function E() {
  const [n, setN] = useState(0);
  const obj = { n };
  useEffect(() => {
    console.log("effect obj");
  }, [obj]);
  return <button onClick={() => setN(n)}>{n}</button>;
} -> effect obj không render lại => effect sẽ không chạy
// ✅ NOTE (E): Đúng ý chính: setN(n) cùng giá trị → React bỏ qua (Object.is), không commit → effect không chạy.
//   Thêm StrictMode: (a) tải trang: effect obj, effect obj   (b) bấm: không in gì
//   Điểm cần thấy thêm: obj được TẠO MỚI mỗi lần render, nên [obj] luôn "khác".
//   Giả sử nút là setN(n + 1) thì effect sẽ chạy MỌI lần render, coi như không có mảng phụ thuộc.
//   Sửa: dùng [n] thay vì [obj] (phụ thuộc vào giá trị nguyên thủy).
```

Câu E là câu đáng suy nghĩ nhất: nút gọi `setN(n)` với **cùng** giá trị. Có render lại không? Nếu không render lại thì effect có chạy không?

### Bài 2 — Sửa năm effect viết sai (bài chính)

Mỗi component dưới đây có ít nhất một vấn đề. Với mỗi cái: ghi vào `ghi-chu.md` vấn đề là gì, thuộc loại nào ở mục 9 hoặc 10, rồi viết lại.

```tsx
// --- 1 ---
function GioHang({ ds }: { ds: { gia: number; sl: number }[] }) {
  const [tong, setTong] = useState(0);
  useEffect(() => {
    setTong(ds.reduce((t, sp) => t + sp.gia * sp.sl, 0));
  }, [ds]);
  return <p>Tổng: {tong}</p>;
} -> vấn đề tổng có thể được tính từ ds sao phải có state rồi phải tính setTong, và khi component render thì nó lại render tổng 0 trước rồi mới render tổng theo ds -> 9.1
// ✅ NOTE (1): Đúng cả vấn đề lẫn loại. Thêm cho đủ ý: mỗi lần ds đổi đều tốn 2 lần render
//   (render với tong cũ → effect setTong → render lại). Lần render đầu thì hiện "Tổng: 0" sai trong chốc lát.
//   Hướng sửa: tính thẳng trong thân component, không cần state lẫn effect.

// --- 2 ---
function DongHoBam() {
  const [giay, setGiay] = useState(0);
  useEffect(() => {
    setInterval(() => {
      setGiay(giay + 1);
    }, 1000);
  }, []);
  return <p>{giay}s</p>;
} -> vấn đề không để giay làm tham số thứ 2, tức là khi setGiay được chạy thì nó luôn ở giay ban đầu là 0 + 1 nên luôn hiển thị 0s 1s 1s ... -> 10 ### Bộ đếm đứng yên
// ⚠️ NOTE (2): Chẩn đoán stale closure đúng (giay bị "chụp" = 0 → luôn setGiay(1) → 0s, 1s, 1s...).
//   Nhưng hướng sửa "thêm giay vào mảng phụ thuộc" thì CHƯA đủ, còn thiếu 1 vấn đề:
//   ❌ Thiếu hàm dọn dẹp (mục 4): interval không bao giờ bị clearInterval.
//      - StrictMode gắn → gỡ → gắn lại → 2 interval cùng chạy
//      - Component biến mất thì interval vẫn chạy mãi
//      - Nếu chỉ thêm [giay] mà không dọn: mỗi giây tạo thêm 1 interval mới → chồng chất
//   Hướng sửa: xem lại mục 10, có cách giữ [] mà vẫn đúng (gợi ý: setGiay nhận một HÀM), + return hàm dọn.

// --- 3 ---
function HoSoNguoiDung({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [nhap, setNhap] = useState("");

  useEffect(() => {
    setNhap("");
  }, [userId]);

  useEffect(async () => {
    const res = await fetch(`/api/users/${userId}`);
    setUser(await res.json());
  }, [userId]);

  return <input value={nhap} onChange={(e) => setNhap(e.target.value)} />;
} -> vấn đề: với effect 1 lần render đầu sau khi đổi userId thì vẫn hiện user trước rồi mới đổi lại trống -> 9.2, với effect 2 thì trong useEffect không trả về Promise
// ⚠️ NOTE (3): Đúng 2/3 vấn đề.
//   ✅ Effect 1: đặt lại state khi prop đổi → 9.2. Hướng sửa: bỏ effect, cha truyền key={userId}.
//   ✅ Effect 2: async trực tiếp → hàm trả về Promise, React tưởng đó là hàm dọn. (Loại này ở mục 7
//      "Không viết được async trực tiếp", không phải mục 9/10.) Hướng sửa: viết hàm async BÊN TRONG rồi gọi nó.
//   ❌ Thiếu vấn đề 3: RACE CONDITION (mục 7 "Race condition"). Đổi userId nhanh 1 → 2: request của user 1
//      có thể về SAU request của user 2 → setUser(user 1) đè lên → màn hình hiện sai người.
//      Effect không có hàm dọn để "bỏ qua" kết quả cũ. Hướng sửa: AbortController hoặc cờ bỏ qua.

// --- 4 ---
function FormDatHang() {
  const [daGui, setDaGui] = useState(false);
  const [duLieu, setDuLieu] = useState({ ten: "", sdt: "" });

  useEffect(() => {
    if (daGui) {
      fetch("/api/don-hang", { method: "POST", body: JSON.stringify(duLieu) });
      alert("Đặt hàng thành công!");
    }
  }, [daGui, duLieu]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); setDaGui(true); }}>
      {/* ... */}
    </form>
  );
} -> vấn đề: khi submit thì fetch và alert luôn bằng 1 hàm sử lý sự kiện thay vì phải dùng state daGui + useEffect -> 9.3, vấn đề: trong lúc gửi nếu thay đổi dữ liệu thì lại gửi phát nữa vì không chặn gửi 1 lần
// ⚠️ NOTE (4): Vấn đề 1 đúng (9.3). Vấn đề 2 bạn thấy đúng hiện tượng, nhưng nói chưa đúng nguyên nhân:
//   - Không phải "TRONG LÚC gửi". Mà là SAU KHI gửi xong: daGui vẫn = true MÃI MÃI, và duLieu nằm trong
//     mảng phụ thuộc → người dùng sửa tên 1 ký tự → duLieu đổi → effect chạy lại → if (daGui) đúng
//     → POST lần nữa + alert lần nữa. Gõ 5 ký tự = 5 đơn hàng.
//   - Hướng sửa KHÔNG phải thêm cờ "chặn gửi 1 lần" (lại là vá effect). Chuyển fetch + alert vào onSubmit
//     là hết cả 2 vấn đề cùng lúc, state daGui cũng không cần nữa (trừ khi muốn hiện UI "đã gửi").

// --- 5 ---
function KichThuocCuaSo() {
  const [rong, setRong] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", () => setRong(window.innerWidth));
  });
  return <p>Rộng: {rong}px</p>;
} -> tôi không biết tác dụng của window.addEventListener("resize", () => setRong(window.innerWidth));
// 📝 NOTE (5): Giải thích dòng đó trước:
//   window.addEventListener("resize", fn) = "mỗi khi cửa sổ trình duyệt bị kéo to/nhỏ, hãy gọi fn".
//   fn ở đây = () => setRong(window.innerWidth) → đọc chiều rộng mới của cửa sổ, cất vào state → render lại
//   → <p> hiện số mới. Tức component muốn "rong luôn khớp với chiều rộng cửa sổ" (đúng là việc của effect).
//   Thử: mở trang, kéo nhỏ cửa sổ (hoặc mở DevTools bên cạnh) → con số đổi theo.
//
//   Giờ tự tìm 2 vấn đề bằng cách trả lời 3 câu (xem lại mục 3, mục 4, mục 8 "Lắng nghe sự kiện của window"):
//   (a) useEffect này KHÔNG có tham số thứ 2 → nó chạy khi nào? (sau lần render đầu? sau mọi lần render?)
//   (b) Mỗi lần nó chạy thì làm gì? Kéo cửa sổ 1 cái → setRong → render lại → rồi sao nữa?
//       Sau 10 lần kéo thì window đang giữ bao nhiêu listener?
//   (c) Có hàm dọn không? Component biến mất thì listener còn không?
```

Số 3 có **ba** vấn đề. Số 4 có hai — một vấn đề sẽ lộ ra nếu người dùng sửa tên sau khi đã gửi. Số 5 có hai.

### Bài 3 — Các effect đúng

Viết từng component, mỗi cái có hàm dọn dẹp đúng. Với mỗi cái, kiểm tra trong `StrictMode`: Console có cho thấy effect chạy hai lần không, và có gì bị nhân đôi không (hai interval, hai listener)?

1. **`DongHo`** — hiện giờ hiện tại, cập nhật mỗi giây. Nút "Tạm dừng / Tiếp tục" — khi tạm dừng thì interval phải thật sự bị xóa, không phải chỉ ẩn đi
2. **`KichThuocCuaSo`** — hiện chiều rộng và cao cửa sổ, cập nhật khi thay đổi kích thước. Thêm debounce 200ms bằng kỹ thuật dọn dẹp ở mục 8
3. **`TieuDeTrang`** — nhận prop `tieuDe`, đặt `document.title`. Khi component biến mất, khôi phục tiêu đề cũ. Gợi ý: lưu tiêu đề cũ ở đầu effect
4. **`TrangThaiMang`** — hiện "Đang trực tuyến" / "Mất kết nối" dựa trên `navigator.onLine` và hai sự kiện `online`, `offline` của `window`. Thử bằng DevTools → Network → Offline
5. **`ViTriChuot`** — hiện tọa độ chuột. Chỉ lắng nghe khi một checkbox "Theo dõi chuột" được bật — đặt `if` **bên trong** effect, không bọc `useEffect` trong `if`

Với **`DongHo`**, đặt nó trong một component cha có nút "Ẩn / Hiện đồng hồ". Ẩn đi rồi xem Console — interval đã dừng chưa?

### Bài 4 — Pokédex gọi API thật

Chuyển Pokédex từ dữ liệu giả sang PokéAPI thật:

1. Danh sách 20 Pokémon đầu tiên tải bằng effect, ba trạng thái loading / lỗi / thành công bằng discriminated union
2. Danh sách từ PokéAPI chỉ có `name` và `url`. Lấy chi tiết (ảnh, loại) cho từng con: gọi song song bằng `Promise.all` (mục 5 file `11` chặng 2), bên trong cùng một effect
3. Modal chi tiết: tải dữ liệu khi `idDangXem` đổi. Chống race condition bằng `AbortController`. Kiểm tra bằng DevTools → Network → Slow 3G, bấm nhanh qua 5 Pokémon liên tiếp — modal cuối cùng phải hiện đúng con cuối cùng
4. Ô tìm kiếm: debounce 400ms bằng hàm dọn dẹp, **kết hợp** chống race condition. Gọi `/pokemon/{tên}` khi người dùng ngừng gõ. Tên không tồn tại (404) → thông báo "Không tìm thấy", không phải màn hình lỗi chung
5. Yêu thích lưu vào `localStorage`: đọc bằng khởi tạo lười, ghi bằng effect
6. Nút "Thử lại" khi lỗi. Gợi ý: một state `lanThu` nằm trong mảng phụ thuộc của effect tải; bấm "Thử lại" thì tăng nó
7. Mở tab Network, đếm request khi: tải trang (với `StrictMode`), mở modal, gõ "pikachu" liên tục. Ghi số liệu vào `ghi-chu.md`

Câu 7 thường cho thấy `StrictMode` gây ra hai request lúc tải trang — một cái bị hủy ngay. Nếu bạn dùng `AbortController` đúng, request đầu sẽ hiện trạng thái "canceled" trong tab Network. Đó là bằng chứng dọn dẹp đang hoạt động.

### Bài 5 — Todo app lưu trữ

Lấy todo app ở bài 4 file `05`:

1. Đọc danh sách từ `localStorage` bằng khởi tạo lười, xử lý dữ liệu hỏng (dùng lại tư duy của `KhoLuuTru` ở mục 11 file `07` chặng 3)
2. Ghi bằng **một** effect duy nhất, phụ thuộc vào danh sách
3. Đồng bộ giữa các tab bằng sự kiện `storage` của `window` (mục 5 file `13` chặng 2) — đây là một effect riêng, có dọn dẹp
4. `document.title` hiển thị số việc chưa xong, ví dụ "(3) Việc cần làm"
5. Kiểm tra: mở hai tab, thêm việc ở tab này, tab kia có cập nhật không?

Ghi vào `ghi-chu.md`: với mỗi effect trong app, nó đang đồng bộ với hệ thống bên ngoài nào? Nếu bạn không trả lời được cho một effect nào đó, có lẽ nó không nên là effect.

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Effect dùng để làm gì? Khác hàm xử lý sự kiện ở đâu?
2. Mảng phụ thuộc hoạt động thế nào? Vì sao nói "phụ thuộc không do bạn chọn"?
3. Hàm dọn dẹp chạy khi nào? Vì sao `StrictMode` chạy effect hai lần?
4. Race condition khi gọi API trong effect xảy ra thế nào? Kể hai cách chống.
5. Kể bốn trường hợp **không** nên dùng effect, và dùng gì thay thế.
6. Vì sao bộ đếm trong `setInterval` với `[]` đứng ở `1`? Cách sửa tốt nhất là gì, vì sao?

---

## Xong file này khi

- [ ] Bài 1 có phần đoán viết trước cho cả tải trang và bấm nút; giải thích được câu E
- [ ] Bài 2 tìm và sửa đủ mọi vấn đề trong năm component
- [ ] Năm component ở bài 3 không bị nhân đôi gì trong `StrictMode`; ẩn đồng hồ thì interval dừng thật
- [ ] Pokédex gọi PokéAPI thật, không lỗi race condition khi mạng chậm, có số liệu request
- [ ] Todo app lưu, khôi phục, đồng bộ giữa hai tab
- [ ] Mọi effect bạn viết đều trả lời được câu "đang đồng bộ với hệ thống nào?"
- [ ] Trả lời được 6 câu ở bài 6 bằng lời

File tiếp theo (`07-lifting-state-up`) giải quyết câu hỏi bạn đã gặp vài lần: khi hai component cần cùng một dữ liệu, state nên nằm ở đâu?

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-06`, kèm **"viết file 07-lifting-state-up"**.