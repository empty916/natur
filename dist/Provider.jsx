import React from 'react';
export const StoreContext = React.createContext(undefined);
const Provider = ({ store, children }) => {
    return (<StoreContext.Provider value={store}>
			{children}
		</StoreContext.Provider>);
};
export default Provider;
