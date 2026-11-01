import { useEffect, useState } from "react";


export function useMediaQuery(truyVan: string)
{
    const [match, setMatch] = useState(() => window.matchMedia(truyVan).matches);

    useEffect(() => {
        // CHƯA SỬA: khi truyVan đổi, match vẫn giữ kết quả của truy vấn cũ cho đến lần "change" tiếp theo.
        // Ví dụ đổi từ "(max-width: 600px)" sang "(max-width: 2000px)" trên màn hình 1000px:
        // đúng ra phải là true, nhưng Hook vẫn trả về false.
        // Khởi tạo lười chỉ chạy một lần nên không giúp được chỗ này.
        // Hướng sửa: sau dòng tạo mq bên dưới, cập nhật state theo mq.matches của truy vấn mới.
        const mq = window.matchMedia(truyVan);
        const xuLy = (e: MediaQueryListEvent) => {
            setMatch(e.matches);
        };

        mq.addEventListener("change", xuLy);

        return () => mq.removeEventListener("change", xuLy);
    }, [truyVan]);
    
    return match;
}