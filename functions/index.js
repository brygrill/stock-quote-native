const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');

// Init express
const app = express();

// Init Firebase admin
admin.initializeApp(functions.config().firebase);

// connect to db
const db = admin.database();
const ref = db.ref('realtime/securities');

// fetch data
let securitiesData = null;
ref.on('value', snapshot => {
  securitiesData = snapshot.val();
  console.log(securitiesData);
});

// Construct Securities Type
const SecurityType = new GraphQLObjectType({
  name: 'Security',
  description: 'A stock market security',
  fields: () => ({
    symbol: { type: GraphQLString },
    last: { type: GraphQLString },
    statusDay: { type: GraphQLString },
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
        console.log(securitiesData);
        return securitiesData;
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
