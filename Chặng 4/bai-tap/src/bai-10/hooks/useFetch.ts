import { useCallback, useEffect, useRef, useState } from "react";

type TrangThaiFetch<T> =
  | { loai: "khong-tai" }
  | { loai: "dang-tai" }
  | { loai: "loi"; thongBao: string }
  | { loai: "thanh-cong"; duLieu: T };

export function useFetch<T>(url: string | null, kiemTra: (x: unknown) => x is T) {
  const [trangThai, setTrangThai] = useState<TrangThaiFetch<T>>({ loai: "dang-tai" });
  const [lanThu, setLanThu] = useState(0);

  const kiemTraRef = useRef(kiemTra);

  useEffect(() => {
    kiemTraRef.current = kiemTra;
  });

  useEffect(() => {
    if (url === null)
        return;
    const ac = new AbortController();
    (async () => {
        setTrangThai({ loai: "dang-tai" });

        try {
            const res = await fetch(url, {signal: ac.signal});
            if(!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const duLieu = await res.json();
            if(!kiemTraRef.current(duLieu))
                throw new Error("Dữ liệu không hợp lệ");
            setTrangThai({
                loai: "thanh-cong",
                duLieu: duLieu
            });
        }
        catch(e : unknown)
        {
            if(e instanceof DOMException && e.name === "AbortError")
                return;
            setTrangThai({
                loai: "loi",
                thongBao: e instanceof Error ? e.message : "Lỗi không xác định",
            });
        }
    })();

    return () => ac.abort();
  }, [url, lanThu]);

  const taiLai = useCallback(() => setLanThu((n) => n + 1), []);

  const trangThaiHienThi: TrangThaiFetch<T> = url === null ? { loai: "khong-tai" } : trangThai;

  return { trangThai: trangThaiHienThi, taiLai };
}