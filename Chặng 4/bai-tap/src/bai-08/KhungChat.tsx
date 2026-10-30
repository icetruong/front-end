import { useEffect, useRef, useState } from "react";
import styles from "./KhungChat.module.css";

type TinNhan = {
    id: number,
    noiDung: string,
    cuaToi: boolean
};

// 30 tin ban đầu để khung đủ dài, có thanh cuộn ngay từ đầu
const TIN_BAN_DAU: TinNhan[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    noiDung: `Tin nhắn số ${i + 1}`,
    cuaToi: i % 3 === 0
}));

// Câu mẫu cho nút "Giả lập tin mới"
const CAU_MAU = [
    "Bạn ăn cơm chưa?",
    "Chiều nay họp lúc mấy giờ nhỉ?",
    "Mình vừa đẩy code lên rồi nha",
    "Xem giúp mình cái bug này với",
    "Ok, để mình kiểm tra lại",
    "Tối nay đi cà phê không?",
    "Đoạn này mình chưa hiểu lắm"
];

function cx(...lop: (string | null | undefined | false)[])
{
    return lop.filter(Boolean).join(" ");
}

export function KhungChat()
{
    const [tinNhan, setTinNhan] = useState<TinNhan[]>(TIN_BAN_DAU);

    const [hienNutTinMoi, setHienNutTinMoi] = useState(false);
    const [dangGiaLap, setDangGiaLap] = useState(true);

    const [oNhap, setONhap] = useState("");
    const refDanhTin = useRef<HTMLDivElement>(null);
    const idInterval = useRef<number | null>(null);
    const idTiepTheo = useRef(TIN_BAN_DAU.length + 1);
    const laLanDau = useRef(true);

    useEffect(() => {
        const el = refDanhTin.current;
        if(!el) 
            return;

        // Lần đầu: mở khung ở tin mới nhất, chưa tính là có tin mới
        if(laLanDau.current)
        {
            laLanDau.current = false;
            el.scrollTop = el.scrollHeight;
            return;
        }

        const cHeight = el.clientHeight;
        const sHeight = el.scrollHeight;
        const sTop = el.scrollTop;

        // Effect chạy khi tin mới đã vào DOM, trừ chiều cao của nó để ra vị trí trước khi có tin
        const caoTinCuoi = el.lastElementChild instanceof HTMLElement ? el.lastElementChild.offsetHeight : 0;
        const distanceToBottom = sHeight - sTop - cHeight - caoTinCuoi;
        const isCloseToBottom = distanceToBottom <= 100;

        // Tin của chính mình thì luôn cuộn xuống
        if(isCloseToBottom || tinNhan[tinNhan.length - 1].cuaToi)
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        else
            setHienNutTinMoi(true);

        
    }, [tinNhan]);

    useEffect(() => {
       return () => {
            if(idInterval.current !== null)
                clearInterval(idInterval.current);
        }
    }, [])

    function guiTinNhan(e: React.SubmitEvent<HTMLFormElement>)
    {
        e.preventDefault();
        const noiDung = oNhap.trim();
        if(noiDung === "")
            return;
        const themTin : TinNhan = {
            id: idTiepTheo.current++,
            noiDung,
            cuaToi: true
        }
        setONhap("");
        setTinNhan((d) => [...d, themTin]);
    }

    function giaLapGuiTinMoi()
    {
        if(idInterval.current !== null)
            clearInterval(idInterval.current);
        idInterval.current = window.setInterval(() => {
            const randomNumber = Math.floor(Math.random() * CAU_MAU.length);
            const themTin : TinNhan = {
                id: idTiepTheo.current++,
                noiDung: CAU_MAU[randomNumber],
                cuaToi: false
            };
            setTinNhan((d) => [...d, themTin]);
        }, 2000);
        setDangGiaLap(false);
    }

    function huyGiaLap()
    {
        if(idInterval.current !== null)
            clearInterval(idInterval.current);
        idInterval.current = null;
        setDangGiaLap(true);
    }

    function cuonXuongCuoi()
    {
        setHienNutTinMoi(false);
        const el = refDanhTin.current;
        el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }

    function xuLyCuon()
    {
        const el = refDanhTin.current;
        if(!el) 
            return;
        const khoangCach = el.scrollHeight - el.scrollTop - el.clientHeight;
        if(khoangCach <= 100)
            setHienNutTinMoi(false);
    }

    return (
        <section className={styles.khung}>
            <header className={styles["dau-khung"]}>
                <h3 className={styles["tieu-de"]}>Khung chat</h3>
                {dangGiaLap ? <button type="button" className={styles["nut-phu"]} onClick={giaLapGuiTinMoi}>Giả lập tin mới</button> : <button type="button" className={styles["nut-phu"]} onClick={huyGiaLap}>Hủy giả lập tin mới</button>}
               
            </header>

            {/* .vung-tin không cuộn nên nút ↓ đứng yên, chỉ .danh-tin bên trong cuộn */}
            <div className={styles["vung-tin"]}>
                {/* TODO: gắn onScroll vào đây */}
                <div ref={refDanhTin} className={styles["danh-tin"]} onScroll={xuLyCuon}>
                    {tinNhan.map((tin) => (
                        <p key={tin.id} className={cx(styles.tin, tin.cuaToi && styles["cua-toi"])}>
                            {tin.noiDung}
                        </p>
                    ))}
                </div>

                {hienNutTinMoi && (
                    <button type="button" className={styles["nut-tin-moi"]} onClick={cuonXuongCuoi}>↓ Có tin nhắn mới</button>
                )}
            </div>

            <form className={styles["o-soan"]} onSubmit={guiTinNhan}>
                <input
                    className={styles["o-nhap"]}
                    placeholder="Nhập tin nhắn..."
                    aria-label="Nhập tin nhắn"
                    value={oNhap}
                    onChange={(e) => setONhap(e.target.value)}
                />
                <button type="submit" className={styles["nut-gui"]}>Gửi</button>
            </form>
        </section>
    );
}
