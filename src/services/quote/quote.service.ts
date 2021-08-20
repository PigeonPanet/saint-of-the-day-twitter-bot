import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote, QuoteDocument } from 'src/schemas/quotes.schema';

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<QuoteDocument>,
  ) {}

  async getQuoteOfTheDay(): Promise<QuoteDocument> {
    const quoteOfTheDay: QuoteDocument[] = await this.quoteModel
      .aggregate([{ $match: { displayed: false } }, { $sample: { size: 1 } }])
      .exec();
    if (quoteOfTheDay.length === 0) {
      await this.resetQuotesOfTheDay(); // < Make sure this function throws if collection is empty (no quotes), otherwise this will be a stackoverflow (infinite loop)
      return this.getQuoteOfTheDay();
    } else {
      await this.quoteModel.updateOne(
        { _id: quoteOfTheDay[0]._id },
        { displayed: true },
      );
    }
    return quoteOfTheDay[0];
  }

  async resetQuotesOfTheDay(): Promise<void> {
    const quotesUpdated = await this.quoteModel.updateMany(
      {},
      { displayed: false },
    );
    if (quotesUpdated.nModified === 0) {
      throw new Error('No quotes found');
    }
  }
}
