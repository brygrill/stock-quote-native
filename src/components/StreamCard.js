// @flow
import React, { Component } from 'react';
import { Card, CardItem, Text, Body } from 'native-base';

export default class StreamCard extends Component {
  props: {
    title: string,
    price: string,
  };

  render() {
    const { title, price } = this.props;
    return (
      <Card style={styles.card}>
        <CardItem header>
          <Text>{title}</Text>
        </CardItem>
        <CardItem>
          <Body>
            <Text>
              {price}
            </Text>
          </Body>
        </CardItem>
      </Card>
    );
  }
}

const styles = {
  card: {
    //backgroundColor: '#eceff1',
    marginLeft: 10,
    marginRight: 10,
  },
};
