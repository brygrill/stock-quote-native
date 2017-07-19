const express = require('express');
const graphqlHTTP = require('express-graphql');
const axios = require('axios');
const values = require('lodash.values');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} = require('graphql');

exports.app = admin => {
  // Init express
  const app = express();

  // connect to db
  const db = admin.database();
  const ref = db.ref('poll');

  // fetch data
  // let securitiesArr = [];
  // let coinsArr = [];
  // ref.on('value', snapshot => {
  //   const securitiesData = snapshot.val();
  //   securitiesArr = values(securitiesData.securities);
  //   coinsArr = values(securitiesData.coins);
  // });

  // ref.once('value').then(data => {});

  // Construct Securities Type
  const SecurityType = new GraphQLObjectType({
    name: 'Security',
    description: 'A stock market security',
    fields: () => ({
      symbol: { type: GraphQLString },
      name: { type: GraphQLString },
      open: { type: GraphQLString },
      high: { type: GraphQLString },
      low: { type: GraphQLString },
      last: { type: GraphQLString },
      priceChg: { type: GraphQLString },
      priceChgPerc: { type: GraphQLString },
      volume: { type: GraphQLString },
      lastUpdatedAt: { type: GraphQLString },
      tickUpdatedAt: { type: GraphQLString },
    }),
  });

  const CoinType = new GraphQLObjectType({
    name: 'Coin',
    description: 'A cryptocurrency',
    fields: () => ({
      symbol: { type: GraphQLString },
      name: { type: GraphQLString },
      last: { type: GraphQLString },
      priceChgPerc: { type: GraphQLString },
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
          return ref.child('securities').once('value').then(data => {
            return values(data.val());
          });
        },
      },
      coins: {
        type: new GraphQLList(CoinType),
        description: 'A list of all cryptocurrencies',
        resolve() {
          return ref.child('coins').once('value').then(data => {
            return values(data.val());
          });
        },
      },
    }),
  });

  // Construct the schema
  const schema = new GraphQLSchema({
    query,
  });

  // Fetch prices middleware
  // Fire function to update prices every time graphql is hit
  const fetchPrices = (req, res, next) => {
    axios.get('https://us-central1-quoteum-fd8e3.cloudfunctions.net/prices');
    next();
  };

  app.use(fetchPrices);

  app.use(
    '/',
    graphqlHTTP({
      schema,
      graphiql: true,
    }));

  return app;
};
