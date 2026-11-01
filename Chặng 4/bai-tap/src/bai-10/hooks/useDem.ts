import { useCallback, useState } from "react";


export function useDem(batDau = 0)
{
    const [dem, setDem] = useState(batDau);
    const tang = useCallback(() => setDem((d) => d+1), []);
    const giam = useCallback(() => setDem((d) => d-1), []);
    const datLai = useCallback(() => setDem(batDau), [batDau]);

    return {dem, tang, giam, datLai};
}