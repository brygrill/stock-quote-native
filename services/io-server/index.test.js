/* eslint-disable new-cap */
const io = require('socket.io-client');

const socket = new io('http://localhost:3009');

socket.on('connect', () => {
  console.log('Connected to WS server');
});

socket.on('error', err => {
  console.log('Error: ', err);
});

socket.on('tick', data => {
  console.log(data);
});
