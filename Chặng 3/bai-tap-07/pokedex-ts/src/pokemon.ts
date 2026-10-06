import { debouce } from "./untils/index.ts";
import { render } from "./render.ts";
import { set, state } from "./trang-thai.ts";
import { api } from "./api.ts";
import { kho } from "./kho.ts";

const HAN_CACHE_MS = 24 * 60 * 60 * 1000

export function capNhat(thayDoi)
{
    set(thayDoi);
    render();
}

function taoLayChiTiet()
{
    const cache = new Map();
    return async function (ten, signal) 
    {
        if(cache.has(ten))
            return cache.get(ten);

        const giaTriLuu = kho.doc("pokedex:cache:"+ ten, null);
        if(giaTriLuu !== null)
        {
            if(Date.now() - giaTriLuu.luuLuc <= HAN_CACHE_MS)
            {
                cache.set(ten, giaTriLuu.duLieu);
                return giaTriLuu.duLieu;
            }
        }
        
        const duLieu = await api.get(`/pokemon/${ten}`, {signal});

        cache.set(ten, duLieu);
        const luu = {
            luuLuc: Date.now(),
            duLieu: duLieu
        };
        kho.ghi("pokedex:cache:"+ten, luu);

        return duLieu;
    }
}

const layChiTiet = taoLayChiTiet();

export async function taiTrang(offset)
{
    const duLieu = await api.get(`/pokemon`, {params: {limit: 20, offset}});

    const ketQua = await Promise.all(duLieu.results.map((item) => layChiTiet(item.name)));

    return {ketQua, tongSo: duLieu.count};
}

async function locTheoLoai(loai)
{
    const duLieu = await api.get(`/type/${loai}`);
    return duLieu.pokemon.map(item => item.pokemon.name);
}

async function layTheoLoai(offset, signal)
{
    const duLieu = state.dsTenTheoLoai.slice(offset, offset+20);
    const ketQua = await Promise.all(duLieu.map(name => layChiTiet(name, signal)));

    return {ketQua, tongSo: state.dsTenTheoLoai.length};
}

export function phanLoaiLoi(err)
{
    if (err.name === "LoiMang")
        return { loai: "mang", thongDiep: "Không có kết nối mạng. Kiểm tra Wi-Fi rồi thử lại." };

    if (err.name === "LoiTimeout")
        return { loai: "timeout", thongDiep: "Máy chủ phản hồi quá chậm. Thử lại sau nhé." };

    return { loai: "khac", thongDiep: "Có lỗi xảy ra. Thử lại." };
}

export async function taiThemPokemon()
{
    if(state.dangTai || state.tuKhoa !== "" || state.dsPokemon.length >= state.tongSo)
        return;

    capNhat({dangTai: true, loi: null});

    try
    {
        let duLieu;
        if (state.loaiDangChon !== "")
            duLieu = await layTheoLoai(state.offset);
        else
            duLieu = await taiTrang(state.offset);

        const {ketQua, tongSo} = duLieu;
        const newDs = [...state.dsPokemon, ...ketQua];
        const newOffset = state.offset + 20;
        capNhat({
            dangTai: false,
            dsPokemon: newDs,
            tongSo: tongSo,
            offset: newOffset
        });
    }
    catch(e)
    {
        capNhat({dangTai: false, loi: phanLoaiLoi(e)})
    }
}



export async function moChiTiet(ten)
{
    capNhat({modal: {
        dangMo: true,
        dangTai:true,
        duLieu: null,
        loi:null
    }});

    try
    {
        const duLieu = await layChiTiet(ten);

        capNhat({modal: {
            ...state.modal,
            dangTai: false,
            duLieu: duLieu,
        }});
    }
    catch(e)
    {
        capNhat({modal: {
            ...state.modal,
            dangTai:false,
            loi: phanLoaiLoi(e).thongDiep
        }});
    }
}

export function dongModal()
{
    capNhat({modal: {...state.modal, dangMo: false}});
}





async function timTheoTen(ten, signal)
{
    try
    {
        const duLieu = await layChiTiet(ten, signal);
        return [duLieu];
    }
    catch (e)
    {
        if (e.name === "LoiHTTP" && e.status === 404) 
            return [];  // không tìm thấy → mảng rỗng
        throw e;
    }
}



async function taiLaiDanhSachMacDinh()
{
    kho.ghi("tuKhoa", "");
    kho.ghi("loaiDangChon", "");
    capNhat({ dangTai: true, loi: null, dsPokemon: [], tuKhoa: "", loaiDangChon: ""});

    try
    {
        const { ketQua, tongSo } = await taiTrang(0);
        capNhat({ dangTai: false, dsPokemon: ketQua, tongSo, offset: 20, tuKhoa: "", loaiDangChon: ""});
    }
    catch (e)
    {
        capNhat({ dangTai: false, loi: phanLoaiLoi(e) });
    }
}

let ac;

export async function timVaHienThi(ten)
{
    ac?.abort();
    ac = new AbortController();
    capNhat({dangTai: true, loi: null, loaiDangChon: ""});
    kho.ghi("loaiDangChon", "");
    const tenTrim = ten.trim().toLowerCase();
    if(tenTrim === "")
    {
        taiLaiDanhSachMacDinh();
        return;
    }
    try
    {

        const duLieu = await timTheoTen(tenTrim, ac.signal);
        kho.ghi("tuKhoa", tenTrim);
        capNhat({
            dangTai:false, 
            dsPokemon: duLieu,
            tuKhoa: tenTrim
        });
    }
    catch (e)
    {
        if (e.name === "AbortError") return;
        capNhat({dangTai: false, loi: phanLoaiLoi(e)})
    }
}

export const tim = debouce(timVaHienThi, 400);



export async function xuLyDoiLoc(loai) 
{
    if(loai === "")
    {
        taiLaiDanhSachMacDinh();
        return;
    }
    ac?.abort();
    ac = new AbortController();
    kho.ghi("tuKhoa", "");
    kho.ghi("loaiDangChon", loai);
    capNhat({
        dangTai:true,
        loi: null,
        dsPokemon: [],
        tuKhoa: "",
        loaiDangChon: loai
    });

    try
    {
        const duLieu = await locTheoLoai(loai);

        capNhat({
            dsTenTheoLoai: duLieu,
            tongSo: duLieu.length,
            offset: 0
        });

        const { ketQua } = await layTheoLoai(state.offset, ac.signal);

        capNhat({
            dangTai:false,
            dsPokemon: ketQua,
            offset: 20
        });
    }
    catch (e)
    {
        if (e.name === "AbortError") return;
        capNhat({ dangTai: false, loi: phanLoaiLoi(e) });
    }
}

export function toggleYeuThich(ten)
{
    const daThich = state.dsYeuThich.includes(ten);
    const dsYeuThich = daThich ? state.dsYeuThich.filter(t => t !== ten) : [...state.dsYeuThich, ten];
    kho.ghi("dsYeuThich", dsYeuThich);
    capNhat({
        dsYeuThich: dsYeuThich
    });
}