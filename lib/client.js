const cluster = require('cluster');
const path = require('path');
const miner = require('./miner');
const protocol = require('./protocol');
const webSocketClinet = require('websocket').client;
const client = new webSocketClinet();

let __connection = null;

const killMiners = function() {
  for (const id in cluster.workers) {
		process.kill(cluster.workers[id].process.pid);
	}
}

const setup = function() {

  const foundNonce = function(message) {
	  console.log(`nonce coming!: ${message.nonce}`);

	  if (__connection) {
	    __connection.send(protocol.foundNonce(message.nonce));
	  }
  }

  for (const id in cluster.workers) {
	  console.log(`id ${id}`);
	  cluster.workers[id].on('message', foundNonce);
  }
}

client.on('connectFailed', (error) => {
  console.error(error.toString());
});

client.on('connect', (connection) => {
  console.log('websocket connected!');

  __connection = connection;
  __connection.send(protocol.handshake('VDAyYTVjMDYwZjYyZThkOWM5ODhkZGFkMmM3NzM2MjczZWZhZjIxNDAyNWRmNWQ0'));

  connection.on('error', (error) => {
	  console.log(error.toString());
    killMiners();
  });

  connection.on('close', () => {
    console.log('connection closed');
    killMiners();
  });

  connection.on('message', (message) => {
	  const messageJson = JSON.parse(message.utf8Data);
	  const type = messageJson.type;
	  const content = messageJson.content;

	  switch (parseInt(type)) {
	  case 0x002:
	    console.log('handshake accepted');

	    const accepted = protocol.accepted(content);

	    for (const id in cluster.workers) {
		    cluster.workers[id].send({ latestHash: accepted.latestHash, difficulty: accepted.difficulty });
	    }

	    break;
	  case 0x003:
	    console.error('handshake rejected');
	    console.error(`reason: ${protocol.reason(content)}`);
	    break;
	  case 0x005:
	    console.log('block update');

	    const updated = protocol.blockUpdated(content);

      console.log(`update: ${updated.latestHash} ${updated.difficulty}`);

      killMiners();

      // todo
      cluster.fork();
      cluster.fork();

      for (const id in cluster.workers) {
		    cluster.workers[id].send({ latestHash: updated.latestHash, difficulty: updated.difficulty });
	    }

	    break;
	  default:
	    console.log(`unknown protocol. message type ${messageJson.type}`);
	    break;
	  }
  });
});

const connect = function(url) {
  client.connect(url);
}

exports.setup = setup;
exports.connect = connect;
