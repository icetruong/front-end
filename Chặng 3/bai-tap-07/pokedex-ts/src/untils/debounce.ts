export function debouce<A extends unknown[]>(fn: (...args: A) => void, delay: number) : (...args: A) => void
{
    let timerId: ReturnType<typeof setTimeout> | undefined;

    return function(...args)
    {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}