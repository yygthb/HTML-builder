const path = require('path');
const fs = require('fs');

const DIR_BUILD = 'project-dist';
const DIR_PATH_BUILD = path.resolve(__dirname, DIR_BUILD);
const DIR_ASSETS = 'assets';
const DIR_PATH_ASSETS = path.resolve(__dirname, DIR_ASSETS);
const DIR_STYLES = 'styles';
const DIR_PATH_STYLES = path.resolve(__dirname, DIR_STYLES);
const FILE_STYLES = 'style.css';
const FILE_PATH_STYLES = path.resolve(DIR_PATH_BUILD, FILE_STYLES);
const FILE_TEMPLATE = 'template.html';
const FILE_PATH_TEMPLATE = path.resolve(__dirname, FILE_TEMPLATE);
const DIR_COMPONENTS = 'components';
const DIR_PATH_COMPONENTS = path.resolve(__dirname, DIR_COMPONENTS);

const removeDir = (path) => {
  return new Promise((res) => {
    fs.rm(path, { recursive: true }, () => {
      res();
    });
  });
};

const createDir = async (path) => {
  await removeDir(path);

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

const isFileFunction = async (path) => {
  return new Promise((res, rej) => {
    fs.lstat(path, (err, stats) => {
      if (err) rej(err);

      res(stats.isFile());
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

const copyFiles = async (src, dist) => {
  const files = await getDirFiles(src);

  for (let file of files) {
    const PATH_SRC = path.resolve(src, file);
    const PATH_DIST = path.resolve(dist, file);
    const isFile = await isFileFunction(PATH_SRC);

    if (isFile) {
      await copyFile(PATH_SRC, PATH_DIST);
    } else {
      await createDir(PATH_DIST);
      await copyFiles(PATH_SRC, PATH_DIST);
    }
  }
};

const createFile = (path) => {
  return new Promise((res, rej) => {
    fs.writeFile(path, '', (err) => {
      if (err) {
        rej(err);
      }
      res();
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

const writeCssBundle = async (src, dist) => {
  await createFile(dist);

  return new Promise((res, rej) => {
    fs.readdir(src, { encoding: 'utf-8' }, async (err, files) => {
      if (err) rej(err);

      const wr = fs.createWriteStream(dist);
      for (let file of files) {
        const filePath = path.resolve(src, file);
        const isFile = await isFileFunction(filePath);
        const fileExt = path.parse(filePath).ext;

        if (isFile && fileExt.slice(1) === 'css') {
          const data = await readFileData(path.resolve(src, file));
          wr.write(data);
        }
      }
      wr.end();

      res();
    });
  });
};

const parseHTML = async (src, dist, compSrc) => {
  let htmlTemplate = await readFileData(src);
  const components = htmlTemplate.match(/({{)[a-z]*(}})/g);

  for (let component of components) {
    const componentData = await readFileData(
      path.resolve(compSrc, component.slice(2, -2) + '.html')
    );
    htmlTemplate = htmlTemplate.replace(component, componentData);
  }

  await createFile(dist);

  return new Promise((res, rej) => {
    fs.writeFile(dist, htmlTemplate, (err) => {
      if (err) rej(err);
      res();
    });
  });
};

const buildPage = async () => {
  try {
    // create folder project-dist
    await createDir(DIR_PATH_BUILD);

    // copy assets
    await createDir(path.resolve(DIR_PATH_BUILD, DIR_ASSETS));
    await copyFiles(DIR_PATH_ASSETS, path.resolve(DIR_PATH_BUILD, DIR_ASSETS));

    // create styles bundle
    await writeCssBundle(DIR_PATH_STYLES, FILE_PATH_STYLES);

    // parse html template
    await parseHTML(
      FILE_PATH_TEMPLATE,
      path.resolve(DIR_PATH_BUILD, 'index.html'),
      DIR_PATH_COMPONENTS
    );
  } catch (error) {
    throw new Error(error);
  }
};

buildPage();
