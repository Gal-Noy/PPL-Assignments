import {
  Result,
  makeFailure,
  makeOk,
  bind,
  either,
  isOk,
  isFailure,
} from "../lib/result";
import * as R from "ramda";

/* Library code */
const findOrThrow = <T>(pred: (x: T) => boolean, a: T[]): T => {
  for (let i = 0; i < a.length; i++) {
    if (pred(a[i])) return a[i];
  }
  throw "No element found.";
};

export const findResult: <T>(pred: (x: T) => boolean, a: T[]) => Result<T> = <
  T
>(
  pred: (x: T) => boolean,
  a: T[]
): Result<T> => {
  const reducer = (acc: [Result<T>, boolean], curr: T): [Result<T>, boolean] =>
    acc[1]
      ? acc
      : pred(curr)
      ? [makeOk(curr), true]
      : [makeFailure("No element found."), false];
  const finalTuple: [Result<T>, boolean] = R.reduce(
    reducer,
    [makeFailure("No element found."), false],
    a
  );
  return finalTuple[0];
};

/* Client code */
const returnSquaredIfFoundEven_v1 = (a: number[]): number => {
  try {
    const x = findOrThrow((x) => x % 2 === 0, a);
    return x * x;
  } catch (e) {
    return -1;
  }
};

export const returnSquaredIfFoundEven_v2: (a: number[]) => Result<number> = (
  a: number[]
): Result<number> => {
  const res: Result<number> = findResult((x: number) => x % 2 === 0, a);
  return bind(
    res,
    (value: number): Result<number> => (isOk(res) ? makeOk(value * value) : res)
  );
};

export const returnSquaredIfFoundEven_v3: (a: number[]) => number = (
  a: number[]
): number => {
  const res: Result<number> = findResult((x: number) => x % 2 === 0, a);
  return either(
    res,
    (): number => (isOk(res) ? res.value * res.value : -1),
    (): number => (isFailure(res) ? -1 : res.value * res.value)
  );
};
