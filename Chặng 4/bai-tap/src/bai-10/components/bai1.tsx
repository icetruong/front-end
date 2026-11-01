import { useDem } from "../hooks/useDem";

type BoDemProps = {
    dem: number;
    tang: () => void;
    giam: () => void;
    datLai: () => void;
}

function BoDemTrai({dem, tang, giam, datLai} : BoDemProps)
{

    return (
        <section>
            <h3>Bộ đếm trái: {dem}</h3>
            <button type="button" onClick={giam}>−</button>
            <button type="button" onClick={tang}>+</button>
            <button type="button" onClick={datLai}>Đặt lại</button>
        </section>
    );
}

function BoDemPhai({dem, tang, giam, datLai} : BoDemProps)
{

    return (
        <section>
            <h3>Bộ đếm phải: {dem}</h3>
            <button type="button" onClick={giam}>−</button>
            <button type="button" onClick={tang}>+</button>
            <button type="button" onClick={datLai}>Đặt lại</button>
        </section>
    );
}

export function Bai1()
{
    
    const {dem, tang, giam, datLai} = useDem();

    return (
        <div style={{display: "flex", gap: 32}}>
            <BoDemTrai dem={dem} tang={tang} giam={giam} datLai={datLai}/>
            <BoDemPhai dem={dem} tang={tang} giam={giam} datLai={datLai} />
        </div>
    );
}
