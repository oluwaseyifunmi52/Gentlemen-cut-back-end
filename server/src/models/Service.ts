import mongoose, { Schema, model } from 'mongoose';

const serviceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Service slug is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['haircuts', 'beard', 'packages', 'kids'],
      required: [true, 'Service category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Service duration is required'],
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

export interface IService extends Document {
  name: string;
  slug: string;
  description?: string;
  category: 'haircuts' | 'beard' | 'packages' | 'kids';
  price: number;
  durationMinutes: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default model<IService>('Service', serviceSchema);