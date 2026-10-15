import { Nut } from "../../bai-02/ui/Nut";
import styles from "./GoiYViec.module.css";

const CAC_GOI_Y = [
    "Học useState",
    "Đi chợ",
    "Tập thể dục",
    "Đọc sách",
    "Rửa bát",
    "Ôn lại closure",
    "Ăn tối",
    "Bài tập React",
];

type GoiYViecProps = {
    onChon: (noiDung: string) => void
};

export function GoiYViec({ onChon }: GoiYViecProps)
{
    return (
        <div className={styles["goi-y"]}>
            <span className={styles.nhan}>Bấm để thêm:</span>
            {CAC_GOI_Y.map((goiY) => (
                <Nut key={goiY} kichThuoc="nho" bienThe="vien" onClick={() => onChon(goiY)}>
                    + {goiY}
                </Nut>
            ))}
        </div>
    );
}
