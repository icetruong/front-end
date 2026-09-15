function taoBoDem(batDau = 0, buoc = 1)
{
    const lichSu = [batDau];
    let dem = batDau;
    return {
        tang()
        {
            dem += buoc;
            lichSu.push(dem);
            return dem;
        },
        giam()
        {
            dem -= buoc;
            lichSu.push(dem);
            return dem;
        },
        datLai()
        {
            dem = batDau;
            lichSu.push(dem);
            return dem;
        },
        xem()
        {
            return dem;
        },
        lichSu()
        {
            return [...lichSu];
        }
    }
}

// --- Chứng minh: hai bộ đếm tạo ra hoàn toàn độc lập ---
const demA = taoBoDem(0, 1);
const demB = taoBoDem(10, 5);

demA.tang();           // demA: 1
demA.tang();           // demA: 2
demB.tang();           // demB: 15
demB.giam();           // demB: 10

console.log("demA.xem():", demA.xem());   // 2  — không hề bị demB ảnh hưởng
console.log("demB.xem():", demB.xem());   // 10 — không hề bị demA ảnh hưởng

console.log("demA.lichSu():", demA.lichSu());   // [0, 1, 2] — chỉ chứa thao tác của demA
console.log("demB.lichSu():", demB.lichSu());   // [10, 15, 10] — chỉ chứa thao tác của demB

demA.datLai();
console.log("Sau khi datLai demA:", demA.xem(), "| demB vẫn:", demB.xem()); // 0 | 10

// --- Chứng minh: lichSu() trả về BẢN SAO, không phải mảng gốc ---
const banSao = demA.lichSu();
banSao.push(9999);                     // sửa bản sao
console.log("Bản sao sau khi push:", banSao);          // có 9999
console.log("Bên trong demA không đổi:", demA.lichSu()); // không có 9999


function debounce(fn, delay)
{
    let timeoutId;

    return function(...args)
    {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}

// --- Phần B: gắn debounce vào giao diện thật (index.html) ---
const oTim = document.querySelector("#o-tim");
const soLanGoEl = document.querySelector("#so-lan-go");
const soLanApiEl = document.querySelector("#so-lan-api");
const ketQuaEl = document.querySelector("#ket-qua");

let soLanGo = 0;
let soLanApi = 0;

function goiApiGiaLap(tuKhoa)
{
    soLanApi++;
    soLanApiEl.textContent = soLanApi;
    console.log("Gọi API với từ khóa:", tuKhoa);
    ketQuaEl.textContent = `Kết quả cho: "${tuKhoa}"`;
}

// Tạo MỘT lần duy nhất, ở ngoài handler — nếu tạo lại debounce() bên trong "input"
// thì timeoutId luôn là biến mới, clearTimeout không còn tác dụng và debounce hỏng.
const goiApiDebounce = debounce(goiApiGiaLap, 500);

oTim.addEventListener("input", (e) =>
{
    // Tăng ngay lập tức, mỗi lần gõ một phím — KHÔNG debounce chỗ này
    soLanGo++;
    soLanGoEl.textContent = soLanGo;

    // Chỉ hàm gọi API mới bị debounce — chờ ngừng gõ 500ms mới thật sự chạy
    goiApiDebounce(e.target.value);
});


function debounce2(fn, delay, chayNgay = false)
{
    let timeoutId;

    return function(...args)
    {
        // Chưa có timer nào đang chờ (lần gọi đầu tiên, hoặc đã im lặng đủ lâu trước đó)
        const goiNgay = chayNgay && !timeoutId;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            timeoutId = undefined;     // reset để lần "im lặng đủ lâu" tiếp theo lại được coi là lần đầu
            if (!chayNgay) fn(...args);
        }, delay);

        if (goiNgay) fn(...args);
    }
}

function throttle(fn, khoang)
{
    let ok = true;
    return function(...args)
    {
        if(!ok)
            return;
        ok = false;
        fn(...args);
        setTimeout(() => {
            ok = true;
        }, khoang);
    }
}

// --- Phần D: gắn throttle vào mousemove, đối chứng với không throttle ---
const vungChuot = document.querySelector("#vung-chuot");
const demKhongThrottleEl = document.querySelector("#dem-khong-throttle");
const demCoThrottleEl = document.querySelector("#dem-co-throttle");

let demKhongThrottle = 0;
let demCoThrottle = 0;

// KHÔNG throttle — chạy trên MỌI sự kiện mousemove bắn ra (rất nhiều lần/giây)
vungChuot.addEventListener("mousemove", (e) => {
    demKhongThrottle++;
    demKhongThrottleEl.textContent = demKhongThrottle;
    console.log("Không throttle — x:", e.offsetX, "y:", e.offsetY);
});

// CÓ throttle — bọc qua throttle(fn, 200), tối đa in 1 lần mỗi 200ms
const xuLyDiChuotThrottle = throttle((e) => {
    demCoThrottle++;
    demCoThrottleEl.textContent = demCoThrottle;
    console.log("Có throttle — x:", e.offsetX, "y:", e.offsetY);
}, 200);

vungChuot.addEventListener("mousemove", xuLyDiChuotThrottle);

const quanLyTodo = (function(){
    const danhSach = [];
    let id = -1;
    function timTheoId(id)
    {
        return danhSach.find(todo => todo.id === id);
    }

    return {
        them(noiDung)
        {
            const object = {id: ++id,noiDung: noiDung, danhDau: false};
            danhSach.push(object);
            return { ...object };   // trả bản sao — bên ngoài không sửa được object thật trong danhSach
        },
        xong(id)
        {
            const object = timTheoId(id);
            if (object)
                object.danhDau = true;
            return object === undefined ? false : true;
        },
        xoa(id)
        {
            const object = timTheoId(id);
            const index = danhSach.indexOf(object); // Tìm vị trí của phần tử
            if (index !== -1) {
                danhSach.splice(index, 1); // Xóa 1 phần tử tại vị trí đó
            }

            return index === -1 ? false : true;
        },
        danhSach(loc = "tat-ca")
        {
            // .map(todo => ({ ...todo })) — sao chép TỪNG object, không chỉ sao chép mảng chứa nó
            switch (loc) {
                case "chua-xong":
                    return danhSach.filter((todo) => todo.danhDau === false).map(todo => ({ ...todo }));
                case "da-xong":
                    return danhSach.filter((todo) => todo.danhDau === true).map(todo => ({ ...todo }));
                default:
                    return danhSach.map(todo => ({ ...todo }));
            }
        },
        thongKe()
        {
            return [...danhSach].reduce((dem, todo) => {
                const stringDanhDau = todo.danhDau ? "daXong" : "chuaXong";
                if(!dem[stringDanhDau])
                    dem[stringDanhDau] = 0;
                if(!dem["tong"])
                    dem["tong"] = 0;
                 dem[stringDanhDau]++;
                 dem["tong"]++;

                 return dem;
            }, {});
        }
    }
})();

// --- Chứng minh 1: danhSach() không lộ mảng gốc — sửa bản trả về không ảnh hưởng bên trong ---
quanLyTodo.them("Học closure");
quanLyTodo.them("Làm bài tập 05");

const dsLay1 = quanLyTodo.danhSach();
dsLay1.push({ id: 9999, noiDung: "Todo giả mạo", danhDau: false });    // thêm phần tử mới vào bản sao
dsLay1[0].noiDung = "Đã bị sửa từ bên ngoài";                          // sửa NỘI DUNG 1 phần tử có sẵn

console.log("Mảng vừa lấy ra (đã bị sửa):", dsLay1);
console.log("danhSach() gọi lại lần 2 (bên trong không đổi):", quanLyTodo.danhSach());

// --- Chứng minh 2: không có cách nào đặt id tùy ý từ bên ngoài ---
const viec3 = quanLyTodo.them("Việc thứ ba");
console.log("id tự sinh tăng dần qua them():", viec3.id); // 2 — chỗ này đúng, them() không nhận tham số id

viec3.id = 9999;    // thử sửa trực tiếp qua object mà them() vừa trả về — giờ chỉ sửa được bản sao
console.log("danhSach sau khi gán viec3.id = 9999 (bên trong vẫn giữ id thật):", quanLyTodo.danhSach());

// --- Chứng minh 3: quanLyTodo.timTheoId không lộ ra ngoài ---
console.log("quanLyTodo.timTheoId:", quanLyTodo.timTheoId); // undefined — đúng, không lộ



function taoDongHo(idPhanTu) {
  let giay = 0;
  const el = document.getElementById(idPhanTu);

  let idInterval;
  return {
        batDau()
        {
            idInterval = setInterval(function () {
                el.textContent = giay;
                giay++;
            }, 1000);
        },
        dung()
        {
            clearInterval(idInterval);
        }
    };
}