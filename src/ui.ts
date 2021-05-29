import chalk from "chalk";
import { checkboxes, confirm, select } from "input";
import { Options } from "./index";

const divider = "---";

const plainDividerCheckboxes = <T extends string>(
  label: string,
  choices: { name: T }[],
) => {
  const dividerChoices: (
    | { name: T }
    | { name: typeof divider; disabled: true }
  )[] = [...choices, { name: divider, disabled: true }];
  return checkboxes<T, typeof divider>(label, dividerChoices);
};

const ui: Options["ui"] = {
  confirm(label, defaultAnswer) {
    return confirm(label, { default: defaultAnswer });
  },
  inputEnd() {
    return select("Is your project front-end or back-end?", [
      { name: "Front-end", value: "front" },
      { name: "Back-end", value: "back" },
      { name: "Full-stack (both)", value: "both" },
    ]);
  },
  inputPackages(allPackages) {
    return plainDividerCheckboxes(
      "Which packages would you like to configure?",
      allPackages.map(pkg => ({ name: pkg, disabled: false })),
    );
  },
  log: console.log,
  onCommandError(command, err) {
    throw new Error(
      `Command error running ${chalk.blue(command)}: ${chalk.red(err)}`,
    );
  },
};

export default ui;
