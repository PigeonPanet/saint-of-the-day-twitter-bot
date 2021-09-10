import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, ObjectId, Types } from 'mongoose';

export type VerseDocument = Verse & Document;

@Schema()
export class Verse {
  @Prop({ type: Types.ObjectId }) public _id: ObjectId;
  @Prop({ type: Types.ObjectId }) public bookId: ObjectId;
  @Prop({ type: Types.ObjectId }) public chapterId: ObjectId;
  @Prop({ type: Number }) public number: number;
  @Prop({ type: Number }) public chapterNbr: number;
  @Prop(String) public bookName: string;
  @Prop(String) public text: string;
  @Prop({ type: Array<string>(), default: [] }) public categories: string[];
}

const VerseSchema = SchemaFactory.createForClass(Verse);
model(Verse.name, VerseSchema).createIndexes({ name: 'text' });
export { VerseSchema };
