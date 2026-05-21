"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const normalizedError = this.normalizeException(exception, isDevelopment);
        const responseBody = {
            statusCode: normalizedError.status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: normalizedError.message,
            error: normalizedError.error,
            details: normalizedError.details,
        };
        response.status(normalizedError.status).json(responseBody);
    }
    normalizeException(exception, isDevelopment) {
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            if (typeof response === 'string') {
                return {
                    status,
                    message: response,
                    error: this.getHttpStatusLabel(status),
                };
            }
            const responseObject = response;
            return {
                status,
                message: responseObject.message ?? this.getHttpStatusLabel(status),
                error: responseObject.error ?? this.getHttpStatusLabel(status),
            };
        }
        if (exception instanceof typeorm_1.QueryFailedError) {
            const databaseError = exception;
            return this.mapDatabaseError(databaseError, isDevelopment);
        }
        if (exception instanceof Error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: isDevelopment ? exception.message : 'Internal server error',
                error: 'Internal Server Error',
            };
        }
        return {
            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            error: 'Internal Server Error',
        };
    }
    mapDatabaseError(error, isDevelopment) {
        switch (error.code) {
            case 'ER_DUP_ENTRY':
                if (this.isDuplicateEmailError(error.sqlMessage)) {
                    return {
                        status: common_1.HttpStatus.CONFLICT,
                        message: 'Email already exists. Please use another email or login.',
                        error: 'Conflict',
                    };
                }
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: 'A record with the same unique value already exists.',
                    error: 'Conflict',
                };
            case 'ER_NO_REFERENCED_ROW_2':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Related record was not found for this operation.',
                    error: 'Bad Request',
                };
            case 'ER_BAD_NULL_ERROR':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'A required field is missing.',
                    error: 'Bad Request',
                };
            case 'ER_ACCESS_DENIED_ERROR':
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database authentication failed. Check database credentials.',
                    error: 'Internal Server Error',
                };
            default:
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database operation failed.',
                    error: 'Internal Server Error',
                    details: isDevelopment ? error.sqlMessage : undefined,
                };
        }
    }
    isDuplicateEmailError(sqlMessage) {
        if (!sqlMessage) {
            return false;
        }
        const normalized = sqlMessage.toLowerCase();
        return (normalized.includes('users.email') ||
            normalized.includes("for key 'users.email'") ||
            normalized.includes('user.email'));
    }
    getHttpStatusLabel(status) {
        return ({
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            409: 'Conflict',
            422: 'Unprocessable Entity',
            500: 'Internal Server Error',
        }[status] ?? 'Error');
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map