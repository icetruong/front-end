import { Nut } from "../../bai-02/ui/Nut";
import type { Viec } from "./kieu";
import styles from "./DongViec.module.css";

type DongViecProps = {
    viec: Viec,
    onBatTat: (id: number) => void,
    onVietHoa: (id: number) => void,
    onDuaLenDau: (id: number) => void,
    onXoa: (id: number) => void
};

function cx(...lop: (string | null | undefined | false)[])
{
    return lop.filter(Boolean).join(" ");
}

export function DongViec({ viec, onBatTat, onVietHoa, onDuaLenDau, onXoa }: DongViecProps)
{
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
                <Nut kichThuoc="nho" bienThe="nguy-hiem" onClick={() => onXoa(viec.id)}>Xóa</Nut>
            </div>
        </li>
    );
}
