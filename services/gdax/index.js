const Gdax = require('gdax');
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('stream');
const websocket = new Gdax.WebsocketClient(['ETH-USD', 'BTC-USD']);

const updateStream = (coin, last) => {
  ref.child(coin).set({ last });
};

const gdaxSocket = () => {
  websocket.on('message', data => {
    if (data.type === 'match') {
      console.log(data);
      updateStream(data.product_id, data.price);
    }
  });
};

gdaxSocket();
