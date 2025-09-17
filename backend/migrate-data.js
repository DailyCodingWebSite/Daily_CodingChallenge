const fs = require('fs');
const path = require('path');
const { connectDB } = require('./backend/database');
const { User, Question, Quiz, Attempt } = require('./models');

async function migrateData() {
  try {
    await connectDB();
    
    // Read JSON files
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'users.json')));
    const questions = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'questions.json')));
    const quizzes = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'quizzes.json')));
    const attempts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'attempts.json')));

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Quiz.deleteMany({});
    await Attempt.deleteMany({});

    // Insert data
    await User.insertMany(users);
    await Question.insertMany(questions);
    await Quiz.insertMany(quizzes);
    await Attempt.insertMany(attempts);

    console.log('Data migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateData();