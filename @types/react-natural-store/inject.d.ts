import React from 'react';
declare const Inject: {
    (...moduleNames: string[]): (WrappedComponent: React.FunctionComponent<{}> | React.ComponentClass<{}, any>, LoadingComponent?: React.FunctionComponent<{}> | React.ComponentClass<{}, any> | undefined) => React.FunctionComponent<{}>;
    setLoadingComponent(LoadingComponent: React.FunctionComponent<{}> | React.ComponentClass<{}, any>): React.FunctionComponent<{}> | React.ComponentClass<{}, any>;
};
export default Inject;
