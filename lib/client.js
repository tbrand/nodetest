const path = require('path');
const cluster = require('cluster');
const protocol = require('./protocol');
const webSocketClinet = require('websocket').client;
const client = new webSocketClinet();

let __processes = [];
let __connection = null;
let __threads = null;

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
	    console.log('herehere: ' + accepted.latestHash);

	    launchMiners(accepted.latestHash, accepted.difficulty);

	    break;
	case 0x003:
	    console.error('handshake rejected');
	    console.error(`reason: ${protocol.reason(content)}`);
	    break;
	case 0x005:
	    console.log('block update');

	    const updated = protocol.blockUpdated(content);

	    restartMiners(updated.latestHash, updated.difficulty);

	    break;
	default:
	    console.log(`unknown protocol. message type ${messageJson.type}`);
	    break;
	}
    });
});

cluster.setupMaster({
    exec: path.join(__dirname, 'miner.js'),
    args: [],
});

const setupProcess = function(process) {
    process.on('message', function(message) {
	console.log(`message from ${message}`);

	if (__connection) {
	    __connection.send(protocol.foundNonce(message));
	}
    });
}

const killMiners = function () {
    __processes.forEach((process) => {
	process.kill();
    });

    __processes = [];
};

const launchMiners = function (latestHash, difficulty) {
    for (let i = 0 ; i < __threads ; i ++) {
	const process = cluster.fork();

	setupProcess(process);

	process.send({ latestHash, difficulty });

	__processes.push(process);
    }
}

const restartMiners = function (latestHash, difficulty) {
    killMiners();
    launchMiners(latestHash, difficulty);
}

const start = function(url, threads) {
    __threads = threads;

    if (cluster.isMaster) {
	client.connect(url);
    }
}

exports.start = start;
