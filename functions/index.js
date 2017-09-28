const admin = require('firebase-admin');
const functions = require('firebase-functions');
const graphqlServer = require('./graphql-server');

// Init Firebase admin
admin.initializeApp(functions.config().firebase);

const app = graphqlServer.app(admin);
exports.graphql = functions.https.onRequest(app);
