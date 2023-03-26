import * as R from "ramda";
import { Dictionary } from "ramda";

const stringToArray = R.split("");

type LetterCount = Dictionary<number>;

const filterLetters = (strs: string[]): string[] => R.filter((c) => /[a-z]/i.test(c), strs);
const mapToLowercase = (strs: string[]): string[] => R.map((c) => R.toLower(c), strs);
const mapAndFilter = R.pipe(filterLetters, mapToLowercase);
/* Question 1 */
export const countLetters: (str: string) => LetterCount = (str: string): LetterCount =>
  R.countBy(R.toLower, mapAndFilter(stringToArray(str)));

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
const joinWords = (strs: string[]): string =>
  R.reduce((acc: string, curr: string): string => R.concat(R.concat(acc, " "), curr), "", strs);

export const treeToSentence: (t: WordTree) => string = (t: WordTree): string =>
  R.trim(joinWords(R.flatten(treeToArray(t))));
