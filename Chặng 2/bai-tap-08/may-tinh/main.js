const trangThai = {
  soHienTai: "0",
  soTruoc: null,
  toanTu: null,
  choSoMoi: false,
  loi: false
};

function nhapSo(so)
{
    if (trangThai.loi) return;   // yêu cầu #8: sau khi lỗi, mọi nút (trừ C) không làm gì

    if(trangThai.choSoMoi)
    {
        trangThai.soTruoc = trangThai.soHienTai;
        trangThai.soHienTai = so;
        trangThai.choSoMoi = false;
    }
    else
    {
        trangThai.soHienTai = trangThai.soHienTai === "0" ? so : trangThai.soHienTai + so;
    }
}    

function chonToanTu(t)
{
    if (trangThai.loi) return;

    trangThai.toanTu = t;
    trangThai.choSoMoi = true;
}

function doiDau()
{
    if (trangThai.loi) return;

    trangThai.soHienTai = trangThai.soHienTai.startsWith("-")
        ? trangThai.soHienTai.slice(1)
        : "-" + trangThai.soHienTai;
}

function xoa()
{
    trangThai.soHienTai = "0";
    trangThai.loi = false;
    trangThai.toanTu = null;
    trangThai.soTruoc = null;
    trangThai.choSoMoi = false;
}

function phanTram()
{
    if (trangThai.loi) return;

    trangThai.soHienTai = String(Number(trangThai.soHienTai) / 100);
}

function themDauCham()
{
    if (trangThai.loi) return;

    if(!trangThai.soHienTai.includes("."))
        trangThai.soHienTai += ".";
}


function tinhKetQua()
{
    if (trangThai.loi) return;
    if (trangThai.toanTu === null) return;

    const soTruoc = Number(trangThai.soTruoc);
    const soSau = Number(trangThai.soHienTai);
    let ketQua;

    switch (trangThai.toanTu)
    {
        case "+":
            ketQua = soTruoc + soSau;
            break;
        case "-":
            ketQua = soTruoc - soSau;
            break;
        case "*":
            ketQua = soTruoc * soSau;
            break;
        case "/":
            if (soSau === 0)
            {
                trangThai.soHienTai = "Lỗi";
                trangThai.loi = true;
                return;
            }
            ketQua = soTruoc / soSau;
            break;
    }

    ketQua = Math.round(ketQua * 1e10) / 1e10;   // yêu cầu #11: tránh 0.1+0.2 = 0.30000000000000004

    trangThai.soTruoc = soSau;        // giữ lại số hạng thứ 2 để bấm "=" lần nữa thì lặp lại phép tính
    trangThai.soHienTai = String(ketQua);
    trangThai.choSoMoi = true;        // gõ số tiếp theo sẽ ghi đè, không nối vào kết quả
}

function ve() {
    const manHinh = document.querySelector("#man-hinh");
    manHinh.textContent = trangThai.soHienTai;
    // yêu cầu #9: số quá dài thì tự thu nhỏ cỡ chữ, không tràn khung
    manHinh.classList.toggle("man-hinh--dai", trangThai.soHienTai.length > 9);
}

document.querySelector(".ban-phim").addEventListener("click", (e) => {
    const nut = e.target.closest(".nut");
    if(!nut)
        return;

    switch (nut.dataset.loai)
    {
        case "so":
            const so = nut.dataset.giaTri;
            nhapSo(so);
            break;
        
        case "toan-tu":
            const toanTu = nut.dataset.giaTri;
            chonToanTu(toanTu);
            break;
        
        case "hanh-dong":
            switch (nut.dataset.giaTri)
            {
                case "xoa":
                    xoa();
                    break;
                case "doi-dau":
                    doiDau();
                    break;
                case "phan-tram":
                    phanTram();
                    break;
                case "thap-phan":
                    themDauCham();
                    break;
                case "bang":
                    tinhKetQua();
                    break;
            }
            break;
    }
    ve();
});

document.addEventListener("keydown", (e) => {
    if(e.key >= "0" && e.key <= "9")
        nhapSo(e.key);
    else if(["+", "-", "*", "/"].includes(e.key))
        chonToanTu(e.key);
    else if(e.key === "Escape")
        xoa();
    else if(e.key === "Enter")
        tinhKetQua();
    else if(e.key === "Backspace")
    {
         if (trangThai.loi) 
            return;
        trangThai.soHienTai = trangThai.soHienTai.length > 1 ? trangThai.soHienTai.slice(0, -1) : "0";
    }
    else if(e.key === ".")
        themDauCham();
    else 
        return;
    ve();
});
