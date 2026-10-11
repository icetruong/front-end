import { HuyHieu } from "../ui/HuyHieu"
import { Nut } from "../ui/Nut"
import { The } from "../ui/The"
import { AnhSanPham } from "./manh/AnhSanPham"
import { DanhGia } from "./manh/DanhGia"
import { GiaBan } from "./manh/GiaBan"
import { TheSanPhamCauHinh } from "./TheSanPhamCauHinh"

export function SoSanh()
{
    return (
        <div>
            <TheSanPhamCauHinh
            ten="ice" 
            gia={100} 
            anh="test"
            coGiamGia phanTramGiam={20} 
            hienDanhGia soSao={10}
            coNutMua nhanNutMua="Mua"
            coHuyHieuMoi hetHang={false}
            >

            </TheSanPhamCauHinh>

            <The 
                dauThe={<HuyHieu mau="do">
                    Mới
                </HuyHieu>}
                chanThe={<Nut>Mua</Nut>}
            >
                <AnhSanPham src="test" alt="test"></AnhSanPham>
                <h3>ice</h3>
                <GiaBan gia={100} phanTramGiam={20}></GiaBan>
                <DanhGia soSao={5} toiDa={5}></DanhGia>
            </The>
        </div>
    )
}