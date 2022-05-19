const path = require('path');
const fs = require('fs');

const DIR_NAME_ORIGINAL = 'files';

const removeDir = (path) => {
  return new Promise((res, rej) => {
    fs.rm(path, { recursive: true }, () => {
      res();
    });
  });
};

const createDir = (path) => {
  return new Promise((res, rej) => {
    fs.mkdir(path, (err) => {
      if (err) rej(err);

      res();
    });
  });
};

const getDirFiles = (path) => {
  return new Promise((res, rej) => {
    fs.readdir(path, { encoding: 'utf-8' }, (err, files) => {
      if (err) rej(err);

      res(files);
    });
  });
};

const copyFile = (src, dest) => {
  return new Promise((res, rej) => {
    fs.copyFile(src, dest, (err) => {
      if (err) rej(err);

      res();
    });
  });
};

const copyDir = async (dirName) => {
  try {
    const DIR_NAME_COPY = dirName + '-copy';
    const DIR_PATH_ORIGINAL = path.resolve(__dirname, DIR_NAME_ORIGINAL);
    const DIR_PATH_COPY = path.resolve(__dirname, DIR_NAME_COPY);

    await removeDir(DIR_PATH_COPY);
    await createDir(DIR_PATH_COPY);

    const files = await getDirFiles(DIR_PATH_ORIGINAL);

    for (let file of files) {
      await copyFile(
        path.resolve(DIR_PATH_ORIGINAL, file),
        path.resolve(DIR_PATH_COPY, file)
      );
    }
  } catch (error) {
    console.log('error: ', error);
    throw new Error(error);
  }
};

copyDir(DIR_NAME_ORIGINAL);
