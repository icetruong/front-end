import { useState, type ReactNode } from "react"


type Accordion1Props = {
    tieuDe: string,
    children: ReactNode
}

export function Accordion1({tieuDe, children} : Accordion1Props)
{
    const [mo, setMo] = useState(false);
    return (
        <section>
            <button onClick={() => setMo(!mo)}>{tieuDe}</button>
            {mo && <div>{children}</div>}
        </section>
    );
}