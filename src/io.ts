import { existsSync, mkdirSync, promises } from "fs";
import fetch from "node-fetch";
import { dirname, resolve } from "path";
import { parse } from "url";
import { File_ } from "./types";

export const { readFile, writeFile } = promises;

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
  files: File_[] = [],
  outputDir: string,
): Promise<void[]> => {
  const promises = files.map(async file => {
    const url = file.url || defaultUrl + file.file;
    const raw = await getFile(url);
    const path = resolve(outputDir, file.file);
    const dir = dirname(path);
    recursivelyCreateDir(dir);
    await writeFile(path, raw);
  });
  return Promise.all(promises);
};
