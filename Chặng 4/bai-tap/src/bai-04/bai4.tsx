import { useState } from "react";
import styles from "./bai4.module.css";

type NguoiDung = {
    id: number,
    ten: string
}

const nguoiDung: NguoiDung[] = [
    { id: 1, ten: "An" },
    { id: 2, ten: "Bình" },
    { id: 3, ten: "Cường" },
];

function cx(...lop: (string | null | undefined | false)[])
{
    return lop.filter(Boolean).join(" ");
}

type KhungTroChuyenProps = {
    nguoiNhan: NguoiDung
}

function KhungTroChuyen({ nguoiNhan }: KhungTroChuyenProps)
{
    // TODO: state `noiDung` cho ô soạn tin, nối vào value/onChange của input

    const [noiDung, setNoiDung] = useState("");

    function chat(noiDung: string)
    {
        setNoiDung(noiDung);
    }

    return (
        <section className={styles["tro-chuyen"]}>
            <h2 className={styles["dau-khung"]}>Đang chat với: {nguoiNhan.ten}</h2>
            <p className={styles["tin-nhan"]}>Chưa có tin nhắn nào.</p>
            <form className={styles["o-soan"]}>
                <input
                    className={styles["o-nhap"]}
                    placeholder={`Nhắn cho ${nguoiNhan.ten}...`}
                    aria-label={`Soạn tin cho ${nguoiNhan.ten}`}
                    value={noiDung}
                    onChange={(e) => chat(e.currentTarget.value)}
                />
                <button type="submit" className={styles["nut-gui"]}>Gửi</button>
            </form>
        </section>
    );
}

export default function TroChuyen()
{
    // TODO: state lưu người đang chọn (gợi ý: lưu id, không lưu object)
    const [idNguoiDangChon, setIdNguoiDangChon] = useState<number>(1);
    const nguoiDangChon = nguoiDung[idNguoiDangChon];

    function chonNguoi(id: number)
    {
        if(id !== idNguoiDangChon)
            setIdNguoiDangChon(id);
    }

    return (
        <div className={styles.khung}>
            <ul className={styles["danh-sach"]}>
                {nguoiDung.map((nguoi) => (
                    <li key={nguoi.id}>
                        <button
                            type="button"
                            className={cx(styles.nguoi, nguoi.id === nguoiDangChon.id && styles["dang-chon"])}
                            aria-pressed={nguoi.id === nguoiDangChon.id}
                            // TODO: onClick chọn người này
                            onClick={() => chonNguoi(nguoi.id)}
                        >
                            <span className={styles.avatar}>{nguoi.ten[0]}</span>
                            {nguoi.ten}
                        </button>
                    </li>
                ))}
            </ul>
            {/* TODO bước 4: thêm key để đặt lại state khi đổi người */}
            <KhungTroChuyen key={nguoiDangChon.id} nguoiNhan={nguoiDangChon} />
        </div>
    );
}
