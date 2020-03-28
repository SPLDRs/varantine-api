//https://stackoverflow.com/a/53743569
const fs = require('fs');

const renameFile = (path, newPath) => 
  new Promise((res, rej) => {
    fs.rename(path, newPath, (err, data) =>
      err
        ? rej(err)
        : res(data));
  });

const copyFile = (path, newPath, flags) =>
  new Promise((res, rej) => {
    const readStream = fs.createReadStream(path),
      writeStream = fs.createWriteStream(newPath, {flags});

    readStream.on("error", rej);
    writeStream.on("error", rej);
    writeStream.on("finish", res);
    readStream.pipe(writeStream);
  });

const unlinkFile = path => 
  new Promise((res, rej) => {
    fs.unlink(path, (err, data) =>
      err
        ? rej(err)
        : res(data));
});

const moveFile = (path, newPath, flags) =>
  renameFile(path, newPath)
    .catch(e => {
      if (e.code !== "EXDEV")
        throw e;

      else
        return copyFile(path, newPath, flags)
          .then(() => unlinkFile(path));
    });

var fileHelper = {
    renameFile,
    copyFile,
    unlinkFile,
    moveFile,
};

module.exports = fileHelper;