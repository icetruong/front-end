# Lộ trình Front-End — Chặng 2 đến Chặng 7

**Đã xong:** Chặng 1 — HTML semantic, CSS nền tảng, Flexbox, Grid, Responsive
**Mục tiêu:** đủ năng lực đi phỏng vấn Fresher/Junior Front-End
**Nhịp học:** 10–20 giờ/tuần → tổng khoảng **6–7 tháng**

---

## Cách chúng ta làm việc

Giống hệt chặng 1:

1. Bạn nhắn tên file muốn học, ví dụ *"viết cho tôi file 01-bien-va-kieu-du-lieu"*
2. Mình viết file `.md` đầy đủ: lý thuyết → ví dụ code → lỗi thường gặp → **bài tập cuối file**
3. Bạn đọc, làm bài tập vào file `bai-tap-XX.html` (hoặc `.js`, `.jsx` tùy chặng)
4. Gửi lại code, mình review: chỗ nào sai, chỗ nào chạy được nhưng không nên viết vậy
5. Sửa xong mới sang file tiếp theo

**Quy tắc quan trọng:** không nhảy file. Mỗi file được thiết kế dựa trên file trước. Nhảy cóc là chỗ mà lỗ hổng kiến thức bắt đầu hình thành.

Mỗi file học khoảng **2–4 giờ** (đọc + làm bài tập). Với 10–20 giờ/tuần, bạn xong khoảng **3–5 file mỗi tuần**.

---

## Chặng 2 — JavaScript (14 file · ~6 tuần)

Bạn đã học JS sơ qua trước đây, nên vài file đầu sẽ đi nhanh. Nhưng mình vẫn viết đầy đủ, vì "học sơ sơ" thường có nghĩa là viết được nhưng không giải thích được — mà phỏng vấn hỏi đúng phần giải thích.

Đây là chặng dài nhất và quan trọng nhất. Phần lớn câu hỏi vòng kỹ thuật Junior nằm ở đây, không phải ở React.

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00-bat-dau-chang-2.md` | Bản đồ chặng 2, cách setup, chạy JS ở đâu | Dựng khung thư mục, chạy dòng code đầu |
| `01-bien-va-kieu-du-lieu.md` | `let/const`, primitive vs reference, ép kiểu, `==` vs `===` | Đoán kết quả 15 biểu thức, giải thích vì sao |
| `02-ham-va-scope.md` | Khai báo hàm, hoisting, TDZ, arrow function | Sửa 6 đoạn code lỗi scope |
| `03-mang-va-object.md` | Destructuring, spread/rest, optional chaining | Biến đổi dữ liệu JSON lồng nhau |
| `04-cac-ham-mang-quan-trong.md` | `map`, `filter`, `reduce`, `find`, `sort` | Xử lý 1 mảng sản phẩm: lọc, sắp xếp, tính tổng |
| `05-closure.md` | Closure là gì, dùng làm gì trong code thật | Viết bộ đếm, hàm debounce, module pattern |
| `06-tu-khoa-this.md` | 4 quy tắc binding, `call/apply/bind` | Đoán `this` trong 8 tình huống |
| `07-prototype-va-class.md` | Chuỗi prototype, `class` chỉ là cú pháp đường | Xây 1 hệ class nhỏ có kế thừa |
| `08-dom-co-ban.md` | Query, tạo/xóa node, `textContent` vs `innerHTML` | **Máy tính** (bai-tap-01.html) |
| `09-su-kien-va-delegation.md` | Bubbling/capturing, event delegation | **Todo app** dùng delegation (bai-tap-02.html) |
| `10-bat-dong-bo-va-event-loop.md` | Call stack, task queue, microtask queue | Sắp thứ tự output của 10 đoạn code |
| `11-promise-va-async-await.md` | `Promise.all/allSettled/race`, xử lý lỗi | Viết lại callback hell thành async/await |
| `12-fetch-va-http.md` | Method, status code, header, JSON, CORS | **App gọi API** có loading + error (bai-tap-03.html) |
| `13-storage-va-module.md` | `localStorage` vs cookie, `import/export` | **Quiz app có đếm giờ** (bai-tap-04.html) |

**Cuối chặng:** mình ra một bài kiểm tra vấn đáp — bạn trả lời bằng lời, không nhìn ghi chú.

---

## Chặng 3 — Git, Tooling & TypeScript (8 file · ~3 tuần)

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00-bat-dau-chang-3.md` | Vì sao cần tooling, bản đồ chặng 3 | Cài đặt môi trường |
| `01-git-co-ban.md` | Commit, branch, merge vs rebase, conflict | Tự tạo conflict rồi tự giải |
| `02-github-workflow.md` | Feature branch, pull request, README tốt | Đẩy chặng 1+2 lên GitHub |
| `03-npm-va-package-json.md` | Semver, dependencies vs devDependencies | Đọc hiểu 1 `package.json` thật |
| `04-vite.md` | Dev server, HMR, build production | Dựng dự án Vite từ đầu |
| `05-eslint-prettier.md` | Cấu hình, quy tắc, format tự động | Setup và sửa hết warning |
| `06-typescript-co-ban.md` | Kiểu cơ bản, `interface` vs `type`, union | Gắn kiểu cho code chặng 2 |
| `07-typescript-generics.md` | Generics, narrowing, `unknown` vs `any` | Viết hàm fetch có kiểu generic |

**Dự án chặng 3:** viết lại app gọi API bằng Vite + TypeScript, đẩy lên GitHub.

---

## Chặng 4 — React nền tảng (12 file · ~5 tuần)

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00-bat-dau-chang-4.md` | React giải quyết vấn đề gì, tư duy component | Dựng dự án React + TS |
| `01-jsx-va-component.md` | JSX biên dịch thành gì, quy tắc viết | Chuyển 1 trang HTML thành component |
| `02-props-va-composition.md` | Props, `children`, tách component | Xây bộ Card/Button tái dùng được |
| `03-usestate.md` | State bất biến, cập nhật theo hàm, batching | Bộ đếm, toggle, counter phức tạp |
| `04-render-list-va-key.md` | `key` hoạt động thế nào, vì sao index là sai | Danh sách có thêm/xóa/sắp xếp |
| `05-form-controlled.md` | Controlled vs uncontrolled | Form đăng ký có validate |
| `06-useeffect.md` | Dependency array, cleanup, khi nào **không** cần effect | Sửa 5 effect viết sai |
| `07-lifting-state-up.md` | Nâng state, prop drilling | Refactor app có state rải rác |
| `08-useref.md` | State vs ref khác nhau ở đâu | Focus input, lưu giá trị trước đó |
| `09-usememo-usecallback.md` | Dùng đúng lúc, không rải bừa | Đo hiệu năng trước/sau khi tối ưu |
| `10-custom-hook.md` | Tách logic tái dùng | Viết `useFetch`, `useLocalStorage` |
| `11-luong-render-cua-react.md` | Khi nào render lại, reconciliation, Virtual DOM | Dự đoán số lần render |

**Dự án chặng 4:** app quản lý chi tiêu — CRUD đầy đủ, nhiều trang, form validate, gọi API thật.

---

## Chặng 5 — Hệ sinh thái React (7 file · ~4 tuần)

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00-bat-dau-chang-5.md` | Bức tranh hệ sinh thái, chọn thư viện thế nào | — |
| `01-react-router.md` | Route lồng nhau, param, protected route | Thêm định tuyến cho app chặng 4 |
| `02-tanstack-query.md` | Caching, invalidation, optimistic update | Thay toàn bộ `useEffect + fetch` |
| `03-context-va-usereducer.md` | Khi nào cần, khi nào thừa | Quản lý theme + giỏ hàng |
| `04-zustand.md` | Global state gọn nhẹ | So sánh với Context ở cùng bài toán |
| `05-react-hook-form-zod.md` | Form phức tạp, validate theo schema | Form nhiều bước |
| `06-xac-thuc-jwt.md` | Lưu token ở đâu an toàn, refresh token | Thêm đăng nhập vào app |

TanStack Query là thứ phân biệt người học theo tutorial và người làm thật. Mình sẽ viết file này kỹ hơn các file khác.

---

## Chặng 6 — Chất lượng giao diện & nền tảng web (7 file · ~3 tuần)

Chặng 1 bạn đã chắc Flexbox/Grid/Responsive nên phần CSS ở đây nhẹ. Trọng tâm là những thứ ứng viên hay bỏ qua — cũng là thứ khiến portfolio trông chuyên nghiệp hay nghiệp dư.

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00-bat-dau-chang-6.md` | Vì sao chặng này quyết định portfolio | — |
| `01-css-hien-dai.md` | Custom properties, `clamp()`, container query | Dark mode bằng CSS variable |
| `02-tailwind.md` | Tư duy utility-first | Viết lại 1 trang bằng Tailwind |
| `03-accessibility.md` | ARIA, điều hướng bàn phím, focus, tương phản | Modal dùng được hoàn toàn bằng bàn phím |
| `04-hieu-nang-web.md` | Core Web Vitals, lazy loading, code splitting | Giảm bundle size của app |
| `05-devtools-nang-cao.md` | Tab Network, Performance, Lighthouse | Đẩy Lighthouse lên >90 cả 4 mục |
| `06-bao-mat-co-ban.md` | XSS, CSRF, CORS | Tìm và vá 3 lỗ hổng trong code mẫu |

CORS gần như chắc chắn bị hỏi trong phỏng vấn.

---

## Chặng 7 — Testing, Next.js & phỏng vấn (9 file · ~5 tuần)

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00-bat-dau-chang-7.md` | Chặng về đích, checklist tổng | — |
| `01-vitest-va-rtl.md` | Test component, test hook | Viết test cho 3 component đã có |
| `02-mock-api-voi-msw.md` | Mock API trong test | Test luồng gọi API |
| `03-nextjs-app-router.md` | Server Component vs Client Component | Dựng app Next.js nhỏ |
| `04-cac-kieu-render.md` | SSR, SSG, ISR — chọn cái nào khi nào | So sánh 3 kiểu trên cùng 1 trang |
| `05-deploy-vercel.md` | Deploy, biến môi trường, domain | Đưa 2 dự án lên production |
| `06-hoan-thien-portfolio.md` | README, ảnh chụp, link demo, dọn GitHub | Hoàn thiện 2 dự án tiêu biểu |
| `07-cau-hoi-phong-van.md` | ~80 câu hay gặp, kèm gợi ý trả lời | Trả lời bằng lời, mình chấm |
| `08-thuat-toan-co-ban.md` | Mảng, chuỗi, hash map, two pointer | 40–60 bài Easy/Medium |

---

## Bảng theo dõi

| Chặng | Nội dung | Số file | Thời gian | Trạng thái |
|---|---|---|---|---|
| 1 | HTML + CSS + Responsive | 6 | — | ✅ Xong |
| 2 | JavaScript | 14 | 6 tuần | ☐ |
| 3 | Git, Tooling, TypeScript | 8 | 3 tuần | ☐ |
| 4 | React nền tảng | 12 | 5 tuần | ☐ |
| 5 | Hệ sinh thái React | 7 | 4 tuần | ☐ |
| 6 | CSS nâng cao, a11y, hiệu năng | 7 | 3 tuần | ☐ |
| 7 | Testing, Next.js, phỏng vấn | 9 | 5 tuần | ☐ |

**Tổng: 57 file, khoảng 26 tuần.**

---

## Ba lời nhắc

**Tỷ lệ 30/70.** Đọc file mình viết là 30%. Gõ code là 70%. Nếu bạn đọc xong thấy "hiểu rồi" mà bỏ qua bài tập, ba tuần sau sẽ quên sạch — và đó là điều lộ ra ngay trong phỏng vấn.

**Đừng vội sang React.** Rất nhiều người rớt phỏng vấn không phải vì không biết React, mà vì không giải thích được closure hay event loop. Chặng 2 làm chắc thì chặng 4–5 nhanh hơn nhiều.

**Gửi bài tập cho mình review.** Code chạy được không có nghĩa là code đúng. Phần lớn giá trị của lộ trình này nằm ở vòng phản hồi, không nằm ở file lý thuyết.

---

## Bắt đầu

Nhắn cho mình: **"viết file 00-bat-dau-chang-2"** — hoặc nếu muốn vào thẳng nội dung thì **"viết file 01-bien-va-kieu-du-lieu"**.