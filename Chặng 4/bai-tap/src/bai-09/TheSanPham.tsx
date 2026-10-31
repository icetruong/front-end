import { memo } from "react";

export type SanPham = {
    id: number;
    ten: string;
    gia: number;
};

type CauHinh = {
    tienTe: string;
    hienThiThue: boolean;
};

type Props = {
    sp: SanPham;
    cauHinh: CauHinh;
    onThem: (id: number) => void;
    onTangGia: (id: number) => void;
};

export const TheSanPham = memo( function TheSanPham({ sp, cauHinh, onThem, onTangGia }: Props)
{
    console.log("Render:", sp.ten);

    return (
        <div>
            <span>
                {sp.ten} — {sp.gia.toLocaleString("vi-VN")}{cauHinh.tienTe}
                {cauHinh.hienThiThue && " (đã gồm thuế)"}
            </span>
            <button onClick={() => onThem(sp.id)}>Thêm vào giỏ</button>
            <button onClick={() => onTangGia(sp.id)}>Tăng giá 10%</button>
        </div>
    );
})
