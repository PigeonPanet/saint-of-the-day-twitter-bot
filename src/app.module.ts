import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { Saint, SaintSchema } from './schemas/saints.schema';
import { Quote, QuoteSchema } from './schemas/quotes.schema';
import { SaintService } from './services/saint/saint.service';
import { QuoteService } from './services/quote/quote.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.DATABASE_HOST),
    MongooseModule.forFeature([
      { name: Saint.name, schema: SaintSchema },
      { name: Quote.name, schema: QuoteSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, SaintService, QuoteService],
})
export class AppModule {}
