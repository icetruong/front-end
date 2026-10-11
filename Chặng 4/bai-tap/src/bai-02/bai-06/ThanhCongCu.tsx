

type ThanhCongCuProps = {
    timKiem: string,
    dsLoai: string[],
    onTimKiem: () => void,
    onChonLoai: (loai: string) => void
}

export function ThanhCongCu({timKiem, dsLoai, onTimKiem, onChonLoai} : ThanhCongCuProps)
{
    return (
        <div className="thanh-cong-cu">
            <input className="o-tim" type="search" placeholder="🔍 Tìm Pokémon..." value={timKiem} onChange={onTimKiem}/>
            <select className="loc-loai" onChange={(e) => onChonLoai(e.target.value)}>
                <option value="">Tất cả loại</option>
                {/* { JS thêm các <option> lấy từ /type} */}
                {dsLoai.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
        </div>
    )
}