import { useEffect, useState } from "react";


export function useOnline()
{
    const [online, setOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        const bat = () => setOnline(true);
        const tat = () => setOnline(false);

        window.addEventListener("online", bat);
        window.addEventListener("offline", tat);

        return () => {
            window.removeEventListener("online", bat);
            window.removeEventListener("offline", tat);
        }
    }, []);

    return online;
}