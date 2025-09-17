// Student dashboard functionality

// Load required scripts
const scripts = ['database.js', 'auth.js'];
scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
});

let currentUser = null;
let currentQuiz = null;
let quizStartTime = null;

// Initialize student dashboard
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeStudentDashboard();
    }, 200);
});

function initializeStudentDashboard() {
    // Check authentication
    currentUser = requireAuth('student');
    if (!currentUser) return;

    // Display student name
    document.getElementById('studentName').textContent = `Welcome, ${currentUser.fullName}!`;

    // Load today's quiz
    loadTodayQuiz();
}

async function loadTodayQuiz() {
    try {
        const response = await fetch('/get-today-quiz', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.status === 401) {
            window.location.href = 'index.html';
            return;
        }
        
        if (!data.available) {
            showQuizUnavailable();
            return;
        }
        
        // Display the quiz
        currentQuiz = data;
        displayQuiz(data);
    } catch (error) {
        console.error('Error loading quiz:', error);
        showQuizUnavailable('Error loading quiz');
    }
}

function displayQuiz(quizData) {
    const questions = quizData.questions;
    
    if (!questions || questions.length < 2) {
        showQuizUnavailable('Quiz questions are not available');
        return;
    }
    
    // Show quiz section
    document.getElementById('quizAvailable').style.display = 'block';
    document.getElementById('quizCompleted').style.display = 'none';
    document.getElementById('quizUnavailable').style.display = 'none';
    
    // Populate question 1
    const q1 = questions[0];
    document.getElementById('q1Text').textContent = q1.text;
    document.getElementById('q1optA').textContent = q1.options[0];
    document.getElementById('q1optB').textContent = q1.options[1];
    document.getElementById('q1optC').textContent = q1.options[2];
    document.getElementById('q1optD').textContent = q1.options[3];
    
    // Populate question 2
    const q2 = questions[1];
    document.getElementById('q2Text').textContent = q2.text;
    document.getElementById('q2optA').textContent = q2.options[0];
    document.getElementById('q2optB').textContent = q2.options[1];
    document.getElementById('q2optC').textContent = q2.options[2];
    document.getElementById('q2optD').textContent = q2.options[3];
    
    // Start timer
    quizStartTime = new Date();
    // For now, set a default timer - you can enhance this later
    startQuizTimer('18:00');
}

function startQuizTimer(endTime) {
    const timerElement = document.getElementById('quizTimer');
    
    function updateTimer() {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
        
        if (currentTime >= endTime) {
            timerElement.textContent = 'Quiz time has expired!';
            timerElement.style.color = '#dc3545';
            document.getElementById('submitQuiz').disabled = true;
            return;
        }
        
        // Calculate remaining time
        const endDateTime = new Date();
        const [endHour, endMinute] = endTime.split(':');
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
        
        const remainingMs = endDateTime - now;
        const remainingMinutes = Math.floor(remainingMs / 60000);
        const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
        
        timerElement.textContent = `Time remaining: ${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        
        if (remainingMinutes < 5) {
            timerElement.style.color = '#dc3545';
        } else if (remainingMinutes < 10) {
            timerElement.style.color = '#ffc107';
        } else {
            timerElement.style.color = '#28a745';
        }
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

async function submitQuiz() {
    if (!currentQuiz) return;
    
    // Get selected answers
    const q1Answer = document.querySelector('input[name="q1"]:checked');
    const q2Answer = document.querySelector('input[name="q2"]:checked');
    
    if (!q1Answer || !q2Answer) {
        alert('Please answer both questions before submitting.');
        return;
    }
    
    // Prepare answers in the format expected by backend
    const answers = [
        { id: currentQuiz.questions[0].id, answer: q1Answer.value },
        { id: currentQuiz.questions[1].id, answer: q2Answer.value }
    ];
    
    try {
        const response = await fetch('/submit-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ answers })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Calculate time taken
            const endTime = new Date();
            const timeTaken = Math.round((endTime - quizStartTime) / 1000);
            
            const attempt = {
                score: result.score,
                totalQuestions: result.totalQuestions,
                percentage: result.percentage,
                timeTaken: timeTaken,
                date: new Date().toISOString().split('T')[0],
                detailedResults: result.detailedResults
            };
            
            showQuizCompleted(attempt);
        } else {
            alert(result.message || 'Failed to submit quiz');
        }
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
    }
}

function showQuizCompleted(attempt) {
    document.getElementById('quizAvailable').style.display = 'none';
    document.getElementById('quizCompleted').style.display = 'block';
    document.getElementById('quizUnavailable').style.display = 'none';
    
    const resultsDiv = document.getElementById('quizResults');
    
    let detailedResultsHTML = '';
    if (attempt.detailedResults) {
        detailedResultsHTML = `
            <div class="detailed-results">
                <h4>Question-wise Results:</h4>
                ${attempt.detailedResults.map((result, index) => `
                    <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Q${index + 1}:</strong> ${result.questionText}</p>
                        <p><strong>Your Answer:</strong> ${result.studentAnswer}</p>
                        <p><strong>Correct Answer:</strong> ${result.correctAnswer}</p>
                        <span class="result-status">${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    resultsDiv.innerHTML = `
        <div class="quiz-results">
            <h3>Your Results:</h3>
            <p><strong>Score:</strong> ${attempt.score}/${attempt.totalQuestions || 2} (${attempt.percentage}%)</p>
            <p><strong>Time Taken:</strong> ${Math.floor(attempt.timeTaken / 60)}:${(attempt.timeTaken % 60).toString().padStart(2, '0')}</p>
            <p><strong>Date:</strong> ${new Date(attempt.timestamp || attempt.date).toLocaleDateString()}</p>
            ${detailedResultsHTML}
        </div>
    `;
}

function showQuizUnavailable(message = null) {
    document.getElementById('quizAvailable').style.display = 'none';
    document.getElementById('quizCompleted').style.display = 'none';
    document.getElementById('quizUnavailable').style.display = 'block';
    
    if (message) {
        const unavailableDiv = document.getElementById('quizUnavailable');
        const messageP = unavailableDiv.querySelector('p:last-child');
        messageP.textContent = message;
    }
}
