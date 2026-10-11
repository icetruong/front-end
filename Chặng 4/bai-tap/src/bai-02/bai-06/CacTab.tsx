

type Tab = "tat-ca" | "yeu-thich";

type CacTabProps = {
    tabDangChon: Tab,
    onChonTab: (tab: Tab) => void
}

export function CacTab({tabDangChon, onChonTab} : CacTabProps)
{
    return (
        <nav className="cac-tab">
            <button className={`tab ${tabDangChon === "tat-ca" ? "dang-chon" : ""}`} onClick={() => onChonTab("tat-ca")}>Tất cả</button>
            <button className={`tab ${tabDangChon === "yeu-thich" ? "dang-chon" : ""}`} onClick={() => onChonTab("yeu-thich")}>Yêu thích ★</button>
        </nav>
    );
}