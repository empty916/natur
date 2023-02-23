import React, { FC } from "react";


export const NaturContext = React.createContext<unknown>(undefined);


export interface ProviderProps {
    store: unknown;
    children: React.ReactNode;

}
export const Provider:FC<ProviderProps> = ({store, children}) => {
    return (
        <NaturContext.Provider value={store}>
            {children}
        </NaturContext.Provider>
    )
}