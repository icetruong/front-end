const sanPham = [
  { ma: "SP01", ten: "Bàn phím cơ",   danhMuc: "Phụ kiện", gia: 1500000, soLuong: 12, danhGia: 4.5, conHang: true },
  { ma: "SP02", ten: "Chuột không dây", danhMuc: "Phụ kiện", gia: 350000,  soLuong: 0,  danhGia: 4.0, conHang: false },
  { ma: "SP03", ten: "Màn hình 27 inch", danhMuc: "Màn hình", gia: 5200000, soLuong: 5, danhGia: 4.8, conHang: true },
  { ma: "SP04", ten: "Ổ cứng SSD 1TB", danhMuc: "Lưu trữ",  gia: 2100000, soLuong: 20, danhGia: 4.7, conHang: true },
  { ma: "SP05", ten: "Tai nghe",       danhMuc: "Phụ kiện", gia: 890000,  soLuong: 3,  danhGia: 3.9, conHang: true },
  { ma: "SP06", ten: "Màn hình 32 inch", danhMuc: "Màn hình", gia: 8900000, soLuong: 0, danhGia: 4.9, conHang: false },
  { ma: "SP07", ten: "Ổ cứng HDD 2TB", danhMuc: "Lưu trữ",  gia: 1400000, soLuong: 8,  danhGia: 4.2, conHang: true }
];

// Câu 1 — layTenSanPham: OK
function layTenSanPham(ds)
{
    return ds.map(sp => sp.ten);
}

// Câu 2 — locConHang: OK
function locConHang(ds)
{
    return ds.filter(sp => sp.conHang);
}

// Câu 3 — locTheoKhoangGia: OK
function locTheoKhoangGia(ds, min, max)
{
    return ds.filter(sp => sp.gia >= min && sp.gia <= max);
}

// Câu 4 — sapXepTheoGia: ❌ SAI
// ds.sort() sửa TẠI CHỖ mảng ds (chính là sanPham gốc khi gọi trực tiếp) và
// trả về cùng reference, không phải "mảng mới" như đề yêu cầu.
// Sửa: return [...ds].sort(...)  hoặc  return ds.toSorted(...)
function sapXepTheoGia(ds, tangDan = true)
{
    return [...ds].sort((a, b) => tangDan ? a.gia - b.gia : b.gia - a.gia);
}

// Câu 5 — sapXepTheoTen: ❌ SAI
// 1) Cùng lỗi mutate mảng gốc như câu 4 (ds.sort sửa tại chỗ).
// 2) Thiếu tham số locale "vi" trong localeCompare — đề yêu cầu "đúng tiếng Việt",
//    phải là a.ten.localeCompare(b.ten, "vi") (xem mục 9.3 trong file 04).
// Sửa: return [...ds].sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
function sapXepTheoTen(ds)
{
    return [...ds].sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
}

// Câu 6 — tinhGiaTriKho: OK
function tinhGiaTriKho(ds)
{
    return ds.reduce((tong, sp) => tong + (sp.gia * sp.soLuong), 0);
}

// Câu 7 — demTheoDanhMuc: OK
function demTheoDanhMuc(ds)
{
    return ds.reduce((dem, sp) => {
        if(!dem[sp.danhMuc])
            dem[sp.danhMuc] = 0;
        dem[sp.danhMuc]++;
        return dem;
    }, {});
}

// Câu 8 — nhomTheoDanhMuc: OK
function nhomTheoDanhMuc(ds)
{
    return ds.reduce((nhom, sp) => {
        if (!nhom[sp.danhMuc]) {
            nhom[sp.danhMuc] = [];
        }
        nhom[sp.danhMuc].push(sp);
        return nhom;
    }, {});
}

// Câu 9 — giaTrungBinhMoiDanhMuc: ❌ SAI
// Đề yêu cầu "làm tròn về số nguyên" nhưng code trả thẳng info.tongGia / info.soLuong,
// ra số thập phân (vd 913333.333...) chứ không phải 913333.
// Sửa: trungBinh[danhMuc] = Math.round(info.tongGia / info.soLuong);
function giaTrungBinhMoiDanhMuc(ds)
{
    const tong = ds.reduce((trungBinh, sp) => {
       if(!trungBinh[sp.danhMuc])
       {
            trungBinh[sp.danhMuc] = { tongGia: 0, soLuong: 0 };
       }
       trungBinh[sp.danhMuc].tongGia += sp.gia;
       trungBinh[sp.danhMuc].soLuong++;
       return trungBinh;
    }, {});
    
    const trungBinh = {};
    // Tính giá trung bình cho từng danh mục
    for (const [danhMuc, info] of Object.entries(tong)) {
        trungBinh[danhMuc] = Math.round(info.tongGia / info.soLuong);
    }

    return trungBinh;
}

// Câu 10 — sanPhamDatNhat / sanPhamReNhat: OK
function sanPhamDatNhat(ds)
{
    const max = Math.max(...ds.map(sp => sp.gia));
    return ds.find(sp => sp.gia === max);
}

function sanPhamReNhat(ds)
{
    const min = Math.min(...ds.map(sp => sp.gia));
    return ds.find(sp => sp.gia === min);
}

// Câu 11 — coSanPhamHetHang: OK
function coSanPhamHetHang(ds)
{
    return ds.some(sp => sp.conHang === false);
}

// Câu 12 — tatCaDeuTrenBonSao: OK
function tatCaDeuTrenBonSao(ds)
{
    if(ds.length === 0)
        return false; // Nếu danh sách rỗng, trả về false

    return ds.every(sp => sp.danhGia >= 4);
}

// Câu 13 — timTheoMa: ❌ SAI
// ds.find(...) trả undefined khi không tìm thấy, nhưng đề yêu cầu trả null.
// Sửa: return ds.find(sp => sp.ma === ma) ?? null;
function timTheoMa(ds, ma)
{
    return ds.find(sp => sp.ma === ma) ?? null;
}

// Câu 14 — capNhatSoLuong: OK
function capNhatSoLuong(ds, ma, soLuongMoi)
{
    return ds.map(sp => {
        if(sp.ma === ma)
        {
            return { ...sp, soLuong: soLuongMoi, conHang: soLuongMoi > 0 };
        }
        return sp;
    });
}

// Câu 15 — bangTraCuu: OK
function bangTraCuu(ds)
{
    return ds.reduce((bang, sp) => {
        bang[sp.ma] = sp;
        return bang;
    }, {});
}

// Câu 16 — top3DanhGia: ❌ SAI
// ds.sort() sửa TẠI CHỖ mảng ds (mutate mảng gốc) trước khi slice/map.
// Đúng thì dùng, không cần biến trung gian:
// return ds.toSorted((a, b) => b.danhGia - a.danhGia).slice(0, 3).map(...)
function top3DanhGia(ds)
{
    return [...ds].sort((a, b) => b.danhGia - a.danhGia)
                .slice(0, 3)
                .map(sp => sp.ten + " (" + sp.danhGia + ")");
}

// Câu 17 — bangDoanhThu: ĐÃ SỬA, giờ OK
// (Note cũ của mình ở ý 2 sai — đã đính chính: vì conHang luôn được suy ra từ
// soLuong > 0 trong toàn bài — xem câu 14 capNhatSoLuong — nên sản phẩm hết hàng
// luôn đóng góp 0 vào tổng. Do đó tinhGiaTriKho(ds) (tổng toàn bộ) và tổng chỉ
// tính trên sản phẩm còn hàng LUÔN bằng nhau, không phải trùng hợp. Dùng
// tinhGiaTriKho(ds) ở đây là đúng, không cần lọc lại.)
function bangDoanhThu(ds)
{
    const giaTriKho = tinhGiaTriKho(ds);
    return ds.filter(sp => sp.conHang)
                .map(sp => ({ma: sp.ma, ten: sp.ten, giaTriTon: sp.gia * sp.soLuong, tyLe: ((sp.gia * sp.soLuong / giaTriKho) * 100).toFixed(1) + "%"}))
                .sort((a, b) => b.giaTriTon - a.giaTriTon);
}

// ⚠️ Thiếu: đề bài yêu cầu "cuối bài viết code chứng minh mảng gốc không đổi"
// (vd so sánh JSON.stringify(sanPham) trước/sau khi gọi tất cả hàm trên).
// Hiện file chưa có đoạn kiểm tra này — và nếu thêm vào, các câu 4, 5, 16 sẽ
// LỘ NGAY là sai vì chúng làm sanPham gốc bị sort lại.

// Bài 3 - Câu A: ✅ ĐÚNG (reduce cho đúng kết quả)
// ⚠️ Nhưng đề bảo "chuyển" sang method, tức là THAY THẾ vòng for, không phải
// giữ cả for lẫn reduce rồi gán đè lên `tong`. Vòng for ở trên giờ là code thừa,
// nên xóa đi.
let tong = 0;
for (let i = 0; i < sanPham.length; i++) {
  if (sanPham[i].conHang) {
    tong += sanPham[i].gia;
  }
}

tong = sanPham.reduce((acc, sp) => acc + (sp.conHang ? sp.gia : 0), 0);

// Bài 3 - Câu B: ✅ ĐÚNG
// ⚠️ Cùng vấn đề như câu A: vòng for cũ nên xóa, không cần giữ lại rồi tạo
// biến `ten_new` riêng — chỉ cần gán thẳng vào `ten` (đổi `const ten = []` thành
// `const ten = sanPham.filter(...).map(...)`).
const ten = [];
for (const sp of sanPham) {
  if (sp.danhGia >= 4.5) {
    ten.push(sp.ten.toUpperCase());
  }
}

const ten_new = sanPham.filter(sp => sp.danhGia >= 4.5).map(sp => sp.ten.toUpperCase());

// Bài 3 - Câu C: ✅ ĐÚNG
// `some` dừng sớm giống hệt `break` trong for gốc — đúng cả kết quả lẫn ý nghĩa.
// ⚠️ Vẫn nên xóa vòng for cũ, chỉ giữ dòng `sanPham.some(...)`.
let coHang = false;
for (const sp of sanPham) {
  if (sp.danhMuc === "Màn hình" && sp.conHang) {
    coHang = true;
    break;
  }
}

coHang = sanPham.some(sp => sp.danhMuc === "Màn hình" && sp.conHang);

// Bài 3 - Câu D: ✅ ĐÚNG
// ⚠️ Cùng vấn đề: nên xóa vòng for cũ, gán thẳng vào `theoMa` thay vì tạo
// biến `theoMa_new` riêng.
const theoMa = {};
for (const sp of sanPham) {
  theoMa[sp.ma] = sp.ten;
}

const theoMa_new = sanPham.reduce((acc, sp) => {
  acc[sp.ma] = sp.ten;
  return acc;
}, {});

function myMap(arr, callback)
{
    const newArr = [];
    for(let i = 0; i<arr.length; i++)
    {
        const a = arr[i];
        newArr.push(callback(a, i, arr));
    }
    return newArr;
}

function myFilter(arr, callback)
{
    const newArr = [];
    for(let i = 0; i<arr.length; i++)
    {
        const a = arr[i];
        if(callback(a, i, arr))
            newArr.push(a);
    }
    return newArr;
}

function myFind(arr, callback)
{
    for(let i = 0; i<arr.length; i++)
    {
        const a = arr[i];
        if(callback(a, i, arr))
            return a;
    }
}

function myReduce(arr, callback, accumulator)
{
    if (arr.length === 0) {
        if (accumulator === undefined)
            throw new TypeError("Reduce of empty array with no initial value");
        return accumulator;
    }

    // Phải lưu lại "có initial value hay không" TRƯỚC KHI ghi đè accumulator — vì sau dòng
    // dưới, accumulator luôn có giá trị (không còn undefined nữa), nên nếu kiểm tra sau thì
    // không còn cách nào phân biệt được 2 trường hợp.
    const coInitial = accumulator !== undefined;
    accumulator = coInitial ? accumulator : arr[0];

    // Có initial value → xử lý mọi phần tử, bắt đầu từ i = 0.
    // Không có initial value → arr[0] đã được dùng làm accumulator khởi tạo rồi,
    // nên bỏ qua nó, bắt đầu xử lý tiếp từ i = 1.
    for (let i = coInitial ? 0 : 1; i < arr.length; i++)
    {
        const a = arr[i];
        accumulator = callback(accumulator, a, i, arr);
    }
    return accumulator;
}