const cluster = require('cluster');

if (cluster.isMaster) {
  const client = require('./lib/client');
  const url = 'http://127.0.0.1:3000';
  const nprocesses = 2;
  const processes = [];

  for (let i = 0 ; i < nprocesses ; i ++) {
    const process = cluster.fork();
    processes.push(process);
  }

  client.connect(url, processes);
} else {
  require('./lib/miner');
}
