import { HuyHieu } from "../ui/HuyHieu";
import { Nut } from "../ui/Nut";
import { The } from "../ui/The";
import { mauLoai } from "./mauLoai";
import type { Pokemon } from "./Pokedex";


type ThePokemonProps = {
    pokemon: Pokemon,
    yeuThich: boolean,
    onMoChiTiet: (id: number) => void,
    onYeuThich: (id: number) => void
}

export function ThePokemon({pokemon, yeuThich, onMoChiTiet, onYeuThich} : ThePokemonProps)
{
    return (
        // <li> ở ngoài cùng để <ul> chỉ chứa <li>; khung thẻ do The lo
        <li className="o-pokemon" onClick={() => onMoChiTiet(pokemon.id)}>
            <The>
                <div className="the-pokemon">
                    <Nut
                        className={yeuThich ? `nut-yeu-thich da-thich` : `nut-yeu-thich`}
                        aria-label="Yêu thích"
                        onClick={(e) => {
                            // Chặn nổi bọt: không để cú bấm ☆ lan lên <li> và mở modal
                            e.stopPropagation();
                            onYeuThich(pokemon.id);
                        }}
                    >
                        ☆
                    </Nut>
                    <span className="so">{`#${String(pokemon.id).padStart(3, "0")}`}</span>
                    {pokemon.sprites.front_default && <img className="anh" src={pokemon.sprites.front_default} alt={pokemon.name} loading="lazy" />}
                    <h3 className="ten">{pokemon.name}</h3>
                    <div className="ds-loai">
                        {pokemon.types.map(({type}) => (
                            <HuyHieu key={type.name} mauNen={mauLoai[type.name]}>{type.name}</HuyHieu>
                        ))}
                    </div>
                </div>
            </The>
        </li>
    )
}