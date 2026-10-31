import { useState } from "react";


export function ONhap()
{
    const [oNhap, setONhap] = useState("");
    return <input value={oNhap} onChange={(e) => setONhap(e.target.value)}/>
}