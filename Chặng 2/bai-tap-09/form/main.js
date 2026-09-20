// 1. Submit **không** tải lại trang; gom dữ liệu bằng `FormData` + `Object.fromEntries`, in ra `#ket-qua`
// 2. Ô "Tuổi" chỉ cho gõ số — chặn bằng `keydown`, nhưng vẫn cho dùng `Backspace`, mũi tên, `Tab`, và Ctrl+V
// 3. Validate **khi đang gõ** (`input`) cho ô email, hiện lỗi đỏ dưới ô
// 4. Ô "Họ tên" chỉ validate **khi rời ô** (`change` hoặc `blur`) — quan sát sự khác biệt trải nghiệm và ghi nhận xét
// 5. Dùng **delegation với `focusin`/`focusout`** để tô sáng ô đang được focus — chỉ một listener trên `#form`
// 6. `Escape` xóa toàn bộ form; `Ctrl/Cmd + Enter` submit
// 7. Checkbox chưa tick thì nút Gửi bị `disabled`

// 1
const form = document.querySelector("#form");
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const duLieu = Object.fromEntries(data);
    console.log(duLieu);
});

// 2
const oTuoi = form.elements.tuoi;
oTuoi.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "v") 
        return;

    if(["Backspace", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
        return;

    if(e.key >= "0" && e.key <= "9")
        return;

    e.preventDefault();
});

// 3
const oEmail = form.elements.email;

const oLoiEmail = document.createElement("span");
oLoiEmail.style.color = "red";
oEmail.insertAdjacentElement("afterend", oLoiEmail);

oEmail.addEventListener("input", (e) => {
    const hopLe = oEmail.value === "" || oEmail.validity.valid;
    oLoiEmail.textContent = hopLe ? "" : "Email không đúng định dạng";
});

// 4 
const oHoTen = form.elements.ten;

const oLoiTen = document.createElement("span");
oLoiTen.style.color = "red";
oTen.insertAdjacentElement("afterend", oLoiTen);

oHoTen.addEventListener("change", (e) => {
    const hopLe = oHoTen.value.trim() !== "";
    oLoiTen.textContent = hopLe ? "" : "Họ tên không được để trống";
})

// 5
form.addEventListener("focusin", (e) => {
  e.target.style.backgroundColor = "#fff3cd";
});

form.addEventListener("focusout", (e) => {
  e.target.style.backgroundColor = "";
});

// 6
document.addEventListener("keydown", (e) => {
    if(e.key === "Escape")
        form.reset();
    if (e.key === "Escape")
        form.reset();

    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
        form.requestSubmit();
});

// 7
const oDongY = form.elements.dongY;
const oNutGui = form.querySelector('button[type="submit"]');

// đặt trạng thái ban đầu — lúc mới load, checkbox chưa tick
oNutGui.disabled = !oDongY.checked;

oDongY.addEventListener("change", () => {
    oNutGui.disabled = !oDongY.checked;
});
