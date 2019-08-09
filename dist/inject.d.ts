/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
declare const Inject: {
    (...moduleNames: string[]): (WrappedComponent: React.FunctionComponent<{}> | React.ComponentClass<{}, any>, LoadingComponent?: React.FunctionComponent<{}> | React.ComponentClass<{}, any> | undefined) => React.FunctionComponent<{}>;
    setLoadingComponent(LoadingComponent: React.FunctionComponent<{}> | React.ComponentClass<{}, any>): React.FunctionComponent<{}> | React.ComponentClass<{}, any>;
};
export default Inject;
