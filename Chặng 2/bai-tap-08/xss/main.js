const oNhap = document.querySelector("#o-nhap");
const nutHtml = document.querySelector("#nut-html");
const nutText = document.querySelector("#nut-text");
const ketQua = document.querySelector("#ket-qua");

nutHtml.addEventListener("click", () => {
    ketQua.innerHTML = oNhap.value;
});

nutText.addEventListener("click", () => {
    ketQua.textContent = oNhap.value;
});
