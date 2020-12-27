interface ArrayAddModifier {
  add: string;
}

// TODO: change how set modifier works
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

interface Dependencies {
  dependencies: string[];
  devDependencies: string[];
}

export interface TemplateResult extends Dependencies {
  commands: string[];
}

export interface File_ {
  file: string;
  url?: string;
  commands?: string[];
  override?: boolean;
}

export interface Integration {
  integration: string[];
  template: Template;
  // TODO: Rename to jsonOverrides
  overridesJSON?: { file: string; changes: Change[] }[];
}

export interface Template extends Dependencies {
  files?: File_[];
  integrations?: Integration[];
  extensions?: {
    [extension: string]: {
      default: boolean;
      template: Template;
    };
  };
}

export interface Templates {
  [pkg: string]: Template;
}
