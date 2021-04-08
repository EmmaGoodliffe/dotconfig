import chalk from "chalk";
import { checkboxes, confirm, select } from "input";
import { Options } from "./index";

const ui: Options["ui"] = {
  confirm(label, defaultAnswer) {
    return confirm(label, { default: defaultAnswer });
  },
  inputEnd() {
    return select("Is your project front-end or back-end?", [
      ...([
        { name: "Front-end", value: "front" },
        { name: "Back-end", value: "back" },
        { name: "Full-stack (both)", value: "both" },
      ] as const),
    ]);
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

export default ui;
