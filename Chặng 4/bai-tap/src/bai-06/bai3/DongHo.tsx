import { useEffect, useState } from "react";

function layGio() : string
{
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

export function DongHo()
{
    const [gio, setGio] = useState(layGio);
    const [dung, setDung] = useState(false);
    

    useEffect(() => {
        if(dung)
            return ;
        const id = setInterval(() => {
            setGio(layGio());
        }, 1000);

        return () => clearInterval(id);
    }, [dung]);

    return (
        <>
            <p>Giờ: {gio}</p>
            <button onClick={() => {setDung((d) => !d); setGio(layGio())}}>{dung ? "Tiếp tục" : "Tạm dừng"}</button>
           
        </>
    )
}