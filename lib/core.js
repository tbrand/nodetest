const scrypt = require('scrypt');

const N = 1 << 16;
const r = 1;
const p = 1;
const k = 512;

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

const mining = function(blockHash, difficulty) {
    let nonce = 0;

    while(true) {

	if (validate(blockHash, nonce, difficulty)) {
	    break;
	}

	nonce ++;

	if (nonce % 10 == 0) {
	    console.log(nonce);
	}
    }

    console.log(`NONCE!: ${nonce}`);

    return nonce;
};

exports.scryptN = scryptN;
exports.validate = validate;
exports.mining = mining;
