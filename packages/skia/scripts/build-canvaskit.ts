import { spawnSync } from "child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";

const packageRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(packageRoot, "..", "..");
const skiaRoot = path.join(repositoryRoot, "externals", "skia");
const canvasKitRoot = path.join(skiaRoot, "modules", "canvaskit");
const patchPath = path.join(
  __dirname,
  "patches",
  "canvaskit-image-encoding.patch"
);
const buildRoot = path.join(skiaRoot, "out", "canvaskit_wasm");
const outputRoot = path.join(packageRoot, "dist", "canvaskit");
const emscriptenRoot = path.join(
  skiaRoot,
  "third_party",
  "externals",
  "emsdk",
  "upstream",
  "emscripten"
);

const run = (command: string, args: string[], cwd: string, inherit = true) =>
  spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: inherit ? "inherit" : "pipe",
  });

if (!existsSync(path.join(skiaRoot, ".git"))) {
  throw new Error(`Skia submodule is not available at ${skiaRoot}`);
}
if (!existsSync(patchPath)) {
  throw new Error(`CanvasKit image-encoding patch is missing: ${patchPath}`);
}

const dependenciesAvailable =
  existsSync(
    path.join(
      skiaRoot,
      "third_party",
      "externals",
      "harfbuzz",
      "src",
      "hb-blob.cc"
    )
  ) && existsSync(path.join(emscriptenRoot, "em++"));
if (!dependenciesAvailable) {
  const syncDependencies = run("python3", ["tools/git-sync-deps"], skiaRoot);
  if (syncDependencies.status !== 0) {
    process.exit(syncDependencies.status ?? 1);
  }
}

if (
  !existsSync(
    path.join(
      emscriptenRoot,
      "node_modules",
      "google-closure-compiler",
      "package.json"
    )
  )
) {
  const installEmscriptenDependencies = run("npm", ["ci"], emscriptenRoot);
  if (installEmscriptenDependencies.status !== 0) {
    process.exit(installEmscriptenDependencies.status ?? 1);
  }
}

const alreadyApplied = run(
  "git",
  ["apply", "--reverse", "--check", patchPath],
  skiaRoot,
  false
);
if (alreadyApplied.status !== 0) {
  const canApply = run("git", ["apply", "--check", patchPath], skiaRoot, false);
  if (canApply.status !== 0) {
    throw new Error(
      `Cannot apply ${patchPath}. The Skia checkout may be at an incompatible revision.\n${canApply.stderr}`
    );
  }
  const apply = run("git", ["apply", patchPath], skiaRoot);
  if (apply.status !== 0) {
    process.exit(apply.status ?? 1);
  }
}

const build = run("./compile.sh", [], canvasKitRoot);
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

mkdirSync(outputRoot, { recursive: true });
copyFileSync(
  path.join(buildRoot, "canvaskit.js"),
  path.join(outputRoot, "canvaskit.js")
);
copyFileSync(
  path.join(buildRoot, "canvaskit.wasm"),
  path.join(outputRoot, "canvaskit.wasm")
);
copyFileSync(
  path.join(canvasKitRoot, "npm_build", "LICENSE"),
  path.join(outputRoot, "LICENSE")
);

const revision = run("git", ["rev-parse", "HEAD"], skiaRoot, false);
if (revision.status !== 0) {
  throw new Error(`Cannot read the Skia revision: ${revision.stderr}`);
}
writeFileSync(
  path.join(outputRoot, "BUILD_INFO"),
  `Skia revision: ${revision.stdout.trim()}\n` +
    "Build target: modules/canvaskit/compile.sh (full WebGL release)\n" +
    "Local patch: scripts/patches/canvaskit-image-encoding.patch\n"
);

console.log(`CanvasKit artifacts copied to ${outputRoot}`);
