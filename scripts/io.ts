import chalk from "chalk";

const capitalise = (x: string) => {
  const first = x.slice(0, 1);
  const rest = x.slice(1);
  return first.toUpperCase() + rest;
};

export const logCompletion = (script: string): void =>
  console.log(`${chalk.green("\u2713 script")} ${capitalise(script)}`);
