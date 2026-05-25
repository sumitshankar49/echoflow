import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client/runtime/client").DbNullClass;
export declare const JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
export declare const AnyNull: import("@prisma/client/runtime/client").AnyNullClass;
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
