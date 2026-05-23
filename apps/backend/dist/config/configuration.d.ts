import "dotenv/config";
declare const _default: () => {
    app: {
        nodeEnv: string;
        name: string;
        port: number;
        apiPrefix: string;
    };
    database: {
        host: string;
        url: string;
    };
    jwt: {
        accessSecret: string | undefined;
        accessExpiresIn: string;
        refreshSecret: string | undefined;
        refreshExpiresIn: string;
    };
    mail: {
        resendApiKey: string | undefined;
        fromEmail: string | undefined;
        frontendBaseUrl: string;
        resetPasswordUrl: string;
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
