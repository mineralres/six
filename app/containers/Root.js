// @flow
import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { GlobalStateProvider } from '../state/single';
import type { Store } from '../reducers/types';
import Routes from '../Routes';

type Props = {
  store: Store,
  history: {}
};

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <GlobalStateProvider>
        <Routes />
      </GlobalStateProvider>
    </ConnectedRouter>
  </Provider>
);

export default hot(Root);
