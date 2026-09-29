# 00 — Bắt đầu Chặng 3: Git, Tooling & TypeScript

> **Cần có trước:** xong toàn bộ chặng 2 (file `00` → `13`), có bốn sản phẩm chạy được.
> **Thời gian:** 2–3 giờ (đọc + làm bài tập).
> **File này chưa dạy Git.** Nó dựng môi trường và giải thích bạn sắp đi đâu. Đọc hết rồi làm bài tập, xong mới sang `01`.

---

## 1. Bạn đang ở đâu

Hết chặng 2, bạn viết được JavaScript. Cụ thể:

- Nắm được closure, `this`, prototype — ba khái niệm khó nhất của ngôn ngữ
- Điều khiển DOM, xử lý sự kiện đúng cách
- Gọi API, xử lý bất đồng bộ, hiểu event loop
- Có bốn sản phẩm chạy được

Đó là năng lực **viết code**. Nhưng đi làm thì viết code chỉ là một phần.

Thử hình dung ngày đầu tiên ở công ty. Người ta sẽ nói với bạn đại loại:

> *"Em clone repo về, checkout nhánh develop rồi tạo feature branch mà làm. Xong mở PR, tag anh review. Nhớ chạy lint trước khi commit. À dự án dùng TypeScript với Vite nhé."*

Không hiểu câu đó thì mọi kỹ năng JavaScript của bạn cũng không dùng được — vì bạn chưa vào được đến chỗ viết code.

**Chặng 3 biến bạn từ "người viết được JavaScript" thành "người làm việc được trong một nhóm".**

---

## 2. Ba vấn đề chặng này giải quyết

### Vấn đề 1 — Code của bạn chỉ tồn tại trên máy bạn

Suốt chặng 2, mỗi bài tập là một thư mục trên ổ cứng. Ổ hỏng là mất hết. Muốn quay lại phiên bản hôm qua thì không có cách nào. Muốn cho người khác xem thì nén lại gửi qua Zalo.

Và quan trọng hơn: **nhà tuyển dụng không có gì để xem.** Một ứng viên có GitHub với lịch sử commit đều đặn suốt 6 tháng khác hẳn một ứng viên nói "em có làm dự án ở nhà".

→ **Git và GitHub** (file `01`, `02`)

### Vấn đề 2 — Bạn đang làm thủ công việc mà máy làm được

Chặng 2 bạn mở file bằng Live Server, sửa code, F5. Đó là cách làm của năm 2010.

Dự án thật có: máy chủ phát triển chỉ nạp lại đúng phần vừa đổi, công cụ gộp hàng trăm file thành một bản tối ưu, công cụ bắt lỗi ngay khi bạn vừa gõ sai, công cụ định dạng code cho cả nhóm giống nhau.

Không dùng chúng thì bạn vừa chậm hơn, vừa không làm việc chung được với ai.

→ **npm, Vite, ESLint, Prettier** (file `03`, `04`, `05`)

### Vấn đề 3 — JavaScript không nói cho bạn biết bạn sai

```javascript
function tinhTong(donHang) {
  return donHang.sanPham.reduce((t, sp) => t + sp.gia, 0);
}

tinhTong({ items: [] });         // TypeError lúc chạy — sai tên trường
tinhTong(null);                   // TypeError lúc chạy
tinhTong({ sanPham: "abc" });     // TypeError lúc chạy
```

Cả ba lỗi chỉ lộ ra **khi người dùng bấm vào**. Trong dự án vài chục nghìn dòng, đó là ác mộng.

Nhớ lại bug bạn từng gặp ở chặng 2: quên `return` trong `map` (file `04`), `dataset.id` là chuỗi nên cộng ra `"421"` (file `08`), nhận về `Promise` mà tưởng là dữ liệu (file `11`). TypeScript bắt được cả ba **ngay lúc bạn gõ**.

→ **TypeScript** (file `06`, `07`)

---

## 3. Vì sao TypeScript không còn là lựa chọn

Nói thẳng về thực tế tuyển dụng: mở bất kỳ trang tuyển dụng nào, lọc "Frontend Junior", đọc phần yêu cầu. TypeScript xuất hiện trong phần lớn tin đăng, và trong hầu hết tin của công ty trả lương tốt.

Bạn **không cần giỏi** TypeScript để phỏng vấn Junior. Bạn cần:

- Đọc được code có kiểu mà không bối rối
- Gắn kiểu cho props, state, response API
- Hiểu `interface`, `type`, generic ở mức cơ bản
- Biết vì sao `any` là thứ nên tránh

Chặng 3 cho bạn đúng mức đó. Không hơn — hơn nữa ở giai đoạn này là lãng phí.

---

## 4. Bản đồ chặng 3

8 file, ba khối, khoảng 3 tuần.

**Khối A — Git và cộng tác** (`01`, `02`)
Nền tảng tuyệt đối. File `02` kết thúc bằng việc toàn bộ chặng 1 và 2 của bạn nằm trên GitHub.

**Khối B — Công cụ** (`03`, `04`, `05`)
Nhiều thao tác, ít lý thuyết. Mục tiêu: dựng được dự án từ con số không và hiểu từng file cấu hình mình tạo ra.

**Khối C — TypeScript** (`06`, `07`)
Kiểu cơ bản, `interface` vs `type`, generic, narrowing.

| File | Nội dung | Bài tập cuối file |
|---|---|---|
| `00` | File này — định hướng, cài đặt | Dựng môi trường, commit đầu tiên |
| `01` | Git cơ bản | Tự tạo conflict rồi tự giải |
| `02` | GitHub workflow | Đẩy chặng 1 + 2 lên GitHub |
| `03` | npm và `package.json` | Đọc hiểu một `package.json` thật |
| `04` | Vite | Dựng dự án từ đầu |
| `05` | ESLint + Prettier | Setup và sửa hết warning |
| `06` | TypeScript cơ bản | Gắn kiểu cho code chặng 2 |
| `07` | TypeScript generic | Viết `fetch` có kiểu generic |

**Dự án cuối chặng:** Pokédex viết lại bằng Vite + TypeScript, có lint, đẩy lên GitHub và deploy.

---

## 5. Chặng này học khác chặng 2

Chặng 2 là chặng **hiểu**. Bạn phải nắm cơ chế bên dưới — closure hoạt động ra sao, event loop xếp hàng thế nào.

Chặng 3 phần lớn là chặng **làm quen**. Git không khó hiểu; nó cần gõ đủ nhiều lần để thành phản xạ. Vite không có lý thuyết sâu; nó cần bạn dựng vài dự án.

Hệ quả:

- **Gõ lệnh, đừng đọc lệnh.** Đọc 50 lệnh Git không bằng gõ 10 lệnh trong tình huống thật.
- **Cố tình làm hỏng rồi sửa.** Cách nhanh nhất để hết sợ Git là tự tạo conflict, tự commit nhầm, rồi tự gỡ. Bài tập chặng này sẽ bắt bạn làm vậy nhiều lần.
- **Đừng học thuộc cú pháp.** Không ai nhớ hết cờ của Git. Nhớ *khái niệm* (nhánh là gì, staging area là gì), cú pháp thì tra.

Ngoại lệ là TypeScript — file `06` và `07` quay lại kiểu học của chặng 2, cần hiểu chứ không chỉ gõ theo.

---

## 6. Chuẩn bị môi trường

### 6.1. Terminal

Từ chặng này bạn sẽ sống nhiều trong terminal. Những lệnh tối thiểu:

```bash
pwd                 # đang ở thư mục nào
ls                  # liệt kê file (Windows CMD: dir)
cd ten-thu-muc      # vào thư mục
cd ..               # lùi một cấp
cd ~                # về thư mục home
mkdir ten-moi       # tạo thư mục
clear               # xóa màn hình
```

Hai mẹo tiết kiệm thời gian nhất: gõ vài ký tự đầu rồi bấm **Tab** để tự hoàn thành tên; bấm **mũi tên lên** để lấy lại lệnh vừa gõ.

**Trên Windows:** dùng **Git Bash** (cài kèm Git ở bước sau) hoặc **PowerShell**, đừng dùng CMD cũ. Git Bash cho cú pháp giống macOS/Linux — tức là giống mọi tài liệu bạn sẽ đọc.

**Trên macOS/Linux:** Terminal có sẵn là đủ.

Bạn cũng dùng được terminal tích hợp trong VS Code (`Ctrl + ~`). Tiện hơn vì nó tự mở đúng thư mục dự án.

### 6.2. Cài Git

Tải ở `git-scm.com`. Trên Windows quá trình cài hỏi nhiều bước — giữ nguyên mặc định là được, chỉ cần đảm bảo có cài **Git Bash**.

```bash
git --version
```

### 6.3. Cấu hình Git lần đầu

Bắt buộc, không làm thì Git từ chối commit:

```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@cua-ban.com"
```

Dùng **đúng email bạn sẽ đăng ký GitHub**. Nếu không, commit của bạn sẽ không được tính vào biểu đồ đóng góp trên hồ sơ — chi tiết nhỏ nhưng nhà tuyển dụng có nhìn.

Vài cấu hình nên đặt luôn:

```bash
# Nhánh mặc định là main thay vì master
git config --global init.defaultBranch main

# Dùng VS Code làm trình soạn thảo của Git
git config --global core.editor "code --wait"

# Xử lý ký tự xuống dòng khác nhau giữa các hệ điều hành
git config --global core.autocrlf true      # Windows
git config --global core.autocrlf input     # macOS/Linux
```

Dòng cuối đáng giải thích: Windows kết thúc dòng bằng `CRLF`, macOS/Linux dùng `LF`. Không cấu hình thì Git sẽ báo "toàn bộ file đã thay đổi" khi bạn chỉ sửa một dòng — một trong những chuyện gây bối rối nhất cho người mới.

Xem lại toàn bộ:

```bash
git config --list
```

### 6.4. Tài khoản GitHub

Đăng ký ở `github.com` bằng đúng email vừa cấu hình.

Về tên tài khoản: **chọn cẩn thận**. Nó sẽ nằm trong CV và trong mọi link dự án của bạn. `nguyenvanan-dev` thì được; `cutephomaique2k4` thì không.

Sau khi đăng ký, điền hồ sơ: ảnh đại diện, tên thật, một dòng mô tả ngắn. Hồ sơ trống trơn tạo ấn tượng không tốt.

### 6.5. Xác thực với GitHub

GitHub không cho đẩy code bằng mật khẩu nữa. Hai cách:

**Cách 1 — SSH key (khuyến nghị).** Cấu hình một lần, sau đó không phải nhập gì.

```bash
ssh-keygen -t ed25519 -C "email@cua-ban.com"
# Bấm Enter ba lần để dùng mặc định

cat ~/.ssh/id_ed25519.pub
```

Copy toàn bộ dòng in ra → GitHub → Settings → SSH and GPG keys → New SSH key → dán vào.

Kiểm tra:

```bash
ssh -T git@github.com
```

Thấy dòng chào có tên tài khoản của bạn là thành công.

**Cách 2 — Personal Access Token.** Settings → Developer settings → Personal access tokens. Dùng token thay mật khẩu khi Git hỏi. Đơn giản hơn nhưng phải lưu token cẩn thận.

File `02` nói kỹ hơn về hai cách này.

### 6.6. Node.js

Bạn đã cài từ chặng 2. Kiểm tra lại:

```bash
node -v
npm -v
```

Chưa có hoặc quá cũ thì tải bản **LTS** ở `nodejs.org` — bản hỗ trợ dài hạn, ổn định. Đừng lấy bản "Current".

Sau này nếu cần nhiều phiên bản Node cho các dự án khác nhau, có `nvm` (macOS/Linux) hoặc `fnm`/`nvm-windows`. Chưa cần bây giờ.

### 6.7. VS Code

Cài thêm nếu chưa có:

| Extension | Dùng để |
|---|---|
| **ESLint** | Hiện lỗi code ngay khi gõ (file `05`) |
| **Prettier** | Tự định dạng code (file `05`) |
| **GitLens** | Xem ai sửa dòng nào, lúc nào |
| **Error Lens** | Hiện lỗi ngay trên dòng thay vì phải rê chuột |

`Error Lens` không bắt buộc nhưng rất đáng cài — nó làm việc học TypeScript dễ hơn nhiều vì bạn thấy lỗi ngay tại chỗ.

---

## 7. Cấu trúc thư mục

Chặng 3 khác hai chặng trước: mỗi bài tập là một **dự án riêng**, có `package.json` và kho Git riêng.

```
LearningFE/
├── Chặng 1/
├── Chặng 2/
└── Chặng 3/
    ├── 00-bat-dau-chang-3.md      ← file này
    ├── 01-git-co-ban.md
    ├── ...
    ├── bai-tap-00/
    │   ├── ghi-chu.md
    │   └── thu-nghiem-git/         ← kho Git đầu tiên
    ├── bai-tap-01/
    └── du-an-pokedex-ts/           ← dự án cuối chặng
```

---

## 8. Ba điều gây bối rối ngay từ đầu

**"Tôi gõ lệnh Git mà nó mở ra màn hình chữ lạ hoắc, thoát không được."**

Đó là Vim. Bấm `Esc`, gõ `:q!` rồi Enter. Cấu hình `core.editor` ở mục 6.3 sẽ ngăn chuyện này lặp lại.

**"Terminal báo `command not found` dù tôi vừa cài xong."**

Đóng hẳn terminal rồi mở lại. Phần mềm mới cài cần terminal khởi động lại mới nhận.

**"Git báo tôi sửa toàn bộ file trong khi tôi chỉ sửa một dòng."**

Vấn đề ký tự xuống dòng — xem `core.autocrlf` ở mục 6.3.

---

## Bài tập

Làm trong `Chặng 3/bai-tap-00/`.

### Bài 1 — Dựng môi trường

Hoàn thành toàn bộ mục 6. Chạy các lệnh sau, chụp màn hình kết quả, ghi vào `ghi-chu.md`:

```bash
git --version
node -v
npm -v
git config --list
ssh -T git@github.com
```

### Bài 2 — Làm quen terminal

Chỉ dùng terminal, **không** đụng vào giao diện đồ họa:

1. Di chuyển vào thư mục `LearningFE`
2. Tạo thư mục `Chặng 3/bai-tap-00/thu-nghiem-git`
3. Vào thư mục vừa tạo
4. Tạo file `README.md` bằng lệnh (`echo` hoặc `touch`)
5. Liệt kê nội dung thư mục
6. In ra đường dẫn hiện tại
7. Quay về `LearningFE` bằng **một** lệnh duy nhất

Ghi **tất cả** lệnh đã dùng vào `ghi-chu.md`. Lệnh nào phải tra Google thì đánh dấu lại — đó là lệnh cần luyện thêm.

### Bài 3 — Kho Git đầu tiên (bài chính)

Trong `thu-nghiem-git/`:

```bash
git init
```

Mở thư mục bằng VS Code, bật hiện file ẩn, tìm thư mục `.git`. Ghi vào `ghi-chu.md`: bên trong nó có những gì (chỉ cần liệt kê tên, chưa cần hiểu).

Sau đó làm theo đúng thứ tự, **ghi lại output từng bước**:

1. Viết vài dòng vào `README.md`
2. `git status` — đọc kỹ những gì nó nói, chép lại nguyên văn
3. `git add README.md`
4. `git status` lần nữa — **có gì khác so với lần trước?** Chép lại cả hai và so sánh
5. `git commit -m "Commit đầu tiên"`
6. `git log`

Câu 4 là câu quan trọng nhất. Khác biệt giữa hai lần `git status` chính là khái niệm **staging area** — thứ file `01` sẽ giải thích. Bạn chưa cần hiểu, chỉ cần **quan sát và ghi lại**.

### Bài 4 — Thí nghiệm nhỏ

Vẫn trong kho vừa tạo:

1. Sửa `README.md`, thêm một dòng
2. `git status` — Git nói gì?
3. Tạo thêm file `test.txt` với nội dung bất kỳ
4. `git status` — hai file này được Git đối xử **khác nhau** thế nào? Ghi rõ
5. `git diff` — nó hiện gì?
6. `git add .` rồi `git commit -m "Commit thứ hai"`
7. `git log --oneline` — bây giờ có mấy commit?

Câu 4 cũng đáng suy nghĩ: một file Git đã biết, một file Git chưa biết. Cách nó mô tả hai trường hợp khác nhau ra sao?

### Bài 5 — Chuẩn bị hồ sơ GitHub

1. Hoàn thiện hồ sơ: ảnh, tên, mô tả ngắn
2. Tạo repository mới tên `hello-github`, để public, tick chọn thêm file README
3. Ghi đường dẫn hồ sơ GitHub của bạn vào `ghi-chu.md`

Chưa cần đẩy code lên — đó là nội dung file `02`.

---

## Xong file này khi

- [ ] Năm lệnh ở bài 1 đều chạy được, `ssh -T git@github.com` chào đúng tên bạn
- [ ] Làm được bài 2 hoàn toàn bằng terminal
- [ ] Kho Git đầu tiên có ít nhất 2 commit
- [ ] Ghi lại được khác biệt giữa `git status` trước và sau khi `git add`
- [ ] Hồ sơ GitHub đã có ảnh và mô tả
- [ ] Thoát được khỏi Vim mà không hoảng

Xong thì nhắn mình **"viết file 01-git-co-ban"**, kèm `ghi-chu.md` để mình xem bạn quan sát được gì ở bài 3 và 4.