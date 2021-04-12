import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import yargs, { argv } from "yargs";
import ui from "./ui";
import core from "./index";

const run = async () => {
  yargs.usage("Usage: $0 <path> [options]");
  yargs.demandCommand(1);
  yargs.alias("v", "version");
  yargs.example("$0 .", "Configure current directory");
  yargs.example("$0 ./foo/bar", "Configure child directory");
  const dir = join(dirname(""), `${argv._[0]}`);
  !existsSync(dir) && mkdirSync(dir, { recursive: true });
  await core(dir, { ui });
};

run().catch(console.error);
