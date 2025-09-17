// === Faculty Dashboard Functionality ===

// Dynamically load dependencies if needed
['database.js', 'auth.js'].forEach(src => {
  const s = document.createElement('script');
  s.src = src;
  document.head.appendChild(s);
});

let currentUser = null;
let allStudents = [];
let allAttempts = [];

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeFacultyDashboard, 200);

  // Add event listener for week picker
  const weekInput = document.getElementById('weekPicker');
  weekInput.addEventListener('change', () => {
    filterData();
  });
});

async function initializeFacultyDashboard() {
  // Authenticate faculty user
  currentUser = requireAuth('faculty');
  if (!currentUser) return;

  document.getElementById('facultyName').textContent = `Welcome, Faculty!`;

  try {
    // Load students and attempts from backend
    const performanceData = await fetch('/get-student-performance', {
      credentials: 'include'
    });
    
    if (performanceData.status === 401) {
      window.location.href = 'index.html';
      return;
    }
    
    const data = await performanceData.json();
    allStudents = data.map((item, index) => ({
      id: index + 1, // Use consistent ID
      fullName: item.student,
      class: item.class,
      role: 'student'
    }));
    
    allAttempts = data.flatMap((item, index) => 
      (item.attempts || []).map(attempt => ({
        ...attempt,
        userId: index + 1 // Match student ID
      }))
    );
    
    updateDashboard();
  } catch (error) {
    console.error('Error loading faculty data:', error);
  }
}

function filterData() {
  const classFilter = document.getElementById('classFilter').value;

  // Parse the selected week to a Monday–Friday range
  const weekValue = document.getElementById('weekPicker').value; // Format: "2025-W38"
  const { start, end } = parseWeekToRange(weekValue);

  const attempts = allAttempts.filter(a => {
    const d = new Date(a.date);
    return d >= start && d <= end;
  });

  const students = classFilter ? allStudents.filter(s => s.class === classFilter) : allStudents;

  updateStatistics(students, attempts);
  updateAttendanceTable(students, attempts, { start, end });
}

// Parse ISO week string to Monday–Friday dates
function parseWeekToRange(isoWeek) {
  if (!isoWeek) {
    // Default to current week if no week selected
    const today = new Date();
    const day = today.getDay() || 7; // Make Sunday = 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return { start: monday, end: friday };
  }

  const [year, week] = isoWeek.split('-W').map(Number);

  // Find the first Thursday of the year
  const jan4 = new Date(year, 0, 4);
  const day = jan4.getDay() || 7; // Make Sunday = 7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - day + 1 + (week - 1) * 7); // Monday of ISO week

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4); // Friday of the same week
  return { start: monday, end: friday };
}

function updateDashboard(classFilter = '', selectedWeek = '') {
  const students = classFilter ? allStudents.filter(s => s.class === classFilter) : allStudents;

  const dateRange = getDateRangeFromWeek(selectedWeek);

  const attempts = allAttempts.filter(a => {
    const d = new Date(a.date);
    return d >= dateRange.start && d <= dateRange.end;
  });

  updateStatistics(students, attempts);
  updateAttendanceTable(students, attempts, dateRange);
}

function getDateRangeFromWeek(weekValue) {
  if (!weekValue) {
    const today = new Date();
    const day = today.getDay() || 7;
    const start = new Date(today);
    start.setDate(today.getDate() - day + 1); // Monday
    const end = new Date(start);
    end.setDate(start.getDate() + 4); // Friday
    return { start, end };
  }

  // weekValue is like "2025-W37"
  const [year, week] = weekValue.split('-W');
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (parseInt(week) - 1) * 7;
  const monday = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1 + daysOffset));
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { start, monday, end: friday };
}

function updateStatistics(students, attempts) {
  const today = new Date().toISOString().split('T')[0];
  const todayAttempts = attempts.filter(a => a.date === today);

  const totalStudents = students.length;
  const completedToday = todayAttempts.length;
  const missedToday = totalStudents - completedToday;

  const avg = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length)
    : 0;

  document.getElementById('totalStudents').textContent = totalStudents;
  document.getElementById('completedToday').textContent = completedToday;
  document.getElementById('missedToday').textContent = missedToday;
  document.getElementById('averageScore').textContent = `${avg}%`;
}

function updateAttendanceTable(students, attempts, dateRange) {
  const tbody = document.getElementById('performanceTableBody');
  const thead = document.querySelector('#performanceTable thead tr');
  
  // Clear existing content
  tbody.innerHTML = '';
  
  // Generate date range for the week
  const dates = generateDateRange(dateRange.start, dateRange.end);
  
  // Update table header with actual dates
  thead.innerHTML = `
    <th>Student Name</th>
    <th>Class</th>
    <th>Mon</th>
    <th>Tue</th>
    <th>Wed</th>
    <th>Thu</th>
    <th>Fri</th>
    <th>Marks</th>
  `;

  // Map: userId → attempts + total marks
  const attemptMap = new Map();
  attempts.forEach(a => {
    if (!attemptMap.has(a.userId)) {
      attemptMap.set(a.userId, { dates: new Set(), totalMarks: 0 });
    }
    const data = attemptMap.get(a.userId);
    data.dates.add(a.date);
    data.totalMarks += a.score || 0; // Use score field from your DB
  });

  students.forEach(student => {
    const tr = document.createElement('tr');
    
    // Add student name and class
    tr.innerHTML = `
      <td>${student.fullName}</td>
      <td>${student.class}</td>
    `;

    // Add attendance for each day of the week
    dates.forEach(date => {
      const td = document.createElement('td');
      const attended = attemptMap.get(student.id)?.dates.has(date);
      
      if (attended) {
        td.innerHTML = '<span class="attendance attended">✔</span>';
      } else {
        td.innerHTML = '<span class="attendance missed">✘</span>';
      }
      
      tr.appendChild(td);
    });

    // Add Marks column
    const marksCell = document.createElement('td');
    marksCell.textContent = attemptMap.get(student.id)?.totalMarks || '0';
    marksCell.className = 'marks';
    tr.appendChild(marksCell);

    tbody.appendChild(tr);
  });
}

function generateDateRange(start, end) {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

