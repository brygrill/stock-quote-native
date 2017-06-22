const admin = require('firebase-admin');
const axios = require('axios');
const twilio = require('twilio');
const CronJob = require('cron').CronJob;
const numeral = require('numeral');

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
const ref = db.ref('poll/securities');

// Init Axios
const { apikey } = secrets.alphavantage;
const instance = axios.create({
  baseURL: 'http://www.alphavantage.co',
});

// update firebase
const updateStream = (ticker, open, last, lastUpdatedAt, percDay, status, volume) => {
  const target = ticker.toLowerCase();
  ref.child(target).update({
    open,
    last,
    lastUpdatedAt,
    percDay,
    status,
    volume,
  });
};

// send text
const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

// format status
const setDayStatus = (perc) => {
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
const securities = ['QQQ', 'SPY', 'IWM', 'TLT'];

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
        const last = numeral(data['03. Latest Price']).format('$0,0.00');
        const open = numeral(data['04. Open (Current Trading Day)']).format('$0,0.00');
        const lastUpdatedAt = data['11. Last Updated'];
        const percDay = data['09. Price Change Percentage'];
        const status = setDayStatus(percDay);
        const volume = data['10. Volume (Current Trading Day)'];
        console.log(item);
        updateStream(item, open, last, lastUpdatedAt, percDay, status, volume);
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
        sms(`Error fetching closing price for ${item}!`);
      });
  });
};

// set cron job to run
// poll every second during market hours
const job = new CronJob({
  cronTime: '0-59 * 08-17 * * 1-5',
  onTick() {
    return fetchAllLast();
  },
  start: false,
  timeZone,
});

job.start();
