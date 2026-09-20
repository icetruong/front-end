function ghiLog(dong) {
  document.querySelector("#log").textContent += dong + "\n";
}

document.querySelector("#xoa-log").addEventListener("click", () => {
  document.querySelector("#log").textContent = "";
});

// ===== Phần A + C: bubbling, log cả target và currentTarget =====
document.querySelector("#ngoai").addEventListener("click", (e) => {
  ghiLog(`bubbling ngoai   | target=${e.target.id} currentTarget=${e.currentTarget.id}`);
});

document.querySelector("#giua").addEventListener("click", (e) => {
  ghiLog(`bubbling giua    | target=${e.target.id} currentTarget=${e.currentTarget.id}`);

  // ===== Phần D =====
  e.stopPropagation();
});

document.querySelector("#trong").addEventListener("click", (e) => {
  ghiLog(`bubbling trong   | target=${e.target.id} currentTarget=${e.currentTarget.id}`);
});

// ===== Phần B: capturing — PHẢI truyền { capture: true } =====
document.querySelector("#ngoai").addEventListener("click", (e) => {
  ghiLog(`capturing ngoai  | target=${e.target.id} currentTarget=${e.currentTarget.id}`);
}, { capture: true });

document.querySelector("#giua").addEventListener("click", (e) => {
  ghiLog(`capturing giua   | target=${e.target.id} currentTarget=${e.currentTarget.id}`);
}, { capture: true });

document.querySelector("#trong").addEventListener("click", (e) => {
  ghiLog(`capturing trong  | target=${e.target.id} currentTarget=${e.currentTarget.id}`);
}, { capture: true });

// ===== Phần E: thêm 2 listener bubbling nữa cho #trong =====
document.querySelector("#trong").addEventListener("click", (e) => {
  ghiLog("trong - listener E1 (goi stopImmediatePropagation)");
  e.stopImmediatePropagation();
});

document.querySelector("#trong").addEventListener("click", (e) => {
  ghiLog("trong - listener E2 (KHONG chay vi bi chan o tren)");
});
