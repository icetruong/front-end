import { useState, type ReactNode } from "react";
import { The } from "../../bai-02/ui/The";
import styles from "./TheMoRong.module.css";

type TheMoRongProps = {
    tieuDe: string,
    children: ReactNode
};

export function TheMoRong({ tieuDe, children }: TheMoRongProps)
{
    // TODO: state đóng/mở
    const [dangMo, setDangMo] = useState(false);

    return (
        <The
            dauThe={
                <button
                    type="button"
                    className={styles["tieu-de"]}
                    onClick={() => {setDangMo((d) => !d)}}
                >
                    <span>{tieuDe}</span>
                    <span>{dangMo ? "▲" : "▼"}</span>
                </button>
            }
        >
            {/* TODO: chỉ hiện nội dung khi đang mở */}
            {dangMo && children}
        </The>
    );
}
