/* eslint-disable prefer-arrow-callback */
const admin = require('firebase-admin');
const WebSocket = require('ws');
const twilio = require('twilio');
const moment = require('moment-timezone');

const serviceAccount = require('./serviceAccountKey.json');
const secrets = require('./secrets');

// set timezone
const timeZone = 'America/New_York';

// Init Twilio
const { accountSID, authToken, from, to } = secrets.twilio;
const client = new twilio(accountSID, authToken); // eslint-disable-line new-cap

// Init Websocket
const ws = new WebSocket('wss://ws-feed.gdax.com');

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('realtime/coins/gdax');

const updateStream = (coin, last, lastUpdatedAt) => {
  target = coin.slice(0, 3).toLowerCase();
  ref.child(target).update({ last, lastUpdatedAt });
};

const pinger = () => {
  return setInterval(() => {
    ws.ping('keepalive');
  }, 30000);
};

const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

const query = {
  type: 'subscribe',
  product_ids: ['BTC-USD', 'ETH-USD'],
};

ws.on('open', function open() {
  ws.send(JSON.stringify(query));
  pinger();
  sms();
});

ws.on('message', function incoming(data) {
  const parsed = JSON.parse(data);
  if (parsed.type === 'match') {
    const { price, time, product_id } = parsed;
    const priceToNum = Number(parseFloat(price).toFixed(2));
    const lastUpdatedAt = moment(time).tz(timeZone).format();
    updateStream(product_id, priceToNum, lastUpdatedAt);
  }
});

ws.on('close', function close() {
  clearInterval(pinger);
  sms('GDAX websocket service has been closed!');
});

ws.on('error', function error(err) {
  console.log('Error: ', err); // eslint-disable-line
  sms('Error in GDAX websocket service!');
});
