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

export interface Command {
  command: string;
  affectedFiles: string[];
  destructive: boolean;
}

export interface TemplateResult {
  commands: Command[];
  dependencies: string[];
  devDependencies: string[];
}

export interface File_ {
  file: string;
  url?: string;
}

export interface Integration {
  integration: string[];
  template: Template;
  overridesJSON?: { file: string; changes: Change[] }[];
}

export interface Template extends TemplateResult {
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
