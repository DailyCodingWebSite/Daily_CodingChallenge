const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  fullName: { type: String, required: true },
  class: { type: String, default: '' }
});

// Question Schema
const questionSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  text: { type: String, required: true },
  options: [String],
  answer: { type: String, required: true },
  difficulty: { type: String, default: 'medium' }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  questionIds: [Number]
});

// Attempt Schema
const attemptSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  date: { type: String, required: true },
  answers: [{ id: Number, answer: String }],
  score: { type: Number, required: true },
  timeTaken: { type: Number, default: 0 }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Question: mongoose.model('Question', questionSchema),
  Quiz: mongoose.model('Quiz', quizSchema),
  Attempt: mongoose.model('Attempt', attemptSchema)
};