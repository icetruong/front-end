import { memo } from "react";


export const ChamCoChuDich = memo(function ChamCoChuDich({ ten }: { ten: string })
{
    const batDau = performance.now();
    while (performance.now() - batDau < 2) {}     // cố tình chậm 2ms mỗi lần render
    return <li>{ten}</li>;
});