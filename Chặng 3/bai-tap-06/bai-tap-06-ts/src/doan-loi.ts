// 1
const a = 5;
console.log(a);

// 2
const b = "xin chào";
const c: "xin chào" | "tạm biệt" = b;
const d = "xin chào";

console.log(c);
console.log(d);

// 3
const user: { ten: string; email?: string } = { ten: "An" };
console.log(user.email?.length);

// 4
function f(x: string | number): string | number {
  if (typeof x === "string") return x.toUpperCase();
  return x;
}

console.log(f(a));

// 5
const ds: number[] = [1, 2, 3];
ds.push(4);
const t: [string, number] = ["An", 22];

console.log(t);

// 6
function g(n: number): string {
  if (n > 0) return "dương";
  return "âm";
}

console.log(g(5));

// 7
const e: unknown = "abc";
if (typeof e === "string") console.log(e.length);

// 8
type P = { x: number; y: number };
function inP(p: P) {
  console.log(p);
}
inP({ x: 1, y: 2 });
const p3 = { x: 1, y: 2, z: 3 };
inP(p3);

// 9
const el = document.querySelector("#o");
if (el instanceof HTMLInputElement) el.value = "x";

// 10
try {
  JSON.parse("{abc");
} catch (err) {
  if (err instanceof Error) console.log(err.message);
}
