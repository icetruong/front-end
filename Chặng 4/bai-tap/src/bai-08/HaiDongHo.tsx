import { DongHoBam } from "./DongHoBam";

// Ý 6: hai đồng hồ cùng một component, mỗi cái có state và ref riêng
export function HaiDongHo()
{
    return (
        <>
            <h3>Đồng hồ 1</h3>
            <DongHoBam />
            <h3>Đồng hồ 2</h3>
            <DongHoBam />
        </>
    )
}
