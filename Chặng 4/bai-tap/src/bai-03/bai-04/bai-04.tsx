import { useState } from "react";

type Hang = { 
    ten: string,
    gia: number,
    sl: number 
}

// --- A ---
export function GioHang() {
  const [ds, setDs] = useState<Hang[]>([]);
  // [NOTE] SAI: quên nhân số lượng. Mua 3 cái áo giá 100 → tổng phải là 300, đang ra 100.
  const tongTien = ds.reduce((tong, item) => tong + item.gia, 0);
  // [NOTE] SAI: `ds.length` là số DÒNG hàng, không phải tổng SỐ LƯỢNG.
  //   Giỏ có [áo × 3, quần × 2] → ds.length = 2, nhưng tổng số lượng là 5.
  //   Tổng số lượng là cộng dồn `sl` của từng dòng — cùng kiểu với tongTien.
  const tongSoLuong = ds.length;
  const rong = ds.length === 0;
  // [NOTE] Dòng comment dưới là của đề cũ, giờ không còn đúng (chỉ còn 1 state) → nên xóa.
  // ... mỗi hàm thêm/xóa đều phải cập nhật cả bốn state
}

// [NOTE] ĐÚNG HƯỚNG ✅: union làm cho các tổ hợp vô lý (vừa đang tải vừa có lỗi) không viết ra được.
// [NOTE] SAI (nhỏ): bản gốc `duLieu` là `string[]`, ở đây thành `string` → đổi kiểu dữ liệu mất rồi.
// [NOTE] CÂN NHẮC: bản gốc khởi đầu `dangTai = false, duLieu = null` — tức có một trạng thái
//   "chưa bắt đầu tải" (ví dụ chờ người dùng bấm nút "Tải"). Union của bạn không có trạng thái đó,
//   nên vừa vào đã là "dangTai". Nếu component tự tải ngay khi hiện thì OK; nếu không thì thiếu.
type TrangThaiTai =
| {loai: "dangTai"}
| {loai: "coLoi", thongBaoLoi: string}
| {loai: "thanhCong", duLieu: string}

// --- B ---
export function TaiDuLieu() {
  const [trangThaiTai, setTrangThaiTai] = useState<TrangThaiTai>({loai: "dangTai"});
}

type LienHe = {
    id: number,
    sdt: string
}

// --- C ---
export function DanhBa() {
  const [lienHe, setLienHe] = useState<LienHe[]>([{id: 1, sdt: "1234565692"}]);
  const [dangXem, setDangXem] = useState<number | null>(null);
  const [tuKhoa, setTuKhoa] = useState("");

  // Tính trong lúc render — luôn lấy từ `lienHe` mới nhất nên không bao giờ lệch.
  // Sửa SĐT của liên hệ đang xem → `lienHe` có object mới → lần render sau `find` trả object mới đó.
  // Xóa liên hệ đang xem → `find` trả undefined → `?? null` → tự về "không xem gì".
  const lienHeDangXem = lienHe.find((lh) => lh.id === dangXem) ?? null;

  // Thêm/xóa/sửa liên hệ, hay đổi từ khóa → kết quả tự đúng theo, không cần ai nhớ cập nhật.
  const ketQuaTim = lienHe.filter((lh) => lh.sdt.includes(tuKhoa));
}

// --- D ---
export function HoSo() {
  const [ho, setHo] = useState("Nguyễn");
  const [ten, setTen] = useState("An");

  // Tính trong lúc render — đổi ho hoặc ten thì hai giá trị này tự đúng theo.
  const hoTen = `${ho} ${ten}`;
  // charAt(0) thay vì ho[0]: chuỗi rỗng thì charAt trả "" còn ho[0] trả undefined
  const chuCaiDau = ho.charAt(0) + ten.charAt(0);
}