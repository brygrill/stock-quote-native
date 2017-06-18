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

const updateStream = (coin, last, lastUpdatedAt, perc24, volume) => {
  const target = coin.toLowerCase();
  ref.child(target).update({ last, lastUpdatedAt, perc24, volume });
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
  console.log('Error: ', err);
  sms('CoinCap websocket service has been disconnected!');
});

socket.on('error', err => {
  console.log('Error: ', err);
  sms('Error in CoinCap websocket service!');
});

socket.on('trades', trade => {
  const { message } = trade;
  console.log(message);
  if (coins.includes(message.coin)) {
    const { time, short, cap24hrChange, price, volume } = message.msg;
    const perc24 = numeral(cap24hrChange / 100).format('0.00%');
    const last = numeral(price).format('$0,0.00');
    const vol = numeral(volume).format('0,0');
    const lastUpdatedAt = moment(time).tz(timeZone).format();
    updateStream(short, last, lastUpdatedAt, perc24, vol);
  }
});
