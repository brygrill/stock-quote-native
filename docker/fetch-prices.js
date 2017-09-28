/* eslint-disable prefer-arrow-callback */
/* eslint-disable new-cap */
/* eslint-disable no-console */
const axios = require('axios');
const moment = require('moment-timezone');
const numeral = require('numeral');
const find = require('lodash.find');
const isEmpty = require('lodash.isempty');

exports.prices = admin => {
  // connect to db
  const db = admin.database();
  const ref = db.ref('poll');

  // Set coins
  const coins = ['BTC', 'ETH', 'LTC'];
  const securities = ['QQQ', 'SPY', 'TLT'];

  // Set timezone
  const timeZone = 'America/New_York';

  // Init Axios
  const apikey = 'ANNM';
  const alphaInstance = axios.create({
    baseURL: 'http://www.alphavantage.co',
  });

  const coinInstance = axios.create({
    baseURL: 'http://www.coincap.io/',
  });

  const updateFeed = (
    source,
    ticker,
    open,
    high,
    low,
    last,
    tickUpdatedAt,
    lastUpdatedAt,
    priceChg,
    priceChgPerc,
    volume) => {
    const target = ticker.toLowerCase();
    ref.child(`${source}/${target}`).update({
      open,
      high,
      low,
      last,
      tickUpdatedAt,
      lastUpdatedAt,
      priceChg,
      priceChgPerc,
      volume,
    });
  };

  const fetchCoins = () => {
    return coinInstance
      .get('/front', {})
      .then(data => {
        return data.data;
      })
      .catch(err => {
        return err;
      });
  };

  const fetchSecurity = symbol => {
    return alphaInstance
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

  const fetchCoinsAll = () => {
    return fetchCoins()
      .then(data => {
        coins.map(item => {
          const coinRecord = find(data, coin => {
            return coin.short === item;
          });
          const { price, perc, time, usdVolume } = coinRecord;
          const last = numeral(price).format('$0,0.00');
          const priceChgPerc = numeral(perc / 100).format('0.00%');
          const lastUpdatedAt = moment(time).tz(timeZone).format();
          const volume = numeral(usdVolume).format('($0.00a)').toUpperCase();
          updateFeed(
            'coins',
            item,
            null,
            null,
            null,
            last,
            null,
            lastUpdatedAt,
            null,
            priceChgPerc,
            volume);
        });
      })
      .catch(err => {
        console.log('Error: ', err); // eslint-disable-line
      });
  };

  const fetchSecuritiesAll = () => {
    securities.map(item => {
      return fetchSecurity(item)
        .then(data => {
          if (!isEmpty(data)) {
            const last = numeral(data['03. Latest Price']).format('$0,0.00');
            const open = numeral(data['04. Open (Current Trading Day)']).format('$0,0.00');
            const high = numeral(data['05. High (Current Trading Day)']).format('$0,0.00');
            const low = numeral(data['06. Low (Current Trading Day)']).format('$0,0.00');
            const lastUpdatedAt = moment().tz(timeZone).format();
            const tickUpdatedAt = data['11. Last Updated'];
            const priceChg = numeral(data['08. Price Change']).format('$0,0.00');
            const priceChgPerc = data['09. Price Change Percentage'];
            const volume = numeral(data['10. Volume (Current Trading Day)'])
              .format('0.0a')
              .toUpperCase();
            updateFeed(
              'securities',
              item,
              open,
              high,
              low,
              last,
              tickUpdatedAt,
              lastUpdatedAt,
              priceChg,
              priceChgPerc,
              volume);
          }
        })
        .catch(err => {
          console.log('Error: ', err); // eslint-disable-line
        });
    });
  };

  fetchCoinsAll();
  fetchSecuritiesAll();
};
