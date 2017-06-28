/* eslint-disable prefer-arrow-callback */
/* eslint-disable new-cap */
/* eslint-disable no-console */
const admin = require('firebase-admin');
const IntrinioRealtime = require('intrinio-realtime');
const twilio = require('twilio');
const moment = require('moment-timezone');
const numeral = require('numeral');
const axios = require('axios');
const CronJob = require('cron').CronJob;

const serviceAccount = require('./serviceAccountKey.json');
const secrets = require('./secrets');

// set timezone
const timeZone = 'America/New_York';

// Init Twilio
const { accountSID, authToken, from, to } = secrets.twilio;
const client = new twilio(accountSID, authToken); // eslint-disable-line new-cap

// Securities to fetch
const securities = ['QQQ', 'SPY', 'IWM', 'EFA', 'EEM', 'TLT', 'AGG', 'VXX'];

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

// ************************** WS DATA ************************** //
// connect to ws
ir.on('connect', () => {
  console.log('Connected to Intrinio');
});

// update on quote
ir.on('quote', quote => {
  const { type, ticker, price, timestamp } = quote;
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
setTimeout(() => {
  const channels = ir.listConnectedChannels();
  console.log('channels:', channels);
}, 2000);

// get current state and join channels
const readCloseAndJoin = () => {
  ref.on('value', snapshot => {
    securitiesState = snapshot.val();
    // dont join until the current state is returned
    ir.join(securities);
  });
};

// fire function to connect to read data
// and join WS
readCloseAndJoin();

// ************************** CLOSE DATA ************************** //
// Init Axios
const instance = axios.create({
  baseURL: 'https://api.intrinio.com',
  auth: secrets.intrinio,
});

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
        const closeToNum = Number(parseFloat(close).toFixed(2));
        const last = numeral(close).format('$0,0.00');
        const closeUpdateAt = moment().tz(timeZone).format();
        updateStream(item, last, closeToNum, closeUpdateAt, '0.00%', 'UNCH');
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
  onTick() {
    return fetchAllClose();
  },
  start: false,
  timeZone,
});

job.start();
