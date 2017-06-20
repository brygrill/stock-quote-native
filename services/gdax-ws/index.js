/* eslint-disable prefer-arrow-callback */
const admin = require('firebase-admin');
const WebSocket = require('ws');
const twilio = require('twilio');
const moment = require('moment-timezone');
const numeral = require('numeral');

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

// format coin
const formatCoin = coin => {
  return coin.slice(0, 3).toLowerCase();
};

// write updates
const updateStream = (coin, last, lastUpdatedAt, percDay, statusDay) => {
  ref
    .child(formatCoin(coin))
    .update({ last, lastUpdatedAt, percDay, statusDay });
};

// read for close data
let gdaxState = null;
const readClose = () => {
  ref.on('value', snapshot => {
    gdaxState = snapshot.val();
  });
};

// set change status
const setDayStatus = (close, last) => {
  let status = null;
  if (last > close) {
    status = 'UP';
  } else if (last < close) {
    status = 'DOWN';
  } else if (last === close) {
    status = 'UNCH';
  }
  return status;
};

// calc change
const calcDayChange = (productID, last) => {
  const coin = formatCoin(productID);
  const close = gdaxState ? gdaxState[coin].close : null;
  const change = close ? numeral((last - close) / close).format('0.00%') : null;
  const status = close ? setDayStatus(close, last) : null;
  return { change, status };
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
  product_ids: ['BTC-USD', 'ETH-USD', 'LTC-USD'],
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
    const { change, status } = calcDayChange(product_id, price);
    const last = numeral(price).format('$0,0.00');
    const lastUpdatedAt = moment(time).tz(timeZone).format();
    updateStream(product_id, last, lastUpdatedAt, change, status);
  }
});

ws.on('close', function close() {
  clearInterval(pinger);
});

ws.on('error', function error(err) {
  console.log('Error: ', err); // eslint-disable-line
  sms('Error in GDAX websocket service!');
});

// connect to read data
readClose();
