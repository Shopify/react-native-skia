import fs from "fs";
import { executeCmdSync } from "./utils";

const tests = fs.readdirSync('package/src/renderer/__tests__/e2e/', {withFileTypes: true})
.filter(item => !item.isDirectory())
.map(item => item.name);

const runTest = (name: string) => `cd package; E2E=true yarn test -i src/renderer/__tests__/e2e/${name}`;

tests.map(test => runTest(test))
.map((cmd) => {
  console.log(cmd);
  executeCmdSync(cmd);
});
