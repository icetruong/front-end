const baseURL = "https://pokeapi.co/api/v2/";
const timeAboutDefault = 10000;

class LoiHTTP extends Error
{
    constructor(status, chiTiet = "")
    {
        super(`HTTP ${status}${chiTiet ? ": " + chiTiet : ""}`);
        this.name = "LoiHTTP";
        this.status = status;
        this.chiTiet = chiTiet;
    }
}

function layToken()
{
    return "";
}

function cho(ms)
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function thuLai(fn, soLan = 3, khoangCho = 1000, nenThuLai = () => true)
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

async function GoiMotLan(url, options)
{
    let res;
    try
    {
        res = await fetch(url, options);

    }
    catch (e)
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

    if(!res.ok)
    {
        let chiTiet = "";
        try
        { 
            const duLieu = await res.json();
            chiTiet = duLieu.message ?? "";
        }
        catch (e)
        {

        }

        throw new LoiHTTP(res.status, chiTiet);
    }

    return res;
}

async function Goi(duongDan, {method = "GET", body, params, signal, thoiHan = timeAboutDefault} = {})
{
    const url = new URL(baseURL + duongDan);

    if(params)
        url.search = new URLSearchParams(params);

    // signal KHÔNG gắn vào đây — mỗi lần thử sẽ tự tạo signal riêng (xem thuLai bên dưới)
    const options = {
        method,
        headers: {

        }
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

    const nenThuLai = (e) => e instanceof LoiHTTP && (e.status === 429 || e.status >= 500);
    const res = await thuLai(() =>
    {
        // Mỗi lần thử một đồng hồ MỚI → lần 2, 3 cũng được đủ thoiHan
        const hetGio = AbortSignal.timeout(thoiHan);
        // Gộp: hủy khi người gọi tự hủy HOẶC khi hết giờ
        const tongSignal = signal ? AbortSignal.any([signal, hetGio]) : hetGio;

        return GoiMotLan(url, { ...options, signal: tongSignal });
    }, 3, 1000, nenThuLai);


    if(res.status === 204)
        return null;

    try {
        return await res.json();   // phải có await thì catch mới bắt được
    } catch {
        throw new Error("Phản hồi không phải JSON hợp lệ");
    }
}

export const api = {
    get: (d, o) => Goi(d, {...o, method: "GET"}),
    post: (d, b, o) => Goi(d, {...o, method: "POST", body: b}),
    put: (d, b, o) => Goi(d, {...o, method: "PUT", body: b}),
    patch: (d, b, o) => Goi(d, {...o, method: "PATCH", body: b}),
    delete: (d, o) => Goi(d, {...o, method: "DELETE"})
};