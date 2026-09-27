# 12 — `fetch` và HTTP

> **Cần có trước:** xong `11` (Promise), `09` (sự kiện), `05` (debounce).
> **Thời gian:** 5 giờ.
> **Vì sao quan trọng:** đây là file biến trang web của bạn thành ứng dụng thật — có dữ liệu từ server. Sản phẩm cuối file gom lại gần như mọi thứ bạn đã học ở chặng 2. Và CORS, câu hỏi gần như chắc chắn xuất hiện trong phỏng vấn, nằm ở mục 9.

---

## 1. HTTP trong 5 phút

Mỗi lần trình duyệt lấy dữ liệu, nó gửi một **request** và nhận một **response**.

**Request gồm:**

```
POST /api/users HTTP/1.1          ← method + đường dẫn
Host: example.com                  ← headers
Content-Type: application/json
Authorization: Bearer abc123

{"ten": "An", "email": "an@x.com"}  ← body (GET không có)
```

**Response gồm:**

```
HTTP/1.1 201 Created               ← status code
Content-Type: application/json     ← headers

{"id": 42, "ten": "An"}            ← body
```

### Method

| Method | Dùng để | Có body | Idempotent |
|---|---|---|---|
| `GET` | Lấy dữ liệu | Không | Có |
| `POST` | Tạo mới | Có | **Không** |
| `PUT` | Thay thế toàn bộ | Có | Có |
| `PATCH` | Sửa một phần | Có | Không |
| `DELETE` | Xóa | Thường không | Có |

**Idempotent** nghĩa là gọi 10 lần cũng cho kết quả như gọi 1 lần. `POST` không idempotent — đó là lý do bấm nút "Đặt hàng" hai lần có thể tạo hai đơn, và là lý do bạn cần chặn double-submit.

### Status code

Chia theo chữ số đầu:

- **2xx — thành công**
  - `200 OK` — thành công, có dữ liệu trả về
  - `201 Created` — đã tạo mới
  - `204 No Content` — thành công, **không có body** (gọi `.json()` sẽ lỗi!)

- **3xx — chuyển hướng**
  - `301` vĩnh viễn, `302` tạm thời, `304 Not Modified` (dùng cache)

- **4xx — lỗi phía client**
  - `400 Bad Request` — dữ liệu gửi lên sai
  - `401 Unauthorized` — **chưa đăng nhập** hoặc token hỏng
  - `403 Forbidden` — đã đăng nhập nhưng **không có quyền**
  - `404 Not Found`
  - `409 Conflict` — ví dụ email đã tồn tại
  - `422 Unprocessable Entity` — dữ liệu đúng định dạng nhưng sai nghiệp vụ
  - `429 Too Many Requests` — gửi quá nhiều

- **5xx — lỗi phía server**
  - `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`

Phân biệt `401` và `403` hay bị hỏi: **401 là "bạn là ai?", 403 là "tôi biết bạn là ai, nhưng không được phép"**.

---

## 2. `fetch` cơ bản

```javascript
const res = await fetch("https://api.example.com/users");
const duLieu = await res.json();
console.log(duLieu);
```

`fetch` trả về Promise của một object `Response`. Lưu ý **hai** lần `await`: một cho response, một cho việc đọc body.

---

## 3. Cái bẫy lớn nhất: `fetch` không reject với lỗi HTTP

```javascript
try {
  const res = await fetch("/api/khong-ton-tai");   // server trả 404
  const data = await res.json();                    // KHÔNG vào catch!
} catch (e) {
  console.log("Sẽ không chạy với lỗi 404");
}
```

`fetch` chỉ reject khi:

- Không kết nối được mạng
- Bị CORS chặn
- Request bị hủy (`abort`)

Lỗi `404`, `500`, `401` đều là response **hợp lệ** dưới góc nhìn của `fetch` — nó đã liên lạc với server thành công và nhận được câu trả lời.

**Luôn kiểm tra `res.ok`:**

```javascript
const res = await fetch(url);

if (!res.ok) {
  throw new Error(`HTTP ${res.status}: ${res.statusText}`);
}

const data = await res.json();
```

`res.ok` là `true` khi status nằm trong khoảng 200–299.

Đây là khác biệt quan trọng nhất giữa `fetch` và các thư viện như axios (axios tự động reject với status lỗi).

---

## 4. Đọc body

```javascript
await res.json();        // phân tích JSON
await res.text();        // chuỗi thô
await res.blob();        // dữ liệu nhị phân (ảnh, file)
await res.formData();
await res.arrayBuffer();
```

### Body chỉ đọc được MỘT lần

```javascript
const res = await fetch(url);
const a = await res.json();
const b = await res.json();   // TypeError: body stream already read
```

Cần đọc hai lần thì nhân bản trước:

```javascript
const res = await fetch(url);
const ban = res.clone();
const a = await res.json();
const b = await ban.text();
```

### Các thuộc tính của Response

```javascript
res.ok;                              // true nếu 200-299
res.status;                          // 200, 404, 500...
res.statusText;                      // "OK", "Not Found"
res.headers.get("content-type");     // "application/json"
res.url;
res.redirected;
```

### Hai cái bẫy khi đọc JSON

```javascript
// 1. Status 204 không có body
if (res.status === 204) return null;
const data = await res.json();   // lỗi nếu body rỗng

// 2. Server trả HTML (trang lỗi) thay vì JSON
const loai = res.headers.get("content-type");
if (!loai?.includes("application/json")) {
  const text = await res.text();
  throw new Error(`Server trả về không phải JSON: ${text.slice(0, 100)}`);
}
```

Lỗi `Unexpected token '<' in JSON` gần như luôn có nghĩa là server trả về trang HTML lỗi.

---

## 5. Gửi dữ liệu

### POST với JSON

```javascript
const res = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ ten: "An", email: "an@x.com" })
});
```

Ba điểm bắt buộc: có `method`, có header `Content-Type`, và `body` phải là **chuỗi** (nên cần `JSON.stringify`).

### Các method khác

```javascript
// Cập nhật toàn bộ
await fetch(`/api/users/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(userDayDu)
});

// Cập nhật một phần
await fetch(`/api/users/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "moi@x.com" })
});

// Xóa
await fetch(`/api/users/${id}`, { method: "DELETE" });
```

### Gửi file — FormData

```javascript
const fd = new FormData();
fd.append("avatar", input.files[0]);
fd.append("ten", "An");

await fetch("/api/upload", {
  method: "POST",
  body: fd
  // KHÔNG đặt Content-Type!
});
```

Với `FormData`, **đừng tự đặt `Content-Type`**. Trình duyệt cần tự sinh header kèm chuỗi `boundary` ngẫu nhiên; bạn đặt tay là hỏng.

### Query string — `URLSearchParams`

```javascript
const params = new URLSearchParams({
  q: "bàn phím cơ",
  trang: 1,
  sapXep: "gia-tang"
});

const res = await fetch(`/api/san-pham?${params}`);
// /api/san-pham?q=b%C3%A0n+ph%C3%ADm+c%C6%A1&trang=1&sapXep=gia-tang
```

Nó tự mã hóa ký tự đặc biệt và dấu tiếng Việt. Đừng nối chuỗi bằng tay.

---

## 6. Hủy request — `AbortController`

```javascript
const ac = new AbortController();

fetch(url, { signal: ac.signal })
  .then(r => r.json())
  .catch(e => {
    if (e.name === "AbortError") {
      console.log("Đã hủy");
    } else {
      console.error(e);
    }
  });

ac.abort();    // hủy
```

Khi bị hủy, Promise reject với lỗi có `name === "AbortError"`. Luôn phân biệt nó với lỗi thật — hủy request không phải là lỗi cần báo cho người dùng.

### Đặt thời hạn

```javascript
// Cách hiện đại
const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

// Cách thủ công, tương thích rộng hơn
const ac = new AbortController();
const id = setTimeout(() => ac.abort(), 5000);
try {
  const res = await fetch(url, { signal: ac.signal });
} finally {
  clearTimeout(id);
}
```

So với `Promise.race` ở file `11`: `AbortController` **thực sự hủy** request, tiết kiệm băng thông. `race` chỉ bỏ qua kết quả.

### Hủy request cũ khi có request mới

Đây là ứng dụng quan trọng nhất — mục 10 nói kỹ.

```javascript
let acHienTai = null;

async function timKiem(tuKhoa) {
  acHienTai?.abort();                 // hủy lần tìm trước
  acHienTai = new AbortController();

  try {
    const res = await fetch(`/api/tim?q=${tuKhoa}`, { signal: acHienTai.signal });
    return await res.json();
  } catch (e) {
    if (e.name === "AbortError") return null;
    throw e;
  }
}
```

---

## 7. Xác thực

```javascript
// Token trong header — phổ biến nhất
await fetch("/api/me", {
  headers: { "Authorization": `Bearer ${token}` }
});

// Cookie
await fetch("/api/me", {
  credentials: "include"    // gửi cookie kể cả khi khác domain
});
```

Giá trị của `credentials`:

- `"same-origin"` (mặc định) — chỉ gửi cookie khi cùng domain
- `"include"` — luôn gửi
- `"omit"` — không bao giờ gửi

Về chỗ lưu token: `localStorage` tiện nhưng JavaScript đọc được, nên lỗ hổng XSS (file `08`) sẽ đánh cắp được. Cookie `httpOnly` an toàn hơn trước XSS nhưng cần phòng CSRF. Đây là chủ đề của file `06` chặng 6 và file `06` chặng 5 — giờ chỉ cần biết đánh đổi tồn tại.

---

## 8. Phân loại lỗi

Có **ba** loại lỗi khác nhau, cần xử lý khác nhau:

```javascript
async function goiAPI(url, options) {
  let res;

  // 1. Lỗi mạng — fetch reject
  try {
    res = await fetch(url, options);
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error("Không kết nối được. Kiểm tra mạng của bạn.");
  }

  // 2. Lỗi HTTP — response có nhưng status xấu
  if (!res.ok) {
    let chiTiet = "";
    try {
      const body = await res.json();
      chiTiet = body.message ?? "";
    } catch { /* body không phải JSON, bỏ qua */ }

    throw new LoiHTTP(res.status, chiTiet);
  }

  // 3. Lỗi phân tích — body không đúng định dạng
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    throw new Error("Server trả về dữ liệu không hợp lệ");
  }
}
```

Với lớp lỗi riêng (nhớ file `07`):

```javascript
class LoiHTTP extends Error {
  constructor(status, chiTiet = "") {
    super(`HTTP ${status}${chiTiet ? ": " + chiTiet : ""}`);
    this.name = "LoiHTTP";
    this.status = status;
  }
}
```

Nhờ đó nơi gọi xử lý được theo từng trường hợp:

```javascript
try {
  const data = await goiAPI("/api/me");
} catch (e) {
  if (e instanceof LoiHTTP && e.status === 401) {
    chuyenToiTrangDangNhap();
  } else {
    hienThongBaoLoi(e.message);
  }
}
```

---

## 9. CORS

Chủ đề gần như chắc chắn bị hỏi trong phỏng vấn. Đọc kỹ mục này.

### Vấn đề nó giải quyết

Mặc định, trình duyệt **cấm** JavaScript ở trang `a.com` đọc dữ liệu từ `b.com`. Quy tắc này gọi là **Same-Origin Policy**.

"Origin" gồm ba phần: **giao thức + tên miền + cổng**. Khác một trong ba là khác origin.

```
https://example.com        vs  http://example.com         → khác (giao thức)
https://example.com        vs  https://api.example.com    → khác (tên miền)
https://example.com        vs  https://example.com:8080   → khác (cổng)
```

Vì sao cần cấm: nếu không, trang `trang-doc-hai.com` bạn vô tình mở có thể gọi `api.ngan-hang.com` bằng cookie đăng nhập của bạn và đọc toàn bộ dữ liệu.

**CORS** (Cross-Origin Resource Sharing) là cơ chế để server **cho phép** một số origin cụ thể vượt qua giới hạn đó.

### Cách hoạt động

Server trả về header cho phép:

```
Access-Control-Allow-Origin: https://trang-cua-toi.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

Không có header đó, trình duyệt chặn và JavaScript không đọc được phản hồi.

### Preflight

Với request "không đơn giản", trình duyệt gửi trước một request `OPTIONS` để hỏi ý server:

Request được coi là **đơn giản** khi: method là `GET`/`HEAD`/`POST`, và `Content-Type` là `text/plain`, `multipart/form-data`, hoặc `application/x-www-form-urlencoded`, và không có header tùy chỉnh.

Nghĩa là: `POST` với `Content-Type: application/json` **luôn** kích hoạt preflight. Đó là lý do bạn thấy request `OPTIONS` lạ trong tab Network — không phải bug.

### Bốn điều phải nhớ

1. **CORS do trình duyệt áp đặt.** Postman, curl, hay server gọi server đều không bị. Nên "Postman chạy được mà trình duyệt lỗi" là chuyện bình thường.

2. **Chỉ server sửa được.** Không có cách nào chính đáng để "tắt CORS" từ JavaScript phía client. Mọi "giải pháp" bạn tìm thấy trên mạng đều là một trong ba cách: sửa server, dùng proxy, hoặc tắt bảo mật trình duyệt (chỉ để thử, không bao giờ dùng thật).

3. **`mode: "no-cors"` không phải giải pháp.** Nó cho request đi nhưng trả về "opaque response" — bạn không đọc được gì, kể cả status. Gần như vô dụng.

4. **`Allow-Origin: *` không dùng được với `credentials: "include"`.** Muốn gửi cookie thì server phải ghi rõ origin cụ thể.

### Khi gặp lỗi CORS lúc học

- Dùng API công khai có bật CORS sẵn (PokéAPI, JSONPlaceholder, Open-Meteo)
- Dùng proxy phát triển của Vite (chặng 3)
- Nếu bạn tự viết server: cấu hình CORS ở phía server

---

## 10. Race condition khi tìm kiếm

Người dùng gõ "bàn", "bàn p", "bàn phím". Ba request được gửi. Nhưng không có gì đảm bảo chúng về theo thứ tự.

```
Gửi:  bàn ────────────────────────► về (chậm)
Gửi:  bàn p ──────► về
Gửi:  bàn phím ──────► về

Kết quả hiển thị: kết quả của "bàn" — SAI
```

Người dùng thấy kết quả của từ khóa cũ. Bug này rất khó phát hiện khi mạng nhanh, và rất khó chịu khi mạng chậm.

**Cách 1 — hủy request cũ (tốt nhất):**

```javascript
let ac = null;

async function tim(q) {
  ac?.abort();
  ac = new AbortController();
  const res = await fetch(`/api/tim?q=${q}`, { signal: ac.signal });
  return res.json();
}
```

**Cách 2 — chỉ nhận kết quả mới nhất:**

```javascript
let idMoiNhat = 0;

async function tim(q) {
  const id = ++idMoiNhat;
  const data = await goiAPI(`/api/tim?q=${q}`);
  if (id !== idMoiNhat) return;      // đã có request mới hơn → bỏ kết quả này
  hienThi(data);
}
```

Kết hợp với `debounce` (file `05`) là bộ đôi chuẩn cho ô tìm kiếm: debounce giảm số request, abort xử lý những request vẫn lọt qua.

---

## 11. Viết lớp bọc API

Trong dự án thật, không ai gọi `fetch` trực tiếp rải rác khắp nơi. Người ta viết một lớp bọc:

```javascript
const GOC = "https://api.example.com";

async function goi(duongDan, { method = "GET", body, params, signal } = {}) {
  const url = new URL(GOC + duongDan);
  if (params) url.search = new URLSearchParams(params);

  const options = { method, signal, headers: {} };

  const token = layToken();
  if (token) options.headers["Authorization"] = `Bearer ${token}`;

  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body;              // không đặt Content-Type
    } else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error("Không kết nối được máy chủ");
  }

  if (!res.ok) {
    let chiTiet = "";
    try { chiTiet = (await res.json()).message ?? ""; } catch {}
    throw new LoiHTTP(res.status, chiTiet);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get:    (d, o)    => goi(d, { ...o, method: "GET" }),
  post:   (d, b, o) => goi(d, { ...o, method: "POST", body: b }),
  put:    (d, b, o) => goi(d, { ...o, method: "PUT", body: b }),
  patch:  (d, b, o) => goi(d, { ...o, method: "PATCH", body: b }),
  delete: (d, o)    => goi(d, { ...o, method: "DELETE" })
};
```

Dùng:

```javascript
const users = await api.get("/users", { params: { trang: 1 } });
const moi   = await api.post("/users", { ten: "An" });
```

Lợi ích: token, xử lý lỗi, header chỉ viết **một lần**. Đổi cách xác thực thì sửa một chỗ.

Chính mẫu này là thứ bạn sẽ gặp lại ở chặng 5 khi học TanStack Query.

---

## 12. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `catch` không chạy dù server trả 404 | `fetch` không reject với lỗi HTTP | Kiểm tra `res.ok` |
| `Unexpected token '<' in JSON` | Server trả HTML thay vì JSON | Kiểm tra `content-type`, đọc `res.text()` để xem |
| `body stream already read` | Đọc body hai lần | `res.clone()` |
| Server không nhận được dữ liệu POST | Quên `JSON.stringify` hoặc thiếu `Content-Type` | Thêm cả hai |
| Upload file thất bại | Tự đặt `Content-Type` cho `FormData` | Bỏ dòng đó đi |
| `Access-Control-Allow-Origin` trong Console | CORS | Sửa ở server hoặc dùng proxy |
| Postman chạy, trình duyệt lỗi | CORS chỉ do trình duyệt áp đặt | Như trên |
| Cookie không được gửi | Thiếu `credentials` | `credentials: "include"` |
| Kết quả tìm kiếm không khớp từ khóa | Race condition | `AbortController` hoặc kiểm tra id |
| `AbortError` hiện lên như lỗi thật | Không lọc riêng | Kiểm tra `e.name === "AbortError"` |
| `.json()` lỗi với response thành công | Status 204 không có body | Kiểm tra status trước |
| Gọi API mỗi lần gõ phím | Không debounce | `debounce` (file `05`) |
| Dữ liệu hiện rồi lại biến mất | Nhiều request ghi đè lẫn nhau | Quản lý state theo request mới nhất |

---

## 13. Tóm tắt cần thuộc

1. `fetch` **chỉ** reject khi lỗi mạng, CORS, hoặc abort — **không** với 4xx/5xx
2. **Luôn kiểm tra `res.ok`**
3. Body đọc được **một lần**; cần hai lần thì `res.clone()`
4. POST JSON cần cả `Content-Type` lẫn `JSON.stringify`
5. `FormData` thì **đừng** đặt `Content-Type`
6. `URLSearchParams` để dựng query string, đừng nối chuỗi tay
7. `AbortController` để hủy request và đặt thời hạn
8. `AbortError` không phải lỗi cần báo người dùng
9. `401` = chưa đăng nhập, `403` = không có quyền
10. `204` không có body — đừng gọi `.json()`
11. CORS do **trình duyệt** áp đặt, chỉ **server** sửa được
12. `POST` với JSON luôn kích hoạt preflight `OPTIONS`
13. Ô tìm kiếm cần cả debounce lẫn chống race condition
14. Viết một lớp bọc API thay vì rải `fetch` khắp nơi

---

## Bài tập

### Bài 1 — Khám phá HTTP

Tạo `bai-tap-12/kham-pha/`. Dùng JSONPlaceholder (`https://jsonplaceholder.typicode.com`) — API giả lập miễn phí, có CORS.

Mở tab Network của DevTools trong suốt bài này. Với mỗi câu, ghi vào `du-doan.md`: status code, các header đáng chú ý, và kích thước response.

1. `GET /posts/1` — in tiêu đề bài viết
2. `GET /posts/999999` — status là gì? `res.ok` là gì? `catch` có chạy không?
3. `GET /posts?userId=1&_limit=5` — dùng `URLSearchParams`
4. `POST /posts` với body JSON — status trả về là gì, và vì sao không phải 200?
5. `PUT /posts/1` và `PATCH /posts/1` — so sánh body gửi đi và response
6. `DELETE /posts/1`
7. Gọi tới một tên miền không tồn tại (`https://khong-ton-tai-abc123.com`) — lỗi gì, `catch` có chạy không?
8. Đọc `res.json()` hai lần — lỗi gì?
9. Với câu 4, mở tab Network và tìm request `OPTIONS`. Có không? Vì sao?

Câu 2 và 7 đặt cạnh nhau là điểm mấu chốt cả file — ghi rõ khác biệt.

### Bài 2 — Lớp bọc API

Viết module `api.js` theo mục 11, đầy đủ:

1. Base URL cấu hình được
2. Tự gắn token nếu có
3. Hỗ trợ `params`, `body` JSON, `FormData`
4. Lớp `LoiHTTP` với `status` và `chiTiet`
5. Phân biệt đủ ba loại lỗi (mạng, HTTP, phân tích)
6. Thời hạn mặc định 10 giây, ghi đè được
7. Tự thử lại với lỗi `5xx` và `429` — tối đa 3 lần, chờ tăng dần (dùng `thuLai` từ bài 4 file `11`)
8. **Không** thử lại với lỗi `4xx` khác — giải thích trong `du-doan.md` vì sao

Test đủ: thành công, 404, 500, timeout, abort, mất mạng (dùng DevTools → Network → Offline).

### Bài 3 — Chứng minh race condition

Tạo `bai-tap-12/race/`:

```html
<input id="o-tim" placeholder="Gõ nhanh...">
<p>Từ khóa hiện tại: <b id="tu-khoa"></b></p>
<p>Kết quả đang hiển thị cho: <b id="ket-qua-cho"></b></p>
<ul id="ds"></ul>
```

1. Viết hàm giả lập tìm kiếm với **độ trễ ngẫu nhiên 200–2000ms**, trả về kết quả kèm từ khóa gốc
2. Gắn vào sự kiện `input`, **không** debounce, **không** chống race
3. Gõ nhanh một chuỗi dài rồi quan sát. Ghi lại: có bao nhiêu lần "từ khóa hiện tại" khác "kết quả đang hiển thị cho"?
4. Thêm chống race bằng **cách 2** (kiểm tra id request). Đo lại.
5. Đổi sang **cách 1** (`AbortController`). Đo lại.
6. Thêm `debounce` 400ms. Đếm tổng số request của cả bốn phiên bản khi gõ cùng một chuỗi 10 ký tự.

Lập bảng bốn phiên bản × (số request, số lần hiển thị sai) trong `du-doan.md`.

### Bài 4 — App tra cứu Pokémon (bài chính)

Tạo `bai-tap-12/pokedex/`. Dùng PokéAPI (`https://pokeapi.co/api/v2/`) — miễn phí, không cần key, CORS mở sẵn.

Đây là sản phẩm lớn nhất chặng 2 tính đến giờ. Nó gom lại file `03`, `04`, `05`, `08`, `09`, `11`, `12`.

**Giao diện:**

```
┌────────────────────────────────────────┐
│ [🔍 Tìm Pokémon...          ]  [Loại ▾]│
├────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │ #001   │ │ #002   │ │ #003   │       │
│ │ [ảnh]  │ │ [ảnh]  │ │ [ảnh]  │       │
│ │Bulbasaur│ │Ivysaur │ │Venusaur│      │
│ │grass poison│      │ │        │       │
│ └────────┘ └────────┘ └────────┘       │
├────────────────────────────────────────┤
│         [Tải thêm]   Đã tải 20/1302    │
└────────────────────────────────────────┘
```

**Chức năng bắt buộc:**

1. **Danh sách** — tải 20 Pokémon đầu, hiện ảnh, tên, số, các loại
2. **Tải thêm** — nút phân trang, cập nhật bộ đếm
3. **Tìm kiếm** — gõ tên, debounce 400ms, chống race condition
4. **Lọc theo loại** — dropdown lấy từ `/type`, chọn loại thì hiện Pokémon thuộc loại đó
5. **Chi tiết** — bấm vào thẻ mở modal: ảnh lớn, chiều cao, cân nặng, chỉ số (HP, Attack...) dạng thanh, danh sách chiêu thức (5 cái đầu)
6. **Ba trạng thái rõ ràng:**
   - Đang tải — skeleton hoặc spinner, **không** dùng chữ "Loading..." trần
   - Lỗi — thông báo thân thiện + nút "Thử lại"
   - Rỗng — "Không tìm thấy Pokémon nào khớp..."
7. **Xử lý lỗi phân loại** — mất mạng, 404 (tên không tồn tại), timeout đều có thông báo **khác nhau**

**Ràng buộc kỹ thuật:**

8. Dùng lại `api.js` từ bài 2
9. Event delegation cho toàn bộ danh sách — **một** listener (file `09`)
10. **Không** `innerHTML` với dữ liệu từ API (file `08`)
11. Kiến trúc `trạng thái → render()`, hàm logic không chứa `document.`
12. Tải danh sách + danh sách loại **song song** bằng `Promise.all` (file `11`)
13. Chi tiết Pokémon được **cache** — mở lại thì không gọi API nữa (dùng `Map` + closure, file `05`)
14. Modal đóng được bằng: nút X, phím `Escape`, và click ra ngoài

**Yêu cầu nâng cao (chọn ít nhất hai):**

15. **Cuộn vô hạn** thay cho nút "Tải thêm" — dùng `IntersectionObserver`
16. **So sánh** — chọn 2 Pokémon, hiện biểu đồ chỉ số cạnh nhau
17. **Yêu thích** — đánh dấu, hiện tab riêng (chưa lưu được, file `13` sẽ thêm)
18. **Đồng bộ URL** — từ khóa và bộ lọc phản ánh trong query string, reload trang giữ nguyên trạng thái (dùng `URLSearchParams` + `history.pushState`)

**Tự kiểm tra** — ghi kết quả vào `du-doan.md`:

| Thử nghiệm | Kết quả mong đợi |
|---|---|
| DevTools → Network → Offline, rồi tải trang | Thông báo lỗi mạng rõ ràng + nút thử lại |
| Network → Slow 3G, gõ nhanh vào ô tìm | Kết quả luôn khớp từ khóa cuối cùng |
| Tìm `"abcxyz"` | Thông báo không tìm thấy, không phải màn hình trắng |
| Gõ 10 ký tự liên tục | Tối đa 2 request (nhờ debounce) |
| Mở cùng một Pokémon hai lần | Lần hai không có request mới trong tab Network |
| Đếm listener trên danh sách | Đúng 1, không tăng theo số thẻ |
| Tìm Pokémon tên `<script>` | Hiện đúng chuỗi, không có gì lạ xảy ra |

### Bài 5 — Giải thích bằng lời

Viết vào `du-doan.md`, mỗi câu 4–6 dòng:

1. Vì sao `fetch` không reject khi server trả 404? Hệ quả với cách viết code là gì?
2. CORS là gì? Vì sao nó tồn tại? Ai sửa được lỗi CORS? Trả lời như đang phỏng vấn.
3. Preflight là gì? Khi nào trình duyệt gửi nó?
4. Phân biệt 401 và 403. Cho tình huống thật cho mỗi cái.
5. Race condition trong ô tìm kiếm xảy ra thế nào? Kể hai cách chống, ưu nhược từng cách.
6. Kể ba loại lỗi khi gọi API và cách xử lý khác nhau của từng loại.

---

## Xong file này khi

- [ ] Bài 1 đủ 9 câu, giải thích được khác biệt giữa câu 2 và câu 7
- [ ] `api.js` xử lý đủ ba loại lỗi, có thử lại thông minh
- [ ] Bài 3 có bảng bốn phiên bản với số liệu thật
- [ ] Pokédex đủ 14 chức năng bắt buộc + ít nhất 2 nâng cao
- [ ] Pokédex vượt qua cả 7 thử nghiệm ở bảng trên
- [ ] Đã thử tắt mạng và xem app xử lý thế nào
- [ ] Trả lời được 6 câu ở bài 5 bằng lời, đặc biệt câu 2 về CORS

Pokédex là dự án nên đưa vào portfolio. Viết README tử tế, chụp màn hình, deploy lên GitHub Pages hoặc Netlify — bạn sẽ kể về nó trong phỏng vấn.

Còn **một file nữa** là hết chặng 2. File `13` sẽ thêm khả năng lưu trữ cho todo app và Pokédex, giới thiệu ES module, rồi khép lại bằng quiz app.

Xong thì gửi mình cả thư mục `pokedex/` + `du-doan.md`, kèm **"viết file 13-storage-va-module"**.