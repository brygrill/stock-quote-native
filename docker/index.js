const admin = require('firebase-admin');
const CronJob = require('cron').CronJob;
const express = require('express');

const poll = require('./fetch-prices');

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
  cronTime: '0 */5 * * * *',
  onTick() {
    return poll.prices(admin, secrets, timeZone);
  },
  start: false,
  runOnInit: true,
  timeZone,
});

runCron.start();

// Express server just to make sure container is running
const app = express();

app.get('/', (req, res) => {
  res.send('Quoteum Docker!');
});

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});
