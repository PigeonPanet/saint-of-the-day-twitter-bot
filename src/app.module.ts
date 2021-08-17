import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Saint, SaintSchema } from './schemas/saints.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(''),
    MongooseModule.forFeature([{ name: Saint.name, schema: SaintSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
