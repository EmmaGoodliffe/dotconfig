declare module "input" {
  interface Choice<T> {
    name: string;
    value?: T;
    disabled?: boolean;
  }

  function checkboxes<T>(
    label: string,
    choices: Choice<T>[],
    options?: { validate?: (answer: T[]) => boolean },
  ): Promise<T[]>;
  function confirm(
    label: string,
    options?: { default?: boolean; validate?: (answer: boolean) => boolean },
  ): Promise<boolean>;
}
