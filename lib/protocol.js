const crypto = require('crypto');

const handshake = function(address) {
    const type = 0x001;
    const content = JSON.stringify({ address });

    return JSON.stringify({ type, content });
};

const accepted = function(content) {
    const json = JSON.parse(content);
    const block = json.block;
    const sha256 = crypto.createHash('sha256');

    sha256.update(JSON.stringify(block));

    const latestHash = sha256.digest('hex');
    const difficulty = json.difficulty;

    return { latestHash, difficulty };
};

const rejected = function(content) {
    const reason = JSON.prase(content).reason;
    return reason;
}

const blockUpdated = function(content) {
    const json = JSON.parse(content);
    const block = json.block;
    const sha256 = crypto.createHash('sha256');

    sha256.update(JSON.stringify(block));

    const latestHash = sha256.digest('hex');
    const difficulty = json.difficulty;

    return { latestHash, difficulty };
};

exports.handshake = handshake;
exports.accepted = accepted;
