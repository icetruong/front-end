import { useCallback, useMemo, useState } from "react";
import { TheSanPham } from "./TheSanPham";
import type { SanPham } from "./TheSanPham";

const SO_SAN_PHAM = 200;

const DANH_SACH_SAN_PHAM: SanPham[] = Array.from({ length: SO_SAN_PHAM }, (_, i) => ({
    id: i,
    ten: `Sản phẩm ${i + 1}`,
    gia: (i + 1) * 10_000,
}));

export function LuoiSanPham({ tienTe = "đ" }: { tienTe?: string })
{
    const [gio, setGio] = useState<number[]>([]);
    const [ds, setDs] = useState(DANH_SACH_SAN_PHAM);

    const onThem = useCallback((id: number) => {
        setGio((g) => [...g, id]);
    }, []);

    const onTangGia = useCallback((id: number) => {
        setDs((cu) => cu.map((item) => item.id === id ? {...item, gia: item.gia + item.gia /10} : item));
    }, []);

    const cauHinh = useMemo(() => ({ tienTe, hienThiThue: true }), [tienTe]);

    return (
        <>
            <p>Giỏ: {gio.length}</p>
            {ds.map((sp) => (
                <TheSanPham
                    key={sp.id}
                    sp={sp}
                    cauHinh={cauHinh}
                    onThem={onThem}
                    onTangGia={onTangGia}
                />
            ))}
        </>
    );
}
