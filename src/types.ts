interface ArrayAddModifier {
  add: string;
}

interface ObjectSetModifier {
  set: { [key: string]: string };
}

interface ArrayChange {
  type: "Array";
  key: string;
  modifier: ArrayAddModifier;
}

interface ObjectChange {
  type: "Object";
  key: string;
  modifier: ObjectSetModifier;
}

export type Change = ArrayChange | ObjectChange;

export interface File_ {
  file: string;
  url?: string;
}

interface Integration {
  integration: string[];
  template: Template;
  overridesJSON: { file: string; changes: Change[] }[];
}

export interface Template {
  files?: File_[];
  integrations?: Integration[];
  dependencies?: string[];
  devDependencies?: string[];
  npx?: string[];
  extensions?: {
    [name: string]: Template;
  };
}

export interface Templates {
  [pkg: string]: Template;
}
