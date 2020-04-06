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
declare type TReactComponent<P> = React.FC<P> | React.ComponentClass<P>;
declare function Inject<StoreProp>(...moduleDec: Array<string | ModuleDepDec>): <P extends StoreProp>(WrappedComponent: TReactComponent<P>, LoadingComponent?: React.FunctionComponent<{}> | React.ComponentClass<{}, any> | undefined) => React.ComponentClass<Pick<P, Exclude<keyof P, keyof StoreProp>> & {
    forwardedRef?: ((instance: any) => void) | React.RefObject<any> | null | undefined;
}, any>;
declare namespace Inject {
    var setLoadingComponent: (LoadingComponent: TReactComponent<{}>) => TReactComponent<{}>;
    var setStoreGetter: (storeGetter: () => Store) => void;
}
export default Inject;
