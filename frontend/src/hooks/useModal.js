import { useState } from "react"

const useModal = () => {
    const [isOpen, setIsOpen] = useState(false)

   
    const toggleHandler = () => {
        setIsOpen(prev => !prev)
    }
    return [isOpen,  toggleHandler]
}
export default useModal

