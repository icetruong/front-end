import { state, type TrangThaiDanhSach } from "./trang-thai.js";
import { type Pokemon } from "./pokeapi.js";
import { layEl, nhanBan } from "./untils/index.ts";

const SO_THE_SKELETON = 20;
const CHI_SO_TOI_DA = 255;   // base_stat cao nhất trong game, dùng để tính % thanh chỉ số
const SO_CHIEU_HIEN_THI = 5;

// Gặp nhánh này nghĩa là union có thêm trạng thái mới mà switch chưa xử lý → TS báo đỏ ngay
function chuaXuLy(x: never): never
{
    throw new Error(`Trạng thái chưa được xử lý: ${JSON.stringify(x)}`);
}

// Lấy mảng Pokémon từ union: chỉ 2 trạng thái có dsPokemon, còn lại coi như rỗng
function layDsPokemon(ds: TrangThaiDanhSach): Pokemon[]
{
    switch (ds.loai)
    {
        case "dang-tai-them":
        case "thanh-cong":
            return ds.dsPokemon;
        case "dang-tai-lan-dau":
        case "loi":
            return [];
        default:
            return chuaXuLy(ds);
    }
}

function dangTai(ds: TrangThaiDanhSach): boolean
{
    return ds.loai === "dang-tai-lan-dau" || ds.loai === "dang-tai-them";
}

function dinhDangSo(id: number): string
{
    return `#${String(id).padStart(3, "0")}`;
}

// Dùng chung cho thẻ ngoài lưới và modal chi tiết
function renderLoai(pokemon: Pokemon, khungEl: HTMLElement): void
{
    const tplLoai = layEl("#tpl-loai", HTMLTemplateElement);

    khungEl.replaceChildren(...pokemon.types.map(({ type }) => {
        const loaiEl = nhanBan(tplLoai);
        loaiEl.textContent = type.name;
        loaiEl.classList.add(`loai-${type.name}`);
        return loaiEl;
    }));
}

function taoThe(pokemon: Pokemon, tplThe: HTMLTemplateElement): HTMLElement
{
    const li = nhanBan(tplThe);

    li.dataset.id = pokemon.name;
    layEl(".so", HTMLElement, li).textContent = dinhDangSo(pokemon.id);
    layEl(".ten", HTMLElement, li).textContent = pokemon.name;

    const nutYeuThich = layEl(".nut-yeu-thich", HTMLButtonElement, li);
    const daThich = state.dsYeuThich.includes(pokemon.name);
    nutYeuThich.textContent = daThich ? "★" : "☆";
    nutYeuThich.classList.toggle("da-thich", daThich);

    const anh = layEl(".anh", HTMLImageElement, li);
    anh.src = pokemon.sprites.front_default ?? "";
    anh.alt = pokemon.name;

    renderLoai(pokemon, layEl(".ds-loai", HTMLElement, li));

    return li;
}

function renderDanhSach(dsPokemon: Pokemon[]): void
{
    const dsPokemonEl = layEl("#ds-pokemon", HTMLUListElement);
    const tplThe = layEl("#tpl-the", HTMLTemplateElement);

    dsPokemonEl.replaceChildren(...dsPokemon.map(pokemon => taoThe(pokemon, tplThe)));
}

function renderDem(): void
{
    const demEl = layEl("#dem", HTMLElement);
    const taiThemEl = layEl("#tai-them", HTMLButtonElement);

    const soDaTai = layDsPokemon(state.dsPokemon).length;
    const { tongSo } = state.phanTrang;

    demEl.textContent = `Đã tải ${soDaTai}/${tongSo}`;
    taiThemEl.disabled = soDaTai >= tongSo || state.boLoc.tuKhoa !== "" || dangTai(state.dsPokemon);
}

function renderTrangThai(): void
{
    const khungLoiEl = layEl("#khung-loi", HTMLElement);
    const loiNoiDungEl = layEl("#loi-noi-dung", HTMLElement);
    const khungRongEl = layEl("#khung-rong", HTMLElement);
    const rongNoiDungEl = layEl("#rong-noi-dung", HTMLElement);
    const dsPokemonEl = layEl("#ds-pokemon", HTMLUListElement);
    const tplSkeleton = layEl("#tpl-skeleton", HTMLTemplateElement);

    const ds = state.dsPokemon;
    const rong = ds.loai === "thanh-cong" && ds.dsPokemon.length === 0;

    khungLoiEl.hidden = ds.loai !== "loi";
    if (ds.loai === "loi")
        loiNoiDungEl.textContent = ds.thongBao;

    khungRongEl.hidden = !rong;
    if (rong)
    {
        const { tuKhoa } = state.boLoc;
        rongNoiDungEl.textContent = tuKhoa !== ""
            ? `Không tìm thấy Pokémon nào khớp "${tuKhoa}".`
            : "Không tìm thấy Pokémon nào khớp bộ lọc hiện tại.";
    }

    if (ds.loai === "dang-tai-lan-dau")
    {
        for (let i = 0; i < SO_THE_SKELETON; i++)
            dsPokemonEl.append(nhanBan(tplSkeleton));
    }
}

function renderModal(): void
{
    const modalEl = layEl("#modal", HTMLElement);
    const ctDangTaiEl = layEl("#ct-dang-tai", HTMLElement);
    const ctLoiEl = layEl("#ct-loi", HTMLElement);
    const ctNoiDungEl = layEl("#ct-noi-dung", HTMLElement);
    const m = state.modal;

    modalEl.hidden = m.loai === "dong";
    ctDangTaiEl.hidden = m.loai !== "dang-tai";
    ctLoiEl.hidden = m.loai !== "loi";
    ctNoiDungEl.hidden = m.loai !== "thanh-cong";

    // Trong từng case, TS tự thu hẹp m → chỉ nhánh "loi" mới đọc được thongBao, nhánh "thanh-cong" mới có duLieu
    switch (m.loai)
    {
        case "dong":
        case "dang-tai":
            return;
        case "loi":
            ctLoiEl.textContent = m.thongBao;
            return;
        case "thanh-cong":
            renderChiTietModal(m.duLieu);
            return;
        default:
            chuaXuLy(m);
    }
}

function renderChiSo(pokemon: Pokemon): void
{
    const tplChiSo = layEl("#tpl-chi-so", HTMLTemplateElement);
    const ctChiSoEl = layEl("#ct-chi-so", HTMLUListElement);

    ctChiSoEl.replaceChildren(...pokemon.stats.map(({ base_stat, stat }) => {
        const li = nhanBan(tplChiSo);
        layEl(".chi-so-ten", HTMLElement, li).textContent = stat.name;
        layEl(".chi-so-so", HTMLElement, li).textContent = String(base_stat);
        layEl(".thanh-gia-tri", HTMLElement, li).style.width = `${(base_stat / CHI_SO_TOI_DA) * 100}%`;
        return li;
    }));
}

function renderChieuThuc(pokemon: Pokemon): void
{
    const ctChieuEl = layEl("#ct-chieu", HTMLOListElement);

    ctChieuEl.replaceChildren(...pokemon.moves.slice(0, SO_CHIEU_HIEN_THI).map(({ move }) => {
        const li = document.createElement("li");
        li.textContent = move.name;
        return li;
    }));
}

function renderChiTietModal(pokemon: Pokemon): void
{
    const anhEl = layEl("#ct-anh", HTMLImageElement);
    anhEl.src = pokemon.sprites.front_default ?? "";
    anhEl.alt = pokemon.name;

    layEl("#ct-so", HTMLElement).textContent = dinhDangSo(pokemon.id);
    layEl("#ct-ten", HTMLElement).textContent = pokemon.name;
    layEl("#ct-chieu-cao", HTMLElement).textContent = `${pokemon.height / 10} m`;
    layEl("#ct-can-nang", HTMLElement).textContent = `${pokemon.weight / 10} kg`;

    renderLoai(pokemon, layEl("#ct-loai", HTMLElement));
    renderChiSo(pokemon);
    renderChieuThuc(pokemon);
}

function renderTab(): void
{
    document.querySelectorAll(".tab").forEach(tabEl => {
        // querySelectorAll trả về Element (không có dataset) → thu hẹp trước khi dùng
        if (tabEl instanceof HTMLElement)
            tabEl.classList.toggle("dang-chon", tabEl.dataset.tab === state.tabDangChon);
    });
}

export function render(): void
{
    const dsPokemon = layDsPokemon(state.dsPokemon);
    const dsHienThi = state.tabDangChon === "yeu-thich"
                    ? dsPokemon.filter(p => state.dsYeuThich.includes(p.name))
                    : dsPokemon;

    renderDanhSach(dsHienThi);
    renderTrangThai();   // chạy SAU renderDanhSach vì skeleton được thêm vào lưới vừa làm trống
    renderDem();
    renderModal();
    renderTab();
}
