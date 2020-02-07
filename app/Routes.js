import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import CounterPage from './containers/CounterPage';
import BasicLayout from './layouts/BasicLayout';
import SingleAccount from './containers/SingleAccount';
import SpeedTest from './containers/SpeedTest';

export default () => {
  console.log(window.location);
  return (
    <App>
      <BasicLayout>
        <Switch>
          <Route exact path={routes.COUNTER} component={CounterPage} />
          <Route exact path="/" component={SingleAccount} />
          <Route exact path="/home" component={SingleAccount} />
          <Route exact path="/speed-test" component={SpeedTest} />
        </Switch>
      </BasicLayout>
    </App>
  );
};
