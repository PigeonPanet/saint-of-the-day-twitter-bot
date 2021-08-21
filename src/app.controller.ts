import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SaintService } from './services/saint/saint.service';
import { QuoteService } from './services/quote/quote.service';
import { Thread } from './core/interface/thread';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly saintService: SaintService,
    private readonly quoteService: QuoteService,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_6AM)
  @Cron(CronExpression.EVERY_MINUTE)
  async cronSaintOfTheDay() {
    const currentDate = new Date();
    const d = this.appService.zeroPad(currentDate.getDate());
    const m = this.appService.zeroPad(currentDate.getMonth() + 1);
    const date = `${d}/${m}`;
    try {
      const saints = await this.saintService.getSaint(date);
      const saint = saints.find((e) => e.history || e.summary);
      if (saint) {
        console.log(saint.image);
        const firstTweet = {
          status: `Aujourd'hui le ${d}/${m} nous fêtons: ${saint.name}`,
          media: '',
        };
        let thread: Thread[] = [];
        if (saint.history) {
          firstTweet.status = firstTweet.status + ' \n \n ⤵️⤵️⤵️';
          if (saint.image) {
            firstTweet.media = await this.appService.upload(saint.image);
          }
          thread = this.appService.splitText(saint.history);
        } else if (saint.summary) {
          firstTweet.status = firstTweet.status + ' \n \n ⤵️⤵️⤵️';
          thread = this.appService.splitText(saint.summary);
        }
        thread.unshift(firstTweet);
        await this.appService.makeThread(thread);
        return true;
      }
    } catch (error) {
      console.log('error', error);
      return false;
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async cronQuote(): Promise<boolean> {
    try {
      // const quote = await this.quoteService.getQuoteOfTheDay();
      // const tweet = `${quote.name}: ${quote.text}`;
      // const thread = this.appService.splitText(tweet);
      // await this.appService.makeThread(thread);
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
