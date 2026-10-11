import styles from "./DanhGia.module.css";

type DanhGiaProps = {
    soSao: number,
    toiDa?: number
};

export function DanhGia({soSao, toiDa = 5} : DanhGiaProps)
{
    // Kẹp soSao vào khoảng [0, toiDa] và làm tròn → repeat() không bao giờ nhận số âm hay số lẻ
    const saoHopLe = Math.min(Math.max(Math.round(soSao), 0), toiDa);
    const saoRong = toiDa - saoHopLe;

    return (
        <span className={styles["danh-gia"]}>
            <span className={styles["sao"]}>
                <span className={styles["sao-day"]}>{"★".repeat(saoHopLe)}</span>
                <span className={styles["sao-rong"]}>{"☆".repeat(saoRong)}</span>
            </span>
            <span className={styles["diem"]}>{saoHopLe}/{toiDa}</span>
        </span>
    );
}
