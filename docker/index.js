const admin = require('firebase-admin');
const CronJob = require('cron').CronJob;

const poll = require('./fetch-prices.js');

const serviceAccount = require('./serviceAccountKey.json');
const secrets = require('./secrets');
const timeZone = 'America/New_York';

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://quoteum-fd8e3.firebaseio.com',
});

// run every 5 minutes
const runCron = new CronJob({
  cronTime: '10 * * * * *',
  onTick() {
    return poll.prices(admin, secrets, timeZone);
  },
  start: false,
  runOnInit: true,
  timeZone,
});

runCron.start();
