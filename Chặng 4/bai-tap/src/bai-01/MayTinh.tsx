import styles from "./MayTinh.module.css"

export function MayTinh()
{
    return (
        <>
            <div className={styles["may-tinh"]}>
                <div id="man-hinh" className={styles["man-hinh"]}>0</div>

                <div className={styles["ban-phim"]}>
                <button className={"nut nut-hanh-dong"} data-loai="hanh-dong" data-gia-tri="xoa">C</button>
                <button className={styles["nut nut-hanh-dong"]} data-loai="hanh-dong" data-gia-tri="doi-dau">+/-</button>
                <button className={styles["nut nut-hanh-dong"]} data-loai="hanh-dong" data-gia-tri="phan-tram">%</button>
                <button className={styles["nut nut-toan-tu"]} data-loai="toan-tu" data-gia-tri="/">÷</button>

                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="7">7</button>
                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="8">8</button>
                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="9">9</button>
                <button className={styles["nut nut-toan-tu"]} data-loai="toan-tu" data-gia-tri="*">×</button>

                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="4">4</button>
                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="5">5</button>
                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="6">6</button>
                <button className={styles["nut nut-toan-tu"]} data-loai="toan-tu" data-gia-tri="-">−</button>

                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="1">1</button>
                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="2">2</button>
                <button className={styles["nut nut-so"]} data-loai="so" data-gia-tri="3">3</button>
                <button className={styles["nut nut-toan-tu"]} data-loai="toan-tu" data-gia-tri="+">+</button>

                <button className={styles["nut nut-so nut-0"]} data-loai="so" data-gia-tri="0">0</button>
                <button className={styles["nut nut-hanh-dong"]} data-loai="hanh-dong" data-gia-tri="thap-phan">.</button>
                <button className={styles["nut nut-bang"]} data-loai="hanh-dong" data-gia-tri="bang">=</button>
                </div>
            </div>
        </>
    )
}