// @flow
import React from 'react';
import { useGlobalState } from '../state/single';
import Login from '../components/SingleAccount/Login';
import Trading from '../components/SingleAccount/Trading';

export default () => {
  const [isLogin] = useGlobalState('isLogin');
  if (!isLogin) {
    return <Login />;
  }
  return <Trading />;
};
