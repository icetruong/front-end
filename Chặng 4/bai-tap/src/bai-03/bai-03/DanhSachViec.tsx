import { The } from "../../bai-02/ui/The";
import { DongViec } from "./DongViec";
import { GoiYViec } from "./GoiYViec";
import type { BoLoc, Viec } from "./kieu";
import { ThanhCongCu } from "./ThanhCongCu";
import styles from "./DanhSachViec.module.css";
import { useState } from "react";

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
const DUNG_CACH_SAI = true;

export function DanhSachViec()
{
    // TODO: state ds: Viec[]
    const[ds, setDs] = useState<Viec[]>(DU_LIEU_GIA);
    // TODO: state điều kiện lọc
    // TODO: danh sách hiển thị + bộ đếm TÍNH trong lúc render
    const [boLoc, setBoLoc] = useState<BoLoc>("tat-ca");
    
    const dsHienThi = getDsHienThi();
    const soChuaXong = tinhSoChuaXong();
    const tongSo = ds.length;
    function getDsHienThi() : Viec[]
    {
        switch(boLoc)
        {
            case "tat-ca":
                return ds;
            case "chua-xong":
                return ds.filter((viec) => !viec.daXong);
            case "da-xong":
                return ds.filter((viec) => viec.daXong);
        }
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

    return (
        <The dauThe="Danh sách việc">
            <div className={styles.khung}>
                <GoiYViec onChon={(noiDung) => {themViec(noiDung)}} />

                <ThanhCongCu
                    boLoc={boLoc}
                    soChuaXong={soChuaXong}
                    tongSo={tongSo}
                    onDoiBoLoc={(boLoc) => {setBoLoc(boLoc)}}
                    onSapXep={() => {sapXep()}}
                    onDaoThuTu={() => {daoThuTu()}}
                    onXoaDaXong={() => {xoaCacViecDaXong()}}
                    onXemLichSu={() => {xemLichSu()}}
                />

                {dsHienThi.length === 0 ? (
                    <p className={styles.rong}>Chưa có việc nào.</p>
                ) : (
                    <ul className={styles["danh-sach"]}>
                        {dsHienThi.map((viec) => (
                            <DongViec
                                key={viec.id}
                                viec={viec}
                                onBatTat={(id) => {
                                    if (DUNG_CACH_SAI) batTatCachSai(id);
                                    else batTatHoanThanh(id);
                                }}
                                onVietHoa={(id) => {doiTen(id)}}
                                onDuaLenDau={(id) => {duaLenDau(id)}}
                                onXoa={(id) => {xoaViec(id)}}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </The>
    );
}
