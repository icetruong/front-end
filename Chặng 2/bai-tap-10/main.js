// ============================================================
// BẢN VIẾT LẠI CHO CHUẨN — dùng tham số đầu vào để tạo data,
// message lỗi khớp đúng với từng hàm, dữ liệu phản ánh đúng
// tầng đang xử lý (để Phần B/C chain và so sánh được đúng).
// ============================================================

function layUser(id, cb) {
    setTimeout(() => {
        if (Math.random() < 0.2) {
            cb(new Error("Lỗi lấy user " + id));
        } else {
            cb(null, { id, ten: "User " + id });
        }
    }, 300);
}

function layDonHang(userId, cb) {
    setTimeout(() => {
        if (Math.random() < 0.2) {
            cb(new Error("Lỗi lấy đơn hàng của user " + userId));
        } else {
            cb(null, [
                { id: 1, userId, ten: "Đơn hàng số 1 của user " + userId },
                { id: 2, userId, ten: "Đơn hàng số 2 của user " + userId },
            ]);
        }
    }, 300);
}

function layChiTiet(donId, cb) {
    setTimeout(() => {
        if (Math.random() < 0.2) {
            cb(new Error("Lỗi lấy chi tiết đơn " + donId));
        } else {
            cb(null, { donId, maSP: 1, ten: "Chi tiết đơn hàng " + donId });
        }
    }, 300);
}

function laySanPham(maSP, cb) {
    setTimeout(() => {
        if (Math.random() < 0.2) {
            cb(new Error("Lỗi lấy sản phẩm " + maSP));
        } else {
            cb(null, { maSP, ten: "Sản phẩm " + maSP });
        }
    }, 300);
}

// B
// ❌ SAI — cả 4 chỗ bên dưới dùng `err.Error` để lấy nội dung lỗi.
// Object Error KHÔNG có thuộc tính `.Error` (viết hoa) — thuộc tính đúng là `.message`.
// `err.Error` luôn là `undefined`, nên khi lỗi thật sự xảy ra, console chỉ in ra "undefined"
// thay vì nội dung lỗi bạn đã tự đặt (vd "Lỗi lấy user 1") — coi như bạn không biết lỗi gì đã xảy ra.
// Đã sửa cả 4 chỗ thành `err.message` bên dưới.
layUser(1, (err, user) => {
    if(err)
    {
        console.log(err.message);
        return;
    }
    layDonHang(user.id, (err, donHangs) => {
        if(err)
        {
            console.log(err.message);
            return;
        }
        layChiTiet(donHangs[0].id, (err, donHang) => {
            if(err)
            {
                console.log(err.message);
                return;
            }
            laySanPham(donHang.maSP, (err, sanPham) => {
                if(err)
                {
                    console.log(err.message);
                    return;
                }
                console.log(sanPham);
            });
        });
    });
});

// C
// Gọi layDonHang cho 3 user cùng lúc (không lồng nhau — cả 3 chạy song song),
// tự đếm bằng tay số lần hoàn thành, in kết quả khi cả 3 đã xong.
let soLanXong = 0;
const ketQuaBaUser = [];

function kiemTraXongChua() {
    soLanXong++;
    if (soLanXong === 3) {
        console.log("Cả 3 user đã xong:", ketQuaBaUser);
    }
}

[1, 2, 3].forEach((userId) => {
    layDonHang(userId, (err, donHangs) => {
        if (err) {
            ketQuaBaUser.push({ userId, loi: err.message });
        } else {
            ketQuaBaUser.push({ userId, donHangs });
        }
        // Dù lỗi hay không cũng phải tăng đếm — nếu return sớm khi có lỗi
        // (giống Phần B), soLanXong sẽ không bao giờ chạm 3 và code sẽ treo mãi.
        kiemTraXongChua();
    });
});



// Bài 5 — bản gốc bạn viết, giữ lại để đối chiếu:
//
// function taoDongHoBam()
// {
//     let time;
//     let isDung = false;
//     function tangTime()
//     {
//         const moiLo = 10;
//         const batDau = Date.now();
//         function chayMotLo()
//         {
//             const hetLo = batDau + moiLo;
//             while(Date.now() < hetLo) { }
//             time = Date.now() - batDau;
//             if(!isDung) setTimeout(chayMotLo, 0);
//         }
//         chayMotLo();
//     }
//     return {
//         batDau() { tangTime(); },
//         dung() { if(isDung === false) isDung = true; },
//         tiepTuc() { if(isDung === true) { isDung = false; tangTime(); } },
//         datLai() { time = 0; },
//         layThoiGian() { return time; }
//     }
// }
//
// ❌ SAI (1) — dùng `while(Date.now() < hetLo) {}` để "chờ" đủ 10ms mỗi lô.
// Đây là busy-wait: nó CHIẾM CỨNG call stack và đóng băng cả trang trong suốt 10ms đó,
// lặp lại liên tục hết lô này đến lô khác trong khi đồng hồ đang chạy — tức là trang gần
// như đứng hình liên tục. Bài 9 (mục "Đừng chặn luồng chính") nói chia lô là để giảm việc
// PHẢI làm mỗi lần, không phải để dựng vòng lặp chờ. Ở đây không có việc nặng nào cần tính —
// chỉ cần đọc Date.now() — nên không cần vòng lặp/setTimeout nào cả.
//
// ❌ SAI (2) — không dùng `requestAnimationFrame` như đề bài yêu cầu, dùng `setTimeout(fn, 0)` thay thế.
//
// ❌ SAI (3, nghiêm trọng nhất) — mất thời gian đã trôi khi dừng rồi tiếp tục.
// Mỗi lần `tangTime()` chạy, nó tạo `const batDau = Date.now()` MỚI và tính
// `time = Date.now() - batDau` — tức `time` luôn được tính lại từ mốc bắt đầu của
// LẦN GỌI HIỆN TẠI, không cộng dồn với thời gian đã tích luỹ trước khi `dung()`.
// Gọi `batDau()` → chạy 5s → `dung()` (time = 5000ms) → `tiepTuc()` → `tangTime()` chạy lại
// với `batDau` mới → 1 lô sau (10ms) `time` bị ghi đè thành ~10ms, XOÁ MẤT 5 giây đã trôi.
// Đây chính là yêu cầu đề bài nhấn mạnh: "Dừng rồi tiếp tục phải đúng, không mất thời gian đã trôi".
//
// ❌ SAI (4) — `datLai()` không có tác dụng khi đồng hồ đang chạy: nó set `time = 0`,
// nhưng vòng lặp `chayMotLo` đang chạy dở sẽ ghi đè `time` bằng `Date.now() - batDau` (mốc cũ)
// ngay ở lần lặp kế tiếp (chỉ trong vòng 10ms sau) — `datLai()` coi như bị vô hiệu hoá.

// ============================================================
// BẢN VIẾT LẠI CHO CHUẨN
// Ý tưởng cốt lõi: không cần vòng lặp nội bộ nào cả (không setTimeout,
// không while, không cả requestAnimationFrame bên trong closure này).
// Chỉ cần lưu 2 mốc: `thoiGianDaTroi` (tổng đã tích luỹ trước lần chạy hiện tại)
// và `thoiDiemBatDau` (Date.now() lúc bắt đầu/tiếp tục lần chạy hiện tại).
// `layThoiGian()` tính hiệu tại đúng thời điểm được gọi — luôn chính xác tuyệt đối,
// không có sai số cộng dồn kiểu setInterval. requestAnimationFrame để CẬP NHẬT HIỂN THỊ
// thuộc về code gọi bên ngoài (nơi có DOM), xem ví dụ dùng bên dưới.
// ============================================================

function taoDongHoBam() {
    let thoiGianDaTroi = 0;       // tổng ms đã tích luỹ trước lần chạy hiện tại
    let thoiDiemBatDau = null;    // Date.now() lúc bắt đầu/tiếp tục lần chạy hiện tại
    let dangChay = false;

    return {
        batDau() {
            if(dangChay)
                return;
            dangChay = true;
            thoiDiemBatDau = Date.now();
        },
        dung() {
            if(!dangChay)
                return;
            dangChay = false;
            thoiGianDaTroi += Date.now() - thoiDiemBatDau;
        },
        tiepTuc() {
            if(dangChay)
                return;
            dangChay = true;
            thoiDiemBatDau = Date.now();
        },
        datLai() {
            thoiDiemBatDau = dangChay ? Date.now() : null;
            thoiGianDaTroi = 0;
        },
        layThoiGian() {
            return dangChay 
                        ? thoiGianDaTroi + Date.now() - thoiDiemBatDau 
                        : thoiGianDaTroi;
        }
    };
}

// Ví dụ hook requestAnimationFrame để CẬP NHẬT HIỂN THỊ (viết ở code gọi, không phải
// trong taoDongHoBam — closure chỉ giữ trạng thái thời gian, không đụng DOM):
//
// const dongHo = taoDongHoBam();
//
// function dinhDang(ms) {
//     const phut = Math.floor(ms / 60000);
//     const giay = Math.floor((ms % 60000) / 1000);
//     const phanTramGiay = Math.floor((ms % 1000) / 10);
//     const pad = (n, len = 2) => String(n).padStart(len, "0");
//     return `${pad(phut)}:${pad(giay)}.${pad(phanTramGiay)}`;
// }
//
// function capNhatHienThi() {
//     document.querySelector("#hienThi").textContent = dinhDang(dongHo.layThoiGian());
//     requestAnimationFrame(capNhatHienThi);
// }
// requestAnimationFrame(capNhatHienThi);
