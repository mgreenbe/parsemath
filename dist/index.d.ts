import { Scope } from "./Types";
declare type Fns = Record<string, (x: number) => number>;
export declare function parse(s: string, scope?: Scope, fns?: Fns): number;
export {};
