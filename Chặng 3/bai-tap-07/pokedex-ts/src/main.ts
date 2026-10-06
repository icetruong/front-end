import "@/style.css";

import { api } from "./api.js";
import { capNhat, taiTrang, taiThemPokemon, phanLoaiLoi, xuLyDoiLoc, timVaHienThi } from "./pokemon.js";
import { state } from "./trang-thai.js";
import "./su-kien.js";


// ① TRẠNG THÁI — một object duy nhất, mọi thứ trên màn hình đều suy ra từ đây


// ② LOGIC — gọi API, xử lý dữ liệu. KHÔNG có chữ `document.` ở đây
//    - layChiTiet(ten, signal)   → có cache Map + closure (yêu cầu 13)
//    - taiTrang(offset)          → gọi /pokemon rồi Promise.all 20 chi tiết
//    - timTheoTen(ten, signal)
//    - locTheoLoai(loai)
//    - phanLoaiLoi(err)          → trả về { loai, thongDiep }



// ③ RENDER — đọc state, vẽ lại DOM. Chỉ phần này đụng tới document
//    - render() gọi renderDanhSach(), renderTrangThai(), renderModal(), renderDem()




// ④ CẬP NHẬT — đổi state rồi gọi render()


// ⑤ SỰ KIỆN + KHỞI ĐỘNG
async function khoiDong()
{
    capNhat({dangTai: true, loi: null});

    try
    {
        const duLieuLoai = await api.get("/type");
        const dsLoai = duLieuLoai.results.map(item => item.name)
                                        .filter(name => !["unknown", "shadow", "stellar"].includes(name));

        capNhat({ dsLoai });

        const locLoaiEl = document.querySelector("#loc-loai");
        dsLoai.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            locLoaiEl.append(option);
        });

        // Khôi phục bộ lọc/tìm kiếm cuối cùng đã lưu (yêu cầu 9)
        if (state.loaiDangChon !== "")
        {
            locLoaiEl.value = state.loaiDangChon;
            await xuLyDoiLoc(state.loaiDangChon);
            return;
        }

        if (state.tuKhoa !== "")
        {
            document.querySelector("#o-tim").value = state.tuKhoa;
            await timVaHienThi(state.tuKhoa);
            return;
        }

        const ketQuaTrang = await taiTrang(0);
        capNhat({
            dangTai: false,
            dsPokemon: ketQuaTrang.ketQua,
            tongSo: ketQuaTrang.tongSo,
            offset: 20
        });
    }
    catch (e)
    {
        capNhat({dangTai: false, loi: phanLoaiLoi(e)})
    }
}

khoiDong();

const mocCuoiEl = document.querySelector("#moc-cuoi");

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting)
        taiThemPokemon();
});

observer.observe(mocCuoiEl);



