// @flow
import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
// $FlowFixMe
import { Constants } from 'expo';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#0d0d0d',
  },
});

export default class RealtimeScreen extends Component {
  static defaultProps = {
    children: null,
  };

  props: {
    children: any,
  };

  render() {
    return (
      <View style={styles.container}>
        {this.props.children}
      </View>
    );
  }
}
