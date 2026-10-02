const tenCuaHang = "Cửa hàng Mèo Mập";
const diaChi = "123 Nguyễn Trãi, Quận 1";
let soLuongKhach = 0;

const sanPham = {
  ten: "Áo thun",
  gia: 150000,
  mauSac: ["đỏ", "xanh", "vàng"],
  conHang: true,
  danhMuc: { ma: "AT01", ten: "Thời trang" },
};

function tinhTongTien(gioHang) {
  let tong = 0;
  for (const mon of gioHang) {
    tong += mon.gia * mon.soLuong;
  }
  return tong;
}

const thongBao = (ten, soTien) => {
  return (
    "Xin chào " +
    ten +
    ", đơn hàng của bạn tại " +
    tenCuaHang +
    " (" +
    diaChi +
    ") có tổng giá trị là " +
    soTien +
    " đồng, cảm ơn bạn đã mua sắm và hẹn gặp lại!"
  );
};

function themKhach() {
  soLuongKhach++;
  return soLuongKhach;
}

const gioHang = [
  { ten: "Áo thun", gia: 150000, soLuong: 2 },
  { ten: "Quần jean", gia: 350000, soLuong: 1 },
];

export { sanPham, tinhTongTien, thongBao, themKhach, gioHang };
