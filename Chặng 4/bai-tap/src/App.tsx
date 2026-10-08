import { useState } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import DoanRender from "./bai-01/DoanRender";

// let dem = 0;

// function Khach() {
//   dem = dem + 1;               // sửa biến bên ngoài trong lúc render
//   return <p>Khách số {dem}</p>;
// }

// // Hai mảng gốc riêng, cùng nội dung — để bản này không làm bẩn dữ liệu của bản kia
// const dsA = [1, 36, 23, 13, 34, 2, 5];
// const dsB = [1, 36, 23, 13, 34, 2, 5];

// // Bản 1: sort() trực tiếp trên mảng được truyền vào → sửa luôn mảng gốc
// function DanhSachDaSapXep({ ds }: { ds: number[] }) {
//   const ketQua = ds.sort((a, b) => a - b);
//   console.log("Bản 1 — dsA gốc sau khi render:", dsA);
//   return <p>Bản 1 (sort trực tiếp): {ketQua.join(", ")}</p>;
// }

// // Bản 2: sao chép trước rồi mới sort → chỉ sửa bản sao của chính mình
// function DanhSachDaSapXep2({ ds }: { ds: number[] }) {
//   const ketQua = [...ds].sort((a, b) => a - b);
//   console.log("Bản 2 — dsB gốc sau khi render:", dsB);
//   return <p>Bản 2 (sao chép rồi sort): {ketQua.join(", ")}</p>;
// }

// function ThoiGianHienTai()
// {
//   return <p> {new Date().toLocaleTimeString()}</p>
// }

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
      <DoanRender />
      {/* <Khach />
      <Khach />
      <Khach />
      <DanhSachDaSapXep ds={dsA} />
      <DanhSachDaSapXep2 ds={dsB} />
      <ThoiGianHienTai /> */}
    </>
  );
}

export default App;
