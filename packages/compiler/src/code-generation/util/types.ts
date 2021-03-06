import * as assert from "assert";
import * as llvm from "llvm-node";
import * as ts from "typescript";
import {CodeGenerationDiagnostic} from "../../code-generation-diagnostic";
import {CodeGenerationContext} from "../code-generation-context";

/**
 * Returns the llvm type for the given typescript type
 * @param type the type script type to convert into an llvm type
 * @param context the code generation context
 * @return the llvm type
 */
export function toLLVMType(type: ts.Type, context: CodeGenerationContext): llvm.Type {
    if (type.flags & ts.TypeFlags.IntLike) {
        return llvm.Type.getInt32Ty(context.llvmContext);
    }

    if (type.flags & ts.TypeFlags.NumberLike) {
        return llvm.Type.getDoubleTy(context.llvmContext);
    }

    if (type.flags & ts.TypeFlags.BooleanLike) {
        return llvm.Type.getInt1Ty(context.llvmContext);
    }

    if (type.flags & ts.TypeFlags.Any) {
        throw new Error(`Any type not supported, annotate the type`);
    }

    if (type.flags & ts.TypeFlags.Void) {
        return llvm.Type.getVoidTy(context.llvmContext);
    }

    if (type.flags & ts.TypeFlags.Undefined) {
        return llvm.Type.getInt8PtrTy(context.llvmContext);
    }

    if (type.flags & ts.TypeFlags.Object) {
        const classReference = context.resolveClass(type);
        if (classReference) {
            return classReference.getLLVMType(type as ts.ObjectType, context).getPointerTo();
        }
    }

    if (isMaybeObjectType(type)) {
        return toLLVMType(type.getNonNullableType(), context);
    }

    if (type.getSymbol() && type.getSymbol().getDeclarations().length > 0) {
        throw CodeGenerationDiagnostic.unsupportedType(type.getSymbol().getDeclarations()[0], context.typeChecker.typeToString(type));
    }

    throw new Error(`Unsupported type ${context.typeChecker.typeToString(type)}`);
}

/**
 * Tests if the given type is a maybe object type (objectType | undefined).
 * @param type the type to test
 * @return {boolean} true if the type contains either an object or undefined
 */
export function isMaybeObjectType(type: ts.Type): type is ts.UnionType {
    if (type.flags & ts.TypeFlags.Union) {
        const unionType = type as ts.UnionType;

        return unionType.types.length === 2 &&
            unionType.types.some(t => !!(t.flags & ts.TypeFlags.Undefined)) &&
            unionType.types.some(t => !!(t.flags & ts.TypeFlags.Object));
    }

    return false;
}

export function getArrayElementType(arrayType: ts.Type): ts.Type {
    const genericType = arrayType as ts.GenericType;
    assert(genericType.typeArguments.length === 1, "An array type needs to have one type argument, the type of the array elements");

    return genericType.typeArguments[0]!;
}

/**
 * Computes the size of the given type
 * http://stackoverflow.com/questions/14608250/how-can-i-find-the-size-of-a-type
 * @param type the type of which the size is to be computed
 * @param context the code generation context
 * @return {Value} the value containing the size of the type
 */
export function sizeof(type: llvm.Type, context: CodeGenerationContext) {
    const size = context.module.dataLayout.getTypeStoreSize(type);
    return llvm.ConstantInt.get(context.llvmContext, size);
}

/**
 * Computes the offset of a field
 * @param type the type of the class
 * @param field the field number for which the offset is to be computed
 * @param context the context
 * @return {Value} the offset as llvm.value
 */
export function offset(type: llvm.PointerType, field: number, context: CodeGenerationContext) {
    const fieldIndex = [ llvm.ConstantInt.get(context.llvmContext, 0), llvm.ConstantInt.get(context.llvmContext, field)];
    const offset = context.builder.createInBoundsGEP(llvm.ConstantPointerNull.get(type), fieldIndex);
    return context.builder.createPtrToInt(offset, llvm.Type.getInt32Ty(context.llvmContext), "offset");
}
