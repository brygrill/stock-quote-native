// @flow
import React, { Component } from 'react';
import { SectionList, Text, StyleSheet } from 'react-native';
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
  header: {
    marginTop: 15,
    marginLeft: 10,
    fontSize: 24,
    color: '#404040',
  },
});

const formatUSD = amount => {
  return currencyFormatter.format(amount, { code: 'USD' });
};

const formatChange = (close, price) => {
  let change = (price - close) / close;
  change *= 100;
  change = Math.round(change * 100) / 100;
  change = change.toFixed(2);
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
      queries: {
        orderByKey: 'asc',
      },
    });
  }

  keyExtractor = (item, index) => `${item.key}_${index}`;

  props: {
    banner: string,
    navigation: Object,
  };

  sectionsArr = data => {
    const sections = [
      { key: 0, title: 'Digital Assets', data: [] },
      { key: 1, title: 'US Markets', data: [] },
      { key: 2, title: 'Global Markets', data: [] },
      { key: 3, title: 'Risk Off', data: [] },
    ];

    data.map(item => {
      switch (item.category) {
        case 'Digital Assets':
          sections[0].data.push(item);
          break;
        case 'US Markets':
          sections[1].data.push(item);
          break;
        case 'Global Markets':
          sections[2].data.push(item);
          break;
        case 'Risk Off':
          sections[3].data.push(item);
          break;
        default:
          break;
      }
    });
    return sections;
  };

  renderItem = ({ item }) => {
    const { key, last, close } = item;
    const symbol = key.slice(0, 3);
    const price = formatUSD(last);
    const change = close ? formatChange(close, last) : '0.00%';
    return (
      <ListItem
        title={symbol}
        rightTitle={`${price}    ${change}`}
        leftIcon={<Entypo name="dot-single" size={32} color="#43a047" />}
        hideChevron
      />
    );
  };

  renderSectionHeader = ({ section }) => {
    return (
      <Text style={styles.header}>
        {section.title}
      </Text>
    );
  };

  render() {
    return (
      <AppContainer>
        <SectionList
          style={styles.container}
          sections={this.sectionsArr(this.state.stream)}
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          keyExtractor={this.keyExtractor}
        />
      </AppContainer>
    );
  }
}
