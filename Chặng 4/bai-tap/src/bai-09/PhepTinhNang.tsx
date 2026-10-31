import { useMemo, useState } from "react";

type SanPham = {
    id: number;
    ten: string;
    gia: number;
    danhMuc: string;
};

type KieuSapXep = "gia-tang" | "gia-giam" | "ten";

const SO_SAN_PHAM = 50_000;
const LOAI_SAN_PHAM = ["Áo", "Quần", "Giày", "Mũ", "Túi", "Đồng hồ", "Tai nghe", "Bàn phím"];
const TINH_TU = ["cao cấp", "giá rẻ", "thể thao", "cổ điển", "mini", "chống nước"];
const DANH_MUC = ["Thời trang", "Phụ kiện", "Điện tử", "Thể thao"];

function chonNgauNhien(ds: string[])
{
    return ds[Math.floor(Math.random() * ds.length)];
}

// Nằm ngoài component nên chỉ sinh một lần, lúc file được nạp
const DANH_SACH_SAN_PHAM: SanPham[] = Array.from({ length: SO_SAN_PHAM }, (_, i) => ({
    id: i,
    ten: `${chonNgauNhien(LOAI_SAN_PHAM)} ${chonNgauNhien(TINH_TU)} ${i + 1}`,
    gia: (Math.floor(Math.random() * 5000) + 1) * 1000,   // 1.000đ → 5.000.000đ
    danhMuc: chonNgauNhien(DANH_MUC),
}));

export function PhepTinhNang()
{
    const [tuKhoa, setTuKhoa] = useState("");
    const [sapXep, setSapXep] = useState<KieuSapXep>("gia-tang");
    const [cheDoToi, setCheDoToi] = useState(false);

    console.time("loc");
    // TODO: lọc + sắp xếp DANH_SACH_SAN_PHAM theo tuKhoa, sapXep, rồi lấy 50 kết quả đầu
    const dsHienThi: SanPham[] = useMemo(() => 
        DANH_SACH_SAN_PHAM.filter((item) => item.ten.includes(tuKhoa))
                        .sort((a,b) => {
                            switch(sapXep) {
                                case "ten":
                                    return a.ten.localeCompare(b.ten, "vi");
                                case "gia-giam":
                                    return b.gia - a.gia;
                                case "gia-tang":
                                    return a.gia - b.gia;
                            
                            }
                        })
                        .slice(0, 50)
    , [tuKhoa, sapXep]);

    console.timeEnd("loc");
    return (
        <div style={{
            background: cheDoToi ? "#222" : "#fff",
            color: cheDoToi ? "#eee" : "#222",
            padding: 16,
        }}>
            <input
                placeholder="Tìm sản phẩm..."
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
            />

            <select value={sapXep} onChange={(e) => setSapXep(e.target.value as KieuSapXep)}>
                <option value="gia-tang">Giá tăng dần</option>
                <option value="gia-giam">Giá giảm dần</option>
                <option value="ten">Tên A → Z</option>
            </select>

            <button onClick={() => setCheDoToi(!cheDoToi)}>
                {cheDoToi ? "Tắt nền tối" : "Bật nền tối"}
            </button>

            <ul>
                {dsHienThi.map((sp) => (
                    <li key={sp.id}>
                        {sp.ten} — {sp.gia.toLocaleString("vi-VN")}đ — {sp.danhMuc}
                    </li>
                ))}
            </ul>
        </div>
    );
}
