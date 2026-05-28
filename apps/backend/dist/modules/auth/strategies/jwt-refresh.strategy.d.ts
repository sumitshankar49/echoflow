import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
interface RefreshTokenPayload {
    sub: string;
    email: string;
    name: string;
    tokenType: 'refresh';
}
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor(configService: ConfigService);
    validate(req: Request, payload: RefreshTokenPayload): {
        userId: string;
        email: string;
        name: string;
        refreshToken: string;
        tokenType: "refresh";
    };
}
export {};
