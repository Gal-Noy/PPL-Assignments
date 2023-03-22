import { Result, makeFailure, makeOk, bind, either } from "../lib/result";
import * as R from "ramda";
import { Dictionary } from "ramda";

/* Library code */
const findOrThrow = <T>(pred: (x: T) => boolean, a: T[]): T => {
  for (let i = 0; i < a.length; i++) {
    if (pred(a[i])) return a[i];
  }
  throw "No element found.";
};

export const findResult: Function = <T>(
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

export const returnSquaredIfFoundEven_v2: undefined = undefined;

export const returnSquaredIfFoundEven_v3: undefined = undefined;
