import { useEffect, useState } from "react";


export function TrangThaiMang()
{
    const [mang, setMang] = useState(navigator.onLine);

    useEffect(() => {
        function xuLy()
        {
            setMang(navigator.onLine);
        }

        window.addEventListener("online", xuLy);
        window.addEventListener("offline", xuLy);

        return () => {
            window.removeEventListener("online", xuLy);
            window.removeEventListener("offline", xuLy);
        }
    }, []);

    return <p>Mạng: {mang ? "Đang trực tuyến" : "Mất kết nối"}</p>;
}