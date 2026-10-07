import { kho } from "./kho.js";
import {type Pokemon } from "./pokeapi.js";

export type TrangThaiModal =
| {loai: "dong"}
| {loai: "dang-tai"}
| {loai: "loi", thongBao: string}
| {loai: "thanh-cong", duLieu: Pokemon};

export type TrangThaiDanhSach =
    | { loai: "dang-tai-lan-dau" }                         // hiện skeleton
    | { loai: "dang-tai-them"; dsPokemon: Pokemon[] }      // giữ ds cũ, khóa nút
    | { loai: "loi"; thongBao: string }
    | { loai: "thanh-cong"; dsPokemon: Pokemon[] };

export function layDanhSachHienTai() : Pokemon[]
{
    switch (state.dsPokemon.loai)
    {
        case "dang-tai-lan-dau":
            return [];
        case "dang-tai-them":
            return state.dsPokemon.dsPokemon;
        case "loi":
            return [];
        case "thanh-cong":
            return state.dsPokemon.dsPokemon;
        default : {
            const duLieu : never = state.dsPokemon;
            return duLieu;
        }
    }
}

export type Tab = "tat-ca" | "yeu-thich";

export type BoLoc = {
    tuKhoa: string ;
    loaiDangChon: string;
}

export type PhanTrang = {
    tongSo: number;
    offset: number;
}

export type TrangThai = {
    // Cụm dangTai + loi + dsPokemon → gộp thành 1 trường
    dsPokemon: TrangThaiDanhSach;

    // Độc lập, giữ nguyên (chỉ thêm kiểu)
    phanTrang: PhanTrang,
    dsLoai: string[];
    boLoc: BoLoc,
   
    dsTenTheoLoai: string[];
    dsYeuThich: string[];
    tabDangChon: Tab;

    // Cụm dangMo + dangTai + duLieu + loi → gộp thành 1 trường
    modal: TrangThaiModal;
};

function laChuoi(x: unknown): x is string {
    return typeof x === "string";
}

function laDanhSachChuoi(x: unknown): x is string[] {
    return Array.isArray(x) &&
        x.every(laChuoi)
}

function laObject(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}

function laBoLoc(x: unknown): x is BoLoc {
    return laObject(x) && typeof x.tuKhoa === "string" && typeof x.loaiDangChon === "string";
}

// dataset.tab là string | undefined → phải kiểm tra trước khi gán vào tabDangChon (thay cho "as Tab")
export function laTab(x: unknown): x is Tab {
    return x === "tat-ca" || x === "yeu-thich";
}

export let state: TrangThai = {
    // --- Danh sách ---
    dsPokemon: {loai: "dang-tai-lan-dau"},       // chi tiết các con đang hiện trên lưới
    phanTrang: {
        tongSo: 0,
        offset: 0
    },           // vị trí bắt đầu của lần tải kế tiếp

    // --- Bộ lọc ---
    dsLoai: [],          // tên các loại cho dropdown (tải 1 lần)
    boLoc: kho.doc("boLoc", {tuKhoa: "", loaiDangChon: ""}, laBoLoc),    // "" = tất cả loại
    dsTenTheoLoai: [],   // toàn bộ tên thuộc loại đang chọn (để "Tải thêm" trong chế độ lọc)

    // --- Modal chi tiết ---
    modal: {loai: "dong"},

    // --- Nâng cao 17 (bỏ nếu không làm) ---
    dsYeuThich: kho.doc("dsYeuThich", [], laDanhSachChuoi),      // mảng tên (khớp với dataset.id đang dùng tên làm khóa)
    tabDangChon: "tat-ca",
};

export function set(thayDoi: Partial<TrangThai>)
{
    state = { ...state, ...thayDoi };
}