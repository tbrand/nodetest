const napa = require('napajs');
const core = require('./core');
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
	global.connected = false;
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

	    global.latestHash = accepted.latestHash;
	    global.difficulty = accepted.difficulty;
	    break;
	case 0x003:
	    global.connected = false;

	    console.error('handshake rejected');
	    console.error(`reason: ${protocol.reason(content)}`);
	    break;
	case 0x004:
	    console.log('block update');

	    const updated = protocol.blockUpdated(content);

	    global.latestHash = updated.latestHash;
	    global.difficulty = updated.difficulty;
	    break;
	default:
	    global.connected = false;
	    console.log(`unknown protocol. message type ${messageJson.type}`);
	    break;
	}
    });
});

const startMining = function(threads) {
    const miningZone = napa.zone.create('mining', { workers: threads });
    const promisses = [];

    for (let i = 0 ; i < threads ; i ++) {
	console.log(`creating mining thread ${i}`);
	promisses.push(core.mining);
    }

    return Promise.race(promisses).then(function(nonce) {
	console.log('found nonce');
	console.log(nonce);
    });
}

const start = function(url, threads) {
    startMining(threads);

    client.connect(url);
}

exports.start = start;
