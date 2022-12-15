/**
 * Given an object that looks like:
 * ```ts
 * interface Person {
 *   firstName: string;
 *   lastName: string;
 *   age: number;
 *   admin: boolean;
 * }
 * ```
 *
 * To filter for all the attributes with a given type,
 * ```ts
 * type KeysOfPersonThatAreStrings = FilterKeysByType<Person, string>; // => 'firstName' | 'lastName'
 * ```
 *
 * Implementation:
 *
 * ```ts
 * type KeysOfPerson = keyof Person; // => 'firstName' | 'lastName' | 'age' | 'admin';
 *
 * type ValuesOfPerson = Person[KeysOfPerson]; // == Person['firstName' | 'lastName' | 'age']
 *                                             // == Person['firstName'] | Person['lastName'] | Person['age'] | Person['admin']
 *                                             // == string | string | number | boolean
 *                                             // => string | number | boolean
 *
 * // Note that TS collapses unions to a minimum, removing any redudant types, e.g.
 * type A = string | 'foo'; // => string (because 'foo' is already covered by string)
 * type B = number | 1; // => number (likewise)
 * type C = string | 'foo' | 'bar' | number | 1 | 2; // => string | number
 * type D = string | number | never; // => string | number (`never` in unions are like `cond || false` in JS, it's a no-op)
 *
 * // Putting all of this together, we first convert `Person` to an intermediate form like this:
 *
 * interface IntermediatePersonThingy {
 *   firstName: 'firstName';
 *   lastName: 'lastName';
 *   age: never;
 *   admin: never;
 * }
 *
 * // For all the fields that have the type we are looking for, we replaced their types with the key.
 * // Otherwise, we replace their types with `never`.
 * // Knowing that we can get a union of all the values of this with `IntermediatePersonThingy[keyof Person]`,
 * // AND that TS collapses away any `never`s in an union, we can get our final result with:
 *
 * type KeysOfPersonThatAreStrings = IntermediatePersonThingy[keyof Person];
 * ```
 */
export type FilterKeysByType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
