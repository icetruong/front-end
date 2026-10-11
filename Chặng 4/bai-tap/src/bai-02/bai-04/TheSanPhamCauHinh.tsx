import styles from "./TheSanPhamCauHinh.module.css";

type TheSanPhamProps = {
  ten: string;
  gia: number;
  anh?: string;
  coGiamGia?: boolean;
  phanTramGiam?: number;
  hienDanhGia?: boolean;
  soSao?: number;
  coNutMua?: boolean;
  nhanNutMua?: string;
  coHuyHieuMoi?: boolean;
  hetHang?: boolean;
};

export function TheSanPhamCauHinh({
    ten,
    gia, 
    anh, 
    coGiamGia, 
    phanTramGiam, 
    hienDanhGia, 
    soSao, 
    coNutMua, 
    nhanNutMua, 
    coHuyHieuMoi,
    hetHang
} : TheSanPhamProps)
{
    const thucSuGiamGia = coGiamGia && (phanTramGiam !== undefined);
    const giaMoi = thucSuGiamGia ? gia - (gia * phanTramGiam) / 100 : gia;

    const thucSuCoDanhGia = hienDanhGia && (soSao !== undefined);
    const coNutMuaVaKhongHetHang = coNutMua && !hetHang;
    return (
        <div className={`${styles["the-san-pham"]} ${hetHang && styles["het-hang"]} `}>
            {coHuyHieuMoi && <span className={styles["huy-hieu-moi"]}>Mới</span>}
            {anh && <img src={anh} alt={ten} className={styles["anh"]}></img>}
            <h3 className={styles["ten"]}>{ten}</h3>
            <div className={styles["khoi-gia"]}>
                <span className={styles["gia-moi"]}>{giaMoi}</span>
                {thucSuGiamGia && <span className={styles["gia-cu"]}>{gia}</span>}
                {thucSuGiamGia && <span className={styles["phan-tram"]}>{phanTramGiam}</span>}
            </div>
            {thucSuCoDanhGia && <div className={styles["danh-gia"]}>{soSao}</div>}
            {coNutMuaVaKhongHetHang && <button className={styles["nut-mua"]}>{nhanNutMua ?? "Nút"}</button>}
            {hetHang && <p className={styles["chu-het-hang"]}>Hết Hàng</p>}
        </div>
    )
}