import { useEffect } from "react"


type TieuDeTrangProps = {
    tieuDe: string
}

export function TieuDeTrang({tieuDe} : TieuDeTrangProps)
{
    useEffect(() => {
        const tieuDeCu = document.title;

        document.title = tieuDe;

        return () => {document.title = tieuDeCu};

    }, [tieuDe]);

    return null;
}