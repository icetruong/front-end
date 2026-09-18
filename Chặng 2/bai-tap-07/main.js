function myNew(Constructor, ...args)
{
    const obj = {};

    Object.setPrototypeOf(obj, Constructor.prototype);

    const kq = Constructor.call(obj, ...args);

    return (kq !== null && typeof kq === "object") ? kq : obj;
}

function NguoiDung(ten) { this.ten = ten; }
NguoiDung.prototype.chao = function () { return `Chào ${this.ten}`; };

const a = myNew(NguoiDung, "An");
a.chao();                          // "Chào An"
a instanceof NguoiDung;            // true
Object.getPrototypeOf(a) === NguoiDung.prototype;   // true

// Constructor trả về object
function A() { this.x = 1; return { y: 2 }; }
myNew(A);                          // { y: 2 }

// Constructor trả về primitive
function B() { this.x = 1; return 42; }
myNew(B);                          // { x: 1 }


// bài 3
function PhuongTien(ten, banhXe)
{
    this.ten = ten;
    this.banhXe = banhXe;
}

PhuongTien.prototype.moTa = function () 
{
    return `${this.ten} có ${this.banhXe} bánh`;
}

function XeMay(ten)
{
    PhuongTien.call(this, ten, 2);
}

XeMay.prototype = Object.create(PhuongTien.prototype);
XeMay.prototype.constructor = XeMay;

XeMay.prototype.noMay = function ()
{
    return ` nổ máy rồi`;
}

function OTo(ten, soCho)
{
    PhuongTien.call(this, ten, 4);
    this.soCho = soCho;
}

OTo.prototype = Object.create(PhuongTien.prototype);
OTo.prototype.constructor = OTo;

OTo.prototype.moTa = function ()
{
     return `${this.ten} có ${this.banhXe} bánh có ${this.soCho} chỗ ngồi`;
}

console.log(new XeMay("Wave") instanceof PhuongTien);
console.log(new OTo("Vios", 5).constructor.name);
console.log(new XeMay("Wave").moTa === new XeMay("Dream").moTa);

class PhuongTien 
{
    constructor(ten, banhXe)
    {
        this.ten = ten;
        this.banhXe = banhXe;
    }

    moTa() 
    {
        return `${this.ten} có ${this.banhXe} bánh`;
    }
}

class XeMay extends PhuongTien
{
    constructor(ten)
    {
        super(ten, 2);
    }

    noMay()
    {
        return ` nổ máy rồi`;
    }
}

class OTo extends PhuongTien
{
    constructor(ten, soCho)
    {
        super(ten, 4);
        this.soCho = soCho;
    }

    moTa()
    {
        return `${this.ten} có ${this.banhXe} bánh có ${this.soCho} chỗ ngồi`;
    }
}

// bai 4

class TaiLieu
{
    #_id;
    static #id_count = 0;
    #daMuon = false;

    // ⚠️ LƯU Ý (không crash, nhưng lệch đề): đề bài ghi "Constructor nhận `{ tieuDe, tacGia, nam }`"
    // — tức là nhận MỘT object rồi destructure ra, ví dụ: `constructor({ tieuDe, tacGia, nam })`.
    // Ở đây bạn viết ba tham số rời `(tieuDe, tacGia, nam)` — gọi kiểu `new Sach("A", "B", 2020, ...)`
    // thay vì `new Sach({ tieuDe: "A", tacGia: "B", nam: 2020, ... })`. Bài vẫn chạy đúng logic,
    // nhưng nếu đề/test chấm gọi theo dạng object thì sẽ vỡ vì tham số đầu tiên sẽ là cả object đó.
    constructor(tieuDe, tacGia, nam)
    {
        this.tieuDe = tieuDe;
        this.tacGia = tacGia;
        this.nam = nam;

        this.#_id = TaiLieu.#id_count++;
    }

    get id()
    {
        return this.#_id;
    }

    get daMuon()
    {
        return this.#daMuon;
    }

    // ❌ SAI: đề bài yêu cầu getter tên là `thongTin` (t thường). Viết hoa `ThongTin`
    // vẫn chạy được (JS không ép tên method), nhưng sai chính tả so với đề, và nếu chỗ khác
    // gọi `taiLieu.thongTin` (đúng đề) thì sẽ ra `undefined` vì thuộc tính đó không tồn tại.
    get thongTin()
    {
        return `${this.tieuDe} với ${this.tacGia} + vào năm: ${this.nam}`;
    }

    muon()
    {
        if(this.#daMuon)
            throw new Error("Tài liệu đã được mượn");
            // ❌ SAI: đề bài yêu cầu NÉM LỖI khi mượn lần 2, không phải return null.
            // return null im lặng nghĩa là code gọi `muon()` không có cách nào phân biệt
            // "mượn thành công, không có ngày hết hạn" với "mượn thất bại vì đã mượn rồi" —
            // cả hai đều trả về giá trị falsy-ish, dễ gây bug im lặng ở chỗ gọi.
            // Cách viết: throw new Error("Tài liệu đã được mượn");

        this.#daMuon = true;
        return this.nam;
        // Lưu ý thêm: đề bài nói trả về "ngày hết hạn", nhưng `this.nam` là NĂM XUẤT BẢN
        // (được truyền từ constructor), không phải ngày hết hạn mượn. Hai khái niệm khác nhau —
        // hiện tại hàm này không có "ngày hết hạn" thật nào được tính (ví dụ: hôm nay + 14 ngày).
    }

    tra()
    {
        if(this.#daMuon)
        {
            this.#daMuon = false;
        } 
    }

    phiTre(soNgayTre)
    {
        return 0;
    }

    static soLuongDaTao()
    {
        return TaiLieu.#id_count;
    }
}

class Sach extends TaiLieu
{
    constructor(tieuDe, tacGia, nam, soTrang, isbn)
    {
        super(tieuDe, tacGia, nam);
        this.soTrang = soTrang;
        this.isbn = isbn;
        Sach.#listIsbn.push({isbn ,sach: this});
    }

    // ❌ SAI (kế thừa lỗi từ lớp cha): vẫn viết hoa `ThongTin` thay vì `thongTin`.
    get thongTin()
    {
        return `${this.tieuDe} với ${this.tacGia} + vào năm: ${this.nam} + số trang : ${this.soTrang}`;
    }

    phiTre(n)
    {
        return n * 5000;
    }

    static #listIsbn = [];

    // ❌ SAI: đề bài muốn `tuISBN` "giả lập tra cứu" và TRẢ VỀ MỘT SACH MỚI — tức là giả lập
    // gọi một API/DB bên ngoài trả về dữ liệu sách theo isbn, rồi `new Sach(...)` từ dữ liệu đó.
    // Cách viết hiện tại không tra cứu gì cả — nó chỉ tìm lại một instance ĐÃ TỪNG được tạo
    // bằng `new Sach(...)` trước đó (nhờ constructor tự push vào `#listIsbn`). Nếu gọi
    // `Sach.tuISBN("một isbn chưa từng new Sach() bao giờ")`, `.find()` trả `undefined`,
    // rồi `.sach` trên `undefined` sẽ ném `TypeError: Cannot read properties of undefined`.
    static tuISBN(isbn)
    {
        return Sach.#listIsbn.find(o => o.isbn === isbn).sach;
    }
}

class DVD extends TaiLieu
{
    constructor(tieuDe, tacGia, nam, thoiLuong, doTuoi)
    {
        super(tieuDe, tacGia, nam);
        this.thoiLuong = thoiLuong;
        this.doTuoi = doTuoi;
    }

    phiTre(n)
    {
        const cost = n * 10000;
        return cost >= 100000 ? 100000 : cost;
    }

    // ❌ SAI (nhiều chỗ):
    // 1. Đề bài yêu cầu `muon()` NHẬN THÊM THAM SỐ `tuoiNguoiMuon` (tuổi của NGƯỜI ĐI MƯỢN),
    //    nhưng hàm này không nhận tham số nào cả.
    // 2. Đang so sánh `this.doTuoi` — đây là ĐỘ TUỔI QUY ĐỊNH của bộ phim (dữ liệu của chính
    //    DVD, set từ constructor), không phải tuổi người mượn. Không có chỗ nào dùng tuổi
    //    người mượn để so sánh cả, nên yêu cầu "chặn theo độ tuổi" chưa được kiểm tra đúng đối tượng.
    // 3. `return null` khi chưa đủ tuổi — phải ném lỗi (throw new Error(...)) như các chỗ khác.
    // 4. Khi tuổi hợp lệ, gọi `super.muon()` nhưng KHÔNG `return` kết quả — nên `DVD.muon()`
    //    luôn trả về `undefined` kể cả khi mượn thành công, mất luôn giá trị "ngày hết hạn"
    //    mà `TaiLieu.muon()` trả về.
    // Cách viết đúng đại khái:
    //   muon(tuoiNguoiMuon) {
    //     if (tuoiNguoiMuon < this.doTuoi) throw new Error("Chưa đủ tuổi để mượn phim này");
    //     return super.muon();
    //   }
    muon(tuoiNguoiMuon) 
    {
        if (tuoiNguoiMuon < this.doTuoi) throw new Error("Chưa đủ tuổi để mượn phim này");
        return super.muon();
    }
}

class TapChi extends TaiLieu
{
    constructor(tieuDe, tacGia, nam, soPhatHanh)
    {
        super(tieuDe, tacGia, nam);
        this.soPhatHanh = soPhatHanh;
    }

    // ❌ SAI: giống các chỗ trên, đề bài yêu cầu NÉM LỖI ("tạp chí chỉ đọc tại chỗ"),
    // không phải return null. Cách viết: throw new Error("Tạp chí không cho mượn, chỉ đọc tại chỗ");
    muon()
    {
        throw new Error("Tạp chí không cho mượn, chỉ đọc tại chỗ");
    }
}

class ThuVien
{
    #mangTaiLieu = [];

    // ❌ SAI: đề bài yêu cầu "chỉ nhận instance của TaiLieu, ngược lại ném lỗi" — hàm này
    // push bất cứ thứ gì được truyền vào, không kiểm tra `instanceof TaiLieu` chút nào.
    // Cách viết: if (!(taiLieu instanceof TaiLieu)) throw new Error("Không phải TaiLieu");
    them(taiLieu)
    {
        if (!(taiLieu instanceof TaiLieu)) 
            throw new Error("Không phải TaiLieu");
        this.#mangTaiLieu.push(taiLieu);
    }

    timTheoId(id)
    {
        return this.#mangTaiLieu.find(o => o.id === id);
    }

    // ❌ SAI: thiếu `return`. `.filter(...)` tạo ra mảng mới nhưng không được trả về, nên
    // gọi `danhSachDangMuon()` ở ngoài luôn nhận `undefined`, bất kể có bao nhiêu tài liệu đang mượn.
    danhSachDangMuon()
    {
        return this.#mangTaiLieu.filter(o => o.daMuon === true);
    }

    // ❌ SAI: điều kiện bị ĐẢO NGƯỢC. Ý định đúng là "nếu CHƯA có key này thì khởi tạo 0"
    // (`if (!loai[name])`), nhưng code viết `if (loai[taiLieu.constructor.name])` (không có
    // dấu `!`) — nghĩa là "nếu ĐÃ có key rồi thì reset về 0". Kết quả thực tế còn tệ hơn thế:
    // với phần tử ĐẦU TIÊN của mỗi loại, `loai[name]` đang là `undefined` (falsy) nên nhánh
    // if bị bỏ qua — không có bước khởi tạo — rồi dòng `loai[name]++` chạy `undefined++`,
    // ra `NaN` (JS không tự hiểu "cộng 1 vào chỗ trống" thành 1). Từ đó về sau, `NaN` cũng
    // falsy nên vẫn luôn bỏ qua khởi tạo, `NaN++` mãi mãi là `NaN`. Tức là kết quả cuối cùng
    // là `{ Sach: NaN, DVD: NaN, TapChi: NaN }` thay vì `{ Sach: 3, DVD: 2, TapChi: 1 }`.
    thongKeTheoLoai()
    {
        return this.#mangTaiLieu.reduce((loai, taiLieu) => {
            if(!loai[taiLieu.constructor.name])
                loai[taiLieu.constructor.name] = 0;
            loai[taiLieu.constructor.name]++;
            return loai;
        }, {});
    }

    // ❌ SAI: đề bài nói "tổng phí trễ nếu MỌI TÀI LIỆU ĐANG MƯỢN đều trễ soNgay ngày" — nghĩa
    // là chỉ cộng phí của những tài liệu có `daMuon === true`. Code hiện tại cộng `phiTre(soNgay)`
    // của TẤT CẢ tài liệu trong thư viện, kể cả những cuốn chưa ai mượn — sai đối tượng tính tổng.
    tongPhiTre(soNgay)
    {
        return this.#mangTaiLieu.reduce((tong, taiLieu) => taiLieu.daMuon ? tong : tong + taiLieu.phiTre(soNgay), 0);
    }
}

// ===== Bài 4 - kiểm thử 7 điểm theo đề =====
// Test viết đúng theo YÊU CẦU CỦA ĐỀ, không phải theo hành vi hiện tại của code.
// Vài test dưới đây sẽ báo FAIL vì đúng những lỗi đã note ở phía trên (❌ SAI) —
// đó là chủ đích: test FAIL = bằng chứng cho thấy chỗ nào code chưa khớp đề.

// 1. #id không truy cập được từ ngoài
try
{
    const s1 = new Sach("Sach test 1", "Tac gia", 2020, 100, "isbn-t1");
    eval('s1.#_id'); // cú pháp truy cập private field từ NGOÀI class phải bị chặn ngay khi parse
    console.log("Test 1 FAIL: đọc được #_id từ ngoài class (không nên như vậy)");
}
catch (e)
{
    console.log("Test 1 PASS: #_id không truy cập được từ ngoài ->", e.constructor.name, "-", e.message);
}

// 2. Mượn hai lần liên tiếp thì ném lỗi
try
{
    const s2 = new Sach("Sach test 2", "Tac gia", 2021, 200, "isbn-t2");
    s2.muon();
    s2.muon();
    console.log("Test 2 FAIL: mượn lần 2 không ném lỗi (xem note ❌ SAI ở TaiLieu.muon)");
}
catch (e)
{
    console.log("Test 2 PASS: mượn lần 2 ném lỗi ->", e.message);
}

// 3. DVD chặn đúng theo độ tuổi
try
{
    const dvd1 = new DVD("Phim 18+", "Đạo diễn A", 2022, 120, 18);
    dvd1.muon(15); // người mượn 15 tuổi, nhỏ hơn độ tuổi quy định 18 -> phải ném lỗi
    console.log("Test 3 FAIL: người 15 tuổi vẫn mượn được phim 18+ (xem note ❌ SAI ở DVD.muon)");
}
catch (e)
{
    console.log("Test 3 PASS: bị chặn do chưa đủ tuổi ->", e.message);
}

// 4. TapChi không mượn được
try
{
    const tc1 = new TapChi("Tạp chí ABC", "NXB", 2024, 5);
    tc1.muon();
    console.log("Test 4 FAIL: TapChi.muon() không ném lỗi (xem note ❌ SAI ở TapChi.muon)");
}
catch (e)
{
    console.log("Test 4 PASS: TapChi chặn mượn ->", e.message);
}

// 5. them() từ chối object không phải TaiLieu
try
{
    const tv1 = new ThuVien();
    tv1.them({ khongPhaiTaiLieu: true });
    console.log("Test 5 FAIL: them() chấp nhận object không phải TaiLieu (xem note ❌ SAI ở ThuVien.them)");
}
catch (e)
{
    console.log("Test 5 PASS: them() từ chối object không phải TaiLieu ->", e.message);
}

// 6. phiTre của DVD bị chặn trần ở 100000
{
    const dvd2 = new DVD("Phim dai", "Đạo diễn B", 2023, 90, 12);
    const phi = dvd2.phiTre(50); // 50 * 10000 = 500000, phải bị chặn về 100000
    console.log(phi === 100000
        ? "Test 6 PASS: phiTre chặn trần đúng 100000"
        : `Test 6 FAIL: phiTre = ${phi}, kỳ vọng 100000`);
}

// 7. Method muon được dùng chung qua prototype, không nhân bản trên từng instance
{
    const s3 = new Sach("Sach test 3", "A", 2020, 1, "isbn-t3");
    const s4 = new Sach("Sach test 4", "B", 2021, 2, "isbn-t4");
    console.log(s3.muon === s4.muon
        ? "Test 7 PASS: muon dùng chung qua prototype"
        : "Test 7 FAIL: muon bị nhân bản trên từng instance");
}