console.log("Chặng 2 bắt đầu");
console.log(document.getElementById("tieu-de"));

// Bài 3 — Làm quen console
const ten = "icetruong";
const tuoi = 21;
const ngheNghiep = "sinh viên";

// In thường
console.log(ten, tuoi, ngheNghiep);

// In bằng mẹo { } để biết tên biến
console.log({ ten, tuoi, ngheNghiep });

// Mảng 3 object, in bằng console.table
const danhSach = [
  { ten: "An", tuoi: 22, ngheNghiep: "Front-end developer" },
  { ten: "Bình", tuoi: 25, ngheNghiep: "Designer" },
  { ten: "Chi", tuoi: 20, ngheNghiep: "Sinh viên" }
];
console.table(danhSach);

// Thử warn và error
console.warn("Đây là cảnh báo");
console.error("Đây là lỗi");

