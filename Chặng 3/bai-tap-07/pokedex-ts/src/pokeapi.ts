export interface DanhSachPokemon {
    count: number;
    next: string | null;
    previous: string | null;
    results: { name: string; url: string }[];
}

// /type (không kèm tên loại) trả về đúng cấu trúc phân trang như /pokemon:
// { count, next, previous, results: [{ name, url }] } → dùng lại, chỉ đặt tên riêng cho dễ đọc
export type DanhSachLoai = DanhSachPokemon;

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

// Phản hồi của /type/{loai}: API trả nhiều field (damage_relations, moves...)
// nhưng mình chỉ khai báo phần thật sự dùng — danh sách pokemon thuộc loại đó
export interface PokemonTheoLoai {
    pokemon: { slot: number; pokemon: { name: string; url: string } }[];
}

export interface CachePokemon {
    luuLuc: number,
    duLieu: Pokemon
};

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

// Phần tử trong mảng pokemon của /type: bên trong lại có một object pokemon dạng { name, url }
// → tái dùng laKetQuaDanhSach thay vì viết lại
function laPhanTuTheoLoai(x: unknown): x is { slot: number; pokemon: { name: string; url: string } } {
    return laObject(x) && typeof x.slot === "number" && laKetQuaDanhSach(x.pokemon);
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

// Cùng cấu trúc với DanhSachPokemon nên kiểm tra y hệt — gọi lại guard cũ
export function laDanhSachLoai(x: unknown): x is DanhSachLoai {
    return laDanhSachPokemon(x);
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

export function laPokemonTheoLoai(x: unknown): x is PokemonTheoLoai {
    return (
        laObject(x) &&
        Array.isArray(x.pokemon) &&
        x.pokemon.every(laPhanTuTheoLoai)
    );
}

export function laCachePokemon(x: unknown) : x is CachePokemon {
    return (
        laObject(x) &&
        typeof x.luuLuc === "number" &&
        laPokemon(x.duLieu)
    );
}

