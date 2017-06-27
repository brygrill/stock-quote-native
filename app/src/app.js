import Expo from 'expo';
import React, { Component } from 'react';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

import NavContainer from './containers/NavContainer';

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
      await Expo.Font.loadAsync(Ionicons.font);
      await Expo.Font.loadAsync(FontAwesome.font);
    } catch (e) {
      console.log(e);
      this.setState({ error: true });
    } finally {
      this.setState({ appReady: true });
    }
  }

  render() {
    const { appReady } = this.state;
    return appReady ? <NavContainer /> : <Expo.AppLoading />;
  }
}
