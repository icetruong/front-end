function layDau<T>(arr: T[]): T | undefined { return arr[0]; }
function ghepCap<A, B>(a: A, b: B): [A, B] { return [a, b]; }
function layThuocTinh<T, K extends keyof T>(o: T, k: K): T[K] { return o[k]; }

const v1 = layDau([1, 2, 3]);
const v2 = layDau(["a", 1]);
const v3 = layDau([]); 
const v4 = ghepCap("x", true); 
const v5 = ghepCap([1], { a: 1 }); 

const user = { id: 1, ten: "An", tags: ["admin"] };
const v6 = layThuocTinh(user, "tags"); 
const v7 = layThuocTinh(user, "id"); 

type U = { id: number; ten: string; email?: string };
type V8 = Partial<U>;
type V9 = Pick<U, "id" | "email">;
type V10 = Omit<U, "id">;
type V11 = keyof U;
type V12 = U["email"];
type V13 = ReturnType<typeof layDau<string>>;
type V14 = Awaited<Promise<Promise<number>>>;