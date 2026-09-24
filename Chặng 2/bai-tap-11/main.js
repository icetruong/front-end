// ============================================================
// BÀI 2 — Viết lại bài 4 của file 10 bằng Promise
// ============================================================

// ------------------------------------------------------------
// Phần A — Chuyển 4 hàm giả lập sang Promise
// ✅ ĐÚNG: giữ độ trễ 300ms, tỷ lệ lỗi 20%, reject bằng new Error(...), data khớp bản callback.
// ------------------------------------------------------------
function layUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.2) {
                reject(new Error("Lỗi lấy user " + id));
            } else {
                resolve({ id, ten: "User " + id });
            }
        }, 300);
    });   
}

function layDonHang(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.2) {
                reject(new Error("Lỗi lấy đơn hàng của user " + userId));
            } else {
                resolve([
                    { id: 1, userId, ten: "Đơn hàng số 1 của user " + userId },
                    { id: 2, userId, ten: "Đơn hàng số 2 của user " + userId },
                ]);
            }
        }, 300);
    }); 
    
}

function layChiTiet(donId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.2) {
                reject(new Error("Lỗi lấy chi tiết đơn " + donId));
            } else {
                resolve({ donId, maSP: 1, ten: "Chi tiết đơn hàng " + donId });
            }
        }, 300);
    }); 
   
}

function laySanPham(maSP) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.2) {
                reject(new Error("Lỗi lấy sản phẩm " + maSP));
            } else {
                resolve({ maSP, ten: "Sản phẩm " + maSP });
            }
        }, 300);
    }); 
}

// ------------------------------------------------------------
// Phần B — Chuỗi 4 tầng bằng .then()
layUser(1)
    .then(v => layDonHang(v.id))
    .then(v => layChiTiet(v[0].id))
    .then(v => laySanPham(v.maSP))
    .then(v => console.log(v))
    .catch(e => console.log(e.message));

// ------------------------------------------------------------
// Phần C — Viết lại bằng async/await + try/catch

(async () => {
    try
    {
        const user = await layUser(1);
        const donHang = await layDonHang(user.id);
        const chiTiet = await layChiTiet(donHang[0].id);
        const sanPham = await laySanPham(chiTiet.maSP);
        console.log(sanPham);
    }
    catch(e)
    {
        console.log(e.message);
    }
})();

// ------------------------------------------------------------
// Phần D — Gọi cho 3 user cùng lúc bằng Promise.all

(async () => {
    try {
        const [a, b, c] = await Promise.all([
            layDonHang(1),
            layDonHang(2),
            layDonHang(3)
        ]);
        console.log("[D] Cả 3 user đã xong:", [a, b, c]);
    } catch (e) {
        console.log("[D]", e.message);
    }
})();

// Phần E1 — Gọi cho 3 user cùng lúc bằng Promise.allSettled
// ✅ ĐÚNG: dùng allSettled, tách fulfilled / rejected bằng filter + map.
// 💡 GÓP Ý (không sai, sửa thì đẹp hơn):
//   - `r.reason` là cả object Error → console in ra nguyên stack trace dài.
//     Chỉ cần nội dung lỗi thì map sang `r.reason.message`.
//   - Nên thêm tiền tố "[E1]" vào log (giống [D]) — đoạn này chạy cùng lúc với B, C, D, E2
//     nên log trộn lẫn, không biết dòng nào của phần nào.
//   - Khi không có lỗi nào, `console.log(...[])` in ra một dòng trống. Có thể in kèm nhãn,
//     ví dụ console.log("[E1] Thành công:", thanhCong) / console.log("[E1] Thất bại:", thatBai).
//   - Chính tả: `thatBat` → `thatBai`.

(async () => {
    const kq = await Promise.allSettled([
        layDonHang(1),
        layDonHang(2),
        layDonHang(3)
    ]);
    const thanhCong = kq.filter(v => v.status === "fulfilled").map(r => r.value);
    const thatBat = kq.filter(v => v.status === "rejected").map(r => r.reason);
    console.log(...thanhCong);
    console.log(...thatBat);
})();

// Phần E2
// ✅ ĐÚNG: mỗi layDonHang "đua" với một Promise tự reject sau 500ms bằng Promise.race.
//    Dùng allSettled bên ngoài thay vì all cũng hợp lý: 1 user quá hạn thì 2 user kia vẫn có kết quả.
// 💡 GÓP Ý (không sai):
//   - Hiện layDonHang chỉ mất 300ms < 500ms nên KHÔNG BAO GIỜ thấy "Quá thời gian" — tức bạn chưa
//     kiểm chứng được timeout có chạy đúng không. Thử tạm đổi 300 → 700 trong layDonHang,
//     chạy xem có ra "Quá thời gian" không, rồi đổi lại.
//   - Lặp 3 lần `Promise.race([layDonHang(x), hetGio(500)])` → có thể viết gọn bằng map:
//     [1, 2, 3].map(id => Promise.race([...]))
//   - Hàm hetGio của bạn chỉ nhận `ms` nên mỗi chỗ dùng phải tự gọi Promise.race.
//     Bài 4 câu 5 sẽ yêu cầu `hetGio(promise, ms)` — tự bọc race bên trong, gọi chỉ cần
//     hetGio(layDonHang(1), 500). Có thể nâng cấp luôn từ bây giờ.
//   - (Nâng cao) setTimeout trong hetGio vẫn chạy tiếp dù layDonHang đã thắng từ lâu.
//     Không gây lỗi ở đây, nhưng biết để sau này dùng clearTimeout dọn dẹp.

function hetGio(ms)
{
    return new Promise((_, reject) => setTimeout(() => reject(new Error("Quá thời gian")), ms));
}

(async () => {
    const kq = await Promise.allSettled([
        Promise.race([layDonHang(1), hetGio(500)]),
        Promise.race([layDonHang(2), hetGio(500)]),
        Promise.race([layDonHang(3), hetGio(500)])
    ]);
    const thanhCong = kq.filter(v => v.status === "fulfilled").map(r => r.value);
    const thatBat = kq.filter(v => v.status === "rejected").map(r => r.reason);
    console.log(...thanhCong);
    console.log(...thatBat);
})();

// Phần E3
// ❌ SAI — hàm thuLai hiện có 5 lỗi, bạn đọc từng cái rồi tự sửa:
//
// ❌ (1) Chạy DƯ 1 lần: `i <= soLan` với i bắt đầu từ 0 → chạy i = 0,1,2,3,4,5 = 6 lần
//        trong khi soLan = 5. Đổi điều kiện để chạy đúng soLan lần.
//
// ❌ (2) Thành công nhưng KHÔNG TRẢ KẾT QUẢ ra ngoài: `const ketQua = await fn(); break;`
//        → ketQua chỉ sống trong khối try, `break` thoát vòng lặp rồi hàm kết thúc
//        mà không return gì → người gọi thuLai(...) luôn nhận undefined, không bao giờ lấy được user.
//        (VS Code cũng báo "'ketQua' is declared but its value is never read".)
//        Gợi ý: thay `break` bằng `return` kết quả — return trong vòng lặp vừa thoát vòng lặp
//        vừa thoát luôn hàm, không cần break.
//
// ❌ (3) Không chờ giữa các lần thử: `khoangCho` chưa được dùng. Trong catch cần "ngủ" khoangCho ms
//        rồi mới sang lần tiếp theo. Gợi ý: trong async function, dùng
//        `await` một Promise tự resolve sau khoangCho ms (setTimeout gọi resolve) — chính là
//        hàm `cho(ms)` ở bài 4. Bonus: lần thử CUỐI mà lỗi thì không cần chờ nữa.
//
// ❌ (4) Thử hết mà vẫn lỗi thì hàm lại THÀNH CÔNG (resolve undefined) thay vì báo lỗi.
//        Vòng lặp chạy hết, ra khỏi for, hàm kết thúc bình thường → Promise của thuLai fulfilled
//        với undefined → người gọi tưởng thành công. Đề (và phần giải thích lần trước) yêu cầu:
//        nếu cả soLan lần đều lỗi thì phải reject với lỗi CUỐI CÙNG.
//        Gợi ý: lưu lỗi vào một biến khai báo NGOÀI vòng for (vd `let loiCuoi`), gán trong catch,
//        và sau vòng for thì `throw loiCuoi`.
//
// ❌ (5) Nuốt lỗi im lặng: catch không làm gì với `e`. Sửa (4) là giải quyết luôn cái này.
//        Có thể thêm console.log(`Lần ${i + 1} lỗi: ${e.message}, thử lại...`) để thấy retry chạy.
//
// ⚠️ THIẾU — đề yêu cầu "đo tỷ lệ thành công qua 50 lần chạy". Dòng `thuLai(() => layUser(1), 5, 100)`
//    bên dưới chỉ gọi 1 lần và không dùng kết quả. Cần viết thêm một đoạn async:
//      - biến đếm thành công = 0
//      - lặp 50 lần: try { await thuLai(() => layUser(1), 3, 100); đếm++ } catch { }
//      - in ra "thành công X/50"
//    Làm y hệt nhưng gọi layUser(1) trần (không bọc thuLai) để so sánh.
//    Kỳ vọng: layUser trần ~40/50 (80%), bọc thuLai 3 lần ~49–50/50 (vì phải lỗi 3 lần liền: 0.2³ = 0.8%).
//    Lưu ý: dùng soLan = 3 cho đúng con số trên (hiện bạn truyền 5). Ghi hai con số vào du-doan.md.
//
// Sau khi sửa, tự kiểm tra: thuLai(() => layUser(1), 3, 100).then(u => console.log(u))
//    phải in ra { id: 1, ten: 'User 1' } (gần như luôn luôn), không được in undefined.
//
// ===== TRẠNG THÁI SAU KHI SỬA =====
// ✅ (1), (2): bạn tự sửa đúng.
// 🔧 (3), (4), (5) + phần THIẾU: đã sửa giúp, đánh dấu [SỬA 3] [SỬA 4] [SỬA 5] [THIẾU] trong code dưới.
//    Lưu ý: (4) bạn báo đã sửa nhưng code chưa có `throw` sau vòng for — hàm vẫn resolve undefined
//    khi thử hết mà vẫn lỗi. Đã bổ sung.

// [SỬA 3] Hàm "ngủ" ms mili-giây: Promise tự resolve sau ms, không bao giờ reject.
//   `await cho(100)` = dừng hàm async 100ms rồi chạy tiếp (không chặn luồng chính).
function cho(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function thuLai(fn, soLan, khoangCho)
{
    let loiCuoi; // [SỬA 4] khai báo NGOÀI vòng for để sau vòng lặp vẫn dùng được

    for(let i = 0; i< soLan; i++)
    {
        try
        {
            const ketQua = await fn();
            return ketQua;
        }
        catch (e)
        {
            loiCuoi = e; // [SỬA 4 + 5] không nuốt lỗi nữa — giữ lại để ném ra nếu hết lượt

            const laLanCuoi = i === soLan - 1;
            if(!laLanCuoi)
            {
                // [SỬA 3] chờ khoangCho ms rồi mới thử lần tiếp. Lần cuối thì không cần chờ.
                await cho(khoangCho);
            }
        }
    }

    // [SỬA 4] chạy tới đây nghĩa là cả soLan lần đều lỗi → reject với lỗi cuối cùng
    throw loiCuoi;
}

// [THIẾU] Đo tỷ lệ thành công qua 50 lần chạy.
// Lưu ý: `const user = thuLai(...)` bản cũ của bạn KHÔNG lấy được user — thuLai là async nên
// trả về Promise, phải `await` (hoặc .then) mới lấy được giá trị bên trong.
const SO_LAN_DO = 50;

async function demThanhCong(goiMotLan)
{
    let soLanThanhCong = 0;
    for(let i = 0; i < SO_LAN_DO; i++)
    {
        try
        {
            await goiMotLan();
            soLanThanhCong++;
        }
        catch (e)
        {
            // lỗi thì không đếm — đây là chủ đích, không phải nuốt lỗi
        }
    }
    return soLanThanhCong;
}

(async () => {
    // Chạy tuần tự từng lần (await trong for) để các lần đo không chen nhau.
    // Mất khá lâu: trần ~50 × 300ms = 15s, bọc thuLai lâu hơn chút vì có lần thử lại.
    const tran = await demThanhCong(() => layUser(1));
    console.log(`[E3] layUser trần:      ${tran}/${SO_LAN_DO} (${tran / SO_LAN_DO * 100}%)`);

    const coThuLai = await demThanhCong(() => thuLai(() => layUser(1), 3, 100));
    console.log(`[E3] bọc thuLai 3 lần: ${coThuLai}/${SO_LAN_DO} (${coThuLai / SO_LAN_DO * 100}%)`);
})();

// ============================================================
// BÀI 3 — Song song vs tuần tự
// ⚠️ Chạy cả file thì log bài 2 (B, C, D, E...) trộn lẫn với log [B3]. Muốn xem riêng bài 3 thì
//    comment tạm các IIFE của bài 2 lại. Số liệu đo vẫn đúng dù chạy chung, vì các tác vụ chỉ là
//    setTimeout — không chiếm CPU nên không làm chậm nhau.
// ============================================================

function tacVu(ten, ms = 1000)
{
    return new Promise((resolve) => setTimeout(() => resolve(ten), ms));
}

async function tuanTu() 
{
    const s1 = await tacVu("tác vụ 1");
    const s2 = await tacVu("tác vụ 2");
    const s3 = await tacVu("tác vụ 3");
}

async function songSongAll()
{
    const [s1, s2, s3] = await Promise.all([
        tacVu("tác vụ 1"),
        tacVu("tác vụ 2"),
        tacVu("tác vụ 3")
    ]);
}

async function songSongTay() 
{
    const s1 = tacVu("tác vụ 1");
    const s2 = tacVu("tác vụ 2");
    const s3 = tacVu("tác vụ 3");

    const kq1 = await s1;
    const kq2 = await s2;
    const kq3 = await s3;
}

// 💡 GÓP Ý: bản cũ của bạn giống hệt tuanTu — s2 không dùng s1, s3 không dùng s2, nên thực ra
//    vẫn có thể chạy song song. "Phụ thuộc" nghĩa là tác vụ sau CẦN KẾT QUẢ của tác vụ trước làm
//    đầu vào (như layDonHang(user.id) cần user). Đã sửa: truyền kết quả bước trước vào bước sau.
//    Khi đó không cách nào song song được → ~3000ms là bắt buộc, không phải do viết chậm.
async function phuThuoc()
{
    const s1 = await tacVu("tác vụ 1");
    const s2 = await tacVu(s1 + " → tác vụ 2");
    const s3 = await tacVu(s2 + " → tác vụ 3");
    return s3;
}

// ------------------------------------------------------------
// Bài 3 — Đo thời gian
// performance.now() trả về số ms (có phần thập phân) tính từ lúc chương trình chạy.
// Lấy mốc trước và sau khi `await fn()` xong → hiệu hai mốc là thời gian chạy.
// Phải `await` — nếu không, fn() chỉ trả về Promise ngay lập tức và bạn đo được ~0ms.

async function doThoiGian(ten, fn)
{
    const batDau = performance.now();
    await fn();
    const thoiGian = performance.now() - batDau;
    console.log(`[B3] ${ten.padEnd(22)} ${thoiGian.toFixed(0)}ms`);
    return thoiGian;
}

// ------------------------------------------------------------
// Bài 3 (làm thêm) — 20 tác vụ, mỗi cái 200ms

const SO_TAC_VU = 20;
const THOI_GIAN_MOI_TAC_VU = 200;
const KICH_THUOC_LO = 5;
const DANH_SACH_TAC_VU = Array.from({ length: SO_TAC_VU }, (_, i) => `tác vụ ${i + 1}`);

// Tuần tự: chờ xong cái này mới bắt đầu cái sau → 20 × 200 = ~4000ms
async function tuanTu20(danhSach)
{
    const ketQua = [];
    for (const ten of danhSach)
    {
        ketQua.push(await tacVu(ten, THOI_GIAN_MOI_TAC_VU));
    }
    return ketQua;
}

// Song song hết: khởi động cả 20 cùng lúc → ~200ms
async function songSongHet20(danhSach)
{
    return await Promise.all(danhSach.map(ten => tacVu(ten, THOI_GIAN_MOI_TAC_VU)));
}

// Chia lô: mỗi lô 5 cái chạy song song, xong cả lô mới sang lô sau → 4 lô × 200 = ~800ms
async function chiaLo20(danhSach, kichThuocLo)
{
    const ketQua = [];
    for (let i = 0; i < danhSach.length; i += kichThuocLo)
    {
        const lo = danhSach.slice(i, i + kichThuocLo);
        const ketQuaLo = await Promise.all(lo.map(ten => tacVu(ten, THOI_GIAN_MOI_TAC_VU)));
        ketQua.push(...ketQuaLo);
    }
    return ketQua;
}

// Chạy lần lượt từng phép đo (await từng cái) để các phép đo không chen nhau làm sai số liệu.
(async () => {
    console.log("[B3] --- 3 tác vụ × 1000ms ---");
    await doThoiGian("tuanTu", tuanTu);
    await doThoiGian("songSongAll", songSongAll);
    await doThoiGian("songSongTay", songSongTay);
    await doThoiGian("phuThuoc", phuThuoc);

    console.log(`[B3] --- ${SO_TAC_VU} tác vụ × ${THOI_GIAN_MOI_TAC_VU}ms ---`);
    await doThoiGian("tuần tự", () => tuanTu20(DANH_SACH_TAC_VU));
    await doThoiGian("song song hết", () => songSongHet20(DANH_SACH_TAC_VU));
    await doThoiGian(`chia lô ${KICH_THUOC_LO}`, () => chiaLo20(DANH_SACH_TAC_VU, KICH_THUOC_LO));
})();

// NHẬN XÉT — khi nào chia lô đáng dùng hơn song song hết?
// Trong bài này song song hết luôn nhanh nhất (~200ms) vì tacVu chỉ là setTimeout — chờ suông,
// không tốn tài nguyên gì. Ngoài đời mỗi tác vụ thường là một request thật, và khi đó:
//   - Server có giới hạn (rate limit): bắn 1000 request cùng lúc → bị trả lỗi 429 hoặc bị chặn.
//   - Trình duyệt chỉ mở ~6 kết nối cùng lúc tới một domain (HTTP/1.1) — gửi nhiều hơn thì
//     phần dư cũng phải xếp hàng, song song hết không nhanh hơn được bao nhiêu.
//   - Database có số kết nối tối đa (connection pool) — vượt quá thì request lỗi hoặc treo.
//   - Bộ nhớ: 10.000 response về cùng lúc có thể làm tràn RAM.
//   - Một cái lỗi thì Promise.all reject cả mẻ — chia lô thì chỉ mất một lô, dễ thử lại.
// → Danh sách NHỎ (vài chục) và tác vụ nhẹ: song song hết. Danh sách LỚN hoặc tài nguyên
//   có giới hạn: chia lô (đánh đổi thời gian để không làm sập server / bị chặn).
// Điểm yếu của chia lô: lô phải chờ cái CHẬM NHẤT trong lô xong mới sang lô sau → các "chỗ trống"
// bị lãng phí. Bài 4 câu 7 (gioiHanSongSong) khắc phục đúng điểm này: xong cái nào lấy cái tiếp.


// Bài 4:
// ------------------------------------------------------------
// Câu 1 — myAll
// (Phần ❌ ngay dưới đây là nhận xét cho bản CŨ — bản mới đã sửa được cả 2 lỗi, giữ lại để tham khảo.
//  Nhận xét cho bản MỚI nằm ngay trên hàm myAll.)
//
// ❌ (1) Kết quả là mảng PROMISE, không phải mảng GIÁ TRỊ.
//        `danhSach.map(async (item) => await item)` — mỗi callback là async function, mà async
//        function LUÔN trả về Promise. Nên map cho ra [Promise, Promise, Promise].
//        `await item` nằm BÊN TRONG từng callback, chỉ làm callback đó chờ — hàm myAll bên ngoài
//        không chờ ai cả, return ngay lập tức.
//        Thử: myAll([1, 2, 3]).then(kq => console.log(kq))
//          → mong đợi [1, 2, 3]
//          → thực tế  [ Promise { 1 }, Promise { 2 }, Promise { 3 } ]
//
// ❌ (2) try/catch không bao giờ bắt được lỗi.
//        try/catch chỉ bắt lỗi từ những thứ bạn `await` NGAY TRONG khối try (hoặc lỗi ném đồng bộ).
//        Trong try không có await nào → không có gì để bắt → catch không bao giờ chạy.
//        Lỗi của từng item nằm trong các Promise con mà map tạo ra, rồi bị bỏ mặc → Node báo
//        "unhandled rejection".
//        Đã chạy thử: myAll([Promise.reject(new Error("hỏng"))]) → vào .then (RESOLVE) với
//        [ Promise { <rejected> Error: hỏng } ] — tức có lỗi mà myAll vẫn báo thành công,
//        ngược hẳn với Promise.all.
//
// ------------------------------------------------------------
// 💬 TRẢ LỜI THẮC MẮC: "làm sao để một cái reject → cả myAll reject ngay?"
//
// Vì sao try/catch + await không làm được?
//   Nếu bạn sửa thành vòng for, `await` từng item một, thì await đúng là bắt được lỗi, nhưng KHÔNG
//   phải "ngay". Ví dụ: danhSach = [cho(3000), promise reject sau 100ms]
//     - Promise.all thật: reject ở giây 0.1
//     - vòng for + await:  đang kẹt chờ item 0 → giây 3 mới tới item 1 → reject ở giây 3
//   await chỉ nghe được MỘT promise mỗi lúc, còn ta cần nghe TẤT CẢ cùng lúc.
//
// Cách làm: tự tạo Promise bằng `new Promise((resolve, reject) => { ... })`.
//   Bạn cầm trong tay hai "nút bấm" resolve và reject của Promise kết quả, rồi gắn .then vào
//   TỪNG item ngay từ đầu (tất cả cùng lúc, không chờ cái nào):
//     - item nào thành công → cất giá trị vào mảng kết quả
//     - item nào lỗi        → bấm reject(lỗi) NGAY — đây chính là chỗ "reject ngay"
//
//   Chuyện "bấm nhiều lần" không cần lo: một Promise chỉ settle ĐÚNG MỘT LẦN. Lần reject/resolve
//   đầu tiên thắng, các lần gọi sau bị bỏ qua. Nên cái lỗi đầu tiên là cái được giữ lại.
//
// Khung để bạn tự điền (bỏ `async` ở trước function — tự trả về new Promise rồi thì không cần):
//
//   function myAll(danhSach) {
//       return new Promise((resolve, reject) => {
//           const ketQua = [];
//           let soDaXong = 0;
//
//           // (a) mảng rỗng → resolve ngay (nếu không, không có item nào để đếm → treo mãi)
//
//           danhSach.forEach((item, i) => {
//               // (b) item có thể KHÔNG phải Promise (vd số 5) → bọc Promise.resolve(item)
//               //     để lúc nào cũng gọi được .then
//               // (c) .then(giaTri => { ... }, loi => { ... })
//               //       thành công: ketQua[i] = giaTri   ← gán theo CHỈ SỐ i, KHÔNG dùng push
//               //                   (push thì cái nào xong trước đứng trước → sai thứ tự)
//               //                   soDaXong++ ; nếu soDaXong === danhSach.length → resolve(ketQua)
//               //       lỗi:        reject(loi)
//           });
//       });
//   }
//
// Chú ý: đếm bằng soDaXong, KHÔNG dùng `ketQua.length === danhSach.length`. Nếu item 2 xong
//   trước, gán ketQua[2] thì length nhảy lên 3 luôn dù item 0, 1 chưa xong → resolve sớm, sai.
//
// Test theo đề (viết xong thì chạy cả 3):
//   myAll([]).then(kq => console.log("[B4] rỗng:", kq))                          // → []
//   myAll([1, tacVu("a", 100), "x"]).then(kq => console.log("[B4] trộn:", kq))  // → [1, "a", "x"]
//   myAll([tacVu("a", 1000), Promise.reject(new Error("hỏng"))])
//       .then(kq => console.log("[B4] ???", kq))
//       .catch(e => console.log("[B4] có reject:", e.message))                   // → "hỏng", in NGAY chứ không đợi 1s
//   Bonus: myAll([tacVu("chậm", 300), tacVu("nhanh", 100)]) phải ra ["chậm", "nhanh"] — đúng thứ tự
//   đưa vào, không phải thứ tự xong.
// ------------------------------------------------------------
// ⚠️ GẦN ĐÚNG — thứ tự (ketqua[i]), cách đếm soDaXong, bọc Promise.resolve, reject ngay đều đúng.
// ❌ Còn thiếu bước (a): mảng rỗng.
//    myAll([]) → forEach không chạy vòng nào → soDaXong không bao giờ === 0 được kiểm tra
//    → không ai gọi resolve → Promise TREO MÃI. Promise.all([]) thật thì resolve ngay với [].
//    Sửa: trước forEach, nếu danhSach.length === 0 thì resolve([]) rồi return.
function myAll(danhSach)
{
    return new Promise((resolve, reject) => {
        const ketqua = [];
        let soDaXong = 0;

        if(danhSach.length === 0)
        {
            resolve([]);
            return;
        }

        danhSach.forEach((item, i) => {
            Promise.resolve(item)
                .then(giaTri => {
                    ketqua[i] = giaTri;
                    soDaXong++;
                    if(soDaXong === danhSach.length)
                        resolve(ketqua);
                })
                .catch(loi => reject(loi));
        });
    });
}

// Câu 2 — myAllSettled (viết lại)
// So với bản cũ, sửa 3 chỗ:
//   (1) Kiểm tra "xong hết chưa" nằm TRONG hàm ghiKetQua, tức là chạy SAU khi từng item settle,
//       chứ không chạy đồng bộ trong forEach (lúc đó soDaXong luôn là 0).
//   (2) Mỗi ô kết quả là object { status, value } / { status, reason }, không phải Promise.
//   (3) Mảng rỗng → resolve([]) ngay.
// Không có tham số reject: allSettled KHÔNG BAO GIỜ reject — lỗi của item chỉ được ghi lại.
// Dùng .then(thanhCong, thatBai) hai tham số thay vì .then().catch(): nhánh thatBai chỉ bắt lỗi
// của CHÍNH item, không bắt nhầm lỗi phát sinh trong nhánh thanhCong.
function myAllSettled(danhSach)
{
    return new Promise((resolve) => {
        if(danhSach.length === 0)
        {
            resolve([]);
            return;
        }

        const ketqua = [];
        let soDaXong = 0;

        function ghiKetQua(i, moTa)
        {
            ketqua[i] = moTa;
            soDaXong++;
            if(soDaXong === danhSach.length)
                resolve(ketqua);
        }

        danhSach.forEach((item, i) => {
            Promise.resolve(item).then(
                giaTri => ghiKetQua(i, { status: "fulfilled", value: giaTri }),
                loi => ghiKetQua(i, { status: "rejected", reason: loi })
            );
        });
    });
}

// Câu 3 — myRace
// ❌ SAI — executor chỉ khai báo `(resolve)`, KHÔNG có `reject`.
//    Khi item đầu tiên settle là một lỗi → `.catch(loi => reject(loi))` chạy → ReferenceError:
//    reject is not defined → lỗi này rơi vào chuỗi .then/.catch con (không ai bắt) → myRace
//    KHÔNG BAO GIỜ reject, cứ treo, còn Node báo unhandled rejection.
//    Thử: myRace([Promise.reject(new Error("x")), cho(1000)]) → Promise.race thật reject "x" ngay.
//    Sửa: thêm `reject` vào tham số executor. (Tham số `i` không dùng thì bỏ đi.)
// ✅ Ý tưởng còn lại đúng: gắn .then cho mọi item, ai settle trước thắng vì Promise chỉ settle 1 lần.
//    Mảng rỗng mà treo mãi thì lại ĐÚNG — Promise.race([]) thật cũng treo mãi.
function myRace(danhSach)
{
    return new Promise((resolve, reject) => {
        danhSach.forEach((item, i) => {
            Promise.resolve(item)
                .then(giaTri => resolve(giaTri))
                .catch(loi => reject(loi));
        });
    });
}

// Câu 4 — cho ✅ ĐÚNG
// (Lưu ý nhỏ: file này đã có một hàm `cho` y hệt ở dòng ~208 (bài 2). Script thường thì khai báo
//  trùng tên vẫn chạy — bản sau đè bản trước — nhưng nếu file là ES module thì sẽ SyntaxError.
//  Nên xoá một bản đi.)
function cho(ms)
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Câu 5 — hetGio ✅ ĐÚNG
// (Nâng cao, không bắt buộc: khi promise xong trước, setTimeout vẫn còn chạy → Node phải đợi đủ ms
//  mới thoát chương trình. Muốn gọn thì giữ id của setTimeout và clearTimeout trong .finally.)
function hetGio(promise, ms)
{
  const thoiGianCho = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Quá hạn thời gian!")), ms)
  );

  return Promise.race([promise, thoiGianCho]);
}

// Câu 6 — thuLai
// ✅ Vòng lặp, try/await, backoff gấp đôi (1000 → 2000), không chờ ở lần cuối: đều đúng.
// ❌ SAI ở dòng cuối: `return loiCuoi`.
//    Trong async function, `return` = RESOLVE (thành công). Nên thử hết 3 lần vẫn lỗi thì thuLai
//    lại báo THÀNH CÔNG với giá trị là cái Error → người gọi `.catch` / try-catch không bao giờ
//    bắt được, còn `.then(kq => ...)` nhận nhầm Error làm kết quả.
//    Sửa: `throw loiCuoi` → async function reject với lỗi đó.
async function thuLai(fn, soLan = 3, khoangCho = 1000)
{
    let khoangChoBackoff = khoangCho;
    let loiCuoi;
    for(let i = 0; i< soLan; i++)
    {
        try
        {
            const ketqua = await fn();
            return ketqua;
        }
        catch (e)
        {
            loiCuoi = e;

            if(i !== soLan - 1)
                await cho(khoangChoBackoff);
            khoangChoBackoff *=2;
        }
    }

    throw loiCuoi;
}

// Câu 7 — gioiHanSongSong
// ✅ Hướng đi đúng: chỉ khởi động n cái đầu, dùng Promise.race để biết cái nào xong, xong thì lấy
//    hàm tiếp theo vào đúng "ô" đó, lưu kết quả theo chiSo để giữ thứ tự, xử lý mảng rỗng.
// ❌ Nhưng hiện tại hàm TREO CỨNG. Đã chạy thử với 3 tác vụ, n = 2: sau 4 giây không in ra gì, kể cả
//    một setTimeout 50ms đặt bên ngoài cũng không chạy được. Có 5 lỗi:
//
// ❌ (1) [NẶNG NHẤT] while(true) + async IIFE (() => {...})() không chờ. IIFE chạy tới `await` là
//        trả quyền về ngay, vòng while lặp tiếp, tạo IIFE mới... mãi mãi. soDaXong chỉ tăng SAU
//        await — mà code sau await là microtask, chỉ chạy khi code đồng bộ hiện tại chạy xong. Vòng
//        while đồng bộ không bao giờ xong → không microtask nào chạy → soDaXong mãi là 0 → vòng
//        lặp vô tận, chặn cả event loop.
//        Hơn nữa, kể cả nếu chạy được thì hàng nghìn IIFE cùng race MỘT nhóm dangChay → cùng nhận
//        được một cái đã xong → đếm và lấy hàm mới nhiều lần cho cùng một kết quả.
//        Hướng sửa: bỏ new Promise, bỏ IIFE. Hàm đã là `async` rồi thì viết thẳng vòng lặp trong
//        thân hàm và `await Promise.race(...)` NGAY TRONG vòng lặp → mỗi vòng thật sự đứng chờ.
//        Vòng lặp chạy khi "còn hàm chưa lấy HOẶC còn cái đang chạy". Cuối hàm `return ketqua`.
//
// ❌ (2) Promise.resolve({ ..., giaTri: danhSachHam[i]() }) resolve NGAY với một object (object thường
//        không phải Promise nên không có gì để chờ). giaTri bên trong mới là Promise thật của tác vụ.
//        → Promise.race luôn trả về ngay ô đầu tiên, chứ không phải cái thật sự xong trước.
//        → ketqua chứa Promise, không phải giá trị.
//        Hướng sửa: gắn thông tin vào SAU khi tác vụ xong: danhSachHam[k]().then(giaTri => ({ ... }))
//        → Promise này chỉ resolve khi tác vụ xong, và mang theo i, chiSo, giaTri đã có giá trị thật.
//
// ❌ (3) Vòng for khởi động chạy đúng n lần. Nếu n > số hàm (vd 3 hàm, n = 5) thì danhSachHam[3] là
//        undefined → gọi undefined() → TypeError. Điều kiện phải dừng ở số nhỏ hơn giữa n và độ dài.
//        (Nhỏ: dùng biến vòng lặp i thay cho chiSoHam khi gọi hàm — hiện hai số bằng nhau nên chạy
//        đúng, nhưng dùng chiSoHam cho thống nhất.)
//
// ❌ (4) dangChay.splice(index, 1) — biến `index` không tồn tại → ReferenceError.
//        Kể cả sửa thành xong.i thì splice làm các phần tử phía sau dồn lên → "ô" i được lưu trong các
//        promise khác không còn khớp vị trí → lần sau gỡ nhầm cái. Hai cách an toàn:
//          - Không splice, chỉ đánh dấu ô đó đã trống, và race trên những ô còn chạy.
//          - Hoặc dùng Set: thêm promise vào khi khởi động, xoá đúng promise đó khi nó xong
//            (xoá theo chính object promise, không theo vị trí → không lo dồn chỉ số).
//
// ❌ (5) Không xử lý lỗi. Có tác vụ reject thì Promise.race reject → bên trong IIFE không ai bắt →
//        unhandled rejection, còn hàm không bao giờ reject. Sau khi sửa (1) theo hướng await trực tiếp
//        trong thân async function thì lỗi tự động làm cả hàm reject — giống Promise.all.
//
// Test sau khi sửa (tacVu là hàm ở bài 3):
//   gioiHanSongSong([() => tacVu("a",300), () => tacVu("b",100), () => tacVu("c",200),
//                    () => tacVu("d",100), () => tacVu("e",100)], 2)
//     → ["a","b","c","d","e"], mất khoảng 400ms (chia lô 2 cái một sẽ mất 600ms)
//   n = 10 với 3 hàm → không lỗi, chạy hết cùng lúc
//   n = 1 → chạy tuần tự
//   có một hàm reject → cả hàm reject
// ------------------------------------------------------------
// ✍️ BẢN VIẾT LẠI — sửa cả 5 lỗi ở trên. (Bản cũ của bạn giữ ở dạng comment ngay dưới để so sánh.)
//
// Ý tưởng:
//   - dangChay là một Set chứa các promise ĐANG CHẠY. Set cho phép xoá đúng promise đó bằng
//     dangChay.delete(p) — không dính gì tới vị trí/chỉ số → hết lỗi (4).
//   - Mỗi tác vụ được "bọc" bằng .then: khi tác vụ xong thì TỰ ghi kết quả vào ketqua[chiSo] và
//     TỰ xoá mình khỏi dangChay. Vì vậy Promise.race không cần trả về thông tin gì cả — chỉ dùng
//     để "đứng chờ tới khi có một cái xong" → hết lỗi (2).
//   - Vòng lặp nằm thẳng trong thân async function, mỗi vòng `await` thật → không còn chặn event
//     loop, không còn nhiều IIFE giành nhau → hết lỗi (1).
//   - Vòng while nhỏ bên trong: "còn hàm chưa chạy VÀ còn chỗ trống" thì khởi động thêm.
//     Điều kiện `dangChay.size < n` tự lo trường hợp n > số hàm → hết lỗi (3).
//   - Tác vụ nào reject → promise bọc reject → Promise.race reject → `await` ném lỗi → cả hàm
//     reject → hết lỗi (5). Không cần try/catch.
//   - Mảng rỗng: điều kiện while sai ngay từ đầu → return [] luôn, không cần if riêng.
//
// Dòng thời gian với 5 tác vụ a(300) b(100) c(200) d(100) e(100), n = 2:
//   vòng 1: khởi động a, b                     → await race → b xong ở 100ms
//   vòng 2: còn chỗ → khởi động c              → await race → a và c cùng xong ở 300ms
//   vòng 3: còn 2 chỗ → khởi động d, e          → await race → xong ở 400ms
//   vòng 4: hết hàm, dangChay rỗng → thoát → return ["a","b","c","d","e"]
async function gioiHanSongSong(danhSachHam, n)
{
    if(n < 1)
        throw new Error("n phải >= 1"); // n = 0 thì không khởi động được gì → race trên Set rỗng → treo mãi

    const ketqua = [];
    const dangChay = new Set();
    let chiSoHam = 0;

    function khoiDong()
    {
        const chiSo = chiSoHam++;
        const p = danhSachHam[chiSo]().then(giaTri => {
            ketqua[chiSo] = giaTri;
            dangChay.delete(p);
        });
        dangChay.add(p);
    }

    while(chiSoHam < danhSachHam.length || dangChay.size > 0)
    {
        while(chiSoHam < danhSachHam.length && dangChay.size < n)
            khoiDong();

        await Promise.race(dangChay); // chờ tới khi có ÍT NHẤT một cái xong
    }

    return ketqua;
}

// Bản cũ của bạn (để so sánh với các lỗi (1)–(5) ở trên):
// async function gioiHanSongSong(danhSachHam, n)
// {
//     return new Promise((resolve, reject) => {
//         if(danhSachHam.length === 0)
//         {
//             resolve([]);
//             return;
//         }
//
//         const ketqua = [];
//         const dangChay = [];
//         let chiSoHam = 0;
//         let soDaXong = 0;
//         for(let i = 0; i<n;i++)
//         {
//             dangChay[i] = Promise.resolve({i, chiSo: chiSoHam++, giaTri: danhSachHam[i]()});
//         }
//         while(true)
//         {
//             (async () => {
//                 const xong = await Promise.race(dangChay);
//                 ketqua[xong.chiSo] = xong.giaTri;
//                 soDaXong++;
//                 if(chiSoHam < danhSachHam.length)
//                 {
//                     dangChay[xong.i] = Promise.resolve({i: xong.i, chiSo: chiSoHam, giaTri: danhSachHam[chiSoHam]()});
//                     chiSoHam++;
//                 }
//                 else
//                 {
//                     dangChay.splice(index, 1);
//                 }
//             })();
//             if(soDaXong === danhSachHam.length)
//                 break;
//         }
//
//         resolve(ketqua);
//     });
// }

// Bài 5
// A ✅ ĐÚNG — for...of + await chờ từng cái thật. Giải thích bên .md cũng đúng.
//    (Cách này chạy TUẦN TỰ. Nếu các id không phụ thuộc nhau thì nhanh hơn:
//     `return Promise.all(ids.map(id => layUser(id)))` — song song và vẫn giữ thứ tự.)
async function layTatCa(ids) {
  const kq = [];
  for(const id of ids)
  {
    const u = await layUser(id);
    kq.push(u);
  }
  return kq;
}

// B ✅ Sửa ĐÚNG (`return await`). Giải thích bên .md chưa chính xác — xem note trong .md.
async function layDuLieu() {
  try {
    return await fetch("/api/data").then(r => r.json());
  } catch (e) {
    console.log("Lỗi:", e);
    return null;
  }
}

// C ⚠️ Giải thích bên .md ĐÚNG, nhưng cách sửa CHƯA ỔN.
//    return { id: 1 } trong catch = bịa ra một đơn hàng giả → lỗi mạng mà hienThi vẫn hiện đơn
//    hàng id 1 như thật → người dùng thấy dữ liệu SAI, còn tệ hơn là báo lỗi.
//    Thêm nữa: catch đặt ở giữa bắt luôn cả lỗi của layDonHang, nên log "lỗi user" có thể sai.
//    Sửa đúng hướng: dời .catch xuống CUỐI chuỗi — lỗi ở bất kỳ bước nào cũng bỏ qua các .then còn
//    lại (không gọi hienThi) và rơi thẳng vào catch:
//      layUser(1).then(u => layDonHang(u.id)).then(dh => hienThi(dh)).catch(e => ...)
//    (Nếu thật sự muốn hiển thị gì đó khi lỗi thì trả về giá trị "rỗng" rõ ràng, vd null, và cho
//     hienThi xử lý null — chứ không giả làm dữ liệu thật.)
function xuLy() {
  layUser(1)
    .then(u => layDonHang(u.id))
    .catch(e => {
        console.log("lỗi user");
        return null;
    })
    .then(dh => hienThi(dh));
}

// D ✅ Sửa ĐÚNG (Promise.all). Nhưng chữ trong .md sai thuật ngữ — xem note trong .md.
async function tai() {
    const [a,b,c] = await Promise.all([
        layA(),
        layB(),
        layC()
    ]);
    return { a, b, c };
}

// E ⚠️ Ý tưởng chia lô ĐÚNG (hướng sửa chuẩn cho lỗi 429), nhưng code có 2 lỗi:
// ❌ (1) `const kq = []` rồi `kq = await ...` → TypeError: Assignment to constant variable.
//        Hàm chết ngay ở lô đầu tiên.
// ❌ (2) Kể cả đổi thành `let`, mỗi vòng GÁN ĐÈ kq bằng kết quả của lô hiện tại → cuối cùng chỉ
//        còn kết quả của lô CUỐI (500 item → chỉ trả về 20 cái cuối).
//        Sửa: giữ `const kq = []`, lấy kết quả từng lô rồi nối vào: kq.push(...ketQuaLo)
//        (hoặc gioiHanSongSong ở bài 4 câu 7 khi bạn làm xong — còn tốt hơn chia lô).
// Nhỏ: số 20 nên đặt tên rõ nghĩa hơn `lo`, vd KICH_THUOC_LO.
async function luuTatCa(ds) {
    const lo = 20;
    const kq = [];
    for(let i = 0; i<ds.length; i+=lo)
    {
        const danhSachLo = ds.slice(i, i + lo);
        const kqLo = await Promise.all(danhSachLo.map(x => luu(x)));
        kq.push(...kqLo);
    }

    console.log("Đã lưu hết");
    return kq;
}

// F ⚠️ Mới sửa được 1 trong 2 bug (reject bằng new Error ✅). Xem note trong .md về bug thứ hai.
// ❌ Chưa sửa: `if (kq)` — nếu tinhToan() trả về 0, "" hoặc false (vẫn là kết quả HỢP LỆ) thì
//    if coi là "không có kết quả" và reject nhầm. Sửa: kiểm tra đúng cái mình muốn loại,
//    vd `if (kq !== undefined && kq !== null)`.
function taoPromise() {
  return new Promise((resolve, reject) => {
    const kq = tinhToan();
    if (kq !== undefined && kq !== null)
        resolve(kq);
    else
        reject(new Error("Không có kết quả"));
  });
}