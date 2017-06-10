// @flow
import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
// $FlowFixMe
import { Constants } from 'expo';

import currencyFormatter from 'currency-formatter';
import { base } from '../rebase';

/*import StreamCard from '../components/StreamCard';

const renderCards = streamArray => {
  return streamArray.map((item, index) => {
    const { key, last } = item;
    const title = key.slice(0, 3);
    const price = currencyFormatter.format(last, { code: 'USD' });
    return <StreamCard key={`${key}_${index}`} title={title} price={price} />;
  });
};*/

export default class RealtimeScreen extends Component {
  props: {
    banner: string,
    navigation: Object,
  };

  state = {
    loading: true,
    error: false,
    stream: [],
  };

  componentWillMount() {
    base.bindToState('stream', {
      context: this,
      asArray: true,
      state: 'stream',
      then: this.setState({ loading: false }),
      onFailure: this.setState({ error: true }),
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          {this.props.banner}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#0d0d0d',
  },
  paragraph: {
    margin: 24,
    fontSize: 30,
    fontWeight: '300',
    textAlign: 'center',
    color: '#f5f5f5',
  },
});
