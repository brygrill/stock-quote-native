const admin = require('firebase-admin');
const WebSocket = require('ws');

const ws = new WebSocket('wss://ws-feed.gdax.com');
const serviceAccount = require('./serviceAccountKey.json');

let start = null;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('stream');

const updateStream = (coin, last) => {
  ref.child(coin).set({ last });
};

const pinger = () => {
  return setInterval(() => {
    ws.ping('keepalive');
  }, 30000);
};

const elapsed = () => {
  const end = Date.now();
  const elapsed = end - start;
  console.log('Ended:', end);
  console.log('Elapsed', elapsed);
};

const query = {
  type: 'subscribe',
  product_ids: ['BTC-USD', 'ETH-USD'],
};

ws.on('open', function open() {
  ws.send(JSON.stringify(query));
  start = Date.now();
  console.log('Started: ', start);
  pinger();
});

ws.on('message', function incoming(data) {
  const parsed = JSON.parse(data);
  if (parsed.type === 'match') {
    updateStream(parsed.product_id, parsed.price);
  }
});

ws.on('close', function close() {
  console.log('Disconnected');
  elapsed();
  clearInterval(pinger);
});

ws.on('error', function error(err) {
  elapsed();
  console.log('Error: ', err);
});
