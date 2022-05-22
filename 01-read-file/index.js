const path = require('path');
const fs = require('fs');

const FILE_NAME = 'text.txt';
const FILE_PATH = path.resolve(__dirname, FILE_NAME);

const stream = fs.createReadStream(FILE_PATH, { encoding: 'utf-8' });

stream.on('data', (data) => process.stdout.write(data));
stream.on('error', (err) => console.log(err));
