import "@/style.css";

import { api } from "./api.js";
import { capNhat, taiTrang, taiThemPokemon, phanLoaiLoi, xuLyDoiLoc, timVaHienThi } from "./pokemon.js";
import { state } from "./trang-thai.js";
import "./su-kien.js";
import { layEl } from "./untils/dom.js";
import { laDanhSachLoai } from "./pokeapi.js";


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
    capNhat({dsPokemon: {loai: "dang-tai-lan-dau"}});

    try
    {
        const duLieuLoai = await api.get("/type", laDanhSachLoai);
        if(!duLieuLoai.ok)
            throw duLieuLoai.loi;
        const dsLoai = duLieuLoai.giaTri.results.map(item => item.name)
                                        .filter(name => !["unknown", "shadow", "stellar"].includes(name));

        capNhat({ dsLoai });

        const locLoaiEl = layEl("#loc-loai", HTMLSelectElement);
        dsLoai.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            locLoaiEl.append(option);
        });

        // Khôi phục bộ lọc/tìm kiếm cuối cùng đã lưu (yêu cầu 9)
        if (state.boLoc.loaiDangChon !== "")
        {
            locLoaiEl.value = state.boLoc.loaiDangChon;
            await xuLyDoiLoc(state.boLoc.loaiDangChon);
            return;
        }

        if (state.boLoc.tuKhoa !== "")
        {
            layEl("#o-tim", HTMLInputElement).value = state.boLoc.tuKhoa;
            await timVaHienThi(state.boLoc.tuKhoa);
            return;
        }

        const ketQuaTrang = await taiTrang(0);
        capNhat({
            dsPokemon: {loai: "thanh-cong", dsPokemon: ketQuaTrang.ketQua},
            phanTrang : {
                tongSo: ketQuaTrang.tongSo,
                offset: 20
            }
        });
    }
    catch (e)
    {
        capNhat({ dsPokemon: {loai: "loi", thongBao: phanLoaiLoi(e).thongDiep} });
    }
}

khoiDong();

const mocCuoiEl = layEl("#moc-cuoi", HTMLElement);

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting)
        taiThemPokemon();
});

observer.observe(mocCuoiEl);



