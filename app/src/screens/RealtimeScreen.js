// @flow
import React, { Component } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { Entypo } from '@expo/vector-icons';

import currencyFormatter from 'currency-formatter';

import AppContainer from '../containers/AppContainer';

import { base } from '../rebase';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    padding: 15,
    fontSize: 20,
    fontWeight: '300',
    color: '#f5f5f5',
    borderBottomWidth: 0,
  },
  paragraph: {
    margin: 24,
    fontSize: 30,
    fontWeight: '300',
    textAlign: 'center',
    color: '#f5f5f5',
  },
});

const formatUSD = amount => {
  return currencyFormatter.format(amount, { code: 'USD' });
};

const formatChange = (close, price) => {
  let change = (price - close) / close;
  change *= 100;
  change = change.toFixed(3);
  return `${change}%`;
};

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
    const { key, last, close } = item;
    const symbol = key.slice(0, 3);
    const price = formatUSD(last);
    const change = close ? formatChange(close, last) : '0.00%';
    return (
      <ListItem
        title={symbol}
        rightTitle={`${price}  ${change}`}
        leftIcon={<Entypo name="dot-single" size={32} color="#43a047" />}
        hideChevron
      />
    );
  };

  render() {
    return (
      <AppContainer>
        <FlatList
          style={styles.container}
          data={this.state.stream}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
        />
      </AppContainer>
    );
  }
}
