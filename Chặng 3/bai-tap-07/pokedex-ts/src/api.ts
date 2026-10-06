const baseURL = "https://pokeapi.co/api/v2/";
const timeAboutDefault = 10000;

type ketQua<T, E = Error> = 
| {ok: true, giaTri: T}
| {ok: false, loi: E }

// Type guard dùng chung: nhận unknown, nếu trả true thì TS hiểu x là T
type KiemTra<T> = (x: unknown) => x is T;

type Options = {
    method: string,
    headers: Record<string, string>,
    body: string| FormData,
    signal:  AbortSignal
}

type OptionsUrl = {
    method: string,
    body: Record<string, unknown> | FormData,
    params: Record<string, string>, 
    signal: AbortSignal, 
    thoiHan: number
}

class LoiHTTP extends Error {
  // Khai báo thuộc tính ở đây
    public status: number;

  constructor(status: number, chiTiet = "") {
    super(`HTTP ${status}${chiTiet ? ": " + chiTiet : ""}`);
    this.name = "LoiHTTP";
    this.status = status;    // Hợp lệ
  }
}

function layToken()
{
    return "";
}

function cho(ms: number)
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function thuLai(fn: () => Promise<Response>, soLan = 3, khoangCho = 1000, nenThuLai: (e: unknown) => boolean = () => true) : Promise<Response>
{
    let khoangChoBackoff = khoangCho;
    let loiCuoi;
    for(let i = 0; i< soLan; i++)
    {
        try
        {
            const ketqua = await fn();
            return ketqua;
        }
        catch (e)
        {
            if(!nenThuLai(e))
                throw e;

            loiCuoi = e;

            if(i !== soLan - 1)
                await cho(khoangChoBackoff);
            khoangChoBackoff *=2;
        }
    }

    throw loiCuoi;
}

async function GoiMotLan(url: URL, options: Partial<Options>) : Promise<Response>
{
    let res;
    try
    {
        res = await fetch(url, options);

    }
    catch (e)
    {
        if(e instanceof Error)
        {
            if(e.name === "AbortError")
                throw e;
            if (e.name === "TimeoutError") {
                const loi = new Error("Máy chủ phản hồi quá chậm");
                loi.name = "LoiTimeout";
                throw loi;
            }
            const loi = new Error("Không kết nối được máy chủ");
            loi.name = "LoiMang";
            throw loi;
        }
    }

    if(!res)
        throw new Error("Không có res");

    if(!res.ok)
    {
        let chiTiet = "";
        try
        { 
            const duLieu: unknown = await res.json();
            // Thu hẹp unknown từng bước: là object → khác null → có khóa "message" → message là string
            if (
                typeof duLieu === "object" &&
                duLieu !== null &&
                "message" in duLieu &&
                typeof duLieu.message === "string"
            )
                chiTiet = duLieu.message;
        }
        catch
        {
            // Cố ý bỏ qua: body lỗi không phải JSON (vd trang HTML 502) thì vẫn ném LoiHTTP bên dưới,
            // để giữ status và để thuLai còn thử lại được với lỗi 5xx
        }

        throw new LoiHTTP(res.status, chiTiet);
    }
    return res;
}

// Tham số bắt buộc (kiemTra) đứng trước, tham số có mặc định (options) đứng cuối → gọi Goi(d, laPokemon) là đủ
async function Goi<T>(duongDan: string, kiemTra: KiemTra<T>, {method = "GET", body, params, signal, thoiHan = timeAboutDefault} : Partial<OptionsUrl> = {}) : Promise<ketQua<T>>
{
    try
    {
        const url = new URL(baseURL + duongDan);

        if(params)
            url.search = new URLSearchParams(params).toString();

        // signal KHÔNG gắn vào đây — mỗi lần thử sẽ tự tạo signal riêng (xem thuLai bên dưới)
        // Partial làm mọi field thành tùy chọn → "& { headers: ... }" ghi đè lại riêng headers thành BẮT BUỘC
        const options: Partial<Options> & { headers: Record<string, string> } = {
            method,
            headers: {}
        };

        const token = layToken();
        if(token)
            options.headers["Authorization"] = `Bearer ${token}`;

        if(body !== undefined)
        {
            if(body instanceof FormData)
            {
                options.body = body;
            }
            else 
            {
                options.body = JSON.stringify(body);
                options.headers["Content-Type"] = "application/json";
            }
        }

        const nenThuLai = (e: unknown) => e instanceof LoiHTTP && (e.status === 429 || e.status >= 500);
        const res = await thuLai(() =>
        {
            // Mỗi lần thử một đồng hồ MỚI → lần 2, 3 cũng được đủ thoiHan
            const hetGio = AbortSignal.timeout(thoiHan);
            // Gộp: hủy khi người gọi tự hủy HOẶC khi hết giờ
            const tongSignal = signal ? AbortSignal.any([signal, hetGio]) : hetGio;

            return GoiMotLan(url, { ...options, signal: tongSignal });
        }, 3, 1000, nenThuLai);

        let duLieu: unknown = null;
        // 204 No Content: không có body để parse → giữ duLieu = null, vẫn cho đi qua kiemTra bên dưới.
        // Người gọi nào chờ 204 thì truyền guard chấp nhận null; còn lại sẽ nhận ok: false.
        if (res.status !== 204)
        {
            try {
                duLieu = await res.json();   // phải có await thì catch mới bắt được
            } catch {
                throw new Error("Phản hồi không phải JSON hợp lệ");
            }
        }
        if(!kiemTra(duLieu))
            throw new Error("Dữ liệu từ server không đúng cấu trúc");
            
        return {ok: true, giaTri: duLieu};
    }
    catch (e)
    {
        return { ok: false, loi: e instanceof Error ? e : new Error(String(e)) };
    }
}

export const api = {
    get: <T>(d: string, kiemTra: KiemTra<T>, o: Partial<OptionsUrl> = {}) => Goi(d, kiemTra, {...o, method: "GET"}),
    post: <T>(d: string, b: Record<string, unknown> | FormData, kiemTra: KiemTra<T>, o: Partial<OptionsUrl> = {}) => Goi(d, kiemTra, {...o, method: "POST", body: b}),
    put: <T>(d: string, b: Record<string, unknown> | FormData, kiemTra: KiemTra<T>, o: Partial<OptionsUrl> = {}) => Goi(d, kiemTra, {...o, method: "PUT", body: b}),
    patch: <T>(d: string, b: Record<string, unknown> | FormData, kiemTra: KiemTra<T>, o: Partial<OptionsUrl> = {}) => Goi(d, kiemTra, {...o, method: "PATCH", body: b}),
    delete: <T>(d: string, kiemTra: KiemTra<T>, o: Partial<OptionsUrl> = {}) => Goi(d, kiemTra, {...o, method: "DELETE"})
};