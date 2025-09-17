const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { connectDB, dbHelpers } = require('./database');
const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve frontend
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true
}));

// MongoDB helper functions are now in database.js

// ------------------- ROUTES ------------------- //

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await dbHelpers.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.json({ success: true, role: user.role });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Middleware: Check login
function requireLogin(req, res, next) {
    if (req.session.user) next();
    else res.status(401).json({ message: 'Unauthorized' });
}

// Middleware: Role-based access
function requireRole(role) {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) next();
        else res.status(403).json({ message: 'Forbidden' });
    };
}

// Get today's quiz for student
app.get('/get-today-quiz', requireLogin, requireRole('student'), async (req, res) => {
    const today = new Date().toISOString().slice(0,10);
    const quizzes = await dbHelpers.getQuizzes();
    const questions = await dbHelpers.getQuestions();
    const quiz = quizzes.find(q => q.date === today);
    if (!quiz) return res.json({ available: false });
    
    const quizQuestions = questions.filter(q => quiz.questionIds.includes(q.id))
                                   .map(q => ({ id: q.id, text: q.text, options: q.options }));
    res.json({ available: true, questions: quizQuestions });
});

// Submit quiz answers
app.post('/submit-quiz', requireLogin, requireRole('student'), async (req, res) => {
    const { answers } = req.body; // [{id:1, answer:'4'}, ...]
    const today = new Date().toISOString().slice(0,10);
    const quizzes = await dbHelpers.getQuizzes();
    const questions = await dbHelpers.getQuestions();
    const attempts = await dbHelpers.getAttempts();

    const quiz = quizzes.find(q => q.date === today);
    if (!quiz) return res.json({ success: false, message: 'No quiz today' });

    const existingAttempt = attempts.find(a => a.userId === req.session.user.id && a.date === today);
    if (existingAttempt) return res.json({ success: false, message: 'Already attempted' });

    let score = 0;
    const detailedResults = answers.map(a => {
        const question = questions.find(q => q.id === a.id);
        const isCorrect = question && question.answer === a.answer;
        if (isCorrect) score++;
        
        return {
            questionId: a.id,
            questionText: question ? question.text : 'Unknown',
            studentAnswer: a.answer,
            correctAnswer: question ? question.answer : 'Unknown',
            isCorrect
        };
    });

    await dbHelpers.addAttempt({
        userId: req.session.user.id,
        date: today,
        answers,
        score,
        timeTaken: 0
    });

    res.json({ 
        success: true, 
        score, 
        totalQuestions: answers.length,
        percentage: Math.round((score / answers.length) * 100),
        detailedResults
    });
});

// Get student performance for faculty
app.get('/get-student-performance', requireLogin, requireRole('faculty'), async (req, res) => {
    const attempts = await dbHelpers.getAttempts();
    const users = await dbHelpers.getUsers();
    const questions = await dbHelpers.getQuestions();
    const students = users.filter(u => u.role === 'student');
    
    const result = students.map(s => {
        const studentAttempts = attempts.filter(a => a.userId === s.id).map(attempt => {
            const totalQuestions = attempt.answers ? attempt.answers.length : 0;
            const percentage = totalQuestions > 0 ? Math.round((attempt.score / totalQuestions) * 100) : 0;
            
            return {
                ...attempt,
                totalQuestions,
                percentage
            };
        });
        
        return { 
            student: s.fullName, 
            class: s.class, 
            attempts: studentAttempts 
        };
    });
    res.json(result);
});

// Admin routes: add question
app.post('/add-question', requireLogin, requireRole('admin'), async (req, res) => {
    const { text, options, answer, difficulty } = req.body;
    await dbHelpers.addQuestion({ text, options, answer, difficulty });
    res.json({ success: true });
});

// Admin route: schedule quiz
app.post('/schedule-quiz', requireLogin, requireRole('admin'), async (req, res) => {
    const { date, startTime, endTime, questionIds } = req.body;
    await dbHelpers.addQuiz({ date, startTime, endTime, questionIds });
    res.json({ success: true });
});

// Admin route: add user
app.post('/add-user', requireLogin, requireRole('admin'), async (req, res) => {
    const { username, password, role, fullName, className } = req.body;
    await dbHelpers.addUser({ username, password, role, fullName, class: className });
    res.json({ success: true });
});

// API Routes for frontend
app.get('/api/users', requireLogin, async (req, res) => {
    const users = await dbHelpers.getUsers();
    res.json(users);
});

app.get('/api/users/:id', requireLogin, async (req, res) => {
    const users = await dbHelpers.getUsers();
    const user = users.find(u => u.id === parseInt(req.params.id));
    res.json(user);
});

app.get('/api/questions', requireLogin, async (req, res) => {
    const questions = await dbHelpers.getQuestions();
    res.json(questions);
});

app.get('/api/questions/:id', requireLogin, async (req, res) => {
    const questions = await dbHelpers.getQuestions();
    const question = questions.find(q => q.id === parseInt(req.params.id));
    res.json(question);
});

app.delete('/api/questions/:id', requireLogin, requireRole('admin'), async (req, res) => {
    await dbHelpers.deleteQuestion(parseInt(req.params.id));
    res.json({ success: true });
});

app.get('/api/quizzes', requireLogin, async (req, res) => {
    const quizzes = await dbHelpers.getQuizzes();
    res.json(quizzes);
});

app.get('/api/attempts', requireLogin, async (req, res) => {
    const attempts = await dbHelpers.getAttempts();
    res.json(attempts);
});

// Delete routes
app.delete('/api/users/:id', requireLogin, requireRole('admin'), async (req, res) => {
    await dbHelpers.deleteUser(parseInt(req.params.id));
    res.json({ success: true });
});

app.delete('/api/quizzes/:id', requireLogin, requireRole('admin'), async (req, res) => {
    await dbHelpers.deleteQuiz(req.params.id);
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
fetch('https://your-backend.onrender.com/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  res.json({ success: true, user });
});
