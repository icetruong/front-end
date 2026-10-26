import { useState } from "react";

type Tab = "ho-so" | "thong-bao" | "giao-dien";

const DS_TAB: { id: Tab, ten: string }[] = [
  { id: "ho-so", ten: "Hồ sơ" },
  { id: "thong-bao", ten: "Thông báo" },
  { id: "giao-dien", ten: "Giao diện" },
];

type TabHoSoProps = {
    hoTen: string,
    moTa: string,
    onDoiHoTen: (noiDung: string) => void,
    onDoiMoTa: (noiDung: string) => void
}

function TabHoSo({hoTen, moTa, onDoiHoTen, onDoiMoTa} : TabHoSoProps) {
  return (
    <section>
      <label>
        Họ tên
        <input value={hoTen} onChange={(e) => onDoiHoTen(e.target.value)} />
      </label>
      <label>
        Mô tả
        <textarea value={moTa} onChange={(e) => onDoiMoTa(e.target.value)} />
      </label>
    </section>
  );
}

type TabThongBaoProps = {
    email: boolean,
    tinNhan: boolean,
    khuyenMai: boolean,
    onDoiEmail: (check: boolean) => void,
    onDoiTinNhan: (check: boolean) => void,
    onDoiKhuyenMai: (check: boolean) => void
}

function TabThongBao({email, tinNhan, khuyenMai, onDoiEmail, onDoiTinNhan, onDoiKhuyenMai} : TabThongBaoProps) {
  return (
    <section>
      <label>
        <input type="checkbox" checked={email} onChange={(e) => onDoiEmail(e.target.checked)} />
        Nhận email
      </label>
      <label>
        <input type="checkbox" checked={tinNhan} onChange={(e) => onDoiTinNhan(e.target.checked)} />
        Nhận tin nhắn
      </label>
      <label>
        <input type="checkbox" checked={khuyenMai} onChange={(e) => onDoiKhuyenMai(e.target.checked)} />
        Nhận khuyến mãi
      </label>
    </section>
  );
}

type CheDo = "sang" | "toi";

type TabGiaoDienProps = {
    cheDo: CheDo,
    coChu: string,
    onDoiCheDo: (cheDo: CheDo) => void,
    onDoicoChu: (noiDung: string) => void
}

function TabGiaoDien({cheDo, coChu, onDoiCheDo, onDoicoChu} : TabGiaoDienProps) {  
  return (
    <section>
      <label>
        <input type="radio" name="che-do" checked={cheDo === "sang"} onChange={() => onDoiCheDo("sang")} />
        Sáng
      </label>
      <label>
        <input type="radio" name="che-do" checked={cheDo === "toi"} onChange={() => onDoiCheDo("toi")} />
        Tối
      </label>
      <label>
        Cỡ chữ
        <select value={coChu} onChange={(e) => onDoicoChu(e.target.value)}>
          <option value="nho">Nhỏ</option>
          <option value="vua">Vừa</option>
          <option value="lon">Lớn</option>
        </select>
      </label>
    </section>
  );
}

const BAN_DAU = {
    hoTen: "",
    moTa: "",
    email: false,
    tinNhan: false,
    khuyenMai: false,
    cheDo: "sang" as CheDo,
    coChu: "vua"
};

export default function TrangCaiDat({onHoanTac} : {onHoanTac: () => void}) {
    const [tabDangMo, setTabDangMo] = useState<Tab>("ho-so");
    const [hoTen, setHoTen] = useState(BAN_DAU.hoTen);
    const [moTa, setMoTa] = useState(BAN_DAU.moTa);
    const [email, setEmail] = useState(BAN_DAU.email);
    const [tinNhan, setTinNhan] = useState(BAN_DAU.tinNhan);
    const [khuyenMai, setKhuyenMai] = useState(BAN_DAU.khuyenMai);
    const [cheDo, setCheDo] = useState<CheDo>(BAN_DAU.cheDo);
    const [coChu, setCoChu] = useState(BAN_DAU.coChu);

    const thayDoi = tinhThayDoi();

    function tinhThayDoi()
    {
        return hoTen !== BAN_DAU.hoTen
            || moTa !== BAN_DAU.moTa
            || email !== BAN_DAU.email
            || tinNhan !== BAN_DAU.tinNhan
            || khuyenMai !== BAN_DAU.khuyenMai
            || cheDo !== BAN_DAU.cheDo
            || coChu !== BAN_DAU.coChu;
    }

    return (
        <>
            <nav>
                {DS_TAB.map((tab) => (
                <button key={tab.id} disabled={tab.id === tabDangMo} onClick={() => setTabDangMo(tab.id)}>
                    {tab.ten}
                </button>
                ))}
            </nav>
            {tabDangMo === "ho-so" && <TabHoSo hoTen={hoTen} moTa={moTa} onDoiHoTen={setHoTen} onDoiMoTa={setMoTa}/>}
            {tabDangMo === "thong-bao" && <TabThongBao email={email} tinNhan={tinNhan} khuyenMai={khuyenMai} onDoiEmail={setEmail} onDoiTinNhan={setTinNhan} onDoiKhuyenMai={setKhuyenMai}/>}
            {tabDangMo === "giao-dien" && <TabGiaoDien cheDo={cheDo} coChu={coChu} onDoiCheDo={setCheDo} onDoicoChu={setCoChu}/>}
            {thayDoi && <button>Lưu tất cả</button>}
            {<button onClick={() => onHoanTac()}>Hoàn tác thay đổi</button>}
        </>
    );
}
