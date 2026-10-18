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
    nguoiNhan: NguoiDung,
    noiDung: string,
    onDoiNoiDung: (noiDung: string) => void,
    onGui: () => void
}

// Không còn state riêng: nội dung do cha giữ và truyền xuống.
// Component có bị hủy/tạo lại thì nháp vẫn nằm an toàn ở cha.
function KhungTroChuyen({ nguoiNhan, noiDung, onDoiNoiDung, onGui }: KhungTroChuyenProps)
{
    function guiTin(e: React.FormEvent<HTMLFormElement>)
    {
        e.preventDefault();
        onGui();
    }

    return (
        <section className={styles["tro-chuyen"]}>
            <h2 className={styles["dau-khung"]}>Đang chat với: {nguoiNhan.ten}</h2>
            <p className={styles["tin-nhan"]}>Chưa có tin nhắn nào.</p>
            <form className={styles["o-soan"]} onSubmit={guiTin}>
                <input
                    className={styles["o-nhap"]}
                    placeholder={`Nhắn cho ${nguoiNhan.ten}...`}
                    aria-label={`Soạn tin cho ${nguoiNhan.ten}`}
                    value={noiDung}
                    onChange={(e) => onDoiNoiDung(e.currentTarget.value)}
                />
                <button type="submit" className={styles["nut-gui"]}>Gửi</button>
            </form>
        </section>
    );
}

export default function TroChuyenNangCao()
{
    const [idNguoiDangChon, setIdNguoiDangChon] = useState(nguoiDung[0].id);
    // Mỗi người một bản nháp, tra theo id: { 1: "chào An", 3: "mai họp" }
    const [banNhap, setBanNhap] = useState<Record<number, string>>({});

    // Tìm theo id, không dùng id làm chỉ số mảng (id 1 ≠ phần tử thứ 1).
    const nguoiDangChon = nguoiDung.find((nguoi) => nguoi.id === idNguoiDangChon) ?? nguoiDung[0];

    // Tạo object mới, chỉ thay nháp của người đang chọn, nháp người khác giữ nguyên.
    function doiNoiDung(noiDung: string)
    {
        setBanNhap({ ...banNhap, [idNguoiDangChon]: noiDung });
    }

    function gui()
    {
        doiNoiDung("");
    }

    return (
        <div className={styles.khung}>
            <ul className={styles["danh-sach"]}>
                {nguoiDung.map((nguoi) => (
                    <li key={nguoi.id}>
                        <button
                            type="button"
                            className={cx(styles.nguoi, nguoi.id === idNguoiDangChon && styles["dang-chon"])}
                            aria-pressed={nguoi.id === idNguoiDangChon}
                            onClick={() => setIdNguoiDangChon(nguoi.id)}
                        >
                            <span className={styles.avatar}>{nguoi.ten[0]}</span>
                            {nguoi.ten}
                        </button>
                    </li>
                ))}
            </ul>
            <KhungTroChuyen
                nguoiNhan={nguoiDangChon}
                noiDung={banNhap[idNguoiDangChon] ?? ""}
                onDoiNoiDung={doiNoiDung}
                onGui={gui}
            />
        </div>
    );
}
