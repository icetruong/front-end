import { useEffect } from "react";


export function useTieuDe(tieuDe: string)
{
    useEffect(() => {
        const hienTai = document.title;

        document.title = tieuDe;

        return () => {document.title = hienTai};

    }, [tieuDe]);
}