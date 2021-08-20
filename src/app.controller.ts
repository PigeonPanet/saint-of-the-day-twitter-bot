import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { decode } from 'html-entities';
import { SaintService } from './services/saint/saint.service';
import { QuoteService } from './services/quote/quote.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly saintService: SaintService,
    private readonly quoteService: QuoteService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async cronSaintOfTheDay() {
    const currentDate = new Date();
    const d = this.appService.zeroPad(currentDate.getDate());
    const m = this.appService.zeroPad(currentDate.getMonth() + 1);
    const date = `${m}/${d}`;
    try {
      const saints = await this.saintService.getSaint(date);
      const saint = saints.find((e) => e.text || e.summary);
      if (saint) {
        let firstTweet = `Aujourd'hui le ${d}/${m} nous fêtons: ${saint.name}`;
        let thread: string[] = [];
        if (saint.text) {
          const strippedString = saint.text.replace(/(<([^>]+)>)/gi, '');
          const decoded = decode(strippedString);
          firstTweet = firstTweet + ' \n \n ⤵️⤵️⤵️';
          thread = this.appService.splitText(decoded);
        } else if (saint.summary) {
          firstTweet = firstTweet + ' \n \n ⤵️⤵️⤵️';
          thread = this.appService.splitText(saint.summary);
        }
        thread.unshift(firstTweet);
        await this.appService.tweetThread(thread);
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
      const quote = await this.quoteService.getQuoteOfTheDay();
      const tweet = `${quote.name}: ${quote.text}`;
      const thread = this.appService.splitText(tweet);
      await this.appService.tweetThread(thread);
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
