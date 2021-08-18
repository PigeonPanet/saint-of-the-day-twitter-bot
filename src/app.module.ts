import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { Saint, SaintSchema } from './schemas/saints.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.DATABASE_HOST),
    MongooseModule.forFeature([{ name: Saint.name, schema: SaintSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
