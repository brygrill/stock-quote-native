import Expo from 'expo';
import React, { Component } from 'react';
import StreamScreen from './screens/StreamScreen';

export default class App extends Component {
  state = {
    appReady: false,
    error: false,
  };

  componentWillMount() {
    this.loadAssets();
  }

  async loadAssets() {
    try {
      await Expo.Font.loadAsync({
        Roboto: require('native-base/Fonts/Roboto.ttf'),
        Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
        Ionicons: require('native-base/Fonts/Ionicons.ttf'),
      });
    } catch (e) {
      console.log(e);
      this.setState({ error: true });
    } finally {
      this.setState({ appReady: true });
    }
  }

  render() {
    const { appReady } = this.state;
    return appReady ? <StreamScreen /> : <Expo.AppLoading />;
  }
}
