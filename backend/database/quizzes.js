// quizzes.js

const mongoose = require('mongoose');

// Define the quiz schema
const quizSchema = new mongoose.Schema({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  questionIds: [Number]
});

// Export the model
const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
