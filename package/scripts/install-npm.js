const fs = require("fs");
const path = require("path");

console.log("Updating symlinks for Android build...");

const isExists = (path) => {
  return fs.existsSync(path);
}

const createSymlink = (p) => {
  console.log(`Creating symlink to ${p}`, __dirname, process.cwd());
  const srcDir = path.resolve(`./cpp/${p}`);
  const dstDir = path.resolve(`./android/cpp/${p}`);

  if (isExists(dstDir)) {
    fs.unlinkSync(dstDir);
  }

  fs.symlinkSync(srcDir, dstDir, "dir");
};

// Copy common cpp files from the package root to the android folder
createSymlink("api");
createSymlink("jsi");
createSymlink("rnskia");
createSymlink("skia");
createSymlink("utils");

console.log("Symlinks created successfully.");
