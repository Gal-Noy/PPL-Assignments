import {  CondExp, CExp, Exp, IfExp, Program, makeIfExp, makeCondExp, isCondExp, isProgram, isExp } from "./L31-ast";
import { isArray } from "../shared/type-predicates";
import { Result, makeFailure, makeOk } from "../shared/result";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
{
    if (isExp(exp))
        return makeOk(isCondExp(exp)) ? rewriteCond(exp) : makeOk(exp);  

}

const rewriteCond = (exp: CondExp): IfExp =>
{
    const condClauses = exp.condClauses;
    const elseClause = exp.elseClause;
    
    const [firstClause, ...restClauses] = condClauses;

    if (restClauses.length === 0 && elseClause !== null)
        return makeIfExp(firstClause.test, firstClause.body[0], elseClause.body[0]);
    
    const nextIf = makeIfExp(firstClause.test, firstClause.body[0], rewriteCond(makeCondExp(restClauses, elseClause)));

    return elseClause ? makeIfExp(nextIf.test, nextIf.then, elseClause.body[0]) : nextIf;
}
    