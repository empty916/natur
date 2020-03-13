/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
import { Store } from './createStore';
import { ModuleDepDec } from './utils';
declare type TReactComponent<P, S> = React.FC<P> | React.ComponentClass<P, S>;
declare type connectReturn<P, S, SP> = React.ComponentClass<Omit<P, keyof SP> & {
    forwardedRef?: React.Ref<any>;
}, S>;
declare type InjectReturn<StoreProp> = <P, C, SP extends StoreProp>(WrappedComponent: TReactComponent<P, C>, LoadingComponent?: TReactComponent<{}, {}>) => connectReturn<P, C, SP>;
declare type InjectParams = Array<string | ModuleDepDec>;
declare function Inject<StoreProp>(...moduleDec: InjectParams): InjectReturn<StoreProp>;
declare namespace Inject {
    var setLoadingComponent: (LoadingComponent: TReactComponent<{}, {}>) => TReactComponent<{}, {}>;
    var setStoreGetter: (storeGetter: () => Store) => void;
}
export default Inject;
