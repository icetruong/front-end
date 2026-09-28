
import { state } from "./trang-thai.js";

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

export function render()
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