import type { ComponentProps } from "react";
import styles from "./Nut.module.css"

type NutProps = ComponentProps<"button"> & {
    bienThe?: "chinh" | "phu" | "vien" | "nguy-hiem",
    kichThuoc?: "nho" | "vua" | "lon",
    toanChieuRong?: boolean,
    dangTai?: boolean
};

function cx(...lop: (string | null | undefined | false)[])
{
    return lop.filter(Boolean).join(" ");
}

export function Nut({bienThe = "chinh", kichThuoc = "vua", type = "button",toanChieuRong, dangTai, disabled ,className, children ,...conLai} : NutProps) 
{
    return(
        <button
            {...conLai}
            className={cx(
                styles.nut,
                styles[bienThe], 
                styles[kichThuoc], 
                className, 
                toanChieuRong && styles["toan-chieu-rong"]
            )}
            type={type}
            disabled={dangTai || disabled}
        >
            {dangTai ? "Đang xử lý..." : children}
        </button>
    );
}