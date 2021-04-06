import { spawnSync } from "child_process";
import { mkdirSync, readdirSync, readFileSync, rmdirSync } from "fs";
import { join } from "path";
import core from "../src";

const parentDir = join(__dirname, "output");

const ui = {
  confirm: (label: string, defaultAnswer: boolean) => defaultAnswer,
  onCommandError(err: string) {
    throw new Error(err);
  },
};

const getDir = () => {
  const dir = join(parentDir, `${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  spawnSync("npm", ["init", "-y"], { cwd: dir });
  return dir;
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
  JSON.parse(getFile(dir, "package.json")) as {
    scripts: Record<string, string>;
  };

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
