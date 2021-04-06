import chalk from "chalk";
import { readdirSync, rmdirSync } from "fs";
import { join } from "path";

export const reset = (parentDir: string): void => {
  for (const childDir of readdirSync(parentDir)) {
    const path = join(parentDir, childDir);
    rmdirSync(path, { recursive: true });
  }
};

export const logError = (err: string | Error): void =>
  console.error(chalk.red(err));
