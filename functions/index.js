const functions = require('firebase-functions');

exports.graphql = functions.https.onRequest((req, res) => {
  res.send('could this be a graphql server??');
});
