// A -> bug
const dongHo = {
  giay: 0,
  batDau() {
    setInterval(function () {
      this.giay++;
      console.log(this.giay);
    }, 1000);
  }
};
dongHo.batDau();

// -> sửa 
// A.1
const dongHo1 = {
  giay: 0,
  batDau() {
    setInterval(() => {
      this.giay++;
      console.log(this.giay);
    }, 1000);
  }
};

// A.2
const dongHo2 = {
  giay: 0,
  batDau() {
    setInterval(function () {
      this.giay++;
      console.log(this.giay);
    }.bind(this), 1000);
  }
};
// ✅ ĐÃ SỬA ĐÚNG: giờ A.2 dùng bind — cơ chế khác hẳn A.1 (arrow lexical this) rồi.
// function thường bind cứng this = dongHo2 trước khi đưa vào setInterval, đúng cách 2
// trong mục 3.2. Hai cách A.1/A.2 giờ là "hai cách khác nhau" thật.

// --- B ---
const nguoiDung = {
  ten: "An",
  banBe: ["Bình", "Cường"],
  inDanhSach() {
    this.banBe.forEach(function (b) {
      console.log(`${this.ten} là bạn của ${b}`);
    });
  }
};
nguoiDung.inDanhSach();

// -> sửa
// B.1
const nguoiDung1 = {
  ten: "An",
  banBe: ["Bình", "Cường"],
  inDanhSach() {
    this.banBe.forEach( (b) => {
      console.log(`${this.ten} là bạn của ${b}`);
    });
  }
};

// B.2
const nguoiDung2 = {
  ten: "An",
  banBe: ["Bình", "Cường"],
  inDanhSach() {
    const self = this;
    this.banBe.forEach(function (b) {
      console.log(`${self.ten} là bạn của ${b}`);
    });
  }
};

// --- C ---
class NutBam {
  constructor(el) {
    this.el = el;
    this.soLan = 0;
    this.el.addEventListener("click", this.xuLy);
  }
  xuLy() {
    this.soLan++;
    console.log(this.soLan);
  }
}

// sửa
// C.1:
class NutBam1 {
  constructor(el) {
    this.el = el;
    this.soLan = 0;
    this.xuLy = this.xuLy.bind(this);
    this.el.addEventListener("click", this.xuLy);
  }
  xuLy() {
    this.soLan++;
    console.log(this.soLan);
  }
}

// C.2: 
class NutBam2 {
  constructor(el) {
    this.el = el;
    this.soLan = 0;
    this.el.addEventListener("click", this.xuLy);
  }
  xuLy = () => {
    this.soLan++;
    console.log(this.soLan);
  }
}

// ✅ ĐÃ SỬA ĐÚNG — cả C.1 và C.2:
// C.1: bind đúng thứ tự — this.xuLy = this.xuLy.bind(this) chạy TRƯỚC addEventListener,
//      nên addEventListener nhận đúng hàm đã bind (nhớ lưu lại this.xuLy để còn removeEventListener
//      được ở bài 4, đừng bind trực tiếp trong lúc gọi addEventListener).
// C.2: class field arrow — xuLy = () => {...} chạy lúc constructor dựng instance
//      (this = instance mới do quy tắc 1 new binding), arrow chụp luôn this đó.

// --- D --- -> đúng không sửa
const api = {
  url: "https://example.com",
  layDuLieu() {
    const goi = () => {
      console.log(this.url);
    };
    return goi;
  }
};
const f = api.layDuLieu();
f();


function myCall(fn, thisArg, ...args)
{
    const key = Symbol();
    thisArg[key] = fn;
    const result = thisArg[key](...args);
    delete thisArg[key];
    return result;
}

function myApply(fn, thisArg, argsArr)
{
    const key = Symbol();
    thisArg[key] = fn;
    const result = thisArg[key](...argsArr);
    delete thisArg[key];
    return result;
}
// ✅ ĐÚNG — giống myCall, chỉ khác chỗ nhận đối số dạng mảng (argsArr) rồi spread ra.

function myBind(fn, thisArg, ...args)
{
    return (...newArgs) => {
        const key = Symbol();
        thisArg[key] = fn;
        const result = thisArg[key](...args, ... newArgs);
        delete thisArg[key];
        return result;
    }
}
// ✅ ĐÃ SỬA ĐÚNG — myBind giờ chạy đúng cả 3 yêu cầu: partial application (args + newArgs
// nối lại), dọn key mỗi lần gọi (không rò rỉ property), và .call không đổi được this (nhờ
// arrow). Bài 3 xong, cả myCall/myApply/myBind đều đúng.
