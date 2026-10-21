import { useState } from "react";

const TOI_DA = 200;
const NGUONG_CANH_BAO = 20;

export function ODemKyTu()
{
    const [moTa, setMoTa] = useState("");
    const conLai = TOI_DA - moTa.length;
    const sapHet = conLai < NGUONG_CANH_BAO;

    return (
        <>
            <textarea value={moTa} onChange={(e) => setMoTa(e.target.value.slice(0, TOI_DA))} />
            <p style={{ color: sapHet ? "red" : undefined }}>{moTa.length} / {TOI_DA}</p>
        </>
    );
}
