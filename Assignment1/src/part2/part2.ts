import * as R from "ramda";
import { Dictionary } from "ramda";

const stringToArray = R.split("");

type LetterCount = Dictionary<number>;

/* Question 1 */
export const countLetters: (str: string) => LetterCount = (str: string): LetterCount =>
  R.pipe(
    R.filter((c) => /[a-z]/i.test(c)),
    R.map(R.toLower),
    R.countBy(R.identity)
  )(stringToArray(str));

const handleStack = (stack: string[], open: string, close: string): string[] =>
  R.last(stack) === open ? R.dropLast(1, stack) : R.concat(stack, [close]);
const reducer = (acc: string[], curr: string): string[] =>
  curr === ")"
    ? handleStack(acc, "(", curr)
    : curr === "]"
    ? handleStack(acc, "[", curr)
    : curr === "}"
    ? handleStack(acc, "{", curr)
    : curr === "(" || curr === "[" || curr === "{"
    ? R.concat(acc, [curr])
    : acc;
/* Question 2 */
export const isPaired: (str: string) => boolean = (str: string): boolean =>
  R.isEmpty(R.reduce(reducer, [], stringToArray(str)));

/* Question 3 */
export type WordTree = {
  root: string;
  children: WordTree[];
};

const treeToArray = (t: WordTree): Array<any> => [t.root, R.map(treeToArray, t.children)];
export const treeToSentence: (t: WordTree) => string = (t: WordTree): string =>
  R.trim(R.reduce((acc: string, curr: string): string => acc + " " + curr, "", R.flatten(treeToArray(t))));
