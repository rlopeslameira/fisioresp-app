import React, { Component } from 'react';
import { YellowBox } from 'react-native';
import Routes from './routes';

YellowBox.ignoreWarnings(['Warning: ', 'Remote', 'Expected ', 'Unrecognized']);

class App extends Component {
  render() {
    return <Routes {...this.props} />;
  }
}
export default App;
