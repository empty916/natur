import React from 'react';
import { Store } from './createStore';

export const StoreContext = React.createContext(undefined as any as Store);

type props = {
	store: Store,
	children: React.ReactNode
}
const Provider:React.FC<props> = ({store, children}) => {
	return (
		<StoreContext.Provider value={store}>
			{children}
		</StoreContext.Provider>
	)
}

export default Provider;
