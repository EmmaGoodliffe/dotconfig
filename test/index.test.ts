import { spawnSync } from "child_process";
import { mkdirSync, readdirSync, rmdirSync } from "fs";
import { join } from "path";
import core from "../src";

/*
API Extractor - TypeScript
Dotenv -
ESLint - Prettier TypeScript
Git -
GitHub -
Jest - TypeScript
Prettier -
Svelte - SCSS Tailwind TypeScript
Tailwind - SCSS
*/

const expectations = {
  "API Extractor": {
    files: ["api-extractor.json"],
    patterns: [/@microsoft/],
  },
} as const;

const parentDir = join(__dirname, "output");

const reset = () => {
  for (const childDir of readdirSync(parentDir)) {
    const path = join(parentDir, childDir);
    rmdirSync(path, { recursive: true });
  }
};

const getDir = () => {
  const dir = join(parentDir, `${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  spawnSync("npm", ["init", "-y"], { cwd: dir });
  return dir;
};

const ui = {
  confirm: (label: string, defaultAnswer: boolean) => defaultAnswer,
  onCommandError(err: string) {
    throw new Error(err);
  },
};

const getOptions = <T>(packages: T[]) => ({
  ui: { ...ui, inputPackages: () => packages },
  autoInstall: false,
});

const checkDeps = (deps: string[], patterns: RegExp[]) =>
  patterns.every(pattern => deps.some(dep => pattern.test(dep)));

beforeAll(reset);

test("API Extractor", async () => {
  expect.assertions(2);
  const dir = getDir();
  await core(dir, getOptions(["API Extractor"])).catch(err =>
    expect(err.message).toMatch("TypeScript"),
  );
  const deps = await core(dir, getOptions(["API Extractor", "TypeScript"]));
  expect(
    checkDeps(deps, [...expectations["API Extractor"].patterns]),
  ).toBeTruthy();
});
