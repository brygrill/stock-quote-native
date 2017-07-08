React Native + Firebase + Firebase Functions for crypto and market quotes :moneybag:

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
~~In `services`, Docker containers connect to the data feeds and push data into Firebase. The app connects to Firebase and has access to multiple real-time feeds.~~

I didnt feel like paying to keep the server running...so I created a Firebase HTTP Function that updates the data when a request is made. 

TODO:
This is hit on a regular interval via a cron job.

### GraphQL for good measure
Its not realtime, but data is also available via a [GraphQL server](https://us-central1-quoteum-fd8e3.cloudfunctions.net/graphql/) deployed with a Firebase Function. 
