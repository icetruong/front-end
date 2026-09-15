function tinhTong(arr) {
  let tong = 0;
  for (let i = 0; i < arr.length; i++) {
    let giaTri = arr[i];
    tong += giaTri;
    
    console.log(giaTri); 
  }
  return tong;
}

const nhanDoi = function (x) {
  return x * 2;
};

console.log(nhanDoi(5));

function demNguoiDung() {
  for (let i = 0; i < 3; i++) {
    setTimeout(function () {
      console.log("Người dùng thứ " + i);
    }, 100);
  }
}

const gioHang = {
  danhSach: ["Áo", "Quần"],
  inDanhSach: function () {
    this.danhSach.forEach((item) => {
      console.log(item);
    });
  }
};
gioHang.inDanhSach();

function taoUser(ten) {
  return {
    ten: ten,
    ngayTao: new Date()
  };
}
console.log(taoUser("An"));

"use strict";
function capNhatDiem(diem) {
  let ketQua = diem * 2;
  return ketQua;
}
console.log(capNhatDiem(5));

const tinhTrungBinh = (...diem) => {
    if (diem.length === 0) return 0;   // chặn 0/0 = NaN
    const tong = diem.reduce((acc, curr) => acc + curr, 0);
    return tong / diem.length;
};

console.log(tinhTrungBinh());          // 0
console.log(tinhTrungBinh(5));         // 5
console.log(tinhTrungBinh(1, 2, 3));   // 2

const laSoChan = (n) => {
    if (typeof n === "string")
        n = Number(n);

    if (Number.isNaN(n))
        return false;

    return n % 2 === 0;
}

console.log(laSoChan(4));       // true
console.log(laSoChan(3));       // false
console.log(laSoChan("4"));     // true
console.log(laSoChan("abc"));   // false

const rutGon = (chuoi, doDai = 20) => {
    return chuoi.length > doDai ? chuoi.slice(0, doDai) + '...' : chuoi;
}

console.log(rutGon("Xin chào"));                                   // "Xin chào" — ngắn hơn 20, giữ nguyên
console.log(rutGon("Đây là một chuỗi dài hơn hai mươi ký tự"));     // cắt còn 20 ký tự + "..."
console.log(rutGon("abcdefghij", 5));                               // "abcde..."

const dem = (mang, dieuKien) => {
    return mang.reduce((count, item) => {
        return dieuKien(item) ? count + 1 : count;
    }, 0);
}

console.log(dem([1, 2, 3, 4, 5, 6], (x) => x % 2 === 0));   // 3 — số chẵn
console.log(dem(["a", "bb", "ccc"], (x) => x.length > 1));  // 2
console.log(dem([], (x) => true));                          // 0 — mảng rỗng

const taoBoDem = (batDau = 0) => {
    let count = batDau;
    return () => {
        count++;
        return count;
    }
}

const dem1 = taoBoDem();
console.log(dem1());   // 1
console.log(dem1());   // 2
console.log(dem1());   // 3

const dem2 = taoBoDem(10);
console.log(dem2());   // 11 — độc lập với dem1, không dùng chung count

const thuLai = (hamCanChay, soLan) => {
    while (soLan > 0) {
        try
        {
            const ketqua = hamCanChay();
            return ketqua;
        }
        catch (e)
        {
            soLan--;
            if (soLan === 0)
                throw e;
        }
    }
}

// Hàm giả lập: chỉ thành công ở lần gọi thứ "lanThanhCong",
// những lần trước đó ném lỗi. Dùng closure để đếm số lần đã gọi.
function taoHamGiaLap(lanThanhCong) {
    let soLanGoi = 0;
    return () => {
        soLanGoi++;
        console.log(`  (gọi thử lần ${soLanGoi})`);
        if (soLanGoi < lanThanhCong) {
            throw new Error(`Thất bại ở lần gọi thứ ${soLanGoi}`);
        }
        return `Thành công ở lần gọi thứ ${soLanGoi}`;
    };
}

// Test 1 — đủ số lần thử, thành công ở lần thứ 3
console.log("Test 1: đủ lượt thử");
const hamGiaLap1 = taoHamGiaLap(3);
console.log(thuLai(hamGiaLap1, 5));
// (gọi thử lần 1) -> lỗi, thử lại
// (gọi thử lần 2) -> lỗi, thử lại
// (gọi thử lần 3) -> "Thành công ở lần gọi thứ 3"

// Test 2 — không đủ số lần thử, phải ném lỗi cuối cùng ra
console.log("Test 2: không đủ lượt thử");
const hamGiaLap2 = taoHamGiaLap(3);
try {
    console.log(thuLai(hamGiaLap2, 2));
} catch (e) {
    console.log("Hết lượt, lỗi cuối cùng ném ra:", e.message);
}
