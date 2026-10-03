type TrangThai = "đang giao" | "hoàn thành" | "đã hủy";
type LienHe = {
  email: string;
  sdt?: string;
};
type DiaChi = {
  thanhPho: string;
  quan?: string;
};
type KhachHang = {
  ten: string;
  lienHe?: LienHe;
  diaChi?: DiaChi;
};
type SanPham = {
  readonly ma: string;
  ten: string;
  gia: number;
  soLuong: number;
};
type DonHang = {
  readonly id: string;
  khachHang: KhachHang;
  sanPham: SanPham[];
  trangThai: TrangThai;
  giamGia?: number;
};
type DuLieu = {
  readonly status: "success" | "error";
  data: {
    donHang: DonHang[];
  };
};

interface DuLieu2 {
  readonly status: "success" | "error";
  data: {
    donHang: {
      readonly id: string;
      khachHang: {
        ten: string;
        lienHe?: {
          email: string;
          sdt?: string;
        };
        diaChi?: {
          thanhPho: string;
          quan?: string;
        };
      };
      sanPham: {
        readonly ma: string;
        ten: string;
        gia: number;
        soLuong: number;
      }[];
      trangThai: TrangThai;
      giamGia?: number;
    }[];
  };
}

const duLieuAPI: DuLieu = {
  status: "success",
  data: {
    donHang: [
      {
        id: "DH001",
        khachHang: {
          ten: "Nguyễn Văn An",
          lienHe: { email: "an@example.com", sdt: "0901234567" },
          diaChi: { thanhPho: "HCM", quan: "1" },
        },
        sanPham: [
          { ma: "SP1", ten: "Bàn phím", gia: 500000, soLuong: 2 },
          { ma: "SP2", ten: "Chuột", gia: 200000, soLuong: 1 },
        ],
        trangThai: "đang giao",
        giamGia: 0,
      },
      {
        id: "DH002",
        khachHang: {
          ten: "Trần Thị Bình",
          lienHe: { email: "binh@example.com" },
          diaChi: { thanhPho: "Hà Nội" },
        },
        sanPham: [{ ma: "SP3", ten: "Màn hình", gia: 3000000, soLuong: 1 }],
        trangThai: "hoàn thành",
        giamGia: 10,
      },
      {
        id: "DH003",
        khachHang: { ten: "Lê Văn Cường" },
        sanPham: [],
        trangThai: "đã hủy",
      },
    ],
  },
};

console.log(duLieuAPI);

interface TomTatDonHang {
  id: string;
  tenKhach: string;
  email: string;
  sdt: string;
  thanhPho: string;
  soMatHang: number;
  tongTien: number;
  trangThai: TrangThai;
}

function tomTat(donHang: DonHang[]): TomTatDonHang[] {
  return donHang.map((dh) => {
    const { khachHang, sanPham, trangThai, giamGia = 0 } = dh;

    const tongTien = sanPham.reduce(
      (tong, sp) => tong + sp.gia * sp.soLuong,
      0,
    );

    return {
      id: dh.id,
      tenKhach: khachHang.ten,
      email: khachHang.lienHe?.email ?? "Chưa cập nhật",
      sdt: khachHang.lienHe?.sdt ?? "Chưa cập nhật",
      thanhPho: khachHang.diaChi?.thanhPho ?? "Chưa cập nhật",
      soMatHang: sanPham.length,
      tongTien: tongTien - (tongTien * giamGia) / 100,
      trangThai: trangThai,
    };
  });
}

console.log(tomTat(duLieuAPI.data.donHang));
