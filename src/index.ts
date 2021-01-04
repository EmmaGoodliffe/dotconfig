import { checkboxes, confirm as inputConfirm } from "input";
import { join } from "path";
import core from "./core";

const dir = join(__dirname, "../output");

core(dir, {
  confirm(label: string, defaultAnswer: boolean) {
    return inputConfirm(label, { default: defaultAnswer });
  },
  inputPackages(packages) {
    const question = "Which packages would you like to configure?";
    const choices = packages.map(pkg => ({ name: pkg }));
    const fullChoices = [...choices, { name: "---", disabled: true }];
    return checkboxes(question, fullChoices);
  },
  onPackageComplete(pkg) {
    console.log(`\u2713 ${pkg}`);
  },
  onCommandError(err) {
    console.error(`Command error: ${err}`);
  },
}).catch(console.error);
