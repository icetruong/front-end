import { useState } from "react";

type DanhMuc = "phu-kien" | "man-hinh" | "luu-tru";

type SanPham = {
    id: number,
    ten: string,
    gia: number,
    danhMuc: DanhMuc
}

const SAN_PHAM : SanPham[] = [
  { id: 1, ten: "Bàn phím", gia: 1500000, danhMuc: "phu-kien" },
  { id: 2, ten: "Chuột", gia: 350000, danhMuc: "phu-kien" },
  { id: 3, ten: "Màn hình", gia: 5200000, danhMuc: "man-hinh" },
  { id: 4, ten: "SSD 1TB", gia: 2100000, danhMuc: "luu-tru" },
];

type DauTrangProps = {
    soLuongGio: number
}

function DauTrang({soLuongGio} : DauTrangProps) {
  return <header>Giỏ hàng: {soLuongGio}</header>;
}

type OTimKiemProps = {
    tuKhoa: string,
    onThayDoi: (tu: string) => void
}

function OTimKiem({tuKhoa, onThayDoi} : OTimKiemProps) {
  return <input value={tuKhoa} onChange={(e) => onThayDoi(e.target.value)} />;
}

type BoLocProps = {
    danhMuc: string, 
    onThayDoi: (dm: string) => void
}

function BoLoc({danhMuc, onThayDoi} : BoLocProps) {
  return (
    <select value={danhMuc} onChange={(e) => onThayDoi(e.target.value)}>
      <option value="tat-ca">Tất cả</option>
      <option value="phu-kien">Phụ kiện</option>
      <option value="man-hinh">Màn hình</option>
      <option value="luu-tru">Lưu trữ</option>
    </select>
  );
}

type DanhSachProps = {
    ds: SanPham[],
    onThemGio: (id: number) => void,
}

function DanhSach({ds, onThemGio} : DanhSachProps) {

  return (
    <ul>
      {ds.map((sp) => (
        <li key={sp.id}>
          {sp.ten} — {sp.gia}
          <button onClick={() => onThemGio(sp.id)}>Thêm vào giỏ</button>
        </li>
      ))}
    </ul>
  );
}

type TongGioProps = {
    tong: number
}

function TongGio({tong} : TongGioProps) {
  return <footer>Tổng tiền: {tong}</footer>;
}

export default function App() {
    const [gio, setGio] = useState<number[]>([]);   
    const [dsHienThi, setDsHienThi] = useState(SAN_PHAM);
    
    const [tuKhoa, setTuKhoa] = useState(""); 
    const [danhMuc, setDanhMuc] = useState("tat-ca");

    const tong = dsHienThi.reduce((tong, sp) => tong + sp.gia, 0);

    function themGio(id: number)
    {
        setGio([...gio, id]);
    }

    function thayDoiTu(tu: string)
    {
        setTuKhoa(tu);
        const dsMoi = SAN_PHAM.filter((sp) => sp.ten.includes(tu));
        setDsHienThi(dsMoi);
    }

    function thayDoiDanhMuc(dm: string)
    {
        setDanhMuc(dm);
        if(dm === "tat-ca")
            setDsHienThi(SAN_PHAM);
        else
        {
            const dsMoi = SAN_PHAM.filter((sp) => sp.danhMuc === dm);
            setDsHienThi(dsMoi);
        } 
    }

    return (
        <>
            <DauTrang soLuongGio={gio.length}/>
            <aside>
                <OTimKiem tuKhoa={tuKhoa} onThayDoi={thayDoiTu}/>
                <BoLoc danhMuc={danhMuc} onThayDoi={thayDoiDanhMuc}/>
            </aside>
            <main>
                <DanhSach ds={dsHienThi} onThemGio={themGio}/>
            </main>
            <TongGio tong={tong}/>
        </>
    );
}