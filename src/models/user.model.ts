import mongoose, { Schema } from 'mongoose';
import type { User } from '../types/index.js';

const userSchema = new Schema<User>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true  // Ensures that name is required
    },
    picture: {
      type: String,
      required: false  // picture is optional
    }
  },
  {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
  }
);

export const UserModel = mongoose.model<User>('User', userSchema);
