
type TrangThaiRongProps = {
    tuKhoa: string
}

export function TrangThaiRong({tuKhoa} : TrangThaiRongProps)
{
    return (
         <div className="thong-bao">
                <p className="thong-bao-icon">🔎</p>
                <p>Không tìm thấy Pokémon nào khớp "{tuKhoa}"</p>
            </div>
    );
}