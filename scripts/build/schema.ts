import { spawnSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

const tsPath = resolve(__dirname, "../../src/types.ts");
const tsType = "Templates";
const schemaPath = resolve(__dirname, "../../dist/schema.json");
const command = "npm";
const args = ["run", "build:schema", "--", "--path", tsPath, "--type", tsType];

const schema = (): void => {
  const result = spawnSync(command, args);
  const error = result.stderr.toString();
  if (error) {
    throw error;
  }
  const raw = result.stdout.toString();
  const lines = raw.split("\n");
  const schemaLines = lines.filter(line => line.trim().slice(0, 1) !== ">");
  const schemaRaw = schemaLines.join(" ");

  writeFileSync(schemaPath, JSON.stringify(JSON.parse(schemaRaw)));
};

export default schema;
