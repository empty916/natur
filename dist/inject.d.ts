/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
import { Store, Modules, InjectStoreModules, LazyStoreModules, GenerateStoreType, PickLazyStoreModules } from './ts-utils';
import { ModuleDepDec } from './injectCache';
declare type TReactComponent<P> = React.FC<P> | React.ComponentClass<P>;
export declare type StoreGetter<M extends Modules, LM extends LazyStoreModules> = () => Store<M, LM>;
declare type connectReturn<P, SP> = React.ComponentClass<Omit<P, keyof SP> & {
    forwardedRef?: React.Ref<any>;
}>;
declare const createInject: <M extends Modules, LM extends LazyStoreModules, ST extends InjectStoreModules = GenerateStoreType<M, PickLazyStoreModules<LM>>>({ storeGetter, loadingComponent, }: {
    storeGetter: StoreGetter<M, LM>;
    loadingComponent?: React.FC<{}> | React.ComponentClass<{}, any> | undefined;
}) => {
    <MNS extends Extract<keyof ST, string>>(...moduleDec: (MNS | ModuleDepDec<MNS, ST>)[]): {
        <P extends Pick<ST, MNS>>(WrappedComponent: TReactComponent<P>, LoadingComponent?: TReactComponent<{}>): connectReturn<P, Pick<ST, MNS>>;
        type: Pick<ST, MNS>;
    };
    setLoadingComponent(LoadingComponent: TReactComponent<{}>): TReactComponent<{}>;
};
export default createInject;
