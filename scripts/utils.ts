import { exec, execSync } from "child_process";
import { exit } from "process";

export const executeCmdSync = (command: string) => {
  execSync(command, { stdio: "inherit", env: process.env });
};

export const executeCmd = (
  command: string,
  label: string,
  callback: () => void
) => {
  const proc = exec(command, { env: process.env }, callback);
  if (proc) {
    proc.stdout?.on("data", function (data) {
      console.log(`[${label}]:`, data.trim());
    });
    proc.stderr?.on("data", function (data) {
      console.error(`[${label}]:`, data.trim());
      exit(1);
    });
  }
};
