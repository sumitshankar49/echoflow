"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCircleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_circle_dto_1 = require("./create-circle.dto");
class UpdateCircleDto extends (0, swagger_1.PartialType)(create_circle_dto_1.CreateCircleDto) {
}
exports.UpdateCircleDto = UpdateCircleDto;
//# sourceMappingURL=update-circle.dto.js.map