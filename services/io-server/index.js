const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.json({
    service: 'Alpha Vantage WebSocket',
    data: ['QQQ', 'SPY', 'TLT'],
  });
});

io.on('connection', socket => {
  console.log('user connected');
  console.log(socket);
});

http.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
