import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
interface AccessTokenPayload {
    sub: string;
    email: string;
    name: string;
    tokenType: 'access';
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: AccessTokenPayload): {
        userId: string;
        email: string;
        name: string;
        tokenType: "access";
    };
}
export {};
