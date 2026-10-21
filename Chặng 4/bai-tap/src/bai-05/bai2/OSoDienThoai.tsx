import { useState } from "react"


export function OSoDienThoai()
{
    const [sdt, setSdt] = useState("");

    function formatSo(sdt: string) : string
    {
        if(sdt.length <= 4)
            return sdt.substring(0, 4);
        else if(sdt.length <= 7)
            return sdt.substring(0, 4) + " " + sdt.substring(4, 7)
        else 
            return sdt.substring(0, 4) + " " + sdt.substring(4, 7) + " " + sdt.substring(7);
    }

    return (
        <input type="tel" value={formatSo(sdt)} onChange={(e) => {
            const chiSo = e.target.value.replace(/\D/g, "").slice(0, 10);
            setSdt(chiSo);
        }}/>
    );
}