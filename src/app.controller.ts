import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SaintService } from './services/saint/saint.service';
import { QuoteService } from './services/quote/quote.service';
import { Thread } from './core/interface/thread';
import { EMPTY, firstValueFrom, iif, switchMap } from 'rxjs';
import { TwitterService } from './services/twitter/twitter.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly twitterService: TwitterService,
    private readonly saintService: SaintService,
    private readonly quoteService: QuoteService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async cronEvangileOfTheDay(): Promise<boolean> {
    const currentDate = new Date();
    const y = currentDate.getFullYear();
    const m = this.appService.zeroPad(currentDate.getMonth() + 1);
    const d = this.appService.zeroPad(currentDate.getDate());
    const date = `${y}-${m}-${d}`;
    const obs$ = this.appService
      .getMatricula()
      .pipe(
        switchMap((res) =>
          iif(() => !!res, this.appService.getEvAndMass(res, date), EMPTY),
        ),
      );

    try {
      const [{ data }, res2] = await firstValueFrom(obs$);
      if (data.comments.length > 0) {
        const firstTweet = {
          status: `Commentaire pour méditer l'Évangile `,
          media: '',
        };

        const commentary = data.comments[0].comment_text
          .replace(/[\r\n]/g, ' ')
          .replace(/\s+/g, ' ');

        const thread = this.appService.splitText(commentary);

        if (res2?.data?.messes.length > 0) {
          firstTweet.status = `${firstTweet.status} du ${res2.data.informations.ligne1}`;
          const lecture = res2.data.messes[0].lectures.find(
            (l) => l.type === 'evangile',
          );
          if (lecture) {
            firstTweet.status = `${firstTweet.status} (${lecture.ref})`;
          }
        } else {
          firstTweet.status = `${firstTweet.status} du jour`;
        }

        firstTweet.status = `${firstTweet.status} #meditationdujour #evangiledujour \n \n ⤵️⤵️⤵️`;

        thread.unshift(firstTweet);
        const lastTweet = {
          status: `Les commentaires des évangiles ont été réalisé par de nombreux prêtres. 
Pour les aider dans leurs missions faites un don sur leurs sites : https://evangeli.net/evangile/donations
+ d'informations : https://evangeli.net/evangile/quoi-evangeli`,
          media: '',
        };
        thread.push(lastTweet);
        console.log(thread);
        await this.twitterService.makeThread(thread);
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async cronSaintOfTheDay(): Promise<boolean> {
    const currentDate = new Date();
    const d = this.appService.zeroPad(currentDate.getDate());
    const m = this.appService.zeroPad(currentDate.getMonth() + 1);
    const date = `${d}/${m}`;
    try {
      const saints = await this.saintService.getSaint(date);
      const saint = saints.find((e) => e.history || e.summary);
      if (saint) {
        const firstTweet = {
          status: `Aujourd'hui le ${d}/${m} nous fêtons: ${saint.name} #saintdujour`,
          media: '',
        };
        let thread: Thread[] = [];
        if (saint.history) {
          firstTweet.status = firstTweet.status + ' \n \n ⤵️⤵️⤵️';
          if (saint.image) {
            firstTweet.media = await this.twitterService.upload(saint.image);
          }
          thread = this.appService.splitText(saint.history);
        } else if (saint.summary) {
          firstTweet.status = firstTweet.status + ' \n \n ⤵️⤵️⤵️';
          thread = this.appService.splitText(saint.summary);
        }
        thread.unshift(firstTweet);
        await this.twitterService.makeThread(thread);
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
      await this.twitterService.makeThread(thread);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
