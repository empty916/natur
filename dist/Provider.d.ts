import React from 'react';
import { Store } from './createStore';
export declare const StoreContext: React.Context<Store>;
declare type props = {
    store: Store;
    children: React.ReactNode;
};
declare const Provider: React.FC<props>;
export default Provider;
