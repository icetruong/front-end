const sanPham = { ten: "Bàn phím", gia: 1000000 };

function TheGiamGia({ sp }: { sp: {readonly ten: string; readonly gia: number } }) {
  const newGia = sp.gia * 0.9;
  return <p>{sp.ten}: {newGia}</p>;
}

export default function ThiNghiem() {
  return (
    <>
      <TheGiamGia sp={sanPham} />
      <TheGiamGia sp={sanPham} />
      <p>Giá gốc: {sanPham.gia}</p>
    </>
  );
}