import mongoose, { Schema } from 'mongoose';
import type { Url } from '../types/index';

const urlSchema = new Schema<Url>(
  {
    longUrl: {
      type: String,
      required: true
    },
    shortUrl: {
      type: String,
      required: true,
      unique: true
    },
    alias: {
      type: String,
      required: true,
      unique: true,
      sparse: true  // Ensures that null alias doesn't break uniqueness
    },
    topic: {
      type: String,
      enum: ['acquisition', 'activation', 'retention', null],
      default: null
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
  }
);

export const UrlModel = mongoose.model<Url>('Url', urlSchema);