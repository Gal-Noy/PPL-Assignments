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
export const isPaired: Function = (str : string) : boolean => {
    const strArray = stringToArray(str);
    
    const checkLetter = (c : string, open : string, close: string) : number => c === open ? 1 : c === close ? -1 : 0;
    const accByType = (open: string, close: string) => (acc : [boolean, number], curr : string) : [boolean, number] => {
        const counter = acc[1] + checkLetter(curr, open, close);
        return [counter < 0 ? false : true && acc[0] ,counter];
    }

    const checkBrackets = (strs : string[], open: string, close: string) : boolean =>  {
        const outcome = R.reduce(accByType(open, close), [true, 0], strs);
        return outcome[0] && outcome[1] === 0;
    }

    return checkBrackets(strArray, '(', ')') && checkBrackets(strArray, '[', ']') && checkBrackets(strArray, '{', '}');
}

/* Question 3 */
export type WordTree = {
    root: string;
    children: WordTree[];
}

export const treeToSentence : undefined = undefined

