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
  makeLetExp,
  makeBinding,
  isCExp,
  isAtomicExp,
  isDefineExp,
  makeDefineExp,
  isProcExp,
  makeProcExp,
  isLetExp,
  isLitExp,
  isAppExp,
  makeAppExp,
  isIfExp,
  Binding,
  makeProgram,
} from "./L31-ast";
import { Result, makeOk } from "../shared/result";
import * as R from "ramda";

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
  makeOk(rewriteAllCond(exp));

const rewriteAllCond = (exp: Program | Exp): Program | Exp =>
  isExp(exp)
    ? rewriteAllCondExp(exp)
    : isProgram(exp)
    ? makeProgram(R.map(rewriteAllCondExp, exp.exps))
    : exp;

const rewriteAllCondExp = (exp: Exp): Exp =>
  isCExp(exp)
    ? rewriteAllCondCExp(exp)
    : isDefineExp(exp)
    ? makeDefineExp(exp.var, rewriteAllCondCExp(exp.val))
    : exp;

const rewriteAllCondCExp = (exp: CExp): CExp =>
  isAtomicExp(exp)
    ? exp
    : isLitExp(exp)
    ? exp
    : isIfExp(exp)
    ? makeIfExp(
        rewriteAllCondCExp(exp.test),
        rewriteAllCondCExp(exp.then),
        rewriteAllCondCExp(exp.alt)
      )
    : isAppExp(exp)
    ? makeAppExp(
        rewriteAllCondCExp(exp.rator),
        R.map(rewriteAllCondCExp, exp.rands)
      )
    : isProcExp(exp)
    ? makeProcExp(exp.args, R.map(rewriteAllCondCExp, exp.body))
    : isLetExp(exp)
    ? makeLetExp(
        R.map(
          (x: Binding) => makeBinding(x.var.var, rewriteAllCondCExp(x.val)),
          exp.bindings
        ),
        R.map(rewriteAllCondCExp, exp.body)
      )
    : isCondExp(exp)
    ? rewriteCond(exp)
    : exp;

const rewriteCond = (exp: CondExp): IfExp => {
  const [firstClause, ...restClauses] = exp.condClauses;

  return makeIfExp(
    rewriteAllCondCExp(firstClause.test),
    rewriteAllCondCExp(firstClause.body[0]),
    rewriteAllCondCExp(
      restClauses.length === 0
        ? exp.elseClause.body[1]
        : rewriteCond(makeCondExp(restClauses, exp.elseClause))
    )
  );
};
