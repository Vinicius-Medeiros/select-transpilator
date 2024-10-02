import { useContext } from "react"
import { TranspiladorContext } from "../context/TranspiladorContext"

const useTranspiladorContext = () => {
    const context = useContext(TranspiladorContext)

    return context
}

export default useTranspiladorContext