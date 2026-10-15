import { Nut } from "../ui/Nut";

const TU_KHOA_TIM_KIEM = [
    "pika",
    "char", 
    "bul"
];

type SapXep = "ten" | "hp" | "id"; 

const BO_SAP_XEP: SapXep[] = ['ten', 'id', 'hp'];

type ThanhCongCuProps = {
    dsLoai: string[],
    onTimKiem: (tuKhoa: string) => void,
    onChonLoai: (loai: string) => void,
    onSapXep: (sapXep: SapXep) => void
}

export function ThanhCongCu({dsLoai, onTimKiem, onChonLoai, onSapXep} : ThanhCongCuProps)
{
    return (
        <div className="thanh-cong-cu">
            {/* <input className="o-tim" type="search" placeholder="🔍 Tìm Pokémon..." value={timKiem} onChange={onTimKiem}/> */}
            {TU_KHOA_TIM_KIEM.map((tuKhoa) => (
                <Nut key={tuKhoa} kichThuoc="nho" bienThe="vien" onClick={() => onTimKiem(tuKhoa)}>
                    {tuKhoa}
                </Nut>
            ))}
            <select className="loc-loai" onChange={(e) => onChonLoai(e.target.value)}>
                <option value="">Tất cả loại</option>
                {/* { JS thêm các <option> lấy từ /type} */}
                {dsLoai.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {BO_SAP_XEP.map((sapXep) => (
                <Nut key={sapXep} kichThuoc="nho" bienThe="vien" onClick={() => onSapXep(sapXep)}>
                    {sapXep}
                </Nut>
            ))}
        </div>
    )
}