const admin = require('firebase-admin');
const IntrinioRealtime = require('intrinio-realtime');
const apikey = require('./secrets');

const ir = new IntrinioRealtime(apikey.intrinio);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('stream');

const updateStream = (ticker, last) => {
  ref.child(ticker).update({ last });
};

ir.onQuote(quote => {
  const { type, ticker, price } = quote;
  if (type === 'last') {
    updateStream(ticker, price);
  }
});

ir.join('QQQ', 'SPY');
