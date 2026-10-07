// Kiểu "hàm khởi tạo trả về T" — HTMLImageElement, HTMLButtonElement... đều khớp
type HamKhoiTao<T> = new () => T;

// Tìm phần tử VÀ kiểm tra đúng loại lúc chạy (instanceof), không "nói dối" như querySelector<T>()
// Sai selector hoặc HTML đổi loại thẻ → báo lỗi rõ ràng ngay, thay vì undefined lan đi chỗ khác
export function layEl<T extends Element>(selector: string, kieu: HamKhoiTao<T>, cha: ParentNode = document): T
{
    const el = cha.querySelector(selector);
    if (!(el instanceof kieu))
        throw new Error(`Không tìm thấy "${selector}" đúng loại ${kieu.name}`);
    return el;
}

// Clone phần tử đầu tiên trong <template>. cloneNode trả về Node nên phải kiểm tra lại là HTMLElement
export function nhanBan(tpl: HTMLTemplateElement): HTMLElement
{
    const goc = tpl.content.firstElementChild;
    const banSao = goc?.cloneNode(true);
    if (!(banSao instanceof HTMLElement))
        throw new Error(`Template #${tpl.id} không có phần tử con hợp lệ`);
    return banSao;
}
