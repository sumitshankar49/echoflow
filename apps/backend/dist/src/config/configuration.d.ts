declare const _default: () => {
    app: {
        nodeEnv: string;
        name: string;
        port: number;
        apiPrefix: string;
    };
    database: {
        host: string | undefined;
        port: number;
        username: string | undefined;
        password: string | undefined;
        name: string | undefined;
        synchronize: boolean;
        logging: boolean;
    };
    jwt: {
        accessSecret: string | undefined;
        accessExpiresIn: string;
        refreshSecret: string | undefined;
        refreshExpiresIn: string;
    };
    swagger: {
        enabled: boolean;
        path: string;
        title: string;
        description: string;
        version: string;
    };
};
export default _default;
