"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleSharedNote = void 0;
const typeorm_1 = require("typeorm");
const note_entity_1 = require("../../notes/entities/note.entity");
const circle_entity_1 = require("./circle.entity");
let CircleSharedNote = class CircleSharedNote {
};
exports.CircleSharedNote = CircleSharedNote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CircleSharedNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CircleSharedNote.prototype, "circleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => circle_entity_1.Circle, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'circleId' }),
    __metadata("design:type", circle_entity_1.Circle)
], CircleSharedNote.prototype, "circle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CircleSharedNote.prototype, "noteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => note_entity_1.Note, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'noteId' }),
    __metadata("design:type", note_entity_1.Note)
], CircleSharedNote.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CircleSharedNote.prototype, "sharedByUserId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CircleSharedNote.prototype, "createdAt", void 0);
exports.CircleSharedNote = CircleSharedNote = __decorate([
    (0, typeorm_1.Entity)({ name: 'circle_shared_notes' }),
    (0, typeorm_1.Unique)('uq_circle_shared_note', ['circleId', 'noteId'])
], CircleSharedNote);
//# sourceMappingURL=circle-shared-note.entity.js.map