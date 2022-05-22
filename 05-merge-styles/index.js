const path = require('path');
const fs = require('fs');

const DIR_STYLES = 'styles';
const DIR_PATH_STYLES = path.resolve(__dirname, DIR_STYLES);
const DIR_DIST = 'project-dist';
const FILE_BUNDLE = 'bundle.css';
const FILE_PATH_BUNDLE = path.resolve(__dirname, DIR_DIST, FILE_BUNDLE);

const createBundleFile = (filePath) => {
  return new Promise((res, rej) => {
    fs.writeFile(filePath, '', (err) => {
      if (err) {
        rej(err);
      }
      res();
    });
  });
};

const isFile = (filePath) => {
  return new Promise((res, rej) => {
    fs.lstat(filePath, (err, stats) => {
      if (err) rej(err);

      res(stats.isFile());
    });
  });
};

const isCssExt = (filePath) => {
  const fileExt = path.parse(filePath).ext;
  return fileExt.slice(1) === 'css';
};

const getCssFiles = (src) => {
  return new Promise((res, rej) => {
    fs.readdir(src, { encoding: 'utf-8' }, async (err, files) => {
      if (err) rej(err);

      const cssFiles = [];
      for (let file of files) {
        const filePath = path.resolve(src, file);
        const _isFile = await isFile(filePath);

        if (_isFile && isCssExt(filePath)) {
          cssFiles.push(file);
        }
      }

      res(cssFiles);
    });
  });
};

const readFileData = (src) => {
  return new Promise((res, rej) => {
    const data = [];
    const stream = fs.createReadStream(src, { encoding: 'utf-8' });

    stream.on('data', (chunk) => data.push(chunk));
    stream.on('end', () => res(data.join('')));
    stream.on('error', (err) => rej(err));
  });
};

const writeCssBundle = async (cssFiles, dirAssets, filePath) => {
  const wr = fs.createWriteStream(filePath);

  for (let cssFile of cssFiles) {
    const data = await readFileData(path.resolve(dirAssets, cssFile));
    wr.write(data);
  }

  wr.end();
};

const mergeStyles = async (src, dist) => {
  try {
    await createBundleFile(dist);

    const cssFiles = await getCssFiles(src);

    await writeCssBundle(
      cssFiles,
      src,
      dist
    );
  } catch (error) {
    throw new Error(error);
  }
};

mergeStyles(DIR_PATH_STYLES, FILE_PATH_BUNDLE);
