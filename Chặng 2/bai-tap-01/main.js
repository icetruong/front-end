const a = { x: 1 };
const b = a;
const c = { x: 1 };

b.x = 99;

console.log(a.x);      // ? -> 99
console.log(c.x);      // ? -> 1
console.log(a === b);  // ? -> true
console.log(a === c);  // ? -> false

const arr1 = [1, 2, 3];
const arr2 = arr1;
const arr3 = [...arr1];

arr2.push(4);

console.log(arr1);     // ? 1 2 3 4
console.log(arr3);     // ? 1 2 3

const sanPham = {
  ten: "Bàn phím",
  gia: 500000,
  thongTin: { baoHanh: 12, mau: "đen" }
};

function giamGia(sp, phanTram) {
  const spMoi = structuredClone(sp);
  spMoi.gia = spMoi.gia * (1 - phanTram / 100);
  return spMoi;
}

function laRong(giaTri) {
  // null hoặc undefined -> rỗng. Dùng == để bắt cả hai cùng lúc (mục 7 file 01)
  if (giaTri == null) return true;

  // chuỗi rỗng hoặc toàn dấu cách
  if (typeof giaTri === "string") return giaTri.trim() === "";

  // mảng không phần tử — phải kiểm tra TRƯỚC object, vì Array.isArray
  // mới phân biệt được mảng với object thường (typeof cả hai đều "object")
  if (Array.isArray(giaTri)) return giaTri.length === 0;

  // object thường (không phải mảng, không phải null — null đã bị chặn ở trên)
  if (typeof giaTri === "object") return Object.keys(giaTri).length === 0;

  // còn lại: number, boolean, function... không bao giờ coi là rỗng
  // (0, false, NaN cố tình rơi vào đây và trả về false)
  return false;
}

// 12 trường hợp test
console.log(laRong(null));       // true
console.log(laRong(undefined));  // true
console.log(laRong(""));         // true
console.log(laRong("   "));      // true
console.log(laRong([]));         // true
console.log(laRong({}));         // true
console.log(laRong(0));          // false — giá trị hợp lệ, không phải rỗng
console.log(laRong(false));      // false — giá trị hợp lệ, không phải rỗng
console.log(laRong(NaN));        // false — giá trị hợp lệ, không phải rỗng
console.log(laRong("abc"));      // false
console.log(laRong([1, 2]));     // false
console.log(laRong({ a: 1 }));   // false

const duLieuForm = {
  ten: "  An  ",
  tuoi: "22",
  diem: "8.5",
  daKichHoat: "false",
  soDienThoai: ""
};

function chuanHoaDuLieu(form) {
    const duLieuMoi = structuredClone(form);
    duLieuMoi.ten = duLieuMoi.ten.trim();
    duLieuMoi.tuoi = Number(duLieuMoi.tuoi);
    duLieuMoi.diem = Number(duLieuMoi.diem);
    duLieuMoi.daKichHoat = duLieuMoi.daKichHoat === "false" ? false : true;
    duLieuMoi.soDienThoai = duLieuMoi.soDienThoai.trim() === "" ? null : duLieuMoi.soDienThoai.trim();
    return duLieuMoi;
}

console.log(chuanHoaDuLieu(duLieuForm));
// kỳ vọng: { ten: "An", tuoi: 22, diem: 8.5, daKichHoat: false, soDienThoai: null }

console.log(duLieuForm);
// kỳ vọng: vẫn nguyên bản, chuỗi y như lúc đầu ("  An  ", "22", "8.5", "false", "")