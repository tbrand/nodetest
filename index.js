const cluster = require('cluster');

const mining = function(url, nprocesses) {
    if (cluster.isMaster) {
	const client = require('./lib/client');

	client.setup();
	client.connect(url, nprocesses);
    } else {
	require('./lib/miner');
    }
}

module.exports = mining;
