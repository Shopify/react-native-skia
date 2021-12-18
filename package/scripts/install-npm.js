const fs = require("fs");
const path = require("path");

console.log("Updating symlinks for Android build...");

const createSymlink = (p) => {
  const srcDir = path.resolve(`./cpp/${p}`);
  const dstDir = path.resolve(`./android/cpp/${p}`);

  try {
    console.log(`Creating symlink to ${p}`, __dirname, process.cwd());

    fs.symlinkSync(srcDir, dstDir, "dir");
  } catch (err) {
    if (err && err.code === "EEXIST") {
      console.log("Directory already exists:", dstDir);
      return;
    }

    throw err;
  }
};

// Copy common cpp files from the package root to the android folder
createSymlink("api");
createSymlink("jsi");
createSymlink("rnskia");
createSymlink("skia");
createSymlink("utils");

console.log("Symlinks created successfully.");
