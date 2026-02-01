'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModalContextType {
    openModal: boolean
    setOpenModal: (open: boolean) => void
}

const ModalContext = createContext<ModalContextType>({
    openModal: false,
    setOpenModal: () => {}
})

export function ModalProvider({ children }: { children: ReactNode }) {
    const [openModal, setOpenModal] = useState(false)
    
    return (
        <ModalContext.Provider value={{ openModal, setOpenModal }}>
            {children}
        </ModalContext.Provider>
    )
}

export const useModal = () => useContext(ModalContext)