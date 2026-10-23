import { The } from "../../bai-02/ui/The";
import { DongViec } from "./DongViec";
import { GoiYViec } from "./GoiYViec";
import type { BoLoc, Viec } from "./kieu";
import { ThanhCongCu } from "./ThanhCongCu";
import styles from "./DanhSachViec.module.css";
import { useEffect, useState } from "react";
import { kho } from "./kho";

// Dữ liệu giả để giao diện có cái hiển thị — thay bằng state của bạn
const DU_LIEU_GIA: Viec[] = [
    { id: 1, noiDung: "Học useState", daXong: true },
    { id: 2, noiDung: "Đi chợ", daXong: false },
];

// Giữ tham chiếu tới mảng lúc mới tải trang — cũng chính là mảng truyền vào useState bên dưới.
// Mảng này lẽ ra phải đứng yên mãi mãi: nó là "ảnh chụp" lần render đầu tiên.
const mangLucTai = DU_LIEU_GIA;

// Công tắc thí nghiệm: true = bật/tắt bằng cách SAI, false = cách ĐÚNG.
// Quan sát xong thì đổi về false — đó là bước "khôi phục cách đúng" của đề.
const DUNG_CACH_SAI = false;

// Kiểm tra MỘT việc: phải là object (không phải null) và đủ 3 trường đúng kiểu
function laViec(x: unknown) : x is Viec
{
    return (
        typeof x === "object" && x !== null &&
        "id" in x && typeof x.id === "number" &&
        "noiDung" in x && typeof x.noiDung === "string" &&
        "daXong" in x && typeof x.daXong === "boolean"
    );
}

// Kiểm tra cả danh sách: phải là mảng, và MỌI phần tử đều là việc hợp lệ
function laDsViec(x: unknown) : x is Viec[]
{
    return Array.isArray(x) && x.every(laViec);
}

function docDsTuKho()
{
    return kho.doc("ds-viec", DU_LIEU_GIA, laDsViec);
}

export function DanhSachViec()
{
    // TODO: state ds: Viec[]
    const[ds, setDs] = useState<Viec[]>(docDsTuKho);
    // TODO: state điều kiện lọc
    // TODO: danh sách hiển thị + bộ đếm TÍNH trong lúc render
    const [boLoc, setBoLoc] = useState<BoLoc>("tat-ca");
    const [noiDungTimKiem, setNoiDungTimKiem] = useState("");
    // Chỉ một dòng được sửa tại một thời điểm → lưu id dòng đó, null = không sửa dòng nào
    const [idDangSua, setIdDangSua] = useState<number | null>(null);
    const [banNhap, setBanNhap] = useState("");
    
    const dsHienThi = getDsHienThi();
    const soChuaXong = tinhSoChuaXong();
    const tongSo = ds.length;

    useEffect(() => {
        kho.ghi("ds-viec", ds);
    }, [ds]);

    useEffect(() => {
        function xuLyLuu(e: StorageEvent)
        {
            if(e.key === "ds-viec")
            {
                setDs(docDsTuKho());
            }
        }
        window.addEventListener("storage", xuLyLuu);

        return () => window.removeEventListener("storage", xuLyLuu);
    }, []);

    useEffect(() => {
        const tieuDeTruoc = document.title;

        document.title = `(${soChuaXong}) Việc cần làm`;

        return () => {document.title = tieuDeTruoc};
    }, [soChuaXong])

    function getDsHienThi() : Viec[]
    {
        let hienThi: Viec[] = ds;
        switch(boLoc)
        {
            case "tat-ca":
                hienThi = ds;
                break;
            case "chua-xong":
                hienThi = ds.filter((viec) => !viec.daXong);
                break;
            case "da-xong":
                hienThi = ds.filter((viec) => viec.daXong);
                break;
        }

        // includes: khớp ở bất kỳ đâu; đưa cả hai vế về chữ thường để "đi" vẫn ra "Đi chợ"
        const tuKhoa = noiDungTimKiem.trim().toLocaleLowerCase("vi");
        hienThi = hienThi.filter((viec) => viec.noiDung.toLocaleLowerCase("vi").includes(tuKhoa));

        return hienThi;
    }

    function tinhSoChuaXong() : number
    {
        return ds.filter((viec) => !viec.daXong).length;
    }


    function themViec(noiDung: string)
    {
        setDs((d) => [...d, { id: Date.now(), noiDung: noiDung, daXong: false}])
    }

    function xoaViec(id: number)
    {
        setDs((d) => d.filter((viec) => viec.id !== id));
    }

    function batTatHoanThanh(id: number)
    {
        setDs((d) => d.map((viec) => viec.id === id ? {...viec, daXong: !viec.daXong} : viec));
    }

    // ❌ CÁCH SAI — cố ý viết để quan sát (mục 8, "Bẫy: sửa object bên trong mảng đã sao chép")
    function batTatCachSai(id: number)
    {
        const banSao = [...ds];                       // mảng MỚI, nhưng chỉ chép danh sách tham chiếu
        const i = banSao.findIndex((viec) => viec.id === id);
        banSao[i].daXong = !banSao[i].daXong;         // banSao[i] vẫn là object CŨ → mảng cũ cũng đổi theo
        setDs(banSao);
        // Vì sao không viết trong setDs((d) => ...) như ví dụ ở mục 8?
        //   StrictMode (main.tsx) chạy hàm cập nhật 2 LẦN ở chế độ dev để bắt đúng loại lỗi này.
        //   Hai lần cùng lật một object → lật rồi lật lại → bấm như không bấm, khó quan sát.
        //   Đặt ở đây (trong hàm xử lý sự kiện, chạy 1 lần) thì thấy rõ hiện tượng hơn.
    }

    function xemLichSu()
    {
        // JSON.stringify để chụp chữ NGAY LÚC IN. Nếu log thẳng object, DevTools hiện giá trị
        // MỚI NHẤT khi bạn bấm mở ra → dễ nhìn nhầm.
        console.log("Mảng lúc mới tải:", JSON.stringify(mangLucTai));
        console.log("Mảng hiện tại:   ", JSON.stringify(ds));
    }

    function doiTen(id: number)
    {
        setDs((d) => d.map((viec) => viec.id === id ? {...viec, noiDung: viec.noiDung.toUpperCase()} : viec));
    }

    function sapXep()
    {
        setDs((d) => d.toSorted((a, b) => a.noiDung.localeCompare(b.noiDung, "vi")));
    }

    function daoThuTu()
    {
        setDs((d) => d.toReversed());
    }

    function xoaCacViecDaXong()
    {
        setDs((d) => d.filter((viec) => !viec.daXong));
    }

    function duaLenDau(id: number)
    {
        setDs((d) => {
            const viec = d.find((viec) => viec.id === id);
            if(viec === undefined)
                return d;
            const newDs = d.filter((viec) => viec.id !== id);
            return [viec, ...newDs];
        });
    }

    // Lấy nội dung HIỆN TẠI của việc ngay lúc bấm Sửa → không bao giờ hiện bản cũ
    function batDauSua(viec: Viec)
    {
        setIdDangSua(viec.id);
        setBanNhap(viec.noiDung);
    }

    function huySua()
    {
        setIdDangSua(null);
    }

    function luuSua()
    {
        const noiDung = banNhap.trim();
        // Sửa thành rỗng thì coi như hủy, giữ nguyên nội dung cũ
        if(idDangSua !== null && noiDung !== "")
            setDs((d) => d.map((viec) => viec.id === idDangSua ? {...viec, noiDung} : viec));
        setIdDangSua(null);
    }

    return (
        <The dauThe="Danh sách việc">
            <div className={styles.khung}>
                <GoiYViec onChon={(noiDung) => {themViec(noiDung)}} />

                <ThanhCongCu
                    boLoc={boLoc}
                    soChuaXong={soChuaXong}
                    tongSo={tongSo}
                    noiDungTimKiem={noiDungTimKiem}
                    onDoiBoLoc={(boLoc) => {setBoLoc(boLoc)}}
                    onSapXep={() => {sapXep()}}
                    onDaoThuTu={() => {daoThuTu()}}
                    onXoaDaXong={() => {xoaCacViecDaXong()}}
                    onXemLichSu={() => {xemLichSu()}}
                    onTimKiem={(timKiem) => {setNoiDungTimKiem(timKiem)}}
                />

                {dsHienThi.length === 0 ? (
                    <p className={styles.rong}>
                        {tongSo === 0 ? "Chưa có việc nào." : "Không có việc nào khớp."}
                    </p>
                ) : (
                    <ul className={styles["danh-sach"]}>
                        {dsHienThi.map((viec) => (
                            <DongViec
                                key={viec.id}
                                viec={viec}
                                dangSua={viec.id === idDangSua}
                                banNhap={banNhap}
                                onBatTat={(id) => {
                                    if (DUNG_CACH_SAI) batTatCachSai(id);
                                    else batTatHoanThanh(id);
                                }}
                                onVietHoa={(id) => {doiTen(id)}}
                                onDuaLenDau={(id) => {duaLenDau(id)}}
                                onXoa={(id) => {xoaViec(id)}}
                                onBatDauSua={(viec) => {batDauSua(viec)}}
                                onDoiBanNhap={(noiDung) => {setBanNhap(noiDung)}}
                                onLuuSua={() => {luuSua()}}
                                onHuySua={() => {huySua()}}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </The>
    );
}
