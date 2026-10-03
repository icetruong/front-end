const kho = {
    doc(khoa: string, macDinh: unknown = null) : unknown
    {
        try
        {
            const giaTri = localStorage.getItem(khoa);
            if(giaTri === null)
                return macDinh;

            return JSON.parse(giaTri);
        }
        catch (e)
        {
            if (e instanceof Error)
                if (e.name === "SyntaxError")
                    localStorage.removeItem(khoa);
            return macDinh;
        }
    },
    ghi(khoa: string, giaTri: unknown) : boolean
    {
        try
        {
            localStorage.setItem(khoa, JSON.stringify(giaTri));
            return true;
        }
        catch (e)
        {
            if (e instanceof Error)
                if (e.name === "QuotaExceededError") {
                    console.error("Hết dung lượng lưu trữ");
                }
            return false;
        }
    },
    xoa(khoa: string)
    {
        localStorage.removeItem(khoa);
    },
    co(khoa: string)
    {
        return localStorage.getItem(khoa) !== null;
    }
}

interface Viec {
    id: number;
    noiDung: string;
    check: boolean;
};

function laViec(x: unknown): x is Viec
{
    return (typeof x === "object" && x !== null &&
        "id" in x && typeof x.id === "number" &&
        "noiDung" in x && typeof x.noiDung === "string" &&
        "check" in x && typeof x.check === "boolean");
}

function laDanhSachViec(x: unknown): x is Viec[]
{
    return Array.isArray(x) && x.every(laViec);
}

type BoLoc = "tat-ca" | "chua-xong" | "da-xong";

function laBoLoc(x: unknown): x is BoLoc
{
    return x === "tat-ca" || x === "chua-xong" || x === "da-xong";
}

const viecDaLuu = kho.doc("todoList", []);
let todoList: Viec[] = laDanhSachViec(viecDaLuu) ? viecDaLuu : [];
let idKeTiep = 0;              // bộ đếm id tăng dần, không tái sử dụng khi xóa
const boLocDaLuu = kho.doc("boLoc", "tat-ca");
let boLocHienTai: BoLoc = laBoLoc(boLocDaLuu) ? boLocDaLuu : "tat-ca";  // trạng thái: bộ lọc đang chọn
let dangSuaId: number | null = null;          // id việc đang được sửa tại chỗ, null = không có

function layDanhSachHienThi() : Viec[]
{
    if (boLocHienTai === "chua-xong")
        return todoList.filter(item => !item.check);
    if (boLocHienTai === "da-xong")
        return todoList.filter(item => item.check);
    return todoList;
}

function ve(todos: Viec[])
{
    const danhSach = document.querySelector("#danh-sach");
    if(!(danhSach instanceof HTMLUListElement))
        return;
    danhSach.innerHTML = "";

    todos.forEach(item => {
        const li = document.createElement("li");
        li.className = "todo-item";
        if (item.check)
            li.classList.add("is-xong");
        li.dataset.id = item.id.toString();

        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.className = "todo-item__checkbox";
        checkBox.dataset.hanhDong = "xong";
        checkBox.checked = item.check;

        const sua = document.createElement("button");
        sua.type = "button";
        sua.className = "todo-item__btn todo-item__btn--sua";
        sua.dataset.hanhDong = "sua";
        sua.textContent = "✎";
        sua.setAttribute("aria-label", "Sửa");

        const xoa = document.createElement("button");
        xoa.type = "button";
        xoa.className = "todo-item__btn todo-item__btn--xoa";
        xoa.dataset.hanhDong = "xoa";
        xoa.textContent = "✕";
        xoa.setAttribute("aria-label", "Xóa");

        if (item.id === dangSuaId)
        {
            const inputSua = document.createElement("input");
            inputSua.type = "text";
            inputSua.className = "todo-item__input-sua";
            inputSua.value = item.noiDung;

            li.append(checkBox, inputSua, sua, xoa);
        }
        else
        {
            const span = document.createElement("span");
            span.className = "todo-item__noi-dung";
            span.textContent = item.noiDung;

            li.append(checkBox, span, sua, xoa);
        }

        danhSach.append(li);
    });

    if (dangSuaId !== null)
    {
        const inputSua = danhSach.querySelector(".todo-item__input-sua");
        if (inputSua instanceof HTMLInputElement)
        {
            inputSua.focus();
            inputSua.setSelectionRange(inputSua.value.length, inputSua.value.length);
        }
    }
}

function render()
{
    kho.ghi("todoList", todoList);
    const danhSachHienThi = layDanhSachHienThi();
    ve(danhSachHienThi);

    const soChuaXong = demViecChuaXong();
    const demSoLuong = document.querySelector("#dem-so-luong");
    if((demSoLuong instanceof HTMLElement))
    {
        demSoLuong.textContent = soChuaXong === 0 ? "Đã xong tất cả" : `${soChuaXong} việc chưa xong`;
    }
    
    const rong = danhSachHienThi.length === 0;
    const thongBaoRong = document.querySelector("#thong-bao-rong");
    if (thongBaoRong instanceof HTMLElement) {
        thongBaoRong.hidden = !rong;
        thongBaoRong.textContent = todoList.length === 0
            ? "Chưa có việc nào. Thêm việc đầu tiên của bạn!"
            : "Không có việc nào khớp với bộ lọc này.";
    }

    document.querySelectorAll(".todo-filters__btn").forEach(btn => {
        if(btn instanceof HTMLButtonElement)
        {
            btn.classList.toggle("is-active", btn.dataset.filter === boLocHienTai);
        }
    });
}

function themViec(noiDung: string)
{
    if (noiDung.trim().length === 0)
        return;

    todoList.push({
        id: idKeTiep,
        noiDung: noiDung.trim(),
        check: false
    });
    idKeTiep++;

    render();
}

function danhDauHoanThanh(id: number)
{
    const item = todoList.find(item => item.id === id);
    if (item)
        item.check = !item.check;

    render();
}

function xoaViec(id: number)
{
    const index = todoList.findIndex(item => item.id === id);

    if (index !== -1)
        todoList.splice(index, 1);

    render();
}

function suaViec(id: number, noiDung: string)
{
    const item = todoList.find(item => item.id === id);
    if (item)
        item.noiDung = noiDung;

    render();
}

function batDauSua(id: number)
{
    dangSuaId = id;
    render();
}

function luuSua(id: number, giaTri: string)
{
    if (giaTri.trim().length > 0)
        suaViec(id, giaTri.trim());

    dangSuaId = null;
    render();
}

function huySua()
{
    dangSuaId = null;
    render();
}

function boLoc(filter: BoLoc)
{
    boLocHienTai = filter;
    kho.ghi("boLoc", filter);
    render();
}

function demViecChuaXong()
{
    return todoList.filter(item => !item.check).length;
}

function xoaDaXong()
{
    const soLuongDaXong = todoList.filter(item => item.check).length;

    if (soLuongDaXong > 3)
    {
        const xacNhan = confirm(`Xóa ${soLuongDaXong} việc đã xong?`);
        if (!xacNhan)
            return;
    }

    todoList.splice(0, todoList.length, ...todoList.filter(item => !item.check));

    render();
}

function danhDauTatCa(danhDau: boolean)
{
    todoList.forEach(item => item.check = danhDau);

    render();
}

const form = document.querySelector("#form-them");
if(form instanceof HTMLFormElement)
{
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.elements.namedItem("them-viec");
        if (input instanceof HTMLInputElement) {
            themViec(input.value);
        }
        form.reset();
    });
}



const danhSach = document.querySelector<HTMLUListElement>("#danh-sach");

danhSach?.addEventListener("click", (e) => {
    if(!(e.target instanceof HTMLElement))
        return;

    const el = e.target.closest<HTMLElement>("[data-hanh-dong]");
    if (!el)
        return;

    const li = el.closest("li");
    if(li instanceof HTMLLIElement)
    {
        const id = Number(li.dataset.id);

        switch (el.dataset.hanhDong)
        {
            case "xong":
                danhDauHoanThanh(id);
                break;
            case "sua":
                batDauSua(id);
                break;
            case "xoa":
                xoaViec(id);
                break;
        }
    }
});

danhSach?.addEventListener("keydown", (e) => {
    if(!(e.target instanceof HTMLInputElement))
        return;

    if (!e.target.matches(".todo-item__input-sua"))
        return;

    const li = e.target.closest("li");
    if(!(li instanceof HTMLLIElement))
        return;
    const id = Number(li.dataset.id);

    if (e.key === "Enter")
        luuSua(id, e.target.value);

    if (e.key === "Escape")
        huySua();
});

danhSach?.addEventListener("focusout", (e) => {
    if(!(e.target instanceof HTMLInputElement))
        return;

    if (!e.target.matches(".todo-item__input-sua"))
        return;


    const li = e.target.closest("li");
    if(!(li instanceof HTMLLIElement))
        return;
    const id = Number(li.dataset.id);

    if (dangSuaId === id)
        luuSua(id, e.target.value);
});

document.querySelector(".todo-filters")?.addEventListener("click", (e) => {
    if(!(e.target instanceof HTMLElement))
        return;
    const el = e.target.closest<HTMLButtonElement>(".todo-filters__btn");
    if (!el)
        return;
    const filter = el.dataset.filter as BoLoc;
    boLoc(filter);
});

document.querySelector("#nut-xoa-xong")?.addEventListener("click", () => {
    xoaDaXong();
});

document.querySelector("#checkbox-tat-ca")?.addEventListener("change", (e) => {
    if(!(e.target instanceof HTMLInputElement))
        return;
    danhDauTatCa(e.target.checked);
});

window.addEventListener("storage", (e) => {
    if(e.key === "todoList")
    {
        todoList = JSON.parse(e.newValue ?? "[]");
        render();
    }
    if(e.key === "boLoc")
    {
        boLocHienTai = JSON.parse(e.newValue ?? "\"tat-ca\"");
        render();
    }
});

render();
