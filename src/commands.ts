import { existsSync } from "fs";
import { confirm } from "input";
import { resolve } from "path";
import { Command } from "./types";

const formatList = (arr: string[]) => (arr.length ? arr.join("\n") : "None");

const getQuestion = (
  command: string,
  files: string[],
  outputDir: string,
): [string, string[]] => {
  const uniqueFiles = Array.from(new Set(files));
  const affectedFiles = uniqueFiles.filter(file => {
    const path = resolve(outputDir, file);
    return existsSync(path);
  });
  const formattedFiles = formatList(affectedFiles);
  return [
    `Do you want to run ${command} which will override the following files?: ${formattedFiles}`,
    affectedFiles,
  ];
};

const run = (command: string) => {
  console.log(`Run: ${command}`);
};

const commands = async (
  theCommands: Command[],
  outputDir: string,
): Promise<void> => {
  const files = theCommands.map(command => command.affectedFiles).flat();
  const description = "automatic configuration";
  const [question, affectedFiles] = getQuestion(description, files, outputDir);
  const options = { default: !affectedFiles.length };
  const shouldRunAll = await confirm(question, options);
  if (shouldRunAll) {
    for (const command of theCommands) {
      run(command.command);
    }
  } else {
    for (const command of theCommands) {
      const [question, affectedFiles] = getQuestion(
        command.command,
        command.affectedFiles,
        outputDir,
      );
      const options = { default: !affectedFiles.length };
      if (await confirm(question, options)) {
        run(command.command);
      }
    }
  }
};

export default commands;
