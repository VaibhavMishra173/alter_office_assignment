import { Schema,model } from 'mongoose';

const urlSchema = new Schema({
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
    unique: true,
    sparse: true
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('User', urlSchema);
