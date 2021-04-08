import { existsSync, mkdirSync, rmdirSync } from "fs";
import { join } from "path";
import core from "../src";
import { ui } from "../src/cli";

const dir = join(__dirname, "output", "manual");
existsSync(dir) && rmdirSync(dir, { recursive: true });
mkdirSync(dir, { recursive: true });

core(dir, { ui }).catch(console.error);
