import { useCallback, useState } from "react";


export function useToggle(batDau = false)
{
    const [bat, setBat] = useState(batDau);
    const doi = useCallback(() => setBat((d) => !d), []);
    const datTrue = useCallback(() => setBat(true), []);
    const datFalse = useCallback(() => setBat(false), []);
    return {bat, doi, datTrue, datFalse} as const;
}