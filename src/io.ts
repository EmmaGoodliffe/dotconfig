import { existsSync, mkdirSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import { dirname } from "path";

const defaultUrl =
  "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";

export const getTemplateFile = async (file: string): Promise<string> => {
  const url = defaultUrl + file;
  const response = await fetch(url);
  const text = await response.text();
  return text;
};

export const write = (path: string, text: string): void => {
  const pathDir = dirname(path);
  const exists = existsSync(pathDir);
  !exists && mkdirSync(pathDir, { recursive: true });
  writeFileSync(path, text);
};
