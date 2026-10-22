import { Nut } from "../../bai-02/ui/Nut";
import type { BoLoc } from "./kieu";
import styles from "./ThanhCongCu.module.css";

const CAC_BO_LOC: { giaTri: BoLoc, nhan: string }[] = [
    { giaTri: "tat-ca", nhan: "Tất cả" },
    { giaTri: "chua-xong", nhan: "Chưa xong" },
    { giaTri: "da-xong", nhan: "Đã xong" },
];

type ThanhCongCuProps = {
    boLoc: BoLoc,
    soChuaXong: number,
    tongSo: number,
    noiDungTimKiem: string,
    onDoiBoLoc: (boLoc: BoLoc) => void,
    onSapXep: () => void,
    onDaoThuTu: () => void,
    onXoaDaXong: () => void,
    onXemLichSu: () => void,
    onTimKiem: (timKiem: string) => void
};

export function ThanhCongCu({
    boLoc, soChuaXong, tongSo, noiDungTimKiem, 
    onDoiBoLoc, onSapXep, onDaoThuTu, onXoaDaXong, onXemLichSu, onTimKiem
}: ThanhCongCuProps)
{
    return (
        <div className={styles["thanh-cong-cu"]}>
            <div className={styles.hang}>
                {CAC_BO_LOC.map(({ giaTri, nhan }) => (
                    <Nut
                        key={giaTri}
                        kichThuoc="nho"
                        bienThe={giaTri === boLoc ? "chinh" : "vien"}
                        onClick={() => onDoiBoLoc(giaTri)}
                    >
                        {nhan}
                    </Nut>
                ))}
                <span className={styles["bo-dem"]}>
                    {soChuaXong} việc chưa xong / {tongSo} việc
                </span>
            </div>

            <div className={styles.hang}>
                <Nut kichThuoc="nho" bienThe="phu" onClick={onSapXep}>Sắp xếp A–Z</Nut>
                <Nut kichThuoc="nho" bienThe="phu" onClick={onDaoThuTu}>Đảo thứ tự</Nut>
                <Nut kichThuoc="nho" bienThe="nguy-hiem" onClick={onXoaDaXong}>Xóa đã xong</Nut>
                <Nut kichThuoc="nho" bienThe="vien" onClick={onXemLichSu}>Xem lịch sử</Nut>
            </div>

            {/* Không giữ state riêng: giá trị lấy thẳng từ cha, gõ tới đâu báo cha tới đó → lọc ngay */}
            <input
                type="search"
                aria-label="Tìm việc"
                placeholder="Tìm việc..."
                value={noiDungTimKiem}
                onChange={(e) => onTimKiem(e.target.value)}
            />
        </div>
    );
}
