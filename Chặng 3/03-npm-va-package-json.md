# 03 — npm và `package.json`

> **Cần có trước:** xong khối A (`00` → `02`), Node.js đã cài.
> **Thời gian:** 3–4 giờ.
> **Vì sao quan trọng:** mọi dự án Front-End hiện đại — kể cả một trang tĩnh dùng Vite — đều có `package.json`. Không hiểu file này, bạn không biết dự án cần gì để chạy, không cài được đúng phiên bản thư viện, và không đọc được câu lệnh `npm run build` đang thực sự làm gì.

---

## 1. Vấn đề trước khi có npm

Suốt chặng 2, mọi thứ bạn dùng đều tự viết hoặc dán trực tiếp từ CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
```

Cách này có vấn đề thật: không kiểm soát được phiên bản chặt chẽ, tải thêm thư viện là thêm một dòng `<script>` nữa, thứ tự nhúng phải đúng tay, và không có cách nào để nói "dự án của tôi cần đúng những thư viện này, phiên bản này" cho người khác (hoặc chính bạn ở máy khác) biết.

**npm** (Node Package Manager) giải quyết việc đó: một kho hàng triệu gói thư viện JavaScript, cài về máy bằng một lệnh, và một file duy nhất mô tả dự án cần gì.

---

## 2. `package.json` là gì

Đây là file khai báo — "hộ chiếu" của một dự án Node/JavaScript. Nó nói:

- Dự án tên gì, phiên bản bao nhiêu, làm gì
- Cần những thư viện nào, phiên bản nào
- Chạy dự án bằng lệnh gì

```bash
npm init
```

Chạy lệnh này trong một thư mục sẽ hỏi bạn từng câu (tên, version, mô tả...) rồi tạo `package.json`. Muốn bỏ qua hết câu hỏi, dùng giá trị mặc định:

```bash
npm init -y
```

Kết quả là một file như thế này:

```json
{
  "name": "todo-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Đây chỉ là điểm khởi đầu. Mục sau sẽ đọc từng trường.

---

## 3. Đọc từng trường

```json
{
  "name": "todo-app",
  "version": "1.2.3",
  "private": true,
  "description": "Ứng dụng quản lý công việc",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint ."
  },
  "dependencies": {
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "eslint": "^9.9.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- **`name`** — tên gói. Nếu dự án của bạn chỉ chạy nội bộ (không đăng lên npm để người khác cài), tên chỉ mang tính mô tả
- **`version`** — theo chuẩn **semver**, mục 5 giải thích kỹ
- **`private: true`** — chặn npm lỡ tay đăng dự án lên registry công khai. **Nên đặt cho mọi dự án cá nhân/công ty**
- **`type: "module"`** — cho phép dùng `import`/`export` trong file `.js` chạy trên Node (mặc định Node hiểu `.js` là CommonJS, nhớ file `13` chặng 2)
- **`main`** — file khởi động, dùng khi gói này được người khác `import`
- **`scripts`** — các lệnh tắt, mục 6 nói kỹ
- **`dependencies`** — thư viện **cần khi ứng dụng chạy thật** (ví dụ `date-fns` để định dạng ngày)
- **`devDependencies`** — thư viện **chỉ cần khi phát triển**, không cần khi người dùng cuối chạy app (Vite, ESLint, Prettier)
- **`engines`** — gợi ý phiên bản Node tối thiểu

### `dependencies` vs `devDependencies` — phân biệt cho chuẩn

Câu hỏi để tự trả lời: *"Thư viện này có cần chạy trong trình duyệt của người dùng cuối không?"*

- Có → `dependencies` (React, một thư viện định dạng ngày, một thư viện UI)
- Không, chỉ mình bạn cần lúc code → `devDependencies` (Vite, ESLint, Prettier, TypeScript compiler)

```bash
npm install date-fns              # vào dependencies
npm install -D vite                # -D = --save-dev, vào devDependencies
npm install --save-dev eslint      # viết đầy đủ, tương đương -D
```

---

## 4. Cài đặt gói

```bash
npm install ten-goi              # cài bản mới nhất tương thích, thêm vào dependencies
npm install ten-goi@3.2.1         # cài đúng phiên bản này
npm install ten-goi@latest        # ép cài bản mới nhất tuyệt đối

npm install -D ten-goi             # thêm vào devDependencies

npm install                        # KHÔNG có tên gói — cài lại TẤT CẢ từ package.json
```

`npm install` không tham số là lệnh bạn gõ đầu tiên **mỗi khi** vừa `git clone` một dự án về. Nó đọc `package.json`, tải về đúng những gì được khai báo, và tạo ra thư mục `node_modules/`.

```bash
npm uninstall ten-goi              # gỡ, tự xóa khỏi package.json
npm update                          # cập nhật các gói lên bản mới nhất trong phạm vi cho phép
```

---

## 5. Semantic Versioning (semver)

Số phiên bản không phải số ngẫu nhiên — nó theo một quy ước có ý nghĩa, viết dạng `MAJOR.MINOR.PATCH`:

```
4  .  17  .  21
▲     ▲      ▲
MAJOR MINOR  PATCH
```

- **PATCH** (21 → 22) — sửa lỗi, **không** thay đổi cách dùng. An toàn để tự động cập nhật
- **MINOR** (17 → 18) — thêm tính năng mới, nhưng **vẫn tương thích ngược** — code cũ vẫn chạy được
- **MAJOR** (4 → 5) — có thay đổi **phá vỡ tương thích** (breaking change) — code cũ có thể không chạy được nữa

Đây là quy ước, không phải luật vật lý — phụ thuộc vào việc tác giả thư viện có tuân thủ nghiêm túc hay không. Đa số thư viện lớn (React, Vite, lodash...) tuân thủ chặt.

### Ký hiệu trong `package.json`

```json
"date-fns": "^3.6.0"
"lodash": "~4.17.21"
"react": "18.3.1"
"typescript": "*"
```

| Ký hiệu | Nghĩa | Cho phép cài |
|---|---|---|
| `^3.6.0` | Giữ nguyên MAJOR, cho phép MINOR và PATCH mới hơn | `3.9.0` được, `4.0.0` không |
| `~4.17.21` | Chỉ cho phép PATCH mới hơn | `4.17.30` được, `4.18.0` không |
| `18.3.1` | Đúng chính xác phiên bản này | Chỉ `18.3.1` |
| `*` hoặc bỏ trống | Bất kỳ phiên bản nào | Nguy hiểm, tránh dùng |

`^` (dấu mũ) là mặc định khi bạn chạy `npm install ten-goi` — và cũng là lựa chọn hợp lý cho hầu hết trường hợp: nhận sửa lỗi và tính năng mới tự động, tránh được thay đổi phá vỡ tương thích.

---

## 6. `package-lock.json`

```bash
npm install date-fns
```

Lệnh này sửa **hai** file: `package.json` (thêm `"date-fns": "^3.6.0"`) và `package-lock.json` — file bạn chưa từng tự mở, nhưng **tuyệt đối không được xóa hay sửa tay**.

### Vấn đề nó giải quyết

`^3.6.0` trong `package.json` không chỉ định một phiên bản duy nhất — nó là một **khoảng**. Nếu không có gì ghi lại chính xác phiên bản nào đã thực sự được cài, hai người trên hai máy chạy `npm install` vào hai thời điểm khác nhau có thể nhận được hai phiên bản `date-fns` khác nhau (cả hai đều hợp lệ với `^3.6.0`, nhưng có thể có khác biệt nhỏ gây bug khó tìm).

`package-lock.json` ghi lại **chính xác từng phiên bản** của mọi gói, kể cả các gói phụ thuộc gián tiếp (một gói bạn cài lại tự kéo theo hàng chục gói khác). Có file này, `npm install` trên mọi máy đều cho ra **kết quả giống hệt nhau**.

### Quy tắc cứng

- **Luôn commit `package-lock.json` vào Git.** Đây là ngoại lệ so với thói quen "chỉ commit code mình viết" — nó là một phần của trạng thái dự án
- **Không bao giờ sửa tay file này**
- **Không bao giờ xóa nó "cho gọn"**

```bash
npm ci
```

Lệnh này khác `npm install` ở một điểm quan trọng: nó **chỉ đọc** `package-lock.json` (bỏ qua `package.json`), xóa sạch `node_modules` cũ rồi cài lại đúng y hệt những gì đã khóa. Không tự động cập nhật gì cả — nếu `package.json` và `package-lock.json` không khớp nhau, nó báo lỗi ngay thay vì tự sửa.

`npm ci` (**c**lean **i**nstall) là lệnh được dùng trong môi trường CI/CD (build tự động, deploy) chính vì tính xác định tuyệt đối của nó — cùng một lock file luôn cho ra cùng một kết quả cài đặt.

---

## 7. `node_modules`

```bash
du -sh node_modules/    # xem dung lượng — thường vài trăm MB
find node_modules -maxdepth 1 | wc -l   # đếm số thư mục con — thường vài trăm
```

Thư mục này chứa **thực tế** toàn bộ mã nguồn của mọi thư viện đã cài, kể cả các phụ thuộc gián tiếp không do bạn chủ động cài. Với một dự án Vite + React đơn giản, con số đó dễ dàng vượt 300MB và hàng trăm thư mục con.

### Không bao giờ commit `node_modules`

```
# .gitignore
node_modules/
```

Ba lý do:

1. **Quá lớn** — kho Git sẽ phình lên khủng khiếp, `git clone` chậm không cần thiết
2. **Tái tạo được** — chỉ cần `package-lock.json` + `npm ci` là dựng lại y hệt
3. **Phụ thuộc hệ điều hành** — một số gói có phần biên dịch riêng cho Windows/macOS/Linux, commit sẵn của máy này có thể không chạy trên máy khác

Nếu bạn từng lỡ tay commit `node_modules` (rất dễ xảy ra nếu quên `.gitignore` trước commit đầu tiên), xử lý theo đúng cách đã học ở file `01` chặng 3: `git rm -r --cached node_modules`.

---

## 8. `npx` — chạy gói không cần cài vĩnh viễn

```bash
npx create-vite ten-du-an
```

`npx` tải gói về **tạm thời**, chạy nó một lần, rồi thôi — không thêm vào `package.json`, không nằm lại trong `node_modules` của dự án. Rất hữu ích cho các công cụ bạn chỉ chạy một lần để khởi tạo gì đó (như tạo dự án Vite mới, mà file `04` sẽ dùng).

Phân biệt với gói đã cài thật:

```bash
npm install -D eslint      # cài hẳn vào devDependencies
npx eslint .                 # chạy binary eslint đã cài trong node_modules/.bin
```

Khi gói **đã** có trong `devDependencies`, `npx ten-lenh` sẽ ưu tiên chạy bản đã cài cục bộ đó thay vì tải bản mới — nhanh hơn và đảm bảo đúng phiên bản dự án đang khóa.

---

## 9. `scripts` — lệnh tắt của dự án

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext js,jsx",
  "format": "prettier --write .",
  "test": "vitest"
}
```

Chạy bằng `npm run <tên>`:

```bash
npm run dev
npm run build
npm run lint
```

Hai lệnh có tên đặc biệt được rút gọn, không cần gõ `run`:

```bash
npm start      # thay cho npm run start
npm test       # thay cho npm run test
```

### Vì sao dùng `scripts` thay vì gõ lệnh thẳng

```bash
# Không dùng scripts — phải nhớ đường dẫn binary chính xác
./node_modules/.bin/vite build

# Dùng scripts — gõ ngắn, và ai cũng gõ y hệt
npm run build
```

`scripts` cũng là nơi **ghi lại quy trình** của dự án. Một người mới join dự án chỉ cần mở `package.json`, đọc phần `scripts`, là biết ngay: muốn chạy dev thì gõ gì, muốn build thì gõ gì, muốn kiểm tra code thì gõ gì — không cần hỏi ai.

### Nối nhiều lệnh

```json
"scripts": {
  "check": "npm run lint && npm run test",
  "prebuild": "npm run lint"
}
```

`&&` chạy lệnh sau chỉ khi lệnh trước **thành công**. Script có tiền tố `pre` (như `prebuild`) tự động chạy **trước** script chính cùng tên (`build`) — npm tự nhận diện quy ước đặt tên này.

---

## 10. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `npm ERR! code ENOENT... package.json` | Đứng sai thư mục, không có `package.json` ở đó | `cd` vào đúng thư mục dự án, hoặc `npm init -y` nếu là dự án mới |
| `command not found` sau khi `npm install -g` | Thư mục cài global chưa nằm trong `PATH` | Khởi động lại terminal; nếu vẫn lỗi, tra cách cấu hình `PATH` cho hệ điều hành của bạn |
| Clone dự án về, chạy không được | Chưa cài thư viện | `npm install` (hoặc `npm ci` nếu chỉ muốn khôi phục đúng lock file) |
| Hai máy chạy cùng dự án nhưng lỗi khác nhau | `package-lock.json` bị thiếu hoặc bị sửa tay | Không bao giờ sửa tay; dùng `npm ci` để đảm bảo nhất quán |
| `node_modules` nặng hàng trăm MB làm chậm `git status` | Lỡ chưa thêm vào `.gitignore` | Thêm vào `.gitignore`, `git rm -r --cached node_modules` nếu đã lỡ commit |
| Cài một gói, `package.json` không thay đổi gì | Gõ nhầm không có tên gói, hoặc dùng cờ sai | Kiểm tra lại chính tả lệnh |
| `npm install` treo rất lâu không phản hồi | Mạng chậm, hoặc registry bị chặn | Thử lại, kiểm tra kết nối mạng |
| Phiên bản cài được khác với đồng nghiệp dù cùng `package.json` | Không dùng `package-lock.json`, hoặc dùng `npm install` thay vì `npm ci` trong CI | Luôn commit lock file, dùng `npm ci` trong môi trường tự động |

---

## 11. Tóm tắt cần thuộc

1. `package.json` khai báo dự án cần gì và chạy bằng lệnh gì
2. `dependencies` = cần lúc chạy thật; `devDependencies` = chỉ cần lúc phát triển
3. Semver: `MAJOR.MINOR.PATCH` — major phá vỡ tương thích, minor thêm tính năng, patch sửa lỗi
4. `^` cho phép minor + patch mới hơn; `~` chỉ cho phép patch; số trần là khóa cứng
5. `package-lock.json` ghi lại chính xác phiên bản đã cài — **luôn commit, không bao giờ sửa tay**
6. `npm install` đọc cả hai file, có thể cập nhật; `npm ci` chỉ đọc lock file, không tự sửa gì
7. `node_modules` không bao giờ commit — tái tạo được bằng `npm ci`
8. `npx` chạy gói tạm thời, không cài lại vĩnh viễn
9. `scripts` trong `package.json` là quy trình chuẩn của dự án, ai đọc cũng hiểu ngay
10. `private: true` chặn npm lỡ đăng dự án cá nhân lên registry công khai

---

## Bài tập

### Bài 1 — Đọc một `package.json` thật (bài chính)

Vào GitHub, tìm một dự án React hoặc Vite phổ biến (ví dụ kho chính thức của Vite, hoặc một dự án open-source bất kỳ có README tiếng Anh rõ ràng), mở file `package.json` của nó.

Ghi vào `ghi-chu.md`:

1. Liệt kê 5 gói trong `dependencies` và 5 gói trong `devDependencies`. Với mỗi gói, đoán xem nó dùng để làm gì (tra Google nếu cần)
2. Tìm một gói dùng ký hiệu `^`, một gói dùng `~` (nếu có), giải thích khoảng phiên bản được phép của từng cái
3. Đọc phần `scripts` — liệt kê toàn bộ, đoán từng lệnh làm gì dựa trên tên và nội dung
4. Dự án này có `type: "module"` không? Có `private: true` không?
5. Nếu bạn `git clone` dự án này về máy, bạn cần gõ đúng những lệnh gì (theo thứ tự) để chạy được nó ở chế độ phát triển?

### Bài 2 — Tự dựng một dự án Node nhỏ

Tạo `Chặng 3/bai-tap-03/danh-gia-san-pham/`.

1. `npm init -y`, sau đó tự sửa tay `package.json`: đổi `name`, thêm `description`, thêm `"private": true`
2. Cài `date-fns` vào `dependencies`
3. Cài `eslint` vào `devDependencies`
4. Mở `package-lock.json`, tìm đúng mục ghi phiên bản chính xác của `date-fns` đã được cài — chép lại số phiên bản đó vào `ghi-chu.md`
5. Viết một file `main.js` nhỏ, dùng một hàm bất kỳ từ `date-fns` (ví dụ `format`) để in ra ngày hôm nay theo định dạng `dd/MM/yyyy`
6. Thêm vào `scripts`: `"start": "node main.js"`. Chạy bằng `npm start`

### Bài 3 — Semver trong thực hành

Trong dự án ở bài 2:

1. Mở `package.json`, đổi thủ công dòng khai báo `date-fns` từ `^3.x.x` sang `~3.x.x` (giữ đúng số đã cài)
2. Xóa `node_modules` và `package-lock.json`
3. `npm install` lại — mở `package-lock.json`, phiên bản `date-fns` có đổi không? Giải thích vì sao dựa trên mục 5
4. Đổi lại thành số cố định (không có `^` hay `~`), lặp lại bước 2–3, ghi nhận xét

### Bài 4 — `npm install` vs `npm ci`

1. Trong dự án ở bài 2, xóa `node_modules`
2. Chạy `npm install`, đo thời gian bằng cách quan sát đồng hồ hoặc `time npm install` nếu terminal của bạn hỗ trợ
3. Xóa `node_modules` lần nữa
4. Chạy `npm ci`, đo thời gian tương tự
5. Cố tình sửa tay một dòng trong `package.json` (ví dụ đổi số phiên bản của `date-fns` thành một số không tồn tại), **không** đụng vào `package-lock.json`
6. Chạy `npm ci` — quan sát điều gì xảy ra, ghi lại thông báo lỗi (hoặc thành công) vào `ghi-chu.md`
7. Sửa lại `package.json` cho đúng, xác nhận `npm ci` chạy được lại

### Bài 5 — Dọn dẹp một dự án lỡ commit `node_modules`

Mô phỏng lỗi thường gặp:

1. Tạo một dự án Git mới, `npm init -y`, cài một gói bất kỳ, **quên** tạo `.gitignore`
2. `git add .`, `git commit` — xác nhận bằng `git log --stat` rằng `node_modules` đã bị commit (số file thay đổi sẽ rất lớn)
3. Tạo `.gitignore` với `node_modules/`
4. `git rm -r --cached node_modules`
5. `git commit -m "Ngừng theo dõi node_modules"`
6. `git log --stat` lại — xác nhận commit mới chỉ xóa khỏi theo dõi, **không xóa file thật trên ổ đĩa** (mở thư mục kiểm tra `node_modules` vẫn còn)

### Bài 6 — Giải thích bằng lời

Viết vào `ghi-chu.md`, mỗi câu 3–5 dòng:

1. `dependencies` và `devDependencies` khác nhau chỗ nào? Cho ví dụ một gói mỗi loại từ dự án bạn đã làm.
2. Semver là gì? Giải thích ý nghĩa của từng số trong `4.17.21`.
3. `package-lock.json` giải quyết vấn đề gì? Điều gì xảy ra nếu hai người trên hai máy không có cùng lock file?
4. Vì sao `node_modules` không bao giờ nên commit lên Git?

---

## Xong file này khi

- [ ] Đọc và giải thích được đầy đủ một `package.json` thật của dự án open-source (bài 1)
- [ ] Tự dựng được một dự án Node từ `npm init` đến chạy được bằng `npm start`
- [ ] Quan sát và giải thích được khác biệt giữa `^`, `~`, và số cố định trong thực hành (bài 3)
- [ ] Thấy được `npm ci` từ chối chạy khi lock file không khớp `package.json` (bài 4)
- [ ] Tự gỡ được `node_modules` đã lỡ commit mà không xóa file thật trên đĩa (bài 5)
- [ ] Trả lời được 4 câu ở bài 6 bằng lời

File tiếp theo (`04-vite`) sẽ dùng chính hiểu biết này để dựng một dự án thật — bạn sẽ thấy `npm create vite@latest` tạo ra đúng những gì file này vừa giải thích, và hiểu vì sao mỗi dòng trong `package.json` được sinh ra lại có nghĩa như vậy.

Xong thì gửi mình `ghi-chu.md`, kèm **"viết file 04-vite"**.