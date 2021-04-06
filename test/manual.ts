import { spawnSync } from "child_process";
import { existsSync, mkdirSync, rmdirSync } from "fs";
import { checkboxes, confirm } from "input";
import { join } from "path";
import core from "../src";
import { logError } from "./io";

const dir = join(__dirname, "output", "manual");
existsSync(dir) && rmdirSync(dir, { recursive: true });
mkdirSync(dir, { recursive: true });
spawnSync("npm", ["init", "-y"], { cwd: dir });

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
    onCommandError(err) {
      throw new Error(`Command error: ${err}`);
    },
  },
}).catch(logError);
