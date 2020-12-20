import Ajv from "ajv";
import { readFileSync } from "fs";

const ajv = new Ajv();

const removeDotPrefix = (x: string) => {
  if (x.slice(0, 1) === ".") {
    x = x.slice(1);
  }
  return x;
};

const parseDataPath = (dataPath: string) => {
  const elements = dataPath
    .split("/")
    .filter(el => el.trim().length)
    .map(el => {
      const num = parseInt(el);
      return isNaN(num) ? `.${el}` : `[${num}]`;
    });
  const result = removeDotPrefix(elements.join(""));
  return result;
};

const runSchema = (data: Record<string, unknown>, schemaPath: string): void => {
  const schema = JSON.parse(readFileSync(schemaPath).toString());

  const validate = ajv.compile(schema);
  const result = validate(data);

  if (!result) {
    if (!validate.errors) {
      throw "Unknown error validating schema";
    }
    for (const error of validate.errors) {
      console.error("Error details:", error);
      throw `Data does not match schema. ${parseDataPath(error.dataPath)} ${
        error.message
      }`;
    }
  }
};

export default runSchema;
