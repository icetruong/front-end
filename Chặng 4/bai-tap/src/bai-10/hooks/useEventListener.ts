import { useEffect, useRef } from "react";


export function useEventListener<K extends keyof WindowEventMap>(
  loai: K,
  xuLy: (e: WindowEventMap[K]) => void,
) {
    const xuLyRef = useRef(xuLy);

    useEffect(() => {
        xuLyRef.current = xuLy;
    })
    useEffect(() => {
        const ham = (e: WindowEventMap[K]) => xuLyRef.current(e);
        window.addEventListener(loai, ham);
        return () => window.removeEventListener(loai, ham);
    }, [loai]);
}