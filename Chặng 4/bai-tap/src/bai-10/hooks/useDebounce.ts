import { useEffect, useState } from "react";


export function useDebounce<T>(giaTri: T, treMs = 400): T 
{
    const [giaTriTre, setGiaTriTre] = useState(giaTri);

    useEffect(() => {

        const id = setTimeout(() => setGiaTriTre(giaTri), treMs);
        return () => clearTimeout(id);
    }, [giaTri, treMs]);

    return giaTriTre;
}