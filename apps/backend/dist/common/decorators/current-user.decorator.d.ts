export interface AuthenticatedUser {
    userId: string;
    email: string;
    name: string;
    tokenType: 'access' | 'refresh';
}
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | keyof AuthenticatedUser | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
