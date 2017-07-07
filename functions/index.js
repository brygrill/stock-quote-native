const functions = require('firebase-functions');
const graphqlServer = require('./graphql-server');

exports.graphql = functions.https.onRequest(graphqlServer);
