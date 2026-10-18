import { useState } from "react";
import type { Pokemon } from "./Pokedex";
import { ThePokemon } from "./ThePokemon";


type DanhSachPokemonProps = {
    ds: Pokemon[],
    onMoChiTiet: (id: number) => void
}

export function DanhSachPokemon({ds, onMoChiTiet} : DanhSachPokemonProps)
{
    const [dsYeuThich, setDsYeuThich] = useState<Set<number>>(new Set());

    function yeuThich(id: number)
    {
        if(dsYeuThich.has(id))
            setDsYeuThich((d) => {
                const newD = new Set(d);
                newD.delete(id);
                return newD;
            });
        else
            setDsYeuThich((d) => new Set(d).add(id));
    }

    return (
        <ul className="luoi">
            {ds.map((pokemon) => (
                // key nằm trên phần tử ngoài cùng mà .map trả về
                <ThePokemon key={pokemon.id} pokemon={pokemon} yeuThich={dsYeuThich.has(pokemon.id)} onMoChiTiet={onMoChiTiet} onYeuThich={yeuThich}/>
            ))}
        </ul>
    );
}