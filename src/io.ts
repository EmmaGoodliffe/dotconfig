import chalk from "chalk";
import { spawn } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import fetch from "node-fetch";
import { dirname } from "path";
import { Options } from "./index";

const defaultUrl =
  "https://raw.githubusercontent.com/EmmaGoodliffe/default/master/";

export const getTemplateFile = async (file: string) => {
  const url = defaultUrl + file;
  const response = await fetch(url);
  const text = await response.text();
  if (response.ok) {
    return text;
  }
  throw new Error(
    `Template file ${chalk.blue(url)} failed (${chalk.red(
      response.status,
    )}): ${chalk.red(text)}`,
  );
};

export const write = (path: string, text: string) => {
  const pathDir = dirname(path);
  const exists = existsSync(pathDir);
  !exists && mkdirSync(pathDir, { recursive: true });
  writeFileSync(path, text);
};

export const info = (content: string, log: Options["ui"]["log"]) =>
  log(`${chalk.blue("i")} ${content}`);

const runCommand = async (
  command: string,
  dir: string,
  log: Options["ui"]["log"],
): Promise<void> => {
  await log(chalk.blue(`=== ${command} ===`));
  return new Promise((resolve, reject) => {
    const words = command.split(" ");
    const main = words[0];
    const args = words.slice(1);
    const output = spawn(main, args, { cwd: dir, stdio: "inherit" });
    output.on("close", () => resolve());
    output.on("error", err => reject(err));
  });
};

export const runWrappedCommand = async (
  command: string,
  dir: string,
  log: Options["ui"]["log"],
  onCommandError: Options["ui"]["onCommandError"],
) => {
  try {
    await runCommand(command, dir, log);
  } catch (err) {
    await onCommandError(command, err);
  }
};
