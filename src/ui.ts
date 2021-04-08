import chalk from "chalk";
import { checkboxes, confirm, select } from "input";
import { Options } from "./index";

const ui: Ui = {
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
  async inputPackages(allPackages) {
    if (allPackages.length === 0) {
      throw new Error("No compatible packages found");
    } else if (allPackages.length === 1) {
      return (await confirm(`Would you like to configure ${allPackages[0]}?`))
        ? [allPackages[0]]
        : [];
    } else {
      return await checkboxes(
        "Which packages would you like to configure?",
        allPackages.map(pkg => ({ name: pkg })),
      );
    }
  },
  onCommandError(command, err) {
    throw new Error(
      `Command error running ${chalk.blue(command)}: ${chalk.red(err)}`,
    );
  },
};

type Ui = Options["ui"];

export default ui;
