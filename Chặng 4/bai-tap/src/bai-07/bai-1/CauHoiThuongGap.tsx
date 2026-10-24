import { useState } from "react";
import { MucAccordion } from "./MucAccordion";


export function CauHoiThuongGap() {

    const [idDangMo, setIdDangMo] = useState<Set<number>>(new Set());
    const [choPhepNhieu, setChoPhepNhieu] = useState(false);

    function xuLyMo(id: number)
    {
        if(!choPhepNhieu)
        {
            if(idDangMo.has(id))
                setIdDangMo(new Set());
            else
                setIdDangMo(new Set([id]));
        }
        else
        {    
            const newSet = new Set(idDangMo);
            if(idDangMo.has(id))
            {
                newSet.delete(id)
                setIdDangMo(newSet);
            }
            else
            {
                newSet.add(id);
                setIdDangMo(newSet);
            }
        }
    }

    function chuyenDoi(check: boolean)
    {
        setChoPhepNhieu(check);

        if(!check)
            setIdDangMo(new Set());
    }


    return (
        <>
            <MucAccordion 
                tieuDe="Giao hàng mất bao lâu?"
                mo={idDangMo.has(0)}
                onBam={() =>xuLyMo(0)}
            
            >
                2–3 ngày làm việc.
            </MucAccordion>
            <MucAccordion 
                tieuDe="Có được đổi trả không?"
                mo={idDangMo.has(1)}
                onBam={() =>xuLyMo(1)}
            >
                Trong vòng 7 ngày.
            </MucAccordion>
            <MucAccordion 
                tieuDe="Thanh toán thế nào?"
                mo={idDangMo.has(2)}
                onBam={() => xuLyMo(2)}
            >
                Tiền mặt hoặc chuyển khoản.
            </MucAccordion>
            <label htmlFor="choPhep">Cho phép mở nhiều mục</label>
            <input id="choPhep" type="checkbox" checked={choPhepNhieu}  onChange={(e) => chuyenDoi(e.target.checked)}/>

            {choPhepNhieu && <button type="button" onClick={() => setIdDangMo(new Set([0,1,2]))}>Mở tất cả</button>}
            {choPhepNhieu && <button type="button" onClick={() => setIdDangMo(new Set())}>Đóng tất cả</button>}
        </>
    );
}