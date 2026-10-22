type OSoDienThoaiProps = {
    sdt: string,
    onDoiSdt : (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => void,
    onBlur?: () => void,
    id?: string,
    // chỉ truyền khi đang có lỗi → vừa bật aria-invalid vừa nối aria-describedby
    idLoi?: string
}

export function OSoDienThoai({sdt , onDoiSdt, onBlur, id, idLoi} : OSoDienThoaiProps)
{
    function formatSo(sdt: string) : string
    {
        if(sdt.length <= 4)
            return sdt.substring(0, 4);
        else if(sdt.length <= 7)
            return sdt.substring(0, 4) + " " + sdt.substring(4, 7)
        else 
            return sdt.substring(0, 4) + " " + sdt.substring(4, 7) + " " + sdt.substring(7);
    }

    return (
        <input
            type="tel"
            id={id}
            value={formatSo(sdt)}
            onChange={(e) => onDoiSdt(e)}
            onBlur={onBlur}
            aria-invalid={idLoi !== undefined}
            aria-describedby={idLoi}
        />
    );
}