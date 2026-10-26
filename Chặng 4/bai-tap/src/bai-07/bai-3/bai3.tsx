import { useState } from "react";

type DanhMuc = "phu-kien" | "man-hinh" | "luu-tru";

type SanPham = {
    id: number,
    ten: string,
    gia: number,
    danhMuc: DanhMuc
}

type ItemGio = {
    id: number,
    soLuong: number
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

function laySanPhamId()
{
    const spId = new Map<number, SanPham>();
    SAN_PHAM.forEach((sp) => spId.set(sp.id, sp));

    return spId;
}



const sanPhamId = laySanPhamId();

type GioHangProps = {
    gio: ItemGio[],
    onCong: (id: number) => void,
    onTru: (id: number) => void,
    onXoa: (id: number) => void
}

function GioHang({gio, onCong, onTru, onXoa} : GioHangProps) {
  if(gio.length === 0)
    return <section><h2>Giỏ hàng</h2><p>Giỏ hàng trống</p></section>;

  return (
    <section>
      <h2>Giỏ hàng</h2>
      <ul>
        {gio.map((item) => {
          const sanPham = sanPhamId.get(item.id);
          if(!sanPham)
            return null;
          return (
            <li key={item.id}>
              {sanPham.ten} — {sanPham.gia} x {item.soLuong} = {sanPham.gia * item.soLuong}
              <button onClick={() => onCong(item.id)}>+</button>
              <button onClick={() => onTru(item.id)}>-</button>
              <button onClick={() => onXoa(item.id)}>Xóa</button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function App() {
    const [gio, setGio] = useState<ItemGio[]>([]);   
    
    const [tuKhoa, setTuKhoa] = useState(""); 
    const [danhMuc, setDanhMuc] = useState("tat-ca");

    const dsHienThi = layDanhSachHienThi();

    function layDanhSachHienThi()
    {
        let dsMoi = SAN_PHAM.filter((sp) => sp.ten.includes(tuKhoa));
        if(danhMuc !== "tat-ca")
        {
          dsMoi = dsMoi.filter((sp) => sp.danhMuc === danhMuc);
        }
        return dsMoi;
    }

    const tong = gio.reduce((tong, item) => {
        const sanPham = sanPhamId.get(item.id);
        if(!sanPham)
          return tong;
        return tong + sanPham.gia * item.soLuong;
    }, 0);

    const tongSoLuong = gio.reduce((acc, item) => acc + item.soLuong, 0);

    function themGio(id: number)
    {
      setGio(d => {
          const itemGio = d.find((item) => item.id === id);
          if(itemGio)
            return d.map((item) => item.id === itemGio.id ? {...itemGio, soLuong: itemGio.soLuong+1} : item);
          else
            return [...d, {id: id, soLuong: 1}];
      });
    }

    function congItemGio(id: number)
    {
      setGio(d => d.map((item) => item.id === id ? {...item, soLuong: item.soLuong + 1} : item));
    }

    function truItemGio(id: number)
    {
      setGio(d => d.filter((item) => {
        if(item.id !== id)
          return true;

        if(item.soLuong === 1)
          return false;

        return true;
      }).map((item) => item.id === id ? {...item, soLuong: item.soLuong - 1} : item)
      )
    }

    function xoaItemGio(id: number)
    {
      setGio(d => d.filter((item) => item.id !== id));
    }

    function thayDoiDanhMuc(dm: string)
    {
      setDanhMuc(dm);
    }

    function thayDoiTuKhoa(tu: string)
    {
      setTuKhoa(tu);
    }

    return (
        <>
            <DauTrang soLuongGio={tongSoLuong}/>
            <aside>
                <OTimKiem tuKhoa={tuKhoa} onThayDoi={thayDoiTuKhoa}/>
                <BoLoc danhMuc={danhMuc} onThayDoi={thayDoiDanhMuc}/>
            </aside>
            <main>
                <DanhSach ds={dsHienThi} onThemGio={themGio}/>
            </main>
            <GioHang gio={gio} onCong={congItemGio} onTru={truItemGio} onXoa={xoaItemGio}/>
            <TongGio tong={tong}/>
        </>
    );
}