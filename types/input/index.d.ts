type Validate<T> = (answer: T) => boolean;

type Cb<T> = T & { checked?: boolean };

interface Choice<N extends string> {
  name: N;
  disabled?: false;
}

interface ChoiceWithValue<N, V> extends Choice<N> {
  value?: V;
}

interface DisabledChoice<N> extends ChoiceWithValue<N, never> {
  disabled: true;
}

declare module "input" {
  function checkboxes<N, DN>(
    label: string,
    choices: (Cb<Choice<N>> | Cb<DisabledChoice<DN>>)[],
    options?: { validate?: Validate<N[]> },
  ): Promise<N[]>;
  function checkboxes<N, DN, V>(
    label: string,
    choices: (Cb<ChoiceWithValue<N, V>> | Cb<DisabledChoice<DN>>)[],
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
    options?: { default?: V; validate?: Validate<V> },
  ): Promise<V>;
}
