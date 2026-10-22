import { useState } from "react";
import { OSoDienThoai } from "./OSoDienThoai";
import { OMatKhau } from "./OMatKhau";
import { ChonNhieu } from "./ChonNhieu";

type GioiTinh = "nam" | "nu" | "khac";

type FormDangKyState = {
    hoTen: string,
    email: string,
    sdt: string,
    matKhau: string,
    xacNhanMatKhau: string,
    ngaySinh: string,
    gioiTinh: GioiTinh,
    thanhPho: string,
    soThich: number[],
    dongY: boolean
}

type LoiForm = Partial<Record<keyof FormDangKyState, string>>;

type TrangThaiGui =
  | { loai: "nhap" }
  | { loai: "dang-gui" }
  | { loai: "thanh-cong"; maTaiKhoan: number; ten: string }
  | { loai: "loi"; thongBao: string };

type TaiKhoan = {
    id: number,
    name: string
}

const TUOI_TOI_THIEU = 16;
const SO_THICH_TOI_DA = 3;

// \p{L} = mọi chữ cái Unicode (kể cả chữ có dấu tiếng Việt), cờ u bắt buộc
const REGEX_HO_TEN = /^[\p{L}\s]+$/u;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_SDT = /^0\d{9}$/;

// ngaySinh dạng "YYYY-MM-DD" (giá trị của input type="date")
function duTuoi(ngaySinh: string, tuoi: number) : boolean
{
    const [nam, thang, ngay] = ngaySinh.split("-").map(Number);
    const ngayDuTuoi = new Date(nam + tuoi, thang - 1, ngay);
    return ngayDuTuoi <= new Date();
}

function kiemTra(f: FormDangKyState) : LoiForm
{
    const loi: LoiForm = {};
    const hoTen = f.hoTen.trim();
    const email = f.email.trim();

    if(hoTen.length < 2)
        loi.hoTen = "Họ tên tối thiểu 2 ký tự";
    else if(!REGEX_HO_TEN.test(hoTen))
        loi.hoTen = "Họ tên chỉ được chứa chữ và khoảng trắng";

    if(email === "")
        loi.email = "Vui lòng nhập email";
    else if(!REGEX_EMAIL.test(email))
        loi.email = "Email không đúng định dạng";

    if(!REGEX_SDT.test(f.sdt))
        loi.sdt = "Số điện thoại phải đủ 10 số, bắt đầu bằng 0";

    if(f.matKhau.length < 8)
        loi.matKhau = "Mật khẩu tối thiểu 8 ký tự";
    else if(!/[A-Z]/.test(f.matKhau) || !/\d/.test(f.matKhau))
        loi.matKhau = "Mật khẩu cần ít nhất một chữ hoa và một số";

    if(f.xacNhanMatKhau === "")
        loi.xacNhanMatKhau = "Vui lòng nhập lại mật khẩu";
    else if(f.xacNhanMatKhau !== f.matKhau)
        loi.xacNhanMatKhau = "Mật khẩu xác nhận không khớp";

    if(f.ngaySinh === "")
        loi.ngaySinh = "Vui lòng chọn ngày sinh";
    else if(!duTuoi(f.ngaySinh, TUOI_TOI_THIEU))
        loi.ngaySinh = `Bạn phải đủ ${TUOI_TOI_THIEU} tuổi`;

    if(f.thanhPho === "")
        loi.thanhPho = "Vui lòng chọn thành phố";

    if(f.soThich.length === 0)
        loi.soThich = "Chọn ít nhất 1 sở thích";
    else if(f.soThich.length > SO_THICH_TOI_DA)
        loi.soThich = `Chọn nhiều nhất ${SO_THICH_TOI_DA} sở thích`;

    if(!f.dongY)
        loi.dongY = "Bạn phải đồng ý điều khoản";

    return loi;
}

const BanDau : FormDangKyState = {
    hoTen: "",
    email: "",
    sdt: "",
    matKhau: "",
    xacNhanMatKhau: "",
    ngaySinh: "",
    gioiTinh: "khac",
    thanhPho: "",
    soThich: [],
    dongY: false
}

const gioiTinhs : GioiTinh[] = ["nam", "nu", "khac"];

const NHAN_GIOI_TINH: Record<GioiTinh, string> = {
    "nam": "Nam",
    "nu": "Nữ",
    "khac": "Khác",
};

async function guiDangKy(hoTen: string) : Promise<TaiKhoan>
{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.3) {
                // Thất bại: reject bằng Error (không phải chuỗi) để catch đọc được e.message
                reject(new Error("Email đã được sử dụng"));
            } else {
                // Thành công: Gọi resolve để trả về dữ liệu
                resolve({ id: 1, name: hoTen });
            }
        }, 1500);
    });
}

type FormDangKyProps = {
    onDangKyKhac: () => void
}

// Bọc ngoài FormDangKy: đổi key → React hủy form cũ, tạo form mới với toàn bộ state về ban đầu
export function TrangDangKy()
{
    const [lanDangKy, setLanDangKy] = useState(0);
    return <FormDangKy key={lanDangKy} onDangKyKhac={() => setLanDangKy((d) => d + 1)} />;
}

function FormDangKy({onDangKyKhac} : FormDangKyProps)
{
    const [form, setForm] = useState(BanDau);
    const loi = kiemTra(form);
    const hopLe = Object.keys(loi).length === 0;

    const [daCham, setDaCham] = useState<Partial<Record<keyof FormDangKyState, boolean>>>({});
    const [daGui, setDaGui] = useState(false);

    const [trangThaiGui, setTrangThaiGui] = useState<TrangThaiGui>({loai: "nhap"});

    const dangGui = trangThaiGui.loai === "dang-gui";

    function hienLoi(truong: keyof FormDangKyState)
    {
        return (daCham[truong] || daGui) ? loi[truong] : undefined;
    }

    // id của thẻ <p> báo lỗi, chỉ trả về khi lỗi đang hiện → dùng cho aria-describedby
    function idLoi(truong: keyof FormDangKyState)
    {
        return hienLoi(truong) ? `${truong}-loi` : undefined;
    }

    function danhDauCham(truong: keyof FormDangKyState)
    {
        setDaCham((d) => ({...d, [truong]: true}));
    }

    function capNhapForm<K extends keyof FormDangKyState>(truong: K, giaTri: FormDangKyState[K])
    {
        setForm((d) => ({...d, [truong] : giaTri}));
    }

    async function xuLyGui(e: React.FormEvent<HTMLFormElement>)
    {
        e.preventDefault();
        setDaGui(true);
        if(!hopLe || trangThaiGui.loai === "dang-gui")
            return;

        setTrangThaiGui({loai: "dang-gui"});
        try
        {
            const kq = await guiDangKy(form.hoTen.trim());
            setTrangThaiGui({loai: "thanh-cong", maTaiKhoan: kq.id, ten: kq.name})
        }
        catch(e)
        {
            setTrangThaiGui({loai: "loi", thongBao: e instanceof Error ? e.message : "Đã có lỗi xảy ra"})
        }
    }

    if(trangThaiGui.loai === "thanh-cong")
    {
        return (
            <div>
                <h2>Chào mừng {trangThaiGui.ten}!</h2>
                <p>Bạn đã đăng ký tài khoản thành công.</p>
                <button type="button" onClick={onDangKyKhac}>Đăng ký tài khoản khác</button>
            </div>
        );
    }

    return (
        <form onSubmit={xuLyGui}>
            <fieldset disabled={dangGui}>
                <label htmlFor="hoTen">Họ tên</label>
                <input
                    type="text"
                    id="hoTen"
                    value={form.hoTen}
                    onChange={(e) => capNhapForm("hoTen" ,e.target.value)}
                    onBlur={() => danhDauCham("hoTen")}
                    aria-invalid={idLoi("hoTen") !== undefined}
                    aria-describedby={idLoi("hoTen")}
                />
                {hienLoi("hoTen") && <p id="hoTen-loi" className="loi">{hienLoi("hoTen")}</p>}

                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    value={form.email}
                    onChange={(e) => capNhapForm("email" ,e.target.value)}
                    onBlur={() => danhDauCham("email")}
                    aria-invalid={idLoi("email") !== undefined}
                    aria-describedby={idLoi("email")}
                />
                {hienLoi("email") && <p id="email-loi" className="loi">{hienLoi("email")}</p>}

                <label htmlFor="sdt">Số điện thoại</label>
                <OSoDienThoai
                    id="sdt"
                    idLoi={idLoi("sdt")}
                    sdt={form.sdt}
                    onDoiSdt={(e) => {
                        const chiSo = e.target.value.replace(/\D/g, "").slice(0, 10);
                        capNhapForm("sdt", chiSo);
                    }}
                    onBlur={() => danhDauCham("sdt")}
                />
                {hienLoi("sdt") && <p id="sdt-loi" className="loi">{hienLoi("sdt")}</p>}

                <label htmlFor="matKhau">Mật khẩu</label>
                <OMatKhau
                    id="matKhau"
                    idLoi={idLoi("matKhau")}
                    matKhau={form.matKhau}
                    onThayDoiMatKhau={(e) => capNhapForm("matKhau", e.target.value)}
                    onBlur={() => danhDauCham("matKhau")}
                />
                {hienLoi("matKhau") && <p id="matKhau-loi" className="loi">{hienLoi("matKhau")}</p>}

                <label htmlFor="xacNhanMatKhau">Xác nhận mật khẩu</label>
                <OMatKhau
                    id="xacNhanMatKhau"
                    idLoi={idLoi("xacNhanMatKhau")}
                    matKhau={form.xacNhanMatKhau}
                    onThayDoiMatKhau={(e) => capNhapForm("xacNhanMatKhau", e.target.value)}
                    onBlur={() => danhDauCham("xacNhanMatKhau")}
                />
                {hienLoi("xacNhanMatKhau") && <p id="xacNhanMatKhau-loi" className="loi">{hienLoi("xacNhanMatKhau")}</p>}

                <label htmlFor="ngaySinh">Ngày sinh</label>
                <input
                    type="date"
                    id="ngaySinh"
                    value={form.ngaySinh}
                    onChange={(e) => capNhapForm("ngaySinh" ,e.target.value)}
                    onBlur={() => danhDauCham("ngaySinh")}
                    aria-invalid={idLoi("ngaySinh") !== undefined}
                    aria-describedby={idLoi("ngaySinh")}
                />
                {hienLoi("ngaySinh") && <p id="ngaySinh-loi" className="loi">{hienLoi("ngaySinh")}</p>}

                {/* Nhóm radio: legend là "label" chung cho cả nhóm, mỗi radio được bọc label riêng */}
                <fieldset>
                    <legend>Giới tính</legend>
                    {gioiTinhs.map((gioiTinh) => (
                        <label key={gioiTinh}>
                            <input
                                type="radio"
                                name="gioiTinh"
                                value={gioiTinh}
                                checked={form.gioiTinh === gioiTinh}
                                onChange={() => capNhapForm("gioiTinh", gioiTinh)}
                            />
                            {NHAN_GIOI_TINH[gioiTinh]}
                        </label>
                    ))}
                </fieldset>

                <label htmlFor="thanhPho">Thành phố</label>
                <select
                    id="thanhPho"
                    value={form.thanhPho}
                    onChange={(e) => capNhapForm("thanhPho", e.target.value)}
                    onBlur={() => danhDauCham("thanhPho")}
                    aria-invalid={idLoi("thanhPho") !== undefined}
                    aria-describedby={idLoi("thanhPho")}
                >
                    <option value="">-- Chọn --</option>
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="hn">Hà Nội</option>
                    <option value="dn">Đà Nẵng</option>
                </select>
                {hienLoi("thanhPho") && <p id="thanhPho-loi" className="loi">{hienLoi("thanhPho")}</p>}

                {/* ChonNhieu gồm nhiều checkbox, không có một ô để blur → coi như đã chạm khi người dùng chọn */}
                {/* aria-invalid không hợp lệ trên fieldset (role group) → chỉ nối lỗi bằng aria-describedby */}
                <fieldset aria-describedby={idLoi("soThich")}>
                    <legend>Sở thích (tối đa {SO_THICH_TOI_DA})</legend>
                    <ChonNhieu
                        dsDaChon={form.soThich}
                        onChon={(ds) => {
                            capNhapForm("soThich", ds);
                            danhDauCham("soThich");
                        }}
                    />
                </fieldset>
                {hienLoi("soThich") && <p id="soThich-loi" className="loi">{hienLoi("soThich")}</p>}

                <input
                    type="checkbox"
                    id="dongY"
                    checked={form.dongY}
                    onChange={(e) => {
                        capNhapForm("dongY", e.target.checked);
                        danhDauCham("dongY");
                    }}
                    aria-invalid={idLoi("dongY") !== undefined}
                    aria-describedby={idLoi("dongY")}
                />
                <label htmlFor="dongY">Tôi đồng ý với điều khoản sử dụng</label>
                {hienLoi("dongY") && <p id="dongY-loi" className="loi">{hienLoi("dongY")}</p>}
                            
            </fieldset>
            <button type="submit" disabled={dangGui}>
                {dangGui ? "Đang gửi..." : "Đăng ký"}
            </button>
            {trangThaiGui.loai === "loi" && <p className="loi">{trangThaiGui.thongBao}</p>}
        </form>
    )
}