import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twitter from 'twitter-lite';

@Injectable()
export class AppService {
  public client: Twitter = null;

  constructor(private readonly configService: ConfigService) {
    this.client = new Twitter({
      version: '1.1', // version "1.1" is the default (change for other subdomains)
      extension: false, // version "1.1" is the default (change for other subdomains)
      consumer_key: configService.get<string>('twitter.consumer_key'), // from Twitter.
      consumer_secret: configService.get<string>('twitter.consumer_secret'), // from Twitter.
      access_token_key: configService.get<string>('twitter.access_token_key'), // from your User (oauth_token)
      access_token_secret: configService.get<string>(
        'twitter.access_token_secret',
      ), // from your User (oauth_token_secret)
    });
  }

  sendTweet(url: string, body: any): Promise<any> {
    return this.client.post(url, body);
  }

  async tweetThread(thread: string[]): Promise<void> {
    let lastTweetID = '';
    for (const status of thread) {
      const tweet = await this.sendTweet('statuses/update.json', {
        status: status,
        in_reply_to_status_id: lastTweetID,
        auto_populate_reply_metadata: true,
      });
      lastTweetID = tweet.id_str;
    }
  }

  zeroPad(num: number, places = 2): string {
    return String(num).padStart(places, '0');
  }

  splitText(text: string, limit = 280): string[] {
    const lines: string[] = [];

    while (text.length > limit) {
      const chunk = text.substring(0, limit);
      const lastWhiteSpace = chunk.lastIndexOf(' ');

      if (lastWhiteSpace !== -1) {
        limit = lastWhiteSpace;
      }

      lines.push(chunk.substring(0, limit));
      text = text.substring(limit + 1);
    }

    lines.push(text);

    return lines;
  }
}
