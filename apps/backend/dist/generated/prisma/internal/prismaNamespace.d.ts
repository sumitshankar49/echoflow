import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models";
import { type PrismaClient } from "./class";
export type * from '../models';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly User: "User";
    readonly PasswordResetToken: "PasswordResetToken";
    readonly Note: "Note";
    readonly Circle: "Circle";
    readonly CircleMember: "CircleMember";
    readonly CircleSharedNote: "CircleSharedNote";
    readonly Playlist: "Playlist";
    readonly Reminder: "Reminder";
    readonly RevokedToken: "RevokedToken";
    readonly Mood: "Mood";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "user" | "passwordResetToken" | "note" | "circle" | "circleMember" | "circleSharedNote" | "playlist" | "reminder" | "revokedToken" | "mood";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        PasswordResetToken: {
            payload: Prisma.$PasswordResetTokenPayload<ExtArgs>;
            fields: Prisma.PasswordResetTokenFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PasswordResetTokenFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PasswordResetTokenFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>;
                };
                findFirst: {
                    args: Prisma.PasswordResetTokenFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PasswordResetTokenFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>;
                };
                findMany: {
                    args: Prisma.PasswordResetTokenFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>[];
                };
                create: {
                    args: Prisma.PasswordResetTokenCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>;
                };
                createMany: {
                    args: Prisma.PasswordResetTokenCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.PasswordResetTokenDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>;
                };
                update: {
                    args: Prisma.PasswordResetTokenUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>;
                };
                deleteMany: {
                    args: Prisma.PasswordResetTokenDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PasswordResetTokenUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.PasswordResetTokenUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>;
                };
                aggregate: {
                    args: Prisma.PasswordResetTokenAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePasswordResetToken>;
                };
                groupBy: {
                    args: Prisma.PasswordResetTokenGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PasswordResetTokenGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PasswordResetTokenCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PasswordResetTokenCountAggregateOutputType> | number;
                };
            };
        };
        Note: {
            payload: Prisma.$NotePayload<ExtArgs>;
            fields: Prisma.NoteFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.NoteFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.NoteFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload>;
                };
                findFirst: {
                    args: Prisma.NoteFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.NoteFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload>;
                };
                findMany: {
                    args: Prisma.NoteFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload>[];
                };
                create: {
                    args: Prisma.NoteCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload>;
                };
                createMany: {
                    args: Prisma.NoteCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.NoteDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload>;
                };
                update: {
                    args: Prisma.NoteUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload>;
                };
                deleteMany: {
                    args: Prisma.NoteDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.NoteUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.NoteUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotePayload>;
                };
                aggregate: {
                    args: Prisma.NoteAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateNote>;
                };
                groupBy: {
                    args: Prisma.NoteGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.NoteGroupByOutputType>[];
                };
                count: {
                    args: Prisma.NoteCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.NoteCountAggregateOutputType> | number;
                };
            };
        };
        Circle: {
            payload: Prisma.$CirclePayload<ExtArgs>;
            fields: Prisma.CircleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CircleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CircleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload>;
                };
                findFirst: {
                    args: Prisma.CircleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CircleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload>;
                };
                findMany: {
                    args: Prisma.CircleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload>[];
                };
                create: {
                    args: Prisma.CircleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload>;
                };
                createMany: {
                    args: Prisma.CircleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CircleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload>;
                };
                update: {
                    args: Prisma.CircleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload>;
                };
                deleteMany: {
                    args: Prisma.CircleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CircleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CircleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CirclePayload>;
                };
                aggregate: {
                    args: Prisma.CircleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCircle>;
                };
                groupBy: {
                    args: Prisma.CircleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CircleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CircleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CircleCountAggregateOutputType> | number;
                };
            };
        };
        CircleMember: {
            payload: Prisma.$CircleMemberPayload<ExtArgs>;
            fields: Prisma.CircleMemberFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CircleMemberFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CircleMemberFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload>;
                };
                findFirst: {
                    args: Prisma.CircleMemberFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CircleMemberFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload>;
                };
                findMany: {
                    args: Prisma.CircleMemberFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload>[];
                };
                create: {
                    args: Prisma.CircleMemberCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload>;
                };
                createMany: {
                    args: Prisma.CircleMemberCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CircleMemberDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload>;
                };
                update: {
                    args: Prisma.CircleMemberUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload>;
                };
                deleteMany: {
                    args: Prisma.CircleMemberDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CircleMemberUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CircleMemberUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleMemberPayload>;
                };
                aggregate: {
                    args: Prisma.CircleMemberAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCircleMember>;
                };
                groupBy: {
                    args: Prisma.CircleMemberGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CircleMemberGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CircleMemberCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CircleMemberCountAggregateOutputType> | number;
                };
            };
        };
        CircleSharedNote: {
            payload: Prisma.$CircleSharedNotePayload<ExtArgs>;
            fields: Prisma.CircleSharedNoteFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CircleSharedNoteFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CircleSharedNoteFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload>;
                };
                findFirst: {
                    args: Prisma.CircleSharedNoteFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CircleSharedNoteFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload>;
                };
                findMany: {
                    args: Prisma.CircleSharedNoteFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload>[];
                };
                create: {
                    args: Prisma.CircleSharedNoteCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload>;
                };
                createMany: {
                    args: Prisma.CircleSharedNoteCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.CircleSharedNoteDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload>;
                };
                update: {
                    args: Prisma.CircleSharedNoteUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload>;
                };
                deleteMany: {
                    args: Prisma.CircleSharedNoteDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CircleSharedNoteUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.CircleSharedNoteUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CircleSharedNotePayload>;
                };
                aggregate: {
                    args: Prisma.CircleSharedNoteAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCircleSharedNote>;
                };
                groupBy: {
                    args: Prisma.CircleSharedNoteGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CircleSharedNoteGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CircleSharedNoteCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CircleSharedNoteCountAggregateOutputType> | number;
                };
            };
        };
        Playlist: {
            payload: Prisma.$PlaylistPayload<ExtArgs>;
            fields: Prisma.PlaylistFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PlaylistFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PlaylistFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload>;
                };
                findFirst: {
                    args: Prisma.PlaylistFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PlaylistFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload>;
                };
                findMany: {
                    args: Prisma.PlaylistFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload>[];
                };
                create: {
                    args: Prisma.PlaylistCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload>;
                };
                createMany: {
                    args: Prisma.PlaylistCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.PlaylistDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload>;
                };
                update: {
                    args: Prisma.PlaylistUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload>;
                };
                deleteMany: {
                    args: Prisma.PlaylistDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PlaylistUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.PlaylistUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlaylistPayload>;
                };
                aggregate: {
                    args: Prisma.PlaylistAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePlaylist>;
                };
                groupBy: {
                    args: Prisma.PlaylistGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PlaylistGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PlaylistCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PlaylistCountAggregateOutputType> | number;
                };
            };
        };
        Reminder: {
            payload: Prisma.$ReminderPayload<ExtArgs>;
            fields: Prisma.ReminderFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ReminderFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ReminderFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload>;
                };
                findFirst: {
                    args: Prisma.ReminderFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ReminderFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload>;
                };
                findMany: {
                    args: Prisma.ReminderFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload>[];
                };
                create: {
                    args: Prisma.ReminderCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload>;
                };
                createMany: {
                    args: Prisma.ReminderCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.ReminderDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload>;
                };
                update: {
                    args: Prisma.ReminderUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload>;
                };
                deleteMany: {
                    args: Prisma.ReminderDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ReminderUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.ReminderUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ReminderPayload>;
                };
                aggregate: {
                    args: Prisma.ReminderAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateReminder>;
                };
                groupBy: {
                    args: Prisma.ReminderGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ReminderGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ReminderCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ReminderCountAggregateOutputType> | number;
                };
            };
        };
        RevokedToken: {
            payload: Prisma.$RevokedTokenPayload<ExtArgs>;
            fields: Prisma.RevokedTokenFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RevokedTokenFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RevokedTokenFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload>;
                };
                findFirst: {
                    args: Prisma.RevokedTokenFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RevokedTokenFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload>;
                };
                findMany: {
                    args: Prisma.RevokedTokenFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload>[];
                };
                create: {
                    args: Prisma.RevokedTokenCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload>;
                };
                createMany: {
                    args: Prisma.RevokedTokenCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.RevokedTokenDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload>;
                };
                update: {
                    args: Prisma.RevokedTokenUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload>;
                };
                deleteMany: {
                    args: Prisma.RevokedTokenDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RevokedTokenUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.RevokedTokenUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RevokedTokenPayload>;
                };
                aggregate: {
                    args: Prisma.RevokedTokenAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRevokedToken>;
                };
                groupBy: {
                    args: Prisma.RevokedTokenGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RevokedTokenGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RevokedTokenCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RevokedTokenCountAggregateOutputType> | number;
                };
            };
        };
        Mood: {
            payload: Prisma.$MoodPayload<ExtArgs>;
            fields: Prisma.MoodFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MoodFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MoodFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload>;
                };
                findFirst: {
                    args: Prisma.MoodFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MoodFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload>;
                };
                findMany: {
                    args: Prisma.MoodFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload>[];
                };
                create: {
                    args: Prisma.MoodCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload>;
                };
                createMany: {
                    args: Prisma.MoodCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                delete: {
                    args: Prisma.MoodDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload>;
                };
                update: {
                    args: Prisma.MoodUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload>;
                };
                deleteMany: {
                    args: Prisma.MoodDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MoodUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                upsert: {
                    args: Prisma.MoodUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MoodPayload>;
                };
                aggregate: {
                    args: Prisma.MoodAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMood>;
                };
                groupBy: {
                    args: Prisma.MoodGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MoodGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MoodCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MoodCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly email: "email";
    readonly password: "password";
    readonly gender: "gender";
    readonly dob: "dob";
    readonly mobileNumber: "mobileNumber";
    readonly relationshipStatus: "relationshipStatus";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const PasswordResetTokenScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tokenHash: "tokenHash";
    readonly expiresAt: "expiresAt";
    readonly usedAt: "usedAt";
    readonly createdAt: "createdAt";
};
export type PasswordResetTokenScalarFieldEnum = (typeof PasswordResetTokenScalarFieldEnum)[keyof typeof PasswordResetTokenScalarFieldEnum];
export declare const NoteScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly content: "content";
    readonly voiceUrl: "voiceUrl";
    readonly tags: "tags";
    readonly isFavorite: "isFavorite";
    readonly userId: "userId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type NoteScalarFieldEnum = (typeof NoteScalarFieldEnum)[keyof typeof NoteScalarFieldEnum];
export declare const CircleScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly ownerId: "ownerId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CircleScalarFieldEnum = (typeof CircleScalarFieldEnum)[keyof typeof CircleScalarFieldEnum];
export declare const CircleMemberScalarFieldEnum: {
    readonly id: "id";
    readonly circleId: "circleId";
    readonly userId: "userId";
    readonly role: "role";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CircleMemberScalarFieldEnum = (typeof CircleMemberScalarFieldEnum)[keyof typeof CircleMemberScalarFieldEnum];
export declare const CircleSharedNoteScalarFieldEnum: {
    readonly id: "id";
    readonly circleId: "circleId";
    readonly noteId: "noteId";
    readonly sharedByUserId: "sharedByUserId";
    readonly createdAt: "createdAt";
};
export type CircleSharedNoteScalarFieldEnum = (typeof CircleSharedNoteScalarFieldEnum)[keyof typeof CircleSharedNoteScalarFieldEnum];
export declare const PlaylistScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly tracks: "tracks";
    readonly userId: "userId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PlaylistScalarFieldEnum = (typeof PlaylistScalarFieldEnum)[keyof typeof PlaylistScalarFieldEnum];
export declare const ReminderScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly description: "description";
    readonly remindAt: "remindAt";
    readonly isCompleted: "isCompleted";
    readonly userId: "userId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ReminderScalarFieldEnum = (typeof ReminderScalarFieldEnum)[keyof typeof ReminderScalarFieldEnum];
export declare const RevokedTokenScalarFieldEnum: {
    readonly id: "id";
    readonly token: "token";
    readonly expiresAt: "expiresAt";
};
export type RevokedTokenScalarFieldEnum = (typeof RevokedTokenScalarFieldEnum)[keyof typeof RevokedTokenScalarFieldEnum];
export declare const MoodScalarFieldEnum: {
    readonly id: "id";
    readonly mood: "mood";
    readonly userId: "userId";
    readonly recordedAt: "recordedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MoodScalarFieldEnum = (typeof MoodScalarFieldEnum)[keyof typeof MoodScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const UserOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly email: "email";
    readonly password: "password";
    readonly gender: "gender";
    readonly mobileNumber: "mobileNumber";
    readonly relationshipStatus: "relationshipStatus";
};
export type UserOrderByRelevanceFieldEnum = (typeof UserOrderByRelevanceFieldEnum)[keyof typeof UserOrderByRelevanceFieldEnum];
export declare const PasswordResetTokenOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly tokenHash: "tokenHash";
};
export type PasswordResetTokenOrderByRelevanceFieldEnum = (typeof PasswordResetTokenOrderByRelevanceFieldEnum)[keyof typeof PasswordResetTokenOrderByRelevanceFieldEnum];
export declare const NoteOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly content: "content";
    readonly voiceUrl: "voiceUrl";
    readonly tags: "tags";
    readonly userId: "userId";
};
export type NoteOrderByRelevanceFieldEnum = (typeof NoteOrderByRelevanceFieldEnum)[keyof typeof NoteOrderByRelevanceFieldEnum];
export declare const CircleOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly ownerId: "ownerId";
};
export type CircleOrderByRelevanceFieldEnum = (typeof CircleOrderByRelevanceFieldEnum)[keyof typeof CircleOrderByRelevanceFieldEnum];
export declare const CircleMemberOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly circleId: "circleId";
    readonly userId: "userId";
    readonly role: "role";
    readonly status: "status";
};
export type CircleMemberOrderByRelevanceFieldEnum = (typeof CircleMemberOrderByRelevanceFieldEnum)[keyof typeof CircleMemberOrderByRelevanceFieldEnum];
export declare const CircleSharedNoteOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly circleId: "circleId";
    readonly noteId: "noteId";
    readonly sharedByUserId: "sharedByUserId";
};
export type CircleSharedNoteOrderByRelevanceFieldEnum = (typeof CircleSharedNoteOrderByRelevanceFieldEnum)[keyof typeof CircleSharedNoteOrderByRelevanceFieldEnum];
export declare const PlaylistOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly tracks: "tracks";
    readonly userId: "userId";
};
export type PlaylistOrderByRelevanceFieldEnum = (typeof PlaylistOrderByRelevanceFieldEnum)[keyof typeof PlaylistOrderByRelevanceFieldEnum];
export declare const ReminderOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly description: "description";
    readonly userId: "userId";
};
export type ReminderOrderByRelevanceFieldEnum = (typeof ReminderOrderByRelevanceFieldEnum)[keyof typeof ReminderOrderByRelevanceFieldEnum];
export declare const RevokedTokenOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly token: "token";
};
export type RevokedTokenOrderByRelevanceFieldEnum = (typeof RevokedTokenOrderByRelevanceFieldEnum)[keyof typeof RevokedTokenOrderByRelevanceFieldEnum];
export declare const MoodOrderByRelevanceFieldEnum: {
    readonly id: "id";
    readonly mood: "mood";
    readonly userId: "userId";
};
export type MoodOrderByRelevanceFieldEnum = (typeof MoodOrderByRelevanceFieldEnum)[keyof typeof MoodOrderByRelevanceFieldEnum];
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
    queryPlanCacheMaxSize?: number;
};
export type GlobalOmitConfig = {
    user?: Prisma.UserOmit;
    passwordResetToken?: Prisma.PasswordResetTokenOmit;
    note?: Prisma.NoteOmit;
    circle?: Prisma.CircleOmit;
    circleMember?: Prisma.CircleMemberOmit;
    circleSharedNote?: Prisma.CircleSharedNoteOmit;
    playlist?: Prisma.PlaylistOmit;
    reminder?: Prisma.ReminderOmit;
    revokedToken?: Prisma.RevokedTokenOmit;
    mood?: Prisma.MoodOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
