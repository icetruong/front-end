import { useState } from "react";
import { Nut } from "../../bai-02/ui/Nut";
import { The } from "../../bai-02/ui/The";
import styles from "./BoDemNangCao.module.css";

const CAC_BUOC = [1, 5, 10];

export function BoDemNangCao()
{
    // TODO: state lịch sử (mảng số) + state bước nhảy
    const [dsls, setDsls] = useState<number[]>([0]);
    const [buoc, setBuoc] = useState(1);
    // TODO: giá trị hiện tại TÍNH RA từ lịch sử, không lưu riêng
    const giaTri = dsls[dsls.length - 1];
    const coTheHoanTac = dsls.length>1;

    return (
        <The dauThe="Bộ đếm nâng cao">
            <p className={styles["gia-tri"]}>{giaTri}</p>

            <div className={styles.hang}>
                <span className={styles.nhan}>Bước:</span>
                {CAC_BUOC.map((b) => (
                    <Nut
                        key={b}
                        kichThuoc="nho"
                        bienThe={b === buoc ? "chinh" : "vien"}
                        onClick={() => {setBuoc(b)}}
                    >
                        {b}
                    </Nut>
                ))}
            </div>

            <div className={styles.hang}>
                <Nut bienThe="phu" onClick={() => {if(giaTri-buoc >= 0) setDsls([...dsls, giaTri-buoc])}}>-{buoc}</Nut>
                <Nut onClick={() => {setDsls([...dsls, giaTri+buoc])}}>+{buoc}</Nut>
                <Nut onClick={() => {setDsls([...dsls, giaTri+5])}}>+5</Nut>
                <Nut onClick={() => {setDsls([...dsls, giaTri*2])}}>×2</Nut>
            </div>

            <div className={styles.hang}>
                <Nut bienThe="vien" disabled={!coTheHoanTac} onClick={() => {setDsls(dsls.slice(0, -1))}}>
                    Hoàn tác
                </Nut>
                <Nut bienThe="nguy-hiem" onClick={() => {setDsls([...dsls, 0])}}>
                    Đặt lại
                </Nut>
            </div>
        </The>
    );
}
