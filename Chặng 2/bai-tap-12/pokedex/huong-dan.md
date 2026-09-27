# Hướng dẫn làm Bài 4 — Pokédex

Chỉ cần viết **một file**: `bai-tap-12/pokedex/main.js`.

- `index.html`, `style.css` — đã có sẵn
- `../api.js` — dùng lại từ bài 2

---

## 0. Chuẩn bị

- `main.js` được nạp bằng `<script type="module">` vì `api.js` dùng `export`:
  ```js
  import { api } from "../api.js";
  ```
- Module **không chạy** khi mở file bằng double-click (`file://`) → mở bằng **Live Server**.
- Sửa dòng 1 của `api.js`:
  ```js
  const baseURL = "https://pokeapi.co/api/v2";
  ```

---

## 1. Các ID / template trong HTML

| Phần | ID / class |
|---|---|
| Ô tìm, lọc loại | `#o-tim`, `#loc-loai` (JS thêm `<option>` lấy từ `/type`) |
| Danh sách (gắn **1** listener ở đây) | `#ds-pokemon` |
| Trạng thái lỗi | `#khung-loi`, `#loi-noi-dung`, nút `#thu-lai` |
| Trạng thái rỗng | `#khung-rong`, `#rong-noi-dung` |
| Tải thêm, bộ đếm | `#tai-them`, `#dem` |
| Modal | `#modal`, `#dong-modal`, `#ct-dang-tai` (spinner), `#ct-loi`, `#ct-noi-dung` |
| Chi tiết | `#ct-anh`, `#ct-so`, `#ct-ten`, `#ct-loai`, `#ct-chieu-cao`, `#ct-can-nang`, `#ct-chi-so`, `#ct-chieu` |
| Nâng cao | Tab `.tab[data-tab]` (yêu cầu 17), `#moc-cuoi` (yêu cầu 15) — xóa nếu không làm |

**Template** (để không phải dùng `innerHTML` — yêu cầu 10):

| Template | Dùng cho | Ghi chú |
|---|---|---|
| `#tpl-the` | Thẻ Pokémon | Gán `data-id` cho `<li>` để delegation biết thẻ nào |
| `#tpl-skeleton` | Thẻ giả khi đang tải | Clone ~20 cái |
| `#tpl-loai` | Nhãn loại | Thêm class `loai-<tên>` (vd `loai-fire`) → CSS tự tô màu |
| `#tpl-chi-so` | Một dòng chỉ số | `.thanh-gia-tri.style.width = (giaTri / 255 * 100) + "%"` |

Cách dùng template:
```js
const tpl = document.querySelector("#tpl-the");
const li = tpl.content.firstElementChild.cloneNode(true);
li.querySelector(".ten").textContent = pokemon.name;   // textContent, KHÔNG innerHTML
```

Ẩn/hiện mọi thứ bằng thuộc tính `hidden`:
```js
khungLoi.hidden = false;   // hiện
modal.hidden = true;       // đóng
```

---

## 2. PokéAPI trả về gì

| Cần | Gọi | Nhận về |
|---|---|---|
| Danh sách | `/pokemon?limit=20&offset=0` | `{ count, results: [{ name, url }] }` |
| Chi tiết 1 con | `/pokemon/{tên hoặc số}` | `id`, `name`, `sprites.front_default`, `types[].type.name`, `height`, `weight`, `stats[]`, `moves[]` |
| Danh sách loại | `/type` | `{ results: [{ name, url }] }` |
| Pokémon theo loại | `/type/{tên}` | `{ pokemon: [{ pokemon: { name, url } }] }` |

Lưu ý quan trọng:

- **Danh sách không có ảnh và loại**, chỉ có tên → phải gọi chi tiết cho cả 20 con, **song song** bằng `Promise.all`.
- **API không có tìm kiếm gần đúng.** `/pokemon/pika` → **404**. Cách đơn giản: tìm theo tên chính xác, viết thường (`.trim().toLowerCase()`). 404 → "Không tìm thấy" (vừa khớp luôn yêu cầu 7).
- **Đơn vị:** `height` là dm → chia 10 ra **m**; `weight` là hg → chia 10 ra **kg**.
- Chỉ số nằm ở `stats[i].base_stat` và `stats[i].stat.name`.
- Chiêu thức: `moves.slice(0, 5).map(m => m.move.name)`.

---

## 3. Cấu trúc file: trạng thái → render (yêu cầu 11)

Chia `main.js` làm 5 phần theo thứ tự:

```js
import { api } from "../api.js";

// ① TRẠNG THÁI — một object duy nhất, mọi thứ trên màn hình đều suy ra từ đây
let state = {
    // --- Danh sách ---
    dsPokemon: [],       // chi tiết các con đang hiện trên lưới
    tongSo: 0,           // tổng số có thể tải → "Đã tải 20/1302"
    offset: 0,           // vị trí bắt đầu của lần tải kế tiếp
    dangTai: false,      // đang chờ API cho danh sách
    loi: null,           // null | { loai: "mang" | "timeout" | "khac", thongDiep }

    // --- Bộ lọc ---
    dsLoai: [],          // tên các loại cho dropdown (tải 1 lần)
    tuKhoa: "",          // "" = không tìm kiếm
    loaiDangChon: "",    // "" = tất cả loại
    dsTenTheoLoai: [],   // toàn bộ tên thuộc loại đang chọn (để "Tải thêm" trong chế độ lọc)

    // --- Modal chi tiết ---
    modal: {
        dangMo: false,
        dangTai: false,
        duLieu: null,    // chi tiết Pokémon đang mở
        loi: null,       // chuỗi thông báo lỗi
    },

    // --- Nâng cao 17 (bỏ nếu không làm) ---
    dsYeuThich: [],      // mảng id
    tabDangChon: "tat-ca",
};

// ② LOGIC — gọi API, xử lý dữ liệu. KHÔNG có chữ `document.` ở đây
//    - layChiTiet(ten, signal)   → có cache Map + closure (yêu cầu 13)
//    - taiTrang(offset)          → gọi /pokemon rồi Promise.all 20 chi tiết
//    - timTheoTen(ten, signal)
//    - locTheoLoai(loai)
//    - phanLoaiLoi(err)          → trả về { loai, thongDiep }

// ③ RENDER — đọc state, vẽ lại DOM. Chỉ phần này đụng tới document
//    - render() gọi renderDanhSach(), renderTrangThai(), renderModal(), renderDem()

// ④ CẬP NHẬT — đổi state rồi gọi render()
function capNhat(thayDoi) {
    state = { ...state, ...thayDoi };   // tạo object mới, không sửa object cũ
    render();
}

// ⑤ SỰ KIỆN + KHỞI ĐỘNG
```

**Nguyên tắc:** sự kiện → gọi logic → `capNhat(...)` → `render()`.
Hàm xử lý sự kiện **không** tự sửa DOM.

> `capNhat` chỉ trộn nông (shallow merge). Khi đổi `modal`, phải trải cả object con:
> ```js
> capNhat({ modal: { ...state.modal, dangTai: false, duLieu } });
> ```

### Giải thích từng trường

| Trường | Trả lời câu hỏi |
|---|---|
| `dsPokemon` | Đang có những con nào để vẽ thẻ? |
| `tongSo` | Tổng cộng có bao nhiêu con có thể tải? |
| `offset` | Lần "Tải thêm" tới bắt đầu từ đâu? |
| `dangTai` | Có đang chờ API danh sách không? |
| `loi` | Lần tải gần nhất có lỗi không, loại gì? |
| `dsLoai` | Dropdown có những loại nào? |
| `tuKhoa` | Người dùng đang tìm chữ gì? |
| `loaiDangChon` | Đang lọc theo loại nào? |
| `dsTenTheoLoai` | Loại đang lọc có những con nào (chưa tải chi tiết)? |
| `modal` | Modal mở/đóng, đang tải, có dữ liệu hay lỗi? |

#### `dsPokemon: []`
- **Chứa:** dữ liệu **chi tiết** (từ `/pokemon/{tên}`) của các con trên lưới — không phải kết quả `/pokemon?limit=20` (cái đó không có ảnh và loại).
- **Đổi khi:**
  - tải lần đầu → gán mới: `dsPokemon: ketQua`
  - tải thêm → nối: `dsPokemon: [...state.dsPokemon, ...ketQua]` (không `push` — `push` sửa mảng cũ)
  - tìm kiếm → `[pokemon]` hoặc `[]`
  - lọc loại → 20 con đầu của loại đó
- **Render:** mỗi phần tử → clone `#tpl-the`, gán `data-id`, số, ảnh, tên, nhãn loại.
- **Mẹo:** dữ liệu chi tiết rất nặng (`moves` có hàng trăm phần tử). Có thể rút gọn trước khi đưa vào state: `{ id, ten, anh, loai: ["grass", "poison"] }`.

#### `tongSo: 0`
- **Chứa:** tổng số con **có thể** tải trong chế độ đang xem — vế sau của "Đã tải 20/**1302**".
- **Đổi khi:** danh sách thường → `count` từ API; lọc loại → `dsTenTheoLoai.length`; tìm kiếm → 1 hoặc 0.
- **Render:**
  - `` `Đã tải ${dsPokemon.length}/${tongSo}` ``
  - Ẩn/vô hiệu nút Tải thêm khi `dsPokemon.length >= tongSo`.

#### `offset: 0`
- **Chứa:** vị trí bắt đầu lần tải **kế tiếp** (tham số `offset` trong URL, hoặc chỉ số `slice` trong `dsTenTheoLoai`).
- **Đổi khi:** tải thêm thành công → `+ 20`; đổi chế độ (tìm, lọc, xóa ô tìm) → **về 0**.
- **Render:** không dùng — chỉ logic cần.
- Ở chế độ thường `offset === dsPokemon.length`, nên có thể bỏ và tính từ độ dài mảng. Giữ lại cho dễ đọc cũng được.

#### `dangTai: false`
- **Chứa:** `true` khi đang chờ API cho **danh sách** (modal có `modal.dangTai` riêng).
- **Đổi khi:**
  ```js
  capNhat({ dangTai: true, loi: null });          // trước khi gọi
  capNhat({ dangTai: false, dsPokemon: ... });    // thành công
  capNhat({ dangTai: false, loi: ... });          // thất bại
  ```
  Nhớ tắt ở **cả hai nhánh**, không thì skeleton quay mãi.
- **Render:**
  - `dangTai && dsPokemon.length === 0` → **tải lần đầu** → thay cả lưới bằng ~20 skeleton
  - `dangTai && dsPokemon.length > 0` → **đang tải thêm** → giữ thẻ cũ, nút Tải thêm `disabled`
- **Logic:** đầu hàm tải thêm, nếu `state.dangTai` thì `return` (chặn bấm hai lần).

#### `loi: null`
- **Chứa:** `null`, hoặc object do `phanLoaiLoi(err)` trả về:
  ```js
  { loai: "mang",    thongDiep: "Không có kết nối mạng. Kiểm tra Wi-Fi rồi thử lại." }
  { loai: "timeout", thongDiep: "Máy chủ phản hồi quá chậm. Thử lại sau nhé." }
  { loai: "khac",    thongDiep: "Có lỗi xảy ra. Thử lại." }
  ```
- **Đổi khi:** trong `catch` của các hàm tải danh sách; về `null` khi bắt đầu tải mới.
- **Render:** `khungLoi.hidden = !state.loi` và `loiNoiDung.textContent = state.loi.thongDiep`.
- **404 khi tìm kiếm KHÔNG phải `loi`.** Tìm `"abcxyz"` → 404 là **kết quả rỗng**: gán `dsPokemon: []` → hiện `#khung-rong`. `#khung-loi` chỉ dành cho lỗi thật (mạng, timeout...). Như vậy mỗi loại có thông báo khác nhau (yêu cầu 7).
- **Nút "Thử lại":** gọi lại hàm theo chế độ hiện tại — có `tuKhoa` → tìm lại; có `loaiDangChon` → lọc lại; không thì `taiTrang(state.offset)`.

> **Không cần trường `rong`** — nó suy ra được: `!dangTai && !loi && dsPokemon.length === 0`.
> Nguyên tắc: cái gì **tính được** từ state thì **không lưu** vào state, tránh hai trường nói ngược nhau.

#### `dsLoai: []`
- **Chứa:** tên các loại từ `/type`, **đã lọc bỏ** `unknown`, `shadow`, `stellar` → 18 loại.
- **Đổi khi:** **một lần** lúc khởi động, trong `Promise.all` cùng trang đầu (yêu cầu 12).
- **Render:** mỗi phần tử → `document.createElement("option")`, gán `value` + `textContent`.
- Danh sách không bao giờ đổi → đổ vào dropdown **một lần**, đừng vẽ lại mỗi `render()` (vẽ lại sẽ làm mất lựa chọn đang chọn).

#### `tuKhoa: ""`
- **Chứa:** chữ đang tìm, **đã** `trim().toLowerCase()`.
- **Đổi khi:** hàm tìm đã debounce **thực sự chạy** — không phải mỗi phím gõ.
- **Render:**
  - Thông báo rỗng: `Không tìm thấy Pokémon nào khớp "${tuKhoa}"`
  - `tuKhoa !== ""` → chế độ tìm kiếm → ẩn nút Tải thêm (tối đa 1 kết quả)

#### `loaiDangChon: ""`
- **Chứa:** tên loại đang lọc; `""` = "Tất cả loại".
- **Đổi khi:** `change` trên `#loc-loai`.
- **Render:** `locLoai.value = state.loaiDangChon` để dropdown luôn khớp state.
- **Tìm + lọc cùng lúc?** Cách đơn giản: chọn loại → xóa ô tìm; gõ tìm → đặt loại về "Tất cả". Lúc nào cũng chỉ có **một** chế độ.

#### `dsTenTheoLoai: []`
- **Chứa:** **toàn bộ** tên thuộc loại đang chọn. `/type/fire` trả về hết ~100 tên một lúc, không phân trang.
- **Đổi khi:** chọn loại → gán danh sách tên; về "Tất cả" → `[]`.
- **Logic:** mỗi lần tải (đầu hoặc thêm) lấy `dsTenTheoLoai.slice(offset, offset + 20)` rồi `Promise.all` gọi chi tiết.
- **Render:** không dùng trực tiếp; `tongSo = dsTenTheoLoai.length`.

#### `modal: { dangMo, dangTai, duLieu, loi }`
Gom mọi thứ của modal vào một object, vì HTML có cả spinner (`#ct-dang-tai`) lẫn khung lỗi (`#ct-loi`).

| Tình huống | `dangMo` | `dangTai` | `duLieu` | `loi` | Hiện gì |
|---|---|---|---|---|---|
| Đóng | false | – | – | – | Ẩn `#modal` |
| Đang tải | true | true | null | null | Spinner `#ct-dang-tai` |
| Xong | true | false | {...} | null | `#ct-noi-dung` |
| Lỗi | true | false | null | "..." | `#ct-loi` |

- **Đổi khi:**
  ```js
  // bấm thẻ
  capNhat({ modal: { dangMo: true, dangTai: true, duLieu: null, loi: null } });
  // thành công (layChiTiet có cache → con đã có trên lưới thì gần như tức thì)
  capNhat({ modal: { ...state.modal, dangTai: false, duLieu } });
  // lỗi
  capNhat({ modal: { ...state.modal, dangTai: false, loi: "Không tải được chi tiết." } });
  // đóng (X / Escape / bấm nền)
  capNhat({ modal: { ...state.modal, dangMo: false } });
  ```
- **Render (`renderModal`):**
  ```js
  const m = state.modal;
  modalEl.hidden = !m.dangMo;
  if (!m.dangMo) return;
  ctDangTai.hidden = !m.dangTai;
  ctLoi.hidden = !m.loi;
  ctNoiDung.hidden = !m.duLieu;
  if (m.loi) ctLoi.textContent = m.loi;
  if (m.duLieu) { /* ảnh, tên, số, loại, chiều cao /10 m, cân nặng /10 kg,
                     stats → clone #tpl-chi-so, moves.slice(0, 5) → <li> */ }
  ```
- **Race nhỏ:** bấm con A rồi đóng, bấm ngay con B — nếu A về sau B thì modal hiện nhầm A. Chống bằng cách kiểm tra id trả về có khớp con đang mở không (giống "cách 2" ở bài 3).

#### `dsYeuThich: []`, `tabDangChon: "tat-ca"` (nâng cao 17)
- `dsYeuThich`: mảng id. Bấm ☆ → thêm/bớt bằng `[...ds, id]` / `ds.filter(x => x !== id)`.
- `tabDangChon`: `"tat-ca"` | `"yeu-thich"`.
- **Render:** tab Yêu thích → chỉ vẽ `dsPokemon.filter(p => dsYeuThich.includes(p.id))`; nút ☆ của con đã thích → `★` + class `da-thich`; tab đang chọn có class `dang-chon`.

### Ví dụ: state thay đổi theo thời gian

```
Mở trang
→ { dangTai: true,  dsPokemon: [],        tongSo: 0,    offset: 0 }      skeleton
→ { dangTai: false, dsPokemon: [20 con],  tongSo: 1302, offset: 20,
    dsLoai: [18 loại] }                                                    lưới 20 thẻ, "Đã tải 20/1302"

Bấm Tải thêm
→ { dangTai: true,  dsPokemon: [20 con] }                                  20 thẻ + nút disabled
→ { dangTai: false, dsPokemon: [40 con],  offset: 40 }                     "Đã tải 40/1302"

Bấm thẻ #25
→ { modal: { dangMo: true, dangTai: true } }                               spinner trong modal
→ { modal: { dangMo: true, dangTai: false, duLieu: {pikachu} } }           chi tiết Pikachu

Nhấn Escape
→ { modal: { dangMo: false, ... } }                                        modal đóng

Chọn loại "fire"
→ { loaiDangChon: "fire", dsTenTheoLoai: [~100 tên], offset: 0,
    dangTai: true, dsPokemon: [] }                                         skeleton
→ { dangTai: false, dsPokemon: [20 con fire], tongSo: ~100, offset: 20 }  "Đã tải 20/~100"

Gõ "abcxyz" (sau 400ms)
→ { tuKhoa: "abcxyz", loaiDangChon: "", dangTai: true, dsPokemon: [] }    skeleton
→ { tuKhoa: "abcxyz", dangTai: false, dsPokemon: [], tongSo: 0 }          "Không tìm thấy..."

Tắt mạng, bấm Tải thêm
→ { dangTai: false, loi: { loai: "mang", thongDiep: "Không có kết nối..." } }   khung lỗi + Thử lại
```

Nhìn **bất kỳ dòng nào** ở trên, bạn phải nói được màn hình đang trông thế nào — đó là ý nghĩa của trạng thái → render.

### Cache bằng Map + closure (yêu cầu 13)

```js
function taoLayChiTiet() {
    const cache = new Map();
    return async function (ten, signal) {
        if (cache.has(ten)) return cache.get(ten);
        const duLieu = await api.get(`/pokemon/${ten}`, { signal });
        cache.set(ten, duLieu);
        return duLieu;
    };
}
const layChiTiet = taoLayChiTiet();
```

Danh sách **và** modal cùng dùng `layChiTiet` → mở modal một con đã có trên lưới sẽ **không gọi API nữa**.

> Lưu ý: key cache nên thống nhất (luôn dùng tên viết thường, hoặc luôn dùng id). Nếu lúc thì `"25"`, lúc thì `"pikachu"` thì cache sẽ bị "trượt".

---

## 4. Thứ tự làm (mỗi bước chạy thử được luôn)

| Bước | Làm gì | Yêu cầu |
|---|---|---|
| 1 | Sửa `baseURL` trong `api.js`. Thử `api.get("/pokemon/1")` → `console.log` | 8 |
| 2 | Viết `layChiTiet` có cache (`Map` + closure) | 13 |
| 3 | Viết `taiTrang(0)` → cho vào state → render thẻ bằng `#tpl-the` + `#tpl-loai` | 1, 10 |
| 4 | Khởi động: `Promise.all([taiTrang(0), api.get("/type")])` → đổ `<option>` vào `#loc-loai` | 12 |
| 5 | Ba trạng thái: đang tải → clone ~20 `#tpl-skeleton`; lỗi → `#khung-loi` + nút "Thử lại"; rỗng → `#khung-rong` | 6 |
| 6 | Nút **Tải thêm**: `offset += 20`, **nối thêm** vào danh sách, cập nhật `#dem` | 2 |
| 7 | Modal: **một** listener trên `#ds-pokemon` → `e.target.closest(".the")` → `dataset.id` → mở modal (chỉ số dạng thanh + 5 chiêu đầu) | 5, 9 |
| 8 | Đóng modal 3 cách: nút `#dong-modal`, phím `Escape` (`keydown` trên `document`), bấm ra nền tối (`e.target === modal`) | 14 |
| 9 | Tìm kiếm: debounce 400ms + AbortController — **dùng lại y hệt bài 3**. Ô trống → quay lại danh sách thường | 3 |
| 10 | Lọc loại: `change` trên `#loc-loai` → gọi `/type/{loại}` → lấy 20 con đầu → gọi chi tiết | 4 |
| 11 | Phân loại lỗi: mất mạng / 404 / timeout — mỗi loại một thông báo khác nhau | 7 |
| 12 | Chọn ít nhất 2 yêu cầu nâng cao. Gợi ý: **17 (Yêu thích)** vì có sẵn tab, và **15 (cuộn vô hạn)** vì có sẵn `#moc-cuoi` — chỉ cần gọi lại logic "Tải thêm" | 15–18 |

---

## 5. Chỗ dễ sai

### Event delegation (yêu cầu 9)
```js
dsPokemon.addEventListener("click", (e) => {
    if (e.target.closest(".nut-yeu-thich")) { /* xử lý yêu thích */ return; }
    const the = e.target.closest(".the");
    if (!the || the.classList.contains("skeleton")) return;
    moChiTiet(the.dataset.id);
});
```
Chỉ **một** listener, dù có bao nhiêu thẻ.

### Tìm kiếm — debounce bọc cả hành động (bài học từ bài 3)
Debounce phải bọc quanh hàm **làm trọn** việc (hủy request cũ → tìm → cập nhật state), không bọc quanh hàm mà bạn còn cần lấy giá trị trả về — vì hàm debounce luôn trả `undefined`.

Nhớ `try/catch` bỏ qua `AbortError` — bị hủy do có request mới là chuyện bình thường, không phải lỗi.

### Phân loại lỗi (yêu cầu 7) — cần sửa `api.js`
Hiện tại trong `GoiMotLan`:
- timeout ném `new Error("...")` (dòng 65)
- mất mạng ném `Error` thường

→ `main.js` không phân biệt được. Nên sửa `api.js` để mỗi loại có `name` riêng, ví dụ:
```js
if (e.name === "TimeoutError") {
    const loi = new Error("Máy chủ phản hồi quá chậm");
    loi.name = "LoiTimeout";
    throw loi;
}
const loi = new Error("Không kết nối được máy chủ");
loi.name = "LoiMang";
throw loi;
```
404 thì phân biệt được sẵn: `e.name === "LoiHTTP" && e.status === 404`.

Gợi ý thông báo:

| Loại | Thông báo |
|---|---|
| Mất mạng | "Không có kết nối mạng. Kiểm tra Wi-Fi rồi thử lại." |
| 404 | "Không tìm thấy Pokémon tên "…"." |
| Timeout | "Máy chủ phản hồi quá chậm. Thử lại sau nhé." |
| Khác | "Có lỗi xảy ra. Thử lại." |

### Danh sách loại có loại thừa
`/type` trả cả `unknown`, `shadow`, `stellar` — gần như không có Pokémon nào → lọc bỏ.

### Tên có `<script>`
Gán bằng `textContent` là tự an toàn, không cần làm gì thêm.

---

## 6. Tự kiểm tra (ghi kết quả vào `du-doan.md`)

| Thử nghiệm | Kết quả mong đợi |
|---|---|
| DevTools → Network → Offline, rồi tải trang | Thông báo lỗi mạng rõ ràng + nút thử lại |
| Network → Slow 3G, gõ nhanh vào ô tìm | Kết quả luôn khớp từ khóa cuối cùng |
| Tìm `"abcxyz"` | Thông báo không tìm thấy, không phải màn hình trắng |
| Gõ 10 ký tự liên tục | Tối đa 2 request (nhờ debounce) |
| Mở cùng một Pokémon hai lần | Lần hai không có request mới trong tab Network |
| Đếm listener trên danh sách | Đúng 1, không tăng theo số thẻ |
| Tìm Pokémon tên `<script>` | Hiện đúng chuỗi, không có gì lạ xảy ra |
