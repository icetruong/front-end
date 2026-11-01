import {useEffect, useRef, type RefObject } from "react";


export function useBamRaNgoai(ref: RefObject<HTMLElement | null>, xuLy: () => void)
{
    const xuLyRef = useRef(xuLy);

    useEffect(() => {
        xuLyRef.current = xuLy;
    })

    useEffect(() => {
        const click = (e: MouseEvent) => {
            if(ref.current === null)
                return;
            if(!ref.current?.contains(e.target as Node))
                xuLyRef.current();
        }

        document.addEventListener("mousedown", click );

        return () => document.removeEventListener("mousedown", click);
    }, [ref]);
}