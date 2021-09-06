import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { Thread } from 'src/core/interface/thread';
import Twitter from 'twitter';

@Injectable()
export class TwitterService {
  public client: Twitter = null;

  constructor(private readonly configService: ConfigService) {
    this.client = new Twitter({
      consumer_key: configService.get<string>('twitter.consumer_key'), // from Twitter.
      consumer_secret: configService.get<string>('twitter.consumer_secret'), // from Twitter.
      access_token_key: configService.get<string>('twitter.access_token_key'), // from your User (oauth_token)
      access_token_secret: configService.get<string>(
        'twitter.access_token_secret',
      ), // from your User (oauth_token_secret)
    });
  }

  async upload(imgName: string): Promise<string> {
    const mediaType = 'image/jpeg'; // `'video/mp4'` is also supported
    const path = join(process.cwd() + '/src/assets/imgs-saints', imgName);
    const media = readFileSync(path);
    const size = statSync(path).size;

    const media_id_string = (await this.initUpload(size, mediaType))
      .media_id_string;
    console.log(media_id_string, 'media_id_string');

    const append = await this.appendUpload(media_id_string, media);
    console.log(append, 'append');

    await this.finalizeUpload(media_id_string);
    return media_id_string;
  }

  /**
   * Step 1 of 3: Initialize a media upload
   * @return Promise resolving to String mediaId
   */
  private initUpload(mediaSize: number, mediaType: string) {
    return this.makePost('media/upload', {
      command: 'INIT',
      total_bytes: mediaSize,
      media_type: mediaType,
    });
  }

  /**
   * Step 2 of 3: Append file chunk
   * @param String mediaId    Reference to media object being uploaded
   * @return Promise resolving to String mediaId (for chaining)
   */
  private appendUpload(mediaId: string, mediaData: Buffer): Promise<any> {
    return this.makePost('media/upload', {
      command: 'APPEND',
      media_id: mediaId,
      media: mediaData,
      segment_index: 0,
    }).then(() => mediaId);
  }

  uploadImg(imgName: string): Promise<any> {
    const path = join(process.cwd() + '/src/assets/imgs-saints', imgName);
    const media = readFileSync(path);
    return this.makePost('media/upload', { media });
  }

  /**
   * Step 3 of 3: Finalize upload
   * @param String mediaId   Reference to media
   * @return Promise resolving to mediaId (for chaining)
   */
  private finalizeUpload(mediaId: string): Promise<any> {
    return this.makePost('media/upload', {
      command: 'FINALIZE',
      media_id: mediaId,
    });
  }

  /**
   * (Utility function) Send a POST request to the Twitter API
   * @param String endpoint  e.g. 'statuses/upload'
   * @param Object params    Params object to send
   * @return Promise         Rejects if response is error
   */
  makePost(endpoint, params): Promise<any> {
    return this.client.post(endpoint, params);
  }

  get(endpoint = 'webhooks', params) {
    return this.client.get(endpoint, params);
  }

  async makeThread(thread: Thread[]): Promise<void> {
    let lastTweetID = '';
    for (const tweet of thread) {
      const post = await this.makePost('statuses/update', {
        status: tweet.status,
        in_reply_to_status_id: lastTweetID,
        auto_populate_reply_metadata: true,
        media_ids: tweet.media,
      });
      lastTweetID = post.id_str;
    }
  }
}
