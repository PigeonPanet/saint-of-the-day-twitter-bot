import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Saint, SaintDocument } from 'src/schemas/saints.schema';

@Injectable()
export class SaintService {
  constructor(
    @InjectModel(Saint.name) private saintModel: Model<SaintDocument>,
  ) {}

  async getSaint(date: string): Promise<SaintDocument[]> {
    return this.saintModel.find({ date }).exec();
  }
}
