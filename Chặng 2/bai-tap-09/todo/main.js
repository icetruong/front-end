const todoList = [];
let idKeTiep = 0;              // bộ đếm id tăng dần, không tái sử dụng khi xóa
let boLocHienTai = "tat-ca";   // trạng thái: bộ lọc đang chọn
let dangSuaId = null;          // id việc đang được sửa tại chỗ, null = không có

function layDanhSachHienThi()
{
    if (boLocHienTai === "chua-xong")
        return todoList.filter(item => !item.check);
    if (boLocHienTai === "da-xong")
        return todoList.filter(item => item.check);
    return todoList;
}

function ve(todos)
{
    const danhSach = document.querySelector("#danh-sach");
    danhSach.innerHTML = "";

    todos.forEach(item => {
        const li = document.createElement("li");
        li.className = "todo-item";
        if (item.check)
            li.classList.add("is-xong");
        li.dataset.id = item.id;

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
        if (inputSua)
        {
            inputSua.focus();
            inputSua.setSelectionRange(inputSua.value.length, inputSua.value.length);
        }
    }
}

function render()
{
    const danhSachHienThi = layDanhSachHienThi();
    ve(danhSachHienThi);

    const soChuaXong = demViecChuaXong();
    document.querySelector("#dem-so-luong").textContent =
        soChuaXong === 0 ? "Đã xong tất cả" : `${soChuaXong} việc chưa xong`;

    const rong = danhSachHienThi.length === 0;
    const thongBaoRong = document.querySelector("#thong-bao-rong");
    thongBaoRong.hidden = !rong;
    thongBaoRong.textContent = todoList.length === 0
        ? "Chưa có việc nào. Thêm việc đầu tiên của bạn!"
        : "Không có việc nào khớp với bộ lọc này.";

    document.querySelectorAll(".todo-filters__btn").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.filter === boLocHienTai);
    });
}

function themViec(noiDung)
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

function danhDauHoanThanh(id)
{
    const item = todoList.find(item => item.id === id);
    if (item)
        item.check = !item.check;

    render();
}

function xoaViec(id)
{
    const index = todoList.findIndex(item => item.id === id);

    if (index !== -1)
        todoList.splice(index, 1);

    render();
}

function suaViec(id, noiDung)
{
    const item = todoList.find(item => item.id === id);
    if (item)
        item.noiDung = noiDung;

    render();
}

function batDauSua(id)
{
    dangSuaId = id;
    render();
}

function luuSua(id, giaTri)
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

function boLoc(filter)
{
    boLocHienTai = filter;
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

function danhDauTatCa(danhDau)
{
    todoList.forEach(item => item.check = danhDau);

    render();
}

const form = document.querySelector("#form-them");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    themViec(form.elements["them-viec"].value);
    form.reset();
});

const danhSach = document.querySelector("#danh-sach");

danhSach.addEventListener("click", (e) => {
    const el = e.target.closest("[data-hanh-dong]");
    if (!el)
        return;

    const li = el.closest("li");
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
});

danhSach.addEventListener("keydown", (e) => {
    if (!e.target.matches(".todo-item__input-sua"))
        return;

    const id = Number(e.target.closest("li").dataset.id);

    if (e.key === "Enter")
        luuSua(id, e.target.value);

    if (e.key === "Escape")
        huySua();
});

danhSach.addEventListener("focusout", (e) => {
    if (!e.target.matches(".todo-item__input-sua"))
        return;

    const id = Number(e.target.closest("li").dataset.id);

    if (dangSuaId === id)
        luuSua(id, e.target.value);
});

document.querySelector(".todo-filters").addEventListener("click", (e) => {
    const el = e.target.closest(".todo-filters__btn");
    if (!el)
        return;

    boLoc(el.dataset.filter);
});

document.querySelector("#nut-xoa-xong").addEventListener("click", () => {
    xoaDaXong();
});

document.querySelector("#checkbox-tat-ca").addEventListener("change", (e) => {
    danhDauTatCa(e.target.checked);
});

render();
