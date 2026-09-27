const GOC = "https://jsonplaceholder.typicode.com";

const ketQua = document.querySelector("#ket-qua");

// 1
document.querySelector("#cau-1").addEventListener("click", async () => {
    try {
        // GET không có body → không cần Content-Type (thêm vào sẽ sinh preflight OPTIONS)
        const res = await fetch(GOC + "/posts/1");
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const duLieu = await res.json();
        ketQua.textContent = `Tiêu đề: ${duLieu.title}`;
    } catch (loi) {
        ketQua.textContent = `Lỗi: ${loi.message}`;
    }
});

// 2
document.querySelector("#cau-2").addEventListener("click", async () => {
    try {
        const res = await fetch(GOC + "/posts/999999");

        // Cố tình KHÔNG kiểm tra res.ok ở đây để thấy: 404 vẫn không vào catch
        const duLieu = await res.json();
        ketQua.textContent = [
            `status: ${res.status}`,
            `res.ok: ${res.ok}`,
            `body: ${JSON.stringify(duLieu)}`,
            "catch: KHÔNG chạy (fetch không reject với lỗi HTTP)"
        ].join("\n");
    } catch (loi) {
        ketQua.textContent = `catch CÓ chạy: ${loi.message}`;
    }
});

// 3
document.querySelector("#cau-3").addEventListener("click", async () => {
    try {
        const url = new URL(GOC + "/posts");
        url.search = new URLSearchParams({ userId: 1, _limit: 5 });

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const duLieu = await res.json();
        ketQua.textContent = JSON.stringify(duLieu, null, 2);
    } catch (loi) {
        ketQua.textContent = `Lỗi: ${loi.message}`;
    }
});

// 4
document.querySelector("#cau-4").addEventListener("click", async () => {
    try {
        // Tạo mới → KHÔNG gửi id, server tự cấp
        const res = await fetch(GOC + "/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: 1,
                title: "Bài viết của tôi",
                body: "Nội dung bài viết mới"
            })
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const duLieu = await res.json();
        ketQua.textContent = [
            `status: ${res.status}`,
            `res.ok: ${res.ok}`,
            `body: ${JSON.stringify(duLieu, null, 2)}`
        ].join("\n");
    } catch (loi) {
        ketQua.textContent = `Lỗi: ${loi.message}`;
    }
});

// 5
document.querySelector("#cau-5").addEventListener("click", async () => {
    try {
        // PUT = THAY THẾ toàn bộ → phải gửi đủ mọi trường
        const guiPut = {
            id: 1,
            userId: 1,
            title: "Tiêu đề mới (PUT)",
            body: "Nội dung mới (PUT)"
        };
        const resPut = await fetch(GOC + "/posts/1", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(guiPut)
        });

        if (!resPut.ok) {
            throw new Error(`PUT HTTP ${resPut.status}: ${resPut.statusText}`);
        }
        const nhanPut = await resPut.json();

        // PATCH = SỬA MỘT PHẦN → chỉ gửi trường cần đổi
        const guiPatch = {
            title: "Tiêu đề mới (PATCH)"
        };
        const resPatch = await fetch(GOC + "/posts/1", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(guiPatch)
        });

        if (!resPatch.ok) {
            throw new Error(`PATCH HTTP ${resPatch.status}: ${resPatch.statusText}`);
        }
        const nhanPatch = await resPatch.json();

        ketQua.textContent = [
            `=== PUT (status ${resPut.status}) ===`,
            `Gửi đi: ${JSON.stringify(guiPut, null, 2)}`,
            `Nhận về: ${JSON.stringify(nhanPut, null, 2)}`,
            "",
            `=== PATCH (status ${resPatch.status}) ===`,
            `Gửi đi: ${JSON.stringify(guiPatch, null, 2)}`,
            `Nhận về: ${JSON.stringify(nhanPatch, null, 2)}`
        ].join("\n");
    } catch (loi) {
        ketQua.textContent = `Lỗi: ${loi.message}`;
    }
});

// 6
document.querySelector("#cau-6").addEventListener("click", async () => {
    try {
        const res = await fetch(GOC+ "/posts/1", {
            method: "DELETE"
        });

        if(!res.ok)
        {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const duLieu = await res.json();
        ketQua.textContent = JSON.stringify(duLieu, null, 2);

    } catch (loi) {
        ketQua.textContent = `Lỗi: ${loi.message}`;
    }
});

// 7
document.querySelector("#cau-7").addEventListener("click", async () => {
    try {
        const res = await fetch("https://khong-ton-tai-abc123.com");

        if(!res.ok)
        {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const duLieu = await res.json();
        ketQua.textContent = JSON.stringify(duLieu, null, 2);

    } catch (loi) {
        ketQua.textContent = `Lỗi: ${loi.message}`;
    }
});

// 8
document.querySelector("#cau-8").addEventListener("click", async () => {
    const dong = [];
    try {
        const res = await fetch(GOC + "/posts/1");
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        dong.push(`bodyUsed trước lần 1: ${res.bodyUsed}`);
        const lan1 = await res.json();
        dong.push(`Lần 1 OK → title: ${lan1.title}`);
        dong.push(`bodyUsed sau lần 1: ${res.bodyUsed}`);

        // Body là stream, đã đọc hết thì không đọc lại được → lần 2 reject
        const lan2 = await res.json();
        dong.push(`Lần 2 OK → title: ${lan2.title}`);
    } catch (loi) {
        dong.push(`Lỗi → ${loi.name}: ${loi.message}`);
    }
    ketQua.textContent = dong.join("\n");
});
