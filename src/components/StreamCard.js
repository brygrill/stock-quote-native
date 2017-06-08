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
      <Card>
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
