import styles from "./TrangThaiTaiKhoan.module.css"

const taiKhoan = {
  ten: "Nguyễn Văn An",
  vaiTro: "admin" as "admin" | "thanh-vien" | "khach",
  soThongBao: 0,
  daXacThucEmail: false,
  bienLaiGanNhat: null as string | null,
};

export function TrangThaiTaiKhoan()
{
    if(taiKhoan.vaiTro === "khach")
        return <button>Đăng nhập</button>

    return (
        <>
            <h1> Xin chào {taiKhoan.ten}</h1>
            <HuyHieuVaiTro />
            {taiKhoan.soThongBao > 0 && <span> số thông báo: {taiKhoan.soThongBao}</span>}
            {!taiKhoan.daXacThucEmail && <span> Cảnh báo vui lòng xác thực Email</span>}
            <div>{taiKhoan.bienLaiGanNhat ?? "Chưa có giao dịch"}</div>
        </>
    )
}

function cx(...lop: (string | false | null | undefined)[])
{
    return lop.filter(Boolean).join(" ");
}

function HuyHieuVaiTro()
{
    let chu: string;
    let lopMau: string;

    switch(taiKhoan.vaiTro)
    {
        case "admin":
            chu = "Quản trị viên";
            lopMau = styles.admin;
            break;
        case "thanh-vien":
            chu = "Thành viên";
            lopMau = styles.thanhVien;
            break;
        case "khach":
            chu = "Khách";
            lopMau = styles.khach;
            break;
    }

    return <div className={cx(styles.huyHieu, lopMau)}>{chu}</div>;
}