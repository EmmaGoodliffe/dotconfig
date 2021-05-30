import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import yargs from "yargs";
import ui from "./ui";
import core from "./index";

const run = async () => {
  yargs.usage("Usage: $0 <path> [options]");
  yargs.demandCommand(1);
  yargs.alias("v", "version");
  yargs.option("y", {
    alias: "yes",
    type: "boolean",
    description: "Skip questions and use their default answers",
  });
  const basic = "Configure current directory";
  yargs.example("$0 .", basic);
  yargs.example("$0 ./foo/bar", "Configure child directory");
  yargs.example("$0 . -y", `${basic} using questions' default answers`);
  const dir = join(dirname(""), `${yargs.argv._[0]}`);
  !existsSync(dir) && mkdirSync(dir, { recursive: true });
  await core(dir, { ui });
};

run().catch(console.error);
