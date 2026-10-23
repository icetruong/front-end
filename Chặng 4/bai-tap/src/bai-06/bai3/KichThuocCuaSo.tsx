import { useEffect, useState } from "react";

type KichThuoc = {
    rong: number,
    cao: number
}

const DO_TRE_MS = 200;

function layKichThuoc() : KichThuoc
{
    return {
        rong: window.innerWidth,
        cao: window.innerHeight
    };
}

export function KichThuocCuaSo()
{
    const [kichThuoc, setKichThuoc] = useState<KichThuoc>(layKichThuoc);

    useEffect(() => {
        let idHenGio: number | undefined;

        function xuLyResize()
        {
            // Còn đang kéo → hủy hẹn giờ cũ, hẹn lại từ đầu
            clearTimeout(idHenGio);
            idHenGio = setTimeout(() => {
                setKichThuoc(layKichThuoc());
            }, DO_TRE_MS);
        }

        window.addEventListener("resize", xuLyResize);

        return () => {
            window.removeEventListener("resize", xuLyResize);
            clearTimeout(idHenGio);
        };
    }, []);

    return (
        <>
            <p>Rộng: {kichThuoc.rong}px</p>
            <p>Cao: {kichThuoc.cao}px</p>
        </>
    )
}
