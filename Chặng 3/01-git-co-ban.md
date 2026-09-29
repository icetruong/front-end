# 01 — Git cơ bản

> **Cần có trước:** xong `00` — Git đã cài, tài khoản GitHub đã có, kho Git đầu tiên đã tạo.
> **Thời gian:** 4–5 giờ.
> **Vì sao quan trọng:** Git là công cụ bạn dùng mỗi ngày trong suốt sự nghiệp. Không hiểu commit, branch, merge thì không làm việc nhóm được — và phỏng vấn Junior gần như luôn hỏi ít nhất một câu về Git.

---

## 1. Git giải quyết vấn đề gì

Không có Git, bạn quản lý phiên bản kiểu này:

```
du-an/
du-an-cu/
du-an-final/
du-an-final-thuc-su/
du-an-final-v2-sua-loi/
```

Vấn đề: không biết bản nào có gì khác bản nào, không hợp nhất được hai người cùng sửa, không quay lại được một thay đổi cụ thể mà giữ nguyên các thay đổi khác.

**Git là hệ thống quản lý phiên bản.** Nó ghi lại lịch sử thay đổi của một thư mục theo thời gian, cho phép quay lại bất kỳ điểm nào, và cho phép nhiều người cùng sửa mà không đè lên nhau.

Điểm quan trọng cần gỡ bỏ trước: **Git khác GitHub.**

- **Git** — công cụ chạy trên máy bạn, không cần mạng, không liên quan gì đến GitHub
- **GitHub** — một dịch vụ lưu trữ kho Git trên mạng, để chia sẻ và cộng tác

Bạn dùng Git được mà không cần GitHub. GitHub chỉ là một trong nhiều nơi *lưu trữ* kho Git (GitLab, Bitbucket là các lựa chọn khác). File này nói về Git; file `02` mới nói về GitHub.

---

## 2. Ba khu vực

Đây là mô hình quan trọng nhất để hiểu Git. Mọi lệnh sau này đều là di chuyển dữ liệu giữa ba khu vực này.

```
┌─────────────────┐   git add    ┌─────────────────┐   git commit   ┌─────────────────┐
│  Working         │ ───────────► │  Staging Area    │ ─────────────► │  Repository      │
│  Directory       │              │  (Index)         │                │  (.git)          │
│                   │ ◄─────────── │                   │                │                   │
│  file bạn đang    │  git restore │  vùng chờ, chuẩn  │                │  lịch sử commit,  │
│  sửa trên ổ đĩa   │  --staged    │  bị cho commit    │                │  đã lưu vĩnh viễn │
└─────────────────┘              └─────────────────┘                └─────────────────┘
```

- **Working Directory** — thư mục thật trên máy bạn, nơi bạn mở file và gõ code
- **Staging Area** (còn gọi là Index) — vùng đệm, nơi bạn *chọn* những thay đổi nào sẽ đi vào commit tiếp theo
- **Repository** — nơi lịch sử được lưu vĩnh viễn, nằm trong thư mục ẩn `.git`

Nhớ lại bài 3 file `00`: bạn đã quan sát `git status` khác nhau trước và sau `git add`. Đó chính là sự khác biệt giữa Working Directory và Staging Area.

### Vì sao cần staging area

Đây là câu hỏi hợp lý: sao không sửa file rồi commit thẳng luôn?

```bash
# Bạn vừa sửa 3 file: sua-bug-dang-nhap.js, thu-nghiem.js, ghi-chu-ca-nhan.md
# Chỉ muốn commit MỘT thay đổi liên quan đến bug đăng nhập

git add sua-bug-dang-nhap.js       # chỉ chọn file này vào staging
git commit -m "Sửa lỗi đăng nhập"  # commit chỉ chứa thay đổi đó

# hai file kia vẫn còn dở dang trong working directory, chưa bị commit
```

Staging area cho bạn quyền **chọn lọc** từng phần thay đổi để đưa vào một commit, thay vì bắt buộc commit mọi thứ đang sửa dở cùng lúc.

---

## 3. Vòng đời của một file

```bash
git status
```

Đây là lệnh bạn sẽ gõ nhiều nhất trong đời làm Git. Nó cho biết file nào đang ở khu vực nào.

Một file đi qua bốn trạng thái:

```
Untracked → Staged → Committed (tracked, không đổi) → Modified → Staged → ...
```

- **Untracked** — Git thấy file này tồn tại nhưng chưa từng theo dõi nó
- **Staged** — đã `git add`, đang chờ commit
- **Committed / unmodified** — đã lưu vào lịch sử, không có thay đổi gì kể từ lần commit cuối
- **Modified** — đã từng commit, nhưng vừa bị sửa, chưa `add` lại

```bash
git add ten-file.js          # đưa một file vào staging
git add .                    # đưa TẤT CẢ thay đổi vào staging
git add thu-muc/             # đưa cả một thư mục

git restore --staged ten-file.js   # gỡ khỏi staging, KHÔNG mất thay đổi trong file
git restore ten-file.js            # hủy thay đổi trong file, VỀ ĐÚNG bản đã commit — MẤT DỮ LIỆU
```

Hai lệnh `restore` ở trên trông giống nhau nhưng hậu quả khác hẳn nhau. Đọc kỹ dòng ghi chú.

---

## 4. Commit

```bash
git commit -m "Thêm chức năng tìm kiếm"
```

Một commit là một **ảnh chụp** (snapshot) trạng thái toàn bộ dự án tại thời điểm đó, kèm theo:

- Một mã hash duy nhất (ví dụ `a3f5c9d...`)
- Tác giả và thời gian
- Một thông điệp mô tả
- Con trỏ đến commit cha (trừ commit đầu tiên)

```bash
git log
```

Hiện lịch sử commit. Vài biến thể hữu ích:

```bash
git log --oneline           # mỗi commit một dòng, gọn
git log --oneline --graph   # có vẽ nhánh dạng cây
git log -5                  # chỉ 5 commit gần nhất
git log --author="An"       # lọc theo tác giả
```

### Viết message thế nào cho tử tế

```bash
# Kém
git commit -m "sửa"
git commit -m "fix bug"
git commit -m "asdasd"
git commit -m "cập nhật code"

# Tốt
git commit -m "Sửa lỗi validate email khi để trống"
git commit -m "Thêm debounce cho ô tìm kiếm"
git commit -m "Xóa console.log thừa trong api.js"
```

Quy ước phổ biến trong ngành, gọi là **Conventional Commits**:

```bash
git commit -m "feat: thêm tính năng lọc theo danh mục"
git commit -m "fix: sửa lỗi tính tổng giỏ hàng sai"
git commit -m "docs: cập nhật README"
git commit -m "refactor: tách hàm tính giá thành module riêng"
git commit -m "style: định dạng lại code theo Prettier"
git commit -m "test: thêm test cho hàm debounce"
```

Bạn chưa bắt buộc phải theo chuẩn này ngay, nhưng nên biết — nhiều công ty yêu cầu, và một số công cụ (như tự sinh changelog) dựa vào nó.

**Quy tắc chung:** message mô tả *cái gì thay đổi và vì sao*, viết ở dạng mệnh lệnh ("Thêm", "Sửa", "Xóa" — không phải "Đã thêm", "Added"), đủ ngắn để đọc trong `git log --oneline`.

### Commit nhỏ, commit thường xuyên

```bash
# XẤU — một commit khổng lồ cuối ngày
git add .
git commit -m "Làm xong todo app"

# TỐT — từng bước một
git commit -m "Thêm giao diện danh sách việc"
git commit -m "Thêm chức năng thêm việc mới"
git commit -m "Thêm chức năng đánh dấu hoàn thành"
git commit -m "Thêm chức năng xóa việc"
git commit -m "Thêm lưu trữ localStorage"
```

Commit nhỏ giúp: dễ tìm ra commit nào gây lỗi (`git bisect`, xem mục 11), dễ hoàn tác một phần cụ thể, dễ review khi làm nhóm, lịch sử kể được câu chuyện quá trình bạn xây dựng tính năng.

### Sửa commit cuối cùng

```bash
git commit --amend -m "Message mới thay cho message cũ"

# Quên add một file, muốn gộp vào commit vừa rồi thay vì tạo commit mới
git add file-quen-add.js
git commit --amend --no-edit    # giữ nguyên message cũ
```

**Chỉ dùng `--amend` khi commit đó CHƯA được đẩy lên GitHub.** Amend tạo ra một commit mới với hash khác, thay thế commit cũ — nếu người khác đã kéo commit cũ về, lịch sử hai bên sẽ lệch nhau.

---

## 5. `.gitignore`

Không phải mọi file trong thư mục dự án đều nên được Git theo dõi.

```
node_modules/       ← hàng nghìn file, tự cài lại được bằng npm install
dist/                ← file build ra, tự sinh lại được
.env                 ← chứa secret, KHÔNG BAO GIỜ commit
*.log
.DS_Store            ← rác của macOS
.vscode/              ← cấu hình cá nhân của IDE (tùy chọn ignore)
```

Tạo file `.gitignore` ở thư mục gốc dự án:

```
# .gitignore
node_modules/
dist/
.env
*.log
.DS_Store
```

Git sẽ không hiện những file này trong `git status`, và `git add .` sẽ tự động bỏ qua chúng.

### File đã lỡ commit trước khi thêm vào `.gitignore`

```bash
# Thêm vào .gitignore rồi vẫn thấy file cũ được theo dõi
git rm --cached ten-file.js       # gỡ khỏi Git nhưng GIỮ file trên đĩa
git commit -m "Ngừng theo dõi ten-file.js"
```

`.gitignore` chỉ ngăn file **mới** bị thêm vào — không tự động gỡ file đã được theo dõi từ trước.

### Không bao giờ commit secret

```bash
# .env — chứa API key, mật khẩu database
API_KEY=sk-abc123...
DATABASE_URL=postgres://...
```

Nếu bạn lỡ commit một file chứa secret rồi đẩy lên GitHub công khai, coi như secret đó đã lộ — dù bạn xóa file ở commit sau, nó **vẫn nằm trong lịch sử** và ai cũng xem lại được. Cách xử lý đúng khi lỡ tay: đổi ngay secret đó ở nơi cấp phát (coi như nó đã bị lộ vĩnh viễn), rồi mới lo dọn lịch sử Git sau.

---

## 6. Nhánh (Branch)

### Nhánh là gì

Một nhánh là một **con trỏ di động** trỏ tới một commit. Khi bạn commit, nhánh hiện tại tự động dịch chuyển theo để trỏ tới commit mới.

```
main:     A ─── B ─── C
                       ▲
                     HEAD (đang đứng ở đây)
```

Tạo nhánh mới không sao chép file — nó chỉ tạo thêm một con trỏ khác trỏ vào cùng một commit hiện tại:

```
main:              A ─── B ─── C
                                ▲
tinh-nang-moi:                 C   ← nhánh mới, cùng trỏ vào C
```

Sau khi bạn commit tiếp trên nhánh `tinh-nang-moi`, hai nhánh tách ra:

```
main:              A ─── B ─── C
                                 \
tinh-nang-moi:                   D ─── E
```

**`HEAD`** là con trỏ đặc biệt cho biết bạn *đang đứng ở đâu* — thường trỏ vào tên nhánh hiện tại.

### Lệnh cơ bản

```bash
git branch                       # liệt kê nhánh, dấu * là nhánh hiện tại
git branch ten-nhanh-moi         # tạo nhánh mới, KHÔNG chuyển sang
git checkout ten-nhanh-moi       # chuyển sang nhánh đó
git checkout -b ten-nhanh-moi    # tạo VÀ chuyển sang, một lệnh

git switch ten-nhanh             # cách hiện đại thay cho checkout khi CHUYỂN nhánh
git switch -c ten-nhanh-moi      # cách hiện đại thay cho checkout -b

git branch -d ten-nhanh          # xóa nhánh đã merge xong
git branch -D ten-nhanh          # ép xóa dù CHƯA merge — cẩn thận, mất dữ liệu
```

`git switch` là lệnh mới hơn, dành riêng cho việc chuyển nhánh — dùng nó cho rõ ràng. `git checkout` cũ hơn và làm nhiều việc khác nhau cùng lúc (chuyển nhánh, khôi phục file...), dễ gây nhầm lẫn hơn nhưng bạn vẫn sẽ thấy nó trong code cũ và một số lệnh nâng cao.

### Vì sao phải dùng nhánh

```bash
# KHÔNG làm thế này
# sửa trực tiếp trên main, code dở dang, người khác kéo về là dính lỗi

# Làm thế này
git switch -c tinh-nang-tim-kiem
# ... code, commit, code, commit ...
# xong xuôi, chạy được, mới merge lại vào main
```

Nhánh `main` (hoặc trong một số dự án cũ gọi là `master`) nên **luôn chạy được**. Mọi tính năng mới, mọi thử nghiệm, mọi sửa lỗi đều làm trên nhánh riêng, xong mới gộp lại.

Quy ước đặt tên nhánh phổ biến:

```
feature/tim-kiem-san-pham
fix/loi-tinh-tong-gio-hang
refactor/tach-module-api
docs/cap-nhat-readme
```

---

## 7. Merge

```bash
git switch main
git merge tinh-nang-tim-kiem
```

Merge gộp lịch sử của một nhánh vào nhánh hiện tại. Có hai kiểu:

### Fast-forward merge

Xảy ra khi `main` **không có commit mới nào** kể từ khi bạn tách nhánh — Git chỉ đơn giản đẩy con trỏ `main` tới thẳng commit cuối của nhánh kia.

```
Trước:
main:      A ─── B
                   \
feature:            C ─── D

Sau khi merge (fast-forward):
main:      A ─── B ─── C ─── D
                              ▲
                       feature, main (cùng trỏ vào đây)
```

### Merge commit (three-way merge)

Xảy ra khi cả hai nhánh đều có commit mới riêng kể từ điểm tách. Git tạo ra một **commit mới**, có **hai commit cha**, để gộp cả hai lịch sử:

```
Trước:
main:      A ─── B ─── E
                   \
feature:            C ─── D

Sau khi merge:
main:      A ─── B ─── E ─────── M   ← commit merge, có 2 cha
                   \             /
feature:            C ───────── D
```

Bạn không cần tự chọn kiểu merge nào — Git tự quyết định dựa trên tình trạng lịch sử. Nhưng hiểu sự khác biệt giúp bạn đọc được biểu đồ `git log --oneline --graph`.

---

## 8. Conflict — điều mọi người sợ nhất

Conflict xảy ra khi Git **không tự quyết định được** cách gộp hai thay đổi, thường vì cả hai nhánh cùng sửa **một dòng** ở cùng một file.

```bash
git merge tinh-nang-x
# Auto-merging gia.js
# CONFLICT (content): Merge conflict in gia.js
# Automatic merge failed; fix conflicts and then commit the result.
```

Mở file, bạn sẽ thấy Git chèn thêm các dấu đánh dấu:

```javascript
function tinhGia(sp) {
<<<<<<< HEAD
  return sp.gia * sp.soLuong * 1.1;   // có thuế
=======
  return sp.gia * sp.soLuong - sp.giamGia;   // có giảm giá
>>>>>>> tinh-nang-x
}
```

- `<<<<<<< HEAD` đến `=======` — phần thuộc về nhánh bạn đang đứng
- `=======` đến `>>>>>>> tinh-nang-x` — phần thuộc về nhánh đang merge vào

Bạn phải **tự tay** quyết định giữ gì, xóa gì, và xóa hết các dấu `<<<<<<<`, `=======`, `>>>>>>>`. Ví dụ nếu cần cả hai:

```javascript
function tinhGia(sp) {
  const giaSauGiam = sp.gia * sp.soLuong - sp.giamGia;
  return giaSauGiam * 1.1;   // gộp cả thuế và giảm giá
}
```

Sau khi sửa xong:

```bash
git add gia.js
git commit          # Git tự điền message "Merge branch..." — cứ để nguyên, hoặc sửa lại
```

### Hủy merge giữa chừng nếu quá rối

```bash
git merge --abort
```

Đưa mọi thứ về đúng trạng thái trước khi bắt đầu merge — như chưa từng có chuyện gì xảy ra. Dùng khi bạn thấy conflict quá phức tạp và muốn bình tĩnh lại, hoặc hỏi ý ai đó trước khi quyết định.

### Cách tránh conflict xảy ra nhiều

- Merge `main` vào nhánh của bạn **thường xuyên**, đừng để nhánh sống quá lâu trước khi gộp lại
- Chia nhỏ công việc theo file/module khác nhau khi làm nhóm
- Trao đổi trước khi hai người cùng sửa một file lớn

Conflict là chuyện bình thường, xảy ra hàng ngày trong công việc thật. Không có gì đáng sợ khi bạn hiểu cơ chế — nó chỉ là Git đang hỏi bạn "tôi không biết chọn cái nào, bạn quyết định giúp tôi".

---

## 9. Quay lại quá khứ

Git có nhiều lệnh để "hoàn tác", mỗi lệnh có tác dụng khác nhau — đây là chỗ dễ nhầm lẫn nhất với người mới.

### `git restore` — hoàn tác thay đổi CHƯA commit

```bash
git restore ten-file.js              # bỏ thay đổi trong working directory
git restore --staged ten-file.js     # đưa file ra khỏi staging (giữ thay đổi)
```

### `git revert` — hoàn tác một commit ĐÃ commit, một cách AN TOÀN

```bash
git revert a3f5c9d
```

Tạo ra một commit **mới**, có nội dung ngược lại với commit `a3f5c9d`. Lịch sử **không bị xóa** — ai cũng vẫn thấy commit cũ, chỉ là có thêm một commit mới đảo ngược nó.

```
Trước:  A ─── B ─── C (commit gây lỗi)
Sau:    A ─── B ─── C ─── D (D đảo ngược C)
```

**Đây là cách an toàn để hoàn tác khi commit đã được đẩy lên GitHub và người khác có thể đã kéo về.**

### `git reset` — di chuyển nhánh về một commit trong quá khứ, XÓA lịch sử phía sau

```bash
git reset --soft a3f5c9d    # về commit đó, giữ nguyên thay đổi ở staging
git reset --mixed a3f5c9d   # về commit đó, giữ thay đổi nhưng BỎ khỏi staging (mặc định)
git reset --hard a3f5c9d    # về commit đó, XÓA SẠCH mọi thay đổi sau đó — MẤT DỮ LIỆU
```

```
Trước:  A ─── B ─── C ─── D
                           ▲
                         main

Sau reset --hard B:
        A ─── B
               ▲
             main
        (C và D không còn nằm trên nhánh main nữa)
```

**Quy tắc sống còn: KHÔNG BAO GIỜ `reset` một commit đã đẩy lên GitHub và có người khác đã kéo về.** Vì lịch sử của bạn và của họ sẽ lệch nhau, gây rối loạn nghiêm trọng khi đẩy/kéo sau đó.

### Bảng quyết định nhanh

| Tình huống | Dùng lệnh |
|---|---|
| Vừa sửa file, chưa `add`, muốn bỏ thay đổi | `git restore` |
| Đã `add`, muốn bỏ khỏi staging | `git restore --staged` |
| Commit đã đẩy lên GitHub, muốn hoàn tác | `git revert` |
| Commit chỉ ở máy mình, chưa đẩy đi đâu, muốn xóa hẳn | `git reset --hard` (cẩn thận) |
| Chỉ muốn sửa message của commit cuối, chưa đẩy đi | `git commit --amend` |

---

## 10. `stash` — cất tạm

Bạn đang sửa dở một tính năng, chưa muốn commit vì chưa xong, nhưng cần chuyển gấp sang nhánh khác để sửa một lỗi khẩn cấp.

```bash
git stash                    # cất toàn bộ thay đổi chưa commit vào "ngăn kéo"
git switch fix/loi-khan-cap
# ... sửa lỗi, commit ...
git switch tinh-nang-dang-lam
git stash pop                 # lấy lại thay đổi đã cất, xóa khỏi ngăn kéo
```

```bash
git stash list                # xem có bao nhiêu thứ đang cất
git stash apply                # lấy lại nhưng KHÔNG xóa khỏi ngăn kéo
git stash drop                 # xóa một stash mà không áp dụng
git stash save "Đang làm dở tính năng lọc"   # cất kèm ghi chú
```

`stash` giống một staging area tạm thời nằm ngoài lịch sử commit — không làm bẩn `git log`, không cần nghĩ ra message commit dở dang kiểu "wip: chưa xong".

---

## 11. Vài lệnh hữu ích khác

```bash
git diff                       # so sánh working directory với lần commit gần nhất
git diff --staged              # so sánh staging area với lần commit gần nhất
git diff nhanh-a nhanh-b        # so sánh hai nhánh

git show a3f5c9d                # xem chi tiết một commit cụ thể

git blame ten-file.js           # từng dòng của file do ai, commit nào sửa lần cuối

git bisect start                # tìm commit nào gây ra lỗi bằng cách chia đôi khoảng tìm kiếm
```

`git blame` rất hữu ích khi đọc code người khác — "dòng này ai viết, lúc nào, trong commit nào" trả lời được ngay. `git bisect` đáng biết tên dù chưa cần dùng ngay — nó tự động hóa việc "chia đôi" khoảng commit để tìm ra chính xác commit nào gây lỗi trong hàng trăm commit.

---

## 12. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| `git commit` mở ra Vim rồi không biết làm gì | Chưa cấu hình `core.editor`, hoặc quên `-m` | `Esc` rồi `:wq`, hoặc luôn dùng `-m "..."` |
| Commit rồi mới nhớ thiếu một file | Quên `git add` file đó trước khi commit | `git add file` rồi `git commit --amend --no-edit` (nếu **chưa** đẩy lên) |
| `git status` báo "not a git repository" | Đang không đứng trong thư mục có `.git` | `cd` vào đúng thư mục, hoặc `git init` nếu chưa khởi tạo |
| Xóa nhầm file quan trọng | Không có bản sao lưu | `git restore ten-file` nếu đã từng commit trước đó |
| `reset --hard` rồi hối hận | Đã xóa mất commit | `git reflog` — Git vẫn giữ commit "mồ côi" một thời gian, tìm lại được bằng hash |
| Merge conflict không biết bắt đầu từ đâu | Chưa hiểu ba dấu `<<<`, `===`, `>>>` | Đọc lại mục 8, hoặc `git merge --abort` để bình tĩnh lại |
| Nhầm nhánh, code sai chỗ | Không kiểm tra `git branch` trước khi bắt đầu sửa | Tập thói quen `git status` trước mỗi lần bắt đầu làm việc |
| `.env` lỡ commit lên GitHub | Không có `.gitignore` từ đầu | Đổi ngay secret, xem mục 5 |

---

## 13. Tóm tắt cần thuộc

1. Git ≠ GitHub. Git chạy trên máy, GitHub là nơi lưu trữ từ xa
2. Ba khu vực: Working Directory → (add) → Staging Area → (commit) → Repository
3. `git restore --staged` gỡ khỏi staging; `git restore` (không có `--staged`) **xóa thay đổi**, cẩn thận
4. Commit nhỏ, thường xuyên, message rõ ràng ở dạng mệnh lệnh
5. `.gitignore` chặn file mới; file đã lỡ track thì cần `git rm --cached`
6. Không bao giờ commit secret — nó tồn tại vĩnh viễn trong lịch sử
7. Nhánh là con trỏ di động, tạo nhánh không sao chép file
8. `main` luôn nên chạy được; làm việc trên nhánh riêng
9. Conflict là bình thường — Git chỉ đang hỏi bạn cách gộp hai thay đổi mâu thuẫn
10. `git revert` an toàn cho commit đã public; `git reset --hard` chỉ dùng khi commit còn ở riêng máy bạn
11. `git stash` để cất tạm thay đổi dở dang khi cần đổi việc gấp

---

## Bài tập

Tạo dự án mới `Chặng 3/bai-tap-01/quan-ly-git/`, `git init` như file `00` đã làm.

### Bài 1 — Vòng đời commit cơ bản

1. Tạo 3 file: `a.txt`, `b.txt`, `c.txt`, mỗi file một câu bất kỳ
2. `git status` — ghi lại output vào `nhat-ky.md`
3. `git add a.txt` — chỉ một file. `git status` lại — quan sát a khác b, c thế nào
4. Commit chỉ với `a.txt`
5. `git add .` rồi commit nốt `b.txt` và `c.txt` trong **một** commit khác
6. `git log --oneline` — phải thấy đúng 2 commit

### Bài 2 — `.gitignore`

1. Tạo thêm file giả `node_modules/goi-tin.js` (tạo cả thư mục `node_modules`) và `.env` với nội dung `SECRET=123`
2. `git status` — cả hai đều hiện untracked
3. Tạo `.gitignore` chứa `node_modules/` và `.env`
4. `git status` lại — chúng biến mất khỏi danh sách
5. Cố tình `git add .env` — chuyện gì xảy ra? Ghi vào `nhat-ky.md`

### Bài 3 — Phân biệt `restore`, `revert`, `reset` (bài chính)

Thực hiện tuần tự, **ghi lại trạng thái sau mỗi bước** bằng `git log --oneline`:

1. Tạo file `sua-choi.txt`, viết "phiên bản 1", commit
2. Sửa thành "phiên bản 2", **chưa commit**, chạy `git restore sua-choi.txt` — mở file kiểm tra, nó về "phiên bản 1"?
3. Sửa lại thành "phiên bản 2", lần này commit thật (`commit 2`)
4. Sửa tiếp thành "phiên bản 3", commit (`commit 3`)
5. Sửa tiếp thành "phiên bản 4", commit (`commit 4`)
6. Dùng `git revert` để hoàn tác đúng `commit 3` (không phải commit mới nhất) — dùng `git revert <hash-cua-commit-3>`. Mở file xem nội dung là gì. Giải thích trong `nhat-ky.md` vì sao kết quả như vậy.
7. `git log --oneline` — đếm xem có bao nhiêu commit tất cả (phải nhiều hơn 4, vì revert tạo thêm commit mới)
8. Bây giờ thử `git reset --hard <hash-cua-commit-2>` — mở file xem nội dung
9. `git log --oneline` một lần nữa — các commit sau `commit 2` đâu rồi?
10. Chạy `git reflog` — tìm lại hash của những commit vừa "biến mất". Ghi lại cách bạn tìm thấy chúng.

Bài này bắt bạn thấy tận mắt khác biệt giữa ba lệnh hay bị nhầm nhất trong Git.

### Bài 4 — Nhánh và merge không conflict

1. Từ `main`, tạo nhánh `feature/them-loi-chao`
2. Trên nhánh đó, tạo file `chao.txt` chứa "Xin chào", commit
3. Quay về `main`: `git switch main`. Mở `chao.txt` bằng file explorer — nó có tồn tại trên `main` không? Giải thích vì sao trong `nhat-ky.md`
4. `git merge feature/them-loi-chao`
5. Kiểm tra lại — giờ `chao.txt` đã xuất hiện ở `main`
6. `git log --oneline --graph` — đây có phải fast-forward merge không? Vì sao?
7. `git branch -d feature/them-loi-chao` — xóa nhánh đã merge xong

### Bài 5 — Tự tạo conflict rồi tự giải (bài chính, bắt buộc)

Đây là bài quan trọng nhất file này. Đọc kỹ, làm chậm, đừng bỏ qua.

1. Trên `main`, tạo file `gia.js`:
```javascript
function tinhGia(soLuong) {
  return soLuong * 10000;
}
```
Commit.

2. Tạo nhánh `feature/them-thue`, sửa `gia.js` thành:
```javascript
function tinhGia(soLuong) {
  return soLuong * 10000 * 1.1;   // cộng thuế 10%
}
```
Commit trên nhánh này.

3. Quay về `main`, tạo nhánh khác `feature/them-giam-gia` từ `main` (không phải từ nhánh trên), sửa `gia.js` thành:
```javascript
function tinhGia(soLuong) {
  return soLuong * 10000 - 5000;   // giảm giá cố định
}
```
Commit trên nhánh này.

4. Quay về `main`, merge `feature/them-thue` trước — chạy êm, không conflict
5. Merge tiếp `feature/them-giam-gia` — **lần này sẽ conflict**, vì cả hai nhánh đều sửa cùng một dòng, tách ra từ cùng một điểm gốc
6. Mở `gia.js`, chụp lại (copy) đúng nguyên văn phần có `<<<<<<<`, `=======`, `>>>>>>>` vào `nhat-ky.md`
7. Tự sửa file để **có cả thuế và giảm giá** — viết logic gộp hai thay đổi cho hợp lý
8. Xóa hết các dấu đánh dấu, `git add gia.js`, `git commit`
9. `git log --oneline --graph` — tìm commit merge, nó có 2 cha đúng không?

### Bài 6 — `stash`

1. Đang sửa dở một file (không commit)
2. `git stash` — kiểm tra `git status`, thay đổi biến mất
3. Tạo và chuyển sang nhánh mới, làm gì đó khác, quay lại nhánh cũ
4. `git stash pop` — thay đổi dở dang quay trở lại
5. Ghi vào `nhat-ky.md`: bạn nghĩ khi nào trong công việc thật mình sẽ cần dùng `stash`?

### Bài 7 — Giải thích bằng lời

Viết vào `nhat-ky.md`, mỗi câu 3–5 dòng, bằng lời của bạn:

1. Staging area giải quyết vấn đề gì? Vì sao không commit thẳng từ working directory?
2. `git revert` và `git reset --hard` khác nhau chỗ nào? Khi nào dùng cái nào?
3. Merge conflict là gì và tại sao nó xảy ra? Giải thích như đang nói với người chưa biết Git.
4. `git branch` tạo ra cái gì thực sự — có sao chép file không?

---

## Xong file này khi

- [ ] Phân biệt được rõ ràng, bằng lời của bạn: `git restore` vs `git restore --staged` vs `git revert` vs `git reset`
- [ ] Đã tự tạo và tự giải một conflict thật (bài 5), có ảnh chụp phần `<<<<<<<` gốc
- [ ] Đã dùng `git reflog` để tìm lại một commit tưởng như đã mất
- [ ] Đọc được `git log --oneline --graph` và chỉ ra commit nào là merge commit
- [ ] `nhat-ky.md` có đủ phần quan sát của các bài 1–6 và trả lời bài 7

Đây là file dùng tay nhiều nhất từ đầu chặng 3. Đừng đọc lướt rồi bỏ qua bài tập — cảm giác "hiểu rồi" khi đọc lý thuyết Git luôn đánh lừa. Chỉ khi bạn tự conflict, tự sợ, tự sửa, thì Git mới hết là nỗi ám ảnh.

Xong thì gửi mình `nhat-ky.md`, kèm **"viết file 02-github-workflow"**.