import { useState } from "react";
import styles from "./GoiYViec.module.css";


type GoiYViecProps = {
    onChon: (noiDung: string) => void
};

export function GoiYViec({ onChon }: GoiYViecProps)
{
    const [viec, setViec] = useState("");

    function xuLyGui(e: React.FormEvent<HTMLFormElement>)
    {
        e.preventDefault();

        if (!viec.trim()) {
            alert("Vui lòng điền nội dung công việc!"); // (Tùy chọn) Thông báo cho người dùng
            return; 
        }

    // 3. Nếu hợp lệ thì mới gửi đi (có thể gửi chuỗi đã trim sạch sẽ)
        onChon(viec.trim());

        setViec("");
    }
    return (
        <div className={styles["goi-y"]}>
            <form onSubmit={xuLyGui}>
                <input type="text" value={viec} onChange={(e) => setViec(e.target.value)}/>
                <button type="submit">Thêm việc</button>
            </form>
        </div>
    );
}
