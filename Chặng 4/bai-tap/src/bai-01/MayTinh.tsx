import styles from "./MayTinh.module.css";

type LoaiNut = "so" | "toan-tu" | "hanh-dong" | "bang";

interface ButtonMayTinh {
  loai: LoaiNut;
  giaTri: string;
  chu: string;
  rong2Cot?: boolean;
}

const ds: ButtonMayTinh[] = [
  { loai: "hanh-dong", giaTri: "xoa", chu: "C" },
  { loai: "hanh-dong", giaTri: "doi-dau", chu: "+/-" },
  { loai: "hanh-dong", giaTri: "phan-tram", chu: "%" },
  { loai: "toan-tu", giaTri: "/", chu: "÷" },

  { loai: "so", giaTri: "7", chu: "7" },
  { loai: "so", giaTri: "8", chu: "8" },
  { loai: "so", giaTri: "9", chu: "9" },
  { loai: "toan-tu", giaTri: "*", chu: "×" },

  { loai: "so", giaTri: "4", chu: "4" },
  { loai: "so", giaTri: "5", chu: "5" },
  { loai: "so", giaTri: "6", chu: "6" },
  { loai: "toan-tu", giaTri: "-", chu: "−" },

  { loai: "so", giaTri: "1", chu: "1" },
  { loai: "so", giaTri: "2", chu: "2" },
  { loai: "so", giaTri: "3", chu: "3" },
  { loai: "toan-tu", giaTri: "+", chu: "+" },

  { loai: "so", giaTri: "0", chu: "0", rong2Cot: true },
  { loai: "hanh-dong", giaTri: "thap-phan", chu: "." },
  { loai: "bang", giaTri: "bang", chu: "=" },
];

// Mỗi loại nút một class màu — nút số dùng màu mặc định của .nut nên để trống
const LOP_MAU: Record<LoaiNut, string | undefined> = {
  so: undefined,
  "toan-tu": styles["nut-toan-tu"],
  "hanh-dong": styles["nut-hanh-dong"],
  bang: styles["nut-bang"],
};

function cx(...lop: (string | false | null | undefined)[]) {
  return lop.filter(Boolean).join(" ");
}

function layLopNut(nut: ButtonMayTinh) {
  return cx(styles.nut, LOP_MAU[nut.loai], nut.rong2Cot && styles["nut-0"]);
}

export function MayTinh() {
  return (
    <div className={styles["may-tinh"]}>
      <div className={styles["man-hinh"]}>0</div>

      <div className={styles["ban-phim"]}>
        {ds.map((nut, index) => (
          // key={index} tạm thời theo đề — file 04 sẽ giải thích vì sao không nên
          <button key={index} className={layLopNut(nut)}>
            {nut.chu}
          </button>
        ))}
      </div>
    </div>
  );
}
