import * as R from "ramda";
import { Dictionary } from "ramda";

const stringToArray = R.split("");

type LetterCount = Dictionary<number>;

/* Question 1 */
export const countLetters: Function = (str : string) : LetterCount => {
    const addOrInc = (freqs: LetterCount, c: string): LetterCount => {
        const newFreqs = { ...freqs };
        const currentCount = newFreqs[c] || 0;
        newFreqs[c] = currentCount + 1;
        return newFreqs;
    }
    const isLetter = (str : string) : boolean => (str.length === 1) && (/[a-z]/i.test(str));
    const filterLetters = (strs : string[]) : string[] => R.filter(isLetter, strs);
    const mapToLowercase = (strs: string[]) : string[] => R.map((x: string) : string => x.toLowerCase(), strs);
    const mapAndFilter = R.pipe(filterLetters, mapToLowercase);

    return R.reduce(addOrInc, {}, mapAndFilter(stringToArray(str)));
}

/* Question 2 */
export const isPaired: undefined = undefined

/* Question 3 */
export type WordTree = {
    root: string;
    children: WordTree[];
}

export const treeToSentence : undefined = undefined

