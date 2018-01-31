const scrypt = require('scrypt');

process.on('message', function(message) {
  console.log(`latest hash: ${message.latestHash}`);
  console.log(`difficulty: ${message.difficulty}`);

  while(true) {
    const nonce = mining(message.latestHash, message.difficulty);
    process.send({ nonce });
  }
});

process.on('error', function(error) { console.log(error) });
process.on('exit', function() { console.log('exitted') });

const scryptN = function (blockHash, nonce) {
  let nonceHex = nonce.toString(16);

  if (nonceHex.length % 2 == 1) {
	  nonceHex = '0' + nonceHex;
  }

  const hashBuffer = new Buffer(blockHash);
  const nonceBuffer = new Buffer(nonceHex, 'hex');
  const scryptBuffer = scrypt.hashSync(hashBuffer, { 'N': 1 << 16, 'r': 1, 'p': 1 }, 512, nonceBuffer);

  return scryptBuffer.toString('hex');
};

const validate = function(blockHash, nonce, difficulty) {
  const hash = scryptN(blockHash, nonce).slice(0, difficulty);
  return hash === '0'.repeat(difficulty);
};

const mining = function(latestHash, difficulty) {
  let nonce = Math.floor(Math.random() * 1000000000);

  console.log(`starting from ${nonce}`);

  while(true) {

	  if (validate(latestHash, nonce, difficulty)) { break }

	  nonce ++;

	  if (nonce % 10 == 0) {
	    console.log(nonce);
	  }
  }

  console.log(`NONCE!: ${nonce}`);

  return nonce;
};
