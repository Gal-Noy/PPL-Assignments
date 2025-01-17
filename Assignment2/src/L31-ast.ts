// ===========================================================
// AST type models
import { map, pipe, zipWith } from "ramda";
import { makeEmptySExp, makeSymbolSExp, SExpValue, makeCompoundSExp, valueToString } from '../imp/L3-value'
import { first, second, rest, allT, isEmpty } from "../shared/list";
import { isArray, isString, isNumericString, isIdentifier } from "../shared/type-predicates";
import { isOk, isFailure, Result, makeOk, makeFailure, bind, mapResult, mapv, safe2 } from "../shared/result";
import { parse as p, isSexpString, isToken } from "../shared/parser";
import { Sexp, Token } from "s-expression";

/*
;; =============================================================================
;; Scheme Parser
;;
;; L2 extends L1 with support for IfExp and ProcExp
;; L31 extends L2 with support for:
;; - Pair datatype
;; - The empty-list literal expression
;; - Compound literal expressions denoted with quote
;; - Primitives: cons, car, cdr, pair?, number?, boolean?, symbol?, string?, list
;; - Primitives: and, or, not
;; - The Let abbreviation is also supported.

;; <program> ::= (L31 <exp>+) // Program(exps:List(Exp))
;; <exp> ::= <define> | <cexp>              / DefExp | CExp
;; <define> ::= ( define <var> <cexp> )     / DefExp(var:VarDecl, val:CExp)
;; <var> ::= <identifier>                   / VarRef(var:string)
;; <cexp> ::= <number>                      / NumExp(val:number)
;;         |  <boolean>                     / BoolExp(val:boolean)
;;         |  <string>                      / StrExp(val:string)
;;         |  ( lambda ( <var>* ) <cexp>+ ) / ProcExp(args:VarDecl[], body:CExp[]))
;;         |  ( if <cexp> <cexp> <cexp> )   / IfExp(test: CExp, then: CExp, alt: CExp)
;;         |  ( let ( binding* ) <cexp>+ )  / LetExp(bindings:Binding[], body:CExp[]))
;;         |  ( cond ( <cond-clauses>+ <else-clause> ) / CondExp(condClauses: CondClause [], elseClause: ElseClause)
;;         |  ( quote <sexp> )              / LitExp(val:SExp)
;;         |  ( <cexp> <cexp>* )            / AppExp(operator:CExp, operands:CExp[]))
;; <binding>  ::= ( <var> <cexp> )           / Binding(var:VarDecl, val:Cexp)
;; <cond-clause> ::= ( <cexp> <cexp>+ ) / CondClause (test: CExp, body: CExp[])
;; <else-clause> ::= ( else <cexp>+ ) / ElseClause(body: CExp[])
;; <prim-op>  ::= + | - | * | / | < | > | = | not |  and | or | eq? | string=?
;;                  | cons | car | cdr | pair? | number? | list 
;;                  | boolean? | symbol? | string?      ##### L31
;; <num-exp>  ::= a number token
;; <bool-exp> ::= #t | #f
;; <var-ref>  ::= an identifier token
;; <var-decl> ::= an identifier token
;; <sexp>     ::= symbol | number | bool | string | 
;;                (<sexp>+ . <sexp>) | ( <sexp>* )       ##### L31
*/

export type Exp = DefineExp | CExp;
export type AtomicExp = NumExp | BoolExp | StrExp | PrimOp | VarRef;
export type CompoundExp = AppExp | IfExp | ProcExp | LetExp | LitExp | CondExp;
export type CExp =  AtomicExp | CompoundExp;

export type Program = {tag: "Program"; exps: Exp[]; }
export type DefineExp = {tag: "DefineExp"; var: VarDecl; val: CExp; }
export type NumExp = {tag: "NumExp"; val: number; }
export type BoolExp = {tag: "BoolExp"; val: boolean; }
export type StrExp = {tag: "StrExp"; val: string; }
export type PrimOp = {tag: "PrimOp"; op: string; }
export type VarRef = {tag: "VarRef"; var: string; }
export type VarDecl = {tag: "VarDecl"; var: string; }
export type AppExp = {tag: "AppExp"; rator: CExp; rands: CExp[]; }
// L2
export type IfExp = {tag: "IfExp"; test: CExp; then: CExp; alt: CExp; }
export type ProcExp = {tag: "ProcExp"; args: VarDecl[], body: CExp[]; }
export type Binding = {tag: "Binding"; var: VarDecl; val: CExp; }
export type LetExp = {tag: "LetExp"; bindings: Binding[]; body: CExp[]; }
// L31
export type LitExp = {tag: "LitExp"; val: SExpValue; }

export type CondClause = { tag: "CondClause", test: CExp, body: CExp[]; }
export type ElseClause = { tag: "ElseClause", body: CExp[]; }
export type CondExp = { tag: "CondExp", condClauses: CondClause[]; elseClause: ElseClause}

// Type value constructors for disjoint types
export const makeProgram = (exps: Exp[]): Program => ({tag: "Program", exps: exps});
export const makeDefineExp = (v: VarDecl, val: CExp): DefineExp =>
    ({tag: "DefineExp", var: v, val: val});
export const makeNumExp = (n: number): NumExp => ({tag: "NumExp", val: n});
export const makeBoolExp = (b: boolean): BoolExp => ({tag: "BoolExp", val: b});
export const makeStrExp = (s: string): StrExp => ({tag: "StrExp", val: s});
export const makePrimOp = (op: string): PrimOp => ({tag: "PrimOp", op: op});
export const makeVarRef = (v: string): VarRef => ({tag: "VarRef", var: v});
export const makeVarDecl = (v: string): VarDecl => ({tag: "VarDecl", var: v});
export const makeAppExp = (rator: CExp, rands: CExp[]): AppExp =>
    ({tag: "AppExp", rator: rator, rands: rands});
// L2
export const makeIfExp = (test: CExp, then: CExp, alt: CExp): IfExp =>
    ({tag: "IfExp", test: test, then: then, alt: alt});
export const makeProcExp = (args: VarDecl[], body: CExp[]): ProcExp =>
    ({tag: "ProcExp", args: args, body: body});
export const makeBinding = (v: string, val: CExp): Binding =>
    ({tag: "Binding", var: makeVarDecl(v), val: val});
export const makeLetExp = (bindings: Binding[], body: CExp[]): LetExp =>
    ({tag: "LetExp", bindings: bindings, body: body});
// L31
export const makeLitExp = (val: SExpValue): LitExp =>
    ({tag: "LitExp", val: val});

export const makeCondClause = (test: CExp, body: CExp[]) : CondClause =>
    ({ tag: "CondClause", test: test, body: body });
export const makeElseClause = (body: CExp[]) : ElseClause =>
    ({ tag: "ElseClause", body: body });
export const makeCondExp = (condClauses: CondClause[], elseClause: ElseClause) : CondExp =>
    ({ tag: "CondExp", condClauses: condClauses, elseClause: elseClause });

// Type predicates for disjoint types
export const isProgram = (x: any): x is Program => x.tag === "Program";
export const isDefineExp = (x: any): x is DefineExp => x.tag === "DefineExp";

export const isNumExp = (x: any): x is NumExp => x.tag === "NumExp";
export const isBoolExp = (x: any): x is BoolExp => x.tag === "BoolExp";
export const isStrExp = (x: any): x is StrExp => x.tag === "StrExp";
export const isPrimOp = (x: any): x is PrimOp => x.tag === "PrimOp";
export const isVarRef = (x: any): x is VarRef => x.tag === "VarRef";
export const isVarDecl = (x: any): x is VarDecl => x.tag === "VarDecl";
export const isAppExp = (x: any): x is AppExp => x.tag === "AppExp";
// L2
export const isIfExp = (x: any): x is IfExp => x.tag === "IfExp";
export const isProcExp = (x: any): x is ProcExp => x.tag === "ProcExp";
export const isBinding = (x: any): x is Binding => x.tag === "Binding";
export const isLetExp = (x: any): x is LetExp => x.tag === "LetExp";
// L31
export const isLitExp = (x: any): x is LitExp => x.tag === "LitExp";

// Type predicates for type unions
export const isExp = (x: any): x is Exp => isDefineExp(x) || isCExp(x);
export const isAtomicExp = (x: any): x is AtomicExp =>
    isNumExp(x) || isBoolExp(x) || isStrExp(x) ||
    isPrimOp(x) || isVarRef(x);
export const isCompoundExp = (x: any): x is CompoundExp =>
    isAppExp(x) || isIfExp(x) || isProcExp(x) || isLitExp(x) || isLetExp(x) || isCondExp(x);
export const isCExp = (x: any): x is CExp =>
    isAtomicExp(x) || isCompoundExp(x);

export const isCondClause = (x:any): x is CondClause => x.tag === "CondClause";
export const isElseClause = (x:any): x is ElseClause => x.tag === "ElseClause";
export const isCondExp = (x:any): x is CondExp => x.tag === "CondExp";
    
// ========================================================
// Parsing

export const parseL31 = (x: string): Result<Program> =>
    bind(p(x), parseL31Program);

export const parseL31Program = (sexp: Sexp): Result<Program> =>
    sexp === "" || isEmpty(sexp) ? makeFailure("Unexpected empty program") :
    isToken(sexp) ? makeFailure(`Program cannot be a single token: ${JSON.stringify(sexp, null, 2)}`) :
    isArray(sexp) ? parseL31GoodProgram(first(sexp), rest(sexp)) :
    makeFailure(`Unexpected type ${JSON.stringify(sexp, null, 2)}`);

const parseL31GoodProgram = (keyword: Sexp, body: Sexp[]): Result<Program> =>
    keyword === "L31" && !isEmpty(body) ? mapv(mapResult(parseL31Exp, body), (exps: Exp[]) => 
                                              makeProgram(exps)) :
    makeFailure(`Program must be of the form (L31 <exp>+): ${JSON.stringify([keyword, ...body], null, 2)}`);

// Exp -> <DefineExp> | <Cexp>
export const parseL31Exp = (sexp: Sexp): Result<Exp> =>
    isEmpty(sexp) ? makeFailure(`Exp cannot be an empty list: ${JSON.stringify(sexp, null, 2)}`) :
    isArray(sexp) ? parseL31CompoundExp(first(sexp), rest(sexp)) :
    isToken(sexp) ? parseL31Atomic(sexp) :
    sexp;

// Compound -> DefineExp | CompoundCExp
export const parseL31CompoundExp = (op: Sexp, params: Sexp[]): Result<Exp> => 
    op === "define"? parseDefine(params) :
    parseL31CompoundCExp(op, params);

// CompoundCExp -> IfExp | ProcExp | LetExp | LitExp | AppExp
export const parseL31CompoundCExp = (op: Sexp, params: Sexp[]): Result<CExp> =>
    isString(op) && isSpecialForm(op) ? parseL31SpecialForm(op, params) :
    parseAppExp(op, params);

export const parseL31SpecialForm = (op: Sexp, params: Sexp[]): Result<CExp> =>
    isEmpty(params) ? makeFailure("Empty args for special form") :
    op === "if" ? parseIfExp(params) :
    op === "lambda" ? parseProcExp(first(params), rest(params)) :
    op === "let" ? parseLetExp(first(params), rest(params)) :
    op === "quote" ? parseLitExp(first(params)) :
    op === "cond" ? parseCondExp(params) :
    makeFailure("Never");

// DefineExp -> (define <varDecl> <CExp>)
export const parseDefine = (params: Sexp[]): Result<DefineExp> =>
    isEmpty(params) ? makeFailure("define missing 2 arguments") :
    isEmpty(rest(params)) ? makeFailure(`define missing 1 arguments: ${JSON.stringify(params, null, 2)}`) :
    ! isEmpty(rest(rest(params))) ? makeFailure(`define has too many arguments: ${JSON.stringify(params, null, 2)}`) :
    parseGoodDefine(first(params), second(params));

const parseGoodDefine = (variable: Sexp, val: Sexp): Result<DefineExp> =>
    ! isIdentifier(variable) ? makeFailure(`First arg of define must be an identifier: {JSON.stringify(variable, null, 2)}`) :
    mapv(parseL31CExp(val), (value: CExp) => 
         makeDefineExp(makeVarDecl(variable), value));

export const parseL31CExp = (sexp: Sexp): Result<CExp> =>
    isEmpty(sexp) ? makeFailure("CExp cannot be an empty list") :
    isArray(sexp) ? parseL31CompoundCExp(first(sexp), rest(sexp)) :
    isToken(sexp) ? parseL31Atomic(sexp) :
    sexp;

// Atomic -> number | boolean | primitiveOp | string
export const parseL31Atomic = (token: Token): Result<CExp> =>
    token === "#t" ? makeOk(makeBoolExp(true)) :
    token === "#f" ? makeOk(makeBoolExp(false)) :
    isString(token) && isNumericString(token) ? makeOk(makeNumExp(+token)) :
    isString(token) && isPrimitiveOp(token) ? makeOk(makePrimOp(token)) :
    isString(token) ? makeOk(makeVarRef(token)) :
    makeOk(makeStrExp(token.toString()));

/*
    ;; <prim-op>  ::= + | - | * | / | < | > | = | not | and | or | eq? | string=?
    ;;                  | cons | car | cdr | pair? | number? | list
    ;;                  | boolean? | symbol? | string?      ##### L31
*/
const isPrimitiveOp = (x: string): boolean =>
    ["+", "-", "*", "/", ">", "<", "=", "not", "and", "or",
     "eq?", "string=?", "cons", "car", "cdr", "list", "pair?",
     "number?", "boolean?", "symbol?", "string?"].includes(x);

const isSpecialForm = (x: string): boolean =>
    ["if", "lambda", "let", "quote", "cond"].includes(x);

const parseAppExp = (op: Sexp, params: Sexp[]): Result<AppExp> =>
    bind(parseL31CExp(op), (rator: CExp) => 
        mapv(mapResult(parseL31CExp, params), (rands: CExp[]) =>
             makeAppExp(rator, rands)));

const parseIfExp = (params: Sexp[]): Result<IfExp> =>
    params.length !== 3 ? makeFailure(`Expression not of the form (if <cexp> <cexp> <cexp>): ${JSON.stringify(params, null, 2)}`) :
    mapv(mapResult(parseL31CExp, params), (cexps: CExp[]) => 
        makeIfExp(cexps[0], cexps[1], cexps[2]));

const parseProcExp = (vars: Sexp, body: Sexp[]): Result<ProcExp> =>
    isArray(vars) && allT(isString, vars) ? mapv(mapResult(parseL31CExp, body), (cexps: CExp[]) => 
                                                 makeProcExp(map(makeVarDecl, vars), cexps)) :
    makeFailure(`Invalid vars for ProcExp ${JSON.stringify(vars, null, 2)}`);

const isGoodBindings = (bindings: Sexp): bindings is [string, Sexp][] =>
    isArray(bindings) &&
    allT(isArray, bindings) &&
    allT(isIdentifier, map(first, bindings));

const parseLetExp = (bindings: Sexp, body: Sexp[]): Result<LetExp> => {
    if (!isGoodBindings(bindings)) {
        return makeFailure('Malformed bindings in "let" expression');
    }
    // Given (letrec ( (var <val>) ...) <cexp> ...)
    // Return makeLetExp( [makeBinding(var, parse(<val>)) ...], [ parse(<cexp>) ...] )
    // After isGoodBindings, bindings has type [string, Sexp][]
    const vars = map(b => b[0], bindings);
    const valsResult = mapResult(parseL31CExp, map(second, bindings));
    const bindingsResult = mapv(valsResult, (vals: CExp[]) => zipWith(makeBinding, vars, vals));
    return bind(bindingsResult, (bindings: Binding[]) => 
                mapv(mapResult(parseL31CExp, body), (body: CExp[]) =>
                     makeLetExp(bindings, body)));
}

// sexps has the shape (quote <sexp>)
export const parseLitExp = (param: Sexp): Result<LitExp> =>
    mapv(parseSExp(param), (sexp: SExpValue) => 
         makeLitExp(sexp));

export const parseCondExp = (params: Sexp[]) : Result<CondExp> => 
    params.length < 2 ? makeFailure(`Expression not of the form (cond <cond-clause>+ <else-clause>): ${JSON.stringify(params, null, 2)}`) :
    safe2((condClauses: CondClause[], elseClause: ElseClause) => makeOk(makeCondExp(condClauses, elseClause)))
        (mapResult(parseCondClause, params.slice(0, -1)), parseElseClause(params[params.length-1]));
    
export const parseCondClause = (params: Sexp) : Result<CondClause> =>
    !isArray(params) || params.length < 2 ? makeFailure(`Expression not of the form (<cexp> <cexp>+): ${JSON.stringify(params, null, 2)}`) :
    mapv(mapResult(parseL31CExp, params), (cexps: CExp[]) => makeCondClause(cexps[0], rest(cexps)));
    
export const parseElseClause = (params: Sexp) : Result<ElseClause> =>
    !isArray(params) || params.length < 2 || params[0] !== "else" ? makeFailure(`Expression not of the form (else <cexp>+): ${JSON.stringify(params, null, 2)}`) :
    mapv(mapResult(parseL31CExp, params), (cexps: CExp[]) => makeElseClause(cexps));

export const isDottedPair = (sexps: Sexp[]): boolean =>
    sexps.length === 3 && 
    sexps[1] === "."

export const makeDottedPair = (sexps : Sexp[]): Result<SExpValue> =>
    bind(parseSExp(sexps[0]), (val1: SExpValue) => 
        mapv(parseSExp(sexps[2]), (val2: SExpValue) =>
             makeCompoundSExp(val1, val2)));

// x is the output of p (sexp parser)
export const parseSExp = (sexp: Sexp): Result<SExpValue> =>
    sexp === "#t" ? makeOk(true) :
    sexp === "#f" ? makeOk(false) :
    isString(sexp) && isNumericString(sexp) ? makeOk(+sexp) :
    isSexpString(sexp) ? makeOk(sexp.toString()) :
    isString(sexp) ? makeOk(makeSymbolSExp(sexp)) :
    sexp.length === 0 ? makeOk(makeEmptySExp()) :
    isDottedPair(sexp) ? makeDottedPair(sexp) :
    isArray(sexp) ? (
        // fail on (x . y z)
        sexp[0] === '.' ? makeFailure(`Bad dotted sexp: ${JSON.stringify(sexp, null, 2)}`) : 
        bind(parseSExp(first(sexp)), (val1: SExpValue) =>
             mapv(parseSExp(rest(sexp)), (val2: SExpValue) =>
                  makeCompoundSExp(val1, val2))) 
        ) :
    sexp;


// ==========================================================================
// Unparse: Map an AST to a concrete syntax string.

import { isSymbolSExp, isEmptySExp, isCompoundSExp } from '../imp/L3-value';


// Add a quote for symbols, empty and compound sexp - strings and numbers are not quoted.
const unparseLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `'()` :
    isSymbolSExp(le.val) ? `'${valueToString(le.val)}` :
    isCompoundSExp(le.val) ? `'${valueToString(le.val)}` :
    `${le.val}`;

const unparseLExps = (les: Exp[]): string =>
    map(unparseL31, les).join(" ");

const unparseProcExp = (pe: ProcExp): string => 
    `(lambda (${map((p: VarDecl) => p.var, pe.args).join(" ")}) ${unparseLExps(pe.body)})`

const unparseLetExp = (le: LetExp) : string => 
    `(let (${map((b: Binding) => `(${b.var.var} ${unparseL31(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`

export const unparseCondExp = (c: CondExp) : string =>
    `(cond ${map((clause: CondClause) => `(${unparseL31(clause.test)} ${map(unparseL31, clause.body).join(" ")})`, c.condClauses).join(" ")} (${map(unparseL31, c.elseClause.body).join(" ")}))`

export const unparseL31 = (exp: Program | Exp): string =>
    isBoolExp(exp) ? valueToString(exp.val) :
    isNumExp(exp) ? valueToString(exp.val) :
    isStrExp(exp) ? valueToString(exp.val) :
    isLitExp(exp) ? unparseLitExp(exp) :
    isVarRef(exp) ? exp.var :
    isProcExp(exp) ? unparseProcExp(exp) :
    isIfExp(exp) ? `(if ${unparseL31(exp.test)} ${unparseL31(exp.then)} ${unparseL31(exp.alt)})` :
    isAppExp(exp) ? `(${unparseL31(exp.rator)} ${unparseLExps(exp.rands)})` :
    isPrimOp(exp) ? exp.op :
    isLetExp(exp) ? unparseLetExp(exp) :
    isDefineExp(exp) ? `(define ${exp.var.var} ${unparseL31(exp.val)})` :
    isProgram(exp) ? `(L31 ${unparseLExps(exp.exps)})` :
    isCondExp(exp) ? unparseCondExp(exp) :
    exp;
