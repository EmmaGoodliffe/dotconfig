import { existsSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { logCompletion } from "./io";

const path = join(__dirname, "../dist/cli.js");
const shebang = "#! /usr/bin/env node";

if (existsSync(path)) {
  const content = [shebang, readFileSync(path).toString()].join("\n");
  writeFileSync(path, content);
}

const script = basename(__filename, ".ts");
logCompletion(script);
