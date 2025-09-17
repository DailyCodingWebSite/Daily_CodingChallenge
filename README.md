# Daily Coding Challenge - MongoDB Integration

## Overview
This project is now fully connected to MongoDB Atlas database. All data operations (users, questions, quizzes, attempts) are stored and retrieved from the MongoDB database.

## Database Connection
- **MongoDB URI**: `mongodb+srv://admin:admin123@dailycodingchallenge.n5izkal.mongodb.net/DailyCodingChallenge1`
- **Database Name**: DailyCodingChallenge1

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Migrate Initial Data
```bash
npm run migrate
```

### 3. Start the Application
```bash
npm run dev
```

Or simply run the `start.bat` file on Windows.

## Access the Application
- Open your browser and go to: `http://localhost:3000`
- The application will serve the frontend from the backend server

## Login Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Faculty**: username: `faculty1`, password: `faculty123`
- **Student**: username: `student1`, password: `student123`

## Features Connected to MongoDB

### Admin Dashboard
- ✅ Add/View Questions (stored in MongoDB)
- ✅ Schedule Quizzes (stored in MongoDB)
- ✅ Add/View Users (stored in MongoDB)

### Student Dashboard
- ✅ Take Daily Quiz (questions from MongoDB)
- ✅ Submit Answers (attempts stored in MongoDB)
- ✅ View Results

### Faculty Dashboard
- ✅ View Student Performance (data from MongoDB)
- ✅ Filter by Class and Week
- ✅ Attendance Tracking

## File Structure
```
├── backend/
│   ├── server.js          # Main server with API routes
│   ├── database.js        # MongoDB connection and helpers
│   ├── models.js          # Mongoose schemas
│   ├── migrate-data.js    # Data migration script
│   └── data/              # Initial JSON data files
├── frontend/
│   ├── index.html         # Login page
│   ├── admin.html         # Admin dashboard
│   ├── faculty.html       # Faculty dashboard
│   ├── student.html       # Student dashboard
│   ├── auth.js           # Authentication (API-based)
│   ├── database.js       # Frontend API client
│   └── *.js              # Page-specific scripts
└── start.bat             # Windows startup script
```

## API Endpoints
- `POST /login` - User authentication
- `GET /logout` - User logout
- `GET /get-today-quiz` - Get today's quiz for students
- `POST /submit-quiz` - Submit quiz answers
- `GET /get-student-performance` - Get student performance data
- `POST /add-question` - Add new question (Admin)
- `POST /schedule-quiz` - Schedule new quiz (Admin)
- `POST /add-user` - Add new user (Admin)
- `GET /api/*` - Various API endpoints for data retrieval

## Notes
- All data is now persistent in MongoDB
- Session management is handled server-side
- Real-time updates reflect in the database
- The application is fully functional with MongoDB integration