const crypto = require('crypto');

const handshake = function(address) {
  const type = 0x001;
  const content = JSON.stringify({ address });

  return JSON.stringify({ type, content });
};

const accepted = function(content) {
  const block = JSON.parse(content).block;
  const sha256 = crypto.createHash('sha256');

  sha256.update(JSON.stringify(block));
  return sha256.digest('hex');
};

exports.handshake = handshake;
exports.accepted = accepted;
