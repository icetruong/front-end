import { useState } from "react";
import { OTien, type DonVi } from "./OTien";

// VND là đồng tiền gốc: mọi phép đổi đều đi qua VND
type DonViNgoai = Exclude<DonVi, "VND">;

const DANH_SACH_DON_VI: DonVi[] = ["VND", "USD", "EUR"];
const DANH_SACH_DON_VI_NGOAI: DonViNgoai[] = ["USD", "EUR"];

export function ChuyenDoi()
{
    const [giaTriGo, setGiaTriGo] = useState("");
    const [donViGo, setDonViGo] = useState<DonVi>("VND");
    // Lưu string vì đây cũng là ô người dùng gõ (giống lý do ở câu 2)
    const [tyGia, setTyGia] = useState<Record<DonViNgoai, string>>({ USD: "25000", EUR: "27000" });

    // 1 đơn vị donVi = bao nhiêu VND
    function layTyGia(donVi: DonVi)
    {
        if(donVi === "VND")
            return 1;
        return Number(tyGia[donVi]);
    }

    function giaTriO(donVi: DonVi): string
    {
        if(donVi === donViGo)
            return giaTriGo;

        const so = Number(giaTriGo);
        const tyGiaGo = layTyGia(donViGo);
        const tyGiaO = layTyGia(donVi);

        // NaN > 0 là false, nên điều kiện này bắt luôn tỷ giá rỗng hoặc gõ sai
        if(giaTriGo === "" || Number.isNaN(so) || !(tyGiaGo > 0) || !(tyGiaO > 0))
            return "";

        return String(so * tyGiaGo / tyGiaO);
    }

    function thayDoiGiaTri(donVi: DonVi, giaTri: string)
    {
        setGiaTriGo(giaTri);
        setDonViGo(donVi);
    }

    function thayDoiTyGia(donVi: DonViNgoai, giaTri: string)
    {
        setTyGia({ ...tyGia, [donVi]: giaTri });
    }

    return (
        <>
            {DANH_SACH_DON_VI.map((donVi) => (
                <OTien key={donVi} donVi={donVi} giaTri={giaTriO(donVi)} onDoi={thayDoiGiaTri}/>
            ))}

            {DANH_SACH_DON_VI_NGOAI.map((donVi) => (
                <div key={donVi}>
                    <label htmlFor={`ty-gia-${donVi}`}>Tỷ giá 1 {donVi} = ? VND</label>
                    <input
                        id={`ty-gia-${donVi}`}
                        type="text"
                        value={tyGia[donVi]}
                        onChange={(e) => thayDoiTyGia(donVi, e.target.value)}
                    />
                </div>
            ))}
        </>
    )
}
