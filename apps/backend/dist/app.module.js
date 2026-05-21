"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const configuration_1 = __importDefault(require("./config/configuration"));
const auth_module_1 = require("./modules/auth/auth.module");
const circles_module_1 = require("./modules/circles/circles.module");
const music_module_1 = require("./modules/music/music.module");
const notes_module_1 = require("./modules/notes/notes.module");
const reminders_module_1 = require("./modules/reminders/reminders.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                expandVariables: true,
                load: [configuration_1.default],
                envFilePath: ['.env.local', '.env'],
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.getOrThrow('jwt.accessSecret'),
                    signOptions: {
                        expiresIn: configService.getOrThrow('jwt.accessExpiresIn'),
                    },
                }),
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.getOrThrow('database.host'),
                    port: configService.getOrThrow('database.port'),
                    username: configService.getOrThrow('database.username'),
                    password: configService.getOrThrow('database.password'),
                    database: configService.getOrThrow('database.name'),
                    synchronize: configService.get('database.synchronize', false),
                    logging: configService.get('database.logging', false),
                    autoLoadEntities: true,
                }),
            }),
            auth_module_1.AuthModule,
            circles_module_1.CirclesModule,
            music_module_1.MusicModule,
            notes_module_1.NotesModule,
            reminders_module_1.RemindersModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map