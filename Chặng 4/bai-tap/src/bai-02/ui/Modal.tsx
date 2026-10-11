import styles from "./Modal.module.css";
import type { ReactNode } from "react";

type ModalProps = {
    tieuDe:string,
    children: ReactNode,
    onDong: () => void,
    chanModal?: ReactNode
}

export function Modal({tieuDe, children, onDong, chanModal} : ModalProps)
{
    return (
        <div className={styles["lop-phu"]}>
            <div className={styles["hop"]}>
                <div className={styles["dau-modal"]}>
                    <h2 className={styles["tieu-de"]}>{tieuDe}</h2>
                    {/* [NOTE] SAI 1: nút không có nội dung gì ở giữa → hiện ra một nút rỗng, không thấy dấu ×.
                        Cần đặt ký tự × vào giữa thẻ.
                        [NOTE] SAI 2: không nên dùng <Nut> ở đây. Nut tự gắn styles.nut + .chinh + .vua
                        (nền xanh, viền, padding), đánh nhau với .nut-dong (nền trong suốt, không viền).
                        Hai bên cùng độ ưu tiên CSS nên bên nào thắng phụ thuộc thứ tự nạp file CSS → kết quả không chắc chắn.
                        Nút × là nút đặc thù của Modal → dùng thẳng <button type="button" className={styles["nut-dong"]} ...>.
                        (Nut dành cho nút "chuẩn" của app, không phải mọi thứ bấm được.) */}
                    <button type="button" className={styles["nut-dong"]} onClick={onDong} aria-label="Đóng">
                        x
                    </button>
                </div>
                <div className={styles["than-modal"]}>
                    {children}
                </div>
                {/* [NOTE] SAI: có kiểm tra `chanModal &&` đúng, nhưng QUÊN đặt {chanModal} vào trong div
                    → truyền nút vào chanModal thì chỉ hiện một dải trống, các nút biến mất.
                    So với The.tsx dòng chanThe — bạn làm đúng ở đó, đây chỉ là sót. */}
                {chanModal && <div className={styles["chan-modal"]}>{chanModal}</div>}
            </div>
        </div>
    )
}