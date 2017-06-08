// @flow
import React, { Component } from 'react';
import {
  Container,
  Header,
  Content,
  Body,
  Left,
  Right,
  Spinner,
} from 'native-base';

import currencyFormatter from 'currency-formatter';
import { base } from '../rebase';

import StreamCard from '../components/StreamCard';

const renderStream = streamArray => {
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
      <Container>
        <Header>
          <Left />
          <Body />
          <Right />
        </Header>
        <Content>
          {loading ? <Spinner /> : renderStream(this.state.stream)}
        </Content>
      </Container>
    );
  }
}
