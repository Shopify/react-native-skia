const fs = require("fs");
const path = require("path");

console.log("Updating symlinks for Android build...");

const createSymlink = (p) => {
  console.log(`Creating symlink to ${p}`, __dirname, process.cwd());
  fs.symlinkSync(
    path.resolve(`./cpp/${p}`),
    path.resolve(`./android/cpp/${p}`),
    "dir"
  );
};

// Copy common cpp files from the package root to the android folder
createSymlink("api");
createSymlink("jsi");
createSymlink("rnskia");
createSymlink("skia");
createSymlink("utils");

console.log("Symlinks created successfully.");
