import styles from "./ThongBao.module.css";
import { Nut } from "./Nut";
import type { ReactNode } from "react";

type ThongBaoProps =
| {loai: "thanh-cong", noiDung: string}
| {loai: "loi", noiDung: string, onThuLai: () => void}
| {loai: "canh-bao", noiDung: string, onBoQua?: () => void}

// Chỉ phần nút là khác nhau giữa các loại → tách riêng ra đây
function layHanhDong(props: ThongBaoProps): ReactNode
{
    switch(props.loai)
    {
        case "thanh-cong":
            return null;
        case "loi":
            return (
                <Nut kichThuoc="nho" onClick={props.onThuLai}>
                    Thử lại
                </Nut>
            );
        case "canh-bao":
            if (!props.onBoQua) return null;   // không truyền onBoQua → không có nút
            return (
                <Nut kichThuoc="nho" bienThe="phu" onClick={props.onBoQua}>
                    Bỏ qua
                </Nut>
            );
        default:
        {
            const kiemTra: never = props;   // tt đã bị thu hẹp hết → còn lại never
            return kiemTra;
        }
    }
}

export function ThongBao(props: ThongBaoProps)
{
    const hanhDong = layHanhDong(props);

    return (
        <div className={`${styles["thong-bao"]} ${styles[props.loai]}`}>
            <div className={styles["noi-dung"]}>{props.noiDung}</div>
            {hanhDong && <div className={styles["hanh-dong"]}>{hanhDong}</div>}
        </div>
    );
}
