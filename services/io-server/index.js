/* eslint-disable new-cap */
/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

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

// Init Securities
// Securities to push out
const securities = ['QQQ', 'SPY', 'TLT'];

// Last tick for each security
let QQQ = {};
let SPY = {};
let TLT = {};

// Send SMS
const sms = body => {
  return client.messages.create({
    to,
    from,
    body,
  });
};

// ************************** FORMAT DATA ************************** //
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

const formatCurrency = data => {
  return numeral(data).format('$0,0.00');
};

const formatAlphaResp = (symbol, data) => {
  return {
    symbol,
    last: formatCurrency(data['03. Latest Price']),
    open: formatCurrency(data['04. Open (Current Trading Day)']),
    high: formatCurrency(data['05. High (Current Trading Day)']),
    low: formatCurrency(data['06. Low (Current Trading Day)']),
    priceChg: formatCurrency(data['08. Price Change']),
    priceChgPerc: data['09. Price Change Percentage'],
    status: setDayStatus(data['09. Price Change Percentage']),
    volume: numeral(data['10. Volume (Current Trading Day)']).format('0.0a').toUpperCase(),
    tickUpdatedAt: data['11. Last Updated'],
  };
};

// ************************** EMIT DATA ************************** //
// Push current data on connection
const pushLast = () => {
  io.emit('tick', [QQQ, SPY, TLT]);
};

// Function that pushes data to subscribed clients
const pushTick = (data) => {
  io.emit('tick', data);
};

// ************************** SET DATA ************************** //
// Push the tick if it changed
const setAndPushTick = (security, data) => {
  switch (security) {
    case 'QQQ':
      if (!_.isEqual(QQQ, data)) {
        // set last updated
        const lastUpdate = {
          lastUpdatedAt: moment().tz(timeZone).format(),
        };
        // set security to new data
        QQQ = data;
        // push to socket
        pushTick(_.assign({}, data, lastUpdate));
      }
      break;
    case 'SPY':
      if (!_.isEqual(SPY, data)) {
        // set last updated
        const lastUpdate = {
          lastUpdatedAt: moment().tz(timeZone).format(),
        };
        // set security to new data
        SPY = data;
        // push to socket
        pushTick(_.assign({}, data, lastUpdate));
      }
      break;
    case 'TLT':
      if (!_.isEqual(TLT, data)) {
        // set last updated
        const lastUpdate = {
          lastUpdatedAt: moment().tz(timeZone).format(),
        };
        // set security to new data
        TLT = data;
        // push to socket
        pushTick(_.assign({}, data, lastUpdate));
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
          setAndPushTick(symbol, formatAlphaResp(symbol, data));
        }
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
        sms(`Error fetching data for ${symbol}!`);
      });
  });
};

const job = new CronJob({
  //cronTime: '*/4 * 08-16 * * 1-5',
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
  pushLast();
  console.log(`User ${socket.id} connected`);
  socket.on('disconnect', reason => {
    console.log(`User ${socket.id} disconnected because ${reason}`);
  });
  socket.on('error', err => {
    console.log(`Error: ${err}`);
    sms('Alpha Vantage websocket error!');
  });
});

http.listen(3009, () => {
  console.log('Alpha Vantage Websocket Server is Running');
});
