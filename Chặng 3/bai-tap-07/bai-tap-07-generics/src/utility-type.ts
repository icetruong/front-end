
type SanPham = {
  readonly id: number;
  ten: string;
  gia: number;
  moTa: string;
  danhMuc: "phu-kien" | "man-hinh" | "luu-tru";
  tonKho: number;
  ngayTao: string;
};

// 1. `TaoSanPham` — dữ liệu gửi lên khi tạo mới: không có `id`, không có `ngayTao`
// 2. `CapNhatSanPham` — dữ liệu gửi lên khi sửa: mọi trường tùy chọn, nhưng không được có `id`
// 3. `TheSanPham` — dữ liệu hiển thị trên thẻ: chỉ `id`, `ten`, `gia`
// 4. `NhanDanhMuc` — object ánh xạ mỗi danh mục sang tên tiếng Việt, **bắt buộc đủ mọi danh mục**
// 5. `ThongKeTheoDanhMuc` — object ánh xạ mỗi danh mục sang số lượng

type TaoSanPham = Omit<SanPham, "id" | "ngayTao">;

type CapNhapSanPham = Partial<Omit<SanPham, "id">>;

type TheSanPham = Pick<SanPham, "id" | "ten" | "gia">;

type NhanDanhMuc = Record<SanPham["danhMuc"], string>;

type ThongKeTheoDanhMuc = Record<SanPham["danhMuc"], number>;