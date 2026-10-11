import type { ReactNode } from "react";


type DauTrangProps = {
    thanhCongCu : ReactNode,
    tabYeuThich : ReactNode,
    name: string,
};

export function DauTrang({thanhCongCu, tabYeuThich, name} : DauTrangProps)
{
    return (
        <header className="dau-trang">
            <h1>{name}</h1>

            {thanhCongCu}
            
            {/* {Nâng cao 17: tab Yêu thích (bỏ nếu không làm)} */}
            {tabYeuThich}
        </header>
    )
}