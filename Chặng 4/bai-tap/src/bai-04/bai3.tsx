import { useState } from "react"

type SanPham = {
    id: string,
    ten: string,
    gia: number,
    danhMuc: string,
    soLuong: number
}

type DongSanPhamProps = {
    sanPham: SanPham,
    coTheLen: boolean,
    coTheXuong: boolean,
    onBamLen: (id: string) => void,
    onBamXuong: (id: string) => void,
    onNhanBan: (sanPham: SanPham) => void
}

function DongSanPham({sanPham, coTheLen, coTheXuong, onBamLen, onBamXuong, onNhanBan} : DongSanPhamProps)
{
    const [soLuongMua, setSoLuongMua] = useState(0);
    return (
        <li>
            <button disabled={!coTheLen} onClick={() => onBamLen(sanPham.id)}>▲</button>
            <button disabled={!coTheXuong} onClick={() => onBamXuong(sanPham.id)}>▼</button>
            <button onClick={() => onNhanBan(sanPham)}> Nhân bản</button>
            <span>{sanPham.ten} — {sanPham.gia.toLocaleString("vi-VN")}đ — {sanPham.danhMuc} — còn {sanPham.soLuong}</span>
            <input
                type="number"
                min={0}
                value={soLuongMua}
                onChange={(e) => setSoLuongMua(Number(e.target.value))}
                aria-label={`Số lượng mua ${sanPham.ten}`}
            />

        </li>
    )
}

type SapXep = "ten" | "gia" | "danhMuc";
const SAP_XEP_BO: SapXep[] = [
    "ten",
    "gia",
    "danhMuc"
];
const NHAN_SAP_XEP: Record<SapXep, string> = {
    ten: "tên",
    gia: "giá",
    danhMuc: "danh mục"
};

const dsSp : SanPham[] = [
    { id: "sp1", ten: "Áo thun trắng", gia: 150000, danhMuc: "Áo", soLuong: 10 },
    { id: "sp2", ten: "Áo sơ mi xanh", gia: 320000, danhMuc: "Áo", soLuong: 5 },
    { id: "sp3", ten: "Quần jean", gia: 450000, danhMuc: "Quần", soLuong: 8 },
    { id: "sp4", ten: "Quần short kaki", gia: 220000, danhMuc: "Quần", soLuong: 12 },
    { id: "sp5", ten: "Giày thể thao", gia: 890000, danhMuc: "Giày", soLuong: 4 },
    { id: "sp6", ten: "Dép quai ngang", gia: 120000, danhMuc: "Giày", soLuong: 20 },
    { id: "sp7", ten: "Mũ lưỡi trai", gia: 99000, danhMuc: "Phụ kiện", soLuong: 15 },
];

// Hàm thuần, để ngoài component: vừa dùng lúc render, vừa dùng lúc đổi chỗ.
function sapXepTheo(ds: SanPham[], tieuChi: SapXep | null) : SanPham[]
{
    switch (tieuChi) {
        case "ten":
            return ds.toSorted((a, b) => a.ten.localeCompare(b.ten, "vi"));
        case "gia":
            return ds.toSorted((a, b) => a.gia - b.gia);
        case "danhMuc":
            return ds.toSorted((a, b) => a.danhMuc.localeCompare(b.danhMuc, "vi"));
        default:
            return ds;
    }
}

function DanhSachTheoDanhMuc({ds}: {ds: SanPham[]})
{
    const theoDanhMuc = ds.reduce<Record<string, SanPham[]>>((acc, sp) => {
            (acc[sp.danhMuc] ??= []).push(sp);
            return acc;
        }, {});
    return (
        <>
            {
                Object.entries(theoDanhMuc).map(([danhMuc, dsCon]) =>
                    <section key={danhMuc}>
                        <h2>{danhMuc} tổng tiền: {dsCon.reduce<number>((sum, sp) => sum + sp.gia*sp.soLuong, 0)}</h2>
                        <ul>
                            {dsCon.map((sp) => <li key={sp.id}>{sp.ten}</li>)}
                        </ul>
                    </section>
                )
            }
        </>
    )
}

export default function DanhSachSanPham()
{
    const [ds, setDs] = useState<SanPham[]>(dsSp);
    const [noiDungSapXep, setNoiDungSapXep] = useState<SapXep | null>(null);
    const [danhMucLoc, setDanhMucLoc] = useState<string | null>(null);

    // Lấy từ dữ liệu chứ không gõ tay → thêm danh mục mới là tự có trong bộ lọc.
    const dsDanhMuc = [...new Set(ds.map((sp) => sp.danhMuc))];
    const dsDaLoc = danhMucLoc === null ? ds : ds.filter((sp) => sp.danhMuc === danhMucLoc);
    const dsHienThi = sapXepTheo(dsDaLoc, noiDungSapXep);

    // Đổi chỗ với dòng ĐANG ĐỨNG CẠNH trên màn hình (buoc = -1 là lên, 1 là xuống).
    // Nếu đang sắp xếp: chốt thứ tự đang thấy vào `ds` rồi tắt sắp xếp — không thì sort sẽ xếp lại ngay
    // và bấm ▲▼ nhìn như không có tác dụng.
    // Đổi trên TOÀN BỘ `ds` (không phải dsHienThi) để các sản phẩm đang bị lọc ẩn không bị mất.
    function doiCho(id: string, buoc: -1 | 1)
    {
        const viTri = dsHienThi.findIndex((sp) => sp.id === id);
        const sanPham = dsHienThi[viTri];
        const hangXom = dsHienThi[viTri + buoc];
        if(!sanPham || !hangXom)
            return;

        const thuTuDangThay = sapXepTheo(ds, noiDungSapXep);
        setDs(thuTuDangThay.map((sp) =>
            sp.id === sanPham.id ? hangXom
            : sp.id === hangXom.id ? sanPham
            : sp
        ));
        setNoiDungSapXep(null);
    }

    function bamLen(id: string)
    {
        doiCho(id, -1);
    }

    function bamXuong(id: string)
    {
        doiCho(id, 1);
    }

    // Tìm vị trí sản phẩm gốc, chèn bản sao (id mới) ngay sau nó.
    // toSpliced trả về MẢNG MỚI, không đụng vào `ds` → không cần tự dời từng phần tử bằng vòng lặp.
    function nhanBan(sanPham: SanPham)
    {
        const viTri = ds.findIndex((sp) => sp.id === sanPham.id);
        const banSao = {...sanPham, id: crypto.randomUUID()};
        setDs(ds.toSpliced(viTri + 1, 0, banSao));
    }

    function hamSapXep(sx: SapXep)
    {
        if(sx === noiDungSapXep)
            setNoiDungSapXep(null);
        else
            setNoiDungSapXep(sx);
    }

    return (
        <>
            {SAP_XEP_BO.map((sapXep) => (
                <button
                    key={sapXep}
                    aria-pressed={sapXep === noiDungSapXep}
                    onClick={() => hamSapXep(sapXep)}
                >
                    sắp xếp theo {NHAN_SAP_XEP[sapXep]}
                </button>
            ))}
            <select
                aria-label="Lọc theo danh mục"
                value={danhMucLoc ?? ""}
                onChange={(e) => setDanhMucLoc(e.target.value || null)}
            >
                <option value="">Tất cả danh mục</option>
                {dsDanhMuc.map((danhMuc) => (
                    <option key={danhMuc} value={danhMuc}>{danhMuc}</option>
                ))}
            </select>
            <ul>
                {dsHienThi.map((sp, index) => (
                    <DongSanPham
                        key={sp.id}
                        sanPham={sp}
                        coTheLen={index > 0}
                        coTheXuong={index < dsHienThi.length - 1}
                        onBamLen={bamLen}
                        onBamXuong={bamXuong}
                        onNhanBan={nhanBan}
                    />
                ))}
            </ul>
            <DanhSachTheoDanhMuc ds={dsHienThi} />
            {dsHienThi.length === 0 && <p>Không có sản phẩm nào phù hợp.</p>}
        </>
    )
}
