const cluster = require('cluster');

if (cluster.isMaster) {
  const client = require('./lib/client');
  const url = 'http://127.0.0.1:3000';
  const nprocesses = 2;

  for (let i = 0 ; i < nprocesses ; i ++) {
	  const process = cluster.fork();
  }

  const messageHandler = function(message) {
	  console.log(`nonce coming!: ${message.nonce}`);
  };

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

  client.setup();
  client.connect(url);
} else {
  require('./lib/miner');
}
