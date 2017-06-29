/* eslint-disable prefer-arrow-callback */
/* eslint-disable new-cap */
/* eslint-disable no-console */
const admin = require('firebase-admin');
const io = require('socket.io-client');
const axios = require('axios');
const twilio = require('twilio');
const moment = require('moment-timezone');
const numeral = require('numeral');
const cron = require('cron');
const find = require('lodash.find');

const serviceAccount = require('./serviceAccountKey.json');
const secrets = require('./secrets');

// Set coins
const coins = ['BTC', 'ETH', 'LTC'];

// Set timezone
const timeZone = 'America/New_York';

// Init Twilio
const { accountSID, authToken, from, to } = secrets.twilio;
const client = new twilio(accountSID, authToken);

// Init Websocket
const socket = new io('http://socket.coincap.io');

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

const db = admin.database();
const ref = db.ref('feed/coincap');

// Format Coin
const formatCoin = coin => {
  return coin.slice(0, 3).toLowerCase();
};

// ************************** WRITE UPDATES ************************** //
// write ws updates
const updateStream = (
  coin,
  last,
  lastUpdatedAt,
  volume,
  priceChgPerc,
  priceChg,
  statusDay) => {
  ref
    .child(formatCoin(coin))
    .update({ last, lastUpdatedAt, volume, priceChgPerc, priceChg, statusDay });
};

// write open updates
// set open, high and low to current price
const updateOpen = (coin, open, high, low, openUpdateAt) => {
  ref.child(formatCoin(coin)).update({
    open,
    high,
    low,
    openUpdateAt,
  });
};

// ************************** READ OPEN ************************** //
// read for open data
let coinCapState = null;
const readOpen = () => {
  ref.on('value', snapshot => {
    coinCapState = snapshot.val();
  });
};

// ************************** FORMAT DATA ************************** //
// set change status
const setDayStatus = (open, last) => {
  let status = null;
  if (last > open) {
    status = 'UP';
  } else if (last < open) {
    status = 'DOWN';
  } else if (last === open) {
    status = 'UNCH';
  } else {
    status = '--';
  }
  return status;
};

// calc change
const calcDayChange = (productID, last) => {
  const coin = formatCoin(productID);
  const open = coinCapState ? coinCapState[coin].open : null;
  const priceChgPerc = open ? numeral((last - open) / open).format('0.00%') : '--';
  const priceChg = open ? numeral(last - open).format('$0,0.00') : '--';
  const status = open ? setDayStatus(open, last) : '--';
  return { priceChgPerc, priceChg, status };
};

// ************************** SMS ************************** //
// set last sent to null at script start
let lastSentTime = null;

// only send msg every 5 minutes
const smsLastSent = lastSent => {
  // duration will return minutes since last sent as a negative num
  if (lastSentTime) {
    const sinceLastSent = moment.duration(lastSent.diff(moment())).asMinutes();
    if (sinceLastSent < -5) return true;
    return false;
  }
  return false;
};

// send text
const sms = body => {
  if (smsLastSent(lastSentTime)) {
    // reset last sent
    lastSentTime = moment();
    // send msg
    client.messages.create({
      to,
      from,
      body,
    });
  }
};

// ************************** WS DATA ************************** //

socket.on('connect', () => {
  console.log('Connected to CoinCap');
});

socket.on('disconnect', err => {
  console.log('Disconnected: ', err);
});

socket.on('error', err => {
  console.log('Error: ', err);
  sms('Error in CoinCap websocket service!');
});

socket.on('trades', trade => {
  const { message } = trade;
  if (coins.includes(message.coin)) {
    console.log(message.msg);
    const { time, short, price, usdVolume } = message.msg;
    const { priceChgPerc, priceChg, status } = calcDayChange(short, price);
    const last = numeral(price).format('$0,0.00');
    const vol = numeral(usdVolume).format('($0.00a)').toUpperCase();
    const lastUpdatedAt = moment(time).tz(timeZone).format();
    updateStream(short, last, lastUpdatedAt, vol, priceChgPerc, priceChg, status);
  }
});

// connect to read data
readOpen();

// ************************** OPEN DATA ************************** //
const fetchOpen = () => {
  return axios
    .get('http://www.coincap.io/front', {})
    .then(data => {
      return data.data;
    })
    .catch(err => {
      return err;
    });
};

const fetchAllOpen = () => {
  return fetchOpen()
    .then(data => {
      coins.map(item => {
        const coinRecord = find(data, coin => {
          return coin.short === item;
        });
        const { price } = coinRecord;
        const priceToNum = Number(parseFloat(price).toFixed(2));
        const openUpdateAt = moment().tz(timeZone).format();
        return updateOpen(item, priceToNum, '--', '--', openUpdateAt);
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
  //cronTime: '00 00 00 * * *',
  cronTime: '* * * * * *',
  onTick() {
    fetchAllOpen();
  },
  start: false,
  timeZone,
});

job.start();
