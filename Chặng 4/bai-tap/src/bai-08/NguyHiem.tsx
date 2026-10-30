import { useRef, useState } from "react";


export function NguyHiem()
{
    const [hien, setHien] = useState(true);
    const ref = useRef<HTMLParagraphElement>(null);

    return (
        <>
            <button onClick={() => setHien(!hien)}>Bật/ tắt bằng state</button>
            <button onClick={() => ref.current?.remove()}>Xóa bằng DOM</button>
            {hien && <p ref={ref}>Xin Chào</p>}
        </>
    )
}