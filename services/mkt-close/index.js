const admin = require('firebase-admin');
const axios = require('axios');
const twilio = require('twilio');
const moment = require('moment-timezone');
const CronJob = require('cron').CronJob;

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
const ref = db.ref('stream');

// Init Axios
const instance = axios.create({
  baseURL: 'https://api.intrinio.com',
  auth: secrets.intrinio,
});

// update firebase
const updateStream = (ticker, close) => {
  ref.child(ticker).update({ close });
};

// send text
const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

// get last business day
const getYesterday = () => {
  switch (moment().day()) {
    // thanks: http://bit.ly/2s8Nm5n
    case 0:
    case 1:
    case 6:
      return moment()
        .tz(timeZone)
        .subtract(6, 'days')
        .day(5)
        .format('YYYY-MM-DD');
    default:
      return moment().tz(timeZone).subtract(1, 'day').format('YYYY-MM-DD');
  }
};

// fetch close data
const securities = ['QQQ', 'SPY', 'IWM', 'EFA', 'EEM', 'TLT', 'AGG', 'VXX'];

const fetchClose = identifier => {
  return instance
    .get('/prices', {
      params: {
        identifier,
        start_date: getYesterday(),
        end_date: getYesterday(),
      },
    })
    .then(data => {
      const { close } = data.data.data[0];
      return close;
    })
    .catch(err => {
      return err;
    });
};

const fetchAllClose = () => {
  securities.map(item => {
    return fetchClose(item)
      .then(close => {
        updateStream(item, close);
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
        sms(`Error fetching closing price for ${item}!`);
      });
  });
};

// set cron job to run
// every weekday at 7am
const job = new CronJob({
  cronTime: '00 00 07 * * 1-5',
  onTick: fetchAllClose(),
  timeZone,
});

job.start();
