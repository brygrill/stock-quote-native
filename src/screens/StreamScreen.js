// @flow
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import {
  Container,
  Header,
  Content,
  Body,
  Title,
  Left,
  Right,
  Spinner,
} from 'native-base';

import currencyFormatter from 'currency-formatter';
import { base } from '../rebase';

import StreamCard from '../components/StreamCard';

const renderCards = streamArray => {
  return streamArray.map((item, index) => {
    const { key, last } = item;
    const title = key.slice(0, 3);
    const price = currencyFormatter.format(last, { code: 'USD' });
    return <StreamCard key={`${key}_${index}`} title={title} price={price} />;
  });
};

export default class HomeScreen extends Component {
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

  render() {
    const { loading } = this.state;
    return (
      <Container style={styles.container}>
        <Header style={styles.header}>
          <Body>
            <Title style={styles.title}>RealTime Quotes</Title>
          </Body>
        </Header>
        <Content style={styles.content}>
          {loading ? <Spinner /> : renderCards(this.state.stream)}
        </Content>
      </Container>
    );
  }
}

const styles = {
  container: {
    backgroundColor: '#263238',
  },
  header: {
    backgroundColor: '#eceff1',
  },
  title: {
    color: '#263238',
  },
  content: {
    paddingTop: 5,
  },
};
