import styles from "./The.module.css";
import type { ReactNode } from "react";

type TheProps = {
    dauThe?: ReactNode,
    children: ReactNode,
    chanThe?:ReactNode,
    // [NOTE] SAI: gõ nhầm tên — đề yêu cầu `noiBat` (nổi bật), bạn viết `notBat`.
    //   TypeScript không báo vì nó nhất quán trong file, nhưng người dùng viết <The noiBat> sẽ bị báo lỗi
    //   "Property 'noiBat' does not exist". Tên prop là API của component → sai tên là sai API.
    //   Sửa cả ở đây và ở chỗ destructuring + dòng className bên dưới.
    noiBat?: boolean
};

// [NOTE] NÊN SỬA: hàm cx giờ đã bị chép ở Nut.tsx, The.tsx (và MayTinh.tsx bài 01).
//   Đến lần chép thứ 2 là lúc nên tách ra file chung, ví dụ ui/cx.ts rồi import vào — DRY.
//   HuyHieu.tsx và ThongBao.tsx cũng có thể dùng nó thay cho template string.

function cx(...lop: (string | null | undefined | false)[])
{
    return lop.filter(Boolean).join(" ");
}

export function The({dauThe, children, chanThe, noiBat} : TheProps)
{
    return (
        <div className={cx(styles.the, noiBat && styles["noi-bat"])}>
            {dauThe && <div className={styles["dau-the"]}>{dauThe}</div>}
            <div className={styles["than-the"]}>{children}</div>
            {chanThe && <div className={styles["chan-the"]}>{chanThe}</div>}
        </div>
    )
}

