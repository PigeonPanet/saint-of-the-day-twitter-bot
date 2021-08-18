import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Twitter from 'twitter-lite';
import { Saint, SaintDocument } from './schemas/saints.schema';

@Injectable()
export class AppService {
  public client: Twitter = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Saint.name) private saintModel: Model<SaintDocument>,
  ) {
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

  sendTweet(url: string, body: any) {
    return this.client.post(url, body);
  }
  zeroPad(num: number, places = 2): string {
    return String(num).padStart(places, '0');
  }
  async getSaint(day: number, month: number) {
    const date = `${this.zeroPad(month)}/${this.zeroPad(day)}`;
    return this.saintModel.find({ date }).exec();
  }

  splitText(text: string, limit: number): string[] {
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
