/* eslint-disable new-cap */
const express = require('express');
const axios = require('axios');
const twilio = require('twilio');
const _ = require('lodash');
const CronJob = require('cron').CronJob;
const numeral = require('numeral');
const moment = require('moment-timezone');

// Init Server
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Import secrets
const secrets = require('./secrets');

// Set timezone
const timeZone = 'America/New_York';

// Init Twilio
const { accountSID, authToken, from, to } = secrets.twilio;
const client = new twilio(accountSID, authToken);

// Init Axios
const { apikey } = secrets.alphavantage;
const instance = axios.create({
  baseURL: 'http://www.alphavantage.co',
});
// ************************** FORMAT DATA ************************** //

// ************************** SET DATA ************************** //
const securities = ['QQQ', 'SPY', 'TLT'];
let QQQ = {};
let SPY = {};
let TLT = {};

const pushTick = (data) => {
  io.emit('tick', data);
};

const setAndPushTick = (security, data) => {
  switch (security) {
    case 'QQQ':
      if (!_.isEqual(QQQ, data)) {
        console.log(QQQ);
        console.log(data);
        console.log();
        QQQ = data;
        pushTick(data);
      }
      break;
    case 'SPY':
      if (!_.isEqual(SPY, data)) {
        SPY = data;
        pushTick(data);
      }
      break;
    case 'TLT':
      if (!_.isEqual(TLT, data)) {
        TLT = data;
        pushTick(data);
      }
      break;
    default:
      break;
  }
};

// ************************** FETCH DATA ************************** //
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
  securities.map(symbol => {
    return fetchLast(symbol)
      .then(data => {
        if (!_.isEmpty(data)) {
          //console.log(data);
          const last = numeral(data['03. Latest Price']).format('$0,0.00');
          const open = numeral(data['04. Open (Current Trading Day)']).format('$0,0.00');
          const high = numeral(data['05. High (Current Trading Day)']).format('$0,0.00');
          const low = numeral(data['06. Low (Current Trading Day)']).format('$0,0.00');

          const tickUpdatedAt = data['11. Last Updated'];
          const priceChg = numeral(data['08. Price Change']).format('$0,0.00');
          const priceChgPerc = data['09. Price Change Percentage'];
          const volume = numeral(data['10. Volume (Current Trading Day)']).format('0.0a').toUpperCase();

          const formattedData = {
            symbol,
            open,
            high,
            low,
            last,
            tickUpdatedAt,
            priceChg,
            priceChgPerc,
            volume,
          };

          setAndPushTick(symbol, formattedData);
        }
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
      });
  });
};

const job = new CronJob({
  //cronTime: '*/4 * 08-17 * * 1-5',
  cronTime: '*/1 * * * * *',
  onTick() {
    return fetchAllLast();
  },
  start: false,
  timeZone,
});

job.start();

// ************************** SERVER ************************** //
app.get('/', (req, res) => {
  res.json({
    service: 'Alpha Vantage WebSocket',
    data: ['QQQ', 'SPY', 'TLT'],
  });
});

io.on('connection', socket => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3009, () => {
  console.log('Example app listening on port 3009!');
});
