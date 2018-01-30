const scrypt = require('scrypt');

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

const mining = function (blockHash, difficulty) {
  let nonce = 0;

  while(true) {
    if (validate(blockHash, nonce, difficulty)) {
      break;
    }

    nonce ++;
  }

  return nonce;
};

exports.scryptN = scryptN;
exports.validate = validate;
exports.mining = mining;
