/* eslint-disable prefer-arrow-callback */
/* eslint-disable new-cap */
/* eslint-disable no-console */
const admin = require('firebase-admin');
const IntrinioRealtime = require('intrinio-realtime');
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
const ir = new IntrinioRealtime(secrets.intrinio);

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('realtime/securities');

// format coin
const formatTicker = ticker => {
  return ticker.slice(0, 3).toLowerCase();
};

// write updates
const updateStream = (ticker, last, lastUpdatedAt, percDay, statusDay) => {
  ref.child(formatTicker(ticker)).update({ last, lastUpdatedAt, percDay, statusDay });
};

// read for close data
let securitiesState = null;

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
  const ticker = formatTicker(productID);
  const close = securitiesState ? securitiesState[ticker].close : null;
  const change = close ? numeral((last - close) / close).format('0.00%') : null;
  const status = close ? setDayStatus(close, last) : null;
  return { change, status };
};

// send message
const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

// connect to ws
ir.on('connect', () => {
  console.log('Connected to Intrinio');
});

// update on quote
ir.on('quote', quote => {
  const { type, ticker, price, timestamp } = quote;
  console.log(quote);
  if (type === 'last') {
    const { change, status } = calcDayChange(ticker, price);
    const last = numeral(price).format('$0,0.00');
    const lastUpdatedAt = moment(timestamp * 1000).tz(timeZone).format();
    updateStream(ticker, last, lastUpdatedAt, change, status);
  }
});

// handle err
ir.on('error', err => {
  console.log('Error: ', err); // eslint-disable-line
  sms('Error in Intrinio websocket service!');
});

// list channels
setTimeout(function() {
  const channels = ir.listConnectedChannels()
  console.log('channels:', channels);
}, 2000);

// get current state and join channels
const readCloseAndJoin = () => {
  ref.on('value', snapshot => {
    securitiesState = snapshot.val();
    // dont join until the current state is returned
    ir.join('QQQ', 'SPY', 'IWM', 'EFA', 'EEM', 'TLT', 'AGG', 'VXX');
  });
};

// fire function to connect to read data
// and join WS
readCloseAndJoin();
