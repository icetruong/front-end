# 03 — Flexbox — Xếp đồ theo MỘT chiều

> Đây là công cụ layout bạn sẽ dùng ~80% thời gian. Điều kiện tiên quyết: đã hiểu `display: block/inline` và box model ở file `02`. Flexbox chính là cách bạn *bẻ* normal flow để xếp các hộp theo ý mình.

---

## 1. Flexbox giải quyết vấn đề gì

Nhớ ở file `02`: các `<div>` (block) cứ xếp **dọc**, mỗi cái một hàng. Muốn xếp chúng **nằm ngang**, căn giữa, chia đều khoảng cách... thì normal flow chịu. Trước đây người ta hack bằng `float` rất khổ. Flexbox sinh ra để giải đúng bài này: **sắp xếp một nhóm phần tử theo một chiều (ngang HOẶC dọc), kèm căn chỉnh và chia khoảng cách dễ dàng.**

Từ khóa: **một chiều**. Xếp theo hàng *hoặc* cột. Cần cả hàng lẫn cột cùng lúc (lưới 2 chiều) → đó là Grid (file `04`).

---

## 2. Khái niệm cốt lõi: Container và Items

Flexbox luôn có 2 vai:

```html
<div class="container">   <!-- CHA = flex container -->
  <div class="item">1</div>   <!-- CON = flex items -->
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

```css
.container {
  display: flex;   /* CHỈ một dòng này → biến cha thành flex container,
                      và mọi con trực tiếp thành flex items */
}
```

Gõ đúng một dòng `display: flex` vào cha → 3 div con đang xếp dọc lập tức **nhảy sang nằm ngang**. Đó là phép màu đầu tiên.

> ⚠️ **Bẫy nền tảng:** thuộc tính flex chia làm 2 nhóm — đặt **trên container** (justify-content, align-items, gap, flex-direction, flex-wrap) và đặt **trên item** (flex-grow, flex-shrink, flex-basis, align-self). Nhầm chỗ đặt là không ăn. Luôn tự hỏi: "thuộc tính này thuộc về cha hay con?"

---

## 3. Hai trục — hiểu cái này là hiểu 80% Flexbox

Flexbox vận hành quanh **2 trục**:

- **Main axis (trục chính)** — hướng các item xếp ra.
- **Cross axis (trục phụ)** — vuông góc với trục chính.

Mặc định `flex-direction: row` → main axis nằm **ngang** (trái→phải), cross axis nằm **dọc**.

```
flex-direction: row  (mặc định)

  cross axis (dọc) ↑
                   │
   [item][item][item]  →  main axis (ngang)
```

**Vì sao phải nhớ trục?** Vì hai thuộc tính căn chỉnh quan trọng nhất gắn vào trục, KHÔNG gắn vào "ngang/dọc" cố định:

- `justify-content` → căn theo **MAIN axis**.
- `align-items` → căn theo **CROSS axis**.

Khi bạn đổi `flex-direction` thành `column`, main axis xoay thành dọc, và hai thuộc tính trên cũng đảo theo. Đây là chỗ người mới loạn nhất — nhớ "justify=main, align=cross" thì không bao giờ lạc.

---

## 4. Thuộc tính trên CONTAINER

### 4.1 `flex-direction` — chọn hướng main axis
```css
.container {
  display: flex;
  flex-direction: row;            /* mặc định: ngang, trái→phải */
  /* flex-direction: column;         dọc, trên→dưới */
  /* flex-direction: row-reverse;    ngang, phải→trái */
  /* flex-direction: column-reverse; dọc, dưới→lên */
}
```

### 4.2 `justify-content` — căn theo MAIN axis (thường là ngang)
```css
justify-content: flex-start;     /* dồn về đầu (mặc định) */
justify-content: center;         /* căn giữa */
justify-content: flex-end;       /* dồn về cuối */
justify-content: space-between;  /* dàn đều, item đầu/cuối sát mép, khoảng trống ở GIỮA */
justify-content: space-around;   /* mỗi item có khoảng đệm 2 bên bằng nhau */
justify-content: space-evenly;   /* mọi khoảng trống (kể cả mép) đều bằng nhau */
```

`space-between` là "ngôi sao" — dùng cực nhiều cho navbar (logo trái, menu phải).

### 4.3 `align-items` — căn theo CROSS axis (thường là dọc)
```css
align-items: stretch;     /* mặc định: item kéo dài cho cao bằng nhau */
align-items: center;      /* căn giữa theo chiều dọc */
align-items: flex-start;  /* dồn lên trên */
align-items: flex-end;    /* dồn xuống dưới */
```

### 4.4 `gap` — khoảng cách giữa các item (dùng cái này, đừng dùng margin)
```css
gap: 16px;          /* cách đều 16px giữa mọi item */
gap: 10px 20px;     /* hàng cách 10, cột cách 20 (khi có wrap) */
```

> 🧠 **Mẹo vàng:** Ngày xưa phải dùng `margin` để tạo khoảng cách giữa item, rất phiền (margin của item cuối thừa ra, margin collapse...). `gap` sinh sau, giải quyết sạch sẽ. **Cần khoảng cách giữa các flex item → luôn dùng `gap`.**

### 4.5 `flex-wrap` — cho phép xuống dòng
```css
flex-wrap: nowrap;   /* mặc định: KHÔNG xuống dòng, item bị bóp nhỏ cho vừa */
flex-wrap: wrap;     /* hết chỗ thì xuống hàng mới */
```

> ⚠️ **Bẫy:** mặc định `nowrap` → khi cửa sổ hẹp lại, các item bị **nén** ngày càng nhỏ thay vì xuống dòng, có khi vỡ cả nội dung. Cho layout cần co giãn (như hàng thẻ sản phẩm), nhớ `flex-wrap: wrap`.

---

## 5. CÔNG THỨC CĂN GIỮA HOÀN HẢO (ai cũng phải thuộc)

Bài toán "căn một thứ vào chính giữa khối, cả ngang lẫn dọc" — kinh điển, từng làm khổ cả thế hệ dev. Flexbox giải bằng 3 dòng:

```css
.container {
  display: flex;
  justify-content: center;   /* giữa theo main (ngang) */
  align-items: center;       /* giữa theo cross (dọc) */
  height: 300px;             /* cần có chiều cao thì "giữa dọc" mới thấy được */
}
```

Học thuộc combo này. Bạn sẽ gõ nó hàng trăm lần trong đời.

🛠️ **Thử ngay:** tạo container cao 300px, viền đỏ, bên trong một `<div>` nhỏ. Áp 3 dòng trên, xem ô nhỏ nhảy vào chính giữa. Rồi đổi `align-items: center` thành `flex-start`, `flex-end` để thấy nó trượt lên/xuống.

---

## 6. Thuộc tính trên ITEM — điều khiển từng con

### 6.1 `flex-grow` — chia phần không gian THỪA
Khi container còn chỗ trống, `flex-grow` quyết item nào "ăn" phần đó.
```css
.item { flex-grow: 0; }   /* mặc định: không nở */
.item-a { flex-grow: 1; } /* item-a nuốt hết khoảng trống còn lại */
```
Nếu nhiều item cùng `flex-grow: 1` → chúng chia đều phần thừa. Cho `flex-grow: 2` thì item đó ăn gấp đôi.

### 6.2 `flex-shrink` — co lại khi THIẾU chỗ
```css
.item { flex-shrink: 1; } /* mặc định: được phép co lại */
.item { flex-shrink: 0; } /* CẤM co — giữ nguyên kích thước dù chật */
```

### 6.3 `flex-basis` — kích thước "khởi điểm" theo main axis
Giống `width` (khi row) nhưng dành riêng cho flex.
```css
.item { flex-basis: 200px; }
```

### 6.4 `flex` — viết tắt gộp 3 cái trên (gặp nhiều nhất)
```css
.item { flex: 1; }            /* = flex: 1 1 0  → mọi item chia đều bằng nhau */
.item { flex: 0 0 200px; }    /* không nở, không co, cố định 200px */
```
Nhớ một câu: **`flex: 1`** trên các item = "chia đều không gian". Cực hay dùng.

### 6.5 `align-self` — phá lệ riêng một item
```css
.item-special { align-self: flex-end; }  /* item này tự căn khác cả nhóm */
```

---

## 7. Hai mẫu thực chiến gặp mỗi ngày

### Navbar: logo trái — menu phải
```css
.navbar {
  display: flex;
  justify-content: space-between;  /* đẩy 2 cụm về 2 mép */
  align-items: center;             /* căn giữa theo chiều dọc */
  padding: 0 20px;
}
.navbar .menu {
  display: flex;     /* các link trong menu cũng là flex để nằm ngang */
  gap: 20px;
}
```

### Hàng thẻ co giãn
```css
.card-row {
  display: flex;
  flex-wrap: wrap;   /* hẹp thì xuống dòng */
  gap: 16px;
}
.card {
  flex: 1 1 250px;   /* mỗi thẻ tối thiểu ~250px, tự nở chia đều phần thừa */
}
```

---

## ✅ Checkpoint

1. `display: flex` đặt trên cha hay con?
2. `justify-content` căn theo trục nào? `align-items` theo trục nào?
3. Khi đổi `flex-direction: column`, `justify-content: center` giờ căn ngang hay dọc?
4. Combo 3 dòng căn giữa tuyệt đối là gì?
5. `flex: 1` trên các item có tác dụng gì?
6. Vì sao nên dùng `gap` thay cho `margin` giữa các item?

---

## 🏋️ Bài tập

Tạo `bai-tap-03.html`. Làm 3 phần:

**1. Navbar:** một `<header>` có logo bên trái, 3 link bên phải, dùng `space-between` + `align-items: center`. Link cách nhau bằng `gap`.

**2. Căn giữa:** một khối cao 400px, bên trong một thẻ vuông 100×100 nằm **chính giữa** (cả ngang lẫn dọc).

**3. Hàng 4 thẻ:** một hàng gồm 4 "card" (div có padding + border), dùng `flex` + `gap`. Cho mỗi card `flex: 1` để chúng rộng bằng nhau. Sau đó thêm `flex-wrap: wrap` và `flex: 1 1 200px`, thu nhỏ cửa sổ trình duyệt, quan sát chúng xuống dòng.

Làm xong gửi mình CSS. Đây là file bạn nên nghịch lâu nhất — Flexbox thành phản xạ thì làm layout sẽ nhanh kinh khủng.
