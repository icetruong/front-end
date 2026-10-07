# 00 — Bắt đầu Chặng 4: React nền tảng

> **Cần có trước:** xong chặng 3 — có dự án `pokedex-ts` chạy được, dùng thành thạo Vite, Git, TypeScript cơ bản.
> **Thời gian:** 2–3 giờ (đọc + làm bài tập).
> **File này chưa dạy React.** Nó giải thích React giải quyết vấn đề gì, dựng môi trường, và cho bạn thấy mình đang mang theo những gì từ ba chặng trước. Đọc hết rồi làm bài tập, xong mới sang `01`.

---

## 1. Bạn đang ở đâu

Ba chặng đã qua:

- **Chặng 1** — HTML, CSS: dựng giao diện tĩnh
- **Chặng 2** — JavaScript: làm giao diện sống, gọi API, xử lý bất đồng bộ
- **Chặng 3** — Git, Vite, ESLint, TypeScript: làm việc như trong một nhóm thật

Bạn đã viết được ứng dụng hoàn chỉnh bằng JavaScript thuần: todo app, Pokédex, quiz app. Vậy tại sao còn cần React?

Câu trả lời nằm trong chính code bạn đã viết. Mục 2 sẽ chỉ ra.

---

## 2. Vấn đề React giải quyết

### Nhớ lại todo app của bạn

Ở file `08` và `09` chặng 2, mình đã yêu cầu bạn tách code thành hai phần:

```javascript
// Phần 1: trạng thái
const trangThai = {
  viec: [],
  boLoc: "tat-ca",
};

// Phần 2: vẽ giao diện từ trạng thái
function render() {
  danhSach.replaceChildren();
  for (const v of locViec(trangThai.viec, trangThai.boLoc)) {
    const li = document.createElement("li");
    li.textContent = v.noiDung;
    if (v.daXong) li.classList.add("xong");
    danhSach.append(li);
  }
  boDem.textContent = `${demChuaXong(trangThai.viec)} việc chưa xong`;
  // ... cập nhật nút lọc, thông báo rỗng, v.v.
}

// Mọi thay đổi đi theo một chiều
function themViec(noiDung) {
  trangThai.viec = [...trangThai.viec, taoViec(noiDung)];
  render();
}
```

Mô hình **sự kiện → sửa trạng thái → `render()`** này tốt hơn rất nhiều so với sửa DOM rải rác. Nhưng bạn đã gặp những vấn đề của nó:

**1. `render()` vẽ lại toàn bộ.** Thêm một việc, cả danh sách bị xóa rồi dựng lại. Với 10 việc thì không sao. Với 1000 việc thì chậm. Và nếu đang có một ô input đang sửa dở bên trong danh sách, nó bị phá hủy cùng mọi thứ khác — mất luôn nội dung người dùng đang gõ.

**2. Muốn tối ưu thì phải tự tính toán.** Để chỉ cập nhật đúng phần thay đổi, bạn phải tự so sánh trạng thái cũ với mới, tự tìm phần tử DOM tương ứng, tự sửa đúng chỗ. Đó là lượng code rất lớn và rất dễ sai.

**3. Không chia nhỏ được.** Toàn bộ giao diện nằm trong một hàm `render()` khổng lồ. Muốn dùng lại "một thẻ Pokémon" ở trang khác thì phải copy code.

**4. Phải nhớ gọi `render()`.** Quên gọi sau một lần sửa trạng thái là giao diện lệch với dữ liệu — bug im lặng.

### React làm gì

React lấy đúng mô hình bạn đã viết, rồi giải quyết cả bốn vấn đề:

1. Bạn **mô tả** giao diện trông như thế nào với trạng thái hiện tại. React tự tìm ra phần nào thay đổi và **chỉ cập nhật đúng phần đó** trên DOM
2. Bạn không phải tự so sánh cũ với mới — React làm việc đó (gọi là **reconciliation**, file `11`)
3. Giao diện được chia thành **component** — những mảnh nhỏ, độc lập, dùng lại được
4. Bạn **không gọi `render()`**. Thay đổi trạng thái qua cách React cung cấp, React tự vẽ lại

---

## 3. Mệnh lệnh và khai báo

Đây là thay đổi tư duy quan trọng nhất của chặng này.

### Cách mệnh lệnh (imperative) — điều bạn đã làm ở chặng 2

Bạn nói cho trình duyệt **từng bước phải làm**:

```javascript
const nut = document.createElement("button");
nut.textContent = "Đã thích";
nut.classList.add("da-thich");
nut.disabled = false;
khung.append(nut);

// Sau đó, khi người dùng bỏ thích:
nut.textContent = "Thích";
nut.classList.remove("da-thich");
```

Bạn phải nhớ trạng thái hiện tại của DOM là gì, rồi viết **chuyển đổi** từ trạng thái này sang trạng thái kia.

### Cách khai báo (declarative) — cách của React

Bạn mô tả **kết quả cuối cùng** ứng với từng trạng thái:

```tsx
function NutThich({ daThich }: { daThich: boolean }) {
  return (
    <button className={daThich ? "da-thich" : ""}>
      {daThich ? "Đã thích" : "Thích"}
    </button>
  );
}
```

Bạn chưa cần hiểu cú pháp — đó là file `01`. Chỉ cần thấy điều này: không có `createElement`, không có `classList.add`, không có `classList.remove`. Bạn chỉ nói *"khi đã thích thì trông thế này, khi chưa thì trông thế kia"*. Việc đi từ cái này sang cái kia là việc của React.

Bạn đã gặp tư duy khai báo một lần rồi: ở file `04` chặng 2, chuyển từ vòng `for` sang `filter`/`map` — từ kể từng bước sang nói kết quả mong muốn. React áp dụng đúng tư duy đó cho toàn bộ giao diện.

### Công thức cốt lõi

```
UI = f(state)
```

Giao diện là **kết quả của một hàm** nhận vào trạng thái. Cùng trạng thái → luôn ra cùng giao diện. Muốn giao diện khác → đổi trạng thái.

Đây là câu bạn nên thuộc. Gần như mọi khái niệm trong chặng 4 đều là hệ quả của nó.

---

## 4. Bạn mang theo gì từ ba chặng trước

React không phải thứ hoàn toàn mới. Rất nhiều khái niệm bạn đã học sẽ quay lại, chỉ là dưới tên khác:

| Đã học | Ở React thành |
|---|---|
| Kiến trúc `trạng thái → render()` (file `08`, `09` chặng 2) | Cách React hoạt động — toàn bộ |
| Hàm, tham số, `return` (file `02` chặng 2) | Component là **hàm**, props là **tham số** |
| Destructuring (file `03` chặng 2) | Cách nhận props: `function The({ ten, gia })` |
| Tham trị và tham chiếu, bất biến (file `01`, `03` chặng 2) | **Luật bắt buộc** khi cập nhật state |
| `map`, `filter` (file `04` chặng 2) | Cách render danh sách |
| Closure (file `05` chặng 2) | Cách `useState` và mọi hook hoạt động |
| Stale closure (file `05` chặng 2, mục 8) | Bug phổ biến nhất với `useEffect` |
| Event delegation (file `09` chặng 2) | React tự làm bên dưới, bạn không phải viết |
| `textContent` vs `innerHTML`, XSS (file `08` chặng 2) | React tự thoát chuỗi — an toàn mặc định |
| `AbortController`, race condition (file `12` chặng 2) | Hàm dọn dẹp trong `useEffect` |
| ES Module (file `13` chặng 2) | Mỗi component một file, `import`/`export` |
| Vite (file `04` chặng 3) | Mọi dự án React bắt đầu từ đây |
| Discriminated union (file `06` chặng 3) | Mô hình hóa trạng thái loading/error/success |
| Generic (file `07` chặng 3) | `useState<User \| null>(null)` |

Bảng này đáng để quay lại đọc nhiều lần trong chặng. Mỗi khi gặp một khái niệm React có vẻ khó, hãy tìm xem nó ứng với dòng nào — thường bạn đã hiểu bản chất của nó từ trước.

---

## 5. React là gì, chính xác

**React là một thư viện để xây giao diện.** Không hơn.

Nó **không** lo:

- Định tuyến giữa các trang → React Router (chặng 5)
- Gọi và cache dữ liệu từ server → TanStack Query (chặng 5)
- Quản lý state toàn ứng dụng phức tạp → Zustand, Redux (chặng 5)
- Form phức tạp → React Hook Form (chặng 5)
- Render phía server, SEO → Next.js (chặng 7)

Đây là lý do người ta gọi React là **thư viện** (library) chứ không phải **framework**: nó chỉ làm một việc, và bạn tự chọn công cụ cho những việc còn lại. Trái ngược với Angular, vốn đóng gói sẵn gần như mọi thứ.

Hệ quả thực tế: hai dự án React ở hai công ty có thể trông khá khác nhau, vì mỗi nơi chọn bộ công cụ đi kèm khác nhau. Chặng 4 dạy phần lõi giống nhau ở mọi nơi; chặng 5 dạy những lựa chọn phổ biến nhất cho phần còn lại.

### Vài điều về lịch sử, để không bị lạc khi đọc tài liệu cũ

- **Class component** — cách viết component cũ, dùng `class` và `this` (file `06`, `07` chặng 2). Vẫn chạy được, nhưng code mới gần như không ai viết nữa. Bạn sẽ gặp trong dự án cũ — nhận ra được là đủ
- **Function component + Hooks** — cách viết hiện đại, toàn bộ chặng 4 dùng cách này
- **Create React App** (`create-react-app`) — công cụ dựng dự án cũ, **đã ngừng phát triển**. Nếu một bài hướng dẫn bảo bạn chạy `npx create-react-app`, đó là bài đã lỗi thời — dùng Vite thay thế
- **`react.dev`** — tài liệu chính thức hiện tại. Trang cũ `reactjs.org` đã được thay thế. Khi tra cứu, ưu tiên `react.dev`

---

## 6. Bản đồ chặng 4

12 file, chia bốn khối, khoảng 5 tuần.

**Khối A — Nền móng** (`01`, `02`)
JSX, component, props. Cách chia giao diện thành mảnh và truyền dữ liệu giữa chúng.

**Khối B — Trạng thái** (`03` → `05`)
`useState`, render danh sách, form. Khối này là nơi luật bất biến từ chặng 2 trở thành bắt buộc.

**Khối C — Hiệu ứng và chia sẻ** (`06`, `07`)
`useEffect` — chỗ nhiều người viết sai nhất. Lifting state up — cách hai component chia sẻ dữ liệu.

**Khối D — Công cụ nâng cao và cơ chế bên dưới** (`08` → `11`)
`useRef`, `useMemo`, `useCallback`, custom hook, và cuối cùng là mổ xẻ React thực sự render như thế nào.

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00` | File này — định hướng, cài đặt | Dựng dự án, component đầu tiên |
| `01` | JSX và component | Chuyển một trang HTML thành component |
| `02` | Props và composition | Bộ Card/Button dùng lại được |
| `03` | `useState` | Bộ đếm, toggle, state phức tạp |
| `04` | Render list và `key` | Danh sách thêm/xóa/sắp xếp |
| `05` | Form controlled | Form đăng ký có validate |
| `06` | `useEffect` | Sửa 5 effect viết sai |
| `07` | Lifting state up | Refactor app có state rải rác |
| `08` | `useRef` | Focus input, lưu giá trị trước |
| `09` | `useMemo` và `useCallback` | Đo hiệu năng trước/sau |
| `10` | Custom hook | `useFetch`, `useLocalStorage` |
| `11` | Luồng render của React | Dự đoán số lần render |

**Dự án cuối chặng:** ứng dụng quản lý chi tiêu — CRUD đầy đủ, nhiều màn hình, form có validate, lưu trữ, gọi API. React + TypeScript, đầy đủ bộ công cụ chặng 3.

### Về TypeScript trong chặng này

Toàn bộ chặng 4 viết bằng **React + TypeScript**. Lý do: phần lớn dự án React ở công ty dùng TypeScript, và bạn đã có nền từ chặng 3.

Nhưng mình sẽ giữ phần kiểu ở mức **vừa đủ**. Trọng tâm là hiểu React. Khi một đoạn TypeScript làm rối ý chính, mình sẽ giản lược nó và nói rõ.

---

## 7. Chặng này học thế nào

Chặng 4 quay lại kiểu học của chặng 2: cần **hiểu cơ chế**, không chỉ gõ theo.

Lý do: React có một số quy tắc trông kỳ lạ nếu bạn chỉ thuộc lòng — *"không được gọi hook trong `if`"*, *"không được sửa trực tiếp state"*, *"phải có `key` khi render danh sách"*. Người chỉ thuộc quy tắc sẽ vi phạm ngay khi gặp một tình huống hơi khác. Người hiểu **vì sao** có quy tắc đó thì tự suy ra được cách làm đúng.

Mình sẽ luôn giải thích vì sao. Và bài tập sẽ thường bắt bạn **cố tình vi phạm quy tắc** để thấy chuyện gì xảy ra.

Ba lời khuyên cụ thể:

**Đọc `react.dev` song song.** Phần "Learn" của tài liệu chính thức được viết rất tốt, có bài tập tương tác. Các file của mình đi theo cùng trình tự với nó. Khi một khái niệm chưa thấm, đọc thêm phần tương ứng ở đó — hai cách giải thích khác nhau thường giúp bạn hiểu nhanh hơn.

**Dùng React DevTools liên tục.** Mục 9 hướng dẫn cài đặt. Nó cho bạn nhìn thấy cây component, props, state của từng component, và component nào vừa render lại. Rất nhiều bug React chỉ hiểu được khi nhìn vào DevTools.

**Đừng vội cài thư viện.** Trong chặng 4, bạn sẽ thấy rất nhiều bài trên mạng gợi ý "dùng thư viện X cho việc này". Đừng. Chặng này là để hiểu React thuần. Thư viện để chặng 5 — và đến lúc đó bạn sẽ hiểu chúng đang giải quyết vấn đề gì.

---

## 8. Dựng dự án

```bash
npm create vite@latest
# Project name: hello-react
# Framework: React
# Variant: TypeScript

cd hello-react
npm install
npm run dev
```

Mở `http://localhost:5173`. Bạn sẽ thấy trang mẫu với logo React và một nút đếm.

Bấm nút vài lần. Rồi mở `src/App.tsx`, sửa một dòng chữ bất kỳ, lưu lại. Chữ đổi ngay — **và số đếm vẫn giữ nguyên**. Đó là HMR (file `04` chặng 3) giữ được trạng thái component, điều mà Live Server không làm được.

Có một lựa chọn khi tạo dự án có thể hiện ra là dùng **SWC** — một trình biên dịch nhanh hơn thay cho Babel. Với mục đích học, chọn bản nào cũng được.

### Cấu trúc dự án

```
hello-react/
├── index.html
├── package.json
├── tsconfig.json             ← có thể tách thành nhiều file tsconfig.*.json
├── vite.config.ts             ← có plugin React (file 04 chặng 3, mục 11)
├── eslint.config.js           ← Vite tạo sẵn cấu hình ESLint cho React
├── public/
└── src/
    ├── main.tsx              ← điểm khởi động
    ├── App.tsx                ← component gốc
    ├── App.css
    ├── index.css
    └── assets/
```

Mọi thứ trông quen thuộc — đây chính là dự án Vite + TypeScript của chặng 3. Chỉ có hai điểm mới:

**1. Đuôi `.tsx` thay vì `.ts`.** `.tsx` là TypeScript có thêm cú pháp JSX — cái trông giống HTML nằm trong JavaScript mà bạn thấy ở mục 3. File `01` giải thích kỹ.

**2. `vite.config.ts` có plugin React:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

Đúng như mình đã hẹn ở mục 11 file `04` chặng 3.

### `index.html`

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

Một thẻ `<div>` rỗng duy nhất. Toàn bộ giao diện sẽ do React dựng vào trong đó.

### `src/main.tsx`

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Đọc từng phần:

- **`react-dom/client`** — React tách làm hai gói: `react` chứa lõi (component, hook), `react-dom` lo việc vẽ lên DOM của trình duyệt. Tách như vậy vì cùng lõi React có thể vẽ lên nơi khác — ví dụ React Native vẽ lên giao diện điện thoại
- **`createRoot(...)`** — tạo một "gốc" React gắn vào thẻ `#root`
- **`document.getElementById("root")!`** — dấu `!` là non-null assertion (file `06` chặng 3, mục 10). Ở đây dùng là hợp lý: thẻ `#root` nằm cố định trong `index.html`, chắc chắn tồn tại
- **`.render(<App />)`** — vẽ component `App` vào gốc đó. Đây là lần **duy nhất** bạn gọi một thứ có tên `render` trong cả ứng dụng
- **`<StrictMode>`** — xem bên dưới

### `StrictMode` — biết trước để không hoảng

`StrictMode` là một chế độ kiểm tra **chỉ chạy khi phát triển**. Nó cố tình làm một số việc hai lần — render component hai lần, chạy effect hai lần — để phát hiện code có tác dụng phụ không đúng chỗ.

Hệ quả bạn sẽ gặp sớm: thêm `console.log` vào component, bạn thấy nó **in ra hai lần**. Đó không phải bug. Đó là `StrictMode` đang làm đúng việc của nó.

Khi build production (`npm run build`), hành vi này biến mất hoàn toàn.

Mình sẽ giải thích kỹ vì sao React làm vậy ở file `06` (`useEffect`) và file `11`. Giờ chỉ cần nhớ: **in hai lần khi dev là bình thường, đừng tắt `StrictMode` để "sửa".**

---

## 9. Cài React DevTools

Tiện ích trình duyệt chính thức của React. Tìm "React Developer Tools" trên Chrome Web Store (hoặc kho tiện ích của Firefox, Edge), cài đặt.

Mở trang dự án đang chạy, mở DevTools (`F12`). Bạn sẽ thấy hai tab mới:

- **Components** — cây component của ứng dụng. Bấm vào một component để xem props và state hiện tại của nó. **Sửa được trực tiếp** — đổi giá trị state ngay trong DevTools và xem giao diện cập nhật
- **Profiler** — ghi lại component nào render, render bao nhiêu lần, mất bao lâu. Bạn sẽ dùng nhiều ở file `09` và `11`

Thử ngay: bấm nút đếm vài lần, sang tab Components, chọn `App`, tìm phần "hooks" — bạn sẽ thấy giá trị đếm hiện tại. Sửa nó thành `100` ngay trong DevTools, nhìn giao diện đổi theo.

Trong tab Components, mở phần cài đặt (biểu tượng bánh răng) và bật **"Highlight updates when components render"**. Từ giờ, mỗi khi một component render lại, nó sẽ nhấp nháy viền màu. Đây là công cụ rất mạnh để hiểu React đang làm gì — để bật suốt chặng 4.

---

## 10. Chỉnh lại công cụ chặng 3

Vite đã tạo sẵn ESLint với các quy tắc dành riêng cho React. Mở `eslint.config.js`, bạn sẽ thấy hai plugin:

- **`eslint-plugin-react-hooks`** — kiểm tra bạn dùng hook đúng quy tắc. Quy tắc quan trọng nhất của nó, `exhaustive-deps`, sẽ cứu bạn rất nhiều lần ở file `06`. **Đừng bao giờ tắt plugin này**
- **`eslint-plugin-react-refresh`** — đảm bảo HMR hoạt động đúng

Việc cần làm:

1. Cài Prettier và `eslint-config-prettier` (file `05` chặng 3), thêm vào **cuối** mảng cấu hình
2. Cài Husky + lint-staged
3. Thêm script `typecheck`
4. Cấu hình alias `@` trỏ về `src/` — với dự án nhiều component, alias tiết kiệm rất nhiều đường dẫn `../../../`
5. `git init`, `.gitignore` (Vite đã tạo sẵn), commit đầu tiên, đẩy lên GitHub

Đây là thói quen bạn sẽ lặp lại cho mọi dự án: tạo bằng Vite → bổ sung bộ công cụ → Git → GitHub. Nên làm vài lần cho thành phản xạ.

---

## 11. Cấu trúc thư mục chặng 4

```
LearningFE/
├── Chặng 1/
├── Chặng 2/
├── Chặng 3/
└── Chặng 4/
    ├── 00-bat-dau-chang-4.md      ← file này
    ├── 01-jsx-va-component.md
    ├── ...
    ├── bai-tap/                    ← MỘT dự án Vite dùng chung
    │   └── src/
    │       ├── bai-01/
    │       ├── bai-02/
    │       └── ...
    └── du-an-quan-ly-chi-tieu/     ← dự án cuối chặng, kho Git riêng
```

Khác chặng 3: thay vì mỗi bài tập một dự án Vite riêng, chặng 4 dùng **một** dự án chung cho mọi bài tập. Mỗi file một thư mục con trong `src/`. Muốn xem bài nào thì sửa `App.tsx` để hiển thị component của bài đó.

Lý do: tạo dự án Vite mới mất vài phút và vài trăm MB `node_modules` mỗi lần. Với 11 file bài tập, dùng chung tiết kiệm đáng kể.

---

## 12. Ba điều gây bối rối ngay từ đầu

**"`console.log` trong component in ra hai lần."**

`StrictMode` — xem mục 8. Bình thường.

**"Sửa code, trang không đổi, hoặc đổi nhưng mất hết dữ liệu đang có."**

HMR của React chỉ giữ được state khi file **chỉ export component**. Nếu file export thêm một hằng số hay hàm thường, HMR có thể phải nạp lại toàn trang. Plugin `react-refresh` trong ESLint sẽ cảnh báo trường hợp này.

**"Màn hình trắng, không có gì cả."**

Mở Console. Trong React, một lỗi lúc render thường làm **cả ứng dụng** biến mất (không chỉ phần bị lỗi) — khác chặng 2, nơi lỗi ở một hàm không ảnh hưởng phần còn lại của trang. Thông báo lỗi trong Console thường chỉ đúng component và đúng dòng. Cách xử lý chuyện này ở quy mô lớn (Error Boundary) sẽ được nhắc tới ở các chặng sau.

---

## Bài tập

### Bài 1 — Dựng môi trường

1. Tạo dự án `Chặng 4/bai-tap/` theo mục 8 (React + TypeScript)
2. Hoàn thành toàn bộ mục 10: Prettier, Husky, lint-staged, `typecheck`, alias, Git, GitHub
3. Cài React DevTools, bật "Highlight updates"
4. Xác nhận `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run build` đều chạy được

Ghi vào `ghi-chu.md` những lệnh đã dùng và những chỗ bị vấp.

### Bài 2 — Khám phá dự án mẫu (bài chính)

Không sửa gì, chỉ đọc và quan sát. Ghi kết quả vào `ghi-chu.md`:

1. Mở `src/App.tsx`. Không cần hiểu hết, liệt kê:
   - Những dòng nào trông giống JavaScript bình thường
   - Những dòng nào trông giống HTML
   - Những chỗ nào trộn cả hai — ví dụ `{count}` nằm giữa thẻ HTML
2. Tìm dòng có chữ `useState`. Đoán xem nó làm gì dựa trên tên và cách dùng
3. Tìm chỗ xử lý khi bấm nút. So sánh với cách bạn gắn sự kiện ở file `09` chặng 2 — có `addEventListener` không? Có `querySelector` không?
4. Bấm nút đếm, quan sát trong tab Components của DevTools: giá trị nào thay đổi?
5. Với "Highlight updates" đang bật, bấm nút đếm — phần nào của trang nhấp nháy?
6. Thêm `console.log("App render")` vào đầu hàm `App`. Tải lại trang — in mấy lần? Bấm nút — mỗi lần bấm in thêm mấy dòng? Giải thích dựa trên mục 8
7. `npm run build`, rồi `npm run preview`. Mở trang, xem Console — `console.log` ở câu 6 in mấy lần lúc tải trang? Khác `npm run dev` thế nào?

Câu 3 là câu quan trọng nhất. Bạn sẽ thấy không có `querySelector` nào, không có `addEventListener` nào, không có `textContent` nào — vậy mà giao diện vẫn cập nhật. Đây chính là cách khai báo ở mục 3.

### Bài 3 — So sánh hai cách

Viết **cùng một** bộ đếm bằng hai cách, đặt cạnh nhau:

**Cách 1 — JavaScript thuần**, trong một file HTML riêng (không cần Vite), theo đúng kiến trúc `trạng thái → render()` của chặng 2:
- Một số đếm hiển thị
- Nút `+`, nút `-`, nút "Đặt lại"
- Số âm thì hiện màu đỏ, số dương màu xanh, bằng 0 màu xám

**Cách 2 — React**: sửa `App.tsx` của dự án mẫu để làm đúng chức năng trên. Bạn chưa học React, nên hãy **bắt chước** cách dự án mẫu dùng `useState` và `onClick`. Đoán, thử, sai, sửa.

Ghi vào `ghi-chu.md`:
- Số dòng code của mỗi cách
- Cách nào phải tự gọi `render()`? Cách nào không?
- Cách nào phải tự tìm phần tử DOM để sửa?
- Ở cách 2, khi số đổi từ dương sang âm, bạn đã viết dòng nào để **xóa** màu xanh và **thêm** màu đỏ? (Gợi ý: có lẽ bạn không viết dòng nào cả — vì sao?)

Câu hỏi cuối là cốt lõi của mục 3: ở cách khai báo, bạn chỉ mô tả kết quả cho từng trạng thái, không viết chuyển đổi.

### Bài 4 — Cố tình làm hỏng

Trong `App.tsx`, thử lần lượt từng thay đổi, quan sát lỗi (editor, terminal, hoặc Console), rồi khôi phục lại. Ghi vào `ghi-chu.md` thông báo lỗi của từng trường hợp:

1. Đổi tên hàm `App` thành `app` (chữ thường), và sửa cả chỗ dùng trong `main.tsx` thành `<app />`
2. Trong `return`, đặt hai thẻ `<h1>` đứng cạnh nhau ở cấp cao nhất, không có gì bọc ngoài
3. Đổi `className` thành `class` ở một thẻ bất kỳ
4. Xóa dòng `export default App`
5. Gõ sai tên biến bên trong `{ }`, ví dụ `{cout}` thay vì `{count}`

Bạn chưa cần biết cách sửa đúng — đó là nội dung file `01`. Mục đích là làm quen với thông báo lỗi của React **trước khi** học, để khi gặp chúng thật sự bạn không bất ngờ.

### Bài 5 — Đọc tài liệu chính thức

Mở `react.dev`, đọc trang **"Thinking in React"** trong phần Learn. Bài này mô tả cách chia một giao diện thành component.

Sau khi đọc, lấy Pokédex của bạn (bản TypeScript ở chặng 3). Vẽ ra giấy hoặc bằng ASCII trong `ghi-chu.md`: nếu viết lại bằng React, bạn sẽ chia giao diện thành những component nào? Component nào chứa component nào?

```
App
├── ThanhTimKiem
├── BoLoc
├── DanhSachPokemon
│   └── ThePokemon (nhiều cái)
└── ...
```

Không có đáp án đúng duy nhất. Giữ lại bản vẽ này — ở file `02` bạn sẽ quay lại so sánh.

---

## Xong file này khi

- [ ] Dự án `bai-tap` chạy được, có đủ Prettier, Husky, lint-staged, alias, đã lên GitHub
- [ ] React DevTools đã cài, đã thử sửa state trực tiếp trong tab Components
- [ ] Bài 2 trả lời đủ 7 câu, giải thích được vì sao `console.log` in hai lần khi dev nhưng một lần sau khi build
- [ ] Bộ đếm viết được bằng cả hai cách, trả lời được câu hỏi cuối của bài 3
- [ ] Đã thấy và ghi lại 5 thông báo lỗi ở bài 4
- [ ] Có bản vẽ cây component cho Pokédex
- [ ] Nói được bằng lời: `UI = f(state)` nghĩa là gì, và khác gì cách bạn làm ở chặng 2

Xong thì gửi mình `ghi-chu.md` và link kho `bai-tap`, kèm **"viết file 01-jsx-va-component"**.