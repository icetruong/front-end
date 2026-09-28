// 1. Lưu số `42`, đọc ra và kiểm tra `typeof`
// 2. Lưu object trực tiếp không qua JSON — kết quả là gì?
// 3. Đọc một khóa không tồn tại — trả về gì? So sánh với `undefined`
// 4. Lưu object có `Date`, `undefined`, hàm, `Map`, `NaN`, `Infinity`. Đọc lại và ghi rõ **từng trường** bị biến đổi thế nào
// 5. Ghi `"{abc"` vào một khóa rồi `JSON.parse` — lỗi gì?
// 6. Thử lưu một chuỗi rất lớn (nhân đôi liên tục cho đến khi lỗi). Ghi lại dung lượng tối đa trình duyệt của bạn cho phép
// 7. Mở app ở **hai tab**. Ở tab 1 gọi `setItem`. Tab nào nhận được sự kiện `storage`?
// 8. So sánh `localStorage` và `sessionStorage`: lưu ở cả hai, đóng tab, mở lại — cái nào còn?
// 9. Mở chế độ ẩn danh và chạy lại câu 1. Có gì khác không?
//  Mở DevTools → Application → Local Storage để quan sát trực tiếp.

localStorage.setItem("so", 42);

const so = localStorage.getItem("so");
console.log(typeof so);

const obj = {id: 1};
localStorage.setItem("obj", obj);

const notFound = localStorage.getItem("khong-co");
console.log(notFound);
console.log(notFound === undefined);

const goc = {
  ngay: new Date(),
  khongXacDinh: undefined,
  ham: () => {},
  map: new Map([["a", 1]]),
  set: new Set([1, 2]),
  voCuc: Infinity,
  nan: NaN
};

localStorage.setItem("goc", JSON.stringify(goc));

const laySauLuu = localStorage.getItem("goc");
console.log(JSON.parse(laySauLuu));

const abc = "{abc";
localStorage.setItem("abc", abc);
const layABC = localStorage.getItem("abc");
console.log(JSON.parse(layABC));
