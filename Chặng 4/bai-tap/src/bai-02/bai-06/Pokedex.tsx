import { useState } from "react";
import { CacTab } from "./CacTab";
import { ChanTrang } from "./ChanTrang";
import { DanhSachPokemon } from "./DanhSachPokemon";
import { DauTrang } from "./DauTrang";
import { KhungLoi } from "./KhungLoi";
import { mauLoai, type LoaiPokemon } from "./mauLoai";
import { ModalChiTiet } from "./ModalChiTiet";
import "./Pokedex.css";
import { ThanhCongCu } from "./ThanhCongCu";
import { TrangThaiRong } from "./TrangThaiRong";

export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    sprites: { front_default: string | null };
    types: { slot: number; type: { name: LoaiPokemon } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    moves: { move: { name: string } }[];
}

type SapXep = "ten" | "hp" | "id"; 
type Tab = "tat-ca" | "yeu-thich";


// Dữ liệu giả — sau này sẽ thay bằng dữ liệu fetch từ PokeAPI
const URL_ANH = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

const dsType: string[] = Object.keys(mauLoai);
const dsPokemon: Pokemon[] = [
    {
        id: 1, name: "bulbasaur", height: 7, weight: 69,
        sprites: { front_default: `${URL_ANH}/1.png` },
        types: [{ slot: 1, type: { name: "grass" } }, { slot: 2, type: { name: "poison" } }],
        stats: [
            { base_stat: 45, stat: { name: "hp" } },
            { base_stat: 49, stat: { name: "attack" } },
            { base_stat: 49, stat: { name: "defense" } },
            { base_stat: 45, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "vine-whip" } }, { move: { name: "tackle" } }],
    },
    {
        id: 4, name: "charmander", height: 6, weight: 85,
        sprites: { front_default: `${URL_ANH}/4.png` },
        types: [{ slot: 1, type: { name: "fire" } }],
        stats: [
            { base_stat: 39, stat: { name: "hp" } },
            { base_stat: 52, stat: { name: "attack" } },
            { base_stat: 43, stat: { name: "defense" } },
            { base_stat: 65, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "ember" } }, { move: { name: "scratch" } }],
    },
    {
        id: 7, name: "squirtle", height: 5, weight: 90,
        sprites: { front_default: `${URL_ANH}/7.png` },
        types: [{ slot: 1, type: { name: "water" } }],
        stats: [
            { base_stat: 44, stat: { name: "hp" } },
            { base_stat: 48, stat: { name: "attack" } },
            { base_stat: 65, stat: { name: "defense" } },
            { base_stat: 43, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "water-gun" } }, { move: { name: "bubble" } }],
    },
    {
        id: 25, name: "pikachu", height: 4, weight: 60,
        sprites: { front_default: `${URL_ANH}/25.png` },
        types: [{ slot: 1, type: { name: "electric" } }],
        stats: [
            { base_stat: 35, stat: { name: "hp" } },
            { base_stat: 55, stat: { name: "attack" } },
            { base_stat: 40, stat: { name: "defense" } },
            { base_stat: 90, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "thunder-shock" } }, { move: { name: "quick-attack" } }],
    },
    {
        id: 39, name: "jigglypuff", height: 5, weight: 55,
        sprites: { front_default: `${URL_ANH}/39.png` },
        types: [{ slot: 1, type: { name: "normal" } }, { slot: 2, type: { name: "fairy" } }],
        stats: [
            { base_stat: 115, stat: { name: "hp" } },
            { base_stat: 45, stat: { name: "attack" } },
            { base_stat: 20, stat: { name: "defense" } },
            { base_stat: 20, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "sing" } }, { move: { name: "pound" } }],
    },
    {
        id: 52, name: "meowth", height: 4, weight: 42,
        sprites: { front_default: `${URL_ANH}/52.png` },
        types: [{ slot: 1, type: { name: "normal" } }],
        stats: [
            { base_stat: 40, stat: { name: "hp" } },
            { base_stat: 45, stat: { name: "attack" } },
            { base_stat: 35, stat: { name: "defense" } },
            { base_stat: 90, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "pay-day" } }, { move: { name: "scratch" } }],
    },
    {
        id: 92, name: "gastly", height: 13, weight: 1,
        sprites: { front_default: `${URL_ANH}/92.png` },
        types: [{ slot: 1, type: { name: "ghost" } }, { slot: 2, type: { name: "poison" } }],
        stats: [
            { base_stat: 30, stat: { name: "hp" } },
            { base_stat: 35, stat: { name: "attack" } },
            { base_stat: 30, stat: { name: "defense" } },
            { base_stat: 80, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "lick" } }, { move: { name: "hypnosis" } }],
    },
    {
        id: 133, name: "eevee", height: 3, weight: 65,
        sprites: { front_default: `${URL_ANH}/133.png` },
        types: [{ slot: 1, type: { name: "normal" } }],
        stats: [
            { base_stat: 55, stat: { name: "hp" } },
            { base_stat: 55, stat: { name: "attack" } },
            { base_stat: 50, stat: { name: "defense" } },
            { base_stat: 55, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "tackle" } }, { move: { name: "tail-whip" } }],
    },
    {
        id: 143, name: "snorlax", height: 21, weight: 4600,
        sprites: { front_default: `${URL_ANH}/143.png` },
        types: [{ slot: 1, type: { name: "normal" } }],
        stats: [
            { base_stat: 160, stat: { name: "hp" } },
            { base_stat: 110, stat: { name: "attack" } },
            { base_stat: 65, stat: { name: "defense" } },
            { base_stat: 30, stat: { name: "speed" } },
        ],
        moves: [{ move: { name: "rest" } }, { move: { name: "body-slam" } }],
    },
];

export function Pokedex()
{
    const [noiDungTimKiem, setNoiDungTimKiem] = useState("");
    const [loai, setLoai] = useState("");
    const [idDangXem, setIdDangXem] = useState<number | null>(null);
    const [noiDungSapXep, setNoiDungSapXep] = useState<SapXep | null>(null);

    const dsHienThi = layDanhSachHienThi();

    const pokemonDangXem = layPokemonDangXem(idDangXem);

    const [coLoi, setCoLoi] = useState(false);

    const [tabDangChon, setTabDangChon] = useState<Tab>("tat-ca");

    function layDanhSachHienThi() : Pokemon[]
    {
        let dsHienThi : Pokemon[] = dsPokemon;

        if(noiDungTimKiem !== "")
            dsHienThi = dsHienThi.filter((pokemon) => pokemon.name === noiDungTimKiem);

        if(loai !== "")
        {
            dsHienThi = dsHienThi.filter((pokemon) => {
                pokemon.types.forEach(({type}) => {
                    if(type.name === loai)
                        return true;
                });
                return false;
            })
        }

        if(noiDungSapXep)
        {
            switch (noiDungSapXep) {
                case "id": 
                    dsHienThi = dsHienThi.toSorted((a, b) => a.id - b.id);
                    break;
                case "ten":
                    dsHienThi = dsHienThi.toSorted((a, b) => a.name.localeCompare(b.name, "vi"));
                    break;
                case "hp":
                    dsHienThi = dsHienThi.toSorted((a, b) => findHpFromPokemon(a) - findHpFromPokemon(b));
                    break;
            }
        }

        return dsHienThi;
    }

    function findHpFromPokemon(pokemon: Pokemon) : number
    {
        const stats = pokemon.stats.find((st) => st.stat.name === "hp");
        if(!stats)
            return 0;

        return stats.base_stat;
    }

    function timKiem(tuKhoa: string)
    {
        if(tuKhoa !== noiDungTimKiem)
            setNoiDungTimKiem(tuKhoa);
        else
            setNoiDungTimKiem("");
    }

    function chonLoai(loai: string)
    {
        if(loai === "tat-ca")
            setLoai("");
        else
            setLoai(loai);
    }

    function moChiTiet(id: number)
    {
        setIdDangXem(id);
    }

    function layPokemonDangXem(id: number| null) : Pokemon | null | undefined
    {
        if(id === null)
            return null;

        return dsPokemon.find((pokemon) => pokemon.id === id);
    }

    function sapXep(sapXep: SapXep)
    {
        if(sapXep !== noiDungSapXep)
            setNoiDungSapXep(sapXep);
        else
            setNoiDungSapXep(null);
    }
    function dongChiTiet()
    {
        setIdDangXem(null);
    }

    function thuLai()
    {
        console.log("thử lại");
    }

    function chonTab(tab: Tab)
    {
        setTabDangChon(tab);
    }
    return (
        <div className="pokedex">
        <DauTrang
                name="Pokédex"
                thanhCongCu = {<ThanhCongCu dsLoai={dsType} onTimKiem={timKiem} onChonLoai={chonLoai} onSapXep={sapXep}/>}
                tabYeuThich = {<CacTab tabDangChon={tabDangChon} onChonTab={chonTab}/>}
        />    
        <main className="noi-dung">
            {/* Trạng thái rỗng */}
            {dsHienThi.length === 0 && <TrangThaiRong tuKhoa="test"/>}

            {/* Trạng thái lỗi */}
            {coLoi && <KhungLoi thongBao="có lỗi xảy ra" onThuLai={thuLai}/>}

            {/* Danh sách: mỗi ThePokemon tự gắn onClick, gọi onMoChiTiet(id) */}
            <DanhSachPokemon ds={dsHienThi} onMoChiTiet={moChiTiet}/>
        </main> 

        <ChanTrang daTai={dsHienThi.length} tongSo={dsPokemon.length}/>

        {pokemonDangXem && <ModalChiTiet pokemon={pokemonDangXem} onDong={dongChiTiet} />}
        </div>
    );
}