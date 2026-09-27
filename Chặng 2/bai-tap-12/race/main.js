// ===== 1. Hàm giả lập tìm kiếm =====

const DO_TRE_MIN = 200;
const DO_TRE_MAX = 2000;

const DU_LIEU = [
    'apple', 'apricot', 'avocado', 'banana', 'blackberry', 'blueberry',
    'cherry', 'coconut', 'cranberry', 'date', 'dragonfruit', 'durian',
    'grape', 'grapefruit', 'guava', 'kiwi', 'lemon', 'lime', 'lychee',
    'mango', 'melon', 'orange', 'papaya', 'peach', 'pear', 'pineapple',
    'plum', 'pomegranate', 'raspberry', 'strawberry', 'watermelon',
];

function doTreNgauNhien() {
    return DO_TRE_MIN + Math.floor(Math.random() * (DO_TRE_MAX - DO_TRE_MIN + 1));
}

function timKiemGiaLap(tuKhoa, signal) {
    return new Promise((resolve, reject) => {
        if(signal?.aborted)
        {
            reject(new DOMException('Đã hủy', 'AbortError'));
            return;
        }

        const doTre = doTreNgauNhien();

        const timer = setTimeout(() => {
            const tuKhoaThuong = tuKhoa.toLowerCase();
            const ketQua = DU_LIEU.filter(ten => ten.includes(tuKhoaThuong));
            resolve({ tuKhoa, ketQua, doTre });
        }, doTre);

        signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException('Đã hủy', 'AbortError'));
        }, {once: true});
    });
}

function debounce(fn, delay)
{
    let timer;

    return function(...args)
    {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}

const oTim = document.querySelector("#o-tim");
const tuKhoaEl = document.querySelector("#tu-khoa");
const ketQuaChoEl = document.querySelector("#ket-qua-cho");
const dsEl = document.querySelector("#ds");

function hienThi({ tuKhoa, ketQua })
{
    ketQuaChoEl.textContent = tuKhoa;
    dsEl.innerHTML = "";
    ketQua.forEach(ten => {
        const li = document.createElement("li");
        li.textContent = ten;
        dsEl.appendChild(li);
    });
}

let ac;

async function timVaHienThi(tuKhoa)
{
    ac?.abort();
    ac = new AbortController();

    try {
        const kq = await timKiemGiaLap(tuKhoa, ac.signal);
        hienThi(kq);
    } catch (err) {
        if (err.name === "AbortError") return; // bị hủy do có request mới → bỏ qua
        console.error(err);
    }
}

const tim = debounce(timVaHienThi, 400);

oTim.addEventListener("input", (e) => {
    tuKhoaEl.textContent = e.target.value; // cập nhật ngay, không chờ debounce
    tim(e.target.value);
});
