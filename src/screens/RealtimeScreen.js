// @flow
import React, { Component } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import currencyFormatter from 'currency-formatter';
// $FlowFixMe
import { Constants } from 'expo';

import AppContainer from '../containers/AppContainer';

import { base } from '../rebase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#0d0d0d',
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: 'skyblue',
  },
  paragraph: {
    margin: 24,
    fontSize: 30,
    fontWeight: '300',
    textAlign: 'center',
    color: '#f5f5f5',
  },
});

export default class RealtimeScreen extends Component {
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

  keyExtractor = (item, index) => `${item.key}_${index}`;

  props: {
    banner: string,
    navigation: Object,
  };

  renderItem = ({ item }) => {
    const { key, last } = item;
    const title = key.slice(0, 3);
    const price = currencyFormatter.format(last, { code: 'USD' });
    return (
      <Text style={styles.row} key={key}>
        {`${title}: ${price}`}
      </Text>
    );
  };

  render() {
    return (
      <AppContainer>
        <FlatList
          data={this.state.stream}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
        />
      </AppContainer>
    );
  }
}
