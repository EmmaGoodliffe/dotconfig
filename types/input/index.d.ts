type Exactly<T, U> = T & Record<Exclude<keyof U, keyof T>, never>;

interface Choice {
  name: string;
  disabled?: boolean;
}

interface ChoiceWithValue<V> extends Choice {
  value?: V;
}

declare module "input" {
  function checkboxes<T extends Exactly<Choice, T>>(
    label: string,
    choices: T[],
    options?: { validate?: (answer: string[]) => boolean },
  ): Promise<string[]>;
  function checkboxes<V>(
    label: string,
    choices: ChoiceWithValue<V>[],
    options?: { validate?: (answer: V[]) => boolean },
  ): Promise<V[]>;
  function confirm(
    label: string,
    options?: { default?: boolean; validate?: (answer: boolean) => boolean },
  ): Promise<boolean>;
}
