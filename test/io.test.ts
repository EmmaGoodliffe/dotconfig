import { spawnSync } from "child_process";
import { mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { getTemplateFile, runWrappedCommand, write } from "../src/io";

const parentDir = join(__dirname, "output");

const getDir = () => {
  const dir = join(parentDir, `${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  spawnSync("npm", ["init", "-y"], { cwd: dir });
  return dir;
};

test("getTemplateFile", async () => {
  const template = await getTemplateFile(".github/PULL_REQUEST_TEMPLATE.md");
  expect(template.length).toBeGreaterThan(0);
  try {
    await getTemplateFile("foo");
  } catch (err) {
    expect(`${err}`).toMatch("404");
  }
});

test("runWrappedCommand", async () => {
  runWrappedCommand('echo "hi"', getDir(), console.error);
});

test("write", async () => {
  const dir = getDir();
  const path = join(dir, "foo.txt");
  write(path, "bar");
  expect(readFileSync(path).toString()).toBe("bar");
  const path2 = join(dir, "foo/bar/baz.txt");
  write(path2, "quux");
  expect(readFileSync(path2).toString()).toBe("quux");
});
