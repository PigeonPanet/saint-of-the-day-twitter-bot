import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Verse, VerseDocument } from 'src/schemas/verses.schema';

@Injectable()
export class VerseService {
  constructor(
    @InjectModel(Verse.name) private verseModel: Model<VerseDocument>,
  ) {}

  async getVerseByCategory(category: string): Promise<VerseDocument[]> {
    return this.verseModel
      .aggregate([
        { $match: { categories: category } },
        { $sample: { size: 1 } },
        // {
        //   $lookup: {
        //     from: 'books',
        //     localField: 'name',
        //     foreignField: 'bookId',
        //     as: 'book',
        //   },
        // },
        // {
        //   $unwind: '$book',
        // },
      ])
      .exec();
  }
}
