const protocol = require('./protocol');
const webSocketClinet = require('websocket').client;
const client = new webSocketClinet();

client.on('connectFailed', (error) => {
  console.error(error.toString());
});

client.on('connect', (connection) => {
  console.log('websocket connected!');

  connection.send(protocol.handshake('VDAyYTVjMDYwZjYyZThkOWM5ODhkZGFkMmM3NzM2MjczZWZhZjIxNDAyNWRmNWQ0'));

  connection.on('error', (error) => {
    console.log(error.toString());
  });

  connection.on('close', () => {
    console.log('connection closed');
  })

  connection.on('message', (message) => {
    const messageJson = JSON.parse(message.utf8Data);

    switch (parseInt(messageJson.type)) {
    case 0x002:
      console.log('handshake accepted');
      const latestHash = protocol.accepted(messageJson.content);
      console.log(latestHash);
      break;
    case 0x003:
      console.log('handshake rejected');
      break;
    case 0x004:
      console.log('block update');
      break;
    default:
      console.log(`unknown protocol. message type ${messageJson.type}`);
      break;
    }
  });
});

const start = function(url) {
  client.connect(url);
};

exports.client = client;
exports.start = start;
