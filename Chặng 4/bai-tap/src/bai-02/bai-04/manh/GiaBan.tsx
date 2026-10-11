import styles from "./GiaBan.module.css";

type GiaBanProps = {
    gia: number,
    phanTramGiam?: number
}

export function GiaBan({gia, phanTramGiam} : GiaBanProps)
{
    // Phép so sánh luôn cho ra boolean thật → `dangGiam && ...` không bao giờ vẽ ra số 0
    const dangGiam = phanTramGiam !== undefined && phanTramGiam > 0;
    const giaMoi = dangGiam ? gia - (gia * phanTramGiam) / 100 : gia;
    return (
        <div className={styles["gia-ban"]}>
            <span className={styles["gia-moi"]}>{giaMoi}</span>
            {dangGiam && <span className={styles["gia-cu"]}>{gia}</span>}
            {dangGiam && <span className={styles["phan-tram"]}>{`${phanTramGiam}%`}</span>}
        </div>
    );
}