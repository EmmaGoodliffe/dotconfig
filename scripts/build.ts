import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const path = join(__dirname, "../dist/cli.js");
const shebang = "#! /usr/bin/env node";

if (existsSync(path)) {
  const content = [shebang, readFileSync(path).toString()].join("\n");
  writeFileSync(path, content);
}
