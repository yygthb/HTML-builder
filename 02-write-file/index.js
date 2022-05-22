const path = require('path');
const fs = require('fs');
const readline = require('readline');

const FILE_NAME = 'text.txt';
const FILE_PATH = path.resolve(__dirname, FILE_NAME);

const createFile = (src) => {
  return new Promise((res, rej) => {
    fs.writeFile(src, '', (err) => {
      if (err) {
        rej(err);
      }
      res();
    });
  });
};

const writeStream = (src) => {
  return new Promise((res, rej) => {
    const write = fs.createWriteStream(src);
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
  console.log('||  the app closed');
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
    const write = await writeStream(filePath);

    process.on('SIGINT', () => {
      rl.close();
    });

    rl.on('line', (data) => {
      if (data === 'exit') {
        return rl.close();
      }
      write.write(data + '\n');
    });

    rl.on('close', () => {
      write.end();
      write.on('finish', () => {
        showFinallyInfoMsg();
      });
    });
  } catch (error) {
    console.log('error: ', error);
  }
};

run(FILE_PATH);
