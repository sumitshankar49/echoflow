"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineExtension = exports.MoodOrderByRelevanceFieldEnum = exports.RevokedTokenOrderByRelevanceFieldEnum = exports.ReminderOrderByRelevanceFieldEnum = exports.PlaylistOrderByRelevanceFieldEnum = exports.CircleSharedNoteOrderByRelevanceFieldEnum = exports.CircleMemberOrderByRelevanceFieldEnum = exports.CircleOrderByRelevanceFieldEnum = exports.NoteOrderByRelevanceFieldEnum = exports.PasswordResetTokenOrderByRelevanceFieldEnum = exports.UserOrderByRelevanceFieldEnum = exports.NullsOrder = exports.SortOrder = exports.MoodScalarFieldEnum = exports.RevokedTokenScalarFieldEnum = exports.ReminderScalarFieldEnum = exports.PlaylistScalarFieldEnum = exports.CircleSharedNoteScalarFieldEnum = exports.CircleMemberScalarFieldEnum = exports.CircleScalarFieldEnum = exports.NoteScalarFieldEnum = exports.PasswordResetTokenScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
const runtime = __importStar(require("@prisma/client/runtime/client"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "7.8.0",
    engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    PasswordResetToken: 'PasswordResetToken',
    Note: 'Note',
    Circle: 'Circle',
    CircleMember: 'CircleMember',
    CircleSharedNote: 'CircleSharedNote',
    Playlist: 'Playlist',
    Reminder: 'Reminder',
    RevokedToken: 'RevokedToken',
    Mood: 'Mood'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UserScalarFieldEnum = {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    gender: 'gender',
    dob: 'dob',
    mobileNumber: 'mobileNumber',
    relationshipStatus: 'relationshipStatus',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.PasswordResetTokenScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    createdAt: 'createdAt'
};
exports.NoteScalarFieldEnum = {
    id: 'id',
    title: 'title',
    content: 'content',
    voiceUrl: 'voiceUrl',
    tags: 'tags',
    isFavorite: 'isFavorite',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.CircleScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.CircleMemberScalarFieldEnum = {
    id: 'id',
    circleId: 'circleId',
    userId: 'userId',
    role: 'role',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.CircleSharedNoteScalarFieldEnum = {
    id: 'id',
    circleId: 'circleId',
    noteId: 'noteId',
    sharedByUserId: 'sharedByUserId',
    createdAt: 'createdAt'
};
exports.PlaylistScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    tracks: 'tracks',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ReminderScalarFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    remindAt: 'remindAt',
    isCompleted: 'isCompleted',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.RevokedTokenScalarFieldEnum = {
    id: 'id',
    token: 'token',
    expiresAt: 'expiresAt'
};
exports.MoodScalarFieldEnum = {
    id: 'id',
    mood: 'mood',
    userId: 'userId',
    recordedAt: 'recordedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.UserOrderByRelevanceFieldEnum = {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    gender: 'gender',
    mobileNumber: 'mobileNumber',
    relationshipStatus: 'relationshipStatus'
};
exports.PasswordResetTokenOrderByRelevanceFieldEnum = {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash'
};
exports.NoteOrderByRelevanceFieldEnum = {
    id: 'id',
    title: 'title',
    content: 'content',
    voiceUrl: 'voiceUrl',
    tags: 'tags',
    userId: 'userId'
};
exports.CircleOrderByRelevanceFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    ownerId: 'ownerId'
};
exports.CircleMemberOrderByRelevanceFieldEnum = {
    id: 'id',
    circleId: 'circleId',
    userId: 'userId',
    role: 'role',
    status: 'status'
};
exports.CircleSharedNoteOrderByRelevanceFieldEnum = {
    id: 'id',
    circleId: 'circleId',
    noteId: 'noteId',
    sharedByUserId: 'sharedByUserId'
};
exports.PlaylistOrderByRelevanceFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    tracks: 'tracks',
    userId: 'userId'
};
exports.ReminderOrderByRelevanceFieldEnum = {
    id: 'id',
    title: 'title',
    description: 'description',
    userId: 'userId'
};
exports.RevokedTokenOrderByRelevanceFieldEnum = {
    id: 'id',
    token: 'token'
};
exports.MoodOrderByRelevanceFieldEnum = {
    id: 'id',
    mood: 'mood',
    userId: 'userId'
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map