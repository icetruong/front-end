
export const kho = {
    doc<T>(khoa: string, macDinh: T, kiemTra: (x: unknown) => x is T ) : T 
    {
        try
        {
            const giaTri = localStorage.getItem(khoa);
            if(giaTri === null)
                return macDinh;

            const duLieu: unknown = JSON.parse(giaTri);
            if(kiemTra(duLieu))
                return duLieu;
            console.warn(`Dữ liệu sai cấu trúc ở khóa "${khoa}", dùng giá trị mặc định`);
            return macDinh;
        }
        catch (e)
        {
            console.warn(`Dữ liệu hỏng ở khóa "${khoa}", dùng giá trị mặc định`, e);
            localStorage.removeItem(khoa);
            return macDinh;
        }
    },
    ghi(khoa: string, giaTri: unknown) : boolean
    {
        try
        {
            localStorage.setItem(khoa, JSON.stringify(giaTri));
            return true;
        }
        catch (e)
        {
            if (e instanceof Error && e.name === "QuotaExceededError") {
                console.error("Hết dung lượng lưu trữ");
            }
            return false;
        }
    },
    xoa(khoa: string)
    {
        localStorage.removeItem(khoa);
    },
    co(khoa: string)
    {
        return localStorage.getItem(khoa) !== null;
    }
}