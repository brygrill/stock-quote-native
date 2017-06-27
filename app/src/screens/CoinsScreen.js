// @flow
import React, { Component } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import values from 'lodash.values';

import fire from '../firebase';

import AppContainer from '../containers/AppContainer';
import QuoteCard from '../components/QuoteCard';

import BTCImg from '../assets/coins/bitcoinLogo1000.png';
import ETHImg from '../assets/coins/ETHEREUM-ICON_Black.png';
import LTCImg from '../assets/coins/600px-Litecoin-logo.png';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
  },
  test: {
    color: '#fff',
  },
  header: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: '#262626',
    color: '#f5f5f5',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  rowTitle: {
    color: '#f5f5f5',
    margin: 10,
  },
  rowStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rowStatsPrice: {
    color: '#f5f5f5',
    margin: 10,
  },
  rowStatsChange: {
    color: '#f5f5f5',
    margin: 10,
    minWidth: 50,
  },
});

export default class RealtimeScreen extends Component {
  state = {
    loading: true,
    error: false,
    coins: [],
  };

  componentWillMount() {
    this.coinsOnValue();
  }

  coinsOnValue = () => {
    const coins = fire.database().ref('realtime/coins/coincap');
    coins.on('value', data => {
      const coindData = data.val();
      this.setState({ coins: values(coindData) });
    });
  };

  keyExtractor = (item, index) => `${item.key}_${index}`;

  props: {
    banner: string,
    navigation: Object,
  };

  renderItem = ({ item }) => {
    const { symbol, fullName, last, percDay, statusDay, lastUpdatedAt, volume } = item;
    return (
      <QuoteCard
        symbol={symbol}
        title={fullName}
        price={last}
        change={percDay}
        lastUpdatedAt={lastUpdatedAt}
        volume={volume}
        status={statusDay}
      />
    );
  };

  render() {
    return (
      <AppContainer>
        <FlatList
          style={styles.container}
          data={this.state.coins}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
        />
      </AppContainer>
    );
  }
}
