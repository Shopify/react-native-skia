const fs = require("fs");
const path = require("path");

console.log("Updating symlinks for Android build...");

const createSymlink = (p) => {
  console.log(`Creating symlink to ${p}`, __dirname, process.cwd());
  const srcDir = path.resolve(`./cpp/${p}`);
  const dstDir = path.resolve(`./android/cpp/${p}`);

  // Case in PNPM which might turn symlink into a directory:
  // In that case, remove the directory before creating the symlink
  if (fs.existsSync(dstDir)) {
    const lstat = fs.lstatSync(dstDir);
    const isSymbolicLink = lstat.isSymbolicLink();
    if (lstat.isDirectory() && !isSymbolicLink) {
      fs.rmSync(dstDir, { recursive: true });
    }
  }

  if (!fs.existsSync(dstDir)) {
    fs.symlinkSync(srcDir, dstDir, "junction");
  }
};

// Copy common cpp files from the package root to the android folder
createSymlink("api");
createSymlink("jsi");
createSymlink("rnskia");
createSymlink("skia");
createSymlink("utils");

console.log("Symlinks created successfully.");
