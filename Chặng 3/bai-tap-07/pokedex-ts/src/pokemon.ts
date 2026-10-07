import { debouce } from "./untils/index.ts";
import { render } from "./render.ts";
import { set, state, type TrangThai, layDanhSachHienTai, type BoLoc } from "./trang-thai.ts";
import { api, LoiHTTP } from "./api.ts";
import { kho } from "./kho.ts";
import { type Pokemon, laPokemon, type CachePokemon, laCachePokemon, laDanhSachPokemon, laPokemonTheoLoai } from "./pokeapi.ts";

const HAN_CACHE_MS = 24 * 60 * 60 * 1000

export function capNhat(thayDoi: Partial<TrangThai>) : void
{
    set(thayDoi);
    render();
}



function taoLayChiTiet() : (ten: string, signal?:AbortSignal) => Promise<Pokemon>
{
    const cache = new Map<string, Pokemon>();
    return async function (ten: string, signal?: AbortSignal) 
    {
        const daLuu = cache.get(ten);
        if(daLuu)
            return daLuu;

        const giaTriLuu = kho.doc("pokedex:cache:"+ ten, null, laCachePokemon);
        if(giaTriLuu !== null)
        {
            if(Date.now() - giaTriLuu.luuLuc <= HAN_CACHE_MS)
            {
                cache.set(ten, giaTriLuu.duLieu);
                return giaTriLuu.duLieu;
            }
        }
        
        const ketQua = await api.get(`/pokemon/${ten}`,laPokemon, {signal});

        if(!ketQua.ok)
            throw ketQua.loi;
        const duLieu = ketQua.giaTri;
        cache.set(ten, duLieu);
        const luu: CachePokemon = {
            luuLuc: Date.now(),
            duLieu: duLieu
        };
        kho.ghi("pokedex:cache:"+ten, luu);

        return duLieu;        
    }
}

const layChiTiet = taoLayChiTiet();

export async function taiTrang(offset: number) : Promise<{ketQua: Pokemon[], tongSo: number}>
{
    const duLieu = await api.get(`/pokemon`, laDanhSachPokemon, {params: {limit: 20, offset}});

    if(!duLieu.ok)
        throw duLieu.loi;
    const ketQua = await Promise.all(duLieu.giaTri.results.map((item) => layChiTiet(item.name)));

    return {ketQua, tongSo: duLieu.giaTri.count};
}

async function locTheoLoai(loai: string) : Promise<string[]>
{
    const ketQua = await api.get(`/type/${loai}`, laPokemonTheoLoai);
    if(!ketQua.ok)
       throw ketQua.loi; 


    return ketQua.giaTri.pokemon.map(item => item.pokemon.name);
}

async function layTheoLoai(offset: number, signal?: AbortSignal) : Promise<{ketQua: Pokemon[], tongSo: number}>
{
    const duLieu = state.dsTenTheoLoai.slice(offset, offset+20);
    const ketQua = await Promise.all(duLieu.map(name => layChiTiet(name, signal)));

    return {ketQua, tongSo: state.dsTenTheoLoai.length};
}

export function phanLoaiLoi(err: unknown) : {loai: string, thongDiep: string}
{
    if(!(err instanceof Error))
        return { loai: "khac", thongDiep: "Có lỗi xảy ra. Thử lại." };
    if (err.name === "LoiMang")
        return { loai: "mang", thongDiep: "Không có kết nối mạng. Kiểm tra Wi-Fi rồi thử lại." };

    if (err.name === "LoiTimeout")
        return { loai: "timeout", thongDiep: "Máy chủ phản hồi quá chậm. Thử lại sau nhé." };

    return { loai: "khac", thongDiep: "Có lỗi xảy ra. Thử lại." };
}

export async function taiThemPokemon() : Promise<void>
{
    // Đang tải (lần đầu hoặc tải thêm) → không gọi chồng thêm request
    if(state.dsPokemon.loai === "dang-tai-them" || state.dsPokemon.loai === "dang-tai-lan-dau")
        return;

    // Đang xem kết quả tìm kiếm → không có trang kế tiếp để tải
    if(state.boLoc.tuKhoa !== "")
        return;

    // Đã tải đủ tổng số → dừng, không gọi API thừa
    const dsHienTai = layDanhSachHienTai();
    if(dsHienTai.length >= state.phanTrang.tongSo)
        return;

    capNhat({dsPokemon: {loai: "dang-tai-them", dsPokemon: dsHienTai}});

    try
    {
        let duLieu;
        if (state.boLoc.loaiDangChon !== "")
            duLieu = await layTheoLoai(state.phanTrang.offset);
        else
            duLieu = await taiTrang(state.phanTrang.offset);

        const {ketQua, tongSo} = duLieu;
        const newDs = [...layDanhSachHienTai(), ...ketQua];
        const newOffset = state.phanTrang.offset + 20;
        capNhat({
            dsPokemon: {
                loai: "thanh-cong",
                dsPokemon: newDs
            },
            phanTrang : {
                tongSo: tongSo,
                offset: newOffset
            }
        });
    }
    catch(e)
    {
        capNhat({dsPokemon: {loai: "loi", thongBao: phanLoaiLoi(e).thongDiep}});
    }
}



export async function moChiTiet(ten: string) : Promise<void>
{
    capNhat({modal: {loai: "dang-tai"}});

    try
    {
        const duLieu = await layChiTiet(ten);

        capNhat({modal: {
            loai: "thanh-cong",
            duLieu: duLieu
        }});
    }
    catch(e)
    {
        capNhat({modal: {
            loai: "loi",
            thongBao: phanLoaiLoi(e).thongDiep
        }});
    }
}

export function dongModal() : void
{
    capNhat({modal: {loai: "dong"}});
}

async function timTheoTen(ten: string, signal?: AbortSignal) : Promise<Pokemon[]>
{
    try
    {
        const duLieu = await layChiTiet(ten, signal);
        return [duLieu];
    }
    catch (e)
    {
        if(e instanceof LoiHTTP)
        {
            if (e.name === "LoiHTTP" && e.status === 404) 
                return [];  // không tìm thấy → mảng rỗng
        } 
        throw e;
    }
}

async function taiLaiDanhSachMacDinh() : Promise<void>
{
    const boLoc: BoLoc = {tuKhoa: "", loaiDangChon: ""};
    kho.ghi("boLoc", boLoc);
    capNhat({ 
        dsPokemon: {loai: "dang-tai-lan-dau"},
        boLoc: boLoc
    });

    try
    {
        const { ketQua, tongSo } = await taiTrang(0);
        capNhat({ 
            dsPokemon: {
                loai: "thanh-cong", dsPokemon: ketQua
            },
            phanTrang: {
                tongSo: tongSo,
                offset: 20
            }
        });
    }
    catch (e)
    {
        capNhat({ dsPokemon: {loai: "loi", thongBao: phanLoaiLoi(e).thongDiep} });
    }
}

let ac: AbortController | null = null;

export async function timVaHienThi(ten:string) : Promise<void>
{
    ac?.abort();
    ac = new AbortController();
    capNhat({
        dsPokemon: {loai: "dang-tai-lan-dau"}
    });
    const tenTrim = ten.trim().toLowerCase();
    if(tenTrim === "")
    {
        taiLaiDanhSachMacDinh();
        return;
    }
    try
    {

        const duLieu = await timTheoTen(tenTrim, ac.signal);
        const boLoc: BoLoc = {tuKhoa: tenTrim, loaiDangChon: ""};
        kho.ghi("boLoc", boLoc);
        capNhat({
            dsPokemon: {loai: "thanh-cong", dsPokemon: duLieu},
            boLoc: boLoc
        });
    }
    catch (e)
    {
        if (e instanceof Error && e.name === "AbortError") return;
        capNhat({ dsPokemon: {loai: "loi", thongBao: phanLoaiLoi(e).thongDiep} });
    }
}

export const tim = debouce(timVaHienThi, 400);



export async function xuLyDoiLoc(loai: string) : Promise<void>
{
    if(loai === "")
    {
        taiLaiDanhSachMacDinh();
        return;
    }
    ac?.abort();
    ac = new AbortController();
    const boLoc: BoLoc = {tuKhoa: "", loaiDangChon: loai};
    kho.ghi("boLoc", boLoc);
    capNhat({
        dsPokemon: {loai: "dang-tai-lan-dau"},
        boLoc: boLoc
    });

    try
    {
        const duLieu = await locTheoLoai(loai);

        capNhat({
            dsTenTheoLoai: duLieu,
            phanTrang: {
                tongSo: duLieu.length,
                offset: 0
            }
        });

        const { ketQua } = await layTheoLoai(state.phanTrang.offset, ac.signal);

        capNhat({
            dsPokemon: {loai: "thanh-cong", dsPokemon: ketQua},
            phanTrang: {
                tongSo: duLieu.length,
                offset: 20
            }
        });
    }
    catch (e)
    {
        if (e instanceof Error && e.name === "AbortError") return;
        capNhat({ dsPokemon: {loai: "loi", thongBao: phanLoaiLoi(e).thongDiep} });
    }
}

export function toggleYeuThich(ten: string) : void
{
    const daThich = state.dsYeuThich.includes(ten);
    const dsYeuThich = daThich ? state.dsYeuThich.filter(t => t !== ten) : [...state.dsYeuThich, ten];
    kho.ghi("dsYeuThich", dsYeuThich);
    capNhat({
        dsYeuThich: dsYeuThich
    });
}