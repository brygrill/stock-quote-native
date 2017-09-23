// @flow
import React, { Component } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import values from 'lodash.values';

import fire from '../firebase';

import AppContainer from '../containers/AppContainer';
import QuoteCard from '../components/QuoteCard';

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
    const coins = fire.database().ref('poll/securities');
    coins.on('value', data => {
      const coindData = data.val();
      this.setState({ coins: values(coindData) });
    });
  };

  keyExtractor = (item: Object, index: number) => `${item.key}_${index}`;

  props: {
    banner: string,
    navigation: Object,
  };

  renderItem = (props: { item: Object }) => {  // eslint-disable-line react/no-unused-prop-types
    const {
      symbol,
      name,
      last,
      priceChgPerc,
      status,
      lastUpdatedAt,
      volume,
    } = props.item;
    return (
      <QuoteCard
        symbol={symbol}
        title={name}
        price={last}
        change={priceChgPerc}
        lastUpdatedAt={lastUpdatedAt}
        formatVol={false}
        volume={volume}
        status={status}
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

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    flex: 1,
  },
});
