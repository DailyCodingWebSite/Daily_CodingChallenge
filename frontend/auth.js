// Authentication and login functionality

// Load database
const script = document.createElement('script');
script.src = 'database.js';
document.head.appendChild(script);

// Wait for database to load
setTimeout(() => {
    initializeAuth();
}, 100);

function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // Clear previous error messages
        errorMessage.textContent = '';

        // Validate inputs
        if (!username || !password || !role) {
            showError('Please fill in all fields');
            return;
        }

        // Authenticate user via API
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password, role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect based on role
                switch (data.role) {
                    case 'student':
                        window.location.href = 'student.html';
                        break;
                    case 'faculty':
                        window.location.href = 'faculty.html';
                        break;
                    case 'admin':
                        window.location.href = 'admin.html';
                        break;
                    default:
                        showError('Invalid role selected');
                }
            } else {
                showError(data.message || 'Invalid credentials');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showError('Login failed. Please try again.');
        });
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

// Check if user is already logged in
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const currentPage = window.location.pathname.split('/').pop();
        
        // Redirect to appropriate page if on wrong page
        if (currentPage === 'index.html' || currentPage === '') {
            switch (user.role) {
                case 'student':
                    window.location.href = 'student.html';
                    break;
                case 'faculty':
                    window.location.href = 'faculty.html';
                    break;
                case 'admin':
                    window.location.href = 'admin.html';
                    break;
            }
        }
    }
}

// Logout function
function logout() {
    fetch('/logout', {
        method: 'GET',
        credentials: 'include'
    })
    .then(() => {
        window.location.href = 'index.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
        window.location.href = 'index.html';
    });
}

// Protect pages - redirect to login if not authenticated
function requireAuth(requiredRole = null) {
    // For now, return a placeholder - server handles auth via sessions
    return { role: requiredRole || 'user', fullName: 'User' };
}

// Get current user - placeholder for server-side sessions
function getCurrentUser() {
    return { role: 'user', fullName: 'User' };
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Only check auth on login page
    if (currentPage === 'index.html' || currentPage === '') {
        checkAuth();
    }
});
fetch('https://your-backend.onrender.com/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});
document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('https://your-backend.onrender.com/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    window.location.href = './dashboard.html';
  } else {
    alert("Login failed");
  }
});

