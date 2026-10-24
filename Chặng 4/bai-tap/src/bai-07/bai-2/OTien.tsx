

export type DonVi = "VND" | "USD" | "EUR";

type OTienProps = {
    donVi: DonVi,
    giaTri: string,
    onDoi: (donVi: DonVi, giaTri: string) => void
}

export function OTien({donVi, giaTri, onDoi} : OTienProps)
{
    return (
        <>
            <label htmlFor={`tien-${donVi}`}>Đơn vị: {donVi}</label>
            <input id={`tien-${donVi}`} type="text" value={giaTri} onChange={(e) => onDoi(donVi,e.target.value)}/>
        </>

    )
}
