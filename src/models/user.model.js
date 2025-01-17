import { Schema,model } from 'mongoose';

const userSchema = new Schema({
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
  name: String,
  picture: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('User', userSchema);
