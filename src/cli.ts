import chalk from "chalk";
import { existsSync, mkdirSync } from "fs";
import { checkboxes, confirm } from "input";
import { dirname, join } from "path";
import { argv } from "yargs";
import { version } from "../package.json";
import helpDocs from "./help";
import core, { Options } from "./index";

const helpTip = `Run ${chalk.blue("dotconfig --help")} for documentation`;

export const ui: Ui = {
  confirm(label, defaultAnswer) {
    return confirm(label, { default: defaultAnswer });
  },
  inputPackages(allPackages) {
    return checkboxes(
      "Which packages would you like to configure?",
      allPackages.map(pkg => ({ name: pkg })),
    );
  },
  onCommandError(command, err) {
    throw new Error(
      `Command error running ${chalk.blue(command)}: ${chalk.red(err)}`,
    );
  },
};

type Ui = Options["ui"];

const getExpRecError = (
  description: string,
  expected: string,
  received: string,
) => `Expected ${description} to be ${expected}; received ${received}`;

const getArgNumError = (argNumReceived: number) =>
  getExpRecError("number of dotconfig arguments", "1", `${argNumReceived}`);

const run = async () => {
  if (argv.help) {
    console.log(helpDocs(version));
    return;
  }
  if (argv.v || argv.version) {
    console.log(version);
    return;
  }
  if (argv._.length === 0) {
    const err = getArgNumError(argv._.length);
    const tip = `If you want to run dotconfig in the current directory, run ${chalk.blue(
      "dotconfig .",
    )} or ${helpTip.toLowerCase()}`;
    throw new Error(`${err}. ${tip}`);
  } else if (argv._.length > 1) {
    const err = getArgNumError(argv._.length);
    throw new Error(`${err}. ${helpTip}`);
  }
  const dir = join(dirname(""), `${argv._[0]}`);
  !existsSync(dir) && mkdirSync(dir, { recursive: true });
  await core(dir, { ui });
};

run().catch(console.error);
