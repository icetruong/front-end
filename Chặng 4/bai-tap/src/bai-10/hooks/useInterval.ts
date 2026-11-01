import { useEffect, useRef } from "react";


export function useInterval(callback: () => void, treMs: number | null)
{
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    })

    useEffect(() => {
        if(treMs === null)
            return;
        const id = setInterval(() => callbackRef.current(), treMs);
        return () => clearInterval(id);
    }, [treMs]);
}