import { taiThemPokemon, toggleYeuThich, moChiTiet, dongModal, tim, xuLyDoiLoc, capNhat} from "./pokemon.js";
import { state } from "./trang-thai.js";


document.querySelector("#tai-them").addEventListener("click", taiThemPokemon);

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

document.querySelector("#dong-modal").addEventListener("click", dongModal);

document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && state.modal.dangMo)
        dongModal();
});

document.querySelector("#o-tim").addEventListener("input", (e) => {
    document.querySelector("#loc-loai").value = "";
    tim(e.target.value);
});

document.querySelector("#loc-loai").addEventListener("change", (e) => {
    const value = e.currentTarget.value;
    document.querySelector("#o-tim").value = "";
    xuLyDoiLoc(value);
});

document.querySelector(".cac-tab").addEventListener("click", (e) => {
    const el = e.target.closest(".tab");
    if(!el)
        return;

    capNhat({tabDangChon: el.dataset.tab});
});