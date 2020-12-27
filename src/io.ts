import { existsSync, mkdirSync, promises } from "fs";
import { confirm } from "input";
import fetch from "node-fetch";
import { dirname, resolve } from "path";
import { parse } from "url";
import { File_ } from "./types";

const { readFile, writeFile } = promises;

const defaultUrl =
  "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";

const recursivelyCreateDir = (path: string): void => {
  const parent = dirname(path);
  const pathExists = existsSync(path);
  const parentExists = existsSync(parent);
  if (pathExists) {
    return;
  } else if (parentExists) {
    mkdirSync(path);
    return;
  } else {
    recursivelyCreateDir(parent);
    mkdirSync(path);
    return;
  }
};

const getFile = async (url: string) => {
  const isFile = parse(url).protocol === null;
  if (isFile) {
    const buffer = await readFile(resolve(__dirname, url));
    const raw = buffer.toString();
    return raw;
  } else {
    const response = await fetch(url);
    const raw = await response.text();
    return raw;
  }
};

export const writeFiles = (
  files: File_[],
  outputDir: string,
): Promise<string[][]> => {
  const promises = files.map(async file => {
    const fullDefaultUrl = file.commands ? null : defaultUrl + file.file;
    const url = file.url || fullDefaultUrl;
    const raw = url && (await getFile(url));
    const path = resolve(outputDir, file.file);
    const dir = dirname(path);
    recursivelyCreateDir(dir);
    const description = file.override ? "recommended" : "optional";
    const question = `${path} already exists. Do you want to override it (${description})?`;
    const options = { default: file.override };
    const shouldWrite = !existsSync(path) || (await confirm(question, options));
    shouldWrite && raw && (await writeFile(path, raw));
    const result = shouldWrite && file.commands;
    return result || [];
  });
  return Promise.all(promises);
};
