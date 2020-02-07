// @flow
import * as React from 'react';

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    console.log('versions', process.versions);
    const { children } = this.props;
    return <div>{children}</div>;
  }
}
