const admin = require('firebase-admin');
const IntrinioRealtime = require('intrinio-realtime');
const twilio = require('twilio');

const serviceAccount = require('./serviceAccountKey.json');
const secrets = require('./secrets');

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
const ref = db.ref('stream');

const updateStream = (ticker, last, updatedAt) => {
  ref.child(ticker).update({ last, updatedAt });
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
    const updatedAt = new Date(timestamp * 1000).toISOString();
    updateStream(ticker, price, updatedAt);
  }
});

ir.onError(err => {
  console.log('Error: ', err); // eslint-disable-line
  sms('Error in Intrinio websocket service!');
});

ir.join('QQQ', 'SPY', 'IWM', 'EFA', 'EEM', 'TLT', 'AGG', 'VXX');
