import { spawn } from "child_process";
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

export const runCommand = (command: string, dir: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const words = command.split(" ");
    const main = words[0];
    const args = words.slice(1);
    const output = spawn(main, args, { cwd: dir, stdio: "inherit" });
    output.on("close", () => resolve());
    output.on("error", err => reject(err));
  });
};
