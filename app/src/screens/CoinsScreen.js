// @flow
import React, { Component } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import values from 'lodash.values';

import AppContainer from '../containers/AppContainer';

import fire from '../firebase';

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
    coins.on('value', (data) => {
      const coindData = data.val();
      console.log(coindData);
      this.setState({ coins: values(coindData) });
    })
  }

  keyExtractor = (item, index) => `${item.key}_${index}`;

  props: {
    banner: string,
    navigation: Object,
  };

  renderItem = ({ item }) => {
    const { symbol, last, percDay } = item;
    return (
      <View style={styles.row}>
        <Text style={styles.rowTitle}>{symbol}</Text>
        <View style={styles.rowStats}>
          <Text style={styles.rowStatsPrice}>{last}</Text>
          <Text style={styles.rowStatsChange}>{percDay}</Text>
        </View>
      </View>
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
