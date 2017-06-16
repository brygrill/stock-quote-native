const admin = require('firebase-admin');
const axios = require('axios');
const twilio = require('twilio');
const moment = require('moment-timezone');
const cron = require('cron');

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
const ref = db.ref('realtime/coins/gdax');

// Init Axios
const instance = axios.create({
  baseURL: 'https://api.gdax.com',
});

// update firebase
const updateStream = (coin, close, closeUpdateAt) => {
  const target = coin.slice(0, 3).toLowerCase();
  ref.child(target).update({ close, closeUpdateAt });
};

// send text
const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

// fetch close data
const coins = ['BTC-USD', 'ETH-USD'];

const fetchClose = coin => {
  return instance
    .get(`/products/${coin}/ticker`, {})
    .then(data => {
      return data.data;
    })
    .catch(err => {
      return err;
    });
};

const fetchAllClose = () => {
  coins.map(item => {
    return fetchClose(item)
      .then(data => {
        const { price, time } = data;
        const priceToNum = Number(parseFloat(price).toFixed(2));
        const closeUpdateAt = moment(time).tz(timeZone).format();
        updateStream(item, priceToNum, closeUpdateAt);
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
        sms(`Error fetching closing price for ${item}!`);
      });
  });
};

// set cron job to run
// everyday at 12:00 EST
const job = new cron.CronJob({
  cronTime: '00 00 00 * * *',
  onTick() {
    return fetchAllClose();
  },
  start: false,
  timeZone,
});

job.start();
