// @flow
import React, { Component } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
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
        {`${title}:`}
        {`${price}`}
      </Text>
    );
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '90%',
          backgroundColor: '#333',
          marginHorizontal: '5%',
        }}
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
          ItemSeparatorComponent={this.renderSeparator}
        />
      </AppContainer>
    );
  }
}
