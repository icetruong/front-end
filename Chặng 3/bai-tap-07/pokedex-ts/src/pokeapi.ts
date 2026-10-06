export interface DanhSachPokemon {
    count: number;
    next: string | null;
    previous: string | null;
    results: { name: string; url: string }[];
} 

export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    sprites: { front_default: string | null };
    types: { slot: number; type: { name: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    moves: { move: { name: string } }[];
}

// typeof null === "object" và mảng cũng là "object", nên phải loại cả hai
function laObject(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}

function laChuoiHoacNull(x: unknown): x is string | null {
    return typeof x === "string" || x === null;
}

// Các guard nhỏ cho từng phần tử trong mảng, dùng với .every() bên dưới
function laKetQuaDanhSach(x: unknown): x is { name: string; url: string } {
    return laObject(x) && typeof x.name === "string" && typeof x.url === "string";
}

function laType(x: unknown): x is { slot: number; type: { name: string } } {
    return (
        laObject(x) &&
        typeof x.slot === "number" &&
        laObject(x.type) &&
        typeof x.type.name === "string"
    );
}

function laStat(x: unknown): x is { base_stat: number; stat: { name: string } } {
    return (
        laObject(x) &&
        typeof x.base_stat === "number" &&
        laObject(x.stat) &&
        typeof x.stat.name === "string"
    );
}

function laMove(x: unknown): x is { move: { name: string } } {
    return laObject(x) && laObject(x.move) && typeof x.move.name === "string";
}

// Array.isArray(x.results) chỉ biết đó là mảng, chưa biết bên trong có gì.
// .every(laKetQuaDanhSach) mới là bước thật sự kiểm tra từng phần tử.
export function laDanhSachPokemon(x: unknown): x is DanhSachPokemon {
    return (
        laObject(x) &&
        typeof x.count === "number" &&
        laChuoiHoacNull(x.next) &&
        laChuoiHoacNull(x.previous) &&
        Array.isArray(x.results) &&
        x.results.every(laKetQuaDanhSach)
    );
}

export function laPokemon(x: unknown): x is Pokemon {
    return (
        laObject(x) &&
        typeof x.id === "number" &&
        typeof x.name === "string" &&
        typeof x.height === "number" &&
        typeof x.weight === "number" &&
        laObject(x.sprites) &&
        laChuoiHoacNull(x.sprites.front_default) &&
        Array.isArray(x.types) &&
        x.types.every(laType) &&
        Array.isArray(x.stats) &&
        x.stats.every(laStat) &&
        Array.isArray(x.moves) &&
        x.moves.every(laMove)
    );
}

