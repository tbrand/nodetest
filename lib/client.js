const cluster = require('cluster');
const path = require('path');
const miner = require('./miner');
const protocol = require('./protocol');
const webSocketClinet = require('websocket').client;
const client = new webSocketClinet();

let __processes = [];
let __connection = null;

client.on('connectFailed', (error) => {
  console.error(error.toString());
});

client.on('connect', (connection) => {

  __connection = connection;

  console.log('websocket connected!');

  connection.send(protocol.handshake('VDAyYTVjMDYwZjYyZThkOWM5ODhkZGFkMmM3NzM2MjczZWZhZjIxNDAyNWRmNWQ0'));

  connection.on('error', (error) => {
	  console.log(error.toString());
  });

  connection.on('close', () => {
	  console.log('connection closed');
  });

  connection.on('message', (message) => {
	  const messageJson = JSON.parse(message.utf8Data);
	  const type = messageJson.type;
	  const content = messageJson.content;

	  switch (parseInt(type)) {
	  case 0x002:
	    console.log('handshake accepted');

	    const accepted = protocol.accepted(content);

      __processes.forEach((process) => {
        process.kill();
        process.send({ latestHash: accepted.latestHash, difficulty: accepted.difficulty });
      });

	    break;
	  case 0x003:
	    console.error('handshake rejected');
	    console.error(`reason: ${protocol.reason(content)}`);
	    break;
	  case 0x005:
	    console.log('block update');

	    const updated = protocol.blockUpdated(content);

      __processes.forEach((process) => {
        process.kill();
        process.send({ latestHash: updated.latestHash, difficulty: updated.difficulty });
      });

	    break;
	  default:
	    console.log(`unknown protocol. message type ${messageJson.type}`);
	    break;
	  }
  });
});

const connect = function(url, processes) {
  __processes = processes;
  client.connect(url);
}

exports.connect = connect;
