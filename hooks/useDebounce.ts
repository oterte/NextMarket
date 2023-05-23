import { useEffect, useState } from "react"


// input 변경 때마다 db 조회를 막기위해 debounce 설정
// 밖에서 들어온 값을 주면  사용 가능
// 값이 변경되면 delay동안 바뀌지 않다가 delay가 끝나면 리턴하겟다.
const useDebounce = <T=any>(value:T, delay = 600) => {
    const [debounced, setDebounced] = useState<T>(() => value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(value)
        }, delay)

    return () => {
        clearTimeout(timer)
    }
    }, [value, delay])

    return debounced
}

export default useDebounce