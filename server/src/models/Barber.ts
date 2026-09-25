import mongoose, { Schema, model, Document } from 'mongoose';

export interface IBarber extends Document {
  name: string;
  role: string;
  specialty: string;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const barberSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Barber name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Barber role is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Barber specialty is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IBarber>('Barber', barberSchema);