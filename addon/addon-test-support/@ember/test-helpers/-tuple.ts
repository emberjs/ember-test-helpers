export type Lit = string | number | boolean | undefined | null | void | {};

// eslint-disable-next-line require-jsdoc
export default function tuple<T extends Lit[]>(...args: T) {
  return args;
}
