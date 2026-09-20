// ĐÃ CHECK LẠI (fix lần 2) - xem ghi chú NOTE bên dưới cho 2 điểm còn lại

// ds1
let ds1 = document.querySelector("#ds1")
let itemsDs1 = ds1.querySelectorAll(".xoa");

itemsDs1.forEach(item => {
    item.addEventListener("click", (e) => {
        e.target.closest("li").remove();
    });
})

// ds2
let ds2 = document.querySelector("#ds2");

ds2.addEventListener("click", (e) => {
    const item = e.target.closest(".xoa");
    if(!item)
        return;

    item.closest("li").remove();
});

document.querySelector("#them").addEventListener("click", (e) => {
    const li = document.createElement("li");
    li.innerHTML = `Item them <button class="xoa">Xóa</button>`;
    // OK: dùng cloneNode(true) tạo 2 node riêng cho 2 danh sách - đúng, sửa được lỗi "move node" trước đó
    ds1.append(li.cloneNode(true));
    ds2.append(li.cloneNode(true));
    // NOTE (không bắt buộc): mọi item mới đều tên "Item them", không tăng số như "Item 4", "Item 5"...
    // - không sai, chỉ là chưa đếm số item hiện có. Muốn đánh số thật thì dùng ví dụ:
    // const soTT = ds1.children.length + 1; rồi `Item ${soTT} ...`
})