import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { decode } from 'html-entities';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Cron(CronExpression.EVERY_SECOND)
  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCron() {
    const date = new Date();
    const d = date.getDate();
    const m = date.getMonth() + 1;

    const saints = await this.appService.getSaint(d, m);
    const saint = saints.find((e) => e.text || e.summary);
    if (saint) {
      let firstTweet = `Aujourd'hui le ${d}/${m} nous fêtons: ${saint.name}`;
      let thread: string[] = [];
      if (saint.text) {
        const strippedString = saint.text.replace(/(<([^>]+)>)/gi, '');
        const decoded = decode(strippedString);
        firstTweet = firstTweet + ' \n \n ⤵️⤵️⤵️';
        thread = this.appService.splitText(decoded, 200);
      } else if (saint.summary) {
        firstTweet = firstTweet + ' \n \n ⤵️⤵️⤵️';
        thread = this.appService.splitText(saint.summary, 200);
      }
      thread.unshift(firstTweet);
      await this.tweetThread(thread);
      return true;
    }
    return false;
  }

  async tweetThread(thread: string[]): Promise<void> {
    let lastTweetID = '';
    for (const status of thread) {
      const tweet = await this.appService.sendTweet('statuses/update.json', {
        status: status,
        in_reply_to_status_id: lastTweetID,
        auto_populate_reply_metadata: true,
      });
      lastTweetID = tweet.id_str;
    }
  }
}
