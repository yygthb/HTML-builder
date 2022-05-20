const path = require('path');
const fs = require('fs');

const DIR_STYLES = 'styles';
const DIR_DIST = 'project-dist';
const BUNDLE_FILE = 'bundle.css';

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

const isFileFunc = (filePath) => {
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

const getCssFiles = (dirPath) => {
  return new Promise((res, rej) => {
    fs.readdir(dirPath, { encoding: 'utf-8' }, async (err, files) => {
      if (err) rej(err);

      const cssFiles = [];
      for (let file of files) {
        const filePath = path.resolve(dirPath, file);
        const isFile = await isFileFunc(filePath);

        if (isFile && isCssExt(filePath)) {
          cssFiles.push(file);
        }
      }

      res(cssFiles);
    });
  });
};

const readFileData = (filePath) => {
  return new Promise((res, rej) => {
    const data = [];
    const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });

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

const mergeStyles = async (dirAssets, dirDist, bundleName) => {
  try {
    const bundlePath = path.resolve(__dirname, dirDist, bundleName);
    await createBundleFile(bundlePath);

    const stylesPath = path.resolve(__dirname, dirAssets);
    const cssFiles = await getCssFiles(stylesPath);

    await writeCssBundle(
      cssFiles,
      path.resolve(__dirname, dirAssets),
      path.resolve(__dirname, dirDist, bundleName)
    );
  } catch (error) {
    throw new Error(error);
  }
};

mergeStyles(DIR_STYLES, DIR_DIST, BUNDLE_FILE);
