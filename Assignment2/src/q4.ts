import {
  CExp,
  Exp,
  Program,
  isCExp,
  isExp,
  DefineExp,
  isBoolExp,
  isNumExp,
  isPrimOp,
  isStrExp,
  isAppExp,
  AppExp,
  isIfExp,
  isProcExp,
  isVarRef,
} from "../imp/L3-ast";
import { Result, makeFailure, makeOk } from "../shared/result";
import * as R from "ramda";

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [Parsed | Error] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string> =>
  makeOk(rewriteL2ToPython(exp));

const rewriteL2ToPython = (exp: Exp | Program): string =>
  isExp(exp)
    ? rewriteL2ToPythonExp(exp)
    : R.map(rewriteL2ToPythonExp, exp.exps).join("\n");

const rewriteL2ToPythonExp = (exp: Exp): string =>
  isCExp(exp) ? rewriteL2ToPythonCExp(exp) : rewriteL2ToPythonDefineExp(exp);

const rewriteL2ToPythonDefineExp = (exp: DefineExp): string =>
  `${exp.var.var} = ${rewriteL2ToPythonCExp(exp.val)}`;

const rewriteL2ToPythonAppExp = (exp: AppExp): string => 
    !isPrimOp(exp.rator) ? `${rewriteL2ToPythonCExp(exp.rator)}(${R.map(rewriteL2ToPythonCExp, exp.rands).join(",")})` :
    exp.rator.op === "not" ? `(not ${rewriteL2ToPythonCExp(exp.rands[0])})` : 
    ["=", "eq?"].includes(exp.rator.op) ? `(${rewriteL2ToPythonCExp(exp.rands[0])} == ${rewriteL2ToPythonCExp(exp.rands[1])})` :
    `(${R.map(rewriteL2ToPythonCExp, exp.rands).join(` ${exp.rator.op} `)})`

const rewriteL2ToPythonCExp = (exp: CExp): string =>
  isNumExp(exp) || isStrExp(exp)
    ? "" + exp.val
    : isPrimOp(exp)
    ? exp.op
    : isVarRef(exp)
    ? exp.var
    : isBoolExp(exp)
    ? exp.val
      ? "True"
      : "False"
    : isAppExp(exp)
    ? rewriteL2ToPythonAppExp(exp)
    : isIfExp(exp)
    ? `(${rewriteL2ToPythonCExp(exp.then)} if ${rewriteL2ToPythonCExp(
        exp.test
      )} else ${rewriteL2ToPythonCExp(exp.alt)})`
    : isProcExp(exp)
    ? `(lambda ${R.map(x => x.var, exp.args).join(",")} : ${R.map(
        rewriteL2ToPythonCExp,
        exp.body
      ).join(" ")})`
    : "Something went horribly wrong.";
