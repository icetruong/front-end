import { useEffect, useState } from "react";

type ToaDo = {
    x: number,
    y: number
}

export function ViTriChuot()
{
    const [toaDo, setToaDo] = useState<ToaDo>({x: 0, y: 0});
    const [theoDoi, setTheoDoi] = useState(false);

    useEffect(() => {
        if(!theoDoi)
            return;

        function xuLyDiChuyenChuot(e: MouseEvent)
        {
            setToaDo({
                x: e.clientX,
                y: e.clientY
            });
        }

        window.addEventListener("mousemove", xuLyDiChuyenChuot);

        return () => window.removeEventListener("mousemove", xuLyDiChuyenChuot);
    }, [theoDoi]);

    return (
        <>
            <label>
                <input
                    type="checkbox"
                    checked={theoDoi}
                    onChange={(e) => setTheoDoi(e.target.checked)}
                />
                Theo dõi chuột
            </label>
            <p>Tọa độ: x: {toaDo.x} y: {toaDo.y}</p>
        </>
    )
}
