import { useEffect, useState } from "react";


export function useKichThuocCuaSo()
{
    const [rong, setRong] = useState(window.innerWidth);
    const [cao, setCao] = useState(window.innerHeight);

    useEffect(() => {
        let idTimeour: number | undefined;
        const thayDoi = () => {
            clearTimeout(idTimeour);
            idTimeour = setTimeout(() => {
                setRong(window.innerWidth);
                setCao(window.innerHeight);
            }, 150);     
        };
        window.addEventListener("resize", thayDoi);

        return () => {
            window.removeEventListener("resize", thayDoi);
            clearTimeout(idTimeour);
        }
    }, []);

    return {rong, cao};
}