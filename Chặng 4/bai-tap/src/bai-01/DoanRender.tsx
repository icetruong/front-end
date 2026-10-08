export default function DoanRender() {
  const so = 0;
  const rong = "";
  const ds: string[] = [];
  const user = { ten: "An" };
  const coCo = true;

  return (
    <ul>
      <li>1: {so}</li> 
      <li>2: {rong}</li>
      <li>3: {true}</li>
      <li>4: {null}</li>
      <li>5: {undefined}</li>
      <li>6: {NaN}</li>
      <li>7: {so && "có số"}</li>
      <li>8: {rong && "có chuỗi"}</li>
      <li>9: {ds.length && "có phần tử"}</li>
      <li>10: {ds.length > 0 && "có phần tử"}</li>
      <li>11: {coCo && "có cờ"}</li>
      <li>12: {coCo || "không cờ"}</li>
      <li>13: {[1, 2, 3]}</li>
      <li>14: {["a", "b"].join(" - ")}</li>
      <li>15: {user.ten}</li>
      <li>16: {"<b>đậm</b>"}</li>
      <li>17: {so ?? "rỗng"}</li>
      <li>18: {so || "rỗng"}</li>
    </ul>
  );
}