# 07 — Lifting State Up

> **Cần có trước:** xong `02` (props, luồng dữ liệu một chiều, prop drilling), `03` (thiết kế state — đặc biệt nguyên tắc "không nhân bản dữ liệu"), `04` (state dính vào vị trí, `key`), `06` (mục 9.5 — báo cho cha).
> **Thời gian:** 3–4 giờ.
> **Vì sao quan trọng:** đến giờ, mỗi component tự giữ state của nó. Nhưng ứng dụng thật hiếm khi như vậy: bộ đếm giỏ hàng ở đầu trang phải khớp với danh sách sản phẩm ở giữa trang, ô tìm kiếm ở thanh bên phải điều khiển được danh sách ở khung chính. File này trả lời một câu hỏi bạn sẽ tự hỏi mỗi ngày khi viết React: **state này nên nằm ở đâu?**

---

## 1. Vấn đề

Một accordion — nhiều mục, bấm tiêu đề để mở nội dung:

```tsx
function MucAccordion({ tieuDe, children }: { tieuDe: string; children: ReactNode }) {
  const [mo, setMo] = useState(false);
  return (
    <section>
      <button onClick={() => setMo(!mo)}>{tieuDe}</button>
      {mo && <div>{children}</div>}
    </section>
  );
}

function CauHoiThuongGap() {
  return (
    <>
      <MucAccordion tieuDe="Giao hàng mất bao lâu?">2–3 ngày làm việc.</MucAccordion>
      <MucAccordion tieuDe="Có được đổi trả không?">Trong vòng 7 ngày.</MucAccordion>
      <MucAccordion tieuDe="Thanh toán thế nào?">Tiền mặt hoặc chuyển khoản.</MucAccordion>
    </>
  );
}
```

Chạy tốt. Rồi có yêu cầu mới: **mỗi lúc chỉ được mở một mục**. Mở mục này thì mục kia phải tự đóng.

Làm thế nào? Mục thứ nhất không biết mục thứ hai đang mở hay đóng. State `mo` của mỗi mục nằm riêng trong chính nó — nhớ mục 2 file `03`: mỗi lần xuất hiện của component có state riêng, độc lập. Và nhớ mục 7 file `02`: anh em không truyền props cho nhau được.

Không có cách nào để các mục **phối hợp** với nhau khi mỗi cái tự quyết định trạng thái của mình.

---

## 2. Đưa state lên

Giải pháp: chuyển state ra khỏi các mục con, đặt nó ở **cha chung gần nhất**, rồi truyền xuống bằng props.

Ba bước:

### Bước 1 — Bỏ state khỏi con, nhận qua props

```tsx
type MucAccordionProps = {
  tieuDe: string;
  children: ReactNode;
  dangMo: boolean;          // trước đây là state riêng, giờ cha quyết định
  onMo: () => void;          // báo lên cha khi người dùng bấm
};

function MucAccordion({ tieuDe, children, dangMo, onMo }: MucAccordionProps) {
  return (
    <section>
      <button onClick={onMo}>{tieuDe}</button>
      {dangMo && <div>{children}</div>}
    </section>
  );
}
```

`MucAccordion` không còn `useState` nào. Nó chỉ **hiển thị** theo props, và **báo lên** khi người dùng bấm.

### Bước 2 — Cha giữ state

Câu hỏi then chốt: state đúng là gì? Không phải "mỗi mục có mở không" — vì như vậy vẫn có thể có hai mục cùng mở. State đúng là **"mục nào đang mở"**:

```tsx
function CauHoiThuongGap() {
  const [idDangMo, setIdDangMo] = useState<number | null>(0);
  // ...
}
```

Một giá trị duy nhất. Không thể rơi vào trạng thái hai mục cùng mở — đây là nguyên tắc 2 ở mục 10 file `03`: chọn cấu trúc state khiến trạng thái vô lý **không thể tồn tại**.

### Bước 3 — Truyền xuống

```tsx
function CauHoiThuongGap() {
  const [idDangMo, setIdDangMo] = useState<number | null>(0);

  return (
    <>
      <MucAccordion
        tieuDe="Giao hàng mất bao lâu?"
        dangMo={idDangMo === 0}
        onMo={() => setIdDangMo(0)}
      >
        2–3 ngày làm việc.
      </MucAccordion>
      <MucAccordion
        tieuDe="Có được đổi trả không?"
        dangMo={idDangMo === 1}
        onMo={() => setIdDangMo(1)}
      >
        Trong vòng 7 ngày.
      </MucAccordion>
      {/* ... */}
    </>
  );
}
```

Bấm một mục → `onMo` → cha `setIdDangMo` → cha render lại → mọi mục nhận `dangMo` mới → chỉ một mục mở.

Bạn đã thấy đúng mẫu này với radio button ở mục 3 file `05`: một state cho cả nhóm, mỗi lựa chọn tự hỏi `checked={goi === g}`. Accordion "chỉ mở một" thực chất là một nhóm radio với giao diện khác.

### Luồng dữ liệu

```
          CauHoiThuongGap
          state: idDangMo
         /       |        \
   dangMo ↓  dangMo ↓   dangMo ↓      dữ liệu chảy xuống
   MucA       MucB       MucC
   onMo ↑    onMo ↑     onMo ↑        sự kiện chảy lên
```

Đúng mô hình "dữ liệu chảy xuống, sự kiện chảy lên" ở mục 7 file `02`. Lúc đó hàm `onXoa` của bạn chỉ `console.log` được, vì chưa có state. Giờ cha có state, và sự kiện từ con thật sự thay đổi được dữ liệu.

---

## 3. Component controlled và uncontrolled

Ở file `05`, bạn đã gặp hai khái niệm này với ô `<input>`. Chúng áp dụng cho **mọi component**:

- **Uncontrolled** — component tự giữ state của mình. Cha không điều khiển được. Bản `MucAccordion` đầu tiên ở mục 1
- **Controlled** — component nhận mọi thông tin quan trọng qua props. Cha quyết định. Bản `MucAccordion` ở mục 2

| | Uncontrolled | Controlled |
|---|---|---|
| Ai giữ state | Chính nó | Cha |
| Dùng | Đơn giản, ít props | Phải truyền đủ props |
| Phối hợp với component khác | Không | Có |
| Cha đọc/đặt được giá trị | Không | Có |

Không có cái nào luôn tốt hơn. Uncontrolled tiện khi component đứng một mình. Controlled cần thiết khi nó phải phối hợp với thứ khác.

Mẹo quyết định: khi viết một component dùng lại, hãy hỏi *"cha có bao giờ cần biết hoặc thay đổi giá trị này không?"*. Nếu có → controlled.

Một số thư viện UI hỗ trợ **cả hai**: nhận `dangMo` thì là controlled, không nhận thì tự giữ state. Bạn sẽ gặp mẫu này ở chặng 5; ở chặng này, chọn một và làm cho đúng.

---

## 4. Một nguồn sự thật

Nhớ nguyên tắc 3 ở mục 10 file `03`: **không nhân bản dữ liệu**. Nâng state lên là cách áp dụng nguyên tắc đó cho **nhiều component**.

```tsx
// ❌ Hai nguồn sự thật
function ThanhDau() {
  const [soLuongGio, setSoLuongGio] = useState(0);
  return <span>Giỏ hàng ({soLuongGio})</span>;
}

function DanhSachSanPham() {
  const [gio, setGio] = useState<MucGio[]>([]);
  // thêm vào gio... nhưng làm sao báo cho ThanhDau?
}
```

Hai component giữ hai bản riêng của "giỏ hàng". Thêm sản phẩm ở `DanhSachSanPham`, `ThanhDau` không hề biết. Có thể nghĩ tới việc dùng effect để đồng bộ hai state — nhưng mục 9.5 file `06` đã nói: đó là dấu hiệu sai.

```tsx
// ✓ Một nguồn sự thật ở cha chung
function CuaHang() {
  const [gio, setGio] = useState<MucGio[]>([]);
  const soLuongGio = gio.reduce((t, m) => t + m.soLuong, 0);   // tính khi render

  return (
    <>
      <ThanhDau soLuongGio={soLuongGio} />
      <DanhSachSanPham onThem={(sp) => setGio((g) => themVaoGio(g, sp))} />
    </>
  );
}
```

`gio` có **một** chủ sở hữu. `soLuongGio` tính ra từ nó (nguyên tắc 1). `ThanhDau` và `DanhSachSanPham` không bao giờ lệch nhau được.

**Mỗi mảnh state có đúng một component sở hữu.** Những component khác muốn dùng thì nhận qua props; muốn thay đổi thì gọi hàm mà chủ sở hữu truyền xuống.

---

## 5. State nên nằm ở đâu

Quy trình bốn bước, áp dụng cho từng mảnh state:

1. **Liệt kê** mọi component **hiển thị** hoặc **thay đổi** dựa trên state đó
2. Tìm **cha chung gần nhất** của tất cả chúng trong cây component
3. Đặt state ở cha chung đó
4. Nếu không có component nào hợp lý để đặt (cha chung chỉ là một khung bố cục chẳng liên quan), tạo một component mới chỉ để giữ state đó, đặt nó ngay trên cha chung

### Ví dụ

```
App
├── DauTrang
│   └── HuyHieuGio              ← hiện số lượng giỏ
└── TrangCuaHang
    ├── ThanhBen
    │   ├── OTimKiem             ← thay đổi từ khóa
    │   └── BoLocDanhMuc         ← thay đổi danh mục
    └── KhungChinh
        ├── DemKetQua            ← hiện số kết quả
        └── LuoiSanPham          ← hiện sản phẩm theo bộ lọc; thêm vào giỏ
            └── TheSanPham (nhiều)
```

**State `tuKhoa`, `danhMuc`:**
1. Dùng bởi: `OTimKiem`, `BoLocDanhMuc` (thay đổi); `DemKetQua`, `LuoiSanPham` (hiển thị)
2. Cha chung gần nhất: `TrangCuaHang`
3. → đặt ở `TrangCuaHang`

**State `gio`:**
1. Dùng bởi: `HuyHieuGio` (hiển thị); `TheSanPham` (thay đổi — nút "Thêm vào giỏ")
2. Cha chung gần nhất: `App`
3. → đặt ở `App`

**State "ảnh nào đang được rê chuột" trên một thẻ:**
1. Dùng bởi: chỉ chính `TheSanPham` đó
2. → giữ nguyên trong `TheSanPham`

Ba mảnh state, ba vị trí khác nhau. Không có chuyện "đưa hết lên `App` cho chắc".

---

## 6. Đừng đưa lên quá cao

Nếu đưa state lên giải quyết được vấn đề, sao không đưa **mọi** state lên `App`?

### Lý do 1 — Render lại không cần thiết

Nhớ mục 6 file `03`: khi một component render lại, **mọi con của nó** cũng render lại. Đặt `tuKhoa` ở `App` nghĩa là mỗi phím gõ vào ô tìm kiếm khiến **toàn bộ ứng dụng** render lại — đầu trang, chân trang, thanh điều hướng, mọi thứ.

Bật "Highlight updates" trong DevTools và thử: cả màn hình nhấp nháy theo từng ký tự.

Với ứng dụng nhỏ, React vẫn đủ nhanh. Nhưng thói quen này tích tụ: sau vài tháng, ứng dụng chậm mà không ai chỉ ra được vì sao.

### Lý do 2 — Khó đọc

State ở `App` phải truyền qua năm tầng mới tới nơi dùng — prop drilling (mục 13 file `02`). Đọc `App` thì thấy hai mươi state, không biết cái nào để làm gì.

### Nguyên tắc: giữ state gần nơi dùng nhất có thể

Người ta gọi nguyên tắc này là **colocation** — đặt cạnh nhau những thứ đi cùng nhau. State nên nằm ở **cha chung gần nhất**, không cao hơn.

Và chiều ngược lại cũng đúng: nếu bạn đưa một state lên, sau đó yêu cầu thay đổi khiến chỉ còn **một** component dùng nó, hãy **đưa nó xuống lại**. Cấu trúc state không cố định — nó thay đổi theo yêu cầu.

### State giao diện thuần túy ở lại trong con

```tsx
function DongViec({ viec, onLuu, onXoa }: DongViecProps) {
  const [dangSua, setDangSua] = useState(false);       // chỉ dòng này cần biết
  const [banNhap, setBanNhap] = useState(viec.noiDung);
  // ...
}
```

`dangSua` và `banNhap` chỉ có ý nghĩa với một dòng, trong lúc đang sửa. Cha không cần biết. Chỉ khi người dùng bấm Lưu, dòng đó mới gọi `onLuu(viec.id, banNhap)` để cập nhật dữ liệu thật ở cha.

Đây là sự phân chia tự nhiên:

- **Dữ liệu** (danh sách việc) → ở cha, vì nhiều nơi dùng
- **Trạng thái giao diện tạm thời** (đang sửa dòng nào, bản nháp) → ở con, vì chỉ nó cần

Ngoại lệ: ở bài 4 todo app file `05`, mình gợi ý đặt `idDangSua` ở **danh sách** — vì có yêu cầu "mỗi lúc chỉ sửa một dòng". Lại là bài toán accordion: khi các dòng cần phối hợp với nhau, state phải lên cha.

---

## 7. Truyền hàm có ý nghĩa, không truyền thẳng `setState`

```tsx
// Được, nhưng...
<DanhSachViec ds={ds} setDs={setDs} />

function DanhSachViec({ ds, setDs }: { ds: Viec[]; setDs: Dispatch<SetStateAction<Viec[]>> }) {
  // con tự viết logic sửa mảng của cha
  <button onClick={() => setDs((d) => d.filter((v) => v.id !== id))}>Xóa</button>
}
```

```tsx
// Tốt hơn
<DanhSachViec ds={ds} onXoa={xoaViec} onBatTat={batTatViec} />

function DanhSachViec({ ds, onXoa, onBatTat }: DanhSachViecProps) {
  <button onClick={() => onXoa(v.id)}>Xóa</button>
}
```

Cách thứ hai tốt hơn vì:

- **Con chỉ nói ý định** ("xóa việc này"), không biết cách dữ liệu được lưu. Cha đổi cấu trúc dữ liệu (ví dụ từ mảng sang object tra cứu theo id) thì con không phải sửa
- **Logic tập trung một chỗ.** Mọi cách thay đổi `ds` nằm trong cha, dễ tìm, dễ kiểm tra
- **Kiểu rõ ràng.** `onXoa: (id: string) => void` dễ đọc hơn nhiều so với `Dispatch<SetStateAction<Viec[]>>`
- **Con truyền đi thông tin tối thiểu** — chỉ `id`, không phải cả object hay cả mảng mới

Nhớ module pattern ở mục 6.2 file `05` chặng 2: dữ liệu riêng tư, chỉ thay đổi qua những hàm công khai có kiểm soát. Cùng tinh thần.

### Khi cha có quá nhiều hàm xử lý

```tsx
function UngDung() {
  const [ds, setDs] = useState<Viec[]>([]);

  function them(noiDung: string) { ... }
  function xoa(id: string) { ... }
  function batTat(id: string) { ... }
  function sua(id: string, noiDung: string) { ... }
  function xoaDaXong() { ... }
  function danhDauTatCa() { ... }
  function dichLen(id: string) { ... }
  function dichXuong(id: string) { ... }
  // ...
}
```

Tám hàm, tất cả đều sửa cùng một `ds`. Khi số hàm cứ tăng, React có một công cụ gom toàn bộ logic cập nhật vào một hàm duy nhất bên ngoài component: **`useReducer`**. Nó là chủ đề ở chặng 5. Ở đây chỉ cần nhận ra dấu hiệu: nhiều hàm xử lý cùng sửa một state.

---

## 8. State mất khi component biến mất

```tsx
function TrangCaiDat() {
  const [tab, setTab] = useState<"ho-so" | "bao-mat">("ho-so");

  return (
    <>
      <button onClick={() => setTab("ho-so")}>Hồ sơ</button>
      <button onClick={() => setTab("bao-mat")}>Bảo mật</button>
      {tab === "ho-so" ? <FormHoSo /> : <FormBaoMat />}
    </>
  );
}

function FormHoSo() {
  const [moTa, setMoTa] = useState("");
  // ...
}
```

Gõ một đoạn mô tả dài trong tab "Hồ sơ", chuyển sang "Bảo mật", quay lại — đoạn mô tả **mất sạch**.

Khi chuyển tab, `FormHoSo` bị gỡ khỏi cây. State của một component **chỉ tồn tại khi component đó còn trên màn hình** (mục 4 file `04`, chi tiết ở file `11`). Gỡ đi là mất.

Muốn giữ lại thì state phải nằm ở nơi **không bị gỡ** — tức là đưa lên cha:

```tsx
function TrangCaiDat() {
  const [tab, setTab] = useState<"ho-so" | "bao-mat">("ho-so");
  const [moTa, setMoTa] = useState("");

  return (
    <>
      {/* ... */}
      {tab === "ho-so"
        ? <FormHoSo moTa={moTa} onDoiMoTa={setMoTa} />
        : <FormBaoMat />}
    </>
  );
}
```

Đây là lý do thứ hai để đưa state lên, ngoài lý do phối hợp: **giữ state sống lâu hơn component hiển thị nó**.

Phần nâng cao ở bài 4 file `04` — mỗi người nhận có tin nháp riêng, chuyển qua lại không mất — chính là bài toán này. Lời giải: `Record<number, string>` ở cha.

Lưu ý ngược lại: đôi khi mất state là điều **bạn muốn** (form tạo mới phải trống mỗi lần mở). Hiểu cơ chế để quyết định, chứ không phải lúc nào cũng giữ.

---

## 9. Khi đã đưa lên, lại giữ state tối thiểu

```tsx
// ❌ Đưa lên rồi nhân bản luôn
function TrangCuaHang() {
  const [dsSanPham, setDsSanPham] = useState(duLieu);
  const [tuKhoa, setTuKhoa] = useState("");
  const [dsDaLoc, setDsDaLoc] = useState(duLieu);    // ← nhân bản
  const [soKetQua, setSoKetQua] = useState(0);       // ← tính được
}

// ✓
function TrangCuaHang() {
  const [dsSanPham, setDsSanPham] = useState(duLieu);
  const [tuKhoa, setTuKhoa] = useState("");

  const dsDaLoc = dsSanPham.filter((sp) => khop(sp, tuKhoa));
  const soKetQua = dsDaLoc.length;
}
```

Đưa state lên thường đi kèm cám dỗ "tiện thể lưu luôn kết quả cho con dùng". Đừng. Mọi nguyên tắc ở mục 10 file `03` vẫn áp dụng ở cha.

---

## 10. Đưa lên thì phải truyền xuống

Đưa state lên vài tầng là xuất hiện prop drilling — các component trung gian phải nhận và chuyển props mà chúng không dùng.

Trước khi coi đó là vấn đề, nhớ lại mục 13 file `02`: **composition** thường giải quyết được. Thay vì để `BoCuc` nhận `gio` rồi truyền cho `DauTrang` rồi truyền cho `HuyHieuGio`, tạo sẵn `<HuyHieuGio soLuong={...} />` ở nơi có dữ liệu, truyền nó xuống như một mảnh giao diện.

```tsx
function App() {
  const [gio, setGio] = useState<MucGio[]>([]);
  const soLuong = gio.reduce((t, m) => t + m.soLuong, 0);

  return (
    <BoCuc dauTrang={<DauTrang gocPhai={<HuyHieuGio soLuong={soLuong} />} />}>
      <TrangCuaHang onThemVaoGio={(sp) => setGio((g) => themVaoGio(g, sp))} />
    </BoCuc>
  );
}
```

Khi dữ liệu cần ở **rất nhiều** nơi rải rác (người dùng đăng nhập, theme, ngôn ngữ), composition không còn đủ — đó là lúc dùng **Context** ở chặng 5. Nhưng đừng nhảy tới Context chỉ vì phải truyền qua hai, ba tầng. Props tường minh dễ theo dõi hơn nhiều.

---

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Hai component anh em không phối hợp được | Mỗi cái giữ state riêng | Đưa state lên cha chung gần nhất |
| Hai nơi hiển thị cùng dữ liệu nhưng lệch nhau | Hai bản state | Một nguồn sự thật, chia sẻ qua props |
| Dùng effect để đồng bộ state giữa hai component | Thiết kế sai vị trí state | Đưa state lên, xóa effect |
| Cả ứng dụng nhấp nháy theo từng phím gõ | State đặt quá cao | Đưa xuống cha chung gần nhất |
| Con nhận `setX` rồi tự viết logic sửa dữ liệu của cha | Lộ chi tiết triển khai | Truyền hàm có ý nghĩa: `onXoa(id)` |
| Chuyển tab, dữ liệu đang gõ mất | Component bị gỡ, state mất theo | Đưa state lên component không bị gỡ |
| Đưa state lên rồi vẫn có `dsDaLoc`, `soKetQua` là state | Lưu thứ tính được | Tính trong lúc render |
| Accordion vẫn mở được hai mục cùng lúc | Mỗi mục một boolean ở cha | Một state `idDangMo` duy nhất |
| `App` có hai mươi state | Đưa mọi thứ lên "cho chắc" | Áp dụng quy trình mục 5 cho từng state |
| Props truyền qua năm tầng | Prop drilling | Composition trước; Context (chặng 5) nếu thật cần |

---

## 12. Tóm tắt cần thuộc

1. Anh em không chia sẻ được state — muốn phối hợp, đưa state lên **cha chung gần nhất**
2. Ba bước: bỏ state khỏi con → con nhận qua props → cha giữ state và truyền xuống cả giá trị lẫn hàm xử lý
3. Chọn cấu trúc state khiến trạng thái vô lý không tồn tại — "mục nào đang mở", không phải "mỗi mục có mở không"
4. Component **controlled** nhận dữ liệu qua props; **uncontrolled** tự giữ state
5. **Mỗi mảnh state có đúng một chủ sở hữu**
6. Quy trình: liệt kê nơi dùng → tìm cha chung gần nhất → đặt ở đó
7. **Không đưa lên quá cao** — render lại thừa và khó đọc; giữ state gần nơi dùng nhất có thể
8. Yêu cầu đổi thì cấu trúc state đổi theo — đưa xuống được cũng như đưa lên được
9. State giao diện tạm thời của riêng một con (đang sửa, bản nháp) ở lại trong con
10. Truyền hàm mang **ý định** (`onXoa(id)`), không truyền thẳng `setState`
11. Nhiều hàm cùng sửa một state → dấu hiệu cần `useReducer` (chặng 5)
12. State mất khi component bị gỡ — đưa lên để giữ lại lâu hơn
13. Đưa lên rồi vẫn phải giữ state tối thiểu — không lưu thứ tính được ở cha
14. Prop drilling: composition trước, Context sau

---

## Bài tập

Làm trong `bai-tap/src/bai-07/`.

### Bài 1 — Accordion

1. Viết bản uncontrolled như mục 1, năm mục, mở độc lập
2. Chuyển sang bản controlled "chỉ mở một" theo đúng ba bước ở mục 2. Dữ liệu năm câu hỏi khai báo thành mảng, render bằng `map`
3. Bấm vào mục đang mở thì đóng nó lại (không mục nào mở)
4. Thêm nút gạt ở cha: "Cho phép mở nhiều mục". Khi bật, các mục mở độc lập; khi tắt, chỉ mở một. Gợi ý: state ở cha giờ phải biểu diễn được cả hai chế độ — cân nhắc `Set<number>` hoặc `number[]` các mục đang mở. Khi chuyển từ "nhiều" sang "một", xử lý thế nào nếu đang có ba mục mở?
5. Nút "Mở tất cả" / "Đóng tất cả" — chỉ hiện khi đang ở chế độ nhiều mục

Ghi vào `ghi-chu.md`: ở câu 4, bạn đã chọn cấu trúc state nào? Có cấu trúc nào khiến chế độ "một mục" không thể rơi vào trạng thái nhiều mục mở không?

### Bài 2 — Bộ chuyển đổi tiền tệ

Hai ô nhập: VNĐ và USD. Gõ vào ô nào, ô kia tự cập nhật theo tỷ giá cố định.

1. Mỗi ô là một component `OTien` dùng lại được, nhận `donVi`, `giaTri`, `onDoi`
2. **Chỉ một state nguồn** ở cha. Hãy cân nhắc: lưu cả hai giá trị là nhân bản dữ liệu. Lưu một giá trị thì khi người dùng gõ vào ô kia, bạn phải chuyển ngược. Gợi ý từ tài liệu React: lưu **giá trị người dùng vừa gõ** và **ô nào họ vừa gõ vào**, ô còn lại tính ra
3. Thêm ô thứ ba: EUR. Cấu trúc state của bạn có phải đổi không?
4. Hiển thị tỷ giá bằng một ô nhập thứ tư, người dùng sửa được. Đổi tỷ giá thì các ô cập nhật theo

Câu 2 là phần đáng suy nghĩ nhất. Ghi lại vì sao lưu "ô vừa gõ" giải quyết được vấn đề số thập phân bị làm tròn nhảy qua nhảy lại giữa hai ô.

### Bài 3 — Refactor ứng dụng có state rải rác (bài chính)

Dưới đây là một ứng dụng chạy được nhưng state đặt sai chỗ khắp nơi. Đọc, chỉ ra vấn đề, rồi viết lại.

```tsx
const SAN_PHAM = [
  { id: 1, ten: "Bàn phím", gia: 1500000, danhMuc: "phu-kien" },
  { id: 2, ten: "Chuột", gia: 350000, danhMuc: "phu-kien" },
  { id: 3, ten: "Màn hình", gia: 5200000, danhMuc: "man-hinh" },
  { id: 4, ten: "SSD 1TB", gia: 2100000, danhMuc: "luu-tru" },
];

function DauTrang() {
  const [soLuongGio, setSoLuongGio] = useState(0);
  return <header>Giỏ hàng: {soLuongGio}</header>;
}

function OTimKiem() {
  const [tuKhoa, setTuKhoa] = useState("");
  return <input value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} />;
}

function BoLoc() {
  const [danhMuc, setDanhMuc] = useState("tat-ca");
  return (
    <select value={danhMuc} onChange={(e) => setDanhMuc(e.target.value)}>
      <option value="tat-ca">Tất cả</option>
      <option value="phu-kien">Phụ kiện</option>
      <option value="man-hinh">Màn hình</option>
      <option value="luu-tru">Lưu trữ</option>
    </select>
  );
}

function DanhSach() {
  const [gio, setGio] = useState<number[]>([]);
  const [dsHienThi, setDsHienThi] = useState(SAN_PHAM);
  return (
    <ul>
      {dsHienThi.map((sp) => (
        <li key={sp.id}>
          {sp.ten} — {sp.gia}
          <button onClick={() => setGio([...gio, sp.id])}>Thêm vào giỏ</button>
        </li>
      ))}
    </ul>
  );
}

function TongGio() {
  const [tong, setTong] = useState(0);
  return <footer>Tổng tiền: {tong}</footer>;
}

export default function App() {
  return (
    <>
      <DauTrang />
      <aside>
        <OTimKiem />
        <BoLoc />
      </aside>
      <main>
        <DanhSach />
      </main>
      <TongGio />
    </>
  );
}
```

1. Vẽ cây component. Với **mỗi** state trong code, áp dụng quy trình ở mục 5: ai dùng, cha chung gần nhất là ai, nó nên nằm ở đâu, hay nó không nên là state. Lập bảng vào `ghi-chu.md`
2. Viết lại sao cho: tìm kiếm và lọc thật sự hoạt động; số lượng giỏ ở đầu trang và tổng tiền ở chân trang luôn khớp với giỏ hàng; giỏ hàng lưu **số lượng** từng sản phẩm (bấm thêm hai lần thì số lượng là 2, không phải hai dòng)
3. Mọi hàm truyền xuống là hàm mang ý định (`onThemVaoGio(id)`), không có `setState` nào được truyền thẳng
4. Thêm nút "+"/"−" và "Xóa" cho từng mục trong giỏ — giỏ hàng hiển thị ở một khu vực riêng
5. Bật "Highlight updates", gõ vào ô tìm kiếm — `DauTrang` có nhấp nháy không? Nếu có, có cách nào đặt state tìm kiếm thấp hơn mà vẫn đúng không?

Câu 5 đáng thử: nếu bạn tách phần "thanh bên + danh sách" thành một component `TrangCuaHang` riêng, state tìm kiếm có thể nằm ở đó thay vì ở `App`.

### Bài 4 — Tab giữ dữ liệu

1. Dựng trang cài đặt với ba tab: "Hồ sơ" (họ tên, mô tả), "Thông báo" (ba checkbox), "Giao diện" (radio sáng/tối, select cỡ chữ)
2. Bản 1: mỗi tab giữ state riêng. Gõ dữ liệu, chuyển tab, quay lại — ghi lại cái gì mất
3. Bản 2: đưa state lên để giữ dữ liệu khi chuyển tab
4. Thêm nút "Lưu tất cả" ở dưới cùng — chỉ bật khi có thay đổi so với giá trị ban đầu. "Có thay đổi không" là state hay tính được?
5. Thêm nút "Hoàn tác thay đổi" đưa mọi thứ về giá trị ban đầu

Ghi vào `ghi-chu.md`: tab "Giao diện" có lẽ nên áp dụng ngay khi chọn (đổi màu nền trang). State đó nên nằm ở đâu — trong `TrangCaiDat` hay cao hơn? Vì sao?

### Bài 5 — Pokédex tổ chức lại

Nhìn lại cây component Pokédex của bạn:

1. Lập bảng mọi state hiện có — tên, đang nằm ở đâu, ai dùng, nên nằm ở đâu
2. Thêm một thanh đầu trang hiện số Pokémon yêu thích. Yêu thích hiện đang nằm ở đâu? Có cần đưa lên không?
3. Tách khu vực bộ lọc thành một component `ThanhBoLoc` riêng. Nó nên là controlled hay uncontrolled? Vì sao?
4. Thêm khu vực "Đội hình" — chọn tối đa 6 Pokémon từ danh sách, hiện ở một khung riêng bên phải. Không chọn trùng, không quá 6. State đội hình đặt ở đâu?
5. Bật "Highlight updates", gõ vào ô tìm kiếm. Khu vực đội hình có nhấp nháy không? Có nên quan tâm không?

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. "Lifting state up" là gì? Khi nào cần làm?
2. Component controlled và uncontrolled khác nhau thế nào? Liên hệ với ô input ở file `05`.
3. Làm sao quyết định một state nên nằm ở component nào? Mô tả quy trình.
4. Vì sao không nên đưa mọi state lên `App`?
5. Vì sao nên truyền `onXoa(id)` thay vì truyền thẳng `setDs` xuống con?
6. Vì sao chuyển tab lại làm mất dữ liệu đang gõ? Cách giữ lại là gì?

---

## Xong file này khi

- [ ] Accordion hoạt động ở cả hai chế độ; giải thích được cấu trúc state đã chọn
- [ ] Bộ chuyển đổi tiền tệ chỉ có một nguồn sự thật, mở rộng được sang ba đơn vị
- [ ] Bài 3 có bảng phân tích đủ mọi state; bản viết lại có giỏ hàng, đầu trang, chân trang luôn khớp
- [ ] Tab giữ được dữ liệu; biết "có thay đổi" là state hay tính được
- [ ] Pokédex có bảng vị trí state, có thêm đội hình
- [ ] Trả lời được 6 câu ở bài 6 bằng lời

Hết khối C. Bạn đã có đủ công cụ để xây gần như mọi giao diện React: component, props, state, danh sách, form, effect, và biết đặt state ở đâu. Khối D (`08` → `11`) đi vào những công cụ ít dùng hơn nhưng không thể thiếu — `useRef`, tối ưu hiệu năng, custom hook — và cuối cùng mổ xẻ React thật sự render như thế nào.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-07`, kèm **"viết file 08-useref"**.