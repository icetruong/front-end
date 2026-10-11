import styles from "./AnhSanPham.module.css";

type AnhSanPhamProps = {
    src: string,
    alt: string
};

export function AnhSanPham({src, alt} : AnhSanPhamProps)
{
    return <img src={src} alt={alt} className={styles["anh"]}></img>
}