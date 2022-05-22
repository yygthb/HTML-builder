const path = require('path');
const fs = require('fs');

const DIR_NAME_ORIGINAL = 'files';

const removeDir = (src) => {
  return new Promise((res) => {
    fs.rm(src, { recursive: true }, () => {
      res();
    });
  });
};

const createDir = (src) => {
  return new Promise((res, rej) => {
    fs.mkdir(src, (err) => {
      if (err) rej(err);

      res();
    });
  });
};

const getDirFiles = (src) => {
  return new Promise((res, rej) => {
    fs.readdir(src, { encoding: 'utf-8' }, (err, files) => {
      if (err) rej(err);

      res(files);
    });
  });
};

const copyFile = (src, dist) => {
  return new Promise((res, rej) => {
    fs.copyFile(src, dist, (err) => {
      if (err) rej(err);

      res();
    });
  });
};

const copyDir = async (dirSrc) => {
  try {
    const DIR_NAME_COPY = dirSrc + '-copy';
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
    throw new Error(error);
  }
};

copyDir(DIR_NAME_ORIGINAL);
