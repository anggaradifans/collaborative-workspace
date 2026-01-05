import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollaborationGateway } from './collaboration/collaboration.gateway';
import { Room } from './persistence/room.entity';
import { PersistenceService } from './persistence/persistence.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env', '../../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'user'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'collaborative_db'),
        entities: [Room],
        synchronize: true, // Only for development!
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Room]),
  ],
  controllers: [AppController],
  providers: [AppService, CollaborationGateway, PersistenceService],
})
export class AppModule { }
