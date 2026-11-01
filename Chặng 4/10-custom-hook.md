# 10 — Custom Hook

> **Cần có trước:** xong `03` (luật Hook), `06` (effect, dọn dẹp, race condition), `08` (`useRef`), `09` (`useCallback`). Nhớ file `07` chặng 3 (generic, discriminated union `KetQua<T>`), file `05` chặng 2 (closure, debounce).
> **Thời gian:** 4–5 giờ.
> **Vì sao quan trọng:** nhìn lại các bài tập từ file `06` tới giờ — bạn đã viết đi viết lại cùng một khối `useState` + `useEffect` để gọi API, cùng một cặp "đọc bằng khởi tạo lười, ghi bằng effect" cho `localStorage`, cùng một đoạn `addEventListener`/`removeEventListener`. Custom hook là cách React cho bạn gom những khối logic đó lại thành hàm dùng lại được. Nó cũng là nền để hiểu mọi thư viện React ở chặng 5 — TanStack Query, React Hook Form, Zustand đều được dùng qua Hook.

---

## 1. Vấn đề

Hai component, cùng cần biết người dùng có đang trực tuyến không:

```tsx
function ThanhTrangThai() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const bat = () => setOnline(true);
    const tat = () => setOnline(false);
    window.addEventListener("online", bat);
    window.addEventListener("offline", tat);
    return () => {
      window.removeEventListener("online", bat);
      window.removeEventListener("offline", tat);
    };
  }, []);

  return <p>{online ? "✅ Trực tuyến" : "❌ Mất kết nối"}</p>;
}

function NutLuu() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    // ... y hệt mười dòng ở trên
  }, []);

  return <button disabled={!online}>{online ? "Lưu" : "Đang chờ kết nối..."}</button>;
}
```

Mười dòng lặp lại nguyên văn. Sửa một chỗ (ví dụ thêm kiểm tra định kỳ) là phải nhớ sửa chỗ kia.

Ở chặng 2, khi một đoạn code lặp lại, bạn tách nó thành **hàm**. Ở đây không làm vậy được với hàm thường — vì đoạn code có gọi `useState` và `useEffect`, và luật Hook (mục 3 file `03`) cấm gọi Hook trong hàm thường.

Trừ khi hàm đó cũng là một Hook.

---

## 2. Custom hook

```tsx
function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const bat = () => setOnline(true);
    const tat = () => setOnline(false);
    window.addEventListener("online", bat);
    window.addEventListener("offline", tat);
    return () => {
      window.removeEventListener("online", bat);
      window.removeEventListener("offline", tat);
    };
  }, []);

  return online;
}
```

```tsx
function ThanhTrangThai() {
  const online = useOnline();
  return <p>{online ? "✅ Trực tuyến" : "❌ Mất kết nối"}</p>;
}

function NutLuu() {
  const online = useOnline();
  return <button disabled={!online}>{online ? "Lưu" : "Đang chờ kết nối..."}</button>;
}
```

Một custom hook là **một hàm JavaScript bình thường**, chỉ có hai điều đặc biệt:

1. Tên bắt đầu bằng **`use`** theo sau là chữ hoa: `useOnline`, `useFetch`, `useLocalStorage`
2. Bên trong nó **gọi Hook khác**

Không có API mới nào. Không có gì phải đăng ký với React. Bạn chỉ di chuyển một khối code từ thân component vào một hàm riêng — đúng cách bạn tách hàm từ file `02` chặng 2.

Giờ đọc `NutLuu` là thấy ngay ý định: *"nút này phụ thuộc trạng thái mạng"*. Chi tiết **làm sao** biết trạng thái mạng được giấu trong `useOnline`. Component mô tả **cái gì**, Hook lo **làm thế nào**.

---

## 3. Vì sao tên phải bắt đầu bằng `use`

Quy ước này không chỉ để đẹp. Nó có hai tác dụng thật:

**1. Plugin ESLint dựa vào nó.** `eslint-plugin-react-hooks` chỉ kiểm tra luật Hook bên trong những hàm tên bắt đầu bằng `use` (và component viết hoa). Đặt tên `layTrangThaiMang` thì linter không biết đó là Hook — gọi nó trong `if` cũng không ai cảnh báo.

**2. Người đọc biết ngay.** Thấy `useX()` là biết: hàm này có thể chứa state hay effect, phải gọi ở cấp cao nhất, không đặt trong `if`.

### Chiều ngược lại cũng đúng

```tsx
// ❌ Không gọi Hook nào — không nên đặt tên use
function useSapXep(ds: SanPham[]) {
  return ds.toSorted((a, b) => a.gia - b.gia);
}

// ✓ Hàm thường
function sapXepTheoGia(ds: SanPham[]) {
  return ds.toSorted((a, b) => a.gia - b.gia);
}
```

Hàm không gọi Hook thì **không phải Hook**. Đặt tên `use` cho nó là áp đặt luật Hook một cách vô lý — giờ nó không gọi được trong `if` nữa, dù chẳng có lý do gì. Hàm thường dùng được ở mọi nơi, kể cả ngoài React.

Quy tắc: **chỉ đặt tên `use` khi hàm có gọi ít nhất một Hook.**

---

## 4. Custom hook chia sẻ logic, không chia sẻ state

**Đây là điều quan trọng nhất của file.** Rất nhiều người hiểu sai chỗ này.

```tsx
function useDem() {
  const [dem, setDem] = useState(0);
  const tang = () => setDem((d) => d + 1);
  return [dem, tang] as const;
}

function A() {
  const [dem, tang] = useDem();
  return <button onClick={tang}>A: {dem}</button>;
}

function B() {
  const [dem, tang] = useDem();
  return <button onClick={tang}>B: {dem}</button>;
}
```

Bấm nút A ba lần. Nút B vẫn hiện `0`.

`A` và `B` dùng chung **đoạn code** của `useDem`, nhưng mỗi cái có **state riêng**. Gọi `useDem()` trong `A` cũng giống hệt như viết thẳng `useState(0)` trong `A`. Gọi trong `B` thì `B` có `useState(0)` của riêng nó.

Nhớ mục 2 file `03` và bài 2 file `05` chặng 2: gọi `taoBoDem()` hai lần cho hai bộ đếm độc lập, mỗi cái có closure riêng. Custom hook hoạt động đúng như vậy. Mỗi lần gọi là một bộ state mới.

Vậy còn `useOnline` ở mục 2 — hai component luôn hiện cùng một trạng thái? Đó là vì cả hai **cùng đồng bộ với một nguồn bên ngoài** (trạng thái mạng của trình duyệt), không phải vì chung state. Mỗi component vẫn có một state `online` riêng và một cặp listener riêng. Mở React DevTools sẽ thấy.

**Muốn hai component thật sự chia sẻ cùng một state**, custom hook không giải quyết được. Bạn cần đưa state lên cha chung (file `07`), hoặc dùng Context hay thư viện quản lý state (chặng 5).

---

## 5. Custom hook chạy lại ở mọi lần render

Custom hook không phải thứ gì tách biệt khỏi component. Code của nó **chạy như thể được viết thẳng trong thân component** — mỗi lần component render, Hook chạy lại.

Hệ quả:

**1. Hook nhận được props và state mới nhất.** Truyền giá trị vào qua tham số:

```tsx
function useTieuDe(tieuDe: string) {
  useEffect(() => {
    const cu = document.title;
    document.title = tieuDe;
    return () => { document.title = cu; };
  }, [tieuDe]);
}

function TrangSanPham({ sp }: { sp: SanPham }) {
  useTieuDe(`${sp.ten} — Cửa hàng`);   // sp đổi → tieuDe đổi → effect chạy lại
  // ...
}
```

**2. Luật thuần áp dụng.** Phần chạy trong lúc render của Hook (mọi thứ ngoài effect và hàm xử lý) phải thuần, giống thân component (mục 7 file `01`).

**3. Luật Hook áp dụng cho cả nơi gọi lẫn bên trong.** Gọi custom hook ở cấp cao nhất của component. Bên trong custom hook, gọi Hook khác cũng ở cấp cao nhất.

---

## 6. Thiết kế giá trị trả về

### Trả về một giá trị

```tsx
const online = useOnline();
```

### Trả về tuple — như `useState`

```tsx
function useToggle(banDau = false) {
  const [bat, setBat] = useState(banDau);
  const doi = useCallback(() => setBat((b) => !b), []);
  return [bat, doi] as const;
}

const [moMenu, doiMenu] = useToggle();
const [cheDoToi, doiCheDoToi] = useToggle(true);
```

`as const` biến mảng thành tuple chỉ đọc (mục 7 file `06` chặng 3). Không có nó, TypeScript suy kiểu là `(boolean | (() => void))[]` — mỗi phần tử có thể là một trong hai kiểu, và bạn mất kiểm tra kiểu khi destructuring.

**Dùng tuple khi** có hai, tối đa ba giá trị, và nơi gọi thường muốn **tự đặt tên** (như ví dụ trên: `moMenu`, `cheDoToi`).

### Trả về object

```tsx
function useFetch<T>(url: string) {
  // ...
  return { trangThai, taiLai };
}

const { trangThai, taiLai } = useFetch<Pokemon>(url);
```

**Dùng object khi** có nhiều giá trị, hoặc khi thứ tự không có ý nghĩa tự nhiên. Nơi gọi chỉ lấy những gì cần, đổi tên được bằng cú pháp destructuring (mục 3.1 file `03` chặng 2).

### Hàm trả về nên ổn định

Nhớ file `09`: hàm truyền xuống component `memo` hoặc dùng làm phụ thuộc effect thì cần tham chiếu ổn định. Bạn không biết người dùng Hook của mình sẽ làm gì với hàm trả về — nên một Hook dùng lại tốt thường bọc hàm trả về trong `useCallback`. Đó là lý do `doi` ở `useToggle` trên có `useCallback`.

Nếu dự án đã bật React Compiler (mục 9 file `09`), việc này được tự động lo.

---

## 7. `useLocalStorage`

Gom lại mẫu bạn đã viết ở bài 5 file `06`:

```tsx
function useLocalStorage<T>(khoa: string, macDinh: T) {
  const [giaTri, setGiaTri] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(khoa);
      return raw === null ? macDinh : (JSON.parse(raw) as T);
    } catch {
      return macDinh;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(khoa, JSON.stringify(giaTri));
    } catch {
      // hết dung lượng hoặc chế độ ẩn danh — bỏ qua
    }
  }, [khoa, giaTri]);

  return [giaTri, setGiaTri] as const;
}
```

```tsx
const [ds, setDs] = useLocalStorage<Viec[]>("todo:ds", []);
const [boLoc, setBoLoc] = useLocalStorage<BoLoc>("todo:bo-loc", "tat-ca");
const [yeuThich, setYeuThich] = useLocalStorage<number[]>("pokedex:yeu-thich", []);
```

Dùng y hệt `useState`, nhưng dữ liệu sống sót qua lần tải trang.

Vài điểm:

- **Generic `<T>`** (file `07` chặng 3) — Hook dùng được cho mọi kiểu dữ liệu, và `giaTri` có đúng kiểu nơi gọi khai báo
- **Khởi tạo lười** (mục 9 file `03`) — chỉ đọc `localStorage` một lần
- **`try/catch`** cả đọc lẫn ghi (mục 3–4 file `13` chặng 2)
- **`as T`** sau `JSON.parse` là "lời nói dối" ở mục 10 file `07` chặng 3 — dữ liệu trong `localStorage` có thể sai cấu trúc. Bài tập sẽ yêu cầu bạn thêm một tham số type guard để kiểm tra thật

### Một hạn chế cần biết

Khởi tạo lười chỉ chạy **lần đầu**. Nếu nơi gọi đổi `khoa` (ví dụ `"ghi-chu:" + userId`, và `userId` đổi), state vẫn giữ giá trị của khóa cũ — rồi effect ghi giá trị cũ đó vào **khóa mới**. Dữ liệu của người dùng mới bị ghi đè.

Cách xử lý đơn giản nhất ở phía nơi gọi: đặt `key` cho component dùng Hook (mục 7 file `04`), để component được tạo lại khi khóa đổi. Hook chuyên nghiệp hơn sẽ tự xử lý trường hợp này — đó là một phần lý do người ta dùng thư viện cho những Hook phổ biến.

---

## 8. `useDebounce`

Nhớ debounce bằng hàm dọn dẹp ở mục 8 file `06`. Gom thành Hook — nhưng lần này debounce một **giá trị**, không phải một hàm:

```tsx
function useDebounce<T>(giaTri: T, treMs = 400): T {
  const [giaTriTre, setGiaTriTre] = useState(giaTri);

  useEffect(() => {
    const id = setTimeout(() => setGiaTriTre(giaTri), treMs);
    return () => clearTimeout(id);
  }, [giaTri, treMs]);

  return giaTriTre;
}
```

```tsx
function TimKiem() {
  const [tuKhoa, setTuKhoa] = useState("");
  const tuKhoaTre = useDebounce(tuKhoa, 400);

  // ô input dùng tuKhoa — phản hồi ngay mỗi phím
  // việc gọi API dùng tuKhoaTre — chỉ đổi khi ngừng gõ 400ms
}
```

`tuKhoa` đổi mỗi phím gõ. `tuKhoaTre` chỉ "đuổi kịp" `tuKhoa` sau khi người dùng ngừng gõ đủ lâu. Bất cứ effect nào phụ thuộc `tuKhoaTre` (ví dụ effect gọi API) sẽ chạy ít hơn hẳn.

Cách này gọn hơn hàm `debounce` ở chặng 2 trong ngữ cảnh React: không cần ref giữ id timer, không cần lo hàm debounce bị tạo lại mỗi render (cái bẫy ở mục 9 file `05` chặng 2), và dọn dẹp tự động khi component biến mất.

So với `useDeferredValue` ở mục 10 file `09`: `useDeferredValue` để trễ **việc render**, không có khoảng thời gian cố định, không giảm số request. `useDebounce` để trễ **giá trị**, có khoảng thời gian cụ thể, dùng để giảm số lần gọi API. Hai việc khác nhau.

---

## 9. `useFetch`

Gom toàn bộ mẫu gọi API ở mục 7 file `06`:

```tsx
type TrangThaiFetch<T> =
  | { loai: "dang-tai" }
  | { loai: "loi"; thongBao: string }
  | { loai: "thanh-cong"; duLieu: T };

function useFetch<T>(url: string | null) {
  const [trangThai, setTrangThai] = useState<TrangThaiFetch<T>>({ loai: "dang-tai" });
  const [lanThu, setLanThu] = useState(0);

  useEffect(() => {
    if (url === null) return;

    const ac = new AbortController();
    setTrangThai({ loai: "dang-tai" });

    fetch(url, { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T>;
      })
      .then((duLieu) => setTrangThai({ loai: "thanh-cong", duLieu }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setTrangThai({
          loai: "loi",
          thongBao: err instanceof Error ? err.message : "Lỗi không xác định",
        });
      });

    return () => ac.abort();
  }, [url, lanThu]);

  const taiLai = useCallback(() => setLanThu((n) => n + 1), []);

  return { trangThai, taiLai };
}
```

```tsx
function ChiTietPokemon({ id }: { id: number }) {
  const { trangThai, taiLai } = useFetch<Pokemon>(
    `https://pokeapi.co/api/v2/pokemon/${id}`,
  );

  switch (trangThai.loai) {
    case "dang-tai":
      return <p>Đang tải...</p>;
    case "loi":
      return (
        <p>
          {trangThai.thongBao} <button onClick={taiLai}>Thử lại</button>
        </p>
      );
    case "thanh-cong":
      return <h2>{trangThai.duLieu.name}</h2>;
  }
}
```

Mọi thứ phức tạp — race condition, `AbortController`, `res.ok`, lọc `AbortError`, discriminated union, tải lại — giờ nằm trong một Hook. Component chỉ còn việc hiển thị.

Hai chi tiết thiết kế:

- **`url: string | null`** — truyền `null` để **tạm không tải**. Hữu ích khi URL phụ thuộc vào thứ chưa có (ví dụ chưa chọn Pokémon nào). Không gọi Hook trong `if` được, nhưng truyền vào giá trị "không làm gì" thì được
- **`lanThu` trong mảng phụ thuộc** — tăng nó lên là effect chạy lại. Kỹ thuật bạn đã dùng ở câu 6 bài 4 file `06`

Kết hợp với `useDebounce`:

```tsx
const [tuKhoa, setTuKhoa] = useState("");
const tuKhoaTre = useDebounce(tuKhoa.trim().toLowerCase(), 400);
const { trangThai } = useFetch<Pokemon>(
  tuKhoaTre ? `https://pokeapi.co/api/v2/pokemon/${tuKhoaTre}` : null,
);
```

Ô tìm kiếm có debounce, chống race condition, xử lý lỗi, trạng thái tải — trong bốn dòng. So với Pokédex chặng 2, nơi bạn phải tự viết từng mảnh này.

### Đây là lý do TanStack Query tồn tại

`useFetch` của bạn còn thiếu rất nhiều: hai component cùng gọi một URL thì gửi hai request (state không chia sẻ — mục 4); mở lại Pokémon vừa xem thì tải lại từ đầu; không tự tải lại khi quay lại tab; không thử lại khi lỗi mạng. Thêm từng thứ vào là một khối lượng lớn.

TanStack Query (chặng 5) là một bộ custom hook đã giải quyết hết những thứ đó. Cách dùng của nó trông rất giống `useFetch` bạn vừa viết — và bạn sẽ hiểu ngay nó đang làm gì bên dưới.

---

## 10. Hook nhận hàm làm tham số

```tsx
function useEventListener<K extends keyof WindowEventMap>(
  loai: K,
  xuLy: (e: WindowEventMap[K]) => void,
) {
  useEffect(() => {
    window.addEventListener(loai, xuLy);
    return () => window.removeEventListener(loai, xuLy);
  }, [loai, xuLy]);
}
```

`K extends keyof WindowEventMap` — generic có ràng buộc (mục 4–5 file `07` chặng 3). `WindowEventMap` là kiểu có sẵn ánh xạ tên sự kiện sang kiểu sự kiện. Gõ `useEventListener("keydown", (e) => ...)` thì TypeScript biết `e` là `KeyboardEvent`.

Vấn đề: nơi gọi thường viết hàm tại chỗ.

```tsx
useEventListener("keydown", (e) => {
  if (e.key === "Escape") onDong();
});
```

Hàm mới mỗi lần render → phụ thuộc `xuLy` đổi → effect gỡ và gắn lại listener sau **mọi** lần render. Bắt nơi gọi bọc `useCallback` thì phiền, và dễ quên.

### Mẫu "ref giữ hàm mới nhất"

```tsx
function useEventListener<K extends keyof WindowEventMap>(
  loai: K,
  xuLy: (e: WindowEventMap[K]) => void,
) {
  const xuLyRef = useRef(xuLy);

  useEffect(() => {
    xuLyRef.current = xuLy;            // luôn cập nhật hàm mới nhất
  });

  useEffect(() => {
    const ham = (e: WindowEventMap[K]) => xuLyRef.current(e);
    window.addEventListener(loai, ham);
    return () => window.removeEventListener(loai, ham);
  }, [loai]);                           // không phụ thuộc xuLy nữa
}
```

- Listener chỉ gắn **một lần** (mỗi khi `loai` đổi)
- Listener không gọi trực tiếp `xuLy`, mà gọi `xuLyRef.current` — luôn là hàm của lần render mới nhất
- Effect thứ nhất cập nhật ref **sau mỗi lần render** — trong effect, không phải lúc render (mục 3 file `08`)

Đây là ứng dụng của "giá trị mới nhất, thoát khỏi ảnh chụp" ở mục 4 file `08`. Nơi gọi viết hàm tại chỗ thoải mái, không cần `useCallback`, và hàm luôn thấy props/state mới nhất.

Các phiên bản React mới có một Hook dành riêng cho đúng vấn đề này: **`useEffectEvent`**. Nó cho phép tách phần logic "chỉ cần đọc giá trị mới nhất" ra khỏi danh sách phụ thuộc của effect. Nếu dự án của bạn dùng phiên bản có Hook này, nó là cách chính thức thay cho mẫu ref ở trên. Tra `react.dev` để xem cách dùng hiện tại.

### `useInterval` theo cùng mẫu

```tsx
function useInterval(callback: () => void, treMs: number | null) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (treMs === null) return;
    const id = setInterval(() => callbackRef.current(), treMs);
    return () => clearInterval(id);
  }, [treMs]);
}
```

```tsx
const [dem, setDem] = useState(0);
const [chay, setChay] = useState(true);

useInterval(() => setDem(dem + 1), chay ? 1000 : null);
```

Nhớ bộ đếm đứng ở `1` ở mục 10 file `06`. Với `useInterval`, viết `setDem(dem + 1)` — không cần updater — vẫn chạy đúng, vì callback luôn là phiên bản mới nhất. Và truyền `null` để tạm dừng — interval thật sự bị xóa.

---

## 11. Khi nào nên tách thành custom hook

### Nên

- **Logic lặp lại** ở hai component trở lên
- **Một khối effect phức tạp** làm thân component khó đọc, kể cả khi chỉ dùng một chỗ — tách ra để component chỉ còn mô tả ý định
- **Đồng bộ với một hệ thống bên ngoài** — mạng, kích thước cửa sổ, `localStorage`, API. Đây là trường hợp phổ biến và hợp lý nhất

Một dấu hiệu tốt: mỗi `useEffect` trong component của bạn có nên là một custom hook không? Tài liệu React gợi ý rằng effect nằm trần trong component thường là dấu hiệu bạn đang chạm tới thứ React chưa có sẵn — và gói nó vào một Hook có tên rõ ràng giúp code dễ hiểu hơn.

### Không nên

**Hook mô phỏng vòng đời:**

```tsx
// ❌
function useMount(fn: () => void) {
  useEffect(() => { fn(); }, []);
}

useMount(() => {
  ketNoi(idPhong);    // bug: idPhong đổi thì không kết nối lại
});
```

Hook kiểu này che giấu mảng phụ thuộc — linter không còn kiểm tra được bạn đã dùng giá trị nào. Nó đưa bạn quay lại cách nghĩ theo vòng đời mà mục 6 file `06` khuyên tránh. Đặt tên Hook theo **mục đích** (`useKetNoiPhong(idPhong)`), không theo **thời điểm** (`useMount`, `useUpdate`).

**Trừu tượng hóa quá sớm.** Một khối code dùng đúng một lần, ngắn và dễ đọc — cứ để nó trong component. Tách khi thấy lặp hoặc thấy rối.

**Hook không gọi Hook nào** — đó là hàm thường (mục 3).

### Custom hook hay component?

- Chia sẻ **logic** (dữ liệu, hành vi, đồng bộ) → custom hook
- Chia sẻ **giao diện** (JSX, kiểu dáng) → component

`useFetch` trả về dữ liệu, mỗi nơi tự quyết định hiển thị thế nào. `ThongBaoLoi` trả về JSX. Thường bạn dùng cả hai cùng nhau.

---

## 12. Tổ chức file

```
src/
├── hooks/
│   ├── useOnline.ts
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   ├── useFetch.ts
│   ├── useEventListener.ts
│   └── index.ts          ← tái xuất (mục 8 file 13 chặng 2)
└── components/
```

Đuôi `.ts`, không phải `.tsx` — Hook không trả về JSX.

Custom hook còn dễ kiểm thử riêng hơn component: thư viện kiểm thử (chặng 7) có công cụ `renderHook` để chạy một Hook mà không cần dựng giao diện.

Cộng đồng có nhiều thư viện tập hợp sẵn các Hook phổ biến (`useLocalStorage`, `useDebounce`, `useMediaQuery`...). Trong dự án thật, dùng chúng thay vì tự viết là hoàn toàn hợp lý. Nhưng tự viết một lần thì bạn mới đọc được mã nguồn của chúng, và biết khi nào chúng không hợp với trường hợp của bạn.

---

## 13. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Hai component dùng chung Hook nhưng không thấy dữ liệu của nhau | Custom hook chia sẻ **logic**, không chia sẻ state | Đưa state lên cha (file `07`), hoặc Context (chặng 5) |
| Linter không bắt lỗi gọi Hook trong `if` | Tên hàm không bắt đầu bằng `use` | Đổi tên thành `useX` |
| Hàm thường bị bắt theo luật Hook | Đặt tên `use` cho hàm không gọi Hook | Đổi tên, bỏ `use` |
| Destructuring tuple bị sai kiểu | Thiếu `as const` khi trả về mảng | `return [a, b] as const` |
| Effect trong Hook chạy lại mỗi lần render | Nơi gọi truyền hàm/object tạo tại chỗ, Hook đặt nó vào phụ thuộc | Mẫu ref giữ hàm mới nhất, hoặc `useEffectEvent` |
| `useLocalStorage` ghi dữ liệu sang khóa sai | Đổi `khoa` mà state vẫn là của khóa cũ | `key` cho component dùng Hook |
| Muốn không tải mà phải gọi Hook trong `if` | Luật Hook | Truyền `null` để Hook tự bỏ qua |
| Hook mô phỏng vòng đời làm mất cảnh báo phụ thuộc | `useMount(fn)` che mảng phụ thuộc | Đặt tên theo mục đích, để lộ phụ thuộc thật |
| Ref giữ callback bị cập nhật lúc render | Ghi `ref.current = cb` trong thân Hook | Ghi trong effect |
| Hai component cùng `useFetch` một URL gửi hai request | State không chia sẻ | Chấp nhận, hoặc dùng TanStack Query (chặng 5) |

---

## 14. Tóm tắt cần thuộc

1. Custom hook là **hàm bình thường** tên bắt đầu bằng `use`, bên trong gọi Hook khác
2. Tên `use` để linter và người đọc nhận ra — **chỉ** đặt khi hàm thật sự gọi Hook
3. **Custom hook chia sẻ logic, không chia sẻ state** — mỗi lần gọi có state riêng
4. Code của Hook chạy ở mọi lần render như thể viết thẳng trong component
5. Truyền giá trị vào qua tham số; Hook luôn nhận giá trị mới nhất
6. Luật thuần và luật Hook áp dụng cả bên trong lẫn nơi gọi
7. Trả về tuple (`as const`) khi ít giá trị và nơi gọi muốn tự đặt tên; object khi nhiều giá trị
8. Hàm trả về nên ổn định — bọc `useCallback`
9. Generic `<T>` làm Hook dùng được cho mọi kiểu dữ liệu
10. Truyền `null` để Hook "tạm không làm gì" thay vì gọi Hook có điều kiện
11. `useDebounce` trễ giá trị; `useDeferredValue` trễ việc render
12. Mẫu **ref giữ hàm mới nhất** cho Hook nhận callback — hoặc `useEffectEvent` ở phiên bản mới
13. Đặt tên theo **mục đích**, không theo vòng đời — tránh `useMount`
14. Logic → custom hook; giao diện → component
15. TanStack Query là một bộ custom hook đã giải quyết những gì `useFetch` của bạn còn thiếu

---

## Bài tập

Làm trong `bai-tap/src/bai-10/`. Mỗi Hook một file trong `bai-10/hooks/`.

### Bài 1 — Chia sẻ logic, không chia sẻ state

1. Viết `useDem(batDau = 0)` trả về `{ dem, tang, giam, datLai }`
2. Dùng nó trong hai component cạnh nhau. Bấm một bên — bên kia có đổi không? Ghi lại -> không đổi
3. Mở React DevTools, chọn từng component, tìm phần Hooks — bạn thấy gì?
4. Giờ yêu cầu: hai component phải **hiện cùng một số đếm**. Làm sao? Ghi vào `ghi-chu.md` vì sao custom hook không làm được, và viết lời giải bằng cách đưa state lên cha
5. Viết `useOnline` theo mục 2, dùng trong ba component. Tắt mạng bằng DevTools — cả ba có đổi không? Vì sao chúng đồng bộ được dù không chung state?`

### Bài 2 — Bộ Hook cơ bản

Viết và thử từng Hook, mỗi cái có ít nhất một component dùng thử:

1. **`useToggle(banDau?)`** → tuple `[bat, doi]`. Thêm `datTrue`, `datFalse` — trả về tuple bốn phần tử hay đổi sang object? Ghi lựa chọn và lý do
2. **`useKichThuocCuaSo()`** → `{ rong, cao }`, cập nhật khi thay đổi kích thước, có debounce 150ms bên trong
3. **`useMediaQuery(truyVan: string)`** → `boolean`. Dùng `window.matchMedia` và sự kiện `change` của nó. Thử với `"(max-width: 600px)"` và `"(prefers-color-scheme: dark)"`
4. **`useTieuDe(tieuDe: string)`** → đặt `document.title`, khôi phục khi component biến mất
5. **`useBamRaNgoai(ref, xuLy)`** → gọi `xuLy` khi người dùng bấm ra ngoài phần tử mà `ref` trỏ tới. Dùng cho menu thả xuống: bấm ra ngoài thì đóng. Gợi ý: `ref.current.contains(e.target)` (mục 3 file `08` chặng 2)

Với **`useMediaQuery`**, ghi vào `ghi-chu.md`: vì sao Hook này tốt hơn việc tự kiểm tra `window.innerWidth` trong `useKichThuocCuaSo`?

### Bài 3 — `useLocalStorage` và `useFetch` (bài chính)

**Phần A — `useLocalStorage`:**

1. Viết theo mục 7
2. Thêm tham số thứ ba **tùy chọn**: `kiemTra?: (x: unknown) => x is T` (type guard — mục 11 file `06` chặng 3). Nếu có và dữ liệu đọc ra không qua được kiểm tra, dùng giá trị mặc định
3. Đồng bộ giữa các tab bằng sự kiện `storage` (mục 5 file `13` chặng 2) — bên trong Hook
4. Kiểm tra: ghi rác vào khóa trong DevTools → Application → Local Storage, tải lại trang. Ứng dụng có vỡ không?
5. Tái hiện hạn chế ở mục 7: dùng Hook với khóa phụ thuộc một state `userId`, đổi `userId`, xem dữ liệu bị ghi đè. Sửa bằng `key` ở phía nơi gọi

**Phần B — `useFetch`:**

1. Viết theo mục 9, có `taiLai` và hỗ trợ `url = null`
2. Thêm tham số tùy chọn `kiemTra?: (x: unknown) => x is T` — dữ liệu không đúng cấu trúc thì chuyển sang trạng thái lỗi "Dữ liệu không hợp lệ" (mục 10 file `07` chặng 3)
3. Kiểm tra race condition: Slow 3G, đổi `url` liên tục năm lần — trạng thái cuối cùng phải ứng với `url` cuối
4. Kiểm tra `StrictMode`: tab Network có thấy request đầu bị "canceled" không?
5. Viết `useDebounce` theo mục 8, kết hợp với `useFetch` cho ô tìm Pokémon theo tên

### Bài 4 — Hook nhận callback

1. Viết `useEventListener` **bản ngây thơ** (phụ thuộc `xuLy` trực tiếp). Dùng nó với hàm viết tại chỗ, thêm `console.log` trong hàm dọn dẹp. Gõ vào một ô nhập bất kỳ trên trang (gây render lại) — Console in gì?
2. Viết lại bằng mẫu ref ở mục 10. Lặp lại thí nghiệm
3. Viết `useInterval` theo mục 10. Dựng bộ đếm dùng `setDem(dem + 1)` (không updater) — nó có chạy đúng không? So với bộ đếm đứng ở `1` ở file `06`
4. Thêm nút đổi tốc độ (500ms / 1000ms / 2000ms) và nút tạm dừng (truyền `null`)
5. Ghi vào `ghi-chu.md`: vì sao ghi `callbackRef.current = callback` phải nằm trong effect, không phải trong thân Hook?

### Bài 5 — Refactor Pokédex và Todo app

**Pokédex:**

1. Thay mọi khối `useState` + `useEffect` gọi API bằng `useFetch`
2. Yêu thích dùng `useLocalStorage` có type guard
3. Ô tìm kiếm dùng `useDebounce`
4. Phím `/` và Escape dùng `useEventListener`
5. Đếm số dòng của component chính trước và sau refactor, ghi vào `ghi-chu.md`
6. Đếm số `useEffect` nằm trực tiếp trong component (không qua custom hook) — lý tưởng là không còn cái nào

**Todo app:**

1. `useLocalStorage` cho danh sách và bộ lọc
2. Viết `useDanhSachViec()` gom **toàn bộ** state và hàm xử lý của todo app: trả về `{ ds, dsHienThi, boLoc, setBoLoc, them, xoa, batTat, sua, xoaDaXong, soChuaXong }`. Component chính chỉ còn gọi Hook này và hiển thị
3. Ghi vào `ghi-chu.md`: `useDanhSachViec` là một Hook tốt hay đang gom quá nhiều? Nếu sau này có trang thứ hai cần danh sách việc, hai trang có thấy cùng dữ liệu không? (Nhớ mục 4.)

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. Custom hook là gì? Nó khác hàm thường ở đâu?
2. Vì sao tên phải bắt đầu bằng `use`? Khi nào **không** nên đặt tên `use`?
3. "Custom hook chia sẻ logic, không chia sẻ state" nghĩa là gì? Cho ví dụ từ bài 1.
4. Khi nào trả về tuple, khi nào trả về object?
5. Vì sao Hook nhận callback từ nơi gọi dễ khiến effect chạy lại liên tục? Cách xử lý?
6. Vì sao không nên viết `useMount`?

---

## Xong file này khi

- [ ] Bài 1 chứng minh được hai component dùng chung Hook có state riêng, và giải thích được vì sao `useOnline` vẫn đồng bộ
- [ ] Năm Hook ở bài 2 hoạt động, menu thả xuống đóng được khi bấm ra ngoài
- [ ] `useLocalStorage` chịu được dữ liệu hỏng và đồng bộ giữa tab; `useFetch` không lỗi race condition
- [ ] `useInterval` chạy đúng với `setDem(dem + 1)`, tạm dừng được
- [ ] Pokédex không còn `useEffect` nằm trần trong component chính
- [ ] Trả lời được 6 câu ở bài 6 bằng lời, đặc biệt câu 3

File tiếp theo (`11-luong-render-cua-react`) là file cuối chặng 4 trước dự án tổng kết. Nó trả lời những câu hỏi mình đã hẹn "để file `11` giải thích" suốt cả chặng: React thật sự render như thế nào, vì sao state dính vào vị trí, vì sao định nghĩa component bên trong component lại làm mất state.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-10`, kèm **"viết file 11-luong-render-cua-react"**.