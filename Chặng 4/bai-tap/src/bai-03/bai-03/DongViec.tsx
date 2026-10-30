import { useEffect, useRef } from "react";
import { Nut } from "../../bai-02/ui/Nut";
import type { Viec } from "./kieu";
import styles from "./DongViec.module.css";

type DongViecProps = {
    viec: Viec,
    dangSua: boolean,
    banNhap: string,
    onBatTat: (id: number) => void,
    onVietHoa: (id: number) => void,
    onDuaLenDau: (id: number) => void,
    onXoa: (id: number) => void,
    onBatDauSua: (viec: Viec) => void,
    onDoiBanNhap: (noiDung: string) => void,
    onLuuSua: () => void,
    onHuySua: () => void
};

function cx(...lop: (string | null | undefined | false)[])
{
    return lop.filter(Boolean).join(" ");
}

export function DongViec({
    viec, dangSua, banNhap,
    onBatTat, onVietHoa, onDuaLenDau, onXoa,
    onBatDauSua, onDoiBanNhap, onLuuSua, onHuySua
}: DongViecProps)
{
    const oSuaRef = useRef<HTMLInputElement>(null);
    const nutSuaRef = useRef<HTMLButtonElement>(null);
    // Cờ: vừa nhấn Escape → chỉ khi đó mới trả focus về nút Sửa
    const canTraFocus = useRef(false);

    // Chạy sau commit: lúc này ô sửa hoặc nút Sửa đã có trong DOM
    useEffect(() => {
        if(dangSua)
        {
            oSuaRef.current?.focus();
            oSuaRef.current?.select();
        }
        else if(canTraFocus.current)
        {
            canTraFocus.current = false;
            nutSuaRef.current?.focus();
        }
    }, [dangSua]);

    function xuLyGui(e: React.FormEvent<HTMLFormElement>)
    {
        e.preventDefault();
        onLuuSua();
    }

    function xuLyPhim(e: React.KeyboardEvent<HTMLInputElement>)
    {
        if(e.key === "Escape")
        {
            canTraFocus.current = true;
            onHuySua();
        }
    }

    // Vẫn trả về <li> ở cả hai chế độ: con trực tiếp của <ul> phải là <li>
    if(dangSua)
        return (
            <li className={styles.dong}>
                <form onSubmit={xuLyGui}>
                    <input
                        ref={oSuaRef}
                        type="text"
                        aria-label="Sửa nội dung việc"
                        value={banNhap}
                        onChange={(e) => onDoiBanNhap(e.target.value)}
                        onKeyDown={xuLyPhim}
                    />
                    <button type="submit">Lưu</button>
                    <button type="button" onClick={onHuySua}>Hủy</button>
                </form>
            </li>
        );

    return (
        <li className={styles.dong}>
            <button
                type="button"
                className={cx(styles.o, viec.daXong && styles["o-xong"])}
                aria-label={viec.daXong ? "Bỏ đánh dấu xong" : "Đánh dấu xong"}
                onClick={() => onBatTat(viec.id)}
            >
                {viec.daXong && "✓"}
            </button>

            <span className={cx(styles["noi-dung"], viec.daXong && styles.xong)}>
                {viec.noiDung}
            </span>

            <div className={styles["hanh-dong"]}>
                <Nut kichThuoc="nho" bienThe="vien" onClick={() => onVietHoa(viec.id)}>Viết hoa</Nut>
                <Nut kichThuoc="nho" bienThe="vien" onClick={() => onDuaLenDau(viec.id)}>Lên đầu</Nut>
                <Nut ref={nutSuaRef} kichThuoc="nho" bienThe="vien" onClick={() => onBatDauSua(viec)}>Sửa</Nut>
                <Nut kichThuoc="nho" bienThe="nguy-hiem" onClick={() => onXoa(viec.id)}>Xóa</Nut>
            </div>
        </li>
    );
}
