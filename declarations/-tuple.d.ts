export type Lit = string | number | boolean | undefined | null | void | {};
export default function tuple<T extends Lit[]>(...args: T): T;
//# sourceMappingURL=-tuple.d.ts.map