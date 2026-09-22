const cacCot = { stack: [], micro: [], task: [] };

function ve() {
  for (const ten of Object.keys(cacCot)) {
    const ul = document.querySelector(`#cot-${ten}`);
    ul.innerHTML = "";
    cacCot[ten].forEach((nhan) => {
      const li = document.createElement("li");
      li.textContent = nhan;
      ul.appendChild(li);
    });
  }
}

function ghiConsole(dong) {
  document.querySelector("#console-gia").textContent += "\n" + dong;
}

function thucHienBuoc(buoc) {
  switch (buoc.hanhDong) {
    case "push":
      cacCot[buoc.cot].push(buoc.nhan);
      break;
    case "pop":
      cacCot[buoc.cot].pop();
      break;
    case "move": {
      // hàng đợi là FIFO (vào trước ra trước) — shift() lấy phần tử đầu
      const nhan = cacCot[buoc.tu].shift();
      cacCot[buoc.den].push(nhan);
      break;
    }
    case "log":
      ghiConsole(buoc.nhan);
      break;
    default:
      throw new Error(`Không hiểu hành động: ${buoc.hanhDong}`);
  }
  ve();
}

function moPhong(cacBuoc, doTre = 700) {
  cacCot.stack = [];
  cacCot.micro = [];
  cacCot.task = [];
  document.querySelector("#console-gia").textContent = "--- console giả lập ---";
  ve();

  cacBuoc.forEach((buoc, i) => {
    setTimeout(() => thucHienBuoc(buoc), i * doTre);
  });
}

// ===== Ví dụ 1 — khớp đoạn code ở mục 5 file lý thuyết =====
// console.log("A");
// setTimeout(() => console.log("B"), 0);
// Promise.resolve().then(() => console.log("C"));
// console.log("D");
const kichBan1 = [
  { hanhDong: "push", cot: "stack", nhan: "main()" },
  { hanhDong: "log", nhan: "A" },
  { hanhDong: "push", cot: "task", nhan: "setTimeout → B" },
  { hanhDong: "push", cot: "micro", nhan: "then → C" },
  { hanhDong: "log", nhan: "D" },
  { hanhDong: "pop", cot: "stack" },                  // main() chạy xong, stack rỗng
  { hanhDong: "move", tu: "micro", den: "stack" },    // event loop vét microtask trước
  { hanhDong: "log", nhan: "C" },
  { hanhDong: "pop", cot: "stack" },
  { hanhDong: "move", tu: "task", den: "stack" },     // microtask rỗng, lấy 1 macrotask
  { hanhDong: "log", nhan: "B" },
  { hanhDong: "pop", cot: "stack" },
];

// ===== Ví dụ 2 — microtask sinh thêm microtask, vẫn chạy trước macrotask =====
// console.log("bắt đầu");
// setTimeout(() => console.log("macro 1"), 0);
// Promise.resolve().then(() => {
//   console.log("micro 1");
//   Promise.resolve().then(() => console.log("micro 1.1"));
// });
// console.log("kết thúc");
const kichBan2 = [
  { hanhDong: "push", cot: "stack", nhan: "main()" },
  { hanhDong: "log", nhan: "bắt đầu" },
  { hanhDong: "push", cot: "task", nhan: "setTimeout → macro 1" },
  { hanhDong: "push", cot: "micro", nhan: "then → micro 1" },
  { hanhDong: "log", nhan: "kết thúc" },
  { hanhDong: "pop", cot: "stack" },
  { hanhDong: "move", tu: "micro", den: "stack" },
  { hanhDong: "log", nhan: "micro 1" },
  { hanhDong: "push", cot: "micro", nhan: "then → micro 1.1" }, // sinh thêm ngay giữa lúc đang vét
  { hanhDong: "pop", cot: "stack" },
  { hanhDong: "move", tu: "micro", den: "stack" },   // vẫn vét luôn cái vừa sinh ra, chưa đụng tới macrotask
  { hanhDong: "log", nhan: "micro 1.1" },
  { hanhDong: "pop", cot: "stack" },
  { hanhDong: "move", tu: "task", den: "stack" },
  { hanhDong: "log", nhan: "macro 1" },
  { hanhDong: "pop", cot: "stack" },
];

document.querySelector("#chay-vd1").addEventListener("click", () => moPhong(kichBan1));
document.querySelector("#chay-vd2").addEventListener("click", () => moPhong(kichBan2));
