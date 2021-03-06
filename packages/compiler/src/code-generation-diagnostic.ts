import * as assert from "assert";
import * as ts from "typescript";
import * as util from "util";

/**
 * Error thrown if the code generation fails. Stores the node to show the node that  caused the error
 * in the users code.
 */
export class CodeGenerationDiagnostic extends Error {
    constructor(public node: ts.Node, public code: number, message: string) {
        super(message);
        assert(node, "Node is not defined");
        assert(code, "code is not defined");
        assert(message, "message is not defined");

        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, CodeGenerationDiagnostic.prototype);
    }

    toDiagnostic(): ts.Diagnostic {
        return {
            code: this.code,
            messageText: this.message,
            start: this.node.getFullStart(),
            length: this.node.getFullWidth(),
            category: ts.DiagnosticCategory.Error,
            file: this.node.getSourceFile()
        };
    }

    static builtInMethodNotSupported(propertyAccessExpression: ts.PropertyAccessExpression, objectName: string, methodName: string) {
        return CodeGenerationDiagnostic.createException(propertyAccessExpression, diagnostics.BuiltInMethodNotSupported, methodName, objectName);
    }

    static builtInPropertyNotSupported(property: ts.PropertyAccessExpression, objectName: string) {
        return CodeGenerationDiagnostic.createException(property, diagnostics.BuiltInPropertyNotSupported, property.name.text, objectName);
    }

    static builtInDoesNotSupportElementAccess(element: ts.ElementAccessExpression, objectName: string) {
        return CodeGenerationDiagnostic.createException(element, diagnostics.BuiltInObjectDoesNotSupportElementAccess, objectName);
    }

    private static createException(node: ts.Node, diagnostic: { message: string, code: number }, ...args: Array<string | number>) {
        const message = util.format(diagnostic.message, ...args);
        return new CodeGenerationDiagnostic(node, diagnostic.code, message);
    }

    static unsupportedLiteralType(node: ts.LiteralLikeNode, typeName: string) {
        return CodeGenerationDiagnostic.createException(node, diagnostics.UnsupportedLiteralType, typeName);
    }

    static unsupportedType(node: ts.Declaration, typeName: string) {
        return CodeGenerationDiagnostic.createException(node, diagnostics.UnsupportedType, typeName);
    }

    static unsupportedIdentifier(identifier: ts.Identifier) {
        return CodeGenerationDiagnostic.createException(identifier, diagnostics.UnsupportedIdentifier, identifier.text);
    }

    static unsupportedBinaryOperation(binaryExpression: ts.BinaryExpression, leftType: string, rightType: string) {
        return CodeGenerationDiagnostic.createException(
            binaryExpression,
            diagnostics.UnsupportedBinaryOperation,
            ts.SyntaxKind[binaryExpression.operatorToken.kind],
            leftType,
            rightType
        );
    }

    static unsupportedUnaryOperation(node: ts.PrefixUnaryExpression | ts.PostfixUnaryExpression, type: string) {
        return CodeGenerationDiagnostic.createException(node, diagnostics.UnsupportedUnaryOperation, ts.SyntaxKind[node.operator], type);
    }

    static anonymousEntryFunctionsNotSupported(fun: ts.FunctionLikeDeclaration) {
        return CodeGenerationDiagnostic.createException(fun, diagnostics.AnonymousEntryFunctionsUnsupported);
    }

    static optionalParametersInEntryFunctionNotSupported(optionalParameter: ts.ParameterDeclaration) {
        return CodeGenerationDiagnostic.createException(optionalParameter, diagnostics.OptionalParametersNotSupportedForEntryFunction);
    }

    static genericEntryFunctionNotSupported(fun: ts.FunctionLikeDeclaration) {
        return CodeGenerationDiagnostic.createException(fun, diagnostics.GenericEntryFunctionNotSuppoorted);
    }

    static unsupportedClassReferencedBy(identifier: ts.Identifier) {
        return CodeGenerationDiagnostic.createException(identifier, diagnostics.UnsupportedBuiltInClass);
    }

    static referenceToNonSpeedyJSEntryFunctionFromJS(identifier: ts.Identifier, speedyJSFunctionSymbol: ts.Symbol) {
        return CodeGenerationDiagnostic.createException(identifier, diagnostics.ReferenceToNonEntrySpeedyJSFunctionFromJS, speedyJSFunctionSymbol.name);
    }

    static overloadedEntryFunctionNotSupported(fun: ts.FunctionLikeDeclaration) {
        return CodeGenerationDiagnostic.createException(fun, diagnostics.OverloadedEntryFunctionNotSupported);
    }

    static unsupportedSyntaxKind(node: ts.Node) {
        return CodeGenerationDiagnostic.createException(node, diagnostics.UnsupportedSyntaxKind, ts.SyntaxKind[node.kind]);
    }

    static unsupportedProperty(propertyExpression: ts.PropertyAccessExpression) {
        return CodeGenerationDiagnostic.createException(propertyExpression, diagnostics.UnsupportedProperty);
    }

    static unsupportedIndexer(node: ts.ElementAccessExpression) {
        return CodeGenerationDiagnostic.createException(node, diagnostics.UnsupportedIndexer);
    }

    static unsupportedCast(node: ts.AsExpression, sourceType: string, targetType: string) {
        return CodeGenerationDiagnostic.createException(node, diagnostics.UnsupportedCast, sourceType, targetType);
    }

    static implicitArrayElementCast(element: ts.Expression, arrayElementType: string, typeOfElementRequiringImplicitCast: string) {
        return CodeGenerationDiagnostic.createException(
            element,
            diagnostics.UnsupportedImplicitArrayElementCast,
            typeOfElementRequiringImplicitCast,
            arrayElementType
        );
    }

    static unsupportedImplicitCastOfBinaryExpressionOperands(binaryExpression: ts.BinaryExpression, leftOperandType: string, rightOperandType: string) {
        return CodeGenerationDiagnostic.createException(
            binaryExpression,
            diagnostics.UnsupportedImplicitCastOfBinaryExpressionOperands,
            leftOperandType,
            rightOperandType
        );
    }

    static unsupportedImplicitCastOfArgument(elementNotMatchingArrayElementType: ts.Expression, parameterType: string, argumentType: string) {
        return CodeGenerationDiagnostic.createException(
            elementNotMatchingArrayElementType,
            diagnostics.UnsupportedImplicitCastOfArgument,
            argumentType,
            parameterType,
            parameterType
        );
    }

    static unsupportedImplicitCastOfConditionalResult(conditionalResult: ts.Expression, typeOfConditional: string, typeOfConditionResult: string) {
        return CodeGenerationDiagnostic.createException(
            conditionalResult,
            diagnostics.UnsupportedImplicitCastOfConditionalResult,
            typeOfConditionResult,
            typeOfConditional,
            typeOfConditional
        );
    }

    static unsupportedElementAccessExpression(elementAccessExpression: ts.ElementAccessExpression, argumentExpressionType?: string) {
        return CodeGenerationDiagnostic.createException(
            elementAccessExpression,
            diagnostics.UnsupportedElementAccessExpression,
            argumentExpressionType || "undefined"
        );
    }

    static unsupportedImplicitCastOfReturnValue(returnStatement: ts.ReturnStatement, declaredReturnType: string, returnStatementExpressionType: string) {
        return CodeGenerationDiagnostic.createException(
            returnStatement,
            diagnostics.UnsupportedImplicitCastOfReturnValue,
            returnStatementExpressionType,
            declaredReturnType,
            declaredReturnType
        );
    }

    static unsupportedImplicitCast(node: ts.Node, castTargetType: string, actualValueType: string) {
        return CodeGenerationDiagnostic.createException(node, diagnostics.UnsupportedImplicitCast, actualValueType, castTargetType, castTargetType);
    }

    static unsupportedFunctionDeclaration(declaration: ts.Declaration) {
        throw CodeGenerationDiagnostic.createException(declaration, diagnostics.UnsupportedFunctionDeclaration);
    }

    static unsupportedGenericFunction(functionDeclaration: ts.FunctionLikeDeclaration) {
        return CodeGenerationDiagnostic.createException(functionDeclaration, diagnostics.UnsupportedGenericFunction);
    }

    static unsupportedStaticProperties(propertyExpression: ts.PropertyAccessExpression) {
        return CodeGenerationDiagnostic.createException(propertyExpression, diagnostics.UnsupportedStaticProperty);
    }

    static unsupportedNestedFunctionDeclaration(functionDeclaration: ts.FunctionDeclaration | ts.MethodDeclaration) {
        return CodeGenerationDiagnostic.createException(functionDeclaration, diagnostics.UnsupportedNestedFunctionDeclaration);
    }

    static variableDeclarationList(variableDeclarationList: ts.VariableDeclarationList) {
        return CodeGenerationDiagnostic.createException(variableDeclarationList, diagnostics.UnsupportedVarDeclaration);
    }

    static unsupportedOverloadedFunctionDeclaration(declaration: ts.FunctionLikeDeclaration) {
        return CodeGenerationDiagnostic.createException(declaration, diagnostics.UnsupportedOverloadedFunctionDeclaration);
    }

    static unsupportedGenericClass(classDeclaration: ts.ClassDeclaration) {
        return CodeGenerationDiagnostic.createException(classDeclaration, diagnostics.UnsupportedGenericClass);
    }

    static unsupportedClassInheritance(classDeclaration: ts.ClassDeclaration) {
        return CodeGenerationDiagnostic.createException(classDeclaration, diagnostics.UnsupportedClassInheritance);
    }
}

/* tslint:disable:max-line-length */
const diagnostics = {
    BuiltInMethodNotSupported: {
        message: "The method '%s' of the built in object '%s' is not supported.",
        code: 100000
    },
    BuiltInPropertyNotSupported: {
        message: "The property '%s' of the built in object '%s' is not supported.",
        code: 100001
    },
    BuiltInObjectDoesNotSupportElementAccess: {
        message: "The built in object '%s' does not support element access (%s[index] or $s[index]=value).",
        code: 100002
    },
    UnsupportedBuiltInClass: {
        message: "The class referenced by this identifier is not supported.",
        code: 100003,
    },
    UnsupportedLiteralType: {
        message: "The literal type '%s' is not supported.",
        code: 100004
    },
    UnsupportedType: {
        message: "The type '%s' is not supported.",
        code: 100005
    },
    UnsupportedIdentifier: {
        message: "Unsupported type or kind of identifier '%s'.",
        code: 100006
    },
    UnsupportedBinaryOperation: {
        message: "The binary operator %s is not supported for the left and right hand side types '%s' and '%s'.",
        code: 100007
    },
    UnsupportedUnaryOperation: {
        message: "The unary operator %s is not supported for the type '%s'.",
        code: 100008
    },
    AnonymousEntryFunctionsUnsupported: {
        message: "SpeedyJS entry functions need to have a name.",
        code: 100009
    },
    ReferenceToNonEntrySpeedyJSFunctionFromJS: {
        message: "SpeedyJS functions referenced from 'normal' JavaScript code needs to be async (the async modifier is missing on the declaration of '%s').",
        code: 100010
    },
    OptionalParametersNotSupportedForEntryFunction: {
        message: "Optional parameters or variadic parameters are not supported for SpeedyJS entry functions.",
        code: 100011
    },
    GenericEntryFunctionNotSuppoorted: {
        message: "Generic SpeedyJS entry functions are not supported.",
        code: 100012
    },
    OverloadedEntryFunctionNotSupported: {
        message: "SpeedyJS entry function cannot be overloaded.",
        code: 100013
    },
    UnsupportedSyntaxKind: {
        message: "The syntax kind '%s' is not yet supported.",
        code: 100014
    },
    UnsupportedProperty: {
        message: "The kind of property is not yet supported, only object properties are supported.",
        code: 1000015
    },
    UnsupportedIndexer: {
        message: "The kind of indexer is not yet supported",
        code: 1000016
    },
    UnsupportedCast: {
        message: "Casting from '%s' to '%s' is not yet supported",
        code: 1000017
    },
    UnsupportedImplicitArrayElementCast: {
        message: "The array element of type '%s' requires an implicit cast to the array element type '%s'. Implicit casts are not supported. An explicit cast of the element to the array element type is required.",
        code: 1000018
    },
    UnsupportedImplicitCastOfBinaryExpressionOperands: {
        message: "No implicit cast for the binary expressions operands (left: %s, right: %s) exists. An explicit cast of either of the operands to the other's type is required.",
        code: 1000019
    },
    UnsupportedImplicitCastOfArgument: {
        message: "Unsupported implicit cast of the argument with the type '%s' to the expected parameter type '%s'. An explicit cast of the argument to the type '%s' is required.",
        code: 1000020
    },
    UnsupportedImplicitCastOfConditionalResult: {
        message: "Unsupported implicit cast of conditional case with type '%s' to the type '%s' of the whole conditional expression. An explicit cast of the conditional case to the type '%s' is required.",
        code: 1000021
    },
    UnsupportedElementAccessExpression: {
        message: "Unsupported element access expression with indexer of type '%s'. Only element access expressions with an integer index are supported.",
        code: 1000022
    },
    UnsupportedImplicitCastOfReturnValue: {
        message: "Unsupported implicit cast of return value with the type '%s' to function's return type '%s'. An explicit cast of the return value to the expected return type '%s' is required.",
        code: 1000023
    },
    UnsupportedImplicitCast: {
        message: "Unsupported implicit cast of value with the type '%s' to the expected type '%s'. An explicit cast of the value to the type '%s' is required.",
        code: 1000024
    },
    UnsupportedGenericFunction: {
        message: "Generic functions and methods are not yet supported.",
        code: 1000025
    },
    UnsupportedStaticProperty: {
        message: "Static methods and properties are not yet supported.",
        code: 1000026
    },
    UnsupportedNestedFunctionDeclaration: {
        message: "Functions nested inside of other functions that potentially make use of a closure are not yet supported",
        code: 1000027
    },
    UnsupportedFunctionDeclaration: {
        message: "Unsupported function declaration. Only function and method declarations are supported.",
        code: 1000028
    },
    UnsupportedVarDeclaration: {
        message: "Unsupported 'var' declaration of variable. Only variables with block scope ('let' and 'const') are supported.",
        code: 1000029
    },
    UnsupportedOverloadedFunctionDeclaration: {
        message: "Overloaded functions are not yet supported.",
        code: 1000030
    },
    UnsupportedGenericClass: {
        message: "Generic classes are not yet supported.",
        code: 1000031
    },
    UnsupportedClassInheritance: {
        message: "Class inheritance is not yet supported.",
        code: 1000032
    }
};
