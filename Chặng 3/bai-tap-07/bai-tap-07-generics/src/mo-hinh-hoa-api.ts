type PhanHoiApi<T> = {
    thanhCong: boolean,
    duLieu: T,
    thongBao?: string
}

type PhanTrang<T> = {
    tongSo: number,
    trangHienTai: number,
    ketQua: T[]
}

type ketQua<T, E = Error> = 
| {ok: true, giaTri: T}
| {ok: false, loi: E }

// ❌ SAI 1 (nghiêm trọng, làm ý 4 LUÔN ra ok: false): dòng const duLieu thiếu `await`.
//    res.json() trả về một Promise, nên duLieu là Promise chứ không phải dữ liệu user.
//    Kiểm tra "là user" trên một Promise thì luôn trả về false.
//    TS không báo lỗi vì bạn khai báo `: unknown`, mà kiểu nào gán vào unknown cũng được, kể cả Promise.
//    Sửa: const duLieu: unknown = await res.json();
// ❌ SAI 2 (vi phạm "không bao giờ throw" của ý 3): có 2 chỗ vẫn có thể throw ra ngoài:
//    - fetch() throw TypeError khi mất mạng, sai tên miền hoặc bị CORS chặn
//    - res.json() throw SyntaxError khi server trả về không phải JSON (ví dụ trang HTML lỗi 502)
//    Lỗi do mạng KHÔNG đi vào nhánh !res.ok, vì khi đó không hề có response nào.
//    Sửa: bọc toàn bộ thân hàm trong try/catch:
//        try { ...code hiện tại... }
//        catch (e) { return { ok: false, loi: e instanceof Error ? e : new Error(String(e)) }; }
// ⚠️ NHỎ: đề ghi KetQua<T, E = string>, bạn dùng E = Error. Dùng Error cũng hợp lý (vì có .message,
//    có stack), chỉ cần nhất quán là được. Tên kiểu nên viết hoa chữ đầu (KetQua) theo quy ước
//    của TS, để không nhầm với biến.
async function goiAnToan<T>(url:string, kiemtra: (x: unknown) => x is T) : Promise<ketQua<T>>
{
    try
    {
        const res = await fetch(url);
        if(!res.ok)
            throw new Error(`HTTP ${res.status}`);

        const duLieu: unknown =  await res.json();

        if(!kiemtra(duLieu))
            throw new Error("Dữ liệu từ server không đúng cấu trúc");

        return {ok: true, giaTri: duLieu};
    }
    catch(e)
    {
        return { ok: false, loi: e instanceof Error ? e : new Error(String(e)) };
    }
    
}

// ───────────────────────── Ý 4: type guard laUser + gọi thử ─────────────────────────

// Chỉ khai báo những trường THỰC SỰ dùng. API trả về nhiều hơn (phone, website, company...),
// nhưng thừa trường thì không sao: type guard chỉ kiểm tra những gì ta cần.
// Mở https://jsonplaceholder.typicode.com/users/1 trên trình duyệt để xem cấu trúc thật.
type User = {
    id: number;
    name: string;
    username: string;
    email: string;
    address: { city: string };   // lồng 1 tầng, để tập kiểm tra object lồng nhau
};

// Hàm phụ: "x là object thường, đọc thuộc tính nào cũng ra unknown".
// Tách ra vì phải kiểm tra ở 2 chỗ (x và x.address). Có 3 điều kiện:
//  - typeof x === "object": loại number, string, boolean, undefined, function...
//  - x !== null: vì typeof null === "object" (lỗi lịch sử của JS, file 01 chặng 2)
//  - !Array.isArray(x): mảng cũng là "object", nhưng không phải thứ ta muốn
function laObject(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}

// Sau `laObject(x) &&`, TS biết x là Record<string, unknown>, nên được phép viết x.id.
// x.id có kiểu unknown, và typeof ... === "number" thu hẹp nó tiếp.
// Toán tử && dừng ngay ở điều kiện sai đầu tiên, nên x.address.city chỉ được đọc
// sau khi đã chắc x.address là object. Không bao giờ có lỗi "cannot read property of undefined".
function laUser(x: unknown): x is User {
    return (
        laObject(x) &&
        typeof x.id === "number" &&
        typeof x.name === "string" &&
        typeof x.username === "string" &&
        typeof x.email === "string" &&
        laObject(x.address) &&
        typeof x.address.city === "string"
    );
}

// Không cần viết goiAnToan<User>(...). TS suy T = User từ chữ ký `x is User` của laUser.
const kq = await goiAnToan("https://jsonplaceholder.typicode.com/users/1", laUser);

if (kq.ok) {
    // kq.giaTri: User. Gõ "kq.giaTri." là editor gợi ý đủ các trường
    console.log(`${kq.giaTri.name} (@${kq.giaTri.username}) sống ở ${kq.giaTri.address.city}`);
} else {
    // Chưa kiểm tra kq.ok thì không truy cập được kq.giaTri, TS buộc bạn xử lý cả nhánh lỗi
    console.error("Gọi API thất bại:", kq.loi.message);
}