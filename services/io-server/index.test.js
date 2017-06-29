/* eslint-disable new-cap */
const io = require('socket.io-client');

const socket = new io('http://localhost:3000/');

socket.on('connect', () => {
  console.log('Connected to WS server');
});
