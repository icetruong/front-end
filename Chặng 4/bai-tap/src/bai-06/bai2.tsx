import { useEffect, useState } from "react";

export function GioHang({ ds }: { ds: { gia: number; sl: number }[] }) {
  const tong = ds.reduce((t, sp) => t + sp.gia * sp.sl, 0);
  return <p>Tổng: {tong}</p>;
}

// --- 2 ---
export function DongHoBam() {
  const [giay, setGiay] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setGiay((d) => d + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);
  return <p>{giay}s</p>;
}

// --- 3 ---
export function HoSoNguoiDung({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [nhap, setNhap] = useState("");

  useEffect( () => {
    const ac = new AbortController();
        async function tai() {
            try
            {
                const res = await fetch(`/api/users/${userId}`, {signal: ac.signal});
                setUser(await res.json());
            }
            catch(err)
            {
                if (err instanceof DOMException && err.name === "AbortError") return;
                throw err;
            }          
        }
        tai();

        return () => ac.abort();
        // [NOTE] ❌ Thiếu dòng quan trọng nhất: return () => ac.abort();
        //   Tạo AbortController mà không bao giờ gọi abort() thì nó không làm gì cả → race condition VẪN còn.
        //   Phải trả về hàm dọn để khi userId đổi, React gọi abort() cho request CŨ.
    }, [userId]);
  // [NOTE] ⚠️ Effect setNhap("") đã bỏ là đúng, nhưng thiếu nửa còn lại: cha phải render
  //   <HoSoNguoiDung key={userId} userId={userId} /> thì ô nhập mới được đặt lại khi đổi người (mục 9.2).
  // [NOTE] ⚠️ Kiểu `User` chưa được khai báo → TS báo lỗi. Thêm ví dụ: type User = { id: number; ten: string };
  // [NOTE] (phụ) Nên kiểm tra res.ok trước res.json() — 404/500 không làm fetch ném lỗi (mục 7).

  return <input value={nhap} onChange={(e) => setNhap(e.target.value)} />;
}

// --- 4 ---
export function FormDatHang() {
  const [duLieu, setDuLieu] = useState({ ten: "", sdt: "" });


  // [NOTE] ✅ Đúng: chuyển vào hàm xử lý sự kiện → hết cả 2 lỗi (gửi lại khi sửa tên, StrictMode).
  //   Tên hàm "suLySua" dễ hiểu nhầm là "sửa" — nên đặt xuLyGui / xuLyDatHang.
  //   (phụ) alert chạy ngay, chưa biết server có nhận không. Muốn đúng nghĩa "thành công" thì
  //   await fetch rồi kiểm tra res.ok mới alert.
  function suLySua()
  {
    fetch("/api/don-hang", { method: "POST", body: JSON.stringify(duLieu) });
    alert("Đặt hàng thành công!");
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); suLySua() }}>
      {/* ... */}
    </form>
  );
}

// --- 5 ---
export function KichThuocCuaSo() {
  const [rong, setRong] = useState(window.innerWidth);
  useEffect(() => {
    // Đặt tên cho hàm để lúc gỡ đưa ĐÚNG tham chiếu này vào removeEventListener
    function xuLyResize() {
      setRong(window.innerWidth);
    }

    window.addEventListener("resize", xuLyResize);
    return () => window.removeEventListener("resize", xuLyResize);
  }, []);
  return <p>Rộng: {rong}px</p>;
}