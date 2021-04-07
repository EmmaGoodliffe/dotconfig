import { spawnSync } from "child_process";
import { mkdirSync, readdirSync, readFileSync, rmdirSync } from "fs";
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

interface PackageJson {
  scripts: Record<string, string>;
}

const parentDir = join(__dirname, "output");

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

const getFile = (dir: string, path: string) =>
  readFileSync(join(dir, path)).toString();

const getPackageJson = (dir: string) =>
  JSON.parse(getFile(dir, "package.json")) as PackageJson;

const reset = (parentDir: string): void => {
  for (const childDir of readdirSync(parentDir)) {
    const path = join(parentDir, childDir);
    rmdirSync(path, { recursive: true });
  }
};

beforeAll(() => reset(parentDir));

test("API Extractor", async () => {
  await core(getDir(), getOptions(["API Extractor"])).catch(err =>
    expect(err.message).toMatch("TypeScript"),
  );
  const dir = getDir();
  const deps = await core(dir, getOptions(["API Extractor", "TypeScript"]));
  const packageJson = getPackageJson(dir);
  expect(checkDeps(deps, [/@microsoft/])).toBeTruthy();
  expect(packageJson.scripts.docs).toMatch("api-extractor");
  expect(getFile(dir, "tsconfig.json")).not.toMatch('// "declaration"');
  expect(getFile(dir, "tsconfig.json")).not.toMatch(
    '"mainEntryPointFilePath": "<projectFolder>/',
  );
});

test("Dotenv", async () => {
  const dir = getDir();
  const deps = await core(dir, getOptions(["Dotenv"]));
  expect(checkDeps(deps, [/dotenv/])).toBeTruthy();
  expect(getFile(dir, ".env")).toBe("");
});

test("ESLint", async () => {
  const vanillaDir = getDir();
  const vanillaDeps = await core(vanillaDir, getOptions(["ESLint"]));
  const vanillaPackageJson = getPackageJson(vanillaDir);
  expect(checkDeps(vanillaDeps, [/eslint/])).toBeTruthy();
  expect(vanillaPackageJson.scripts.lint).toMatch("eslint");
  expect(vanillaPackageJson.scripts.lint).not.toMatch("prettier");
  // TODO: test ESLint configs
  const prettierDir = getDir();
  const prettierDeps = await core(
    prettierDir,
    getOptions(["ESLint", "Prettier"]),
  );
  const prettierPackageJson = getPackageJson(prettierDir);
  expect(
    checkDeps(prettierDeps, [/eslint/, /eslint-plugin-prettier/]),
  ).toBeTruthy();
  expect(prettierPackageJson.scripts.lint).toMatch("eslint");
  expect(prettierPackageJson.scripts.lint).toMatch("prettier");
  const tsDir = getDir();
  const tsDeps = await core(tsDir, getOptions(["ESLint", "TypeScript"]));
  expect(checkDeps(tsDeps, [/eslint/, /@typescript-eslint/])).toBeTruthy();
  const bothDir = getDir();
  const bothDeps = await core(
    bothDir,
    getOptions(["ESLint", "Prettier", "TypeScript"]),
  );
  const bothPackageJson = getPackageJson(bothDir);
  expect(
    checkDeps(bothDeps, [
      /eslint/,
      /eslint-plugin-prettier/,
      /@typescript-eslint/,
    ]),
  ).toBeTruthy();
  expect(bothPackageJson.scripts.lint).toMatch("eslint");
  expect(bothPackageJson.scripts.lint).toMatch("prettier");
});

test("Git", async () => {
  const dir = getDir();
  await core(dir, getOptions(["Git"]));
  const gitIgnore = getFile(dir, ".gitignore");
  expect(gitIgnore).toMatch("node_modules");
  expect(gitIgnore).not.toMatch(".env");
  const dotenvDir = getDir();
  await core(dotenvDir, getOptions(["Git", "Dotenv"]));
  const dotenvGitIgnore = getFile(dotenvDir, ".gitignore");
  expect(dotenvGitIgnore).toMatch("node_modules");
  expect(dotenvGitIgnore).toMatch(".env");
});

test("GitHub", async () => {
  const dir = getDir();
  await core(dir, getOptions(["GitHub"]));
  expect(
    getFile(dir, ".github/PULL_REQUEST_TEMPLATE.md").length,
  ).toBeGreaterThan(0);
});

test("Jest", async () => {
  const vanillaDir = getDir();
  const vanillaDeps = await core(vanillaDir, getOptions(["Jest"]));
  const vanillaPackageJson = getPackageJson(vanillaDir);
  expect(checkDeps(vanillaDeps, [/jest/])).toBeTruthy();
  expect(checkDeps(vanillaDeps, [/ts-jest/])).toBeFalsy();
  expect(vanillaPackageJson.scripts.test).toMatch("jest");
  const tsDir = getDir();
  const tsDeps = await core(tsDir, getOptions(["Jest", "TypeScript"]));
  const tsPackageJson = getPackageJson(tsDir);
  expect(checkDeps(tsDeps, [/jest/, /ts-jest/])).toBeTruthy();
  expect(tsPackageJson.scripts.test).toMatch("jest");
});

test("Prettier", async () => {
  const dir = getDir();
  const deps = await core(dir, getOptions(["Prettier"]));
  expect(checkDeps(deps, [/prettier/])).toBeTruthy();
  expect(getFile(dir, ".prettierrc").length).toBeGreaterThan(0);
});

// TODO: other packages
