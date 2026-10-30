import { useEffect, useRef, useState } from "react";


function formatTime(totalMilliseconds: number) {
  // 1. Tính toán các thành phần thời gian
  const minutes = Math.floor(totalMilliseconds / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  // Lấy 2 chữ số đầu tiên của mili giây (centi-seconds)
  const centiseconds = Math.floor((totalMilliseconds % 1000) / 10);

  // 2. Định dạng chuỗi luôn có 2 chữ số (VD: 02:05.09)
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const cc = String(centiseconds).padStart(2, '0');

  return `${mm}:${ss}.${cc}`;
}

type TrangThaiDongHo = 
| {loai: "cho"}
| {loai: "dang-chay", luuTru: number}
| {loai: "tam-dung", luuTru: number}

export function DongHoBam()
{
    const [batDau, setBatDau] = useState<number | null>(null);
    const [bayGio, setBayGio] = useState<number | null>(null);
    const [trangThai, setTrangThai] = useState<TrangThaiDongHo>({loai: "cho"});
    const [cacVong, setCacVong] = useState<number[]>([]);
    const idInterval = useRef<number | null>(null);

    let daQua = batDau && bayGio ? bayGio - batDau : 0;
    if(trangThai.loai === "dang-chay")
        daQua += trangThai.luuTru;

    // Vòng: lưu tổng thời gian lúc bấm, khoảng cách và nhanh/chậm tính trong lúc render
    const khoangCach = cacVong.map((tong, i) => tong - (i === 0 ? 0 : cacVong[i - 1]));
    const nhanhNhat = khoangCach.length >= 2 ? Math.min(...khoangCach) : null;
    const chamNhat = khoangCach.length >= 2 ? Math.max(...khoangCach) : null;

    function xuLyBatDau()
    {
        setBatDau(Date.now());
        setBayGio(Date.now());
        if(idInterval.current !== null)
            clearInterval(idInterval.current);
        idInterval.current = window.setInterval(() => setBayGio(Date.now()), 10);
        setTrangThai({loai:"dang-chay", luuTru: 0});
    }

    function xuLyTamDung()
    {
        if(idInterval.current !== null)
            clearInterval(idInterval.current);
        setTrangThai({loai: "tam-dung", luuTru: daQua});
    }

    function xuLyTiepTuc()
    {
        setBatDau(Date.now());
        setBayGio(Date.now());
        if(idInterval.current !== null)
            clearInterval(idInterval.current);
        idInterval.current = window.setInterval(() => setBayGio(Date.now()), 10);
        setTrangThai((d) => {
            if(d.loai === "cho")
                return {loai: "cho"};
            return {loai: "dang-chay", luuTru: d.luuTru};
        });
    }

    function xuLyDatLai()
    {
        setBatDau(null);
        setBayGio(null);
        if(idInterval.current !== null)
            clearInterval(idInterval.current);
        setTrangThai({loai: "cho"});
        setCacVong([]);
    }

    function xuLyGhiVong()
    {
        setCacVong((v) => [...v, daQua]);
    }

    useEffect(() => {
        return () => {
            if(idInterval.current !== null)
                clearInterval(idInterval.current);
        }
    }, []);


    return (
        <>
            <p>{trangThai.loai === "tam-dung" ?formatTime(trangThai.luuTru) : formatTime(daQua)}</p>
            {trangThai.loai === "cho" && <button type="button" onClick={xuLyBatDau}>Bắt đầu</button>}
            {trangThai.loai === "dang-chay" && <button type="button" onClick={xuLyTamDung}>Tạm dừng</button>}
            {trangThai.loai === "tam-dung" && <button type="button" onClick={xuLyTiepTuc}>Tiếp tục</button>}
            {trangThai.loai !== "cho" && <button type="button" onClick={xuLyDatLai}>Đặt lại</button>}
            {trangThai.loai === "dang-chay" && <button type="button" onClick={xuLyGhiVong}>Ghi vòng</button>}
            <ol>
                {khoangCach.map((kc, i) => {
                    const mau = kc === nhanhNhat ? "green" : kc === chamNhat ? "red" : undefined;
                    return (
                        <li key={i} style={{ color: mau }}>
                            Vòng {i + 1}: +{formatTime(kc)} (tổng {formatTime(cacVong[i])})
                        </li>
                    );
                })}
            </ol>
        </>
    )
}