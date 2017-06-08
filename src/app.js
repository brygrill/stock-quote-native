import Expo from 'expo';
import React, { Component } from 'react';
import HomeScreen from './screens/HomeScreen';

import { base } from './rebase';

export default class AppContainer extends Component {
  state = {
    appReady: false,
    error: false,
    stream: {
      'BTC-USD': {
        last: '',
      },
      'ETH-USD': {
        last: '',
      },
    },
  };

  componentWillMount() {
    this.loadAssets();
    base.bindToState('stream', {
      context: this,
      state: 'stream',
    });
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

  formatPrice = price => {
    const formatted = parseFloat(price).toFixed(2);
    return formatted === 'NaN' ? '' : formatted;
  };

  render() {
    const { appReady, stream } = this.state;
    return appReady
      ? <HomeScreen
          btc={this.formatPrice(stream['BTC-USD'].last)}
          eth={this.formatPrice(stream['ETH-USD'].last)}
        />
      : <Expo.AppLoading />;
  }
}
