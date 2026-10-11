import type { Pokemon } from "./Pokedex";
import { ThePokemon } from "./ThePokemon";


type DanhSachPokemonProps = {
    ds: Pokemon[],
    onMoChiTiet: (id: number) => void
}

export function DanhSachPokemon({ds, onMoChiTiet} : DanhSachPokemonProps)
{
    return (
        <ul className="luoi">
            {ds.map((pokemon) => (
                // key nằm trên phần tử ngoài cùng mà .map trả về
                <ThePokemon key={pokemon.id} pokemon={pokemon} onMoChiTiet={onMoChiTiet}/>
            ))}
        </ul>
    );
}