/* eslint-disable prefer-arrow-callback */
/* eslint-disable new-cap */
/* eslint-disable no-console */
const admin = require('firebase-admin');
const io = require('socket.io-client');
const twilio = require('twilio');
const moment = require('moment-timezone');
const numeral = require('numeral');

const serviceAccount = require('./serviceAccountKey.json');
const secrets = require('./secrets');

// set timezone
const timeZone = 'America/New_York';

// Init Twilio
const { accountSID, authToken, from, to } = secrets.twilio;
const client = new twilio(accountSID, authToken);

// Init Websocket
const socket = new io('http://socket.coincap.io');

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('realtime/coins/coincap');

// format coin
const formatCoin = coin => {
  return coin.slice(0, 3).toLowerCase();
};

// write updates
const updateStream = (
  coin,
  last,
  lastUpdatedAt,
  perc24,
  volume,
  percDay,
  statusDay) => {
  ref
    .child(formatCoin(coin))
    .update({ last, lastUpdatedAt, perc24, volume, percDay, statusDay });
};

// read for close data
let coinCapState = null;
const readClose = () => {
  ref.on('value', snapshot => {
    coinCapState = snapshot.val();
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
  const close = coinCapState ? coinCapState[coin].close : null;
  const change = close ? numeral((last - close) / close).format('0.00%') : null;
  const status = close ? setDayStatus(close, last) : null;
  return { change, status };
};

const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

const coins = ['BTC', 'ETH', 'LTC'];

socket.on('connect', () => {
  console.log('Connected to CoinCap');
});

socket.on('disconnect', err => {
  console.log('Disconnected: ', err);
});

socket.on('error', err => {
  console.log('Error: ', err);
  sms('Error in CoinCap websocket service!');
});

socket.on('trades', trade => {
  const { message } = trade;
  if (coins.includes(message.coin)) {
    const { time, short, cap24hrChange, price, volume } = message.msg;
    const { change, status } = calcDayChange(short, price);
    const perc24 = numeral(cap24hrChange / 100).format('0.00%');
    const last = numeral(price).format('$0,0.00');
    const vol = numeral(volume).format('0,0');
    const lastUpdatedAt = moment(time).tz(timeZone).format();
    updateStream(short, last, lastUpdatedAt, perc24, vol, change, status);
  }
});

// connect to read data
readClose();
