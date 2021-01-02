import { checkboxes, confirm as inputConfirm } from "input";
import { join } from "path";
import core, { Package } from "./core";

const dir = join(__dirname, "../output");

const getPackages = (packages: Package[]) => {
  const question = "Which packages would you like to configure?";
  const choices = packages.map(pkg => ({ name: pkg }));
  const fullChoices = [...choices, { name: "---", disabled: true }];
  return checkboxes(question, fullChoices) as Promise<Package[]>;
};

const confirm = (label: string, defaultAnswer: boolean) =>
  inputConfirm(label, { default: defaultAnswer });

core(dir, getPackages, confirm).catch(console.error);
