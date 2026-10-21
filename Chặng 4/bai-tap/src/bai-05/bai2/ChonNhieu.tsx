import { useState } from "react"

type YeuThich = {
    id: number,
    name: string
}

const dsYeuThich: YeuThich[] = [
    {id: 1, name: "yeu thich 1"},
    {id: 2, name: "yeu thich 2"},
    {id: 3, name: "yeu thich 3"},
    {id: 4, name: "yeu thich 4"},
    {id: 5, name: "yeu thich 5"},
    {id: 6, name: "yeu thich 6"},
]

export function ChonNhieu()
{
    const [daChon, setDaChon] = useState<string[]>([]);

    function xuLyThayDoiChon(item: YeuThich)
    {
        setDaChon((d) => d.includes(item.name) ? d.filter((name) => item.name !== name) : [...d, item.name]);
    }
    return (
        <>
            {dsYeuThich.map((item) => (
                <label key={item.id}>
                    <input type="checkbox" checked={daChon.includes(item.name)} onChange={() => xuLyThayDoiChon(item)}/>
                    {item.name}
                </label>
            ))}
            <button type="button" onClick={() => setDaChon(dsYeuThich.map((item) => item.name))}>Chọn tất cả</button>   
            <button type="button" onClick={() => setDaChon([])}>Bỏ chọn tất cả</button>
        </>
    )
}