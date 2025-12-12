const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    favorites: {
      type: [String],   // масив id монет (bitcoin, ethereum, xrp, ...)
      default: [],
    },
    settings: {
      language: { type: String, default: 'ua' },
      theme: { type: String, default: 'dark' },
      currency: { type: String, default: 'uah' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
