const admin = require('firebase-admin');
const axios = require('axios');
const twilio = require('twilio');
const moment = require('moment-timezone');
const cron = require('cron');
const find = require('lodash.find');

const serviceAccount = require('./serviceAccountKey.json');
const secrets = require('./secrets');

// set timezone
const timeZone = 'America/New_York';

// Init Twilio
const { accountSID, authToken, from, to } = secrets.twilio;
const client = new twilio(accountSID, authToken); // eslint-disable-line new-cap

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('realtime/coins');

// Init Axios
const instanceGdax = axios.create({
  baseURL: 'https://api.gdax.com',
});

// update firebase
const updateStream = (exch, coin, close, closeUpdateAt) => {
  const target = coin.slice(0, 3).toLowerCase();
  ref.child(`${exch}/${target}`).update({ close, closeUpdateAt });
};

// send text
const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

// fetch GDAX close data
const coinsGdax = ['BTC-USD', 'ETH-USD', 'LTC-USD'];

const fetchCloseGdax = coin => {
  return instanceGdax
    .get(`/products/${coin}/ticker`, {})
    .then(data => {
      return data.data;
    })
    .catch(err => {
      return err;
    });
};

const fetchAllCloseGdax = () => {
  coinsGdax.map(item => {
    return fetchCloseGdax(item)
      .then(data => {
        const { price, time } = data;
        const priceToNum = Number(parseFloat(price).toFixed(2));
        const closeUpdateAt = moment(time).tz(timeZone).format();
        updateStream('gdax', item, priceToNum, closeUpdateAt);
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
        sms(`Error fetching closing price for ${item}!`);
      });
  });
};

// Fetch CoinCap Close Data
const coinsCoinCap = ['BTC', 'ETH', 'LTC'];

const fetchCloseCoinCap = () => {
  return axios
    .get('http://www.coincap.io/front', {})
    .then(data => {
      return data.data;
    })
    .catch(err => {
      return err;
    });
};

const fetchAllCloseCoinCap = () => {
  return fetchCloseCoinCap()
    .then(data => {
      coinsCoinCap.map(item => {
        const coinRecord = find(data, coin => {
          return coin.short === item;
        });
        const { price, time } = coinRecord;
        const priceToNum = Number(parseFloat(price).toFixed(2));
        const closeUpdateAt = moment(time).tz(timeZone).format();
        updateStream('coincap', item, priceToNum, closeUpdateAt);
      });
    })
    .catch(err => {
      console.log('Error: ', err); // eslint-disable-line
      sms('Error fetching closing price for CoinCap!');
    });
};

// set cron job to run
// everyday at 12:00 EST
const job = new cron.CronJob({
  cronTime: '00 00 00 * * *',
  onTick() {
    fetchAllCloseGdax();
    fetchAllCloseCoinCap();
  },
  start: false,
  timeZone,
});

job.start();
