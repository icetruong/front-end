// ❌ SAI: hàm nhận tham số `noiDung` nhưng không dùng nó — lại hard-code chữ "D".
// Gọi themItem("Xin chào") vẫn luôn ra <li>D</li>. Sửa: li.textContent = noiDung;
function themItem(noiDung)
{
    const li = document.createElement("li");
    li.className = "item";
    li.textContent = noiDung;

    document.querySelector("#ds").append(li);
}

function xoaItemCuoi()
{
    const lastLi = document.querySelector("#ds").lastElementChild;
    if(lastLi)
        lastLi.remove();
}

// ❌ SAI: `allItem` khai báo bằng const rồi lại gán đè ở dòng dưới
// -> TypeError: Assignment to constant variable, hàm crash ngay khi chạy.
// Sửa: đổi const thành let, hoặc đặt tên biến khác cho mảng đã reverse.
function daoNguoc()
{
    let allItem = document.querySelectorAll(".item");
    allItem = [...allItem].reverse();
    document.querySelector("#ds").replaceChildren(...allItem);
}

// ❌ SAI: `count` khai báo bằng const rồi `count++` ở cuối vòng lặp
// -> TypeError: Assignment to constant variable ngay ở item đầu tiên, hàm crash.
// Sửa gọn hơn: forEach đã có sẵn tham số index, không cần tự đếm:
//   allItem.forEach((item, index) => { if (index % 2 === 1) item.classList.add("chan"); });
// (index 0-based: vị trí 2,4,6.. ứng với index lẻ 1,3,5..)
function danhDauChan()
{
    const allItem = document.querySelectorAll(".item");
    allItem.forEach((item, index) => {
        if(index%2 === 1)
        {
            item.classList.add("chan");
        }
    });
}

function demItem()
{
    return document.querySelectorAll(".item").length;
}

function xoaSach()
{
    document.querySelector("#ds").replaceChildren();
}

// ❌ SAI: điều kiện vòng lặp dùng `n.length`, nhưng `n` là SỐ (VD themNhieu(5000)), số không có
// .length -> n.length là undefined -> i < undefined luôn false -> vòng lặp KHÔNG chạy lần nào,
// hàm không thêm item nào cả. Sửa: i < n.
// ❌ THIẾU: đề bài yêu cầu đo thời gian bằng performance.now() với n = 5000 và so sánh với
// cách chèn từng cái một (không dùng fragment), rồi ghi cả hai con số vào du-doan.md — phần này
// chưa làm. -> tôi bỏ qua chỗ này
function themNhieu(n)
{
    const frag = document.createDocumentFragment();
    for(let i = 0; i<n; i++)
    {
        const li = document.createElement("li");
        li.className = "item";
        li.textContent = i;

        frag.append(li);
    }
    document.querySelector("#ds").append(frag);
}



