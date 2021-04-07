import { existsSync, mkdirSync, rmdirSync } from "fs";
import { basename, join } from "path";
import { logCompletion } from "./io";

const path = join(__dirname, "../dist");

if (existsSync(path)) {
  rmdirSync(path, { recursive: true });
}

mkdirSync(join(path, "content/auto"), { recursive: true });

const script = basename(__filename, ".ts");
logCompletion(script);
