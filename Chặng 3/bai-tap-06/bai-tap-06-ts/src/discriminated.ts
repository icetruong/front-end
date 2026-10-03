type TrangThai =
  | { loai: "chua-bat-dau" }
  | { loai: "dang-tai" }
  | { loai: "loi"; thongBao: string; coThuLai: boolean }
  | { loai: "thanh-cong"; duLieu: string[]; tongSo: number }
  | { loai: "rong" };

type SuKien =
  | { loai: "bat-dau" }
  | { loai: "nhan-du-lieu"; duLieu: string[] }
  | { loai: "gap-loi"; thongBao: string }
  | { loai: "thu-lai" };

function chuyenTrangThai(tt: TrangThai, sk: SuKien): TrangThai {
  switch (sk.loai) {
    case "bat-dau":
      if (tt.loai === "chua-bat-dau") return { loai: "dang-tai" };
      else return tt;
    case "nhan-du-lieu":
      if (tt.loai !== "dang-tai") return tt;
      return sk.duLieu.length === 0
        ? { loai: "rong" }
        : { loai: "thanh-cong", duLieu: sk.duLieu, tongSo: sk.duLieu.length };
    case "gap-loi":
      if (tt.loai === "dang-tai")
        return { loai: "loi", thongBao: sk.thongBao, coThuLai: true };
      else return tt;
    case "thu-lai":
      if (tt.loai === "loi" && tt.coThuLai) return { loai: "dang-tai" };
      else return tt;
    default: {
      const kiemTra: never = sk;
      return kiemTra;
    }
  }
}

function ve(tt: TrangThai): string {
  switch (tt.loai) {
    case "chua-bat-dau":
      return "Chưa bắt đầu";
    case "dang-tai":
      return "Đang tải";
    case "loi":
      return tt.coThuLai
        ? `Lỗi: ${tt.thongBao} (có thể thử lại)`
        : `Lỗi: ${tt.thongBao}`;
    case "thanh-cong":
      return `Thành công ${tt.tongSo} mục`;
    case "rong":
      return "Rỗng";
    default: {
      const kiemTra: never = tt;
      return kiemTra;
    }
  }
}

ve({ loai: "chua-bat-dau" });
chuyenTrangThai({ loai: "chua-bat-dau" }, { loai: "bat-dau" });
