export function debouce(fn, delay)
{
    let timerId;

    return function(...args)
    {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}