# 02 — GitHub Workflow

> **Cần có trước:** xong `01` (Git cơ bản), tài khoản GitHub đã có, xác thực SSH hoặc token đã cấu hình (file `00` mục 6.5).
> **Thời gian:** 4–5 giờ.
> **Vì sao quan trọng:** đây là file khiến chặng 1 và chặng 2 của bạn — bốn sản phẩm, hàng chục file — trở thành thứ nhà tuyển dụng thực sự xem được. Và quy trình Pull Request ở đây chính là quy trình bạn sẽ làm mỗi ngày khi đi làm.

---

## 1. Remote — kho ở xa

Đến giờ, kho Git của bạn chỉ tồn tại trên máy. **Remote** là một bản sao của kho đó nằm ở nơi khác — thường là trên GitHub.

```bash
git remote -v                              # xem các remote đang có
git remote add origin git@github.com:ten-ban/ten-kho.git
```

`origin` là **tên quy ước** cho remote chính — không có gì đặc biệt về mặt kỹ thuật, bạn đặt tên khác cũng được, nhưng gần như cả ngành đều dùng `origin` nên cứ theo.

Địa chỉ remote có hai dạng:

```bash
# SSH — dùng khóa đã cấu hình ở file 00
git@github.com:ten-ban/ten-kho.git

# HTTPS — cần nhập username + Personal Access Token mỗi khi đẩy (trừ khi có credential helper)
https://github.com/ten-ban/ten-kho.git
```

Nếu bạn đã làm xong SSH key ở file `00`, dùng dạng SSH — không cần nhập gì mỗi lần đẩy code.

---

## 2. Hai cách tạo kho trên GitHub

### Cách 1 — Tạo trên GitHub trước, kéo về sau (dùng cho dự án mới)

1. Trên GitHub, bấm **New repository**
2. Đặt tên, chọn Public (để nhà tuyển dụng xem được), **không** tick "Add README" nếu bạn định đẩy code có sẵn lên
3. GitHub cho bạn một địa chỉ, ví dụ `git@github.com:tenban/ten-du-an.git`

```bash
git clone git@github.com:tenban/ten-du-an.git
cd ten-du-an
# ... code, add, commit ...
git push origin main
```

`git clone` tự động tạo remote `origin` cho bạn — không cần `git remote add` thủ công.

### Cách 2 — Đã có kho local, giờ mới đẩy lên (đúng tình huống của bạn với chặng 1, 2)

```bash
# Trong thư mục dự án đã có sẵn (đã git init, đã có commit)
git remote add origin git@github.com:tenban/ten-du-an.git
git branch -M main              # đảm bảo nhánh tên là main
git push -u origin main
```

Cờ `-u` (viết tắt của `--set-upstream`) chỉ cần dùng **một lần**. Nó thiết lập liên kết giữa nhánh `main` local và nhánh `main` trên `origin`, để những lần sau chỉ cần gõ `git push` trống không cũng biết đẩy đi đâu.

---

## 3. `push` và `pull`

```bash
git push                    # đẩy commit local lên remote (sau khi đã -u một lần)
git push origin main        # đẩy tường minh: remote nào, nhánh nào

git pull                    # kéo về + tự động merge
git fetch                   # chỉ kéo VỀ, không merge — an toàn hơn để xem trước
```

Khác biệt `pull` và `fetch` đáng nhớ kỹ:

```bash
git fetch origin            # tải commit mới nhất từ origin về, nhưng KHÔNG đụng vào working directory
git log origin/main         # giờ bạn xem được commit mới đó, so sánh trước khi merge
git merge origin/main       # merge thủ công khi đã sẵn sàng

# git pull = làm cả hai bước trên cùng lúc
git pull = git fetch + git merge
```

`git pull` tiện hơn nhưng gộp luôn merge — nếu có conflict, nó xảy ra ngay lập tức mà bạn chưa kịp xem trước điều gì sắp đến. `git fetch` cho bạn cơ hội xem trước rồi mới quyết định.

### Khi `push` bị từ chối

```bash
git push
# ! [rejected]  main -> main (fetch first)
# error: failed to push some refs
```

Nghĩa là remote có commit mà local bạn chưa có — thường vì bạn (hoặc đồng đội) đã đẩy từ máy khác, hoặc đã sửa trực tiếp trên GitHub.

```bash
git pull                    # kéo về và merge trước
# giải quyết conflict nếu có (file 01, mục 8)
git push                    # rồi mới đẩy lại
```

**Không bao giờ** dùng `git push --force` để "vượt qua" lỗi này trừ khi bạn hiểu chính xác mình đang ghi đè lịch sử của ai. Mục 9 nói kỹ hơn.

---

## 4. README — trang giới thiệu dự án

Đây là file **đầu tiên** người khác nhìn thấy khi mở kho của bạn trên GitHub. Với người tìm việc, nó quan trọng ngang giao diện sản phẩm.

Một README tối thiểu cho dự án cá nhân:

````markdown
# Todo App

Ứng dụng quản lý công việc, xây bằng JavaScript thuần — không dùng framework.

## Demo

🔗 [Xem trực tiếp](https://ten-ban.github.io/todo-app)

## Ảnh chụp màn hình

![Ảnh giao diện](./screenshot.png)

## Tính năng

- Thêm, sửa, xóa công việc
- Đánh dấu hoàn thành, lọc theo trạng thái
- Sửa tại chỗ (inline editing)
- Lưu trữ bằng `localStorage`, đồng bộ giữa các tab
- Kéo thả sắp xếp thứ tự

## Công nghệ

- JavaScript (ES2022+), không dùng thư viện ngoài
- Event delegation cho toàn bộ danh sách
- Kiến trúc `trạng thái → render()`

## Chạy ở máy local

```bash
git clone https://github.com/ten-ban/todo-app.git
cd todo-app
# mở index.html bằng Live Server
```

## Điều học được

Dự án này là nơi mình luyện event delegation và quản lý state
thủ công trước khi học React — kiến trúc `trạng thái → render()`
chính là mô hình được dùng lại ở đây.
````

Phần **"Điều học được"** không bắt buộc về mặt kỹ thuật, nhưng rất đáng có với portfolio người mới học — nó cho thấy bạn hiểu *vì sao* mình làm vậy, không chỉ *làm được*.

### Markdown cơ bản cho README

```markdown
# Tiêu đề lớn
## Tiêu đề vừa

**In đậm**  *In nghiêng*  `code`

- Gạch đầu dòng
1. Đánh số

[Chữ hiển thị](https://duong-dan.com)
![Mô tả ảnh](./duong-dan-anh.png)

```javascript
// Khối code có tô màu cú pháp
const x = 1;
```

> Trích dẫn
```

---

## 5. Đẩy chặng 1 và chặng 2 lên GitHub

Đây là phần việc chính của file này. Làm theo đúng thứ tự.

### Chọn cấu trúc kho

Có hai cách hợp lý, chọn một:

**Cách A — một kho cho mỗi dự án** (khuyến nghị cho các sản phẩm độc lập như Todo App, Pokédex):

```
github.com/ten-ban/todo-app
github.com/ten-ban/pokedex-js
github.com/ten-ban/quiz-app
```

Ưu điểm: mỗi dự án có link riêng, README riêng, dễ đưa vào CV như một dòng độc lập.

**Cách B — một kho tổng cho quá trình học** (phù hợp cho bài tập nhỏ, file lý thuyết):

```
github.com/ten-ban/learning-frontend
├── chang-1-html-css/
├── chang-2-javascript/
│   ├── bai-tap-01/
│   ├── ...
│   └── du-an-todo-app/
```

**Thực tế nên làm cả hai:** kho tổng `learning-frontend` chứa toàn bộ bài tập nhỏ (chứng minh quá trình học đều đặn), và các kho riêng cho 3–4 dự án lớn nhất — Todo App, Pokédex, Quiz App — vì đó là thứ bạn sẽ dán link trong CV và kể trong phỏng vấn.

### Các bước thực hiện

```bash
# 1. Kho tổng cho quá trình học
cd LearningFE
git init
```

Tạo `.gitignore` ở gốc:

```
node_modules/
.env
.DS_Store
*.log
```

```bash
git add .
git commit -m "Khởi tạo kho học Front-End, thêm chặng 1 và chặng 2"
```

Trên GitHub, tạo kho `learning-frontend`, **không** tick thêm README (vì bạn đã commit sẵn nội dung).

```bash
git remote add origin git@github.com:ten-ban/learning-frontend.git
git branch -M main
git push -u origin main
```

Vào lại trang GitHub, refresh — toàn bộ file phải xuất hiện.

### Tách các dự án lớn thành kho riêng

Với Todo App (hoặc Pokédex, Quiz App):

```bash
cd Chặng-2/bai-tap-09/todo/
git init
git add .
git commit -m "Todo app hoàn chỉnh: CRUD, lọc, sửa tại chỗ, lưu trữ"
```

Tạo kho mới trên GitHub tên `todo-app`, rồi:

```bash
git remote add origin git@github.com:ten-ban/todo-app.git
git branch -M main
git push -u origin main
```

Viết README theo mẫu ở mục 4, commit, push lại:

```bash
git add README.md
git commit -m "Thêm README"
git push
```

---

## 6. Deploy — cho dự án có link chạy thật

Một link demo chạy được có sức thuyết phục hơn nhiều so với chỉ có code. Hai lựa chọn miễn phí, đơn giản nhất cho dự án tĩnh (HTML/CSS/JS thuần, chưa cần build):

### GitHub Pages

```
Kho trên GitHub → Settings → Pages → Source: chọn nhánh main, thư mục / (root)
```

Sau vài phút, trang chạy tại `https://ten-ban.github.io/ten-kho/`.

Lưu ý: nếu dự án của bạn có nhiều thư mục con và `index.html` không nằm ở gốc, bạn cần chọn đúng thư mục trong phần cấu hình Pages, hoặc di chuyển `index.html` ra gốc kho.

### Netlify (kéo thả, không cần cấu hình gì)

Vào `netlify.com`, đăng nhập bằng GitHub, chọn "Import from Git", trỏ tới kho của bạn. Netlify tự build và deploy, mỗi lần bạn `push` lên GitHub thì trang tự động cập nhật theo — gọi là **continuous deployment**, đáng biết tên vì chặng sau bạn sẽ gặp lại (Vercel cho React cũng hoạt động y hệt).

Với Todo App, Pokédex, Quiz App, cả hai lựa chọn đều dùng tốt. Chọn Netlify nếu muốn có trải nghiệm gần với quy trình CI/CD thật hơn một chút.

---

## 7. Pull Request — quy trình cộng tác thật

Đến giờ bạn vẫn làm việc một mình, `push` thẳng vào `main`. Trong công việc thật, gần như không ai làm vậy — người ta dùng **Pull Request** (viết tắt PR, GitLab gọi là Merge Request).

### PR là gì

Một PR là lời đề nghị: *"Tôi đã làm xong trên nhánh này, xem qua rồi gộp vào `main` giúp tôi."* Nó không phải một lệnh Git — nó là một tính năng của GitHub, xây trên khái niệm nhánh mà bạn đã học ở file `01`.

### Luồng làm việc chuẩn

```bash
# 1. Luôn bắt đầu từ main mới nhất
git switch main
git pull

# 2. Tạo nhánh cho việc sắp làm
git switch -c feature/them-bo-loc-theo-gia

# 3. Code, commit nhiều lần nhỏ
git add .
git commit -m "feat: thêm dropdown chọn khoảng giá"
git commit -m "feat: kết nối bộ lọc với danh sách sản phẩm"

# 4. Đẩy nhánh lên GitHub (chưa đụng vào main)
git push -u origin feature/them-bo-loc-theo-gia
```

### Mở Pull Request

Sau khi `push`, GitHub thường tự hiện một nút "Compare & pull request" ngay trên trang kho. Bấm vào, hoặc vào tab **Pull requests** → **New pull request**.

Điền:

- **Tiêu đề** — ngắn gọn, mô tả cái gì thay đổi: `Thêm bộ lọc theo khoảng giá`
- **Mô tả** — cái gì thay đổi, vì sao, cách test. Với dự án nhóm thật, mô tả tốt giúp người review đỡ mất công đọc từng dòng code để đoán ý định

```markdown
## Thay đổi

Thêm dropdown lọc sản phẩm theo khoảng giá (dưới 500k, 500k-1tr, trên 1tr).

## Cách test

1. Vào trang danh sách sản phẩm
2. Chọn một khoảng giá bất kỳ
3. Danh sách phải lọc lại ngay, không cần reload

## Ảnh chụp

![before-after](link-anh.png)
```

### Review và merge

Với dự án cá nhân, không ai review PR của bạn — nhưng **vẫn nên tự đọc lại diff** trước khi merge, y hệt như đang review code của người khác. Đây là thói quen tốt cho khi đi làm thật, nơi bạn sẽ nhận review từ đồng nghiệp và phải tự review code của người khác.

Trên trang PR, GitHub hiện đủ:

- Tab **Files changed** — xem từng dòng thêm/bớt
- Nút **Merge pull request** — gộp vào `main`
- Sau khi merge, GitHub gợi ý **Delete branch** — nên xóa, nhánh đã hoàn thành nhiệm vụ

```bash
# Sau khi merge trên GitHub, đồng bộ lại máy mình
git switch main
git pull
git branch -d feature/them-bo-loc-theo-gia    # xóa nhánh local đã merge
```

### Ba kiểu merge trên GitHub

Khi bấm nút Merge, GitHub cho chọn:

- **Create a merge commit** — giữ nguyên lịch sử từng commit nhỏ, tạo thêm một merge commit (giống `git merge` thường ở file `01`)
- **Squash and merge** — gộp **toàn bộ** commit của nhánh thành **một** commit duy nhất trước khi merge. Lịch sử `main` gọn hơn, thường được ưa chuộng cho các PR nhỏ
- **Rebase and merge** — viết lại từng commit của nhánh, đặt nối tiếp sau `main`, không tạo merge commit

Với dự án cá nhân, "Squash and merge" thường là lựa chọn dễ hiểu nhất — lịch sử `main` sẽ gọn gàng, mỗi commit tương ứng đúng một tính năng hoàn chỉnh.

---

## 8. Issues — theo dõi việc cần làm

Tab **Issues** trên GitHub là nơi ghi lại lỗi cần sửa hoặc tính năng cần thêm, kể cả với dự án một người.

```markdown
Tiêu đề: Bộ đếm hiển thị sai khi xóa hết công việc

Mô tả:
Khi xóa công việc cuối cùng, chữ "0 việc chưa xong" không cập nhật,
vẫn hiện số cũ.

Cách tái hiện:
1. Xóa hết tất cả công việc trong danh sách
2. Quan sát phần đếm ở cuối trang

Kết quả mong đợi: hiện "0 việc chưa xong"
Kết quả thực tế: vẫn hiện số của lần đếm trước
```

Liên kết một PR với issue bằng từ khóa đặc biệt trong mô tả PR:

```markdown
Sửa lỗi được mô tả ở #12

Fixes #12
```

`Fixes #12` (hoặc `Closes #12`) khiến GitHub **tự động đóng** issue số 12 ngay khi PR được merge. Đây là thói quen chuẩn trong công việc thật — quản lý được việc nào đã xong, việc nào chưa, việc nào thuộc PR nào.

Với dự án cá nhân, dùng Issues để tự lên danh sách việc cần làm cho từng sản phẩm cũng là một cách luyện thói quen tốt trước khi vào công ty.

---

## 9. `git push --force` — con dao hai lưỡi

```bash
git push --force
```

Ghi đè lịch sử trên remote bằng lịch sử local của bạn, **bất kể** ai đã đẩy gì lên đó sau bạn. Nếu đồng đội đã kéo bản cũ về và tiếp tục làm việc, `--force` của bạn sẽ khiến công việc của họ bị lệch khỏi lịch sử chung — hậu quả nghiêm trọng.

Chỉ dùng khi:

- Bạn vừa `amend` hoặc `rebase` một nhánh **của riêng mình**, chưa ai khác đụng vào
- Bạn chắc chắn không ai khác đang làm việc trên nhánh đó

```bash
git push --force-with-lease
```

An toàn hơn `--force` trần: nó kiểm tra xem remote có commit mới mà bạn **chưa biết** không — nếu có, nó từ chối đẩy thay vì ghi đè mù quáng. **Nếu bắt buộc phải force, luôn dùng `--force-with-lease` thay vì `--force`.**

**Không bao giờ force lên `main` của dự án có người khác cùng làm**, trừ khi được đồng ý rõ ràng trước.

---

## 10. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `Permission denied (publickey)` | SSH key chưa thêm vào GitHub, hoặc thêm sai | Kiểm tra lại `ssh -T git@github.com`, xem file `00` mục 6.5 |
| `remote origin already exists` | Đã có remote `origin` từ trước | `git remote remove origin` rồi thêm lại, hoặc `git remote set-url origin <url>` |
| `push` bị từ chối vì "fetch first" | Remote có commit bạn chưa có | `git pull` trước, giải quyết conflict nếu có, rồi `push` lại |
| Đẩy nhầm cả `node_modules` lên GitHub | Quên `.gitignore` trước khi commit đầu tiên | `git rm -r --cached node_modules`, thêm vào `.gitignore`, commit lại |
| README không hiện ảnh | Sai đường dẫn tương đối, hoặc ảnh chưa được `add`/`commit` | Kiểm tra đường dẫn bằng `./ten-anh.png`, đảm bảo đã commit file ảnh |
| GitHub Pages hiện trang trắng | `index.html` không nằm ở thư mục gốc được cấu hình | Kiểm tra lại phần chọn thư mục trong Settings → Pages |
| PR hiện "This branch has conflicts" | `main` đã thay đổi kể từ khi tách nhánh | Kéo `main` mới nhất về nhánh của bạn, giải quyết conflict (file `01`, mục 8), đẩy lại |
| Đẩy nhầm secret lên GitHub | Không có `.gitignore` cho `.env` | Đổi ngay secret đó, xem file `01` mục 5 |

---

## 11. Tóm tắt cần thuộc

1. Git chạy trên máy; GitHub là nơi lưu trữ từ xa cho kho Git
2. `origin` là tên quy ước cho remote chính, không bắt buộc về mặt kỹ thuật
3. `-u` chỉ cần dùng một lần để thiết lập liên kết nhánh local ↔ remote
4. `git fetch` chỉ tải về; `git pull` = `fetch` + `merge` ngay lập tức
5. README là thứ đầu tiên người khác thấy — viết nghiêm túc cho các dự án lớn
6. Một kho tổng cho quá trình học + các kho riêng cho dự án lớn là cách tổ chức hợp lý
7. GitHub Pages và Netlify đều miễn phí và đủ cho dự án tĩnh
8. Pull Request là quy trình chuẩn để đưa thay đổi vào `main`, kể cả khi làm một mình
9. Luôn tạo nhánh mới cho mỗi tính năng, không code thẳng trên `main`
10. `Fixes #12` trong mô tả PR tự đóng issue tương ứng khi merge
11. `--force-with-lease` an toàn hơn `--force`; tránh force lên nhánh có người khác dùng chung

---

## Bài tập

### Bài 1 — Đẩy chặng 1 và chặng 2 lên GitHub (bài chính, bắt buộc)

Làm đúng theo mục 5:

1. Tạo kho `learning-frontend`, đẩy toàn bộ chặng 1 và chặng 2 lên
2. Viết README cho kho tổng — mô tả ngắn về hành trình học, liệt kê các chặng, link tới các kho dự án riêng (sẽ điền ở bài 2)
3. Vào GitHub, kiểm tra: toàn bộ file có hiện đúng không, cấu trúc thư mục có giữ nguyên không
4. Xác nhận `.gitignore` hoạt động — không có `node_modules` hay file rác nào lọt lên

### Bài 2 — Tách 3 dự án lớn thành kho riêng

Với Todo App, Pokédex, Quiz App (từ chặng 2):

1. Mỗi cái tách thành một kho riêng theo mục 5
2. Viết README đầy đủ theo mẫu ở mục 4 — bắt buộc có: mô tả, tính năng, công nghệ dùng, cách chạy local
3. Deploy cả ba lên GitHub Pages hoặc Netlify (mục 6)
4. Xác nhận cả ba link demo đều chạy được — tự mở bằng trình duyệt ẩn danh để chắc chắn không phải do cache máy bạn
5. Quay lại README của kho `learning-frontend`, điền link tới cả ba kho và cả ba demo

### Bài 3 — Thực hành Pull Request

Trong kho `todo-app` (hoặc bất kỳ kho nào bạn chọn):

1. Từ `main`, tạo nhánh `feature/them-dem-ky-tu` — thêm tính năng nhỏ: đếm số ký tự đã gõ trong ô nhập việc mới, giới hạn 100 ký tự
2. Commit từng bước nhỏ, đẩy nhánh lên GitHub
3. Mở Pull Request, viết mô tả đầy đủ theo mẫu ở mục 7 (thay đổi, cách test, ảnh chụp nếu có)
4. Tự đọc lại tab "Files changed" như đang review code người khác — tìm ít nhất một chỗ bạn muốn sửa lại, sửa ngay trên nhánh đó, commit thêm, đẩy lại — quan sát PR tự cập nhật
5. Chọn "Squash and merge", xóa nhánh sau khi merge
6. Ở máy local: `git switch main`, `git pull`, `git branch -d feature/them-dem-ky-tu`
7. `git log --oneline` trên `main` — commit vừa vào trông thế nào so với các commit nhỏ bạn đã tạo trên nhánh? Ghi nhận xét vào `nhat-ky.md`

### Bài 4 — Issues

Trong một kho bất kỳ:

1. Tạo 3 issue: một lỗi có thật (nếu tìm được) hoặc giả định, một tính năng muốn thêm, một việc dọn dẹp code
2. Với issue tính năng, tạo nhánh, làm, mở PR có `Fixes #<số>` trong mô tả
3. Merge PR đó — quan sát issue có tự đóng không
4. Ghi vào `nhat-ky.md`: issue có tự đóng đúng như mong đợi không

### Bài 5 — Xử lý xung đột khi push (mô phỏng làm việc nhóm)

Bài này mô phỏng tình huống hai người cùng sửa một kho — bạn sẽ tự đóng cả hai vai.

1. Clone kho `todo-app` của bạn ra **một thư mục khác** trên máy, giả vờ đây là "máy của đồng nghiệp":
```bash
git clone git@github.com:ten-ban/todo-app.git todo-app-may-2
```
2. Từ thư mục gốc (`todo-app`), sửa một dòng trong README, commit, push lên `main`
3. Từ `todo-app-may-2` (chưa biết về thay đổi vừa rồi), cũng sửa **cùng dòng đó** trong README theo cách khác, commit
4. Thử `git push` từ `todo-app-may-2` — quan sát nó bị từ chối, ghi lại thông báo lỗi
5. `git pull` — xảy ra conflict (đúng như dự đoán, vì sửa cùng dòng)
6. Giải quyết conflict, commit, `push` lại thành công
7. Ghi vào `nhat-ky.md`: các bước bạn đã làm, đối chiếu với mục 3 file `01`

### Bài 6 — Giải thích bằng lời

Viết vào `nhat-ky.md`, mỗi câu 3–5 dòng:

1. `git fetch` và `git pull` khác nhau chỗ nào? Khi nào bạn muốn dùng `fetch` thay vì `pull`?
2. Pull Request là gì, và tại sao nên dùng nó ngay cả khi làm dự án một mình?
3. Ba kiểu merge trên GitHub (merge commit, squash, rebase) khác nhau ra sao? Bạn thích kiểu nào cho dự án cá nhân, vì sao?
4. `--force` nguy hiểm ở điểm gì? `--force-with-lease` giải quyết vấn đề đó thế nào?

---

## Xong file này khi

- [ ] Kho `learning-frontend` đã lên GitHub, chứa đủ chặng 1 và chặng 2
- [ ] Ba dự án lớn (Todo App, Pokédex, Quiz App) có kho riêng, README đầy đủ, link demo chạy được thật
- [ ] Đã tự mở ít nhất một Pull Request hoàn chỉnh: tạo nhánh → code → PR → tự review → squash merge → dọn nhánh
- [ ] Đã tự tạo và tự giải quyết một xung đột `push` bị từ chối (bài 5)
- [ ] Đã dùng Issues kết hợp `Fixes #` với một PR thật, thấy issue tự đóng
- [ ] Trả lời được 4 câu ở bài 6 bằng lời

Đây là file khép lại khối A. Từ giờ, bốn sản phẩm của bạn không còn chỉ nằm trên ổ cứng — chúng có link, có README, có lịch sử commit mà bất kỳ nhà tuyển dụng nào cũng xem được ngay. Đây chính là phần "kinh nghiệm thực chiến" đầu tiên trong CV của một người mới.

Khối B (`03` → `05`) sẽ chuyển sang công cụ: npm, Vite, ESLint, Prettier — những thứ bạn cần để bắt đầu viết code theo đúng cách một dự án thật được tổ chức.

Xong thì gửi mình các link GitHub và link demo, kèm **"viết file 03-npm-va-package-json"**.