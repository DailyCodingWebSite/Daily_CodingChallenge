// Admin dashboard functionality

// Load required scripts
const scripts = ['database.js', 'auth.js'];
scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
});

let currentUser = null;

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeAdminDashboard();
    }, 200);
});

async function initializeAdminDashboard() {
    // Check authentication
    currentUser = requireAuth('admin');
    if (!currentUser) return;

    // Display admin name
    document.getElementById('adminName').textContent = `Welcome, Admin!`;

    // Initialize forms
    initializeForms();
    
    // Load existing data
    await loadQuestions();
    await loadScheduledQuizzes();
    await loadUsers();
    await populateQuestionDropdowns();
}

function initializeForms() {
    // Question form
    document.getElementById('questionForm').addEventListener('submit', handleQuestionSubmit);
    
    // Schedule form
    document.getElementById('scheduleForm').addEventListener('submit', handleScheduleSubmit);
    
    // User form
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    
    // User role change handler
    document.getElementById('userRole').addEventListener('change', function() {
        const classGroup = document.getElementById('classGroup');
        if (this.value === 'student') {
            classGroup.style.display = 'block';
            document.getElementById('userClass').required = true;
        } else {
            classGroup.style.display = 'none';
            document.getElementById('userClass').required = false;
        }
    });
}

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

async function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const questionData = {
        text: formData.get('questionText'),
        options: [
            formData.get('optionA'),
            formData.get('optionB'),
            formData.get('optionC'),
            formData.get('optionD')
        ],
        answer: formData.get('correctAnswer'),
        difficulty: formData.get('difficulty')
    };
    
    try {
        const response = await fetch('/add-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(questionData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            e.target.reset();
            
            // Reload questions list
            await loadQuestions();
            await populateQuestionDropdowns();
            
            alert('Question added successfully!');
        } else {
            alert('Failed to add question');
        }
    } catch (error) {
        console.error('Error adding question:', error);
        alert('Error adding question');
    }
}

async function handleScheduleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const scheduleData = {
        date: formData.get('quizDate'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        questionIds: [parseInt(formData.get('question1')), parseInt(formData.get('question2'))]
    };
    
    // Validate that different questions are selected
    if (scheduleData.questionIds[0] === scheduleData.questionIds[1]) {
        alert('Please select different questions for Question 1 and Question 2');
        return;
    }
    
    try {
        const response = await fetch('/schedule-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(scheduleData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            e.target.reset();
            
            // Reload scheduled quizzes
            await loadScheduledQuizzes();
            
            alert('Quiz scheduled successfully!');
        } else {
            alert('Failed to schedule quiz');
        }
    } catch (error) {
        console.error('Error scheduling quiz:', error);
        alert('Error scheduling quiz');
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('newUsername'),
        password: formData.get('newPassword'),
        fullName: formData.get('fullName'),
        role: formData.get('userRole'),
        className: formData.get('userClass') || ''
    };
    
    try {
        const response = await fetch('/add-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            e.target.reset();
            
            // Reload users list
            await loadUsers();
            
            alert('User added successfully!');
        } else {
            alert('Failed to add user');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Error adding user');
    }
}

async function loadQuestions() {
    try {
        const response = await fetch('/api/questions', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = 'index.html';
            return;
        }
        
        const questions = await response.json();
        const questionsList = document.getElementById('questionsList');
        
        questionsList.innerHTML = '';
        
        questions.forEach(question => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <div class="question-text">
                    <strong>Q:</strong> ${question.text}<br>
                    <small><strong>Options:</strong> ${question.options.join(' | ')}</small><br>
                    <small><strong>Correct:</strong> ${question.answer} | <strong>Difficulty:</strong> ${question.difficulty}</small>
                </div>
                <div class="actions">
                    <button class="btn-delete" onclick="deleteQuestion(${question.id})">Delete</button>
                </div>
            `;
            questionsList.appendChild(questionDiv);
        });
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

async function loadScheduledQuizzes() {
    try {
        const response = await fetch('/api/quizzes', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = 'index.html';
            return;
        }
        
        const schedules = await response.json();
        const scheduledList = document.getElementById('scheduledList');
        
        scheduledList.innerHTML = '';
        
        schedules.forEach(schedule => {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.className = 'schedule-item';
            scheduleDiv.innerHTML = `
                <div>
                    <strong>Date:</strong> ${schedule.date}<br>
                    <strong>Time:</strong> ${schedule.startTime} - ${schedule.endTime}<br>
                    <strong>Questions:</strong> ${schedule.questionIds.length} questions
                </div>
                <div class="actions">
                    <button class="btn-delete" onclick="deleteSchedule('${schedule._id}')">Delete</button>
                </div>
            `;
            scheduledList.appendChild(scheduleDiv);
        });
    } catch (error) {
        console.error('Error loading scheduled quizzes:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = 'index.html';
            return;
        }
        
        const users = await response.json();
        const usersList = document.getElementById('usersList');
        
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-item';
            userDiv.innerHTML = `
                <div>
                    <strong>${user.fullName}</strong> (${user.username})<br>
                    <small>Role: ${user.role}${user.class ? ` | Class: ${user.class}` : ''}</small>
                </div>
                <div class="actions">
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            `;
            usersList.appendChild(userDiv);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function populateQuestionDropdowns() {
    try {
        const response = await fetch('/api/questions', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            return;
        }
        
        const questions = await response.json();
        const question1Select = document.getElementById('question1');
        const question2Select = document.getElementById('question2');
        
        // Clear existing options (except first one)
        question1Select.innerHTML = '<option value="">Select Question</option>';
        question2Select.innerHTML = '<option value="">Select Question</option>';
        
        questions.forEach(question => {
            const option1 = document.createElement('option');
            option1.value = question.id;
            option1.textContent = `${question.text.substring(0, 50)}...`;
            question1Select.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = question.id;
            option2.textContent = `${question.text.substring(0, 50)}...`;
            question2Select.appendChild(option2);
        });
    } catch (error) {
        console.error('Error loading questions for dropdowns:', error);
    }
}

async function deleteQuestion(id) {
    if (confirm('Are you sure you want to delete this question?')) {
        const questionElement = event.target.closest('.question-item');
        try {
            await fetch(`/api/questions/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            // Remove from DOM immediately
            questionElement.remove();
            await populateQuestionDropdowns();
            alert('Question deleted successfully!');
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Error deleting question');
        }
    }
}

async function deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this scheduled quiz?')) {
        const scheduleElement = event.target.closest('.schedule-item');
        try {
            await fetch(`/api/quizzes/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            // Remove from DOM immediately
            scheduleElement.remove();
            alert('Scheduled quiz deleted successfully!');
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Error deleting schedule');
        }
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        const userElement = event.target.closest('.user-item');
        try {
            await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            // Remove from DOM immediately
            userElement.remove();
            alert('User deleted successfully!');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    }
}
