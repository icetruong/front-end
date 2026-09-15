const duLieuAPI = {
  status: "success",
  data: {
    donHang: [
      {
        id: "DH001",
        khachHang: {
          ten: "Nguyễn Văn An",
          lienHe: { email: "an@example.com", sdt: "0901234567" },
          diaChi: { thanhPho: "HCM", quan: "1" }
        },
        sanPham: [
          { ma: "SP1", ten: "Bàn phím", gia: 500000, soLuong: 2 },
          { ma: "SP2", ten: "Chuột", gia: 200000, soLuong: 1 }
        ],
        trangThai: "đang giao",
        giamGia: 0
      },
      {
        id: "DH002",
        khachHang: {
          ten: "Trần Thị Bình",
          lienHe: { email: "binh@example.com" },
          diaChi: { thanhPho: "Hà Nội" }
        },
        sanPham: [
          { ma: "SP3", ten: "Màn hình", gia: 3000000, soLuong: 1 }
        ],
        trangThai: "hoàn thành",
        giamGia: 10
      },
      {
        id: "DH003",
        khachHang: { ten: "Lê Văn Cường" },
        sanPham: [],
        trangThai: "đã hủy"
      }
    ]
  }
};

const { donHang } = duLieuAPI.data; // 1

// ❌ SAI: donHang ở đây đang được coi là MỘT đơn hàng, nhưng đề bài yêu cầu
// tomTat(donHang) nhận vào cả MẢNG đơn hàng và trả về MẢNG object tóm tắt
// (mỗi đơn hàng 1 object). Gọi tomTat(donHang) với donHang là mảng thật
// (từ dòng 42) sẽ ném lỗi vì sanPham.reduce sẽ chạy trên undefined.
// Cách sửa: giữ nguyên phần logic bên trong cho 1 đơn hàng, nhưng bọc nó
// lại bằng donHang.map(dh => {...}) để trả về mảng.
function tomTat(donHang) // 2
{
    return donHang.map(dh => {

        const {khachHang, sanPham, trangThai, giamGia = 0} = dh;
        
        const tongTien = sanPham.reduce((tong, sp) => tong + sp.gia * sp.soLuong, 0);

        return {
            id: dh.id,
            tenKhach: khachHang.ten,
            email: khachHang.lienHe?.email ?? "Chưa cập nhật",
            sdt: khachHang.lienHe?.sdt ?? "Chưa cập nhật",
            thanhPho: khachHang.diaChi?.thanhPho ?? "Chưa cập nhật",
            soMatHang: sanPham.length,
            tongTien: tongTien - (tongTien * giamGia / 100),
            trangThai: trangThai
        }
    });
}

// ❌ SAI: cùng lỗi như tomTat — donHang đang được xử lý như MỘT đơn hàng,
// trong khi đề bài yêu cầu nhận vào MẢNG đơn hàng và trả về MẢNG MỚI, chỉ
// đơn hàng có id trùng mới đổi trangThai, các đơn hàng khác giữ nguyên.
// Gọi hàm này với donHang là mảng thật sẽ ném lỗi ở dòng [...donHang.sanPham]
// (donHang.sanPham là undefined vì donHang là mảng, không có field sanPham).
// Cách sửa đúng hướng (và gọn hơn nhiều so với việc deep-copy khachHang/
// lienHe/diaChi — những phần không đổi thì không cần trải lại, xem mục 4.3):
//   function capNhatTrangThai(donHang, id, trangThaiMoi) {
//     return donHang.map(dh =>
//       dh.id === id ? { ...dh, trangThai: trangThaiMoi } : dh
//     );
//   }
// Ngoài ra đề bài còn yêu cầu: "Tự viết code chứng minh duLieuAPI không đổi"
// — phần này chưa có trong file, cần thêm console.log so sánh trước/sau.
function capNhatTrangThai(donHang, id, trangThaiMoi) // 3
{
    return donHang.map(dh => {
        return {
            ...dh,
            khachHang: {
                ...dh.khachHang,
                lienHe: {
                    ...dh.khachHang.lienHe
                },
                diaChi: {
                    ...dh.khachHang.diaChi
                }
            },
            sanPham: [...dh.sanPham],
            trangThai: dh.id === id ? trangThaiMoi : dh.trangThai
        }
    });
}

function nhomTheoThanhPho(donHang) // 4
{
    const nhom = {};
    for(const dh of donHang)
    {
        // ❌ SAI: đề bài yêu cầu nhãn mặc định là "Chưa rõ" (xem output mẫu
        // ở đề: "Chưa rõ": ["DH003"]), ở đây đang dùng "Chưa cập nhật".
        const thanhpho = dh.khachHang.diaChi?.thanhPho ?? "Chưa rõ";
        if(!nhom[thanhpho])
        {
            nhom[thanhpho] = [];
        }
        // ❌ SAI: đề bài yêu cầu mảng chứa ID (chuỗi), ví dụ ["DH001"],
        // nhưng ở đây đang push cả object đơn hàng (dh) vào, phải push dh.id.
        nhom[thanhpho].push(dh.id);
    }
    return nhom;
}

// ❌ SAI (2 lỗi):
// 1. donHang lại bị coi là MỘT đơn hàng thay vì cả mảng — cần donHang.map(...)
//    để trả về mảng đơn hàng như đề yêu cầu.
// 2. `...thongtinkhongnhaycam` đang rest ở CẤP NGOÀI CÙNG của đơn hàng, tức là
//    nó loại bỏ luôn CẢ khachHang (mất theo cả `ten`, `diaChi`), chứ không
//    chỉ loại bỏ `lienHe` bên trong khachHang. Kết quả hiện tại: object trả
//    về không còn field `khachHang` nào hết — sai với yêu cầu "loại bỏ hẳn
//    trường lienHe khỏi khachHang" (khachHang.ten, khachHang.diaChi phải
//    còn nguyên).
// Hướng sửa đúng: rest phải áp dụng ở 2 tầng — 1 lần trên khachHang để bỏ
// lienHe, 1 lần map trên mảng đơn hàng:
//   function boThongTinNhayCam(donHang) {
//     return donHang.map(dh => {
//       const { khachHang, ...rest } = dh;
//       const { lienHe, ...khachHangKhongNhayCam } = khachHang;
//       return { ...rest, khachHang: khachHangKhongNhayCam };
//     });
//   }
function boThongTinNhayCam(donHang) // 5
{
    return donHang.map(dh => {
        const { khachHang, ...rest } = dh;
        const { lienHe, ...khachHangKhongNhayCam } = khachHang;
        return { ...rest, khachHang: khachHangKhongNhayCam };
    });
}

const macDinh = {
  theme: "light",
  fontSize: 14,
  thongBao: { email: true, push: false, sms: false },
  ngonNgu: "vi"
};

const nguoiDung = {
  theme: "dark",
  thongBao: { push: true }
};

// ❌ SAI: hàm chưa chạy được khi nguoiDung là undefined (đúng câu hỏi đề bài
// yêu cầu bạn tự thử ở cuối Bài 3). `{ ...macDinh, ...nguoiDung }` thì không
// sao vì spread object của undefined là no-op — nhưng ngay dòng sau đó,
// `nguoiDung.thongBao` truy cập trực tiếp bằng dấu chấm trên undefined sẽ
// ném TypeError: Cannot read properties of undefined (reading 'thongBao').
// Cách sửa: thêm giá trị mặc định ngay trên tham số hàm, giống mẫu ở mục 3.2
// của file lý thuyết (function taoNut({...} = {}) {...}):
//   function gopCauHinh(macDinh, nguoiDung = {}) { ... }
// (thêm mặc định cho nguoiDung là đủ, vì bên trong đã dùng `if (nguoiDung.thongBao)`
// nên không cần thêm ?. nữa).
function gopCauHinh(macDinh, nguoiDung = {})
{

    const cauHinhMoi = { ...macDinh, ...nguoiDung };
    if(nguoiDung?.thongBao)
    {
        cauHinhMoi.thongBao = { ...macDinh.thongBao, ...nguoiDung.thongBao };
    }
    return cauHinhMoi;
}