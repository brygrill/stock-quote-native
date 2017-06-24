<div align="center">
  <img src="/app/src/assets/icons/logo_name_black_770x220.png" alt="Quoteum Logo" height="220" width="770"/>
  <p>React Native + Firebase + Docker app for real-time crypto and market quotes :moneybag:</p>
</div>

### Crypto data:
- [GDAX exchange](https://docs.gdax.com/) websocket
- [CoinCap](https://github.com/CoinCapDev/CoinCap.io) websocket

### Stock Market data:
- IEX exchange via [Intrinio](https://intrinio.com/) websocket
- Realtime feed via [Alpha Vantage](https://www.alphavantage.co/)

### Built with:
- [Expo](https://expo.io/)
- [React Navigation](https://reactnavigation.org/)

### Inspired By:
- [Lionshare](https://lionshare.capital/)
- [Exodus](https://www.exodus.io/)
- [Robinhood](https://www.robinhood.com/)

### How it works
Docker containers connect to the data feeds and push into Firebase. The app connects to Firebase and has access to multiple real-time feeds.

### GraphQL for good measure
Its not realtime, but data is also available via a [GraphQL server](https://us-central1-quoteum-fd8e3.cloudfunctions.net/graphql/) deployed with a Firebase Function. 
