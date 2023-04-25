import {
  CondExp,
  CExp,
  Exp,
  IfExp,
  Program,
  makeIfExp,
  makeCondExp,
  isCondExp,
  isProgram,
  isExp,
  makeBoolExp,
  makeLetExp,
  makeBinding,
  makeLitExp,
  makeCondClause,
  isCExp,
} from "./L31-ast";
import { isArray } from "../shared/type-predicates";
import { Result, makeFailure, makeOk } from "../shared/result";

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> => {
  if (isExp(exp)) {
    console.log("L31ToL3: exp is an Exp");
    if (!isCondExp(exp)) return makeOk(exp);
    else {
      const res = rewriteCond(exp);
      console.log("L31ToL3: res is: ", res);
      return makeOk(res);
    }
    // return isCondExp(exp) ? makeOk(rewriteCond(exp)) : makeOk(exp);
  } else {
    if (isArray(exp.exps))
      return makeOk({ tag: exp.tag, exps: exp.exps.map((e) => (isCondExp(e) ? rewriteCond(e) : e)) });
    else return makeFailure("L31ToL3: exps is not an array");
  }
};

// const rewriteCond = (exp: CondExp): IfExp => { //add error handling
//     const condClauses = exp.condClauses;
//     const elseClause = exp.elseClause;
//     const thenClause = condClauses[0];
//     const restClauses = condClauses.slice(1);
//     return makeIfExp(thenClause.test, thenClause.body[0], rewriteCond(makeCondExp(restClauses.length > 0 ? restClauses : [], elseClause)));
// }
// const rewriteCond = (exp: CondExp): IfExp =>
//     exp.condClauses.length === 0 ? makeIfExp(makeBoolExp(false), makeBoolExp(false), makeBoolExp(false)) :
//     exp.condClauses.length === 1 ? makeIfExp(exp.condClauses[0].test, exp.condClauses[0].body[0], exp.elseClause.body[1]) :
//     makeIfExp(exp.condClauses[0].test, exp.condClauses[0].body[0], rewriteCond(makeCondExp(exp.condClauses.slice(1), exp.elseClause)));
