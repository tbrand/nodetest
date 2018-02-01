const scrypt = require('scrypt');
const N = 1 << 16;
const r = 1;
const p = 1;
const k = 512;

process.on('message', function(message) {
    while(true) {
	const nonce = mining(message.latestHash, message.difficulty);
	process.send({ nonce });
    }
});

process.on('error', function(error) { console.error(error.toString()) });
process.on('exit', function() { /* do nothing */ });

const scryptN = function (blockHash, nonce) {
    let nonceHex = nonce.toString(16);

    if (nonceHex.length % 2 == 1) {
	nonceHex = '0' + nonceHex;
    }

    const hashBuffer = new Buffer(blockHash);
    const nonceBuffer = new Buffer(nonceHex, 'hex');
    const scryptBuffer = scrypt.hashSync(hashBuffer, { 'N': N, 'r': r, 'p': p }, k, nonceBuffer);

    return scryptBuffer.toString('hex');
};

const validate = function(blockHash, nonce, difficulty) {
    const hash = scryptN(blockHash, nonce).slice(0, difficulty);
    return hash === '0'.repeat(difficulty);
};

const mining = function(latestHash, difficulty) {
    let nonce = Math.floor(Math.random() * 1000000000000);
    let latestNonce = nonce;
    let latestTime = new Date();

    while(true) {

	if (validate(latestHash, nonce, difficulty)) { break }

	nonce ++;

	if ((nonce - latestNonce) % 100 == 0) {
	    const nowTime = new Date();
	    const nonceDiff = nonce - latestNonce;
	    const timeDiff = (nowTime.getTime() - latestTime.getTime()) / 1000.0;

	    console.log(`${Math.floor(nonceDiff/timeDiff)} [works/s]`);

	    latestNonce = nonce;
	    latestTime = nowTime;
	}
    }

    return nonce;
};
