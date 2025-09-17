// attempts.js

const mongoose = require('mongoose');

// Define the attempt schema
const attemptSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  date: { type: String, required: true },
  answers: [{ id: Number, answer: String }],
  score: { type: Number, required: true },
  timeTaken: { type: Number, default: 0 }
});

// Export the model
const Attempt = mongoose.model('Attempt', attemptSchema);
module.exports = Attempt;
