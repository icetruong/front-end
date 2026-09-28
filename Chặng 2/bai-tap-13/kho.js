
export const kho = {
    doc(khoa, macDinh = null)
    {
        try
        {
            const giaTri = localStorage.getItem(khoa);
            if(giaTri === null)
                return macDinh;

            return JSON.parse(giaTri);
        }
        catch (e)
        {
            console.warn(`Dữ liệu hỏng ở khóa "${khoa}", dùng giá trị mặc định`, e);
            localStorage.removeItem(khoa);
            return macDinh;
        }
    },
    ghi(khoa, giaTri)
    {
        try
        {
            localStorage.setItem(khoa, JSON.stringify(giaTri));
            return true;
        }
        catch (e)
        {
            if (e.name === "QuotaExceededError") {
                console.error("Hết dung lượng lưu trữ");
            }
            return false;
        }
    },
    xoa(khoa)
    {
        localStorage.removeItem(khoa);
    },
    co(khoa)
    {
        return localStorage.getItem(khoa) !== null;
    }
}