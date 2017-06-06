// @flow
import React, { Component } from 'react';
import {
  Container,
  Header,
  Content,
  Card,
  CardItem,
  Text,
  Body,
  Button,
  Left,
  Right,
  Icon,
  Title,
} from 'native-base';

export default class HomeScreen extends Component {
  props: {
    btc: string,
    eth: string,
  };
  render() {
    const { btc, eth } = this.props;
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body>
            <Title>Quoteum</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Card>
            <CardItem header>
              <Text>Realtime Quote Stream</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                  {`BTC-USD: $ ${btc}`}
                </Text>
                <Text>
                  {`ETH-USD: $ ${eth}`}
                </Text>
              </Body>
            </CardItem>
            <CardItem header>
              <Text>via GDAX</Text>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
  }
}
