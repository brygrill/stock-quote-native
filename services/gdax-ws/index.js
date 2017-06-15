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
const ref = db.ref('stream');

const updateStream = (coin, last, updatedAt) => {
  ref.child(coin).update({ last, updatedAt });
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
    const { price, time } = parsed;
    const priceToNum = parseFloat(price).toFixed(2);
    const updatedAt = moment(time).tz(timeZone).format();
    updateStream(parsed.product_id, Number(priceToNum), updatedAt);
  }
});

ws.on('close', function close() {
  clearInterval(pinger);
  sms('GDAX websocket service disconnected!');
});

ws.on('error', function error(err) {
  console.log('Error: ', err); // eslint-disable-line
  sms('Error in GDAX websocket service!');
});
