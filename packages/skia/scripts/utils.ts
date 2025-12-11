import { spawn, execSync } from "child_process";
import fs, {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "fs";
import { exit } from "process";
import path from "path";

export const ensureFolderExists = (dirPath: string) => {
  try {
    console.log(`Ensuring that ${dirPath} exists...`);
    mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
};

export const runAsync = (command: string, label: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(" ");
    console.log(`\n🚀 Running: ${cmd} ${args.join(" ")}`);
    const childProcess = spawn(cmd, args, {
      shell: true,
    });

    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];

    childProcess.stdout.on("data", (data) => {
      const lines = data.toString();
      stdoutLines.push(lines);
      process.stdout.write(`${label} ${data}`);
    });

    childProcess.stderr.on("data", (data) => {
      const lines = data.toString();
      stderrLines.push(lines);
      console.error(`${label} ${data}`);
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${label} completed successfully`);
        resolve();
      } else {
        console.log("\n");
        // prettier-ignore
        [
          "╔════════════════════════════════════════════════════════════════╗",
          "║                        ❌ BUILD FAILED                         ║",
          "╚════════════════════════════════════════════════════════════════╝",
        ].forEach(line => console.log(line));
        console.log(`\n📋 Command: ${command}`);
        console.log(`🏷️  Label: ${label}`);
        console.log(`📍 Exit Code: ${code}`);
        console.log(`📂 Working Directory: ${process.cwd()}`);

        if (stderrLines.length > 0) {
          // prettier-ignore
          [
            "\n┌─────────────────────────────────────────────────────────────────┐",
            "│ Last stderr output:                                             │",
            "└─────────────────────────────────────────────────────────────────┘",
          ].forEach(line => console.log(line));
          const lastStderr = stderrLines.slice(-20).join("");
          console.log(lastStderr);
        }

        if (stdoutLines.length > 0) {
          // prettier-ignore
          [
            "\n┌─────────────────────────────────────────────────────────────────┐",
            "│ Last stdout output:                                             │",
            "└─────────────────────────────────────────────────────────────────┘",
          ].forEach(line => console.log(line));
          const lastStdout = stdoutLines.slice(-20).join("");
          console.log(lastStdout);
        }

        console.log(
          "\n════════════════════════════════════════════════════════════════════\n"
        );
        reject(new Error(`${label} exited with code ${code}`));
      }
    });

    childProcess.on("error", (error) => {
      console.log("\n");
      // prettier-ignore
      [
        "╔════════════════════════════════════════════════════════════════╗",
        "║                     ❌ PROCESS ERROR                           ║",
        "╚════════════════════════════════════════════════════════════════╝",
      ].forEach(line => console.log(line));
      console.log(`\n📋 Command: ${command}`);
      console.log(`🏷️  Label: ${label}`);
      console.log(`💥 Error: ${error.message}`);
      console.log(`📂 Working Directory: ${process.cwd()}`);
      console.log(
        "\n════════════════════════════════════════════════════════════════════\n"
      );
      reject(new Error(`${label} ${error.message}`));
    });
  });
};

export const mapKeys = <T extends object>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

export const checkFileExists = (filePath: string) => {
  const exists = existsSync(filePath);
  if (!exists) {
    console.log("");
    console.log("Failed:");
    console.log(filePath + " not found. (" + filePath + ")");
    console.log("");
    exit(1);
  } else {
    console.log("✅ " + filePath);
  }
};

export const $ = (command: string) => {
  try {
    return execSync(command, { stdio: "pipe" });
  } catch (e) {
    const error = e as {
      status?: number;
      stderr?: Buffer;
      stdout?: Buffer;
      message?: string;
    };
    console.log("\n");
    // prettier-ignore
    [
      "╔════════════════════════════════════════════════════════════════╗",
      "║                     ❌ COMMAND FAILED                          ║",
      "╚════════════════════════════════════════════════════════════════╝",
    ].forEach(line => console.log(line));
    console.log(`\n📋 Command: ${command}`);
    console.log(`📍 Exit Code: ${error.status ?? "unknown"}`);
    console.log(`📂 Working Directory: ${process.cwd()}`);

    if (error.stderr && error.stderr.length > 0) {
      // prettier-ignore
      [
        "\n┌─────────────────────────────────────────────────────────────────┐",
        "│ stderr:                                                         │",
        "└─────────────────────────────────────────────────────────────────┘",
      ].forEach(line => console.log(line));
      console.log(error.stderr.toString());
    }

    if (error.stdout && error.stdout.length > 0) {
      // prettier-ignore
      [
        "\n┌─────────────────────────────────────────────────────────────────┐",
        "│ stdout:                                                         │",
        "└─────────────────────────────────────────────────────────────────┘",
      ].forEach(line => console.log(line));
      console.log(error.stdout.toString());
    }

    console.log(
      "\n════════════════════════════════════════════════════════════════════\n"
    );
    exit(1);
  }
};

const serializeCMakeArgs = (args: Record<string, string>) => {
  return Object.keys(args)
    .map((key) => `-D${key}=${args[key]}`)
    .join(" ");
};

export const build = async (
  label: string,
  args: Record<string, string>,
  debugLabel: string
) => {
  console.log(`🔨 Building ${label}`);
  $(`mkdir -p externals/dawn/out/${label}`);
  process.chdir(`externals/dawn/out/${label}`);
  const cmd = `cmake ../.. -G Ninja ${serializeCMakeArgs(args)}`;
  await runAsync(cmd, debugLabel);
  await runAsync("ninja", debugLabel);
  process.chdir("../../../..");
};

export var copyRecursiveSync = function (src: string, dest: string) {
  var exists = existsSync(src);
  if (!exists) {
    return;
  }
  var stats = statSync(src);
  var isDirectory = stats.isDirectory();
  if (isDirectory) {
    if (!existsSync(dest)) {
      mkdirSync(dest);
    }
    readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    copyFileSync(src, dest);
  }
};

// Cross-platform file operations abstraction
export const fileOps = {
  rm: (p: string) => {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  },

  mkdir: (p: string) => {
    fs.mkdirSync(p, { recursive: true });
  },

  cp: (src: string, dest: string) => {
    copyRecursiveSync(src, dest);
  },

  sed: (file: string, pattern: RegExp, replacement: string) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      const updated = content.replace(pattern, replacement);
      fs.writeFileSync(file, updated, "utf8");
    }
  },
};
