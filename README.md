<div align="center">
  <h1>Quoteum :moneybag:</h1>
  <p>React Native + Firebase + Docker app for real-time crypto and market quotes</p>
  <img src="/app/src/assets/icons/logo_name_black_770x220.png" alt="Quoteum Logo" height="200" width="200"/>
</div>

### Crypto data:
- GDAX exchange websocket
- CoinCap websocket

### Stock Market data:
- IEX exchange via [Intrinio](https://intrinio.com/) websocket
- Realtime feed via [Alpha Vantage](https://www.alphavantage.co/)

### How it works:
The `services` folder houses Docker containers that are responsible for connecting to the data feeds and pumping the data into Firebase.

With a single Firebase connection, the app has access to multiple data feeds that update in real-time.

### Built with:
- [Expo](https://expo.io/)
- [React Navigation](https://reactnavigation.org/)

### Inspired By:
- [Lionshare](https://lionshare.capital/)
- [Exodus](https://www.exodus.io/)
- [Robinhood](https://www.robinhood.com/)
