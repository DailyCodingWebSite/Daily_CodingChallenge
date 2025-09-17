const mongoose = require('mongoose');

// Import individual models
const User = require('./database/user');
const Question = require('./database/questions');
const Quiz = require('./database/quizzes');
const Attempt = require('./database/attempts');

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:admin123@dailycodingchallenge.n5izkal.mongodb.net/DailyCodingChallenge1');
    console.log('✅ MongoDB Atlas connected successfully to DailyCodingChallenge1 database');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Helper functions to work with individual schemas
const dbHelpers = {
  // Users
  async getUsers() {
    return await User.find().sort({ _id: 1 });
  },
  
  async addUser(userData) {
    const user = new User(userData);
    return await user.save();
  },

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  },

  // Questions
  async getQuestions() {
    return await Question.find().sort({ _id: 1 });
  },
  
  async addQuestion(questionData) {
    const question = new Question(questionData);
    return await question.save();
  },

  async deleteQuestion(id) {
    return await Question.findByIdAndDelete(id);
  },

  // Quizzes
  async getQuizzes() {
    return await Quiz.find();
  },
  
  async addQuiz(quizData) {
    const quiz = new Quiz(quizData);
    return await quiz.save();
  },

  async deleteQuiz(id) {
    return await Quiz.findByIdAndDelete(id);
  },

  // Attempts
  async getAttempts() {
    return await Attempt.find();
  },
  
  async addAttempt(attemptData) {
    const attempt = new Attempt(attemptData);
    return await attempt.save();
  }
};

module.exports = { connectDB, dbHelpers };