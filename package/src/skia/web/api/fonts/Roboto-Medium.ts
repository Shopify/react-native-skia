import fs from "fs";
import path from "path";

const content = fs
  .readFileSync(path.resolve(__dirname, "./Roboto-Medium.ttf"))
  .toString("base64");
// eslint-disable-next-line import/no-default-export
export default content;
