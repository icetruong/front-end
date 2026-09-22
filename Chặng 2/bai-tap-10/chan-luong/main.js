
const dem = document.querySelector("#dem");
const so = dem.querySelector("#so");
let count = Number(so.textContent);

dem.addEventListener("click", (e) => {
    so.textContent = ++count;
});

const quay = document.querySelector("#quay");
let goc = 0;

function xoay() {
    goc = (goc + 3) % 360;
    quay.style.transform = `rotate(${goc}deg)`;
    requestAnimationFrame(xoay);
}
requestAnimationFrame(xoay);

function nangDongBo()
{
    const het = Date.now() + 3000;
    while (Date.now() < het) 
    {
        Math.sqrt(Math.random())
    }
}

function nangChiaLo()
{
    const tongThoiGian = 3000;
    const moiLo = 50;
    const batDau = Date.now();
    const tienDo = document.querySelector("#tien-do");

    function chayMotLo()
    {
        const hetLo = Date.now() + moiLo;
        while(Date.now() < hetLo && Date.now() - batDau < tongThoiGian)
        {
            Math.sqrt(Math.random())
        }
        const daTroi = Date.now() - batDau;
        const phanTram = Math.min(100, Math.floor((daTroi / tongThoiGian) * 100));
        tienDo.textContent = `Đang xử lý: ${phanTram}%`;

        if(daTroi < tongThoiGian)
        {
            setTimeout(chayMotLo, 0);
        }
        else 
        {
            tienDo.textContent = "Xong!";
        }
    }

    chayMotLo();
}

document.querySelector("#nang-dong-bo").addEventListener("click", (e) => {
    nangDongBo();
});

document.querySelector("#nang-chia-lo").addEventListener("click", (e) => {
    nangChiaLo();
});




