const admin = require('firebase-admin');
const functions = require('firebase-functions');
const graphqlServer = require('./graphql-server');
const pollPrices = require('./poll-prices');

// Init Firebase admin
admin.initializeApp(functions.config().firebase);

const app = graphqlServer.app(admin);
exports.graphql = functions.https.onRequest(app);

exports.prices = functions.https.onRequest((req, res) => {
  pollPrices.prices(admin);
  res.send('OK, prices updated.');
});
