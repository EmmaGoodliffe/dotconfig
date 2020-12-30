import { readdirSync, readFileSync, writeFileSync } from "fs";
import { extname, join } from "path";
import stripJsonComments from "strip-json-comments";

const path = join(__dirname, "../src/content/auto");

const files = readdirSync(path);
const jsonFiles = files.filter(file => extname(file) === ".json");
const jsonPaths = jsonFiles.map(file => join(path, file));
const texts = jsonPaths.map(path => readFileSync(path).toString());
const uncommentedTexts = texts.map(text => stripJsonComments(text));
const objects = uncommentedTexts.map(text => JSON.parse(text));

for (const index in jsonPaths) {
  const path = jsonPaths[index];
  const obj = objects[index];
  writeFileSync(path, JSON.stringify(obj, null, 2));
}
