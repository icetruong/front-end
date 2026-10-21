import { useState } from "react"


export function OTien()
{
    const [tien, setTien] = useState("");
    const numberTien = Number(tien);

    function renderTien(tien: string) : string
    {
        if(tien === "")
            return "";
        return Number(tien).toLocaleString("vi-VN"); 
    }
    return (
        <>
            <input type="text" value={renderTien(tien)} onChange={(e) => setTien(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))}/>
            {numberTien > 0 && <p>{numberTien}</p>}
        </>
    );
}