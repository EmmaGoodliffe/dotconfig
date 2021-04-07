import chalk from "chalk";
import { existsSync, mkdirSync, rmdirSync } from "fs";
import { checkboxes, confirm } from "input";
import { join } from "path";
import core from "../src";

const dir = join(__dirname, "output", "manual");
existsSync(dir) && rmdirSync(dir, { recursive: true });
mkdirSync(dir, { recursive: true });

core(dir, {
  ui: {
    confirm(label, defaultAnswer) {
      return confirm(label, { default: defaultAnswer });
    },
    inputPackages(allPackages) {
      return checkboxes(
        "Which packages would you like to auto-configure?",
        allPackages.map(pkg => ({ name: pkg })),
      );
    },
    onCommandError(command, err) {
      throw new Error(
        `Command error running ${chalk.blue(command)}: ${chalk.red(err)}`,
      );
    },
  },
}).catch(console.error);
