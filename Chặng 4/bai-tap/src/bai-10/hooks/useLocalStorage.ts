import { useEffect, useRef, useState } from "react";


function docGiaTri<T>(raw: string | null, macDinh: T, kiemTra?: (x: unknown) => x is T): T {
    if(raw === null)
        return macDinh;

    try {
        const duLieu: unknown = JSON.parse(raw);
        if(kiemTra === undefined)
            return duLieu as T;

        return kiemTra(duLieu) ? duLieu : macDinh;
    } catch {
        return macDinh;
    }
}

export function useLocalStorage<T>(khoa: string, macDinh: T, kiemTra?: (x: unknown) => x is T) {
    const [giaTri, setGiaTri] = useState<T>(() => {
        try {
            return docGiaTri(localStorage.getItem(khoa), macDinh, kiemTra);
        } catch {
            // trình duyệt chặn truy cập localStorage
            return macDinh;
        }
    });

    const kiemTraRef = useRef(kiemTra);
    const macDinhRef = useRef(macDinh);

    useEffect(() => {
        kiemTraRef.current = kiemTra;
        macDinhRef.current = macDinh;
    })

    useEffect(() => {
        try {
            localStorage.setItem(khoa, JSON.stringify(giaTri));
        } catch {
            // hết dung lượng hoặc chế độ ẩn danh — bỏ qua
        }
    }, [khoa, giaTri]);

    useEffect(() => {
        const dongBo = (e: StorageEvent) => {
            // e.key là null khi tab khác gọi localStorage.clear()
            if(e.key !== null && e.key !== khoa)
                return;

            setGiaTri(docGiaTri(e.newValue, macDinhRef.current, kiemTraRef.current));
        }
        window.addEventListener("storage", dongBo);

        return () => window.removeEventListener("storage", dongBo);
    }, [khoa]);

    return [giaTri, setGiaTri] as const;
}
