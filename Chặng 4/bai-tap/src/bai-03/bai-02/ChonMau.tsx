import { useState } from "react";
import { The } from "../../bai-02/ui/The";
import styles from "./ChonMau.module.css";

const CAC_MAU = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
];

function cx(...lop: (string | null | undefined | false)[])
{
    return lop.filter(Boolean).join(" ");
}

export function ChonMau()
{
    // TODO: state lưu CHỈ SỐ hoặc MÃ MÀU đang chọn — không lưu object
    const [mauDangChon, setMauDangChon] = useState(CAC_MAU[0]);

    return (
        <The dauThe="Chọn màu">
            <div className={styles.luoi}>
                {CAC_MAU.map((mau) => (
                    <button
                        key={mau}
                        type="button"
                        aria-label={mau}
                        className={cx(styles.o, mau === mauDangChon && styles["dang-chon"])}
                        style={{ background: mau }}
                        onClick={() => {setMauDangChon(mau)}}
                    />
                ))}
            </div>
            <p className={styles["ket-qua"]}>
                Đang chọn: <strong style={{ color: mauDangChon }}>{mauDangChon}</strong>
            </p>
        </The>
    );
}
