import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JSDOM } from 'jsdom';
import { forkJoin, map, Observable } from 'rxjs';
import { IGospelContempla } from './core/interface/gospel';
import { IMass } from './core/interface/mass';
import { Thread } from './core/interface/thread';
import { VerseService } from './services/verse/verse.service';

@Injectable()
export class AppService {
  private baseUrlEvangeli: string;
  private baseUrlAelf: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly verseService: VerseService,
  ) {
    this.baseUrlEvangeli = configService.get('EVANGELI_BASEURL');
    this.baseUrlAelf = configService.get('AELF_BASEURL');
  }

  async searchResultCommand(command: string[]): Promise<string> {
    let text = 'Aucun résultat';
    switch (command[0].toLowerCase().trim()) {
      case 'verset':
        const verse = (
          await this.verseService.getVerseByCategory(
            command[1].trim().toUpperCase(),
          )
        )[0];
        text = verse?.text
          ? `"${verse.text}"` +
            ` \n \n ${verse.bookName} ${verse.chapterNbr}:${verse.number}
              \n \n Que Dieu te bénisse 🙏`
          : text;
        return text;

      default:
        return text;
    }
  }

  getMatricula(): Observable<string> {
    return this.httpService
      .get<string>(`${this.baseUrlEvangeli}/evangile`, { responseType: 'text' })
      .pipe(
        map((res) => {
          if (res) {
            const html = new JSDOM(res.data);
            const el = html.window.document.getElementById('share_buttons');
            if (el) {
              return el.getAttribute('data-matricula') || '';
            }
          }
          return '';
        }),
      );
  }

  getEvAndMass(matricula: string, date: string) {
    return forkJoin([this.getEvangeli(matricula), this.getMass(date)]);
  }

  getEvangeli(matricula: string) {
    return this.httpService.get<IGospelContempla>(
      `${this.baseUrlEvangeli}/api/evangeli/day/${matricula}/fr/contempla`,
    );
  }

  getMass(date: string) {
    return this.httpService.get<IMass>(
      `${this.baseUrlAelf}/messes/${date}/france`,
    );
  }

  zeroPad(num: number, places = 2): string {
    return String(num).padStart(places, '0');
  }

  splitText(text: string, limit = 280): Thread[] {
    const lines: Thread[] = [];

    while (text.length > limit) {
      const chunk = text.substring(0, limit);
      const lastWhiteSpace = chunk.lastIndexOf(' ');

      if (lastWhiteSpace !== -1) {
        limit = lastWhiteSpace;
      }

      lines.push({ status: chunk.substring(0, limit), media: '' });
      text = text.substring(limit + 1);
    }

    lines.push({ status: text, media: '' });

    return lines;
  }
}
