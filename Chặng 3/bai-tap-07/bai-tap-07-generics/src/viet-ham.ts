// ⚠️ CHUNG (cả file):
//  1. Chưa có test. Đề yêu cầu mỗi hàm test ít nhất 3 trường hợp, trong đó có 1 trường hợp
//     CỐ TÌNH SAI KIỂU để chứng minh TS bắt được (ví dụ: layCuoi(5) → ❌, layNhieu(u, ["tuoi"]) → ❌).
//  2. `npm run typecheck` đang báo "is declared but its value is never read" cho mọi hàm,
//     vì tsconfig bật noUnusedLocals. Thêm `export` trước mỗi function, hoặc gọi chúng trong
//     phần test, thì hết lỗi.

// ✅ ĐÚNG. Mảng rỗng → arr[-1] → undefined, khớp với kiểu trả về T | undefined.
function layCuoi<T>(arr: T[]) : T | undefined
{
    return arr[arr.length-1];
}

// ✅ ĐÚNG. [...arr] tạo bản sao rồi mới reverse, nên mảng gốc không bị sửa.
// Nhờ có `readonly`, nếu bạn lỡ viết arr.reverse() thì TS sẽ báo lỗi ngay.
function daoNguoc<T>(arr: readonly T[]) : T[]
{
    return [...arr].reverse();
}

// ✅ ĐÚNG. Lưu ý: Set so sánh theo tham chiếu, nên hai object {id: 1} khác nhau vẫn bị coi là
// hai phần tử khác nhau và không bị loại. Đây là hành vi của Set, không phải lỗi của bạn.
function loaiTrung<T>(arr: T[]) : T[]
{
    const set: Set<T> = new Set(arr);
    return [...set];
}

// ❌ SAI (về logic, TS vẫn biên dịch được): hàm `throw` khi giá trị của khóa không phải string.
//    Đề có gợi ý: "giá trị của thuộc tính khoa có thể là số, chuỗi, boolean...". Vì vậy
//    nhomTheo(dsUser, "tuoi") hay nhomTheo(dsViec, "daXong") đều là cách dùng HỢP LỆ,
//    nhưng hàm của bạn lại nổ khi chạy. TS không chặn được vì K extends keyof T cho phép mọi khóa.
//    Cách sửa: đổi giá trị sang chuỗi thay vì throw, vì key của object vốn luôn là string
//    (đúng như phần Record vs Map đã nói):
//
//        const nhan = String(item[khoa]);   // 22 → "22", true → "true"
//        (nhom[nhan] ??= []).push(item);
//
//    Đây cũng chính là câu trả lời cho câu hỏi "vì sao trả về Record<string, T[]>":
//    giá trị của khóa có thể là kiểu bất kỳ, nhưng sau khi làm key của object thì nó luôn thành string.
function nhomTheo<T, K extends keyof T>(arr: T[], khoa: K) : Record<string, T[]>
{
    return arr.reduce((nhom: Record<string, T[]>, item) => {
        const nhan = String(item[khoa]);
        if(!nhom[nhan])
            nhom[nhan] = [];
        nhom[nhan].push(item);
        return nhom;
    }, {});
}

// ✍️ HÀM NÀY TÔI VIẾT.
// Hàm làm gì: lấy RA MỘT SỐ trường của object, tạo thành object mới chỉ gồm các trường đó.
// Đây là phiên bản chạy được lúc runtime của utility type Pick (giống _.pick của lodash):
//
//     const u = { id: 1, ten: "An", email: "an@x.com", matKhau: "123" };
//     const the = layNhieu(u, ["id", "ten"]);
//     // the = { id: 1, ten: "An" }
//     // kiểu: Pick<typeof u, "id" | "ten">  →  { id: number; ten: string }
//     the.email;                    // ❌ không có email trong kiểu trả về
//     layNhieu(u, ["tuoi"]);        // ❌ "tuoi" không thuộc keyof
//
// Chỗ bạn sai ở chữ ký: viết Pick<T, K[]> là sai, phải là Pick<T, K>.
// Tham số thứ hai của Pick là UNION các tên khóa, không phải mảng.
// Truyền ["id", "ten"] thì TS suy ra K = "id" | "ten" (kiểu của từng phần tử), nên Pick<T, K> là đủ.
// TS cũng đã báo lỗi này: "Type 'K[]' does not satisfy the constraint 'keyof T'".
function layNhieu<T, K extends keyof T>(obj: T, khoa: K[]) : Pick<T, K>
{
    // `as` dùng một lần ở đây và đây là chỗ bắt buộc phải dùng: object rỗng {} chưa có trường nào
    // nên chưa phải Pick<T, K>, nhưng vòng for ngay sau đó sẽ điền đủ từng khóa trong `khoa`.
    const ketQua = {} as Pick<T, K>;
    for (const k of khoa) {
        ketQua[k] = obj[k];
    }
    return ketQua;
}

// ✅ ĐÚNG về kiểu. Function expression trả về được TS "gán ngữ cảnh" (contextual typing)
// theo kiểu trả về đã khai báo, nên `arg` tự có kiểu A mà không cần viết lại. Tốt.
// ⚠️ LƯU Ý (không tính là sai, nhưng nên biết): daChay = true được đặt TRƯỚC khi gọi fn.
//    Nếu lần đầu fn throw, thì ketQua chưa bao giờ được gán, và mọi lần gọi sau đều trả về
//    undefined, trong khi kiểu vẫn khai báo là R. TS không bắt được chỗ này vì nó không kiểm tra
//    "đã gán chưa" với biến dùng bên trong closure.
function chiMotLan<A extends unknown[], R>(fn: (...arg: A) => R) : (...arg: A) => R
{
    let daChay = false;
    let ketQua: R;

    return function(...arg) {
        if(daChay)
            return ketQua;
        ketQua = fn(...arg);
        daChay = true;
        return ketQua;
    };
}

// ✅ ĐÚNG. Chỉ có 2 lỗi gõ nhỏ: tên hàm thiếu chữ "n" (debouce → debounce), và dòng `let` có
// hai dấu ";;" (Prettier sẽ tự sửa).
function debouce<A extends unknown[]>(fn: (...arg: A) => void, delay: number) : (...arg: A) => void
{
    let idTimer: ReturnType<typeof setTimeout> | undefined;;

    return function(...arg)
    {
        clearTimeout(idTimer);
        idTimer = setTimeout(() => {
            fn(...arg);
        }, delay);
    }
}

// ❌ SAI (vi phạm "không dùng any"): `new Map()` không truyền tham số kiểu thì TS suy ra
//    Map<any, any>. Khi đó cache.get(khoa) trả về `any`, tức là any đã lọt vào hàm qua cửa sau.
//    Bạn không gõ chữ "any" nào, nhưng nó vẫn có mặt, và nếu lỡ cache nhầm thứ khác thì TS cũng không báo.
//    Sửa: const cache = new Map<string, R>();
//    Khi đó cache.get(khoa) có kiểu R | undefined. Để bỏ được `undefined` mà không cần `!`, đổi sang:
//        const daCo = cache.get(khoa);
//        if (daCo !== undefined) return daCo;
//    (Cách này sai trong trường hợp chính fn trả về undefined, nhưng với bài tập này thì chấp nhận được.)
// ⚠️ LƯU Ý về JSON.stringify làm khóa: undefined, function, Map, Set đều không được stringify đúng,
//    nên ghiNho(f)(undefined) và ghiNho(f)(null) sẽ ra cùng một khóa "[null]". Dùng cho đối số
//    là số hoặc chuỗi thì ổn.
function ghiNho<A extends unknown[], R>(fn: (...arg : A) => R) : (...arg: A) => R
{
    const cache = new Map<string, R>();

    return function(...arg)
    {
        const khoa = JSON.stringify(arg);

        const daCo = cache.get(khoa);
        if(daCo !== undefined)
            return daCo;

        const ketQua = fn(...arg);
        cache.set(khoa, ketQua);

        return ketQua;
    }
}
