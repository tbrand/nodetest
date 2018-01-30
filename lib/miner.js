const core = require('./core');

process.on('message', function(message) {
    console.log(`fafafa: ${message.latestHash}`);
    console.log(`fafafa2: ${message.difficulty}`);

    const nonce = core.mining(message.latestHash, message.difficulty);

    console.log(`nonce from process: ${nonce}`);

    process.send(nonce);
});

process.on('exit', function() {
    console.log('exitted');
});

process.on('error', function(error) { console.log(error) });
