import type { ReactNode } from "react";
import styles from "./HuyHieu.module.css";

type HuyHieuProps = {
    children: ReactNode,
    mau?: "xam" | "xanh" | "do" | "vang",
    // Mã màu tuỳ ý (vd "#7AC74C") — có thì ghi đè màu của biến thể `mau`
    mauNen?: string
};

export function HuyHieu({children, mau = "xam", mauNen} : HuyHieuProps)
{
    const styleTuyChinh = mauNen ? { backgroundColor: mauNen, color: "#fff" } : undefined;

    return (
        <span className={`${styles["huy-hieu"]} ${styles[mau]}`} style={styleTuyChinh}>
            {children}
        </span>
    );
}
