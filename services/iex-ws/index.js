const admin = require('firebase-admin');
const IntrinioRealtime = require('intrinio-realtime');
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
const ir = new IntrinioRealtime(secrets.intrinio);

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('realtime/securities');

const updateStream = (ticker, last, lastUpdatedAt) => {
  const target = ticker.toLowerCase();
  ref.child(target).update({ last, lastUpdatedAt });
};

const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

ir.onQuote(quote => {
  const { type, ticker, price, timestamp } = quote;
  if (type === 'last') {
    const lastUpdatedAt = moment(timestamp * 1000).tz(timeZone).format();
    updateStream(ticker, price, lastUpdatedAt);
  }
});

ir.onError(err => {
  console.log('Error: ', err); // eslint-disable-line
  sms('Error in Intrinio websocket service!');
});

ir.join('QQQ', 'SPY', 'IWM', 'EFA', 'EEM', 'TLT', 'AGG', 'VXX');
