const path = require('path');
const fs = require('fs');
const readline = require('readline');

const FILE_NAME = 'text.txt';
const FILE_PATH = path.resolve(__dirname, FILE_NAME);

const createFile = (filePath) => {
  return new Promise((res, rej) => {
    fs.writeFile(filePath, '', (err) => {
      if (err) {
        rej(err);
      }
      res();
    });
  });
};

const writeStream = (filePath) => {
  return new Promise((res, rej) => {
    const write = fs.createWriteStream(filePath);
    write.on('error', (err) => rej(err));
    res(write);
  });
};

const showStartInfoMsg = () => {
  console.log('');
  console.log('||  Hello, my friend!');
  console.log('||  "text.txt" file created');
  console.log('||  Write text to stream it to "text.txt" file');
};
const showFinallyInfoMsg = () => {
  console.log('');
  console.log('||  the application closed');
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const run = async (filePath) => {
  try {
    await createFile(filePath);
    showStartInfoMsg();

    rl.prompt();
    process.stdout.write('\n');
    const wr = await writeStream(filePath);

    process.on('SIGINT', () => {
      rl.close();
    });

    rl.on('line', (data) => {
      if (data === 'exit') {
        return rl.close();
      }
      wr.write(data + '\n');
    });

    rl.on('close', () => {
      wr.end();
      wr.on('finish', () => {
        showFinallyInfoMsg();
      });
    });
  } catch (error) {
    console.log('error: ', error);
  }
};

run(FILE_PATH);
