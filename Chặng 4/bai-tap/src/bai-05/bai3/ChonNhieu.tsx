
type YeuThich = {
    id: number,
    name: string
}

type ChonNhieuProps = {
    dsDaChon: number[],
    onChon: (ds: number[]) => void;
}

const dsYeuThich: YeuThich[] = [
    {id: 1, name: "yeu thich 1"},
    {id: 2, name: "yeu thich 2"},
    {id: 3, name: "yeu thich 3"},
    {id: 4, name: "yeu thich 4"},
    {id: 5, name: "yeu thich 5"},
    {id: 6, name: "yeu thich 6"},
]

export function ChonNhieu({dsDaChon, onChon} : ChonNhieuProps)
{
    function xuLyThayDoiChon(item: YeuThich)
    {
        onChon(dsDaChon.includes(item.id) ? dsDaChon.filter((id) => item.id !== id) : [...dsDaChon, item.id]);
    }
    return (
        <>
            {dsYeuThich.map((item) => (
                <label key={item.id}>
                    <input type="checkbox" checked={dsDaChon.includes(item.id)} onChange={() => xuLyThayDoiChon(item)}/>
                    {item.name}
                </label>
            ))}
            <button type="button" onClick={() => onChon(dsYeuThich.map((item) => item.id))}>Chọn tất cả</button>   
            <button type="button" onClick={() => onChon([])}>Bỏ chọn tất cả</button>
        </>
    )
}