/* eslint-disable prefer-arrow-callback */

const admin = require('firebase-admin');
const axios = require('axios');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('stream');

const updateStream = (coin, last) => {
  ref.child(coin).update({ last });
};

const fetchHistory = () => {
  axios.get('http://www.coincap.io/history/1day/BTC').then(data => {
    console.log(data.data.price[0]);
    console.log(data.data.price[data.data.price.length - 1]);
  });
};

const fetchPage = () => {
  axios.get('http://www.coincap.io/page/BTC').then(data => {
    console.log(data.data);
  });
};

const fetchGdaxHistorical = () => {
  axios.get('https://api.gdax.com/products/btc-usd/stats').then(data => {
    console.log(data.data);
  });
};

const fetchGdaxCandles = () => {
  axios
    .get('https://api.gdax.com/products/btc-usd/candles', {
      params: {
        start: '2017-06-12T23:59:00.000Z',
        end: '2017-06-13T00:01:00.000Z',
        granularity: 500,
      },
    })
    .then(data => {
      console.log(data.data);
      process.exit();
    })
    .catch(err => {
      console.log(err);
      process.exit();
    });
};

//fetchHistory();

//fetchPage();

//fetchGdaxHistorical();

fetchGdaxCandles();
