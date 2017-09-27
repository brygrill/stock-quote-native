// @flow
import React, { Component } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import moment from 'moment';
import numeral from 'numeral';

export default class RealtimeScreen extends Component {
  props: {
    symbol: string,
    title: string,
    price: string,
    change: string,
    lastUpdatedAt: string,
    formatVol: boolean,
    volume: string,
  };

  render() {
    const {
      symbol,
      title,
      price,
      change,
      volume,
      formatVol,
      lastUpdatedAt,
    } = this.props;
    const last = moment(lastUpdatedAt).format('M-D-YY h:mm A');
    const cardColor = setCardColor(change);
    const volHuman = formatVol ? numeral(volume).format('0.0a').toUpperCase(): volume;
    return (
      <View style={[styles.container, cardColor]}>
        <View style={styles.symbol}>
          <Text style={styles.symbolText}>{symbol}</Text>
        </View>
        <View style={[styles.status, styles.padTop10]}>
          <Text style={styles.labelText}>PRICE</Text>
          <Text style={styles.labelText}>DAY</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>{price}</Text>
          <Text style={styles.statusText}>{change}</Text>
        </View>
        <View style={[styles.status, styles.padTop]}>
          <Text style={styles.labelText}>COIN</Text>
          <Text style={styles.labelText}>VOL</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>{title}</Text>
          <Text style={styles.statusText}>{volHuman}</Text>
        </View>
        <View style={[styles.status, styles.padTop]}>
          <Text style={styles.labelText}>LAST</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>{last}</Text>
        </View>
      </View>
    );
  }
}

const setCardColor = perc => {
  const percNum = numeral(perc).value();
  if (percNum > 0) {
    return styles.dayUp;
  } else if (percNum < 0) {
    return styles.dayDown;
  }
  return styles.dayUnch;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    flex: 1,
    backgroundColor: '#e6e6e6',
  },
  symbol: {
    borderBottomWidth: 1,
    borderColor: '#000',
    marginHorizontal: 15,
  },
  symbolText: {
    fontWeight: '200',
    fontSize: 35,
    textAlign: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '300',
    paddingBottom: 5,
  },
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '300',
    color: '#222'
  },
  statusText: {
    fontSize: 18,
    fontWeight: '300',
  },
  padTop: {
    paddingTop: 6,
  },
  padTop10: {
    paddingTop: 10,
  },
  dayUp: {
    backgroundColor: '#00B16A',
  },
  dayDown: {
    backgroundColor: '#D64541'
  },
  dayUnch: {
    backgroundColor: '#e6e6e6'
  }
});
