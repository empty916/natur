/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
declare type TReactComponent<P, S> = React.FC<P> | React.ComponentClass<P, S>;
declare const Inject: {
    <StoreProp>(...moduleNames: (string | number)[]): <P, C, SP extends StoreProp>(WrappedComponent: TReactComponent<P, C>, LoadingComponent?: React.FunctionComponent<{}> | React.ComponentClass<{}, {}> | undefined) => React.FunctionComponent<Pick<P, Exclude<keyof P, keyof SP>>>;
    setLoadingComponent(LoadingComponent: TReactComponent<{}, {}>): TReactComponent<{}, {}>;
};
export default Inject;
