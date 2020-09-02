/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
import { Store, Modules, InjectStoreModules } from './ts-utils';
declare type TReactComponent<P> = React.FC<P> | React.ComponentClass<P>;
export declare type StoreGetter<ST extends InjectStoreModules, AMOT extends Modules> = () => Store<ST, AMOT>;
declare const createInject: <ST extends InjectStoreModules, AMOT extends Modules>({ storeGetter, loadingComponent, }: {
    storeGetter: StoreGetter<ST, AMOT>;
    loadingComponent?: React.FunctionComponent<{}> | React.ComponentClass<{}, any> | undefined;
}) => {
    <MNS extends Extract<keyof ST, string>>(...moduleDec: (MNS | [MNS, { [k in Extract<keyof ST[MNS], "state" | "maps">]?: (k extends "state" ? (keyof ST[MNS]["state"] | ((p: ST[MNS]["state"]) => any))[] : k extends "maps" ? (keyof ST[MNS]["maps"])[] : never) | undefined; }])[]): {
        <P extends Pick<ST, MNS>>(WrappedComponent: TReactComponent<P>, LoadingComponent?: TReactComponent<{}>): React.ComponentClass<Pick<P, Exclude<keyof P, MNS>> & {
            forwardedRef?: ((instance: any) => void) | React.RefObject<any> | null | undefined;
        }, any>;
        type: Pick<ST, MNS>;
    };
    setLoadingComponent(LoadingComponent: TReactComponent<{}>): TReactComponent<{}>;
};
export default createInject;
