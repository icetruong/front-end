import { HuyHieu } from "../ui/HuyHieu";
import { Modal } from "../ui/Modal";
import { mauLoai } from "./mauLoai";
import type { Pokemon } from "./Pokedex";

// Chỉ số gốc cao nhất trong game là 255 → dùng làm 100% chiều dài thanh
const CHI_SO_TOI_DA = 255;

type ModalChiTietProps = {
    pokemon: Pokemon,
    onDong: () => void
}

export function ModalChiTiet({pokemon, onDong} : ModalChiTietProps)
{
    return (
        <Modal tieuDe={pokemon.name} onDong={onDong}>
            <div className="ct-dau">
                {pokemon.sprites.front_default && <img className="ct-anh" src={pokemon.sprites.front_default} alt={pokemon.name} />}
                <div>
                    <span className="so">{`#${String(pokemon.id).padStart(3, "0")}`}</span>
                    <div className="ds-loai">
                        {pokemon.types.map(({type}) => (
                            <HuyHieu key={type.name} mauNen={mauLoai[type.name]}>{type.name}</HuyHieu>
                        ))}
                    </div>
                </div>
            </div>

            <dl className="ct-kich-thuoc">
                {/* PokeAPI: height tính bằng decimet, weight tính bằng hectogram → chia 10 */}
                <div><dt>Chiều cao</dt><dd>{`${pokemon.height / 10} m`}</dd></div>
                <div><dt>Cân nặng</dt><dd>{`${pokemon.weight / 10} kg`}</dd></div>
            </dl>

            <h3 className="ct-muc">Chỉ số</h3>
            <ul className="ds-chi-so">
                {pokemon.stats.map(({base_stat, stat}) => (
                    <li key={stat.name} className="chi-so">
                        <span className="chi-so-ten">{stat.name}</span>
                        <span className="chi-so-so">{base_stat}</span>
                        <span className="thanh">
                            <span className="thanh-gia-tri" style={{ width: `${(base_stat / CHI_SO_TOI_DA) * 100}%` }} />
                        </span>
                    </li>
                ))}
            </ul>

            <h3 className="ct-muc">Chiêu thức</h3>
            <ol className="ds-chieu">
                {pokemon.moves.map(({move}) => <li key={move.name}>{move.name}</li>)}
            </ol>
        </Modal>
    );
}
