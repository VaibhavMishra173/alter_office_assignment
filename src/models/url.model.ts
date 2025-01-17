import mongoose, { Schema } from 'mongoose';
import type { Url } from '../types/index.js';

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


// Indexes for faster lookup
urlSchema.index({ shortUrl: 1 });
urlSchema.index({ alias: 1 });

export const UrlModel = mongoose.model<Url>('Url', urlSchema);
