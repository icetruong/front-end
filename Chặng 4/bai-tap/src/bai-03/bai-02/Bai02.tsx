import { BoDemNangCao } from "./BoDemNangCao";
import { ChonMau } from "./ChonMau";
import { TheMoRong } from "./TheMoRong";

// Gom 3 component để hiển thị cùng lúc trong App
export function Bai02()
{
    return (
        <div style={{ display: "grid", gap: "1.5rem", maxWidth: 720, margin: "2rem auto" }}>
            <BoDemNangCao />

            {/* Ba thẻ cạnh nhau — mở cái này, hai cái kia phải không đổi */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                <TheMoRong tieuDe="Thẻ 1">Nội dung thẻ 1</TheMoRong>
                <TheMoRong tieuDe="Thẻ 2">Nội dung thẻ 2</TheMoRong>
                <TheMoRong tieuDe="Thẻ 3">Nội dung thẻ 3</TheMoRong>
            </div>

            <ChonMau />
        </div>
    );
}
