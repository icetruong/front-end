import { Nut } from "../ui/Nut";

type ChanTrangProps = {
    daTai: number,
    tongSo: number
}


export function ChanTrang({daTai, tongSo} : ChanTrangProps)
{
    return (
        <footer className="chan-trang">
            <Nut className="nut">Tải thêm</Nut>
            <span>Đã tải {daTai}/{tongSo}</span>
            {/* Nâng cao 15: phần tử để IntersectionObserver theo dõi (bỏ nếu không làm) */}
            <div className="moc-cuoi"></div>
        </footer>
    );
}