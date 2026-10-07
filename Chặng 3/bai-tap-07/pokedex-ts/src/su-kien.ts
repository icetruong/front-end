import { taiThemPokemon, toggleYeuThich, moChiTiet, dongModal, tim, xuLyDoiLoc, capNhat} from "./pokemon.js";
import { state, laTab } from "./trang-thai.js";
import { layEl } from "./untils/index.js";


layEl("#tai-them", HTMLButtonElement).addEventListener("click", taiThemPokemon);

layEl("#ds-pokemon", HTMLUListElement).addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    const yeuThichEl = e.target.closest(".nut-yeu-thich");

    if(yeuThichEl instanceof HTMLButtonElement)
    {
        const theEl = e.target.closest(".the");
        if(!(theEl instanceof HTMLElement))
            return;
        const ten = theEl.dataset.id;
        if(!ten)
            return;
        toggleYeuThich(ten);
        return;
    }

    const el = e.target.closest(".the");
    if(!(el instanceof HTMLElement) || el.classList.contains("skeleton"))
        return;

    if(!el.dataset.id)
        return;
    moChiTiet(el.dataset.id);
});

layEl("#dong-modal", HTMLButtonElement).addEventListener("click", dongModal);

document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && state.modal.loai !== "dong")
        dongModal();
});

layEl("#o-tim", HTMLInputElement).addEventListener("input", (e) => {
    layEl("#loc-loai", HTMLSelectElement).value = "";
    if(e.target instanceof HTMLInputElement)
        tim(e.target.value);
});

layEl("#loc-loai", HTMLSelectElement).addEventListener("change", (e) => {
    if(e.currentTarget instanceof HTMLSelectElement)
    {
        const value = e.currentTarget.value;
        layEl("#o-tim", HTMLInputElement).value = "";
        xuLyDoiLoc(value);
    }
});

layEl(".cac-tab", HTMLElement).addEventListener("click", (e) => {
    if(!(e.target instanceof HTMLElement))
        return;

    const el = e.target.closest(".tab");
    if(!(el instanceof HTMLButtonElement))
        return;

    const tab = el.dataset.tab;
    if(!laTab(tab))     // sau dòng này TS biết tab là Tab ("tat-ca" | "yeu-thich")
        return;

    capNhat({tabDangChon: tab});
});