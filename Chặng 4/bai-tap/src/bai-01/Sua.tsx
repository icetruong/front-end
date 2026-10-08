export function A() {
  return (
    <>
      <h1>Tiêu đề</h1>
      <p>Đoạn văn</p>
    </>
  );
}

export function B() {
  return <img src="logo.png" className="logo"/>;
}

export function C() {
  return (
    <>
      <label htmlFor="email">Email</label>
      <input id="email" type="email"/>
    </>
  );
}

export function D() {
  const mau = "red";
  return <p style= {{color: mau, fontSize: 20}}>Chữ đỏ</p>;
}

export function E() {
  const daXong = true;
  return <p>{daXong ?  "Đã xong" :  "Chưa xong" }</p>;
}

export function F() {
  return <div>Component F</div>;
}

export function G() {
  const thoiGian = new Date().toDateString();
  return <p>Bây giờ là {thoiGian}</p>;
}

export function H() {
  function chao() { alert("Xin chào"); }
  return <button onClick={chao}>Chào</button>;
}