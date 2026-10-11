import { Nut } from "../ui/Nut";

type KhungLoiProps = {
    thongBao: string,
    onThuLai: () => void
}

export function KhungLoi({onThuLai, thongBao} : KhungLoiProps)
{
    return (
        <div className="thong-bao thong-bao-loi" hidden>
            <p className="thong-bao-icon">⚠️</p>
            <p>{thongBao}</p>
            <Nut className="nut" onClick={onThuLai}>Thử lại</Nut>
        </div>
    );
}