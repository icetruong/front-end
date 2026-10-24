import { type ReactNode } from "react"


type MucAccordionProps = {
    tieuDe: string,
    children: ReactNode,
    mo: boolean,
    onBam: () => void
}

export function MucAccordion({tieuDe, children, mo, onBam} : MucAccordionProps)
{
    return (
        <section>
            <button onClick={() => onBam()}>{tieuDe}</button>
            {mo && <div>{children}</div>}
        </section>
    );
}