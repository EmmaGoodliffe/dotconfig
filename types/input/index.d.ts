type Validate<T> = (answer: T) => boolean;

interface Choice<N extends string> {
  name: N;
  disabled?: boolean;
}

interface ChoiceWithValue<N, V> extends CbChoice<N> {
  value?: V;
}

interface CbChoice<N> extends Choice<N> {
  checked?: boolean;
}

interface CbChoiceWithValue<N, V> extends CbChoice<N> {
  value?: V;
}

declare module "input" {
  function checkboxes<N>(
    label: string,
    choices: CbChoice<N>[],
    options?: { validate?: Validate<N[]> },
  ): Promise<N[]>;
  function checkboxes<N, V>(
    label: string,
    choices: CbChoiceWithValue<N, V>[],
    options?: { validate?: Validate<V[]> },
  ): Promise<V[]>;
  function confirm(
    label: string,
    options?: { default?: boolean; validate?: Validate<boolean> },
  ): Promise<boolean>;
  function select<N>(
    label: string,
    choices: Choice<N>[],
    options?: { default?: N; validate?: Validate<N> },
  ): Promise<N>;
  function select<N, V>(
    label: string,
    choices: ChoiceWithValue<N, V>[],
    options?: { default?: N; validate?: Validate<V> },
  ): Promise<V>;
}
