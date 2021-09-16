import mongoose, { Document } from 'mongoose';

export interface IUnit extends Document {
  name: string;
  user: mongoose.Schema.Types.ObjectId;
}

const unitSchema = new mongoose.Schema<IUnit>({
  name: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Unit = mongoose.model('Unit', unitSchema);

export default Unit;
