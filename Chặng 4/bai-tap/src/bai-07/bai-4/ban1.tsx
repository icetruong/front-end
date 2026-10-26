import { useState } from "react";

// Bản 1: mỗi tab tự giữ state của chính nó

type Tab = "ho-so" | "thong-bao" | "giao-dien";

const DS_TAB: { id: Tab, ten: string }[] = [
  { id: "ho-so", ten: "Hồ sơ" },
  { id: "thong-bao", ten: "Thông báo" },
  { id: "giao-dien", ten: "Giao diện" },
];

function TabHoSo() {
  const [hoTen, setHoTen] = useState("");
  const [moTa, setMoTa] = useState("");

  return (
    <section>
      <label>
        Họ tên
        <input value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
      </label>
      <label>
        Mô tả
        <textarea value={moTa} onChange={(e) => setMoTa(e.target.value)} />
      </label>
    </section>
  );
}

function TabThongBao() {
  const [email, setEmail] = useState(false);
  const [tinNhan, setTinNhan] = useState(false);
  const [khuyenMai, setKhuyenMai] = useState(false);

  return (
    <section>
      <label>
        <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
        Nhận email
      </label>
      <label>
        <input type="checkbox" checked={tinNhan} onChange={(e) => setTinNhan(e.target.checked)} />
        Nhận tin nhắn
      </label>
      <label>
        <input type="checkbox" checked={khuyenMai} onChange={(e) => setKhuyenMai(e.target.checked)} />
        Nhận khuyến mãi
      </label>
    </section>
  );
}

type CheDo = "sang" | "toi";

function TabGiaoDien() {
  const [cheDo, setCheDo] = useState<CheDo>("sang");
  const [coChu, setCoChu] = useState("vua");

  return (
    <section>
      <label>
        <input type="radio" name="che-do" checked={cheDo === "sang"} onChange={() => setCheDo("sang")} />
        Sáng
      </label>
      <label>
        <input type="radio" name="che-do" checked={cheDo === "toi"} onChange={() => setCheDo("toi")} />
        Tối
      </label>
      <label>
        Cỡ chữ
        <select value={coChu} onChange={(e) => setCoChu(e.target.value)}>
          <option value="nho">Nhỏ</option>
          <option value="vua">Vừa</option>
          <option value="lon">Lớn</option>
        </select>
      </label>
    </section>
  );
}

export default function TrangCaiDat() {
  const [tabDangMo, setTabDangMo] = useState<Tab>("ho-so");

  return (
    <>
      <nav>
        {DS_TAB.map((tab) => (
          <button key={tab.id} disabled={tab.id === tabDangMo} onClick={() => setTabDangMo(tab.id)}>
            {tab.ten}
          </button>
        ))}
      </nav>
      {tabDangMo === "ho-so" && <TabHoSo />}
      {tabDangMo === "thong-bao" && <TabThongBao />}
      {tabDangMo === "giao-dien" && <TabGiaoDien />}
    </>
  );
}
