// questions.js

const mongoose = require('mongoose');

// Define the question schema
const questionSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  text: { type: String, required: true },
  options: [String],
  answer: { type: String, required: true },
  difficulty: { type: String, default: 'medium' }
});

// Export the model
const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
