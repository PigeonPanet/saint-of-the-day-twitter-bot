import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, ObjectId, Types } from 'mongoose';

export type QuoteDocument = Quote & Document;

@Schema()
export class Quote {
  @Prop({ type: Types.ObjectId }) public _id: ObjectId;
  @Prop(String) public lng: string;
  @Prop({ type: String }) public name: string;
  @Prop(String) public text: string;
  @Prop(Boolean) public displayed: boolean;
  @Prop({ type: Array<string>(), default: [] }) public categories: string[];
}

const QuoteSchema = SchemaFactory.createForClass(Quote);
model(Quote.name, QuoteSchema).createIndexes({ name: 'text' });
export { QuoteSchema };
