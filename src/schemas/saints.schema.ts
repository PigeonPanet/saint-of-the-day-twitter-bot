import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, ObjectId, Types } from 'mongoose';

export type SaintDocument = Saint & Document;

@Schema()
export class Saint {
  @Prop({ type: Types.ObjectId }) public _id: ObjectId;
  @Prop(String) public date: string;

  @Prop(String) public lng: string;
  @Prop({ type: String }) public name: string;
  @Prop(String) public summary: string;
  @Prop(String) public history: string;
  @Prop(String) public image: string;
}

const SaintSchema = SchemaFactory.createForClass(Saint);
model(Saint.name, SaintSchema).createIndexes({ name: 'text' });
export { SaintSchema };
