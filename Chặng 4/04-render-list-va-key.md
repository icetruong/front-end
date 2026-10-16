# 04 — Render danh sách và `key`

> **Cần có trước:** xong `03` (`useState`, cập nhật mảng bất biến). Nhớ file `04` chặng 2 (`map`, `filter`, `reduce`, `toSorted`).
> **Thời gian:** 3–4 giờ.
> **Vì sao quan trọng:** gần như màn hình nào cũng có danh sách. Và `key` là thứ người mới hay coi là "cái cần thêm vào cho hết cảnh báo" — rồi dùng `key={index}` hoặc `key={Math.random()}`, sinh ra những bug rất kỳ quặc: ô input nhảy sai dòng, checkbox tự tick nhầm, nội dung đang gõ biến mất. File này giải thích vì sao.

---

## 1. Render danh sách

Nhớ mục 3 file `01`: trong `{ }` chỉ đặt được **biểu thức**, nên vòng `for` không dùng được. `map` thì được — nó là biểu thức trả về một mảng.

```tsx
const traiCay = ["Táo", "Cam", "Xoài"];

function DanhSach() {
  return (
    <ul>
      {traiCay.map((ten) => (
        <li key={ten}>{ten}</li>
      ))}
    </ul>
  );
}
```

Vì sao chạy được? Bảng ở mục 3 file `01`: một **mảng** các React element được render thành từng phần tử nối tiếp. `map` biến mảng chuỗi thành mảng `<li>`, và React hiện chúng ra.

### Danh sách object

```tsx
type SanPham = { id: number; ten: string; gia: number };

function DanhSachSanPham({ ds }: { ds: SanPham[] }) {
  return (
    <ul>
      {ds.map((sp) => (
        <li key={sp.id}>
          {sp.ten} — {sp.gia.toLocaleString("vi-VN")}đ
        </li>
      ))}
    </ul>
  );
}
```

### Lọc rồi mới render

```tsx
{ds
  .filter((sp) => sp.gia < 1000000)
  .map((sp) => <li key={sp.id}>{sp.ten}</li>)}
```

Nhớ mục 11 file `04` chặng 2: `filter` trước, `map` sau. Với chuỗi dài, tách ra biến cho dễ đọc:

```tsx
function DanhSachSanPham({ ds, giaToiDa }: Props) {
  const dsHienThi = ds.filter((sp) => sp.gia <= giaToiDa);

  return (
    <ul>
      {dsHienThi.map((sp) => <li key={sp.id}>{sp.ten}</li>)}
    </ul>
  );
}
```

Đây là "tính trong lúc render" ở mục 10 file `03`: `dsHienThi` không phải state, nó được suy ra mỗi lần render.

### Cái bẫy `return` quen thuộc

```tsx
{ds.map((sp) => {
  <li key={sp.id}>{sp.ten}</li>;    // ❌ thân hàm có {} mà không return
})}
```

Mảng toàn `undefined` → không hiện gì. Đúng cái bẫy ở mục 4 file `04` chặng 2. Hai cách sửa:

```tsx
{ds.map((sp) => <li key={sp.id}>{sp.ten}</li>)}            // bỏ {} — tự return
{ds.map((sp) => { return <li key={sp.id}>{sp.ten}</li>; })} // giữ {} — phải return
```

Quy tắc `array-callback-return` ở file `05` chặng 3 bắt được lỗi này.

### Danh sách rỗng

```tsx
function DanhSach({ ds }: { ds: SanPham[] }) {
  if (ds.length === 0) {
    return <p className="rong">Chưa có sản phẩm nào.</p>;
  }
  return <ul>{ds.map((sp) => <li key={sp.id}>{sp.ten}</li>)}</ul>;
}
```

Đừng viết `{ds.length && <ul>...</ul>}` — nhớ bẫy số `0` ở mục 4 file `01`.

---

## 2. Cảnh báo về `key`

Bỏ `key` đi:

```tsx
{ds.map((sp) => <li>{sp.ten}</li>)}
```

Console hiện:

```
Warning: Each child in a list should have a unique "key" prop.
```

Trang vẫn chạy. Mọi thứ trông bình thường. Vậy `key` để làm gì?

Để trả lời, cần biết React cập nhật danh sách như thế nào.

---

## 3. React so sánh danh sách ra sao

Nhớ mục 2 file `00`: React không vẽ lại toàn bộ. Mỗi lần render, nó so sánh kết quả mới với kết quả cũ, rồi chỉ sửa những chỗ thật sự khác.

Với một phần tử đơn lẻ, việc này dễ. Với danh sách, có một câu hỏi khó:

```
Lần render trước:        Lần render sau:
  <li>Táo</li>             <li>Dâu</li>      ← thêm vào ĐẦU
  <li>Cam</li>             <li>Táo</li>
  <li>Xoài</li>            <li>Cam</li>
                            <li>Xoài</li>
```

Bạn nhìn vào là biết ngay: thêm "Dâu" vào đầu, ba cái kia giữ nguyên. Nhưng React chỉ thấy hai mảng. Nó không biết `<li>` nào **ở lần trước** tương ứng với `<li>` nào **ở lần sau**.

### Không có `key` — so theo vị trí

Không có thông tin gì khác, React so **theo vị trí**:

| Vị trí | Trước | Sau | React kết luận |
|---|---|---|---|
| 0 | Táo | Dâu | Phần tử 0 đổi chữ |
| 1 | Cam | Táo | Phần tử 1 đổi chữ |
| 2 | Xoài | Cam | Phần tử 2 đổi chữ |
| 3 | — | Xoài | Thêm phần tử 3 |

Bốn thao tác trên DOM, trong khi chỉ cần **một**. Với danh sách chữ đơn giản, kết quả hiển thị vẫn đúng — chỉ lãng phí. Nhưng mục 4 sẽ cho thấy khi nào nó **sai**.

### Có `key` — so theo danh tính

```tsx
{ds.map((tc) => <li key={tc.id}>{tc.ten}</li>)}
```

| Key | Trước | Sau | React kết luận |
|---|---|---|---|
| `tao` | vị trí 0 | vị trí 1 | Cùng phần tử, chỉ dời chỗ |
| `cam` | vị trí 1 | vị trí 2 | Cùng phần tử, chỉ dời chỗ |
| `xoai` | vị trí 2 | vị trí 3 | Cùng phần tử, chỉ dời chỗ |
| `dau` | — | vị trí 0 | Phần tử mới — tạo |

React biết chính xác: tạo một `<li>` mới, dời ba cái cũ. Không có chữ nào bị sửa.

**`key` là danh tính của một phần tử trong danh sách.** Nó cho React biết "đây vẫn là cái cũ" hay "đây là cái mới", bất kể vị trí thay đổi thế nào.

Hình dung thế này: tên file trong một thư mục. Nếu file chỉ được gọi là "file thứ nhất", "file thứ hai", thì khi xóa một file, mọi file phía sau đều đổi tên. Có tên thật thì sắp xếp kiểu gì cũng vẫn nhận ra nhau.

---

## 4. Vì sao `key={index}` gây bug

Có một cách "tắt cảnh báo" mà nhiều người dùng:

```tsx
{ds.map((sp, index) => <li key={index}>{sp.ten}</li>)}
```

Cảnh báo biến mất. Nhưng `index` **là vị trí** — dùng nó làm `key` thì cũng chẳng khác gì không có `key`. React lại so theo vị trí.

Với danh sách chỉ hiện chữ, hậu quả chỉ là lãng phí. Vấn đề thật sự xuất hiện khi mỗi phần tử có **trạng thái riêng**.

### Thí nghiệm

```tsx
type Viec = { id: number; noiDung: string };

function DongViec({ noiDung }: { noiDung: string }) {
  const [ghiChu, setGhiChu] = useState("");
  return (
    <li>
      <span>{noiDung}</span>
      <input
        value={ghiChu}
        onChange={(e) => setGhiChu(e.target.value)}
        placeholder="Ghi chú..."
      />
    </li>
  );
}

export default function ThiNghiemKey() {
  const [ds, setDs] = useState<Viec[]>([
    { id: 1, noiDung: "Học React" },
    { id: 2, noiDung: "Làm bài tập" },
    { id: 3, noiDung: "Đọc tài liệu" },
  ]);

  function themLenDau() {
    setDs((d) => [{ id: Date.now(), noiDung: "Việc mới" }, ...d]);
  }

  return (
    <>
      <button onClick={themLenDau}>Thêm lên đầu</button>
      <ul>
        {ds.map((v, index) => (
          <DongViec key={index} noiDung={v.noiDung} />
        ))}
      </ul>
    </>
  );
}
```

(Ô input dùng `value` + `onChange` — đó là form controlled ở file `05`. Ở đây chỉ cần biết: mỗi `DongViec` tự giữ một state `ghiChu`.)

Làm theo:

1. Gõ "gấp" vào ô ghi chú của dòng **"Học React"**
2. Bấm "Thêm lên đầu"

Kết quả:

```
Việc mới       [gấp]    ← ghi chú "gấp" đã nhảy sang đây!
Học React      [    ]
Làm bài tập    [    ]
Đọc tài liệu   [    ]
```

Ghi chú bạn gõ cho "Học React" giờ nằm cạnh "Việc mới".

### Chuyện gì đã xảy ra

| Key (index) | Trước | Sau |
|---|---|---|
| `0` | `DongViec` "Học React", ghiChu = "gấp" | `DongViec` "Việc mới" |
| `1` | `DongViec` "Làm bài tập" | `DongViec` "Học React" |
| `2` | `DongViec` "Đọc tài liệu" | `DongViec` "Làm bài tập" |
| `3` | — | `DongViec` "Đọc tài liệu" (mới) |

React thấy key `0` vẫn còn → kết luận **cùng một component**, chỉ có prop `noiDung` đổi. Nó giữ nguyên state `ghiChu = "gấp"` của component ở key `0`, chỉ thay chữ hiển thị.

State thuộc về **component tại key đó**, không thuộc về **dữ liệu**. Khi key là vị trí, state dính vào vị trí. Dữ liệu dời đi, state ở lại.

Đổi `key={index}` thành `key={v.id}` rồi lặp lại thí nghiệm. Ghi chú đi theo đúng "Học React".

### Những thứ "dính" vào key

Không chỉ `useState` của bạn. Mọi trạng thái mà một phần tử giữ đều dính vào key:

- State bên trong component con (`useState`)
- Giá trị ô `<input>` không được điều khiển bằng state
- Trạng thái checkbox được tick
- Vị trí con trỏ, phần chữ đang bôi đen
- Focus — ô nào đang được chọn
- Trạng thái animation CSS đang chạy giữa chừng

Tất cả sẽ đi sai chỗ khi bạn thêm vào đầu, xóa ở giữa, sắp xếp, hoặc lọc một danh sách dùng `key={index}`.

---

## 5. `key` tốt trông thế nào

Hai yêu cầu:

1. **Duy nhất** giữa các anh em trong cùng danh sách
2. **Ổn định** — cùng một dữ liệu luôn cho cùng một key, qua mọi lần render

### Nguồn key tốt

**Từ dữ liệu.** Dữ liệu từ server hay cơ sở dữ liệu gần như luôn có `id`. Dùng nó.

```tsx
{users.map((u) => <TheUser key={u.id} user={u} />)}
```

**Sinh ra lúc tạo dữ liệu.** Dữ liệu tạo ở phía client (như việc mới trong todo app) thì sinh `id` **một lần, lúc tạo**, rồi lưu cùng dữ liệu:

```tsx
function them(noiDung: string) {
  setDs((d) => [...d, { id: crypto.randomUUID(), noiDung }]);
}
```

`crypto.randomUUID()` có sẵn trong trình duyệt hiện đại, cho ra chuỗi gần như không thể trùng. Tốt hơn `Date.now()` mà file `03` tạm dùng.

**Thuộc tính tự nhiên là duy nhất.** Mã sản phẩm, email, tên đăng nhập — nếu chắc chắn không trùng trong danh sách đó.

### Key tồi

```tsx
// ❌ index — vị trí, không phải danh tính (mục 4)
{ds.map((x, i) => <Dong key={i} />)}

// ❌ Math.random() hoặc crypto.randomUUID() TRONG LÚC RENDER
{ds.map((x) => <Dong key={Math.random()} />)}
```

Dòng thứ hai còn tệ hơn index. Mỗi lần render, **mọi** key đều mới. React kết luận: tất cả phần tử cũ đã biến mất, tất cả phần tử đều là mới. Nó **hủy toàn bộ** và **tạo lại toàn bộ** — mọi state mất sạch, mọi ô input mất nội dung và focus, sau **mỗi lần gõ một phím**. Vừa sai vừa chậm.

Phân biệt rõ:

- `crypto.randomUUID()` **lúc tạo dữ liệu**, lưu vào dữ liệu → ✓ ổn định
- `crypto.randomUUID()` **lúc render**, trong `map` → ❌ đổi mỗi lần render

Nhớ mục 7 file `01`: render phải thuần — cùng đầu vào, cùng đầu ra. `Math.random()` trong lúc render vi phạm đúng điều đó.

### Khi nào `index` chấp nhận được

Đủ **cả ba** điều kiện:

1. Danh sách **không bao giờ** thay đổi thứ tự (không sắp xếp, không thêm/xóa ở giữa hay ở đầu)
2. Danh sách **không bao giờ** bị lọc
3. Các phần tử **không có** state riêng, không có ô input

Ví dụ: danh sách menu cố định, các dòng chữ tĩnh trong một bài viết. Khi phân vân — đừng dùng index.

### Key chỉ cần duy nhất trong cùng danh sách

```tsx
<>
  <ul>{nhanVien.map((nv) => <li key={nv.id}>{nv.ten}</li>)}</ul>
  <ul>{phongBan.map((pb) => <li key={pb.id}>{pb.ten}</li>)}</ul>
</>
```

Một nhân viên có `id` 5 và một phòng ban có `id` 5 cùng tồn tại cũng không sao — chúng ở hai danh sách khác nhau. React chỉ so key giữa các **anh em** trực tiếp.

Nhưng nếu một danh sách trộn nhiều loại dữ liệu có thể trùng `id`, ghép thêm tiền tố: `key={`nv-${nv.id}`}`.

---

## 6. Đặt `key` ở đâu

`key` đặt trên phần tử **ngoài cùng** được trả về từ `map` — không phải bên trong component con.

```tsx
// ❌ Sai chỗ
function DongSanPham({ sp }: { sp: SanPham }) {
  return <li key={sp.id}>{sp.ten}</li>;   // key ở đây không có tác dụng
}

{ds.map((sp) => <DongSanPham sp={sp} />)}   // vẫn bị cảnh báo

// ✓ Đúng chỗ
function DongSanPham({ sp }: { sp: SanPham }) {
  return <li>{sp.ten}</li>;
}

{ds.map((sp) => <DongSanPham key={sp.id} sp={sp} />)}
```

Nguyên tắc: key nằm ở **nơi danh sách được tạo ra** — ngay trong lời gọi `map`. Đó là nơi React cần nhận diện anh em.

### Nhiều phần tử cho một mục — Fragment có key

```tsx
import { Fragment } from "react";

<dl>
  {dsThuatNgu.map((t) => (
    <Fragment key={t.id}>
      <dt>{t.ten}</dt>
      <dd>{t.dinhNghia}</dd>
    </Fragment>
  ))}
</dl>
```

Cú pháp rút gọn `<>...</>` **không nhận** được thuộc tính nào, kể cả `key`. Khi cần key, viết đầy đủ `<Fragment key={...}>`.

### Nhắc lại: `key` không phải prop

Mục 12 file `02`: bên trong `DongSanPham`, không có `props.key`. Cần dùng `id` thì truyền riêng:

```tsx
<DongSanPham key={sp.id} id={sp.id} sp={sp} />
```

Hoặc đơn giản hơn — truyền cả object `sp`, rồi dùng `sp.id` bên trong.

---

## 7. Dùng `key` để đặt lại state

`key` không chỉ dùng cho danh sách. Đặt `key` lên **bất kỳ** component nào, và đổi giá trị key, React sẽ coi đó là một component **hoàn toàn mới**: hủy cái cũ (cùng mọi state của nó), tạo cái mới từ đầu.

### Bài toán

```tsx
function TrangHoSo() {
  const [idDangXem, setIdDangXem] = useState(1);
  return (
    <>
      <ChonNguoiDung onChon={setIdDangXem} />
      <FormChinhSua userId={idDangXem} />
    </>
  );
}

function FormChinhSua({ userId }: { userId: number }) {
  const [ghiChu, setGhiChu] = useState("");
  // ...
}
```

Người dùng gõ ghi chú cho user số 1, rồi chuyển sang user số 2. Ghi chú vẫn còn nguyên — vì đó vẫn là **cùng một** `FormChinhSua` ở cùng vị trí, chỉ có prop `userId` đổi. Giống hệt bug ở mục 4.

### Giải pháp

```tsx
<FormChinhSua key={idDangXem} userId={idDangXem} />
```

Mỗi khi `idDangXem` đổi, key đổi → React hủy form cũ, tạo form mới → `ghiChu` trở về `""`.

Đây là kỹ thuật rất hay dùng, và là cách **đúng** để đặt lại state khi "đối tượng đang xem" thay đổi. Bạn sẽ thấy nhiều code dùng `useEffect` để tự tay đặt lại state trong trường hợp này — đó là cách vòng vèo hơn và dễ sai hơn (file `06` sẽ nói rõ).

Cơ chế đầy đủ — React quyết định giữ hay hủy state dựa trên **vị trí trong cây** và **key** — là nội dung file `11`.

---

## 8. Tách component cho từng mục

Khi mỗi mục trong danh sách có nhiều JSX hoặc logic riêng, tách ra một component:

```tsx
type TheViecProps = {
  viec: Viec;
  onBatTat: (id: string) => void;
  onXoa: (id: string) => void;
};

function TheViec({ viec, onBatTat, onXoa }: TheViecProps) {
  return (
    <li className={viec.daXong ? styles.xong : undefined}>
      <input
        type="checkbox"
        checked={viec.daXong}
        onChange={() => onBatTat(viec.id)}
      />
      <span>{viec.noiDung}</span>
      <button onClick={() => onXoa(viec.id)}>Xóa</button>
    </li>
  );
}

function DanhSachViec({ ds, onBatTat, onXoa }: DanhSachProps) {
  return (
    <ul>
      {ds.map((v) => (
        <TheViec key={v.id} viec={v} onBatTat={onBatTat} onXoa={onXoa} />
      ))}
    </ul>
  );
}
```

Để ý mẫu ở đây: state `ds` nằm ở cha. `TheViec` không tự sửa gì — nó gọi `onBatTat(viec.id)` để báo lên. Đúng mô hình "dữ liệu chảy xuống, sự kiện chảy lên" ở mục 7 file `02`. File `07` sẽ nói kỹ vì sao state nên nằm ở cha trong trường hợp này.

So với event delegation ở file `09` chặng 2: bạn không cần `data-id`, không cần `closest`, không cần `switch` theo `data-hanh-dong`. Mỗi nút gọi thẳng hàm với đúng `id` nhờ closure. React lo phần delegation bên dưới.

---

## 9. Danh sách lồng nhau và nhóm

Nhóm sản phẩm theo danh mục — nhớ mẫu `reduce` nhóm theo thuộc tính ở mục 8.4 file `04` chặng 2:

```tsx
function DanhSachTheoDanhMuc({ ds }: { ds: SanPham[] }) {
  const theoDanhMuc = ds.reduce<Record<string, SanPham[]>>((acc, sp) => {
    (acc[sp.danhMuc] ??= []).push(sp);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(theoDanhMuc).map(([danhMuc, dsCon]) => (
        <section key={danhMuc}>
          <h2>{danhMuc} ({dsCon.length})</h2>
          <ul>
            {dsCon.map((sp) => <li key={sp.id}>{sp.ten}</li>)}
          </ul>
        </section>
      ))}
    </>
  );
}
```

Ba điểm:

- `push` vào `acc` ở đây là **hợp lệ** — `acc` là object mới do chính lần `reduce` này tạo ra, chưa ai khác thấy nó (mục 7 file `01`: sửa dữ liệu cục bộ của chính mình trong lúc render là được). Điều bị cấm là sửa `ds` — dữ liệu nhận vào
- Mỗi tầng `map` cần `key` riêng: tầng ngoài dùng tên danh mục, tầng trong dùng `id` sản phẩm
- `reduce<Record<string, SanPham[]>>` truyền tường minh tham số kiểu (mục 7 file `07` chặng 3) — vì giá trị khởi tạo `{}` không đủ để TypeScript suy ra kiểu

---

## 10. Danh sách rất dài

Render 10.000 dòng thì mỗi lần render lại, React phải tạo và so sánh 10.000 element. Kể cả khi mọi thứ đúng, trang sẽ chậm.

Cách xử lý phổ biến là **ảo hóa** (virtualization): chỉ render những dòng **đang nằm trong vùng nhìn thấy**, khoảng vài chục dòng, rồi đổi nội dung khi người dùng cuộn. Có thư viện chuyên làm việc này (ví dụ TanStack Virtual).

Bạn chưa cần dùng ngay. Với vài trăm dòng, React xử lý tốt. Chỉ cần biết: khi danh sách lên tới hàng nghìn và trang giật, đó là từ khóa để tra cứu. Phân trang (Pokédex chặng 2) cũng là một cách giải quyết.

---

## 11. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Each child in a list should have a unique "key" prop` | Thiếu `key` | Thêm `key` từ `id` của dữ liệu |
| `Encountered two children with the same key` | Key bị trùng | Kiểm tra dữ liệu; ghép tiền tố nếu danh sách trộn nhiều loại |
| Vẫn cảnh báo dù đã thêm key | Key đặt bên trong component con | Đặt key ngay trên phần tử trong `map` |
| Ô input / checkbox nhảy sang dòng khác | `key={index}` khi thêm, xóa, sắp xếp, lọc | Dùng `id` ổn định |
| Ô input mất focus sau mỗi lần gõ | `key={Math.random()}` hoặc tạo id trong lúc render | Sinh id lúc tạo dữ liệu |
| Danh sách không hiện gì | `map` có `{}` mà không `return` | Bỏ `{}` hoặc thêm `return` |
| Số `0` hiện lạc lõng | `{ds.length && ...}` | `{ds.length > 0 && ...}` |
| `<>` báo lỗi khi thêm `key` | Cú pháp rút gọn không nhận thuộc tính | `<Fragment key={...}>` |
| Chuyển sang đối tượng khác mà form giữ dữ liệu cũ | Cùng component, cùng vị trí → state được giữ | `key={idDoiTuong}` |
| `props.key` là `undefined` | `key` không được truyền xuống | Truyền thêm prop riêng |
| Trang chậm khi danh sách rất dài | Render quá nhiều phần tử | Phân trang hoặc ảo hóa |

---

## 12. Tóm tắt cần thuộc

1. Render danh sách bằng `map` vì nó là **biểu thức**; `filter` trước, `map` sau
2. Danh sách hiển thị **tính trong lúc render** từ state, không lưu thành state riêng
3. `key` là **danh tính** của phần tử — giúp React biết phần tử nào là cũ, phần tử nào là mới
4. Không có key, React so theo **vị trí**
5. **State dính vào key**, không dính vào dữ liệu — key sai thì state đi sai chỗ
6. `key={index}` = so theo vị trí → bug khi thêm/xóa/sắp xếp/lọc danh sách có state
7. `key={Math.random()}` trong lúc render → hủy và tạo lại mọi thứ sau mỗi lần render
8. Key tốt: **duy nhất** giữa anh em và **ổn định** qua các lần render — thường là `id` từ dữ liệu
9. Dữ liệu tạo ở client: sinh `id` **lúc tạo**, bằng `crypto.randomUUID()`
10. Key đặt trên phần tử **ngoài cùng trong `map`**, không phải bên trong component con
11. `<Fragment key={...}>` khi một mục có nhiều phần tử; `<>` không nhận key
12. Đổi `key` của một component = hủy và tạo lại nó — cách đúng để **đặt lại state**

---

## Bài tập

Làm trong `bai-tap/src/bai-04/`.

### Bài 1 — Tái hiện bug `key={index}` (bài chính)

Dựng lại thí nghiệm ở mục 4, mở rộng:

1. Mỗi dòng có: nội dung việc, **checkbox không điều khiển** (chỉ `<input type="checkbox" />`, không có `checked` hay state), và ô ghi chú dùng `useState` riêng như mục 4
2. Bốn nút điều khiển danh sách ở cha: **Thêm lên đầu**, **Thêm vào cuối**, **Xóa dòng đầu**, **Đảo thứ tự**
3. Một nút gạt chuyển giữa `key={index}` và `key={v.id}`

Với **mỗi** trong bốn thao tác, làm theo cùng một quy trình ở cả hai chế độ key:

- Tick checkbox dòng thứ hai, gõ "abc" vào ghi chú dòng thứ hai
- Thực hiện thao tác
- Ghi lại: checkbox và ghi chú giờ nằm ở dòng nào?

Lập bảng trong `ghi-chu.md`:

| Thao tác | `key={index}` | `key={v.id}` |
|---|---|---|
| Thêm lên đầu | ... | ... |
| Thêm vào cuối | ... | ... |
| Xóa dòng đầu | ... | ... |
| Đảo thứ tự | ... | ... |

Có một thao tác cho kết quả **giống nhau** ở cả hai chế độ. Thao tác nào, và vì sao? Đây là lý do nhiều người dùng `key={index}` mà không thấy bug — họ chỉ thêm vào cuối.

### Bài 2 — Phát hiện lúc component được tạo mới

Bạn chưa học `useEffect`, nhưng có một mẹo từ file `03`: khởi tạo lười **chỉ chạy khi component được tạo mới**.

```tsx
function DongViec({ noiDung }: { noiDung: string }) {
  const [ghiChu, setGhiChu] = useState(() => {
    console.log("TẠO MỚI:", noiDung);
    return "";
  });
  // ...
}
```

Gắn vào bài 1, rồi:

1. Tải trang — in ra mấy dòng? (Nhớ `StrictMode`)
2. Với `key={v.id}`, bấm "Thêm lên đầu" — in thêm mấy dòng? Dòng nào?
3. Với `key={index}`, bấm "Thêm lên đầu" — in thêm mấy dòng? Dòng nào? Vì sao không phải dòng "Việc mới"?
4. Đổi sang `key={Math.random()}`, gõ một ký tự vào ô ghi chú bất kỳ — in thêm mấy dòng? Ô bạn vừa gõ còn giữ chữ và focus không?

Câu 3 là câu đáng suy nghĩ nhất. Câu 4 cho bạn thấy tận mắt vì sao `Math.random()` còn tệ hơn index.

### Bài 3 — Danh sách thêm/xóa/sắp xếp

Xây danh sách sản phẩm với dữ liệu khởi tạo 6–8 sản phẩm (`id`, `ten`, `gia`, `danhMuc`, `soLuong`):

1. Mỗi dòng là một component `DongSanPham` riêng, có `type DongSanPhamProps`
2. Mỗi dòng có nút **▲** và **▼** để đổi chỗ với dòng trên/dưới. Nút ▲ bị vô hiệu ở dòng đầu, ▼ ở dòng cuối. Đổi chỗ phải bất biến — không `splice`, không gán `ds[i] = ...`
3. Mỗi dòng có nút **Nhân bản** — chèn một bản sao **ngay bên dưới**, với `id` mới sinh bằng `crypto.randomUUID()`
4. Nút sắp xếp theo tên / theo giá / theo danh mục — state lưu **tiêu chí sắp xếp**, danh sách hiển thị tính trong lúc render bằng `toSorted`
5. Bộ lọc theo danh mục — cũng tính trong lúc render
6. Hiện kết quả **nhóm theo danh mục** (mục 9), mỗi nhóm có tổng tiền của nhóm
7. Danh sách rỗng sau khi lọc → hiện thông báo phù hợp
8. Mỗi dòng có một ô "số lượng mua" với state riêng (dùng `useState` trong `DongSanPham`). Kiểm tra: sắp xếp lại, đổi chỗ, lọc — số lượng mua có đi đúng theo sản phẩm không?

Câu 4 và câu 2 có liên quan: nếu danh sách được sắp xếp tự động theo giá, nút ▲▼ còn ý nghĩa không? Ghi suy nghĩ của bạn về cách giải quyết mâu thuẫn này vào `ghi-chu.md` — không có đáp án duy nhất.

### Bài 4 — Đặt lại state bằng key

```tsx
const nguoiDung = [
  { id: 1, ten: "An" },
  { id: 2, ten: "Bình" },
  { id: 3, ten: "Cường" },
];
```

1. Danh sách ba người bên trái, bấm để chọn
2. Bên phải là `KhungTroChuyen` nhận `nguoiNhan`, có ô soạn tin với state `noiDung` riêng
3. Gõ một tin dang dở cho An, chuyển sang Bình — tin dang dở còn không?
4. Sửa bằng `key` theo mục 7
5. Nâng cao: giờ yêu cầu **ngược lại** — mỗi người phải nhớ tin nhắn dang dở **riêng** của mình, chuyển qua lại không mất. `key` còn đủ không? Bạn sẽ lưu tin nháp ở đâu? (Gợi ý: state ở cha, dạng `Record<number, string>`. File `07` sẽ nói kỹ về việc đưa state lên cha.)

### Bài 5 — Pokédex

Cập nhật Pokédex từ bài 5 file `03`:

1. Kiểm tra mọi `map` — tất cả dùng `id` làm key chưa? Có chỗ nào đang dùng `index` không?
2. Nhóm Pokémon theo **loại chính** (loại đầu tiên trong mảng `types`) khi người dùng bật chế độ "Xem theo nhóm"
3. Danh sách chỉ số (HP, Attack...) trong modal chi tiết — key nên là gì? Index có chấp nhận được ở đây không? Đối chiếu ba điều kiện ở mục 5 và ghi lập luận
4. Mở modal chi tiết của Pokémon A, rồi chuyển sang Pokémon B mà không đóng modal (thêm nút "Tiếp theo"). Nếu modal có state riêng (ví dụ tab "Chỉ số / Chiêu thức" đang chọn), nó có bị giữ lại khi chuyển không? Bạn muốn giữ hay đặt lại? Làm theo ý bạn và giải thích

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. `key` dùng để làm gì? Giải thích như đang nói với người chưa biết React.
2. Vì sao `key={index}` gây bug? Bug chỉ xuất hiện trong điều kiện nào?
3. Vì sao `key={Math.random()}` còn tệ hơn index?
4. "State dính vào key, không dính vào dữ liệu" nghĩa là gì?
5. Làm sao đặt lại toàn bộ state của một component khi một prop thay đổi?
6. Khi nào dùng index làm key là chấp nhận được?

---

## Xong file này khi

- [ ] Bài 1 có bảng đủ 4 thao tác × 2 chế độ, giải thích được vì sao "thêm vào cuối" không lộ bug
- [ ] Bài 2 đã thấy tận mắt `Math.random()` làm mất chữ và focus sau mỗi lần gõ
- [ ] Danh sách ở bài 3 đổi chỗ, nhân bản, sắp xếp, lọc, nhóm được; số lượng mua đi đúng theo sản phẩm
- [ ] Bài 4 sửa được bằng `key`, và có ý tưởng cho phần nâng cao
- [ ] Pokédex không còn `key={index}` nào ở chỗ không phù hợp
- [ ] Trả lời được 6 câu ở bài 6 bằng lời

File tiếp theo (`05-form-controlled`) là chỗ bạn rốt cuộc được dùng ô `<input>` thật — thứ mà Pokédex và todo app phải tạm thay bằng nút gợi ý suốt hai file vừa qua.

Xong thì gửi mình `ghi-chu.md` và link thư mục `bai-04`, kèm **"viết file 05-form-controlled"**.