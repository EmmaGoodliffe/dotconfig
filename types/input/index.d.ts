type Exactly<T, U> = T & Record<Exclude<keyof U, keyof T>, never>;

interface Choice<N extends string> {
  name: N;
  disabled?: boolean;
}

interface ChoiceWithValue<N, V> extends Choice<N> {
  value?: V;
}

declare module "input" {
  function checkboxes<N, T extends Exactly<Choice<N>, T>>(
    label: string,
    choices: T[],
    options?: { validate?: (answer: N[]) => boolean },
  ): Promise<N[]>;
  function checkboxes<N, V>(
    label: string,
    choices: ChoiceWithValue<N, V>[],
    options?: { validate?: (answer: V[]) => boolean },
  ): Promise<V[]>;
  function confirm(
    label: string,
    options?: { default?: boolean; validate?: (answer: boolean) => boolean },
  ): Promise<boolean>;
}
