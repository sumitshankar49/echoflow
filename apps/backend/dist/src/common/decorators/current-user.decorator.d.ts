export interface AuthenticatedUser {
    userId: string;
    email: string;
    name: string;
    tokenType: 'access' | 'refresh';
}
export declare const CurrentUser: (...dataOrPipes: (keyof AuthenticatedUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
