const path = require('path');
const fs = require('fs');

const DIR_NAME = 'secret-folder';
const DIR_PATH = path.resolve(__dirname, DIR_NAME);

const isFile = (fileName) => {
  const filePath = path.resolve(DIR_PATH, fileName);
  return new Promise((res, rej) => {
    fs.lstat(filePath, (err, stats) => {
      if (err) rej(err);

      res([stats.isFile(), stats.size]);
    });
  });
};

const getFileExt = (fileName) => {
  const fileExt = path.parse(path.resolve(DIR_PATH, fileName)).ext;
  return fileExt.slice(1);
};

const getFilesInfo = src => {
  fs.readdir(src, {encoding: 'utf-8'}, async (err, files) => {
    if (err) {
      throw new Error(err);
    }
  
    for (let file of files) {
      const [success, fileSize] = await isFile(file);

      if (success) {
        const fileName = file.split('.')[0];
        const fileExt = getFileExt(file);
    
        console.log(`${fileName} - ${fileExt} - ${fileSize}b`);
      }
    }
  });
};

getFilesInfo(DIR_PATH);