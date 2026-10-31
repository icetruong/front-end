type User = {
    id: string;
    ten: string;
    ho: string;
    namSinh: number;
    banBe: User[]
    dangOnline: boolean
}

export function HoSo({ user }: { user: User }) {
  const hoTen =`${user.ho} ${user.ten}`;
  const tuoi =2026 - user.namSinh;

  function xuLyBam() {
    alert(hoTen);
  }

  const kieu = { color: "blue" };

  const dsBanBe = user.banBe.filter((b) => b.dangOnline);

  function xuLyGo (e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
  }

  return (
    <div style={kieu}>
      <h2>{hoTen} ({tuoi})</h2>
      <button onClick={xuLyBam}>Chào</button>
      <input onChange={xuLyGo} />
      <ul>{dsBanBe.map((b) => <li key={b.id}>{b.ten}</li>)}</ul>
    </div>
  );
}