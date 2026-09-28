import { kho } from "./kho.js";
export let state = {
    // --- Danh sách ---
    dsPokemon: [],       // chi tiết các con đang hiện trên lưới
    tongSo: 0,           // tổng số có thể tải → "Đã tải 20/1302"
    offset: 0,           // vị trí bắt đầu của lần tải kế tiếp
    dangTai: false,      // đang chờ API cho danh sách
    loi: null,           // null | { loai: "mang" | "timeout" | "khac", thongDiep }

    // --- Bộ lọc ---
    dsLoai: [],          // tên các loại cho dropdown (tải 1 lần)
    tuKhoa: kho.doc("tuKhoa", ""),          // "" = không tìm kiếm
    loaiDangChon: kho.doc("loaiDangChon", ""),    // "" = tất cả loại
    dsTenTheoLoai: [],   // toàn bộ tên thuộc loại đang chọn (để "Tải thêm" trong chế độ lọc)

    // --- Modal chi tiết ---
    modal: {
        dangMo: false,
        dangTai: false,
        duLieu: null,    // chi tiết Pokémon đang mở
        loi: null,       // chuỗi thông báo lỗi
    },

    // --- Nâng cao 17 (bỏ nếu không làm) ---
    dsYeuThich: kho.doc("dsYeuThich", []),      // mảng tên (khớp với dataset.id đang dùng tên làm khóa)
    tabDangChon: "tat-ca",
};

export function set(thayDoi)
{
    state = { ...state, ...thayDoi };
}