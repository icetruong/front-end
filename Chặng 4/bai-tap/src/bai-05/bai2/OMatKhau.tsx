import { useState } from "react"

type DoManh = "yeu" | "trung-binh" | "manh";

const HIEN_THI_DO_MANH: Record<DoManh, { nhan: string; mau: string; rong: string }> = {
    "yeu": { nhan: "Yếu", mau: "red", rong: "33%" },
    "trung-binh": { nhan: "Trung bình", mau: "orange", rong: "66%" },
    "manh": { nhan: "Mạnh", mau: "green", rong: "100%" },
};

// Hàm thuần: mỗi tiêu chí đạt được cộng 1 điểm, tối đa 4
function tinhDoManh(matKhau: string): DoManh
{
    const tieuChi = [
        matKhau.length >= 8,
        /[A-Z]/.test(matKhau),
        /\d/.test(matKhau),
        /[^A-Za-z0-9]/.test(matKhau),
    ];
    const diem = tieuChi.filter(Boolean).length;

    if(diem <= 1)
        return "yeu";
    else if(diem <= 3)
        return "trung-binh";
    else
        return "manh";
}

export function OMatKhau()
{
    const [matKhau, setMatKhau] = useState("");
    const [hienMatKhau, setHienMatKhau] = useState(false);
    const hienThi = HIEN_THI_DO_MANH[tinhDoManh(matKhau)];

    return (
        <>
            <input type={hienMatKhau ? "text" : "password"} value={matKhau} onChange={(e) => setMatKhau(e.target.value)}/>
            <button type="button" onClick={() => setHienMatKhau((d) => !d)}>{hienMatKhau ? "Ẩn" : "Hiện"}</button>
            {matKhau !== "" && (
                <>
                    <div style={{ width: "200px", height: "6px", background: "#ddd" }}>
                        <div style={{ width: hienThi.rong, height: "100%", background: hienThi.mau }} />
                    </div>
                    <p style={{ color: hienThi.mau }}>{hienThi.nhan}</p>
                </>
            )}
        </>
    )
}
