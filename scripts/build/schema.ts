import { writeFileSync } from "fs";
import { resolve } from "path";
import { createGenerator } from "ts-json-schema-generator";

const tsPath = resolve(__dirname, "../../src/types.ts");
const tsType = "Templates";
const schemaPath = resolve(__dirname, "../../dist/schema.json");
const tsConfigPath = resolve(__dirname, "../../tsconfig.json");

const config = {
  path: tsPath,
  tsconfig: tsConfigPath,
  type: tsType,
};

const schema = (): void => {
  const theSchema = createGenerator(config).createSchema(config.type);
  writeFileSync(schemaPath, JSON.stringify(theSchema));
};

export default schema;
