import * as ts from "typescript";
import {CompilationContext} from "../compilation-context";

export interface CodeGenerator {
    generateEntryFunction(fn: ts.FunctionDeclaration, compilationContext: CompilationContext): void;
    write(): void;
    dump(): void;
}