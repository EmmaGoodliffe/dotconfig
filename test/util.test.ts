import { sortJson, unique } from "../src/util";

test("sortJson", async () => {
  const good = { a: 0, b: 1 };
  const bad = { d: 3, c: 2 };
  const arrGood = { arr: [{ a: 0, b: 1 }] };
  const arrBad = { arr: [{ d: 3, c: 2 }] };
  expect(JSON.stringify(sortJson(good))).toBe(JSON.stringify(good));
  expect(JSON.stringify(sortJson(bad))).not.toBe(JSON.stringify(bad));
  expect(JSON.stringify(sortJson(arrGood))).toBe(JSON.stringify(arrGood));
  expect(JSON.stringify(sortJson(arrBad))).not.toBe(JSON.stringify(arrBad));
});

test("unique", async () => {
  const good = [0, 1, 2];
  const bad = [0, 1, 1];
  expect(unique(good)).toEqual(good);
  expect(unique(bad)).not.toEqual(bad);
});
