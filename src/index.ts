import { checkboxes } from "input";

const packages = [
  "ESLint",
  "Prettier",
  "Git",
  "GitHub",
  "Svelte",
  "Tailwind",
  "API Extractor",
  "Typescript",
  "Jest",
] as const;

const run = async () => {
  const requestedPackages = await checkboxes(
    "Choose",
    packages.map(pkg => ({ name: pkg })),
  );
};
