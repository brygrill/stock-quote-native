const admin = require('firebase-admin');
const axios = require('axios');
const twilio = require('twilio');
const moment = require('moment-timezone');
const CronJob = require('cron').CronJob;
const numeral = require('numeral');
const isEmpty = require('lodash.isempty');

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
const ref = db.ref('feed/alpha-vantage');

// Init Axios
const { apikey } = secrets.alphavantage;
const instance = axios.create({
  baseURL: 'http://www.alphavantage.co',
});

// update firebase
const updateStream = (
  ticker,
  open,
  high,
  low,
  last,
  tickUpdatedAt,
  lastUpdatedAt,
  priceChg,
  priceChgPerc,
  status,
  volume) => {
  const target = ticker.toLowerCase();
  ref.child(target).update({
    open,
    high,
    low,
    last,
    tickUpdatedAt,
    lastUpdatedAt,
    priceChg,
    priceChgPerc,
    status,
    volume,
  });
};

// only send msg every 5 minutes
const smsLastSent = lastSent => {
  // duration will return minutes since last sent as a negative num
  const sinceLastSent = moment.duration(lastSent.diff(moment())).asMinutes();
  if (sinceLastSent < -5) return true;
  return false;
};

// send text
const sms = body => {
  // set lastSent to script start
  let lastSent = moment();
  if (smsLastSent(lastSent)) {
    // reset last sent
    lastSent = moment();
    // send msg
    client.messages.create({
      to,
      from,
      body,
    });
  }
};

// format status
const setDayStatus = perc => {
  let status = null;
  const change = parseFloat(perc);
  if (change > 0) {
    status = 'UP';
  } else if (change < 0) {
    status = 'DOWN';
  } else if (change === 0) {
    status = 'UNCH';
  }
  return status;
};

// fetch close data
const securities = ['QQQ', 'SPY', 'TLT'];

const fetchLast = symbol => {
  return instance
    .get('/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey,
      },
    })
    .then(data => {
      return data.data['Realtime Global Securities Quote'];
    })
    .catch(err => {
      return err;
    });
};

const fetchAllLast = () => {
  securities.map(item => {
    return fetchLast(item)
      .then(data => {
        if (!isEmpty(data)) {
          console.log(data);
          const last = numeral(data['03. Latest Price']).format('$0,0.00');
          const open = numeral(data['04. Open (Current Trading Day)']).format('$0,0.00');
          const high = numeral(data['05. High (Current Trading Day)']).format('$0,0.00');
          const low = numeral(data['06. Low (Current Trading Day)']).format('$0,0.00');
          const lastUpdatedAt = moment().tz(timeZone).format();
          const tickUpdatedAt = data['11. Last Updated'];
          const priceChg = numeral(data['08. Price Change']).format('$0,0.00');
          const priceChgPerc = data['09. Price Change Percentage'];
          const status = setDayStatus(priceChgPerc);
          const volume = numeral(data['10. Volume (Current Trading Day)']).format('0.0a').toUpperCase();
          updateStream(
            item,
            open,
            high,
            low,
            last,
            tickUpdatedAt,
            lastUpdatedAt,
            priceChg,
            priceChgPerc,
            status,
            volume);
        }
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
        sms(`Error fetching closing price for ${item}!`);
      });
  });
};

// set cron job to run
// poll every few second during market hours
const job = new CronJob({
  //cronTime: '*/4 * 08-17 * * 1-5',
  cronTime: '*/4 * * * * *',
  onTick() {
    return fetchAllLast();
  },
  start: false,
  timeZone,
});

job.start();
