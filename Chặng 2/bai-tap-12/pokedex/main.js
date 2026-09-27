import { api } from "../api.js";

// ① TRẠNG THÁI — một object duy nhất, mọi thứ trên màn hình đều suy ra từ đây
let state = {
    // --- Danh sách ---
    dsPokemon: [],       // chi tiết các con đang hiện trên lưới
    tongSo: 0,           // tổng số có thể tải → "Đã tải 20/1302"
    offset: 0,           // vị trí bắt đầu của lần tải kế tiếp
    dangTai: false,      // đang chờ API cho danh sách
    loi: null,           // null | { loai: "mang" | "timeout" | "khac", thongDiep }

    // --- Bộ lọc ---
    dsLoai: [],          // tên các loại cho dropdown (tải 1 lần)
    tuKhoa: "",          // "" = không tìm kiếm
    loaiDangChon: "",    // "" = tất cả loại
    dsTenTheoLoai: [],   // toàn bộ tên thuộc loại đang chọn (để "Tải thêm" trong chế độ lọc)

    // --- Modal chi tiết ---
    modal: {
        dangMo: false,
        dangTai: false,
        duLieu: null,    // chi tiết Pokémon đang mở
        loi: null,       // chuỗi thông báo lỗi
    },

    // --- Nâng cao 17 (bỏ nếu không làm) ---
    dsYeuThich: [],      // mảng tên (khớp với dataset.id đang dùng tên làm khóa)
    tabDangChon: "tat-ca",
};

// ② LOGIC — gọi API, xử lý dữ liệu. KHÔNG có chữ `document.` ở đây
//    - layChiTiet(ten, signal)   → có cache Map + closure (yêu cầu 13)
//    - taiTrang(offset)          → gọi /pokemon rồi Promise.all 20 chi tiết
//    - timTheoTen(ten, signal)
//    - locTheoLoai(loai)
//    - phanLoaiLoi(err)          → trả về { loai, thongDiep }

function taoLayChiTiet()
{
    const cache = new Map();
    return async function (ten, signal) 
    {
        if(cache.has(ten))
            return cache.get(ten);

        const duLieu = await api.get(`/pokemon/${ten}`, {signal});

        cache.set(ten, duLieu);

        return duLieu;
    }
}

const layChiTiet = taoLayChiTiet();

async function taiTrang(offset)
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

function phanLoaiLoi(err)
{
    if (err.name === "LoiMang")
        return { loai: "mang", thongDiep: "Không có kết nối mạng. Kiểm tra Wi-Fi rồi thử lại." };

    if (err.name === "LoiTimeout")
        return { loai: "timeout", thongDiep: "Máy chủ phản hồi quá chậm. Thử lại sau nhé." };

    return { loai: "khac", thongDiep: "Có lỗi xảy ra. Thử lại." };
}

// ③ RENDER — đọc state, vẽ lại DOM. Chỉ phần này đụng tới document
//    - render() gọi renderDanhSach(), renderTrangThai(), renderModal(), renderDem()

function renderDanhSach(dsPokemon)
{
    const dsPokemonEl = document.querySelector("#ds-pokemon");
    const tplThe = document.querySelector("#tpl-the");
    const tplLoai = document.querySelector("#tpl-loai");

    dsPokemonEl.innerHTML = "";

    dsPokemon.forEach(pokemon => {
        const li = tplThe.content.firstElementChild.cloneNode(true);

        li.dataset.id = pokemon.name;
        li.querySelector(".so").textContent = `#${String(pokemon.id).padStart(3, "0")}`;
        li.querySelector(".ten").textContent = pokemon.name;

        const nutYeuThich = li.querySelector(".nut-yeu-thich");
        const daThich = state.dsYeuThich.includes(pokemon.name);
        nutYeuThich.textContent = daThich ? "★" : "☆";
        nutYeuThich.classList.toggle("da-thich", daThich);

        const anh = li.querySelector(".anh");
        anh.src = pokemon.sprites.front_default ?? "";
        anh.alt = pokemon.name;

        const dsLoaiEl = li.querySelector(".ds-loai");
        pokemon.types.forEach(({ type }) => {
            const loaiEl = tplLoai.content.firstElementChild.cloneNode(true);
            loaiEl.textContent = type.name;
            loaiEl.classList.add(`loai-${type.name}`);
            dsLoaiEl.append(loaiEl);
        });

        dsPokemonEl.append(li);
    });
}

function renderDem()
{
    const demEl = document.querySelector("#dem");
    const taiThemEl = document.querySelector("#tai-them");

    demEl.textContent = `Đã tải ${state.dsPokemon.length}/${state.tongSo}`;

    taiThemEl.disabled = state.dsPokemon.length >= state.tongSo || state.tuKhoa !== "" || state.dangTai;
}

function renderTrangThai()
{
    const khungLoiEl = document.querySelector("#khung-loi");
    const loiNoiDungEl = document.querySelector("#loi-noi-dung");
    const khungRongEl = document.querySelector("#khung-rong");
    const rongNoiDungEl = document.querySelector("#rong-noi-dung");
    const dsPokemonEl = document.querySelector("#ds-pokemon");
    const tplSkeleton = document.querySelector("#tpl-skeleton");

    const rong = !state.dangTai && !state.loi && state.dsPokemon.length === 0;
    const dangTaiLanDau = state.dangTai && state.dsPokemon.length === 0;

    khungLoiEl.hidden = !state.loi;
    if (state.loi)
    {
        loiNoiDungEl.textContent = state.loi.thongDiep;
    }

    khungRongEl.hidden = !rong;
    if (rong)
    {
        rongNoiDungEl.textContent = state.tuKhoa !== ""
            ? `Không tìm thấy Pokémon nào khớp "${state.tuKhoa}".`
            : "Không tìm thấy Pokémon nào khớp bộ lọc hiện tại.";
    }

    if (dangTaiLanDau)
    {
        for (let i = 0; i < 20; i++)
        {
            const li = tplSkeleton.content.firstElementChild.cloneNode(true);
            dsPokemonEl.append(li);
        }
    }
}

function renderModal()
{
    const modalEl = document.querySelector("#modal");
    const ctDangTaiEl = document.querySelector("#ct-dang-tai");
    const ctLoiEl = document.querySelector("#ct-loi");
    const ctNoiDungEl = document.querySelector("#ct-noi-dung");
    const m = state.modal;

    modalEl.hidden = !m.dangMo;

    if (!m.dangMo) return;

    ctDangTaiEl.hidden = !m.dangTai;
    ctLoiEl.hidden = !m.loi;
    ctNoiDungEl.hidden = !m.duLieu;

    if (m.loi)
    {
        ctLoiEl.textContent = m.loi;
    }

    if (m.duLieu)
    {
        renderChiTietModal(m.duLieu);
    }
}

function renderChiTietModal(pokemon)
{
    const tplLoai = document.querySelector("#tpl-loai");
    const tplChiSo = document.querySelector("#tpl-chi-so");

    const anhEl = document.querySelector("#ct-anh");
    anhEl.src = pokemon.sprites.front_default ?? "";
    anhEl.alt = pokemon.name;

    document.querySelector("#ct-so").textContent = `#${String(pokemon.id).padStart(3, "0")}`;
    document.querySelector("#ct-ten").textContent = pokemon.name;

    const ctLoaiEl = document.querySelector("#ct-loai");
    ctLoaiEl.innerHTML = "";
    pokemon.types.forEach(({ type }) => {
        const loaiEl = tplLoai.content.firstElementChild.cloneNode(true);
        loaiEl.textContent = type.name;
        loaiEl.classList.add(`loai-${type.name}`);
        ctLoaiEl.append(loaiEl);
    });

    document.querySelector("#ct-chieu-cao").textContent = `${pokemon.height / 10} m`;
    document.querySelector("#ct-can-nang").textContent = `${pokemon.weight / 10} kg`;

    const ctChiSoEl = document.querySelector("#ct-chi-so");
    ctChiSoEl.innerHTML = "";
    pokemon.stats.forEach(({ base_stat, stat }) => {
        const li = tplChiSo.content.firstElementChild.cloneNode(true);
        li.querySelector(".chi-so-ten").textContent = stat.name;
        li.querySelector(".chi-so-so").textContent = base_stat;
        li.querySelector(".thanh-gia-tri").style.width = `${(base_stat / 255) * 100}%`;
        ctChiSoEl.append(li);
    });

    const ctChieuEl = document.querySelector("#ct-chieu");
    ctChieuEl.innerHTML = "";
    pokemon.moves.slice(0, 5).forEach(({ move }) => {
        const li = document.createElement("li");
        li.textContent = move.name;
        ctChieuEl.append(li);
    });
}

function renderTab()
{
    document.querySelectorAll(".tab").forEach(tabEl => {
        tabEl.classList.toggle("dang-chon", tabEl.dataset.tab === state.tabDangChon);
    });
}

function render()
{
    const dsHienThi = state.tabDangChon === "yeu-thich"
                    ? state.dsPokemon.filter(t => state.dsYeuThich.includes(t.name))
                    : state.dsPokemon;


    renderDanhSach(dsHienThi);
    renderTrangThai();
    renderDem();
    renderModal();
    renderTab();
}


// ④ CẬP NHẬT — đổi state rồi gọi render()

function capNhat(thayDoi)
{
    state = { ...state, ...thayDoi };
    render();
}

// ⑤ SỰ KIỆN + KHỞI ĐỘNG
async function khoiDong()
{
    capNhat({dangTai: true, loi: null});

    try
    {
        const [ketQuaTrang, duLieuLoai] = await Promise.all([
            taiTrang(0),
            api.get("/type")
        ]);

        const dsLoai = duLieuLoai.results.map(item => item.name)
                                        .filter(name => !["unknown", "shadow", "stellar"].includes(name));
        
        capNhat({
            dangTai: false,
            dsPokemon: ketQuaTrang.ketQua, 
            tongSo: ketQuaTrang.tongSo,
            offset: 20,
            dsLoai: dsLoai
        });

        const locLoaiEl = document.querySelector("#loc-loai");
        dsLoai.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            locLoaiEl.append(option);
        });
    }
    catch (e)
    {
        capNhat({dangTai: false, loi: phanLoaiLoi(e)})
    }
}

khoiDong();

const taiThemEl = document.querySelector("#tai-them");

taiThemEl.addEventListener("click", taiThemPokemon);

const mocCuoiEl = document.querySelector("#moc-cuoi");

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting)
        taiThemPokemon();
});

observer.observe(mocCuoiEl);

async function taiThemPokemon()
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

document.querySelector("#ds-pokemon").addEventListener("click", (e) => {
    const yeuThichEl = e.target.closest(".nut-yeu-thich");

    if(yeuThichEl)
    {
        const ten = e.target.closest(".the").dataset.id;
        toggleYeuThich(ten);
        return;
    }

    const el = e.target.closest(".the");
    if(!el || el.classList.contains("skeleton"))
        return;

    moChiTiet(el.dataset.id);
});

async function moChiTiet(ten)
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

function dongModal()
{
    capNhat({modal: {...state.modal, dangMo: false}});
}

document.querySelector("#dong-modal").addEventListener("click", dongModal);

document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && state.modal.dangMo)
        dongModal();
});

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

function debouce(fn, delay)
{
    let timerId;

    return function(...args)
    {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}

async function taiLaiDanhSachMacDinh()
{
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

async function timVaHienThi(ten)
{
    ac?.abort();
    ac = new AbortController();
    capNhat({dangTai: true, loi: null, loaiDangChon: ""});

    const tenTrim = ten.trim().toLowerCase();

    if(tenTrim === "")
    {
        taiLaiDanhSachMacDinh();
        return;
    }
    try
    {
        
        const duLieu = await timTheoTen(tenTrim, ac.signal);
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

const tim = debouce(timVaHienThi, 400);

document.querySelector("#o-tim").addEventListener("input", (e) => {
    document.querySelector("#loc-loai").value = "";
    tim(e.target.value);
});

async function xuLyDoiLoc(loai) 
{
    if(loai === "")
    {
        taiLaiDanhSachMacDinh();
        return;
    }
    ac?.abort();
    ac = new AbortController();
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

document.querySelector("#loc-loai").addEventListener("change", (e) => {
    const value = e.currentTarget.value;
    document.querySelector("#o-tim").value = "";
    xuLyDoiLoc(value);
});

function toggleYeuThich(ten)
{
    const daThich = state.dsYeuThich.includes(ten);

    capNhat({
        dsYeuThich: daThich ? state.dsYeuThich.filter(t => t !== ten) : [...state.dsYeuThich, ten]
    });
}

document.querySelector(".cac-tab").addEventListener("click", (e) => {
    const el = e.target.closest(".tab");
    if(!el)
        return;

    capNhat({tabDangChon: el.dataset.tab});
});