import { useState } from "react";

// [NOTE] TỔNG KẾT: phần code đúng đề ✅ — checkbox không điều khiển, ghi chú có useState riêng, đủ 4 nút,
// có nút gạt index/id, các hàm setDs đều tạo mảng mới (dùng toReversed chứ không reverse — chuẩn).
// CÒN THIẾU: file `ghi-chu.md` với bảng 4 thao tác × 2 chế độ + câu "thao tác nào cho kết quả giống nhau, vì sao".
// Đó là phần chính của bài 1, code chỉ là công cụ để làm thí nghiệm.

type Viec = {
    id: number,
    noiDung: string
}

function DongViec({noiDung} : {noiDung: string})
{
    const [ghiChu, setGhiChu] = useState("");
    return (
        <li>
        <span>{noiDung}</span>
        <input type="checkbox" />
        <input
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="Ghi chú..."
        />
        </li>
    );
}

const dsMau : Viec[] = [
    { id: 1, noiDung: "Học React" },
    { id: 2, noiDung: "Làm bài tập" },
    { id: 3, noiDung: "Đọc tài liệu" },
];

export default function ThiNghiemKey()
{
    const [ds, setDs] = useState<Viec[]>(dsMau);
    // [NOTE] Tên `nut` không nói lên ý nghĩa. Nó là "đang dùng key index hay không" → đặt `dungIndex` sẽ dễ đọc hơn.
    const [nut, setNut] = useState(false);

    function themLenDau()
    {
        setDs((d) => [{id: Date.now(), noiDung: "Việc mới"}, ...d]);
    }

    function themVaoCuoi()
    {
        setDs((d) => [...d, {id: Date.now(), noiDung: "Việc mới"}]);
    }

    function xoaDongDau()
    {
        setDs((d) => d.filter((_, index) => index !== 0));
    }

    function daoThuTu()
    {
        setDs((d) => d.toReversed());
    }

    function chuyenDoi()
    {
        setNut((d) => !d);
    }

    return (
        <>
            <button onClick={themLenDau}>Thêm lên đầu</button>
            <button onClick={themVaoCuoi}>Thêm vào cuối</button>
            <button onClick={xoaDongDau}>Xóa dòng đầu</button>
            <button onClick={daoThuTu}>Đảo thứ tự</button>

            {/* [NOTE] THIẾU (nhỏ): nút không cho biết đang ở chế độ nào → lúc thí nghiệm dễ nhầm.
                Cho chữ trên nút (hoặc 1 dòng <p>) hiện chế độ hiện tại, vd "Đang dùng: key={index}". */}
            <button onClick={chuyenDoi}>Đảo key của nút</button>
            <ul>
                {/* [NOTE] BẪY (không phải lỗi cú pháp, nhưng làm hỏng thí nghiệm): index là 0,1,2 còn id là 1,2,3
                    → hai bộ key TRÙNG nhau ở số 1 và 2. Khi bấm gạt chế độ, React thấy key 1, 2 vẫn còn nên GIỮ state
                    và gán cho dòng khác. Thử: ở chế độ index tick dòng 2 ("Làm bài tập", key=1) → gạt sang id
                    → dấu tick nhảy sang "Học React" (id=1). Nghĩa là chính việc đổi chế độ đã làm state nhảy lung tung.
                    Cách xử lý: làm sao để hai chế độ không bao giờ có key trùng nhau (gợi ý: key không bắt buộc là số),
                    hoặc reset toàn bộ danh sách mỗi lần đổi chế độ. Tự nghĩ trước nhé, bí thì hỏi. */}
                {/* [NOTE] SAI (mới đổi): `viec.noiDung` KHÔNG dùng làm key được — mọi việc thêm vào đều tên "Việc mới"
                    → bấm "Thêm" 2 lần là có 2 key trùng nhau, React báo lỗi "two children with the same key" và
                    state có thể gán nhầm dòng. Key phải DUY NHẤT và ỔN ĐỊNH → dùng lại `viec.id`.
                    Còn để tránh trùng với index (note ở trên) thì sửa phía index, ví dụ biến cả hai thành chuỗi có tiền tố khác nhau. */}
                {ds.map((viec, index) => (
                    <DongViec key={nut ? index : viec.noiDung} noiDung={viec.noiDung}></DongViec>
                ))}
            </ul>
        </>
    )
}