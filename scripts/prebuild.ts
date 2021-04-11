import { existsSync, readFileSync, rmdirSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { logCompletion } from "./io";

const path = join(__dirname, "../dist");

if (existsSync(path)) {
  rmdirSync(path, { recursive: true });
}

const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json")).toString(),
) as { version: string };
const { version } = packageJson;
const envPath = join(__dirname, "../.env");
const envContent = `VERSION=${version}`;
writeFileSync(envPath, envContent);

const script = basename(__filename, ".ts");
logCompletion(script);
