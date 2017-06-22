const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const values = require('lodash.values');
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');

// Init express
const app = express();

// Init Firebase admin
admin.initializeApp(functions.config().firebase);

// connect to db
const db = admin.database();
const ref = db.ref('poll/securities');

// fetch data
let securitiesArr = [];
ref.on('value', snapshot => {
  const securitiesData = snapshot.val();
  securitiesArr = values(securitiesData);
});

// Construct Securities Type
const SecurityType = new GraphQLObjectType({
  name: 'Security',
  description: 'A stock market security',
  fields: () => ({
    symbol: { type: GraphQLString },
    name: { type: GraphQLString },
    open: { type: GraphQLString },
    last: { type: GraphQLString },
    percDay: { type: GraphQLString },
    status: { type: GraphQLString },
    volume: { type: GraphQLString },
    lastUpdatedAt: { type: GraphQLString },
  }),
});

// Construct root query
const query = new GraphQLObjectType({
  name: 'Query',
  description: 'The Root Query',
  fields: () => ({
    securities: {
      type: new GraphQLList(SecurityType),
      description: 'A list of all securities',
      resolve() {
        return securitiesArr;
      },
    },
  }),
});

// Construct the schema
const schema = new GraphQLSchema({
  query,
});

app.use('/', graphqlHTTP({
  schema,
  graphiql: true,
}));

exports.graphql = functions.https.onRequest(app);
