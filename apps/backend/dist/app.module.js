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
const core_1 = require("@nestjs/core");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const configuration_1 = __importDefault(require("./config/configuration"));
const auth_module_1 = require("./modules/auth/auth.module");
const circles_module_1 = require("./modules/circles/circles.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const focus_module_1 = require("./modules/focus/focus.module");
const habits_module_1 = require("./modules/habits/habits.module");
const journal_module_1 = require("./modules/journal/journal.module");
const memories_module_1 = require("./modules/memories/memories.module");
const mood_module_1 = require("./modules/mood/mood.module");
const music_module_1 = require("./modules/music/music.module");
const notes_module_1 = require("./modules/notes/notes.module");
const reminders_module_1 = require("./modules/reminders/reminders.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const users_module_1 = require("./modules/users/users.module");
const prisma_module_1 = require("./prisma/prisma.module");
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
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
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
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            circles_module_1.CirclesModule,
            dashboard_module_1.DashboardModule,
            focus_module_1.FocusModule,
            habits_module_1.HabitsModule,
            journal_module_1.JournalModule,
            memories_module_1.MemoriesModule,
            mood_module_1.MoodModule,
            music_module_1.MusicModule,
            notes_module_1.NotesModule,
            reminders_module_1.RemindersModule,
            tasks_module_1.TasksModule,
            users_module_1.UsersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map